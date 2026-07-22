/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-storage.js
   Version   : 1.2.0
   Status    : ACTIVE
   Authority : Admin Portal

   Purpose
   ----------------------------------------------------------
   Uploads governed learning-resource files to protected
   Firebase Storage paths.

   Responsibilities
   ----------------------------------------------------------
   • Require an authenticated administrator
   • Validate the administrator role
   • Validate file name, type, extension, and size
   • Resolve shared and master protected Storage domains
   • Normalize protected Storage paths
   • Detect existing immutable Storage objects
   • Upload governed learning-resource versions
   • Verify persisted Storage metadata
   • Return safe immutable Storage metadata
   • Avoid permanent Firebase download URLs

   Non-Responsibilities
   ----------------------------------------------------------
   • Create Firestore resource records
   • Publish resources
   • Withdraw resources
   • Generate permanent download URLs
   • Delete Storage objects
   • Resolve learner entitlement
   • Render UI
   • Provide Student Portal delivery

   Governance
   ----------------------------------------------------------
   • Admin Portal is the upload authority
   • learning-resources is the shared protected domain
   • master-learning-resources is the protected master domain
   • Existing protected objects must not be overwritten
   • Replacement requires a new version path
   • Storage Rules must independently deny object updates
   • Client-side deletion is prohibited
   • getDownloadURL() must not be used for protected files
   • Student access requires an authorized delivery broker

   Change History
   ----------------------------------------------------------
   v1.2.0
   • Added governed master-learning-resources upload support
   • Added Storage-domain-aware path generation
   • Preserved shared learning-resources compatibility
   • Preserved immutable object and authorization controls

   v1.1.0
   • Established governed protected-resource uploads
   • Added persisted metadata verification
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
    "1.2.0";

const SHARED_PROTECTED_ROOT =
    "learning-resources/";

const MASTER_PROTECTED_ROOT =
    "master-learning-resources/";

/*
 * Backward-compatible alias retained for existing callers.
 */
const PROTECTED_ROOT =
    SHARED_PROTECTED_ROOT;

const SUPPORTED_STORAGE_DOMAINS =
    Object.freeze([
        "learning_resources",
        "master_learning_resources"
    ]);

const ALLOWED_ADMIN_ROLES =
    Object.freeze([
        "super_admin",
        "admin"
    ]);


/* ==========================================================
   GENERAL HELPERS
========================================================== */

function normalizeString(
    value
) {

    return LearningResourceContract.normalizeString(
        value
    );

}


function normalizeNullableString(
    value
) {

    return (
        normalizeString(
            value
        ) ||
        null
    );

}


function normalizeFileSize(
    value
) {

    const fileSize =
        Number(
            value
        );

    if (
        !Number.isFinite(
            fileSize
        ) ||
        fileSize < 0
    ) {

        return 0;

    }

    return Math.trunc(
        fileSize
    );

}


function normalizeVersion(
    value
) {

    const version =
        LearningResourceContract.normalizeVersion(
            value
        );

    if (
        !Number.isInteger(
            version
        ) ||
        version < 1
    ) {

        throw new Error(
            `[${MODULE_NAME}] Version must be a positive integer.`
        );

    }

    return version;

}


function normalizeStoragePath(
    value
) {

    return normalizeString(
        value
    )
        .replace(
            /\\/g,
            "/"
        )
        .replace(
            /\/{2,}/g,
            "/"
        )
        .replace(
            /^\/+/,
            ""
        );

}


function normalizeStorageDomain(
    value
) {

    const normalizedDomain =
        normalizeString(
            value
        ).toLowerCase();

    return SUPPORTED_STORAGE_DOMAINS.includes(
        normalizedDomain
    )
        ? normalizedDomain
        : "";

}


