import { auth, db } from "./core.js";

import {
  collection,
  addDoc,
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

      renderPreview();
      statusMsg.innerText = `Parsed ${parsedData.length} records`;
    };

    reader.readAsText(file);
  });

  /* =====================================================
     📤 UPLOAD
     ===================================================== */

  uploadBtn.addEventListener("click", async () => {

    if (!parsedData.length) {
      alert("No data to upload");
      return;
    }

    let success = 0;

    for (const row of parsedData) {
      try {
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

    statusMsg.innerText = `Uploaded ${success} records`;
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
     👀 PREVIEW
     ===================================================== */

  function renderPreview() {

    previewBody.innerHTML = "";

    parsedData.slice(0, 50).forEach(row => {

      previewBody.innerHTML += `
        <tr>
          <td>${row.full_name}</td>
          <td>${row.email}</td>
          <td>${row.credential_type}</td>
          <td>${row.program_code}</td>
          <td>${row.issued_status}</td>
        </tr>
      `;
    });
  }

});