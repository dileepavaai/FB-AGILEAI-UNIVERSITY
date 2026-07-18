/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-service.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Admin Learning Resource Discovery

   Purpose
   ----------------------------------------------------------
   Provides read-only Admin access to governed learning-resource
   metadata stored in Firestore.

   Responsibilities
   ----------------------------------------------------------
   ✓ Require an authorized administrator
   ✓ Retrieve a resource by document ID
   ✓ List governed learning resources
   ✓ Filter by programme, status, category and type
   ✓ Search resource titles and descriptions
   ✓ Resolve resource version history
   ✓ Resolve the latest published version
   ✓ Normalize Firestore records into read-only ViewModels
   ✓ Fail closed when records are malformed

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Create or update records
   ✗ Upload files
   ✗ Publish resources
   ✗ Withdraw resources
   ✗ Delete records
   ✗ Generate download URLs
   ✗ Resolve learner entitlement
   ✗ Render HTML

   Governance
   ----------------------------------------------------------
   • This is an Admin read service
   • Publisher owns lifecycle mutations
   • Storage service owns protected uploads
   • Student delivery must use an authorized backend
   • Malformed records are excluded
   • Permanent protected download URLs are not exposed

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
    "1.0.0";

const COLLECTION_NAME =
    "learning_resources";


/* ==========================================================
   HELPERS
========================================================== */

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

        return null;

    }

}


function normalizeNullableString(
    value
) {

    const normalizedValue =
        LearningResourceContract.normalizeString(
            value
        );

    return normalizedValue ||
        null;

}


function normalizeRecord(
    snapshot
) {

    if (
        !snapshot ||
        !snapshot.exists()
    ) {

        return null;

    }

    const data =
        snapshot.data() ||
        {};

    const documentId =
        LearningResourceContract.normalizeString(
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

    const version =
        LearningResourceContract.normalizeVersion(
            data.version
        );

    if (
        !LearningResourceContract.isValidDocumentId(
            documentId
        ) ||
        !resourceId ||
        !programCode ||
        !LearningResourceContract.resourceTypes.includes(
            data.resource_type
        ) ||
        !LearningResourceContract.categories.includes(
            data.category
        ) ||
        !LearningResourceContract.deliveryTypes.includes(
            data.delivery_type
        ) ||
        !LearningResourceContract.statuses.includes(
            data.status
        )
    ) {

        console.warn(
            `[${MODULE_NAME}] Malformed record excluded:`,
            {
                documentId
            }
        );

        return null;

    }

    const viewModel = {

        documentId,

        resourceId,

        programCode,

        title:
            LearningResourceContract.normalizeString(
                data.title
            ),

        description:
            LearningResourceContract.normalizeString(
                data.description
            ),

        resourceType:
            data.resource_type,

        category:
            data.category,

        deliveryType:
            data.delivery_type,

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
            Number.isFinite(
                Number(
                    data.file_size
                )
            )
                ? Number(
                    data.file_size
                )
                : 0,

        previewAllowed:
            data.preview_allowed ===
            true,

        downloadAllowed:
            data.download_allowed ===
            true,

        embedAllowed:
            data.embed_allowed ===
            true,

        status:
            data.status,

        isActive:
            data.is_active ===
            true,

        isLatest:
            data.is_latest ===
            true,

        version,

        displayOrder:
            Number.isInteger(
                data.display_order
            )
                ? data.display_order
                : 10000,

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
            LearningResourceContract.normalizeString(
                data.withdrawal_reason
            ),

        updatedAt:
            toIsoString(
                data.updated_at
            ),

        source:
            LearningResourceContract.normalizeString(
                data.source
            )

    };

    if (
        !viewModel.title
    ) {

        console.warn(
            `[${MODULE_NAME}] Untitled record excluded:`,
            {
                documentId
            }
        );

        return null;

    }

    return Object.freeze(
        viewModel
    );

}


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
            second.title
        );

    if (
        titleComparison !== 0
    ) {

        return titleComparison;

    }

    return (
        second.version -
        first.version
    );

}


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
            LearningResourceContract.normalizeString(
                filters.status
            ),

        category:
            LearningResourceContract.normalizeString(
                filters.category
            ),

        resourceType:
            LearningResourceContract.normalizeString(
                filters.resourceType ||
                filters.resource_type
            ),

        deliveryType:
            LearningResourceContract.normalizeString(
                filters.deliveryType ||
                filters.delivery_type
            ),

        search:
            LearningResourceContract.normalizeString(
                filters.search
            ).toLowerCase(),

        latestOnly:
            filters.latestOnly ===
            true,

        activeOnly:
            filters.activeOnly ===
            true

    });

}


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
            resource.fileName || ""
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
   GET RESOURCE
========================================================== */

async function getResource(
    documentId
) {

    await requireAuthorizedAdmin();

    const normalizedDocumentId =
        LearningResourceContract.normalizeString(
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


/* ==========================================================
   LIST RESOURCES
========================================================== */

async function listResources(
    filters = {}
) {

    await requireAuthorizedAdmin();

    const normalizedFilters =
        normalizeFilters(
            filters
        );

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    COLLECTION_NAME
                )
            );

        const resources = [];

        snapshot.forEach(
            (
                documentSnapshot
            ) => {

                const resource =
                    normalizeRecord(
                        documentSnapshot
                    );

                if (
                    resource &&
                    matchesFilters(
                        resource,
                        normalizedFilters
                    )
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

        console.info(
            `[${MODULE_NAME}] Resources resolved:`,
            {
                moduleVersion:
                    MODULE_VERSION,

                total:
                    resources.length,

                filters:
                    normalizedFilters
            }
        );

        return Object.freeze([
            ...resources
        ]);

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
        await listResources();

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

    return Object.freeze([
        ...versions
    ]);

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
   ADMIN SUMMARY
========================================================== */

async function getSummary() {

    const resources =
        await listResources();

    const summary = {

        total:
            resources.length,

        drafts:
            0,

        published:
            0,

        withdrawn:
            0,

        active:
            0,

        programmes:
            new Set()

    };

    resources.forEach(
        (
            resource
        ) => {

            if (
                resource.status ===
                "draft"
            ) {

                summary.drafts += 1;

            }

            if (
                resource.status ===
                "published"
            ) {

                summary.published += 1;

            }

            if (
                resource.status ===
                "withdrawn"
            ) {

                summary.withdrawn += 1;

            }

            if (
                resource.isActive
            ) {

                summary.active += 1;

            }

            if (
                resource.programCode
            ) {

                summary.programmes.add(
                    resource.programCode
                );

            }

        }
    );

    return Object.freeze({

        total:
            summary.total,

        drafts:
            summary.drafts,

        published:
            summary.published,

        withdrawn:
            summary.withdrawn,

        active:
            summary.active,

        programmeCount:
            summary.programmes.size,

        programmes:
            Object.freeze(
                Array
                    .from(
                        summary.programmes
                    )
                    .sort()
            )

    });

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
    getSummary
};