import { auth, db } from "./core.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
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
   📦 STATE
   ===================================================== */

let parsedData = [];
let validatedData = [];
let selectedBatch = null;

/* =====================================================
   🚀 INIT
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const fileInput = document.getElementById("csvFile");
  const parseBtn = document.getElementById("parseBtn");
  const uploadBtn = document.getElementById("uploadBtn");
  const previewBody = document.querySelector("#previewTable tbody");
  const statusMsg = document.getElementById("statusMsg");
  const batchSelect = document.getElementById("csvBatchSelect");

  /* =====================================================
     📥 LOAD BATCHES
     ===================================================== */

  async function loadBatches() {

    const snap = await getDocs(
      query(collection(db, "batches"), orderBy("created_at", "desc"))
    );

    batchSelect.innerHTML = `<option value="">-- Select Batch --</option>`;

    snap.forEach(docSnap => {
      const b = docSnap.data();

      batchSelect.innerHTML += `
        <option value="${docSnap.id}">
          ${b.batch_name} (${b.program_code})
        </option>
      `;
    });
  }

  batchSelect.addEventListener("change", () => {
    const selectedOption = batchSelect.options[batchSelect.selectedIndex];

    selectedBatch = {
      id: batchSelect.value,
      name: selectedOption.text
    };
  });

  /* =====================================================
     📄 PARSE CSV
     ===================================================== */

  parseBtn.addEventListener("click", () => {

    if (!batchSelect.value) {
      alert("Select a batch before parsing");
      return;
    }

    const file = fileInput.files[0];

    if (!file) {
      alert("Select CSV file");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

      parsedData = parseCSV(e.target.result);

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

  uploadBtn.addEventListener("click", async () => {

    if (!selectedBatch?.id) {
      alert("Batch selection required");
      return;
    }

    if (!validatedData.length) {
      alert("No valid data");
      return;
    }

    let success = 0;

    for (const row of validatedData) {

      try {

        // 🔍 Duplicate check (email)
        const existing = await getDocs(
          query(collection(db, "credentials"), where("email", "==", row.email))
        );

        if (!existing.empty) continue;

        await addDoc(collection(db, "credentials"), {

          // 🔷 CORE DATA
          full_name: row.full_name,
          email: row.email,
          credential_type: row.credential_type,
          program_code: row.program_code,

          // 🔷 BATCH MAPPING
          batch_id: selectedBatch.id,
          batch_name: selectedBatch.name,

          // 🔷 SYSTEM FIELDS
          issued_by: row.issued_by || "Agile AI University",
          issued_status: row.issued_status || "issued",

          created_at: serverTimestamp(),
          created_by: auth.currentUser?.email || "system"

        });

        success++;

      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    statusMsg.innerText =
      `Uploaded ${success} records (Batch: ${selectedBatch.name})`;
  });

  /* =====================================================
     🔍 PARSER
     ===================================================== */

  function parseCSV(text) {

    const lines = text.split("\n").filter(l => l.trim());
    const headers = lines[0].split(",").map(h => h.trim());

    return lines.slice(1).map(line => {

      const values = line.split(",");
      let obj = {};

      headers.forEach((h, i) => {
        obj[h] = (values[i] || "").trim();
      });

      return obj;
    });
  }

  /* =====================================================
     ✅ VALIDATION
     ===================================================== */

  function validateData() {

    validatedData = [];
    const emailSet = new Set();

    parsedData.forEach(row => {

      let errors = [];

      if (!row.full_name) errors.push("Missing Name");
      if (!row.email) errors.push("Missing Email");
      if (!row.program_code) errors.push("Missing Program");

      if (row.email && !validateEmail(row.email)) {
        errors.push("Invalid Email");
      }

      if (!["AOP", "AIPA"].includes(row.program_code)) {
        errors.push("Invalid Program");
      }

      if (emailSet.has(row.email)) {
        errors.push("Duplicate in file");
      } else {
        emailSet.add(row.email);
      }

      row._errors = errors;

      if (errors.length === 0) {
        validatedData.push(row);
      }
    });
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* =====================================================
     👀 PREVIEW
     ===================================================== */

  function renderPreview() {

    previewBody.innerHTML = "";

    parsedData.slice(0, 50).forEach(row => {

      const errorText = row._errors?.join(", ");

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
     🔥 INIT LOAD
     ===================================================== */

  loadBatches();

});