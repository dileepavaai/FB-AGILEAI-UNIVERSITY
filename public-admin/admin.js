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
   🔥 LEAD INTELLIGENCE (PIPELINE SAFE VERSION)
   ===================================================== */

let leads = [];
let currentUserEmail = null;

/* =========================
   🧠 METRICS (NEW - SAFE)
   ========================= */
function updateLeadMetrics() {

  const counts = {
    total: 0,
    New: 0,
    Engaged: 0,
    Qualified: 0,
    Converted: 0,
    Dropped: 0
  };

  leads.forEach(l => {
    const stage = l.stage || "New";
    counts.total++;

    if (counts[stage] !== undefined) {
      counts[stage]++;
    }
  });

  // ✅ DASHBOARD MAPPING (FIXED)
  set("metricLeads", counts.total);
  set("funnelLeads", counts.total);
  set("funnelQualified", counts.Qualified);
  set("funnelConverted", counts.Converted);

  // Conversion %
  const lq = counts.total ? ((counts.Qualified / counts.total) * 100).toFixed(1) : 0;
  const qc = counts.Qualified ? ((counts.Converted / counts.Qualified) * 100).toFixed(1) : 0;
  const lc = counts.total ? ((counts.Converted / counts.total) * 100).toFixed(1) : 0;

  set("funnelLQ", lq + "%");
  set("funnelQC", qc + "%");
  set("funnelLC", lc + "%");
}

/* =====================================================
   🔷 DASHBOARD SAFE UPDATE (ADDED v4.1)
   Purpose: Ensure dashboard updates even without leads view
===================================================== */
function updateDashboardSafe() {

  const total = leads.length;

  let qualified = 0;
  let converted = 0;

  leads.forEach(l => {
    if (l.stage === "Qualified") qualified++;
    if (l.stage === "Converted") converted++;
  });

  // Core dashboard bindings
  set("metricLeads", total);
  set("funnelLeads", total);
  set("funnelQualified", qualified);
  set("funnelConverted", converted);

  const lq = total ? ((qualified / total) * 100).toFixed(1) : 0;
  const qc = qualified ? ((converted / qualified) * 100).toFixed(1) : 0;
  const lc = total ? ((converted / total) * 100).toFixed(1) : 0;

  set("funnelLQ", lq + "%");
  set("funnelQC", qc + "%");
  set("funnelLC", lc + "%");
}

/* helper */
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
   ➕ ADD LEAD (UPDATED SAFE)
   ========================= */
let isSaving = false;
window.addLead = async function () {

  if (isSaving) return;   // 🔥 prevent double submit
  isSaving = true;

  const get = id => document.getElementById(id)?.value.trim() || "";

  const name = get("leadName");

  if (!name) {
    alert("Name is required");
    document.getElementById("leadName")?.focus();
    isSaving = false;  // 🔥 IMPORTANT reset
    return;
  }

  try {
    await addDoc(collection(db, "leads"), {

      // Identity
      name,
      role: get("leadRole"),
      company: get("leadCompany"),
      location: get("leadLocation"),
      experience: get("leadExperience"),
      linkedin_url: get("leadLinkedIn"),

      // Contact
      email: get("leadEmail") || null,
      phone: get("leadPhone") || null,

      // Source
      source: get("leadSource") || "LinkedIn",
      source_detail: get("leadSourceDetail"),

      // Ownership
      owner: currentUserEmail || "system_unidentified",
      created_by: currentUserEmail || "system_unidentified",

      // Existing system
      score: 3,
      status: "Warm",
      stage: "New",
      next: "",
      notes: "",
      interactions: 1,
      created_at: serverTimestamp()
    });

    // ✅ SUCCESS → Clear + focus
    clearLeadForm();

    } catch (error) {
    alert("Lead save failed. Check console.");
    console.error("🔥 FULL ERROR:", error);
  } finally {
    isSaving = false;  // 🔥 ALWAYS reset
  }
};

/* =========================
   🧹 CLEAR FORM (GLOBAL FIX)
   ========================= */
