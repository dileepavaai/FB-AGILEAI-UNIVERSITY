import express from "express";
import admin from "firebase-admin";
import fetch from "node-fetch";
import rateLimit from "express-rate-limit";
import cors from "cors";

const app = express();

/* -------------------------------------------------
   Cloud Run proxy awareness (REQUIRED)
------------------------------------------------- */
app.set("trust proxy", 1);

/* -------------------------------------------------
   Global middleware
------------------------------------------------- */
app.use(express.json());

/* -------------------------------------------------
   CORS (PUBLIC endpoints only – LOCKED)
------------------------------------------------- */
const corsOptions = {
  origin: [
    "https://portal.agileai.university",
    "https://assessment.agileai.university",
    "https://verify.agileai.university"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ]
};

app.use(cors(corsOptions));

app.options(
  "/portal/resolve-entitlements",
  cors(corsOptions)
);

/* -------------------------------------------------
   Structured logging (Cloud Run native)
------------------------------------------------- */
function log(level, message, meta = {}) {
  console.log(
    JSON.stringify({
      severity: level,
      message,
      ...meta,
    })
  );
}

/* -------------------------------------------------
   Firebase Admin (Cloud Run native)
------------------------------------------------- */
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/* -------------------------------------------------
   Helpers
------------------------------------------------- */
function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function isIPAllowed(ip) {
  const allowlist = process.env.ADMIN_IP_ALLOWLIST;
  if (!allowlist) return true;
  return allowlist.split(",").some(entry => ip.startsWith(entry.trim()));
}

/* -------------------------------------------------
   READY check
------------------------------------------------- */
app.get("/ready", (req, res) => {
  res.status(200).json({ ready: true, status: "ok" });
});

/* -------------------------------------------------
   Root health check (CANONICAL – DO NOT CHANGE)
------------------------------------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    service: "aaiu-portal-resolver",
    status: "ok",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    service: "aaiu-portal-resolver",
    status: "ok",
  });
});

/* -------------------------------------------------
   Metadata (Backend v1.4 – Canonical)
------------------------------------------------- */
app.get("/_meta", (req, res) => {
  res.status(200).json({
    service: "aaiu-cloudrun-backend",
    version: "v1.4",
    runtime: "cloud-run",
    auth: "firebase",
    contract: "firestore-contract.v1.4",
    status: "active",
  });
});

/* -------------------------------------------------
   Firestore health
------------------------------------------------- */
app.get("/_health/firestore", async (req, res) => {
  try {
    await db.collection("_health").limit(1).get();
    res.status(200).json({ firestore: "connected" });
  } catch (error) {
    log("ERROR", "Firestore health failed", {
      error: error.message,
    });
    res.status(500).json({ firestore: "error" });
  }
});

/* -------------------------------------------------
   reCAPTCHA verification (PUBLIC)
------------------------------------------------- */
async function verifyRecaptcha(req, res, next) {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) return next();

  const token = req.body?.recaptchaToken || req.body?.recaptcha_token;
  if (!token) {
    return res.status(400).json({ error: "RECAPTCHA_REQUIRED" });
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
    if (!data.success) {
      return res.status(403).json({ error: "RECAPTCHA_FAILED" });
    }

    next();
  } catch (error) {
    log("ERROR", "reCAPTCHA verification failed", {
      error: error.message,
    });
    return res.status(500).json({ error: "RECAPTCHA_ERROR" });
  }
}

/* -------------------------------------------------
   Rate limiting
------------------------------------------------- */
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

/* -------------------------------------------------
   PUBLIC: Credential Verification (Canonical v1.4)
   - Single field query (index safe)
   - Status validation in code
------------------------------------------------- */
app.post(
  "/public/verify-credential",
  publicLimiter,
  verifyRecaptcha,
  async (req, res) => {
    try {
      const credentialId = req.body?.credential_id?.toUpperCase();

      if (!credentialId) {
        return res.status(400).json({ status: "invalid" });
      }

      const snapshot = await db
        .collection("credentials")
        .where("credential_id", "==", credentialId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(200).json({ status: "not_found" });
      }

      const doc = snapshot.docs[0].data();

      // Institutional status validation
      if (
        doc.issued_status !== "finalized" ||
        doc.approval_status !== "approved"
      ) {
        return res.status(200).json({ status: "not_found" });
      }

      return res.status(200).json({
        status: "valid",
        full_name: doc.full_name,
        credential_id: doc.credential_id,
        credential_type: doc.credential_type || null,
        program_code: doc.program_code || null,
        issued_by: doc.issued_by || "Agile AI University",
        issue_date: doc.issue_date || null
      });

    } catch (error) {
      log("ERROR", "Credential verification failed", {
        error: error.message,
      });
      return res.status(500).json({ status: "error" });
    }
  }
);

