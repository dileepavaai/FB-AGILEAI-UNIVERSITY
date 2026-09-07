/**
 * Rollback for AAU -> LAAU Credential ID Migration
 *
 * Restores credential_id from the external migration backup and removes
 * migration metadata from credentials and learner_resource_access.
 *
 * Dry run:
 *   node scripts/migration/rollback-aau-credential-prefix-migration.js `
 *     --dry --backup="C:\path\backup.json"
 *
 * Apply:
 *   node scripts/migration/rollback-aau-credential-prefix-migration.js `
 *     --apply `
 *     --confirm-project=fb-agileai-university `
 *     --backup="C:\path\backup.json"
 */

"use strict";

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const PROJECT_ID = "fb-agileai-university";
const MIGRATION_ID = "AAU_TO_LAAU_2026_09";
const EXPECTED_MAPPINGS = 41;

const DRY_RUN = process.argv.includes("--dry");
const APPLY = process.argv.includes("--apply");

const CONFIRM_PROJECT = process.argv
  .find(arg => arg.startsWith("--confirm-project="))
  ?.split("=")[1];

const BACKUP_ARGUMENT = process.argv
  .find(arg => arg.startsWith("--backup="))
  ?.substring("--backup=".length);

if (DRY_RUN === APPLY) {
  console.error("Specify exactly one mode: --dry or --apply");
  process.exit(1);
}

if (!BACKUP_ARGUMENT) {
  console.error("Supply --backup=<absolute-backup-path>");
  process.exit(1);
}

if (APPLY && CONFIRM_PROJECT !== PROJECT_ID) {
  console.error(
    `Apply blocked. Supply --confirm-project=${PROJECT_ID}`
  );
  process.exit(1);
}

const backupPath = path.resolve(BACKUP_ARGUMENT);

if (!fs.existsSync(backupPath)) {
  console.error(`Backup file does not exist: ${backupPath}`);
  process.exit(1);
}

const backup = JSON.parse(
  fs.readFileSync(backupPath, "utf8")
);

if (backup.projectId !== PROJECT_ID) {
  console.error("Backup project ID does not match");
  process.exit(1);
}

if (backup.migrationId !== MIGRATION_ID) {
  console.error("Backup migration ID does not match");
  process.exit(1);
}

if (
  !Array.isArray(backup.mappings) ||
  backup.mappings.length !== EXPECTED_MAPPINGS
) {
  console.error(
    `Backup must contain exactly ${EXPECTED_MAPPINGS} mappings`
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: PROJECT_ID
});

const db = admin.firestore();

function normalize(value) {
  return String(value || "").trim();
}

function validateMapping(mapping) {
  if (
    !/^credentials\/[^/]+$/.test(
      mapping.credentialDocument
    )
  ) {
    throw new Error(
      `Invalid credential document path: ${mapping.credentialDocument}`
    );
  }

  if (
    !/^learner_resource_access\/[^/]+$/.test(
      mapping.accessDocument
    )
  ) {
    throw new Error(
      `Invalid access document path: ${mapping.accessDocument}`
    );
  }

  if (
    !/^AAU-[A-Z0-9]{8}$/.test(
      mapping.oldCredentialId
    ) ||
    mapping.oldCredentialId.startsWith("AAU-TEST")
  ) {
    throw new Error(
      `Invalid legacy ID: ${mapping.oldCredentialId}`
    );
  }

  if (
    mapping.newCredentialId !==
    `LAAU-${mapping.oldCredentialId.substring(4)}`
  ) {
    throw new Error(
      `Invalid ID mapping: ${mapping.oldCredentialId}`
    );
  }
}

async function buildRollbackPlan() {
  backup.mappings.forEach(validateMapping);

  const plan = [];

  for (const mapping of backup.mappings) {
    const credentialRef =
      db.doc(mapping.credentialDocument);
    const accessRef =
      db.doc(mapping.accessDocument);

    const [credentialDoc, accessDoc] =
      await Promise.all([
        credentialRef.get(),
        accessRef.get()
      ]);

    if (!credentialDoc.exists || !accessDoc.exists) {
      throw new Error(
        `Required document missing for ${mapping.newCredentialId}`
      );
    }

    for (const [label, snapshot] of [
      ["credential", credentialDoc],
      ["access", accessDoc]
    ]) {
      if (
        normalize(snapshot.get("credential_id")) !==
          mapping.newCredentialId ||
        normalize(
          snapshot.get("legacy_credential_id")
        ) !== mapping.oldCredentialId ||
        normalize(
          snapshot.get("credential_id_migration")
        ) !== MIGRATION_ID
      ) {
        throw new Error(
          `Rollback precondition failed for ${label} document of ${mapping.newCredentialId}`
        );
      }
    }

    plan.push({
      ...mapping,
      credentialDoc,
      accessDoc
    });
  }

  return plan;
}

async function applyRollback(plan) {
  const batch = db.batch();
  const remove =
    admin.firestore.FieldValue.delete();

  for (const item of plan) {
    const updates = {
      credential_id: item.oldCredentialId,
      legacy_credential_id: remove,
      credential_id_migration: remove,
      credential_id_migrated_at: remove
    };

    batch.update(
      item.credentialDoc.ref,
      updates,
      {
        lastUpdateTime: item.credentialDoc.updateTime
      }
    );

    batch.update(
      item.accessDoc.ref,
      updates,
      {
        lastUpdateTime: item.accessDoc.updateTime
      }
    );
  }

  await batch.commit();
}

async function verifyRollback(plan) {
  let verified = 0;

  for (const item of plan) {
    const [credentialDoc, accessDoc] =
      await Promise.all([
        item.credentialDoc.ref.get(),
        item.accessDoc.ref.get()
      ]);

    const credentialData = credentialDoc.data();
    const accessData = accessDoc.data();

    if (
      normalize(credentialData.credential_id) ===
        item.oldCredentialId &&
      normalize(accessData.credential_id) ===
        item.oldCredentialId &&
      !Object.prototype.hasOwnProperty.call(
        credentialData,
        "legacy_credential_id"
      ) &&
      !Object.prototype.hasOwnProperty.call(
        accessData,
        "legacy_credential_id"
      ) &&
      !Object.prototype.hasOwnProperty.call(
        credentialData,
        "credential_id_migration"
      ) &&
      !Object.prototype.hasOwnProperty.call(
        accessData,
        "credential_id_migration"
      )
    ) {
      verified++;
    }
  }

  if (verified !== plan.length) {
    throw new Error(
      `Rollback verification failed: ${verified}/${plan.length}`
    );
  }

  return verified;
}

(async () => {
  console.log("Project:", PROJECT_ID);
  console.log("Mode:", DRY_RUN ? "ROLLBACK DRY RUN" : "ROLLBACK APPLY");
  console.log("Backup:", backupPath);

  const plan = await buildRollbackPlan();

  console.log("Validated rollback mappings:", plan.length);
  console.table(
    plan.map(item => ({
      currentCredentialId: item.newCredentialId,
      restoredCredentialId: item.oldCredentialId
    }))
  );

  if (DRY_RUN) {
    console.log(
      "ROLLBACK DRY RUN COMPLETE: no writes performed."
    );
    return;
  }

  await applyRollback(plan);
  const verified = await verifyRollback(plan);

  console.log("Rollback committed atomically.");
  console.log("Credentials restored:", verified);
})()
  .then(async () => {
    await admin.app().delete();
  })
  .catch(async error => {
    console.error("Rollback failed:", error.message);

    try {
      await admin.app().delete();
    } catch {}

    process.exitCode = 1;
  });