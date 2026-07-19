/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-service.js
   Version   : 1.2.0
   Status    : ACTIVE
   Authority : Admin Portal

   Purpose
   ----------------------------------------------------------
   Provides read-only administrative access to governed
   learning-resource metadata stored in Firestore.

   Responsibilities
   ----------------------------------------------------------
   • Require an authorized administrator
   • Retrieve a resource by Firestore document ID
   • List governed learning resources
   • Filter resources by governed metadata
   • Search resource metadata
   • Resolve resource version history
   • Resolve the latest published version
   • Produce administrative summary information
   • Normalize Firestore records into immutable ViewModels
   • Validate canonical document identity
   • Validate resource lifecycle consistency
   • Validate protected asset metadata
   • Validate external delivery metadata
   • Exclude malformed records safely
   • Detect inconsistent latest-version states
   • Deduplicate simultaneous registry reads

   Non-Responsibilities
   ----------------------------------------------------------
   • Create or update records
   • Upload protected files
   • Publish or withdraw resources
   • Delete records
   • Generate learner download URLs
   • Resolve learner entitlement
   • Render HTML

   Governance
   ----------------------------------------------------------
   • This is an Admin read service
   • Publisher owns lifecycle mutations
   • Storage service owns protected uploads
   • Student delivery requires an authorized backend
   • Malformed records fail closed
   • Protected download URLs are never exposed here
   • Firestore document identity is canonical
   • Published lifecycle inconsistencies are rejected
   • Only one active latest published version is valid

   Change History
   ----------------------------------------------------------
   v1.2.0
   • Added canonical document identity validation
   • Added strict version validation
   • Added programme-code and resource-ID validation
   • Added lifecycle-state validation
   • Added protected Storage metadata validation
   • Added external delivery validation
   • Added duplicate latest-version detection
   • Added registry diagnostics
   • Aligned with Learning Resource Contract v1.2.0
   • Preserved existing public API

   v1.1.0
   • Added immutable ViewModels
   • Added malformed-record exclusion
   • Added registry read deduplication
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
    "1.2.0";

const COLLECTION_NAME =
    "learning_resources";


/*
 * Used only to deduplicate simultaneous reads such as:
 *
 * listResources()
 * getSummary()
 *
 * The promise is cleared immediately after completion, ensuring
 * that later refreshes perform a new authoritative Firestore read.
 */
let activeRegistryReadPromise =
    null;


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

    return value === true;

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


