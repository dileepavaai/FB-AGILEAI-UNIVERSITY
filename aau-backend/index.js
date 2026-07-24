/* ==========================================================
   Agile AI University

   Service Name : aau-credential-verify
   Component    : Credential Verification, Activation and
                  Learning Resource API
   File         : index.js
   Version      : 1.4.0
   Status       : ACTIVE
   Environment  : Google Cloud Run
   Project      : fb-agileai-university

   Purpose
   ----------------------------------------------------------
   Provides:

   - Public credential verification
   - Administrative credential registry lookup
   - Learner credential retrieval
   - Credential activation-token validation
   - Learner learning-resource resolution and delivery
   - Governed learner-specific resource assignment
   - Pre-login licensed-resource staging
   - Personalized protected-file delivery

   Primary APIs
   ----------------------------------------------------------
   POST /public/verify-credential
   POST /admin/credential-registry
   POST /student/my-credentials
   POST /api/v1/credential-activations/validate
   POST /api/v1/credential-activations/claim
   GET  /api/v1/learning-resources/me
   POST /api/v1/learning-resources/:accessId/delivery
   POST /api/v1/admin/learning-resources/:resourceDocumentId/assign

   Governance
   ----------------------------------------------------------
   - Firebase Authentication is the identity authority.
   - Firestore credentials is the credential authority.
   - learner_resource_access is the learner-resource
     relationship authority.
   - learning_resources is the resource-catalogue authority.
   - CredentialActivationService owns activation validation.
   - Plain activation tokens are never logged or persisted.
   - Activation-token lookup uses SHA-256 and limit(2).
   - Learning resources may be assigned before learner_uid
     exists.
   - Pre-login assignment uses verified learner email and
     Credential ID.
   - learner_uid becomes canonical after first authentication.
   - Pending access records are bound atomically during
     credential activation.
   - Access documents are not renamed during UID binding.
   - Personalized licensed files remain protected.
   - Existing infrastructure is reused.
   - Production-only change controls apply.

   Last Updated
   ----------------------------------------------------------
   July 2026
========================================================== */

"use strict";

/* ==========================================================
   Dependencies
========================================================== */

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const crypto = require("node:crypto");
const multer = require("multer");

/* ==========================================================
   Application Initialization
========================================================== */

const app = express();

app.disable("x-powered-by");

app.use(cors());

app.use(
    express.json({
        limit: "100kb",
        strict: true
    })
);

/*
 * Cloud Run uses Application Default Credentials through
 * its attached runtime service account.
 */
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();

/* ==========================================================
   Service Metadata
========================================================== */

const SERVICE_NAME =
    "aau-credential-verify";

const SERVICE_VERSION =
    "1.4.0";

const EXPECTED_PROJECT_ID =
    "fb-agileai-university";

/* ==========================================================
   Firestore Collections
========================================================== */

const COLLECTIONS =
    Object.freeze({

        credentials:
            "credentials",

        activationTokens:
            "credential_activation_tokens",

        reconciliationEvents:
            "identity_reconciliation_events",

        learningResources:
            "learning_resources",

        learnerResourceAccess:
            "learner_resource_access"

    });

/* ==========================================================
   Credential Activation Configuration
========================================================== */

const ACTIVATION_CONFIG =
    Object.freeze({

        tokenHashAlgorithm:
            "sha256",

        allowedStatuses:
            Object.freeze({

                issued:
                    "issued",

                consumed:
                    "consumed",

                expired:
                    "expired",

                revoked:
                    "revoked",

                blocked:
                    "blocked"

            }),

        requiredApprovalStatus:
            "approved",

        requiredIssuedStatus:
            "finalized",

        validateRateLimit:
            Object.freeze({

                windowMs:
                    60 * 1000,

                maxRequests:
                    10

            })

    });

/* ==========================================================
   Learner Resource Assignment Configuration

   Locked Rules
   ----------------------------------------------------------
   - Assignment must work without learner_uid.
   - Credential ID and verified learner email are required.
   - Existing learner_uid is used when already available.
   - Maximum protected-file size is 50 MiB.
   - Only PDF files are accepted for personalized licensed
     learning-resource assignment.
   - Exactly one file is accepted per assignment.
   - Browser-supplied administrator identity is never trusted.
========================================================== */

const LEARNER_RESOURCE_ASSIGNMENT_CONFIG =
    Object.freeze({

        apiVersion:
            "1.0.0",

        schemaVersion:
            1,

        maximumFileSizeBytes:
            50 * 1024 * 1024,

        maximumAssignmentsPerCredentialLookup:
            100,

        uploadFieldName:
            "file",

        allowedMimeTypes:
            Object.freeze([
                "application/pdf"
            ]),

        storageRoot:
            "learning-resources",

        licensedDirectory:
            "licensed",

        storageDomain:
            "learner_licensed_resources",

        deliveryType:
            "protected_storage",

        assignmentSource:
            "admin_assignment_api",

        accessIdPrefix:
            "LRA_",

        defaultAccessType:
            "individual_licensed",

        defaultReleaseStatus:
            "released",

        defaultReleasePolicyForPendingIdentity:
            "on_activation",

        defaultReleasePolicyForActiveIdentity:
            "immediate"

    });

/* ==========================================================
   Multipart Upload Middleware

   Files remain in memory only for the duration of the Admin
   assignment request.

   No local temporary file is created.
========================================================== */

const learnerResourceAssignmentUpload =
    multer({

        storage:
            multer.memoryStorage(),

        limits: {

            files:
                1,

            fileSize:
                LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                    .maximumFileSizeBytes

        },

        fileFilter: (
            req,
            file,
            callback
        ) => {

            const mimeType =
                normalizeLower(
                    file?.mimetype
                );

            if (
                !LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                    .allowedMimeTypes
                    .includes(
                        mimeType
                    )
            ) {

                const error =
                    new Error(
                        "Only personalized PDF learning materials may be uploaded."
                    );

                error.code =
                    "LEARNING_RESOURCE_FILE_TYPE_INVALID";

                error.httpStatus =
                    400;

                return callback(
                    error
                );

            }

            return callback(
                null,
                true
            );

        }

    });

/* ==========================================================
   In-Memory Rate Limiting

   Important
   ----------------------------------------------------------
   This is intentionally lightweight for the current MVP.

   Cloud Run instances maintain independent memory, so this
   is not a globally distributed rate limiter.

   It remains suitable as a cost-free first protection layer
   for the controlled alumni pilot.

   A managed distributed limiter may be introduced later only
   when justified by traffic and explicit founder approval.
========================================================== */

const verificationRequestCounts =
    new Map();

const activationRequestCounts =
    new Map();

/* ==========================================================
   General Utilities
========================================================== */

function normalizeString(
    value
) {

    return typeof value ===
        "string"
        ? value.trim()
        : "";

}

function normalizeEmail(
    value
) {

    return normalizeString(
        value
    ).toLowerCase();

}

function normalizeLower(
    value
) {

    return normalizeString(
        value
    ).toLowerCase();

}

function normalizeUpper(
    value
) {

    return normalizeString(
        value
    ).toUpperCase();

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

    const normalizedValue =
        normalizeLower(
            value
        );

    if (
        [
            "true",
            "1",
            "yes",
            "on"
        ].includes(
            normalizedValue
        )
    ) {

        return true;

    }

    if (
        [
            "false",
            "0",
            "no",
            "off"
        ].includes(
            normalizedValue
        )
    ) {

        return false;

    }

    return fallback;

}

