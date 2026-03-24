const admin = require("firebase-admin");
const crypto = require("crypto");
const serviceAccount = require("./serviceAccountKey.json");

// 🔴 SAFETY SWITCH
const DRY_RUN = false;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ✅ Collision-safe AAU ID generator
async function generateUniqueAAUId(db) {
  while (true) {
    const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 chars
    const newId = "AAU-" + randomPart;

    // Ensure uniqueness in Firestore
    const snapshot = await db
      .collection("credentials")
      .where("credential_id", "==", newId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return newId;
    }

    // Retry if collision (extremely rare)
  }
}

async function migrate() {
  console.log("🚀 Starting migration...\n");

  const snapshot = await db.collection("credentials").get();

  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Only finalized credentials
    if (data.issued_status !== "finalized") continue;

    const currentId = data.credential_id;

    // Skip already correct
    if (currentId && currentId.startsWith("AAU-")) {
      console.log(`⏭️ Skipped: ${currentId}`);
      continue;
    }

    // ✅ Use collision-safe generator
    const newId = await generateUniqueAAUId(db);

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