/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-publisher.js
   Version   : 1.5.0
   Status    : ACTIVE
   Authority : Admin Portal

   Purpose
   ----------------------------------------------------------
   Manages the governed Firestore lifecycle of programme
   learning-resource metadata.

   Responsibilities
   ----------------------------------------------------------
   • Create governed learning-resource drafts
   • Update existing drafts
   • Persist governed release-policy metadata
   • Persist governed Storage-domain metadata
   • Preserve protected assets during metadata edits
   • Attach validated protected Storage metadata
   • Publish contract-valid resources
   • Supersede previous latest published versions
   • Withdraw published resources
   • Preserve immutable identity and audit metadata
   • Prevent physical metadata deletion

   Non-Responsibilities
   ----------------------------------------------------------
   • Upload files
   • Generate permanent download URLs
   • Delete Storage objects
   • Delete Firestore records
   • Authenticate learners
   • Resolve learner entitlement
   • Evaluate learner release eligibility
   • Render UI
   • Deliver resources to the Student Portal

   Governance
   ----------------------------------------------------------
   • Admin Portal is the publication authority
   • New resources always begin as drafts
   • Drafts are inactive and never latest
   • Protected files may be attached while status remains draft
   • Published resource assets are immutable
   • Published release metadata is immutable
   • Replacement requires a new resource version
   • Only one published version should remain latest
   • Withdrawal is terminal
   • Physical deletion is prohibited
   • Learner identity must not be stored in this registry
   • Audit identity must match the authenticated administrator
   • ADR-019 governs protected resource delivery
   • ADR-020 governs release-policy metadata
   • Firestore Rules v2.8.0 are the persistence authority

   Change History
   ----------------------------------------------------------
   v1.5.0
   • Added release_policy persistence
   • Added module_number persistence
   • Added session_number persistence
   • Added available_from persistence
   • Added available_until persistence
   • Added storage_domain persistence
   • Added personalisation_type persistence
   • Removed unsupported uploaded lifecycle writes
   • Protected-file attachment now preserves draft status
   • Aligned publisher output with Firestore Rules v2.8.0
   • Preserved publication, supersession and withdrawal flows

   v1.4.1
   • Added compatibility publication for protected assets
     containing complete persisted upload evidence
   • Preserved rejection of incomplete protected resources

   v1.4.0
   • Added uploaded lifecycle state
   • Transitioned protected assets from draft to uploaded
   • Allowed uploaded resources to enter publication
   • Required protected Storage upload completion before publication

   v1.3.0
   • Added complete update audit metadata for all mutations
   • Added protected-file upload audit metadata
   • Preserved upload audit metadata during draft editing
   • Added consistent transaction timestamps for publication
   • Corrected superseded-version update audit metadata
   • Corrected withdrawal update audit metadata

   v1.2.0
   • Required complete administrator audit identity
   • Added canonical Firestore document identity validation
   • Added strict protected-asset attachment validation
   • Required Storage paths to match resource identity
   • Required approved MIME type and valid file size
   • Preserved immutable creation audit fields strictly
   • Strengthened publication and withdrawal validation

   v1.1.0
   • Corrected draft is_latest lifecycle state
   • Preserved protected assets during metadata edits
   • Added transactional publication and supersession
   • Enforced terminal withdrawal lifecycle
========================================================== */

import {
    db
} from "../../../../assets/js/core.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    runTransaction,
    serverTimestamp,
    where
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
    "LearningResourcePublisher";

const MODULE_VERSION =
    "1.5.0";

const COLLECTION_NAME =
    "learning_resources";


/* ==========================================================
   GOVERNED VALUES
========================================================== */

const VALID_RELEASE_POLICIES =
    Object.freeze([
        "on_enrollment",
        "pre_module",
        "post_module",
        "post_session",
        "post_assessment",
        "post_programme",
        "alumni_only",
        "manual"
    ]);

const VALID_STORAGE_DOMAINS =
    Object.freeze([
        "learning_resources",
        "master_learning_resources",
        "external"
    ]);

const VALID_PERSONALISATION_TYPES =
    Object.freeze([
        "shared",
        "learner_specific",
        "none"
    ]);


/* ==========================================================
   NORMALIZATION HELPERS
========================================================== */

function normalizeString(
    value
) {

    return LearningResourceContract.normalizeString(
        value
    );

}


function normalizeLowercase(
    value
) {

    return normalizeString(
        value
    ).toLowerCase();

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
        Number(
            value
        );

    if (
        !Number.isInteger(
            version
        ) ||
        version < 1
    ) {

        throw new Error(
            `[${MODULE_NAME}] Invalid resource version.`
        );

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

        return 0;

    }

    return displayOrder;

}


