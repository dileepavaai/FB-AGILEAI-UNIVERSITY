/* ==========================================================
   Agile AI University
   Credential Operations Suite

   File      : trainer-certificate-generator.js
   Component : Trainer Certificate Generator Controller
   Version   : 1.4.0
   Status    : ACTIVE
   Phase     : Credential-First Asset Publication

   Purpose
   ----------------------------------------------------------
   • Search authoritative credential records
   • Populate governed read-only metadata
   • Resolve trainer and organization context
   • Render Trainer Certificate previews
   • Expose the selected credential to the PDF publisher
   • Preserve AOP as Agile Outcome Practitioner

   Responsibilities
   ----------------------------------------------------------
   ✓ Load Credential Registry
   ✓ Search credential records
   ✓ Populate read-only credential metadata
   ✓ Resolve batch, trainer and organization records
   ✓ Render visible and hidden PDF surfaces
   ✓ Enforce certificate readiness
   ✓ Expose window.loadedCredential
   ✓ Enable and disable generation controls

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Generate PDF binaries
   ✗ Upload files
   ✗ Publish credential_assets
   ✗ Modify credentials
   ✗ Assign learner ownership
   ✗ Perform identity reconciliation
   ✗ Modify trainer or organization records

   Governance
   ----------------------------------------------------------
   • credentials is the credential source of truth
   • AOP remains Agile Outcome Practitioner
   • AOP must never be substituted with AIPA
   • AIPA is a separate credential
   • Trainer Certificate generation is read-only
   • Historical credentials may not yet have learner_uid
   • PDF publication is owned by trainer-certificate-pdf.js

   Data Sources
   ----------------------------------------------------------
   • Credential Registry API
   • batches
   • trainerRegistry
   • trainingOrganizations

   Template Authority
   ----------------------------------------------------------
   template/trainer-certificate-template.html

   Change History
   ----------------------------------------------------------
   v1.4.0
   • Removed legacy AOP → AIPA substitution
   • Exposed selected record as window.loadedCredential
   • Added approval-status readiness validation
   • Added defensive normalization
   • Improved date handling
   • Consolidated reset logic
   • Added template-response validation
   • Preserved trainer and organization resolution

   v1.3.0
   • Added trainer and organization context resolution
   • Added hidden PDF rendering surface
   • Added recognition display governance

========================================================== */

