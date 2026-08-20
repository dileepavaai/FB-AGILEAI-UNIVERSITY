/* =====================================================
   🔷 BATCH MODULE
   Version: 1.2.0

   AAU GOVERNANCE UPDATE
   -----------------------------------------------------
   batches
     ↓
   trainerId
     ↓
   trainerRegistry

   Training Period Authority
   -----------------------------------------------------
   batches
     ↓
   training_start_date
   training_end_date

   Status:
   ✓ Create Batch
   ✓ List Batches
   ✓ Trainer Assignment
   ✓ Trainer Registry Integration
   ✓ Governed Training Period
   ✓ Training Period Validation
   ✓ Training Period Display
===================================================== */

import {
  auth,
  db
} from "./core.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =====================================================
   🔧 HELPERS
===================================================== */

function normalizeString(
  value
) {

  return String(
    value ?? ""
  )
    .trim();

}


function formatDate(
  value
) {

  const normalized =
    normalizeString(
      value
    );

  if (!normalized) {
    return "";
  }


  /*
   HTML date inputs produce YYYY-MM-DD.

   Manual parsing avoids UTC conversion changing
   the visible calendar date.
  */

  const parts =
    normalized.split("-");


  if (
    parts.length !== 3
  ) {

    return normalized;

  }


  const year =
    Number(
      parts[0]
    );

  const month =
    Number(
      parts[1]
    );

  const day =
    Number(
      parts[2]
    );


  if (
    !year ||
    !month ||
    !day
  ) {

    return normalized;

  }


  const date =
    new Date(
      year,
      month - 1,
      day
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return normalized;

  }


  return date.toLocaleDateString(
    "en-GB",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric"
    }
  );

}


function formatTrainingPeriod(
  batch
) {

  const startDate =
    normalizeString(
      batch?.training_start_date
    );

  const endDate =
    normalizeString(
      batch?.training_end_date
    );


  if (
    startDate &&
    endDate
  ) {

    return (
      `${formatDate(startDate)} – ${formatDate(endDate)}`
    );

  }


  if (startDate) {

    return formatDate(
      startDate
    );

  }


  if (endDate) {

    return formatDate(
      endDate
    );

  }


  return "-";

}