function normalizeNullablePositiveInteger(
    value
) {

    if (
        value ===
            null ||
        value ===
            undefined ||
        value ===
            ""
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


function normalizeNullableIsoDateTime(
    value
) {

    const normalizedValue =
        normalizeNullableString(
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

        throw new Error(
            `[${MODULE_NAME}] Invalid availability date-time value.`
        );

    }

    return date.toISOString();

}


function normalizeReleasePolicy(
    value
) {

    const releasePolicy =
        normalizeLowercase(
            value
        );

    if (
        !VALID_RELEASE_POLICIES.includes(
            releasePolicy
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Invalid learning-resource release policy.`
        );

    }

    return releasePolicy;

}


function normalizeStorageDomain(
    value,
    deliveryType
) {

    const normalizedDeliveryType =
        normalizeLowercase(
            deliveryType
        );

    const fallbackDomain =
        normalizedDeliveryType ===
            "protected_storage"
            ? "learning_resources"
            : "external";

    const storageDomain =
        normalizeLowercase(
            value
        ) ||
        fallbackDomain;

    if (
        !VALID_STORAGE_DOMAINS.includes(
            storageDomain
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Invalid learning-resource Storage domain.`
        );

    }

    if (
        normalizedDeliveryType ===
            "protected_storage" &&
        ![
            "learning_resources",
            "master_learning_resources"
        ].includes(
            storageDomain
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected resources require a governed Storage domain.`
        );

    }

    if (
        normalizedDeliveryType !==
            "protected_storage" &&
        storageDomain !==
            "external"
    ) {

        throw new Error(
            `[${MODULE_NAME}] External resources require the external Storage domain.`
        );

    }

    return storageDomain;

}


function normalizePersonalisationType(
    value,
    storageDomain
) {

    const normalizedStorageDomain =
        normalizeLowercase(
            storageDomain
        );

    const fallbackType =
        normalizedStorageDomain ===
            "master_learning_resources"
            ? "learner_specific"
            : normalizedStorageDomain ===
                "learning_resources"
                ? "shared"
                : "none";

    const personalisationType =
        normalizeLowercase(
            value
        ) ||
        fallbackType;

    if (
        !VALID_PERSONALISATION_TYPES.includes(
            personalisationType
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Invalid learning-resource personalisation type.`
        );

    }

    if (
        normalizedStorageDomain ===
            "external" &&
        personalisationType !==
            "none"
    ) {

        throw new Error(
            `[${MODULE_NAME}] External resources cannot use protected-resource personalisation.`
        );

    }

    return personalisationType;

}


function normalizeActor(
    actor
) {

    const uid =
        normalizeString(
            actor?.uid
        );

    const email =
        normalizeLowercase(
            actor?.email
        );

    if (
        !uid
    ) {

        throw new Error(
            `[${MODULE_NAME}] Authorized administrator UID is missing.`
        );

    }

    if (
        !email
    ) {

        throw new Error(
            `[${MODULE_NAME}] Authorized administrator email is missing.`
        );

    }

    return Object.freeze({

        uid,

        email

    });

}


/* ==========================================================
   DOCUMENT IDENTITY
========================================================== */

function buildReference(
    documentId
) {

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

    return doc(
        db,
        COLLECTION_NAME,
        normalizedDocumentId
    );

}


function buildCanonicalDocumentId(
    resourceId,
    version
) {

    const documentId =
        LearningResourceContract.buildDocumentId(
            resourceId,
            version
        );

    if (
        !documentId ||
        !LearningResourceContract.isValidDocumentId(
            documentId
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Unable to build the canonical resource document ID.`
        );

    }

    return documentId;

}


function validateDocumentIdentity(
    documentId,
    data
) {

    const expectedDocumentId =
        buildCanonicalDocumentId(
            data?.resource_id,
            data?.version
        );

    if (
        normalizeString(
            documentId
        ) !==
        expectedDocumentId
    ) {

        throw new Error(
            `[${MODULE_NAME}] Firestore document ID does not match the resource identity and version.`
        );

    }

}


/* ==========================================================
   AUDIT VALIDATION
========================================================== */

function validateCreationAudit(
    data
) {

    if (
        !normalizeString(
            data?.created_by_uid
        ) ||
        !normalizeString(
            data?.created_by_email
        ) ||
        !data?.created_at
    ) {

        throw new Error(
            `[${MODULE_NAME}] Existing creation audit metadata is incomplete.`
        );

    }

}


function validateUploadAudit(
    data
) {

    const hasStoragePath =
        Boolean(
            normalizeString(
                data?.storage_path
            )
        );

    if (
        !hasStoragePath
    ) {

        return;

    }

    if (
        !normalizeString(
            data?.uploaded_by_uid
        ) ||
        !normalizeString(
            data?.uploaded_by_email
        ) ||
        !data?.uploaded_at
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected upload audit metadata is incomplete.`
        );

    }

}

/* ==========================================================
   RELEASE-GOVERNANCE NORMALIZATION
========================================================== */

function buildReleaseGovernance(
    resource
) {

    const releasePolicy =
        normalizeReleasePolicy(
            resource?.release_policy
        );

    const moduleNumber =
        normalizeNullablePositiveInteger(
            resource?.module_number
        );

    const sessionNumber =
        normalizeNullablePositiveInteger(
            resource?.session_number
        );

    const availableFrom =
        normalizeNullableIsoDateTime(
            resource?.available_from
        );

    const availableUntil =
        normalizeNullableIsoDateTime(
            resource?.available_until
        );

    if (
        [
            "pre_module",
            "post_module"
        ].includes(
            releasePolicy
        ) &&
        moduleNumber ===
            null
    ) {

        throw new Error(
            `[${MODULE_NAME}] Module-based release policies require a module number.`
        );

    }

    if (
        ![
            "pre_module",
            "post_module"
        ].includes(
            releasePolicy
        ) &&
        moduleNumber !==
            null
    ) {

        throw new Error(
            `[${MODULE_NAME}] Module number is not permitted for the selected release policy.`
        );

    }

    if (
        releasePolicy ===
            "post_session" &&
        sessionNumber ===
            null
    ) {

        throw new Error(
            `[${MODULE_NAME}] Post-session release requires a session number.`
        );

    }

    if (
        releasePolicy !==
            "post_session" &&
        sessionNumber !==
            null
    ) {

        throw new Error(
            `[${MODULE_NAME}] Session number is not permitted for the selected release policy.`
        );

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
            availableUntilTime <=
            availableFromTime
        ) {

            throw new Error(
                `[${MODULE_NAME}] Available Until must be later than Available From.`
            );

        }

    }

    return Object.freeze({

        releasePolicy,

        moduleNumber,

        sessionNumber,

        availableFrom,

        availableUntil

    });

}


/* ==========================================================
   DELIVERY-GOVERNANCE NORMALIZATION
========================================================== */

function buildDeliveryGovernance(
    resource
) {

    const deliveryType =
        normalizeLowercase(
            resource?.delivery_type
        );

    const storageDomain =
        normalizeStorageDomain(
            resource?.storage_domain,
            deliveryType
        );

    const personalisationType =
        normalizePersonalisationType(
            resource?.personalisation_type,
            storageDomain
        );

    const protectedDelivery =
        deliveryType ===
            "protected_storage";

    return Object.freeze({

        deliveryType,

        storageDomain,

        personalisationType,

        protectedDelivery

    });

}


/* ==========================================================
   PROTECTED-ASSET STATE
========================================================== */

function buildProtectedAssetState(
    resource,
    protectedDelivery
) {

    if (
        !protectedDelivery
    ) {

        return Object.freeze({

            storagePath:
                null,

            fileName:
                null,

            fileExtension:
                null,

            mimeType:
                null,

            fileSize:
                0

        });

    }

    return Object.freeze({

        storagePath:
            normalizeNullableString(
                resource?.storage_path
            ),

        fileName:
            normalizeNullableString(
                resource?.file_name
            ),

        fileExtension:
            normalizeNullableString(
                resource?.file_extension
            ),

        mimeType:
            normalizeNullableString(
                resource?.mime_type
            ),

        fileSize:
            normalizeFileSize(
                resource?.file_size
            )

    });

}


/* ==========================================================
   DRAFT DATA
========================================================== */

function buildDraftData(
    normalizedResource,
    actor
) {

    const timestamp =
        serverTimestamp();

    const deliveryGovernance =
        buildDeliveryGovernance(
            normalizedResource
        );

    const releaseGovernance =
        buildReleaseGovernance(
            normalizedResource
        );

    const protectedAsset =
        buildProtectedAssetState(
            normalizedResource,
            deliveryGovernance.protectedDelivery
        );

    return {

        resource_id:
            normalizedResource.resource_id,

        program_code:
            normalizedResource.program_code,

        title:
            normalizedResource.title,

        description:
            normalizedResource.description,

        resource_type:
            normalizedResource.resource_type,

        category:
            normalizedResource.category,

        delivery_type:
            deliveryGovernance.deliveryType,

        personalisation_type:
            deliveryGovernance.personalisationType,

        storage_domain:
            deliveryGovernance.storageDomain,

        storage_path:
            protectedAsset.storagePath,

        external_url:
            deliveryGovernance.protectedDelivery
                ? null
                : normalizeNullableString(
                    normalizedResource.external_url
                ),

        file_name:
            protectedAsset.fileName,

        file_extension:
            protectedAsset.fileExtension,

        mime_type:
            protectedAsset.mimeType,

        file_size:
            protectedAsset.fileSize,

        preview_allowed:
            normalizedResource.preview_allowed ===
            true,

        download_allowed:
            normalizedResource.download_allowed ===
            true,

        embed_allowed:
            normalizedResource.embed_allowed ===
            true,

        release_policy:
            releaseGovernance.releasePolicy,

        module_number:
            releaseGovernance.moduleNumber,

        session_number:
            releaseGovernance.sessionNumber,

        available_from:
            releaseGovernance.availableFrom,

        available_until:
            releaseGovernance.availableUntil,

        status:
            "draft",

        is_active:
            false,

        is_latest:
            false,

        version:
            normalizeVersion(
                normalizedResource.version
            ),

        display_order:
            normalizeDisplayOrder(
                normalizedResource.display_order
            ),

        created_by_uid:
            actor.uid,

        created_by_email:
            actor.email,

        created_at:
            timestamp,

        updated_by_uid:
            actor.uid,

        updated_by_email:
            actor.email,

        updated_at:
            timestamp,

        uploaded_by_uid:
            null,

        uploaded_by_email:
            null,

        uploaded_at:
            null,

        published_by_uid:
            null,

        published_by_email:
            null,

        published_at:
            null,

        withdrawn_by_uid:
            null,

        withdrawn_by_email:
            null,

        withdrawn_at:
            null,

        withdrawal_reason:
            "",

        source:
            "admin_portal"

    };

}


/* ==========================================================
   EDITABLE DRAFT DATA
========================================================== */

function buildEditableDraftData(
    normalizedResource,
    existingData,
    actor
) {

    validateCreationAudit(
        existingData
    );

    const deliveryGovernance =
        buildDeliveryGovernance(
            normalizedResource
        );

    const releaseGovernance =
        buildReleaseGovernance(
            normalizedResource
        );

    const existingProtectedAsset =
        buildProtectedAssetState(
            existingData,
            deliveryGovernance.protectedDelivery
        );

    const hasExistingProtectedAsset =
        Boolean(
            existingProtectedAsset.storagePath
        );

    if (
        hasExistingProtectedAsset
    ) {

        validateUploadAudit(
            existingData
        );

    }

    return {

        resource_id:
            existingData.resource_id,

        program_code:
            existingData.program_code,

        version:
            existingData.version,

        title:
            normalizedResource.title,

        description:
            normalizedResource.description,

        resource_type:
            normalizedResource.resource_type,

        category:
            normalizedResource.category,

        delivery_type:
            deliveryGovernance.deliveryType,

        personalisation_type:
            deliveryGovernance.personalisationType,

        storage_domain:
            deliveryGovernance.storageDomain,

        storage_path:
            existingProtectedAsset.storagePath,

        external_url:
            deliveryGovernance.protectedDelivery
                ? null
                : normalizeNullableString(
                    normalizedResource.external_url
                ),

        file_name:
            existingProtectedAsset.fileName,

        file_extension:
            existingProtectedAsset.fileExtension,

        mime_type:
            existingProtectedAsset.mimeType,

        file_size:
            existingProtectedAsset.fileSize,

        preview_allowed:
            normalizedResource.preview_allowed ===
            true,

        download_allowed:
            normalizedResource.download_allowed ===
            true,

        embed_allowed:
            normalizedResource.embed_allowed ===
            true,

        release_policy:
            releaseGovernance.releasePolicy,

        module_number:
            releaseGovernance.moduleNumber,

        session_number:
            releaseGovernance.sessionNumber,

        available_from:
            releaseGovernance.availableFrom,

        available_until:
            releaseGovernance.availableUntil,

        /*
         * Firestore Rules v2.8.0 recognizes only:
         *
         * • draft
         * • published
         * • withdrawn
         *
         * A protected file attached to an unpublished resource
         * therefore remains represented as a draft containing
         * complete protected-asset and upload-audit metadata.
         */
        status:
            "draft",

        is_active:
            false,

        is_latest:
            false,

        display_order:
            normalizeDisplayOrder(
                normalizedResource.display_order
            ),

        created_by_uid:
            existingData.created_by_uid,

        created_by_email:
            existingData.created_by_email,

        created_at:
            existingData.created_at,

        updated_by_uid:
            actor.uid,

        updated_by_email:
            actor.email,

        updated_at:
            serverTimestamp(),

        uploaded_by_uid:
            existingData.uploaded_by_uid ||
            null,

        uploaded_by_email:
            existingData.uploaded_by_email ||
            null,

        uploaded_at:
            existingData.uploaded_at ||
            null,

        published_by_uid:
            null,

        published_by_email:
            null,

        published_at:
            null,

        withdrawn_by_uid:
            null,

        withdrawn_by_email:
            null,

        withdrawn_at:
            null,

        withdrawal_reason:
            "",

        source:
            existingData.source ||
            "admin_portal"

    };

}

/* ==========================================================
   PROTECTED UPLOAD NORMALIZATION
========================================================== */

function normalizeProtectedUploadResult(
    uploadResult
) {

    const storagePath =
        LearningResourceContract.normalizeStoragePath(
            uploadResult?.storagePath
        );

    const resourceId =
        LearningResourceContract.normalizeResourceId(
            uploadResult?.resourceId
        );

    const programCode =
        LearningResourceContract.normalizeProgramCode(
            uploadResult?.programCode
        );

    const version =
        normalizeVersion(
            uploadResult?.version
        );

    const fileName =
        LearningResourceContract.normalizeFileName(
            uploadResult?.fileName
        );

    const fileExtension =
        normalizeLowercase(
            uploadResult?.fileExtension
        );

    const mimeType =
        normalizeLowercase(
            uploadResult?.mimeType
        );

    const fileSize =
        normalizeFileSize(
            uploadResult?.fileSize
        );

    if (
        !storagePath ||
        !resourceId ||
        !programCode ||
        !fileName ||
        !fileExtension ||
        !mimeType ||
        fileSize <= 0
    ) {

        throw new Error(
            `[${MODULE_NAME}] Complete protected upload metadata is required.`
        );

    }

    if (
        !LearningResourceContract.isValidProtectedStoragePath(
            storagePath
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected upload Storage path is invalid.`
        );

    }

    if (
        !LearningResourceContract.isValidFileName(
            fileName
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected upload filename is invalid.`
        );

    }

    const detectedFileExtension =
        normalizeLowercase(
            LearningResourceContract.getFileExtension(
                fileName
            )
        );

    if (
        detectedFileExtension !==
        fileExtension
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected upload extension does not match its filename.`
        );

    }

    if (
        !LearningResourceContract.isApprovedMimeType(
            mimeType
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected upload MIME type is not approved.`
        );

    }

    if (
        !LearningResourceContract.isValidFileSize(
            fileSize
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected upload file size is invalid.`
        );

    }

    if (
        !LearningResourceContract.storagePathMatchesResource(
            storagePath,
            {
                programCode,
                resourceId,
                version,
                fileName
            }
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected upload path does not match its resource identity.`
        );

    }

    return Object.freeze({

        storagePath,

        resourceId,

        programCode,

        version,

        fileName,

        fileExtension,

        mimeType,

        fileSize

    });

}


