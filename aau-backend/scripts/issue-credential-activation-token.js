/* ==========================================================
   Agile AI University

   File      : issue-credential-activation-token.js
   Version   : 1.0.0
   Status    : ACTIVE
   Purpose   : Controlled AOP alumni activation-token issuance

   Governance
   ----------------------------------------------------------
   - Production-only operation
   - Dry-run by default
   - Explicit --apply required for writes
   - One credential per execution
   - Firebase Authentication is identity authority
   - credentials is credential authority
   - learner_uid = null means unclaimed
   - Plain activation tokens are never stored
   - Every applied issuance creates an audit event
   - Existing valid ownership is never overwritten
   - No Firebase Authentication user is created
   - No email is sent by this script

   Required arguments
   ----------------------------------------------------------
   --credential-id <AAU credential ID>
   --confirm-project fb-agileai-university

   Modes
   ----------------------------------------------------------
   --dry-run
   --apply

   Optional arguments
   ----------------------------------------------------------
   --expires-hours <hours>
   --campaign-id <campaign ID>
   --source <source>
   --portal-url <activation page URL>

   Examples
   ----------------------------------------------------------
   node scripts/issue-credential-activation-token.js `
     --dry-run `
     --credential-id AAU-XXXXXXXX `
     --confirm-project fb-agileai-university

   node scripts/issue-credential-activation-token.js `
     --apply `
     --credential-id AAU-XXXXXXXX `
     --confirm-project fb-agileai-university
========================================================== */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const {
    applicationDefault,
    getApps,
    initializeApp
} = require("firebase-admin/app");

const {
    FieldValue,
    Timestamp,
    getFirestore
} = require("firebase-admin/firestore");

/* ==========================================================
   Configuration
========================================================== */

const CONFIG = Object.freeze({
    expectedProjectId: "fb-agileai-university",

    credentialsCollection: "credentials",
    activationTokensCollection: "credential_activation_tokens",
    reconciliationEventsCollection: "identity_reconciliation_events",

    allowedProgramCode: "AOP",
    requiredApprovalStatus: "approved",
    requiredIssuedStatus: "finalized",

    defaultExpiryHours: 168, // 7 days
    minimumExpiryHours: 1,
    maximumExpiryHours: 720, // 30 days

    defaultCampaignId: "AOP-ALUMNI-2026-PILOT",
    defaultSource: "aop_alumni_pilot",

    defaultPortalUrl:
        "https://portal.agileai.university/activate",

    tokenBytes: 32, // 256-bit token
    tokenHashAlgorithm: "sha256",

    schemaVersion: "1.0",

    reportsDirectory: path.join(
        __dirname,
        "migration-reports",
        "credential-activation"
    )
});

/* ==========================================================
   Utility Functions
========================================================== */

function printHeading(title) {
    console.log("");
    console.log("============================================================");
    console.log(title);
    console.log("============================================================");
}

function fail(message, exitCode = 1) {
    console.error("");
    console.error(`[FAILED] ${message}`);
    process.exitCode = exitCode;
}

function normalizeString(value) {
    return typeof value === "string"
        ? value.trim()
        : "";
}

function normalizeEmail(value) {
    return normalizeString(value).toLowerCase();
}

