/* =====================================================
   Agile AI University — Secure Verification Client v3.0
   Canonical Public Verification Surface
   Governance-Aligned · Deterministic · Hardened
===================================================== */

const API_ENDPOINT =
  "https://aau-credential-verify-458881040066.asia-south1.run.app/public/verify-credential";

const verifyBtn = document.getElementById("verifyBtn");
const credentialIdInput = document.getElementById("credentialIdInput");
const resultDiv = document.getElementById("result");

/* =====================================================
   Utilities
===================================================== */

function isValidCredentialId(id) {
  return /^AAU-[A-Z0-9]{8}$/.test(id);
}

function renderMessage(type, html) {
  resultDiv.innerHTML = `
    <div class="result ${type}">
      ${html}
    </div>
  `;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function resetUI() {
  verifyBtn.disabled = false;
  verifyBtn.innerText = "Verify Credential";

  if (typeof grecaptcha !== "undefined") {
    grecaptcha.reset();
  }
}

/* =====================================================
   Verification Flow
===================================================== */

verifyBtn.addEventListener("click", async () => {
  const credentialId = credentialIdInput.value.trim().toUpperCase();
  credentialIdInput.value = credentialId;

  const recaptchaToken =
    typeof grecaptcha !== "undefined" ? grecaptcha.getResponse() : null;

  resultDiv.innerHTML = "";

  /* ---------- Client Guards ---------- */

  if (!credentialId) {
    renderMessage("error", "Please enter a Credential ID.");
    return;
  }

  if (!isValidCredentialId(credentialId)) {
    renderMessage(
      "error",
      "Invalid Credential ID format. Expected: AAU-XXXXXXXX"
    );
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        credential_id: credentialId,
        recaptchaToken: recaptchaToken,
      }),
    });

    /* ---------- Transport Layer ---------- */

    if (!response.ok) {
      console.error("Transport error:", response.status);
      renderMessage(
        "error",
        "Verification service temporarily unavailable. Please try again later."
      );
      return;
    }

    const data = await safeJson(response);

    if (!data || typeof data.status !== "string") {
      console.warn("Malformed backend response:", data);
      renderMessage(
        "error",
        "Verification service temporarily unavailable. Please try again later."
      );
      return;
    }

    /* ---------- Business Logic ---------- */

    switch (data.status) {
      case "valid":
        renderMessage(
          "success",
          `
          ✅ <strong>Credential Verified</strong>

          <div class="label">Full Name</div>
          ${data.full_name}

          <div class="label">Credential ID</div>
          ${data.credential_id}

          <div class="label">Credential Type</div>
          ${data.credential_type || "—"}

          <div class="label">Issued Under Program</div>
          ${data.program_code || "—"}

          <div class="label">Issued By</div>
          ${data.issued_by || "Agile AI University"}

          <div class="label">Issue Date</div>
          ${data.issue_date || "—"}

          <hr />

          <small>
            This credential is officially verified by
            <strong>Agile AI University</strong>.
          </small>
          `
        );
        break;

      case "not_found":
        renderMessage(
          "error",
          `
          ⚠️ <strong>Credential Not Found</strong>
          <br /><br />
          The entered Credential ID does not match any publicly approved record.
          `
        );
        break;

      case "invalid":
        renderMessage(
          "error",
          "Invalid Credential ID. Please verify and try again."
        );
        break;

      case "error":
        console.warn("Backend structured error:", data);
        renderMessage(
          "error",
          "Verification could not be completed. Please try again later."
        );
        break;

      default:
        console.warn("Unknown status:", data.status);
        renderMessage(
          "error",
          "Verification service temporarily unavailable. Please try again later."
        );
    }

  } catch (error) {
    console.error("Network failure:", error);
    renderMessage(
      "error",
      "Verification service temporarily unavailable. Please try again later."
    );
  } finally {
    resetUI();
  }
});