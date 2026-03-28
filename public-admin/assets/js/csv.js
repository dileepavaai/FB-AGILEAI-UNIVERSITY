import { auth, db } from "./core.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where
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

/* =====================================================
   🚀 INIT
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const fileInput = document.getElementById("csvFile");
  const parseBtn = document.getElementById("parseBtn");
  const uploadBtn = document.getElementById("uploadBtn");
  const previewBody = document.querySelector("#previewTable tbody");
  const statusMsg = document.getElementById("statusMsg");

  /* =====================================================
     📄 PARSE CSV
     ===================================================== */

  parseBtn.addEventListener("click", () => {

    const file = fileInput.files[0];

    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      const text = e.target.result;

      parsedData = parseCSV(text);

      validateData();
      renderPreview();

      statusMsg.innerText =
        `Parsed: ${parsedData.length} | Valid: ${validatedData.length}`;
    };

    reader.readAsText(file);
  });

  /* =====================================================
     📤 UPLOAD (ONLY VALID)
     ===================================================== */

  uploadBtn.addEventListener("click", async () => {

    if (!validatedData.length) {
      alert("No valid data to upload");
      return;
    }

    let success = 0;

    for (const row of validatedData) {

      try {

        // 🔍 Optional Firestore duplicate check (email)
        const existing = await getDocs(
          query(collection(db, "credentials"), where("email", "==", row.email))
        );

        if (!existing.empty) {
          console.warn("Duplicate in DB:", row.email);
          continue;
        }

        await addDoc(collection(db, "credentials"), {
          full_name: row.full_name,
          email: row.email,
          credential_type: row.credential_type,
          program_code: row.program_code,
          issued_by: row.issued_by || "Agile AI University",
          issued_status: row.issued_status || "issued",
          created_at: serverTimestamp(),
          created_by: auth.currentUser?.email || "system"
        });

        success++;

      } catch (err) {
        console.error("Upload error:", err, row);
      }
    }

    statusMsg.innerText =
      `Uploaded ${success} records (Skipped invalid + duplicates)`;
  });

  /* =====================================================
     🔍 CSV PARSER
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
     ✅ VALIDATION ENGINE
     ===================================================== */

  function validateData() {

    validatedData = [];
    const emailSet = new Set();

    parsedData.forEach((row, index) => {

      let errors = [];

      // 🔹 Required fields
      if (!row.full_name) errors.push("Missing Name");
      if (!row.email) errors.push("Missing Email");
      if (!row.program_code) errors.push("Missing Program");

      // 🔹 Email format
      if (row.email && !validateEmail(row.email)) {
        errors.push("Invalid Email");
      }

      // 🔹 Program validation
      const allowedPrograms = ["AOP", "AIPA"];
      if (row.program_code && !allowedPrograms.includes(row.program_code)) {
        errors.push("Invalid Program");
      }

      // 🔹 Duplicate in file
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
     👀 PREVIEW (WITH ERRORS)
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

});