function isValidEmail(value) {
    const email = normalizeEmail(value);

    if (!email || email.length > 254) {
        return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isNullOrUndefined(value) {
    return value === null || typeof value === "undefined";
}

function generateCorrelationId() {
    return crypto.randomUUID();
}

function generateActivationToken() {
    return crypto
        .randomBytes(CONFIG.tokenBytes)
        .toString("base64url");
}

function hashActivationToken(token) {
    return crypto
        .createHash(CONFIG.tokenHashAlgorithm)
        .update(token, "utf8")
        .digest("hex");
}

function maskEmail(email) {
    const normalized = normalizeEmail(email);
    const [localPart, domain] = normalized.split("@");

    if (!localPart || !domain) {
        return "[invalid-email]";
    }

    const visibleCharacters =
        localPart.length <= 2
            ? 1
            : Math.min(2, localPart.length);

    return `${localPart.slice(0, visibleCharacters)}***@${domain}`;
}

function sanitizeForFileName(value) {
    return normalizeString(value)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 100);
}

function timestampForFileName() {
    return new Date()
        .toISOString()
        .replace(/[:.]/g, "-");
}

function buildActivationUrl(portalUrl, token) {
    const url = new URL(portalUrl);
    url.searchParams.set("token", token);
    return url.toString();
}

function getCredentialPublicId(documentId, credentialData) {
    return (
        normalizeString(credentialData.credential_id) ||
        normalizeString(documentId)
    );
}

function getCredentialEmail(credentialData) {
    return normalizeEmail(
        credentialData.email ||
        credentialData.email_normalized ||
        credentialData.learner_email
    );
}

function getLearnerName(credentialData) {
    return (
        normalizeString(credentialData.full_name) ||
        normalizeString(credentialData.learner_name) ||
        "Learner"
    );
}

function getProjectIdFromEnvironment() {
    return (
        normalizeString(process.env.GOOGLE_CLOUD_PROJECT) ||
        normalizeString(process.env.GCLOUD_PROJECT) ||
        normalizeString(process.env.FIREBASE_CONFIG_PROJECT_ID)
    );
}

function safelyReadCredentialFileMetadata() {
    const credentialPath = normalizeString(
        process.env.GOOGLE_APPLICATION_CREDENTIALS
    );

    if (!credentialPath) {
        return {
            credentialPathConfigured: false,
            credentialFileExists: false,
            projectId: "",
            clientEmail: ""
        };
    }

    if (!fs.existsSync(credentialPath)) {
        return {
            credentialPathConfigured: true,
            credentialFileExists: false,
            projectId: "",
            clientEmail: ""
        };
    }

    try {
        const raw = fs.readFileSync(credentialPath, "utf8");
        const parsed = JSON.parse(raw);

        return {
            credentialPathConfigured: true,
            credentialFileExists: true,
            projectId: normalizeString(parsed.project_id),
            clientEmail: normalizeString(parsed.client_email)
        };
    } catch (error) {
        throw new Error(
            `Unable to safely read credential-file metadata: ${error.message}`
        );
    }
}

function getResolvedProjectId(app, credentialMetadata) {
    return (
        normalizeString(app.options.projectId) ||
        normalizeString(credentialMetadata.projectId) ||
        getProjectIdFromEnvironment()
    );
}

/* ==========================================================
   Command-Line Argument Parsing
========================================================== */

function parseArguments(argv) {
    const result = {
        mode: "dry-run",
        credentialId: "",
        confirmProject: "",
        expiresHours: CONFIG.defaultExpiryHours,
        campaignId: CONFIG.defaultCampaignId,
        source: CONFIG.defaultSource,
        portalUrl: CONFIG.defaultPortalUrl,
        help: false
    };

    let explicitDryRun = false;
    let explicitApply = false;

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];

        switch (argument) {
            case "--dry-run":
                explicitDryRun = true;
                result.mode = "dry-run";
                break;

            case "--apply":
                explicitApply = true;
                result.mode = "apply";
                break;

            case "--credential-id":
                result.credentialId = normalizeString(argv[++index]);
                break;

            case "--confirm-project":
                result.confirmProject = normalizeString(argv[++index]);
                break;

            case "--expires-hours":
                result.expiresHours = Number(argv[++index]);
                break;

            case "--campaign-id":
                result.campaignId = normalizeString(argv[++index]);
                break;

            case "--source":
                result.source = normalizeString(argv[++index]);
                break;

            case "--portal-url":
                result.portalUrl = normalizeString(argv[++index]);
                break;

            case "--help":
            case "-h":
                result.help = true;
                break;

            default:
                throw new Error(`Unknown argument: ${argument}`);
        }
    }

    if (explicitDryRun && explicitApply) {
        throw new Error(
            "Choose only one execution mode: --dry-run or --apply."
        );
    }

    return result;
}

