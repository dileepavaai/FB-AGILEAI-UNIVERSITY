/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-contract.js
   Version   : 1.1.0
   Status    : ACTIVE
   Authority : Admin Portal

   Purpose
   ----------------------------------------------------------
   Defines the authoritative client-side contract for governed
   learning-resource administration.

   Responsibilities
   ----------------------------------------------------------
   • Define supported resource types
   • Define governed resource categories
   • Define delivery types
   • Define lifecycle states
   • Define approved MIME types
   • Normalize resource input
   • Validate draft and publication payloads
   • Generate stable resource and document identifiers
   • Generate protected Storage paths
   • Normalize safe filenames
   • Validate protected Storage paths
   • Enforce draft and publication lifecycle invariants

   Non-Responsibilities
   ----------------------------------------------------------
   • Authentication
   • Authorization
   • Firestore operations
   • Storage uploads
   • Publication mutations
   • Withdrawal mutations
   • Entitlement resolution
   • HTML rendering
   • Student Portal delivery

   Governance
   ----------------------------------------------------------
   • Admin Portal is the learning-resource authority
   • Firestore learning_resources is the metadata registry
   • Firebase Storage holds protected binary assets
   • Every resource begins as a draft
   • Drafts are inactive and are not latest
   • Only a published version may be latest
   • Published assets are immutable
   • Replacement requires a new version
   • Withdrawn records are retained
   • No learner identity is stored in resource records
   • No permanent protected download URL is stored
========================================================== */


/* ==========================================================
   MODULE METADATA
========================================================== */

const MODULE_NAME =
    "LearningResourceContract";

const MODULE_VERSION =
    "1.1.0";

const MAX_FILE_SIZE_BYTES =
    50 * 1024 * 1024;

const MAX_DISPLAY_ORDER =
    10000;

const PROTECTED_STORAGE_ROOT =
    "learning-resources/";


/* ==========================================================
   GOVERNED VALUES
========================================================== */

const RESOURCE_TYPES =
    Object.freeze([
        "document",
        "image",
        "external_video",
        "external_link"
    ]);

const RESOURCE_CATEGORIES =
    Object.freeze([
        "licensed_course_material",
        "supporting_document",
        "reference_material",
        "video",
        "download"
    ]);

const DELIVERY_TYPES =
    Object.freeze([
        "protected_storage",
        "external_video",
        "external_link"
    ]);

const RESOURCE_STATUSES =
    Object.freeze([
        "draft",
        "published",
        "withdrawn"
    ]);

const APPROVED_MIME_TYPES =
    Object.freeze([
        "application/pdf",
        "text/plain",
        "text/csv",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.oasis.opendocument.text",
        "application/vnd.oasis.opendocument.presentation",
        "application/vnd.oasis.opendocument.spreadsheet",
        "image/png",
        "image/jpeg"
    ]);

const APPROVED_EXTERNAL_VIDEO_HOSTS =
    Object.freeze([
        "youtube.com",
        "www.youtube.com",
        "youtu.be",
        "vimeo.com",
        "www.vimeo.com",
        "player.vimeo.com"
    ]);


/* ==========================================================
   REGULAR EXPRESSIONS
========================================================== */

const PROGRAM_CODE_PATTERN =
    /^[A-Z0-9][A-Z0-9_-]{1,19}$/;

const RESOURCE_ID_PATTERN =
    /^[a-z0-9][a-z0-9-]{2,79}$/;

const DOCUMENT_ID_PATTERN =
    /^[a-z0-9][a-z0-9-]{2,79}_v[1-9][0-9]*$/;

const SAFE_FILE_NAME_PATTERN =
    /^[A-Za-z0-9][A-Za-z0-9._-]{0,149}$/;