function normalizePositiveInteger(
    value,
    fallback = null
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

function isValidEmail(
    value
) {

    const email =
        normalizeEmail(
            value
        );

    if (
        !email ||
        email.length > 254
    ) {

        return false;

    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(
        email
    );

}

function resolveConfiguredAdminEmails() {

    const configuredValue =
        normalizeString(
            process.env.AAU_ADMIN_EMAILS
        );

    if (!configuredValue) {

        return Object.freeze([]);

    }

    const normalizedEmails =
        configuredValue
            .split(",")
            .map(
                normalizeEmail
            )
            .filter(
                isValidEmail
            );

    return Object.freeze([
        ...new Set(
            normalizedEmails
        )
    ]);

}

function sanitizeStorageSegment(
    value,
    fallback = "UNSPECIFIED"
) {

    const normalizedValue =
        normalizeString(
            value
        )
            .replace(
                /[^A-Za-z0-9._-]+/g,
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

    return normalizedValue ||
        fallback;

}

function sanitizeLicensedFileName(
    value,
    credentialId
) {

    const normalizedCredentialId =
        sanitizeStorageSegment(
            normalizeUpper(
                credentialId
            ),
            "CREDENTIAL"
        );

    const suppliedName =
        normalizeString(
            value
        );

    const withoutPath =
        suppliedName
            .split(/[\\/]/)
            .pop() ||
        "";

    const withoutPdfExtension =
        withoutPath.replace(
            /\.pdf$/iu,
            ""
        );

    const normalizedBaseName =
        sanitizeStorageSegment(
            withoutPdfExtension,
            "Agile-AI-University-Licensed-Material"
        );

    const credentialAlreadyPresent =
        normalizeUpper(
            normalizedBaseName
        ).includes(
            normalizeUpper(
                normalizedCredentialId
            )
        );

    const finalBaseName =
        credentialAlreadyPresent
            ? normalizedBaseName
            : `${normalizedBaseName}-${normalizedCredentialId}`;

    return `${finalBaseName.slice(
        0,
        170
    )}.pdf`;

}

function sha256Hex(
    value
) {

    return crypto
        .createHash(
            "sha256"
        )
        .update(
            normalizeString(
                value
            ),
            "utf8"
        )
        .digest(
            "hex"
        )
        .toUpperCase();

}

function buildLearnerResourceAccessId({
    learnerUid,
    learnerEmail,
    credentialId,
    resourceDocumentId
}) {

    const normalizedCredentialId =
        normalizeUpper(
            credentialId
        );

    const normalizedResourceDocumentId =
        normalizeString(
            resourceDocumentId
        );

    const identityMaterial = [
            "CREDENTIAL_RESOURCE",
            normalizedCredentialId,
            normalizedResourceDocumentId
        ];

    const hash =
        sha256Hex(
            identityMaterial.join(
                "::"
            )
        );

    return (
        LEARNER_RESOURCE_ASSIGNMENT_CONFIG
            .accessIdPrefix +
        hash.slice(
            0,
            32
        )
    );

}

function getClientIp(
    req
) {

    const forwardedFor =
        normalizeString(
            req.headers["x-forwarded-for"]
        );

    if (forwardedFor) {

        return forwardedFor
            .split(",")[0]
            .trim();

    }

    return normalizeString(
        req.ip
    ) || "unknown";

}

function applyInMemoryRateLimit({
    req,
    store,
    windowMs,
    maxRequests
}) {

    const ip =
        getClientIp(
            req
        );

    const now =
        Date.now();

    const current =
        store.get(
            ip
        ) || {

            count:
                0,

            windowStartedAt:
                now

        };

    if (
        now -
            current.windowStartedAt >=
        windowMs
    ) {

        current.count =
            0;

        current.windowStartedAt =
            now;

    }

    current.count +=
        1;

    store.set(
        ip,
        current
    );

    return {

        allowed:
            current.count <=
            maxRequests,

        ip,

        remaining:
            Math.max(
                maxRequests -
                    current.count,
                0
            )

    };

}

function maskEmail(
    email
) {

    const normalized =
        normalizeEmail(
            email
        );

    if (
        !normalized.includes(
            "@"
        )
    ) {

        return null;

    }

    const [
        localPart,
        domain
    ] =
        normalized.split(
            "@"
        );

    if (
        !localPart ||
        !domain
    ) {

        return null;

    }

    const visibleLength =
        localPart.length <= 2
            ? 1
            : Math.min(
                2,
                localPart.length
            );

    return (
        `${localPart.slice(
            0,
            visibleLength
        )}` +
        `***@${domain}`
    );

}

function resolveDate(
    value
) {

    if (!value) {

        return null;

    }

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

    if (
        typeof value ===
            "string"
    ) {

        return value;

    }

    return null;

}

function isTimestampExpired(
    value
) {

    if (!value) {

        return true;

    }

    let expirationDate =
        null;

    if (
        typeof value.toDate ===
            "function"
    ) {

        expirationDate =
            value.toDate();

    } else if (
        value instanceof Date
    ) {

        expirationDate =
            value;

    } else if (
        typeof value ===
            "string"
    ) {

        expirationDate =
            new Date(
                value
            );

    }

    if (
        !expirationDate ||
        Number.isNaN(
            expirationDate.getTime()
        )
    ) {

        return true;

    }

    return (
        expirationDate.getTime() <=
        Date.now()
    );

}

function hashActivationToken(
    token
) {

    return crypto
        .createHash(
            ACTIVATION_CONFIG
                .tokenHashAlgorithm
        )
        .update(
            token,
            "utf8"
        )
        .digest(
            "hex"
        );

}

function createCorrelationId() {

    return crypto.randomUUID();

}

function getProgrammeName(
    programCode
) {

    const names =
        Object.freeze({

            AOP:
                "Agile Outcome Practitioner",

            AIPA:
                "Artificial Intelligence Professional Agilist",

            AAIA:
                "Agile AI Master",

            AAIP:
                "Agentic AI Professional",

            AIAL:
                "Agile AI Leadership"

        });

    return names[
        normalizeUpper(
            programCode
        )
    ] || null;

}

function sendActivationError(
    res,
    {
        httpStatus,
        code,
        message,
        correlationId
    }
) {

    return res
        .status(
            httpStatus
        )
        .json({

            success:
                false,

            error: {
                code,
                message
            },

            correlationId

        });

}

/* ==========================================================
   Service Error
========================================================== */

function createServiceError({
    code,
    message,
    httpStatus
}) {

    const error =
        new Error(
            message
        );

    error.code =
        code;

    error.httpStatus =
        httpStatus;

    return error;

}

/* ==========================================================
   Multipart Upload Error Normalization
========================================================== */

function normalizeAssignmentUploadError(
    error
) {

    if (
        error instanceof
            multer.MulterError
    ) {

        if (
            error.code ===
                "LIMIT_FILE_SIZE"
        ) {

            return createServiceError({

                code:
                    "LEARNING_RESOURCE_FILE_TOO_LARGE",

                message:
                    "The personalized learning-resource file must not exceed 50 MiB.",

                httpStatus:
                    413

            });

        }

        if (
            error.code ===
                "LIMIT_FILE_COUNT" ||
            error.code ===
                "LIMIT_UNEXPECTED_FILE"
        ) {

            return createServiceError({

                code:
                    "LEARNING_RESOURCE_FILE_INVALID",

                message:
                    "Exactly one personalized PDF file must be uploaded.",

                httpStatus:
                    400

            });

        }

        return createServiceError({

            code:
                "LEARNING_RESOURCE_UPLOAD_INVALID",

            message:
                "The personalized learning-resource upload is invalid.",

            httpStatus:
                400

        });

    }

    if (
        Number.isInteger(
            error?.httpStatus
        )
    ) {

        return error;

    }

    return createServiceError({

        code:
            "LEARNING_RESOURCE_UPLOAD_FAILED",

        message:
            "The personalized learning-resource file could not be processed.",

        httpStatus:
            500

    });

}

function handleLearnerResourceAssignmentUpload(
    req,
    res,
    next
) {

    return learnerResourceAssignmentUpload.single(
        LEARNER_RESOURCE_ASSIGNMENT_CONFIG
            .uploadFieldName
    )(
        req,
        res,
        (
            error
        ) => {

            if (!error) {

                return next();

            }

            return next(
                normalizeAssignmentUploadError(
                    error
                )
            );

        }
    );

}

/* ==========================================================
   reCAPTCHA Validation
========================================================== */

async function verifyRecaptcha(
    token
) {

    if (!token) {

        return false;

    }

    const secret =
        process.env
            .RECAPTCHA_SECRET_KEY;

    if (!secret) {

        console.warn(
            `[${SERVICE_NAME}] Missing RECAPTCHA_SECRET_KEY`
        );

        return false;

    }

    try {

        const body =
            new URLSearchParams();

        body.set(
            "secret",
            secret
        );

        body.set(
            "response",
            token
        );

        const response =
            await fetch(

                "https://www.google.com/recaptcha/api/siteverify",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/x-www-form-urlencoded"

                    },

                    body:
                        body.toString()

                }

            );

        const data =
            await response.json();

        return data.success ===
            true;

    } catch (
        error
    ) {

        console.error(
            `[${SERVICE_NAME}] reCAPTCHA validation failed:`,
            error
        );

        return false;

    }

}

/* ==========================================================
   Credential Verification Signature
========================================================== */

function generateSignature(
    credentialId
) {

    const secret =
        process.env
            .SIGNING_SECRET;

    if (!secret) {

        return null;

    }

    return crypto
        .createHmac(
            "sha256",
            secret
        )
        .update(
            credentialId
        )
        .digest(
            "hex"
        );

}

function safeCompare(
    firstValue,
    secondValue
) {

    if (
        !firstValue ||
        !secondValue
    ) {

        return false;

    }

    const firstBuffer =
        Buffer.from(
            firstValue
        );

    const secondBuffer =
        Buffer.from(
            secondValue
        );

    if (
        firstBuffer.length !==
            secondBuffer.length
    ) {

        return false;

    }

    return crypto.timingSafeEqual(
        firstBuffer,
        secondBuffer
    );

}

function verifySignature(
    credentialId,
    signature
) {

    /*
     * Retained for backward compatibility with existing
     * verification URLs.
     */
    if (!signature) {

        return true;

    }

    const expected =
        generateSignature(
            credentialId
        );

    if (!expected) {

        return false;

    }

    return safeCompare(
        signature,
        expected
    );

}

/* ==========================================================
   Firebase Authentication Helpers
========================================================== */

function getBearerToken(
    req
) {

    const authorizationHeader =
        normalizeString(
            req.headers.authorization
        );

    if (!authorizationHeader) {

        return "";

    }

    const parts =
        authorizationHeader.split(
            /\s+/
        );

    if (
        parts.length !== 2 ||
        parts[0].toLowerCase() !==
            "bearer"
    ) {

        return "";

    }

    return normalizeString(
        parts[1]
    );

}

async function verifyAuthenticatedLearner(
    req
) {

    const firebaseIdToken =
        getBearerToken(
            req
        );

    if (!firebaseIdToken) {

        throw createServiceError({

            code:
                "AUTHENTICATION_REQUIRED",

            message:
                "Firebase authentication is required.",

            httpStatus:
                401

        });

    }

    let decodedToken;

    try {

        decodedToken =
            await admin
                .auth()
                .verifyIdToken(
                    firebaseIdToken,
                    true
                );

    } catch (
        verificationError
    ) {

        throw createServiceError({

            code:
                "AUTHENTICATION_INVALID",

            message:
                "The authenticated session is not valid.",

            httpStatus:
                401

        });

    }

    const uid =
        normalizeString(
            decodedToken.uid
        );

    const email =
        normalizeEmail(
            decodedToken.email
        );

    const emailVerified =
        decodedToken.email_verified ===
            true;

    if (!uid) {

        throw createServiceError({

            code:
                "AUTHENTICATION_INVALID",

            message:
                "The authenticated learner UID is unavailable.",

            httpStatus:
                401

        });

    }

    if (!email) {

        throw createServiceError({

            code:
                "AUTHENTICATED_EMAIL_MISSING",

            message:
                "The authenticated account does not contain an email address.",

            httpStatus:
                403

        });

    }

    if (!emailVerified) {

        throw createServiceError({

            code:
                "EMAIL_VERIFICATION_REQUIRED",

            message:
                "Please verify your email address before activating the credential.",

            httpStatus:
                403

        });

    }

    return Object.freeze({

        uid,
        email,
        emailVerified,
        decodedToken

    });

}

/* ==========================================================
   Authorized Administrator Verification

   An administrator is accepted when:

   1. The verified Firebase token contains an approved Admin
      custom claim; or

   2. The verified email appears in the AAU_ADMIN_EMAILS
      Cloud Run environment variable.

   Browser-supplied UID, email, role and authorization values
   are never trusted.
========================================================== */

async function verifyAuthorizedAdministrator(
    req
) {

    const firebaseIdToken =
        getBearerToken(
            req
        );

    if (!firebaseIdToken) {

        throw createServiceError({

            code:
                "ADMIN_AUTHENTICATION_REQUIRED",

            message:
                "Administrator authentication is required.",

            httpStatus:
                401

        });

    }

    let decodedToken;

    try {

        decodedToken =
            await admin
                .auth()
                .verifyIdToken(
                    firebaseIdToken,
                    true
                );

    } catch (
        verificationError
    ) {

        throw createServiceError({

            code:
                "ADMIN_AUTHENTICATION_INVALID",

            message:
                "The administrator session is not valid.",

            httpStatus:
                401

        });

    }

    const uid =
        normalizeString(
            decodedToken.uid
        );

    const email =
        normalizeEmail(
            decodedToken.email
        );

    const emailVerified =
        decodedToken.email_verified ===
            true;

    if (
        !uid ||
        !email
    ) {

        throw createServiceError({

            code:
                "ADMIN_IDENTITY_INCOMPLETE",

            message:
                "The administrator identity is incomplete.",

            httpStatus:
                403

        });

    }

    if (!emailVerified) {

        throw createServiceError({

            code:
                "ADMIN_EMAIL_VERIFICATION_REQUIRED",

            message:
                "The administrator email address must be verified.",

            httpStatus:
                403

        });

    }

    const configuredAdminEmails =
        resolveConfiguredAdminEmails();

    const normalizedRole =
        normalizeLower(
            decodedToken.role
        );

    const hasAdminCustomClaim =
        decodedToken.admin ===
            true ||
        decodedToken.is_admin ===
            true ||
        normalizedRole ===
            "admin" ||
        normalizedRole ===
            "administrator";

    const isConfiguredAdministrator =
        configuredAdminEmails.includes(
            email
        );

    if (
        !hasAdminCustomClaim &&
        !isConfiguredAdministrator
    ) {

        throw createServiceError({

            code:
                "ADMIN_AUTHORIZATION_REQUIRED",

            message:
                "This account is not authorized to assign learning resources.",

            httpStatus:
                403

        });

    }

    return Object.freeze({

        uid,
        email,

        authorizationSource:
            hasAdminCustomClaim
                ? "firebase_custom_claim"
                : "configured_admin_email",

        decodedToken

    });

}

/* ==========================================================
   Credential Lookup Helpers
========================================================== */

async function findCredentialByActivationRecord(
    activationData
) {

    const internalDocumentId =
        normalizeString(
            activationData
                .credential_document_id
        );

    /*
     * Preferred lookup:
     * use the server-controlled internal document reference
     * stored when the token was issued.
     */
    if (internalDocumentId) {

        const directSnapshot =
            await db
                .collection(
                    COLLECTIONS.credentials
                )
                .doc(
                    internalDocumentId
                )
                .get();

        if (
            directSnapshot.exists
        ) {

            return directSnapshot;

        }

    }

    /*
     * Safe compatibility fallback:
     * query by public credential_id.
     */
    const credentialId =
        normalizeString(
            activationData
                .credential_id
        );

    if (!credentialId) {

        return null;

    }

    const snapshot =
        await db
            .collection(
                COLLECTIONS.credentials
            )
            .where(
                "credential_id",
                "==",
                credentialId
            )
            .limit(
                2
            )
            .get();

    if (
        snapshot.size !== 1
    ) {

        return null;

    }

    return snapshot.docs[0];

}

/* ==========================================================
   Public Credential Verification API
========================================================== */

app.post(
    "/public/verify-credential",
    async (req, res) => {

        try {

            const credentialId =
                normalizeString(
                    req.body?.credential_id
                );

            const recaptchaToken =
                normalizeString(
                    req.body?.recaptchaToken
                );

            const signature =
                normalizeString(
                    req.body?.signature
                );

            /* ------------------------------------------
               Basic Validation
            ------------------------------------------ */

            if (!credentialId) {

                return res
                    .status(
                        400
                    )
                    .json({

                        status:
                            "error",

                        message:
                            "credential_id is required"

                    });

            }

            /* ------------------------------------------
               Rate Limiting
            ------------------------------------------ */

            const rateLimit =
                applyInMemoryRateLimit({

                    req,

                    store:
                        verificationRequestCounts,

                    windowMs:
                        60 * 1000,

                    maxRequests:
                        10

                });

            if (
                !rateLimit.allowed
            ) {

                return res
                    .status(
                        429
                    )
                    .json({

                        status:
                            "error",

                        message:
                            "Too many requests. Try again later."

                    });

            }

            /* ------------------------------------------
               reCAPTCHA
            ------------------------------------------ */

            const isHuman =
                await verifyRecaptcha(
                    recaptchaToken
                );

            if (!isHuman) {

                return res
                    .status(
                        403
                    )
                    .json({

                        status:
                            "error",

                        message:
                            "reCAPTCHA validation failed"

                    });

            }

            /* ------------------------------------------
               Signature Validation
            ------------------------------------------ */

            const validSignature =
                verifySignature(
                    credentialId,
                    signature
                );

            if (
                !validSignature
            ) {

                return res
                    .status(
                        403
                    )
                    .json({

                        status:
                            "error",

                        message:
                            "Invalid or tampered verification link"

                    });

            }

            /* ------------------------------------------
               Firestore Query
            ------------------------------------------ */

            const snapshot =
                await db
                    .collection(
                        COLLECTIONS.credentials
                    )
                    .where(
                        "credential_id",
                        "==",
                        credentialId
                    )
                    .limit(
                        1
                    )
                    .get();

            if (
                snapshot.empty
            ) {

                return res.json({

                    status:
                        "not_found"

                });

            }

            const credentialSnapshot =
                snapshot.docs[0];

            const credential =
                credentialSnapshot.data() || {};

            /* ------------------------------------------
               Issue Date Resolution
            ------------------------------------------ */

            let issueDate =
                null;

            if (
                credential.issued_on
            ) {

                issueDate =
                    resolveDate(
                        credential.issued_on
                    );

            } else if (
                credential.imported_at
            ) {

                issueDate =
                    resolveDate(
                        credential.imported_at
                    );

            } else if (
                credential.created_at
            ) {

                issueDate =
                    resolveDate(
                        credential.created_at
                    );

            } else if (
                credentialSnapshot.createTime
            ) {

                issueDate =
                    credentialSnapshot
                        .createTime
                        .toDate()
                        .toISOString();

            }

            /* ------------------------------------------
               Success
            ------------------------------------------ */

            return res.json({

                status:
                    "valid",

                full_name:
                    credential.full_name ||
                    null,

                credential_id:
                    credential.credential_id ||
                    null,

                credential_type:
                    credential.credential_type ||
                    null,

                program_code:
                    credential.program_code ||
                    null,

                issued_by:
                    credential.issued_by ||
                    "Agile AI University",

                issue_date:
                    issueDate ||
                    null

            });

        } catch (
            error
        ) {

            console.error(
                `[${SERVICE_NAME}] Verification error:`,
                error
            );

            return res
                .status(
                    500
                )
                .json({

                    status:
                        "error",

                    message:
                        "Internal server error"

                });

        }

    }
);

/* ==========================================================
   Credential Activation Claim API

   Endpoint
   ----------------------------------------------------------
   POST /api/v1/credential-activations/claim

   Authentication
   ----------------------------------------------------------
   Required:
   Authorization: Bearer <Firebase-ID-Token>

   Behaviour
   ----------------------------------------------------------
   - Verifies Firebase Authentication server-side.
   - Requires a verified authenticated email.
   - Revalidates the activation token.
   - Revalidates credential lifecycle.
   - Requires authenticated email to match credential email.
   - Atomically links credentials.learner_uid.
   - Atomically consumes the activation token.
   - Atomically writes the reconciliation audit event.
   - Atomically binds pre-staged learning resources.
   - Supports safe same-user retries.
   - Never trusts UID or email from the request body.
========================================================== */

app.post(
    "/api/v1/credential-activations/claim",
    async (req, res) => {

        const correlationId =
            createCorrelationId();

        try {

            /* ------------------------------------------
               Rate Limiting
            ------------------------------------------ */

            const rateLimit =
                applyInMemoryRateLimit({

                    req,

                    store:
                        activationRequestCounts,

                    windowMs:
                        ACTIVATION_CONFIG
                            .validateRateLimit
                            .windowMs,

                    maxRequests:
                        ACTIVATION_CONFIG
                            .validateRateLimit
                            .maxRequests

                });

            res.set(
                "X-RateLimit-Remaining",
                String(
                    rateLimit.remaining
                )
            );

            if (
                !rateLimit.allowed
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            429,

                        code:
                            "ACTIVATION_RATE_LIMITED",

                        message:
                            "Too many activation attempts. Please try again later.",

                        correlationId

                    }
                );

            }

            /* ------------------------------------------
               Request Validation
            ------------------------------------------ */

            const token =
                normalizeString(
                    req.body?.token
                );

            if (!token) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            400,

                        code:
                            "ACTIVATION_TOKEN_REQUIRED",

                        message:
                            "An activation token is required.",

                        correlationId

                    }
                );

            }

            if (
                token.length < 32 ||
                token.length > 512
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            400,

                        code:
                            "ACTIVATION_TOKEN_INVALID",

                        message:
                            "This activation invitation is not valid.",

                        correlationId

                    }
                );

            }

            /* ------------------------------------------
               Authentication
            ------------------------------------------ */

            const authenticatedLearner =
                await verifyAuthenticatedLearner(
                    req
                );

            /*
             * Identity is derived only from the verified
             * Firebase ID token.
             *
             * Browser-supplied UID or email values are ignored.
             */
            const authenticatedUid =
                authenticatedLearner.uid;

            const authenticatedEmail =
                authenticatedLearner.email;

            /* ------------------------------------------
               Token Hash
            ------------------------------------------ */

            const tokenHash =
                hashActivationToken(
                    token
                );

            /*
             * References are declared before the transaction.
             * The plain token is never logged or persisted.
             */
            let finalCredentialId =
                "";

            let finalProgramCode =
                "";

            let finalActivationState =
                "";

            let auditEventId =
                "";

            const transactionResult =
                await db.runTransaction(
                    async (
                        transaction
                    ) => {

                        /*
                         * Firestore transaction callbacks may
                         * execute more than once.
                         *
                         * Do not perform logging, token
                         * generation, external calls, Storage
                         * writes or email delivery here.
                         */

                        const activationQuery =
                            db
                                .collection(
                                    COLLECTIONS
                                        .activationTokens
                                )
                                .where(
                                    "token_hash",
                                    "==",
                                    tokenHash
                                )
                                .limit(
                                    2
                                );

                        const activationSnapshot =
                            await transaction.get(
                                activationQuery
                            );

                        if (
                            activationSnapshot.empty
                        ) {

                            throw createServiceError({

                                code:
                                    "ACTIVATION_TOKEN_INVALID",

                                message:
                                    "This activation invitation is not valid.",

                                httpStatus:
                                    400

                            });

                        }

                        if (
                            activationSnapshot.size !== 1
                        ) {

                            throw createServiceError({

                                code:
                                    "ACTIVATION_INTERNAL_ERROR",

                                message:
                                    "The activation invitation could not be processed.",

                                httpStatus:
                                    500

                            });

                        }

                        const activationDocument =
                            activationSnapshot.docs[0];

                        const activation =
                            activationDocument.data() || {};

                        const activationStatus =
                            normalizeLower(
                                activation.status
                            );

                        const credentialSnapshot =
                            await findCredentialByActivationRecord(
                                activation
                            );

                        if (
                            !credentialSnapshot
                        ) {

                            throw createServiceError({

                                code:
                                    "CREDENTIAL_NOT_FOUND",

                                message:
                                    "The credential associated with this invitation could not be found.",

                                httpStatus:
                                    404

                            });

                        }

                        /*
                         * Re-read the credential through the
                         * transaction to protect against
                         * concurrent ownership changes.
                         */
                        const credentialRef =
                            db
                                .collection(
                                    COLLECTIONS.credentials
                                )
                                .doc(
                                    credentialSnapshot.id
                                );

                        const transactionalCredentialSnapshot =
                            await transaction.get(
                                credentialRef
                            );

                        if (
                            !transactionalCredentialSnapshot
                                .exists
                        ) {

                            throw createServiceError({

                                code:
                                    "CREDENTIAL_NOT_FOUND",

                                message:
                                    "The credential associated with this invitation could not be found.",

                                httpStatus:
                                    404

                            });

                        }

                        const credential =
                            transactionalCredentialSnapshot
                                .data() || {};

                        const credentialId =
                            normalizeString(
                                credential.credential_id
                            ) ||
                            normalizeString(
                                activation.credential_id
                            );

                        const programCode =
                            normalizeUpper(
                                credential.program_code ||
                                activation.metadata
                                    ?.programme_code
                            );

                        const credentialEmail =
                            normalizeEmail(
                                credential.email ||
                                credential.email_normalized ||
                                credential.learner_email
                            );

                        const activationEmail =
                            normalizeEmail(
                                activation.email_normalized
                            );

                        const approvalStatus =
                            normalizeLower(
                                credential.approval_status
                            );

                        const issuedStatus =
                            normalizeLower(
                                credential.issued_status
                            );

                        const currentLearnerUid =
                            normalizeString(
                                credential.learner_uid
                            );

                        /* ----------------------------------
                           Same-User Idempotency
                        ---------------------------------- */

                        if (
                            currentLearnerUid &&
                            currentLearnerUid ===
                                authenticatedUid
                        ) {

                            if (
                                activationStatus ===
                                    ACTIVATION_CONFIG
                                        .allowedStatuses
                                        .consumed &&
                                normalizeString(
                                    activation
                                        .consumed_by_uid
                                ) ===
                                    authenticatedUid
                            ) {

                                return {

                                    activationStatus:
                                        "already_completed",

                                    credentialClaimed:
                                        true,

                                    credentialId,

                                    programCode,

                                    learningResourcesActivated:
                                        0,

                                    auditEventId:
                                        null

                                };

                            }

                            /*
                             * The same learner already owns the
                             * credential. An issued token may
                             * still be safely consumed after all
                             * identity and lifecycle checks.
                             */

                        } else if (
                            currentLearnerUid
                        ) {

                            throw createServiceError({

                                code:
                                    "CREDENTIAL_OWNERSHIP_CONFLICT",

                                message:
                                    "This credential is already linked to another learner account.",

                                httpStatus:
                                    409

                            });

                        }

                        /* ----------------------------------
                           Activation State
                        ---------------------------------- */

                        if (
                            activationStatus ===
                                ACTIVATION_CONFIG
                                    .allowedStatuses
                                    .revoked
                        ) {

                            throw createServiceError({

                                code:
                                    "ACTIVATION_TOKEN_REVOKED",

                                message:
                                    "This activation invitation is no longer valid.",

                                httpStatus:
                                    410

                            });

                        }

                        if (
                            activationStatus ===
                                ACTIVATION_CONFIG
                                    .allowedStatuses
                                    .blocked
                        ) {

                            throw createServiceError({

                                code:
                                    "ACTIVATION_TOKEN_BLOCKED",

                                message:
                                    "This activation invitation is no longer available.",

                                httpStatus:
                                    410

                            });

                        }

                        if (
                            activationStatus ===
                                ACTIVATION_CONFIG
                                    .allowedStatuses
                                    .expired ||
                            isTimestampExpired(
                                activation.expires_at
                            )
                        ) {

                            throw createServiceError({

                                code:
                                    "ACTIVATION_TOKEN_EXPIRED",

                                message:
                                    "This activation invitation has expired.",

                                httpStatus:
                                    410

                            });

                        }

                        if (
                            activationStatus ===
                                ACTIVATION_CONFIG
                                    .allowedStatuses
                                    .consumed
                        ) {

                            if (
                                normalizeString(
                                    activation
                                        .consumed_by_uid
                                ) ===
                                    authenticatedUid &&
                                currentLearnerUid ===
                                    authenticatedUid
                            ) {

                                return {

                                    activationStatus:
                                        "already_completed",

                                    credentialClaimed:
                                        true,

                                    credentialId,

                                    programCode,

                                    learningResourcesActivated:
                                        0,

                                    auditEventId:
                                        null

                                };

                            }

                            throw createServiceError({

                                code:
                                    "ACTIVATION_TOKEN_CONSUMED",

                                message:
                                    "This activation invitation has already been used.",

                                httpStatus:
                                    409

                            });

                        }

                        if (
                            activationStatus !==
                                ACTIVATION_CONFIG
                                    .allowedStatuses
                                    .issued
                        ) {

                            throw createServiceError({

                                code:
                                    "ACTIVATION_TOKEN_INVALID",

                                message:
                                    "This activation invitation is not valid.",

                                httpStatus:
                                    400

                            });

                        }

                        /* ----------------------------------
                           Credential Lifecycle
                        ---------------------------------- */

                        if (
                            approvalStatus !==
                                ACTIVATION_CONFIG
                                    .requiredApprovalStatus
                        ) {

                            throw createServiceError({

                                code:
                                    "CREDENTIAL_NOT_APPROVED",

                                message:
                                    "This credential is not currently eligible for activation.",

                                httpStatus:
                                    409

                            });

                        }

                        if (
                            issuedStatus !==
                                ACTIVATION_CONFIG
                                    .requiredIssuedStatus
                        ) {

                            throw createServiceError({

                                code:
                                    "CREDENTIAL_NOT_FINALIZED",

                                message:
                                    "This credential is not currently eligible for activation.",

                                httpStatus:
                                    409

                            });

                        }

                        /* ----------------------------------
                           Email Reconciliation
                        ---------------------------------- */

                        if (
                            !credentialEmail ||
                            !activationEmail ||
                            credentialEmail !==
                                activationEmail
                        ) {

                            throw createServiceError({

                                code:
                                    "ACTIVATION_DATA_CONFLICT",

                                message:
                                    "The activation invitation cannot currently be completed.",

                                httpStatus:
                                    409

                            });

                        }

                        if (
                            authenticatedEmail !==
                                credentialEmail
                        ) {

                            throw createServiceError({

                                code:
                                    "ACTIVATION_EMAIL_MISMATCH",

                                message:
                                    "Please sign in using the email address that received this activation invitation.",

                                httpStatus:
                                    403

                            });

                        }

                        /* ----------------------------------
                           Pending Learning-Resource Access

                           Locked architecture:
                           pre-staged assignments are matched
                           using verified email and Credential
                           ID. learner_uid is not required when
                           the assignment is created.

                           Matching access documents are bound
                           to the authenticated UID inside this
                           same transaction and become available
                           during the same authenticated session.
                        ---------------------------------- */

                        const pendingResourceAccessQuery =
                            db
                                .collection(
                                    COLLECTIONS
                                        .learnerResourceAccess
                                )
                                .where(
                                    "learner_email_normalized",
                                    "==",
                                    authenticatedEmail
                                )
                                .limit(
                                    LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                                        .maximumAssignmentsPerCredentialLookup
                                );

                        const pendingResourceAccessSnapshot =
                            await transaction.get(
                                pendingResourceAccessQuery
                            );

                        const matchingResourceAccessDocuments =
                            pendingResourceAccessSnapshot
                                .docs
                                .filter(
                                    (
                                        document
                                    ) => {

                                        const access =
                                            document.data() || {};

                                        return (

                                            normalizeUpper(
                                                access.credential_id
                                            ) ===
                                                normalizeUpper(
                                                    credentialId
                                                ) &&

                                            normalizeLower(
                                                access.identity_status
                                            ) ===
                                                "pending_activation" &&

                                            normalizeLower(
                                                access.access_status
                                            ) ===
                                                "pending_activation" &&

                                            !normalizeString(
                                                access.learner_uid
                                            )

                                        );

                                    }
                                );

                        /* ----------------------------------
                           Atomic Writes
                        ---------------------------------- */

                        const serverTimestamp =
                            admin.firestore
                                .FieldValue
                                .serverTimestamp();

                        if (
                            !currentLearnerUid
                        ) {

                            transaction.update(
                                credentialRef,
                                {

                                    learner_uid:
                                        authenticatedUid

                                }
                            );

                        }

                        matchingResourceAccessDocuments
                            .forEach(
                                (
                                    document
                                ) => {

                                    transaction.update(
                                        document.ref,
                                        {

                                            learner_uid:
                                                authenticatedUid,

                                            identity_status:
                                                "activated",

                                            access_status:
                                                "active",

                                            release_policy:
                                                LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                                                    .defaultReleasePolicyForActiveIdentity,

                                            activated_at:
                                                serverTimestamp,

                                            activated_by_uid:
                                                authenticatedUid,

                                            updated_at:
                                                serverTimestamp,

                                            updated_by_uid:
                                                authenticatedUid,

                                            updated_by_email:
                                                authenticatedEmail,

                                            last_mutation_source:
                                                "credential_activation_api"

                                        }
                                    );

                                }
                            );

                        transaction.update(
                            activationDocument.ref,
                            {

                                status:
                                    "consumed",

                                consumed_at:
                                    serverTimestamp,

                                consumed_by_uid:
                                    authenticatedUid,

                                updated_at:
                                    serverTimestamp,

                                last_attempt_at:
                                    serverTimestamp,

                                attempt_count:
                                    admin.firestore
                                        .FieldValue
                                        .increment(
                                            1
                                        ),

                                version:
                                    activation.version ||
                                    "1.0"

                            }
                        );

                        const auditRef =
                            db
                                .collection(
                                    COLLECTIONS
                                        .reconciliationEvents
                                )
                                .doc();

                        auditEventId =
                            auditRef.id;

                        transaction.create(
                            auditRef,
                            {

                                event_type:
                                    "credential_claimed",

                                credential_id:
                                    credentialId,

                                credential_document_id:
                                    credentialRef.id,

                                learner_uid:
                                    authenticatedUid,

                                email_normalized:
                                    authenticatedEmail,

                                actor_type:
                                    "learner",

                                actor_id:
                                    authenticatedUid,

                                source:
                                    "credential_activation_api",

                                result:
                                    "success",

                                reason:
                                    null,

                                created_at:
                                    serverTimestamp,

                                correlation_id:
                                    correlationId,

                                request_id:
                                    null,

                                activation_token_id:
                                    activationDocument.id,

                                version:
                                    "1.0",

                                metadata: {

                                    programme_code:
                                        programCode,

                                    campaign_id:
                                        activation.campaign_id ||
                                        null,

                                    ownership_state_before:
                                        currentLearnerUid
                                            ? "same_uid"
                                            : "unclaimed",

                                    ownership_state_after:
                                        "claimed",

                                    learning_resources_activated:
                                        matchingResourceAccessDocuments
                                            .length

                                }

                            }
                        );

                        return {

                            activationStatus:
                                currentLearnerUid
                                    ? "already_owned_and_completed"
                                    : "completed",

                            credentialClaimed:
                                true,

                            credentialId,

                            programCode,

                            learningResourcesActivated:
                                matchingResourceAccessDocuments
                                    .length,

                            auditEventId:
                                auditRef.id

                        };

                    }
                );

            finalCredentialId =
                transactionResult
                    .credentialId;

            finalProgramCode =
                transactionResult
                    .programCode;

            finalActivationState =
                transactionResult
                    .activationStatus;

            auditEventId =
                transactionResult
                    .auditEventId ||
                "";

            console.log(
                `[${SERVICE_NAME}] Credential activation ` +
                `completed. Credential: ` +
                `${finalCredentialId}. ` +
                `Learning resources activated: ` +
                `${transactionResult.learningResourcesActivated || 0}. ` +
                `Correlation ID: ${correlationId}. ` +
                `Audit event ID: ${auditEventId || "none"}.`
            );

            return res
                .status(
                    200
                )
                .json({

                    success:
                        true,

                    data: {

                        activationStatus:
                            finalActivationState,

                        credentialClaimed:
                            true,

                        credentialId:
                            finalCredentialId,

                        programCode:
                            finalProgramCode,

                        learningResourcesActivated:
                            transactionResult
                                .learningResourcesActivated ||
                            0,

                        redirectUrl:
                            "/index.html"

                    },

                    correlationId

                });

        } catch (
            error
        ) {

            const code =
                normalizeString(
                    error.code
                ) ||
                "ACTIVATION_INTERNAL_ERROR";

            const httpStatus =
                Number.isInteger(
                    error.httpStatus
                )
                    ? error.httpStatus
                    : 500;

            const publicMessage =
                httpStatus >= 500
                    ? "The credential activation could not be completed."
                    : error.message;

            if (
                httpStatus >= 500
            ) {

                console.error(
                    `[${SERVICE_NAME}] Credential claim ` +
                    `failed. Correlation ID: ` +
                    `${correlationId}`,
                    error
                );

            } else {

                console.warn(
                    `[${SERVICE_NAME}] Credential claim ` +
                    `rejected. Code: ${code}. ` +
                    `Correlation ID: ${correlationId}`
                );

            }

            return sendActivationError(
                res,
                {

                    httpStatus,

                    code,

                    message:
                        publicMessage,

                    correlationId

                }
            );

        }

    }
);

