const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// 🔴 SAFETY SWITCH
const DRY_RUN = true;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Generate AAU ID (8 characters)
function generateAAUId() {
  return "AAU-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

async function migrate() {
  console.log("🚀 Starting migration...\n");

  const snapshot = await db.collection("credentials").get();

  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Only finalized credentials
    if (data.issued_status !== "finalized") continue;

    const oldId = data.credential_id;

    // Skip if already AAU format
    if (oldId && oldId.startsWith("AAU-")) {
      console.log(`⏭️ Skipped (already new): ${oldId}`);
      continue;
    }

    const newId = generateAAUId();

    console.log(`🔄 ${oldId} → ${newId}`);

    if (!DRY_RUN) {
      await doc.ref.update({
        credential_id: newId,
        legacy_credential_id: oldId
      });

      console.log("✅ UPDATED\n");
    } else {
      console.log("🧪 DRY RUN (no update)\n");
    }

    count++;
  }

  console.log(`\n🎯 Processed: ${count} records`);
  console.log(DRY_RUN ? "⚠️ DRY RUN MODE" : "🔥 LIVE MODE");
}

migrate().then(() => process.exit());