/* ==========================================================
   BASIC NORMALIZATION
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


function normalizeLowercase(
    value
) {

    return normalizeString(
        value
    ).toLowerCase();

}


function normalizeProgramCode(
    value
) {

    return normalizeString(
        value
    ).toUpperCase();

}


function normalizeResourceId(
    value
) {

    return normalizeString(
        value
    )
        .toLowerCase()
        .normalize(
            "NFKD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        )
        .slice(
            0,
            80
        );

}


function normalizeVersion(
    value
) {

    const version =
        Number(
            value
        );

    if (
        !Number.isInteger(
            version
        ) ||
        version < 1
    ) {

        return 1;

    }

    return version;

}


function normalizeDisplayOrder(
    value
) {

    const displayOrder =
        Number(
            value
        );

    if (
        !Number.isInteger(
            displayOrder
        ) ||
        displayOrder < 0
    ) {

        return 10;

    }

    return Math.min(
        displayOrder,
        MAX_DISPLAY_ORDER
    );

}


function normalizeBoolean(
    value,
    fallback = false
) {

    if (
        typeof value ===
        "boolean"
    ) {

        return value;

    }

    return fallback;

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


/* ==========================================================
   IDENTIFIERS
========================================================== */

function buildDocumentId(
    resourceId,
    version
) {

    const normalizedResourceId =
        normalizeResourceId(
            resourceId
        );

    const normalizedVersion =
        normalizeVersion(
            version
        );

    if (
        !RESOURCE_ID_PATTERN.test(
            normalizedResourceId
        )
    ) {

        return "";

    }

    return (
        `${normalizedResourceId}_v${normalizedVersion}`
    );

}


function isValidDocumentId(
    documentId
) {

    return DOCUMENT_ID_PATTERN.test(
        normalizeString(
            documentId
        )
    );

}


/* ==========================================================
   SAFE FILENAME
========================================================== */

function normalizeFileName(
    value
) {

    const originalName =
        normalizeString(
            value
        );

    if (
        !originalName
    ) {

        return "";

    }

    const lastDotIndex =
        originalName.lastIndexOf(
            "."
        );

    const hasExtension =
        lastDotIndex > 0 &&
        lastDotIndex <
            originalName.length - 1;

    const rawBaseName =
        hasExtension
            ? originalName.slice(
                0,
                lastDotIndex
            )
            : originalName;

    const rawExtension =
        hasExtension
            ? originalName.slice(
                lastDotIndex + 1
            )
            : "";

    const safeBaseName =
        rawBaseName
            .normalize(
                "NFKD"
            )
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^A-Za-z0-9_-]+/g,
                "-"
            )
            .replace(
                /^[-_.]+|[-_.]+$/g,
                ""
            )
            .slice(
                0,
                120
            );

    const safeExtension =
        rawExtension
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                ""
            )
            .slice(
                0,
                12
            );

    if (
        !safeBaseName
    ) {

        return "";

    }

    const normalizedName =
        safeExtension
            ? `${safeBaseName}.${safeExtension}`
            : safeBaseName;

    return normalizedName.slice(
        0,
        150
    );

}


function getFileExtension(
    fileName
) {

    const normalizedFileName =
        normalizeFileName(
            fileName
        );

    const lastDotIndex =
        normalizedFileName.lastIndexOf(
            "."
        );

    if (
        lastDotIndex <= 0 ||
        lastDotIndex ===
            normalizedFileName.length - 1
    ) {

        return "";

    }

    return normalizedFileName
        .slice(
            lastDotIndex + 1
        )
        .toLowerCase();

}


function isValidFileName(
    fileName
) {

    const normalizedFileName =
        normalizeString(
            fileName
        );

    return (
        normalizedFileName.length <= 150 &&
        SAFE_FILE_NAME_PATTERN.test(
            normalizedFileName
        )
    );

}


/* ==========================================================
   STORAGE PATH
========================================================== */

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


