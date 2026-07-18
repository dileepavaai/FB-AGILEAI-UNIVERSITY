/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-publisher.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Governed Learning Resource Publication

   Purpose
   ----------------------------------------------------------
   Manages the governed Firestore lifecycle of programme
   learning-resource metadata.

   Responsibilities
   ----------------------------------------------------------
   ✓ Create learning-resource drafts
   ✓ Update existing drafts
   ✓ Attach protected Storage metadata
   ✓ Publish validated resources
   ✓ Mark previous published versions as non-latest
   ✓ Withdraw published resources
   ✓ Preserve immutable identity and audit metadata
   ✓ Prevent metadata deletion

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Upload files
   ✗ Generate permanent download URLs
   ✗ Delete files
   ✗ Delete Firestore records
   ✗ Authenticate learners
   ✗ Resolve learner entitlement
   ✗ Render UI
   ✗ Provide Student Portal delivery

   Governance
   ----------------------------------------------------------
   • Admin Portal is the publication authority
   • New resources always begin as drafts
   • Published resource assets are immutable
   • Replacement requires a new version
   • Only one published version should remain latest
   • Withdrawal is terminal
   • Physical deletion is prohibited
   • Learner identity must not be stored

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
    where,
    writeBatch
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
    "1.0.0";

const COLLECTION_NAME =
    "learning_resources";


/* ==========================================================
   HELPERS
========================================================== */

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


function buildReference(
    documentId
) {

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

    return doc(
        db,
        COLLECTION_NAME,
        normalizedDocumentId
    );

}


function buildDraftData(
    normalizedResource,
    actor
) {

    const timestamp =
        serverTimestamp();

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
            normalizedResource.storage_path,

        external_url:
            normalizedResource.external_url,

        file_name:
            normalizedResource.file_name,

        file_extension:
            normalizedResource.file_extension,

        mime_type:
            normalizedResource.mime_type,

        file_size:
            normalizeFileSize(
                normalizedResource.file_size
            ),

        preview_allowed:
            normalizedResource.preview_allowed,

        download_allowed:
            normalizedResource.download_allowed,

        embed_allowed:
            normalizedResource.embed_allowed,

        status:
            "draft",

        is_active:
            false,

        is_latest:
            true,

        version:
            normalizedResource.version,

        display_order:
            normalizedResource.display_order,

        created_by_uid:
            actor.uid,

        created_by_email:
            actor.email,

        created_at:
            timestamp,

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

        updated_at:
            timestamp,

        source:
            "admin_portal"

    };

}


function buildEditableDraftData(
    normalizedResource,
    existingData
) {

    return {

        resource_id:
            existingData.resource_id,

        program_code:
            existingData.program_code,

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
            normalizedResource.storage_path,

        external_url:
            normalizedResource.external_url,

        file_name:
            normalizedResource.file_name,

        file_extension:
            normalizedResource.file_extension,

        mime_type:
            normalizedResource.mime_type,

        file_size:
            normalizeFileSize(
                normalizedResource.file_size
            ),

        preview_allowed:
            normalizedResource.preview_allowed,

        download_allowed:
            normalizedResource.download_allowed,

        embed_allowed:
            normalizedResource.embed_allowed,

        status:
            "draft",

        is_active:
            false,

        is_latest:
            true,

        version:
            existingData.version,

        display_order:
            normalizedResource.display_order,

        created_by_uid:
            existingData.created_by_uid,

        created_by_email:
            existingData.created_by_email,

        created_at:
            existingData.created_at,

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

        updated_at:
            serverTimestamp(),

        source:
            existingData.source

    };

}


/* ==========================================================
   CREATE DRAFT
========================================================== */

async function createDraft(
    input = {}
) {

    const actor =
        await requireAuthorizedAdmin();

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
        LearningResourceContract.buildDocumentId(
            normalizedResource.resource_id,
            normalizedResource.version
        );

    if (
        !documentId
    ) {

        throw new Error(
            `[${MODULE_NAME}] Unable to build resource document ID.`
        );

    }

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
            "draft"
    });

}


/* ==========================================================
   UPDATE DRAFT
========================================================== */