/* ==========================================================
   Credential Activation Token Validation API

   Endpoint
   ----------------------------------------------------------
   POST /api/v1/credential-activations/validate

   Behaviour
   ----------------------------------------------------------
   - Validates the plain activation token using SHA-256.
   - Does not persist or log the plain token.
   - Confirms token state and expiry.
   - Confirms credential lifecycle eligibility.
   - Confirms activation and credential email consistency.
   - Returns only safe activation metadata.
   - Does not mutate credential ownership.
========================================================== */

app.post(
    "/api/v1/credential-activations/validate",
    async (req, res) => {

        const correlationId =
            createCorrelationId();

        try {

            /* ------------------------------------------
               Rate Limiting
            ------------------------------------------ */

            const rateLimit =
                applyInMemoryRateLimit({

                    req,

                    store:
                        activationRequestCounts,

                    windowMs:
                        ACTIVATION_CONFIG
                            .validateRateLimit
                            .windowMs,

                    maxRequests:
                        ACTIVATION_CONFIG
                            .validateRateLimit
                            .maxRequests

                });

            res.set(
                "X-RateLimit-Remaining",
                String(
                    rateLimit.remaining
                )
            );

            if (
                !rateLimit.allowed
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            429,

                        code:
                            "ACTIVATION_RATE_LIMITED",

                        message:
                            "Too many activation attempts. Please try again later.",

                        correlationId

                    }
                );

            }

            /* ------------------------------------------
               Request Validation
            ------------------------------------------ */

            const token =
                normalizeString(
                    req.body?.token
                );

            if (!token) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            400,

                        code:
                            "ACTIVATION_TOKEN_REQUIRED",

                        message:
                            "An activation token is required.",

                        correlationId

                    }
                );

            }

            /*
             * Current issuance uses 32 random bytes encoded
             * with Base64 URL encoding. This defensive range
             * rejects malformed or abusive input without
             * coupling validation to one representation.
             */
            if (
                token.length < 32 ||
                token.length > 512
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            400,

                        code:
                            "ACTIVATION_TOKEN_INVALID",

                        message:
                            "This activation invitation is not valid.",

                        correlationId

                    }
                );

            }

            /* ------------------------------------------
               Token Hash Lookup
            ------------------------------------------ */

            const tokenHash =
                hashActivationToken(
                    token
                );

            /*
             * The plain token is not logged, persisted,
             * returned or included in errors.
             */
            const tokenSnapshot =
                await db
                    .collection(
                        COLLECTIONS.activationTokens
                    )
                    .where(
                        "token_hash",
                        "==",
                        tokenHash
                    )
                    .limit(
                        2
                    )
                    .get();

            if (
                tokenSnapshot.empty
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            400,

                        code:
                            "ACTIVATION_TOKEN_INVALID",

                        message:
                            "This activation invitation is not valid.",

                        correlationId

                    }
                );

            }

            /*
             * token_hash should be unique. More than one
             * result is treated as an integrity failure.
             */
            if (
                tokenSnapshot.size !== 1
            ) {

                console.error(
                    `[${SERVICE_NAME}] Duplicate activation ` +
                    `token hash detected. Correlation ID: ` +
                    `${correlationId}`
                );

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            500,

                        code:
                            "ACTIVATION_INTERNAL_ERROR",

                        message:
                            "The activation invitation could not be validated.",

                        correlationId

                    }
                );

            }

            const activationDocument =
                tokenSnapshot.docs[0];

            const activation =
                activationDocument.data() || {};

            const activationStatus =
                normalizeLower(
                    activation.status
                );

            /* ------------------------------------------
               Activation State Validation
            ------------------------------------------ */

            if (
                activationStatus ===
                    ACTIVATION_CONFIG
                        .allowedStatuses
                        .consumed
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            409,

                        code:
                            "ACTIVATION_TOKEN_CONSUMED",

                        message:
                            "This activation invitation has already been used.",

                        correlationId

                    }
                );

            }

            if (
                activationStatus ===
                    ACTIVATION_CONFIG
                        .allowedStatuses
                        .revoked
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            410,

                        code:
                            "ACTIVATION_TOKEN_REVOKED",

                        message:
                            "This activation invitation is no longer valid.",

                        correlationId

                    }
                );

            }

            if (
                activationStatus ===
                    ACTIVATION_CONFIG
                        .allowedStatuses
                        .blocked
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            410,

                        code:
                            "ACTIVATION_TOKEN_BLOCKED",

                        message:
                            "This activation invitation is no longer available.",

                        correlationId

                    }
                );

            }

            if (
                activationStatus ===
                    ACTIVATION_CONFIG
                        .allowedStatuses
                        .expired ||
                isTimestampExpired(
                    activation.expires_at
                )
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            410,

                        code:
                            "ACTIVATION_TOKEN_EXPIRED",

                        message:
                            "This activation invitation has expired.",

                        correlationId

                    }
                );

            }

            if (
                activationStatus !==
                    ACTIVATION_CONFIG
                        .allowedStatuses
                        .issued
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            400,

                        code:
                            "ACTIVATION_TOKEN_INVALID",

                        message:
                            "This activation invitation is not valid.",

                        correlationId

                    }
                );

            }

            /* ------------------------------------------
               Credential Lookup
            ------------------------------------------ */

            const credentialSnapshot =
                await findCredentialByActivationRecord(
                    activation
                );

            if (
                !credentialSnapshot
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            404,

                        code:
                            "CREDENTIAL_NOT_FOUND",

                        message:
                            "The credential associated with this invitation could not be found.",

                        correlationId

                    }
                );

            }

            const credential =
                credentialSnapshot.data() || {};

            /* ------------------------------------------
               Credential Lifecycle Validation
            ------------------------------------------ */

            const approvalStatus =
                normalizeLower(
                    credential.approval_status
                );

            const issuedStatus =
                normalizeLower(
                    credential.issued_status
                );

            if (
                approvalStatus !==
                    ACTIVATION_CONFIG
                        .requiredApprovalStatus
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            409,

                        code:
                            "CREDENTIAL_NOT_APPROVED",

                        message:
                            "This credential is not currently eligible for activation.",

                        correlationId

                    }
                );

            }

            if (
                issuedStatus !==
                    ACTIVATION_CONFIG
                        .requiredIssuedStatus
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            409,

                        code:
                            "CREDENTIAL_NOT_FINALIZED",

                        message:
                            "This credential is not currently eligible for activation.",

                        correlationId

                    }
                );

            }

            /*
             * Initial validation requires an unclaimed
             * credential. Idempotent same-user processing is
             * handled only in the authenticated claim route.
             */
            if (
                credential.learner_uid !==
                    null &&
                typeof credential.learner_uid !==
                    "undefined"
            ) {

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            409,

                        code:
                            "CREDENTIAL_ALREADY_CLAIMED",

                        message:
                            "This credential has already been activated.",

                        correlationId

                    }
                );

            }

            /* ------------------------------------------
               Email Consistency Validation
            ------------------------------------------ */

            const activationEmail =
                normalizeEmail(
                    activation.email_normalized
                );

            const credentialEmail =
                normalizeEmail(
                    credential.email ||
                    credential.email_normalized ||
                    credential.learner_email
                );

            if (
                !activationEmail ||
                !credentialEmail ||
                activationEmail !==
                    credentialEmail
            ) {

                console.error(
                    `[${SERVICE_NAME}] Activation email ` +
                    `consistency failure for credential ` +
                    `"${normalizeString(
                        activation.credential_id
                    )}". Correlation ID: ` +
                    `${correlationId}`
                );

                return sendActivationError(
                    res,
                    {

                        httpStatus:
                            409,

                        code:
                            "ACTIVATION_DATA_CONFLICT",

                        message:
                            "The activation invitation cannot currently be completed.",

                        correlationId

                    }
                );

            }

            /* ------------------------------------------
               Successful Safe Response
            ------------------------------------------ */

            const credentialId =
                normalizeString(
                    credential.credential_id
                ) ||
                normalizeString(
                    activation.credential_id
                );

            const programCode =
                normalizeUpper(
                    credential.program_code ||
                    activation.metadata
                        ?.programme_code
                );

            return res
                .status(
                    200
                )
                .json({

                    success:
                        true,

                    data: {

                        activationStatus:
                            "valid",

                        credentialId,

                        programCode,

                        programName:
                            normalizeString(
                                credential.program_name
                            ) ||
                            getProgrammeName(
                                programCode
                            ),

                        /*
                         * Historical AOP credentials remain
                         * AOP. credential_type is deliberately
                         * omitted because legacy records may
                         * contain inconsistent values.
                         */
                        emailHint:
                            maskEmail(
                                credentialEmail
                            ),

                        expiresAt:
                            resolveDate(
                                activation.expires_at
                            ),

                        requiresAuthentication:
                            true,

                        requiresVerifiedEmail:
                            true

                    },

                    correlationId

                });

        } catch (
            error
        ) {

            console.error(
                `[${SERVICE_NAME}] Activation validation ` +
                `failed. Correlation ID: ` +
                `${correlationId}`,
                error
            );

            return sendActivationError(
                res,
                {

                    httpStatus:
                        500,

                    code:
                        "ACTIVATION_INTERNAL_ERROR",

                    message:
                        "The activation invitation could not be validated.",

                    correlationId

                }
            );

        }

    }
);

