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
  return !!ADMIN_ACCESS[email];
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

  // Basic counts
  set("mTotal", counts.total);
  set("mEngaged", counts.Engaged);
  set("mQualified", counts.Qualified);
  set("mConverted", counts.Converted);

  // 🔥 Revenue Intelligence Calculations
  const conversionRate = counts.total > 0
    ? ((counts.Converted / counts.total) * 100).toFixed(1)
    : 0;

  const qualifiedConversionRate = counts.Qualified > 0
    ? ((counts.Converted / counts.Qualified) * 100).toFixed(1)
    : 0;

  const dropRate = counts.total > 0
    ? ((counts.Dropped / counts.total) * 100).toFixed(1)
    : 0;

  set("mConvRate", conversionRate + "%");
  set("mQualConvRate", qualifiedConversionRate + "%");
  set("mDropRate", dropRate + "%");
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
   ➕ ADD LEAD
   ========================= */
window.addLead = async function () {
  const get = id => document.getElementById(id)?.value || "";

  const name = get("leadName");
  if (!name) return;

  await addDoc(collection(db, "leads"), {

    // Identity
    name,
    role: get("leadRole"),
    company: get("leadCompany"),
    location: get("leadLocation"),
    experience: get("leadExperience"),
    linkedin_url: get("leadLinkedIn"),

    // Contact
    email: get("leadEmail"),
    phone: get("leadPhone"),

    // Source
    source: get("leadSource"),
    source_detail: get("leadSourceDetail"),

    // Ownership
    owner: auth.currentUser.email,
    created_by: auth.currentUser.email,

    // Existing system
    score: 3,
    status: "Warm",
    stage: "New",
    next: "",
    notes: "",
    interactions: 1,
    created_at: serverTimestamp()
  });
};

/* =========================
   ✏️ UPDATE LEAD
   ========================= */
window.updateLead = async function (id, field, value) {
  const ref = doc(db, "leads", id);

  await updateDoc(ref, {
    [field]: field === "score" ? parseInt(value) : value,
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
          ${l.source || ""}
          <br>
          <small>${l.source_detail || ""}</small>
        </td>

        <td>${l.owner || l.created_by || "-"}</td>

        <td>
          <input class="inline-input" value="${l.email || ""}"
          onchange="updateLead('${l.id}', 'email', this.value)">
          <br>
          <input class="inline-input" value="${l.phone || ""}"
          onchange="updateLead('${l.id}', 'phone', this.value)">
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
    if (leadsUnsubscribe) return;

    const q = query(collection(db, "leads"), orderBy("created_at", "desc"));

    leadsUnsubscribe = onSnapshot(q, (snap) => {
      leads = [];
      snap.forEach(docSnap => {
        leads.push({ id: docSnap.id, ...docSnap.data() });
      });

      updateLeadMetrics(); // ✅ NEW
      window.renderLeads();
    });
  }

  loginBtn.addEventListener("click", () =>
    signInWithPopup(auth, provider)
  );

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

    const role = ADMIN_ACCESS[user.email];

    statusEl.innerText = `Welcome ${role === "super_admin" ? "Super Admin" : "Admin"}: ${user.email}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    adminNav.style.display = "block";
    adminWarning?.classList.remove("hidden");

    views.forEach(v => v.classList.add("hidden"));
    document.getElementById("dashboard").classList.remove("hidden");

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
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        } else {
          // LAST FIELD → AUTO ADD
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

/* 🔥 PATCH EXISTING RENDER */
const originalRenderLeads = window.renderLeads;

window.renderLeads = function () {

  if (!originalRenderLeads) return;

  originalRenderLeads();

  const search = window.leadSearchText || "";

  if (!search) return;

  const rows = document.querySelectorAll("#leadBody tr");

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(search) ? "" : "none";
  });
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