async function updateDraft(
    documentId,
    input = {}
) {

    await requireAuthorizedAdmin();

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

            if (
                existingData.status !==
                "draft"
            ) {

                throw new Error(
                    `[${MODULE_NAME}] Only draft resources can be edited.`
                );

            }

            const normalizedResource =
                LearningResourceContract.normalizeResourceInput({

                    ...input,

                    resource_id:
                        existingData.resource_id,

                    program_code:
                        existingData.program_code,

                    version:
                        existingData.version

                });

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

            const updatedData =
                buildEditableDraftData(
                    normalizedResource,
                    existingData
                );

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
                    "draft"
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

    await requireAuthorizedAdmin();

    if (
        !uploadResult ||
        !uploadResult.storagePath
    ) {

        throw new Error(
            `[${MODULE_NAME}] Protected upload metadata is required.`
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
                    `[${MODULE_NAME}] Draft not found.`
                );

            }

            const existingData =
                snapshot.data() ||
                {};

            if (
                existingData.status !==
                "draft"
            ) {

                throw new Error(
                    `[${MODULE_NAME}] Assets can only be attached to drafts.`
                );

            }

            if (
                uploadResult.resourceId !==
                    existingData.resource_id ||
                uploadResult.programCode !==
                    existingData.program_code ||
                uploadResult.version !==
                    existingData.version
            ) {

                throw new Error(
                    `[${MODULE_NAME}] Upload identity does not match the draft.`
                );

            }

            transaction.update(
                reference,
                {
                    delivery_type:
                        "protected_storage",

                    storage_path:
                        uploadResult.storagePath,

                    external_url:
                        null,

                    file_name:
                        uploadResult.fileName,

                    file_extension:
                        uploadResult.fileExtension,

                    mime_type:
                        uploadResult.mimeType,

                    file_size:
                        normalizeFileSize(
                            uploadResult.fileSize
                        ),

                    updated_at:
                        serverTimestamp()
                }
            );

            return Object.freeze({
                documentId:
                    snapshot.id,
                storagePath:
                    uploadResult.storagePath,
                status:
                    "draft"
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
        await requireAuthorizedAdmin();

    const reference =
        buildReference(
            documentId
        );

    const snapshot =
        await getDoc(
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

    if (
        existingData.status !==
        "draft"
    ) {

        throw new Error(
            `[${MODULE_NAME}] Only draft resources can be published.`
        );

    }

    const publicationValidation =
        LearningResourceContract.validateForPublication(
            existingData
        );

    if (
        !publicationValidation.valid
    ) {

        throw new Error(
            `[${MODULE_NAME}] Publication rejected: ` +
            publicationValidation.errors.join(
                " "
            )
        );

    }

    /*
     * Resolve previously published versions of the same
     * logical resource. Only currently published/latest
     * records are superseded.
     */
    const previousVersionsQuery =
        query(
            collection(
                db,
                COLLECTION_NAME
            ),
            where(
                "resource_id",
                "==",
                existingData.resource_id
            )
        );

    const previousVersionsSnapshot =
        await getDocs(
            previousVersionsQuery
        );

    const batch =
        writeBatch(
            db
        );

    previousVersionsSnapshot.forEach(
        (
            previousSnapshot
        ) => {

            if (
                previousSnapshot.id ===
                    documentId
            ) {

                return;

            }

            const previousData =
                previousSnapshot.data() ||
                {};

            if (
                previousData.status ===
                    "published" &&
                previousData.is_latest ===
                    true
            ) {

                batch.update(
                    previousSnapshot.ref,
                    {
                        is_latest:
                            false,

                        updated_at:
                            serverTimestamp()
                    }
                );

            }

        }
    );

    batch.update(
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
                serverTimestamp(),

            withdrawn_by_uid:
                null,

            withdrawn_by_email:
                null,

            withdrawn_at:
                null,

            withdrawal_reason:
                "",

            updated_at:
                serverTimestamp()
        }
    );

    await batch.commit();

    console.info(
        `[${MODULE_NAME}] Resource published:`,
        {
            moduleVersion:
                MODULE_VERSION,

            documentId,

            resourceId:
                existingData.resource_id,

            programCode:
                existingData.program_code,

            version:
                existingData.version,

            publishedByUid:
                actor.uid
        }
    );

    return Object.freeze({
        documentId,
        resourceId:
            existingData.resource_id,
        programCode:
            existingData.program_code,
        version:
            existingData.version,
        status:
            "published",
        isLatest:
            true
    });

}


/* ==========================================================
   WITHDRAW RESOURCE
========================================================== */

async function withdrawResource(
    documentId,
    reason
) {

    const actor =
        await requireAuthorizedAdmin();

    const normalizedReason =
        LearningResourceContract.normalizeString(
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
        normalizedReason.length > 1000
    ) {

        throw new Error(
            `[${MODULE_NAME}] Withdrawal reason must not exceed ` +
            `1,000 characters.`
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

            if (
                existingData.status !==
                "published"
            ) {

                throw new Error(
                    `[${MODULE_NAME}] Only published resources can be withdrawn.`
                );

            }

            transaction.update(
                reference,
                {
                    status:
                        "withdrawn",

                    is_active:
                        false,

                    withdrawn_by_uid:
                        actor.uid,

                    withdrawn_by_email:
                        actor.email,

                    withdrawn_at:
                        serverTimestamp(),

                    withdrawal_reason:
                        normalizedReason,

                    updated_at:
                        serverTimestamp()
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
                    "withdrawn"
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