/* =====================================================
   🔷 BATCH MODULE
   Version: 1.1.0

   AAU GOVERNANCE UPDATE
   -----------------------------------------------------
   batches
     ↓
   trainerId
     ↓
   trainerRegistry

   Status:
   ✓ Create Batch
   ✓ List Batches
   ✓ Trainer Assignment
   ✓ Trainer Registry Integration
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

document.addEventListener("DOMContentLoaded", async () => {

  const batchForm =
    document.getElementById("batchForm");

  const tableBody =
    document.querySelector(
      "#batchTable tbody"
    );

  const trainerSelect =
    document.getElementById(
      "trainerId"
    );

  if (!batchForm || !tableBody) {
    return;
  }

  /* =====================================================
     👨‍🏫 LOAD TRAINERS
  ===================================================== */

  async function loadTrainers() {

    if (!trainerSelect) return;

    try {

      const snap =
        await getDocs(
          collection(
            db,
            "trainerRegistry"
          )
        );

      trainerSelect.innerHTML = `
        <option value="">
          Select Trainer
        </option>
      `;

      snap.forEach(docSnap => {

        const trainer =
          docSnap.data();

        if (
          trainer.status !== "active"
        ) {
          return;
        }

        trainerSelect.innerHTML += `
          <option
            value="${trainer.trainerId}">
            ${trainer.trainerName}
            (${trainer.trainerId})
          </option>
        `;
      });

    } catch (err) {

      console.error(
        "Failed loading trainers:",
        err
      );

    }

  }

  /* =====================================================
     ➕ CREATE BATCH
  ===================================================== */

  batchForm.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      const name =
        document
          .getElementById(
            "batchName"
          )
          .value
          .trim();

      const program =
        document
          .getElementById(
            "programCode"
          )
          .value;

      const trainerId =
        document
          .getElementById(
            "trainerId"
          )
          ?.value;

      const status =
        document
          .getElementById(
            "batchStatus"
          )
          .value;

      if (
        !name ||
        !program ||
        !trainerId
      ) {

        alert(
          "Batch Name, Program Code and Trainer are required."
        );

        return;
      }

      try {

        await addDoc(
          collection(
            db,
            "batches"
          ),
          {
            batch_name: name,

            program_code: program,

            trainerId: trainerId,

            status: status,

            type: "equivalency",

            created_at:
              serverTimestamp(),

            created_by:
              auth.currentUser?.email
              || "unknown"
          }
        );

        batchForm.reset();

        await loadBatches();

        alert(
          "Batch created successfully."
        );

      } catch (err) {

        console.error(
          "Batch creation failed:",
          err
        );

        alert(
          "Failed to create batch."
        );

      }

    }
  );

  /* =====================================================
     📥 LOAD BATCHES
  ===================================================== */

  async function loadBatches() {

    tableBody.innerHTML = "";

    console.log("CSV Import: loadBatches started");

    try {

      console.log("Reading batches collection...");

      const snap =
        await getDocs(
          query(
            collection(
              db,
              "batches"
            ),
            orderBy(
              "created_at",
              "desc"
            )
          )
        );

        console.log(
          "Batch query completed",
          snap.size
        );

      if (snap.empty) {

        tableBody.innerHTML = `
          <tr>
            <td colspan="5">
              No batches found.
            </td>
          </tr>
        `;

        return;
      }

      snap.forEach(docSnap => {

        console.log(
            "Batch document:",
            docSnap.id,
            docSnap.data()
          );

        const b =
          docSnap.data();

        const batchId =
          docSnap.id;

        tableBody.innerHTML += `
          <tr>

            <td>
              ${b.batch_name || "-"}
            </td>

            <td>
              ${b.program_code || "-"}
            </td>

            <td>
              ${b.trainerId || "-"}
            </td>

            <td>
              ${b.status || "-"}
            </td>

            <td>
              <button
                onclick="openBatch('${batchId}')">
                Open
              </button>
            </td>

          </tr>
        `;

      });

    } catch (err) {

      console.error(
        "Failed to load batches:",
        err
      );

      tableBody.innerHTML = `
        <tr>
          <td colspan="5">
            Error loading data
          </td>
        </tr>
      `;

    }

  }

  /* =====================================================
     🔥 INITIAL LOAD
  ===================================================== */

  await loadTrainers();

  await loadBatches();

});

/* =====================================================
   🔗 NAVIGATION
===================================================== */

window.openBatch = function (
  batchId
) {

  if (!batchId) return;

  window.location.href =
    `batch-view.html?batch_id=${batchId}`;

};