function validateProtectedStoragePath(
    storagePath
) {

    const normalizedPath =
        normalizeStoragePath(
            storagePath
        );

    if (
        !normalizedPath ||
        !LearningResourceContract
            .isValidProtectedStoragePath(
                normalizedPath
            )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Invalid protected Storage path.`
        );

    }

    const pathSegments =
        normalizedPath.split(
            "/"
        );

    if (
        pathSegments.some(
            (
                segment
            ) => (
                !segment ||
                segment === "." ||
                segment === ".."
            )
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected Storage path contains an invalid segment.`
        );

    }

    if (
        normalizedPath.length >
        1000
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected Storage path is too long.`
        );

    }

    return normalizedPath;

}


function getStorageErrorMessage(
    error,
    fallback =
        "The protected resource operation could not be completed."
) {

    const code =
        normalizeString(
            error?.code
        );

    switch (
        code
    ) {

        case "storage/unauthenticated":

            return "Administrator authentication is required for protected resource storage.";

        case "storage/unauthorized":

            return "The authenticated account is not authorized to access this protected resource.";

        case "storage/object-not-found":

            return "The protected learning-resource file was not found.";

        case "storage/quota-exceeded":

            return "Firebase Storage quota has been exceeded.";

        case "storage/retry-limit-exceeded":

            return "The protected resource upload could not complete after repeated retries.";

        case "storage/canceled":

            return "The protected resource upload was cancelled.";

        case "storage/invalid-checksum":

            return "The uploaded resource failed integrity validation.";

        case "storage/server-file-wrong-size":

            return "The uploaded resource size does not match the stored object.";

        default:

            return (
                normalizeString(
                    error?.message
                ) ||
                fallback
            );

    }

}


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

    const uid =
        normalizeString(
            user.uid
        );

    if (
        !uid
    ) {

        throw new Error(
            `[${MODULE_NAME}] Authenticated administrator identity is invalid.`
        );

    }

    const role =
        normalizeString(
            await getUserRole(
                uid,
                user.email
            )
        ).toLowerCase();

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

        uid,

        email:
            normalizeEmail(
                user.email
            ) ||
            "",

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

    const fileExtension =
        normalizeString(
            LearningResourceContract.getFileExtension(
                fileName
            )
        ).toLowerCase();

    if (
        !fileExtension
    ) {

        throw new Error(
            `[${MODULE_NAME}] The file must have a valid extension.`
        );

    }

    const mimeType =
        normalizeString(
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
        normalizeFileSize(
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

        fileExtension,

        mimeType,

        fileSize

    });

}


/* ==========================================================
   UPLOAD INPUT
========================================================== */

function normalizeUploadInput(
    input = {}
) {

    return Object.freeze({

        programCode:
            LearningResourceContract.normalizeProgramCode(
                input.program_code ||
                input.programCode
            ),

        resourceId:
            LearningResourceContract.normalizeResourceId(
                input.resource_id ||
                input.resourceId
            ),

        storageDomain:
            normalizeStorageDomain(
                input.storage_domain ||
                input.storageDomain ||
                "learning_resources"
            ),

        version:
            normalizeVersion(
                input.version
            ),

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

    if (
        !input.storageDomain
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected Storage domain is invalid.`
        );

    }

}


/* ==========================================================
   OBJECT EXISTENCE
========================================================== */

async function objectExists(
    storageReference
) {

    try {

        await getMetadata(
            storageReference
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
            `[${MODULE_NAME}] Unable to inspect protected Storage object:`,
            {
                storagePath:
                    storageReference?.fullPath ||
                    null,

                code:
                    error?.code ||
                    null,

                error
            }
        );

        throw new Error(
            getStorageErrorMessage(
                error,
                "Unable to verify whether the protected resource already exists."
            ),
            {
                cause:
                    error
            }
        );

    }

}


/* ==========================================================
   UPLOAD METADATA
========================================================== */

function buildUploadMetadata(
    normalizedInput,
    fileMetadata,
    actor
) {

    return {

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

            /*
             * Umbrella governance authority retained for
             * compatibility with current Storage Rules.
             */
            governance_domain:
                "learning_resources",

            /*
             * Physical governed Storage domain.
             */
            storage_domain:
                normalizedInput.storageDomain,

            immutable_version:
                "true",

            uploaded_by_uid:
                actor.uid,

            uploaded_by_email:
                actor.email ||
                ""

        }

    };

}


