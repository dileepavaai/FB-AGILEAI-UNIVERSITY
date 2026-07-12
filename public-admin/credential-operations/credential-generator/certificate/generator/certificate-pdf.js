/*

Agile AI University
Credential Operations Suite

Certificate Generator
PDF Export Engine

Version: 1.3.4

Purpose:
- Generate PDF from Certificate Template
- Enforce ISO A4 Landscape Standard
- Upload generated PDF to Firebase Storage
- Publish asset metadata to credential_assets
- Preserve local PDF download
- Emit Storage initialization diagnostics for upload troubleshooting
- Verify the active Firebase Storage endpoint before upload
- Preserve learner ownership when publishing credential assets

Governance:
- Admin Portal publishes generated assets
- Student Portal only consumes published assets
- credentials collection is the source of truth
- credential_assets is the asset registry only
- Generated assets must be uploaded before publication
- Published asset records must contain real Storage URLs
- Published credential assets must contain learner_uid
- learner_uid must originate from the authoritative credential record
- Diagnostic logging must not modify credential or asset data
- Storage uploads must use the production Storage bucket
- Asset publication must not proceed without learner ownership

Change History:

v1.3.4
- Adds learner_uid resolution from the loaded credential record
- Supports governed learner UID field aliases for backward compatibility
- Validates learner_uid before uploading or publishing an asset
- Includes learner_uid in the university certificate publication payload
- Prevents orphaned credential asset records
- Preserves Storage upload, URL generation, publication, and local download
- Improves generation and publication diagnostics

v1.3.3
- Updated to consume Firebase Core v3.0.2
- Logs both the configured Storage bucket and the active Storage endpoint
- Logs the Firebase Storage host before upload
- Confirms the resolved credential asset path before upload
- Preserves existing PDF generation, upload, publication, and local download behaviour

v1.3.2
- Adds Firebase Storage initialization diagnostics
- Logs the active Storage bucket before upload
- Logs the active Firebase project ID before upload
- Logs the resolved credential asset storage path
- Supports troubleshooting of Admin credential asset publishing failures
- Preserves existing PDF generation, upload, publication, and local download behaviour

v1.3.1
- Generates an ISO A4 landscape certificate PDF
- Converts the certificate template into a PDF asset
- Uploads the generated PDF to Firebase Storage
- Retrieves the Firebase Storage download URL
- Publishes certificate metadata to credential_assets
- Preserves local certificate PDF download

*/

import {
    storage
} from "../../../../assets/js/core.js?v=3.0.2";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


/* =====================================================
   CONSTANTS
===================================================== */

const MODULE_NAME =
    "CertificatePdf";

const MODULE_VERSION =
    "1.3.4";

const ASSET_TYPE =
    "university_certificate";

const MIME_TYPE =
    "application/pdf";


/* =====================================================
   STRING NORMALIZATION
===================================================== */

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


/* =====================================================
   CREDENTIAL RESOLUTION
===================================================== */

function resolveLoadedCredential() {

    return (
        window.loadedCredential ||
        window.currentCredential ||
        window.selectedCredential ||
        null
    );

}


/* =====================================================
   CREDENTIAL ID RESOLUTION
===================================================== */

function resolveCredentialId(
    credential
) {

    return normalizeString(
        credential?.credential_id ||
        credential?.credentialId ||
        credential?.id
    );

}


/* =====================================================
   LEARNER UID RESOLUTION
===================================================== */

function resolveLearnerUid(
    credential
) {

    /*
     * learner_uid is the governed field.
     *
     * Additional aliases are supported only for backward
     * compatibility with historic credential records.
     */

    return normalizeString(
        credential?.learner_uid ||
        credential?.learnerUid ||
        credential?.user_uid ||
        credential?.userUid ||
        credential?.firebase_uid ||
        credential?.firebaseUid ||
        credential?.uid ||
        credential?.student_uid ||
        credential?.studentUid
    );

}


/* =====================================================
   OPTIONAL METADATA RESOLUTION
===================================================== */

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


/* =====================================================
   DEPENDENCY VALIDATION
===================================================== */