function printUsage() {
    console.log(`
Usage:

  node scripts/issue-credential-activation-token.js \\
    --dry-run \\
    --credential-id AAU-XXXXXXXX \\
    --confirm-project fb-agileai-university

  node scripts/issue-credential-activation-token.js \\
    --apply \\
    --credential-id AAU-XXXXXXXX \\
    --confirm-project fb-agileai-university

Required:

  --credential-id <value>
  --confirm-project fb-agileai-university

Modes:

  --dry-run
  --apply

Optional:

  --expires-hours <1-${CONFIG.maximumExpiryHours}>
  --campaign-id <value>
  --source <value>
  --portal-url <https URL>
`);
}

function validateArguments(args) {
    if (!args.credentialId) {
        throw new Error("--credential-id is required.");
    }

    if (!args.confirmProject) {
        throw new Error("--confirm-project is required.");
    }

    if (args.confirmProject !== CONFIG.expectedProjectId) {
        throw new Error(
            `Project confirmation must exactly equal ` +
            `"${CONFIG.expectedProjectId}".`
        );
    }

    if (
        !Number.isInteger(args.expiresHours) ||
        args.expiresHours < CONFIG.minimumExpiryHours ||
        args.expiresHours > CONFIG.maximumExpiryHours
    ) {
        throw new Error(
            `--expires-hours must be an integer between ` +
            `${CONFIG.minimumExpiryHours} and ` +
            `${CONFIG.maximumExpiryHours}.`
        );
    }

    if (!args.campaignId) {
        throw new Error("--campaign-id cannot be empty.");
    }

    if (!args.source) {
        throw new Error("--source cannot be empty.");
    }

    let portalUrl;

    try {
        portalUrl = new URL(args.portalUrl);
    } catch {
        throw new Error("--portal-url must be a valid URL.");
    }

    if (portalUrl.protocol !== "https:") {
        throw new Error("--portal-url must use HTTPS.");
    }
}

/* ==========================================================
   Firebase Initialization
========================================================== */

function initializeFirebaseAdmin() {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    return initializeApp({
        credential: applicationDefault(),
        projectId: CONFIG.expectedProjectId
    });
}

/* ==========================================================
   Credential Lookup and Validation
========================================================== */

async function findCredential(db, requestedCredentialId) {
    const credentials = db.collection(
        CONFIG.credentialsCollection
    );

    /*
     * Preferred lookup:
     * credentials.credential_id == requested value
     */
    const querySnapshot = await credentials
        .where("credential_id", "==", requestedCredentialId)
        .limit(2)
        .get();

    if (querySnapshot.size > 1) {
        throw new Error(
            `Multiple credential records use credential_id ` +
            `"${requestedCredentialId}". Manual review is required.`
        );
    }

    if (querySnapshot.size === 1) {
        return querySnapshot.docs[0];
    }

    /*
     * Compatibility fallback:
     * Firestore document ID equals credential ID.
     */
    const directSnapshot = await credentials
        .doc(requestedCredentialId)
        .get();

    if (directSnapshot.exists) {
        return directSnapshot;
    }

    throw new Error(
        `Credential "${requestedCredentialId}" was not found.`
    );
}