function toIsoString(
    value
) {

    if (
        !value
    ) {

        return null;

    }

    try {

        if (
            typeof value.toDate ===
            "function"
        ) {

            return value
                .toDate()
                .toISOString();

        }

        if (
            value instanceof Date
        ) {

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


function freezeArray(
    values
) {

    return Object.freeze([
        ...values
    ]);

}


/* ==========================================================
   IDENTITY VALIDATION
========================================================== */

function hasValidProgramCode(
    programCode
) {

    return (
        typeof programCode ===
            "string" &&
        /^[A-Z0-9][A-Z0-9_-]{1,19}$/.test(
            programCode
        )
    );

}


function hasValidResourceId(
    resourceId
) {

    return (
        typeof resourceId ===
            "string" &&
        /^[a-z0-9][a-z0-9-]{2,79}$/.test(
            resourceId
        )
    );

}


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
   DELIVERY VALIDATION
========================================================== */

function hasValidProtectedDelivery(
    data,
    identity
) {

    const storagePath =
        normalizeString(
            data.storage_path
        );

    const fileName =
        LearningResourceContract.normalizeFileName(
            data.file_name
        );

    const fileExtension =
        normalizeLowercase(
            data.file_extension
        );

    const mimeType =
        normalizeLowercase(
            data.mime_type
        );

    const fileSize =
        normalizeStrictPositiveInteger(
            data.file_size
        );

    /*
     * Draft protected resources may exist before a file is
     * attached. In that state, all protected-asset fields must
     * remain empty together.
     */
    const hasNoAttachedAsset =
        !storagePath &&
        !normalizeString(
            data.file_name
        ) &&
        !fileExtension &&
        !mimeType &&
        (
            data.file_size ===
                null ||
            data.file_size ===
                undefined ||
            Number(
                data.file_size
            ) ===
                0
        );

    if (
        identity.status ===
        "draft" &&
        hasNoAttachedAsset
    ) {

        return true;

    }

    if (
        !storagePath ||
        !fileName ||
        !fileExtension ||
        !mimeType ||
        !fileSize
    ) {

        return false;

    }

    if (
        !LearningResourceContract.isValidProtectedStoragePath(
            storagePath
        )
    ) {

        return false;

    }

    if (
        !LearningResourceContract.isValidFileName(
            fileName
        )
    ) {

        return false;

    }

    if (
        LearningResourceContract.getFileExtension(
            fileName
        ) !==
        fileExtension
    ) {

        return false;

    }

    if (
        !LearningResourceContract.isApprovedMimeType(
            mimeType
        )
    ) {

        return false;

    }

    if (
        !LearningResourceContract.isValidFileSize(
            fileSize
        )
    ) {

        return false;

    }

    if (
        !LearningResourceContract.storagePathMatchesResource(
            storagePath,
            {
                programCode:
                    identity.programCode,

                resourceId:
                    identity.resourceId,

                version:
                    identity.version,

                fileName
            }
        )
    ) {

        return false;

    }

    return (
        !normalizeString(
            data.external_url
        )
    );

}


function hasValidExternalVideoDelivery(
    data
) {

    return (
        LearningResourceContract.isApprovedExternalVideoUrl(
            data.external_url
        ) &&
        !normalizeString(
            data.storage_path
        ) &&
        !normalizeString(
            data.file_name
        ) &&
        !normalizeString(
            data.file_extension
        ) &&
        !normalizeString(
            data.mime_type
        ) &&
        normalizeNonNegativeInteger(
            data.file_size,
            0
        ) ===
            0 &&
        data.download_allowed !==
            true
    );

}


function hasValidExternalLinkDelivery(
    data
) {

    return (
        LearningResourceContract.isValidHttpsUrl(
            data.external_url
        ) &&
        !normalizeString(
            data.storage_path
        ) &&
        !normalizeString(
            data.file_name
        ) &&
        !normalizeString(
            data.file_extension
        ) &&
        !normalizeString(
            data.mime_type
        ) &&
        normalizeNonNegativeInteger(
            data.file_size,
            0
        ) ===
            0
    );

}


function hasValidDeliveryData(
    data,
    identity
) {

    switch (
        identity.deliveryType
    ) {

        case "protected_storage":

            return hasValidProtectedDelivery(
                data,
                identity
            );

        case "external_video":

            return hasValidExternalVideoDelivery(
                data
            );

        case "external_link":

            return hasValidExternalLinkDelivery(
                data
            );

        default:

            return false;

    }

}


/* ==========================================================
   LIFECYCLE VALIDATION
========================================================== */

function hasValidCreationAudit(
    data
) {

    return (
        Boolean(
            normalizeString(
                data.created_by_uid
            )
        ) &&
        Boolean(
            normalizeString(
                data.created_by_email
            )
        ) &&
        Boolean(
            toIsoString(
                data.created_at
            )
        )
    );

}


function hasValidDraftLifecycle(
    data
) {

    return (
        data.status ===
            "draft" &&
        data.is_active ===
            false &&
        data.is_latest ===
            false &&
        !normalizeString(
            data.published_by_uid
        ) &&
        !normalizeString(
            data.published_by_email
        ) &&
        !toIsoString(
            data.published_at
        ) &&
        !normalizeString(
            data.withdrawn_by_uid
        ) &&
        !normalizeString(
            data.withdrawn_by_email
        ) &&
        !toIsoString(
            data.withdrawn_at
        ) &&
        !normalizeString(
            data.withdrawal_reason
        )
    );

}


function hasValidPublishedLifecycle(
    data
) {

    return (
        data.status ===
            "published" &&
        data.is_active ===
            true &&
        typeof data.is_latest ===
            "boolean" &&
        Boolean(
            normalizeString(
                data.published_by_uid
            )
        ) &&
        Boolean(
            normalizeString(
                data.published_by_email
            )
        ) &&
        Boolean(
            toIsoString(
                data.published_at
            )
        ) &&
        !normalizeString(
            data.withdrawn_by_uid
        ) &&
        !normalizeString(
            data.withdrawn_by_email
        ) &&
        !toIsoString(
            data.withdrawn_at
        ) &&
        !normalizeString(
            data.withdrawal_reason
        )
    );

}


function hasValidWithdrawnLifecycle(
    data
) {

    return (
        data.status ===
            "withdrawn" &&
        data.is_active ===
            false &&
        data.is_latest ===
            false &&
        Boolean(
            normalizeString(
                data.published_by_uid
            )
        ) &&
        Boolean(
            normalizeString(
                data.published_by_email
            )
        ) &&
        Boolean(
            toIsoString(
                data.published_at
            )
        ) &&
        Boolean(
            normalizeString(
                data.withdrawn_by_uid
            )
        ) &&
        Boolean(
            normalizeString(
                data.withdrawn_by_email
            )
        ) &&
        Boolean(
            toIsoString(
                data.withdrawn_at
            )
        ) &&
        Boolean(
            normalizeString(
                data.withdrawal_reason
            )
        )
    );

}


function hasValidLifecycle(
    data
) {

    switch (
        data.status
    ) {

        case "draft":

            return hasValidDraftLifecycle(
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

        default:

            return false;

    }

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

    const rawResourceId =
        normalizeString(
            data.resource_id
        );

    const rawProgramCode =
        normalizeString(
            data.program_code
        );

    const resourceId =
        LearningResourceContract.normalizeResourceId(
            rawResourceId
        );

    const programCode =
        LearningResourceContract.normalizeProgramCode(
            rawProgramCode
        );

    const resourceType =
        normalizeLowercase(
            data.resource_type
        );

    const category =
        normalizeLowercase(
            data.category
        );

    const deliveryType =
        normalizeLowercase(
            data.delivery_type
        );

    const status =
        normalizeLowercase(
            data.status
        );

    const version =
        normalizeStrictPositiveInteger(
            data.version
        );

    const title =
        normalizeString(
            data.title
        );

    const displayOrder =
        normalizeNonNegativeInteger(
            data.display_order,
            -1
        );

    const identity = {

        documentId,

        resourceId,

        programCode,

        deliveryType,

        status,

        version

    };

    const malformed =
        !LearningResourceContract.isValidDocumentId(
            documentId
        ) ||
        !hasValidResourceId(
            rawResourceId
        ) ||
        resourceId !==
            rawResourceId ||
        !hasValidProgramCode(
            rawProgramCode
        ) ||
        programCode !==
            rawProgramCode ||
        !version ||
        !hasCanonicalDocumentIdentity(
            documentId,
            resourceId,
            version
        ) ||
        !title ||
        title.length >
            160 ||
        normalizeString(
            data.description
        ).length >
            2000 ||
        !LearningResourceContract.resourceTypes.includes(
            resourceType
        ) ||
        !LearningResourceContract.categories.includes(
            category
        ) ||
        !LearningResourceContract.deliveryTypes.includes(
            deliveryType
        ) ||
        !LearningResourceContract.statuses.includes(
            status
        ) ||
        displayOrder <
            0 ||
        displayOrder >
            LearningResourceContract.maxDisplayOrder ||
        normalizeString(
            data.source
        ) !==
            "admin_portal" ||
        !hasValidCreationAudit(
            data
        ) ||
        !hasValidLifecycle(
            data
        ) ||
        !hasValidDeliveryData(
            data,
            identity
        );

    if (
        malformed
    ) {

        console.warn(
            `[${MODULE_NAME}] Malformed record excluded:`,
            {
                documentId:
                    documentId ||
                    snapshot.id ||
                    null,

                resourceId:
                    resourceId ||
                    null,

                programCode:
                    programCode ||
                    null,

                status:
                    status ||
                    null,

                deliveryType:
                    deliveryType ||
                    null,

                version:
                    version ||
                    null
            }
        );

        return null;

    }

    const viewModel = {

        documentId,

        resourceId,

        programCode,

        title,

        description:
            normalizeString(
                data.description
            ),

        resourceType,

        category,

        deliveryType,

        storagePath:
            normalizeNullableString(
                data.storage_path
            ),

        externalUrl:
            normalizeNullableString(
                data.external_url
            ),

        fileName:
            normalizeNullableString(
                data.file_name
            ),

        fileExtension:
            normalizeNullableString(
                data.file_extension
            ),

        mimeType:
            normalizeNullableString(
                data.mime_type
            ),

        fileSize:
            normalizeNonNegativeInteger(
                data.file_size,
                0
            ),

        previewAllowed:
            normalizeBoolean(
                data.preview_allowed
            ),

        downloadAllowed:
            normalizeBoolean(
                data.download_allowed
            ),

        embedAllowed:
            normalizeBoolean(
                data.embed_allowed
            ),

        status,

        isActive:
            normalizeBoolean(
                data.is_active
            ),

        isLatest:
            normalizeBoolean(
                data.is_latest
            ),

        version,

        displayOrder,

        createdByUid:
            normalizeNullableString(
                data.created_by_uid
            ),

        createdByEmail:
            normalizeNullableString(
                data.created_by_email
            ),

        createdAt:
            toIsoString(
                data.created_at
            ),

        publishedByUid:
            normalizeNullableString(
                data.published_by_uid
            ),

        publishedByEmail:
            normalizeNullableString(
                data.published_by_email
            ),

        publishedAt:
            toIsoString(
                data.published_at
            ),

        withdrawnByUid:
            normalizeNullableString(
                data.withdrawn_by_uid
            ),

        withdrawnByEmail:
            normalizeNullableString(
                data.withdrawn_by_email
            ),

        withdrawnAt:
            toIsoString(
                data.withdrawn_at
            ),

        withdrawalReason:
            normalizeString(
                data.withdrawal_reason
            ),

        updatedAt:
            toIsoString(
                data.updated_at
            ),

        source:
            "admin_portal"

    };

    return Object.freeze(
        viewModel
    );

}


/* ==========================================================
   RESOURCE SORTING
========================================================== */

function compareResources(
    first,
    second
) {

    if (
        first.displayOrder !==
        second.displayOrder
    ) {

        return (
            first.displayOrder -
            second.displayOrder
        );

    }

    const titleComparison =
        first.title.localeCompare(
            second.title,
            undefined,
            {
                sensitivity:
                    "base"
            }
        );

    if (
        titleComparison !==
        0
    ) {

        return titleComparison;

    }

    if (
        first.resourceId !==
        second.resourceId
    ) {

        return first.resourceId.localeCompare(
            second.resourceId
        );

    }

    return (
        second.version -
        first.version
    );

}


/* ==========================================================
   FILTER NORMALIZATION
========================================================== */

function normalizeFilters(
    filters = {}
) {

    return Object.freeze({

        programCode:
            LearningResourceContract.normalizeProgramCode(
                filters.programCode ||
                filters.program_code
            ),

        status:
            normalizeLowercase(
                filters.status
            ),

        category:
            normalizeLowercase(
                filters.category
            ),

        resourceType:
            normalizeLowercase(
                filters.resourceType ||
                filters.resource_type
            ),

        deliveryType:
            normalizeLowercase(
                filters.deliveryType ||
                filters.delivery_type
            ),

        search:
            normalizeLowercase(
                filters.search
            ),

        latestOnly:
            filters.latestOnly ===
            true,

        activeOnly:
            filters.activeOnly ===
            true

    });

}


/* ==========================================================
   FILTER MATCHING
========================================================== */

function matchesFilters(
    resource,
    filters
) {

    if (
        filters.programCode &&
        resource.programCode !==
            filters.programCode
    ) {

        return false;

    }

    if (
        filters.status &&
        resource.status !==
            filters.status
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
        filters.deliveryType &&
        resource.deliveryType !==
            filters.deliveryType
    ) {

        return false;

    }

    if (
        filters.latestOnly &&
        !resource.isLatest
    ) {

        return false;

    }

    if (
        filters.activeOnly &&
        !resource.isActive
    ) {

        return false;

    }

    if (
        filters.search
    ) {

        const searchableText = [

            resource.documentId,

            resource.resourceId,

            resource.programCode,

            resource.title,

            resource.description,

            resource.category,

            resource.resourceType,

            resource.deliveryType,

            resource.status,

            resource.fileName ||
                ""

        ]
            .join(
                " "
            )
            .toLowerCase();

        if (
            !searchableText.includes(
                filters.search
            )
        ) {

            return false;

        }

    }

    return true;

}


/* ==========================================================
   REGISTRY CONSISTENCY
========================================================== */

function inspectLatestVersionConsistency(
    resources
) {

    const latestByResource =
        new Map();

    resources.forEach(
        (
            resource
        ) => {

            if (
                resource.status !==
                    "published" ||
                resource.isLatest !==
                    true
            ) {

                return;

            }

            const existing =
                latestByResource.get(
                    resource.resourceId
                ) ||
                [];

            existing.push(
                resource
            );

            latestByResource.set(
                resource.resourceId,
                existing
            );

        }
    );

    latestByResource.forEach(
        (
            latestVersions,
            resourceId
        ) => {

            if (
                latestVersions.length >
                1
            ) {

                console.error(
                    `[${MODULE_NAME}] Multiple latest published versions detected:`,
                    {
                        resourceId,

                        documentIds:
                            latestVersions.map(
                                (
                                    resource
                                ) => resource.documentId
                            )
                    }
                );

            }

        }
    );

}


/* ==========================================================
   AUTHORITATIVE REGISTRY READ
========================================================== */

async function readRegistry() {

    await requireAuthorizedAdmin();

    const snapshot =
        await getDocs(
            collection(
                db,
                COLLECTION_NAME
            )
        );

    const resources =
        [];

    let malformedCount =
        0;

    snapshot.forEach(
        (
            documentSnapshot
        ) => {

            const resource =
                normalizeRecord(
                    documentSnapshot
                );

            if (
                resource
            ) {

                resources.push(
                    resource
                );

            }
            else {

                malformedCount +=
                    1;

            }

        }
    );

    resources.sort(
        compareResources
    );

    inspectLatestVersionConsistency(
        resources
    );

    console.info(
        `[${MODULE_NAME}] Registry read completed:`,
        {
            moduleVersion:
                MODULE_VERSION,

            totalDocuments:
                snapshot.size,

            acceptedRecords:
                resources.length,

            excludedRecords:
                malformedCount
        }
    );

    return freezeArray(
        resources
    );

}


/*
 * Concurrent calls share one active Firestore operation.
 * The active promise is always cleared after completion.
 */
async function getRegistrySnapshot() {

    if (
        !activeRegistryReadPromise
    ) {

        activeRegistryReadPromise =
            readRegistry()
                .finally(
                    () => {

                        activeRegistryReadPromise =
                            null;

                    }
                );

    }

    return activeRegistryReadPromise;

}


/* ==========================================================
   GET RESOURCE
========================================================== */

async function getResource(
    documentId
) {

    await requireAuthorizedAdmin();

    const normalizedDocumentId =
        normalizeString(
            documentId
        );

    if (
        !LearningResourceContract.isValidDocumentId(
            normalizedDocumentId
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Invalid learning-resource document ID.`
        );

    }

    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    COLLECTION_NAME,
                    normalizedDocumentId
                )
            );

        if (
            !snapshot.exists()
        ) {

            return null;

        }

        return normalizeRecord(
            snapshot
        );

    }
    catch (
        error
    ) {

        console.error(
            `[${MODULE_NAME}] Resource retrieval failed:`,
            {
                moduleVersion:
                    MODULE_VERSION,

                documentId:
                    normalizedDocumentId,

                error
            }
        );

        throw error;

    }

}


/* ==========================================================
   LIST RESOURCES
========================================================== */

async function listResources(
    filters = {}
) {

    const normalizedFilters =
        normalizeFilters(
            filters
        );

    try {

        const registryResources =
            await getRegistrySnapshot();

        const filteredResources =
            registryResources.filter(
                (
                    resource
                ) => (
                    matchesFilters(
                        resource,
                        normalizedFilters
                    )
                )
            );

        console.info(
            `[${MODULE_NAME}] Resources resolved:`,
            {
                moduleVersion:
                    MODULE_VERSION,

                registryTotal:
                    registryResources.length,

                filteredTotal:
                    filteredResources.length,

                filters:
                    normalizedFilters
            }
        );

        return freezeArray(
            filteredResources
        );

    }
    catch (
        error
    ) {

        console.error(
            `[${MODULE_NAME}] Resource listing failed:`,
            {
                moduleVersion:
                    MODULE_VERSION,

                filters:
                    normalizedFilters,

                error
            }
        );

        throw error;

    }

}


/* ==========================================================
   VERSION HISTORY
========================================================== */

async function listVersions(
    resourceId
) {

    const normalizedResourceId =
        LearningResourceContract.normalizeResourceId(
            resourceId
        );

    if (
        !normalizedResourceId ||
        !hasValidResourceId(
            normalizedResourceId
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] A valid resource ID is required.`
        );

    }

    const resources =
        await getRegistrySnapshot();

    const versions =
        resources
            .filter(
                (
                    resource
                ) => (
                    resource.resourceId ===
                    normalizedResourceId
                )
            )
            .sort(
                (
                    first,
                    second
                ) => (
                    second.version -
                    first.version
                )
            );

    return freezeArray(
        versions
    );

}


/* ==========================================================
   LATEST PUBLISHED VERSION
========================================================== */

async function getLatestPublishedVersion(
    resourceId
) {

    const versions =
        await listVersions(
            resourceId
        );

    const latestVersions =
        versions.filter(
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
        latestVersions.length >
        1
    ) {

        console.error(
            `[${MODULE_NAME}] Latest-version invariant violated:`,
            {
                resourceId:
                    LearningResourceContract.normalizeResourceId(
                        resourceId
                    ),

                documentIds:
                    latestVersions.map(
                        (
                            resource
                        ) => resource.documentId
                    )
            }
        );

    }

    return (
        latestVersions[0] ||
        null
    );

}


/* ==========================================================
   SUMMARY
========================================================== */

function summarizeResources(
    resources = []
) {

    const normalizedResources =
        Array.isArray(
            resources
        )
            ? resources
            : [];

    const programmes =
        new Set();

    let drafts =
        0;

    let published =
        0;

    let withdrawn =
        0;

    let active =
        0;

    let latestPublished =
        0;

    let licensedMaterials =
        0;

    let referenceMaterials =
        0;

    normalizedResources.forEach(
        (
            resource
        ) => {

            switch (
                resource.status
            ) {

                case "draft":

                    drafts +=
                        1;

                    break;

                case "published":

                    published +=
                        1;

                    break;

                case "withdrawn":

                    withdrawn +=
                        1;

                    break;

                default:

                    break;

            }

            if (
                resource.isActive
            ) {

                active +=
                    1;

            }

            if (
                resource.status ===
                    "published" &&
                resource.isLatest ===
                    true
            ) {

                latestPublished +=
                    1;

            }

            if (
                resource.category ===
                "licensed_course_material"
            ) {

                licensedMaterials +=
                    1;

            }

            if (
                resource.category ===
                "reference_material"
            ) {

                referenceMaterials +=
                    1;

            }

            if (
                resource.programCode
            ) {

                programmes.add(
                    resource.programCode
                );

            }

        }
    );

    const programmeList =
        Array
            .from(
                programmes
            )
            .sort();

    return Object.freeze({

        total:
            normalizedResources.length,

        drafts,

        published,

        withdrawn,

        active,

        latestPublished,

        licensedMaterials,

        referenceMaterials,

        programmeCount:
            programmeList.length,

        programmes:
            freezeArray(
                programmeList
            )

    });

}


async function getSummary() {

    try {

        const resources =
            await getRegistrySnapshot();

        return summarizeResources(
            resources
        );

    }
    catch (
        error
    ) {

        console.error(
            `[${MODULE_NAME}] Summary resolution failed:`,
            {
                moduleVersion:
                    MODULE_VERSION,

                error
            }
        );

        throw error;

    }

}


/* ==========================================================
   PUBLIC API
========================================================== */

const LearningResourceService =
    Object.freeze({

        moduleName:
            MODULE_NAME,

        version:
            MODULE_VERSION,

        collectionName:
            COLLECTION_NAME,

        getResource,

        listResources,

        listVersions,

        getLatestPublishedVersion,

        summarizeResources,

        getSummary

    });


window.LearningResourceService =
    LearningResourceService;


console.info(
    `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
);


export {

    LearningResourceService,

    getResource,

    listResources,

    listVersions,

    getLatestPublishedVersion,

    summarizeResources,

    getSummary

};