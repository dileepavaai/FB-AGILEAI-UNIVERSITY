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
  "operations@agileai.university": "admin"
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
   🔥 LEAD INTELLIGENCE (FIRESTORE VERSION)
   ===================================================== */

let leads = [];

function evaluateLead(l) {
  if (l.score == 0) return true;
  if (l.interactions >= 3 && l.score <= 1) return true;
  if (l.notes && l.notes.toLowerCase().includes("no")) return true;
  return false;
}

window.addLead = async function () {
  const name = document.getElementById("leadName")?.value;
  const role = document.getElementById("leadRole")?.value;

  if (!name) return;

  await addDoc(collection(db, "leads"), {
    name,
    role,
    score: 3,
    status: "Warm",
    next: "",
    notes: "",
    interactions: 1,
    created_by: auth.currentUser.email,
    created_at: serverTimestamp()
  });
};

window.updateLead = async function (id, field, value) {
  const ref = doc(db, "leads", id);

  await updateDoc(ref, {
    [field]: field === "score" ? parseInt(value) : value,
    interactions: (leads.find(l => l.id === id)?.interactions || 0) + 1
  });
};

window.renderLeads = function () {
  const body = document.getElementById("leadBody");
  if (!body) return;

  const filter = document.getElementById("leadFilter")?.value || "all";
  body.innerHTML = "";

  leads.forEach((l) => {

    const blocked = evaluateLead(l);

    if (filter === "priority" && l.score < 4) return;
    if (filter === "blocked" && !blocked) return;

    const bg = blocked ? "#ffcccc"
      : l.score >= 4 ? "#e6ffe6"
      : l.score == 3 ? "#fff9e6"
      : "#ffe6e6";

    body.innerHTML += `
      <tr style="background:${bg}">
        <td>${l.name}</td>
        <td>${l.role}</td>

        <td>
          <select onchange="updateLead('${l.id}', 'score', this.value)">
            ${[5,4,3,2,1,0].map(s =>
              `<option ${l.score==s?"selected":""}>${s}</option>`
            ).join("")}
          </select>
        </td>

        <td>
          <select onchange="updateLead('${l.id}', 'status', this.value)">
            ${["Active","Warm","Neutral","Guarded","Closed"].map(s =>
              `<option ${l.status===s?"selected":""}>${s}</option>`
            ).join("")}
          </select>
        </td>

        <td><input value="${l.next || ""}" onchange="updateLead('${l.id}', 'next', this.value)"></td>
        <td><input value="${l.notes || ""}" onchange="updateLead('${l.id}', 'notes', this.value)"></td>

        <td style="color:red;font-weight:bold;">
          ${blocked ? "DO NOT ENGAGE" : ""}
        </td>
      </tr>
    `;
  });
};

/* =====================================================
   DOM READY
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {

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

  /* NAVIGATION */
  document.querySelectorAll(".sidebar li").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".sidebar li")
        .forEach(i => i.classList.remove("active"));

      item.classList.add("active");

      views.forEach(v => v.classList.add("hidden"));
      const viewId = item.dataset.view;
      document.getElementById(viewId).classList.remove("hidden");

      if (viewId === "verifications") startVerificationListener();

      if (viewId === "leads") {
        startLeadsListener();
      }
    });
  });

  /* 🔥 LEADS REALTIME */
  function startLeadsListener() {
    if (leadsUnsubscribe) return;

    const q = query(collection(db, "leads"), orderBy("created_at", "desc"));

    leadsUnsubscribe = onSnapshot(q, (snap) => {
      leads = [];
      snap.forEach(docSnap => {
        leads.push({ id: docSnap.id, ...docSnap.data() });
      });
      window.renderLeads();
    });
  }

  /* AUTH */
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

  /* === REST UNCHANGED (Batch + Verification) === */

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