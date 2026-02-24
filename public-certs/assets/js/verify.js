/* =====================================================
   Agile AI University — Secure Verification Client
   Cloud Run Controlled · Credential ID Only · reCAPTCHA
===================================================== */

const API_ENDPOINT = "https://aau-credential-verify-458881040066.asia-south1.run.app/verify"; // Update after Cloud Run deploy

const verifyBtn = document.getElementById("verifyBtn");
const credentialIdInput = document.getElementById("credentialIdInput");
const resultDiv = document.getElementById("result");

/* =========================
   Credential Format Validation
========================= */
function isValidCredentialId(id) {
  const regex = /^AAU-[A-Z0-9]{8}$/;
  return regex.test(id);
}

/* =========================
   Render Result
========================= */
function renderMessage(type, html) {
  resultDiv.innerHTML = `
    <div class="result ${type}">
      ${html}
    </div>
  `;
}

/* =========================
   Verify Action
========================= */
verifyBtn.addEventListener("click", async () => {

  const credentialId = credentialIdInput.value.trim().toUpperCase();
  credentialIdInput.value = credentialId;

  const recaptchaToken = grecaptcha.getResponse();

  resultDiv.innerHTML = "";

  if (!credentialId) {
    renderMessage("error", "Please enter a Credential ID.");
    return;
  }

  if (!isValidCredentialId(credentialId)) {
    renderMessage("error", "Invalid Credential ID format. Expected: AAU-XXXXXXXX");
    return;
  }

  if (!recaptchaToken) {
    renderMessage("error", "Please complete the reCAPTCHA verification.");
    return;
  }

  verifyBtn.disabled = true;
  verifyBtn.innerText = "Verifying…";

  try {

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        credential_id: credentialId,
        recaptcha_token: recaptchaToken
      })
    });

    const data = await response.json();

    if (data.status === "valid") {

      renderMessage("success", `
        ✅ <strong>Credential Verified</strong>

        <div class="label">Full Name</div>
        ${data.full_name}

        <div class="label">Credential ID</div>
        ${data.credential_id}

        <div class="label">Program</div>
        ${data.program_code}

        <div class="label">Issued By</div>
        ${data.issued_by}

        <div class="label">Issue Date</div>
        ${data.issue_date || "—"}

        <hr />

        <small>
          This credential is officially verified by
          <strong>Agile AI University</strong>.
        </small>
      `);

    } else {

      renderMessage("error", `
        ⚠️ <strong>Credential Not Found</strong>
        <br /><br />
        The entered Credential ID does not match any publicly approved record.
        <br /><br />
        Please verify the ID and try again.
      `);
    }

  } catch (err) {

    renderMessage("error", `
      ⚠️ Verification service temporarily unavailable.
      <br /><br />
      Please try again later.
    `);

  } finally {
    verifyBtn.disabled = false;
    verifyBtn.innerText = "Verify Credential";
    grecaptcha.reset();
  }

});