/* ==========================================================
   Health Check
========================================================== */

app.get(
    "/",
    (req, res) => {

        return res
            .status(
                200
            )
            .send(
                `${SERVICE_NAME} v${SERVICE_VERSION} is running`
            );

    }
);

app.get(
    "/health",
    (req, res) => {

        return res
            .status(
                200
            )
            .json({

                status:
                    "healthy",

                service:
                    SERVICE_NAME,

                version:
                    SERVICE_VERSION,

                project:
                    process.env
                        .GOOGLE_CLOUD_PROJECT ||
                    EXPECTED_PROJECT_ID,

                capabilities: {

                    credentialVerification:
                        true,

                    credentialActivation:
                        true,

                    learnerLearningResources:
                        true,

                    learnerResourceAssignment:
                        true,

                    preLoginResourceStaging:
                        true,

                    personalizedProtectedDelivery:
                        true

                }

            });

    }
);

/* ==========================================================
   Optional Public Verification GET Helper
========================================================== */

app.get(
    "/public/verify-credential",
    (req, res) => {

        return res
            .status(
                405
            )
            .send(
                "Use POST method with JSON body { credential_id }"
            );

    }
);

/* ==========================================================
   Credential Registry API

   API Version : 1.1.0
   Status      : Read Only

   Important
   ----------------------------------------------------------
   Existing behaviour is preserved.

   This legacy registry endpoint is intentionally not reused
   as the authority for assignment. The governed Admin
   assignment endpoint performs its own authenticated and
   narrowly scoped credential lookup.
========================================================== */

