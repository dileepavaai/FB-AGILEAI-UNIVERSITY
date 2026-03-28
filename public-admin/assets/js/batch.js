/* =====================================================
   🔷 BATCH MODULE (CLEAN — NO AUTH DUPLICATION)
   ===================================================== */

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
   🚀 INIT
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const batchForm = document.getElementById("batchForm");
  const tableBody = document.querySelector("#batchTable tbody");

  if (!batchForm || !tableBody) return;

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

    try {
      await addDoc(collection(db, "batches"), {
        batch_name: name,
        program_code: program,
        status: status,
        type: "equivalency",
        created_at: serverTimestamp(),
        created_by: auth.currentUser?.email || "unknown"
      });

      batchForm.reset();
      await loadBatches();

    } catch (err) {
      console.error("Batch creation failed:", err);
      alert("Failed to create batch");
    }
  });

  /* =====================================================
     📥 LOAD BATCHES
     ===================================================== */

  async function loadBatches() {
    tableBody.innerHTML = "";

    try {
      const snap = await getDocs(
        query(collection(db, "batches"), orderBy("created_at", "desc"))
      );

      snap.forEach(docSnap => {
        const b = docSnap.data();
        const batchId = docSnap.id;

        const row = `
          <tr>
            <td>${b.batch_name || "-"}</td>
            <td>${b.program_code || "-"}</td>
            <td>${b.status || "-"}</td>
            <td>
              <button onclick="openBatch('${batchId}')">Open</button>
            </td>
          </tr>
        `;

        tableBody.innerHTML += row;
      });

    } catch (err) {
      console.error("Failed to load batches:", err);
      tableBody.innerHTML = `<tr><td colspan="4">Error loading data</td></tr>`;
    }
  }

  /* =====================================================
     🔥 INITIAL LOAD
     ===================================================== */

  loadBatches();

});

/* =====================================================
   🔗 NAVIGATION (GLOBAL SAFE FUNCTION)
   ===================================================== */

window.openBatch = function (batchId) {
  if (!batchId) return;
  window.location.href = `batch-view.html?batch_id=${batchId}`;
};