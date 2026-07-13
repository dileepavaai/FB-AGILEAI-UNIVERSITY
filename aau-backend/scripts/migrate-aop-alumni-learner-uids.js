"use strict";

/**
 * ============================================================
 * Agile AI University
 *
 * Script:
 * migrate-aop-alumni-learner-uids.js
 *
 * Version:
 * 1.0.0
 *
 * Status:
 * ACTIVE
 *
 * Purpose:
 * Reconcile approved and finalized AOP credentials with
 * existing Firebase Authentication users.
 *
 * Governance:
 * - Dry-run is the default.
 * - This script never creates Firebase Authentication users.
 * - Exact normalized email match is required.
 * - Existing learner_uid values are verified before any update.
 * - Conflicting identity data is never overwritten automatically.
 * - Only credentials with approved + finalized AOP status qualify.
 *
 * Usage:
 *
 * Dry run:
 * node scripts/migrate-aop-alumni-learner-uids.js --dry-run
 *
 * Apply verified mappings:
 * node scripts/migrate-aop-alumni-learner-uids.js --apply
 *
 * Optional project:
 * node scripts/migrate-aop-alumni-learner-uids.js --dry-run \
 *   --project=fb-agileai-university
 *
 * Authentication:
 * Use Application Default Credentials or set:
 *
 * GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *
 * ============================================================
 */

const fs = require("fs");
const path = require("path");

const {
    applicationDefault,
    getApps,
    initializeApp
} = require("firebase-admin/app");

const {
    getAuth
} = require("firebase-admin/auth");

const {
    FieldValue,
    getFirestore
} = require("firebase-admin/firestore");

/* ============================================================
   CONFIGURATION
============================================================ */

const CONFIG = Object.freeze({
    projectId:
        getArgumentValue("--project") ||
        process.env.GCLOUD_PROJECT ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        "fb-agileai-university",

    credentialsCollection: "credentials",

    programmeCode: "AOP",

    requiredApprovalStatus: "approved",

    requiredIssuedStatus: "finalized",

    migrationName: "aop-alumni-learner-uid-reconciliation-v1",

    reportDirectory: path.resolve(
        __dirname,
        "migration-reports"
    )
});

/* ============================================================
   EXECUTION MODE
============================================================ */

const APPLY_MODE = process.argv.includes("--apply");

const DRY_RUN_MODE =
    process.argv.includes("--dry-run") ||
    !APPLY_MODE;

/* ============================================================
   STATUS CONSTANTS
============================================================ */

const STATUS = Object.freeze({
    ALREADY_LINKED: "ALREADY_LINKED",
    LINK_READY: "LINK_READY",
    LINKED: "LINKED",
    ACTIVATION_REQUIRED: "ACTIVATION_REQUIRED",
    UID_EMAIL_CONFLICT: "UID_EMAIL_CONFLICT",
    UID_NOT_FOUND: "UID_NOT_FOUND",
    DUPLICATE_CREDENTIAL_EMAIL: "DUPLICATE_CREDENTIAL_EMAIL",
    INVALID_EMAIL: "INVALID_EMAIL",
    MISSING_CREDENTIAL_ID: "MISSING_CREDENTIAL_ID",
    AUTH_LOOKUP_ERROR: "AUTH_LOOKUP_ERROR",
    UPDATE_FAILED: "UPDATE_FAILED",
    SKIPPED_NOT_ELIGIBLE: "SKIPPED_NOT_ELIGIBLE"
});

/* ============================================================
   FIREBASE INITIALIZATION
============================================================ */

function initializeFirebase() {

    if (getApps().length > 0) {
        return getApps()[0];
    }

    return initializeApp({
        credential: applicationDefault(),
        projectId: CONFIG.projectId
    });
}

/* ============================================================
   ARGUMENT HELPERS
============================================================ */

function getArgumentValue(name) {

    const prefix = `${name}=`;

    const argument = process.argv.find(
        item => item.startsWith(prefix)
    );

    if (!argument) {
        return "";
    }

    return argument.substring(prefix.length).trim();
}

/* ============================================================
   NORMALIZATION
============================================================ */

function normalizeString(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
}

function normalizeEmail(value) {

    return normalizeString(value).toLowerCase();
}

function normalizeProgrammeCode(value) {

    return normalizeString(value).toUpperCase();
}