app.post(
    "/admin/credential-registry",
    async (req, res) => {

        try {

            const snapshot =
                await db
                    .collection(
                        COLLECTIONS.credentials
                    )
                    .get();

            const credentials =
                snapshot.docs.map(
                    (
                        document
                    ) => {

                        const data =
                            document.data() || {};

                        return {

                            credential_id:
                                data.credential_id ||
                                "",

                            full_name:
                                data.full_name ||
                                "",

                            email:
                                data.email ||
                                "",

                            program_code:
                                data.program_code ||
                                "",

                            program_name:
                                data.program_name ||
                                "",

                            credential_type:
                                data.credential_type ||
                                "",

                            issued_status:
                                data.issued_status ||
                                "",

                            issued_by:
                                data.issued_by ||
                                "",

                            batch_name:
                                data.batch_name ||
                                "",

                            approval_status:
                                data.approval_status ||
                                "",

                            training_start_date:
                                data.training_start_date ||
                                "",

                            training_end_date:
                                data.training_end_date ||
                                "",

                            imported_at:
                                data.imported_at ||
                                null

                        };

                    }
                );

            return res.json({

                status:
                    "success",

                version:
                    "1.1.0",

                api:
                    "credential-registry",

                total_records:
                    credentials.length,

                credentials

            });

        } catch (
            error
        ) {

            console.error(
                `[${SERVICE_NAME}] ` +
                `Credential Registry Error:`,
                error
            );

            return res
                .status(
                    500
                )
                .json({

                    status:
                        "error",

                    version:
                        "1.1.0",

                    api:
                        "credential-registry",

                    message:
                        "Failed to load credential registry"

                });

        }

    }
);

/* ==========================================================
   Governed Learner Resource Assignment Helpers

   Architecture
   ----------------------------------------------------------
   1. Admin identity is verified from Firebase.
   2. Credential is resolved from Credential ID.
   3. Supplied learner email must match the credential.
   4. learner_uid may be absent.
   5. Published active resource is resolved from its internal
      resource document ID.
   6. Credential and resource programme codes must match.
   7. Personalized PDF is written to protected Storage.
   8. learner_resource_access is created transactionally.
   9. Uploaded Storage object is deleted if access creation
      cannot be completed.
========================================================== */

function resolveCredentialEmail(
    credential
) {

    return normalizeEmail(
        credential.email ||
        credential.email_normalized ||
        credential.learner_email
    );

}

function resolveCredentialLearnerUid(
    credential
) {

    return normalizeString(
        credential.learner_uid
    );

}

function resolveCredentialFullName(
    credential
) {

    return normalizeString(
        credential.full_name ||
        credential.learner_name ||
        credential.name
    );

}

function resolveCredentialProgramCode(
    credential
) {

    return normalizeUpper(
        credential.program_code
    );

}

function validateCredentialForResourceAssignment(
    credential
) {

    const approvalStatus =
        normalizeLower(
            credential.approval_status
        );

    const issuedStatus =
        normalizeLower(
            credential.issued_status
        );

    if (
        approvalStatus !==
            ACTIVATION_CONFIG
                .requiredApprovalStatus
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_CREDENTIAL_NOT_APPROVED",

            message:
                "The credential is not approved for learning-resource assignment.",

            httpStatus:
                409

        });

    }

    if (
        issuedStatus !==
            ACTIVATION_CONFIG
                .requiredIssuedStatus
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_CREDENTIAL_NOT_FINALIZED",

            message:
                "The credential is not finalized for learning-resource assignment.",

            httpStatus:
                409

        });

    }

}

async function resolveAssignmentCredential({
    credentialId,
    learnerEmail
}) {

    const normalizedCredentialId =
        normalizeUpper(
            credentialId
        );

    const normalizedLearnerEmail =
        normalizeEmail(
            learnerEmail
        );

    if (
        !normalizedCredentialId
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_CREDENTIAL_ID_REQUIRED",

            message:
                "Credential ID is required.",

            httpStatus:
                400

        });

    }

    if (
        !isValidEmail(
            normalizedLearnerEmail
        )
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_LEARNER_EMAIL_INVALID",

            message:
                "A valid learner email address is required.",

            httpStatus:
                400

        });

    }

    const credentialSnapshot =
        await db
            .collection(
                COLLECTIONS.credentials
            )
            .where(
                "credential_id",
                "==",
                normalizedCredentialId
            )
            .limit(
                2
            )
            .get();

    if (
        credentialSnapshot.empty
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_CREDENTIAL_NOT_FOUND",

            message:
                "The learner credential could not be found.",

            httpStatus:
                404

        });

    }

    if (
        credentialSnapshot.size !== 1
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_CREDENTIAL_INTEGRITY_CONFLICT",

            message:
                "The learner credential could not be uniquely resolved.",

            httpStatus:
                409

        });

    }

    const credentialDocument =
        credentialSnapshot.docs[0];

    const credential =
        credentialDocument.data() || {};

    validateCredentialForResourceAssignment(
        credential
    );

    const storedCredentialId =
        normalizeUpper(
            credential.credential_id
        );

    const credentialEmail =
        resolveCredentialEmail(
            credential
        );

    if (
        storedCredentialId !==
            normalizedCredentialId
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_CREDENTIAL_DATA_CONFLICT",

            message:
                "The credential data is inconsistent.",

            httpStatus:
                409

        });

    }

    if (
        !credentialEmail ||
        credentialEmail !==
            normalizedLearnerEmail
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_LEARNER_EMAIL_MISMATCH",

            message:
                "The learner email does not match the credential record.",

            httpStatus:
                409

        });

    }

    const programCode =
        resolveCredentialProgramCode(
            credential
        );

    if (
        !programCode
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_CREDENTIAL_PROGRAM_MISSING",

            message:
                "The credential does not contain a programme code.",

            httpStatus:
                409

        });

    }

    const learnerUid =
        resolveCredentialLearnerUid(
            credential
        );

    return Object.freeze({

        credentialDocumentId:
            credentialDocument.id,

        credentialId:
            storedCredentialId,

        learnerEmail:
            credentialEmail,

        learnerUid:
            learnerUid ||
            null,

        learnerName:
            resolveCredentialFullName(
                credential
            ) ||
            null,

        programCode,

        identityStatus:
            learnerUid
                ? "activated"
                : "pending_activation",

        accessStatus:
            learnerUid
                ? "active"
                : "pending_activation",

        identitySource:
            learnerUid
                ? "authenticated_identity"
                : "historical_credential",

        credential

    });

}

function validatePublishedAssignmentResource(
    resource
) {

    if (
        normalizeLower(
            resource.status
        ) !==
            "published"
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_RESOURCE_NOT_PUBLISHED",

            message:
                "The learning resource must be published before assignment.",

            httpStatus:
                409

        });

    }

    if (
        resource.is_active !==
            true
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_RESOURCE_NOT_ACTIVE",

            message:
                "The learning resource is not active.",

            httpStatus:
                409

        });

    }

    const resourceId =
        normalizeString(
            resource.resource_id
        );

    const programCode =
        normalizeUpper(
            resource.program_code
        );

    const version =
        normalizePositiveInteger(
            resource.version,
            null
        );

    if (
        !resourceId ||
        !programCode ||
        !version
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_RESOURCE_DATA_INCOMPLETE",

            message:
                "The published learning-resource record is incomplete.",

            httpStatus:
                409

        });

    }

}

async function resolveAssignmentResource(
    resourceDocumentId
) {

    const normalizedDocumentId =
        normalizeString(
            resourceDocumentId
        );

    if (
        !normalizedDocumentId
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_RESOURCE_ID_REQUIRED",

            message:
                "A learning-resource document ID is required.",

            httpStatus:
                400

        });

    }

    const resourceSnapshot =
        await db
            .collection(
                COLLECTIONS.learningResources
            )
            .doc(
                normalizedDocumentId
            )
            .get();

    if (
        !resourceSnapshot.exists
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_RESOURCE_NOT_FOUND",

            message:
                "The learning resource could not be found.",

            httpStatus:
                404

        });

    }

    const resource =
        resourceSnapshot.data() || {};

    validatePublishedAssignmentResource(
        resource
    );

    return Object.freeze({

        resourceDocumentId:
            resourceSnapshot.id,

        resourceId:
            normalizeString(
                resource.resource_id
            ),

        programCode:
            normalizeUpper(
                resource.program_code
            ),

        version:
            normalizePositiveInteger(
                resource.version,
                1
            ),

        title:
            normalizeString(
                resource.title
            ),

        description:
            normalizeString(
                resource.description
            ),

        resourceType:
            normalizeLower(
                resource.resource_type
            ),

        category:
            normalizeLower(
                resource.category
            ),

        resource

    });

}

function validateCredentialResourceCompatibility({
    credential,
    resource
}) {

    if (
        credential.programCode !==
            resource.programCode
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_PROGRAM_MISMATCH",

            message:
                "The credential programme does not match the learning resource programme.",

            httpStatus:
                409

        });

    }

}

function validateAssignmentPdfFile(
    file
) {

    if (
        !file
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_FILE_REQUIRED",

            message:
                "A personalized PDF learning-resource file is required.",

            httpStatus:
                400

        });

    }

    const mimeType =
        normalizeLower(
            file.mimetype
        );

    if (
        !LEARNER_RESOURCE_ASSIGNMENT_CONFIG
            .allowedMimeTypes
            .includes(
                mimeType
            )
    ) {

        throw createServiceError({

            code:
                "LEARNING_RESOURCE_FILE_TYPE_INVALID",

            message:
                "Only personalized PDF learning materials may be uploaded.",

            httpStatus:
                400

        });

    }

    if (
        !Buffer.isBuffer(
            file.buffer
        ) ||
        file.buffer.length ===
            0
    ) {

        throw createServiceError({

            code:
                "ASSIGNMENT_FILE_EMPTY",

            message:
                "The personalized learning-resource file is empty.",

            httpStatus:
                400

        });

    }

    if (
        file.buffer.length >
            LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                .maximumFileSizeBytes
    ) {

        throw createServiceError({

            code:
                "LEARNING_RESOURCE_FILE_TOO_LARGE",

            message:
                "The personalized learning-resource file must not exceed 50 MiB.",

            httpStatus:
                413

        });

    }

    /*
     * Minimal PDF signature check.
     *
     * MIME type alone is browser-controlled. This does not
     * deeply parse the PDF, but it prevents obvious non-PDF
     * files from being accepted under a spoofed MIME type.
     */
    const pdfSignature =
        file.buffer
            .subarray(
                0,
                5
            )
            .toString(
                "ascii"
            );

    if (
        pdfSignature !==
            "%PDF-"
    ) {

        throw createServiceError({

            code:
                "LEARNING_RESOURCE_FILE_CONTENT_INVALID",

            message:
                "The uploaded file is not a valid PDF document.",

            httpStatus:
                400

        });

    }

}

function resolveLearningResourceBucketName() {

    return (
        normalizeString(
            process.env
                .LEARNING_RESOURCE_BUCKET
        ) ||
        "fb-agileai-university.firebasestorage.app"
    );

}

function buildLicensedStoragePath({
    programCode,
    resourceId,
    credentialId,
    resourceVersion,
    fileName
}) {

    const safeProgramCode =
        sanitizeStorageSegment(
            normalizeUpper(
                programCode
            ),
            "PROGRAM"
        );

    const safeResourceId =
        sanitizeStorageSegment(
            resourceId,
            "RESOURCE"
        );

    const safeCredentialId =
        sanitizeStorageSegment(
            normalizeUpper(
                credentialId
            ),
            "CREDENTIAL"
        );

    const safeVersion =
        normalizePositiveInteger(
            resourceVersion,
            1
        );

    const safeFileName =
        sanitizeLicensedFileName(
            fileName,
            safeCredentialId
        );

    return [

        LEARNER_RESOURCE_ASSIGNMENT_CONFIG
            .storageRoot,

        safeProgramCode,

        safeResourceId,

        LEARNER_RESOURCE_ASSIGNMENT_CONFIG
            .licensedDirectory,

        safeCredentialId,

        `v${safeVersion}`,

        safeFileName

    ].join(
        "/"
    );

}

