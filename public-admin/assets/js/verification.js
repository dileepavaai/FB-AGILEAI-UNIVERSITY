import { db } from "./core.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================================================
   🔍 VERIFY LOGIC
   ===================================================== */

const btn = document.getElementById("verifyBtn");
const input = document.getElementById("credentialInput");
const resultDiv = document.getElementById("result");

btn.addEventListener("click", async () => {

  const id = input.value.trim();

  if (!id) {
    alert("Enter Credential ID");
    return;
  }

  resultDiv.innerHTML = "Checking...";

  try {

    const q = query(
      collection(db, "credentials"),
      where("credential_id", "==", id)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      resultDiv.innerHTML = `
        <div class="result invalid">
          ❌ Credential not found
        </div>
      `;
      return;
    }

    const data = snap.docs[0].data();

    // 🔶 NOT ISSUED
    if (data.issued_status !== "issued") {
      resultDiv.innerHTML = `
        <div class="result pending">
          ⚠️ Credential exists but not yet issued
        </div>
      `;
      return;
    }

    // ✅ VALID
    resultDiv.innerHTML = `
      <div class="result valid">
        ✅ <strong>Valid Credential</strong><br><br>

        <b>Name:</b> ${data.full_name}<br>
        <b>Program:</b> ${data.credential_type}<br>
        <b>Program Code:</b> ${data.program_code}<br>
        <b>Batch:</b> ${data.batch_name}<br>
        <b>Issued By:</b> ${data.issued_by}<br>
        <b>Credential ID:</b> ${data.credential_id}
      </div>
    `;

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = `
      <div class="result invalid">
        ❌ Error verifying credential
      </div>
    `;
  }
});