function normalizeStatus(value) {

    return normalizeString(value).toLowerCase();
}

function isValidEmail(email) {

    if (!email) {
        return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   FIREBASE AUTH ERROR HELPERS
============================================================ */

function isUserNotFoundError(error) {

    if (!error) {
        return false;
    }

    return (
        error.code === "auth/user-not-found" ||
        error.errorInfo?.code === "auth/user-not-found"
    );
}

/* ============================================================
   CREDENTIAL ELIGIBILITY
============================================================ */

function isEligibleCredential(data) {

    return (
        normalizeProgrammeCode(data.program_code) ===
            CONFIG.programmeCode &&
        normalizeStatus(data.approval_status) ===
            CONFIG.requiredApprovalStatus &&
        normalizeStatus(data.issued_status) ===
            CONFIG.requiredIssuedStatus
    );
}

/* ============================================================
   REPORT HELPERS
============================================================ */

function createReportRow({
    documentId,
    credentialId,
    fullName,
    email,
    existingLearnerUid,
    resolvedAuthUid,
    status,
    action,
    message
}) {

    return {
        document_id: normalizeString(documentId),
        credential_id: normalizeString(credentialId),
        full_name: normalizeString(fullName),
        email: normalizeEmail(email),
        existing_learner_uid:
            normalizeString(existingLearnerUid),
        resolved_auth_uid:
            normalizeString(resolvedAuthUid),
        status: normalizeString(status),
        action: normalizeString(action),
        message: normalizeString(message)
    };
}

function escapeCsv(value) {

    const text = normalizeString(value);

    if (
        text.includes(",") ||
        text.includes("\"") ||
        text.includes("\n") ||
        text.includes("\r")
    ) {
        return `"${text.replace(/"/g, "\"\"")}"`;
    }

    return text;
}

function convertRowsToCsv(rows) {

    const headers = [
        "document_id",
        "credential_id",
        "full_name",
        "email",
        "existing_learner_uid",
        "resolved_auth_uid",
        "status",
        "action",
        "message"
    ];

    const lines = [
        headers.join(",")
    ];

    for (const row of rows) {

        lines.push(
            headers
                .map(header => escapeCsv(row[header]))
                .join(",")
        );
    }

    return lines.join("\n");
}

function ensureReportDirectory() {

    fs.mkdirSync(
        CONFIG.reportDirectory,
        {
            recursive: true
        }
    );
}

function createReportTimestamp() {

    return new Date()
        .toISOString()
        .replace(/[:.]/g, "-");
}

function writeReports(rows, summary) {

    ensureReportDirectory();

    const timestamp = createReportTimestamp();

    const mode = APPLY_MODE
        ? "apply"
        : "dry-run";

    const baseName =
        `aop-learner-uid-${mode}-${timestamp}`;

    const jsonPath = path.join(
        CONFIG.reportDirectory,
        `${baseName}.json`
    );

    const csvPath = path.join(
        CONFIG.reportDirectory,
        `${baseName}.csv`
    );

    fs.writeFileSync(
        jsonPath,
        JSON.stringify(
            {
                metadata: {
                    generated_at:
                        new Date().toISOString(),

                    project_id:
                        CONFIG.projectId,

                    mode,

                    migration:
                        CONFIG.migrationName
                },

                summary,

                records: rows
            },
            null,
            2
        ),
        "utf8"
    );

    fs.writeFileSync(
        csvPath,
        convertRowsToCsv(rows),
        "utf8"
    );

    return {
        jsonPath,
        csvPath
    };
}

/* ============================================================
   CONSOLE HELPERS
============================================================ */

function printHeader() {

    console.log("");
    console.log("============================================================");
    console.log("Agile AI University");
    console.log("AOP Alumni learner_uid Reconciliation");
    console.log("============================================================");
    console.log(`Project: ${CONFIG.projectId}`);
    console.log(
        `Mode: ${APPLY_MODE ? "APPLY" : "DRY RUN"}`
    );
    console.log(
        `Collection: ${CONFIG.credentialsCollection}`
    );
    console.log(
        `Programme: ${CONFIG.programmeCode}`
    );
    console.log(
        "Creates Authentication users: NO"
    );
    console.log("============================================================");
    console.log("");
}

function printCredentialResult(row) {

    console.log(
        `[${row.status}] ` +
        `${row.credential_id || row.document_id} | ` +
        `${row.email || "no-email"} | ` +
        `${row.message}`
    );
}

function printSummary(summary) {

    console.log("");
    console.log("============================================================");
    console.log("Migration Summary");
    console.log("============================================================");

    for (const [key, value] of Object.entries(summary)) {
        console.log(
            `${key.padEnd(34, " ")} ${value}`
        );
    }

    console.log("============================================================");
    console.log("");
}

/* ============================================================
   LOAD ELIGIBLE CREDENTIALS
============================================================ */

async function loadEligibleCredentials(db) {

    /*
     * We query only by programme_code and filter the remaining
     * lifecycle fields in memory. This avoids requiring a new
     * composite Firestore index for a one-time migration.
     */

    const snapshot = await db
        .collection(CONFIG.credentialsCollection)
        .where(
            "program_code",
            "==",
            CONFIG.programmeCode
        )
        .get();

    const allProgrammeRecords = snapshot.docs.map(doc => ({
        ref: doc.ref,
        documentId: doc.id,
        data: doc.data()
    }));

    return allProgrammeRecords.filter(record =>
        isEligibleCredential(record.data)
    );
}

/* ============================================================
   DUPLICATE EMAIL DETECTION
============================================================ */

function buildDuplicateEmailSet(records) {

    const emailCounts = new Map();

    for (const record of records) {

        const email =
            normalizeEmail(record.data.email);

        if (!email) {
            continue;
        }

        emailCounts.set(
            email,
            (emailCounts.get(email) || 0) + 1
        );
    }

    return new Set(
        [...emailCounts.entries()]
            .filter(([, count]) => count > 1)
            .map(([email]) => email)
    );
}

/* ============================================================
   VERIFY EXISTING UID
============================================================ */

async function verifyExistingUid({
    auth,
    record,
    email,
    existingLearnerUid
}) {

    const data = record.data;

    try {

        const user = await auth.getUser(
            existingLearnerUid
        );

        const authEmail =
            normalizeEmail(user.email);

        if (
            !authEmail ||
            authEmail !== email
        ) {

            return createReportRow({
                documentId: record.documentId,
                credentialId: data.credential_id,
                fullName: data.full_name,
                email,
                existingLearnerUid,
                resolvedAuthUid: user.uid,
                status:
                    STATUS.UID_EMAIL_CONFLICT,
                action:
                    "MANUAL_REVIEW",
                message:
                    `Existing learner_uid belongs to Auth email ` +
                    `"${authEmail || "missing"}", not "${email}".`
            });
        }

        return createReportRow({
            documentId: record.documentId,
            credentialId: data.credential_id,
            fullName: data.full_name,
            email,
            existingLearnerUid,
            resolvedAuthUid: user.uid,
            status:
                STATUS.ALREADY_LINKED,
            action:
                "NONE",
            message:
                "Existing learner_uid is valid and matches the credential email."
        });

    } catch (error) {

        if (isUserNotFoundError(error)) {

            return createReportRow({
                documentId: record.documentId,
                credentialId: data.credential_id,
                fullName: data.full_name,
                email,
                existingLearnerUid,
                resolvedAuthUid: "",
                status:
                    STATUS.UID_NOT_FOUND,
                action:
                    "MANUAL_REVIEW",
                message:
                    "Existing learner_uid does not exist in Firebase Authentication."
            });
        }

        return createReportRow({
            documentId: record.documentId,
            credentialId: data.credential_id,
            fullName: data.full_name,
            email,
            existingLearnerUid,
            resolvedAuthUid: "",
            status:
                STATUS.AUTH_LOOKUP_ERROR,
            action:
                "RETRY_OR_REVIEW",
            message:
                `Unable to verify existing learner_uid: ${error.message}`
        });
    }
}

/* ============================================================
   RESOLVE AUTH USER BY EMAIL
============================================================ */

async function resolveAuthUserByEmail({
    auth,
    record,
    email
}) {

    const data = record.data;

    try {

        const user = await auth.getUserByEmail(
            email
        );

        return {
            user,
            row: createReportRow({
                documentId: record.documentId,
                credentialId: data.credential_id,
                fullName: data.full_name,
                email,
                existingLearnerUid: "",
                resolvedAuthUid: user.uid,
                status:
                    STATUS.LINK_READY,
                action:
                    APPLY_MODE
                        ? "UPDATE_CREDENTIAL"
                        : "WOULD_UPDATE_CREDENTIAL",
                message:
                    "Exact Firebase Authentication email match found."
            })
        };

    } catch (error) {

        if (isUserNotFoundError(error)) {

            return {
                user: null,
                row: createReportRow({
                    documentId: record.documentId,
                    credentialId: data.credential_id,
                    fullName: data.full_name,
                    email,
                    existingLearnerUid: "",
                    resolvedAuthUid: "",
                    status:
                        STATUS.ACTIVATION_REQUIRED,
                    action:
                        "INVITE_ALUMNUS",
                    message:
                        "No Firebase Authentication account exists for this email."
                })
            };
        }

        return {
            user: null,
            row: createReportRow({
                documentId: record.documentId,
                credentialId: data.credential_id,
                fullName: data.full_name,
                email,
                existingLearnerUid: "",
                resolvedAuthUid: "",
                status:
                    STATUS.AUTH_LOOKUP_ERROR,
                action:
                    "RETRY_OR_REVIEW",
                message:
                    `Firebase Authentication lookup failed: ${error.message}`
            })
        };
    }
}

/* ============================================================
   APPLY CREDENTIAL UPDATE
============================================================ */

async function applyCredentialLink({
    record,
    user
}) {

    await record.ref.update({
        learner_uid: user.uid,

        learner_email:
            normalizeEmail(user.email),

        ownership_status:
            "linked",

        ownership_source:
            "firebase_auth_exact_email_match",

        ownership_linked_at:
            FieldValue.serverTimestamp(),

        ownership_linked_by:
            CONFIG.migrationName,

        updated_at:
            FieldValue.serverTimestamp()
    });
}

/* ============================================================
   PROCESS CREDENTIAL
============================================================ */

async function processCredential({
    auth,
    record,
    duplicateEmails
}) {

    const data = record.data;

    const credentialId =
        normalizeString(data.credential_id);

    const fullName =
        normalizeString(data.full_name);

    const email =
        normalizeEmail(data.email);

    const existingLearnerUid =
        normalizeString(data.learner_uid);

    if (!credentialId) {

        return createReportRow({
            documentId: record.documentId,
            credentialId: "",
            fullName,
            email,
            existingLearnerUid,
            resolvedAuthUid: "",
            status:
                STATUS.MISSING_CREDENTIAL_ID,
            action:
                "MANUAL_REVIEW",
            message:
                "Credential document does not contain credential_id."
        });
    }

    if (!isValidEmail(email)) {

        return createReportRow({
            documentId: record.documentId,
            credentialId,
            fullName,
            email,
            existingLearnerUid,
            resolvedAuthUid: "",
            status:
                STATUS.INVALID_EMAIL,
            action:
                "MANUAL_REVIEW",
            message:
                "Credential email is missing or invalid."
        });
    }

    if (duplicateEmails.has(email)) {

        return createReportRow({
            documentId: record.documentId,
            credentialId,
            fullName,
            email,
            existingLearnerUid,
            resolvedAuthUid: "",
            status:
                STATUS.DUPLICATE_CREDENTIAL_EMAIL,
            action:
                "MANUAL_REVIEW",
            message:
                "Multiple eligible AOP credential records use this email."
        });
    }

    if (existingLearnerUid) {

        return verifyExistingUid({
            auth,
            record,
            email,
            existingLearnerUid
        });
    }

    const resolution =
        await resolveAuthUserByEmail({
            auth,
            record,
            email
        });

    if (!resolution.user) {
        return resolution.row;
    }

    if (DRY_RUN_MODE) {
        return resolution.row;
    }

    try {

        await applyCredentialLink({
            record,
            user: resolution.user
        });

        return createReportRow({
            documentId: record.documentId,
            credentialId,
            fullName,
            email,
            existingLearnerUid: "",
            resolvedAuthUid:
                resolution.user.uid,
            status:
                STATUS.LINKED,
            action:
                "UPDATED_CREDENTIAL",
            message:
                "learner_uid successfully written to the credential document."
        });

    } catch (error) {

        return createReportRow({
            documentId: record.documentId,
            credentialId,
            fullName,
            email,
            existingLearnerUid: "",
            resolvedAuthUid:
                resolution.user.uid,
            status:
                STATUS.UPDATE_FAILED,
            action:
                "RETRY_OR_REVIEW",
            message:
                `Firestore update failed: ${error.message}`
        });
    }
}

/* ============================================================
   SUMMARY
============================================================ */

function buildSummary(rows, eligibleCount) {

    const summary = {
        eligible_aop_credentials:
            eligibleCount,

        already_linked:
            0,

        link_ready:
            0,

        linked:
            0,

        activation_required:
            0,

        duplicate_credential_email:
            0,

        invalid_email:
            0,

        uid_email_conflict:
            0,

        uid_not_found:
            0,

        missing_credential_id:
            0,

        auth_lookup_error:
            0,

        update_failed:
            0,

        manual_review_total:
            0
    };

    for (const row of rows) {

        switch (row.status) {

            case STATUS.ALREADY_LINKED:
                summary.already_linked += 1;
                break;

            case STATUS.LINK_READY:
                summary.link_ready += 1;
                break;

            case STATUS.LINKED:
                summary.linked += 1;
                break;

            case STATUS.ACTIVATION_REQUIRED:
                summary.activation_required += 1;
                break;

            case STATUS.DUPLICATE_CREDENTIAL_EMAIL:
                summary.duplicate_credential_email += 1;
                break;

            case STATUS.INVALID_EMAIL:
                summary.invalid_email += 1;
                break;

            case STATUS.UID_EMAIL_CONFLICT:
                summary.uid_email_conflict += 1;
                break;

            case STATUS.UID_NOT_FOUND:
                summary.uid_not_found += 1;
                break;

            case STATUS.MISSING_CREDENTIAL_ID:
                summary.missing_credential_id += 1;
                break;

            case STATUS.AUTH_LOOKUP_ERROR:
                summary.auth_lookup_error += 1;
                break;

            case STATUS.UPDATE_FAILED:
                summary.update_failed += 1;
                break;

            default:
                break;
        }
    }

    summary.manual_review_total =
        summary.duplicate_credential_email +
        summary.invalid_email +
        summary.uid_email_conflict +
        summary.uid_not_found +
        summary.missing_credential_id +
        summary.auth_lookup_error +
        summary.update_failed;

    return summary;
}

/* ============================================================
   MAIN
============================================================ */

async function main() {

    printHeader();

    initializeFirebase();

    const db = getFirestore();

    const auth = getAuth();

    console.log(
        "Loading approved and finalized AOP credentials..."
    );

    const records =
        await loadEligibleCredentials(db);

    console.log(
        `Eligible AOP credentials found: ${records.length}`
    );

    if (records.length === 0) {

        console.log("");
        console.log(
            "No eligible AOP credentials were found."
        );

        return;
    }

    const duplicateEmails =
        buildDuplicateEmailSet(records);

    if (duplicateEmails.size > 0) {

        console.log("");
        console.warn(
            `Warning: ${duplicateEmails.size} duplicate ` +
            "credential email value(s) detected."
        );
    }

    const rows = [];

    for (const record of records) {

        const row =
            await processCredential({
                auth,
                record,
                duplicateEmails
            });

        rows.push(row);

        printCredentialResult(row);
    }

    const summary =
        buildSummary(
            rows,
            records.length
        );

    const reports =
        writeReports(
            rows,
            summary
        );

    printSummary(summary);

    console.log(`JSON report: ${reports.jsonPath}`);
    console.log(`CSV report:  ${reports.csvPath}`);
    console.log("");

    if (DRY_RUN_MODE) {

        console.log(
            "Dry run completed. No Firestore records were changed."
        );

        console.log(
            "Review the generated reports before running --apply."
        );

    } else {

        console.log(
            "Apply mode completed."
        );

        console.log(
            "Only verified exact-email matches were updated."
        );
    }

    console.log("");
}

/* ============================================================
   PROCESS EXIT HANDLING
============================================================ */

main()
    .then(() => {
        process.exitCode = 0;
    })
    .catch(error => {

        console.error("");
        console.error(
            "Migration terminated with an unexpected error."
        );

        console.error(error);

        process.exitCode = 1;
    });