function validateDependencies() {

    if (
        typeof window.html2canvas !== "function"
    ) {

        throw new Error(
            "html2canvas is not available."
        );

    }

    if (
        !window.jspdf ||
        typeof window.jspdf.jsPDF !== "function"
    ) {

        throw new Error(
            "jsPDF is not available."
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
            .publishUniversityCertificate !== "function"
    ) {

        throw new Error(
            "CredentialAssetPublisher.publishUniversityCertificate is not available."
        );

    }

    if (
        !storage
    ) {

        throw new Error(
            "Firebase Storage is not initialized."
        );

    }

}


/* =====================================================
   CERTIFICATE ELEMENT RESOLUTION
===================================================== */

function resolveCertificateElement() {

    return document.querySelector(
        "#pdfRenderContainer .certificate-template"
    );

}


/* =====================================================
   STORAGE DIAGNOSTICS
===================================================== */

function logStorageDiagnostics(
    storagePath,
    credentialId,
    learnerUid
) {

    console.info(
        `[${MODULE_NAME}] Storage diagnostics:`,
        {
            moduleVersion:
                MODULE_VERSION,

            configuredBucket:
                storage?.app?.options?.storageBucket ||
                "missing",

            projectId:
                storage?.app?.options?.projectId ||
                "missing",

            storageHost:
                storage?._location?.bucket ||
                storage?._bucket?.bucket ||
                "unavailable",

            storagePath,

            credentialId,

            learnerUidPresent:
                Boolean(
                    learnerUid
                )
        }
    );

}


/* =====================================================
   PDF CREATION
===================================================== */

async function createCertificatePdf(
    certificateElement
) {

    const canvas =
        await window.html2canvas(
            certificateElement,
            {
                scale:
                    2,

                useCORS:
                    true,

                backgroundColor:
                    "#ffffff",

                logging:
                    false
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
        297,
        210
    );

    return pdf;

}


/* =====================================================
   ASSET PUBLICATION PAYLOAD
===================================================== */

function buildPublicationPayload({
    credential,
    credentialId,
    learnerUid,
    downloadUrl,
    storagePath,
    fileName
}) {

    const learnerEmail =
        resolveLearnerEmail(
            credential
        );

    const learnerName =
        resolveLearnerName(
            credential
        );

    const programCode =
        resolveProgramCode(
            credential
        );

    const payload = {

        credential_id:
            credentialId,

        learner_uid:
            learnerUid,

        download_url:
            downloadUrl,

        preview_url:
            downloadUrl,

        storage_path:
            storagePath,

        file_name:
            fileName,

        asset_type:
            ASSET_TYPE,

        mime_type:
            MIME_TYPE,

        version:
            1

    };

    /*
     * Optional metadata is included only when available.
     * The authoritative ownership field remains learner_uid.
     */

    if (
        learnerEmail
    ) {

        payload.learner_email =
            learnerEmail;

    }

    if (
        learnerName
    ) {

        payload.learner_name =
            learnerName;

    }

    if (
        programCode
    ) {

        payload.program_code =
            programCode;

    }

    return payload;

}


/* =====================================================
   GENERATE AND PUBLISH
===================================================== */

window.generateCertificatePdf =
    async function generateCertificatePdf() {

        try {

            validateDependencies();

            const certificateElement =
                resolveCertificateElement();

            if (
                !certificateElement
            ) {

                alert(
                    "Certificate preview not found."
                );

                return;

            }

            const credential =
                resolveLoadedCredential();

            if (
                !credential
            ) {

                alert(
                    "Credential data is not available for asset publishing."
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
                    "Credential ID is missing. The certificate cannot be published."
                );

                return;

            }

            const learnerUid =
                resolveLearnerUid(
                    credential
                );

            if (
                !learnerUid
            ) {

                console.error(
                    `[${MODULE_NAME}] learner_uid could not be resolved.`,
                    {
                        credentialId,
                        availableCredentialFields:
                            Object.keys(
                                credential
                            )
                    }
                );

                alert(
                    "Learner UID is missing from the credential record. The certificate was not published."
                );

                return;

            }

            console.info(
                `[${MODULE_NAME}] Generation started.`,
                {
                    credentialId,
                    learnerUid,
                    moduleVersion:
                        MODULE_VERSION
                }
            );

            const pdf =
                await createCertificatePdf(
                    certificateElement
                );

            console.info(
                `[${MODULE_NAME}] PDF generation completed.`,
                {
                    credentialId
                }
            );

            const fileName =
                `${credentialId}_university_certificate.pdf`;

            const storagePath =
                `credential-assets/${credentialId}/university-certificate/${fileName}`;

            const pdfBlob =
                pdf.output(
                    "blob"
                );

            logStorageDiagnostics(
                storagePath,
                credentialId,
                learnerUid
            );

            const storageRef =
                ref(
                    storage,
                    storagePath
                );

            await uploadBytes(
                storageRef,
                pdfBlob,
                {
                    contentType:
                        MIME_TYPE,

                    customMetadata: {
                        credential_id:
                            credentialId,

                        learner_uid:
                            learnerUid,

                        asset_type:
                            ASSET_TYPE,

                        generated_source:
                            "admin_portal"
                    }
                }
            );

            console.info(
                `[${MODULE_NAME}] Upload completed.`,
                {
                    credentialId,
                    storagePath
                }
            );

            const downloadUrl =
                await getDownloadURL(
                    storageRef
                );

            console.info(
                `[${MODULE_NAME}] Download URL generated.`,
                {
                    credentialId,
                    downloadUrlPresent:
                        Boolean(
                            downloadUrl
                        )
                }
            );

            if (
                !normalizeString(
                    downloadUrl
                )
            ) {

                throw new Error(
                    "Firebase Storage did not return a download URL."
                );

            }

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
                `[${MODULE_NAME}] Publishing credential asset metadata.`,
                {
                    credential_id:
                        publicationPayload.credential_id,

                    learner_uid:
                        publicationPayload.learner_uid,

                    asset_type:
                        publicationPayload.asset_type,

                    storage_path:
                        publicationPayload.storage_path
                }
            );

            await window.CredentialAssetPublisher
                .publishUniversityCertificate(
                    publicationPayload
                );

            console.info(
                `[${MODULE_NAME}] Asset publication completed.`,
                {
                    credentialId,
                    learnerUid
                }
            );

            pdf.save(
                fileName
            );

            console.info(
                `[${MODULE_NAME}] Local download completed.`,
                {
                    fileName
                }
            );

            alert(
                "University Certificate generated and published successfully."
            );

        }
        catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] PDF generation or publishing failed:`,
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
                    `PDF generation or publishing failed: ${errorMessage}`
                );

                return;

            }

            alert(
                "PDF generation or publishing failed."
            );

        }

    };


/* =====================================================
   MODULE READY
===================================================== */

console.info(
    `[${MODULE_NAME}] Loaded v${MODULE_VERSION}.`
);