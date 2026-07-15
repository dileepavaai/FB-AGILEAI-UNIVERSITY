/* ==========================================================
   Agile AI University
   Credential Operations Suite

   Badge Generator
   PNG Export and Publication Engine

   File      : badge-png.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Credential-First Asset Publication

   Purpose
   ----------------------------------------------------------
   • Generate PNG from the Badge Template
   • Upload the generated PNG to Firebase Storage
   • Publish badge metadata to credential_assets
   • Preserve local badge download

   Governance
   ----------------------------------------------------------
   • Admin Portal is the badge-generation authority
   • credentials is the credential source of truth
   • credential_assets is the asset registry
   • credential_id is the permanent asset authority
   • learner_uid is optional before identity activation
   • Student Portal is a read-only asset consumer
   • Generated assets must be uploaded before publication
   • Published assets must contain real Storage URLs
   • Plain credential data must not be mutated
   • Badge format is PNG only

   Audit Events
   ----------------------------------------------------------
   • badge.generate.started
   • badge.generate.completed
   • badge.upload.completed
   • badge.publish.completed
   • badge.download.completed

   Change History
   ----------------------------------------------------------
   v1.1.0
   • Added Firebase Storage upload
   • Added download URL resolution
   • Added credential_assets publication
   • Added credential-first historical alumni support
   • Added optional learner_uid handling
   • Added deterministic file and Storage paths
   • Preserved local PNG download

   v1.0.0
   • Added local PNG generation and download

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
    "BadgePng";

const MODULE_VERSION =
    "1.1.0";

const ASSET_TYPE =
    "digital_badge";

const MIME_TYPE =
    "image/png";


/* ==========================================================
   STRING NORMALIZATION
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
   CREDENTIAL RESOLUTION
========================================================== */

function resolveLoadedCredential() {

    return (
        window.loadedCredential ||
        window.currentCredential ||
        window.selectedCredential ||
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
        credential?.uid ||
        credential?.student_uid ||
        credential?.studentUid
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
            .publishDigitalBadge !==
        "function"
    ) {

        throw new Error(
            "CredentialAssetPublisher.publishDigitalBadge is not available."
        );

    }

}


/* ==========================================================
   BADGE ELEMENT RESOLUTION
========================================================== */

function resolveBadgeElement() {

    return document.querySelector(
        "#pngRenderContainer .badge-template"
    );

}


/* ==========================================================
   CANVAS TO BLOB
========================================================== */

function canvasToBlob(
    canvas
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            canvas.toBlob(
                (
                    blob
                ) => {

                    if (
                        !blob
                    ) {

                        reject(
                            new Error(
                                "Unable to create the badge PNG."
                            )
                        );

                        return;

                    }

                    resolve(
                        blob
                    );

                },
                MIME_TYPE,
                1
            );

        }
    );

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

        learner_uid:
            learnerUid ||
            null,

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

        file_extension:
            "png",

        asset_format:
            "png",

        version:
            1

    };

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


/* ==========================================================
   LOCAL DOWNLOAD
========================================================== */

function downloadBadge(
    blob,
    fileName
) {

    const objectUrl =
        URL.createObjectURL(
            blob
        );

    const downloadLink =
        document.createElement(
            "a"
        );

    downloadLink.href =
        objectUrl;

    downloadLink.download =
        fileName;

    document.body.appendChild(
        downloadLink
    );

    downloadLink.click();

    document.body.removeChild(
        downloadLink
    );

    URL.revokeObjectURL(
        objectUrl
    );

}


/* ==========================================================
   GENERATE, UPLOAD, PUBLISH AND DOWNLOAD
========================================================== */

window.generateBadgePng =
    async function generateBadgePng() {

        try {

            validateDependencies();

            const badgeElement =
                resolveBadgeElement();

            if (
                !badgeElement
            ) {

                alert(
                    "Badge preview not found."
                );

                return;

            }

            const credential =
                resolveLoadedCredential();

            if (
                !credential
            ) {

                alert(
                    "Credential data is not available for badge publishing."
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
                    "Credential ID is missing. The badge cannot be published."
                );

                return;

            }

            /*
             * Historical credentials may not yet have a
             * Firebase UID. This is permitted under the
             * credential-first publication model.
             */
            const learnerUid =
                resolveLearnerUid(
                    credential
                ) ||
                null;

            console.info(
                `[${MODULE_NAME}] badge.generate.started`,
                {
                    moduleVersion:
                        MODULE_VERSION,

                    credentialId,

                    learnerUidPresent:
                        Boolean(
                            learnerUid
                        )
                }
            );

            const canvas =
                await window.html2canvas(
                    badgeElement,
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

            const pngBlob =
                await canvasToBlob(
                    canvas
                );

            console.info(
                `[${MODULE_NAME}] badge.generate.completed`,
                {
                    credentialId,
                    blobSize:
                        pngBlob.size
                }
            );

            const fileName =
                `${credentialId}_digital_badge.png`;

            const storagePath =
                `credential-assets/${credentialId}/digital-badge/${fileName}`;

            const storageRef =
                ref(
                    storage,
                    storagePath
                );

            const customMetadata = {

                credential_id:
                    credentialId,

                asset_type:
                    ASSET_TYPE,

                generated_source:
                    "admin_portal"

            };

            /*
             * Firebase Storage custom metadata values must be
             * strings. learner_uid is therefore added only
             * when it exists.
             */
            if (
                learnerUid
            ) {

                customMetadata.learner_uid =
                    learnerUid;

            }

            await uploadBytes(
                storageRef,
                pngBlob,
                {
                    contentType:
                        MIME_TYPE,

                    customMetadata
                }
            );

            console.info(
                `[${MODULE_NAME}] badge.upload.completed`,
                {
                    credentialId,
                    storagePath
                }
            );

            const downloadUrl =
                await getDownloadURL(
                    storageRef
                );

            if (
                !normalizeString(
                    downloadUrl
                )
            ) {

                throw new Error(
                    "Firebase Storage did not return a badge download URL."
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
                `[${MODULE_NAME}] Publishing digital badge metadata.`,
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
                .publishDigitalBadge(
                    publicationPayload
                );

            console.info(
                `[${MODULE_NAME}] badge.publish.completed`,
                {
                    credentialId,
                    learnerUidPresent:
                        Boolean(
                            learnerUid
                        )
                }
            );

            downloadBadge(
                pngBlob,
                fileName
            );

            console.info(
                `[${MODULE_NAME}] badge.download.completed`,
                {
                    credentialId,
                    fileName
                }
            );

            alert(
                "Digital Badge generated and published successfully."
            );

        }
        catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] Badge generation or publishing failed:`,
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
                    `Badge generation or publishing failed: ${errorMessage}`
                );

                return;

            }

            alert(
                "Badge generation or publishing failed."
            );

        }

    };


/* ==========================================================
   MODULE READY
========================================================== */

console.info(
    `[${MODULE_NAME}] Loaded v${MODULE_VERSION}.`
);