/* =====================================================
Agile AI University
Certificate Generator Controller

Version: 1.3.0
Phase: Phase-1C

Purpose:
- Search Credential Records
- Load Registry Data
- Populate Read-Only Metadata Fields
- Render Certificate Preview
- Apply Recognition Display Governance

Governance:
- Read Only
- No Registry Writes
- No Certificate Generation
- No PDF Generation
- AOP → AIPA Recognition Display Enforcement

Data Source:
Existing Credential Registry API

Template Authority:
certificate-template.html

Cost Model:
- Reuses Existing Cloud Run Endpoint
- No Additional Infrastructure

===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     Registry API
  ===================================================== */

  const REGISTRY_API =
    "https://aau-credential-verify-458881040066.asia-south1.run.app/admin/credential-registry";

  let credentialData = [];
  let loadedCredential = null;

  /* =====================================================
     Search Controls
  ===================================================== */

  const credentialIdInput =
    document.getElementById("searchCredentialId");

  const learnerNameInput =
    document.getElementById("searchLearnerName");

  const emailInput =
    document.getElementById("searchEmail");

  const searchBtn =
    document.getElementById("searchCredentialBtn");

  const clearBtn =
    document.getElementById("clearSearchBtn");

  const generatePdfBtn =
    document.getElementById("generatePdfBtn");

  /* =====================================================
     Preview Container
  ===================================================== */

  const certificatePreview =
    document.getElementById("certificatePreview");

  /* =====================================================
     Field Mapping
  ===================================================== */

  const credentialIdValue =
    document.getElementById("credentialIdValue");

  const credentialTypeValue =
    document.getElementById("credentialTypeValue");

  const credentialFamilyValue =
    document.getElementById("credentialFamilyValue");

  const programCodeValue =
    document.getElementById("programCodeValue");

  const programNameValue =
    document.getElementById("programNameValue");

  const templateKeyValue =
    document.getElementById("templateKeyValue");

  const issueDateValue =
    document.getElementById("issueDateValue");

  const credentialStatusValue =
    document.getElementById("credentialStatusValue");

  /* =====================================================
     Lifecycle
  ===================================================== */

  const lifecycleStateValue =
    document.getElementById("lifecycleStateValue");

  const successorProgramValue =
    document.getElementById("successorProgramValue");

  const bridgeRequiredValue =
    document.getElementById("bridgeRequiredValue");

  const bridgeCompletionStatusValue =
    document.getElementById("bridgeCompletionStatusValue");

  /* =====================================================
     Recognition
  ===================================================== */

  const originalCredentialValue =
    document.getElementById("originalCredentialValue");

  const currentRecognitionValue =
    document.getElementById("currentRecognitionValue");

  const recognitionStatusValue =
    document.getElementById("recognitionStatusValue");

  const recognitionEffectiveDateValue =
    document.getElementById("recognitionEffectiveDateValue");

  /* =====================================================
     Load Registry
  ===================================================== */

  async function loadRegistry() {

    try {

      const response = await fetch(
        REGISTRY_API,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = await response.json();

      if (
        data.status !== "success" ||
        !Array.isArray(data.credentials)
      ) {
        throw new Error("Invalid registry response");
      }

      credentialData = data.credentials;

      console.log(
        "Certificate Generator Registry Loaded:",
        credentialData.length
      );

    } catch (error) {

      console.error(
        "Registry Load Failed:",
        error
      );

    }

  }

  /* =====================================================
   Search State Invalidation
===================================================== */

function invalidateLoadedCredentialState() {

  if (!loadedCredential) {
    return;
  }

  resetLoadedCredentialState();

}

  /* =====================================================
     Search
  ===================================================== */

  function searchCredential() {

    const credentialId =
      credentialIdInput?.value.trim().toLowerCase() || "";

    const learnerName =
      learnerNameInput?.value.trim().toLowerCase() || "";

    const email =
      emailInput?.value.trim().toLowerCase() || "";

    const record = credentialData.find(item => {

      const credentialMatch =
        !credentialId ||
        (item.credential_id || "")
          .toLowerCase()
          .includes(credentialId);

      const nameMatch =
        !learnerName ||
        (item.full_name || "")
          .toLowerCase()
          .includes(learnerName);

      const emailMatch =
        !email ||
        (item.email || "")
          .toLowerCase()
          .includes(email);

      return (
        credentialMatch &&
        nameMatch &&
        emailMatch
      );

    });

    if (!record) {

      alert("No matching credential found.");

      return;
    }

    loadedCredential = record;

    window.loadedCredential = record;

    populateFields(record);

    renderCertificatePreview(record);

    if (isCertificateReady(record)) {

    enablePdfButton();

    } else {

    disablePdfButton();

    alert(
        "Credential is not eligible for certificate generation."
    );

    }

  }

  /* =====================================================
     Populate UI
    ===================================================== */

  function populateFields(record) {

  console.log(
  "CERTIFICATE GENERATOR RECORD",
  record
  );

  credentialIdValue.textContent =
  record.credential_id || "-";

  credentialTypeValue.textContent =
  record.credential_type || "-";

  credentialFamilyValue.textContent =
  record.credential_family || "-";

  programCodeValue.textContent =
  record.program_code || "-";

  programNameValue.textContent =
  record.program_name || "-";

  templateKeyValue.textContent =
  record.template_key || "-";

  credentialStatusValue.textContent =
  record.issued_status || "-";

  issueDateValue.textContent =
  formatDate(record.imported_at);

  lifecycleStateValue.textContent =
  record.lifecycle_state || "-";

  successorProgramValue.textContent =
  record.successor_program || "-";

  bridgeRequiredValue.textContent =
  record.bridge_required || "-";

  bridgeCompletionStatusValue.textContent =
  record.bridge_completion_status || "-";

  originalCredentialValue.textContent =
  record.original_credential || "-";

  currentRecognitionValue.textContent =
  record.current_recognition || "-";

  recognitionStatusValue.textContent =
  record.recognition_status || "-";

  recognitionEffectiveDateValue.textContent =
  record.recognition_effective_date || "-";

  }

  /* =====================================================
     Certificate Preview
  ===================================================== */

  async function renderCertificatePreview(record) {

    if (!certificatePreview) return;

    try {

      const response = await fetch(
        "./template/certificate-template.html"
      );

      const template =
        await response.text();

        certificatePreview.innerHTML =
        template;

        const pdfRenderContainer =
        document.getElementById(
            "pdfRenderContainer"
        );

        if (pdfRenderContainer) {

        pdfRenderContainer.innerHTML =
            template;

        }

      const pdfLearnerName =
        pdfRenderContainer?.querySelector(
            "#certLearnerName"
        );

    const pdfCredentialType =
    pdfRenderContainer?.querySelector(
        "#certCredentialType"
    );

    const pdfProgramCode =
    pdfRenderContainer?.querySelector(
        "#certProgramCode"
    );

    const pdfCredentialId =
    pdfRenderContainer?.querySelector(
        "#certCredentialId"
    );

    const pdfIssueDate =
    pdfRenderContainer?.querySelector(
        "#certIssueDate"
    );

      const learnerName =
        certificatePreview.querySelector(
          "#certLearnerName"
        );

      const credentialType =
        certificatePreview.querySelector(
          "#certCredentialType"
        );

      const programCode =
        certificatePreview.querySelector(
          "#certProgramCode"
        );

      const credentialId =
        certificatePreview.querySelector(
          "#certCredentialId"
        );

      const issueDate =
        certificatePreview.querySelector(
          "#certIssueDate"
        );

      if (learnerName) {
        learnerName.textContent =
            record.full_name || "-";
        }

        if (pdfLearnerName) {
        pdfLearnerName.textContent =
            record.full_name || "-";
        }

      if (credentialType) {
        credentialType.textContent =
            getDisplayCredentialTitle(record);
        }

        if (pdfCredentialType) {
        pdfCredentialType.textContent =
            getDisplayCredentialTitle(record);
        }

      if (programCode) {
        programCode.textContent =
          record.program_code || "-";
      }

      if (pdfProgramCode) {
        pdfProgramCode.textContent =
            record.program_code || "-";
        }

      if (credentialId) {
        credentialId.textContent =
            record.credential_id || "-";
        }

        if (pdfCredentialId) {
        pdfCredentialId.textContent =
            record.credential_id || "-";
        }

      if (issueDate) {
        issueDate.textContent =
            formatDate(record.imported_at);
        }

        if (pdfIssueDate) {
        pdfIssueDate.textContent =
            formatDate(record.imported_at);
        }

    } catch (error) {

      console.error(
        "Certificate Preview Error:",
        error
      );

    }

  }

  /* =====================================================
        Recognition Display Governance
    ===================================================== */

function getDisplayCredentialTitle(record) {

  if (record.program_code === "AOP") {

    return (
      "Artificial Intelligence Professional Agilist (AIPA)"
    );

  }

  return (
    record.current_recognition ||
    record.credential_type ||
    "-"
  );

}

/* =====================================================
   Certificate Readiness Validation

   Governance Lock:
   June 2026

   Requirements:

   - Credential ID required
   - Learner Name required
   - Credential Type required
   - Program Code required
   - Status must equal finalized

   Certificate generation is prohibited
   if validation fails.

===================================================== */

function isCertificateReady(record) {

  if (!record) return false;

  if (!record.credential_id) return false;

  if (!record.full_name) return false;

  if (!record.credential_type) return false;

  if (!record.program_code) return false;

  if (
    (record.issued_status || "")
      .toLowerCase() !== "finalized"
  ) {
    return false;
  }

  return true;

}

  /* =====================================================
     Format Date
  ===================================================== */

  function formatDate(timestamp) {

    if (!timestamp?._seconds) {
      return "-";
    }

    return new Date(
      timestamp._seconds * 1000
    ).toLocaleDateString();

  }

  function resetLoadedCredentialState() {

  loadedCredential = null;

  credentialIdValue.textContent = "Not Loaded";
  credentialTypeValue.textContent = "Not Loaded";
  credentialFamilyValue.textContent = "Not Loaded";
  programCodeValue.textContent = "Not Loaded";
  programNameValue.textContent = "Not Loaded";
  templateKeyValue.textContent = "Not Loaded";
  issueDateValue.textContent = "Not Loaded";
  credentialStatusValue.textContent = "Not Loaded";

  lifecycleStateValue.textContent = "Not Loaded";
  successorProgramValue.textContent = "Not Loaded";
  bridgeRequiredValue.textContent = "Not Loaded";
  bridgeCompletionStatusValue.textContent = "Not Loaded";

  originalCredentialValue.textContent = "Not Loaded";
  currentRecognitionValue.textContent = "Not Loaded";
  recognitionStatusValue.textContent = "Not Loaded";
  recognitionEffectiveDateValue.textContent = "Not Loaded";

  if (certificatePreview) {

    certificatePreview.innerHTML = `
      <div>
        <h3>Preview Placeholder</h3>
        <p>
          Certificate preview will appear here after
          credential loading and rendering services
          are implemented.
        </p>
      </div>
    `;

  }

  const pdfRenderContainer =
    document.getElementById(
      "pdfRenderContainer"
    );

  if (pdfRenderContainer) {
    pdfRenderContainer.innerHTML = "";
  }

  disablePdfButton();

}

  /* =====================================================
    Reset
    ===================================================== */

    function clearForm() {
    
    console.log("CLEAR STARTED");
    console.log("RESETTING METADATA");

    credentialIdInput.value = "";
    learnerNameInput.value = "";
    emailInput.value = "";

    console.log("RESETTING PREVIEW");

    /* ==========================================
        Reset Metadata
    ========================================== */

    credentialIdValue.textContent = "Not Loaded";
    credentialTypeValue.textContent = "Not Loaded";
    credentialFamilyValue.textContent = "Not Loaded";
    programCodeValue.textContent = "Not Loaded";
    programNameValue.textContent = "Not Loaded";
    templateKeyValue.textContent = "Not Loaded";
    issueDateValue.textContent = "Not Loaded";
    credentialStatusValue.textContent = "Not Loaded";

    lifecycleStateValue.textContent = "Not Loaded";
    successorProgramValue.textContent = "Not Loaded";
    bridgeRequiredValue.textContent = "Not Loaded";
    bridgeCompletionStatusValue.textContent = "Not Loaded";

    originalCredentialValue.textContent = "Not Loaded";
    currentRecognitionValue.textContent = "Not Loaded";
    recognitionStatusValue.textContent = "Not Loaded";
    recognitionEffectiveDateValue.textContent = "Not Loaded";

    console.log("RESETTING PREVIEW");

    /* ==========================================
        Reset Preview
    ========================================== */

    if (certificatePreview) {

        certificatePreview.innerHTML = `
        <div>
            <h3>Preview Placeholder</h3>
            <p>
            Certificate preview will appear here after
            credential loading and rendering services
            are implemented.
            </p>
        </div>
        `;

    }

    /* ==========================================
        Clear Hidden PDF Surface
    ========================================== */

    const pdfRenderContainer =
        document.getElementById(
        "pdfRenderContainer"
        );

    if (pdfRenderContainer) {

        pdfRenderContainer.innerHTML = "";

    }

    console.log("CLEAR COMPLETED");

    disablePdfButton();

}

credentialIdInput?.addEventListener(
  "input",
  invalidateLoadedCredentialState
);

learnerNameInput?.addEventListener(
  "input",
  invalidateLoadedCredentialState
);

emailInput?.addEventListener(
  "input",
  invalidateLoadedCredentialState
);

  /* =====================================================
    Events
    ===================================================== */

searchBtn?.addEventListener(
  "click",
  searchCredential
);

clearBtn?.addEventListener(
  "click",
  clearForm
);

generatePdfBtn?.addEventListener(
  "click",
  async () => {

    if (
      typeof window.generateCertificatePdf ===
      "function"
    ) {

      await window.generateCertificatePdf();

    }

  }
);

    loadRegistry();
    disablePdfButton();

  console.log(
    "Certificate Generator Controller v1.3.0 loaded"
  );

});

function disablePdfButton() {

  const generatePdfBtn =
    document.getElementById("generatePdfBtn");

  if (!generatePdfBtn) return;

  generatePdfBtn.disabled = true;

  generatePdfBtn.classList.add(
    "cg-btn-disabled"
  );

}

function enablePdfButton() {

  const generatePdfBtn =
    document.getElementById("generatePdfBtn");

  if (!generatePdfBtn) return;

  generatePdfBtn.disabled = false;

  generatePdfBtn.classList.remove(
    "cg-btn-disabled"
  );

}