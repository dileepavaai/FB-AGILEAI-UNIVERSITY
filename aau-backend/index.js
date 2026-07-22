/* ==========================================================
   Agile AI University

   Service Name : aau-credential-verify
   Component    : Credential Verification and Activation API
   File         : index.js
   Version      : 1.2.0
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

   Primary APIs
   ----------------------------------------------------------
   POST /public/verify-credential
   POST /admin/credential-registry
   POST /student/my-credentials
   POST /api/v1/credential-activations/validate
   GET  /api/v1/learning-resources/me
   POST /api/v1/learning-resources/:accessId/delivery

   Governance
   ----------------------------------------------------------
   - Firebase Authentication is the identity authority.
   - Firestore credentials is the credential authority.
   - CredentialActivationService owns activation validation.
   - Validation is read-only.
   - Plain activation tokens are never logged or persisted.
   - Activation-token lookup uses SHA-256 and limit(2).
   - No paid email provider is used.
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

const SERVICE_NAME = "aau-credential-verify";
const SERVICE_VERSION = "1.2.0";
const EXPECTED_PROJECT_ID = "fb-agileai-university";

/* ==========================================================
   Firestore Collections
========================================================== */

const COLLECTIONS = Object.freeze({
    credentials: "credentials",
    activationTokens: "credential_activation_tokens",
    reconciliationEvents: "identity_reconciliation_events",
    learningResources: "learning_resources",
    learnerResourceAccess: "learner_resource_access"
});

/* ==========================================================
   Credential Activation Configuration
========================================================== */

const ACTIVATION_CONFIG = Object.freeze({
    tokenHashAlgorithm: "sha256",

    allowedStatuses: Object.freeze({
        issued: "issued",
        consumed: "consumed",
        expired: "expired",
        revoked: "revoked",
        blocked: "blocked"
    }),

    requiredApprovalStatus: "approved",
    requiredIssuedStatus: "finalized",

    validateRateLimit: Object.freeze({
        windowMs: 60 * 1000,
        maxRequests: 10
    })
});

/* ==========================================================
   In-Memory Rate Limiting

   Important:
   ----------------------------------------------------------
   This is intentionally lightweight for the current MVP.

   Cloud Run instances maintain independent memory, so this
   is not a globally distributed rate limiter.

   It remains suitable as a cost-free first protection layer
   for the controlled alumni pilot.

   A managed distributed limiter may be introduced later only
   when justified by traffic and explicit founder approval.
========================================================== */

const verificationRequestCounts = new Map();
const activationRequestCounts = new Map();

/* ==========================================================
   General Utilities
========================================================== */

function normalizeString(value) {
    return typeof value === "string"
        ? value.trim()
        : "";
}

function normalizeEmail(value) {
    return normalizeString(value).toLowerCase();
}

function normalizeLower(value) {
    return normalizeString(value).toLowerCase();
}

function normalizeUpper(value) {
    return normalizeString(value).toUpperCase();
}

function getClientIp(req) {
    const forwardedFor = normalizeString(
        req.headers["x-forwarded-for"]
    );

    if (forwardedFor) {
        return forwardedFor
            .split(",")[0]
            .trim();
    }

    return normalizeString(req.ip) || "unknown";
}

function applyInMemoryRateLimit({
    req,
    store,
    windowMs,
    maxRequests
}) {
    const ip = getClientIp(req);
    const now = Date.now();

    const current = store.get(ip) || {
        count: 0,
        windowStartedAt: now
    };

    if (now - current.windowStartedAt >= windowMs) {
        current.count = 0;
        current.windowStartedAt = now;
    }

    current.count += 1;
    store.set(ip, current);

    return {
        allowed: current.count <= maxRequests,
        ip,
        remaining: Math.max(
            maxRequests - current.count,
            0
        )
    };
}

function maskEmail(email) {
    const normalized = normalizeEmail(email);

    if (!normalized.includes("@")) {
        return null;
    }

    const [localPart, domain] = normalized.split("@");

    if (!localPart || !domain) {
        return null;
    }

    const visibleLength =
        localPart.length <= 2
            ? 1
            : Math.min(2, localPart.length);

    return (
        `${localPart.slice(0, visibleLength)}` +
        `***@${domain}`
    );
}

