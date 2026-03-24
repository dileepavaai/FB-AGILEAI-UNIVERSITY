const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

function generateNewId(oldId) {
  if (!oldId) return null;

  const parts = oldId.split("-");
  const suffix = parts[parts.length - 1] || "";

  let clean = suffix.replace(/[^A-Z0-9]/gi, "").toUpperCase();

  while (clean.length < 8) {
    clean += Math.random().toString(36).substring(2, 3).toUpperCase();
  }

  return `AAU-${clean.substring(0, 8)}`;
}

async function migrate() {
  console.log("🚀 Starting migration...");

  const snapshot = await db.collection("credentials")
    .limit(5) // TEST FIRST
    .get();

  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    if (data.credential_id_v2) {
      console.log(`⏭ Skipped: ${doc.id}`);
      continue;
    }

    const newId = generateNewId(data.credential_id);

    if (!newId) {
      console.log(`⚠️ Missing ID: ${doc.id}`);
      continue;
    }

    await doc.ref.update({
      credential_id_v2: newId
    });

    console.log(`✅ Updated: ${doc.id} → ${newId}`);
    count++;
  }

  console.log(`🎯 Test complete: ${count} records updated.`);
}

migrate().catch(console.error);