import { fitCredentialPreview } from "../../shared/credential-preview-fit.js?v=20260922-signature-2";

/* ==========================================================
   LAAU
   Credential Operations Suite

   File      : trainer-certificate-generator.js
   Component : Trainer Certificate Generator Controller
   Version   : 1.6.1
   Status    : ACTIVE
   Phase     : Credential-First Asset Publication

   Purpose
   ----------------------------------------------------------
   • Search authoritative credential records
   • Populate governed read-only metadata
   • Resolve trainer, batch and organization context
   • Render Trainer Certificate previews
   • Expose the selected credential to the PDF publisher
   • Preserve AOP as Agile Outcome Practitioner

   Responsibilities
   ----------------------------------------------------------
   ✓ Load Credential Registry
   ✓ Search credential records
   ✓ Populate read-only credential metadata
   ✓ Resolve batch, trainer and organization records
   ✓ Support legacy and current batch identifiers
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
   ✗ Modify trainer records
   ✗ Modify organization records
   ✗ Modify batch records

   Governance
   ----------------------------------------------------------
   • credentials is the credential source of truth
   • batches is the governed training-delivery context source
   • trainerRegistry is the governed trainer source
   • trainingOrganizations is the governed organization source
   • AOP remains Agile Outcome Practitioner
   • AOP must never be substituted with AIPA
   • AIPA is a separate credential
   • Trainer Certificate generation is read-only
   • Historical credentials may not yet have learner_uid
   • Historical credentials may reference legacy batch metadata
   • Trainer attribution must be resolved from governed records
   • Organization attribution must be resolved from governed records
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
   v1.6.1
   • Resolve the exact old and new Academy organisation IDs
   • Preserve provider conflict checks across the organisation migration

   v1.6.0
   • Resolve the actual provider with exact-ID Academy branding
   • Reject ambiguous provider records and stale preview results
   • Preserve read-only registries and issuer seal

   v1.5.0
   • Strengthened trainer attribution architecture
   • Added governed Firestore collection constants
   • Prepared multi-path batch resolution support
   • Prepared trainer resolution independent of batch-name-only lookup
   • Preserved legacy AOP credential compatibility
   • Preserved Credential Registry as credential authority
   • Preserved read-only certificate-generation governance
   • No credential mutation introduced
   • No trainer or organization mutation introduced

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
    doc,
    getDoc,
    getDocs,
    query,
    where,
    limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {
    resolveTrainingProviderContext,
    registerProviderRender,
    assertProviderRender
} from "../../shared/training-provider-branding.js?v=20260922-academy-brand-2";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        "use strict";


        /* ==================================================
           MODULE CONSTANTS
        ================================================== */

        const MODULE_NAME =
            "TrainerCertificateGenerator";

        const MODULE_VERSION =
            "1.6.1";

        const REGISTRY_API =
            "https://aau-credential-verify-458881040066.asia-south1.run.app/admin/credential-registry";

        const TEMPLATE_URL =
            "./template/trainer-certificate-template.html?v=20260922-signature-2";

        let previewRequestVersion = 0;


        /* ==================================================
           FIRESTORE AUTHORITY CONSTANTS

           Governance:
           Collection names are centralized here so that
           trainer-resolution logic does not depend on
           duplicated string literals across the controller.
        ================================================== */

        const COLLECTIONS =
            Object.freeze({

                BATCHES:
                    "batches",

                TRAINERS:
                    "trainerRegistry",

                TRAINING_ORGANIZATIONS:
                    "trainingOrganizations"

            });


        /* ==================================================
           GOVERNED FIELD ALIASES

           Historical records may use more than one naming
           convention. These aliases are READ-ONLY resolution
           aids. They do not rewrite source documents.
        ================================================== */

        const FIELD_ALIASES =
            Object.freeze({

                BATCH_ID: Object.freeze([
                    "batch_id",
                    "batchId"
                ]),

                BATCH_NAME: Object.freeze([
                    "batch_name",
                    "batchName"
                ]),

                BATCH_CODE: Object.freeze([
                    "batch_code",
                    "batchCode"
                ]),

                TRAINER_ID: Object.freeze([
                    "trainerId",
                    "trainer_id"
                ]),

                ORGANIZATION_ID: Object.freeze([
                    "organizationId",
                    "organization_id"
                ]),

                TRAINER_NAME: Object.freeze([
                    "trainerName",
                    "trainer_name"
                ]),

                ORGANIZATION_NAME: Object.freeze([
                    "organizationName",
                    "organization_name"
                ])

            });


        /* ==================================================
           STATE
        ================================================== */

        let credentialData =
            [];

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
           FIELD-ALIAS RESOLUTION

           Returns the first non-empty value found from a
           governed list of possible property names.

           Important:
           - Read-only
           - Does not modify the source object
           - Used to support historical schema variants
        ================================================== */

        function getFirstAvailableValue(
            source,
            fieldNames
        ) {

            if (
                !source ||
                !Array.isArray(
                    fieldNames
                )
            ) {

                return "";

            }

            for (
                const fieldName of fieldNames
            ) {

                const value =
                    normalizeString(
                        source?.[fieldName]
                    );

                if (
                    value
                ) {

                    return value;

                }

            }

            return "";

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

        fitCredentialPreview(trainerCertificatePreview);


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
                            },

                            cache:
                                "no-store"
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
                    data.credentials.filter(
                        (
                            item
                        ) => {

                            return (
                                item &&
                                typeof item ===
                                    "object"
                            );

                        }
                    );

                console.info(
                    `[${MODULE_NAME}] Registry loaded.`,
                    {
                        recordCount:
                            credentialData.length,

                        moduleVersion:
                            MODULE_VERSION
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

            const normalizedCredentialId =
                normalizeLowercase(
                    credentialId
                );

            const normalizedLearnerName =
                normalizeLowercase(
                    learnerName
                );

            const normalizedEmail =
                normalizeLowercase(
                    email
                );

            return credentialData.find(
                (
                    item
                ) => {

                    const itemCredentialId =
                        normalizeLowercase(
                            item?.credential_id
                        );

                    const itemLearnerName =
                        normalizeLowercase(
                            item?.full_name
                        );

                    const itemEmail =
                        normalizeLowercase(
                            item?.email
                        );

                    const credentialMatch =
                        !normalizedCredentialId ||
                        itemCredentialId.includes(
                            normalizedCredentialId
                        );

                    const nameMatch =
                        !normalizedLearnerName ||
                        itemLearnerName.includes(
                            normalizedLearnerName
                        );

                    const emailMatch =
                        !normalizedEmail ||
                        itemEmail.includes(
                            normalizedEmail
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

            if (
                !Array.isArray(
                    credentialData
                ) ||
                credentialData.length ===
                    0
            ) {

                console.warn(
                    `[${MODULE_NAME}] Search attempted before registry data was available.`
                );

                alert(
                    "Credential Registry is not available. Please wait a moment and try again."
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
             * Credential authority shared with the PDF engine.
             *
             * The object remains read-only from the perspective
             * of this controller. No Firestore credential mutation
             * occurs here.
             */
            window.loadedCredential =
                record;

            console.info(
                `[${MODULE_NAME}] Credential selected.`,
                {
                    credentialId:
                        normalizeString(
                            record?.credential_id
                        ),

                    learnerName:
                        normalizeString(
                            record?.full_name
                        ),

                    email:
                        normalizeString(
                            record?.email
                        ),

                    programCode:
                        normalizeUppercase(
                            record?.program_code
                        ),

                    batchId:
                        getFirstAvailableValue(
                            record,
                            FIELD_ALIASES.BATCH_ID
                        ),

                    batchName:
                        getFirstAvailableValue(
                            record,
                            FIELD_ALIASES.BATCH_NAME
                        ),

                    batchCode:
                        getFirstAvailableValue(
                            record,
                            FIELD_ALIASES.BATCH_CODE
                        )
                }
            );

            populateFields(
                record
            );

            try {

                const rendered = await renderTrainerCertificatePreview(record);
                if (!rendered) return;

            }
            catch (
                error
            ) {

                console.error(
                    `[${MODULE_NAME}] Trainer Certificate preview rendering failed.`,
                    {
                        credentialId:
                            normalizeString(
                                record?.credential_id
                            ),

                        error
                    }
                );

                disablePdfButton();

                throw error;

            }

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
                        ),

                    batchIdPresent:
                        Boolean(
                            getFirstAvailableValue(
                                record,
                                FIELD_ALIASES.BATCH_ID
                            )
                        ),

                    batchNamePresent:
                        Boolean(
                            getFirstAvailableValue(
                                record,
                                FIELD_ALIASES.BATCH_NAME
                            )
                        ),

                    batchCodePresent:
                        Boolean(
                            getFirstAvailableValue(
                                record,
                                FIELD_ALIASES.BATCH_CODE
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

            if (
                !record
            ) {

                console.warn(
                    `[${MODULE_NAME}] populateFields called without a credential record.`
                );

                return;

            }

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

            console.info(
                `[${MODULE_NAME}] Credential metadata populated.`,
                {
                    credentialId:
                        normalizeString(
                            record?.credential_id
                        ),

                    programCode:
                        normalizeUppercase(
                            record?.program_code
                        )
                }
            );

        }

        /* ==================================================
           TRAINER CONTEXT
        ================================================== */

        async function resolveTrainerContext(record) {
            // Preserve the existing credential → batch → trainer → organisation
            // relationship. Branding does not mutate any registry record.
            return resolveTrainingProviderContext({
                credential: record,
                origin: window.location.origin,
                getDocument: async (collectionName, documentId) => {
                    const snapshot = await getDoc(doc(db, collectionName, documentId));
                    return snapshot.exists() ? { id: snapshot.id, data: snapshot.data() } : null;
                },
                findRecords: async (collectionName, fieldName, value) => {
                    const result = await getDocs(query(
                        collection(db, collectionName), where(fieldName, "==", value), limit(2)
                    ));
                    return result.docs.map(snapshot => ({ id: snapshot.id, data: snapshot.data() }));
                }
            });
        }

        async function renderTrainerCertificatePreview(record) {
            const requestVersion = ++previewRequestVersion;
            disablePdfButton();
            const isCurrent = () => requestVersion === previewRequestVersion && window.loadedCredential === record;
            try {
                if (!trainerCertificatePreview) {
                    throw new Error("Trainer Certificate preview container is unavailable.");
                }
                const response = await fetch(TEMPLATE_URL, { cache: "no-store" });
                if (!response.ok) throw new Error(`Trainer Certificate template failed with HTTP ${response.status}.`);
                const template = await response.text();
                const trainerContext = await resolveTrainerContext(record);
                if (!isCurrent()) return false;
                const pdfRenderContainer = document.getElementById("pdfRenderContainer");
                if (!pdfRenderContainer) throw new Error("Trainer Certificate export container is unavailable.");
                trainerCertificatePreview.innerHTML = template;
                pdfRenderContainer.innerHTML = template;
                populateCertificateSurface(trainerCertificatePreview, record, trainerContext);
                populateCertificateSurface(pdfRenderContainer, record, trainerContext);
                return true;
            } catch (error) {
                if (!isCurrent()) return false;
                throw error;
            }
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
                trainerContext.provider.name
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
                    record,
                    trainerContext?.batch
                )
            );

            const emblem =
                container.querySelector(
                    "#trainercertOrganizationEmblem"
                );

            if (
                emblem
            ) {

                emblem.removeAttribute("src");
                emblem.alt = `${trainerContext.provider.name} logo`;
                emblem.hidden = !trainerContext.provider.logoUrl;
                emblem.style.display = trainerContext.provider.logoUrl ? "block" : "none";
                if (trainerContext.provider.logoUrl) emblem.src = trainerContext.provider.logoUrl;

            }

            registerProviderRender(
                container.querySelector(".trainer-certificate-template"),
                normalizeString(record?.credential_id),
                trainerContext.provider
            );

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
            record,
            batch
        ) {

            const startDate =
                batch?.training_start_date ||
                batch?.trainingStartDate ||
                batch?.start_date ||
                batch?.startDate ||
                record?.training_start_date ||
                record?.trainingStartDate ||
                "";

            const endDate =
                batch?.training_end_date ||
                batch?.trainingEndDate ||
                batch?.end_date ||
                batch?.endDate ||
                record?.training_end_date ||
                record?.trainingEndDate ||
                "";

            const formattedStartDate =
                formatDate(
                    startDate
                );

            const formattedEndDate =
                formatDate(
                    endDate
                );

            if (
                formattedStartDate !== "-" &&
                formattedEndDate !== "-"
            ) {

                return (
                    `${formattedStartDate} - ${formattedEndDate}`
                );

            }

            if (
                formattedStartDate !== "-"
            ) {

                return formattedStartDate;

            }

            if (
                formattedEndDate !== "-"
            ) {

                return formattedEndDate;

            }

            return "-";

        }


        /* ==================================================
           STATE RESET
        ================================================== */

        function resetLoadedCredentialState() {

            ++previewRequestVersion;

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
                                `Trainer Certificate preview could not be prepared. ${error.message || ""}`
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

                try {

                    console.info(
                        `[${MODULE_NAME}] Trainer Certificate PDF generation requested.`,
                        {
                            credentialId:
                                normalizeString(
                                    window.loadedCredential?.credential_id
                                ),

                            learnerName:
                                normalizeString(
                                    window.loadedCredential?.full_name
                                ),

                            programCode:
                                normalizeUppercase(
                                    window.loadedCredential?.program_code
                                )
                        }
                    );

                    assertProviderRender(
                        document.querySelector("#pdfRenderContainer .trainer-certificate-template"),
                        normalizeString(window.loadedCredential?.credential_id)
                    );
                    await window.generateTrainerCertificatePdf();

                }
                catch (
                    error
                ) {

                    console.error(
                        `[${MODULE_NAME}] Trainer Certificate PDF generation failed:`,
                        error
                    );

                    alert(
                        "Trainer Certificate PDF could not be generated."
                    );

                }

            }
        );


        /* ==================================================
           INITIALIZATION
        ================================================== */

        disablePdfButton();

        loadRegistry()
            .catch(
                (
                    error
                ) => {

                    console.error(
                        `[${MODULE_NAME}] Registry initialization failed:`,
                        error
                    );

                }
            );

        console.info(
            `[${MODULE_NAME}] Loaded v${MODULE_VERSION}.`,
            {
                collections: {
                    batches:
                        COLLECTIONS.BATCHES,

                    trainers:
                        COLLECTIONS.TRAINERS,

                    trainingOrganizations:
                        COLLECTIONS.TRAINING_ORGANIZATIONS
                }
            }
        );

    }
);