function validateCredential(credentialSnapshot) {
    const credential = credentialSnapshot.data() || {};
    const publicCredentialId = getCredentialPublicId(
        credentialSnapshot.id,
        credential
    );

    const programCode = normalizeString(
        credential.program_code
    ).toUpperCase();

    const approvalStatus = normalizeString(
        credential.approval_status
    ).toLowerCase();

    const issuedStatus = normalizeString(
        credential.issued_status
    ).toLowerCase();

    const emailNormalized = getCredentialEmail(credential);
    const learnerUid = credential.learner_uid;

    const failures = [];

    if (programCode !== CONFIG.allowedProgramCode) {
        failures.push(
            `program_code must be "${CONFIG.allowedProgramCode}".`
        );
    }

    if (approvalStatus !== CONFIG.requiredApprovalStatus) {
        failures.push(
            `approval_status must be ` +
            `"${CONFIG.requiredApprovalStatus}".`
        );
    }

    if (issuedStatus !== CONFIG.requiredIssuedStatus) {
        failures.push(
            `issued_status must be ` +
            `"${CONFIG.requiredIssuedStatus}".`
        );
    }

    if (!isValidEmail(emailNormalized)) {
        failures.push(
            "Credential must contain a valid learner email."
        );
    }

    if (!isNullOrUndefined(learnerUid)) {
        failures.push(
            "Credential is already linked to a learner_uid. " +
            "Existing ownership will not be overwritten."
        );
    }

    return {
        valid: failures.length === 0,
        failures,
        credential,
        credentialDocumentId: credentialSnapshot.id,
        credentialId: publicCredentialId,
        programCode,
        approvalStatus,
        issuedStatus,
        emailNormalized,
        emailMasked: maskEmail(emailNormalized),
        learnerName: getLearnerName(credential),
        learnerUid: learnerUid ?? null
    };
}

/* ==========================================================
   Activation Record Lookup
========================================================== */

async function findActiveTokensForCredential(
    db,
    credentialId
) {
    const snapshot = await db
        .collection(CONFIG.activationTokensCollection)
        .where("credential_id", "==", credentialId)
        .where("status", "==", "issued")
        .limit(10)
        .get();

    return snapshot.docs;
}

/* ==========================================================
   Reporting
========================================================== */

function writeReport(report) {
    fs.mkdirSync(CONFIG.reportsDirectory, {
        recursive: true
    });

    const mode = sanitizeForFileName(report.mode);
    const credentialId = sanitizeForFileName(
        report.credentialId || "unknown"
    );

    const filename =
        `${timestampForFileName()}_${mode}_${credentialId}.json`;

    const reportPath = path.join(
        CONFIG.reportsDirectory,
        filename
    );

    /*
     * Important:
     * The report must never contain the plain activation token
     * or the complete activation URL.
     */
    fs.writeFileSync(
        reportPath,
        `${JSON.stringify(report, null, 2)}\n`,
        "utf8"
    );

    return reportPath;
}

/* ==========================================================
   Dry Run
========================================================== */

async function executeDryRun({
    db,
    args,
    projectId,
    serviceAccountEmail,
    credentialResult
}) {
    const activeTokens = await findActiveTokensForCredential(
        db,
        credentialResult.credentialId
    );

    const expiresAt = new Date(
        Date.now() + args.expiresHours * 60 * 60 * 1000
    );

    const report = {
        script: "issue-credential-activation-token.js",
        scriptVersion: "1.0.0",
        mode: "dry-run",
        result: credentialResult.valid
            ? "ready"
            : "blocked",
        generatedAt: new Date().toISOString(),

        projectId,
        expectedProjectId: CONFIG.expectedProjectId,
        serviceAccountEmail:
            serviceAccountEmail || "application-default-credentials",

        credentialId: credentialResult.credentialId,
        credentialDocumentId:
            credentialResult.credentialDocumentId,
        programCode: credentialResult.programCode,
        approvalStatus: credentialResult.approvalStatus,
        issuedStatus: credentialResult.issuedStatus,
        emailMasked: credentialResult.emailMasked,
        learnerUidPresent:
            !isNullOrUndefined(credentialResult.learnerUid),

        activeTokenCount: activeTokens.length,
        priorActiveTokensWouldBeRevoked:
            activeTokens.length,

        campaignId: args.campaignId,
        source: args.source,
        expiresHours: args.expiresHours,
        projectedExpiresAt: expiresAt.toISOString(),
        portalUrl: args.portalUrl,

        plainTokenGenerated: false,
        writesPerformed: 0,

        validationFailures: credentialResult.failures
    };

    const reportPath = writeReport(report);

    printHeading("DRY-RUN RESULT");

    console.log(`Result                 : ${report.result}`);
    console.log(`Project                : ${projectId}`);
    console.log(
        `Credential             : ${credentialResult.credentialId}`
    );
    console.log(
        `Programme              : ${credentialResult.programCode}`
    );
    console.log(
        `Learner                : ${credentialResult.learnerName}`
    );
    console.log(
        `Email                  : ${credentialResult.emailMasked}`
    );
    console.log(
        `Active issued tokens   : ${activeTokens.length}`
    );
    console.log(
        `Would revoke           : ${activeTokens.length}`
    );
    console.log(
        `Would create token     : ${credentialResult.valid ? "YES" : "NO"}`
    );
    console.log("Writes performed       : 0");
    console.log(`Report                 : ${reportPath}`);

    if (!credentialResult.valid) {
        console.log("");
        console.log("Validation failures:");

        for (const failure of credentialResult.failures) {
            console.log(`- ${failure}`);
        }

        throw new Error(
            "Dry run failed credential validation. No writes were performed."
        );
    }

    console.log("");
    console.log(
        "Dry run successful. Review the report before using --apply."
    );

    return report;
}

