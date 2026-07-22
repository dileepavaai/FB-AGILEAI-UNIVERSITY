/* ==========================================================
   Agile AI University
   Learner Resource Access Service

   File       : learner-resource-access-service.js
   Version    : 1.1.0
   Status     : ACTIVE
   Authority  : Admin Portal

   Purpose
   ----------------------------------------------------------
   Manages the governed relationship between a learner and a
   published learning resource.

   Responsibilities
   ----------------------------------------------------------
   • Require an authorized administrator
   • Create pending learner-resource access assignments
   • Create active learner-resource access assignments
   • Validate learner and resource identity
   • Prevent duplicate learner-resource assignments
   • Generate opaque and stable access document identities
   • Read access records by canonical access ID
   • List access records by learner UID
   • List pending access records by normalized learner email
   • List access records by credential ID
   • Preserve immutable assignment identity
   • Write complete creation and grant audit metadata

   Non-Responsibilities
   ----------------------------------------------------------
   • Upload protected files
   • Publish learning resources
   • Resolve learner-facing download URLs
   • Render HTML
   • Evaluate learner release eligibility
   • Bind learner_uid during first-login activation
   • Allow Student Portal mutations
   • Delete access records

   Governance
   ----------------------------------------------------------
   • learner_resource_access is the relationship authority
   • learning_resources remains the resource-catalog authority
   • learner_uid is canonical after first authentication
   • Before first login, verified email + credential ID may be
     used for existing alumni
   • Credential ID is a supporting business identifier
   • Pending assignments must not contain learner_uid
   • Active assignments must contain learner_uid
   • Access document IDs are opaque and stable
   • Access records are never renamed after UID activation
   • Client-side deletion is prohibited
   • First-login UID binding belongs to the backend activation
     and identity-reconciliation workflow
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
    serverTimestamp,
    setDoc,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    requireAuthorizedAdmin
} from "./learning-resource-storage.js";


/* ==========================================================
   MODULE METADATA
========================================================== */

const MODULE_NAME =
    "LearnerResourceAccessService";

const MODULE_VERSION =
    "1.1.0";

const SCHEMA_VERSION =
    1;

const COLLECTION_NAME =
    "learner_resource_access";

const RESOURCE_COLLECTION_NAME =
    "learning_resources";

const ACCESS_ID_PREFIX =
    "LRA_";


/* ==========================================================
   GOVERNED VALUES
========================================================== */

const SUPPORTED_IDENTITY_SOURCES =
    Object.freeze([
        "historical_credential",
        "registration",
        "enrollment",
        "authenticated_identity",
        "admin_verified",
        "migration"
    ]);

const SUPPORTED_IDENTITY_STATUSES =
    Object.freeze([
        "pending_activation",
        "activated",
        "reconciliation_required",
        "blocked"
    ]);

const SUPPORTED_ACCESS_STATUSES =
    Object.freeze([
        "pending_activation",
        "active",
        "suspended",
        "revoked",
        "expired"
    ]);

const SUPPORTED_ACCESS_TYPES =
    Object.freeze([
        "individual_licensed",
        "program_entitlement",
        "alumni_entitlement",
        "cohort_assignment",
        "enterprise_assignment",
        "manual_exception"
    ]);

const SUPPORTED_RELEASE_STATUSES =
    Object.freeze([
        "scheduled",
        "released",
        "withheld",
        "expired"
    ]);

const SUPPORTED_RELEASE_POLICIES =
    Object.freeze([
        "immediate",
        "on_activation",
        "on_enrollment",
        "pre_module",
        "post_module",
        "post_session",
        "scheduled",
        "manual"
    ]);


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
   ADMIN AUTHORIZATION
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

    const uid =
        normalizeString(
            adminContext.uid ||
            adminContext.user?.uid
        );

    const email =
        normalizeEmail(
            adminContext.email ||
            adminContext.user?.email
        );

    if (
        !uid ||
        !email
    ) {

        throw new Error(
            `[${MODULE_NAME}] Authorized administrator identity is incomplete.`
        );

    }

    return Object.freeze({
        uid,
        email
    });

}


