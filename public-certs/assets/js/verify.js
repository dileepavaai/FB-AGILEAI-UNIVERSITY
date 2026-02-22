import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   Firebase Init
   ========================= */
const firebaseConfig = {
  apiKey: "AIzaSyCti7ubJjnU8LJTghNaXhaSZzqCpozkeXg",
  authDomain: "fb-agileai-university.firebaseapp.com",
  projectId: "fb-agileai-university"
};

console.log("✅ verify.js loaded (credential-approval gated + dual identifier)");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   UI References
   ========================= */
const verifyBtn = document.getElementById("verifyBtn");
const emailInput = document.getElementById("emailInput");
const credentialIdInput = document.getElementById("credentialIdInput");
const resultDiv = document.getElementById("result");

/* =========================
   Verify Credential
   (PUBLIC — APPROVAL GATED)
   ========================= */
verifyBtn.addEventListener("click", async () => {

  const email = emailInput.value.trim().toLowerCase();
  const credentialId = credentialIdInput.value.trim();

  resultDiv.innerHTML = "";

  if (!email && !credentialId) {
    resultDiv.innerHTML = `
      <div class="result error">
        Please enter either a Credential ID or a Registered Email Address.
      </div>`;
    return;
  }

  verifyBtn.disabled = true;
  verifyBtn.innerText = "Verifying…";

  /* =========================
     1️⃣ LOG VERIFICATION REQUEST
     ========================= */
  try {
    await addDoc(collection(db, "verification_requests"), {
      email: email || null,
      credential_id: credentialId || null,
      source: "verify_portal",
      status: "new",
      created_at: serverTimestamp()
    });
  } catch (err) {
    console.warn("⚠️ Logging failed (non-blocking):", err);
  }

  try {

    /* =========================
       2️⃣ BUILD QUERY (ID PRIORITY)
       ========================= */
    let q;

    if (credentialId) {
      q = query(
        collection(db, "credentials"),
        where("credential_id", "==", credentialId),
        where("issued_status", "==", "finalized"),
        where("approval_status", "==", "approved")
      );
    } else {
      q = query(
        collection(db, "credentials"),
        where("email", "==", email),
        where("issued_status", "==", "finalized"),
        where("approval_status", "==", "approved")
      );
    }

    const snap = await getDocs(q);

    if (snap.empty) {
      resultDiv.innerHTML = `
        <div class="result pending">
          ⚠️ <strong>Verification Pending</strong>
          <br /><br />
          This credential exists in our academic records, but
          public verification is not yet available.
          <br /><br />
          Please check back later or contact
          <strong>credentials@agileai.university</strong>.
        </div>`;
      return;
    }

    const data = snap.docs[0].data();

    /* =========================
       3️⃣ DISPLAY VERIFIED RESULT
       ========================= */
    resultDiv.innerHTML = `
      <div class="result success">
        ✅ <strong>Credential Verified</strong>

        <div class="label">Full Name</div>
        ${data.full_name}

        <div class="label">Credential ID</div>
        ${data.credential_id || "—"}

        <div class="label">Credential Awarded</div>
        ${data.credential_type}

        <div class="label">Program Attended</div>
        ${data.program_code}

        <div class="label">Issuance Basis</div>
        AOP → AIPA Equivalency (2025)

        <div class="label">Academic Note</div>
        Completion of the AOP program does <strong>not</strong> imply
        coverage of the full AIPA curriculum. The AIPA credential
        reflects an <strong>equivalency-based recognition</strong>
        and does not replace the AIPA Bridge Program.

        <div class="label">Issued By</div>
        ${data.issued_by}

        <div class="label">Status</div>
        Finalized

        <hr />

        <small>
          This credential is officially issued and verified by
          <strong>Agile AI University</strong> under its approved
          equivalency framework.
        </small>
      </div>`;
      
  } catch (err) {
    console.error("❌ Verification error:", err);
    resultDiv.innerHTML = `
      <div class="result error">
        ⚠️ Verification failed due to a system error.
        <br /><br />
        Please try again later.
      </div>`;
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.innerText = "Verify Credential";
  }
});