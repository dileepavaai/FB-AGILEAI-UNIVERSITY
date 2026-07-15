/* ==========================================================
   Agile AI University
   Credential Operations Suite

   File      : trainer-certificate-pdf.js
   Component : Trainer Certificate PDF Publication Engine
   Version   : 1.4.0
   Status    : ACTIVE
   Phase     : Credential-First Asset Publication

   Purpose
   ----------------------------------------------------------
   • Generate a Trainer Certificate PDF
   • Enforce ISO A4 Landscape rendering
   • Support trainer attribution
   • Support licensed training organization rendering
   • Upload the generated PDF to Firebase Storage
   • Publish asset metadata to credential_assets
   • Preserve local PDF download

   Responsibilities
   ----------------------------------------------------------
   ✓ Resolve the selected credential
   ✓ Resolve the governed certificate rendering surface
   ✓ Wait for organization-emblem rendering
   ✓ Render the certificate with html2canvas
   ✓ Generate an ISO A4 landscape PDF
   ✓ Upload the PDF to Firebase Storage
   ✓ Resolve the published download URL
   ✓ Publish through CredentialAssetPublisher
   ✓ Support historical credentials without learner_uid
   ✓ Download the successfully published PDF locally

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Modify credentials
   ✗ Assign credential ownership
   ✗ Perform identity reconciliation
   ✗ Create Firebase Authentication users
   ✗ Modify trainer registry records
   ✗ Modify organization registry records
   ✗ Generate University Certificates
   ✗ Generate Digital Badges
   ✗ Render the Admin Portal interface

   PDF Governance
   ----------------------------------------------------------
   • PDF format: ISO A4 Landscape
   • Page size: 297mm × 210mm
   • No dynamic page sizing
   • No portrait rendering
   • Fixed rendering dimensions
   • Template authority:
     trainer-certificate-template.html

   Credential Governance
   ----------------------------------------------------------
   • credentials is the credential source of truth
   • credential_id is the permanent asset authority
   • learner_uid is optional before identity activation
   • Existing learner ownership must not be cleared
   • credential_assets is the published asset registry
   • Admin Portal is the asset-generation authority
   • Student Portal is a read-only consumer

   Rendering Governance
   ----------------------------------------------------------
   Must Render:

   • Learner Name
   • Credential Title
   • Credential ID
   • Accredited Trainer Name
   • Trainer ID
   • Licensed Training Organization Name
   • Licensed Training Organization Emblem

   Must Not Render:

   • Trainer Signature
   • Dynamic Layout Variations
   • Non-Governed Content

   Audit Events
   ----------------------------------------------------------
   • trainercertificate.generate.started
   • trainercertificate.generate.completed
   • trainercertificate.upload.completed
   • trainercertificate.publish.completed
   • trainercertificate.download.completed

   Change History
   ----------------------------------------------------------
   v1.4.0
   • Added Firebase Storage upload
   • Added published download URL resolution
   • Added credential_assets publication
   • Added credential-first historical alumni support
   • Made learner_uid optional before activation
   • Added deterministic Storage paths and filenames
   • Preserved organization-emblem synchronization
   • Preserved governed A4 landscape rendering
   • Preserved local PDF download

   v1.3.0
   • Added organization emblem synchronization
   • Added PDF rendering stabilization delay
   • Improved Firebase Storage image support
   • Improved html2canvas rendering reliability

   v1.2.0
   • Initial PDF rendering implementation

========================================================== */

import {
    storage
} from "../../../../assets/js/core.js?v=3.0.2";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


/* ==========================================================
   CONSTANTS
========================================================== */

const MODULE_NAME =
    "TrainerCertificatePdf";

const MODULE_VERSION =
    "1.4.0";

const ASSET_TYPE =
    "trainer_certificate";

const MIME_TYPE =
    "application/pdf";

const PDF_WIDTH_MM =
    297;

const PDF_HEIGHT_MM =
    210;

const RENDER_SCALE =
    3;

const RENDER_STABILIZATION_DELAY_MS =
    500;


