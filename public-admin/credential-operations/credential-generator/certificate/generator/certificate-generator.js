/* =====================================================
Agile AI University
Certificate Generator Controller

v1.4.3
- Adds authoritative programme title resolution for certificate display
- Displays “Agile Outcome Practitioner (AOP)” for legacy AOP credentials
- Preserves programme codes while rendering human-readable certificate titles
- Prevents certificate titles from depending on incomplete registry programme_name fields

Purpose:
- Search Credential Records
- Load Registry Data
- Populate Read-Only Metadata Fields
- Render Certificate Preview
- Apply Credential-Accurate Display Governance
- Expose Selected Credential for Admin Asset Publishing

Governance:
- Read Only
- No Registry Writes
- No Certificate Generation
- No PDF Generation
- Credential-Accurate Display Enforcement
- Student Portal Does Not Generate Assets

Data Source:
Existing Credential Registry API

Template Authority:
certificate-template.html

Change History:

v1.4.2
- Removes legacy AOP → AIPA certificate title override
- Renders the authoritative credential programme from the credential registry
- Ensures certificate previews reflect the actual credential being generated
- Aligns certificate generation with producer–consumer architecture
- Prevents upgrade and recognition logic from affecting certificate rendering

v1.4.1
- Supports dynamically loaded Admin modules
- Initializes immediately when DOM is already ready
- Prevents duplicate controller initialization
- Adds registry loading and search diagnostics
- Preserves existing search and preview behaviour

===================================================== */