async function uploadPersonalizedLearningResource({
    file,
    storagePath,
    administrator,
    credential,
    resource,
    correlationId
}) {

    const bucketName =
        resolveLearningResourceBucketName();

    const bucket =
        admin
            .storage()
            .bucket(
                bucketName
            );

    const storageFile =
        bucket.file(
            storagePath
        );

    await storageFile.save(
        file.buffer,
        {

            resumable:
                false,

            validation:
                "crc32c",

            metadata: {

                contentType:
                    "application/pdf",

                cacheControl:
                    "private, no-store, max-age=0",

                metadata: {

                    aauStorageDomain:
                        LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                            .storageDomain,

                    aauAssignmentSource:
                        LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                            .assignmentSource,

                    aauCredentialId:
                        credential.credentialId,

                    aauProgramCode:
                        credential.programCode,

                    aauResourceId:
                        resource.resourceId,

                    aauResourceDocumentId:
                        resource.resourceDocumentId,

                    aauResourceVersion:
                        String(
                            resource.version
                        ),

                    aauAssignedByUid:
                        administrator.uid,

                    aauAssignedByEmail:
                        administrator.email,

                    aauCorrelationId:
                        correlationId

                }

            }

        }
    );

    return Object.freeze({

        bucketName,

        storagePath,

        fileName:
            storagePath
                .split("/")
                .pop(),

        mimeType:
            "application/pdf",

        sizeBytes:
            file.buffer.length

    });

}

async function deleteUploadedAssignmentFile({
    bucketName,
    storagePath,
    correlationId
}) {

    if (
        !bucketName ||
        !storagePath
    ) {

        return false;

    }

    try {

        await admin
            .storage()
            .bucket(
                bucketName
            )
            .file(
                storagePath
            )
            .delete({

                ignoreNotFound:
                    true

            });

        return true;

    } catch (
        rollbackError
    ) {

        console.error(
            `[${SERVICE_NAME}] Assignment file rollback failed. ` +
            `Storage path: ${storagePath}. ` +
            `Correlation ID: ${correlationId}.`,
            rollbackError
        );

        return false;

    }

}

function resolveAssignmentPermissions({
    previewAllowed,
    downloadAllowed
}) {

    return Object.freeze({

        previewAllowed:
            normalizeBoolean(
                previewAllowed,
                true
            ),

        downloadAllowed:
            normalizeBoolean(
                downloadAllowed,
                true
            )

    });

}

function createLearnerResourceAccessPayload({
    credential,
    resource,
    uploadedFile,
    administrator,
    permissions,
    correlationId,
    serverTimestamp
}) {

    const activatedIdentity =
        Boolean(
            credential.learnerUid
        );

    return {

        learner_uid:
            credential.learnerUid ||
            null,

        learner_email:
            credential.learnerEmail,

        learner_email_normalized:
            credential.learnerEmail,

        learner_name:
            credential.learnerName ||
            null,

        credential_id:
            credential.credentialId,

        credential_document_id:
            credential.credentialDocumentId,

        program_code:
            credential.programCode,

        resource_id:
            resource.resourceId,

        resource_document_id:
            resource.resourceDocumentId,

        resource_version:
            resource.version,

        resource_title:
            resource.title ||
            null,

        access_type:
            LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                .defaultAccessType,

        identity_source:
            credential.identitySource,

        identity_status:
            credential.identityStatus,

        access_status:
            credential.accessStatus,

        release_status:
            LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                .defaultReleaseStatus,

        release_policy:
            activatedIdentity
                ? LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                    .defaultReleasePolicyForActiveIdentity
                : LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                    .defaultReleasePolicyForPendingIdentity,

        preview_allowed:
            permissions.previewAllowed,

        download_allowed:
            permissions.downloadAllowed,

        available_from:
            null,

        available_until:
            null,

        delivery_type:
            LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                .deliveryType,

        delivery_storage_domain:
            LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                .storageDomain,

        delivery_storage_bucket:
            uploadedFile.bucketName,

        delivery_storage_path:
            uploadedFile.storagePath,

        delivery_file_name:
            uploadedFile.fileName,

        delivery_mime_type:
            uploadedFile.mimeType,

        delivery_size_bytes:
            uploadedFile.sizeBytes,

        status:
            "active",

        is_active:
            true,

        assigned_at:
            serverTimestamp,

        assigned_by_uid:
            administrator.uid,

        assigned_by_email:
            administrator.email,

        created_at:
            serverTimestamp,

        created_by_uid:
            administrator.uid,

        created_by_email:
            administrator.email,

        updated_at:
            serverTimestamp,

        updated_by_uid:
            administrator.uid,

        updated_by_email:
            administrator.email,

        activated_at:
            activatedIdentity
                ? serverTimestamp
                : null,

        activated_by_uid:
            activatedIdentity
                ? credential.learnerUid
                : null,

        source:
            LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                .assignmentSource,

        last_mutation_source:
            LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                .assignmentSource,

        correlation_id:
            correlationId,

        schema_version:
            LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                .schemaVersion

    };

}

async function createLearnerResourceAccess({
    accessId,
    credential,
    resource,
    uploadedFile,
    administrator,
    permissions,
    correlationId
}) {

    const accessRef =
        db
            .collection(
                COLLECTIONS
                    .learnerResourceAccess
            )
            .doc(
                accessId
            );

    return db.runTransaction(
        async (
            transaction
        ) => {

            const existingSnapshot =
                await transaction.get(
                    accessRef
                );

            if (
                existingSnapshot.exists
            ) {

                const existing =
                    existingSnapshot.data() || {};

                const sameAssignment =
                    normalizeUpper(
                        existing.credential_id
                    ) ===
                        credential.credentialId &&

                    normalizeString(
                        existing.resource_document_id
                    ) ===
                        resource.resourceDocumentId &&

                    normalizeEmail(
                        existing.learner_email_normalized
                    ) ===
                        credential.learnerEmail;

                if (
                    !sameAssignment
                ) {

                    throw createServiceError({

                        code:
                            "ASSIGNMENT_ACCESS_ID_CONFLICT",

                        message:
                            "The generated learner-resource access ID conflicts with another assignment.",

                        httpStatus:
                            409

                    });

                }

                throw createServiceError({

                    code:
                        "ASSIGNMENT_ALREADY_EXISTS",

                    message:
                        "This learning resource is already assigned to the learner.",

                    httpStatus:
                        409

                });

            }

            /*
             * Re-read the credential inside the transaction so
             * that a first-login activation occurring between
             * initial resolution and access creation does not
             * create a stale pending assignment.
             */
            const credentialRef =
                db
                    .collection(
                        COLLECTIONS.credentials
                    )
                    .doc(
                        credential
                            .credentialDocumentId
                    );

            const currentCredentialSnapshot =
                await transaction.get(
                    credentialRef
                );

            if (
                !currentCredentialSnapshot.exists
            ) {

                throw createServiceError({

                    code:
                        "ASSIGNMENT_CREDENTIAL_NOT_FOUND",

                    message:
                        "The learner credential is no longer available.",

                    httpStatus:
                        404

                });

            }

            const currentCredential =
                currentCredentialSnapshot.data() || {};

            const currentCredentialEmail =
                resolveCredentialEmail(
                    currentCredential
                );

            const currentCredentialId =
                normalizeUpper(
                    currentCredential
                        .credential_id
                );

            const currentProgramCode =
                resolveCredentialProgramCode(
                    currentCredential
                );

            if (
                currentCredentialEmail !==
                    credential.learnerEmail ||
                currentCredentialId !==
                    credential.credentialId ||
                currentProgramCode !==
                    credential.programCode
            ) {

                throw createServiceError({

                    code:
                        "ASSIGNMENT_CREDENTIAL_CHANGED",

                    message:
                        "The learner credential changed while the assignment was being processed.",

                    httpStatus:
                        409

                });

            }

            validateCredentialForResourceAssignment(
                currentCredential
            );

            const currentLearnerUid =
                resolveCredentialLearnerUid(
                    currentCredential
                );

            const effectiveCredential =
                Object.freeze({

                    ...credential,

                    learnerUid:
                        currentLearnerUid ||
                        null,

                    identityStatus:
                        currentLearnerUid
                            ? "activated"
                            : "pending_activation",

                    accessStatus:
                        currentLearnerUid
                            ? "active"
                            : "pending_activation",

                    identitySource:
                        currentLearnerUid
                            ? "authenticated_identity"
                            : "historical_credential"

                });

            const serverTimestamp =
                admin.firestore
                    .FieldValue
                    .serverTimestamp();

            const payload =
                createLearnerResourceAccessPayload({

                    credential:
                        effectiveCredential,

                    resource,

                    uploadedFile,

                    administrator,

                    permissions,

                    correlationId,

                    serverTimestamp

                });

            transaction.create(
                accessRef,
                payload
            );

            return {

                accessId:
                    accessRef.id,

                learnerUid:
                    effectiveCredential
                        .learnerUid,

                identityStatus:
                    effectiveCredential
                        .identityStatus,

                accessStatus:
                    effectiveCredential
                        .accessStatus,

                releasePolicy:
                    payload.release_policy

            };

        }
    );

}

/* ==========================================================
   Governed Admin Learner Resource Assignment API

   Endpoint
   ----------------------------------------------------------
   POST /api/v1/admin/learning-resources/
        :resourceDocumentId/assign

   Content Type
   ----------------------------------------------------------
   multipart/form-data

   Required fields
   ----------------------------------------------------------
   file
   credential_id
   learner_email

   Optional fields
   ----------------------------------------------------------
   preview_allowed
   download_allowed

   Identity Behaviour
   ----------------------------------------------------------
   Activated learner:
   learner_uid      = Firebase UID
   identity_status  = activated
   access_status    = active
   release_policy   = immediate

   Pending learner:
   learner_uid      = null
   identity_status  = pending_activation
   access_status    = pending_activation
   release_policy   = on_activation
========================================================== */

app.post(
    "/api/v1/admin/learning-resources/:resourceDocumentId/assign",

    handleLearnerResourceAssignmentUpload,

    async (req, res) => {

        const correlationId =
            createCorrelationId();

        let uploadedFile =
            null;

        try {

            applyPrivateNoStoreHeaders(
                res
            );

            const administrator =
                await verifyAuthorizedAdministrator(
                    req
                );

            validateAssignmentPdfFile(
                req.file
            );

            const credentialId =
                normalizeUpper(
                    req.body?.credential_id
                );

            const learnerEmail =
                normalizeEmail(
                    req.body?.learner_email
                );

            const credential =
                await resolveAssignmentCredential({

                    credentialId,

                    learnerEmail

                });

            const resource =
                await resolveAssignmentResource(
                    req.params
                        .resourceDocumentId
                );

            validateCredentialResourceCompatibility({

                credential,

                resource

            });

            const permissions =
                resolveAssignmentPermissions({

                    previewAllowed:
                        req.body?.preview_allowed,

                    downloadAllowed:
                        req.body?.download_allowed

                });

            const licensedFileName =
                sanitizeLicensedFileName(
                    req.file.originalname,
                    credential.credentialId
                );

            const storagePath =
                buildLicensedStoragePath({

                    programCode:
                        resource.programCode,

                    resourceId:
                        resource.resourceId,

                    credentialId:
                        credential.credentialId,

                    resourceVersion:
                        resource.version,

                    fileName:
                        licensedFileName

                });

            const accessId =
                buildLearnerResourceAccessId({

                    learnerUid:
                        credential.learnerUid,

                    learnerEmail:
                        credential.learnerEmail,

                    credentialId:
                        credential.credentialId,

                    resourceDocumentId:
                        resource.resourceDocumentId

                });

            /*
             * Check the deterministic access ID before Storage
             * upload to avoid overwriting an existing licensed
             * file during an ordinary duplicate request.
             */
            const preExistingAccessSnapshot =
                await db
                    .collection(
                        COLLECTIONS
                            .learnerResourceAccess
                    )
                    .doc(
                        accessId
                    )
                    .get();

            if (
                preExistingAccessSnapshot.exists
            ) {

                throw createServiceError({

                    code:
                        "ASSIGNMENT_ALREADY_EXISTS",

                    message:
                        "This learning resource is already assigned to the learner.",

                    httpStatus:
                        409

                });

            }

            uploadedFile =
                await uploadPersonalizedLearningResource({

                    file:
                        req.file,

                    storagePath,

                    administrator,

                    credential,

                    resource,

                    correlationId

                });

            let assignmentResult;

            try {

                assignmentResult =
                    await createLearnerResourceAccess({

                        accessId,

                        credential,

                        resource,

                        uploadedFile,

                        administrator,

                        permissions,

                        correlationId

                    });

            } catch (
                assignmentError
            ) {

                await deleteUploadedAssignmentFile({

                    bucketName:
                        uploadedFile.bucketName,

                    storagePath:
                        uploadedFile.storagePath,

                    correlationId

                });

                uploadedFile =
                    null;

                throw assignmentError;

            }

            console.log(
                `[${SERVICE_NAME}] Learner resource assigned. ` +
                `Access ID: ${assignmentResult.accessId}. ` +
                `Credential ID: ${credential.credentialId}. ` +
                `Resource ID: ${resource.resourceId}. ` +
                `Identity status: ${assignmentResult.identityStatus}. ` +
                `Assigned by: ${administrator.email}. ` +
                `Correlation ID: ${correlationId}.`
            );

            return res
                .status(
                    201
                )
                .json({

                    success:
                        true,

                    data: {

                        assignmentStatus:
                            "completed",

                        accessId:
                            assignmentResult
                                .accessId,

                        resourceDocumentId:
                            resource
                                .resourceDocumentId,

                        resourceId:
                            resource
                                .resourceId,

                        resourceVersion:
                            resource
                                .version,

                        resourceTitle:
                            resource
                                .title ||
                            null,

                        credentialId:
                            credential
                                .credentialId,

                        learnerName:
                            credential
                                .learnerName ||
                            null,

                        learnerEmail:
                            credential
                                .learnerEmail,

                        learnerUid:
                            assignmentResult
                                .learnerUid ||
                            null,

                        identityStatus:
                            assignmentResult
                                .identityStatus,

                        accessStatus:
                            assignmentResult
                                .accessStatus,

                        releaseStatus:
                            LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                                .defaultReleaseStatus,

                        releasePolicy:
                            assignmentResult
                                .releasePolicy,

                        previewAllowed:
                            permissions
                                .previewAllowed,

                        downloadAllowed:
                            permissions
                                .downloadAllowed,

                        fileName:
                            uploadedFile
                                .fileName,

                        mimeType:
                            uploadedFile
                                .mimeType,

                        sizeBytes:
                            uploadedFile
                                .sizeBytes

                    },

                    meta: {

                        apiVersion:
                            LEARNER_RESOURCE_ASSIGNMENT_CONFIG
                                .apiVersion,

                        correlationId

                    }

                });

        } catch (
            error
        ) {

            /*
             * This fallback rollback applies only when a file
             * was uploaded but a later unexpected operation
             * failed before the access record was completed.
             */
            if (
                uploadedFile
            ) {

                await deleteUploadedAssignmentFile({

                    bucketName:
                        uploadedFile.bucketName,

                    storagePath:
                        uploadedFile.storagePath,

                    correlationId

                });

            }

            const normalizedError =
                normalizeAssignmentUploadError(
                    error
                );

            const httpStatus =
                Number.isInteger(
                    normalizedError
                        .httpStatus
                )
                    ? normalizedError.httpStatus
                    : 500;

            const code =
                normalizeString(
                    normalizedError.code
                ) ||
                "LEARNER_RESOURCE_ASSIGNMENT_FAILED";

            if (
                httpStatus >= 500
            ) {

                console.error(
                    `[${SERVICE_NAME}] Learner-resource ` +
                    `assignment failed. Correlation ID: ` +
                    `${correlationId}.`,
                    normalizedError
                );

            } else {

                console.warn(
                    `[${SERVICE_NAME}] Learner-resource ` +
                    `assignment rejected. Code: ${code}. ` +
                    `Correlation ID: ${correlationId}.`
                );

            }

            return res
                .status(
                    httpStatus
                )
                .json({

                    success:
                        false,

                    error: {

                        code,

                        message:
                            httpStatus < 500
                                ? normalizedError.message
                                : "The learning resource could not be assigned."

                    },

                    correlationId

                });

        }

    }
);