/* ==========================================================
   PERSISTED METADATA VALIDATION
========================================================== */

function validatePersistedMetadata(
    persistedMetadata,
    expected
) {

    const persistedPath =
        validateProtectedStoragePath(
            persistedMetadata?.fullPath ||
            expected.storagePath
        );

    if (
        persistedPath !==
        expected.storagePath
    ) {

        throw new Error(
            `[${MODULE_NAME}] Persisted Storage path does not match the requested path.`
        );

    }

    const persistedSize =
        normalizeFileSize(
            persistedMetadata?.size
        );

    if (
        persistedSize > 0 &&
        persistedSize !==
            expected.fileSize
    ) {

        throw new Error(
            `[${MODULE_NAME}] Persisted file size does not match the uploaded file.`
        );

    }

    const persistedMimeType =
        normalizeString(
            persistedMetadata?.contentType
        ).toLowerCase();

    if (
        persistedMimeType &&
        persistedMimeType !==
            expected.mimeType
    ) {

        throw new Error(
            `[${MODULE_NAME}] Persisted MIME type does not match the uploaded file.`
        );

    }

    return Object.freeze({

        storagePath:
            persistedPath,

        fullPath:
            persistedPath,

        bucket:
            normalizeString(
                persistedMetadata?.bucket
            ),

        fileName:
            expected.fileName,

        fileExtension:
            expected.fileExtension,

        mimeType:
            persistedMimeType ||
            expected.mimeType,

        fileSize:
            persistedSize ||
            expected.fileSize,

        generation:
            normalizeString(
                persistedMetadata?.generation
            ),

        metageneration:
            normalizeString(
                persistedMetadata?.metageneration
            ),

        uploadedAt:
            normalizeNullableString(
                persistedMetadata?.timeCreated
            )

    });

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

    /*
     * Shared resources are stored under learning-resources.
     * Learner-specific master resources are stored under
     * master-learning-resources.
     */
    const pathBuilder =
        normalizedInput.storageDomain ===
            "master_learning_resources"
            ? LearningResourceContract
                .buildMasterStoragePath
            : LearningResourceContract
                .buildSharedStoragePath;

    if (
        typeof pathBuilder !==
            "function"
    ) {

        throw new Error(
            `[${MODULE_NAME}] Storage path builder is unavailable for ` +
            `${normalizedInput.storageDomain}.`
        );

    }

    const generatedStoragePath =
        pathBuilder({

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
        !generatedStoragePath
    ) {

        throw new Error(
            `[${MODULE_NAME}] Unable to build a safe Storage path.`
        );

    }

    const storagePath =
        validateProtectedStoragePath(
            generatedStoragePath
        );

    const storageReference =
        ref(
            storage,
            storagePath
        );

    /*
     * This preflight provides a clear administrative error.
     *
     * It is not an atomic overwrite guard. Firebase Storage Rules
     * must independently reject updates to existing objects so an
     * object cannot be overwritten if a race occurs after this read.
     */
    const alreadyExists =
        await objectExists(
            storageReference
        );

    if (
        alreadyExists
    ) {

        throw new Error(
            `[${MODULE_NAME}] This protected resource version already exists. ` +
            `Create a new version instead of replacing it.`
        );

    }

    const uploadMetadata =
        buildUploadMetadata(
            normalizedInput,
            fileMetadata,
            actor
        );

    try {

        const uploadResult =
            await uploadBytes(
                storageReference,
                normalizedInput.file,
                uploadMetadata
            );

        if (
            !uploadResult ||
            !uploadResult.metadata
        ) {

            throw new Error(
                `[${MODULE_NAME}] Firebase Storage returned no persisted upload metadata.`
            );

        }

        const persisted =
            validatePersistedMetadata(
                uploadResult.metadata,
                {
                    storagePath,

                    fileName:
                        fileMetadata.fileName,

                    fileExtension:
                        fileMetadata.fileExtension,

                    mimeType:
                        fileMetadata.mimeType,

                    fileSize:
                        fileMetadata.fileSize
                }
            );

        const result =
            Object.freeze({

                storagePath:
                    persisted.storagePath,

                fullPath:
                    persisted.fullPath,

                bucket:
                    persisted.bucket,

                fileName:
                    persisted.fileName,

                fileExtension:
                    persisted.fileExtension,

                mimeType:
                    persisted.mimeType,

                fileSize:
                    persisted.fileSize,

                generation:
                    persisted.generation,

                metageneration:
                    persisted.metageneration,

                uploadedAt:
                    persisted.uploadedAt,

                uploadedByUid:
                    actor.uid,

                uploadedByEmail:
                    actor.email,

                programCode:
                    normalizedInput.programCode,

                resourceId:
                    normalizedInput.resourceId,

                version:
                    normalizedInput.version,

                storageDomain:
                    normalizedInput.storageDomain

            });

        console.info(
            `[${MODULE_NAME}] Protected resource uploaded:`,
            {
                moduleVersion:
                    MODULE_VERSION,

                storagePath:
                    result.storagePath,

                storageDomain:
                    result.storageDomain,

                bucket:
                    result.bucket,

                generation:
                    result.generation,

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

                storageDomain:
                    normalizedInput.storageDomain,

                programCode:
                    normalizedInput.programCode,

                resourceId:
                    normalizedInput.resourceId,

                version:
                    normalizedInput.version,

                uploadedByUid:
                    actor.uid,

                code:
                    error?.code ||
                    null,

                error
            }
        );

        if (
            normalizeString(
                error?.message
            ).startsWith(
                `[${MODULE_NAME}]`
            )
        ) {

            throw error;

        }

        throw new Error(
            getStorageErrorMessage(
                error,
                "Protected learning-resource upload failed."
            ),
            {
                cause:
                    error
            }
        );

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
        validateProtectedStoragePath(
            storagePath
        );

    try {

        const metadata =
            await getMetadata(
                ref(
                    storage,
                    normalizedStoragePath
                )
            );

        const resolvedStoragePath =
            validateProtectedStoragePath(
                metadata.fullPath ||
                normalizedStoragePath
            );

        if (
            resolvedStoragePath !==
            normalizedStoragePath
        ) {

            throw new Error(
                `[${MODULE_NAME}] Returned Storage metadata does not match the requested object.`
            );

        }

        return Object.freeze({

            storagePath:
                resolvedStoragePath,

            bucket:
                normalizeString(
                    metadata.bucket
                ),

            fileName:
                normalizeString(
                    metadata.name
                ),

            mimeType:
                normalizeString(
                    metadata.contentType
                ).toLowerCase(),

            fileSize:
                normalizeFileSize(
                    metadata.size
                ),

            generation:
                normalizeString(
                    metadata.generation
                ),

            metageneration:
                normalizeString(
                    metadata.metageneration
                ),

            createdAt:
                normalizeNullableString(
                    metadata.timeCreated
                ),

            updatedAt:
                normalizeNullableString(
                    metadata.updated
                ),

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

                code:
                    error?.code ||
                    null,

                error
            }
        );

        if (
            normalizeString(
                error?.message
            ).startsWith(
                `[${MODULE_NAME}]`
            )
        ) {

            throw error;

        }

        throw new Error(
            getStorageErrorMessage(
                error,
                "Unable to retrieve protected resource metadata."
            ),
            {
                cause:
                    error
            }
        );

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

        /*
         * Backward-compatible shared root.
         */
        protectedRoot:
            PROTECTED_ROOT,

        protectedRoots:
            Object.freeze({

                learning_resources:
                    SHARED_PROTECTED_ROOT,

                master_learning_resources:
                    MASTER_PROTECTED_ROOT

            }),

        supportedStorageDomains:
            SUPPORTED_STORAGE_DOMAINS,

        maxFileSizeBytes:
            LearningResourceContract.maxFileSizeBytes,

        approvedMimeTypes:
            LearningResourceContract.approvedMimeTypes,

        requireAuthorizedAdmin,

        validateFile,

        uploadProtectedResource,

        getProtectedResourceMetadata

    });


if (
    typeof window !==
        "undefined"
) {

    window.LearningResourceStorage =
        LearningResourceStorage;

}


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