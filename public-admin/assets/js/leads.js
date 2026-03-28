/* =====================================================
   🔷 LEAD INTELLIGENCE MODULE (ISOLATED)
   Depends ONLY on: core.js (db, auth, login)
   ===================================================== */

import { db, auth, login } from "./core.js";
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
let currentUserEmail = null;
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

function evaluateLead(l) {
  if (l.score === 0) return true;
  if (l.interactions >= 3 && l.score <= 1) return true;
  if (l.notes?.toLowerCase().includes("no")) return true;
  return false;
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

  const dropRate = counts.total
    ? ((counts.Dropped / counts.total) * 100).toFixed(1)
    : 0;

  set("mConvRate", conversionRate + "%");
  set("mQualConvRate", qualifiedConversionRate + "%");
  set("mDropRate", dropRate + "%");
}

/* =====================================================
   🔷 ADD LEAD
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

      owner: currentUserEmail || "system",
      created_by: currentUserEmail || "system",

      score: 3,
      status: "Warm",
      stage: "New",
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
    "leadExperience","leadSourceDetail"
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
   🔷 RENDER
   ===================================================== */
window.renderLeads = function () {
  const body = document.getElementById("leadBody");
  if (!body) return;

  const filter = document.getElementById("leadFilter")?.value || "all";
  const userFilter = document.getElementById("leadUserFilter")?.value || "all";
  const search = (window.leadSearchText || "").toLowerCase();

  body.innerHTML = "";

  leads
    .filter(l => {
      if (userFilter === "mine" && l.created_by !== currentUserEmail) return false;
      if (filter === "priority" && l.score < 4) return false;
      if (filter === "blocked" && !evaluateLead(l)) return false;

      if (search) {
        const combined = `${l.name} ${l.role} ${l.company} ${l.email}`.toLowerCase();
        return combined.includes(search);
      }

      return true;
    })
    .forEach(l => {
      const stage = getSafeStage(l);
      const blocked = evaluateLead(l);

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
          <td>${l.next || ""}</td>
          <td>${l.notes || ""}</td>
          <td>${blocked ? "⚠️" : ""}</td>
        </tr>
      `;
    });
};

/* =====================================================
   🔷 SEARCH + FILTER
   ===================================================== */
window.leadSearchText = "";

window.applyLeadSearch = function (value) {
  window.leadSearchText = value;
  renderLeads();
};

window.quickFilter = function (type) {
  const filter = document.getElementById("leadFilter");
  const userFilter = document.getElementById("leadUserFilter");

  if (!filter || !userFilter) return;

  if (type === "high") {
    filter.value = "priority";
    userFilter.value = "all";
  }

  if (type === "mine") {
    userFilter.value = "mine";
  }

  renderLeads();
};

/* =====================================================
   🔷 FIRESTORE LISTENER
   ===================================================== */
function startListener() {
  if (unsubscribe) unsubscribe();

  console.log("🔥 Starting Firestore listener...");

  const q = query(collection(db, "leads"), orderBy("created_at", "desc"));

  unsubscribe = onSnapshot(q, (snap) => {
    console.log("🔥 Snapshot received:", snap.size);

    leads = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    updateLeadMetrics();
    renderLeads();
  }, (err) => {
    console.error("🔥 Firestore error:", err);
  });
}

/* =====================================================
   🔷 INIT (FIXED AUTH FLOW)
   ===================================================== */
auth.onAuthStateChanged(async (user) => {

  console.log("🔐 Auth state:", user);

  if (!user) {
    console.log("🚀 No user → triggering login...");
    await login();
    return;
  }

  console.log("✅ Logged in as:", user.email);

  currentUserEmail = user.email;

  startListener();
});