function resolveDate(value) {
    if (!value) {
        return null;
    }

    if (typeof value.toDate === "function") {
        return value.toDate().toISOString();
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (typeof value === "string") {
        return value;
    }

    return null;
}

function isTimestampExpired(value) {
    if (!value) {
        return true;
    }

    let expirationDate = null;

    if (typeof value.toDate === "function") {
        expirationDate = value.toDate();
    } else if (value instanceof Date) {
        expirationDate = value;
    } else if (typeof value === "string") {
        expirationDate = new Date(value);
    }

    if (
        !expirationDate ||
        Number.isNaN(expirationDate.getTime())
    ) {
        return true;
    }

    return expirationDate.getTime() <= Date.now();
}

function hashActivationToken(token) {
    return crypto
        .createHash(
            ACTIVATION_CONFIG.tokenHashAlgorithm
        )
        .update(token, "utf8")
        .digest("hex");
}

function createCorrelationId() {
    return crypto.randomUUID();
}

function getProgrammeName(programCode) {
    const names = Object.freeze({
        AOP: "Agile Outcome Practitioner",
        AIPA: "Artificial Intelligence Professional Agilist",
        AAIA: "Agile AI Master",
        AAIP: "Agentic AI Professional",
        AIAL: "Agile AI Leadership"
    });

    return names[normalizeUpper(programCode)] || null;
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
    return res.status(httpStatus).json({
        success: false,

        error: {
            code,
            message
        },

        correlationId
    });
}

/* ==========================================================
   reCAPTCHA Validation
========================================================== */

async function verifyRecaptcha(token) {
    if (!token) {
        return false;
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;

    if (!secret) {
        console.warn(
            `[${SERVICE_NAME}] Missing RECAPTCHA_SECRET_KEY`
        );

        return false;
    }

    try {
        const body = new URLSearchParams();

        body.set("secret", secret);
        body.set("response", token);

        const response = await fetch(
            "https://www.google.com/recaptcha/api/siteverify",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: body.toString()
            }
        );

        const data = await response.json();

        return data.success === true;
    } catch (error) {
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

function generateSignature(credentialId) {
    const secret = process.env.SIGNING_SECRET;

    if (!secret) {
        return null;
    }

    return crypto
        .createHmac("sha256", secret)
        .update(credentialId)
        .digest("hex");
}

function safeCompare(firstValue, secondValue) {
    if (!firstValue || !secondValue) {
        return false;
    }

    const firstBuffer = Buffer.from(firstValue);
    const secondBuffer = Buffer.from(secondValue);

    if (firstBuffer.length !== secondBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        firstBuffer,
        secondBuffer
    );
}

function verifySignature(credentialId, signature) {
    /*
     * Retained for backward compatibility with existing
     * verification URLs.
     */
    if (!signature) {
        return true;
    }

    const expected = generateSignature(credentialId);

    if (!expected) {
        return false;
    }

    return safeCompare(signature, expected);
}

/* ==========================================================
   Firebase Authentication Helpers
========================================================== */

function getBearerToken(req) {
    const authorizationHeader = normalizeString(
        req.headers.authorization
    );

    if (!authorizationHeader) {
        return "";
    }

    const parts = authorizationHeader.split(/\s+/);

    if (
        parts.length !== 2 ||
        parts[0].toLowerCase() !== "bearer"
    ) {
        return "";
    }

    return normalizeString(parts[1]);
}

async function verifyAuthenticatedLearner(req) {
    const firebaseIdToken = getBearerToken(req);

    if (!firebaseIdToken) {
        const error = new Error(
            "Firebase authentication is required."
        );

        error.code = "AUTHENTICATION_REQUIRED";
        error.httpStatus = 401;

        throw error;
    }

    let decodedToken;

    try {
        decodedToken = await admin
            .auth()
            .verifyIdToken(firebaseIdToken, true);
    } catch (verificationError) {
        const error = new Error(
            "The authenticated session is not valid."
        );

        error.code = "AUTHENTICATION_INVALID";
        error.httpStatus = 401;

        throw error;
    }

    const uid = normalizeString(decodedToken.uid);
    const email = normalizeEmail(decodedToken.email);
    const emailVerified =
        decodedToken.email_verified === true;

    if (!uid) {
        const error = new Error(
            "The authenticated learner UID is unavailable."
        );

        error.code = "AUTHENTICATION_INVALID";
        error.httpStatus = 401;

        throw error;
    }

    if (!email) {
        const error = new Error(
            "The authenticated account does not contain an email address."
        );

        error.code = "AUTHENTICATED_EMAIL_MISSING";
        error.httpStatus = 403;

        throw error;
    }

    if (!emailVerified) {
        const error = new Error(
            "Please verify your email address before activating the credential."
        );

        error.code = "EMAIL_VERIFICATION_REQUIRED";
        error.httpStatus = 403;

        throw error;
    }

    return {
        uid,
        email,
        emailVerified,
        decodedToken
    };
}

function createServiceError({
    code,
    message,
    httpStatus
}) {
    const error = new Error(message);

    error.code = code;
    error.httpStatus = httpStatus;

    return error;
}

/* ==========================================================
   Credential Lookup Helpers
========================================================== */

async function findCredentialByActivationRecord(
    activationData
) {
    const internalDocumentId = normalizeString(
        activationData.credential_document_id
    );

    /*
     * Preferred lookup:
     * use the server-controlled internal document reference
     * stored when the token was issued.
     */
    if (internalDocumentId) {
        const directSnapshot = await db
            .collection(COLLECTIONS.credentials)
            .doc(internalDocumentId)
            .get();

        if (directSnapshot.exists) {
            return directSnapshot;
        }
    }

    /*
     * Safe compatibility fallback:
     * query by public credential_id.
     */
    const credentialId = normalizeString(
        activationData.credential_id
    );

    if (!credentialId) {
        return null;
    }

    const snapshot = await db
        .collection(COLLECTIONS.credentials)
        .where("credential_id", "==", credentialId)
        .limit(2)
        .get();

    if (snapshot.size !== 1) {
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
            const credentialId = normalizeString(
                req.body?.credential_id
            );

            const recaptchaToken = normalizeString(
                req.body?.recaptchaToken
            );

            const signature = normalizeString(
                req.body?.signature
            );

            /* ------------------------------------------
               Basic Validation
            ------------------------------------------ */

            if (!credentialId) {
                return res.status(400).json({
                    status: "error",
                    message: "credential_id is required"
                });
            }

            /* ------------------------------------------
               Rate Limiting
            ------------------------------------------ */

            const rateLimit =
                applyInMemoryRateLimit({
                    req,
                    store: verificationRequestCounts,
                    windowMs: 60 * 1000,
                    maxRequests: 10
                });

            if (!rateLimit.allowed) {
                return res.status(429).json({
                    status: "error",
                    message:
                        "Too many requests. Try again later."
                });
            }

            /* ------------------------------------------
               reCAPTCHA
            ------------------------------------------ */

            const isHuman =
                await verifyRecaptcha(recaptchaToken);

            if (!isHuman) {
                return res.status(403).json({
                    status: "error",
                    message:
                        "reCAPTCHA validation failed"
                });
            }

            /* ------------------------------------------
               Signature Validation
            ------------------------------------------ */

            const validSignature = verifySignature(
                credentialId,
                signature
            );

            if (!validSignature) {
                return res.status(403).json({
                    status: "error",
                    message:
                        "Invalid or tampered verification link"
                });
            }

            /* ------------------------------------------
               Firestore Query
            ------------------------------------------ */

            const snapshot = await db
                .collection(COLLECTIONS.credentials)
                .where(
                    "credential_id",
                    "==",
                    credentialId
                )
                .limit(1)
                                .get();

            if (snapshot.empty) {
                return res.json({
                    status: "not_found"
                });
            }

            const credentialSnapshot =
                snapshot.docs[0];

            const credential =
                credentialSnapshot.data() || {};

            /* ------------------------------------------
               Issue Date Resolution
            ------------------------------------------ */

            let issueDate = null;

            if (credential.issued_on) {
                issueDate = resolveDate(
                    credential.issued_on
                );
            } else if (credential.imported_at) {
                issueDate = resolveDate(
                    credential.imported_at
                );
            } else if (credential.created_at) {
                issueDate = resolveDate(
                    credential.created_at
                );
            } else if (
                credentialSnapshot.createTime
            ) {
                issueDate = credentialSnapshot
                    .createTime
                    .toDate()
                    .toISOString();
            }

            /* ------------------------------------------
               Success
            ------------------------------------------ */

            return res.json({
                status: "valid",

                full_name:
                    credential.full_name || null,

                credential_id:
                    credential.credential_id || null,

                credential_type:
                    credential.credential_type || null,

                program_code:
                    credential.program_code || null,

                issued_by:
                    credential.issued_by ||
                    "Agile AI University",

                issue_date:
                    issueDate || null
            });
        } catch (error) {
            console.error(
                `[${SERVICE_NAME}] Verification error:`,
                error
            );

            return res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    }
);

/* ==========================================================
   Credential Activation Token Validation API

   Endpoint
   ----------------------------------------------------------
   POST /api/v1/credential-activations/validate

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
   - Verifies Firebase Authentication server-side
   - Requires a verified authenticated email
   - Revalidates the activation token
   - Revalidates credential lifecycle
   - Requires authenticated email to match credential email
   - Atomically links credentials.learner_uid
   - Atomically consumes the activation token
   - Atomically writes the reconciliation audit event
   - Supports safe same-user retries
   - Never trusts UID or email from the request body
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
                    store: activationRequestCounts,

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
                String(rateLimit.remaining)
            );

            if (!rateLimit.allowed) {
                return sendActivationError(res, {
                    httpStatus: 429,
                    code: "ACTIVATION_RATE_LIMITED",
                    message:
                        "Too many activation attempts. Please try again later.",
                    correlationId
                });
            }

            /* ------------------------------------------
               Request Validation
            ------------------------------------------ */

            const token = normalizeString(
                req.body?.token
            );

            if (!token) {
                return sendActivationError(res, {
                    httpStatus: 400,
                    code: "ACTIVATION_TOKEN_REQUIRED",
                    message:
                        "An activation token is required.",
                    correlationId
                });
            }

            if (
                token.length < 32 ||
                token.length > 512
            ) {
                return sendActivationError(res, {
                    httpStatus: 400,
                    code: "ACTIVATION_TOKEN_INVALID",
                    message:
                        "This activation invitation is not valid.",
                    correlationId
                });
            }

            /* ------------------------------------------
               Authentication
            ------------------------------------------ */

            const authenticatedLearner =
                await verifyAuthenticatedLearner(req);

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
                hashActivationToken(token);

            /*
             * References are declared before the transaction.
             * The token itself is never logged or persisted.
             */
            let finalCredentialId = "";
            let finalProgramCode = "";
            let finalActivationState = "";
            let auditEventId = "";

            const transactionResult =
                await db.runTransaction(
                    async (transaction) => {
                        /*
                         * Firestore transaction callbacks may
                         * execute more than once.
                         *
                         * Do not perform logging, token
                         * generation, external calls or email
                         * delivery inside this callback.
                         */

                        const activationQuery = db
                            .collection(
                                COLLECTIONS.activationTokens
                            )
                            .where(
                                "token_hash",
                                "==",
                                tokenHash
                            )
                            .limit(2);

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

                                httpStatus: 400
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

                                httpStatus: 500
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

                        if (!credentialSnapshot) {
                            throw createServiceError({
                                code:
                                    "CREDENTIAL_NOT_FOUND",

                                message:
                                    "The credential associated with this invitation could not be found.",

                                httpStatus: 404
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
                            !transactionalCredentialSnapshot.exists
                        ) {
                            throw createServiceError({
                                code:
                                    "CREDENTIAL_NOT_FOUND",

                                message:
                                    "The credential associated with this invitation could not be found.",

                                httpStatus: 404
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
                                    auditEventId: null
                                };
                            }

                            /*
                             * The same learner already owns the
                             * credential. Safely consume an
                             * issued token if it belongs to the
                             * same identity and email.
                             */
                        } else if (currentLearnerUid) {
                            throw createServiceError({
                                code:
                                    "CREDENTIAL_OWNERSHIP_CONFLICT",

                                message:
                                    "This credential is already linked to another learner account.",

                                httpStatus: 409
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

                                httpStatus: 410
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

                                httpStatus: 410
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

                                httpStatus: 410
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
                                    auditEventId: null
                                };
                            }

                            throw createServiceError({
                                code:
                                    "ACTIVATION_TOKEN_CONSUMED",

                                message:
                                    "This activation invitation has already been used.",

                                httpStatus: 409
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

                                httpStatus: 400
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

                                httpStatus: 409
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

                                httpStatus: 409
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

                                httpStatus: 409
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

                                httpStatus: 403
                            });
                        }

                        /* ----------------------------------
                           Pending Learning-Resource Access

                           Pre-staged assignments are matched
                           by verified email and Credential ID,
                           then bound inside this transaction.
                        ---------------------------------- */

                        const pendingResourceAccessQuery = db
                            .collection(
                                COLLECTIONS.learnerResourceAccess
                            )
                            .where(
                                "learner_email_normalized",
                                "==",
                                authenticatedEmail
                            )
                            .limit(100);

                        const pendingResourceAccessSnapshot =
                            await transaction.get(
                                pendingResourceAccessQuery
                            );

                        const matchingResourceAccessDocuments =
                            pendingResourceAccessSnapshot.docs
                                .filter((document) => {
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
                                });

                        /* ----------------------------------
                           Atomic Writes
                        ---------------------------------- */

                        const serverTimestamp =
                            admin.firestore
                                .FieldValue
                                .serverTimestamp();

                        if (!currentLearnerUid) {
                            transaction.update(
                                credentialRef,
                                {
                                    learner_uid:
                                        authenticatedUid
                                }
                            );
                        }

                        matchingResourceAccessDocuments.forEach(
                            (document) => {
                                transaction.update(
                                    document.ref,
                                    {
                                        learner_uid:
                                            authenticatedUid,
                                        identity_status:
                                                                                    "activated",
                                        access_status:
                                            "active",
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
                                status: "consumed",

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
                                        .increment(1),

                                version:
                                    activation.version ||
                                    "1.0"
                            }
                        );

                        const auditRef = db
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

                                reason: null,

                                created_at:
                                    serverTimestamp,

                                correlation_id:
                                    correlationId,

                                request_id: null,

                                activation_token_id:
                                    activationDocument.id,

                                version: "1.0",

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
                                        "claimed"
                                }
                            }
                        );

                        return {
                            activationStatus:
                                currentLearnerUid
                                    ? "already_owned_and_completed"
                                    : "completed",

                            credentialClaimed: true,
                            credentialId,
                            programCode,
                            learningResourcesActivated:
                                matchingResourceAccessDocuments.length,
                            auditEventId: auditRef.id
                        };
                    }
                );

            finalCredentialId =
                transactionResult.credentialId;

            finalProgramCode =
                transactionResult.programCode;

            finalActivationState =
                transactionResult.activationStatus;

            auditEventId =
                transactionResult.auditEventId || "";

            console.log(
                `[${SERVICE_NAME}] Credential activation ` +
                `completed. Credential: ` +
                `${finalCredentialId}. ` +
                `Correlation ID: ${correlationId}`
            );

            return res.status(200).json({
                success: true,

                data: {
                    activationStatus:
                        finalActivationState,

                    credentialClaimed: true,

                    credentialId:
                        finalCredentialId,

                    programCode:
                        finalProgramCode,

                    learningResourcesActivated:
                        transactionResult
                            .learningResourcesActivated || 0,

                    redirectUrl:
                        "/index.html"
                },

                correlationId
            });
        } catch (error) {
            const code =
                normalizeString(error.code) ||
                "ACTIVATION_INTERNAL_ERROR";

            const httpStatus =
                Number.isInteger(error.httpStatus)
                    ? error.httpStatus
                    : 500;

            const publicMessage =
                httpStatus >= 500
                    ? "The credential activation could not be completed."
                    : error.message;

            if (httpStatus >= 500) {
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

            return sendActivationError(res, {
                httpStatus,
                code,
                message: publicMessage,
                correlationId
            });
        }
    }
);

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
                    store: activationRequestCounts,

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
                String(rateLimit.remaining)
            );

            if (!rateLimit.allowed) {
                return sendActivationError(res, {
                    httpStatus: 429,
                    code: "ACTIVATION_RATE_LIMITED",
                    message:
                        "Too many activation attempts. Please try again later.",
                    correlationId
                });
            }

            /* ------------------------------------------
               Request Validation
            ------------------------------------------ */

            const token = normalizeString(
                req.body?.token
            );

            if (!token) {
                return sendActivationError(res, {
                    httpStatus: 400,
                    code: "ACTIVATION_TOKEN_REQUIRED",
                    message:
                        "An activation token is required.",
                    correlationId
                });
            }

            /*
             * Current issuance uses 32 random bytes encoded
             * with Base64 URL encoding. This defensive range
             * rejects obviously malformed or abusive input
             * without tightly coupling validation to one
             * exact token representation.
             */
            if (
                token.length < 32 ||
                token.length > 512
            ) {
                return sendActivationError(res, {
                    httpStatus: 400,
                    code: "ACTIVATION_TOKEN_INVALID",
                    message:
                        "This activation invitation is not valid.",
                    correlationId
                });
            }

            /* ------------------------------------------
               Token Hash Lookup
            ------------------------------------------ */

            const tokenHash =
                hashActivationToken(token);

            /*
             * The plain token is not logged, persisted,
             * returned, or included in errors.
             */
            const tokenSnapshot = await db
                .collection(
                    COLLECTIONS.activationTokens
                )
                .where(
                    "token_hash",
                    "==",
                    tokenHash
                )
                .limit(2)
                .get();

            if (tokenSnapshot.empty) {
                return sendActivationError(res, {
                    httpStatus: 400,
                    code: "ACTIVATION_TOKEN_INVALID",
                    message:
                        "This activation invitation is not valid.",
                    correlationId
                });
            }

            /*
             * token_hash should be unique.
             * More than one result is treated as an
             * integrity problem and is not exposed publicly.
             */
            if (tokenSnapshot.size !== 1) {
                console.error(
                    `[${SERVICE_NAME}] Duplicate activation ` +
                    `token hash detected. Correlation ID: ` +
                    `${correlationId}`
                );

                return sendActivationError(res, {
                    httpStatus: 500,
                    code: "ACTIVATION_INTERNAL_ERROR",
                    message:
                        "The activation invitation could not be validated.",
                    correlationId
                });
            }

            const activationDocument =
                tokenSnapshot.docs[0];

            const activation =
                activationDocument.data() || {};

            const activationStatus =
                normalizeLower(activation.status);

            /* ------------------------------------------
               Activation State Validation
            ------------------------------------------ */

            if (
                activationStatus ===
                ACTIVATION_CONFIG
                    .allowedStatuses
                    .consumed
            ) {
                return sendActivationError(res, {
                    httpStatus: 409,
                    code:
                        "ACTIVATION_TOKEN_CONSUMED",
                    message:
                        "This activation invitation has already been used.",
                    correlationId
                });
            }

            if (
                activationStatus ===
                ACTIVATION_CONFIG
                    .allowedStatuses
                    .revoked
            ) {
                return sendActivationError(res, {
                    httpStatus: 410,
                    code:
                        "ACTIVATION_TOKEN_REVOKED",
                    message:
                        "This activation invitation is no longer valid.",
                    correlationId
                });
            }

            if (
                activationStatus ===
                ACTIVATION_CONFIG
                    .allowedStatuses
                    .blocked
            ) {
                return sendActivationError(res, {
                    httpStatus: 410,
                    code:
                        "ACTIVATION_TOKEN_BLOCKED",
                    message:
                        "This activation invitation is no longer available.",
                    correlationId
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
                return sendActivationError(res, {
                    httpStatus: 410,
                    code:
                        "ACTIVATION_TOKEN_EXPIRED",
                    message:
                        "This activation invitation has expired.",
                    correlationId
                });
            }

            if (
                activationStatus !==
                ACTIVATION_CONFIG
                    .allowedStatuses
                    .issued
            ) {
                return sendActivationError(res, {
                    httpStatus: 400,
                    code:
                        "ACTIVATION_TOKEN_INVALID",
                    message:
                        "This activation invitation is not valid.",
                    correlationId
                });
            }

            /* ------------------------------------------
               Credential Lookup
            ------------------------------------------ */

            const credentialSnapshot =
                await findCredentialByActivationRecord(
                    activation
                );

            if (!credentialSnapshot) {
                return sendActivationError(res, {
                    httpStatus: 404,
                    code: "CREDENTIAL_NOT_FOUND",
                    message:
                        "The credential associated with this invitation could not be found.",
                    correlationId
                });
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
                return sendActivationError(res, {
                    httpStatus: 409,
                    code:
                        "CREDENTIAL_NOT_APPROVED",
                    message:
                        "This credential is not currently eligible for activation.",
                    correlationId
                });
            }

            if (
                issuedStatus !==
                ACTIVATION_CONFIG
                    .requiredIssuedStatus
            ) {
                return sendActivationError(res, {
                    httpStatus: 409,
                    code:
                        "CREDENTIAL_NOT_FINALIZED",
                    message:
                        "This credential is not currently eligible for activation.",
                    correlationId
                });
            }

            /*
             * Initial validation requires an unclaimed
             * credential. Idempotent same-user handling will
             * be implemented in the authenticated claim API.
             */
            if (
                credential.learner_uid !== null &&
                typeof credential.learner_uid !==
                    "undefined"
            ) {
                return sendActivationError(res, {
                    httpStatus: 409,
                    code:
                        "CREDENTIAL_ALREADY_CLAIMED",
                    message:
                        "This credential has already been activated.",
                    correlationId
                });
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
                activationEmail !== credentialEmail
            ) {
                console.error(
                    `[${SERVICE_NAME}] Activation email ` +
                    `consistency failure for credential ` +
                    `"${normalizeString(
                        activation.credential_id
                    )}". Correlation ID: ` +
                    `${correlationId}`
                );

                return sendActivationError(res, {
                    httpStatus: 409,
                    code:
                        "ACTIVATION_DATA_CONFLICT",
                    message:
                        "The activation invitation cannot currently be completed.",
                    correlationId
                });
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

            return res.status(200).json({
                success: true,

                data: {
                    activationStatus: "valid",

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
                     * Historical AOP credentials remain AOP.
                     * credential_type is deliberately omitted
                     * from the activation response because
                     * legacy records may contain inconsistent
                     * credential_type values.
                     */
                    emailHint:
                        maskEmail(
                            credentialEmail
                        ),

                    expiresAt:
                        resolveDate(
                            activation.expires_at
                        ),

                    requiresAuthentication: true,

                    requiresVerifiedEmail: true
                },

                correlationId
            });
        } catch (error) {
            console.error(
                `[${SERVICE_NAME}] Activation validation ` +
                `failed. Correlation ID: ` +
                `${correlationId}`,
                error
            );

            return sendActivationError(res, {
                httpStatus: 500,
                code:
                    "ACTIVATION_INTERNAL_ERROR",
                message:
                    "The activation invitation could not be validated.",
                correlationId
            });
        }
    }
);

/* ==========================================================
   Health Check
========================================================== */

app.get("/", (req, res) => {
    return res.status(200).send(
        `${SERVICE_NAME} v${SERVICE_VERSION} is running`
    );
});

app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "healthy",
        service: SERVICE_NAME,
        version: SERVICE_VERSION,
        project:
            process.env.GOOGLE_CLOUD_PROJECT ||
            EXPECTED_PROJECT_ID
    });
});

