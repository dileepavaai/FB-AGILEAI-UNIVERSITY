/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-service.js
   Version   : 1.4.0
   Status    : ACTIVE
   Authority : Admin Portal

   Purpose
   ----------------------------------------------------------
   Provides read-only administrative access to governed
   learning-resource metadata stored in Firestore.

   Responsibilities
   ----------------------------------------------------------
   • Require an authorized administrator
   • Retrieve resources by canonical Firestore document ID
   • List governed learning resources
   • Filter and search administrative resource metadata
   • Resolve resource-version history
   • Resolve the latest published version
   • Produce administrative summary information
   • Normalize Firestore records into immutable ViewModels
   • Delegate resource governance to LearningResourceContract
   • Validate lifecycle and audit consistency
   • Preserve ADR-020 release-governance metadata
   • Exclude malformed records safely
   • Detect inconsistent latest-version states
   • Deduplicate simultaneous registry reads

   Non-Responsibilities
   ----------------------------------------------------------
   • Create or update resource records
   • Upload protected files
   • Publish, withdraw or archive resources
   • Delete resource records
   • Generate learner download URLs
   • Resolve learner identity or entitlement
   • Evaluate learner-specific release eligibility
   • Render HTML

   Governance
   ----------------------------------------------------------
   • This is an Admin read service
   • LearningResourceContract is the validation authority
   • Publisher owns lifecycle mutations
   • Storage service owns protected uploads
   • Student delivery requires an authorized delivery service
   • ADR-020 governs resource release metadata
   • Malformed records fail closed
   • Protected download URLs are never exposed here
   • Firestore document identity is canonical
   • Published lifecycle inconsistencies are rejected
   • Only one active latest published version is valid
   • Existing public API remains backward compatible

   Change History
   ----------------------------------------------------------
   v1.4.0
   • Added ADR-020 release-governance field support
   • Added release-policy, module, session and availability data
   • Added uploaded and archived lifecycle support
   • Corrected withdrawn-resource structural validation
   • Completed Firestore registry read APIs
   • Completed search, filtering and version-resolution APIs
   • Added duplicate active-latest detection
   • Restored public service registration and exports
   • Preserved immutable administrative ViewModels
   • Preserved fail-closed malformed-record handling
   • Preserved registry-read deduplication
   • Preserved backward-compatible field aliases

   v1.3.0
   • Established LearningResourceContract as validation authority
   • Removed duplicated storage, MIME and URL governance
   • Added canonical contract-payload adaptation
   • Added field-alias compatibility for existing Firestore records
   • Preserved immutable administrative ViewModels
   • Preserved existing public service API
   • Preserved fail-closed malformed-record handling
   • Preserved registry-read deduplication
   • Preserved lifecycle and audit validation

   v1.2.0
   • Added canonical document identity validation
   • Added strict version validation
   • Added programme-code and resource-ID validation
   • Added lifecycle-state validation
   • Added protected Storage metadata validation
   • Added external delivery validation
   • Added duplicate latest-version detection
   • Added registry diagnostics

   v1.1.0
   • Added immutable ViewModels
   • Added malformed-record exclusion
   • Added registry-read deduplication
   • Added version-history and summary resolution
========================================================== */

import {
    db
} from "../../../../assets/js/core.js";

import {
    collection,
    doc,
    getDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    LearningResourceContract
} from "../config/learning-resource-contract.js";

import {
    requireAuthorizedAdmin
} from "./learning-resource-storage.js";


/* ==========================================================
   MODULE METADATA
========================================================== */

const MODULE_NAME =
    "LearningResourceService";

const MODULE_VERSION =
    "1.4.0";

const COLLECTION_NAME =
    "learning_resources";

const SUPPORTED_LIFECYCLE_STATUSES =
    Object.freeze([
        "draft",
        "uploaded",
        "published",
        "withdrawn",
        "archived"
    ]);

const DEFAULT_RELEASE_POLICY =
    "on_enrollment";


/* ==========================================================
   REGISTRY READ STATE
========================================================== */

/*
 * Simultaneous service calls share one active authoritative
 * Firestore registry read.
 *
 * The promise is cleared immediately after completion so that
 * a later refresh performs a new Firestore read.
 */
let activeRegistryReadPromise =
    null;


/* ==========================================================
   CONTRACT ASSERTION
========================================================== */

function assertContractAvailable() {

    if (
        !LearningResourceContract ||
        typeof LearningResourceContract !==
            "object"
    ) {

        throw new Error(
            `[${MODULE_NAME}] Learning Resource Contract is unavailable.`
        );

    }

    const requiredFunctions = [

        "normalizeString",

        "normalizeProgramCode",

        "normalizeResourceId",

        "normalizeFileName",

        "normalizeResourceInput",

        "normalizeReleasePolicy",

        "normalizeNullablePositiveInteger",

        "normalizeNullableIsoDateTime",

        "buildDocumentId",

        "isValidDocumentId",

        "validateDraft",

        "validateForPublication"

    ];

    const missingFunctions =
        requiredFunctions.filter(
            (
                functionName
            ) => (
                typeof LearningResourceContract[
                    functionName
                ] !==
                    "function"
            )
        );

    if (
        missingFunctions.length >
        0
    ) {

        throw new Error(
            `[${MODULE_NAME}] Learning Resource Contract is incomplete: ${
                missingFunctions.join(
                    ", "
                )
            }.`
        );

    }

    return true;

}


/* ==========================================================
   DATABASE ASSERTION
========================================================== */

function assertDatabaseAvailable() {

    if (
        !db
    ) {

        throw new Error(
            `[${MODULE_NAME}] Firestore database is unavailable.`
        );

    }

    return true;

}


/* ==========================================================
   ADMIN AUTHORIZATION ASSERTION
========================================================== */

async function requireAdminAccess() {

    if (
        typeof requireAuthorizedAdmin !==
            "function"
    ) {

        throw new Error(
            `[${MODULE_NAME}] Admin authorization service is unavailable.`
        );

    }

    const adminContext =
        await requireAuthorizedAdmin();

    if (
        !adminContext
    ) {

        throw new Error(
            `[${MODULE_NAME}] Authorized administrator context was not returned.`
        );

    }

    return adminContext;

}


/* ==========================================================
   GENERAL NORMALIZATION HELPERS
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

    const normalizedValue =
        normalizeString(
            value
        );

    return (
        normalizedValue ||
        null
    );

}


function normalizeLowercase(
    value
) {

    return normalizeString(
        value
    ).toLowerCase();

}


function normalizeBoolean(
    value
) {

    return value ===
        true;

}


function normalizeNonNegativeInteger(
    value,
    fallback = 0
) {

    const normalizedValue =
        Number(
            value
        );

    if (
        !Number.isInteger(
            normalizedValue
        ) ||
        normalizedValue < 0
    ) {

        return fallback;

    }

    return normalizedValue;

}


function normalizeStrictPositiveInteger(
    value
) {

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


function normalizeNullablePositiveInteger(
    value
) {

    return LearningResourceContract
        .normalizeNullablePositiveInteger(
            value
        );

}


function normalizeReleasePolicy(
    value
) {

    return LearningResourceContract
        .normalizeReleasePolicy(
            value
        );

}


function normalizeNullableIsoDateTime(
    value
) {

    return LearningResourceContract
        .normalizeNullableIsoDateTime(
            value
        );

}


function normalizeSearchTerm(
    value
) {

    return normalizeLowercase(
        value
    );

}


function normalizeLifecycleStatus(
    value
) {

    const normalizedStatus =
        normalizeLowercase(
            value
        );

    return SUPPORTED_LIFECYCLE_STATUSES.includes(
        normalizedStatus
    )
        ? normalizedStatus
        : "";

}


/* ==========================================================
   FIELD COMPATIBILITY HELPERS
========================================================== */

/*
 * Existing Firestore records may contain historical aliases.
 *
 * This helper preserves read compatibility without allowing
 * aliases to become separate governance authorities.
 */
function firstDefined(
    ...values
) {

    for (
        const value of
        values
    ) {

        if (
            value !==
                undefined &&
            value !==
                null
        ) {

            return value;

        }

    }

    return undefined;

}


function readFileSize(
    data = {}
) {

    return normalizeNonNegativeInteger(
        firstDefined(
            data.file_size_bytes,
            data.file_size,
            data.fileSizeBytes,
            data.fileSize
        ),
        0
    );

}


function readCategory(
    data = {}
) {

    return normalizeLowercase(
        firstDefined(
            data.resource_category,
            data.resourceCategory,
            data.category
        )
    );

}


function readResourceType(
    data = {}
) {

    return normalizeLowercase(
        firstDefined(
            data.resource_type,
            data.resourceType,
            data.content_type,
            data.contentType
        )
    );

}


function readContentType(
    data = {}
) {

    return normalizeLowercase(
        firstDefined(
            data.content_type,
            data.contentType,
            data.resource_type,
            data.resourceType
        )
    );

}


function readDeliveryType(
    data = {}
) {

    return normalizeLowercase(
        firstDefined(
            data.delivery_type,
            data.deliveryType
        )
    );

}


function readPersonalisationType(
    data = {}
) {

    return normalizeLowercase(
        firstDefined(
            data.personalisation_type,
            data.personalization_type,
            data.personalisationType,
            data.personalizationType
        )
    );

}


function readStorageDomain(
    data = {}
) {

    return normalizeLowercase(
        firstDefined(
            data.storage_domain,
            data.storageDomain
        )
    );

}


function readReleasePolicy(
    data = {}
) {

    return normalizeReleasePolicy(
        firstDefined(
            data.release_policy,
            data.releasePolicy,
            DEFAULT_RELEASE_POLICY
        )
    );

}


function readModuleNumber(
    data = {}
) {

    return normalizeNullablePositiveInteger(
        firstDefined(
            data.module_number,
            data.moduleNumber
        )
    );

}


function readSessionNumber(
    data = {}
) {

    return normalizeNullablePositiveInteger(
        firstDefined(
            data.session_number,
            data.sessionNumber
        )
    );

}


function readAvailableFrom(
    data = {}
) {

    return normalizeNullableIsoDateTime(
        firstDefined(
            data.available_from,
            data.availableFrom
        )
    );

}