/* =====================================================
   🚀 INIT
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const batchForm =
      document.getElementById(
        "batchForm"
      );

    const tableBody =
      document.querySelector(
        "#batchTable tbody"
      );

    const trainerSelect =
      document.getElementById(
        "trainerId"
      );

    const trainingStartDateInput =
      document.getElementById(
        "trainingStartDate"
      );

    const trainingEndDateInput =
      document.getElementById(
        "trainingEndDate"
      );


    if (
      !batchForm ||
      !tableBody
    ) {

      console.warn(
        "[BatchModule] Required batch-management surface not found."
      );

      return;

    }


    /* =====================================================
       👨‍🏫 LOAD TRAINERS
    ===================================================== */

    async function loadTrainers() {

      if (!trainerSelect) {

        console.warn(
          "[BatchModule] Trainer selector not found."
        );

        return;

      }


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


        snap.forEach(
          docSnap => {

            const trainer =
              docSnap.data();


            if (
              trainer.status !==
              "active"
            ) {

              return;

            }


            const trainerId =
              normalizeString(
                trainer.trainerId
              );

            const trainerName =
              normalizeString(
                trainer.trainerName
              );


            if (!trainerId) {

              console.warn(
                "[BatchModule] Active trainer record has no trainerId.",
                {
                  documentId:
                    docSnap.id
                }
              );

              return;

            }


            trainerSelect.innerHTML += `
              <option value="${trainerId}">
                ${trainerName || trainerId}
                (${trainerId})
              </option>
            `;

          }
        );


        console.info(
          "[BatchModule] Trainers loaded.",
          {
            recordCount:
              snap.size
          }
        );

      }
      catch (err) {

        console.error(
          "[BatchModule] Failed loading trainers:",
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
          normalizeString(
            document
              .getElementById(
                "batchName"
              )
              ?.value
          );


        const program =
          normalizeString(
            document
              .getElementById(
                "programCode"
              )
              ?.value
          );


        const trainerId =
          normalizeString(
            trainerSelect?.value
          );


        const status =
          normalizeString(
            document
              .getElementById(
                "batchStatus"
              )
              ?.value
          );


        const trainingStartDate =
          normalizeString(
            trainingStartDateInput
              ?.value
          );


        const trainingEndDate =
          normalizeString(
            trainingEndDateInput
              ?.value
          );


        /* =================================================
           REQUIRED FIELD VALIDATION
        ================================================= */

        if (
          !name ||
          !program ||
          !trainerId ||
          !status ||
          !trainingStartDate ||
          !trainingEndDate
        ) {

          alert(
            "Batch Name, Program Code, Trainer, Status, Training Start Date and Training End Date are required."
          );

          return;

        }


        /* =================================================
           TRAINING PERIOD VALIDATION
        ================================================= */

        if (
          trainingEndDate <
          trainingStartDate
        ) {

          alert(
            "Training End Date cannot be earlier than Training Start Date."
          );

          return;

        }


        const batchPayload = {

          batch_name:
            name,

          program_code:
            program,

          trainerId:
            trainerId,

          status:
            status,

          type:
            "equivalency",

          training_start_date:
            trainingStartDate,

          training_end_date:
            trainingEndDate,

          created_at:
            serverTimestamp(),

          created_by:
            auth.currentUser?.email ||
            "unknown"

        };


        console.info(
          "[BatchModule] Creating batch.",
          {
            batchName:
              batchPayload.batch_name,

            programCode:
              batchPayload.program_code,

            trainerId:
              batchPayload.trainerId,

            status:
              batchPayload.status,

            trainingStartDate:
              batchPayload.training_start_date,

            trainingEndDate:
              batchPayload.training_end_date
          }
        );


        try {

          const createdBatch =
            await addDoc(
              collection(
                db,
                "batches"
              ),
              batchPayload
            );


          console.info(
            "[BatchModule] Batch created.",
            {
              batchDocumentId:
                createdBatch.id,

              trainingStartDate:
                trainingStartDate,

              trainingEndDate:
                trainingEndDate
            }
          );


          batchForm.reset();


          await loadBatches();


          alert(
            "Batch created successfully."
          );

        }
        catch (err) {

          console.error(
            "[BatchModule] Batch creation failed:",
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


      console.info(
        "[BatchModule] Batch loading started."
      );


      try {

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


        console.info(
          "[BatchModule] Batch query completed.",
          {
            recordCount:
              snap.size
          }
        );


        if (
          snap.empty
        ) {

          tableBody.innerHTML = `
            <tr>
              <td colspan="6">
                No batches found.
              </td>
            </tr>
          `;

          return;

        }


        snap.forEach(
          docSnap => {

            const batch =
              docSnap.data();

            const batchId =
              docSnap.id;

            const trainingPeriod =
              formatTrainingPeriod(
                batch
              );


            console.info(
              "[BatchModule] Batch resolved.",
              {
                batchDocumentId:
                  batchId,

                batchName:
                  batch.batch_name ||
                  "",

                programCode:
                  batch.program_code ||
                  "",

                trainerId:
                  batch.trainerId ||
                  "",

                trainingStartDate:
                  batch.training_start_date ||
                  "",

                trainingEndDate:
                  batch.training_end_date ||
                  "",

                trainingPeriod:
                  trainingPeriod,

                status:
                  batch.status ||
                  ""
              }
            );


            tableBody.innerHTML += `
              <tr>

                <td>
                  ${batch.batch_name || "-"}
                </td>

                <td>
                  ${batch.program_code || "-"}
                </td>

                <td>
                  ${batch.trainerId || "-"}
                </td>

                <td>
                  ${trainingPeriod}
                </td>

                <td>
                  ${batch.status || "-"}
                </td>

                <td>
                  <button
                    type="button"
                    onclick="openBatch('${batchId}')">

                    Open

                  </button>
                </td>

              </tr>
            `;

          }
        );

      }
      catch (err) {

        console.error(
          "[BatchModule] Failed to load batches:",
          err
        );


        tableBody.innerHTML = `
          <tr>
            <td colspan="6">
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

  }
);


/* =====================================================
   🔗 NAVIGATION
===================================================== */

window.openBatch =
  function (
    batchId
  ) {

    const normalizedBatchId =
      normalizeString(
        batchId
      );


    if (
      !normalizedBatchId
    ) {

      console.warn(
        "[BatchModule] Cannot open batch without batch ID."
      );

      return;

    }


    window.location.href =
      `batch-view.html?batch_id=${encodeURIComponent(normalizedBatchId)}`;

  };