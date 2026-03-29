/* =====================================================
   🎯 TRAINER DASHBOARD — DATA LAYER
   Version: v1.0.0
   Scope: Assigned batches only
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
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

/* =====================================================
   🚀 INIT
===================================================== */

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  const email = user.email;

  console.log("Trainer:", email);

  await loadTrainerDashboard(email);

});


/* =====================================================
   📊 MAIN LOADER
===================================================== */

async function loadTrainerDashboard(email) {

  // 1️⃣ Get assigned batches
  const assignmentSnap = await getDocs(
    query(
      collection(db, "trainer_assignments"),
      where("trainer_email", "==", email),
      where("status", "==", "active")
    )
  );

  const batchIds = [];

  assignmentSnap.forEach(doc => {
    batchIds.push(doc.data().batch_id);
  });

  if (batchIds.length === 0) {
    renderEmpty();
    return;
  }

  // 2️⃣ Load batches
  const batchSnap = await getDocs(collection(db, "batches"));

  let batches = [];

  batchSnap.forEach(doc => {
    const data = doc.data();

    if (batchIds.includes(doc.id)) {
      batches.push({ id: doc.id, ...data });
    }
  });

  // 3️⃣ Load learners
  const learnerSnap = await getDocs(collection(db, "learners"));

  let learners = [];

  learnerSnap.forEach(doc => {
    const l = doc.data();

    if (batchIds.includes(l.batch_id)) {
      learners.push(l);
    }
  });

  // 4️⃣ Compute metrics
  computeMetrics(batches, learners);

  // 5️⃣ Render table
  renderBatches(batches, learners);
}


/* =====================================================
   📊 METRICS
===================================================== */

function computeMetrics(batches, learners) {

  document.getElementById("tBatches").innerText = batches.length;
  document.getElementById("tLearners").innerText = learners.length;

  const active = learners.filter(l => l.status === "active").length;
  const completed = learners.filter(l => l.status === "completed").length;

  document.getElementById("tActive").innerText = active;
  document.getElementById("tCompleted").innerText = completed;
}


/* =====================================================
   📦 RENDER BATCHES
===================================================== */

function renderBatches(batches, learners) {

  const table = document.getElementById("trainerBatchTable");

  table.innerHTML = "";

  batches.forEach(b => {

    const count = learners.filter(l => l.batch_id === b.id).length;

    table.innerHTML += `
      <tr>
        <td>${b.batch_name}</td>
        <td>${b.program_code}</td>
        <td>${b.status}</td>
        <td>${count}</td>
        <td>
          <button onclick="openTrainerBatch('${b.id}')">
            View
          </button>
        </td>
      </tr>
    `;
  });
}


/* =====================================================
   📭 EMPTY STATE
===================================================== */

function renderEmpty() {
  document.getElementById("trainerBatchTable").innerHTML =
    `<tr><td colspan="5">No assigned batches</td></tr>`;
}


/* =====================================================
   🔗 NAVIGATION
===================================================== */

window.openTrainerBatch = function(batchId) {
  window.location.href = `trainer-batch.html?batch_id=${batchId}`;
};