/* ==========================================================
   Learner Learning Resources API

   API Version : 1.4.0
   Status      : ACTIVE

   Governance
   ----------------------------------------------------------
   - Firebase Authentication is the identity authority.
   - Ownership is derived only from the verified ID token.
   - learner_resource_access is the learner-specific authority.
   - learning_resources is the published-resource authority.
   - Personalized delivery metadata on learner_resource_access
     takes precedence over shared catalogue delivery metadata.
   - Master resources may remain catalogue-locked while a
     learner assignment grants preview/download rights.
   - Non-master assignments may never exceed the permissions
     declared on the published resource.

   Cost Controls
   ----------------------------------------------------------
   - Reuses the existing Cloud Run service and Storage bucket.
   - No new service, database, cache, scheduler or audit writes.
   - Learner-access reads are bounded with limit(100).
   - Resource document IDs are deduplicated per list request.
   - Resource documents are fetched with one getAll round trip.
   - Storage objects are never listed.
   - file.exists() is intentionally avoided.
   - Protected files are streamed directly without buffering.
   - Private responses are never cached.
========================================================== */

const LEARNING_RESOURCE_API_VERSION = "1.4.0";
const MAX_LEARNER_RESOURCE_ACCESS = 100;
const MASTER_RESOURCE_STORAGE_DOMAIN =
    "master_learning_resources";
const PROTECTED_STORAGE_DELIVERY_TYPE =
    "protected_storage";

function resolveEpochMilliseconds(value) {
    if (
        value === null ||
        typeof value === "undefined" ||
        value === ""
    ) {
        return null;
    }

    if (typeof value?.toMillis === "function") {
        const milliseconds = value.toMillis();

        return Number.isFinite(milliseconds)
            ? milliseconds
            : null;
    }

    if (typeof value?.toDate === "function") {
        const milliseconds =
            value.toDate().getTime();

        return Number.isFinite(milliseconds)
            ? milliseconds
            : null;
    }

    if (value instanceof Date) {
        const milliseconds = value.getTime();

        return Number.isFinite(milliseconds)
            ? milliseconds
            : null;
    }

    if (typeof value === "number") {
        return Number.isFinite(value)
            ? value
            : null;
    }

    if (typeof value === "string") {
        const milliseconds = Date.parse(value);

        return Number.isFinite(milliseconds)
            ? milliseconds
            : null;
    }

    return null;
}

function isResourceAvailableNow(
    access = {},
    nowMilliseconds = Date.now()
) {
    const availableFrom =
        resolveEpochMilliseconds(
            access.available_from
        );

    const availableUntil =
        resolveEpochMilliseconds(
            access.available_until
        );

    return (
        (
            availableFrom === null ||
            availableFrom <= nowMilliseconds
        ) &&
        (
            availableUntil === null ||
            availableUntil >= nowMilliseconds
        )
    );
}

function isEligibleLearnerAccess(
    access,
    learnerUid,
    nowMilliseconds = Date.now()
) {
    return (
        normalizeString(
            access.learner_uid
        ) === learnerUid &&

        normalizeLower(
            access.identity_status
        ) === "activated" &&

        normalizeLower(
            access.access_status
        ) === "active" &&

        normalizeLower(
            access.release_status
        ) === "released" &&

        isResourceAvailableNow(
            access,
            nowMilliseconds
        )
    );
}

function isPublishedActiveResource(resource) {
    return (
        normalizeLower(resource.status) ===
            "published" &&
        resource.is_active === true
    );
}

function isMasterLearningResource(resource) {
    return (
        normalizeLower(
            resource.storage_domain
        ) ===
        MASTER_RESOURCE_STORAGE_DOMAIN
    );
}

function accessMatchesResource(
    access,
    resource
) {
    return (
        normalizeString(
            access.resource_id
        ) ===
            normalizeString(
                resource.resource_id
            ) &&

        normalizeUpper(
            access.program_code
        ) ===
            normalizeUpper(
                resource.program_code
            ) &&

        Number(
            access.resource_version
        ) ===
            Number(
                resource.version
            )
    );
}

function resolveLearnerPermissions(
    access,
    resource
) {
    const masterResource =
        isMasterLearningResource(resource);

    return {
        previewAllowed:
            access.preview_allowed === true &&
            (
                masterResource ||
                resource.preview_allowed === true
            ),

        downloadAllowed:
            access.download_allowed === true &&
            (
                masterResource ||
                resource.download_allowed === true
            )
    };
}

function resolveDeliveryAction(value) {
    const action =
        normalizeLower(value) || "download";

    if (
        ![
            "preview",
            "download"
        ].includes(action)
    ) {
        throw createServiceError({
            code:
                "LEARNING_RESOURCE_ACTION_INVALID",

            message:
                "The requested learning-resource action is invalid.",

            httpStatus: 400
        });
    }

    return action;
}

function applyPrivateNoStoreHeaders(res) {
    res.setHeader(
        "Cache-Control",
        "private, no-store, max-age=0"
    );

    res.setHeader(
        "Pragma",
        "no-cache"
    );

    res.setHeader(
        "Expires",
        "0"
    );
}

