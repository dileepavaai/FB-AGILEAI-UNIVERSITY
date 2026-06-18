/* =====================================================
Agile AI University
Trainer Certificate Generator Controller

Version: 1.3.0
Phase: Phase-1C

Purpose:
- Search Credential Records
- Load Registry Data
- Populate Read-Only Metadata Fields
- Render Trainer Certificate Preview
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
trainer-certificate-template.html

Cost Model:
- Reuses Existing Cloud Run Endpoint
- No Additional Infrastructure

===================================================== */

import { db }
from "../../../../assets/js/core.js";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

  const trainercertificatePreview =
    document.getElementById("renderTrainerCertificatePreview");

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

  async function searchCredential() {

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

    populateFields(record);

    await renderTrainerCertificatePreview(record);

    if (isCertificateReady(record)) {

    enablePdfButton();

    } else {

    disablePdfButton();

    alert(
        "Credential is not eligible for trainer certificate generation."
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

  async function resolveTrainerContext(record) {

    console.log("Credential Record", record);
    console.log(
    "training_start_date",
    record.training_start_date
    );

    console.log(
      "training_end_date",
      record.training_end_date
    );

    console.log(
      "Full Record",
      JSON.stringify(record, null, 2)
    );
    console.log("Credential Keys", Object.keys(record));
    console.log("Batch ID", record.batch_id);
    console.log("batchId:", record.batchId);
    console.log("batch_name:", record.batch_name);

  try {

    const batchName =
      record.batch_name;

    if (!batchName) {

      console.warn(
        "No batch_name found on credential record"
      );

      return null;

    }

    const batchQuery =
      query(
        collection(db, "batches"),
        where(
          "batch_name",
          "==",
          batchName
        )
      );

    const batchResult =
      await getDocs(batchQuery);

    if (batchResult.empty) {

      console.warn(
        "No batch found for",
        batchName
      );

      return null;

    }

    const batch =
      batchResult.docs[0].data();

    console.log(
      "Batch Data",
      batch
    );

    console.log(
      "Batch Data Full",
      JSON.stringify(batch, null, 2)
    );

    const trainerId =
      batch.trainerId;

    if (!trainerId) {

      console.warn(
        "Batch has no trainerId"
      );

      return null;

    }

    const trainerQuery =
      query(
        collection(
          db,
          "trainerRegistry"
        ),
        where(
          "trainerId",
          "==",
          trainerId
        )
      );

    const trainerResult =
      await getDocs(
        trainerQuery
      );

    if (trainerResult.empty) {

      console.warn(
        "Trainer not found",
        trainerId
      );

      return null;

    }

    const trainer =
      trainerResult.docs[0].data();

    console.log(
      "Trainer Data",
      trainer
    );

let organization = null;

try {

  if (trainer.organizationId) {

    const organizationQuery =
      query(
        collection(
          db,
          "trainingOrganizations"
        ),
        where(
          "organizationId",
          "==",
          trainer.organizationId
        )
      );

    const organizationResult =
      await getDocs(
        organizationQuery
      );

    if (!organizationResult.empty) {

      organization =
        organizationResult.docs[0].data();

      console.log(
        "Organization Data",
        organization
      );

    }

  }

}
catch(error) {

  console.warn(
    "Organization lookup skipped",
    error
  );

}

    return {
      trainer,
      organization
    };

  }
  catch (error) {

    console.error(
      "Trainer Resolution Failed",
      error
    );

    return null;

  }

}

  /* =====================================================
     Trainer Certificate Preview
  ===================================================== */

  async function renderTrainerCertificatePreview(record) {

    if (!trainercertificatePreview) return;

    try {

      const response = await fetch(
        "./template/trainer-certificate-template.html"
      );

      const template =
        await response.text();

        trainercertificatePreview.innerHTML =
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
            "#trainercertLearnerName"
        );

    const pdfCredentialType =
    pdfRenderContainer?.querySelector(
        "#trainercertCredentialType"
    );

    const pdfProgramCode =
    pdfRenderContainer?.querySelector(
        "#trainercertProgramCode"
    );

    const pdfCredentialId =
    pdfRenderContainer?.querySelector(
        "#trainercertCredentialId"
    );

    const pdfIssueDate =
    pdfRenderContainer?.querySelector(
        "#trainercertIssueDate"
    );

    const learnerName =
      trainercertificatePreview.querySelector(
        "#trainercertLearnerName"
      );

    const credentialType =
      trainercertificatePreview.querySelector(
        "#trainercertCredentialType"
      );

    const programCode =
      trainercertificatePreview.querySelector(
        "#trainercertProgramCode"
      );

    const credentialId =
      trainercertificatePreview.querySelector(
        "#trainercertCredentialId"
      );

    const issueDate =
      trainercertificatePreview.querySelector(
        "#trainercertIssueDate"
      );

    const trainerContext =
      await resolveTrainerContext(
        record
      );

    const trainerNameElement =
      trainercertificatePreview.querySelector(
        "#trainercertTrainerName"
      );

    const trainerIdElement =
      trainercertificatePreview.querySelector(
        "#trainercertTrainerId"
      );

    const organizationNameElement =
      trainercertificatePreview.querySelector(
        "#trainercertOrganizationName"
      );

    const organizationEmblemElement =
      trainercertificatePreview.querySelector(
        "#trainercertOrganizationEmblem"
      );

    const pdfTrainerNameElement =
      pdfRenderContainer?.querySelector(
        "#trainercertTrainerName"
      );

    const pdfTrainerIdElement =
      pdfRenderContainer?.querySelector(
        "#trainercertTrainerId"
      );

    const pdfOrganizationNameElement =
      pdfRenderContainer?.querySelector(
        "#trainercertOrganizationName"
      );

    const pdfOrganizationEmblemElement =
      pdfRenderContainer?.querySelector(
        "#trainercertOrganizationEmblem"
      );

    const programNameElement =
      trainercertificatePreview.querySelector(
        "#trainercertProgramName"
      );

    const trainingPeriodElement =
      trainercertificatePreview.querySelector(
        "#trainercertTrainingPeriod"
      );

    const pdfProgramNameElement =
      pdfRenderContainer?.querySelector(
        "#trainercertProgramName"
      );

    const pdfTrainingPeriodElement =
      pdfRenderContainer?.querySelector(
        "#trainercertTrainingPeriod"
      );

      if (trainerContext) {

        console.log(
          "trainerNameElement",
          trainerNameElement
        );

        console.log(
          "trainerIdElement",
          trainerIdElement
        );

        console.log(
          "organizationNameElement",
          organizationNameElement
        );

        console.log(
          "Trainer Context",
          trainerContext
        );

        const {
          trainer,
          organization
        } = trainerContext;

        if (trainerNameElement) {
          trainerNameElement.textContent =
            trainer?.trainerName || "-";
        }

        if (pdfTrainerNameElement) {
          pdfTrainerNameElement.textContent =
            trainer?.trainerName || "-";
        }

        if (trainerIdElement) {
          trainerIdElement.textContent =
            trainer?.trainerId || "-";
        }

        if (pdfTrainerIdElement) {
          pdfTrainerIdElement.textContent =
            trainer?.trainerId || "-";
        }

        if (organizationNameElement) {
          organizationNameElement.textContent =
            organization?.organizationName || "-";
        }

        if (pdfOrganizationNameElement) {
          pdfOrganizationNameElement.textContent =
            organization?.organizationName || "-";
        }

        /* ==========================================
            Training Program
          ========================================== */

          const trainingProgramName =
            record.program_name ||
            record.program_code ||
            "-";

          if (programNameElement) {

            programNameElement.textContent =
              trainingProgramName;

          }

          if (pdfProgramNameElement) {

            pdfProgramNameElement.textContent =
              trainingProgramName;

          }

          /* ==========================================
            Training Period
          ========================================== */

          let trainingPeriod = "-";

          if (
            record.training_start_date &&
            record.training_end_date
          ) {

            trainingPeriod =
              `${record.training_start_date} - ${record.training_end_date}`;

          }

          if (trainingPeriodElement) {

            trainingPeriodElement.textContent =
              trainingPeriod;

          }

          if (pdfTrainingPeriodElement) {

            pdfTrainingPeriodElement.textContent =
              trainingPeriod;

          }

        /*
        =====================================================
        Organization Emblem Rendering

        Temporary CORS Mitigation

        Purpose:
        Use locally hosted emblem assets instead of
        Firebase Storage URLs until CORS configuration
        is fully operational.

        Governance:
        Trainer Certificate Display Standard v1.1

        Future:
        May revert to organization.emblemUrl once
        cross-origin image rendering is approved.
        =====================================================
        */

        const organizationEmblemPath = 
            "/credential-operations/credential-generator/assets/images/organizations/agile-ai-academy.png";

        if (organizationEmblemElement) {

          organizationEmblemElement.src =
            organizationEmblemPath;

          organizationEmblemElement.style.display =
            "block";

        }

        if (pdfOrganizationEmblemElement) {

          pdfOrganizationEmblemElement.src =
            organizationEmblemPath;

          pdfOrganizationEmblemElement.style.display =
            "block";

        }

      }

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
   Trainer Certificate Readiness Validation

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

  if (trainercertificatePreview) {

    trainercertificatePreview.innerHTML = `
      <div>
        <h3>Preview Placeholder</h3>
        <p>
          Trainer certificate preview will appear here after
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

    if (trainercertificatePreview) {

        trainercertificatePreview.innerHTML = `
        <div>
            <h3>Preview Placeholder</h3>
            <p>
            Trainer certificate preview will appear here after
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
      typeof window.generateTrainerCertificatePdf ===
      "function"
    ) {

      await window.generateTrainerCertificatePdf();

    }

  }
);

    loadRegistry();
    disablePdfButton();

  console.log(
    "Trainer Certificate Generator Controller v1.3.0 loaded"
  );

});

function disablePdfButton() {

  const generatePdfBtn =
    document.getElementById("generatePdfBtn");

  if (!generatePdfBtn) return;

  generatePdfBtn.disabled = true;

  generatePdfBtn.classList.add(
    "tcg-btn-disabled"
  );

}

function enablePdfButton() {

  const generatePdfBtn =
    document.getElementById("generatePdfBtn");

  if (!generatePdfBtn) return;

  generatePdfBtn.disabled = false;

  generatePdfBtn.classList.remove(
    "tcg-btn-disabled"
  );

}