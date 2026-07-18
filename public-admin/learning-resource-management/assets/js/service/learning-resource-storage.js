/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-storage.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Protected Learning Resource Storage

   Purpose
   ----------------------------------------------------------
   Uploads governed learning-resource files to protected
   Firebase Storage paths.

   Responsibilities
   ----------------------------------------------------------
   ✓ Require an authenticated administrator
   ✓ Validate administrator role
   ✓ Validate file type and size
   ✓ Normalize protected Storage paths
   ✓ Prevent accidental object replacement
   ✓ Upload immutable learning-resource versions
   ✓ Return safe Storage metadata
   ✓ Avoid permanent Firebase download URLs

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Create Firestore resource records
   ✗ Publish resources
   ✗ Withdraw resources
   ✗ Generate download URLs
   ✗ Delete Storage objects
   ✗ Resolve learner entitlement
   ✗ Render UI
   ✗ Provide Student Portal access

   Governance
   ----------------------------------------------------------
   • Admin Portal is the upload authority
   • learning-resources is a protected Storage domain
   • Existing objects must never be overwritten
   • Replacement requires a new version path
   • Client-side deletion is prohibited
   • getDownloadURL() must not be used for protected files
   • Student access requires the future authorized broker

========================================================== */

import {
    auth,
    storage,
    getUserRole,
    normalizeEmail
} from "../../../../assets/js/core.js";

import {
    getMetadata,
    ref,
    uploadBytes
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
    LearningResourceContract
} from "../config/learning-resource-contract.js";


/* ==========================================================
   MODULE METADATA
========================================================== */

const MODULE_NAME =
    "LearningResourceStorage";

const MODULE_VERSION =
    "1.0.0";

const ALLOWED_ADMIN_ROLES =
    Object.freeze([
        "super_admin",
        "admin"
    ]);


/* ==========================================================
   AUTHORIZATION
========================================================== */

async function requireAuthorizedAdmin() {

    const user =
        auth.currentUser;

    if (
        !user
    ) {

        throw new Error(
            `[${MODULE_NAME}] Authentication required.`
        );

    }

    const role =
        await getUserRole(
            user.uid,
            user.email
        );

    if (
        !ALLOWED_ADMIN_ROLES.includes(
            role
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Administrator access required.`
        );

    }

    return Object.freeze({

        uid:
            user.uid,

        email:
            normalizeEmail(
                user.email
            ),

        role

    });

}


/* ==========================================================
   FILE VALIDATION
========================================================== */

function validateFile(
    file
) {

    if (
        !file ||
        typeof file !==
            "object"
    ) {

        throw new Error(
            `[${MODULE_NAME}] A file is required.`
        );

    }

    const fileName =
        LearningResourceContract.normalizeFileName(
            file.name
        );

    if (
        !fileName ||
        !LearningResourceContract.isValidFileName(
            fileName
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] The filename is invalid.`
        );

    }

    const mimeType =
        LearningResourceContract.normalizeString(
            file.type
        ).toLowerCase();

    if (
        !LearningResourceContract.isApprovedMimeType(
            mimeType
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Unsupported file type: ` +
            `${mimeType || "missing"}.`
        );

    }

    const fileSize =
        Number(
            file.size
        );

    if (
        !LearningResourceContract.isValidFileSize(
            fileSize
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] File size must be between ` +
            `1 byte and 50 MiB.`
        );

    }

    return Object.freeze({

        fileName,

        fileExtension:
            LearningResourceContract.getFileExtension(
                fileName
            ),

        mimeType,

        fileSize

    });

}


/* ==========================================================
   UPLOAD INPUT VALIDATION
========================================================== */

function normalizeUploadInput(
    input = {}
) {

    const programCode =
        LearningResourceContract.normalizeProgramCode(
            input.program_code ||
            input.programCode
        );

    const resourceId =
        LearningResourceContract.normalizeResourceId(
            input.resource_id ||
            input.resourceId
        );

    const version =
        LearningResourceContract.normalizeVersion(
            input.version
        );

    return Object.freeze({

        programCode,
        resourceId,
        version,
        file:
            input.file ||
            null

    });

}


function validateUploadIdentity(
    input
) {

    if (
        !input.programCode
    ) {

        throw new Error(
            `[${MODULE_NAME}] Programme code is required.`
        );

    }

    if (
        !/^[A-Z0-9][A-Z0-9_-]{1,19}$/.test(
            input.programCode
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Programme code is invalid.`
        );

    }

    if (
        !input.resourceId
    ) {

        throw new Error(
            `[${MODULE_NAME}] Resource ID is required.`
        );

    }

    if (
        !/^[a-z0-9][a-z0-9-]{2,79}$/.test(
            input.resourceId
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Resource ID is invalid.`
        );

    }

    if (
        !Number.isInteger(
            input.version
        ) ||
        input.version < 1
    ) {

        throw new Error(
            `[${MODULE_NAME}] Version must be a positive integer.`
        );

    }

}


/* ==========================================================
   OBJECT EXISTENCE
========================================================== */

async function objectExists(
    reference
) {

    try {

        await getMetadata(
            reference
        );

        return true;

    }
    catch (
        error
    ) {

        if (
            error?.code ===
            "storage/object-not-found"
        ) {

            return false;

        }

        console.error(
            `[${MODULE_NAME}] Unable to inspect Storage object:`,
            error
        );

        throw error;

    }

}


/* ==========================================================
   PROTECTED UPLOAD
========================================================== */

