/* =====================================================
   🎯 TRAINER BATCH — EXECUTION LAYER
   -----------------------------------------------------
   Version: v1.1.0 (Audit Enabled + Safe Upgrade)
   Date: 2026-03-29

   CHANGE TYPE:
   - Non-breaking enhancement
   - Audit trail added
   - Firestore access optimized

   IMPROVEMENTS:
   - Added updated_by, updated_at
   - Added previous_status tracking
   - Replaced inefficient query with getDoc()
   - Defensive coding improvements
===================================================== */

import { auth } from "./core.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,        // ✅ NEW
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

const params = new URLSearchParams(window.location.search);
const batchId = params.get("batch_id");


/* =====================================================
   🚀 INIT
===================================================== */

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  if (!batchId) {
    alert("No batch selected");
    return;
  }

  try {
    await loadBatch();
    await loadLearners();
  } catch (err) {
    console.error("❌ Trainer Batch Init Error:", err);
  }

});


/* =====================================================
   📦 LOAD BATCH
===================================================== */

async function loadBatch() {

  const snap = await getDocs(collection(db, "batches"));

  snap.forEach(d => {
    if (d.id === batchId) {
      document.getElementById("batchTitle").innerText =
        d.data().batch_name;
    }
  });

}


/* =====================================================
   👥 LOAD LEARNERS
===================================================== */

async function loadLearners() {

  const table = document.getElementById("trainerLearnerTable");

  table.innerHTML = `
    <tr><td colspan="4">Loading...</td></tr>
  `;

  const snap = await getDocs(
    query(
      collection(db, "learners"),
      where("batch_id", "==", batchId)
    )
  );

  table.innerHTML = "";

  if (snap.empty) {
    table.innerHTML = `<tr><td colspan="4">No learners</td></tr>`;
    return;
  }

  snap.forEach(d => {

    const l = d.data();

    table.innerHTML += `
      <tr>
        <td>${l.full_name || "-"}</td>
        <td>${l.email || "-"}</td>
        <td>${l.status || "-"}</td>
        <td>
          <select onchange="updateStatus('${d.id}', this.value)">
            <option value="">Change</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </select>
        </td>
      </tr>
    `;
  });

}


/* =====================================================
   🔄 UPDATE STATUS (AUDIT ENABLED)
===================================================== */

window.updateStatus = async function(docId, status) {

  if (!status) return;

  try {

    const user = auth.currentUser;
    const email = user?.email || "unknown";

    const ref = doc(db, "learners", docId);

    // 🔍 GET CURRENT STATE (SAFE + FAST)
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.error("Learner not found:", docId);
      return;
    }

    const previousStatus = snap.data().status || null;

    // 🔥 UPDATE WITH AUDIT
    await updateDoc(ref, {
      status: status,

      // 🔐 AUDIT FIELDS
      updated_by: email,
      updated_at: new Date(),

      // 🔁 TRACEABILITY
      previous_status: previousStatus
    });

    // 🔄 REFRESH UI
    loadLearners();

  } catch (err) {
    console.error("❌ Status Update Error:", err);
    alert("Failed to update status");
  }

};