/* -------------------------------------------------
   PORTAL: Entitlement Resolver v1.0
   -------------------------------------------------

   PURPOSE

   Provides a unified portal access contract.

   Governance Principles:

   1. user_entitlements controls platform access.

   2. credentials collection controls
      academic recognition visibility.

   3. Certificates, Trainer Certificates
      and University Badges are NOT products.

   4. Recognition artifacts are derived from
      credential records.

   5. Executive Reports remain entitlement-driven.

   Future Safe:

   - Instructor-led programs
   - Self-paced programs
   - Executive reports
   - Future subscriptions
   - Future memberships

------------------------------------------------- */

app.get(
  "/portal/resolve-entitlements",
  requireAuth,
  async (req, res) => {
    try {
      const email =
        req.user?.email?.toLowerCase()?.trim();

      if (!email) {
        return res.status(400).json({
          error: "EMAIL_REQUIRED"
        });
      }

      /* ----------------------------------------
         USER ENTITLEMENTS
      ---------------------------------------- */

      const entitlementSnapshot =
        await db
          .collection("user_entitlements")
          .where("email", "==", email)
          .limit(1)
          .get();

      let entitlements = {
        student_portal: false,
        credentials_view: false,
        executive_insight: false
      };

      if (!entitlementSnapshot.empty) {
        const entitlementDoc =
          entitlementSnapshot.docs[0].data();

        entitlements =
          entitlementDoc.entitlements ||
          entitlements;
      }

      /* ----------------------------------------
        PROGRAM CONFIGURATION
      ---------------------------------------- */

      const programSnapshot =
        await db
          .collection("programs")
          .get();

      const programConfigurations = {};

      programSnapshot.forEach(doc => {

        const program =
          doc.data();

        const programCode =
          String(
            program.program_code || ""
          )
            .trim()
            .toUpperCase();

        if (programCode) {

          programConfigurations[
            programCode
          ] = program;

        }

      });

      /* ----------------------------------------
         CREDENTIAL VISIBILITY
      ---------------------------------------- */

      const credentialSnapshot =
        await db
          .collection("credentials")
          .where("email", "==", email)
          .get();

      const credentials = [];

      credentialSnapshot.forEach(doc => {
        const data = doc.data();

        if (
          data.issued_status === "finalized" &&
          data.approval_status === "approved"
        ) {
          const programCode =
            String(
              data.program_code || ""
            )
              .trim()
              .toUpperCase();

          const program =
            programConfigurations[
              programCode
            ] || {};

          const availableAssets =

            program.available_assets || {

              universityCertificate: false,
              trainerCertificate: false,
              digitalBadge: false,
              recognitionAsset: false

            };
          credentials.push({

            available_assets:
              availableAssets,

            credential_id:
              data.credential_id || null,

            credential_type:
              data.credential_type || null,

            program_code:
              data.program_code || null,

            full_name:
              data.full_name || null,

            email:
              data.email || null,

            issued_status:
              data.issued_status || null,

            created_at:
              data.created_at || null,

            issued_by:
              data.issued_by || null,

            validity:
              data.validity || null
          });
        }
      });

      return res.status(200).json({
          status: "success",

          email,

          executiveEntitlement: null,

          userEntitlements: {
              entitlements
          },

          programs: programConfigurations,

          credentials
      });

    } catch (error) {

      log(
        "ERROR",
        "Portal entitlement resolution failed",
        {
          error: error.message
        }
      );

      return res.status(500).json({
        error: "RESOLUTION_FAILED"
      });
    }
  }
);

/* -------------------------------------------------
   ADMIN routes (LOCKED – unchanged)
------------------------------------------------- */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: "NO_TOKEN" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
}

app.use("/admin", requireAuth, (req, res, next) => {
  const ip = getClientIP(req);
  if (!isIPAllowed(ip)) {
    return res.status(403).json({ error: "IP_NOT_ALLOWED" });
  }
  next();
});

app.get("/admin/whoami", (req, res) => {
  res.status(200).json({
    uid: req.user.uid,
    email: req.user.email || null,
  });
});

/* -------------------------------------------------
   Catch-all 404 (IMPORTANT)
------------------------------------------------- */
app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    path: req.originalUrl,
  });
});

/* -------------------------------------------------
   Server bootstrap (Cloud Run – REQUIRED)
------------------------------------------------- */
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  log("INFO", "Cloud Run backend started", { port: PORT });
});