function buildStoragePath({
    programCode,
    resourceId,
    version,
    fileName
} = {}) {

    const normalizedProgramCode =
        normalizeProgramCode(
            programCode
        );

    const normalizedResourceId =
        normalizeResourceId(
            resourceId
        );

    const normalizedVersion =
        normalizeVersion(
            version
        );

    const normalizedFileName =
        normalizeFileName(
            fileName
        );

    if (
        !PROGRAM_CODE_PATTERN.test(
            normalizedProgramCode
        ) ||
        !RESOURCE_ID_PATTERN.test(
            normalizedResourceId
        ) ||
        !isValidFileName(
            normalizedFileName
        )
    ) {

        return "";

    }

    return (
        PROTECTED_STORAGE_ROOT +
        `${normalizedProgramCode}/` +
        `${normalizedResourceId}/` +
        `v${normalizedVersion}/` +
        normalizedFileName
    );

}


function isValidProtectedStoragePath(
    storagePath
) {

    const normalizedPath =
        normalizeStoragePath(
            storagePath
        );

    if (
        !normalizedPath ||
        !normalizedPath.startsWith(
            PROTECTED_STORAGE_ROOT
        )
    ) {

        return false;

    }

    const segments =
        normalizedPath.split(
            "/"
        );

    if (
        segments.length !== 5
    ) {

        return false;

    }

    const [
        root,
        programCode,
        resourceId,
        versionSegment,
        fileName
    ] = segments;

    if (
        root !==
            PROTECTED_STORAGE_ROOT.slice(
                0,
                -1
            ) ||
        !PROGRAM_CODE_PATTERN.test(
            programCode
        ) ||
        !RESOURCE_ID_PATTERN.test(
            resourceId
        ) ||
        !/^v[1-9][0-9]*$/.test(
            versionSegment
        ) ||
        !isValidFileName(
            fileName
        )
    ) {

        return false;

    }

    return normalizedPath.length <=
        1000;

}


function storagePathMatchesResource(
    storagePath,
    resource
) {

    if (
        !resource ||
        !isValidProtectedStoragePath(
            storagePath
        )
    ) {

        return false;

    }

    const expectedPath =
        buildStoragePath({

            programCode:
                resource.program_code ||
                resource.programCode,

            resourceId:
                resource.resource_id ||
                resource.resourceId,

            version:
                resource.version,

            fileName:
                resource.file_name ||
                resource.fileName

        });

    return (
        expectedPath &&
        normalizeStoragePath(
            storagePath
        ) ===
            expectedPath
    );

}


/* ==========================================================
   URL VALIDATION
========================================================== */

function parseHttpsUrl(
    value
) {

    const normalizedValue =
        normalizeString(
            value
        );

    if (
        !normalizedValue
    ) {

        return null;

    }

    try {

        const parsedUrl =
            new URL(
                normalizedValue
            );

        if (
            parsedUrl.protocol !==
                "https:" ||
            !parsedUrl.hostname
        ) {

            return null;

        }

        /*
         * Credentials embedded in managed URLs are prohibited.
         */
        if (
            parsedUrl.username ||
            parsedUrl.password
        ) {

            return null;

        }

        return parsedUrl;

    }
    catch (
        error
    ) {

        return null;

    }

}


function isValidHttpsUrl(
    value
) {

    return Boolean(
        parseHttpsUrl(
            value
        )
    );

}


function isApprovedExternalVideoUrl(
    value
) {

    const parsedUrl =
        parseHttpsUrl(
            value
        );

    if (
        !parsedUrl
    ) {

        return false;

    }

    return APPROVED_EXTERNAL_VIDEO_HOSTS.includes(
        parsedUrl.hostname.toLowerCase()
    );

}


/* ==========================================================
   MIME VALIDATION
========================================================== */

function isApprovedMimeType(
    mimeType
) {

    return APPROVED_MIME_TYPES.includes(
        normalizeLowercase(
            mimeType
        )
    );

}


function isValidFileSize(
    fileSize
) {

    const normalizedSize =
        Number(
            fileSize
        );

    return (
        Number.isInteger(
            normalizedSize
        ) &&
        normalizedSize > 0 &&
        normalizedSize <=
            MAX_FILE_SIZE_BYTES
    );

}