/* ==========================================================
   NORMALIZATION
========================================================== */

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


/* ==========================================================
   DEPENDENCY VALIDATION
========================================================== */

function validateDependencies() {

    if (
        typeof window.html2canvas !==
        "function"
    ) {

        throw new Error(
            "html2canvas is not available."
        );

    }

    if (
        !window.jspdf ||
        typeof window.jspdf.jsPDF !==
        "function"
    ) {

        throw new Error(
            "jsPDF is not available."
        );

    }

    if (
        !storage
    ) {

        throw new Error(
            "Firebase Storage is not initialized."
        );

    }

    if (
        !window.CredentialAssetPublisher
    ) {

        throw new Error(
            "CredentialAssetPublisher is not available."
        );

    }

    if (
        typeof window.CredentialAssetPublisher
            .publishTrainerCertificate !==
        "function"
    ) {

        throw new Error(
            "CredentialAssetPublisher.publishTrainerCertificate is not available."
        );

    }

}


/* ==========================================================
   CREDENTIAL RESOLUTION
========================================================== */

function resolveLoadedCredential() {

    /*
     * Different generator controllers historically exposed
     * the selected credential using different global names.
     *
     * The first available authoritative registry record is
     * used. No credential data is created or inferred here.
     */

    return (
        window.loadedCredential ||
        window.currentCredential ||
        window.selectedCredential ||
        window.trainerCredential ||
        window.trainerCertificateCredential ||
        window.trainerCertificateContext?.credential ||
        window.trainerContext?.credential ||
        null
    );

}

function resolveCredentialId(
    credential
) {

    return normalizeString(
        credential?.credential_id ||
        credential?.credentialId ||
        credential?.id
    );

}

function resolveLearnerUid(
    credential
) {

    return normalizeString(
        credential?.learner_uid ||
        credential?.learnerUid ||
        credential?.user_uid ||
        credential?.userUid ||
        credential?.firebase_uid ||
        credential?.firebaseUid ||
        credential?.student_uid ||
        credential?.studentUid ||
        credential?.uid
    );

}

function resolveLearnerName(
    credential
) {

    return normalizeString(
        credential?.full_name ||
        credential?.fullName ||
        credential?.learner_name ||
        credential?.learnerName ||
        credential?.name
    );

}

function resolveLearnerEmail(
    credential
) {

    return normalizeString(
        credential?.email ||
        credential?.learner_email ||
        credential?.learnerEmail ||
        credential?.email_address ||
        credential?.emailAddress
    );

}

function resolveProgramCode(
    credential
) {

    return normalizeString(
        credential?.program_code ||
        credential?.programCode ||
        credential?.credential_type ||
        credential?.credentialType
    );

}


/* ==========================================================
   RENDERING SURFACE
========================================================== */

function resolveCertificateElement() {

    return document.querySelector(
        "#pdfRenderContainer .trainer-certificate-template"
    );

}


/* ==========================================================
   IMAGE SYNCHRONIZATION
========================================================== */

async function waitForImage(
    imageElement
) {

    if (
        !imageElement ||
        !normalizeString(
            imageElement.src
        )
    ) {

        return;

    }

    console.info(
        `[${MODULE_NAME}] Waiting for organization emblem.`
    );

    await new Promise(
        (
            resolve
        ) => {

            if (
                imageElement.complete &&
                imageElement.naturalWidth > 0
            ) {

                resolve();

                return;

            }

            const complete =
                () => {

                    imageElement.onload =
                        null;

                    imageElement.onerror =
                        null;

                    resolve();

                };

            imageElement.onload =
                complete;

            imageElement.onerror =
                complete;

        }
    );

    /*
     * Allows image decoding and browser layout calculation
     * to stabilize before html2canvas captures the surface.
     */
    await new Promise(
        (
            resolve
        ) => {

            window.setTimeout(
                resolve,
                RENDER_STABILIZATION_DELAY_MS
            );

        }
    );

}


/* ==========================================================
   PDF CREATION
========================================================== */