/* ==========================================================
   PROTECTED ASSET VALIDATION
========================================================== */

function validateProtectedAssetData(
    documentId,
    data
) {

    validateDocumentIdentity(
        documentId,
        data
    );

    validateCreationAudit(
        data
    );

    const deliveryType =
        normalizeLowercase(
            data?.delivery_type
        );

    if (
        deliveryType !==
        "protected_storage"
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected asset validation requires protected_storage delivery.`
        );

    }

    const storageDomain =
        normalizeStorageDomain(
            data?.storage_domain,
            deliveryType
        );

    const personalisationType =
        normalizePersonalisationType(
            data?.personalisation_type,
            storageDomain
        );

    const storagePath =
        LearningResourceContract.normalizeStoragePath(
            data?.storage_path
        );

    const resourceId =
        LearningResourceContract.normalizeResourceId(
            data?.resource_id
        );

    const programCode =
        LearningResourceContract.normalizeProgramCode(
            data?.program_code
        );

    const version =
        normalizeVersion(
            data?.version
        );

    const fileName =
        LearningResourceContract.normalizeFileName(
            data?.file_name
        );

    const fileExtension =
        normalizeLowercase(
            data?.file_extension
        );

    const mimeType =
        normalizeLowercase(
            data?.mime_type
        );

    const fileSize =
        normalizeFileSize(
            data?.file_size
        );

    if (
        !storagePath ||
        !resourceId ||
        !programCode ||
        !fileName ||
        !fileExtension ||
        !mimeType ||
        fileSize <= 0
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected resource metadata is incomplete.`
        );

    }

    if (
        !LearningResourceContract.isValidProtectedStoragePath(
            storagePath
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected resource Storage path is invalid.`
        );

    }

    if (
        !LearningResourceContract.isValidFileName(
            fileName
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected resource filename is invalid.`
        );

    }

    const detectedFileExtension =
        normalizeLowercase(
            LearningResourceContract.getFileExtension(
                fileName
            )
        );

    if (
        detectedFileExtension !==
        fileExtension
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected resource extension does not match its filename.`
        );

    }

    if (
        !LearningResourceContract.isApprovedMimeType(
            mimeType
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected resource MIME type is not approved.`
        );

    }

    if (
        !LearningResourceContract.isValidFileSize(
            fileSize
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected resource file size is invalid.`
        );

    }

    if (
        !LearningResourceContract.storagePathMatchesResource(
            storagePath,
            {
                programCode,
                resourceId,
                version,
                fileName
            }
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected resource path does not match its resource identity.`
        );

    }

    validateUploadAudit(
        data
    );

    return Object.freeze({

        storagePath,

        resourceId,

        programCode,

        version,

        fileName,

        fileExtension,

        mimeType,

        fileSize,

        storageDomain,

        personalisationType

    });

}

