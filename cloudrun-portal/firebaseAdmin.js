import admin from "firebase-admin";

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Firestore reference
const db = admin.firestore();

// Export BOTH styles safely
export { db };
export default admin;