(function (window, document) {

  "use strict";

  const REGISTRY_API =
    "https://aau-credential-verify-458881040066.asia-south1.run.app/admin/credential-registry";

  let initialized = false;

  function initializeCertificateGenerator() {

    if (initialized) {

      console.info(
        "[CertificateGenerator] Initialization already completed."
      );

      return;

    }

    initialized = true;

    let credentialData = [];
    let loadedCredential = null;
    let registryLoaded = false;
    let registryLoading = false;

    /* =====================================================
       DOM REFERENCES
    ===================================================== */

    const credentialIdInput =
      document.getElementById(
        "searchCredentialId"
      );

    const learnerNameInput =
      document.getElementById(
        "searchLearnerName"
      );

    const emailInput =
      document.getElementById(
        "searchEmail"
      );

    const searchBtn =
      document.getElementById(
        "searchCredentialBtn"
      );

    const clearBtn =
      document.getElementById(
        "clearSearchBtn"
      );

    const generatePdfBtn =
      document.getElementById(
        "generatePdfBtn"
      );

    const certificatePreview =
      document.getElementById(
        "certificatePreview"
      );

    const credentialIdValue =
      document.getElementById(
        "credentialIdValue"
      );

    const credentialTypeValue =
      document.getElementById(
        "credentialTypeValue"
      );

    const credentialFamilyValue =
      document.getElementById(
        "credentialFamilyValue"
      );

    const programCodeValue =
      document.getElementById(
        "programCodeValue"
      );

    const programNameValue =
      document.getElementById(
        "programNameValue"
      );

    const templateKeyValue =
      document.getElementById(
        "templateKeyValue"
      );

    const issueDateValue =
      document.getElementById(
        "issueDateValue"
      );

    const credentialStatusValue =
      document.getElementById(
        "credentialStatusValue"
      );

    const lifecycleStateValue =
      document.getElementById(
        "lifecycleStateValue"
      );

    const successorProgramValue =
      document.getElementById(
        "successorProgramValue"
      );

    const bridgeRequiredValue =
      document.getElementById(
        "bridgeRequiredValue"
      );

    const bridgeCompletionStatusValue =
      document.getElementById(
        "bridgeCompletionStatusValue"
      );

    const originalCredentialValue =
      document.getElementById(
        "originalCredentialValue"
      );

    const currentRecognitionValue =
      document.getElementById(
        "currentRecognitionValue"
      );

    const recognitionStatusValue =
      document.getElementById(
        "recognitionStatusValue"
      );

    const recognitionEffectiveDateValue =
      document.getElementById(
        "recognitionEffectiveDateValue"
      );

    /* =====================================================
       DOM VALIDATION
    ===================================================== */

    const missingRequiredElements = [];

    if (!credentialIdInput) {
      missingRequiredElements.push(
        "searchCredentialId"
      );
    }

    if (!learnerNameInput) {
      missingRequiredElements.push(
        "searchLearnerName"
      );
    }

    if (!emailInput) {
      missingRequiredElements.push(
        "searchEmail"
      );
    }

    if (!searchBtn) {
      missingRequiredElements.push(
        "searchCredentialBtn"
      );
    }

    if (!clearBtn) {
      missingRequiredElements.push(
        "clearSearchBtn"
      );
    }

    if (!generatePdfBtn) {
      missingRequiredElements.push(
        "generatePdfBtn"
      );
    }

    if (missingRequiredElements.length > 0) {

      console.error(
        "[CertificateGenerator] Required DOM elements are missing:",
        missingRequiredElements
      );

      initialized = false;

      return;

    }

    /* =====================================================
       REGISTRY
    ===================================================== */

    async function loadRegistry() {

      if (registryLoading) {
        return;
      }

      registryLoading = true;
      registryLoaded = false;

      setSearchButtonLoading(
        true
      );

      console.info(
        "[CertificateGenerator] Registry loading started."
      );

      try {

        const response =
          await fetch(
            REGISTRY_API,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              cache: "no-store"
            }
          );

        if (!response.ok) {

          throw new Error(
            `Registry request failed with HTTP ${response.status}.`
          );

        }

        const data =
          await response.json();

        if (
          data.status !== "success" ||
          !Array.isArray(
            data.credentials
          )
        ) {

          throw new Error(
            "Invalid registry response."
          );

        }

        credentialData =
          data.credentials;

        registryLoaded =
          true;

        console.info(
          "[CertificateGenerator] Registry loaded:",
          {
            count:
              credentialData.length
          }
        );

      }
      catch (error) {

        credentialData =
          [];

        registryLoaded =
          false;

        console.error(
          "[CertificateGenerator] Registry load failed:",
          error
        );

        window.alert(
          "Credential Registry could not be loaded. Please refresh the page and try again."
        );

      }
      finally {

        registryLoading =
          false;

        setSearchButtonLoading(
          false
        );

      }

    }

    /* =====================================================
       SEARCH
    ===================================================== */

    function searchCredential() {

      console.info(
        "[CertificateGenerator] Search started."
      );

      if (registryLoading) {

        window.alert(
          "Credential Registry is still loading. Please wait a moment and try again."
        );

        return;

      }

      if (!registryLoaded) {

        console.warn(
          "[CertificateGenerator] Search blocked because registry is unavailable."
        );

        window.alert(
          "Credential Registry is not available. Please refresh the page and try again."
        );

        return;

      }

      const credentialId =
        normalizeSearchValue(
          credentialIdInput.value
        );

      const learnerName =
        normalizeSearchValue(
          learnerNameInput.value
        );

      const email =
        normalizeSearchValue(
          emailInput.value
        );

      console.info(
        "[CertificateGenerator] Search criteria:",
        {
          credentialId,
          learnerName,
          email
        }
      );

      if (
        !credentialId &&
        !learnerName &&
        !email
      ) {

        window.alert(
          "Enter a Credential ID, Learner Name, or Email Address."
        );

        return;

      }

      const record =
        credentialData.find(
          (item) => {

            const recordCredentialId =
              normalizeSearchValue(
                item?.credential_id
              );

            const recordLearnerName =
              normalizeSearchValue(
                item?.full_name
              );

            const recordEmail =
              normalizeSearchValue(
                item?.email
              );

            const credentialMatch =
              !credentialId ||
              recordCredentialId.includes(
                credentialId
              );

            const nameMatch =
              !learnerName ||
              recordLearnerName.includes(
                learnerName
              );

            const emailMatch =
              !email ||
              recordEmail.includes(
                email
              );

            return (
              credentialMatch &&
              nameMatch &&
              emailMatch
            );

          }
        );

      if (!record) {

        console.warn(
          "[CertificateGenerator] No matching credential found:",
          {
            credentialId,
            learnerName,
            email
          }
        );

        resetLoadedCredentialState();

        window.alert(
          "No matching credential found."
        );

        return;

      }

      loadedCredential =
        record;

      window.loadedCredential =
        record;

      console.info(
        "[CertificateGenerator] Credential found:",
        {
          credentialId:
            record.credential_id || "",
          learnerName:
            record.full_name || "",
          email:
            record.email || ""
        }
      );

      populateFields(
        record
      );

      renderCertificatePreview(
        record
      );

      if (
        isCertificateReady(
          record
        )
      ) {

        enablePdfButton();

      }
      else {

        disablePdfButton();

        window.alert(
          "Credential is not eligible for certificate generation."
        );

      }

    }

    /* =====================================================
       LOADED STATE
    ===================================================== */

    function invalidateLoadedCredentialState() {

      if (!loadedCredential) {
        return;
      }

      resetLoadedCredentialState();

    }

    function resetLoadedCredentialState() {

      loadedCredential =
        null;

      window.loadedCredential =
        null;

      setText(
        credentialIdValue,
        "Not Loaded"
      );

      setText(
        credentialTypeValue,
        "Not Loaded"
      );

      setText(
        credentialFamilyValue,
        "Not Loaded"
      );

      setText(
        programCodeValue,
        "Not Loaded"
      );

      setText(
        programNameValue,
        "Not Loaded"
      );

      setText(
        templateKeyValue,
        "Not Loaded"
      );

      setText(
        issueDateValue,
        "Not Loaded"
      );

      setText(
        credentialStatusValue,
        "Not Loaded"
      );

      setText(
        lifecycleStateValue,
        "Not Loaded"
      );

      setText(
        successorProgramValue,
        "Not Loaded"
      );

      setText(
        bridgeRequiredValue,
        "Not Loaded"
      );

      setText(
        bridgeCompletionStatusValue,
        "Not Loaded"
      );

      setText(
        originalCredentialValue,
        "Not Loaded"
      );

      setText(
        currentRecognitionValue,
        "Not Loaded"
      );

      setText(
        recognitionStatusValue,
        "Not Loaded"
      );

      setText(
        recognitionEffectiveDateValue,
        "Not Loaded"
      );

      if (certificatePreview) {

        certificatePreview.innerHTML = `

          <div>

            <h3>

              Preview Placeholder

            </h3>

            <p>

              Certificate preview will appear here after
              a credential is loaded.

            </p>

          </div>

        `;

      }

      const pdfRenderContainer =
        document.getElementById(
          "pdfRenderContainer"
        );

      if (pdfRenderContainer) {

        pdfRenderContainer.innerHTML =
          "";

      }

      disablePdfButton();

    }

    /* =====================================================
       POPULATE METADATA
    ===================================================== */

    function populateFields(record) {

      console.info(
        "[CertificateGenerator] Populating credential fields:",
        record
      );

      setText(
        credentialIdValue,
        record.credential_id || "-"
      );

      setText(
        credentialTypeValue,
        record.credential_type || "-"
      );

      setText(
        credentialFamilyValue,
        record.credential_family || "-"
      );

      setText(
        programCodeValue,
        record.program_code || "-"
      );

      setText(
        programNameValue,
        record.program_name || "-"
      );

      setText(
        templateKeyValue,
        record.template_key || "-"
      );

      setText(
        credentialStatusValue,
        record.issued_status || "-"
      );

      setText(
        issueDateValue,
        formatDate(
          record.imported_at
        )
      );

      setText(
        lifecycleStateValue,
        record.lifecycle_state || "-"
      );

      setText(
        successorProgramValue,
        record.successor_program || "-"
      );

      setText(
        bridgeRequiredValue,
        record.bridge_required || "-"
      );

      setText(
        bridgeCompletionStatusValue,
        record.bridge_completion_status || "-"
      );

      setText(
        originalCredentialValue,
        record.original_credential || "-"
      );

      setText(
        currentRecognitionValue,
        record.current_recognition || "-"
      );

      setText(
        recognitionStatusValue,
        record.recognition_status || "-"
      );

      setText(
        recognitionEffectiveDateValue,
        formatDisplayValue(
          record.recognition_effective_date
        )
      );

    }

    /* =====================================================
       CERTIFICATE PREVIEW
    ===================================================== */

    async function renderCertificatePreview(record) {

      if (!certificatePreview) {
        return;
      }

      try {

        const response =
          await fetch(
            "./template/certificate-template.html",
            {
              cache: "no-store"
            }
          );

        if (!response.ok) {

          throw new Error(
            `Certificate template request failed with HTTP ${response.status}.`
          );

        }

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

        populateCertificateTemplate(
          certificatePreview,
          record
        );

        if (pdfRenderContainer) {

          populateCertificateTemplate(
            pdfRenderContainer,
            record
          );

        }

        console.info(
          "[CertificateGenerator] Certificate preview rendered."
        );

      }
      catch (error) {

        console.error(
          "[CertificateGenerator] Certificate preview failed:",
          error
        );

        certificatePreview.innerHTML = `

          <div>

            <h3>

              Certificate preview unavailable

            </h3>

            <p>

              The certificate template could not be loaded.

            </p>

          </div>

        `;

      }

    }

    function populateCertificateTemplate(
      container,
      record
    ) {

      if (!container) {
        return;
      }

      setTemplateText(
        container,
        "#certLearnerName",
        record.full_name || "-"
      );

      setTemplateText(
        container,
        "#certCredentialType",
        getDisplayCredentialTitle(
          record
        )
      );

      setTemplateText(
        container,
        "#certProgramCode",
        record.program_code || "-"
      );

      setTemplateText(
        container,
        "#certCredentialId",
        record.credential_id || "-"
      );

      setTemplateText(
        container,
        "#certIssueDate",
        formatDate(
          record.imported_at
        )
      );

    }

    /* =====================================================
       GOVERNANCE
    ===================================================== */

    function getDisplayCredentialTitle(record) {

      if (!record) {
        return "-";
      }

      const programCode =
        String(
          record.program_code ||
          record.credential_type ||
          ""
        )
          .trim()
          .toUpperCase();

      const programTitles = {

        AOP:
          "Agile Outcome Practitioner (AOP)",

        AIPA:
          "Artificial Intelligence Professional Agilist (AIPA)",

        AAIA:
          "Agile AI Master Agilist (AAIA)",

        AAIP:
          "Agentic AI Professional (AAIP)",

        AIAL:
          "Agile AI Leadership (AIAL)"

      };

      return (
        programTitles[programCode] ||
        record.program_name ||
        record.credential_type ||
        record.program_code ||
        "-"
      );

    }

    function isCertificateReady(record) {

      if (!record) {
        return false;
      }

      if (!record.credential_id) {
        return false;
      }

      if (!record.full_name) {
        return false;
      }

      if (!record.credential_type) {
        return false;
      }

      if (!record.program_code) {
        return false;
      }

      if (
        normalizeSearchValue(
          record.issued_status
        ) !==
        "finalized"
      ) {

        return false;

      }

      return true;

    }

    /* =====================================================
       FORM ACTIONS
    ===================================================== */

    function clearForm() {

      credentialIdInput.value =
        "";

      learnerNameInput.value =
        "";

      emailInput.value =
        "";

      resetLoadedCredentialState();

      console.info(
        "[CertificateGenerator] Search form cleared."
      );

    }

    /* =====================================================
       EVENT BINDING
    ===================================================== */

    credentialIdInput.addEventListener(
      "input",
      invalidateLoadedCredentialState
    );

    learnerNameInput.addEventListener(
      "input",
      invalidateLoadedCredentialState
    );

    emailInput.addEventListener(
      "input",
      invalidateLoadedCredentialState
    );

    searchBtn.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        searchCredential();

      }
    );

    clearBtn.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        clearForm();

      }
    );

    generatePdfBtn.addEventListener(
      "click",
      async (event) => {

        event.preventDefault();

        if (
          typeof window.generateCertificatePdf !==
          "function"
        ) {

          console.error(
            "[CertificateGenerator] PDF generator is unavailable."
          );

          window.alert(
            "Certificate PDF generation is unavailable."
          );

          return;

        }

        try {

          await window.generateCertificatePdf();

        }
        catch (error) {

          console.error(
            "[CertificateGenerator] PDF generation failed:",
            error
          );

        }

      }
    );

    /* =====================================================
       STARTUP
    ===================================================== */

    resetLoadedCredentialState();

    loadRegistry();

    console.info(
      "[CertificateGenerator] Controller v1.4.3 loaded."
    );

  }

  /* =======================================================
     HELPERS
  ======================================================= */

  function disablePdfButton() {

    const generatePdfBtn =
      document.getElementById(
        "generatePdfBtn"
      );

    if (!generatePdfBtn) {
      return;
    }

    generatePdfBtn.disabled =
      true;

    generatePdfBtn.classList.add(
      "cg-btn-disabled"
    );

  }

  function enablePdfButton() {

    const generatePdfBtn =
      document.getElementById(
        "generatePdfBtn"
      );

    if (!generatePdfBtn) {
      return;
    }

    generatePdfBtn.disabled =
      false;

    generatePdfBtn.classList.remove(
      "cg-btn-disabled"
    );

  }

  function setSearchButtonLoading(
    isLoading
  ) {

    const searchBtn =
      document.getElementById(
        "searchCredentialBtn"
      );

    if (!searchBtn) {
      return;
    }

    searchBtn.disabled =
      Boolean(
        isLoading
      );

    searchBtn.textContent =
      isLoading
        ? "Loading Registry…"
        : "Search Credential";

  }

  function normalizeSearchValue(value) {

    return String(
      value || ""
    )
      .trim()
      .toLowerCase();

  }

  function setText(
    element,
    value
  ) {

    if (!element) {
      return;
    }

    element.textContent =
      String(
        value ?? "-"
      );

  }

  function setTemplateText(
    container,
    selector,
    value
  ) {

    const element =
      container.querySelector(
        selector
      );

    if (!element) {
      return;
    }

    element.textContent =
      String(
        value ?? "-"
      );

  }

  function formatDate(timestamp) {

    if (!timestamp) {
      return "-";
    }

    if (
      typeof timestamp.toDate ===
      "function"
    ) {

      return timestamp
        .toDate()
        .toLocaleDateString();

    }

    if (
      Number.isFinite(
        timestamp._seconds
      )
    ) {

      return new Date(
        timestamp._seconds * 1000
      ).toLocaleDateString();

    }

    if (
      Number.isFinite(
        timestamp.seconds
      )
    ) {

      return new Date(
        timestamp.seconds * 1000
      ).toLocaleDateString();

    }

    const date =
      new Date(
        timestamp
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "-";

    }

    return date.toLocaleDateString();

  }

  function formatDisplayValue(value) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {

      return "-";

    }

    if (
      typeof value === "object"
    ) {

      const formattedDate =
        formatDate(
          value
        );

      if (
        formattedDate !== "-"
      ) {

        return formattedDate;

      }

    }

    return String(
      value
    );

  }

  /* =======================================================
     SAFE INITIALIZATION
  ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initializeCertificateGenerator,
      {
        once: true
      }
    );

  }
  else {

    initializeCertificateGenerator();

  }

})(window, document);