import {
    db
} from "../../../../assets/js/core.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        "use strict";


        /* ==================================================
           CONSTANTS
        ================================================== */

        const MODULE_NAME =
            "TrainerCertificateGenerator";

        const MODULE_VERSION =
            "1.4.0";

        const REGISTRY_API =
            "https://aau-credential-verify-458881040066.asia-south1.run.app/admin/credential-registry";

        const TEMPLATE_URL =
            "./template/trainer-certificate-template.html";

        const ORGANIZATION_EMBLEM_PATH =
            "/credential-operations/credential-generator/assets/images/organizations/agile-ai-academy.png";


        /* ==================================================
           STATE
        ================================================== */

        let credentialData = [];

        window.loadedCredential =
            null;


        /* ==================================================
           NORMALIZATION
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

        function normalizeLowercase(
            value
        ) {

            return normalizeString(
                value
            ).toLowerCase();

        }

        function normalizeUppercase(
            value
        ) {

            return normalizeString(
                value
            ).toUpperCase();

        }


        /* ==================================================
           SEARCH CONTROLS
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

        const generatePdfBtn =
            document.getElementById(
                "generatePdfBtn"
            );


        /* ==================================================
           PREVIEW CONTAINERS
        ================================================== */

        const trainerCertificatePreview =
            document.getElementById(
                "renderTrainerCertificatePreview"
            );


        /* ==================================================
           METADATA FIELD MAPPING
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


        /* ==================================================
           BUTTON CONTROL
        ================================================== */

        function disablePdfButton() {

            if (
                !generatePdfBtn
            ) {

                return;

            }

            generatePdfBtn.disabled =
                true;

            generatePdfBtn.classList.add(
                "tcg-btn-disabled"
            );

        }

        function enablePdfButton() {

            if (
                !generatePdfBtn
            ) {

                return;

            }

            generatePdfBtn.disabled =
                false;

            generatePdfBtn.classList.remove(
                "tcg-btn-disabled"
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
                        "Invalid Credential Registry response."
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
                    "Credential Registry could not be loaded."
                );

            }

        }


        /* ==================================================
           SEARCH
        ================================================== */

        function findCredential({
            credentialId,
            learnerName,
            email
        }) {

            return credentialData.find(
                (
                    item
                ) => {

                    const credentialMatch =
                        !credentialId ||
                        normalizeLowercase(
                            item?.credential_id
                        ).includes(
                            credentialId
                        );

                    const nameMatch =
                        !learnerName ||
                        normalizeLowercase(
                            item?.full_name
                        ).includes(
                            learnerName
                        );

                    const emailMatch =
                        !email ||
                        normalizeLowercase(
                            item?.email
                        ).includes(
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

                return;

            }

            const record =
                findCredential({
                    credentialId,
                    learnerName,
                    email
                });

            if (
                !record
            ) {

                resetLoadedCredentialState();

                alert(
                    "No matching credential found."
                );

                return;

            }

            /*
             * Shared credential authority for the PDF engine.
             */
            window.loadedCredential =
                record;

            populateFields(
                record
            );

            await renderTrainerCertificatePreview(
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

                alert(
                    "Credential is not eligible for Trainer Certificate generation."
                );

            }

            console.info(
                `[${MODULE_NAME}] Credential loaded.`,
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
                        )
                }
            );

        }


        /* ==================================================
           FIELD POPULATION
        ================================================== */

        function setText(
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

            setText(
                credentialIdValue,
                record?.credential_id
            );

            setText(
                credentialTypeValue,
                record?.credential_type
            );

            setText(
                credentialFamilyValue,
                record?.credential_family
            );

            setText(
                programCodeValue,
                record?.program_code
            );

            setText(
                programNameValue,
                record?.program_name
            );

            setText(
                templateKeyValue,
                record?.template_key
            );

            setText(
                credentialStatusValue,
                record?.issued_status
            );

            setText(
                issueDateValue,
                formatDate(
                    record?.issue_date ||
                    record?.issued_at ||
                    record?.imported_at
                )
            );

            setText(
                lifecycleStateValue,
                record?.lifecycle_state
            );

            setText(
                successorProgramValue,
                record?.successor_program
            );

            setText(
                bridgeRequiredValue,
                record?.bridge_required
            );

            setText(
                bridgeCompletionStatusValue,
                record?.bridge_completion_status
            );

            setText(
                originalCredentialValue,
                record?.original_credential
            );

            setText(
                currentRecognitionValue,
                record?.current_recognition
            );

            setText(
                recognitionStatusValue,
                record?.recognition_status
            );

            setText(
                recognitionEffectiveDateValue,
                formatDate(
                    record?.recognition_effective_date
                )
            );

        }


        /* ==================================================
           TRAINER CONTEXT
        ================================================== */

        async function resolveTrainerContext(
            record
        ) {

            try {

                const batchName =
                    normalizeString(
                        record?.batch_name
                    );

                if (
                    !batchName
                ) {

                    console.warn(
                        `[${MODULE_NAME}] No batch_name found on credential.`
                    );

                    return null;

                }

                const batchResult =
                    await getDocs(
                        query(
                            collection(
                                db,
                                "batches"
                            ),
                            where(
                                "batch_name",
                                "==",
                                batchName
                            )
                        )
                    );

                if (
                    batchResult.empty
                ) {

                    console.warn(
                        `[${MODULE_NAME}] Batch not found.`,
                        {
                            batchName
                        }
                    );

                    return null;

                }

                const batch =
                    batchResult.docs[0].data();

                const trainerId =
                    normalizeString(
                        batch?.trainerId ||
                        batch?.trainer_id
                    );

                if (
                    !trainerId
                ) {

                    console.warn(
                        `[${MODULE_NAME}] Batch has no trainer ID.`
                    );

                    return null;

                }

                const trainerResult =
                    await getDocs(
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
                        )
                    );

                if (
                    trainerResult.empty
                ) {

                    console.warn(
                        `[${MODULE_NAME}] Trainer not found.`,
                        {
                            trainerId
                        }
                    );

                    return null;

                }

                const trainer =
                    trainerResult.docs[0].data();

                let organization =
                    null;

                const organizationId =
                    normalizeString(
                        trainer?.organizationId ||
                        trainer?.organization_id
                    );

                if (
                    organizationId
                ) {

                    try {

                        const organizationResult =
                            await getDocs(
                                query(
                                    collection(
                                        db,
                                        "trainingOrganizations"
                                    ),
                                    where(
                                        "organizationId",
                                        "==",
                                        organizationId
                                    )
                                )
                            );

                        if (
                            !organizationResult.empty
                        ) {

                            organization =
                                organizationResult.docs[0].data();

                        }

                    }
                    catch (
                        error
                    ) {

                        console.warn(
                            `[${MODULE_NAME}] Organization lookup failed.`,
                            error
                        );

                    }

                }

                return {
                    trainer,
                    organization
                };

            }
            catch (
                error
            ) {

                console.error(
                    `[${MODULE_NAME}] Trainer context resolution failed:`,
                    error
                );

                return null;

            }

        }


        /* ==================================================
           PREVIEW RENDERING
        ================================================== */

        async function renderTrainerCertificatePreview(
            record
        ) {

            if (
                !trainerCertificatePreview
            ) {

                throw new Error(
                    "Trainer Certificate preview container is unavailable."
                );

            }

            const response =
                await fetch(
                    TEMPLATE_URL,
                    {
                        cache:
                            "no-store"
                    }
                );

            if (
                !response.ok
            ) {

                throw new Error(
                    `Trainer Certificate template failed with HTTP ${response.status}.`
                );

            }

            const template =
                await response.text();

            trainerCertificatePreview.innerHTML =
                template;

            const pdfRenderContainer =
                document.getElementById(
                    "pdfRenderContainer"
                );

            if (
                pdfRenderContainer
            ) {

                pdfRenderContainer.innerHTML =
                    template;

            }

            const trainerContext =
                await resolveTrainerContext(
                    record
                );

            populateCertificateSurface(
                trainerCertificatePreview,
                record,
                trainerContext
            );

            if (
                pdfRenderContainer
            ) {

                populateCertificateSurface(
                    pdfRenderContainer,
                    record,
                    trainerContext
                );

            }

            console.info(
                `[${MODULE_NAME}] Trainer Certificate preview rendered.`,
                {
                    credentialId:
                        normalizeString(
                            record?.credential_id
                        ),

                    programCode:
                        normalizeUppercase(
                            record?.program_code
                        ),

                    trainerResolved:
                        Boolean(
                            trainerContext?.trainer
                        ),

                    organizationResolved:
                        Boolean(
                            trainerContext?.organization
                        )
                }
            );

        }

        function populateCertificateSurface(
            container,
            record,
            trainerContext
        ) {

            if (
                !container
            ) {

                return;

            }

            const trainer =
                trainerContext?.trainer ||
                {};

            const organization =
                trainerContext?.organization ||
                {};

            setSurfaceText(
                container,
                "#trainercertLearnerName",
                record?.full_name
            );

            setSurfaceText(
                container,
                "#trainercertCredentialType",
                getDisplayCredentialTitle(
                    record
                )
            );

            setSurfaceText(
                container,
                "#trainercertProgramCode",
                record?.program_code
            );

            setSurfaceText(
                container,
                "#trainercertCredentialId",
                record?.credential_id
            );

            setSurfaceText(
                container,
                "#trainercertIssueDate",
                formatDate(
                    record?.issue_date ||
                    record?.issued_at ||
                    record?.imported_at
                )
            );

            setSurfaceText(
                container,
                "#trainercertTrainerName",
                trainer?.trainerName ||
                trainer?.trainer_name
            );

            setSurfaceText(
                container,
                "#trainercertTrainerId",
                trainer?.trainerId ||
                trainer?.trainer_id
            );

            setSurfaceText(
                container,
                "#trainercertOrganizationName",
                organization?.organizationName ||
                organization?.organization_name
            );

            setSurfaceText(
                container,
                "#trainercertProgramName",
                record?.program_name ||
                record?.program_code
            );

            setSurfaceText(
                container,
                "#trainercertTrainingPeriod",
                formatTrainingPeriod(
                    record
                )
            );

            const emblem =
                container.querySelector(
                    "#trainercertOrganizationEmblem"
                );

            if (
                emblem
            ) {

                emblem.src =
                    ORGANIZATION_EMBLEM_PATH;

                emblem.style.display =
                    "block";

            }

        }

        function setSurfaceText(
            container,
            selector,
            value
        ) {

            const element =
                container.querySelector(
                    selector
                );

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


        /* ==================================================
           DISPLAY GOVERNANCE
        ================================================== */

        function getDisplayCredentialTitle(
            record
        ) {

            const programCode =
                normalizeUppercase(
                    record?.program_code
                );

            if (
                programCode ===
                "AOP"
            ) {

                return (
                    "Agile Outcome Practitioner (AOP)"
                );

            }

            if (
                programCode ===
                "AIPA"
            ) {

                return (
                    "Artificial Intelligence Professional Agilist (AIPA)"
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


        /* ==================================================
           READINESS VALIDATION
        ================================================== */

        function isCertificateReady(
            record
        ) {

            if (
                !record
            ) {

                return false;

            }

            if (
                !normalizeString(
                    record?.credential_id
                ) ||
                !normalizeString(
                    record?.full_name
                ) ||
                !normalizeString(
                    record?.credential_type
                ) ||
                !normalizeString(
                    record?.program_code
                )
            ) {

                return false;

            }

            if (
                normalizeLowercase(
                    record?.issued_status
                ) !==
                "finalized"
            ) {

                return false;

            }

            const approvalStatus =
                normalizeLowercase(
                    record?.approval_status
                );

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
           DATE HELPERS
        ================================================== */

        function formatDate(
            value
        ) {

            if (
                !value
            ) {

                return "-";

            }

            let date =
                null;

            if (
                typeof value?.toDate ===
                "function"
            ) {

                date =
                    value.toDate();

            }
            else if (
                Number.isFinite(
                    value?._seconds
                )
            ) {

                date =
                    new Date(
                        value._seconds *
                        1000
                    );

            }
            else if (
                value instanceof Date
            ) {

                date =
                    value;

            }
            else {

                const candidate =
                    new Date(
                        value
                    );

                if (
                    !Number.isNaN(
                        candidate.getTime()
                    )
                ) {

                    date =
                        candidate;

                }

            }

            if (
                !date ||
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "-";

            }

            return date.toLocaleDateString();

        }

        function formatTrainingPeriod(
            record
        ) {

            const startDate =
                normalizeString(
                    record?.training_start_date
                );

            const endDate =
                normalizeString(
                    record?.training_end_date
                );

            if (
                startDate &&
                endDate
            ) {

                return (
                    `${startDate} - ${endDate}`
                );

            }

            return (
                startDate ||
                endDate ||
                "-"
            );

        }


        /* ==================================================
           STATE RESET
        ================================================== */

        function resetLoadedCredentialState() {

            window.loadedCredential =
                null;

            [
                credentialIdValue,
                credentialTypeValue,
                credentialFamilyValue,
                programCodeValue,
                programNameValue,
                templateKeyValue,
                issueDateValue,
                credentialStatusValue,
                lifecycleStateValue,
                successorProgramValue,
                bridgeRequiredValue,
                bridgeCompletionStatusValue,
                originalCredentialValue,
                currentRecognitionValue,
                recognitionStatusValue,
                recognitionEffectiveDateValue
            ].forEach(
                (
                    element
                ) => {

                    if (
                        element
                    ) {

                        element.textContent =
                            "Not Loaded";

                    }

                }
            );

            if (
                trainerCertificatePreview
            ) {

                trainerCertificatePreview.innerHTML =
                    `
                        <div>
                            <h3>Preview Placeholder</h3>
                            <p>
                                Search for an eligible credential
                                to render its Trainer Certificate.
                            </p>
                        </div>
                    `;

            }

            const pdfRenderContainer =
                document.getElementById(
                    "pdfRenderContainer"
                );

            if (
                pdfRenderContainer
            ) {

                pdfRenderContainer.innerHTML =
                    "";

            }

            disablePdfButton();

        }

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

            resetLoadedCredentialState();

        }

        function invalidateLoadedCredentialState() {

            if (
                window.loadedCredential
            ) {

                resetLoadedCredentialState();

            }

        }


        /* ==================================================
           EVENTS
        ================================================== */

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

                            resetLoadedCredentialState();

                            alert(
                                "Trainer Certificate preview could not be prepared."
                            );

                        }
                    );

            }
        );

        clearBtn?.addEventListener(
            "click",
            clearForm
        );

        generatePdfBtn?.addEventListener(
            "click",
            async () => {

                if (
                    !isCertificateReady(
                        window.loadedCredential
                    )
                ) {

                    disablePdfButton();

                    alert(
                        "Select an eligible credential before generating the Trainer Certificate."
                    );

                    return;

                }

                if (
                    typeof window.generateTrainerCertificatePdf !==
                    "function"
                ) {

                    console.error(
                        `[${MODULE_NAME}] PDF engine is unavailable.`
                    );

                    alert(
                        "Trainer Certificate PDF engine is not available."
                    );

                    return;

                }

                await window.generateTrainerCertificatePdf();

            }
        );


        /* ==================================================
           INITIALIZATION
        ================================================== */

        disablePdfButton();

        loadRegistry();

        console.info(
            `[${MODULE_NAME}] Loaded v${MODULE_VERSION}.`
        );

    }
);