/* ==========================================================
   PUBLICATION VALIDATION
========================================================== */

function validatePublicationData(
    documentId,
    data
) {

    validateDocumentIdentity(
        documentId,
        data
    );

    validateCreationAudit(
        data
    );

    const status =
        normalizeLowercase(
            data?.status
        );

    if (
        status !==
        "draft"
    ) {

        throw new Error(
            `[${MODULE_NAME}] Only draft resources can be published.`
        );

    }

    if (
        data?.is_active ===
            true ||
        data?.is_latest ===
            true
    ) {

        throw new Error(
            `[${MODULE_NAME}] A draft must be inactive and must not be marked latest before publication.`
        );

    }

    /*
     * Rebuild and validate the governed release metadata.
     * This confirms that module/session and availability values
     * remain compatible with the selected release policy.
     */
    buildReleaseGovernance(
        data
    );

    const deliveryGovernance =
        buildDeliveryGovernance(
            data
        );

    if (
        deliveryGovernance.protectedDelivery
    ) {

        validateProtectedAssetData(
            documentId,
            data
        );

    } else {

        const externalUrl =
            normalizeNullableString(
                data?.external_url
            );

        if (
            !externalUrl
        ) {

            throw new Error(
                `[${MODULE_NAME}] External resources require an external URL before publication.`
            );

        }

        if (
            normalizeString(
                data?.storage_path
            )
        ) {

            throw new Error(
                `[${MODULE_NAME}] External resources cannot contain a protected Storage path.`
            );

        }

        if (
            deliveryGovernance.storageDomain !==
                "external" ||
            deliveryGovernance.personalisationType !==
                "none"
        ) {

            throw new Error(
                `[${MODULE_NAME}] External resource delivery governance is invalid.`
            );

        }

    }

    const validationPayload = {

        ...data,

        status:
            "published",

        is_active:
            true,

        is_latest:
            true

    };

    const validation =
        LearningResourceContract.validateForPublication(
            validationPayload
        );

    if (
        !validation.valid
    ) {

        throw new Error(
            `[${MODULE_NAME}] Publication rejected: ` +
            validation.errors.join(
                " "
            )
        );

    }

}