async function createTrainerCertificatePdf(
    certificateElement
) {

    const organizationLogo =
        certificateElement.querySelector(
            "#trainercertOrganizationEmblem"
        );

    await waitForImage(
        organizationLogo
    );

    const canvas =
        await window.html2canvas(
            certificateElement,
            {
                scale:
                    RENDER_SCALE,

                useCORS:
                    true,

                allowTaint:
                    false,

                backgroundColor:
                    "#ffffff",

                logging:
                    false
            }
        );

    console.info(
        `[${MODULE_NAME}] Canvas rendered.`,
        {
            width:
                canvas.width,

            height:
                canvas.height
        }
    );

    const imageData =
        canvas.toDataURL(
            "image/png"
        );

    const {
        jsPDF
    } = window.jspdf;

    const pdf =
        new jsPDF({
            orientation:
                "landscape",

            unit:
                "mm",

            format:
                "a4"
        });

    pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        PDF_WIDTH_MM,
        PDF_HEIGHT_MM
    );

    return pdf;

}


/* ==========================================================
   PUBLICATION PAYLOAD
========================================================== */

function buildPublicationPayload({
    credential,
    credentialId,
    learnerUid,
    downloadUrl,
    storagePath,
    fileName
}) {

    const payload = {

        credential_id:
            credentialId,

        /*
         * null is valid before identity activation.
         */
        learner_uid:
            learnerUid ||
            null,

        asset_type:
            ASSET_TYPE,

        storage_path:
            storagePath,

        download_url:
            downloadUrl,

        preview_url:
            downloadUrl,

        file_name:
            fileName,

        file_extension:
            "pdf",

        mime_type:
            MIME_TYPE,

        asset_format:
            "pdf",

        version:
            1

    };

    const learnerName =
        resolveLearnerName(
            credential
        );

    const learnerEmail =
        resolveLearnerEmail(
            credential
        );

    const programCode =
        resolveProgramCode(
            credential
        );

    if (
        learnerName
    ) {

        payload.learner_name =
            learnerName;

    }

    if (
        learnerEmail
    ) {

        payload.learner_email =
            learnerEmail;

    }

    if (
        programCode
    ) {

        payload.program_code =
            programCode;

    }

    return payload;

}


/* ==========================================================
   GENERATE, UPLOAD, PUBLISH AND DOWNLOAD
========================================================== */

