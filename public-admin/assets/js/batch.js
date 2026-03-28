import { auth, db } from "./core.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================================================
   🔐 AUTH GUARD
   ===================================================== */

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

/* =====================================================
   🚀 INIT
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const batchForm = document.getElementById("batchForm");
  const tableBody = document.querySelector("#batchTable tbody");

  if (!batchForm) return;

  /* =====================================================
     ➕ CREATE BATCH
     ===================================================== */

  batchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("batchName").value.trim();
    const program = document.getElementById("programCode").value;
    const status = document.getElementById("batchStatus").value;

    if (!name || !program) {
      alert("Batch Name and Program Code required");
      return;
    }

    await addDoc(collection(db, "batches"), {
      batch_name: name,
      program_code: program,
      status: status,
      type: "equivalency",
      created_at: serverTimestamp(),
      created_by: auth.currentUser?.email || "unknown"
    });

    batchForm.reset();
    loadBatches();
  });

  /* =====================================================
     📥 LOAD BATCHES
     ===================================================== */

  async function loadBatches() {
    tableBody.innerHTML = "";

    const snap = await getDocs(
      query(collection(db, "batches"), orderBy("created_at", "desc"))
    );

    snap.forEach(docSnap => {
      const b = docSnap.data();

      tableBody.innerHTML += `
        <tr>
          <td>${b.batch_name}</td>
          <td>${b.program_code}</td>
          <td>${b.status}</td>
        </tr>
      `;
    });
  }

  /* =====================================================
     🔥 INITIAL LOAD
     ===================================================== */

  loadBatches();

});