/* ==========================================================
   Optional Public Verification GET Helper
========================================================== */

app.get(
    "/public/verify-credential",
    (req, res) => {
        return res.status(405).send(
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
   Existing behaviour is preserved in this release.

   Administrative authentication and authorization should
   be added through a separate focused hardening change.
========================================================== */

app.post(
    "/admin/credential-registry",
    async (req, res) => {
        try {
            const snapshot = await db
                .collection(
                    COLLECTIONS.credentials
                )
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
                            data.issued_by || "",

                        batch_name:
                            data.batch_name || "",

                        approval_status:
                            data.approval_status || "",

                        training_start_date:
                            data.training_start_date || "",

                        training_end_date:
                            data.training_end_date || "",

                        imported_at:
                            data.imported_at || null
                    };
                });

            return res.json({
                status: "success",
                version: "1.1.0",
                api: "credential-registry",
                total_records:
                    credentials.length,
                credentials
            });
        } catch (error) {
            console.error(
                `[${SERVICE_NAME}] ` +
                `Credential Registry Error:`,
                error
            );

            return res.status(500).json({
                status: "error",
                version: "1.1.0",
                api: "credential-registry",
                message:
                    "Failed to load credential registry"
            });
        }
    }
);

/* ==========================================================
   Learner Learning Resources API

   The API derives ownership from the verified Firebase token.
   Firestore document IDs and Storage paths are never returned
   to the learner-facing browser.
========================================================== */

