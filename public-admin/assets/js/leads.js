/* =====================================================
   🔷 LEAD INTELLIGENCE MODULE (ENHANCED – SAFE)
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
const get = (id) => document.getElementById(id)?.value.trim() || "";

const set = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
};

function getSafeStage(l) {
  return l.stage || "New";
}

/* =====================================================
   🔷 NEXT ACTION ENGINE (🔥 NEW)
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
   🔷 METRICS
===================================================== */
function updateLeadMetrics() {
  const counts = {
    total: 0,
    Engaged: 0,
    Qualified: 0,
    Converted: 0,
    Dropped: 0
  };

  leads.forEach(l => {
    const stage = l.stage || "New";
    counts.total++;
    if (counts[stage] !== undefined) counts[stage]++;
  });

  set("mTotal", counts.total);
  set("mEngaged", counts.Engaged);
  set("mQualified", counts.Qualified);
  set("mConverted", counts.Converted);

  const conversionRate = counts.total
    ? ((counts.Converted / counts.total) * 100).toFixed(1)
    : 0;

  const qualifiedConversionRate = counts.Qualified
    ? ((counts.Converted / counts.Qualified) * 100).toFixed(1)
    : 0;

  set("mConvRate", conversionRate + "%");
  set("mQualConvRate", qualifiedConversionRate + "%");
}

/* =====================================================
   🔷 ADD LEAD (🔥 UPDATED)
===================================================== */
window.addLead = async function () {
  if (isSaving) return;
  isSaving = true;

  const name = get("leadName");

  if (!name) {
    alert("Name is required");
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
      linkedin_url: get("leadLinkedIn"),

      email: get("leadEmail") || null,
      phone: get("leadPhone") || null,

      source: get("leadSource") || "LinkedIn",
      source_detail: get("leadSourceDetail"),

      owner: auth.currentUser?.email || "system",
      created_by: auth.currentUser?.email || "system",

      score: 3,
      status: "Warm",

      // 🔥 NEW LOGIC
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
   🔷 CLEAR FORM (UPDATED)
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

  const source = document.getElementById("leadSource");
  if (source) source.value = "LinkedIn";

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
   🔷 RENDER (🔥 UPDATED WITH NEXT ACTION)
===================================================== */
window.renderLeads = function () {
  const body = document.getElementById("leadBody");
  if (!body) return;

  body.innerHTML = "";

  leads.forEach(l => {

    const stage = getSafeStage(l);
    const action = getNextAction(l);

    body.innerHTML += `
      <tr>
        <td>${l.name || ""}</td>
        <td><input value="${l.role || ""}" onchange="updateLead('${l.id}','role',this.value)"></td>
        <td>${l.company || ""}</td>
        <td>${l.source || ""}</td>
        <td>${l.owner || ""}</td>
        <td>${l.email || ""}</td>
        <td>${l.score}</td>
        <td>${l.status || ""}</td>
        <td>${stage}</td>

        <!-- 🔥 NEXT ACTION -->
        <td>
          <span class="next-action ${action.type}">
            ${action.label}
          </span>
        </td>

        <td>${l.notes || ""}</td>
        <td></td>
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