/* ==========================================================
   CREATE DRAFT
========================================================== */

async function createDraft(
    input = {}
) {

    const actor =
        normalizeActor(
            await requireAuthorizedAdmin()
        );

    const normalizedResource =
        LearningResourceContract.normalizeResourceInput(
            input
        );

    /*
     * Build the governed persistence payload before validation
     * so release, Storage-domain and personalisation defaults
     * are represented exactly as they will be stored.
     */
    const draftData =
        buildDraftData(
            normalizedResource,
            actor
        );

    const validation =
        LearningResourceContract.validateDraft(
            draftData
        );

    if (
        !validation.valid
    ) {

        throw new Error(
            `[${MODULE_NAME}] Invalid draft: ` +
            validation.errors.join(
                " "
            )
        );

    }

    const documentId =
        buildCanonicalDocumentId(
            draftData.resource_id,
            draftData.version
        );

    const reference =
        buildReference(
            documentId
        );

    validateDocumentIdentity(
        documentId,
        draftData
    );

    await runTransaction(
        db,
        async (
            transaction
        ) => {

            const snapshot =
                await transaction.get(
                    reference
                );

            if (
                snapshot.exists()
            ) {

                throw new Error(
                    `[${MODULE_NAME}] Resource version already exists.`
                );

            }

            transaction.set(
                reference,
                draftData
            );

        }
    );

    console.info(
        `[${MODULE_NAME}] Draft created:`,
        {
            moduleVersion:
                MODULE_VERSION,

            documentId,

            resourceId:
                draftData.resource_id,

            programCode:
                draftData.program_code,

            version:
                draftData.version,

            releasePolicy:
                draftData.release_policy,

            storageDomain:
                draftData.storage_domain,

            personalisationType:
                draftData.personalisation_type,

            createdByUid:
                actor.uid
        }
    );

    return Object.freeze({

        documentId,

        resourceId:
            draftData.resource_id,

        programCode:
            draftData.program_code,

        version:
            draftData.version,

        status:
            "draft",

        isLatest:
            false,

        releasePolicy:
            draftData.release_policy,

        storageDomain:
            draftData.storage_domain,

        personalisationType:
            draftData.personalisation_type

    });

}

/* ==========================================================
   UPDATE DRAFT
========================================================== */

