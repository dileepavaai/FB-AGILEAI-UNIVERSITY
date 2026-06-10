/* =====================================================
Agile AI University
Badge Generator Controller

Version: 1.3.0
Phase: Phase-1C

Purpose:
- Search Credential Records
- Load Registry Data
- Populate Read-Only Metadata Fields
- Render Badge Preview
- Apply Recognition Display Governance

Governance:
- Read Only
- No Registry Writes
- No Badge Generation
- No PDF Generation
- AOP → AIPA Recognition Display Enforcement

Data Source:
Existing Credential Registry API

Template Authority:
badge-template.html

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

  const generatePngBtn =
    document.getElementById("generatePngBtn");

  /* =====================================================
     Preview Container
  ===================================================== */

  const badgePreview = document.getElementById(
        "badgePreview"
    );

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
        "Badge Generator Registry Loaded:",
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

    populateFields(record);

    renderBadgePreview(record);

    if (isBadgeReady(record)) {

    enablePngButton();

    } else {

    disablePngButton();

    alert(
        "Credential is not eligible for badge generation."
    );

    }

  }

  /* =====================================================
     Populate UI
  ===================================================== */

  function populateFields(record) {

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
   Badge Preview
===================================================== */

async function renderBadgePreview(record) {

  if (!badgePreview) return;

  try {

    const response = await fetch(
      "./template/badge-template.html"
    );

    const template =
      await response.text();

    /* =====================================
       Main Preview
    ===================================== */

    badgePreview.innerHTML =
      template;

    /* =====================================
       PNG Render Surface
    ===================================== */

    const pngRenderContainer =
      document.getElementById(
        "pngRenderContainer"
      );

    if (pngRenderContainer) {

      pngRenderContainer.innerHTML =
        template;

    }

    /* =====================================
       Badge Preview Elements
    ===================================== */

    const badgeCredentialTitle =
      badgePreview.querySelector(
        "#badgeCredentialTitle"
      );

    const badgeCredentialCode =
      badgePreview.querySelector(
        "#badgeCredentialCode"
      );

    const badgeCredentialId =
      badgePreview.querySelector(
        "#badgeCredentialId"
      );

    /* =====================================
       PNG Preview Elements
    ===================================== */

    const pngBadgeCredentialTitle =
      pngRenderContainer?.querySelector(
        "#badgeCredentialTitle"
      );

    const pngBadgeCredentialCode =
      pngRenderContainer?.querySelector(
        "#badgeCredentialCode"
      );

    const pngBadgeCredentialId =
      pngRenderContainer?.querySelector(
        "#badgeCredentialId"
      );

    /* =====================================
       Populate Badge Preview
    ===================================== */

    if (badgeCredentialTitle) {

      badgeCredentialTitle.innerHTML =
        getDisplayCredentialTitle(record);

    }

    if (badgeCredentialCode) {

      badgeCredentialCode.textContent =
        record.program_code || "-";

    }

    if (badgeCredentialId) {

      badgeCredentialId.textContent =
        record.credential_id || "-";

    }

    /* =====================================
       Populate PNG Surface
    ===================================== */

    if (pngBadgeCredentialTitle) {

      pngBadgeCredentialTitle.innerHTML =
        getDisplayCredentialTitle(record);

    }

    if (pngBadgeCredentialCode) {

      pngBadgeCredentialCode.textContent =
        record.program_code || "-";

    }

    if (pngBadgeCredentialId) {

      pngBadgeCredentialId.textContent =
        record.credential_id || "-";

    }

  } catch (error) {

    console.error(
      "Badge Preview Error:",
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
   Badge Readiness Validation

   Governance Lock:
   June 2026

   Requirements:

   - Credential ID required
   - Learner Name required
   - Credential Type required
   - Program Code required
   - Status must equal finalized

   Badge generation is prohibited
   if validation fails.

===================================================== */

function isBadgeReady(record) {

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

  /* =====================================================
     Reset
  ===================================================== */

  function clearForm() {

    credentialIdInput.value = "";
    learnerNameInput.value = "";
    emailInput.value = "";

    disablePngButton();

    }

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

generatePngBtn?.addEventListener(
  "click",
  async () => {

    if (
      typeof window.generateBadgePng ===
      "function"
    ) {

      await window.generateBadgePng();

    }

  }
);

    loadRegistry();
    disablePngButton();

  console.log(
    "Badge Generator Controller v1.3.0 loaded"
  );

});

function disablePngButton() {

  const generatePngBtn =
    document.getElementById("generatePngBtn");

  if (!generatePngBtn) return;

  generatePngBtn.disabled = true;

  generatePngBtn.classList.add(
    "cg-btn-disabled"
  );

}

function enablePngButton() {

  const generatePngBtn =
    document.getElementById("generatePngBtn");

  if (!generatePngBtn) return;

  generatePngBtn.disabled = false;

  generatePngBtn.classList.remove(
    "cg-btn-disabled"
  );

}