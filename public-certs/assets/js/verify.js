/* =====================================================
   Agile AI University — Verification Client v8.0
   FINAL STABLE · QR FIX · PRODUCTION SAFE
===================================================== */

const API_ENDPOINT =
  "https://aau-credential-verify-458881040066.asia-south1.run.app/public/verify-credential";

/* =====================================================
   DOM ELEMENTS
===================================================== */

const verifyBtn = document.getElementById("verifyBtn");
const credentialIdInput = document.getElementById("credentialIdInput");
const resultDiv = document.getElementById("result");

const resultCard = document.getElementById("resultCard");
const verificationStatus = document.getElementById("verificationStatus");

const r_full_name = document.getElementById("r_full_name");
const r_credential_id = document.getElementById("r_credential_id");
const r_credential_type = document.getElementById("r_credential_type");
const r_program_code = document.getElementById("r_program_code");
const r_issued_by = document.getElementById("r_issued_by");
const r_issue_date = document.getElementById("r_issue_date");

const qrContainer = document.getElementById("qrCode");
const shareLinkInput = document.getElementById("shareLink");
const copyBtn = document.getElementById("copyLinkBtn");

/* =====================================================
   UTILITIES
===================================================== */

function isValidCredentialId(id) {
  return /^AAU-[A-Z0-9]{8}$/.test(id);
}

function safeText(value, fallback = "—") {
  return value ? String(value) : fallback;
}

function resetUI() {
  verifyBtn.disabled = false;
  verifyBtn.innerText = "Verify Credential";

  if (typeof grecaptcha !== "undefined") {
    grecaptcha.reset();
  }
}

function hideCard() {
  if (resultCard) resultCard.classList.add("hidden");
}

/* =====================================================
   DATE FORMAT
===================================================== */

function formatIssueDate(data) {
  const rawDate =
    data.issue_date ||
    data.imported_at ||
    data.created_at ||
    null;

  if (!rawDate) return "—";

  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return rawDate;

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return rawDate;
  }
}

/* =====================================================
   QR GENERATION (ROBUST)
===================================================== */

function renderQRCode(url) {
  if (!qrContainer) return;

  qrContainer.innerHTML = "";

  // Ensure library is loaded
  if (typeof QRCode === "undefined") {
    console.warn("QR library not loaded yet");
    return;
  }

  new QRCode(qrContainer, {
    text: url,
    width: 120,
    height: 120,
  });
}

/* =====================================================
   SHARE + QR
===================================================== */

function generateVerificationAssets(credentialId, signature = null) {
  let url = `${window.location.origin}/verify.html?id=${credentialId}`;

  if (signature) {
    url += `&sig=${signature}`;
  }

  if (shareLinkInput) {
    shareLinkInput.value = url;
  }

  // Delay ensures QR lib is loaded
  setTimeout(() => {
    renderQRCode(url);
  }, 100);
}

/* =====================================================
   COPY LINK (MODERN + FALLBACK)
===================================================== */

if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(shareLinkInput.value);
    } catch {
      shareLinkInput.select();
      document.execCommand("copy");
    }

    copyBtn.innerText = "Copied!";
    setTimeout(() => (copyBtn.innerText = "Copy Link"), 2000);
  });
}

/* =====================================================
   ERROR UI
===================================================== */

function renderError(message) {
  hideCard();

  if (verificationStatus) {
    verificationStatus.className = "verify-status error";
    verificationStatus.innerText = "✖ Verification Failed";
  }

  resultDiv.innerHTML = `
    <div class="result error">
      ${message}
    </div>
  `;
}

/* =====================================================
   SUCCESS UI
===================================================== */

function renderSuccess(data, signature = null) {
  resultDiv.innerHTML = "";

  if (verificationStatus) {
    verificationStatus.className = "verify-status success";
    verificationStatus.innerText = "✔ Credential Verified Successfully";
  }

  r_full_name.textContent = safeText(data.full_name);
  r_credential_id.textContent = safeText(data.credential_id);
  r_credential_type.textContent = safeText(data.credential_type);
  r_program_code.textContent = safeText(data.program_code);
  r_issued_by.textContent = safeText(data.issued_by, "Agile AI University");
  r_issue_date.textContent = formatIssueDate(data);

  generateVerificationAssets(data.credential_id, signature);

  resultCard.classList.remove("hidden");
}

/* =====================================================
   SAFE JSON
===================================================== */

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/* =====================================================
   VERIFICATION FLOW
===================================================== */

async function runVerification(credentialId, recaptchaToken, signature = null) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        credential_id: credentialId,
        recaptchaToken,
        signature,
      }),
    });

    if (!response.ok) {
      renderError("Verification service temporarily unavailable.");
      return;
    }

    const data = await safeJson(response);

    if (!data || typeof data.status !== "string") {
      renderError("Verification service temporarily unavailable.");
      return;
    }

    if (data.status === "valid") {
      renderSuccess(data, signature);
    } else if (data.status === "not_found") {
      renderError(`
        <strong>Credential Not Found</strong><br/><br/>
        No matching credential exists in the official registry.
      `);
    } else {
      renderError("Invalid Credential ID or verification failed.");
    }

  } catch (error) {
    console.error("Network error:", error);
    renderError("Verification service temporarily unavailable.");
  } finally {
    resetUI();
  }
}

/* =====================================================
   BUTTON CLICK
===================================================== */

verifyBtn.addEventListener("click", async () => {
  const credentialId = credentialIdInput.value.trim().toUpperCase();
  credentialIdInput.value = credentialId;

  const recaptchaToken =
    typeof grecaptcha !== "undefined" ? grecaptcha.getResponse() : null;

  resultDiv.innerHTML = "";
  hideCard();

  if (!credentialId) {
    renderError("Please enter a Credential ID.");
    return;
  }

  if (!isValidCredentialId(credentialId)) {
    renderError("Invalid Credential ID format. Expected: AAU-XXXXXXXX");
    return;
  }

  if (!recaptchaToken) {
    renderError("Please complete the reCAPTCHA verification.");
    return;
  }

  verifyBtn.disabled = true;
  verifyBtn.innerText = "Verifying…";

  runVerification(credentialId, recaptchaToken);
});

/* =====================================================
   AUTO LOAD FROM URL
===================================================== */

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const id = params.get("id");
  const sig = params.get("sig");

  if (id && isValidCredentialId(id)) {
    credentialIdInput.value = id;

    setTimeout(() => {
      runVerification(id, null, sig);
    }, 300);
  }
});