window.generateTrainerCertificatePdf =
    async function generateTrainerCertificatePdf() {

        try {

            validateDependencies();

            const certificateElement =
                resolveCertificateElement();

            if (
                !certificateElement
            ) {

                alert(
                    "Trainer certificate preview not found."
                );

                return;

            }

            const credential =
                resolveLoadedCredential();

            if (
                !credential
            ) {

                console.error(
                    `[${MODULE_NAME}] Selected credential could not be resolved.`,
                    {
                        availableGlobals: {
                            loadedCredential:
                                Boolean(
                                    window.loadedCredential
                                ),

                            currentCredential:
                                Boolean(
                                    window.currentCredential
                                ),

                            selectedCredential:
                                Boolean(
                                    window.selectedCredential
                                ),

                            trainerCredential:
                                Boolean(
                                    window.trainerCredential
                                ),

                            trainerCertificateContext:
                                Boolean(
                                    window.trainerCertificateContext
                                ),

                            trainerContext:
                                Boolean(
                                    window.trainerContext
                                )
                        }
                    }
                );

                alert(
                    "Credential data is not available for Trainer Certificate publishing."
                );

                return;

            }

            const credentialId =
                resolveCredentialId(
                    credential
                );

            if (
                !credentialId
            ) {

                alert(
                    "Credential ID is missing. The Trainer Certificate cannot be published."
                );

                return;

            }

            /*
             * Historical credentials may legitimately exist
             * before a Firebase Authentication UID has been
             * assigned.
             */
            const learnerUid =
                resolveLearnerUid(
                    credential
                ) ||
                null;

            console.info(
                `[${MODULE_NAME}] trainercertificate.generate.started`,
                {
                    moduleVersion:
                        MODULE_VERSION,

                    credentialId,

                    learnerUidPresent:
                        Boolean(
                            learnerUid
                        ),

                    renderedWidth:
                        certificateElement.offsetWidth,

                    renderedHeight:
                        certificateElement.offsetHeight,

                    scrollWidth:
                        certificateElement.scrollWidth,

                    scrollHeight:
                        certificateElement.scrollHeight
                }
            );

            const pdf =
                await createTrainerCertificatePdf(
                    certificateElement
                );

            console.info(
                `[${MODULE_NAME}] trainercertificate.generate.completed`,
                {
                    credentialId
                }
            );

            const fileName =
                `${credentialId}_trainer_certificate.pdf`;

            const storagePath =
                `credential-assets/${credentialId}/trainer-certificate/${fileName}`;

            const pdfBlob =
                pdf.output(
                    "blob"
                );

            const storageReference =
                ref(
                    storage,
                    storagePath
                );

            /*
             * Firebase Storage custom metadata values must
             * be strings. learner_uid is added only when it
             * exists.
             */
            const customMetadata = {

                credential_id:
                    credentialId,

                asset_type:
                    ASSET_TYPE,

                generated_source:
                    "admin_portal"

            };

            if (
                learnerUid
            ) {

                customMetadata.learner_uid =
                    learnerUid;

            }

            await uploadBytes(
                storageReference,
                pdfBlob,
                {
                    contentType:
                        MIME_TYPE,

                    customMetadata
                }
            );

            console.info(
                `[${MODULE_NAME}] trainercertificate.upload.completed`,
                {
                    credentialId,
                    storagePath
                }
            );

            const downloadUrl =
                await getDownloadURL(
                    storageReference
                );

            if (
                !normalizeString(
                    downloadUrl
                )
            ) {

                throw new Error(
                    "Firebase Storage did not return a Trainer Certificate download URL."
                );

            }

            console.info(
                `[${MODULE_NAME}] Trainer Certificate download URL resolved.`,
                {
                    credentialId,
                    downloadUrlPresent:
                        Boolean(
                            downloadUrl
                        )
                }
            );

            const publicationPayload =
                buildPublicationPayload({
                    credential,
                    credentialId,
                    learnerUid,
                    downloadUrl,
                    storagePath,
                    fileName
                });

            console.info(
                `[${MODULE_NAME}] Publishing Trainer Certificate metadata.`,
                {
                    credentialId:
                        publicationPayload.credential_id,

                    learnerUidPresent:
                        Boolean(
                            publicationPayload.learner_uid
                        ),

                    assetType:
                        publicationPayload.asset_type,

                    storagePath:
                        publicationPayload.storage_path
                }
            );

            await window.CredentialAssetPublisher
                .publishTrainerCertificate(
                    publicationPayload
                );

            console.info(
                `[${MODULE_NAME}] trainercertificate.publish.completed`,
                {
                    credentialId,
                    learnerUidPresent:
                        Boolean(
                            learnerUid
                        )
                }
            );

            /*
             * Local download occurs only after Storage upload
             * and Firestore publication succeed.
             */
            pdf.save(
                fileName
            );

            console.info(
                `[${MODULE_NAME}] trainercertificate.download.completed`,
                {
                    credentialId,
                    fileName
                }
            );

            alert(
                "Trainer Certificate generated and published successfully."
            );

        }
        catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] Trainer Certificate generation or publishing failed:`,
                error
            );

            const errorMessage =
                normalizeString(
                    error?.message
                );

            if (
                errorMessage
            ) {

                alert(
                    `Trainer Certificate generation or publishing failed: ${errorMessage}`
                );

                return;

            }

            alert(
                "Trainer Certificate generation or publishing failed."
            );

        }

    };


/* ==========================================================
   MODULE READY
========================================================== */

console.info(
    `[${MODULE_NAME}] Loaded v${MODULE_VERSION}.`
);