/* ==========================================================
   Apply
========================================================== */

async function executeApply({
    db,
    args,
    projectId,
    serviceAccountEmail,
    credentialResult
}) {
    if (!credentialResult.valid) {
        throw new Error(
            `Credential validation failed: ` +
            credentialResult.failures.join(" ")
        );
    }

    /*
     * Generate values once, outside the transaction callback.
     * Firestore may execute the callback more than once.
     */
    const plainToken = generateActivationToken();
    const tokenHash = hashActivationToken(plainToken);
    const correlationId = generateCorrelationId();

    const now = new Date();
    const expiresAtDate = new Date(
        now.getTime() + args.expiresHours * 60 * 60 * 1000
    );

    const activationRef = db
        .collection(CONFIG.activationTokensCollection)
        .doc();

    const auditRef = db
        .collection(CONFIG.reconciliationEventsCollection)
        .doc();

    const credentialRef = db
        .collection(CONFIG.credentialsCollection)
        .doc(credentialResult.credentialDocumentId);

    const transactionResult = await db.runTransaction(
        async (transaction) => {
            /*
             * All transaction reads occur before transaction writes.
             */

            const latestCredentialSnapshot =
                await transaction.get(credentialRef);

            if (!latestCredentialSnapshot.exists) {
                throw new Error(
                    "Credential disappeared before activation issuance."
                );
            }

            const latestCredentialResult =
                validateCredential(latestCredentialSnapshot);

            if (!latestCredentialResult.valid) {
                throw new Error(
                    `Credential state changed before issuance: ` +
                    latestCredentialResult.failures.join(" ")
                );
            }

            const activeTokenQuery = db
                .collection(CONFIG.activationTokensCollection)
                .where(
                    "credential_id",
                    "==",
                    credentialResult.credentialId
                )
                .where("status", "==", "issued")
                .limit(10);

            const activeTokenSnapshot =
                await transaction.get(activeTokenQuery);

            const serverTimestamp = FieldValue.serverTimestamp();

            /*
             * Revoke any earlier issued tokens for this credential.
             * This prevents multiple simultaneously valid invitations.
             */
            for (const activeTokenDoc of activeTokenSnapshot.docs) {
                transaction.update(activeTokenDoc.ref, {
                    status: "revoked",
                    revoked_at: serverTimestamp,
                    revoked_by: serviceAccountEmail ||
                        "credential-activation-script",
                    revoke_reason: "superseded_by_new_token",
                    updated_at: serverTimestamp,
                    version: CONFIG.schemaVersion
                });
            }

            transaction.create(activationRef, {
                credential_id:
                    credentialResult.credentialId,

                credential_document_id:
                    credentialResult.credentialDocumentId,

                email_normalized:
                    credentialResult.emailNormalized,

                token_hash: tokenHash,
                token_hash_algorithm:
                    CONFIG.tokenHashAlgorithm,

                status: "issued",
                expires_at: Timestamp.fromDate(expiresAtDate),

                created_at: serverTimestamp,
                created_by:
                    serviceAccountEmail ||
                    "credential-activation-script",

                updated_at: serverTimestamp,

                consumed_at: null,
                consumed_by_uid: null,

                revoked_at: null,
                revoked_by: null,
                revoke_reason: null,

                blocked_at: null,
                blocked_reason: null,

                attempt_count: 0,
                last_attempt_at: null,

                source: args.source,
                campaign_id: args.campaignId,
                correlation_id: correlationId,
                version: CONFIG.schemaVersion,

                metadata: {
                    programme_code:
                        credentialResult.programCode,

                    invitation_delivery:
                        "manual_google_workspace",

                    portal_url: args.portalUrl,

                    prior_active_tokens_revoked:
                        activeTokenSnapshot.size
                }
            });

            transaction.create(auditRef, {
                event_type: "activation_token_issued",

                credential_id:
                    credentialResult.credentialId,

                credential_document_id:
                    credentialResult.credentialDocumentId,

                learner_uid: null,

                email_normalized:
                    credentialResult.emailNormalized,

                actor_type: "service",

                actor_id:
                    serviceAccountEmail ||
                    "credential-activation-script",

                source: args.source,
                result: "success",
                reason: null,

                created_at: serverTimestamp,

                correlation_id: correlationId,
                request_id: null,
                activation_token_id: activationRef.id,

                version: CONFIG.schemaVersion,

                metadata: {
                    campaign_id: args.campaignId,
                    programme_code:
                        credentialResult.programCode,

                    expires_at:
                        Timestamp.fromDate(expiresAtDate),

                    invitation_delivery:
                        "manual_google_workspace",

                    prior_active_tokens_revoked:
                        activeTokenSnapshot.size
                }
            });

            return {
                priorActiveTokensRevoked:
                    activeTokenSnapshot.size
            };
        }
    );

    const activationUrl = buildActivationUrl(
        args.portalUrl,
        plainToken
    );

    const report = {
        script: "issue-credential-activation-token.js",
        scriptVersion: "1.0.0",
        mode: "apply",
        result: "issued",
        generatedAt: new Date().toISOString(),

        projectId,
        expectedProjectId: CONFIG.expectedProjectId,
        serviceAccountEmail:
            serviceAccountEmail || "application-default-credentials",

        credentialId: credentialResult.credentialId,
        credentialDocumentId:
            credentialResult.credentialDocumentId,
        programCode: credentialResult.programCode,
        emailMasked: credentialResult.emailMasked,

        activationRecordId: activationRef.id,
        auditEventId: auditRef.id,

        status: "issued",
        campaignId: args.campaignId,
        source: args.source,
        expiresHours: args.expiresHours,
        expiresAt: expiresAtDate.toISOString(),

        priorActiveTokensRevoked:
            transactionResult.priorActiveTokensRevoked,

        invitationDelivery: "manual_google_workspace",

        /*
         * Explicit proof that secret-bearing values were excluded.
         */
        plainTokenStoredInReport: false,
        activationUrlStoredInReport: false,
        tokenHashStoredInReport: false,

        writesPerformed:
            2 + transactionResult.priorActiveTokensRevoked
    };

    const reportPath = writeReport(report);

    printHeading("ACTIVATION TOKEN ISSUED");

    console.log(`Project                : ${projectId}`);
    console.log(
        `Credential             : ${credentialResult.credentialId}`
    );
    console.log(
        `Learner                : ${credentialResult.learnerName}`
    );
    console.log(
        `Email                  : ${credentialResult.emailMasked}`
    );
    console.log(`Campaign               : ${args.campaignId}`);
    console.log(`Expires                : ${expiresAtDate.toISOString()}`);
    console.log(
        `Previous tokens revoked: ` +
        transactionResult.priorActiveTokensRevoked
    );
    console.log(`Activation record      : ${activationRef.id}`);
    console.log(`Audit event            : ${auditRef.id}`);
    console.log(`Report                 : ${reportPath}`);

    console.log("");
    console.log("IMPORTANT SECURITY NOTICE");
    console.log("-------------------------");
    console.log(
        "The activation URL below contains a one-time secret."
    );
    console.log(
        "Copy it now into the intended learner's individual email."
    );
    console.log(
        "Do not paste it into chat, Git, tickets, screenshots or logs."
    );
    console.log(
        "This URL is not stored in Firestore or in the report."
    );

    console.log("");
    console.log("ACTIVATION URL — DISPLAYED ONCE");
    console.log("--------------------------------");
    console.log(activationUrl);
    console.log("--------------------------------");

    /*
     * Best-effort reduction of the plain token's lifetime in this
     * process. JavaScript strings are immutable and cannot be
     * guaranteed to be erased from memory.
     */
    return {
        activationRecordId: activationRef.id,
        auditEventId: auditRef.id,
        reportPath
    };
}

