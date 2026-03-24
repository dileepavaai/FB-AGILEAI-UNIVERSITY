const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin Init (Cloud Run will auto-authenticate)
admin.initializeApp();

const db = admin.firestore();

// 🔍 Verification API (IMPORTANT: route must match frontend)
app.post("/public/verify-credential", async (req, res) => {
  try {
    const { credential_id } = req.body;

    if (!credential_id) {
      return res.status(400).json({
        status: "error",
        message: "credential_id is required",
      });
    }

    const snapshot = await db
      .collection("credentials")
      .where("credential_id", "==", credential_id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.json({
        status: "not_found",
      });
    }

    const doc = snapshot.docs[0].data();

    // ✅ THIS FIXES YOUR ISSUE
    const issue_date =
      doc.issued_on ||
      doc.imported_at ||
      doc.created_at ||
      null;

    return res.json({
      status: "valid",
      full_name: doc.full_name || null,
      credential_id: doc.credential_id || null,
      credential_type: doc.credential_type || null,
      program_code: doc.program_code || null,
      issued_by: doc.issued_by || "Agile AI University",
      issue_date: issue_date,
    });

  } catch (error) {
    console.error("Verification error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("AAU Credential Verify API is running");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});