/* ==========================================================
   RESOURCE NORMALIZATION
========================================================== */

function normalizeResourceInput(
    input = {}
) {

    const deliveryType =
        normalizeLowercase(
            input.delivery_type ||
            input.deliveryType ||
            "protected_storage"
        );

    const resourceType =
        normalizeLowercase(
            input.resource_type ||
            input.resourceType ||
            "document"
        );

    const category =
        normalizeLowercase(
            input.category ||
            "supporting_document"
        );

    const fileName =
        normalizeFileName(
            input.file_name ||
            input.fileName
        );

    const protectedDelivery =
        deliveryType ===
        "protected_storage";

    return {

        resource_id:
            normalizeResourceId(
                input.resource_id ||
                input.resourceId ||
                input.title
            ),

        program_code:
            normalizeProgramCode(
                input.program_code ||
                input.programCode
            ),

        title:
            normalizeString(
                input.title
            ),

        description:
            normalizeString(
                input.description
            ),

        resource_type:
            resourceType,

        category,

        delivery_type:
            deliveryType,

        storage_path:
            protectedDelivery
                ? (
                    normalizeStoragePath(
                        input.storage_path ||
                        input.storagePath
                    ) ||
                    null
                )
                : null,

        external_url:
            protectedDelivery
                ? null
                : (
                    normalizeString(
                        input.external_url ||
                        input.externalUrl
                    ) ||
                    null
                ),

        file_name:
            protectedDelivery
                ? (
                    fileName ||
                    null
                )
                : null,

        file_extension:
            protectedDelivery
                ? (
                    getFileExtension(
                        fileName
                    ) ||
                    null
                )
                : null,

        mime_type:
            protectedDelivery
                ? (
                    normalizeLowercase(
                        input.mime_type ||
                        input.mimeType
                    ) ||
                    null
                )
                : null,

        file_size:
            protectedDelivery
                ? normalizeFileSize(
                    input.file_size ??
                    input.fileSize
                )
                : 0,

        preview_allowed:
            normalizeBoolean(
                input.preview_allowed ??
                input.previewAllowed,
                true
            ),

        download_allowed:
            normalizeBoolean(
                input.download_allowed ??
                input.downloadAllowed,
                protectedDelivery
            ),

        embed_allowed:
            normalizeBoolean(
                input.embed_allowed ??
                input.embedAllowed,
                deliveryType ===
                    "external_video"
            ),

        status:
            "draft",

        is_active:
            false,

        /*
         * Drafts are not latest published versions.
         */
        is_latest:
            false,

        version:
            normalizeVersion(
                input.version
            ),

        display_order:
            normalizeDisplayOrder(
                input.display_order ??
                input.displayOrder
            ),

        source:
            "admin_portal"

    };

}


/* ==========================================================
   VALIDATION RESULT
========================================================== */

function buildValidationResult(
    errors
) {

    return Object.freeze({

        valid:
            errors.length === 0,

        errors:
            Object.freeze([
                ...errors
            ])

    });

}


/* ==========================================================
   DRAFT VALIDATION
========================================================== */