/* ==========================================================
   GENERAL NORMALIZATION
========================================================== */

function normalizeString(
    value
) {

    return String(
        value ?? ""
    ).trim();

}


function normalizeLowercase(
    value
) {

    return normalizeString(
        value
    ).toLowerCase();

}


function normalizeUppercase(
    value
) {

    return normalizeString(
        value
    ).toUpperCase();

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


function normalizeEmail(
    value
) {

    return normalizeLowercase(
        value
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


function normalizePositiveInteger(
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

    return normalizePositiveInteger(
        value
    );

}


function normalizeNullableIsoDateTime(
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


function normalizeGovernedValue(
    value,
    supportedValues
) {

    const normalizedValue =
        normalizeLowercase(
            value
        );

    return supportedValues.includes(
        normalizedValue
    )
        ? normalizedValue
        : "";

}

/* ==========================================================
   EMAIL VALIDATION
========================================================== */

function isValidEmail(
    value
) {

    const email =
        normalizeEmail(
            value
        );

    if (
        !email ||
        email.length >
            254
    ) {

        return false;

    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(
        email
    );

}


/* ==========================================================
   HASH AND ACCESS-ID GENERATION
========================================================== */

function bytesToHex(
    bytes
) {

    return Array.from(
        bytes
    )
        .map(
            (
                byte
            ) => byte
                .toString(
                    16
                )
                .padStart(
                    2,
                    "0"
                )
        )
        .join(
            ""
        )
        .toUpperCase();

}


async function sha256(
    value
) {

    if (
        !globalThis.crypto?.subtle
    ) {

        throw new Error(
            `[${MODULE_NAME}] Secure browser hashing is unavailable.`
        );

    }

    const encodedValue =
        new TextEncoder().encode(
            normalizeString(
                value
            )
        );

    const digest =
        await globalThis.crypto.subtle.digest(
            "SHA-256",
            encodedValue
        );

    return bytesToHex(
        new Uint8Array(
            digest
        )
    );

}


/*
 * The access ID is deterministic for the learner identity state
 * used during assignment and the exact resource version.
 *
 * No email address, credential ID or UID is exposed in the
 * Firestore document ID.
 *
 * Pending records retain this ID after first-login activation.
 */
async function buildAccessId({
    learnerUid,
    learnerEmailNormalized,
    credentialId,
    resourceDocumentId
}) {

    const normalizedLearnerUid =
        normalizeString(
            learnerUid
        );

    const normalizedEmail =
        normalizeEmail(
            learnerEmailNormalized
        );

    const normalizedCredentialId =
        normalizeUppercase(
            credentialId
        );

    const normalizedResourceDocumentId =
        normalizeString(
            resourceDocumentId
        );

    const identityMaterial =
        normalizedLearnerUid
            ? [
                "UID",
                normalizedLearnerUid,
                normalizedResourceDocumentId
            ]
            : [
                "PRELOGIN",
                normalizedEmail,
                normalizedCredentialId,
                normalizedResourceDocumentId
            ];

    const hash =
        await sha256(
            identityMaterial.join(
                "::"
            )
        );

    return `${ACCESS_ID_PREFIX}${hash.slice(
        0,
        32
    )}`;

}


/* ==========================================================
   INPUT NORMALIZATION
========================================================== */

function normalizeAccessInput(
    input = {}
) {

    const learnerUid =
        normalizeNullableString(
            input.learner_uid ??
            input.learnerUid
        );

    const learnerEmail =
        normalizeEmail(
            input.learner_email ??
            input.learnerEmail
        );

    const learnerEmailNormalized =
        normalizeEmail(
            input.learner_email_normalized ??
            input.learnerEmailNormalized ??
            learnerEmail
        );

    const credentialId =
        normalizeNullableString(
            normalizeUppercase(
                input.credential_id ??
                input.credentialId
            )
        );

    const resourceDocumentId =
        normalizeString(
            input.resource_document_id ??
            input.resourceDocumentId
        );

    /*
     * Learning-resource IDs are canonical lowercase identifiers.
     * Programme codes remain uppercase.
     */
    const resourceId =
        normalizeLowercase(
            input.resource_id ??
            input.resourceId
        );

    const programCode =
        normalizeUppercase(
            input.program_code ??
            input.programCode
        );

    const resourceVersion =
        normalizePositiveInteger(
            input.resource_version ??
            input.resourceVersion
        );

    const identitySource =
        normalizeGovernedValue(
            input.identity_source ??
            input.identitySource,
            SUPPORTED_IDENTITY_SOURCES
        );

    const identityStatus =
        normalizeGovernedValue(
            input.identity_status ??
            input.identityStatus,
            SUPPORTED_IDENTITY_STATUSES
        );

    const accessStatus =
        normalizeGovernedValue(
            input.access_status ??
            input.accessStatus,
            SUPPORTED_ACCESS_STATUSES
        );

    const accessType =
        normalizeGovernedValue(
            input.access_type ??
            input.accessType,
            SUPPORTED_ACCESS_TYPES
        );

    const releaseStatus =
        normalizeGovernedValue(
            input.release_status ??
            input.releaseStatus,
            SUPPORTED_RELEASE_STATUSES
        );

    const releasePolicy =
        normalizeGovernedValue(
            input.release_policy ??
            input.releasePolicy,
            SUPPORTED_RELEASE_POLICIES
        );

    return Object.freeze({

        resourceDocumentId,

        resourceId,

        programCode,

        resourceVersion,

        learnerUid,

        learnerEmail,

        learnerEmailNormalized,

        credentialId,

        identitySource,

        identityStatus,

        accessStatus,

        accessType,

        releaseStatus,

        releasePolicy,

        moduleNumber:
            normalizeNullablePositiveInteger(
                input.module_number ??
                input.moduleNumber
            ),

        sessionNumber:
            normalizeNullablePositiveInteger(
                input.session_number ??
                input.sessionNumber
            ),

        availableFrom:
            normalizeNullableIsoDateTime(
                input.available_from ??
                input.availableFrom
            ),

        availableUntil:
            normalizeNullableIsoDateTime(
                input.available_until ??
                input.availableUntil
            ),

        previewAllowed:
            normalizeBoolean(
                input.preview_allowed ??
                input.previewAllowed,
                false
            ),

        downloadAllowed:
            normalizeBoolean(
                input.download_allowed ??
                input.downloadAllowed,
                false
            )

    });

}

/* ==========================================================
   INPUT VALIDATION
========================================================== */

function validateAvailabilityWindow(
    availableFrom,
    availableUntil
) {

    if (
        !availableFrom ||
        !availableUntil
    ) {

        return null;

    }

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

        return "Available Until must be later than Available From.";

    }

    return null;

}


function validateAccessInput(
    input
) {

    const errors =
        [];

    if (
        !input.resourceDocumentId
    ) {

        errors.push(
            "Resource document ID is required."
        );

    }

    if (
        !input.resourceId
    ) {

        errors.push(
            "Resource ID is required."
        );

    }

    if (
        !input.programCode
    ) {

        errors.push(
            "Programme code is required."
        );

    }

    if (
        !input.resourceVersion
    ) {

        errors.push(
            "Resource version must be a positive integer."
        );

    }

    if (
        !isValidEmail(
            input.learnerEmailNormalized
        )
    ) {

        errors.push(
            "A valid learner email is required."
        );

    }

    if (
        input.learnerEmail !==
            input.learnerEmailNormalized
    ) {

        errors.push(
            "Learner email must be canonically normalized."
        );

    }

    if (
        !input.identitySource
    ) {

        errors.push(
            "Identity source is unsupported."
        );

    }

    if (
        !input.identityStatus
    ) {

        errors.push(
            "Identity status is unsupported."
        );

    }

    if (
        !input.accessStatus
    ) {

        errors.push(
            "Access status is unsupported."
        );

    }

    if (
        !input.accessType
    ) {

        errors.push(
            "Access type is unsupported."
        );

    }

    if (
        !input.releaseStatus
    ) {

        errors.push(
            "Release status is unsupported."
        );

    }

    if (
        !input.releasePolicy
    ) {

        errors.push(
            "Release policy is unsupported."
        );

    }

    if (
        input.identitySource ===
            "historical_credential" &&
        !input.credentialId
    ) {

        errors.push(
            "Credential ID is required for historical alumni."
        );

    }

    if (
        input.identityStatus ===
            "pending_activation" &&
        input.learnerUid
    ) {

        errors.push(
            "Pending identity must not contain a learner UID."
        );

    }

    if (
        input.identityStatus ===
            "activated" &&
        !input.learnerUid
    ) {

        errors.push(
            "Activated identity requires a learner UID."
        );

    }

    if (
        input.accessStatus ===
            "pending_activation" &&
        input.learnerUid
    ) {

        errors.push(
            "Pending access must not contain a learner UID."
        );

    }

    if (
        input.accessStatus ===
            "active" &&
        !input.learnerUid
    ) {

        errors.push(
            "Active access requires a learner UID."
        );

    }

    if (
        input.accessStatus ===
            "pending_activation" &&
        input.identityStatus !==
            "pending_activation"
    ) {

        errors.push(
            "Pending access requires pending identity status."
        );

    }

    if (
        input.accessStatus ===
            "active" &&
        input.identityStatus !==
            "activated"
    ) {

        errors.push(
            "Active access requires activated identity status."
        );

    }

    if (
        (
            input.releasePolicy ===
                "pre_module" ||
            input.releasePolicy ===
                "post_module"
        ) &&
        !input.moduleNumber
    ) {

        errors.push(
            "Module number is required for module-based release."
        );

    }

    if (
        input.releasePolicy ===
            "post_session" &&
        !input.sessionNumber
    ) {

        errors.push(
            "Session number is required for post-session release."
        );

    }

    const availabilityError =
        validateAvailabilityWindow(
            input.availableFrom,
            input.availableUntil
        );

    if (
        availabilityError
    ) {

        errors.push(
            availabilityError
        );

    }

    return Object.freeze({

        valid:
            errors.length ===
            0,

        errors:
            Object.freeze([
                ...errors
            ])

    });

}

/* ==========================================================
   RESOURCE VALIDATION
========================================================== */

async function requirePublishedResource(
    normalizedInput
) {

    const resourceReference =
        doc(
            db,
            RESOURCE_COLLECTION_NAME,
            normalizedInput.resourceDocumentId
        );

    const resourceSnapshot =
        await getDoc(
            resourceReference
        );

    if (
        !resourceSnapshot.exists()
    ) {

        throw new Error(
            "The selected learning resource does not exist."
        );

    }

    const resourceData =
        resourceSnapshot.data() ||
        {};

    const resourceId =
        normalizeLowercase(
            resourceData.resource_id ??
            resourceData.resourceId
        );

    const storageDomain =
        normalizeLowercase(
            resourceData.storage_domain ??
            resourceData.storageDomain
        );

    const programCode =
        normalizeUppercase(
            resourceData.program_code ??
            resourceData.programCode
        );

    const version =
        normalizePositiveInteger(
            resourceData.version
        );

    const status =
        normalizeLowercase(
            resourceData.status
        );

    const isActive =
        resourceData.is_active ===
            true ||
        resourceData.isActive ===
            true;

    if (
        status !==
            "published" ||
        isActive !==
            true
    ) {

        throw new Error(
            "Learner access can only be assigned to an active published resource."
        );

    }

    if (
        resourceId !==
            normalizedInput.resourceId
    ) {

        throw new Error(
            "The supplied resource ID does not match the learning-resource record."
        );

    }

    if (
        programCode !==
            normalizedInput.programCode
    ) {

        throw new Error(
            "The supplied programme code does not match the learning-resource record."
        );

    }

    if (
        version !==
            normalizedInput.resourceVersion
    ) {

        throw new Error(
            "The supplied resource version does not match the learning-resource record."
        );

    }

    return Object.freeze({

        documentId:
            resourceSnapshot.id,

        resourceId,

        programCode,

        version,

        storageDomain,

        previewAllowed:
            resourceData.preview_allowed ===
                true ||
            resourceData.previewAllowed ===
                true,

        downloadAllowed:
            resourceData.download_allowed ===
                true ||
            resourceData.downloadAllowed ===
                true

    });

}


/* ==========================================================
   DOCUMENT NORMALIZATION
========================================================== */

function toIsoString(
    value
) {

    if (
        value ===
            undefined ||
        value ===
            null
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

        const date =
            value instanceof Date
                ? value
                : new Date(
                    value
                );

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date.toISOString();

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


function normalizeAccessSnapshot(
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

    return Object.freeze({

        documentId:
            snapshot.id,

        accessId:
            normalizeString(
                data.access_id
            ),

        resourceDocumentId:
            normalizeString(
                data.resource_document_id
            ),

        resourceId:
            normalizeLowercase(
                data.resource_id
            ),

        programCode:
            normalizeUppercase(
                data.program_code
            ),

        resourceVersion:
            normalizePositiveInteger(
                data.resource_version
            ),

        learnerUid:
            normalizeNullableString(
                data.learner_uid
            ),

        learnerEmail:
            normalizeEmail(
                data.learner_email
            ),

        learnerEmailNormalized:
            normalizeEmail(
                data.learner_email_normalized
            ),

        credentialId:
            normalizeNullableString(
                data.credential_id
            ),

        identitySource:
            normalizeLowercase(
                data.identity_source
            ),

        identityStatus:
            normalizeLowercase(
                data.identity_status
            ),

        accessStatus:
            normalizeLowercase(
                data.access_status
            ),

        accessType:
            normalizeLowercase(
                data.access_type
            ),

        releaseStatus:
            normalizeLowercase(
                data.release_status
            ),

        releasePolicy:
            normalizeLowercase(
                data.release_policy
            ),

        moduleNumber:
            normalizeNullablePositiveInteger(
                data.module_number
            ),

        sessionNumber:
            normalizeNullablePositiveInteger(
                data.session_number
            ),

        availableFrom:
            normalizeNullableIsoDateTime(
                data.available_from
            ),

        availableUntil:
            normalizeNullableIsoDateTime(
                data.available_until
            ),

        previewAllowed:
            data.preview_allowed ===
                true,

        downloadAllowed:
            data.download_allowed ===
                true,

        grantedByUid:
            normalizeNullableString(
                data.granted_by_uid
            ),

        grantedByEmail:
            normalizeNullableString(
                data.granted_by_email
            ),

        grantedAt:
            toIsoString(
                data.granted_at
            ),

        activatedAt:
            toIsoString(
                data.activated_at
            ),

        activatedByUid:
            normalizeNullableString(
                data.activated_by_uid
            ),

        revokedAt:
            toIsoString(
                data.revoked_at
            ),

        revokedByUid:
            normalizeNullableString(
                data.revoked_by_uid
            ),

        revokedByEmail:
            normalizeNullableString(
                data.revoked_by_email
            ),

        revocationReason:
            normalizeNullableString(
                data.revocation_reason
            ),

        createdAt:
            toIsoString(
                data.created_at
            ),

        createdByUid:
            normalizeNullableString(
                data.created_by_uid
            ),

        createdByEmail:
            normalizeNullableString(
                data.created_by_email
            ),

        updatedAt:
            toIsoString(
                data.updated_at
            ),

        updatedByUid:
            normalizeNullableString(
                data.updated_by_uid
            ),

        updatedByEmail:
            normalizeNullableString(
                data.updated_by_email
            ),

        source:
            normalizeLowercase(
                data.source
            ),

        lastMutationSource:
            normalizeLowercase(
                data.last_mutation_source
            ),

        schemaVersion:
            normalizePositiveInteger(
                data.schema_version
            )

    });

}

/* ==========================================================
   QUERY HELPERS
========================================================== */

async function readQuery(
    accessQuery
) {

    const querySnapshot =
        await getDocs(
            accessQuery
        );

    return Object.freeze(
        querySnapshot.docs
            .map(
                normalizeAccessSnapshot
            )
            .filter(
                Boolean
            )
    );

}


async function findDuplicates(
    input
) {

    const accessCollection =
        collection(
            db,
            COLLECTION_NAME
        );

    const duplicateQueries =
        [];

    duplicateQueries.push(
        query(
            accessCollection,
            where(
                "learner_email_normalized",
                "==",
                input.learnerEmailNormalized
            ),
            where(
                "resource_document_id",
                "==",
                input.resourceDocumentId
            )
        )
    );

    if (
        input.learnerUid
    ) {

        duplicateQueries.push(
            query(
                accessCollection,
                where(
                    "learner_uid",
                    "==",
                    input.learnerUid
                ),
                where(
                    "resource_document_id",
                    "==",
                    input.resourceDocumentId
                )
            )
        );

    }

    if (
        input.credentialId
    ) {

        duplicateQueries.push(
            query(
                accessCollection,
                where(
                    "credential_id",
                    "==",
                    input.credentialId
                ),
                where(
                    "resource_document_id",
                    "==",
                    input.resourceDocumentId
                )
            )
        );

    }

    const queryResults =
        await Promise.all(
            duplicateQueries.map(
                readQuery
            )
        );

    const uniqueRecords =
        new Map();

    queryResults
        .flat()
        .forEach(
            (
                record
            ) => {

                if (
                    record?.documentId
                ) {

                    uniqueRecords.set(
                        record.documentId,
                        record
                    );

                }

            }
        );

    return Object.freeze([
        ...uniqueRecords.values()
    ]);

}


/* ==========================================================
   CREATE ACCESS
========================================================== */

async function createAccess(
    input = {}
) {

    assertDatabaseAvailable();

    const adminContext =
        await requireAdminAccess();

    const normalizedInput =
        normalizeAccessInput(
            input
        );

    const validation =
        validateAccessInput(
            normalizedInput
        );

    if (
        !validation.valid
    ) {

        throw new Error(
            validation.errors.join(
                " "
            )
        );

    }

    const resource =
        await requirePublishedResource(
            normalizedInput
        );

    const duplicateRecords =
        await findDuplicates(
            normalizedInput
        );

    const conflictingRecord =
        duplicateRecords.find(
            (
                record
            ) => (
                record.accessStatus !==
                    "revoked" &&
                record.accessStatus !==
                    "expired"
            )
        );

    if (
        conflictingRecord
    ) {

        throw new Error(
            `Learner access already exists for this resource under access ID ${
                conflictingRecord.accessId ||
                conflictingRecord.documentId
            }.`
        );

    }

    const accessId =
        await buildAccessId({
            learnerUid:
                normalizedInput.learnerUid,

            learnerEmailNormalized:
                normalizedInput.learnerEmailNormalized,

            credentialId:
                normalizedInput.credentialId,

            resourceDocumentId:
                normalizedInput.resourceDocumentId
        });

    const accessReference =
        doc(
            db,
            COLLECTION_NAME,
            accessId
        );

    const existingSnapshot =
        await getDoc(
            accessReference
        );

    if (
        existingSnapshot.exists()
    ) {

        throw new Error(
            "A learner-resource access record with the same canonical identity already exists."
        );

    }

    const accessRecord = {

        access_id:
            accessId,

        resource_document_id:
            resource.documentId,

        resource_id:
            resource.resourceId,

        program_code:
            resource.programCode,

        resource_version:
            resource.version,

        learner_uid:
            normalizedInput.learnerUid,

        learner_email:
            normalizedInput.learnerEmailNormalized,

        learner_email_normalized:
            normalizedInput.learnerEmailNormalized,

        credential_id:
            normalizedInput.credentialId,

        identity_source:
            normalizedInput.identitySource,

        identity_status:
            normalizedInput.identityStatus,

        access_status:
            normalizedInput.accessStatus,

        access_type:
            normalizedInput.accessType,

        release_status:
            normalizedInput.releaseStatus,

        release_policy:
            normalizedInput.releasePolicy,

        module_number:
            normalizedInput.moduleNumber,

        session_number:
            normalizedInput.sessionNumber,

        available_from:
            normalizedInput.availableFrom,

        available_until:
            normalizedInput.availableUntil,

        /*
         * Master learning resources are globally protected.
         *
         * Their learner-facing permissions are granted through the
         * individual learner_resource_access record and enforced by
         * the authenticated backend delivery broker.
         *
         * Other resource domains cannot exceed the permissions
         * configured on the published resource.
         */
        preview_allowed:
            resource.storageDomain ===
                "master_learning_resources"
                ? normalizedInput.previewAllowed
                : (
                    resource.previewAllowed &&
                    normalizedInput.previewAllowed
                ),

        download_allowed:
            resource.storageDomain ===
                "master_learning_resources"
                ? normalizedInput.downloadAllowed
                : (
                    resource.downloadAllowed &&
                    normalizedInput.downloadAllowed
                ),

        granted_by_uid:
            adminContext.uid,

        granted_by_email:
            adminContext.email,

        granted_at:
            serverTimestamp(),

        activated_at:
            normalizedInput.accessStatus ===
                "active"
                ? serverTimestamp()
                : null,

        activated_by_uid:
            normalizedInput.accessStatus ===
                "active"
                ? normalizedInput.learnerUid
                : null,

        revoked_at:
            null,

        revoked_by_uid:
            null,

        revoked_by_email:
            null,

        revocation_reason:
            null,

        created_at:
            serverTimestamp(),

        created_by_uid:
            adminContext.uid,

        created_by_email:
            adminContext.email,

        updated_at:
            serverTimestamp(),

        updated_by_uid:
            adminContext.uid,

        updated_by_email:
            adminContext.email,

        source:
            "admin_portal",

        last_mutation_source:
            "admin_portal",

        schema_version:
            SCHEMA_VERSION

    };

    await setDoc(
        accessReference,
        accessRecord
    );

    const createdSnapshot =
        await getDoc(
            accessReference
        );

    const createdAccess =
        normalizeAccessSnapshot(
            createdSnapshot
        );

    if (
        !createdAccess
    ) {

        throw new Error(
            "Learner-resource access was created but could not be read back."
        );

    }

    return createdAccess;

}

/* ==========================================================
   DIRECT ACCESS READ
========================================================== */

async function getAccess(
    accessId
) {

    assertDatabaseAvailable();

    await requireAdminAccess();

    const normalizedAccessId =
        normalizeUppercase(
            accessId
        );

    if (
        !normalizedAccessId.startsWith(
            ACCESS_ID_PREFIX
        )
    ) {

        throw new Error(
            "A valid learner-resource access ID is required."
        );

    }

    const accessReference =
        doc(
            db,
            COLLECTION_NAME,
            normalizedAccessId
        );

    const accessSnapshot =
        await getDoc(
            accessReference
        );

    return normalizeAccessSnapshot(
        accessSnapshot
    );

}


/* ==========================================================
   LIST BY LEARNER UID
========================================================== */

async function listByLearnerUid(
    learnerUid,
    {
        accessStatus = ""
    } = {}
) {

    assertDatabaseAvailable();

    await requireAdminAccess();

    const normalizedLearnerUid =
        normalizeString(
            learnerUid
        );

    if (
        !normalizedLearnerUid
    ) {

        throw new Error(
            "Learner UID is required."
        );

    }

    const constraints =
        [
            where(
                "learner_uid",
                "==",
                normalizedLearnerUid
            )
        ];

    const normalizedAccessStatus =
        normalizeLowercase(
            accessStatus
        );

    if (
        normalizedAccessStatus
    ) {

        if (
            !SUPPORTED_ACCESS_STATUSES.includes(
                normalizedAccessStatus
            )
        ) {

            throw new Error(
                "Access-status filter is unsupported."
            );

        }

        constraints.push(
            where(
                "access_status",
                "==",
                normalizedAccessStatus
            )
        );

    }

    return readQuery(
        query(
            collection(
                db,
                COLLECTION_NAME
            ),
            ...constraints
        )
    );

}


/* ==========================================================
   LIST PENDING BY EMAIL
========================================================== */

async function listPendingByEmail(
    learnerEmail
) {

    assertDatabaseAvailable();

    await requireAdminAccess();

    const normalizedEmail =
        normalizeEmail(
            learnerEmail
        );

    if (
        !isValidEmail(
            normalizedEmail
        )
    ) {

        throw new Error(
            "A valid learner email is required."
        );

    }

    return readQuery(
        query(
            collection(
                db,
                COLLECTION_NAME
            ),
            where(
                "learner_email_normalized",
                "==",
                normalizedEmail
            ),
            where(
                "access_status",
                "==",
                "pending_activation"
            )
        )
    );

}


/* ==========================================================
   LIST BY CREDENTIAL ID
========================================================== */

async function listByCredentialId(
    credentialId
) {

    assertDatabaseAvailable();

    await requireAdminAccess();

    const normalizedCredentialId =
        normalizeUppercase(
            credentialId
        );

    if (
        !normalizedCredentialId
    ) {

        throw new Error(
            "Credential ID is required."
        );

    }

    return readQuery(
        query(
            collection(
                db,
                COLLECTION_NAME
            ),
            where(
                "credential_id",
                "==",
                normalizedCredentialId
            )
        )
    );

}


/* ==========================================================
   LIST BY RESOURCE
========================================================== */

async function listByResourceDocumentId(
    resourceDocumentId
) {

    assertDatabaseAvailable();

    await requireAdminAccess();

    const normalizedResourceDocumentId =
        normalizeString(
            resourceDocumentId
        );

    if (
        !normalizedResourceDocumentId
    ) {

        throw new Error(
            "Resource document ID is required."
        );

    }

    return readQuery(
        query(
            collection(
                db,
                COLLECTION_NAME
            ),
            where(
                "resource_document_id",
                "==",
                normalizedResourceDocumentId
            )
        )
    );

}


/* ==========================================================
   PUBLIC API
========================================================== */

const LearnerResourceAccessService =
    Object.freeze({

        moduleName:
            MODULE_NAME,

        version:
            MODULE_VERSION,

        schemaVersion:
            SCHEMA_VERSION,

        collectionName:
            COLLECTION_NAME,

        createAccess,

        getAccess,

        listByLearnerUid,

        listPendingByEmail,

        listByCredentialId,

        listByResourceDocumentId

    });


window.LearnerResourceAccessService =
    LearnerResourceAccessService;


export {

    LearnerResourceAccessService,

    createAccess,

    getAccess,

    listByLearnerUid,

    listPendingByEmail,

    listByCredentialId,

    listByResourceDocumentId

};