window.clearLeadForm = function () {
  const fields = [
    "leadName",
    "leadRole",
    "leadCompany",
    "leadLocation",
    "leadEmail",
    "leadPhone",
    "leadLinkedIn",
    "leadExperience",
    "leadSourceDetail"
  ];

  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const source = document.getElementById("leadSource");
  if (source) source.value = "LinkedIn";

  // 🎯 Focus back to Name
  const nameField = document.getElementById("leadName");
  if (nameField) {
    nameField.focus();
    nameField.scrollIntoView({ behavior: "smooth", block: "center" });
  }
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
   📊 RENDER LEADS (ENHANCED CRM SAFE)
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

    // 🔥 Row color
    const rowClass =
      stage === "Converted" ? "row-converted" :
      stage === "Qualified" ? "row-qualified" :
      stage === "Engaged" ? "row-engaged" :
      stage === "Dropped" ? "row-dropped" :
      "";

    // 🔥 Score color
    const scoreClass =
      l.score >= 4 ? "score-high" :
      l.score >= 2 ? "score-mid" :
      "score-low";

    body.innerHTML += `
      <tr class="${rowClass}">
        <td>
          ${l.name || ""}
          <br>
          ${l.linkedin_url ? `<a href="${l.linkedin_url}" target="_blank">Profile</a>` : ""}
        </td>

        <td>
          <input class="inline-input" value="${l.role || ""}"
          onchange="updateLead('${l.id}', 'role', this.value)">
        </td>

        <td>
          <input class="inline-input" value="${l.company || ""}"
          onchange="updateLead('${l.id}', 'company', this.value)">
          <br>
          <small>${l.location || ""}</small>
        </td>

        <td>
          ${l.source || "LinkedIn"}
          <br>
          <small>${l.source_detail || ""}</small>
        </td>

        <td>${l.owner || l.created_by || "-"}</td>

        <td>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <input class="inline-input" style="min-width:220px;" value="${l.email || ""}"
            onchange="updateLead('${l.id}', 'email', this.value)">
            
            <input class="inline-input" style="min-width:160px;" value="${l.phone || ""}"
            onchange="updateLead('${l.id}', 'phone', this.value)">
          </div>
        </td>

        <td>
          <input class="inline-input ${scoreClass}" value="${l.score}"
          onchange="updateLead('${l.id}', 'score', this.value)">
        </td>

        <td>
          <input class="inline-input" value="${l.status || ""}"
          onchange="updateLead('${l.id}', 'status', this.value)">
        </td>

        <td>
          <input class="inline-input" value="${stage}"
          onchange="updateLead('${l.id}', 'stage', this.value)">
        </td>

        <td>
          <input class="inline-input" value="${l.next || ""}"
          onchange="updateLead('${l.id}', 'next', this.value)">
        </td>

        <td>
          <input class="inline-input" value="${l.notes || ""}"
          onchange="updateLead('${l.id}', 'notes', this.value)">
        </td>

        <td style="color:red;font-weight:bold;">
          ${blocked ? "DO NOT ENGAGE" : ""}
        </td>
      </tr>
    `;
  });
};

/* =====================================================
   DOM READY (UNCHANGED + METRICS HOOK)
   ===================================================== */
/* =========================
   🚀 FAST ENTRY (SAFE ADD)
   ========================= */
function enableFastEntry() {
  const ids = [
    "leadName","leadRole","leadCompany","leadLocation",
    "leadEmail","leadPhone","leadLinkedIn","leadSource",
    "leadExperience","leadSourceDetail"
  ];

  const fields = ids.map(id => document.getElementById(id)).filter(Boolean);
  if (!fields.length) return;

  fields[0].focus();

  fields.forEach((f, i) => {
    f.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const next = fields[i + 1];
        if (next) next.focus();
        else window.addLead();
      }
    });
  });
}

