const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin Init (Cloud Run auto-auth)
admin.initializeApp();

const db = admin.firestore();

/* =====================================================
   🔐 SIMPLE RATE LIMITING
===================================================== */
const requestCounts = new Map();

/* =====================================================
   🔐 reCAPTCHA Validation
===================================================== */
async function verifyRecaptcha(token) {
  if (!token) return false;

  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    console.warn("Missing RECAPTCHA_SECRET_KEY");
    return false;
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secret}&response=${token}`,
      }
    );

    const data = await response.json();
    return data.success === true;

  } catch (err) {
    console.error("reCAPTCHA validation failed:", err);
    return false;
  }
}

/* =====================================================
   🔐 SIGNATURE (Tamper-proof links)
===================================================== */

function generateSignature(credentialId) {
  const secret = process.env.SIGNING_SECRET;
  if (!secret) return null;

  return crypto
    .createHmac("sha256", secret)
    .update(credentialId)
    .digest("hex");
}

function safeCompare(a, b) {
  if (!a || !b) return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) return false;

  return crypto.timingSafeEqual(bufA, bufB);
}

function verifySignature(credentialId, signature) {
  if (!signature) return true; // backward compatibility

  const expected = generateSignature(credentialId);
  return safeCompare(signature, expected);
}

/* =====================================================
   🔍 Credential Verification API
===================================================== */
app.post("/public/verify-credential", async (req, res) => {
  try {
    const { credential_id, recaptchaToken, signature } = req.body;

    /* ---------- BASIC VALIDATION ---------- */

    if (!credential_id) {
      return res.status(400).json({
        status: "error",
        message: "credential_id is required",
      });
    }

    /* ---------- RATE LIMITING (FIXED IP) ---------- */

    const ip =
      (req.headers["x-forwarded-for"] || "")
        .split(",")[0]
        .trim() ||
      req.ip ||
      "unknown";

    const now = Date.now();
    const windowMs = 60 * 1000;
    const limit = 10;

    const record = requestCounts.get(ip) || {
      count: 0,
      start: now,
    };

    if (now - record.start > windowMs) {
      record.count = 0;
      record.start = now;
    }

    record.count++;

    if (record.count > limit) {
      return res.status(429).json({
        status: "error",
        message: "Too many requests. Try again later.",
      });
    }

    requestCounts.set(ip, record);

    /* ---------- reCAPTCHA ---------- */

    const isHuman = await verifyRecaptcha(recaptchaToken);

    if (!isHuman) {
      return res.status(403).json({
        status: "error",
        message: "reCAPTCHA validation failed",
      });
    }

    /* ---------- SIGNATURE VALIDATION ---------- */

    const isValidSignature = verifySignature(credential_id, signature);

    if (!isValidSignature) {
      return res.status(403).json({
        status: "error",
        message: "Invalid or tampered verification link",
      });
    }

    /* ---------- FIRESTORE QUERY ---------- */

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
       ✅ ISSUE DATE RESOLUTION
    ===================================================== */

    let issueDate = null;

    const resolveDate = (value) => {
      if (!value) return null;

      if (typeof value.toDate === "function") {
        return value.toDate().toISOString();
      }

      if (value instanceof Date) {
        return value.toISOString();
      }

      if (typeof value === "string") {
        return value;
      }

      return null;
    };

    if (docData.issued_on) {
      issueDate = resolveDate(docData.issued_on);
    } else if (docData.imported_at) {
      issueDate = resolveDate(docData.imported_at);
    } else if (docData.created_at) {
      issueDate = resolveDate(docData.created_at);
    } else if (docSnapshot.createTime) {
      issueDate = docSnapshot.createTime.toDate().toISOString();
    }

    /* ---------- SUCCESS ---------- */

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
   Optional GET helper
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