function validateDraft(
    resource
) {

    if (
        !resource ||
        typeof resource !==
            "object"
    ) {

        return buildValidationResult([
            "Learning resource payload is required."
        ]);

    }

    const errors =
        [];

    if (
        !RESOURCE_ID_PATTERN.test(
            normalizeString(
                resource.resource_id
            )
        )
    ) {

        errors.push(
            "Resource ID must contain 3–80 lowercase letters, numbers or hyphens."
        );

    }

    if (
        !PROGRAM_CODE_PATTERN.test(
            normalizeString(
                resource.program_code
            )
        )
    ) {

        errors.push(
            "Programme code is invalid."
        );

    }

    const title =
        normalizeString(
            resource.title
        );

    if (
        !title ||
        title.length > 160
    ) {

        errors.push(
            "Title is required and must not exceed 160 characters."
        );

    }

    const description =
        normalizeString(
            resource.description
        );

    if (
        description.length > 2000
    ) {

        errors.push(
            "Description must not exceed 2,000 characters."
        );

    }

    if (
        !RESOURCE_TYPES.includes(
            normalizeLowercase(
                resource.resource_type
            )
        )
    ) {

        errors.push(
            "Resource type is invalid."
        );

    }

    if (
        !RESOURCE_CATEGORIES.includes(
            normalizeLowercase(
                resource.category
            )
        )
    ) {

        errors.push(
            "Resource category is invalid."
        );

    }

    if (
        !DELIVERY_TYPES.includes(
            normalizeLowercase(
                resource.delivery_type
            )
        )
    ) {

        errors.push(
            "Delivery type is invalid."
        );

    }

    if (
        resource.status !==
            "draft"
    ) {

        errors.push(
            "Learning-resource drafts must have draft status."
        );

    }

    if (
        resource.is_active !==
            false
    ) {

        errors.push(
            "Draft learning resources cannot be active."
        );

    }

    if (
        resource.is_latest !==
            false
    ) {

        errors.push(
            "Draft learning resources cannot be marked as the latest published version."
        );

    }

    if (
        !Number.isInteger(
            resource.version
        ) ||
        resource.version < 1
    ) {

        errors.push(
            "Version must be a positive integer."
        );

    }

    if (
        !Number.isInteger(
            resource.display_order
        ) ||
        resource.display_order < 0 ||
        resource.display_order >
            MAX_DISPLAY_ORDER
    ) {

        errors.push(
            "Display order must be between 0 and 10,000."
        );

    }

    return buildValidationResult(
        errors
    );

}


/* ==========================================================
   PUBLICATION VALIDATION
========================================================== */

function validateForPublication(
    resource
) {

    if (
        !resource ||
        typeof resource !==
            "object"
    ) {

        return buildValidationResult([
            "Learning resource payload is required."
        ]);

    }

    /*
     * Firestore records use snake-case fields. This normalized
     * draft projection ensures the same authoritative contract
     * is applied before publication.
     */
    const normalizedDraft =
        normalizeResourceInput(
            resource
        );

    const draftValidation =
        validateDraft(
            normalizedDraft
        );

    const errors = [
        ...draftValidation.errors
    ];

    const deliveryType =
        normalizeLowercase(
            resource.delivery_type ||
            resource.deliveryType
        );

    const storagePath =
        normalizeStoragePath(
            resource.storage_path ||
            resource.storagePath
        );

    const externalUrl =
        normalizeString(
            resource.external_url ||
            resource.externalUrl
        );

    const fileName =
        normalizeFileName(
            resource.file_name ||
            resource.fileName
        );

    const mimeType =
        normalizeLowercase(
            resource.mime_type ||
            resource.mimeType
        );

    const fileSize =
        normalizeFileSize(
            resource.file_size ??
            resource.fileSize
        );

    const downloadAllowed =
        (
            resource.download_allowed ??
            resource.downloadAllowed
        ) === true;

    if (
        deliveryType ===
        "protected_storage"
    ) {

        if (
            !storagePath
        ) {

            errors.push(
                "Protected Storage resources require a Storage path."
            );

        }
        else if (
            !isValidProtectedStoragePath(
                storagePath
            )
        ) {

            errors.push(
                "The protected Storage path is invalid."
            );

        }

        if (
            externalUrl
        ) {

            errors.push(
                "Protected Storage resources cannot contain an external URL."
            );

        }

        if (
            !fileName ||
            !isValidFileName(
                fileName
            )
        ) {

            errors.push(
                "Protected Storage resources require a valid filename."
            );

        }

        if (
            storagePath &&
            fileName &&
            !storagePathMatchesResource(
                storagePath,
                {
                    program_code:
                        resource.program_code ||
                        resource.programCode,

                    resource_id:
                        resource.resource_id ||
                        resource.resourceId,

                    version:
                        resource.version,

                    file_name:
                        fileName
                }
            )
        ) {

            errors.push(
                "The protected Storage path does not match the resource identity, version, and filename."
            );

        }

        if (
            !isApprovedMimeType(
                mimeType
            )
        ) {

            errors.push(
                "The selected file type is not approved."
            );

        }

        if (
            !isValidFileSize(
                fileSize
            )
        ) {

            errors.push(
                "The uploaded file must be between 1 byte and 50 MiB."
            );

        }

    }

    if (
        deliveryType ===
        "external_video"
    ) {

        if (
            !isApprovedExternalVideoUrl(
                externalUrl
            )
        ) {

            errors.push(
                "External videos require an approved YouTube or Vimeo HTTPS URL."
            );

        }

        if (
            storagePath
        ) {

            errors.push(
                "External videos cannot contain a protected Storage path."
            );

        }

        if (
            downloadAllowed
        ) {

            errors.push(
                "External videos cannot enable direct download."
            );

        }

    }

    if (
        deliveryType ===
        "external_link"
    ) {

        if (
            !isValidHttpsUrl(
                externalUrl
            )
        ) {

            errors.push(
                "External resources require a valid HTTPS URL."
            );

        }

        if (
            storagePath
        ) {

            errors.push(
                "External resources cannot contain a protected Storage path."
            );

        }

    }

    return buildValidationResult(
        errors
    );

}


