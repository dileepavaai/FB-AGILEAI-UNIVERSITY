/**
 * Controlled AAU -> LAAU Credential ID Migration
 *
 * Scope:
 * - Migrates exactly 45 valid, non-test credentials.
 * - Updates credentials, learner_resource_access and credential_assets atomically.
 * - Preserves the previous ID in legacy_credential_id.
 * - Leaves existing published files, Storage paths and document IDs unchanged.
 *
 * Usage:
 *   node scripts/migration/migrate-aau-credential-prefix-to-laau.js --dry
 *
 * Apply additionally requires:
 *   LAAU_MIGRATION_BACKUP_DIR outside the repository
 *   --apply --confirm-project=fb-agileai-university
 */

"use strict";

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const PROJECT_ID = "fb-agileai-university";
const EXPECTED_CANDIDATES = 45;
const MIGRATION_ID = "AAU_TO_LAAU_2026_09";

const DRY_RUN = process.argv.includes("--dry");
const APPLY = process.argv.includes("--apply");
const CONFIRM_PROJECT = process.argv
  .find(arg => arg.startsWith("--confirm-project="))
  ?.split("=")[1];

if (DRY_RUN === APPLY) {
  console.error("Specify exactly one mode: --dry or --apply");
  process.exit(1);
}

if (APPLY && CONFIRM_PROJECT !== PROJECT_ID) {
  console.error(
    `Apply blocked. Supply --confirm-project=${PROJECT_ID}`
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

function isEligibleAAUId(id) {
  return (
    /^AAU-[A-Z0-9]{8}$/.test(id) &&
    !id.startsWith("AAU-TEST")
  );
}

function toLAAUId(id) {
  return `LAAU-${id.substring(4)}`;
}

function assertMigrationFieldsAbsent(data, location) {
  const migrationFields = [
    "legacy_credential_id",
    "credential_id_migration",
    "credential_id_migrated_at"
  ];

  const existingFields = migrationFields.filter(field =>
    Object.prototype.hasOwnProperty.call(data, field)
  );

  if (existingFields.length > 0) {
    throw new Error(
      `Migration metadata already exists at ${location}: ${existingFields.join(", ")}`
    );
  }
}

async function buildPlan() {
  const [credentialsSnapshot, assetsSnapshot, accessSnapshot] =
    await Promise.all([
      db.collection("credentials").get(),
      db.collection("credential_assets").get(),
      db.collection("learner_resource_access").get()
    ]);

  const assetsByCredentialId = new Map();

  for (const doc of assetsSnapshot.docs) {
    const credentialId =
      normalize(doc.get("credential_id"));

    if (!credentialId) continue;

    if (!assetsByCredentialId.has(credentialId)) {
      assetsByCredentialId.set(credentialId, []);
    }

    assetsByCredentialId.get(credentialId).push(doc);
  }

  const allCredentialIds = new Set(
    credentialsSnapshot.docs
      .map(doc => normalize(doc.get("credential_id")))
      .filter(Boolean)
  );

  const accessByCredentialId = new Map();

  for (const doc of accessSnapshot.docs) {
    const credentialId = normalize(doc.get("credential_id"));

    if (!accessByCredentialId.has(credentialId)) {
      accessByCredentialId.set(credentialId, []);
    }

    accessByCredentialId.get(credentialId).push(doc);
  }

  const candidates = [];

  for (const credentialDoc of credentialsSnapshot.docs) {
    const data = credentialDoc.data();
    const oldId = normalize(data.credential_id);

    if (!isEligibleAAUId(oldId)) continue;

    const newId = toLAAUId(oldId);
    const accessDocs = accessByCredentialId.get(oldId) || [];
    const assetDocs = assetsByCredentialId.get(oldId) || [];

    if (accessDocs.length !== 1) {
      throw new Error(
        `${oldId} has ${accessDocs.length} access records; expected 1`
      );
    }

    if (allCredentialIds.has(newId)) {
      throw new Error(`Target credential ID already exists: ${newId}`);
    }

    assertMigrationFieldsAbsent(
      data,
      `credentials/${credentialDoc.id}`
    );

    const accessDoc = accessDocs[0];

    assertMigrationFieldsAbsent(
      accessDoc.data(),
      `learner_resource_access/${accessDoc.id}`
    );

    if (
      assetDocs.length !== 0 &&
      assetDocs.length !== 3
    ) {
      throw new Error(
        `${oldId} has ${assetDocs.length} asset records; expected 0 or 3`
      );
    }

    for (const assetDoc of assetDocs) {
      assertMigrationFieldsAbsent(
        assetDoc.data(),
        `credential_assets/${assetDoc.id}`
      );
    }

    candidates.push({
      oldId,
      newId,
      credentialDoc,
      accessDoc,
      assetDocs
    });
  }

  if (candidates.length !== EXPECTED_CANDIDATES) {
    throw new Error(
      `Safety count mismatch: found ${candidates.length}, expected ${EXPECTED_CANDIDATES}`
    );
  }

  const targetIds = candidates.map(item => item.newId);

  if (new Set(targetIds).size !== targetIds.length) {
    throw new Error("Duplicate target LAAU IDs detected");
  }

  return candidates.sort((a, b) =>
    a.oldId.localeCompare(b.oldId)
  );
}

function writeBackup(plan) {
  const backupDirectory =
    process.env.LAAU_MIGRATION_BACKUP_DIR;

  if (!backupDirectory) {
    throw new Error(
      "LAAU_MIGRATION_BACKUP_DIR is required for --apply"
    );
  }

  const resolvedBackupDirectory =
    path.resolve(backupDirectory);
  const repositoryDirectory = path.resolve(process.cwd());
  const relative = path.relative(
    repositoryDirectory,
    resolvedBackupDirectory
  );

  if (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error(
      "Backup directory must be outside the Git repository"
    );
  }

  fs.mkdirSync(resolvedBackupDirectory, {
    recursive: true
  });

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const backupPath = path.join(
    resolvedBackupDirectory,
    `${MIGRATION_ID}-${timestamp}.json`
  );

  const backup = {
    projectId: PROJECT_ID,
    migrationId: MIGRATION_ID,
    createdAt: new Date().toISOString(),
    candidateCount: plan.length,
    mappings: plan.map(item => ({
      credentialDocument:
        `credentials/${item.credentialDoc.id}`,
      accessDocument:
        `learner_resource_access/${item.accessDoc.id}`,
      assetDocuments:
        item.assetDocs.map(assetDoc =>
          `credential_assets/${assetDoc.id}`
        ),
      oldCredentialId: item.oldId,
      newCredentialId: item.newId
    }))
  };

  fs.writeFileSync(
    backupPath,
    JSON.stringify(backup, null, 2),
    {
      encoding: "utf8",
      flag: "wx"
    }
  );

  return backupPath;
}

async function applyPlan(plan) {
  const backupPath = writeBackup(plan);
  const batch = db.batch();
  const migratedAt =
    admin.firestore.FieldValue.serverTimestamp();

  for (const item of plan) {
    const commonUpdates = {
      credential_id: item.newId,
      legacy_credential_id: item.oldId,
      credential_id_migration: MIGRATION_ID,
      credential_id_migrated_at: migratedAt
    };

    batch.update(
      item.credentialDoc.ref,
      commonUpdates,
      {
        lastUpdateTime: item.credentialDoc.updateTime
      }
    );

    batch.update(
      item.accessDoc.ref,
      commonUpdates,
      {
        lastUpdateTime: item.accessDoc.updateTime
      }
    );

    for (const assetDoc of item.assetDocs) {
      batch.update(
        assetDoc.ref,
        commonUpdates,
        {
          lastUpdateTime: assetDoc.updateTime
        }
      );
    }
  }

  const writeCount = plan.reduce(
    (total, item) =>
      total + 2 + item.assetDocs.length,
    0
  );

  console.log("Backup written:", backupPath);
  console.log("Atomic writes prepared:", writeCount);

  await batch.commit();

  return backupPath;
}

async function verify(plan) {
  let verified = 0;

  for (const item of plan) {
    const [
      credentialDoc,
      accessDoc,
      ...assetDocs
    ] = await Promise.all([
      item.credentialDoc.ref.get(),
      item.accessDoc.ref.get(),
      ...item.assetDocs.map(assetDoc =>
        assetDoc.ref.get()
      )
    ]);

    const primaryDocumentsValid =
      normalize(credentialDoc.get("credential_id")) ===
        item.newId &&
      normalize(accessDoc.get("credential_id")) ===
        item.newId &&
      normalize(
        credentialDoc.get("legacy_credential_id")
      ) === item.oldId &&
      normalize(
        accessDoc.get("legacy_credential_id")
      ) === item.oldId;

    const assetDocumentsValid =
      assetDocs.every(assetDoc =>
        normalize(assetDoc.get("credential_id")) ===
          item.newId &&
        normalize(
          assetDoc.get("legacy_credential_id")
        ) === item.oldId
      );

    if (
      primaryDocumentsValid &&
      assetDocumentsValid
    ) {
      verified++;
    }
  }

  if (verified !== plan.length) {
    throw new Error(
      `Post-migration verification failed: ${verified}/${plan.length}`
    );
  }

  return verified;
}

(async () => {
  console.log("Project:", PROJECT_ID);
  console.log("Mode:", DRY_RUN ? "DRY RUN" : "APPLY");

  const plan = await buildPlan();

  console.log("Eligible credentials:", plan.length);
  console.table(
    plan.map(item => ({
      oldCredentialId: item.oldId,
      newCredentialId: item.newId
    }))
  );

  if (DRY_RUN) {
    console.log("DRY RUN COMPLETE: no writes performed.");
    return;
  }

  const backupPath = await applyPlan(plan);
  const verified = await verify(plan);

  console.log("Migration committed atomically.");
  console.log("Credentials verified:", verified);
  console.log("Backup:", backupPath);
})()
  .then(async () => {
    await admin.app().delete();
  })
  .catch(async error => {
    console.error("Migration failed:", error.message);

    try {
      await admin.app().delete();
    } catch {}

    process.exitCode = 1;
  });