/* =====================================================
   🔷 CSV / CREDENTIAL IMPORT MODULE
   Version: 1.2.0

   AAU GOVERNANCE UPDATE
   -----------------------------------------------------
   Purpose:
   - Credential CSV ingestion
   - Batch binding
   - Validation
   - Credential creation

   1.2.0 Changes
   -----------------------------------------------------
   ✓ Added module initialization diagnostics
   ✓ Added batch loading diagnostics
   ✓ Added Firestore visibility diagnostics
   ✓ Added authentication diagnostics
   ✓ Added batch document inspection logs

   Status:
   ✓ Diagnostic Build
   ✓ Non-Breaking
   ✓ Safe for Production Troubleshooting
===================================================== */

import { auth, db } from "./core.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================================================
   🔥 MODULE LOAD DIAGNOSTIC
===================================================== */

console.log(
  "CSV MODULE FILE LOADED"
);

/* =====================================================
   🔷 CREDENTIAL ID GENERATION
===================================================== */

function generateCredentialId() {

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let result = "";

  for (let i = 0; i < 8; i++) {

    result += chars.charAt(
      Math.floor(
        Math.random() * chars.length
      )
    );

  }

  return `AAU-${result}`;

}

async function generateUniqueCredentialId() {

  let id;
  let exists = true;

  while (exists) {

    id = generateCredentialId();

    const snap = await getDocs(
      query(
        collection(
          db,
          "credentials"
        ),
        where(
          "credential_id",
          "==",
          id
        )
      )
    );

    exists = !snap.empty;

  }

  return id;

}

/* =====================================================
   📦 STATE
===================================================== */

let parsedData = [];
let validatedData = [];
let selectedBatch = null;

/* =====================================================
   🚀 MODULE INITIALIZATION
===================================================== */

initCsvImport();

async function initCsvImport() {

  console.log(
    "CSV MODULE INITIALIZED"
  );

  const fileInput =
    document.getElementById(
      "csvFile"
    );

  const parseBtn =
    document.getElementById(
      "parseBtn"
    );

  const uploadBtn =
    document.getElementById(
      "uploadBtn"
    );

  const previewBody =
    document.querySelector(
      "#previewTable tbody"
    );

  const statusMsg =
    document.getElementById(
      "statusMsg"
    );

  const batchSelect =
    document.getElementById(
      "csvBatchSelect"
    );

  if (
    !fileInput ||
    !parseBtn ||
    !uploadBtn
  ) {

    console.error(
      "CSV MODULE ABORTED → Required DOM elements missing"
    );

    return;
  }

  /* =====================================================
     📥 LOAD BATCHES
     Version: 1.2.0 Diagnostic
  ===================================================== */

  async function loadBatches() {

    console.log(
      "===================================="
    );

    console.log(
      "CSV Import → loadBatches() started"
    );

    try {

      batchSelect.innerHTML =
        `<option value="">-- Select Batch --</option>`;

      console.log(
        "Current User:",
        auth.currentUser?.email
      );

      console.log(
        "Firestore Query → batches"
      );

      const snap =
        await getDocs(
          collection(
            db,
            "batches"
          )
        );

      console.log(
        "Batch Count:",
        snap.size
      );

      if (snap.empty) {

        console.warn(
          "No batches found"
        );

        batchSelect.innerHTML =
          `<option value="">No batches available</option>`;

        return;
      }

      snap.forEach(docSnap => {

        const b =
          docSnap.data();

        console.log(
          "Batch Document:",
          docSnap.id,
          b
        );

        batchSelect.innerHTML += `
          <option value="${docSnap.id}">
            ${b.batch_name || "Unnamed Batch"}
            (${b.program_code || "N/A"})
          </option>
        `;

      });

      console.log(
        `Loaded ${snap.size} batch(es)`
      );

    } catch (err) {

      console.error(
        "Failed to load batches:",
        err
      );

      batchSelect.innerHTML =
        `<option value="">Error loading batches</option>`;

    }

    console.log(
      "===================================="
    );

  }

  batchSelect.addEventListener(
    "change",
    () => {

      const selectedOption =
        batchSelect.options[
          batchSelect.selectedIndex
        ];

      selectedBatch = {
        id: batchSelect.value,
        name: selectedOption.text
      };

    }
  );

  /* =====================================================
     🔥 INITIAL LOAD
  ===================================================== */

  await loadBatches();

}