async function uploadProtectedResource(
    input = {}
) {

    const actor =
        await requireAuthorizedAdmin();

    const normalizedInput =
        normalizeUploadInput(
            input
        );

    validateUploadIdentity(
        normalizedInput
    );

    const fileMetadata =
        validateFile(
            normalizedInput.file
        );

    const storagePath =
        LearningResourceContract.buildStoragePath({

            programCode:
                normalizedInput.programCode,

            resourceId:
                normalizedInput.resourceId,

            version:
                normalizedInput.version,

            fileName:
                fileMetadata.fileName

        });

    if (
        !storagePath
    ) {

        throw new Error(
            `[${MODULE_NAME}] Unable to build a safe Storage path.`
        );

    }

    const storageReference =
        ref(
            storage,
            storagePath
        );

    /*
     * Preflight protection provides a clear operational error.
     *
     * Storage Rules independently deny updates, so an object
     * cannot be overwritten even if a race occurs after this
     * check.
     */
    const alreadyExists =
        await objectExists(
            storageReference
        );

    if (
        alreadyExists
    ) {

        throw new Error(
            `[${MODULE_NAME}] This resource version already exists. ` +
            `Create a new version instead of replacing it.`
        );

    }

    const uploadMetadata = {

        contentType:
            fileMetadata.mimeType,

        cacheControl:
            "private,max-age=0,no-store",

        customMetadata: {

            program_code:
                normalizedInput.programCode,

            resource_id:
                normalizedInput.resourceId,

            version:
                String(
                    normalizedInput.version
                ),

            source:
                "admin_portal",

            uploaded_by_uid:
                actor.uid,

            uploaded_by_email:
                actor.email

        }

    };

    try {

        const uploadResult =
            await uploadBytes(
                storageReference,
                normalizedInput.file,
                uploadMetadata
            );

        const persistedMetadata =
            uploadResult.metadata ||
            {};

        const result =
            Object.freeze({

                storagePath:
                    storagePath,

                fullPath:
                    persistedMetadata.fullPath ||
                    storagePath,

                bucket:
                    persistedMetadata.bucket ||
                    "",

                fileName:
                    fileMetadata.fileName,

                fileExtension:
                    fileMetadata.fileExtension,

                mimeType:
                    persistedMetadata.contentType ||
                    fileMetadata.mimeType,

                fileSize:
                    Number(
                        persistedMetadata.size ||
                        fileMetadata.fileSize
                    ),

                generation:
                    persistedMetadata.generation ||
                    "",

                metageneration:
                    persistedMetadata.metageneration ||
                    "",

                uploadedAt:
                    persistedMetadata.timeCreated ||
                    null,

                uploadedByUid:
                    actor.uid,

                uploadedByEmail:
                    actor.email,

                programCode:
                    normalizedInput.programCode,

                resourceId:
                    normalizedInput.resourceId,

                version:
                    normalizedInput.version

            });

        console.info(
            `[${MODULE_NAME}] Protected resource uploaded:`,
            {
                moduleVersion:
                    MODULE_VERSION,

                storagePath:
                    result.storagePath,

                programCode:
                    result.programCode,

                resourceId:
                    result.resourceId,

                version:
                    result.version,

                mimeType:
                    result.mimeType,

                fileSize:
                    result.fileSize,

                uploadedByUid:
                    result.uploadedByUid
            }
        );

        return result;

    }
    catch (
        error
    ) {

        console.error(
            `[${MODULE_NAME}] Protected resource upload failed:`,
            {
                moduleVersion:
                    MODULE_VERSION,

                storagePath,

                programCode:
                    normalizedInput.programCode,

                resourceId:
                    normalizedInput.resourceId,

                version:
                    normalizedInput.version,

                uploadedByUid:
                    actor.uid,

                error
            }
        );

        throw error;

    }

}


/* ==========================================================
   ADMIN METADATA LOOKUP
========================================================== */

async function getProtectedResourceMetadata(
    storagePath
) {

    await requireAuthorizedAdmin();

    const normalizedStoragePath =
        LearningResourceContract.normalizeString(
            storagePath
        );

    if (
        !normalizedStoragePath.startsWith(
            "learning-resources/"
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Invalid protected Storage path.`
        );

    }

    try {

        const metadata =
            await getMetadata(
                ref(
                    storage,
                    normalizedStoragePath
                )
            );

        return Object.freeze({

            storagePath:
                metadata.fullPath ||
                normalizedStoragePath,

            bucket:
                metadata.bucket ||
                "",

            fileName:
                metadata.name ||
                "",

            mimeType:
                metadata.contentType ||
                "",

            fileSize:
                Number(
                    metadata.size ||
                    0
                ),

            generation:
                metadata.generation ||
                "",

            metageneration:
                metadata.metageneration ||
                "",

            createdAt:
                metadata.timeCreated ||
                null,

            updatedAt:
                metadata.updated ||
                null,

            customMetadata:
                Object.freeze({
                    ...(
                        metadata.customMetadata ||
                        {}
                    )
                })

        });

    }
    catch (
        error
    ) {

        console.error(
            `[${MODULE_NAME}] Metadata lookup failed:`,
            {
                storagePath:
                    normalizedStoragePath,

                error
            }
        );

        throw error;

    }

}


/* ==========================================================
   PUBLIC API
========================================================== */

const LearningResourceStorage =
    Object.freeze({

        moduleName:
            MODULE_NAME,

        version:
            MODULE_VERSION,

        maxFileSizeBytes:
            LearningResourceContract.maxFileSizeBytes,

        approvedMimeTypes:
            LearningResourceContract.approvedMimeTypes,

        requireAuthorizedAdmin,
        validateFile,
        uploadProtectedResource,
        getProtectedResourceMetadata

    });


window.LearningResourceStorage =
    LearningResourceStorage;

console.info(
    `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
);

export {
    LearningResourceStorage,
    requireAuthorizedAdmin,
    validateFile,
    uploadProtectedResource,
    getProtectedResourceMetadata
};