function readAvailableUntil(
    data = {}
) {

    return normalizeNullableIsoDateTime(
        firstDefined(
            data.available_until,
            data.availableUntil
        )
    );

}

/* ==========================================================
   TIMESTAMP NORMALIZATION
========================================================== */

function toIsoString(
    value
) {

    if (
        value ===
            undefined ||
        value ===
            null ||
        value ===
            ""
    ) {

        return null;

    }

    try {

        if (
            typeof value.toDate ===
            "function"
        ) {

            const timestampDate =
                value.toDate();

            if (
                !(timestampDate instanceof Date) ||
                Number.isNaN(
                    timestampDate.getTime()
                )
            ) {

                return null;

            }

            return timestampDate.toISOString();

        }

        if (
            value instanceof Date
        ) {

            if (
                Number.isNaN(
                    value.getTime()
                )
            ) {

                return null;

            }

            return value.toISOString();

        }

        const parsedDate =
            new Date(
                value
            );

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return null;

        }

        return parsedDate.toISOString();

    }
    catch (
        error
    ) {

        console.warn(
            `[${MODULE_NAME}] Timestamp normalization failed:`,
            error
        );

        return null;

    }

}


/* ==========================================================
   IMMUTABILITY HELPERS
========================================================== */

function freezeArray(
    values = []
) {

    if (
        !Array.isArray(
            values
        )
    ) {

        return Object.freeze(
            []
        );

    }

    return Object.freeze([
        ...values
    ]);

}


function freezeObject(
    value = {}
) {

    if (
        !value ||
        typeof value !==
            "object" ||
        Array.isArray(
            value
        )
    ) {

        return Object.freeze(
            {}
        );

    }

    return Object.freeze({
        ...value
    });

}


/* ==========================================================
   DIAGNOSTIC HELPERS
========================================================== */

function createDiagnosticIdentity(
    values = {}
) {

    return freezeObject({

        documentId:
            normalizeNullableString(
                values.documentId
            ),

        resourceId:
            normalizeNullableString(
                values.resourceId
            ),

        programCode:
            normalizeNullableString(
                values.programCode
            ),

        status:
            normalizeNullableString(
                values.status
            ),

        deliveryType:
            normalizeNullableString(
                values.deliveryType
            ),

        releasePolicy:
            normalizeNullableString(
                values.releasePolicy
            ),

        version:
            normalizeStrictPositiveInteger(
                values.version
            )

    });

}


function logMalformedRecord(
    identity,
    reasons = []
) {

    console.warn(
        `[${MODULE_NAME}] Malformed record excluded:`,
        {
            moduleVersion:
                MODULE_VERSION,

            identity:
                createDiagnosticIdentity(
                    identity
                ),

            reasons:
                Array.isArray(
                    reasons
                )
                    ? [
                        ...new Set(
                            reasons.filter(
                                Boolean
                            )
                        )
                    ]
                    : []
        }
    );

}


function logRegistryWarning(
    message,
    details = {}
) {

    console.warn(
        `[${MODULE_NAME}] ${message}`,
        {
            moduleVersion:
                MODULE_VERSION,

            ...details
        }
    );

}


/* ==========================================================
   VALIDATION RESULT HELPERS
========================================================== */

function buildLocalValidationResult(
    valid,
    errors = []
) {

    const normalizedErrors =
        Array.isArray(
            errors
        )
            ? errors.filter(
                Boolean
            )
            : [];

    return Object.freeze({

        valid:
            valid ===
                true &&
            normalizedErrors.length ===
                0,

        errors:
            freezeArray(
                normalizedErrors
            )

    });

}


function isSuccessfulValidation(
    result
) {

    return (
        Boolean(
            result
        ) &&
        result.valid ===
            true &&
        Array.isArray(
            result.errors
        ) &&
        result.errors.length ===
            0
    );

}


function getValidationErrors(
    result
) {

    if (
        !result ||
        !Array.isArray(
            result.errors
        )
    ) {

        return [
            "Resource validation did not return a valid result."
        ];

    }

    return [
        ...result.errors
    ];

}


/* ==========================================================
   CONTRACT PAYLOAD ADAPTATION
========================================================== */

/*
 * Firestore persists governed metadata primarily in snake_case.
 *
 * LearningResourceContract remains the only resource-governance
 * authority. This adapter translates historical and current
 * Firestore aliases into the input shape understood by the
 * contract.
 *
 * ADR-020 release metadata is passed explicitly. It must never
 * be omitted and silently replaced by a service-owned rule.
 */
function buildContractInput(
    data = {},
    documentId = ""
) {

    const resourceId =
        firstDefined(
            data.resource_id,
            data.resourceId
        );

    const programCode =
        firstDefined(
            data.program_code,
            data.programCode
        );

    const version =
        firstDefined(
            data.version,
            1
        );

    const displayOrder =
        firstDefined(
            data.display_order,
            data.displayOrder
        );

    const deliveryType =
        firstDefined(
            data.delivery_type,
            data.deliveryType
        );

    const contentType =
        firstDefined(
            data.content_type,
            data.contentType,
            data.resource_type,
            data.resourceType
        );

    const resourceType =
        firstDefined(
            data.resource_type,
            data.resourceType,
            data.content_type,
            data.contentType
        );

    const resourceCategory =
        firstDefined(
            data.resource_category,
            data.resourceCategory,
            data.category
        );

    const personalisationType =
        firstDefined(
            data.personalisation_type,
            data.personalization_type,
            data.personalisationType,
            data.personalizationType
        );

    const storageDomain =
        firstDefined(
            data.storage_domain,
            data.storageDomain
        );

    const storagePath =
        firstDefined(
            data.storage_path,
            data.storagePath
        );

    const masterStoragePath =
        firstDefined(
            data.master_storage_path,
            data.masterStoragePath
        );

    const learnerStoragePath =
        firstDefined(
            data.learner_storage_path,
            data.learnerStoragePath
        );

    const fileName =
        firstDefined(
            data.file_name,
            data.fileName
        );

    const fileExtension =
        firstDefined(
            data.file_extension,
            data.fileExtension
        );

    const mimeType =
        firstDefined(
            data.mime_type,
            data.mimeType
        );

    const fileSizeBytes =
        firstDefined(
            data.file_size_bytes,
            data.file_size,
            data.fileSizeBytes,
            data.fileSize
        );

    const checksumSha256 =
        firstDefined(
            data.checksum_sha256,
            data.sha256,
            data.checksumSha256
        );

    const externalUrl =
        firstDefined(
            data.external_url,
            data.externalUrl
        );

    const externalProvider =
        firstDefined(
            data.external_provider,
            data.externalProvider,
            data.video_provider,
            data.videoProvider
        );

    const externalVideoId =
        firstDefined(
            data.external_video_id,
            data.externalVideoId,
            data.video_id,
            data.videoId
        );

    const canonicalUrl =
        firstDefined(
            data.canonical_url,
            data.canonicalUrl
        );

    const embedUrl =
        firstDefined(
            data.embed_url,
            data.embedUrl
        );

    const previewAllowed =
        firstDefined(
            data.preview_allowed,
            data.previewAllowed
        );

    const downloadAllowed =
        firstDefined(
            data.download_allowed,
            data.downloadAllowed
        );

    const embedAllowed =
        firstDefined(
            data.embed_allowed,
            data.embedAllowed
        );

    const releasePolicy =
        firstDefined(
            data.release_policy,
            data.releasePolicy,
            DEFAULT_RELEASE_POLICY
        );

    const moduleNumber =
        firstDefined(
            data.module_number,
            data.moduleNumber
        );

    const sessionNumber =
        firstDefined(
            data.session_number,
            data.sessionNumber
        );

    const availableFrom =
        firstDefined(
            data.available_from,
            data.availableFrom
        );

    const availableUntil =
        firstDefined(
            data.available_until,
            data.availableUntil
        );

    const status =
        firstDefined(
            data.status,
            "draft"
        );

    const isActive =
        firstDefined(
            data.is_active,
            data.isActive,
            false
        );

    const isLatest =
        firstDefined(
            data.is_latest,
            data.isLatest,
            false
        );

    return {

        documentId:
            normalizeString(
                documentId
            ),

        document_id:
            normalizeString(
                documentId
            ),

        resourceId,

        resource_id:
            resourceId,

        programCode,

        program_code:
            programCode,

        title:
            data.title,

        description:
            data.description,

        version,

        displayOrder,

        display_order:
            displayOrder,

        deliveryType,

        delivery_type:
            deliveryType,

        contentType,

        content_type:
            contentType,

        resourceType,

        resource_type:
            resourceType,

        resourceCategory,

        resource_category:
            resourceCategory,

        category:
            resourceCategory,

        personalisationType,

        personalisation_type:
            personalisationType,

        personalizationType:
            personalisationType,

        personalization_type:
            personalisationType,

        storageDomain,

        storage_domain:
            storageDomain,

        storagePath,

        storage_path:
            storagePath,

        masterStoragePath,

        master_storage_path:
            masterStoragePath,

        learnerStoragePath,

        learner_storage_path:
            learnerStoragePath,

        fileName,

        file_name:
            fileName,

        fileExtension,

        file_extension:
            fileExtension,

        mimeType,

        mime_type:
            mimeType,

        fileSizeBytes,

        file_size_bytes:
            fileSizeBytes,

        fileSize:
            fileSizeBytes,

        file_size:
            fileSizeBytes,

        checksumSha256,

        checksum_sha256:
            checksumSha256,

        sha256:
            checksumSha256,

        externalUrl,

        external_url:
            externalUrl,

        externalProvider,

        external_provider:
            externalProvider,

        provider:
            externalProvider,

        externalVideoId,

        external_video_id:
            externalVideoId,

        videoId:
            externalVideoId,

        video_id:
            externalVideoId,

        canonicalUrl,

        canonical_url:
            canonicalUrl,

        embedUrl,

        embed_url:
            embedUrl,

        previewAllowed,

        preview_allowed:
            previewAllowed,

        downloadAllowed,

        download_allowed:
            downloadAllowed,

        embedAllowed,

        embed_allowed:
            embedAllowed,

        releasePolicy,

        release_policy:
            releasePolicy,

        moduleNumber,

        module_number:
            moduleNumber,

        sessionNumber,

        session_number:
            sessionNumber,

        availableFrom,

        available_from:
            availableFrom,

        availableUntil,

        available_until:
            availableUntil,

        status,

        isActive,

        is_active:
            isActive,

        isLatest,

        is_latest:
            isLatest,

        source:
            data.source

    };

}

