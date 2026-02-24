/**
 * AAU Credential ID v2.0 Migration Script
 * ----------------------------------------
 * Adds:
 *  - credential_id (AAU-[SECURE TOKEN])
 *  - approval_status (mapped from issued_status)
 *
 * Node 18 Compatible
 *
 * USAGE:
 * 1. Set GOOGLE_APPLICATION_CREDENTIALS
 * 2. node migrate-add-credential-id-v2.js --dry   (dry run)
 * 3. node migrate-add-credential-id-v2.js --apply (execute)
 */

const admin = require("firebase-admin");
const crypto = require("crypto");

const DRY_RUN = process.argv.includes("--dry");
const APPLY = process.argv.includes("--apply");

if (!DRY_RUN && !APPLY) {
  console.log("Specify --dry or --apply");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const TOKEN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateToken(length = 8) {
  let result = "";
  const bytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += TOKEN_CHARS[bytes[i] % TOKEN_CHARS.length];
  }

  return result;
}

async function generateUniqueCredentialId() {
  let unique = false;
  let credentialId;

  while (!unique) {
    const token = generateToken(8);
    credentialId = `AAU-${token}`;

    const snapshot = await db
      .collection("credentials")
      .where("credential_id", "==", credentialId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      unique = true;
    }
  }

  return credentialId;
}

function mapApprovalStatus(issuedStatus) {
  if (!issuedStatus) return "pending";

  switch (issuedStatus.toLowerCase()) {
    case "finalized":
      return "approved";
    case "issued":
      return "pending";
    case "draft":
      return "pending";
    case "revoked":
      return "revoked";
    default:
      return "pending";
  }
}

async function migrate() {
  const snapshot = await db.collection("credentials").get();

  console.log(`Total documents: ${snapshot.size}`);

  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    const updates = {};

    if (!data.credential_id) {
      const newId = await generateUniqueCredentialId();
      updates.credential_id = newId;
    }

    if (!data.approval_status) {
      updates.approval_status = mapApprovalStatus(data.issued_status);
    }

    if (Object.keys(updates).length > 0) {
      if (DRY_RUN) {
        console.log(`[DRY] Would update ${doc.id}:`, updates);
      }

      if (APPLY) {
        await doc.ref.update(updates);
        console.log(`Updated ${doc.id}`);
      }

      updatedCount++;
    }
  }

  console.log(`Migration complete. Documents updated: ${updatedCount}`);
}

migrate()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });