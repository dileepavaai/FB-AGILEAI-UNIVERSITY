/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-contract.js
   Version   : 1.4.0
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
   • Define delivery and personalisation types
   • Define lifecycle states
   • Define governed release policies
   • Define approved MIME types
   • Normalize resource input
   • Validate draft and publication payloads
   • Validate governed release metadata
   • Generate stable resource and document identifiers
   • Generate governed Storage paths
   • Normalize safe filenames
   • Validate protected Storage paths
   • Validate approved external resources
   • Enforce draft and publication lifecycle invariants

   Non-Responsibilities
   ----------------------------------------------------------
   • Authentication
   • Authorization
   • Firestore operations
   • Storage uploads
   • Publication mutations
   • Withdrawal mutations
   • Learner entitlement resolution
   • Learner release-policy evaluation
   • HTML rendering
   • Student Portal delivery
   • Signed URL generation

   Governance
   ----------------------------------------------------------
   • Admin Portal is the learning-resource authority
   • Firestore learning_resources is the metadata registry
   • learning_resource_deliveries governs learner delivery
   • Firebase Storage holds protected binary assets
   • Every resource begins as a draft
   • Drafts are inactive and are not latest
   • Only a published version may be latest
   • Published assets and release metadata are immutable
   • Replacement requires a new version
   • Withdrawn and archived records are retained
   • No learner identity is stored in shared resource records
   • No permanent protected download URL is stored
   • Protected learner files are limited to 50 MiB
   • Arbitrary iframe HTML is prohibited
   • ADR-019 governs protected-resource delivery
   • ADR-020 governs learning-resource release metadata
   • Admin Portal records release metadata
   • Student Portal resolver evaluates learner visibility

   Backward Compatibility
   ----------------------------------------------------------
   The following existing fields and APIs remain supported:

   • resource_type
   • category
   • file_size
   • buildDocumentId()
   • buildStoragePath()
   • normalizeResourceInput()
   • validateDraft()
   • validateForPublication()

   Change History
   ----------------------------------------------------------
   v1.4.0
   • Added governed ADR-020 release policies
   • Added module and session release targeting
   • Added canonical availability-window normalization
   • Added release-governance validation
   • Added backward-compatible on-enrollment default
   • Preserved all existing public APIs and field aliases

   v1.3.0
   • Added resource_document_id
   • Added content_type
   • Added resource_category
   • Added personalisation_type
   • Added storage_domain
   • Added file_size_bytes
   • Added uploaded and archived lifecycle states
   • Added separate governed Storage roots
   • Added external-video normalization
   • Preserved existing Admin Portal compatibility

   v1.2.0
   • Added Markdown resource support
   • Added image/jpg compatibility support
   • Aligned approved MIME types with Storage Rules v1.2.0

   v1.1.0
   • Added governed lifecycle validation
   • Added protected Storage path validation
   • Added filename and file-size validation
   • Added external URL validation
   • Enforced draft is_latest = false
========================================================== */


/* ==========================================================
   MODULE METADATA
========================================================== */

const MODULE_NAME =
    "LearningResourceContract";

const MODULE_VERSION =
    "1.4.0";

const MAX_FILE_SIZE_BYTES =
    50 * 1024 * 1024;

const MAX_DISPLAY_ORDER =
    10000;

const MAX_TITLE_LENGTH =
    160;

const MAX_DESCRIPTION_LENGTH =
    2000;


/* ==========================================================
   STORAGE ROOTS
========================================================== */

const SHARED_STORAGE_ROOT =
    "learning-resources/";

const LEARNER_STORAGE_ROOT =
    "learner-learning-assets/";

const MASTER_STORAGE_ROOT =
    "master-learning-resources/";

/*
 * Backward-compatible alias used by existing modules.
 */
const PROTECTED_STORAGE_ROOT =
    SHARED_STORAGE_ROOT;


/* ==========================================================
   GOVERNED RESOURCE TYPES
========================================================== */

const RESOURCE_TYPES =
    Object.freeze([
        "document",
        "image",
        "external_video",
        "external_link"
    ]);


/* ==========================================================
   GOVERNED CONTENT TYPES
========================================================== */

const CONTENT_TYPES =
    Object.freeze([
        "licensed_course_material",
        "supporting_workbook",
        "supporting_document",
        "handout",
        "reference_guide",
        "reference_material",
        "template",
        "checklist",
        "programme_handbook",
        "case_study",
        "assessment_guide",
        "external_video",
        "external_link",
        "image",
        "other_document"
    ]);


/* ==========================================================
   GOVERNED RESOURCE CATEGORIES
========================================================== */

/*
 * Existing category values are retained to avoid breaking
 * current Admin forms and Firestore documents.
 */
const RESOURCE_CATEGORIES =
    Object.freeze([
        "licensed_course_material",
        "supporting_document",
        "reference_material",
        "video",
        "download",
        "licensed_course_materials",
        "supporting_materials",
        "videos",
        "references",
        "assessments",
        "templates",
        "other"
    ]);


/* ==========================================================
   DELIVERY TYPES
========================================================== */

const DELIVERY_TYPES =
    Object.freeze([
        "protected_storage",
        "external_video",
        "external_link"
    ]);


/* ==========================================================
   PERSONALISATION TYPES
========================================================== */

const PERSONALISATION_TYPES =
    Object.freeze([
        "shared",
        "learner_specific",
        "none"
    ]);


/* ==========================================================
   STORAGE DOMAINS
========================================================== */

const STORAGE_DOMAINS =
    Object.freeze([
        "learning_resources",
        "learner_learning_assets",
        "master_learning_resources",
        "external"
    ]);


/* ==========================================================
   RESOURCE LIFECYCLE STATES
========================================================== */

const RESOURCE_STATUSES =
    Object.freeze([
        "draft",
        "uploaded",
        "published",
        "withdrawn",
        "archived"
    ]);


/* ==========================================================
   GOVERNED RELEASE POLICIES
========================================================== */

/*
 * ADR-020 defines when a governed learning resource may
 * become visible to an eligible learner.
 *
 * The Admin Portal records these values.
 * The Student Portal Learning Resource Resolver evaluates
 * them against learner and programme context.
 */
const RELEASE_POLICIES =
    Object.freeze([
        "on_enrollment",
        "pre_module",
        "post_module",
        "post_session",
        "post_assessment",
        "on_completion",
        "alumni_only",
        "manual_release"
    ]);


/*
 * Policies that require a governed module target.
 */
const MODULE_RELEASE_POLICIES =
    Object.freeze([
        "pre_module",
        "post_module"
    ]);


/*
 * Policies that require a governed session target.
 */
const SESSION_RELEASE_POLICIES =
    Object.freeze([
        "post_session"
    ]);


/*
 * Policies determined principally by learner lifecycle state.
 */
const LIFECYCLE_RELEASE_POLICIES =
    Object.freeze([
        "on_enrollment",
        "post_assessment",
        "on_completion",
        "alumni_only",
        "manual_release"
    ]);


/* ==========================================================
   APPROVED MIME TYPES
========================================================== */

const APPROVED_MIME_TYPES =
    Object.freeze([
        "application/pdf",
        "text/plain",
        "text/markdown",
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
        "image/jpeg",
        "image/jpg"
    ]);


/* ==========================================================
   APPROVED EXTERNAL VIDEO PROVIDERS
========================================================== */

const APPROVED_EXTERNAL_VIDEO_PROVIDERS =
    Object.freeze([
        "youtube",
        "vimeo"
    ]);

