/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-service.js
   Version   : 1.1.0
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
   • Exclude malformed records safely
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
    "1.1.0";

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


function normalizePositiveInteger(
    value,
    fallback = 1
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

        return fallback;

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
   RECORD NORMALIZATION
========================================================== */

function normalizeRecord(
    snapshot
) {

    if (
        !snapshot ||
        typeof snapshot.exists !== "function" ||
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

    const resourceId =
        LearningResourceContract.normalizeResourceId(
            data.resource_id
        );

    const programCode =
        LearningResourceContract.normalizeProgramCode(
            data.program_code
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
        normalizePositiveInteger(
            LearningResourceContract.normalizeVersion(
                data.version
            ),
            1
        );

    const title =
        normalizeString(
            data.title
        );

    const malformed =
        !LearningResourceContract.isValidDocumentId(
            documentId
        ) ||
        !resourceId ||
        !programCode ||
        !title ||
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

        displayOrder:
            normalizeNonNegativeInteger(
                data.display_order,
                10000
            ),

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
            normalizeString(
                data.source
            )

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
        titleComparison !== 0
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
            filters.latestOnly === true,

        activeOnly:
            filters.activeOnly === true

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

        }
    );

    resources.sort(
        compareResources
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
        !normalizedResourceId
    ) {

        throw new Error(
            `[${MODULE_NAME}] Resource ID is required.`
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

    return (
        versions.find(
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
        ) ||
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

                    drafts += 1;

                    break;

                case "published":

                    published += 1;

                    break;

                case "withdrawn":

                    withdrawn += 1;

                    break;

                default:

                    break;

            }

            if (
                resource.isActive
            ) {

                active += 1;

            }

            if (
                resource.category ===
                "licensed_course_material"
            ) {

                licensedMaterials += 1;

            }

            if (
                resource.category ===
                "reference_material"
            ) {

                referenceMaterials += 1;

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