async function updateDraft(
    documentId,
    input = {}
) {

    const actor =
        normalizeActor(
            await requireAuthorizedAdmin()
        );

    const reference =
        buildReference(
            documentId
        );

    const result =
        await runTransaction(
            db,
            async (
                transaction
            ) => {

                const snapshot =
                    await transaction.get(
                        reference
                    );

                if (
                    !snapshot.exists()
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Resource not found.`
                    );

                }

                const existingData =
                    snapshot.data() ||
                    {};

                validateDocumentIdentity(
                    snapshot.id,
                    existingData
                );

                validateCreationAudit(
                    existingData
                );

                const existingStatus =
                    normalizeLowercase(
                        existingData.status
                    );

                if (
                    existingStatus !==
                    "draft"
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Only draft resources can be edited.`
                    );

                }

                const existingDeliveryType =
                    normalizeLowercase(
                        existingData.delivery_type
                    );

                const existingStoragePath =
                    normalizeNullableString(
                        existingData.storage_path
                    );

                const hasProtectedAsset =
                    existingDeliveryType ===
                        "protected_storage" &&
                    Boolean(
                        existingStoragePath
                    );

                /*
                 * Once a protected file has been attached, its
                 * delivery type, Storage domain and
                 * personalisation type become governed asset
                 * characteristics and cannot be changed through
                 * metadata editing.
                 */
                const controlledInput = {

                    ...input,

                    resource_id:
                        existingData.resource_id,

                    program_code:
                        existingData.program_code,

                    version:
                        existingData.version,

                    delivery_type:
                        hasProtectedAsset
                            ? existingDeliveryType
                            : input.delivery_type,

                    storage_domain:
                        hasProtectedAsset
                            ? existingData.storage_domain
                            : input.storage_domain,

                    personalisation_type:
                        hasProtectedAsset
                            ? existingData.personalisation_type
                            : input.personalisation_type,

                    status:
                        "draft",

                    is_active:
                        false,

                    is_latest:
                        false

                };

                const normalizedResource =
                    LearningResourceContract.normalizeResourceInput(
                        controlledInput
                    );

                if (
                    hasProtectedAsset &&
                    normalizeLowercase(
                        normalizedResource.delivery_type
                    ) !==
                        existingDeliveryType
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Protected resource delivery type is immutable after file attachment. Create a new version instead.`
                    );

                }

                if (
                    hasProtectedAsset &&
                    normalizeLowercase(
                        normalizedResource.storage_domain
                    ) !==
                        normalizeLowercase(
                            existingData.storage_domain
                        )
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Protected resource Storage domain is immutable after file attachment. Create a new version instead.`
                    );

                }

                if (
                    hasProtectedAsset &&
                    normalizeLowercase(
                        normalizedResource.personalisation_type
                    ) !==
                        normalizeLowercase(
                            existingData.personalisation_type
                        )
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Protected resource personalisation type is immutable after file attachment. Create a new version instead.`
                    );

                }

                if (
                    hasProtectedAsset
                ) {

                    validateUploadAudit(
                        existingData
                    );

                    validateProtectedAssetData(
                        snapshot.id,
                        existingData
                    );

                }

                const updatedData =
                    buildEditableDraftData(
                        normalizedResource,
                        existingData,
                        actor
                    );

                validateDocumentIdentity(
                    snapshot.id,
                    updatedData
                );

                /*
                 * The contract validates the complete persistence
                 * payload, including the release-governance fields
                 * introduced in v1.5.0.
                 */
                const validation =
                    LearningResourceContract.validateDraft(
                        updatedData
                    );

                if (
                    !validation.valid
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Invalid draft update: ` +
                        validation.errors.join(
                            " "
                        )
                    );

                }

                /*
                 * Controlled replacement is intentional.
                 *
                 * The complete authoritative field set is rebuilt
                 * while preserving:
                 *
                 * • immutable resource identity
                 * • immutable creation audit
                 * • previously attached protected asset
                 * • upload audit evidence
                 */
                transaction.set(
                    reference,
                    updatedData
                );

                return Object.freeze({

                    documentId:
                        snapshot.id,

                    resourceId:
                        updatedData.resource_id,

                    programCode:
                        updatedData.program_code,

                    version:
                        updatedData.version,

                    status:
                        "draft",

                    isLatest:
                        false,

                    hasProtectedAsset:
                        Boolean(
                            updatedData.storage_path
                        ),

                    releasePolicy:
                        updatedData.release_policy,

                    storageDomain:
                        updatedData.storage_domain,

                    personalisationType:
                        updatedData.personalisation_type

                });

            }
        );

    console.info(
        `[${MODULE_NAME}] Draft updated:`,
        {
            moduleVersion:
                MODULE_VERSION,

            documentId:
                result.documentId,

            resourceId:
                result.resourceId,

            programCode:
                result.programCode,

            version:
                result.version,

            hasProtectedAsset:
                result.hasProtectedAsset,

            releasePolicy:
                result.releasePolicy,

            updatedByUid:
                actor.uid
        }
    );

    return result;

}

/* ==========================================================
   ATTACH PROTECTED STORAGE ASSET
========================================================== */