/* ==========================================================
   Main
========================================================== */

async function main() {
    printHeading(
        "AGILE AI UNIVERSITY — CREDENTIAL ACTIVATION TOKEN ISSUANCE"
    );

    const args = parseArguments(
        process.argv.slice(2)
    );

    if (args.help) {
        printUsage();
        return;
    }

    validateArguments(args);

    const credentialMetadata =
        safelyReadCredentialFileMetadata();

    if (!credentialMetadata.credentialPathConfigured) {
        throw new Error(
            "GOOGLE_APPLICATION_CREDENTIALS is not configured."
        );
    }

    if (!credentialMetadata.credentialFileExists) {
        throw new Error(
            "The GOOGLE_APPLICATION_CREDENTIALS file does not exist."
        );
    }

    const app = initializeFirebaseAdmin();
    const db = getFirestore(app);

    const projectId = getResolvedProjectId(
        app,
        credentialMetadata
    );

    if (!projectId) {
        throw new Error(
            "Unable to determine the active Firebase project ID."
        );
    }

    if (projectId !== CONFIG.expectedProjectId) {
        throw new Error(
            `Project safety check failed. Active project is ` +
            `"${projectId}", expected ` +
            `"${CONFIG.expectedProjectId}".`
        );
    }

    if (args.confirmProject !== projectId) {
        throw new Error(
            `--confirm-project does not match the active project.`
        );
    }

    console.log(`Mode                   : ${args.mode}`);
    console.log(`Target project         : ${projectId}`);
    console.log(
        `Service account        : ` +
        (
            credentialMetadata.clientEmail ||
            "application-default-credentials"
        )
    );
    console.log(`Credential requested   : ${args.credentialId}`);
    console.log(`Campaign               : ${args.campaignId}`);
    console.log(`Expiry hours           : ${args.expiresHours}`);
    console.log(`Invitation delivery    : manual Google Workspace`);
    console.log(`Paid email provider    : NO`);
    console.log(`Bulk processing        : DISABLED`);

    const credentialSnapshot = await findCredential(
        db,
        args.credentialId
    );

    const credentialResult = validateCredential(
        credentialSnapshot
    );

    if (args.mode === "dry-run") {
        await executeDryRun({
            db,
            args,
            projectId,
            serviceAccountEmail:
                credentialMetadata.clientEmail,
            credentialResult
        });

        return;
    }

    await executeApply({
        db,
        args,
        projectId,
        serviceAccountEmail:
            credentialMetadata.clientEmail,
        credentialResult
    });
}

/* ==========================================================
   Process-Level Error Handling
========================================================== */

main()
    .then(() => {
        if (!process.exitCode) {
            console.log("");
            console.log("[COMPLETE] Operation finished successfully.");
        }
    })
    .catch((error) => {
        fail(
            error && error.message
                ? error.message
                : String(error)
        );

        if (
            process.env.AAU_DEBUG_ACTIVATION_SCRIPT === "true" &&
            error &&
            error.stack
        ) {
            /*
             * Debug mode must not be used when stack traces may
             * contain secret-bearing request data.
             */
            console.error("");
            console.error(error.stack);
        }
    });