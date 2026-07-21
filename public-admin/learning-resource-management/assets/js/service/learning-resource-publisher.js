/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-publisher.js
   Version   : 1.4.0
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
   • Render UI
   • Deliver resources to the Student Portal

   Governance
   ----------------------------------------------------------
   • Admin Portal is the publication authority
   • New resources always begin as drafts
   • Drafts are inactive and never latest
   • Published resource assets are immutable
   • Replacement requires a new resource version
   • Only one published version should remain latest
   • Withdrawal is terminal
   • Physical deletion is prohibited
   • Learner identity must not be stored
   • Audit identity must match the authenticated administrator

   Change History
   ----------------------------------------------------------

   v1.4.0
   • Added governed uploaded lifecycle state
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
   • Aligned with Contract v1.2.0 and Firestore Rules v2.5.1

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
    "1.4.0";

const COLLECTION_NAME =
    "learning_resources";


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


/* ==========================================================
   DRAFT DATA
========================================================== */

function buildDraftData(
    normalizedResource,
    actor
) {

    const timestamp =
        serverTimestamp();

    const protectedDelivery =
        normalizedResource.delivery_type ===
        "protected_storage";

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
            normalizedResource.delivery_type,

        storage_path:
            protectedDelivery
                ? normalizeNullableString(
                    normalizedResource.storage_path
                )
                : null,

        external_url:
            protectedDelivery
                ? null
                : normalizeNullableString(
                    normalizedResource.external_url
                ),

        file_name:
            protectedDelivery
                ? normalizeNullableString(
                    normalizedResource.file_name
                )
                : null,

        file_extension:
            protectedDelivery
                ? normalizeNullableString(
                    normalizedResource.file_extension
                )
                : null,

        mime_type:
            protectedDelivery
                ? normalizeNullableString(
                    normalizedResource.mime_type
                )
                : null,

        file_size:
            protectedDelivery
                ? normalizeFileSize(
                    normalizedResource.file_size
                )
                : 0,

        preview_allowed:
            normalizedResource.preview_allowed ===
            true,

        download_allowed:
            normalizedResource.download_allowed ===
            true,

        embed_allowed:
            normalizedResource.embed_allowed ===
            true,

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
            normalizedResource.display_order,

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

    const protectedDelivery =
        normalizedResource.delivery_type ===
        "protected_storage";

    const protectedAsset = {

        storagePath:
            protectedDelivery
                ? normalizeNullableString(
                    existingData.storage_path
                )
                : null,

        fileName:
            protectedDelivery
                ? normalizeNullableString(
                    existingData.file_name
                )
                : null,

        fileExtension:
            protectedDelivery
                ? normalizeNullableString(
                    existingData.file_extension
                )
                : null,

        mimeType:
            protectedDelivery
                ? normalizeNullableString(
                    existingData.mime_type
                )
                : null,

        fileSize:
            protectedDelivery
                ? normalizeFileSize(
                    existingData.file_size
                )
                : 0

    };

    const currentStatus =
        normalizeLowercase(
            existingData.status
        );

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
            normalizedResource.delivery_type,

        storage_path:
            protectedAsset.storagePath,

        external_url:
            protectedDelivery
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

        /*
         * Preserve the governed lifecycle.
         *
         * draft     -> draft
         * uploaded  -> uploaded
         */
        status:
            currentStatus,

        is_active:
            false,

        is_latest:
            false,

        display_order:
            normalizedResource.display_order,

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
   PROTECTED ASSET VALIDATION
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

    if (
        LearningResourceContract.getFileExtension(
            fileName
        ) !==
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

    const publishableStatuses =
        [
            "draft",
            "uploaded"
        ];

    if (
        !publishableStatuses.includes(
            status
        )
    ) {

        throw new Error(
            `[${MODULE_NAME}] Only draft or uploaded resources can be published.`
        );

    }

    if (
        data.delivery_type ===
            "protected_storage" &&
        status !==
            "uploaded"
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected Storage resources must be uploaded before publication.`
        );

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

    const validation =
        LearningResourceContract.validateDraft(
            normalizedResource
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
            normalizedResource.resource_id,
            normalizedResource.version
        );

    const reference =
        buildReference(
            documentId
        );

    const data =
        buildDraftData(
            normalizedResource,
            actor
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
                data
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
                normalizedResource.resource_id,

            programCode:
                normalizedResource.program_code,

            version:
                normalizedResource.version,

            createdByUid:
                actor.uid
        }
    );

    return Object.freeze({

        documentId,

        resourceId:
            normalizedResource.resource_id,

        programCode:
            normalizedResource.program_code,

        version:
            normalizedResource.version,

        status:
            "draft",

        isLatest:
            false

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

    return runTransaction(
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

            const editableStatuses =
                [
                    "draft",
                    "uploaded"
                ];

            if (
                !editableStatuses.includes(
                    existingStatus
                )
            ) {

                throw new Error(
                    `[${MODULE_NAME}] Only draft or uploaded resources can be edited.`
                );

            }

            const existingDeliveryType =
                normalizeLowercase(
                    existingData.delivery_type
                );

            const normalizedResource =
                LearningResourceContract.normalizeResourceInput({

                    ...input,

                    resource_id:
                        existingData.resource_id,

                    program_code:
                        existingData.program_code,

                    version:
                        existingData.version,

                    /*
                     * Once a protected asset has been uploaded,
                     * its governed delivery type is immutable.
                     */
                    delivery_type:
                        existingStatus ===
                        "uploaded"
                            ? existingDeliveryType
                            : input.delivery_type,

                    status:
                        existingStatus,

                    is_active:
                        false,

                    is_latest:
                        false

                });

            if (
                existingStatus ===
                    "uploaded" &&
                normalizeLowercase(
                    normalizedResource.delivery_type
                ) !==
                    existingDeliveryType
            ) {

                throw new Error(
                    `[${MODULE_NAME}] Uploaded resource delivery type is immutable. Create a new version instead.`
                );

            }

            if (
                existingStatus ===
                    "uploaded" &&
                existingDeliveryType ===
                    "protected_storage" &&
                (
                    !normalizeString(
                        existingData.storage_path
                    ) ||
                    !normalizeString(
                        existingData.file_name
                    ) ||
                    !normalizeString(
                        existingData.file_extension
                    ) ||
                    !normalizeString(
                        existingData.mime_type
                    ) ||
                    normalizeFileSize(
                        existingData.file_size
                    ) <=
                        0 ||
                    !normalizeString(
                        existingData.uploaded_by_uid
                    ) ||
                    !normalizeString(
                        existingData.uploaded_by_email
                    ) ||
                    !existingData.uploaded_at
                )
            ) {

                throw new Error(
                    `[${MODULE_NAME}] Uploaded protected resource metadata is incomplete and cannot be edited.`
                );

            }

            /*
             * Draft validation is used for pre-publication
             * metadata editing. Uploaded resources are validated
             * through a temporary draft-compatible structure so
             * their persisted lifecycle remains uploaded.
             */
            const validationPayload = {

                ...normalizedResource,

                status:
                    "draft",

                is_active:
                    false,

                is_latest:
                    false

            };

            const validation =
                LearningResourceContract.validateDraft(
                    validationPayload
                );

            if (
                !validation.valid
            ) {

                throw new Error(
                    `[${MODULE_NAME}] Invalid pre-publication resource: ` +
                    validation.errors.join(
                        " "
                    )
                );

            }

            const updatedData =
                buildEditableDraftData(
                    normalizedResource,
                    existingData,
                    actor
                );

            /*
             * Preserve the governed pre-publication lifecycle:
             *
             * • draft remains draft
             * • uploaded remains uploaded
             */
            updatedData.status =
                existingStatus;

            updatedData.is_active =
                false;

            updatedData.is_latest =
                false;

            /*
             * Controlled replacement is intentional.
             * The authoritative field set is reconstructed while
             * immutable identity, protected asset and audit
             * metadata are preserved.
             */
            transaction.set(
                reference,
                updatedData
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
                    existingStatus,

                hasProtectedAsset:
                    Boolean(
                        updatedData.storage_path
                    )

            });

        }
    );

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

    return runTransaction(
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

            if (
                existingData.status !==
                "draft"
            ) {

                throw new Error(
                    `[${MODULE_NAME}] Assets can only be attached to draft resources.`
                );

            }

            if (
                protectedUpload.resourceId !==
                    LearningResourceContract.normalizeResourceId(
                        existingData.resource_id
                    ) ||
                protectedUpload.programCode !==
                    LearningResourceContract.normalizeProgramCode(
                        existingData.program_code
                    ) ||
                protectedUpload.version !==
                    normalizeVersion(
                        existingData.version
                    )
            ) {

                throw new Error(
                    `[${MODULE_NAME}] Upload identity does not match the draft.`
                );

            }

            if (
                existingData.storage_path
            ) {

                throw new Error(
                    `[${MODULE_NAME}] This resource already has a protected asset. Create a new version instead of replacing it.`
                );

            }

            const timestamp =
                serverTimestamp();

            transaction.update(
                reference,
                {
                    delivery_type:
                        "protected_storage",

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

                    status:
                        "uploaded",

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
                }
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

                fileName:
                    protectedUpload.fileName,

                mimeType:
                    protectedUpload.mimeType,

                fileSize:
                    protectedUpload.fileSize,

                status:
                    "uploaded"

            });

        }
    );

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
     * The preliminary read resolves the immutable logical
     * resource identity used to locate existing versions.
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
                 * Transaction reads must complete before writes.
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

                        if (
                            LearningResourceContract.normalizeResourceId(
                                previousData.resource_id
                            ) ===
                                resourceId &&
                            previousData.status ===
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

                    isLatest:
                        true

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

    return runTransaction(
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

            if (
                existingData.status !==
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

                isLatest:
                    false

            });

        }
    );

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


window.LearningResourcePublisher =
    LearningResourcePublisher;


console.info(
    `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
);


export {

    LearningResourcePublisher,

    createDraft,

    updateDraft,

    attachProtectedAsset,

    publishResource,

    withdrawResource

};