async function attachProtectedAsset(
    documentId,
    uploadResult
) {

    const actor =
        normalizeActor(
            await requireAuthorizedAdmin()
        );

    const protectedUpload =
        normalizeProtectedUploadResult(
            uploadResult
        );

    const reference =
        buildReference(
            documentId
        );

    const result =
        await runTransaction(
            db,
            async (
                transaction
            ) => {

                const snapshot =
                    await transaction.get(
                        reference
                    );

                if (
                    !snapshot.exists()
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Draft not found.`
                    );

                }

                const existingData =
                    snapshot.data() ||
                    {};

                validateDocumentIdentity(
                    snapshot.id,
                    existingData
                );

                validateCreationAudit(
                    existingData
                );

                const existingStatus =
                    normalizeLowercase(
                        existingData.status
                    );

                if (
                    existingStatus !==
                    "draft"
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Protected assets can only be attached to draft resources.`
                    );

                }

                const existingResourceId =
                    LearningResourceContract.normalizeResourceId(
                        existingData.resource_id
                    );

                const existingProgramCode =
                    LearningResourceContract.normalizeProgramCode(
                        existingData.program_code
                    );

                const existingVersion =
                    normalizeVersion(
                        existingData.version
                    );

                if (
                    protectedUpload.resourceId !==
                        existingResourceId ||
                    protectedUpload.programCode !==
                        existingProgramCode ||
                    protectedUpload.version !==
                        existingVersion
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Upload identity does not match the draft resource.`
                    );

                }

                if (
                    normalizeString(
                        existingData.storage_path
                    )
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] This resource already has a protected asset. Create a new resource version instead of replacing it.`
                    );

                }

                const existingDeliveryType =
                    normalizeLowercase(
                        existingData.delivery_type
                    );

                if (
                    existingDeliveryType &&
                    existingDeliveryType !==
                        "protected_storage"
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] External-delivery resources cannot receive a protected asset. Change the draft delivery type before upload.`
                    );

                }

                const storageDomain =
                    normalizeStorageDomain(
                        existingData.storage_domain,
                        "protected_storage"
                    );

                const personalisationType =
                    normalizePersonalisationType(
                        existingData.personalisation_type,
                        storageDomain
                    );

                const timestamp =
                    serverTimestamp();

                const attachmentData = {

                    delivery_type:
                        "protected_storage",

                    storage_domain:
                        storageDomain,

                    personalisation_type:
                        personalisationType,

                    storage_path:
                        protectedUpload.storagePath,

                    external_url:
                        null,

                    file_name:
                        protectedUpload.fileName,

                    file_extension:
                        protectedUpload.fileExtension,

                    mime_type:
                        protectedUpload.mimeType,

                    file_size:
                        protectedUpload.fileSize,

                    /*
                     * File attachment is upload readiness,
                     * not a separate Firestore lifecycle state.
                     *
                     * The resource remains draft until the
                     * governed publication transaction succeeds.
                     */
                    status:
                        "draft",

                    is_active:
                        false,

                    is_latest:
                        false,

                    uploaded_by_uid:
                        actor.uid,

                    uploaded_by_email:
                        actor.email,

                    uploaded_at:
                        timestamp,

                    updated_by_uid:
                        actor.uid,

                    updated_by_email:
                        actor.email,

                    updated_at:
                        timestamp
                };

                const validationCandidate = {

                    ...existingData,

                    ...attachmentData

                };

                validateDocumentIdentity(
                    snapshot.id,
                    validationCandidate
                );

                validateProtectedAssetData(
                    snapshot.id,
                    validationCandidate
                );

                const validation =
                    LearningResourceContract.validateDraft(
                        validationCandidate
                    );

                if (
                    !validation.valid
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Protected asset attachment rejected: ` +
                        validation.errors.join(
                            " "
                        )
                    );

                }

                transaction.update(
                    reference,
                    attachmentData
                );

                return Object.freeze({

                    documentId:
                        snapshot.id,

                    resourceId:
                        protectedUpload.resourceId,

                    programCode:
                        protectedUpload.programCode,

                    version:
                        protectedUpload.version,

                    storagePath:
                        protectedUpload.storagePath,

                    storageDomain,

                    personalisationType,

                    fileName:
                        protectedUpload.fileName,

                    mimeType:
                        protectedUpload.mimeType,

                    fileSize:
                        protectedUpload.fileSize,

                    status:
                        "draft",

                    isLatest:
                        false,

                    hasProtectedAsset:
                        true

                });

            }
        );

    console.info(
        `[${MODULE_NAME}] Protected asset attached:`,
        {
            moduleVersion:
                MODULE_VERSION,

            documentId:
                result.documentId,

            resourceId:
                result.resourceId,

            programCode:
                result.programCode,

            version:
                result.version,

            storageDomain:
                result.storageDomain,

            personalisationType:
                result.personalisationType,

            uploadedByUid:
                actor.uid
        }
    );

    return result;

}


/* ==========================================================
   PUBLISH RESOURCE
========================================================== */

async function publishResource(
    documentId
) {

    const actor =
        normalizeActor(
            await requireAuthorizedAdmin()
        );

    const reference =
        buildReference(
            documentId
        );

    /*
     * Preliminary read resolves the immutable resource identity
     * needed to find all existing versions.
     *
     * Publication eligibility is checked again inside the
     * transaction before any mutation is committed.
     */
    const preliminarySnapshot =
        await getDoc(
            reference
        );

    if (
        !preliminarySnapshot.exists()
    ) {

        throw new Error(
            `[${MODULE_NAME}] Draft not found.`
        );

    }

    const preliminaryData =
        preliminarySnapshot.data() ||
        {};

    validatePublicationData(
        preliminarySnapshot.id,
        preliminaryData
    );

    const resourceId =
        LearningResourceContract.normalizeResourceId(
            preliminaryData.resource_id
        );

    const versionsSnapshot =
        await getDocs(
            query(
                collection(
                    db,
                    COLLECTION_NAME
                ),
                where(
                    "resource_id",
                    "==",
                    resourceId
                )
            )
        );

    const versionReferences =
        versionsSnapshot.docs.map(
            (
                versionSnapshot
            ) => versionSnapshot.ref
        );

    const result =
        await runTransaction(
            db,
            async (
                transaction
            ) => {

                /*
                 * Complete all transaction reads before writes.
                 */
                const targetSnapshot =
                    await transaction.get(
                        reference
                    );

                if (
                    !targetSnapshot.exists()
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Draft not found during publication.`
                    );

                }

                const targetData =
                    targetSnapshot.data() ||
                    {};

                validatePublicationData(
                    targetSnapshot.id,
                    targetData
                );

                const currentResourceId =
                    LearningResourceContract.normalizeResourceId(
                        targetData.resource_id
                    );

                if (
                    currentResourceId !==
                    resourceId
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Resource identity changed during publication.`
                    );

                }

                const otherReferences =
                    versionReferences.filter(
                        (
                            versionReference
                        ) => (
                            versionReference.path !==
                            reference.path
                        )
                    );

                const otherSnapshots =
                    await Promise.all(
                        otherReferences.map(
                            (
                                versionReference
                            ) => transaction.get(
                                versionReference
                            )
                        )
                    );

                const timestamp =
                    serverTimestamp();

                /*
                 * Supersede only the existing latest published
                 * version of the same logical resource.
                 *
                 * Historical versions remain published and
                 * immutable, but are no longer marked latest.
                 */
                otherSnapshots.forEach(
                    (
                        versionSnapshot
                    ) => {

                        if (
                            !versionSnapshot.exists()
                        ) {

                            return;

                        }

                        const previousData =
                            versionSnapshot.data() ||
                            {};

                        validateDocumentIdentity(
                            versionSnapshot.id,
                            previousData
                        );

                        const previousResourceId =
                            LearningResourceContract.normalizeResourceId(
                                previousData.resource_id
                            );

                        const previousStatus =
                            normalizeLowercase(
                                previousData.status
                            );

                        if (
                            previousResourceId ===
                                resourceId &&
                            previousStatus ===
                                "published" &&
                            previousData.is_latest ===
                                true
                        ) {

                            transaction.update(
                                versionSnapshot.ref,
                                {
                                    is_latest:
                                        false,

                                    updated_by_uid:
                                        actor.uid,

                                    updated_by_email:
                                        actor.email,

                                    updated_at:
                                        timestamp
                                }
                            );

                        }

                    }
                );

                transaction.update(
                    reference,
                    {
                        status:
                            "published",

                        is_active:
                            true,

                        is_latest:
                            true,

                        published_by_uid:
                            actor.uid,

                        published_by_email:
                            actor.email,

                        published_at:
                            timestamp,

                        withdrawn_by_uid:
                            null,

                        withdrawn_by_email:
                            null,

                        withdrawn_at:
                            null,

                        withdrawal_reason:
                            "",

                        updated_by_uid:
                            actor.uid,

                        updated_by_email:
                            actor.email,

                        updated_at:
                            timestamp
                    }
                );

                return Object.freeze({

                    documentId:
                        targetSnapshot.id,

                    resourceId:
                        targetData.resource_id,

                    programCode:
                        targetData.program_code,

                    version:
                        targetData.version,

                    status:
                        "published",

                    isActive:
                        true,

                    isLatest:
                        true,

                    releasePolicy:
                        targetData.release_policy,

                    storageDomain:
                        targetData.storage_domain,

                    personalisationType:
                        targetData.personalisation_type,

                    hasProtectedAsset:
                        Boolean(
                            normalizeString(
                                targetData.storage_path
                            )
                        )

                });

            }
        );

    console.info(
        `[${MODULE_NAME}] Resource published:`,
        {
            moduleVersion:
                MODULE_VERSION,

            documentId:
                result.documentId,

            resourceId:
                result.resourceId,

            programCode:
                result.programCode,

            version:
                result.version,

            releasePolicy:
                result.releasePolicy,

            storageDomain:
                result.storageDomain,

            personalisationType:
                result.personalisationType,

            publishedByUid:
                actor.uid
        }
    );

    return result;

}

