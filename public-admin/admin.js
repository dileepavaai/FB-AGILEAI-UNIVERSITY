/* =====================================================
   FIREBASE IMPORTS (UNCHANGED)
   ===================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================================================
   🔐 ADMIN ACCESS CONTROL
   ===================================================== */
const ADMIN_ACCESS = {
  "dileep@agileai.university": "super_admin",
  "laau.aaiu@gmail.com": "admin"
};

function isAdmin(email) {
  return !!ADMIN_ACCESS[email?.trim().toLowerCase()];
}

/* =====================================================
   FIREBASE CONFIG
   ===================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyCti7ubJjnU8LJTghNaXhaSZzqCpozkeXg",
  authDomain: "fb-agileai-university.firebaseapp.com",
  projectId: "fb-agileai-university",
  storageBucket: "fb-agileai-university.appspot.com",
  messagingSenderId: "458881040066",
  appId: "1:458881040066:web:c832c420f9b4282e76c55b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

/* =====================================================
   🔥 LEAD INTELLIGENCE
   ===================================================== */

let leads = [];
let currentUserEmail = null;
let leadsUnsubscribe = null;

/* =========================
   🧠 METRICS
   ========================= */
function updateLeadMetrics() {
  const counts = { total: 0, New: 0, Engaged: 0, Qualified: 0, Converted: 0, Dropped: 0 };

  leads.forEach(l => {
    const stage = l.stage || "New";
    counts.total++;
    if (counts[stage] !== undefined) counts[stage]++;
  });

  set("mTotal", counts.total);
  set("mEngaged", counts.Engaged);
  set("mQualified", counts.Qualified);
  set("mConverted", counts.Converted);

  const conversionRate = counts.total ? ((counts.Converted / counts.total) * 100).toFixed(1) : 0;
  const qualifiedConversionRate = counts.Qualified ? ((counts.Converted / counts.Qualified) * 100).toFixed(1) : 0;
  const dropRate = counts.total ? ((counts.Dropped / counts.total) * 100).toFixed(1) : 0;

  set("mConvRate", conversionRate + "%");
  set("mQualConvRate", qualifiedConversionRate + "%");
  set("mDropRate", dropRate + "%");
}

function set(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function evaluateLead(l) {
  if (l.score == 0) return true;
  if (l.interactions >= 3 && l.score <= 1) return true;
  if (l.notes && l.notes.toLowerCase().includes("no")) return true;
  return false;
}

function getSafeStage(l) {
  return l.stage || "New";
}

/* =========================
   ➕ ADD LEAD
   ========================= */
let isSaving = false;

window.addLead = async function () {

  if (isSaving) return;
  isSaving = true;

  const get = id => document.getElementById(id)?.value.trim() || "";
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
      owner: currentUserEmail || "system_unidentified",
      created_by: currentUserEmail || "system_unidentified",
      score: 3,
      status: "Warm",
      stage: "New",
      next: "",
      notes: "",
      interactions: 1,
      created_at: serverTimestamp()
    });

    clearLeadForm();

  } catch (error) {
    alert("Lead save failed. Check console.");
    console.error(error);
  } finally {
    isSaving = false;
  }
};

/* =========================
   🧹 CLEAR FORM
   ========================= */
window.clearLeadForm = function () {
  [
    "leadName","leadRole","leadCompany","leadLocation",
    "leadEmail","leadPhone","leadLinkedIn",
    "leadExperience","leadSourceDetail"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document.getElementById("leadSource").value = "LinkedIn";
  document.getElementById("leadName")?.focus();
};

/* =========================
   ✏️ UPDATE LEAD
   ========================= */
window.updateLead = async function (id, field, value) {
  const ref = doc(db, "leads", id);
  await updateDoc(ref, {
    [field]: field === "score" ? (parseInt(value) || 0) : value,
    interactions: (leads.find(l => l.id === id)?.interactions || 0) + 1
  });
};

/* =========================
   📊 RENDER LEADS
   ========================= */
window.renderLeads = function () {
  const body = document.getElementById("leadBody");
  if (!body) return;

  const filter = document.getElementById("leadFilter")?.value || "all";
  const userFilter = document.getElementById("leadUserFilter")?.value || "all";

  body.innerHTML = "";

  leads.forEach((l) => {

    const blocked = evaluateLead(l);

    if (filter === "priority" && l.score < 4) return;
    if (filter === "blocked" && !blocked) return;
    if (userFilter === "mine" && l.created_by !== currentUserEmail) return;

    const stage = getSafeStage(l);

    const rowClass =
      stage === "Converted" ? "row-converted" :
      stage === "Qualified" ? "row-qualified" :
      stage === "Engaged" ? "row-engaged" :
      stage === "Dropped" ? "row-dropped" : "";

    const scoreClass =
      l.score >= 4 ? "score-high" :
      l.score >= 2 ? "score-mid" :
      "score-low";

    body.innerHTML += `
      <tr class="${rowClass}">
        <td>${l.name || ""}</td>
        <td><input class="inline-input" value="${l.role || ""}" onchange="updateLead('${l.id}','role',this.value)"></td>
        <td><input class="inline-input" value="${l.company || ""}" onchange="updateLead('${l.id}','company',this.value)"></td>
        <td>${l.source || "LinkedIn"}</td>
        <td>${l.owner || "-"}</td>
        <td>
          <input class="inline-input" value="${l.email || ""}" onchange="updateLead('${l.id}','email',this.value)">
          <input class="inline-input" value="${l.phone || ""}" onchange="updateLead('${l.id}','phone',this.value)">
        </td>
        <td><input class="inline-input ${scoreClass}" value="${l.score}" onchange="updateLead('${l.id}','score',this.value)"></td>
        <td>${blocked ? "DO NOT ENGAGE" : ""}</td>
      </tr>
    `;
  });
};

/* =====================================================
   🔥 FIXED LISTENER (ONLY CHANGE APPLIED)
   ===================================================== */

function startLeadsListener() {

  if (leadsUnsubscribe) {
    leadsUnsubscribe();
  }

  const q = query(collection(db, "leads"), orderBy("created_at", "desc"));

  leadsUnsubscribe = onSnapshot(

    q,

    (snap) => {
      leads = [];
      snap.forEach(d => leads.push({ id: d.id, ...d.data() }));

      updateLeadMetrics();
      updateBusinessIntelligence();
      window.renderLeads();
    },

    async (error) => {

      console.error("🔥 Firestore read error:", error);

      if (error.code === "permission-denied") {
        alert("You don’t have permission to view leads.");
        return;
      }

      try {
        const snap = await getDocs(collection(db, "leads"));

        leads = [];
        snap.forEach(d => leads.push({ id: d.id, ...d.data() }));

        leads.sort((a, b) =>
          (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0)
        );

        updateLeadMetrics();
        updateBusinessIntelligence();
        window.renderLeads();

      } catch (e) {
        console.error("Fallback failed", e);
        alert("Unable to load leads.");
      }
    }
  );
}