/* ==========================================================
   CONTRACT NORMALIZATION
========================================================== */

function normalizeThroughContract(
    data,
    documentId
) {

    try {

        const contractInput =
            buildContractInput(
                data,
                documentId
            );

        const normalized =
            LearningResourceContract.normalizeResourceInput(
                contractInput
            );

        if (
            !normalized ||
            typeof normalized !==
                "object"
        ) {

            return null;

        }

        return normalized;

    }
    catch (
        error
    ) {

        console.warn(
            `[${MODULE_NAME}] Contract normalization failed:`,
            {
                moduleVersion:
                    MODULE_VERSION,

                documentId:
                    normalizeNullableString(
                        documentId
                    ),

                error
            }
        );

        return null;

    }

}


/* ==========================================================
   STRUCTURAL VALIDATION PAYLOADS
========================================================== */

/*
 * Uploaded resources contain governed file metadata, but they
 * are not yet published.
 *
 * LearningResourceContract.validateDraft() expects a canonical
 * draft lifecycle. To validate the retained resource structure
 * without misclassifying the actual uploaded record, a temporary
 * draft-compatible payload is created.
 *
 * The original normalized resource is never mutated.
 */
function buildDraftStructurePayload(
    normalizedResource
) {

    if (
        !normalizedResource ||
        typeof normalizedResource !==
            "object"
    ) {

        return null;

    }

    return {

        ...normalizedResource,

        status:
            "draft",

        isActive:
            false,

        is_active:
            false,

        isLatest:
            false,

        is_latest:
            false

    };

}


/*
 * Withdrawn and archived resources retain the governed metadata
 * of their previously published version, but their current
 * lifecycle flags are intentionally no longer publishable.
 *
 * To validate their retained structure without misclassifying
 * them as currently published, a temporary publication-compatible
 * payload is created.
 *
 * The original normalized resource is never mutated.
 */
function buildPublicationStructurePayload(
    normalizedResource
) {

    if (
        !normalizedResource ||
        typeof normalizedResource !==
            "object"
    ) {

        return null;

    }

    return {

        ...normalizedResource,

        status:
            "published",

        isActive:
            true,

        is_active:
            true,

        isLatest:
            false,

        is_latest:
            false

    };

}


/* ==========================================================
   CONTRACT VALIDATION
========================================================== */

function validateContractRecord(
    normalizedResource,
    status
) {

    if (
        !normalizedResource ||
        typeof normalizedResource !==
            "object"
    ) {

        return buildLocalValidationResult(
            false,
            [
                "Contract normalization failed."
            ]
        );

    }

    const normalizedStatus =
        normalizeLifecycleStatus(
            status
        );

    try {

        switch (
            normalizedStatus
        ) {

            case "draft":

                return LearningResourceContract.validateDraft(
                    normalizedResource
                );

            case "uploaded": {

                /*
                * Uploaded records are structurally draft-like.
                *
                * The actual uploaded lifecycle remains unchanged.
                * A temporary draft-compatible payload is used only
                * for contract structural validation.
                */
                const structuralPayload =
                    buildDraftStructurePayload(
                        normalizedResource
                    );

                if (
                    !structuralPayload
                ) {

                    return buildLocalValidationResult(
                        false,
                        [
                            "Unable to build uploaded-resource structural validation payload."
                        ]
                    );

                }

                return LearningResourceContract.validateDraft(
                    structuralPayload
                );

            }

            case "published":

                return LearningResourceContract
                    .validateForPublication(
                        normalizedResource
                    );

            case "withdrawn":

            case "archived": {

                const structuralPayload =
                    buildPublicationStructurePayload(
                        normalizedResource
                    );

                if (
                    !structuralPayload
                ) {

                    return buildLocalValidationResult(
                        false,
                        [
                            "Unable to build structural validation payload."
                        ]
                    );

                }

                return LearningResourceContract
                    .validateForPublication(
                        structuralPayload
                    );

            }

            default:

                return buildLocalValidationResult(
                    false,
                    [
                        "Unsupported resource lifecycle status."
                    ]
                );

        }

    }
    catch (
        error
    ) {

        console.warn(
            `[${MODULE_NAME}] Contract validation failed:`,
            {
                moduleVersion:
                    MODULE_VERSION,

                status:
                    normalizedStatus ||
                    normalizeNullableString(
                        status
                    ),

                error
            }
        );

        return buildLocalValidationResult(
            false,
            [
                error instanceof Error
                    ? error.message
                    : "Contract validation failed."
            ]
        );

    }

}


/* ==========================================================
   CREATION AUDIT VALIDATION
========================================================== */

function hasValidCreationAudit(
    data = {}
) {

    return (
        Boolean(
            normalizeString(
                firstDefined(
                    data.created_by_uid,
                    data.createdByUid
                )
            )
        ) &&
        Boolean(
            normalizeString(
                firstDefined(
                    data.created_by_email,
                    data.createdByEmail
                )
            )
        ) &&
        Boolean(
            toIsoString(
                firstDefined(
                    data.created_at,
                    data.createdAt
                )
            )
        )
    );

}


/* ==========================================================
   UPDATE AUDIT VALIDATION
========================================================== */

function hasValidUpdateAudit(
    data = {}
) {

    const updatedAt =
        firstDefined(
            data.updated_at,
            data.updatedAt
        );

    const updatedByUid =
        firstDefined(
            data.updated_by_uid,
            data.updatedByUid
        );

    const updatedByEmail =
        firstDefined(
            data.updated_by_email,
            data.updatedByEmail
        );

    const hasNoUpdateAudit =
        (
            updatedAt ===
                undefined ||
            updatedAt ===
                null ||
            updatedAt ===
                ""
        ) &&
        !normalizeString(
            updatedByUid
        ) &&
        !normalizeString(
            updatedByEmail
        );

    if (
        hasNoUpdateAudit
    ) {

        return true;

    }

    return (
        Boolean(
            toIsoString(
                updatedAt
            )
        ) &&
        Boolean(
            normalizeString(
                updatedByUid
            )
        ) &&
        Boolean(
            normalizeString(
                updatedByEmail
            )
        )
    );

}


/* ==========================================================
   UPLOAD AUDIT VALIDATION
========================================================== */

function hasValidUploadAudit(
    data = {}
) {

    const uploadedAt =
        firstDefined(
            data.uploaded_at,
            data.uploadedAt
        );

    const uploadedByUid =
        firstDefined(
            data.uploaded_by_uid,
            data.uploadedByUid
        );

    const uploadedByEmail =
        firstDefined(
            data.uploaded_by_email,
            data.uploadedByEmail
        );

    const hasNoUploadAudit =
        (
            uploadedAt ===
                undefined ||
            uploadedAt ===
                null ||
            uploadedAt ===
                ""
        ) &&
        !normalizeString(
            uploadedByUid
        ) &&
        !normalizeString(
            uploadedByEmail
        );

    if (
        hasNoUploadAudit
    ) {

        return true;

    }

    return (
        Boolean(
            toIsoString(
                uploadedAt
            )
        ) &&
        Boolean(
            normalizeString(
                uploadedByUid
            )
        ) &&
        Boolean(
            normalizeString(
                uploadedByEmail
            )
        )
    );

}


/* ==========================================================
   ARCHIVE AUDIT VALIDATION
========================================================== */

function hasValidArchiveAudit(
    data = {}
) {

    return (
        Boolean(
            normalizeString(
                firstDefined(
                    data.archived_by_uid,
                    data.archivedByUid
                )
            )
        ) &&
        Boolean(
            normalizeString(
                firstDefined(
                    data.archived_by_email,
                    data.archivedByEmail
                )
            )
        ) &&
        Boolean(
            toIsoString(
                firstDefined(
                    data.archived_at,
                    data.archivedAt
                )
            )
        ) &&
        Boolean(
            normalizeString(
                firstDefined(
                    data.archive_reason,
                    data.archiveReason
                )
            )
        )
    );

}


/* ==========================================================
   DRAFT LIFECYCLE VALIDATION
========================================================== */

function hasValidDraftLifecycle(
    data = {}
) {

    return (
        normalizeLifecycleStatus(
            data.status
        ) ===
            "draft" &&
        normalizeBoolean(
            firstDefined(
                data.is_active,
                data.isActive
            )
        ) ===
            false &&
        normalizeBoolean(
            firstDefined(
                data.is_latest,
                data.isLatest
            )
        ) ===
            false &&
        !normalizeString(
            firstDefined(
                data.published_by_uid,
                data.publishedByUid
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.published_by_email,
                data.publishedByEmail
            )
        ) &&
        !toIsoString(
            firstDefined(
                data.published_at,
                data.publishedAt
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.withdrawn_by_uid,
                data.withdrawnByUid
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.withdrawn_by_email,
                data.withdrawnByEmail
            )
        ) &&
        !toIsoString(
            firstDefined(
                data.withdrawn_at,
                data.withdrawnAt
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.withdrawal_reason,
                data.withdrawalReason
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.archived_by_uid,
                data.archivedByUid
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.archived_by_email,
                data.archivedByEmail
            )
        ) &&
        !toIsoString(
            firstDefined(
                data.archived_at,
                data.archivedAt
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.archive_reason,
                data.archiveReason
            )
        )
    );

}


/* ==========================================================
   UPLOADED LIFECYCLE VALIDATION
========================================================== */