function updateBusinessIntelligence() {

  if (!leads || leads.length === 0) return;

  let sourceMap = {};
  let ownerMap = {};
  let sourceConversion = {};

  leads.forEach(l => {

    const src = l.source || "LinkedIn";
    sourceMap[src] = (sourceMap[src] || 0) + 1;

    const owner = l.created_by || "Unknown";
    ownerMap[owner] = (ownerMap[owner] || 0) + (l.stage === "Converted" ? 1 : 0);

    if (!sourceConversion[src]) {
      sourceConversion[src] = { total: 0, converted: 0 };
    }

    sourceConversion[src].total++;
    if (l.stage === "Converted") {
      sourceConversion[src].converted++;
    }

  });

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  set("biLinkedIn", sourceMap.LinkedIn || 0);
  set("biAlumni", sourceMap.Alumni || 0);
  set("biReferral", sourceMap.Referral || 0);

  let topOwner = Object.entries(ownerMap).sort((a,b)=>b[1]-a[1])[0];
  set("biTopOwner", topOwner ? topOwner[0] : "-");

  let bestSource = Object.entries(sourceConversion)
    .map(([k,v]) => [k, v.converted / v.total || 0])
    .sort((a,b)=>b[1]-a[1])[0];

  set("biBestSource", bestSource ? bestSource[0] : "-");
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(enableFastEntry, 500);

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const statusEl = document.getElementById("status");
  const adminNav = document.getElementById("adminNav");
  const adminWarning = document.getElementById("adminWarning");

  const views = document.querySelectorAll(".view");

  const batchForm = document.getElementById("batchForm");
  const batchTableBody = document.querySelector("#batchTable tbody");
  const csvBatchSelect = document.getElementById("csvBatchSelect");

  const verificationTableBody =
    document.querySelector("#verificationTable tbody");

  const markReviewedBtn = document.getElementById("markReviewedBtn");
  const approveBtn = document.getElementById("approveBtn");
  const noticeEl = document.getElementById("verificationNotice");

  let verificationUnsubscribe = null;
  let activeVerificationDocId = null;
  let activeVerificationStatus = null;
  let leadsUnsubscribe = null;

  document.querySelectorAll(".sidebar li").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".sidebar li")
        .forEach(i => i.classList.remove("active"));

      item.classList.add("active");

      views.forEach(v => v.classList.add("hidden"));
      const viewId = item.dataset.view;
      document.getElementById(viewId).classList.remove("hidden");

      if (viewId === "verifications") startVerificationListener();
      if (viewId === "leads") startLeadsListener();
    });
  });

  function startLeadsListener() {
  if (leadsUnsubscribe) {
  leadsUnsubscribe();   // 🔥 clean previous listener
  }
  const q = query(collection(db, "leads"), orderBy("created_at", "desc"));

  leadsUnsubscribe = onSnapshot(q, (snap) => {

    leads = [];

    snap.forEach(docSnap => {
      leads.push({ id: docSnap.id, ...docSnap.data() });
    });

    updateLeadMetrics();
    updateDashboardSafe(); // 🔥 NEW
    updateBusinessIntelligence();
    window.renderLeads();

  }, async (error) => {

    console.error("🔥 Firestore read error:", error);

// 🚨 DO NOT fallback on permission issues (important for security clarity)
if (error.code === "permission-denied") {
  alert("You don’t have permission to view leads.");
  return;
}

// ✅ FALLBACK → manual fetch (only for non-permission issues)
try {
  const snap = await getDocs(collection(db, "leads"));

  leads = [];

  snap.forEach(docSnap => {
    leads.push({ id: docSnap.id, ...docSnap.data() });
  });

  // 🔥 Ensure consistent sorting
  leads.sort((a, b) => {
    const t1 = a.created_at?.seconds || 0;
    const t2 = b.created_at?.seconds || 0;
    return t2 - t1;
  });

  updateLeadMetrics();
  updateDashboardSafe(); // 🔥 NEW
  updateBusinessIntelligence();
  window.renderLeads();

} catch (fallbackError) {
  console.error("🔥 Fallback read also failed:", fallbackError);
  alert("Unable to load leads. Please try again.");
}

    // client-side sort
    leads.sort((a, b) => {
      const t1 = a.created_at?.seconds || 0;
      const t2 = b.created_at?.seconds || 0;
      return t2 - t1;
    });

    updateLeadMetrics();
    updateBusinessIntelligence();
    window.renderLeads();
  });
}

  loginBtn.addEventListener("click", async () => {

  // 🔥 Force clean session (critical fix)
  await signOut(auth);

  // 🔥 Create provider fresh each time
  const provider = new GoogleAuthProvider();

  // 🔥 Force account selection
  provider.setCustomParameters({
    prompt: "select_account"
  });

  // 🔥 Login
  await signInWithPopup(auth, provider);
});

  logoutBtn.addEventListener("click", async () => {
    stopVerificationListener();
    await signOut(auth);
    location.reload();
  });

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    if (!isAdmin(user.email)) {
      alert("❌ Admin access only");
      await signOut(auth);
      return;
    }

    currentUserEmail = user.email;

    const role = ADMIN_ACCESS[user.email?.trim().toLowerCase()];

    statusEl.innerText = `Welcome ${role === "super_admin" ? "Super Admin" : "Admin"}: ${user.email}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    adminNav.style.display = "block";
    adminWarning?.classList.remove("hidden");

    views.forEach(v => v.classList.add("hidden"));
    // 🔒 v4.1 FIX: Do NOT force leads view (dashboard compatibility)
    if (document.getElementById("leads")) {
    // Only show leads if already intended
    }

    // 🔥 Ensure sidebar highlights correctly
    document.querySelectorAll(".sidebar li").forEach(i => i.classList.remove("active"));
    document.querySelector('.sidebar li[data-view="leads"]')?.classList.add("active");

    // 🔥 Start leads listener immediately
    startLeadsListener();

    await loadBatches();
    await loadBatchesForCSV();
  });

  /* === REST UNCHANGED === */

  batchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "batches"), {
      batch_name: document.getElementById("batchName").value.trim(),
      program_code: document.getElementById("programCode").value,
      status: document.getElementById("batchStatus").value,
      type: "equivalency",
      created_at: serverTimestamp(),
      created_by: auth.currentUser.email
    });

    batchForm.reset();
    await loadBatches();
    await loadBatchesForCSV();
  });

  async function loadBatches() {
    batchTableBody.innerHTML = "";
    const snap = await getDocs(
      query(collection(db, "batches"), orderBy("created_at", "desc"))
    );

    snap.forEach(docSnap => {
      const b = docSnap.data();
      batchTableBody.innerHTML += `
        <tr>
          <td>${b.batch_name}</td>
          <td>${b.program_code}</td>
          <td>${b.status}</td>
        </tr>`;
    });
  }

  async function loadBatchesForCSV() {
    csvBatchSelect.innerHTML = `<option value="">-- Select Batch --</option>`;
    const snap = await getDocs(
      query(collection(db, "batches"), orderBy("created_at", "desc"))
    );

    snap.forEach(docSnap => {
      const b = docSnap.data();
      csvBatchSelect.innerHTML +=
        `<option value="${docSnap.id}">${b.batch_name}</option>`;
    });
  }

  function startVerificationListener() {
    if (verificationUnsubscribe) return;

    const q = query(
      collection(db, "verification_requests"),
      orderBy("created_at", "desc")
    );

    verificationUnsubscribe = onSnapshot(q, (snap) => {
      verificationTableBody.innerHTML = "";

      snap.forEach(docSnap => {
        const r = docSnap.data();
        const date = r.created_at?.toDate
          ? r.created_at.toDate().toLocaleString()
          : "-";

        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";
        tr.innerHTML = `
          <td>${r.email}</td>
          <td>${r.status || "new"}</td>
          <td>${date}</td>
          <td>View</td>
        `;

        tr.onclick = () => openVerificationModal(r, docSnap.id);
        verificationTableBody.appendChild(tr);
      });
    });
  }

  function stopVerificationListener() {
    if (verificationUnsubscribe) {
      verificationUnsubscribe();
      verificationUnsubscribe = null;
    }
  }

  async function openVerificationModal(data, docId) {
    activeVerificationDocId = docId;
    activeVerificationStatus = data.status || "new";

    document.getElementById("modalEmail").textContent = data.email;
    document.getElementById("modalSource").textContent = data.source || "-";
    document.getElementById("modalStatus").textContent = activeVerificationStatus;

    const createdAt = data.created_at?.toDate
      ? data.created_at.toDate().toLocaleString()
      : "-";
    document.getElementById("modalCreatedAt").textContent = createdAt;

    approveBtn.disabled = true;
    noticeEl.classList.add("hidden");
    noticeEl.textContent = "";

    if (activeVerificationStatus === "approved") {
      noticeEl.textContent =
        "This verification request has already been approved and is locked.";
      noticeEl.classList.remove("hidden");
      document.getElementById("verificationModal").classList.remove("hidden");
      return;
    }

    if (activeVerificationStatus !== "reviewed") {
      noticeEl.textContent =
        "This request must be reviewed before approval is possible.";
      noticeEl.classList.remove("hidden");
      document.getElementById("verificationModal").classList.remove("hidden");
      return;
    }

    const credQuery = query(
      collection(db, "credentials"),
      where("email", "==", data.email),
      where("issued_status", "==", "finalized")
    );

    const snap = await getDocs(credQuery);

    if (snap.empty) {
      noticeEl.textContent =
        "No finalized credential found for this email. Approval is not permitted.";
      noticeEl.classList.remove("hidden");
    } else {
      approveBtn.disabled = false;
    }

    document.getElementById("verificationModal").classList.remove("hidden");
  }

  window.closeVerificationModal = () => {
    document.getElementById("verificationModal").classList.add("hidden");
  };

  markReviewedBtn?.addEventListener("click", async () => {
    if (!activeVerificationDocId) return;
    if (!confirm("Mark this request as REVIEWED?")) return;

    await updateDoc(
      doc(db, "verification_requests", activeVerificationDocId),
      {
        status: "reviewed",
        reviewed_at: serverTimestamp(),
        reviewed_by: auth.currentUser.email
      }
    );

    window.closeVerificationModal();
  });

  approveBtn?.addEventListener("click", async () => {
    if (!activeVerificationDocId) return;
    if (approveBtn.disabled) return;
    if (!confirm("Approve this verification request?")) return;

    await updateDoc(
      doc(db, "verification_requests", activeVerificationDocId),
      {
        status: "approved",
        approved_at: serverTimestamp(),
        approved_by: auth.currentUser.email
      }
    );

    window.closeVerificationModal();
  });

});

/* =========================================================
   🚀 SPEED LAYER (SAFE ADD-ON — NO EXISTING LOGIC TOUCHED)
   ========================================================= */

function setupLeadSpeedUX() {

  const fields = [
    "leadName",
    "leadRole",
    "leadCompany",
    "leadLocation",
    "leadEmail",
    "leadPhone",
    "leadLinkedIn",
    "leadSource",
    "leadExperience",
    "leadSourceDetail"
  ];

  const inputs = fields
    .map(id => document.getElementById(id))
    .filter(Boolean);

  // 🔥 ENTER → NEXT FIELD
  inputs.forEach((el, index) => {

  // 🔥 PREVENT DUPLICATE BINDING
  if (el.dataset.bound) return;
  el.dataset.bound = "true";

  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (index < inputs.length - 1) {
        inputs[index + 1].focus();
      } else {
        if (typeof addLead === "function") {
          addLead();
        }
      }
    }
  });

});

  // 🔥 AUTOFOCUS FIX (important)
  setTimeout(() => {
    const first = document.getElementById("leadName");
    if (first) first.focus();
  }, 300);
}

/* 🔍 SEARCH FILTER */
window.leadSearchText = "";

window.applyLeadSearch = function (value) {
  window.leadSearchText = (value || "").toLowerCase();
  renderLeads();
};

/* 🎯 CHIP FILTER */
window.quickFilter = function (type) {

  const filter = document.getElementById("leadFilter");
  const userFilter = document.getElementById("leadUserFilter");

  if (!filter || !userFilter) return;

  if (type === "high") {
    filter.value = "priority";
    userFilter.value = "all";
  }

  if (type === "converted") {
    filter.value = "all";
    userFilter.value = "all";
    window.quickStage = "Converted";
  }

  if (type === "mine") {
    filter.value = "all";
    userFilter.value = "mine";
  }

  renderLeads();
};

/* 🔥 PATCH EXISTING RENDER — CLEAN + NO DOUBLE RENDER */

const originalRenderLeads = window.renderLeads;

window.renderLeads = function () {

  if (!originalRenderLeads) return;

  const search = (window.leadSearchText || "").toLowerCase();

  const originalLeads = [...leads];

  try {
    // 🔥 Apply search BEFORE render (correct way)
    if (search) {
      leads = originalLeads.filter(l => {

        const combined = `
          ${l.name || ""}
          ${l.role || ""}
          ${l.company || ""}
          ${l.location || ""}
          ${l.email || ""}
          ${l.phone || ""}
          ${l.source || ""}
          ${l.notes || ""}
        `.toLowerCase();

        return combined.includes(search);
      });
    }

    // 🔥 Now render only filtered data
    originalRenderLeads();

  } finally {
    // 🔥 ALWAYS restore original data (critical safety)
    leads = originalLeads;
  }
};

/* 🔥 INIT WHEN LEADS VIEW OPENS */
const observer = new MutationObserver(() => {
  const leadsView = document.getElementById("leads");

  if (leadsView && !leadsView.classList.contains("hidden")) {
    setupLeadSpeedUX();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});