const APPROVED_EXTERNAL_VIDEO_HOSTS =
    Object.freeze([
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "youtube-nocookie.com",
        "www.youtube-nocookie.com",
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

const DELIVERY_ID_PATTERN =
    /^AAU-MAT-[A-Z0-9]{8,32}$/;

const CREDENTIAL_ID_PATTERN =
    /^AAU-[A-Z0-9]{8}$/;

const SHA256_PATTERN =
    /^[A-Fa-f0-9]{64}$/;


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


function normalizeNullableString(
    value
) {

    const normalizedValue =
        normalizeString(
            value
        );

    return normalizedValue ||
        null;

}


function firstDefined(
    ...values
) {

    return values.find(
        (value) =>
            value !== undefined &&
            value !== null
    );

}

/* ==========================================================
   RELEASE METADATA NORMALIZATION
========================================================== */

/*
 * Unsupported values normalize to an empty string so the
 * contract validator can reject them explicitly.
 */
function normalizeReleasePolicy(
    value
) {

    const normalizedPolicy =
        normalizeLowercase(
            value
        );

    return RELEASE_POLICIES.includes(
        normalizedPolicy
    )
        ? normalizedPolicy
        : "";

}


/*
 * Empty or invalid module/session targets normalize to null.
 */
function normalizeNullablePositiveInteger(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }

    const normalizedValue =
        Number(
            value
        );

    if (
        !Number.isInteger(
            normalizedValue
        ) ||
        normalizedValue < 1
    ) {

        return null;

    }

    return normalizedValue;

}


/*
 * Valid date-compatible values are converted to canonical
 * ISO-8601 timestamps. Empty or invalid values become null.
 */
function normalizeNullableIsoDateTime(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return null;

    }

    const normalizedValue =
        normalizeString(
            value
        );

    if (
        !normalizedValue
    ) {

        return null;

    }

    const date =
        new Date(
            normalizedValue
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }

    return date.toISOString();

}


/*
 * Distinguishes an optional empty value from a malformed
 * non-empty date value.
 */
function isValidOptionalDateTime(
    value
) {

    if (
        value === null ||
        value === undefined ||
        normalizeString(
            value
        ) === ""
    ) {

        return true;

    }

    return Boolean(
        normalizeNullableIsoDateTime(
            value
        )
    );

}


/*
 * A partially specified availability window is valid.
 * When both values are supplied, the end must be later.
 */
function isValidAvailabilityWindow(
    availableFrom,
    availableUntil
) {

    const normalizedFrom =
        normalizeNullableIsoDateTime(
            availableFrom
        );

    const normalizedUntil =
        normalizeNullableIsoDateTime(
            availableUntil
        );

    if (
        !normalizedFrom ||
        !normalizedUntil
    ) {

        return true;

    }

    return (
        new Date(
            normalizedUntil
        ).getTime() >
        new Date(
            normalizedFrom
        ).getTime()
    );

}


/* ==========================================================
   CLASSIFICATION NORMALIZATION
========================================================== */

function normalizeResourceCategory(
    value
) {

    const normalizedCategory =
        normalizeLowercase(
            value
        );

    const categoryMap =
        Object.freeze({

            licensed_course_material:
                "licensed_course_material",

            licensed_course_materials:
                "licensed_course_materials",

            supporting_document:
                "supporting_document",

            supporting_materials:
                "supporting_materials",

            reference_material:
                "reference_material",

            references:
                "references",

            video:
                "video",

            videos:
                "videos",

            download:
                "download",

            assessments:
                "assessments",

            templates:
                "templates",

            other:
                "other"

        });

    return categoryMap[
        normalizedCategory
    ] || normalizedCategory;

}


function inferContentType({
    contentType,
    resourceType,
    category,
    deliveryType
} = {}) {

    const normalizedContentType =
        normalizeLowercase(
            contentType
        );

    if (
        CONTENT_TYPES.includes(
            normalizedContentType
        )
    ) {

        return normalizedContentType;

    }

    const normalizedDeliveryType =
        normalizeLowercase(
            deliveryType
        );

    if (
        normalizedDeliveryType ===
        "external_video"
    ) {

        return "external_video";

    }

    if (
        normalizedDeliveryType ===
        "external_link"
    ) {

        return "external_link";

    }

    const normalizedCategory =
        normalizeResourceCategory(
            category
        );

    const categoryMap =
        Object.freeze({

            licensed_course_material:
                "licensed_course_material",

            licensed_course_materials:
                "licensed_course_material",

            supporting_document:
                "supporting_document",

            supporting_materials:
                "supporting_document",

            reference_material:
                "reference_material",

            references:
                "reference_material",

            video:
                "external_video",

            videos:
                "external_video",

            assessments:
                "assessment_guide",

            templates:
                "template",

            download:
                "other_document"

        });

    if (
        categoryMap[
            normalizedCategory
        ]
    ) {

        return categoryMap[
            normalizedCategory
        ];

    }

    const normalizedResourceType =
        normalizeLowercase(
            resourceType
        );

    if (
        normalizedResourceType ===
        "image"
    ) {

        return "image";

    }

    return "other_document";

}


function inferResourceType(
    contentType,
    deliveryType
) {

    const normalizedContentType =
        normalizeLowercase(
            contentType
        );

    const normalizedDeliveryType =
        normalizeLowercase(
            deliveryType
        );

    if (
        normalizedDeliveryType ===
            "external_video" ||
        normalizedContentType ===
            "external_video"
    ) {

        return "external_video";

    }

    if (
        normalizedDeliveryType ===
            "external_link" ||
        normalizedContentType ===
            "external_link"
    ) {

        return "external_link";

    }

    if (
        normalizedContentType ===
        "image"
    ) {

        return "image";

    }

    return "document";

}


function inferResourceCategory(
    contentType,
    category
) {

    const normalizedCategory =
        normalizeResourceCategory(
            category
        );

    if (
        RESOURCE_CATEGORIES.includes(
            normalizedCategory
        )
    ) {

        return normalizedCategory;

    }

    const normalizedContentType =
        normalizeLowercase(
            contentType
        );

    const categoryMap =
        Object.freeze({

            licensed_course_material:
                "licensed_course_material",

            supporting_workbook:
                "supporting_document",

            supporting_document:
                "supporting_document",

            handout:
                "supporting_document",

            reference_guide:
                "reference_material",

            reference_material:
                "reference_material",

            template:
                "templates",

            checklist:
                "supporting_document",

            programme_handbook:
                "supporting_document",

            case_study:
                "supporting_document",

            assessment_guide:
                "assessments",

            external_video:
                "video",

            external_link:
                "reference_material",

            image:
                "supporting_document",

            other_document:
                "download"

        });

    return categoryMap[
        normalizedContentType
    ] || "download";

}


function inferPersonalisationType({
    deliveryType,
    contentType,
    value
} = {}) {

    const normalizedValue =
        normalizeLowercase(
            value
        );

    if (
        PERSONALISATION_TYPES.includes(
            normalizedValue
        )
    ) {

        return normalizedValue;

    }

    const normalizedDeliveryType =
        normalizeLowercase(
            deliveryType
        );

    const normalizedContentType =
        normalizeLowercase(
            contentType
        );

    if (
        normalizedDeliveryType ===
            "external_video" ||
        normalizedDeliveryType ===
            "external_link"
    ) {

        return "none";

    }

    if (
        normalizedContentType ===
        "licensed_course_material"
    ) {

        return "learner_specific";

    }

    return "shared";

}