function hasValidUploadedLifecycle(
    data = {}
) {

    const storagePath =
        normalizeString(
            firstDefined(
                data.storage_path,
                data.storagePath,
                data.master_storage_path,
                data.masterStoragePath
            )
        );

    const fileName =
        normalizeString(
            firstDefined(
                data.file_name,
                data.fileName
            )
        );

    return (
        normalizeLifecycleStatus(
            data.status
        ) ===
            "uploaded" &&
        normalizeBoolean(
            firstDefined(
                data.is_active,
                data.isActive
            )
        ) ===
            false &&
        normalizeBoolean(
            firstDefined(
                data.is_latest,
                data.isLatest
            )
        ) ===
            false &&
        Boolean(
            storagePath
        ) &&
        Boolean(
            fileName
        ) &&
        hasValidUploadAudit(
            data
        ) &&
        !normalizeString(
            firstDefined(
                data.published_by_uid,
                data.publishedByUid
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.published_by_email,
                data.publishedByEmail
            )
        ) &&
        !toIsoString(
            firstDefined(
                data.published_at,
                data.publishedAt
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.withdrawn_by_uid,
                data.withdrawnByUid
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.withdrawn_by_email,
                data.withdrawnByEmail
            )
        ) &&
        !toIsoString(
            firstDefined(
                data.withdrawn_at,
                data.withdrawnAt
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.withdrawal_reason,
                data.withdrawalReason
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.archived_by_uid,
                data.archivedByUid
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.archived_by_email,
                data.archivedByEmail
            )
        ) &&
        !toIsoString(
            firstDefined(
                data.archived_at,
                data.archivedAt
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.archive_reason,
                data.archiveReason
            )
        )
    );

}


/* ==========================================================
   PUBLISHED LIFECYCLE VALIDATION
========================================================== */

function hasValidPublishedLifecycle(
    data = {}
) {

    const isLatest =
        firstDefined(
            data.is_latest,
            data.isLatest
        );

    return (
        normalizeLifecycleStatus(
            data.status
        ) ===
            "published" &&
        normalizeBoolean(
            firstDefined(
                data.is_active,
                data.isActive
            )
        ) ===
            true &&
        typeof isLatest ===
            "boolean" &&
        Boolean(
            normalizeString(
                firstDefined(
                    data.published_by_uid,
                    data.publishedByUid
                )
            )
        ) &&
        Boolean(
            normalizeString(
                firstDefined(
                    data.published_by_email,
                    data.publishedByEmail
                )
            )
        ) &&
        Boolean(
            toIsoString(
                firstDefined(
                    data.published_at,
                    data.publishedAt
                )
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.withdrawn_by_uid,
                data.withdrawnByUid
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.withdrawn_by_email,
                data.withdrawnByEmail
            )
        ) &&
        !toIsoString(
            firstDefined(
                data.withdrawn_at,
                data.withdrawnAt
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.withdrawal_reason,
                data.withdrawalReason
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.archived_by_uid,
                data.archivedByUid
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.archived_by_email,
                data.archivedByEmail
            )
        ) &&
        !toIsoString(
            firstDefined(
                data.archived_at,
                data.archivedAt
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.archive_reason,
                data.archiveReason
            )
        )
    );

}


/* ==========================================================
   WITHDRAWN LIFECYCLE VALIDATION
========================================================== */

function hasValidWithdrawnLifecycle(
    data = {}
) {

    return (
        normalizeLifecycleStatus(
            data.status
        ) ===
            "withdrawn" &&
        normalizeBoolean(
            firstDefined(
                data.is_active,
                data.isActive
            )
        ) ===
            false &&
        normalizeBoolean(
            firstDefined(
                data.is_latest,
                data.isLatest
            )
        ) ===
            false &&
        Boolean(
            normalizeString(
                firstDefined(
                    data.published_by_uid,
                    data.publishedByUid
                )
            )
        ) &&
        Boolean(
            normalizeString(
                firstDefined(
                    data.published_by_email,
                    data.publishedByEmail
                )
            )
        ) &&
        Boolean(
            toIsoString(
                firstDefined(
                    data.published_at,
                    data.publishedAt
                )
            )
        ) &&
        Boolean(
            normalizeString(
                firstDefined(
                    data.withdrawn_by_uid,
                    data.withdrawnByUid
                )
            )
        ) &&
        Boolean(
            normalizeString(
                firstDefined(
                    data.withdrawn_by_email,
                    data.withdrawnByEmail
                )
            )
        ) &&
        Boolean(
            toIsoString(
                firstDefined(
                    data.withdrawn_at,
                    data.withdrawnAt
                )
            )
        ) &&
        Boolean(
            normalizeString(
                firstDefined(
                    data.withdrawal_reason,
                    data.withdrawalReason
                )
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.archived_by_uid,
                data.archivedByUid
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.archived_by_email,
                data.archivedByEmail
            )
        ) &&
        !toIsoString(
            firstDefined(
                data.archived_at,
                data.archivedAt
            )
        ) &&
        !normalizeString(
            firstDefined(
                data.archive_reason,
                data.archiveReason
            )
        )
    );

}


/* ==========================================================
   ARCHIVED LIFECYCLE VALIDATION
========================================================== */

function hasValidArchivedLifecycle(
    data = {}
) {

    return (
        normalizeLifecycleStatus(
            data.status
        ) ===
            "archived" &&
        normalizeBoolean(
            firstDefined(
                data.is_active,
                data.isActive
            )
        ) ===
            false &&
        normalizeBoolean(
            firstDefined(
                data.is_latest,
                data.isLatest
            )
        ) ===
            false &&
        hasValidArchiveAudit(
            data
        )
    );

}

/* ==========================================================
   LIFECYCLE ROUTING
========================================================== */

function hasValidLifecycle(
    data = {}
) {

    const status =
        normalizeLifecycleStatus(
            data.status
        );

    switch (
        status
    ) {

        case "draft":

            return hasValidDraftLifecycle(
                data
            );

        case "uploaded":

            return hasValidUploadedLifecycle(
                data
            );

        case "published":

            return hasValidPublishedLifecycle(
                data
            );

        case "withdrawn":

            return hasValidWithdrawnLifecycle(
                data
            );

        case "archived":

            return hasValidArchivedLifecycle(
                data
            );

        default:

            return false;

    }

}

/* ==========================================================
   RELEASE-GOVERNANCE VALIDATION
========================================================== */

function hasValidReleaseGovernance(
    normalizedResource
) {

    if (
        !normalizedResource ||
        typeof normalizedResource !==
            "object"
    ) {

        return false;

    }

    const releasePolicy =
        normalizeReleasePolicy(
            resolveNormalizedField(
                normalizedResource,
                [
                    "releasePolicy",
                    "release_policy"
                ],
                DEFAULT_RELEASE_POLICY
            )
        );

    const moduleNumber =
        normalizeNullablePositiveInteger(
            resolveNormalizedField(
                normalizedResource,
                [
                    "moduleNumber",
                    "module_number"
                ],
                null
            )
        );

    const sessionNumber =
        normalizeNullablePositiveInteger(
            resolveNormalizedField(
                normalizedResource,
                [
                    "sessionNumber",
                    "session_number"
                ],
                null
            )
        );

    const availableFrom =
        normalizeNullableIsoDateTime(
            resolveNormalizedField(
                normalizedResource,
                [
                    "availableFrom",
                    "available_from"
                ],
                null
            )
        );

    const availableUntil =
        normalizeNullableIsoDateTime(
            resolveNormalizedField(
                normalizedResource,
                [
                    "availableUntil",
                    "available_until"
                ],
                null
            )
        );

    if (
        !releasePolicy
    ) {

        return false;

    }

    if (
        (
            releasePolicy ===
                "pre_module" ||
            releasePolicy ===
                "post_module"
        ) &&
        !moduleNumber
    ) {

        return false;

    }

    if (
        releasePolicy ===
            "post_session" &&
        !sessionNumber
    ) {

        return false;

    }

    if (
        availableFrom &&
        availableUntil
    ) {

        const availableFromTime =
            new Date(
                availableFrom
            ).getTime();

        const availableUntilTime =
            new Date(
                availableUntil
            ).getTime();

        if (
            Number.isNaN(
                availableFromTime
            ) ||
            Number.isNaN(
                availableUntilTime
            ) ||
            availableUntilTime <=
                availableFromTime
        ) {

            return false;

        }

    }

    return true;

}

/* ==========================================================
   CANONICAL IDENTITY VALIDATION
========================================================== */

function hasCanonicalDocumentIdentity(
    documentId,
    resourceId,
    version
) {

    const expectedDocumentId =
        LearningResourceContract.buildDocumentId(
            resourceId,
            version
        );

    return (
        Boolean(
            expectedDocumentId
        ) &&
        documentId ===
            expectedDocumentId
    );

}


/* ==========================================================
   RECORD FIELD RESOLUTION
========================================================== */

function resolveNormalizedField(
    normalizedResource,
    keys,
    fallback = null
) {

    if (
        !normalizedResource ||
        typeof normalizedResource !==
            "object"
    ) {

        return fallback;

    }

    for (
        const key of
        keys
    ) {

        if (
            normalizedResource[
                key
            ] !==
                undefined &&
            normalizedResource[
                key
            ] !==
                null
        ) {

            return normalizedResource[
                key
            ];

        }

    }

    return fallback;

}

/* ==========================================================
   RECORD NORMALIZATION
========================================================== */