function sanitizeDeliveryFileName(value) {
    return (
        normalizeString(value) ||
        "Agile-AI-University-Learning-Resource"
    )
        .replace(
            /["\\/\r\n]/g,
            "_"
        )
        .slice(
            0,
            180
        );
}

function resolveSafeExternalUrl(value) {
    const externalUrl =
        normalizeString(value);

    if (!externalUrl) {
        return null;
    }

    try {
        const parsedUrl =
            new URL(externalUrl);

        return parsedUrl.protocol === "https:"
            ? parsedUrl.toString()
            : null;
    } catch (error) {
        return null;
    }
}

async function requireOwnedLearningResource(
    accessId,
    authenticatedLearner
) {
    const normalizedAccessId =
        normalizeString(accessId);

    if (!normalizedAccessId) {
        throw createServiceError({
            code:
                "LEARNING_RESOURCE_NOT_FOUND",

            message:
                "The learning resource is unavailable.",

            httpStatus: 404
        });
    }

    const accessSnapshot = await db
        .collection(
            COLLECTIONS.learnerResourceAccess
        )
        .doc(normalizedAccessId)
        .get();

    if (!accessSnapshot.exists) {
        throw createServiceError({
            code:
                "LEARNING_RESOURCE_NOT_FOUND",

            message:
                "The learning resource is unavailable.",

            httpStatus: 404
        });
    }

    const access =
        accessSnapshot.data() || {};

    if (
        !isEligibleLearnerAccess(
            access,
            authenticatedLearner.uid
        )
    ) {
        throw createServiceError({
            code:
                "LEARNING_RESOURCE_FORBIDDEN",

            message:
                "The learning resource is not available for this account.",

            httpStatus: 403
        });
    }

    const resourceDocumentId =
        normalizeString(
            access.resource_document_id
        );

    if (!resourceDocumentId) {
        throw createServiceError({
            code:
                "LEARNING_RESOURCE_NOT_FOUND",

            message:
                "The learning resource is unavailable.",

            httpStatus: 404
        });
    }

    const resourceSnapshot = await db
        .collection(
            COLLECTIONS.learningResources
        )
        .doc(resourceDocumentId)
        .get();

    if (!resourceSnapshot.exists) {
        throw createServiceError({
            code:
                "LEARNING_RESOURCE_NOT_FOUND",

            message:
                "The learning resource is unavailable.",

            httpStatus: 404
        });
    }

    const resource =
        resourceSnapshot.data() || {};

    if (
        !isPublishedActiveResource(
            resource
        ) ||
        !accessMatchesResource(
            access,
            resource
        )
    ) {
        throw createServiceError({
            code:
                "LEARNING_RESOURCE_NOT_FOUND",

            message:
                "The learning resource is unavailable.",

            httpStatus: 404
        });
    }

    return {
        access,
        resource,

        permissions:
            resolveLearnerPermissions(
                access,
                resource
            )
    };
}

app.get(
    "/api/v1/learning-resources/me",
    async (req, res) => {
        try {
            applyPrivateNoStoreHeaders(res);

            const authenticatedLearner =
                await verifyAuthenticatedLearner(req);

            const learnerUid =
                authenticatedLearner.uid;

            const nowMilliseconds =
                Date.now();

            /* ------------------------------------------
               Learner Access Resolution

               Ownership is resolved only from the verified
               Firebase UID. Browser-supplied identity values
               are never trusted.
            ------------------------------------------ */

            const accessSnapshot = await db
                .collection(
                    COLLECTIONS.learnerResourceAccess
                )
                .where(
                    "learner_uid",
                    "==",
                    learnerUid
                )
                .limit(
                    MAX_LEARNER_RESOURCE_ACCESS
                )
                .get();

            const eligibleAccessDocuments =
                accessSnapshot.docs.filter(
                    (document) => {
                        const access =
                            document.data() || {};

                        return isEligibleLearnerAccess(
                            access,
                            learnerUid,
                            nowMilliseconds
                        );
                    }
                );

            if (
                eligibleAccessDocuments.length === 0
            ) {
                return res.status(200).json({
                    success: true,

                    data: {
                        resources: []
                    },

                    meta: {
                        apiVersion:
                            LEARNING_RESOURCE_API_VERSION,

                        total: 0
                    }
                });
            }

            /* ------------------------------------------
               Resource Reference Deduplication

               Multiple learner-access records may reference
               the same resource document. Resource reads are
               deduplicated before the Firestore getAll call.
            ------------------------------------------ */

            const resourceReferencesById =
                new Map();

            eligibleAccessDocuments.forEach(
                (accessDocument) => {
                    const access =
                        accessDocument.data() || {};

                    const resourceDocumentId =
                        normalizeString(
                            access.resource_document_id
                        );

                    if (
                        resourceDocumentId &&
                        !resourceReferencesById.has(
                            resourceDocumentId
                        )
                    ) {
                        resourceReferencesById.set(
                            resourceDocumentId,

                            db
                                .collection(
                                    COLLECTIONS.learningResources
                                )
                                .doc(
                                    resourceDocumentId
                                )
                        );
                    }
                }
            );

            const resourceReferences =
                Array.from(
                    resourceReferencesById.values()
                );

            if (
                resourceReferences.length === 0
            ) {
                return res.status(200).json({
                    success: true,

                    data: {
                        resources: []
                    },

                    meta: {
                        apiVersion:
                            LEARNING_RESOURCE_API_VERSION,

                        total: 0
                    }
                });
            }

            /* ------------------------------------------
               Batched Resource Resolution

               getAll avoids one Firestore network round trip
               for every learner-access record.
            ------------------------------------------ */

            const resourceSnapshots =
                await db.getAll(
                    ...resourceReferences
                );

            const resourcesByDocumentId =
                new Map();

            resourceSnapshots.forEach(
                (resourceSnapshot) => {
                    if (!resourceSnapshot.exists) {
                        return;
                    }

                    resourcesByDocumentId.set(
                        resourceSnapshot.id,
                        resourceSnapshot.data() || {}
                    );
                }
            );

            /* ------------------------------------------
               Safe Learner Response Projection
            ------------------------------------------ */

            const resources =
                eligibleAccessDocuments
                    .map((accessDocument) => {
                        const access =
                            accessDocument.data() || {};

                        const resourceDocumentId =
                            normalizeString(
                                access.resource_document_id
                            );

                        const resource =
                            resourcesByDocumentId.get(
                                resourceDocumentId
                            );

                        if (
                            !resource ||
                            !isPublishedActiveResource(
                                resource
                            ) ||
                            !accessMatchesResource(
                                access,
                                resource
                            )
                        ) {
                            return null;
                        }

                        const permissions =
                            resolveLearnerPermissions(
                                access,
                                resource
                            );

                        const deliveryType =
                            normalizeLower(
                                access.delivery_type ||
                                resource.delivery_type
                            );

                        const externalUrl =
                            deliveryType ===
                            PROTECTED_STORAGE_DELIVERY_TYPE
                                ? null
                                : resolveSafeExternalUrl(
                                    resource.external_url
                                );

                        /*
                         * Invalid external delivery URLs are
                         * omitted rather than exposed to the
                         * learner.
                         */
                        if (
                            deliveryType !==
                                PROTECTED_STORAGE_DELIVERY_TYPE &&
                            !externalUrl
                        ) {
                            return null;
                        }

                        return {
                            accessId:
                                accessDocument.id,

                            resourceId:
                                normalizeString(
                                    resource.resource_id
                                ),

                            programCode:
                                normalizeUpper(
                                    resource.program_code
                                ),

                            title:
                                normalizeString(
                                    resource.title
                                ),

                            description:
                                normalizeString(
                                    resource.description
                                ),

                            resourceType:
                                normalizeLower(
                                    resource.resource_type
                                ),

                            category:
                                normalizeLower(
                                    resource.category
                                ),

                            version:
                                Number(
                                    resource.version
                                ) || 1,

                            fileName:
                                normalizeString(
                                    access.delivery_file_name ||
                                    resource.file_name
                                ),

                            mimeType:
                                normalizeString(
                                    access.delivery_mime_type ||
                                    resource.mime_type
                                ),

                            deliveryType,

                            previewAllowed:
                                permissions.previewAllowed,

                            downloadAllowed:
                                permissions.downloadAllowed,

                            availableFrom:
                                resolveDate(
                                    access.available_from
                                ),

                            availableUntil:
                                resolveDate(
                                    access.available_until
                                ),

                            deliveryPath:
                                `/api/v1/learning-resources/${encodeURIComponent(
                                    accessDocument.id
                                )}/delivery`
                        };
                    })
                    .filter(Boolean);

            resources.sort(
                (
                    firstResource,
                    secondResource
                ) => {
                    const firstProgram =
                        normalizeUpper(
                            firstResource.programCode
                        );

                    const secondProgram =
                        normalizeUpper(
                            secondResource.programCode
                        );

                    const programComparison =
                        firstProgram.localeCompare(
                            secondProgram
                        );

                    if (programComparison !== 0) {
                        return programComparison;
                    }

                    return normalizeString(
                        firstResource.title
                    ).localeCompare(
                        normalizeString(
                            secondResource.title
                        )
                    );
                }
            );

            return res.status(200).json({
                success: true,

                data: {
                    resources
                },

                meta: {
                    apiVersion:
                        LEARNING_RESOURCE_API_VERSION,

                    total:
                        resources.length
                }
            });
        } catch (error) {
            const httpStatus =
                Number.isInteger(
                    error.httpStatus
                )
                    ? error.httpStatus
                    : 500;

            const code =
                normalizeString(
                    error.code
                ) ||
                "LEARNING_RESOURCE_LOAD_FAILED";

            if (httpStatus >= 500) {
                console.error(
                    `[${SERVICE_NAME}] Learner learning ` +
                    `resources could not be loaded:`,
                    error
                );
            } else {
                console.warn(
                    `[${SERVICE_NAME}] Learner learning ` +
                    `resource request rejected. Code: ` +
                    `${code}`
                );
            }

            return res.status(httpStatus).json({
                success: false,

                error: {
                    code,

                    message:
                        httpStatus < 500
                            ? error.message
                            : "Learning resources could not be loaded."
                }
            });
        }
    }
);

app.post(
    "/api/v1/learning-resources/:accessId/delivery",
    async (req, res) => {
        try {
            applyPrivateNoStoreHeaders(res);

            const authenticatedLearner =
                await verifyAuthenticatedLearner(req);

            const action =
                resolveDeliveryAction(
                    req.body?.action
                );

            const {
                access,
                resource,
                permissions
            } =
                await requireOwnedLearningResource(
                    req.params.accessId,
                    authenticatedLearner
                );

            const deliveryType =
                normalizeLower(
                    access.delivery_type ||
                    resource.delivery_type
                );

            /* ------------------------------------------
               Permission Enforcement

               learner_resource_access is authoritative for
               master learning resources.

               For non-master resources, assignment rights
               remain constrained by the catalogue-level
               permissions through resolveLearnerPermissions().
            ------------------------------------------ */

            if (
                action === "preview" &&
                permissions.previewAllowed !== true
            ) {
                throw createServiceError({
                    code:
                        "LEARNING_RESOURCE_PREVIEW_FORBIDDEN",

                    message:
                        "Preview is not available for this learning resource.",

                    httpStatus: 403
                });
            }

            if (
                action === "download" &&
                permissions.downloadAllowed !== true
            ) {
                throw createServiceError({
                    code:
                        "LEARNING_RESOURCE_DOWNLOAD_FORBIDDEN",

                    message:
                        "Download is not available for this learning resource.",

                    httpStatus: 403
                });
            }

            /* ------------------------------------------
               Governed External Delivery
            ------------------------------------------ */

            if (
                deliveryType !==
                PROTECTED_STORAGE_DELIVERY_TYPE
            ) {
                const externalUrl =
                    resolveSafeExternalUrl(
                        resource.external_url
                    );

                if (!externalUrl) {
                    throw createServiceError({
                        code:
                            "LEARNING_RESOURCE_DELIVERY_INVALID",

                        message:
                            "The learning resource delivery link is unavailable.",

                        httpStatus: 409
                    });
                }

                return res.status(200).json({
                    success: true,

                    data: {
                        deliveryType:
                            deliveryType ||
                            "external_url",

                        action,

                        deliveryUrl:
                            externalUrl,

                        expiresAt: null
                    },

                    meta: {
                        apiVersion:
                            LEARNING_RESOURCE_API_VERSION
                    }
                });
            }

            /* ------------------------------------------
               Protected Storage Delivery
            ------------------------------------------ */

            const storagePath =
                normalizeString(
                    access.delivery_storage_path ||
                    resource.storage_path
                );

            if (!storagePath) {
                throw createServiceError({
                    code:
                        "LEARNING_RESOURCE_DELIVERY_INVALID",

                    message:
                        "The learning resource file is unavailable.",

                    httpStatus: 409
                });
            }

            const fileName =
                sanitizeDeliveryFileName(
                    access.delivery_file_name ||
                    resource.file_name ||
                    resource.download_file_name ||
                    resource.title
                );

            const mimeType =
                normalizeString(
                    access.delivery_mime_type ||
                    resource.mime_type
                ) ||
                "application/octet-stream";

            const bucketName =
                normalizeString(
                    process.env
                        .LEARNING_RESOURCE_BUCKET
                ) ||
                "fb-agileai-university.firebasestorage.app";

            const bucket =
                admin
                    .storage()
                    .bucket(bucketName);

            const file =
                bucket.file(storagePath);

            /*
             * file.exists() is deliberately avoided.
             *
             * The Storage read stream itself remains the
             * authoritative object-existence check, avoiding
             * one additional Storage metadata request.
             */
            const readStream =
                file.createReadStream();

            let streamStarted = false;
            let responseCompleted = false;

            readStream.once(
                "response",
                () => {
                    streamStarted = true;
                }
            );

            readStream.once(
                "error",
                (streamError) => {
                    if (
                        responseCompleted ||
                        res.writableEnded
                    ) {
                        return;
                    }

                    const storageErrorCode =
                        Number(
                            streamError?.code
                        );

                    if (!res.headersSent) {
                        const notFound =
                            storageErrorCode === 404;

                        return res.status(
                            notFound
                                ? 404
                                : 500
                        ).json({
                            success: false,

                            error: {
                                code:
                                    notFound
                                        ? "LEARNING_RESOURCE_FILE_NOT_FOUND"
                                        : "LEARNING_RESOURCE_DELIVERY_FAILED",

                                message:
                                    notFound
                                        ? "The learning resource file is unavailable."
                                        : "The learning resource could not be delivered."
                            }
                        });
                    }

                    console.error(
                        `[${SERVICE_NAME}] Protected learning ` +
                        `resource stream failed after response ` +
                        `headers were sent. Access ID: ` +
                        `${normalizeString(
                            req.params.accessId
                        )}. Stream started: ` +
                        `${streamStarted}.`,
                        streamError
                    );

                    res.destroy(streamError);
                }
            );

            readStream.once(
                "end",
                () => {
                    responseCompleted = true;
                }
            );

            res.setHeader(
                "Content-Type",
                mimeType
            );

            res.setHeader(
                "X-Content-Type-Options",
                "nosniff"
            );

            if (action === "preview") {
                res.setHeader(
                    "Content-Disposition",
                    `inline; filename="${fileName}"`
                );
            } else {
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="${fileName}"`
                );
            }

            return readStream.pipe(res);
        } catch (error) {
            const httpStatus =
                Number.isInteger(
                    error.httpStatus
                )
                    ? error.httpStatus
                    : 500;

            const code =
                normalizeString(
                    error.code
                ) ||
                "LEARNING_RESOURCE_DELIVERY_FAILED";

            if (httpStatus >= 500) {
                console.error(
                    `[${SERVICE_NAME}] Learning-resource ` +
                    `delivery failed:`,
                    error
                );
            } else {
                console.warn(
                    `[${SERVICE_NAME}] Learning-resource ` +
                    `delivery rejected. Code: ${code}`
                );
            }

            if (res.headersSent) {
                return res.end();
            }

            return res.status(httpStatus).json({
                success: false,

                error: {
                    code,

                    message:
                        httpStatus < 500
                            ? error.message
                            : "The learning resource could not be delivered."
                }
            });
        }
    }
);

/* ==========================================================
   Student Credentials API

   API Version : 1.1.0
   Status      : Legacy Read Only

   Important Security Note
   ----------------------------------------------------------
   This endpoint currently accepts a browser-supplied email.

   Existing behaviour is preserved temporarily to avoid
   breaking the current portal.

   It is not the target ownership model.

   The governed replacement must:

   1. Verify Firebase ID token server-side.
   2. Derive auth.uid from the verified token.
   3. Query credentials using learner_uid.
   4. Never trust browser-supplied email for ownership.

   This endpoint must be migrated and deprecated through a
   separate focused change after activation claim is working.
========================================================== */

app.post(
    "/student/my-credentials",
    async (req, res) => {
        try {
            const email = normalizeEmail(
                req.body?.email
            );

            if (!email) {
                return res.status(400).json({
                    status: "error",
                    message: "email is required"
                });
            }

            const snapshot = await db
                .collection(
                    COLLECTIONS.credentials
                )
                .where("email", "==", email)
                .get();

            const credentials =
                snapshot.docs.map((document) => {
                    const data =
                        document.data() || {};

                    return {
                        credential_id:
                            data.credential_id || "",

                        full_name:
                            data.full_name || "",

                        email:
                            data.email || "",

                        program_code:
                            data.program_code || "",

                        program_name:
                            data.program_name || "",

                        credential_type:
                            data.credential_type || "",

                        issued_status:
                            data.issued_status || "",

                        issued_by:
                            data.issued_by ||
                            "Agile AI University",

                        approval_status:
                            data.approval_status || "",

                        training_start_date:
                            data.training_start_date || "",

                        training_end_date:
                            data.training_end_date || "",

                        issued_at:
                            data.issued_on ||
                            data.imported_at ||
                            data.created_at ||
                            null,

                        imported_at:
                            data.imported_at || null,

                        validity:
                            data.validity || "Lifetime"
                    };
                });

            return res.json({
                status: "success",
                version: "1.1.0",
                api: "student-my-credentials",
                email,

                total_records:
                    credentials.length,

                credentials
            });
        } catch (error) {
            console.error(
                `[${SERVICE_NAME}] ` +
                `Student Credentials Error:`,
                error
            );

            return res.status(500).json({
                status: "error",
                version: "1.1.0",
                api: "student-my-credentials",
                message:
                    "Failed to load learner credentials"
            });
        }
    }
);

/* ==========================================================
   Global Service Error Handler

   Important
   ----------------------------------------------------------
   Handles errors forwarded by middleware before a route
   handler begins, including Multer upload validation errors.

   This block must remain before the Unknown Route handler.
========================================================== */

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        const normalizedError =
            normalizeAssignmentUploadError(
                error
            );

        const httpStatus =
            Number.isInteger(
                normalizedError.httpStatus
            )
                ? normalizedError.httpStatus
                : 500;

        const code =
            normalizeString(
                normalizedError.code
            ) ||
            "INTERNAL_SERVER_ERROR";

        if (
            httpStatus >= 500
        ) {

            console.error(
                `[${SERVICE_NAME}] Unhandled service error:`,
                normalizedError
            );

        } else {

            console.warn(
                `[${SERVICE_NAME}] Request rejected. ` +
                `Code: ${code}.`
            );

        }

        if (
            res.headersSent
        ) {

            return next(
                normalizedError
            );

        }

        return res
            .status(
                httpStatus
            )
            .json({

                success:
                    false,

                error: {

                    code,

                    message:
                        httpStatus < 500
                            ? normalizedError.message
                            : "The request could not be completed."

                }

            });

    }
);

/* ==========================================================
   Unknown Route
========================================================== */

app.use((req, res) => {
    return res.status(404).json({
        status: "error",
        message: "Endpoint not found",
        service: SERVICE_NAME,
        version: SERVICE_VERSION
    });
});

/* ==========================================================
   Server Start
========================================================== */

const PORT = Number(
    process.env.PORT || 8080
);

app.listen(PORT, () => {
    console.log(
        `${SERVICE_NAME} v${SERVICE_VERSION} ` +
        `running on port ${PORT}`
    );
});