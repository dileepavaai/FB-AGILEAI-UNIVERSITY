/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-publisher.js
   Version   : 1.1.0
   Status    : ACTIVE
   Authority : Admin Portal

   Purpose
   ----------------------------------------------------------
   Manages the governed Firestore lifecycle of programme
   learning-resource metadata.

   Responsibilities
   ----------------------------------------------------------
   • Create learning-resource drafts
   • Update existing drafts
   • Preserve attached protected assets during metadata edits
   • Attach protected Storage metadata
   • Publish validated resources
   • Mark previous published versions as non-latest
   • Withdraw published resources
   • Preserve immutable identity and audit metadata
   • Prevent metadata deletion

   Non-Responsibilities
   ----------------------------------------------------------
   • Upload files
   • Generate permanent download URLs
   • Delete files
   • Delete Firestore records
   • Authenticate learners
   • Resolve learner entitlement
   • Render UI
   • Provide Student Portal delivery

   Governance
   ----------------------------------------------------------
   • Admin Portal is the publication authority
   • New resources always begin as drafts
   • Drafts are never marked as latest published versions
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
    "1.1.0";

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

    if (
        !uid
    ) {

        throw new Error(
            `[${MODULE_NAME}] Authorized administrator identity is missing.`
        );

    }

    return Object.freeze({

        uid,

        email:
            normalizeNullableString(
                actor?.email
            )

    });

}


/* ==========================================================
   DOCUMENT REFERENCE
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

        /*
         * A draft is not the latest published version.
         * This becomes true only during publication.
         */
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


/* ==========================================================
   EDITABLE DRAFT DATA
========================================================== */

function buildEditableDraftData(
    normalizedResource,
    existingData
) {

    const protectedDelivery =
        normalizedResource.delivery_type ===
        "protected_storage";

    /*
     * The Admin form does not submit protected-file metadata.
     * Therefore, an ordinary metadata edit must preserve the
     * asset already attached to the draft.
     *
     * Switching to an external delivery type deliberately clears
     * protected Storage metadata.
     */
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

    return {

        /*
         * Immutable logical identity.
         */
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

        status:
            "draft",

        is_active:
            false,

        is_latest:
            false,

        display_order:
            normalizedResource.display_order,

        /*
         * Preserve original creation audit identity.
         */
        created_by_uid:
            existingData.created_by_uid ||
            null,

        created_by_email:
            existingData.created_by_email ||
            null,

        created_at:
            existingData.created_at ||
            serverTimestamp(),

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
            existingData.source ||
            "admin_portal"

    };

}


/* ==========================================================
   PUBLICATION VALIDATION
========================================================== */

function validatePublicationData(
    data
) {

    if (
        data.status !==
        "draft"
    ) {

        throw new Error(
            `[${MODULE_NAME}] Only draft resources can be published.`
        );

    }

    const validation =
        LearningResourceContract.validateForPublication(
            data
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

            /*
             * Full controlled replacement is intentional:
             * immutable identity and audit fields are explicitly
             * preserved by buildEditableDraftData().
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
                    "draft",

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

    await requireAuthorizedAdmin();

    const storagePath =
        normalizeString(
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

    if (
        !storagePath ||
        !resourceId ||
        !programCode
    ) {

        throw new Error(
            `[${MODULE_NAME}] Complete protected upload metadata is required.`
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
                resourceId !==
                    LearningResourceContract.normalizeResourceId(
                        existingData.resource_id
                    ) ||
                programCode !==
                    LearningResourceContract.normalizeProgramCode(
                        existingData.program_code
                    ) ||
                version !==
                    normalizeVersion(
                        existingData.version
                    )
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
                        storagePath,

                    external_url:
                        null,

                    file_name:
                        normalizeNullableString(
                            uploadResult.fileName
                        ),

                    file_extension:
                        normalizeNullableString(
                            uploadResult.fileExtension
                        ),

                    mime_type:
                        normalizeNullableString(
                            uploadResult.mimeType
                        ),

                    file_size:
                        normalizeFileSize(
                            uploadResult.fileSize
                        ),

                    is_active:
                        false,

                    is_latest:
                        false,

                    updated_at:
                        serverTimestamp()
                }
            );

            return Object.freeze({

                documentId:
                    snapshot.id,

                resourceId,

                programCode,

                version,

                storagePath,

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
        normalizeActor(
            await requireAuthorizedAdmin()
        );

    const reference =
        buildReference(
            documentId
        );

    /*
     * Preliminary read is required to resolve the logical
     * resource ID used by the version-history query.
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
        preliminaryData
    );

    const resourceId =
        LearningResourceContract.normalizeResourceId(
            preliminaryData.resource_id
        );

    if (
        !resourceId
    ) {

        throw new Error(
            `[${MODULE_NAME}] Resource identity is invalid.`
        );

    }

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
        versionsSnapshot.docs
            .map(
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
                 * All reads are completed before transaction writes.
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

                        if (
                            previousData.resource_id ===
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

                                    updated_at:
                                        serverTimestamp()
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

                    is_latest:
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