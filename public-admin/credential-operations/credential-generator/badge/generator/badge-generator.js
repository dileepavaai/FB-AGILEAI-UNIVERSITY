/* ==========================================================
   Agile AI University
   Credential Operations Suite

   File      : badge-generator.js
   Component : Badge Generator Controller
   Version   : 1.4.0
   Status    : ACTIVE
   Phase     : Credential-First Asset Publication

   Purpose
   ----------------------------------------------------------
   • Search credential records
   • Load authoritative credential registry data
   • Populate read-only credential metadata
   • Render the governed badge preview
   • Expose the selected credential to the PNG publication
     engine
   • Enforce credential-specific display governance

   Responsibilities
   ----------------------------------------------------------
   ✓ Load Credential Registry
   ✓ Search credentials
   ✓ Populate read-only metadata
   ✓ Render badge preview
   ✓ Preserve the original credential identity
   ✓ Expose window.loadedCredential
   ✓ Validate badge-generation readiness
   ✓ Enable and disable generation controls

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Generate PNG files
   ✗ Upload badge files
   ✗ Publish credential_assets records
   ✗ Modify credentials
   ✗ Assign learner ownership
   ✗ Perform identity reconciliation
   ✗ Generate certificates
   ✗ Process payments

   Governance
   ----------------------------------------------------------
   • credentials is the credential source of truth
   • AOP remains a founding credential
   • AOP must never be automatically substituted with AIPA
   • AIPA is a separate credential and upgrade journey
   • Badge display must reflect the credential actually earned
   • Badge generation is allowed only for finalized and
     approved credentials
   • Historical credentials may exist without learner_uid
   • The PNG engine owns generation and publication
   • This controller remains read-only

   Data Source
   ----------------------------------------------------------
   Existing Credential Registry API

   Template Authority
   ----------------------------------------------------------
   template/badge-template.html

   Change History
   ----------------------------------------------------------
   v1.4.0
   • Removed legacy AOP → AIPA display substitution
   • Added governed programme-title resolution
   • Added governed programme-code resolution
   • Exposes selected credential as window.loadedCredential
   • Clears selected credential during reset and failed search
   • Added approval-status readiness validation
   • Added normalized, defensive field handling
   • Improved registry, search and preview diagnostics
   • Preserved existing public button behaviour

   v1.3.0
   • Added registry search
   • Added read-only metadata rendering
   • Added badge-preview rendering
   • Added legacy recognition display logic

========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        "use strict";


        /* ==================================================
           CONSTANTS
        ================================================== */

        const MODULE_NAME =
            "BadgeGeneratorController";

        const MODULE_VERSION =
            "1.4.0";

        const REGISTRY_API =
            "https://aau-credential-verify-458881040066.asia-south1.run.app/admin/credential-registry";

        const BADGE_TEMPLATE_URL =
            "./template/badge-template.html";


        /* ==================================================
           STATE
        ================================================== */

        let credentialData = [];

        /*
         * Shared credential authority for the PNG publication
         * engine.
         */
        window.loadedCredential =
            null;


        /* ==================================================
           STRING NORMALIZATION
        ================================================== */

        function normalizeString(
            value
        ) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }

            return String(
                value
            ).trim();

        }

        function normalizeUppercase(
            value
        ) {

            return normalizeString(
                value
            ).toUpperCase();

        }

        function normalizeLowercase(
            value
        ) {

            return normalizeString(
                value
            ).toLowerCase();

        }


        /* ==================================================
           DOM RESOLUTION
        ================================================== */

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

        const generatePngBtn =
            document.getElementById(
                "generatePngBtn"
            );

        const badgePreview =
            document.getElementById(
                "badgePreview"
            );


        /* ==================================================
           READ-ONLY FIELD MAPPING
        ================================================== */

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


        /* ==================================================
           LIFECYCLE FIELD MAPPING
        ================================================== */

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


        /* ==================================================
           RECOGNITION FIELD MAPPING
        ================================================== */

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


        /* ==================================================
           BUTTON CONTROL
        ================================================== */

        function disablePngButton() {

            if (
                !generatePngBtn
            ) {

                return;

            }

            generatePngBtn.disabled =
                true;

            generatePngBtn.classList.add(
                "bg-btn-disabled"
            );

        }

        function enablePngButton() {

            if (
                !generatePngBtn
            ) {

                return;

            }

            generatePngBtn.disabled =
                false;

            generatePngBtn.classList.remove(
                "bg-btn-disabled"
            );

        }


        /* ==================================================
           REGISTRY LOADING
        ================================================== */

        async function loadRegistry() {

            try {

                console.info(
                    `[${MODULE_NAME}] Registry loading started.`,
                    {
                        moduleVersion:
                            MODULE_VERSION,

                        endpoint:
                            REGISTRY_API
                    }
                );

                const response =
                    await fetch(
                        REGISTRY_API,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );

                if (
                    !response.ok
                ) {

                    throw new Error(
                        `Registry request failed with HTTP ${response.status}.`
                    );

                }

                const data =
                    await response.json();

                if (
                    data?.status !==
                        "success" ||
                    !Array.isArray(
                        data?.credentials
                    )
                ) {

                    throw new Error(
                        "Invalid credential registry response."
                    );

                }

                credentialData =
                    data.credentials;

                console.info(
                    `[${MODULE_NAME}] Registry loaded.`,
                    {
                        recordCount:
                            credentialData.length
                    }
                );

            }
            catch (
                error
            ) {

                credentialData =
                    [];

                console.error(
                    `[${MODULE_NAME}] Registry loading failed:`,
                    error
                );

                alert(
                    "Credential Registry could not be loaded. Please refresh and try again."
                );

            }

        }


        /* ==================================================
           CREDENTIAL SEARCH
        ================================================== */

        function findMatchingCredential({
            credentialId,
            learnerName,
            email
        }) {

            return credentialData.find(
                (
                    item
                ) => {

                    const recordCredentialId =
                        normalizeLowercase(
                            item?.credential_id
                        );

                    const recordLearnerName =
                        normalizeLowercase(
                            item?.full_name
                        );

                    const recordEmail =
                        normalizeLowercase(
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

        }

        async function searchCredential() {

            const credentialId =
                normalizeLowercase(
                    credentialIdInput?.value
                );

            const learnerName =
                normalizeLowercase(
                    learnerNameInput?.value
                );

            const email =
                normalizeLowercase(
                    emailInput?.value
                );

            if (
                !credentialId &&
                !learnerName &&
                !email
            ) {

                alert(
                    "Please enter at least one search criterion."
                );

                clearForm();

                return;

            }

            console.info(
                `[${MODULE_NAME}] Search started.`,
                {
                    credentialIdPresent:
                        Boolean(
                            credentialId
                        ),

                    learnerNamePresent:
                        Boolean(
                            learnerName
                        ),

                    emailPresent:
                        Boolean(
                            email
                        ),

                    registryRecordCount:
                        credentialData.length
                }
            );

            const record =
                findMatchingCredential({
                    credentialId,
                    learnerName,
                    email
                });

            if (
                !record
            ) {

                clearForm();

                alert(
                    "No matching credential was found."
                );

                return;

            }

            /*
             * The selected credential is exposed to
             * badge-png.js. The generation engine must use
             * this authoritative registry record.
             */
            window.loadedCredential =
                record;

            populateFields(
                record
            );

            await renderBadgePreview(
                record
            );

            const badgeReady =
                isBadgeReady(
                    record
                );

            console.info(
                `[${MODULE_NAME}] Credential selected.`,
                {
                    credentialId:
                        normalizeString(
                            record?.credential_id
                        ),

                    programCode:
                        normalizeUppercase(
                            record?.program_code
                        ),

                    issuedStatus:
                        normalizeLowercase(
                            record?.issued_status
                        ),

                    approvalStatus:
                        normalizeLowercase(
                            record?.approval_status
                        ),

                    learnerUidPresent:
                        Boolean(
                            normalizeString(
                                record?.learner_uid
                            )
                        ),

                    badgeReady
                }
            );

            if (
                badgeReady
            ) {

                enablePngButton();

                return;

            }

            disablePngButton();

            alert(
                "This credential is not eligible for badge generation. It must be finalized, approved, and contain the required credential metadata."
            );

        }


        /* ==================================================
           READ-ONLY FIELD POPULATION
        ================================================== */

        function setTextContent(
            element,
            value
        ) {

            if (
                !element
            ) {

                return;

            }

            element.textContent =
                normalizeString(
                    value
                ) ||
                "-";

        }

        function populateFields(
            record
        ) {

            setTextContent(
                credentialIdValue,
                record?.credential_id
            );

            setTextContent(
                credentialTypeValue,
                record?.credential_type
            );

            setTextContent(
                credentialFamilyValue,
                record?.credential_family
            );

            setTextContent(
                programCodeValue,
                record?.program_code
            );

            setTextContent(
                programNameValue,
                record?.program_name
            );

            setTextContent(
                templateKeyValue,
                record?.template_key
            );

            setTextContent(
                credentialStatusValue,
                record?.issued_status
            );

            setTextContent(
                issueDateValue,
                formatDate(
                    record?.issue_date ||
                    record?.issued_at ||
                    record?.imported_at
                )
            );

            setTextContent(
                lifecycleStateValue,
                record?.lifecycle_state
            );

            setTextContent(
                successorProgramValue,
                record?.successor_program
            );

            setTextContent(
                bridgeRequiredValue,
                record?.bridge_required
            );

            setTextContent(
                bridgeCompletionStatusValue,
                record?.bridge_completion_status
            );

            setTextContent(
                originalCredentialValue,
                record?.original_credential
            );

            setTextContent(
                currentRecognitionValue,
                record?.current_recognition
            );

            setTextContent(
                recognitionStatusValue,
                record?.recognition_status
            );

            setTextContent(
                recognitionEffectiveDateValue,
                formatDate(
                    record?.recognition_effective_date
                )
            );

        }


        /* ==================================================
           PROGRAMME DISPLAY GOVERNANCE
        ================================================== */

        function getDisplayCredentialTitle(
            record
        ) {

            const programCode =
                normalizeUppercase(
                    record?.program_code
                );

            /*
             * Founding credential governance:
             * AOP remains AOP and is never substituted with
             * AIPA.
             */
            if (
                programCode ===
                "AOP"
            ) {

                return (
                    "Agile Outcome Practitioner"
                );

            }

            if (
                programCode ===
                "AIPA"
            ) {

                return (
                    "Artificial Intelligence Professional Agilist"
                );

            }

            return (
                normalizeString(
                    record?.program_name
                ) ||
                normalizeString(
                    record?.credential_type
                ) ||
                normalizeString(
                    record?.current_recognition
                ) ||
                "-"
            );

        }

        function getDisplayCredentialCode(
            record
        ) {

            return (
                normalizeUppercase(
                    record?.program_code
                ) ||
                "-"
            );

        }


        /* ==================================================
           BADGE PREVIEW
        ================================================== */

        async function renderBadgePreview(
            record
        ) {

            if (
                !badgePreview
            ) {

                throw new Error(
                    "Badge preview container is unavailable."
                );

            }

            try {

                const response =
                    await fetch(
                        BADGE_TEMPLATE_URL,
                        {
                            cache:
                                "no-store"
                        }
                    );

                if (
                    !response.ok
                ) {

                    throw new Error(
                        `Badge template request failed with HTTP ${response.status}.`
                    );

                }

                const template =
                    await response.text();

                badgePreview.innerHTML =
                    template;

                const pngRenderContainer =
                    document.getElementById(
                        "pngRenderContainer"
                    );

                if (
                    pngRenderContainer
                ) {

                    pngRenderContainer.innerHTML =
                        template;

                }

                populateBadgeSurface(
                    badgePreview,
                    record
                );

                if (
                    pngRenderContainer
                ) {

                    populateBadgeSurface(
                        pngRenderContainer,
                        record
                    );

                }

                console.info(
                    `[${MODULE_NAME}] Badge preview rendered.`,
                    {
                        credentialId:
                            normalizeString(
                                record?.credential_id
                            ),

                        displayCode:
                            getDisplayCredentialCode(
                                record
                            ),

                        displayTitle:
                            getDisplayCredentialTitle(
                                record
                            )
                    }
                );

            }
            catch (
                error
            ) {

                console.error(
                    `[${MODULE_NAME}] Badge preview failed:`,
                    error
                );

                throw error;

            }

        }

        function populateBadgeSurface(
            container,
            record
        ) {

            if (
                !container
            ) {

                return;

            }

            const badgeCredentialTitle =
                container.querySelector(
                    "#badgeCredentialTitle"
                );

            const badgeCredentialCode =
                container.querySelector(
                    "#badgeCredentialCode"
                );

            const badgeCredentialId =
                container.querySelector(
                    "#badgeCredentialId"
                );

            if (
                badgeCredentialTitle
            ) {

                badgeCredentialTitle.textContent =
                    getDisplayCredentialTitle(
                        record
                    );

            }

            if (
                badgeCredentialCode
            ) {

                badgeCredentialCode.textContent =
                    getDisplayCredentialCode(
                        record
                    );

            }

            if (
                badgeCredentialId
            ) {

                badgeCredentialId.textContent =
                    normalizeString(
                        record?.credential_id
                    ) ||
                    "-";

            }

        }


        /* ==================================================
           BADGE READINESS
        ================================================== */

        function isBadgeReady(
            record
        ) {

            if (
                !record
            ) {

                return false;

            }

            const credentialId =
                normalizeString(
                    record?.credential_id
                );

            const learnerName =
                normalizeString(
                    record?.full_name
                );

            const credentialType =
                normalizeString(
                    record?.credential_type
                );

            const programCode =
                normalizeString(
                    record?.program_code
                );

            const issuedStatus =
                normalizeLowercase(
                    record?.issued_status
                );

            const approvalStatus =
                normalizeLowercase(
                    record?.approval_status
                );

            if (
                !credentialId ||
                !learnerName ||
                !credentialType ||
                !programCode
            ) {

                return false;

            }

            if (
                issuedStatus !==
                "finalized"
            ) {

                return false;

            }

            /*
             * Legacy records without approval_status remain
             * eligible when finalized. Where the field exists,
             * it must be approved.
             */
            if (
                approvalStatus &&
                approvalStatus !==
                "approved"
            ) {

                return false;

            }

            return true;

        }


        /* ==================================================
           DATE FORMATTING
        ================================================== */

        function formatDate(
            value
        ) {

            if (
                !value
            ) {

                return "-";

            }

            let resolvedDate =
                null;

            if (
                typeof value?.toDate ===
                "function"
            ) {

                resolvedDate =
                    value.toDate();

            }
            else if (
                Number.isFinite(
                    value?._seconds
                )
            ) {

                resolvedDate =
                    new Date(
                        value._seconds *
                        1000
                    );

            }
            else if (
                value instanceof Date
            ) {

                resolvedDate =
                    value;

            }
            else {

                const parsedDate =
                    new Date(
                        value
                    );

                if (
                    !Number.isNaN(
                        parsedDate.getTime()
                    )
                ) {

                    resolvedDate =
                        parsedDate;

                }

            }

            if (
                !resolvedDate ||
                Number.isNaN(
                    resolvedDate.getTime()
                )
            ) {

                return "-";

            }

            return resolvedDate
                .toLocaleDateString();

        }


        /* ==================================================
           RESET
        ================================================== */

        function clearForm() {

            if (
                credentialIdInput
            ) {

                credentialIdInput.value =
                    "";

            }

            if (
                learnerNameInput
            ) {

                learnerNameInput.value =
                    "";

            }

            if (
                emailInput
            ) {

                emailInput.value =
                    "";

            }

            window.loadedCredential =
                null;

            disablePngButton();

            if (
                badgePreview
            ) {

                badgePreview.innerHTML =
                    "";

            }

            const pngRenderContainer =
                document.getElementById(
                    "pngRenderContainer"
                );

            if (
                pngRenderContainer
            ) {

                pngRenderContainer.innerHTML =
                    "";

            }

        }


        /* ==================================================
           EVENTS
        ================================================== */

        searchBtn?.addEventListener(
            "click",
            () => {

                searchCredential()
                    .catch(
                        (
                            error
                        ) => {

                            console.error(
                                `[${MODULE_NAME}] Search workflow failed:`,
                                error
                            );

                            disablePngButton();

                            alert(
                                "The credential could not be prepared for badge generation."
                            );

                        }
                    );

            }
        );

        clearBtn?.addEventListener(
            "click",
            clearForm
        );

        generatePngBtn?.addEventListener(
            "click",
            async () => {

                if (
                    !isBadgeReady(
                        window.loadedCredential
                    )
                ) {

                    disablePngButton();

                    alert(
                        "Select an eligible credential before generating the badge."
                    );

                    return;

                }

                if (
                    typeof window.generateBadgePng !==
                    "function"
                ) {

                    console.error(
                        `[${MODULE_NAME}] generateBadgePng is unavailable.`
                    );

                    alert(
                        "The badge PNG engine is not available."
                    );

                    return;

                }

                await window.generateBadgePng();

            }
        );


        /* ==================================================
           INITIALIZATION
        ================================================== */

        disablePngButton();

        loadRegistry();

        console.info(
            `[${MODULE_NAME}] Loaded v${MODULE_VERSION}.`
        );

    }
);