function normalizeRecord(
    snapshot
) {

    if (
        !snapshot ||
        typeof snapshot.exists !==
            "function" ||
        !snapshot.exists()
    ) {

        return null;

    }

    const data =
        snapshot.data() ||
        {};

    const documentId =
        normalizeString(
            snapshot.id
        );

    const normalizedResource =
        normalizeThroughContract(
            data,
            documentId
        );

    const rawResourceId =
        normalizeString(
            firstDefined(
                data.resource_id,
                data.resourceId
            )
        );

    const rawProgramCode =
        normalizeString(
            firstDefined(
                data.program_code,
                data.programCode
            )
        );

    const resourceId =
        LearningResourceContract.normalizeResourceId(
            resolveNormalizedField(
                normalizedResource,
                [
                    "resourceId",
                    "resource_id"
                ],
                rawResourceId
            )
        );

    const programCode =
        LearningResourceContract.normalizeProgramCode(
            resolveNormalizedField(
                normalizedResource,
                [
                    "programCode",
                    "program_code"
                ],
                rawProgramCode
            )
        );

    const status =
        normalizeLifecycleStatus(
            resolveNormalizedField(
                normalizedResource,
                [
                    "status"
                ],
                data.status
            )
        );

    const version =
        normalizeStrictPositiveInteger(
            resolveNormalizedField(
                normalizedResource,
                [
                    "version"
                ],
                data.version
            )
        );

    const title =
        normalizeString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "title"
                ],
                data.title
            )
        );

    const description =
        normalizeString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "description"
                ],
                data.description
            )
        );

    const resourceType =
        normalizeLowercase(
            resolveNormalizedField(
                normalizedResource,
                [
                    "resourceType",
                    "resource_type"
                ],
                readResourceType(
                    data
                )
            )
        );

    const contentType =
        normalizeLowercase(
            resolveNormalizedField(
                normalizedResource,
                [
                    "contentType",
                    "content_type"
                ],
                readContentType(
                    data
                )
            )
        );

    const category =
        normalizeLowercase(
            resolveNormalizedField(
                normalizedResource,
                [
                    "resourceCategory",
                    "resource_category",
                    "category"
                ],
                readCategory(
                    data
                )
            )
        );

    const deliveryType =
        normalizeLowercase(
            resolveNormalizedField(
                normalizedResource,
                [
                    "deliveryType",
                    "delivery_type"
                ],
                readDeliveryType(
                    data
                )
            )
        );

    const personalisationType =
        normalizeLowercase(
            resolveNormalizedField(
                normalizedResource,
                [
                    "personalisationType",
                    "personalisation_type",
                    "personalizationType",
                    "personalization_type"
                ],
                readPersonalisationType(
                    data
                )
            )
        );

    const storageDomain =
        normalizeLowercase(
            resolveNormalizedField(
                normalizedResource,
                [
                    "storageDomain",
                    "storage_domain"
                ],
                readStorageDomain(
                    data
                )
            )
        );

    const displayOrder =
        normalizeNonNegativeInteger(
            resolveNormalizedField(
                normalizedResource,
                [
                    "displayOrder",
                    "display_order"
                ],
                firstDefined(
                    data.display_order,
                    data.displayOrder
                )
            ),
            0
        );

    const releasePolicy =
        normalizeReleasePolicy(
            resolveNormalizedField(
                normalizedResource,
                [
                    "releasePolicy",
                    "release_policy"
                ],
                readReleasePolicy(
                    data
                )
            )
        );

    const moduleNumber =
        normalizeNullablePositiveInteger(
            resolveNormalizedField(
                normalizedResource,
                [
                    "moduleNumber",
                    "module_number"
                ],
                readModuleNumber(
                    data
                )
            )
        );

    const sessionNumber =
        normalizeNullablePositiveInteger(
            resolveNormalizedField(
                normalizedResource,
                [
                    "sessionNumber",
                    "session_number"
                ],
                readSessionNumber(
                    data
                )
            )
        );

    const availableFrom =
        normalizeNullableIsoDateTime(
            resolveNormalizedField(
                normalizedResource,
                [
                    "availableFrom",
                    "available_from"
                ],
                readAvailableFrom(
                    data
                )
            )
        );

    const availableUntil =
        normalizeNullableIsoDateTime(
            resolveNormalizedField(
                normalizedResource,
                [
                    "availableUntil",
                    "available_until"
                ],
                readAvailableUntil(
                    data
                )
            )
        );

    const validationResult =
        validateContractRecord(
            normalizedResource,
            status
        );

    const validationErrors =
        getValidationErrors(
            validationResult
        );

    const malformedReasons =
        [];

    if (
        !normalizedResource
    ) {

        malformedReasons.push(
            "Contract normalization failed."
        );

    }

    if (
        !LearningResourceContract.isValidDocumentId(
            documentId
        )
    ) {

        malformedReasons.push(
            "Invalid Firestore document ID."
        );

    }

    if (
        !resourceId
    ) {

        malformedReasons.push(
            "Invalid resource ID."
        );

    }

    if (
        rawResourceId &&
        resourceId !==
            rawResourceId
    ) {

        malformedReasons.push(
            "Resource ID is not canonically normalized."
        );

    }

    if (
        !programCode
    ) {

        malformedReasons.push(
            "Invalid programme code."
        );

    }

    if (
        rawProgramCode &&
        programCode !==
            rawProgramCode
    ) {

        malformedReasons.push(
            "Programme code is not canonically normalized."
        );

    }

    if (
        !version
    ) {

        malformedReasons.push(
            "Invalid resource version."
        );

    }

    if (
        resourceId &&
        version &&
        !hasCanonicalDocumentIdentity(
            documentId,
            resourceId,
            version
        )
    ) {

        malformedReasons.push(
            "Firestore document identity is not canonical."
        );

    }

    if (
        !title
    ) {

        malformedReasons.push(
            "Resource title is required."
        );

    }

    if (
        !status
    ) {

        malformedReasons.push(
            "Resource lifecycle status is unsupported."
        );

    }

    if (
        !hasValidCreationAudit(
            data
        )
    ) {

        malformedReasons.push(
            "Creation audit metadata is invalid."
        );

    }

    if (
        !hasValidUpdateAudit(
            data
        )
    ) {

        malformedReasons.push(
            "Update audit metadata is incomplete."
        );

    }

    if (
        !hasValidLifecycle(
            data
        )
    ) {

        malformedReasons.push(
            "Lifecycle metadata is inconsistent."
        );

    }

    if (
        !hasValidReleaseGovernance(
            normalizedResource
        )
    ) {

        malformedReasons.push(
            "ADR-020 release-governance metadata is invalid."
        );

    }

    if (
        normalizeString(
            data.source
        ) !==
            "admin_portal"
    ) {

        malformedReasons.push(
            "Resource source is not admin_portal."
        );

    }

    if (
        !isSuccessfulValidation(
            validationResult
        )
    ) {

        malformedReasons.push(
            ...validationErrors
        );

    }

    if (
        malformedReasons.length >
        0
    ) {

        logMalformedRecord(
            {
                documentId,
                resourceId,
                programCode,
                status,
                deliveryType,
                releasePolicy,
                version
            },
            malformedReasons
        );

        return null;

    }

    const storagePath =
        normalizeNullableString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "storagePath",
                    "storage_path"
                ],
                firstDefined(
                    data.storage_path,
                    data.storagePath
                )
            )
        );

    const masterStoragePath =
        normalizeNullableString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "masterStoragePath",
                    "master_storage_path"
                ],
                firstDefined(
                    data.master_storage_path,
                    data.masterStoragePath
                )
            )
        );

    const learnerStoragePath =
        normalizeNullableString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "learnerStoragePath",
                    "learner_storage_path"
                ],
                firstDefined(
                    data.learner_storage_path,
                    data.learnerStoragePath
                )
            )
        );

    const externalUrl =
        normalizeNullableString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "externalUrl",
                    "external_url"
                ],
                firstDefined(
                    data.external_url,
                    data.externalUrl
                )
            )
        );

    const canonicalUrl =
        normalizeNullableString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "canonicalUrl",
                    "canonical_url"
                ],
                firstDefined(
                    data.canonical_url,
                    data.canonicalUrl
                )
            )
        );

    const embedUrl =
        normalizeNullableString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "embedUrl",
                    "embed_url"
                ],
                firstDefined(
                    data.embed_url,
                    data.embedUrl
                )
            )
        );

    const externalProvider =
        normalizeNullableString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "externalProvider",
                    "external_provider",
                    "provider"
                ],
                firstDefined(
                    data.external_provider,
                    data.externalProvider,
                    data.video_provider,
                    data.videoProvider
                )
            )
        );

    const externalVideoId =
        normalizeNullableString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "externalVideoId",
                    "external_video_id",
                    "videoId",
                    "video_id"
                ],
                firstDefined(
                    data.external_video_id,
                    data.externalVideoId,
                    data.video_id,
                    data.videoId
                )
            )
        );

    const fileName =
        normalizeNullableString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "fileName",
                    "file_name"
                ],
                firstDefined(
                    data.file_name,
                    data.fileName
                )
            )
        );

    const fileExtension =
        normalizeNullableString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "fileExtension",
                    "file_extension"
                ],
                firstDefined(
                    data.file_extension,
                    data.fileExtension
                )
            )
        );

    const mimeType =
        normalizeNullableString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "mimeType",
                    "mime_type"
                ],
                firstDefined(
                    data.mime_type,
                    data.mimeType
                )
            )
        );

    const checksumSha256 =
        normalizeNullableString(
            resolveNormalizedField(
                normalizedResource,
                [
                    "checksumSha256",
                    "checksum_sha256",
                    "sha256"
                ],
                firstDefined(
                    data.checksum_sha256,
                    data.sha256,
                    data.checksumSha256
                )
            )
        );

    const fileSize =
        normalizeNonNegativeInteger(
            resolveNormalizedField(
                normalizedResource,
                [
                    "fileSizeBytes",
                    "file_size_bytes",
                    "fileSize",
                    "file_size"
                ],
                readFileSize(
                    data
                )
            ),
            0
        );

    const previewAllowed =
        normalizeBoolean(
            resolveNormalizedField(
                normalizedResource,
                [
                    "previewAllowed",
                    "preview_allowed"
                ],
                firstDefined(
                    data.preview_allowed,
                    data.previewAllowed
                )
            )
        );

    const downloadAllowed =
        normalizeBoolean(
            resolveNormalizedField(
                normalizedResource,
                [
                    "downloadAllowed",
                    "download_allowed"
                ],
                firstDefined(
                    data.download_allowed,
                    data.downloadAllowed
                )
            )
        );

    const embedAllowed =
        normalizeBoolean(
            resolveNormalizedField(
                normalizedResource,
                [
                    "embedAllowed",
                    "embed_allowed"
                ],
                firstDefined(
                    data.embed_allowed,
                    data.embedAllowed
                )
            )
        );

    const isActive =
        normalizeBoolean(
            firstDefined(
                data.is_active,
                data.isActive
            )
        );

    const isLatest =
        normalizeBoolean(
            firstDefined(
                data.is_latest,
                data.isLatest
            )
        );

    const viewModel = {

        documentId,

        resourceId,

        programCode,

        title,

        description,

        resourceType,

        contentType,

        category,

        resourceCategory:
            category,

        deliveryType,

        personalisationType,

        storageDomain,

        storagePath,

        masterStoragePath,

        learnerStoragePath,

        externalUrl,

        canonicalUrl,

        embedUrl,

        externalProvider,

        externalVideoId,

        fileName,

        fileExtension,

        mimeType,

        fileSize,

        fileSizeBytes:
            fileSize,

        checksumSha256,

        previewAllowed,

        downloadAllowed,

        embedAllowed,

        releasePolicy,

        moduleNumber,

        sessionNumber,

        availableFrom,

        availableUntil,

        status,

        isActive,

        isLatest,

        version,

        displayOrder,

        createdByUid:
            normalizeNullableString(
                firstDefined(
                    data.created_by_uid,
                    data.createdByUid
                )
            ),

        createdByEmail:
            normalizeNullableString(
                firstDefined(
                    data.created_by_email,
                    data.createdByEmail
                )
            ),

        createdAt:
            toIsoString(
                firstDefined(
                    data.created_at,
                    data.createdAt
                )
            ),

        updatedByUid:
            normalizeNullableString(
                firstDefined(
                    data.updated_by_uid,
                    data.updatedByUid
                )
            ),

        updatedByEmail:
            normalizeNullableString(
                firstDefined(
                    data.updated_by_email,
                    data.updatedByEmail
                )
            ),

        updatedAt:
            toIsoString(
                firstDefined(
                    data.updated_at,
                    data.updatedAt
                )
            ),

        uploadedByUid:
            normalizeNullableString(
                firstDefined(
                    data.uploaded_by_uid,
                    data.uploadedByUid
                )
            ),

        uploadedByEmail:
            normalizeNullableString(
                firstDefined(
                    data.uploaded_by_email,
                    data.uploadedByEmail
                )
            ),

        uploadedAt:
            toIsoString(
                firstDefined(
                    data.uploaded_at,
                    data.uploadedAt
                )
            ),

        publishedByUid:
            normalizeNullableString(
                firstDefined(
                    data.published_by_uid,
                    data.publishedByUid
                )
            ),

        publishedByEmail:
            normalizeNullableString(
                firstDefined(
                    data.published_by_email,
                    data.publishedByEmail
                )
            ),

        publishedAt:
            toIsoString(
                firstDefined(
                    data.published_at,
                    data.publishedAt
                )
            ),

        withdrawnByUid:
            normalizeNullableString(
                firstDefined(
                    data.withdrawn_by_uid,
                    data.withdrawnByUid
                )
            ),

        withdrawnByEmail:
            normalizeNullableString(
                firstDefined(
                    data.withdrawn_by_email,
                    data.withdrawnByEmail
                )
            ),

        withdrawnAt:
            toIsoString(
                firstDefined(
                    data.withdrawn_at,
                    data.withdrawnAt
                )
            ),

        withdrawalReason:
            normalizeNullableString(
                firstDefined(
                    data.withdrawal_reason,
                    data.withdrawalReason
                )
            ),

        archivedByUid:
            normalizeNullableString(
                firstDefined(
                    data.archived_by_uid,
                    data.archivedByUid
                )
            ),

        archivedByEmail:
            normalizeNullableString(
                firstDefined(
                    data.archived_by_email,
                    data.archivedByEmail
                )
            ),

        archivedAt:
            toIsoString(
                firstDefined(
                    data.archived_at,
                    data.archivedAt
                )
            ),

        archiveReason:
            normalizeNullableString(
                firstDefined(
                    data.archive_reason,
                    data.archiveReason
                )
            ),

        source:
            "admin_portal"

    };

    return freezeObject(
        viewModel
    );

}