/* ==========================================================
   WITHDRAW RESOURCE
========================================================== */

async function withdrawResource(
    documentId,
    reason
) {

    const actor =
        normalizeActor(
            await requireAuthorizedAdmin()
        );

    const normalizedReason =
        normalizeString(
            reason
        );

    if (
        !normalizedReason
    ) {

        throw new Error(
            `[${MODULE_NAME}] Withdrawal reason is required.`
        );

    }

    if (
        normalizedReason.length >
        1000
    ) {

        throw new Error(
            `[${MODULE_NAME}] Withdrawal reason must not exceed 1,000 characters.`
        );

    }

    const reference =
        buildReference(
            documentId
        );

    const result =
        await runTransaction(
            db,
            async (
                transaction
            ) => {

                const snapshot =
                    await transaction.get(
                        reference
                    );

                if (
                    !snapshot.exists()
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Published resource not found.`
                    );

                }

                const existingData =
                    snapshot.data() ||
                    {};

                validateDocumentIdentity(
                    snapshot.id,
                    existingData
                );

                validateCreationAudit(
                    existingData
                );

                const existingStatus =
                    normalizeLowercase(
                        existingData.status
                    );

                if (
                    existingStatus !==
                    "published"
                ) {

                    throw new Error(
                        `[${MODULE_NAME}] Only published resources can be withdrawn.`
                    );

                }

                const timestamp =
                    serverTimestamp();

                transaction.update(
                    reference,
                    {
                        status:
                            "withdrawn",

                        is_active:
                            false,

                        is_latest:
                            false,

                        withdrawn_by_uid:
                            actor.uid,

                        withdrawn_by_email:
                            actor.email,

                        withdrawn_at:
                            timestamp,

                        withdrawal_reason:
                            normalizedReason,

                        updated_by_uid:
                            actor.uid,

                        updated_by_email:
                            actor.email,

                        updated_at:
                            timestamp
                    }
                );

                return Object.freeze({

                    documentId:
                        snapshot.id,

                    resourceId:
                        existingData.resource_id,

                    programCode:
                        existingData.program_code,

                    version:
                        existingData.version,

                    status:
                        "withdrawn",

                    isActive:
                        false,

                    isLatest:
                        false,

                    releasePolicy:
                        existingData.release_policy,

                    storageDomain:
                        existingData.storage_domain,

                    personalisationType:
                        existingData.personalisation_type,

                    withdrawalReason:
                        normalizedReason

                });

            }
        );

    console.info(
        `[${MODULE_NAME}] Resource withdrawn:`,
        {
            moduleVersion:
                MODULE_VERSION,

            documentId:
                result.documentId,

            resourceId:
                result.resourceId,

            programCode:
                result.programCode,

            version:
                result.version,

            withdrawalReason:
                result.withdrawalReason,

            withdrawnByUid:
                actor.uid
        }
    );

    return result;

}


/* ==========================================================
   PUBLIC API
========================================================== */

const LearningResourcePublisher =
    Object.freeze({

        moduleName:
            MODULE_NAME,

        version:
            MODULE_VERSION,

        collectionName:
            COLLECTION_NAME,

        createDraft,

        updateDraft,

        attachProtectedAsset,

        publishResource,

        withdrawResource

    });


/* ==========================================================
   WINDOW BINDING
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.LearningResourcePublisher =
        LearningResourcePublisher;

}


/* ==========================================================
   MODULE INITIALIZATION
========================================================== */

console.info(
    `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`,
    {
        collectionName:
            COLLECTION_NAME,

        lifecycleStates:
            [
                "draft",
                "published",
                "withdrawn"
            ],

        uploadedLifecycleRemoved:
            true,

        releaseGovernanceEnabled:
            true,

        storageGovernanceEnabled:
            true,

        personalisationGovernanceEnabled:
            true
    }
);


/* ==========================================================
   EXPORTS
========================================================== */

export {

    LearningResourcePublisher,

    createDraft,

    updateDraft,

    attachProtectedAsset,

    publishResource,

    withdrawResource

};