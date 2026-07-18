/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-contract.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Learning Resource Administration Foundation

   Purpose
   ----------------------------------------------------------
   Defines the authoritative client-side contract for governed
   learning-resource administration.

   Responsibilities
   ----------------------------------------------------------
   ✓ Define supported resource types
   ✓ Define governed resource categories
   ✓ Define delivery types
   ✓ Define lifecycle states
   ✓ Define approved MIME types
   ✓ Normalize resource input
   ✓ Validate draft and publication payloads
   ✓ Generate stable resource and document identifiers
   ✓ Generate protected Storage paths
   ✓ Normalize safe filenames

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Authentication
   ✗ Authorization
   ✗ Firestore operations
   ✗ Storage uploads
   ✗ Publication
   ✗ Withdrawal
   ✗ Entitlement resolution
   ✗ HTML rendering
   ✗ Student Portal consumption

   Governance
   ----------------------------------------------------------
   • Admin Portal is the learning-resource authority
   • Firestore learning_resources is the metadata registry
   • Firebase Storage holds protected binary assets
   • Every resource begins as a draft
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
    "1.0.0";

const MAX_FILE_SIZE_BYTES =
    50 * 1024 * 1024;


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
        10000
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

    return SAFE_FILE_NAME_PATTERN.test(
        normalizeString(
            fileName
        )
    );

}


/* ==========================================================
   STORAGE PATH
========================================================== */

function buildStoragePath({
    programCode,
    resourceId,
    version,
    fileName
}) {

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
        "learning-resources/" +
        `${normalizedProgramCode}/` +
        `${normalizedResourceId}/` +
        `v${normalizedVersion}/` +
        normalizedFileName
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
            "https:"
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
        normalizeString(
            mimeType
        ).toLowerCase()
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
        normalizeString(
            input.delivery_type ||
            input.deliveryType ||
            "protected_storage"
        );

    const resourceType =
        normalizeString(
            input.resource_type ||
            input.resourceType ||
            "document"
        );

    const fileName =
        normalizeFileName(
            input.file_name ||
            input.fileName
        );

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

        category:
            normalizeString(
                input.category ||
                "supporting_document"
            ),

        delivery_type:
            deliveryType,

        storage_path:
            normalizeString(
                input.storage_path ||
                input.storagePath
            ) ||
            null,

        external_url:
            normalizeString(
                input.external_url ||
                input.externalUrl
            ) ||
            null,

        file_name:
            fileName ||
            null,

        file_extension:
            getFileExtension(
                fileName
            ) ||
            null,

        mime_type:
            normalizeString(
                input.mime_type ||
                input.mimeType
            ).toLowerCase() ||
            null,

        file_size:
            Math.max(
                0,
                Number(
                    input.file_size ||
                    input.fileSize ||
                    0
                )
            ),

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
                deliveryType ===
                    "protected_storage"
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

        is_latest:
            true,

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
   VALIDATION
========================================================== */

function validateDraft(
    resource
) {

    const errors = [];

    if (
        !resource ||
        typeof resource !==
            "object"
    ) {

        return {
            valid:
                false,

            errors: [
                "Learning resource payload is required."
            ]
        };

    }

    if (
        !RESOURCE_ID_PATTERN.test(
            resource.resource_id
        )
    ) {

        errors.push(
            "Resource ID must contain 3–80 lowercase letters, numbers or hyphens."
        );

    }

    if (
        !PROGRAM_CODE_PATTERN.test(
            resource.program_code
        )
    ) {

        errors.push(
            "Programme code is invalid."
        );

    }

    if (
        !resource.title ||
        resource.title.length > 160
    ) {

        errors.push(
            "Title is required and must not exceed 160 characters."
        );

    }

    if (
        resource.description.length > 2000
    ) {

        errors.push(
            "Description must not exceed 2,000 characters."
        );

    }

    if (
        !RESOURCE_TYPES.includes(
            resource.resource_type
        )
    ) {

        errors.push(
            "Resource type is invalid."
        );

    }

    if (
        !RESOURCE_CATEGORIES.includes(
            resource.category
        )
    ) {

        errors.push(
            "Resource category is invalid."
        );

    }

    if (
        !DELIVERY_TYPES.includes(
            resource.delivery_type
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
            "New learning resources must begin as drafts."
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
            true
    ) {

        errors.push(
            "A new learning-resource version must be marked as latest."
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
        resource.display_order > 10000
    ) {

        errors.push(
            "Display order must be between 0 and 10,000."
        );

    }

    return {
        valid:
            errors.length === 0,

        errors
    };

}


function validateForPublication(
    resource
) {

    const draftValidation =
        validateDraft({
            ...resource,

            status:
                "draft",

            is_active:
                false,

            is_latest:
                true
        });

    const errors = [
        ...draftValidation.errors
    ];

    if (
        resource.delivery_type ===
            "protected_storage"
    ) {

        if (
            !resource.storage_path
        ) {

            errors.push(
                "Protected Storage resources require a Storage path."
            );

        }

        if (
            resource.external_url
        ) {

            errors.push(
                "Protected Storage resources cannot contain an external URL."
            );

        }

        if (
            !resource.file_name ||
            !isValidFileName(
                resource.file_name
            )
        ) {

            errors.push(
                "Protected Storage resources require a valid filename."
            );

        }

        if (
            !isApprovedMimeType(
                resource.mime_type
            )
        ) {

            errors.push(
                "The selected file type is not approved."
            );

        }

        if (
            !isValidFileSize(
                resource.file_size
            )
        ) {

            errors.push(
                "The uploaded file must be between 1 byte and 50 MiB."
            );

        }

    }

    if (
        resource.delivery_type ===
            "external_video"
    ) {

        if (
            !isApprovedExternalVideoUrl(
                resource.external_url
            )
        ) {

            errors.push(
                "External videos require an approved YouTube or Vimeo HTTPS URL."
            );

        }

        if (
            resource.storage_path
        ) {

            errors.push(
                "External videos cannot contain a protected Storage path."
            );

        }

        if (
            resource.download_allowed
        ) {

            errors.push(
                "External videos cannot enable direct download."
            );

        }

    }

    if (
        resource.delivery_type ===
            "external_link"
    ) {

        if (
            !isValidHttpsUrl(
                resource.external_url
            )
        ) {

            errors.push(
                "External resources require a valid HTTPS URL."
            );

        }

        if (
            resource.storage_path
        ) {

            errors.push(
                "External resources cannot contain a protected Storage path."
            );

        }

    }

    return {
        valid:
            errors.length === 0,

        errors
    };

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
        normalizeFileName,
        getFileExtension,
        buildDocumentId,
        buildStoragePath,
        isValidDocumentId,
        isValidFileName,
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
    normalizeFileName,
    getFileExtension,
    buildDocumentId,
    buildStoragePath,
    isValidDocumentId,
    isValidFileName,
    isValidHttpsUrl,
    isApprovedExternalVideoUrl,
    isApprovedMimeType,
    isValidFileSize,
    normalizeResourceInput,
    validateDraft,
    validateForPublication
};