/* ==========================================================
   RESOURCE SORTING
========================================================== */

function compareResources(
    left,
    right
) {

    const leftProgramCode =
        normalizeString(
            left?.programCode
        );

    const rightProgramCode =
        normalizeString(
            right?.programCode
        );

    const programComparison =
        leftProgramCode.localeCompare(
            rightProgramCode
        );

    if (
        programComparison !==
        0
    ) {

        return programComparison;

    }

    const leftDisplayOrder =
        normalizeNonNegativeInteger(
            left?.displayOrder,
            0
        );

    const rightDisplayOrder =
        normalizeNonNegativeInteger(
            right?.displayOrder,
            0
        );

    if (
        leftDisplayOrder !==
        rightDisplayOrder
    ) {

        return leftDisplayOrder -
            rightDisplayOrder;

    }

    const leftTitle =
        normalizeString(
            left?.title
        );

    const rightTitle =
        normalizeString(
            right?.title
        );

    const titleComparison =
        leftTitle.localeCompare(
            rightTitle
        );

    if (
        titleComparison !==
        0
    ) {

        return titleComparison;

    }

    const leftResourceId =
        normalizeString(
            left?.resourceId
        );

    const rightResourceId =
        normalizeString(
            right?.resourceId
        );

    const resourceComparison =
        leftResourceId.localeCompare(
            rightResourceId
        );

    if (
        resourceComparison !==
        0
    ) {

        return resourceComparison;

    }

    return (
        normalizeStrictPositiveInteger(
            right?.version
        ) ||
        0
    ) -
    (
        normalizeStrictPositiveInteger(
            left?.version
        ) ||
        0
    );

}


/* ==========================================================
   VERSION SORTING
========================================================== */

function compareVersionsDescending(
    left,
    right
) {

    const leftVersion =
        normalizeStrictPositiveInteger(
            left?.version
        ) ||
        0;

    const rightVersion =
        normalizeStrictPositiveInteger(
            right?.version
        ) ||
        0;

    if (
        leftVersion !==
        rightVersion
    ) {

        return rightVersion -
            leftVersion;

    }

    return normalizeString(
        left?.documentId
    ).localeCompare(
        normalizeString(
            right?.documentId
        )
    );

}

/* ==========================================================
   REGISTRY SNAPSHOT NORMALIZATION
========================================================== */

function normalizeRegistrySnapshot(
    querySnapshot
) {

    if (
        !querySnapshot ||
        !Array.isArray(
            querySnapshot.docs
        )
    ) {

        return freezeArray();

    }

    const normalizedResources =
        [];

    for (
        const snapshot of
        querySnapshot.docs
    ) {

        const normalizedRecord =
            normalizeRecord(
                snapshot
            );

        if (
            normalizedRecord
        ) {

            normalizedResources.push(
                normalizedRecord
            );

        }

    }

    normalizedResources.sort(
        compareResources
    );

    return freezeArray(
        normalizedResources
    );

}


/* ==========================================================
   DUPLICATE ACTIVE-LATEST DETECTION
========================================================== */

function detectDuplicateLatestResources(
    resources = []
) {

    const latestGroups =
        new Map();

    for (
        const resource of
        resources
    ) {

        if (
            !resource ||
            resource.status !==
                "published" ||
            resource.isActive !==
                true ||
            resource.isLatest !==
                true
        ) {

            continue;

        }

        const key =
            [
                resource.programCode,
                resource.resourceId
            ].join(
                "::"
            );

        if (
            !latestGroups.has(
                key
            )
        ) {

            latestGroups.set(
                key,
                []
            );

        }

        latestGroups.get(
            key
        ).push(
            resource
        );

    }

    const duplicateGroups =
        [];

    for (
        const [
            key,
            groupedResources
        ] of
        latestGroups.entries()
    ) {

        if (
            groupedResources.length <=
            1
        ) {

            continue;

        }

        const sortedGroup =
            [
                ...groupedResources
            ].sort(
                compareVersionsDescending
            );

        duplicateGroups.push(
            freezeObject({

                key,

                programCode:
                    sortedGroup[
                        0
                    ]?.programCode ||
                    null,

                resourceId:
                    sortedGroup[
                        0
                    ]?.resourceId ||
                    null,

                count:
                    sortedGroup.length,

                documentIds:
                    freezeArray(
                        sortedGroup.map(
                            (
                                resource
                            ) => resource.documentId
                        )
                    ),

                versions:
                    freezeArray(
                        sortedGroup.map(
                            (
                                resource
                            ) => resource.version
                        )
                    )

            })
        );

    }

    return freezeArray(
        duplicateGroups
    );

}


/* ==========================================================
   REGISTRY CONSISTENCY VALIDATION
========================================================== */

function validateRegistryConsistency(
    resources = []
) {

    const duplicateLatestGroups =
        detectDuplicateLatestResources(
            resources
        );

    if (
        duplicateLatestGroups.length >
        0
    ) {

        logRegistryWarning(
            "Duplicate active latest-published resources detected.",
            {
                duplicateGroups:
                    duplicateLatestGroups
            }
        );

    }

    return freezeObject({

        valid:
            duplicateLatestGroups.length ===
            0,

        duplicateLatestGroups,

        duplicateLatestCount:
            duplicateLatestGroups.length

    });

}


/* ==========================================================
   AUTHORITATIVE REGISTRY READ
========================================================== */

async function performRegistryRead() {

    assertContractAvailable();
    assertDatabaseAvailable();

    await requireAdminAccess();

    const resourcesCollection =
        collection(
            db,
            COLLECTION_NAME
        );

    const querySnapshot =
        await getDocs(
            resourcesCollection
        );

    const resources =
        normalizeRegistrySnapshot(
            querySnapshot
        );

    validateRegistryConsistency(
        resources
    );

    return resources;

}


/* ==========================================================
   DEDUPLICATED REGISTRY READ
========================================================== */

async function readRegistry() {

    if (
        activeRegistryReadPromise
    ) {

        return activeRegistryReadPromise;

    }

    activeRegistryReadPromise =
        performRegistryRead();

    try {

        return await activeRegistryReadPromise;

    }
    finally {

        activeRegistryReadPromise =
            null;

    }

}


/* ==========================================================
   DIRECT DOCUMENT READ
========================================================== */