function inferStorageDomain({
    deliveryType,
    personalisationType,
    value
} = {}) {

    const normalizedValue =
        normalizeLowercase(
            value
        );

    if (
        STORAGE_DOMAINS.includes(
            normalizedValue
        )
    ) {

        return normalizedValue;

    }

    const normalizedDeliveryType =
        normalizeLowercase(
            deliveryType
        );

    const normalizedPersonalisationType =
        normalizeLowercase(
            personalisationType
        );

    if (
        normalizedDeliveryType ===
            "external_video" ||
        normalizedDeliveryType ===
            "external_link"
    ) {

        return "external";

    }

    if (
        normalizedPersonalisationType ===
        "learner_specific"
    ) {

        return "master_learning_resources";

    }

    return "learning_resources";

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


function isValidDeliveryId(
    deliveryId
) {

    return DELIVERY_ID_PATTERN.test(
        normalizeString(
            deliveryId
        )
    );

}


function isValidCredentialId(
    credentialId
) {

    return CREDENTIAL_ID_PATTERN.test(
        normalizeString(
            credentialId
        ).toUpperCase()
    );

}


function isValidSha256(
    value
) {

    const normalizedValue =
        normalizeString(
            value
        );

    if (
        !normalizedValue
    ) {

        return true;

    }

    return SHA256_PATTERN.test(
        normalizedValue
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


function normalizeFileNamePart(
    value
) {

    return normalizeString(
        value
    )
        .normalize(
            "NFKD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^A-Za-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        )
        .slice(
            0,
            100
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


function buildSourceFileName({
    resourceId,
    version,
    extension
} = {}) {

    const normalizedResourceId =
        normalizeFileNamePart(
            resourceId
        );

    const normalizedExtension =
        normalizeLowercase(
            extension
        ).replace(
            /[^a-z0-9]/g,
            ""
        );

    if (
        !normalizedResourceId ||
        !normalizedExtension
    ) {

        return "";

    }

    return normalizeFileName(
        `${normalizedResourceId}-Master-v${normalizeVersion(version)}.${normalizedExtension}`
    );

}


function buildSharedFileName({
    programCode,
    resourceName,
    version,
    extension
} = {}) {

    const normalizedProgramCode =
        normalizeFileNamePart(
            normalizeProgramCode(
                programCode
            )
        );

    const normalizedResourceName =
        normalizeFileNamePart(
            resourceName
        );

    const normalizedExtension =
        normalizeLowercase(
            extension
        ).replace(
            /[^a-z0-9]/g,
            ""
        );

    if (
        !normalizedProgramCode ||
        !normalizedResourceName ||
        !normalizedExtension
    ) {

        return "";

    }

    return normalizeFileName(
        `${normalizedProgramCode}-${normalizedResourceName}-v${normalizeVersion(version)}.${normalizedExtension}`
    );

}


function buildPersonalizedFileName({
    programCode,
    resourceName,
    version,
    credentialId,
    extension,
    includeVersion = true
} = {}) {

    const normalizedProgramCode =
        normalizeFileNamePart(
            normalizeProgramCode(
                programCode
            )
        );

    const normalizedResourceName =
        normalizeFileNamePart(
            resourceName
        );

    const normalizedCredentialId =
        normalizeString(
            credentialId
        ).toUpperCase();

    const normalizedExtension =
        normalizeLowercase(
            extension
        ).replace(
            /[^a-z0-9]/g,
            ""
        );

    if (
        !normalizedProgramCode ||
        !normalizedResourceName ||
        !isValidCredentialId(
            normalizedCredentialId
        ) ||
        !normalizedExtension
    ) {

        return "";

    }

    const versionSegment =
        includeVersion
            ? `-v${normalizeVersion(version)}`
            : "";

    return normalizeFileName(
        `${normalizedProgramCode}-${normalizedResourceName}${versionSegment}-${normalizedCredentialId}.${normalizedExtension}`
    );

}

/* ==========================================================
   STORAGE PATH NORMALIZATION
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


/* ==========================================================
   SHARED STORAGE PATH
========================================================== */

function buildStoragePath({
    programCode,
    resourceId,
    version,
    fileName
} = {}) {

    return buildSharedStoragePath({
        programCode,
        resourceId,
        version,
        fileName
    });

}


function buildSharedStoragePath({
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
        SHARED_STORAGE_ROOT +
        `${normalizedProgramCode}/` +
        `${normalizedResourceId}/` +
        `v${normalizedVersion}/` +
        normalizedFileName
    );

}


/* ==========================================================
   MASTER STORAGE PATH
========================================================== */

function buildMasterStoragePath({
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
        MASTER_STORAGE_ROOT +
        `${normalizedProgramCode}/` +
        `${normalizedResourceId}/` +
        `v${normalizedVersion}/` +
        normalizedFileName
    );

}


/* ==========================================================
   LEARNER STORAGE PATH
========================================================== */

function buildLearnerStoragePath({
    learnerUid,
    programCode,
    resourceId,
    version,
    licenceId,
    credentialId,
    fileName
} = {}) {

    const normalizedLearnerUid =
        normalizeString(
            learnerUid
        );

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

    const normalizedLicenceId =
        normalizeString(
            licenceId ||
            credentialId
        ).toUpperCase();

    const normalizedFileName =
        normalizeFileName(
            fileName
        );

    if (
        !normalizedLearnerUid ||
        normalizedLearnerUid.includes(
            "/"
        ) ||
        !PROGRAM_CODE_PATTERN.test(
            normalizedProgramCode
        ) ||
        !RESOURCE_ID_PATTERN.test(
            normalizedResourceId
        ) ||
        !normalizedLicenceId ||
        normalizedLicenceId.includes(
            "/"
        ) ||
        !isValidFileName(
            normalizedFileName
        )
    ) {

        return "";

    }

    return (
        LEARNER_STORAGE_ROOT +
        `${normalizedLearnerUid}/` +
        `${normalizedProgramCode}/` +
        `${normalizedResourceId}/` +
        `v${normalizedVersion}/` +
        `${normalizedLicenceId}/` +
        normalizedFileName
    );

}


/* ==========================================================
   STORAGE PATH VALIDATION
========================================================== */

function isValidSharedStoragePath(
    storagePath
) {

    const normalizedPath =
        normalizeStoragePath(
            storagePath
        );

    if (
        !normalizedPath.startsWith(
            SHARED_STORAGE_ROOT
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

    return (
        root ===
            SHARED_STORAGE_ROOT.slice(
                0,
                -1
            ) &&
        PROGRAM_CODE_PATTERN.test(
            programCode
        ) &&
        RESOURCE_ID_PATTERN.test(
            resourceId
        ) &&
        /^v[1-9][0-9]*$/.test(
            versionSegment
        ) &&
        isValidFileName(
            fileName
        ) &&
        normalizedPath.length <= 1000
    );

}


function isValidMasterStoragePath(
    storagePath
) {

    const normalizedPath =
        normalizeStoragePath(
            storagePath
        );

    if (
        !normalizedPath.startsWith(
            MASTER_STORAGE_ROOT
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

    return (
        root ===
            MASTER_STORAGE_ROOT.slice(
                0,
                -1
            ) &&
        PROGRAM_CODE_PATTERN.test(
            programCode
        ) &&
        RESOURCE_ID_PATTERN.test(
            resourceId
        ) &&
        /^v[1-9][0-9]*$/.test(
            versionSegment
        ) &&
        isValidFileName(
            fileName
        ) &&
        normalizedPath.length <= 1000
    );

}


function isValidLearnerStoragePath(
    storagePath,
    learnerUid = ""
) {

    const normalizedPath =
        normalizeStoragePath(
            storagePath
        );

    if (
        !normalizedPath.startsWith(
            LEARNER_STORAGE_ROOT
        )
    ) {

        return false;

    }

    const segments =
        normalizedPath.split(
            "/"
        );

    if (
        segments.length !== 7
    ) {

        return false;

    }

    const [
        root,
        pathLearnerUid,
        programCode,
        resourceId,
        versionSegment,
        licenceId,
        fileName
    ] = segments;

    const expectedLearnerUid =
        normalizeString(
            learnerUid
        );

    return (
        root ===
            LEARNER_STORAGE_ROOT.slice(
                0,
                -1
            ) &&
        Boolean(
            pathLearnerUid
        ) &&
        (
            !expectedLearnerUid ||
            pathLearnerUid ===
                expectedLearnerUid
        ) &&
        PROGRAM_CODE_PATTERN.test(
            programCode
        ) &&
        RESOURCE_ID_PATTERN.test(
            resourceId
        ) &&
        /^v[1-9][0-9]*$/.test(
            versionSegment
        ) &&
        Boolean(
            licenceId
        ) &&
        isValidFileName(
            fileName
        ) &&
        normalizedPath.length <= 1000
    );

}


function isValidProtectedStoragePath(
    storagePath
) {

    return (
        isValidSharedStoragePath(
            storagePath
        ) ||
        isValidMasterStoragePath(
            storagePath
        ) ||
        isValidLearnerStoragePath(
            storagePath
        )
    );

}


function storagePathMatchesResource(
    storagePath,
    resource
) {

    if (
        !resource
    ) {

        return false;

    }

    const normalizedPath =
        normalizeStoragePath(
            storagePath
        );

    const programCode =
        resource.program_code ||
        resource.programCode;

    const resourceId =
        resource.resource_id ||
        resource.resourceId;

    const version =
        resource.version;

    const fileName =
        resource.file_name ||
        resource.fileName ||
        resource.source_file_name ||
        resource.sourceFileName;

    const storageDomain =
        normalizeLowercase(
            resource.storage_domain ||
            resource.storageDomain ||
            "learning_resources"
        );

    let expectedPath =
        "";

    if (
        storageDomain ===
        "master_learning_resources"
    ) {

        expectedPath =
            buildMasterStoragePath({
                programCode,
                resourceId,
                version,
                fileName
            });

    }
    else {

        expectedPath =
            buildSharedStoragePath({
                programCode,
                resourceId,
                version,
                fileName
            });

    }

    return (
        Boolean(
            expectedPath
        ) &&
        normalizedPath ===
            expectedPath
    );

}

/* ==========================================================
   HTTPS URL VALIDATION
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
         * Managed external URLs must not contain embedded
         * username or password credentials.
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


/* ==========================================================
   EXTERNAL VIDEO NORMALIZATION
========================================================== */

function normalizeExternalVideo(
    value
) {

    const parsedUrl =
        parseHttpsUrl(
            value
        );

    if (
        !parsedUrl
    ) {

        return null;

    }

    const hostname =
        parsedUrl.hostname.toLowerCase();

    if (
        !APPROVED_EXTERNAL_VIDEO_HOSTS.includes(
            hostname
        )
    ) {

        return null;

    }

    /*
     * YouTube short URL:
     *
     * https://youtu.be/VIDEO_ID
     */
    if (
        hostname ===
        "youtu.be"
    ) {

        const videoId =
            parsedUrl.pathname
                .split(
                    "/"
                )
                .filter(
                    Boolean
                )[0] || "";

        const normalizedVideoId =
            videoId.replace(
                /[^A-Za-z0-9_-]/g,
                ""
            );

        if (
            !normalizedVideoId
        ) {

            return null;

        }

        return Object.freeze({

            provider:
                "youtube",

            videoId:
                normalizedVideoId,

            canonicalUrl:
                `https://www.youtube.com/watch?v=${normalizedVideoId}`,

            embedUrl:
                `https://www.youtube-nocookie.com/embed/${normalizedVideoId}`,

            host:
                "www.youtube.com"

        });

    }

    /*
     * YouTube standard, embed, shorts and live URLs.
     */
    if (
        hostname.includes(
            "youtube"
        )
    ) {

        let videoId =
            "";

        if (
            parsedUrl.pathname ===
            "/watch"
        ) {

            videoId =
                parsedUrl.searchParams.get(
                    "v"
                ) || "";

        }
        else {

            const pathSegments =
                parsedUrl.pathname
                    .split(
                        "/"
                    )
                    .filter(
                        Boolean
                    );

            const markerIndex =
                pathSegments.findIndex(
                    (segment) =>
                        [
                            "embed",
                            "shorts",
                            "live"
                        ].includes(
                            segment
                        )
                );

            if (
                markerIndex >= 0
            ) {

                videoId =
                    pathSegments[
                        markerIndex + 1
                    ] || "";

            }

        }

        const normalizedVideoId =
            videoId.replace(
                /[^A-Za-z0-9_-]/g,
                ""
            );

        if (
            !normalizedVideoId
        ) {

            return null;

        }

        return Object.freeze({

            provider:
                "youtube",

            videoId:
                normalizedVideoId,

            canonicalUrl:
                `https://www.youtube.com/watch?v=${normalizedVideoId}`,

            embedUrl:
                `https://www.youtube-nocookie.com/embed/${normalizedVideoId}`,

            host:
                "www.youtube.com"

        });

    }

    /*
     * Vimeo standard and player URLs.
     */
    if (
        hostname.includes(
            "vimeo.com"
        )
    ) {

        const pathSegments =
            parsedUrl.pathname
                .split(
                    "/"
                )
                .filter(
                    Boolean
                );

        const videoId =
            [...pathSegments]
                .reverse()
                .find(
                    (segment) =>
                        /^[0-9]+$/.test(
                            segment
                        )
                ) || "";

        if (
            !videoId
        ) {

            return null;

        }

        return Object.freeze({

            provider:
                "vimeo",

            videoId,

            canonicalUrl:
                `https://vimeo.com/${videoId}`,

            embedUrl:
                `https://player.vimeo.com/video/${videoId}`,

            host:
                "vimeo.com"

        });

    }

    return null;

}


function isApprovedExternalVideoUrl(
    value
) {

    return Boolean(
        normalizeExternalVideo(
            value
        )
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
   MIME AND EXTENSION CONSISTENCY
========================================================== */

function getApprovedExtensionsForMimeType(
    mimeType
) {

    const normalizedMimeType =
        normalizeLowercase(
            mimeType
        );

    const extensionMap =
        Object.freeze({

            "application/pdf":
                [
                    "pdf"
                ],

            "text/plain":
                [
                    "txt"
                ],

            "text/markdown":
                [
                    "md",
                    "markdown"
                ],

            "text/csv":
                [
                    "csv"
                ],

            "application/msword":
                [
                    "doc"
                ],

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                [
                    "docx"
                ],

            "application/vnd.ms-powerpoint":
                [
                    "ppt"
                ],

            "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                [
                    "pptx"
                ],

            "application/vnd.ms-excel":
                [
                    "xls"
                ],

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [
                    "xlsx"
                ],

            "application/vnd.oasis.opendocument.text":
                [
                    "odt"
                ],

            "application/vnd.oasis.opendocument.presentation":
                [
                    "odp"
                ],

            "application/vnd.oasis.opendocument.spreadsheet":
                [
                    "ods"
                ],

            "image/png":
                [
                    "png"
                ],

            "image/jpeg":
                [
                    "jpg",
                    "jpeg"
                ],

            "image/jpg":
                [
                    "jpg",
                    "jpeg"
                ]

        });

    return Object.freeze([
        ...(
            extensionMap[
                normalizedMimeType
            ] || []
        )
    ]);

}


function mimeTypeMatchesFileName(
    mimeType,
    fileName
) {

    const approvedExtensions =
        getApprovedExtensionsForMimeType(
            mimeType
        );

    if (
        approvedExtensions.length === 0
    ) {

        return false;

    }

    const extension =
        getFileExtension(
            fileName
        );

    return approvedExtensions.includes(
        extension
    );

}


/* ==========================================================
   RESOURCE TYPE CONSISTENCY
========================================================== */

function resourceTypeMatchesDeliveryType(
    resourceType,
    deliveryType
) {

    const normalizedResourceType =
        normalizeLowercase(
            resourceType
        );

    const normalizedDeliveryType =
        normalizeLowercase(
            deliveryType
        );

    if (
        normalizedDeliveryType ===
        "external_video"
    ) {

        return normalizedResourceType ===
            "external_video";

    }

    if (
        normalizedDeliveryType ===
        "external_link"
    ) {

        return normalizedResourceType ===
            "external_link";

    }

    if (
        normalizedDeliveryType ===
        "protected_storage"
    ) {

        return [
            "document",
            "image"
        ].includes(
            normalizedResourceType
        );

    }

    return false;

}


/* ==========================================================
   CONTENT TYPE CONSISTENCY
========================================================== */

function contentTypeMatchesDeliveryType(
    contentType,
    deliveryType
) {

    const normalizedContentType =
        normalizeLowercase(
            contentType
        );

    const normalizedDeliveryType =
        normalizeLowercase(
            deliveryType
        );

    if (
        normalizedDeliveryType ===
        "external_video"
    ) {

        return normalizedContentType ===
            "external_video";

    }

    if (
        normalizedDeliveryType ===
        "external_link"
    ) {

        return normalizedContentType ===
            "external_link";

    }

    if (
        normalizedDeliveryType ===
        "protected_storage"
    ) {

        return ![
            "external_video",
            "external_link"
        ].includes(
            normalizedContentType
        );

    }

    return false;

}


/* ==========================================================
   STORAGE DOMAIN CONSISTENCY
========================================================== */

function storageDomainMatchesResource({
    deliveryType,
    personalisationType,
    storageDomain
} = {}) {

    const normalizedDeliveryType =
        normalizeLowercase(
            deliveryType
        );

    const normalizedPersonalisationType =
        normalizeLowercase(
            personalisationType
        );

    const normalizedStorageDomain =
        normalizeLowercase(
            storageDomain
        );

    if (
        normalizedDeliveryType ===
            "external_video" ||
        normalizedDeliveryType ===
            "external_link"
    ) {

        return normalizedStorageDomain ===
            "external";

    }

    if (
        normalizedDeliveryType !==
        "protected_storage"
    ) {

        return false;

    }

    if (
        normalizedPersonalisationType ===
        "shared"
    ) {

        return normalizedStorageDomain ===
            "learning_resources";

    }

    if (
        normalizedPersonalisationType ===
        "learner_specific"
    ) {

        return normalizedStorageDomain ===
            "master_learning_resources";

    }

    return false;

}

/* ==========================================================
   RELEASE GOVERNANCE VALIDATION
========================================================== */

/*
 * Validates the normalized release-governance metadata stored
 * on a learning-resource record.
 *
 * This function validates metadata consistency only.
 * It does not decide whether a particular learner may view
 * or consume the resource.
 */
function validateReleaseGovernance(
    resource
) {

    const errors =
        [];

    if (
        !resource ||
        typeof resource !==
            "object"
    ) {

        return [
            "Release-governance metadata is required."
        ];

    }

    const releasePolicy =
        normalizeReleasePolicy(
            resource.release_policy
        );

    const moduleNumber =
        normalizeNullablePositiveInteger(
            resource.module_number
        );

    const sessionNumber =
        normalizeNullablePositiveInteger(
            resource.session_number
        );

    const availableFrom =
        resource.available_from;

    const availableUntil =
        resource.available_until;

    if (
        !releasePolicy
    ) {

        errors.push(
            "Release policy is required and must be a supported governed policy."
        );

        return errors;

    }

    if (
        MODULE_RELEASE_POLICIES.includes(
            releasePolicy
        ) &&
        moduleNumber === null
    ) {

        errors.push(
            "Module-based release policies require a positive module number."
        );

    }

    if (
        SESSION_RELEASE_POLICIES.includes(
            releasePolicy
        ) &&
        sessionNumber === null
    ) {

        errors.push(
            "Session-based release policies require a positive session number."
        );

    }

    if (
        sessionNumber !== null &&
        moduleNumber === null
    ) {

        errors.push(
            "A session number requires a corresponding positive module number."
        );

    }

    if (
        LIFECYCLE_RELEASE_POLICIES.includes(
            releasePolicy
        ) &&
        (
            moduleNumber !== null ||
            sessionNumber !== null
        )
    ) {

        errors.push(
            "Lifecycle release policies cannot define module or session targets."
        );

    }

    if (
        !isValidOptionalDateTime(
            availableFrom
        )
    ) {

        errors.push(
            "Available-from must be a valid date and time."
        );

    }

    if (
        !isValidOptionalDateTime(
            availableUntil
        )
    ) {

        errors.push(
            "Available-until must be a valid date and time."
        );

    }

    if (
        isValidOptionalDateTime(
            availableFrom
        ) &&
        isValidOptionalDateTime(
            availableUntil
        ) &&
        !isValidAvailabilityWindow(
            availableFrom,
            availableUntil
        )
    ) {

        errors.push(
            "Available-until must be later than available-from."
        );

    }

    return errors;

}


/*
 * Validates release values before normalization so malformed
 * date values or invalid positive-integer targets cannot be
 * silently converted to null.
 */
function validateRawReleaseGovernanceInput(
    input
) {

    const errors =
        [];

    if (
        !input ||
        typeof input !==
            "object"
    ) {

        return errors;

    }

    const rawReleasePolicy =
        firstDefined(
            input.release_policy,
            input.releasePolicy,
            "on_enrollment"
        );

    const rawModuleNumber =
        firstDefined(
            input.module_number,
            input.moduleNumber,
            null
        );

    const rawSessionNumber =
        firstDefined(
            input.session_number,
            input.sessionNumber,
            null
        );

    const rawAvailableFrom =
        firstDefined(
            input.available_from,
            input.availableFrom,
            null
        );

    const rawAvailableUntil =
        firstDefined(
            input.available_until,
            input.availableUntil,
            null
        );

    if (
        !normalizeReleasePolicy(
            rawReleasePolicy
        )
    ) {

        errors.push(
            "Release policy is required and must be a supported governed policy."
        );

    }

    if (
        rawModuleNumber !== null &&
        rawModuleNumber !== undefined &&
        normalizeString(
            rawModuleNumber
        ) !== "" &&
        normalizeNullablePositiveInteger(
            rawModuleNumber
        ) === null
    ) {

        errors.push(
            "Module number must be a positive integer when provided."
        );

    }

    if (
        rawSessionNumber !== null &&
        rawSessionNumber !== undefined &&
        normalizeString(
            rawSessionNumber
        ) !== "" &&
        normalizeNullablePositiveInteger(
            rawSessionNumber
        ) === null
    ) {

        errors.push(
            "Session number must be a positive integer when provided."
        );

    }

    if (
        !isValidOptionalDateTime(
            rawAvailableFrom
        )
    ) {

        errors.push(
            "Available-from must be a valid date and time."
        );

    }

    if (
        !isValidOptionalDateTime(
            rawAvailableUntil
        )
    ) {

        errors.push(
            "Available-until must be a valid date and time."
        );

    }

    if (
        isValidOptionalDateTime(
            rawAvailableFrom
        ) &&
        isValidOptionalDateTime(
            rawAvailableUntil
        ) &&
        !isValidAvailabilityWindow(
            rawAvailableFrom,
            rawAvailableUntil
        )
    ) {

        errors.push(
            "Available-until must be later than available-from."
        );

    }

    return errors;

}


/* ==========================================================
   PERMISSION CONSISTENCY
========================================================== */

function validatePermissionCombination(
    resource
) {

    const errors =
        [];

    const deliveryType =
        normalizeLowercase(
            resource.delivery_type
        );

    const storageDomain =
        normalizeLowercase(
            resource.storage_domain
        );

    if (
        deliveryType ===
        "external_video"
    ) {

        if (
            resource.download_allowed ===
            true
        ) {

            errors.push(
                "External videos cannot enable direct download."
            );

        }

        if (
            resource.embed_allowed !==
            true
        ) {

            errors.push(
                "External videos must enable governed embed playback."
            );

        }

    }

    if (
        deliveryType ===
        "external_link"
    ) {

        if (
            resource.download_allowed ===
            true
        ) {

            errors.push(
                "External links cannot enable direct platform download."
            );

        }

        if (
            resource.embed_allowed ===
            true
        ) {

            errors.push(
                "External links cannot enable embedded rendering."
            );

        }

    }

    if (
        storageDomain ===
        "master_learning_resources"
    ) {

        if (
            resource.preview_allowed ===
                true ||
            resource.download_allowed ===
                true ||
            resource.embed_allowed ===
                true
        ) {

            errors.push(
                "Master resources cannot expose learner preview, download or embed permissions."
            );

        }

    }

    return errors;

}


/* ==========================================================
   RESOURCE NORMALIZATION
========================================================== */

function normalizeResourceInput(
    input = {}
) {

    const deliveryType =
        normalizeLowercase(
            firstDefined(
                input.delivery_type,
                input.deliveryType,
                "protected_storage"
            )
        );

    const contentType =
        inferContentType({

            contentType:
                firstDefined(
                    input.content_type,
                    input.contentType
                ),

            resourceType:
                firstDefined(
                    input.resource_type,
                    input.resourceType
                ),

            category:
                firstDefined(
                    input.resource_category,
                    input.resourceCategory,
                    input.category
                ),

            deliveryType

        });

    const resourceType =
        inferResourceType(
            contentType,
            deliveryType
        );

    const resourceCategory =
        inferResourceCategory(
            contentType,
            firstDefined(
                input.resource_category,
                input.resourceCategory,
                input.category
            )
        );

    const personalisationType =
        inferPersonalisationType({

            deliveryType,

            contentType,

            value:
                firstDefined(
                    input.personalisation_type,
                    input.personalisationType,
                    input.personalization_type,
                    input.personalizationType
                )

        });

    const storageDomain =
        inferStorageDomain({

            deliveryType,

            personalisationType,

            value:
                firstDefined(
                    input.storage_domain,
                    input.storageDomain
                )

        });

    const resourceId =
        normalizeResourceId(
            firstDefined(
                input.resource_id,
                input.resourceId,
                input.title
            )
        );

    const version =
        normalizeVersion(
            input.version
        );

    const resourceDocumentId =
        buildDocumentId(
            resourceId,
            version
        );

    const fileName =
        normalizeFileName(
            firstDefined(
                input.file_name,
                input.fileName,
                input.source_file_name,
                input.sourceFileName
            )
        );

    const protectedDelivery =
        deliveryType ===
        "protected_storage";

    const externalVideo =
        deliveryType ===
        "external_video"
            ? normalizeExternalVideo(
                firstDefined(
                    input.external_url,
                    input.externalUrl
                )
            )
            : null;

    const rawExternalUrl =
        normalizeString(
            firstDefined(
                input.external_url,
                input.externalUrl
            )
        );

    const externalUrl =
        protectedDelivery
            ? null
            : (
                externalVideo
                    ? externalVideo.canonicalUrl
                    : (
                        rawExternalUrl ||
                        null
                    )
            );

    const defaultPreviewAllowed =
        deliveryType !==
        "external_link";

    const defaultDownloadAllowed =
        protectedDelivery &&
        storageDomain !==
            "master_learning_resources";

    const defaultEmbedAllowed =
        deliveryType ===
        "external_video";

    const fileSizeBytes =
        protectedDelivery
            ? normalizeFileSize(
                firstDefined(
                    input.file_size_bytes,
                    input.fileSizeBytes,
                    input.file_size,
                    input.fileSize
                )
            )
            : 0;

    return {

        resource_id:
            resourceId,

        resource_document_id:
            resourceDocumentId,

        program_code:
            normalizeProgramCode(
                firstDefined(
                    input.program_code,
                    input.programCode
                )
            ),

        title:
            normalizeString(
                input.title
            ),

        short_title:
            normalizeNullableString(
                firstDefined(
                    input.short_title,
                    input.shortTitle
                )
            ),

        description:
            normalizeString(
                input.description
            ),

        content_type:
            contentType,

        /*
         * Legacy field retained for current Admin modules.
         */
        resource_type:
            resourceType,

        resource_category:
            resourceCategory,

        /*
         * Legacy field retained for current Admin modules.
         */
        category:
            resourceCategory,

        module_code:
            normalizeNullableString(
                firstDefined(
                    input.module_code,
                    input.moduleCode
                )
            ),

        module_title:
            normalizeNullableString(
                firstDefined(
                    input.module_title,
                    input.moduleTitle
                )
            ),

        delivery_type:
            deliveryType,

        personalisation_type:
            personalisationType,

        storage_domain:
            storageDomain,

        storage_path:
            protectedDelivery
                ? normalizeNullableString(
                    firstDefined(
                        input.storage_path,
                        input.storagePath
                    )
                )
                : null,

        external_provider:
            externalVideo
                ? externalVideo.provider
                : normalizeNullableString(
                    firstDefined(
                        input.external_provider,
                        input.externalProvider
                    )
                ),

        external_video_id:
            externalVideo
                ? externalVideo.videoId
                : normalizeNullableString(
                    firstDefined(
                        input.external_video_id,
                        input.externalVideoId
                    )
                ),

        external_url:
            externalUrl,

        external_host:
            externalVideo
                ? externalVideo.host
                : (
                    externalUrl
                        ? (
                            parseHttpsUrl(
                                externalUrl
                            )?.hostname ||
                            null
                        )
                        : null
                ),

        file_name:
            protectedDelivery
                ? (
                    fileName ||
                    null
                )
                : null,

        source_file_name:
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
                ? normalizeNullableString(
                    normalizeLowercase(
                        firstDefined(
                            input.mime_type,
                            input.mimeType
                        )
                    )
                )
                : null,

        file_size_bytes:
            fileSizeBytes,

        /*
         * Legacy alias retained.
         */
        file_size:
            fileSizeBytes,

        sha256:
            normalizeNullableString(
                input.sha256
            ),

        preview_allowed:
            normalizeBoolean(
                firstDefined(
                    input.preview_allowed,
                    input.previewAllowed
                ),
                defaultPreviewAllowed
            ),

        download_allowed:
            normalizeBoolean(
                firstDefined(
                    input.download_allowed,
                    input.downloadAllowed
                ),
                defaultDownloadAllowed
            ),

        embed_allowed:
            normalizeBoolean(
                firstDefined(
                    input.embed_allowed,
                    input.embedAllowed
                ),
                defaultEmbedAllowed
            ),

        status:
            normalizeLowercase(
                input.status
            ) || "draft",

        is_active:
            normalizeBoolean(
                firstDefined(
                    input.is_active,
                    input.isActive
                ),
                false
            ),

        is_latest:
            normalizeBoolean(
                firstDefined(
                    input.is_latest,
                    input.isLatest
                ),
                false
            ),

        version,

        version_label:
            normalizeNullableString(
                firstDefined(
                    input.version_label,
                    input.versionLabel
                )
            ),

        display_order:
            normalizeDisplayOrder(
                firstDefined(
                    input.display_order,
                    input.displayOrder
                )
            ),

        module_order:
            normalizeDisplayOrder(
                firstDefined(
                    input.module_order,
                    input.moduleOrder,
                    0
                )
            ),

        release_policy:
            normalizeReleasePolicy(
                firstDefined(
                    input.release_policy,
                    input.releasePolicy,
                    "on_enrollment"
                )
            ),

        module_number:
            normalizeNullablePositiveInteger(
                firstDefined(
                    input.module_number,
                    input.moduleNumber,
                    null
                )
            ),

        session_number:
            normalizeNullablePositiveInteger(
                firstDefined(
                    input.session_number,
                    input.sessionNumber,
                    null
                )
            ),

        available_from:
            normalizeNullableIsoDateTime(
                firstDefined(
                    input.available_from,
                    input.availableFrom,
                    null
                )
            ),

        available_until:
            normalizeNullableIsoDateTime(
                firstDefined(
                    input.available_until,
                    input.availableUntil,
                    null
                )
            ),

        source:
            normalizeLowercase(
                input.source
            ) || "admin_portal"

    };

}

/* ==========================================================
   VALIDATION RESULT
========================================================== */

function buildValidationResult(
    errors
) {

    const uniqueErrors =
        Array.from(
            new Set(
                errors.filter(
                    Boolean
                )
            )
        );

    return Object.freeze({

        valid:
            uniqueErrors.length === 0,

        errors:
            Object.freeze([
                ...uniqueErrors
            ])

    });

}


/* ==========================================================
   COMMON RESOURCE VALIDATION
========================================================== */

function validateCommonResourceFields(
    resource
) {

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

    if (
        !isValidDocumentId(
            resource.resource_document_id
        ) ||
        resource.resource_document_id !==
            buildDocumentId(
                resource.resource_id,
                resource.version
            )
    ) {

        errors.push(
            "Resource document ID must match the Resource ID and version."
        );

    }

    const title =
        normalizeString(
            resource.title
        );

    if (
        !title ||
        title.length >
            MAX_TITLE_LENGTH
    ) {

        errors.push(
            `Title is required and must not exceed ${MAX_TITLE_LENGTH} characters.`
        );

    }

    const description =
        normalizeString(
            resource.description
        );

    if (
        description.length >
            MAX_DESCRIPTION_LENGTH
    ) {

        errors.push(
            `Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters.`
        );

    }

    if (
        !CONTENT_TYPES.includes(
            normalizeLowercase(
                resource.content_type
            )
        )
    ) {

        errors.push(
            "Content type is invalid."
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
                resource.resource_category
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
        !PERSONALISATION_TYPES.includes(
            normalizeLowercase(
                resource.personalisation_type
            )
        )
    ) {

        errors.push(
            "Personalisation type is invalid."
        );

    }

    if (
        !STORAGE_DOMAINS.includes(
            normalizeLowercase(
                resource.storage_domain
            )
        )
    ) {

        errors.push(
            "Storage domain is invalid."
        );

    }

    if (
        !resourceTypeMatchesDeliveryType(
            resource.resource_type,
            resource.delivery_type
        )
    ) {

        errors.push(
            "Resource type does not match the delivery type."
        );

    }

    if (
        !contentTypeMatchesDeliveryType(
            resource.content_type,
            resource.delivery_type
        )
    ) {

        errors.push(
            "Content type does not match the delivery type."
        );

    }

    if (
        !storageDomainMatchesResource({

            deliveryType:
                resource.delivery_type,

            personalisationType:
                resource.personalisation_type,

            storageDomain:
                resource.storage_domain

        })
    ) {

        errors.push(
            "Storage domain does not match the delivery and personalisation type."
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

    if (
        !Number.isInteger(
            resource.module_order
        ) ||
        resource.module_order < 0 ||
        resource.module_order >
            MAX_DISPLAY_ORDER
    ) {

        errors.push(
            "Module order must be between 0 and 10,000."
        );

    }

    if (
        !RESOURCE_STATUSES.includes(
            normalizeLowercase(
                resource.status
            )
        )
    ) {

        errors.push(
            "Resource status is invalid."
        );

    }

    if (
        typeof resource.is_active !==
            "boolean"
    ) {

        errors.push(
            "Active status must be a Boolean value."
        );

    }

    if (
        typeof resource.is_latest !==
            "boolean"
    ) {

        errors.push(
            "Latest-version status must be a Boolean value."
        );

    }

    if (
        typeof resource.preview_allowed !==
            "boolean" ||
        typeof resource.download_allowed !==
            "boolean" ||
        typeof resource.embed_allowed !==
            "boolean"
    ) {

        errors.push(
            "Preview, download and embed permissions must be Boolean values."
        );

    }

    if (
        !isValidSha256(
            resource.sha256
        )
    ) {

        errors.push(
            "SHA-256 must contain exactly 64 hexadecimal characters."
        );

    }

    errors.push(
        ...validateReleaseGovernance(
            resource
        )
    );

    errors.push(
        ...validatePermissionCombination(
            resource
        )
    );

    return errors;

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
        validateRawReleaseGovernanceInput(
            resource
        );

    const normalized =
        normalizeResourceInput(
            resource
        );

    errors.push(
        ...validateCommonResourceFields(
            normalized
        )
    );

    if (
        normalized.status !==
            "draft"
    ) {

        errors.push(
            "Learning-resource drafts must have draft status."
        );

    }

    if (
        normalized.is_active !==
            false
    ) {

        errors.push(
            "Draft learning resources cannot be active."
        );

    }

    if (
        normalized.is_latest !==
            false
    ) {

        errors.push(
            "Draft learning resources cannot be marked as the latest published version."
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

    const errors =
        validateRawReleaseGovernanceInput(
            resource
        );

    const normalized =
        normalizeResourceInput(
            resource
        );

    errors.push(
        ...validateCommonResourceFields(
            normalized
        )
    );

    const deliveryType =
        normalized.delivery_type;

    const personalisationType =
        normalized.personalisation_type;

    const storageDomain =
        normalized.storage_domain;

    const storagePath =
        normalizeStoragePath(
            normalized.storage_path
        );

    const externalUrl =
        normalizeString(
            normalized.external_url
        );

    const fileName =
        normalizeFileName(
            normalized.file_name
        );

    const mimeType =
        normalizeLowercase(
            normalized.mime_type
        );

    const fileSize =
        normalizeFileSize(
            normalized.file_size_bytes
        );

    if (
        normalized.status !==
            "published"
    ) {

        errors.push(
            "Publication validation requires published status."
        );

    }

    if (
        normalized.is_active !==
            true
    ) {

        errors.push(
            "Published learning resources must be active."
        );

    }

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
            storageDomain ===
                "learning_resources" &&
            !isValidSharedStoragePath(
                storagePath
            )
        ) {

            errors.push(
                "Shared protected resources require a valid learning-resources Storage path."
            );

        }
        else if (
            storageDomain ===
                "master_learning_resources" &&
            !isValidMasterStoragePath(
                storagePath
            )
        ) {

            errors.push(
                "Master resources require a valid master-learning-resources Storage path."
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
                normalized
            )
        ) {

            errors.push(
                "The Storage path does not match the resource identity, version, filename and Storage domain."
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

        if (
            fileName &&
            mimeType &&
            !mimeTypeMatchesFileName(
                mimeType,
                fileName
            )
        ) {

            errors.push(
                "The filename extension does not match the selected MIME type."
            );

        }

        if (
            personalisationType ===
                "none"
        ) {

            errors.push(
                "Protected Storage resources must use shared or learner-specific personalisation."
            );

        }

    }

    if (
        deliveryType ===
        "external_video"
    ) {

        const video =
            normalizeExternalVideo(
                externalUrl
            );

        if (
            !video
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
            storageDomain !==
                "external"
        ) {

            errors.push(
                "External videos must use the external Storage domain."
            );

        }

        if (
            personalisationType !==
                "none"
        ) {

            errors.push(
                "External videos must use personalisation type none."
            );

        }

        if (
            video &&
            (
                normalized.external_provider !==
                    video.provider ||
                normalized.external_video_id !==
                    video.videoId
            )
        ) {

            errors.push(
                "External video provider and video ID must match the normalized URL."
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

        if (
            storageDomain !==
                "external"
        ) {

            errors.push(
                "External resources must use the external Storage domain."
            );

        }

        if (
            personalisationType !==
                "none"
        ) {

            errors.push(
                "External resources must use personalisation type none."
            );

        }

    }

    return buildValidationResult(
        errors
    );

}

/* ==========================================================
   PUBLICATION PAYLOAD
========================================================== */

function buildPublicationPayload(
    input = {}
) {

    const normalized =
        normalizeResourceInput({
            ...input,

            status:
                "published",

            is_active:
                true
        });

    return Object.freeze({
        ...normalized,

        status:
            "published",

        is_active:
            true
    });

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

        maxTitleLength:
            MAX_TITLE_LENGTH,

        maxDescriptionLength:
            MAX_DESCRIPTION_LENGTH,

        protectedStorageRoot:
            PROTECTED_STORAGE_ROOT,

        sharedStorageRoot:
            SHARED_STORAGE_ROOT,

        learnerStorageRoot:
            LEARNER_STORAGE_ROOT,

        masterStorageRoot:
            MASTER_STORAGE_ROOT,

        resourceTypes:
            RESOURCE_TYPES,

        contentTypes:
            CONTENT_TYPES,

        categories:
            RESOURCE_CATEGORIES,

        deliveryTypes:
            DELIVERY_TYPES,

        personalisationTypes:
            PERSONALISATION_TYPES,

        storageDomains:
            STORAGE_DOMAINS,

        statuses:
            RESOURCE_STATUSES,

        releasePolicies:
            RELEASE_POLICIES,

        moduleReleasePolicies:
            MODULE_RELEASE_POLICIES,

        sessionReleasePolicies:
            SESSION_RELEASE_POLICIES,

        lifecycleReleasePolicies:
            LIFECYCLE_RELEASE_POLICIES,

        approvedMimeTypes:
            APPROVED_MIME_TYPES,

        approvedExternalVideoProviders:
            APPROVED_EXTERNAL_VIDEO_PROVIDERS,

        approvedExternalVideoHosts:
            APPROVED_EXTERNAL_VIDEO_HOSTS,

        normalizeString,

        normalizeLowercase,

        normalizeProgramCode,

        normalizeResourceId,

        normalizeVersion,

        normalizeDisplayOrder,

        normalizeBoolean,

        normalizeFileSize,

        normalizeNullableString,

        normalizeReleasePolicy,

        normalizeNullablePositiveInteger,

        normalizeNullableIsoDateTime,

        isValidOptionalDateTime,

        isValidAvailabilityWindow,

        normalizeResourceCategory,

        inferContentType,

        inferResourceType,

        inferResourceCategory,

        inferPersonalisationType,

        inferStorageDomain,

        buildDocumentId,

        isValidDocumentId,

        isValidDeliveryId,

        isValidCredentialId,

        isValidSha256,

        normalizeFileName,

        normalizeFileNamePart,

        getFileExtension,

        isValidFileName,

        buildSourceFileName,

        buildSharedFileName,

        buildPersonalizedFileName,

        normalizeStoragePath,

        buildStoragePath,

        buildSharedStoragePath,

        buildMasterStoragePath,

        buildLearnerStoragePath,

        isValidSharedStoragePath,

        isValidMasterStoragePath,

        isValidLearnerStoragePath,

        isValidProtectedStoragePath,

        storagePathMatchesResource,

        parseHttpsUrl,

        isValidHttpsUrl,

        normalizeExternalVideo,

        isApprovedExternalVideoUrl,

        isApprovedMimeType,

        isValidFileSize,

        getApprovedExtensionsForMimeType,

        mimeTypeMatchesFileName,

        resourceTypeMatchesDeliveryType,

        contentTypeMatchesDeliveryType,

        storageDomainMatchesResource,

        validateReleaseGovernance,

        validateRawReleaseGovernanceInput,

        validatePermissionCombination,

        normalizeResourceInput,

        buildValidationResult,

        validateCommonResourceFields,

        validateDraft,

        validateForPublication,

        buildPublicationPayload

    });

    /* ==========================================================
   GLOBAL REGISTRATION
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.LearningResourceContract =
        LearningResourceContract;

}


/* ==========================================================
   MODULE DIAGNOSTICS
========================================================== */

console.info(
    `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
);


/* ==========================================================
   MODULE EXPORTS
========================================================== */

export {

    LearningResourceContract,

    RESOURCE_TYPES,

    CONTENT_TYPES,

    RESOURCE_CATEGORIES,

    DELIVERY_TYPES,

    PERSONALISATION_TYPES,

    STORAGE_DOMAINS,

    RESOURCE_STATUSES,

    RELEASE_POLICIES,

    MODULE_RELEASE_POLICIES,

    SESSION_RELEASE_POLICIES,

    LIFECYCLE_RELEASE_POLICIES,

    APPROVED_MIME_TYPES,

    APPROVED_EXTERNAL_VIDEO_PROVIDERS,

    APPROVED_EXTERNAL_VIDEO_HOSTS,

    MAX_FILE_SIZE_BYTES,

    MAX_DISPLAY_ORDER,

    MAX_TITLE_LENGTH,

    MAX_DESCRIPTION_LENGTH,

    PROTECTED_STORAGE_ROOT,

    SHARED_STORAGE_ROOT,

    LEARNER_STORAGE_ROOT,

    MASTER_STORAGE_ROOT,

    normalizeString,

    normalizeLowercase,

    normalizeProgramCode,

    normalizeResourceId,

    normalizeVersion,

    normalizeDisplayOrder,

    normalizeBoolean,

    normalizeFileSize,

    normalizeNullableString,

    normalizeReleasePolicy,

    normalizeNullablePositiveInteger,

    normalizeNullableIsoDateTime,

    isValidOptionalDateTime,

    isValidAvailabilityWindow,

    normalizeResourceCategory,

    inferContentType,

    inferResourceType,

    inferResourceCategory,

    inferPersonalisationType,

    inferStorageDomain,

    buildDocumentId,

    isValidDocumentId,

    isValidDeliveryId,

    isValidCredentialId,

    isValidSha256,

    normalizeFileName,

    normalizeFileNamePart,

    getFileExtension,

    isValidFileName,

    buildSourceFileName,

    buildSharedFileName,

    buildPersonalizedFileName,

    normalizeStoragePath,

    buildStoragePath,

    buildSharedStoragePath,

    buildMasterStoragePath,

    buildLearnerStoragePath,

    isValidSharedStoragePath,

    isValidMasterStoragePath,

    isValidLearnerStoragePath,

    isValidProtectedStoragePath,

    storagePathMatchesResource,

    parseHttpsUrl,

    isValidHttpsUrl,

    normalizeExternalVideo,

    isApprovedExternalVideoUrl,

    isApprovedMimeType,

    isValidFileSize,

    getApprovedExtensionsForMimeType,

    mimeTypeMatchesFileName,

    resourceTypeMatchesDeliveryType,

    contentTypeMatchesDeliveryType,

    storageDomainMatchesResource,

    validateReleaseGovernance,

    validateRawReleaseGovernanceInput,

    validatePermissionCombination,

    normalizeResourceInput,

    buildValidationResult,

    validateCommonResourceFields,

    validateDraft,

    validateForPublication,

    buildPublicationPayload

};