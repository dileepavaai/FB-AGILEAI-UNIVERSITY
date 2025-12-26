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
   ADMIN CONFIG (LOCKED)
   ===================================================== */
const ADMIN_EMAILS = ["dileep@agileai.university"];

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
   DOM READY
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- UI References ---------- */
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

  /* =====================================================
     NAVIGATION
     ===================================================== */
  document.querySelectorAll(".sidebar li").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".sidebar li")
        .forEach(i => i.classList.remove("active"));

      item.classList.add("active");

      views.forEach(v => v.classList.add("hidden"));
      const viewId = item.dataset.view;
      document.getElementById(viewId).classList.remove("hidden");

      if (viewId === "verifications") {
        startVerificationListener();
      }
    });
  });

  /* =====================================================
     AUTH
     ===================================================== */
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

    if (!ADMIN_EMAILS.includes(user.email)) {
      alert("❌ Admin access only");
      await signOut(auth);
      return;
    }

    statusEl.innerText = `Welcome Admin: ${user.email}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    adminNav.style.display = "block";
    adminWarning?.classList.remove("hidden");

    views.forEach(v => v.classList.add("hidden"));
    document.getElementById("dashboard").classList.remove("hidden");

    await loadBatches();
    await loadBatchesForCSV();
  });

  /* =====================================================
     BATCH MANAGEMENT
     ===================================================== */
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

  /* =====================================================
     VERIFICATION REQUESTS
     ===================================================== */
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

  /* =====================================================
     MODAL — STEP-3.5 FINAL LOGIC
     ===================================================== */
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

    // Reset UI
    approveBtn.disabled = true;
    noticeEl.classList.add("hidden");
    noticeEl.textContent = "";

    // Already approved → locked forever
    if (activeVerificationStatus === "approved") {
      noticeEl.textContent =
        "This verification request has already been approved and is locked.";
      noticeEl.classList.remove("hidden");
      document.getElementById("verificationModal").classList.remove("hidden");
      return;
    }

    // Must be reviewed first
    if (activeVerificationStatus !== "reviewed") {
      noticeEl.textContent =
        "This request must be reviewed before approval is possible.";
      noticeEl.classList.remove("hidden");
      document.getElementById("verificationModal").classList.remove("hidden");
      return;
    }

    // FINAL SAFETY CHECK — credential must exist & be finalized
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

  /* =====================================================
     MARK REVIEWED
     ===================================================== */
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

  /* =====================================================
     APPROVE — FINAL & SAFE
     ===================================================== */
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
