const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin Init (Cloud Run auto-auth)
admin.initializeApp();

const db = admin.firestore();

/* =====================================================
   🔍 Credential Verification API
===================================================== */
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

    const docSnapshot = snapshot.docs[0];
    const docData = docSnapshot.data();

    /* =====================================================
       ✅ FINAL ISSUE DATE RESOLUTION (PRODUCTION SAFE)
    ===================================================== */

    let issueDate = null;

    // 1. Preferred: issued_on (string or timestamp)
    if (docData.issued_on) {
      if (docData.issued_on.toDate) {
        issueDate = docData.issued_on.toDate().toISOString();
      } else {
        issueDate = docData.issued_on;
      }
    }

    // 2. imported_at (Firestore timestamp)
    else if (docData.imported_at && docData.imported_at.toDate) {
      issueDate = docData.imported_at.toDate().toISOString();
    }

    // 3. created_at (Firestore timestamp)
    else if (docData.created_at && docData.created_at.toDate) {
      issueDate = docData.created_at.toDate().toISOString();
    }

    // 4. Firestore system timestamp
    else if (docSnapshot.createTime) {
      issueDate = docSnapshot.createTime.toDate().toISOString();
    }

    return res.json({
      status: "valid",
      full_name: docData.full_name || null,
      credential_id: docData.credential_id || null,
      credential_type: docData.credential_type || null,
      program_code: docData.program_code || null,
      issued_by: docData.issued_by || "Agile AI University",
      issue_date: issueDate || null,
    });

  } catch (error) {
    console.error("Verification error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/* =====================================================
   Health check
===================================================== */
app.get("/", (req, res) => {
  res.send("AAU Credential Verify API is running");
});

/* =====================================================
   Optional: GET helper (for browser testing)
===================================================== */
app.get("/public/verify-credential", (req, res) => {
  res.send("Use POST method with JSON body { credential_id }");
});

/* =====================================================
   Server Start
===================================================== */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});