function isResourceAvailableNow(access = {}) {
    const now = Date.now();
    const availableFrom = access.available_from
        ? Date.parse(access.available_from)
        : NaN;
    const availableUntil = access.available_until
        ? Date.parse(access.available_until)
        : NaN;

    return (
        (!Number.isFinite(availableFrom) || availableFrom <= now) &&
        (!Number.isFinite(availableUntil) || availableUntil >= now)
    );
}

async function requireOwnedLearningResource(
    accessId,
    authenticatedLearner
) {
    const accessReference = db
        .collection(COLLECTIONS.learnerResourceAccess)
        .doc(accessId);
    const accessSnapshot = await accessReference.get();

    if (!accessSnapshot.exists) {
        throw createServiceError({
            code: "LEARNING_RESOURCE_NOT_FOUND",
            message: "The learning resource is unavailable.",
            httpStatus: 404
        });
    }

    const access = accessSnapshot.data() || {};

    if (
        normalizeString(access.learner_uid) !==
            authenticatedLearner.uid ||
        normalizeLower(access.identity_status) !== "activated" ||
        normalizeLower(access.access_status) !== "active" ||
        normalizeLower(access.release_status) !== "released" ||
        !isResourceAvailableNow(access)
    ) {
        throw createServiceError({
            code: "LEARNING_RESOURCE_FORBIDDEN",
            message: "The learning resource is not available for this account.",
            httpStatus: 403
        });
    }

    const resourceReference = db
        .collection(COLLECTIONS.learningResources)
        .doc(normalizeString(access.resource_document_id));
    const resourceSnapshot = await resourceReference.get();
    const resource = resourceSnapshot.exists
        ? resourceSnapshot.data() || {}
        : null;

    if (
        !resource ||
        normalizeLower(resource.status) !== "published" ||
        resource.is_active !== true
    ) {
        throw createServiceError({
            code: "LEARNING_RESOURCE_NOT_FOUND",
            message: "The learning resource is unavailable.",
            httpStatus: 404
        });
    }

    return { access, resource };
}

