/* =====================================================
   🔷 CSV / CREDENTIAL IMPORT MODULE
   Version: 1.3.0

   AAU GOVERNANCE UPDATE
   -----------------------------------------------------
   Purpose:
   - Credential CSV ingestion
   - Batch binding
   - Validation
   - Credential creation

   1.3.0 Changes
   -----------------------------------------------------
   ✓ Batch selector simplified
   ✓ Batch metadata display
   ✓ Trainer assignment visibility
   ✓ Governance-aligned batch selection
   ✓ Diagnostic logging retained

   Status:
   ✓ Production Ready
   ✓ Non-Breaking
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
let batchLookup = {};

/* =====================================================
   🚀 INIT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

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

  const batchMeta =
    document.getElementById(
      "batchMeta"
    );

  if (
    !fileInput ||
    !parseBtn ||
    !uploadBtn
  ) {
    return;
  }

  /* =====================================================
     📥 LOAD BATCHES
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

        batchSelect.innerHTML =
          `<option value="">No batches available</option>`;

        return;
      }

      snap.forEach(docSnap => {

        const batch =
          docSnap.data();

        batchLookup[
          docSnap.id
        ] = batch;

        batchSelect.innerHTML += `
          <option value="${docSnap.id}">
            ${batch.batch_name || "Unnamed Batch"}
          </option>
        `;

      });

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

  /* =====================================================
     🎯 BATCH SELECTION
  ===================================================== */

  batchSelect.addEventListener(
    "change",
    () => {

      const batch =
        batchLookup[
          batchSelect.value
        ];

      const selectedOption =
        batchSelect.options[
          batchSelect.selectedIndex
        ];

      selectedBatch = {
        id: batchSelect.value,
        name: selectedOption.text
      };

      if (
        !batchMeta ||
        !batch
      ) {

        if (batchMeta) {
          batchMeta.innerHTML = "";
        }

        return;
      }

      batchMeta.innerHTML = `
        <div style="
          margin-top:12px;
          padding:12px;
          border:1px solid #e5e7eb;
          border-radius:8px;
          background:#f8fafc;
        ">

          <div>
            <strong>Program:</strong>
            ${batch.program_code || "-"}
          </div>

          <div>
            <strong>Trainer:</strong>
            ${batch.trainerId || "-"}
          </div>

          <div>
            <strong>Status:</strong>
            ${batch.status || "-"}
          </div>

        </div>
      `;

    }
  );

  /* =====================================================
     📄 PARSE CSV
  ===================================================== */

  parseBtn.addEventListener("click", () => {

    if (!batchSelect.value) {

      alert(
        "Select a batch before parsing"
      );

      return;
    }

    const file =
      fileInput.files[0];

    if (!file) {

      alert(
        "Select CSV file"
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = function (e) {

      parsedData =
        parseCSV(
          e.target.result
        );

      validateData();

      renderPreview();

      statusMsg.innerText =
        `Parsed: ${parsedData.length} | Valid: ${validatedData.length}`;

    };

    reader.readAsText(file);

  });

  /* =====================================================
     📤 UPLOAD
  ===================================================== */

  uploadBtn.addEventListener(
    "click",
    async () => {

      if (!selectedBatch?.id) {

        alert(
          "Batch selection required"
        );

        return;
      }

      if (!validatedData.length) {

        alert(
          "No valid data"
        );

        return;
      }

      let success = 0;

      for (
        const row
        of validatedData
      ) {

        try {

          const existing =
            await getDocs(
              query(
                collection(
                  db,
                  "credentials"
                ),
                where(
                  "email",
                  "==",
                  row.email
                )
              )
            );

          if (
            !existing.empty
          ) {
            continue;
          }

          const credentialId =
            await generateUniqueCredentialId();

          await addDoc(
            collection(
              db,
              "credentials"
            ),
            {

              credential_id:
                credentialId,

              full_name:
                row.full_name,

              email:
                row.email,

              credential_type:
                row.credential_type,

              program_code:
                row.program_code,

              batch_id:
                selectedBatch.id,

              batch_name:
                selectedBatch.name,

              issued_by:
                row.issued_by
                || "Agile AI University",

              issued_status:
                row.issued_status
                || "issued",

              created_at:
                serverTimestamp(),

              created_by:
                auth.currentUser?.email
                || "system"

            }
          );

          success++;

        } catch (err) {

          console.error(
            "Upload error:",
            err
          );

        }

      }

      statusMsg.innerText =
        `Uploaded ${success} records (Batch: ${selectedBatch.name})`;

    }
  );

  /* =====================================================
     🔍 PARSER
  ===================================================== */

  function parseCSV(text) {

    const lines =
      text
        .split("\n")
        .filter(
          l => l.trim()
        );

    const headers =
      lines[0]
        .split(",")
        .map(
          h => h.trim()
        );

    return lines
      .slice(1)
      .map(line => {

        const values =
          line.split(",");

        let obj = {};

        headers.forEach(
          (h, i) => {

            obj[h] =
              (
                values[i] || ""
              ).trim();

          }
        );

        return obj;

      });

  }

  /* =====================================================
     ✅ VALIDATION
  ===================================================== */

  function validateData() {

  validatedData = [];

  const emailSet =
    new Set();

  parsedData.forEach(row => {

    let errors = [];

    if (!row.full_name)
      errors.push("Missing Name");

    if (!row.email)
      errors.push("Missing Email");

    if (!row.program_code)
      errors.push("Missing Program");

    if (
      row.email &&
      !validateEmail(row.email)
    ) {
      errors.push(
        "Invalid Email"
      );
    }

    /* =====================================================
       OPTION B GOVERNANCE

       Accept any program_code.

       Validation only checks that
       program_code is present.

       Program legitimacy is governed
       by batch assignment and
       institutional controls.
    ===================================================== */

    if (
      emailSet.has(
        row.email
      )
    ) {

      errors.push(
        "Duplicate in file"
      );

    } else {

      emailSet.add(
        row.email
      );

    }

    row._errors = errors;

    if (
      errors.length === 0
    ) {
      validatedData.push(row);
    }

  });

}

  function validateEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email);

  }

  /* =====================================================
     👀 PREVIEW
  ===================================================== */

  function renderPreview() {

    previewBody.innerHTML = "";

    parsedData
      .slice(0, 50)
      .forEach(row => {

        const errorText =
          row._errors?.join(", ");

        previewBody.innerHTML += `
          <tr style="background:${errorText ? "#ffe6e6" : ""}">
            <td>${row.full_name || ""}</td>
            <td>${row.email || ""}</td>
            <td>${row.credential_type || ""}</td>
            <td>${row.program_code || ""}</td>
            <td>
              ${row.issued_status || ""}
              ${errorText ? `<br><small style="color:red">${errorText}</small>` : ""}
            </td>
          </tr>
        `;

      });

  }

  /* =====================================================
     🔥 INITIAL LOAD
  ===================================================== */

  loadBatches();

});