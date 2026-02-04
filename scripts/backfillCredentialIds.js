/**
 * One-time Credential ID Backfill
 * SAFE · DETERMINISTIC · IDEMPOTENT
 *
 * RULES:
 * - Run locally only
 * - Never deploy
 * - Safe to re-run
 */

const admin = require("firebase-admin");
const crypto = require("crypto");
const path = require("path");

// ─────────────────────────────────────────────
// 🔐 Admin SDK Initialization (EXPLICIT)
// ─────────────────────────────────────────────
const serviceAccount = require(path.join(
  __dirname,
  "..",
  "service-account.json"
));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─────────────────────────────────────────────
// 🔧 Configuration (MATCHES YOUR DATABASE)
// ─────────────────────────────────────────────
const COLLECTION = "credentials";

// ─────────────────────────────────────────────
// 🔑 Deterministic 6-char hash from document ID
// ─────────────────────────────────────────────
function shortHash(input) {
  return crypto
    .createHash("sha256")
    .update(String(input))
    .digest("base64")
    .replace(/[^A-Z0-9]/gi, "")
    .substring(0, 6)
    .toUpperCase();
}

// ─────────────────────────────────────────────
// 🚀 Backfill Runner
// ─────────────────────────────────────────────
(async function runBackfill() {
  console.log("🔒 Starting Credential ID Backfill...");
  console.log(`📁 Collection: ${COLLECTION}`);
  console.log("────────────────────────────────");

  const snapshot = await db.collection(COLLECTION).get();

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // ───────────── HARD SAFETY GUARDS ─────────────
    if (data.credential_id) {
      skipped++;
      continue;
    }

    if (data.issued_status !== "issued") {
      skipped++;
      continue;
    }

    if (!data.program_code || !data.created_at) {
      console.error(`❌ Missing required fields in doc ${doc.id}`);
      failed++;
      continue;
    }

    let year;
    try {
      year = data.created_at.toDate().getFullYear();
    } catch {
      console.error(`❌ Invalid created_at in doc ${doc.id}`);
      failed++;
      continue;
    }

    const hash = shortHash(doc.id);

    // 🔒 CANONICAL, IMMUTABLE FORMAT
    const credentialId = `AAIU-${data.program_code}-${year}-${hash}`;

    try {
      await doc.ref.update({ credential_id: credentialId });
      updated++;
      console.log(`✅ ${doc.id} → ${credentialId}`);
    } catch (err) {
      console.error(`❌ Failed to update ${doc.id}`, err);
      failed++;
    }
  }

  // ─────────────────────────────────────────────
  // 📊 Summary
  // ─────────────────────────────────────────────
  console.log("────────────────────────────────");
  console.log(`✅ Updated : ${updated}`);
  console.log(`⏭️  Skipped : ${skipped}`);
  console.log(`❌ Failed  : ${failed}`);
  console.log("🔒 Backfill complete.");

  process.exit(0);
})();