app.get(
    "/api/v1/learning-resources/me",
    async (req, res) => {
        try {
            const learner = await verifyAuthenticatedLearner(req);
            const snapshot = await db
                .collection(COLLECTIONS.learnerResourceAccess)
                .where("learner_uid", "==", learner.uid)
                .limit(100)
                .get();

            const eligibleAccess = snapshot.docs.filter((document) => {
                const access = document.data() || {};
                return (
                    normalizeLower(access.identity_status) === "activated" &&
                    normalizeLower(access.access_status) === "active" &&
                    normalizeLower(access.release_status) === "released" &&
                    isResourceAvailableNow(access)
                );
            });

            const resources = await Promise.all(
                eligibleAccess.map(async (accessDocument) => {
                    const access = accessDocument.data() || {};
                    const resourceSnapshot = await db
                        .collection(COLLECTIONS.learningResources)
                        .doc(normalizeString(access.resource_document_id))
                        .get();
                    const resource = resourceSnapshot.exists
                        ? resourceSnapshot.data() || {}
                        : null;

                    if (
                        !resource ||
                        normalizeLower(resource.status) !== "published" ||
                        resource.is_active !== true
                    ) {
                        return null;
                    }

                    return {
                        accessId: accessDocument.id,
                        resourceId: normalizeString(resource.resource_id),
                        programCode: normalizeUpper(resource.program_code),
                        title: normalizeString(resource.title),
                        description: normalizeString(resource.description),
                        resourceType: normalizeLower(resource.resource_type),
                        category: normalizeLower(resource.category),
                        version: Number(resource.version) || 1,
                        fileName: normalizeString(resource.file_name),
                        mimeType: normalizeString(resource.mime_type),
                        previewAllowed:
                            access.preview_allowed === true &&
                            resource.preview_allowed === true,
                        downloadAllowed:
                            access.download_allowed === true &&
                            resource.download_allowed === true,
                        deliveryPath:
                            `/api/v1/learning-resources/${encodeURIComponent(accessDocument.id)}/delivery`
                    };
                })
            );

            return res.status(200).json({
                success: true,
                data: {
                    resources: resources.filter(Boolean)
                }
            });
        } catch (error) {
            return res.status(error.httpStatus || 500).json({
                success: false,
                error: {
                    code: error.code || "LEARNING_RESOURCE_LOAD_FAILED",
                    message:
                        error.httpStatus && error.httpStatus < 500
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
            const learner = await verifyAuthenticatedLearner(req);
            const { access, resource } =
                await requireOwnedLearningResource(
                    normalizeString(req.params.accessId),
                    learner
                );
            const deliveryType = normalizeLower(resource.delivery_type);

            if (deliveryType !== "protected_storage") {
                const externalUrl = normalizeString(resource.external_url);
                let parsedUrl;

                try {
                    parsedUrl = new URL(externalUrl);
                } catch (error) {
                    parsedUrl = null;
                }

                if (
                    !parsedUrl ||
                    !["https:", "http:"].includes(parsedUrl.protocol)
                ) {
                    throw createServiceError({
                        code: "LEARNING_RESOURCE_DELIVERY_INVALID",
                        message: "The learning resource delivery link is unavailable.",
                        httpStatus: 409
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: {
                        deliveryUrl: parsedUrl.toString(),
                        expiresAt: null
                    }
                });
            }

            if (
                access.download_allowed !== true ||
                resource.download_allowed !== true
            ) {
                throw createServiceError({
                    code: "LEARNING_RESOURCE_DOWNLOAD_FORBIDDEN",
                    message: "Download is not available for this learning resource.",
                    httpStatus: 403
                });
            }

            const storagePath = normalizeString(resource.storage_path);
            const fileName =
                normalizeString(resource.file_name) ||
                "Agile-AI-University-Learning-Resource";

            if (!storagePath) {
                throw createServiceError({
                    code: "LEARNING_RESOURCE_DELIVERY_INVALID",
                    message: "The learning resource file is unavailable.",
                    httpStatus: 409
                });
            }

            const bucket = admin.storage().bucket(
                process.env.LEARNING_RESOURCE_BUCKET ||
                "fb-agileai-university.firebasestorage.app"
            );
            const file = bucket.file(storagePath);
            const [exists] = await file.exists();

            if (!exists) {
                throw createServiceError({
                    code: "LEARNING_RESOURCE_FILE_NOT_FOUND",
                    message: "The learning resource file is unavailable.",
                    httpStatus: 404
                });
            }

            res.setHeader(
                "Content-Type",
                normalizeString(resource.mime_type) ||
                    "application/octet-stream"
            );
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${fileName.replace(/["\\\r\n]/g, "_")}"`
            );
            res.setHeader("Cache-Control", "private, no-store");

            return file.createReadStream().pipe(res);
        } catch (error) {
            return res.status(error.httpStatus || 500).json({
                success: false,
                error: {
                    code: error.code || "LEARNING_RESOURCE_DELIVERY_FAILED",
                    message:
                        error.httpStatus && error.httpStatus < 500
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