const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const DRY_RUN = false;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

function generateAAUId() {
  return "AAU-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

async function migrate() {
  console.log("🚀 Starting migration...\n");

  const snapshot = await db.collection("credentials").get();

  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    if (data.issued_status !== "finalized") continue;

    const currentId = data.credential_id;

    // Skip already correct
    if (currentId && currentId.startsWith("AAU-")) {
      console.log(`⏭️ Skipped: ${currentId}`);
      continue;
    }

    const newId = generateAAUId();

    console.log(`🔄 ${currentId} → ${newId}`);

    if (!DRY_RUN) {
      await doc.ref.update({
        credential_id: newId
      });

      console.log("✅ UPDATED\n");
    } else {
      console.log("🧪 DRY RUN\n");
    }

    count++;
  }

  console.log(`\n🎯 Processed: ${count}`);
  console.log(DRY_RUN ? "⚠️ DRY RUN MODE" : "🔥 LIVE MODE");
}

migrate().then(() => process.exit());