/* ==========================================================
   PUBLIC API
========================================================== */

const LearningResourceContract =
    Object.freeze({

        moduleName:
            MODULE_NAME,

        version:
            MODULE_VERSION,

        maxFileSizeBytes:
            MAX_FILE_SIZE_BYTES,

        maxDisplayOrder:
            MAX_DISPLAY_ORDER,

        protectedStorageRoot:
            PROTECTED_STORAGE_ROOT,

        resourceTypes:
            RESOURCE_TYPES,

        categories:
            RESOURCE_CATEGORIES,

        deliveryTypes:
            DELIVERY_TYPES,

        statuses:
            RESOURCE_STATUSES,

        approvedMimeTypes:
            APPROVED_MIME_TYPES,

        approvedExternalVideoHosts:
            APPROVED_EXTERNAL_VIDEO_HOSTS,

        normalizeString,

        normalizeProgramCode,

        normalizeResourceId,

        normalizeVersion,

        normalizeDisplayOrder,

        normalizeFileName,

        getFileExtension,

        normalizeStoragePath,

        buildDocumentId,

        buildStoragePath,

        isValidDocumentId,

        isValidFileName,

        isValidProtectedStoragePath,

        storagePathMatchesResource,

        isValidHttpsUrl,

        isApprovedExternalVideoUrl,

        isApprovedMimeType,

        isValidFileSize,

        normalizeResourceInput,

        validateDraft,

        validateForPublication

    });


window.LearningResourceContract =
    LearningResourceContract;


console.info(
    `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
);


export {

    LearningResourceContract,

    RESOURCE_TYPES,

    RESOURCE_CATEGORIES,

    DELIVERY_TYPES,

    RESOURCE_STATUSES,

    APPROVED_MIME_TYPES,

    APPROVED_EXTERNAL_VIDEO_HOSTS,

    MAX_FILE_SIZE_BYTES,

    normalizeString,

    normalizeProgramCode,

    normalizeResourceId,

    normalizeVersion,

    normalizeDisplayOrder,

    normalizeFileName,

    getFileExtension,

    normalizeStoragePath,

    buildDocumentId,

    buildStoragePath,

    isValidDocumentId,

    isValidFileName,

    isValidProtectedStoragePath,

    storagePathMatchesResource,

    isValidHttpsUrl,

    isApprovedExternalVideoUrl,

    isApprovedMimeType,

    isValidFileSize,

    normalizeResourceInput,

    validateDraft,

    validateForPublication

};