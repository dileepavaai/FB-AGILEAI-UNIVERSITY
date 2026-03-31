/* =====================================================
   🔷 LEAD INTELLIGENCE MODULE (STABLE + ENHANCED)
   ===================================================== */

import { db, auth } from "./core.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================================================
   🔷 STATE
===================================================== */
let leads = [];
let unsubscribe = null;
let isSaving = false;

/* =====================================================
   🔷 HELPERS
===================================================== */
const get = (id) => document.getElementById(id)?.value?.trim() || "";

const safe = (v) => v ?? "";

const set = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
};

function getSafeStage(l) {
  return l.stage || "new";
}

/* =====================================================
   🔷 NEXT ACTION ENGINE (UNCHANGED CORE)
===================================================== */
function daysSince(dateString) {
  if (!dateString) return 999;
  const now = new Date();
  const past = new Date(dateString);
  return Math.floor((now - past) / (1000 * 60 * 60 * 24));
}

function getNextAction(lead) {
  const days = daysSince(lead.last_contact_date);

  if (lead.stage === "contacted" && days >= 2) {
    return { label: "Follow up", type: "urgent" };
  }

  if (lead.last_response_type === "asked_info") {
    return { label: "Send details", type: "normal" };
  }

  if (lead.last_response_type === "interested" && days >= 3) {
    return { label: "Nudge", type: "urgent" };
  }

  if (lead.last_response_type === "not_now") {
    return { label: "Nurture", type: "normal" };
  }

  if (lead.stage === "new") {
    return { label: "Contact", type: "urgent" };
  }

  return { label: "-", type: "none" };
}

/* =====================================================
   🔷 METRICS (STABLE)
===================================================== */
function updateLeadMetrics() {

  const counts = {
    total: 0,
    engaged: 0,
    qualified: 0,
    converted: 0
  };

  leads.forEach(l => {
    const stage = (l.stage || "").toLowerCase();

    counts.total++;

    if (stage === "engaged") counts.engaged++;
    if (stage === "qualified") counts.qualified++;
    if (stage === "converted") counts.converted++;
  });

  set("mTotal", counts.total);
  set("mEngaged", counts.engaged);
  set("mQualified", counts.qualified);
  set("mConverted", counts.converted);

  const convRate = counts.total
    ? ((counts.converted / counts.total) * 100).toFixed(1)
    : 0;

  const qualConvRate = counts.qualified
    ? ((counts.converted / counts.qualified) * 100).toFixed(1)
    : 0;

  set("mConvRate", convRate + "%");
  set("mQualConvRate", qualConvRate + "%");
}

/* =====================================================
   🔷 ADD LEAD (SAFE + STRICT)
===================================================== */
window.addLead = async function () {

  if (isSaving) return;
  isSaving = true;

  const name = get("leadName");
  const linkedin = get("leadLinkedIn");

  if (!name || !linkedin) {
    alert("Name and LinkedIn are required");
    document.getElementById("leadName")?.focus();
    isSaving = false;
    return;
  }

  try {

    const lastContactDate = get("leadLastContactDate") || null;

    await addDoc(collection(db, "leads"), {
      name,
      role: get("leadRole"),
      company: get("leadCompany"),
      location: get("leadLocation"),
      experience: get("leadExperience"),
      linkedin_url: linkedin,

      email: get("leadEmail") || null,
      phone: get("leadPhone") || null,

      source: get("leadSource") || "LinkedIn",
      source_detail: get("leadSourceDetail"),

      owner: auth.currentUser?.email || "system",
      created_by: auth.currentUser?.email || "system",

      score: 3,
      status: "Warm",

      stage: lastContactDate ? "contacted" : "new",
      last_contact_date: lastContactDate,
      last_response_type: null,

      next: "",
      notes: "",
      interactions: 1,

      created_at: serverTimestamp()
    });

    clearLeadForm();

  } catch (e) {
    console.error("🔥 Lead save error:", e);
    alert("Failed to save lead");
  } finally {
    isSaving = false;
  }
};

/* =====================================================
   🔷 CLEAR FORM
===================================================== */
window.clearLeadForm = function () {
  [
    "leadName","leadRole","leadCompany","leadLocation",
    "leadEmail","leadPhone","leadLinkedIn",
    "leadExperience","leadSourceDetail",
    "leadLastContactDate"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document.getElementById("leadName")?.focus();
};

/* =====================================================
   🔷 UPDATE LEAD
===================================================== */
window.updateLead = async function (id, field, value) {
  const ref = doc(db, "leads", id);

  await updateDoc(ref, {
    [field]: field === "score" ? (parseInt(value) || 0) : value,
    interactions: (leads.find(l => l.id === id)?.interactions || 0) + 1
  });
};

/* =====================================================
   🔷 RENDER (SAFE)
===================================================== */
window.renderLeads = function () {

  const body = document.getElementById("leadBody");
  if (!body) return;

  body.innerHTML = "";

  if (!leads.length) {
    body.innerHTML = `<tr><td colspan="12">No leads yet</td></tr>`;
    return;
  }

  leads.forEach(l => {

    const stage = getSafeStage(l);
    const action = getNextAction(l);

    body.innerHTML += `
      <tr>
        <td>${safe(l.name)}</td>
        <td><input value="${safe(l.role)}" onchange="updateLead('${l.id}','role',this.value)"></td>
        <td>${safe(l.company)}</td>
        <td>${safe(l.source)}</td>
        <td>${safe(l.owner)}</td>
        <td>${safe(l.email)}</td>
        <td>${safe(l.score)}</td>
        <td>${safe(l.status)}</td>
        <td>${stage}</td>
        <td><span class="next-action ${action.type}">${action.label}</span></td>
        <td>${safe(l.notes)}</td>
        <td>${safe(l.flag)}</td>
      </tr>
    `;
  });
};

/* =====================================================
   🔷 FIRESTORE LISTENER
===================================================== */
function startListener() {

  if (unsubscribe) unsubscribe();

  const q = query(collection(db, "leads"), orderBy("created_at", "desc"));

  unsubscribe = onSnapshot(q, (snap) => {
    leads = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    updateLeadMetrics();
    renderLeads();
  });
}

/* =====================================================
   🔷 INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  startListener();
});