async function readDocumentById(
    documentId
) {

    assertContractAvailable();
    assertDatabaseAvailable();

    await requireAdminAccess();

    const normalizedDocumentId =
        normalizeString(
            documentId
        );

    if (
        !normalizedDocumentId
    ) {

        throw new Error(
            `[${MODULE_NAME}] Firestore document ID is required.`
        );

    }

    if (
        !LearningResourceContract.isValidDocumentId(
            normalizedDocumentId
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Invalid Firestore document ID.`
        );

    }

    const documentReference =
        doc(
            db,
            COLLECTION_NAME,
            normalizedDocumentId
        );

    const documentSnapshot =
        await getDoc(
            documentReference
        );

    if (
        !documentSnapshot.exists()
    ) {

        return null;

    }

    return normalizeRecord(
        documentSnapshot
    );

}


/* ==========================================================
   FILTER NORMALIZATION
========================================================== */

function normalizeFilterOptions(
    options = {}
) {

    const status =
        normalizeLifecycleStatus(
            options.status
        );

    const programCode =
        options.programCode
            ? LearningResourceContract
                .normalizeProgramCode(
                    options.programCode
                )
            : "";

    const resourceId =
        options.resourceId
            ? LearningResourceContract
                .normalizeResourceId(
                    options.resourceId
                )
            : "";

    const category =
        normalizeLowercase(
            firstDefined(
                options.category,
                options.resourceCategory
            )
        );

    const resourceType =
        normalizeLowercase(
            options.resourceType
        );

    const contentType =
        normalizeLowercase(
            options.contentType
        );

    const deliveryType =
        normalizeLowercase(
            options.deliveryType
        );

    const personalisationType =
        normalizeLowercase(
            firstDefined(
                options.personalisationType,
                options.personalizationType
            )
        );

    const storageDomain =
        normalizeLowercase(
            options.storageDomain
        );

    const releasePolicy =
        options.releasePolicy
            ? normalizeReleasePolicy(
                options.releasePolicy
            )
            : "";

    const search =
        normalizeSearchTerm(
            firstDefined(
                options.search,
                options.query,
                options.searchTerm
            )
        );

    const version =
        options.version !==
            undefined &&
        options.version !==
            null &&
        options.version !==
            ""
            ? normalizeStrictPositiveInteger(
                options.version
            )
            : null;

    const isActive =
        typeof options.isActive ===
            "boolean"
            ? options.isActive
            : null;

    const isLatest =
        typeof options.isLatest ===
            "boolean"
            ? options.isLatest
            : null;

    const previewAllowed =
        typeof options.previewAllowed ===
            "boolean"
            ? options.previewAllowed
            : null;

    const downloadAllowed =
        typeof options.downloadAllowed ===
            "boolean"
            ? options.downloadAllowed
            : null;

    const embedAllowed =
        typeof options.embedAllowed ===
            "boolean"
            ? options.embedAllowed
            : null;

    return freezeObject({

        status,

        programCode,

        resourceId,

        category,

        resourceType,

        contentType,

        deliveryType,

        personalisationType,

        storageDomain,

        releasePolicy,

        search,

        version,

        isActive,

        isLatest,

        previewAllowed,

        downloadAllowed,

        embedAllowed

    });

}


/* ==========================================================
   SEARCH MATCHING
========================================================== */

function matchesSearch(
    resource,
    searchTerm
) {

    if (
        !searchTerm
    ) {

        return true;

    }

    const searchableValues =
        [

            resource.documentId,

            resource.resourceId,

            resource.programCode,

            resource.title,

            resource.description,

            resource.resourceType,

            resource.contentType,

            resource.category,

            resource.deliveryType,

            resource.personalisationType,

            resource.storageDomain,

            resource.releasePolicy,

            resource.fileName,

            resource.fileExtension,

            resource.mimeType,

            resource.externalProvider,

            resource.externalVideoId,

            resource.status

        ];

    return searchableValues.some(
        (
            value
        ) => normalizeSearchTerm(
            value
        ).includes(
            searchTerm
        )
    );

}


/* ==========================================================
   RESOURCE FILTERING
========================================================== */

function filterResources(
    resources = [],
    options = {}
) {

    const filters =
        normalizeFilterOptions(
            options
        );

    const filteredResources =
        resources.filter(
            (
                resource
            ) => {

                if (
                    filters.status &&
                    resource.status !==
                        filters.status
                ) {

                    return false;

                }

                if (
                    filters.programCode &&
                    resource.programCode !==
                        filters.programCode
                ) {

                    return false;

                }

                if (
                    filters.resourceId &&
                    resource.resourceId !==
                        filters.resourceId
                ) {

                    return false;

                }

                if (
                    filters.category &&
                    resource.category !==
                        filters.category
                ) {

                    return false;

                }

                if (
                    filters.resourceType &&
                    resource.resourceType !==
                        filters.resourceType
                ) {

                    return false;

                }

                if (
                    filters.contentType &&
                    resource.contentType !==
                        filters.contentType
                ) {

                    return false;

                }

                if (
                    filters.deliveryType &&
                    resource.deliveryType !==
                        filters.deliveryType
                ) {

                    return false;

                }

                if (
                    filters.personalisationType &&
                    resource.personalisationType !==
                        filters.personalisationType
                ) {

                    return false;

                }

                if (
                    filters.storageDomain &&
                    resource.storageDomain !==
                        filters.storageDomain
                ) {

                    return false;

                }

                if (
                    filters.releasePolicy &&
                    resource.releasePolicy !==
                        filters.releasePolicy
                ) {

                    return false;

                }

                if (
                    filters.version !==
                        null &&
                    resource.version !==
                        filters.version
                ) {

                    return false;

                }

                if (
                    filters.isActive !==
                        null &&
                    resource.isActive !==
                        filters.isActive
                ) {

                    return false;

                }

                if (
                    filters.isLatest !==
                        null &&
                    resource.isLatest !==
                        filters.isLatest
                ) {

                    return false;

                }

                if (
                    filters.previewAllowed !==
                        null &&
                    resource.previewAllowed !==
                        filters.previewAllowed
                ) {

                    return false;

                }

                if (
                    filters.downloadAllowed !==
                        null &&
                    resource.downloadAllowed !==
                        filters.downloadAllowed
                ) {

                    return false;

                }

                if (
                    filters.embedAllowed !==
                        null &&
                    resource.embedAllowed !==
                        filters.embedAllowed
                ) {

                    return false;

                }

                return matchesSearch(
                    resource,
                    filters.search
                );

            }
        );

    filteredResources.sort(
        compareResources
    );

    return freezeArray(
        filteredResources
    );

}


/* ==========================================================
   VERSION-HISTORY RESOLUTION
========================================================== */

function resolveVersionHistory(
    resources = [],
    resourceId,
    programCode = ""
) {

    const normalizedResourceId =
        LearningResourceContract
            .normalizeResourceId(
                resourceId
            );

    const normalizedProgramCode =
        programCode
            ? LearningResourceContract
                .normalizeProgramCode(
                    programCode
                )
            : "";

    if (
        !normalizedResourceId
    ) {

        return freezeArray();

    }

    const versions =
        resources.filter(
            (
                resource
            ) => (
                resource.resourceId ===
                    normalizedResourceId &&
                (
                    !normalizedProgramCode ||
                    resource.programCode ===
                        normalizedProgramCode
                )
            )
        );

    versions.sort(
        compareVersionsDescending
    );

    return freezeArray(
        versions
    );

}


/* ==========================================================
   LATEST-PUBLISHED RESOLUTION
========================================================== */

function resolveLatestPublished(
    resources = [],
    resourceId,
    programCode = ""
) {

    const versionHistory =
        resolveVersionHistory(
            resources,
            resourceId,
            programCode
        );

    const activeLatestResources =
        versionHistory.filter(
            (
                resource
            ) => (
                resource.status ===
                    "published" &&
                resource.isActive ===
                    true &&
                resource.isLatest ===
                    true
            )
        );

    if (
        activeLatestResources.length >
        1
    ) {

        logRegistryWarning(
            "Latest published resolution failed because multiple active latest versions exist.",
            {
                resourceId:
                    LearningResourceContract
                        .normalizeResourceId(
                            resourceId
                        ),

                programCode:
                    programCode
                        ? LearningResourceContract
                            .normalizeProgramCode(
                                programCode
                            )
                        : null,

                documentIds:
                    activeLatestResources.map(
                        (
                            resource
                        ) => resource.documentId
                    )
            }
        );

        return null;

    }

    if (
        activeLatestResources.length ===
        1
    ) {

        return activeLatestResources[
            0
        ];

    }

    /*
     * Backward-compatible fallback:
     *
     * Older published records may have is_latest=false even when
     * they are the only active published version. In that case,
     * resolve the highest active published version while warning
     * that registry metadata requires correction.
     */
    const activePublishedResources =
        versionHistory.filter(
            (
                resource
            ) => (
                resource.status ===
                    "published" &&
                resource.isActive ===
                    true
            )
        );

    if (
        activePublishedResources.length ===
        0
    ) {

        return null;

    }

    activePublishedResources.sort(
        compareVersionsDescending
    );

    const fallbackResource =
        activePublishedResources[
            0
        ];

    logRegistryWarning(
        "Published resource resolved through version fallback because no active latest marker exists.",
        {
            resourceId:
                fallbackResource.resourceId,

            programCode:
                fallbackResource.programCode,

            documentId:
                fallbackResource.documentId,

            version:
                fallbackResource.version
        }
    );

    return fallbackResource;

}


/* ==========================================================
   SUMMARY GENERATION
========================================================== */

function buildRegistrySummary(
    resources = []
) {

    const summary = {

        total:
            resources.length,

        draft:
            0,

        uploaded:
            0,

        published:
            0,

        withdrawn:
            0,

        archived:
            0,

        active:
            0,

        latest:
            0,

        protected:
            0,

        external:
            0,

        downloadable:
            0,

        previewable:
            0,

        embeddable:
            0,

        programmes:
            new Set(),

        resourceIds:
            new Set(),

        releasePolicies:
            new Set()

    };

    for (
        const resource of
        resources
    ) {

        if (
            !resource ||
            typeof resource !==
                "object"
        ) {

            continue;

        }

        if (
            Object.prototype.hasOwnProperty.call(
                summary,
                resource.status
            )
        ) {

            summary[
                resource.status
            ] +=
                1;

        }

        if (
            resource.isActive ===
                true
        ) {

            summary.active +=
                1;

        }

        if (
            resource.isLatest ===
                true
        ) {

            summary.latest +=
                1;

        }

        if (
            resource.deliveryType ===
                "protected_storage"
        ) {

            summary.protected +=
                1;

        }

        if (
            resource.deliveryType ===
                "external_video" ||
            resource.deliveryType ===
                "external_link"
        ) {

            summary.external +=
                1;

        }

        if (
            resource.downloadAllowed ===
                true
        ) {

            summary.downloadable +=
                1;

        }

        if (
            resource.previewAllowed ===
                true
        ) {

            summary.previewable +=
                1;

        }

        if (
            resource.embedAllowed ===
                true
        ) {

            summary.embeddable +=
                1;

        }

        if (
            resource.programCode
        ) {

            summary.programmes.add(
                resource.programCode
            );

        }

        if (
            resource.resourceId
        ) {

            summary.resourceIds.add(
                resource.resourceId
            );

        }

        if (
            resource.releasePolicy
        ) {

            summary.releasePolicies.add(
                resource.releasePolicy
            );

        }

    }

    const registryConsistency =
        validateRegistryConsistency(
            resources
        );

    return freezeObject({

        total:
            summary.total,

        draft:
            summary.draft,

        uploaded:
            summary.uploaded,

        published:
            summary.published,

        withdrawn:
            summary.withdrawn,

        archived:
            summary.archived,

        active:
            summary.active,

        latest:
            summary.latest,

        protected:
            summary.protected,

        external:
            summary.external,

        downloadable:
            summary.downloadable,

        previewable:
            summary.previewable,

        embeddable:
            summary.embeddable,

        programmeCount:
            summary.programmes.size,

        resourceCount:
            summary.resourceIds.size,

        releasePolicyCount:
            summary.releasePolicies.size,

        programmes:
            freezeArray(
                [
                    ...summary.programmes
                ].sort()
            ),

        releasePolicies:
            freezeArray(
                [
                    ...summary.releasePolicies
                ].sort()
            ),

        registryValid:
            registryConsistency.valid,

        duplicateLatestCount:
            registryConsistency
                .duplicateLatestCount,

        duplicateLatestGroups:
            registryConsistency
                .duplicateLatestGroups

    });

}

/* ==========================================================
   PUBLIC DOCUMENT LOOKUP
========================================================== */

async function getResourceByDocumentId(
    documentId
) {

    return readDocumentById(
        documentId
    );

}


/* ==========================================================
   PUBLIC REGISTRY LISTING
========================================================== */

async function listResources(
    options = {}
) {

    const resources =
        await readRegistry();

    return filterResources(
        resources,
        options
    );

}


/* ==========================================================
   PUBLIC SEARCH
========================================================== */

async function searchResources(
    searchTerm,
    options = {}
) {

    const normalizedOptions = {

        ...options,

        search:
            searchTerm

    };

    return listResources(
        normalizedOptions
    );

}


/* ==========================================================
   PUBLIC PROGRAMME LISTING
========================================================== */

async function listResourcesByProgram(
    programCode,
    options = {}
) {

    const normalizedProgramCode =
        LearningResourceContract
            .normalizeProgramCode(
                programCode
            );

    if (
        !normalizedProgramCode
    ) {

        return freezeArray();

    }

    return listResources({

        ...options,

        programCode:
            normalizedProgramCode

    });

}


/* ==========================================================
   PUBLIC RESOURCE-ID LISTING
========================================================== */

async function listResourcesByResourceId(
    resourceId,
    options = {}
) {

    const normalizedResourceId =
        LearningResourceContract
            .normalizeResourceId(
                resourceId
            );

    if (
        !normalizedResourceId
    ) {

        return freezeArray();

    }

    return listResources({

        ...options,

        resourceId:
            normalizedResourceId

    });

}


/* ==========================================================
   PUBLIC VERSION-HISTORY LOOKUP
========================================================== */

async function getVersionHistory(
    resourceId,
    programCode = ""
) {

    const resources =
        await readRegistry();

    return resolveVersionHistory(
        resources,
        resourceId,
        programCode
    );

}


/* ==========================================================
   PUBLIC LATEST-PUBLISHED LOOKUP
========================================================== */

async function getLatestPublished(
    resourceId,
    programCode = ""
) {

    const resources =
        await readRegistry();

    return resolveLatestPublished(
        resources,
        resourceId,
        programCode
    );

}


/* ==========================================================
   PUBLIC SUMMARY LOOKUP
========================================================== */

async function getSummary(
    options = {}
) {

    const resources =
        await readRegistry();

    const filteredResources =
        filterResources(
            resources,
            options
        );

    return buildRegistrySummary(
        filteredResources
    );

}


/* ==========================================================
   PUBLIC REGISTRY CONSISTENCY LOOKUP
========================================================== */

async function getRegistryConsistency() {

    const resources =
        await readRegistry();

    return validateRegistryConsistency(
        resources
    );

}


/* ==========================================================
   PUBLIC DUPLICATE-LATEST LOOKUP
========================================================== */

async function getDuplicateLatestResources() {

    const resources =
        await readRegistry();

    return detectDuplicateLatestResources(
        resources
    );

}


/* ==========================================================
   REGISTRY REFRESH
========================================================== */

/*
 * Registry reads are deliberately not permanently cached.
 *
 * This method exists as a compatibility and orchestration
 * surface. It clears any completed local read reference and
 * immediately performs a fresh authoritative Firestore read.
 *
 * An already active registry read is shared rather than
 * cancelled, preventing parallel duplicate Firestore reads.
 */
async function refreshRegistry() {

    if (
        activeRegistryReadPromise
    ) {

        return activeRegistryReadPromise;

    }

    activeRegistryReadPromise =
        null;

    return readRegistry();

}


/* ==========================================================
   SERVICE INITIALIZATION
========================================================== */

async function initialize() {

    assertContractAvailable();
    assertDatabaseAvailable();

    await requireAdminAccess();

    return freezeObject({

        initialized:
            true,

        moduleName:
            MODULE_NAME,

        moduleVersion:
            MODULE_VERSION,

        collectionName:
            COLLECTION_NAME

    });

}


/* ==========================================================
   SERVICE HEALTH
========================================================== */

function getHealth() {

    let contractAvailable =
        false;

    let databaseAvailable =
        false;

    try {

        contractAvailable =
            assertContractAvailable();

    }
    catch (
        error
    ) {

        contractAvailable =
            false;

    }

    try {

        databaseAvailable =
            assertDatabaseAvailable();

    }
    catch (
        error
    ) {

        databaseAvailable =
            false;

    }

    return freezeObject({

        moduleName:
            MODULE_NAME,

        moduleVersion:
            MODULE_VERSION,

        collectionName:
            COLLECTION_NAME,

        status:
            contractAvailable &&
            databaseAvailable
                ? "ready"
                : "unavailable",

        contractAvailable,

        databaseAvailable,

        activeRegistryRead:
            Boolean(
                activeRegistryReadPromise
            ),

        supportedLifecycleStatuses:
            freezeArray(
                SUPPORTED_LIFECYCLE_STATUSES
            ),

        defaultReleasePolicy:
            DEFAULT_RELEASE_POLICY,

        readOnly:
            true,

        adr020Enabled:
            true

    });

}


/* ==========================================================
   SERVICE DIAGNOSTICS
========================================================== */

async function getDiagnostics(
    options = {}
) {

    const resources =
        await readRegistry();

    const filteredResources =
        filterResources(
            resources,
            options
        );

    const consistency =
        validateRegistryConsistency(
            filteredResources
        );

    const summary =
        buildRegistrySummary(
            filteredResources
        );

    return freezeObject({

        moduleName:
            MODULE_NAME,

        moduleVersion:
            MODULE_VERSION,

        collectionName:
            COLLECTION_NAME,

        generatedAt:
            new Date()
                .toISOString(),

        readOnly:
            true,

        adr020Enabled:
            true,

        supportedLifecycleStatuses:
            freezeArray(
                SUPPORTED_LIFECYCLE_STATUSES
            ),

        defaultReleasePolicy:
            DEFAULT_RELEASE_POLICY,

        registryCount:
            filteredResources.length,

        registryValid:
            consistency.valid,

        duplicateLatestCount:
            consistency
                .duplicateLatestCount,

        duplicateLatestGroups:
            consistency
                .duplicateLatestGroups,

        summary

    });

}


/* ==========================================================
   PUBLIC SERVICE
========================================================== */

const LearningResourceService =
    Object.freeze({

        moduleName:
            MODULE_NAME,

        moduleVersion:
            MODULE_VERSION,

        collectionName:
            COLLECTION_NAME,

        readOnly:
            true,

        initialize,

        getHealth,

        getDiagnostics,

        refreshRegistry,

        readRegistry,

        listResources,

        searchResources,

        listResourcesByProgram,

        listResourcesByResourceId,

        getResourceByDocumentId,

        getVersionHistory,

        getLatestPublished,

        getSummary,

        getRegistryConsistency,

        getDuplicateLatestResources,

        /*
         * Backward-compatible aliases.
         *
         * These aliases preserve existing Admin Portal callers
         * while keeping one authoritative implementation.
         */
        list:
            listResources,

        search:
            searchResources,

        getByDocumentId:
            getResourceByDocumentId,

        getResource:
            getResourceByDocumentId,

        getById:
            getResourceByDocumentId,

        getByProgram:
            listResourcesByProgram,

        getByResourceId:
            listResourcesByResourceId,

        getVersions:
            getVersionHistory,

        getLatest:
            getLatestPublished,

        summarize:
            getSummary,

        diagnostics:
            getDiagnostics,

        refresh:
            refreshRegistry

    });


/* ==========================================================
   GLOBAL REGISTRATION
========================================================== */

if (
    typeof window !==
        "undefined"
) {

    window.LearningResourceService =
        LearningResourceService;

}


/* ==========================================================
   MODULE READY SIGNAL
========================================================== */

if (
    typeof window !==
        "undefined" &&
    typeof window.dispatchEvent ===
        "function" &&
    typeof CustomEvent ===
        "function"
) {

    window.dispatchEvent(
        new CustomEvent(
            "learning-resource-service:ready",
            {
                detail:
                    freezeObject({

                        moduleName:
                            MODULE_NAME,

                        moduleVersion:
                            MODULE_VERSION,

                        collectionName:
                            COLLECTION_NAME

                    })
            }
        )
    );

}


/* ==========================================================
   MODULE DIAGNOSTIC
========================================================== */

console.info(
    `[${MODULE_NAME}] Ready.`,
    {
        version:
            MODULE_VERSION,

        collection:
            COLLECTION_NAME,

        readOnly:
            true,

        adr020:
            true
    }
);


/* ==========================================================
   EXPORTS
========================================================== */

export {

    LearningResourceService,

    getResourceByDocumentId,

    listResources,

    searchResources,

    listResourcesByProgram,

    listResourcesByResourceId,

    getVersionHistory,

    getLatestPublished,

    getSummary,

    getRegistryConsistency,

    getDuplicateLatestResources,

    getDiagnostics,

    getHealth,

    refreshRegistry

};

export default LearningResourceService;