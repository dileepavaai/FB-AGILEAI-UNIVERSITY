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
app.use(
  cors({
    origin: "https://assessment.agileai.university",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Explicit preflight handling
app.options("*", cors());

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

function isCountryAllowed(req) {
  const allowed = process.env.ALLOWED_COUNTRIES;
  if (!allowed) return true;
  const country =
    req.headers["x-country"] ||
    req.headers["x-geo-country"] ||
    "unknown";
  return allowed.split(",").includes(country);
}

/* -------------------------------------------------
   READY check (container warm, zero cost)
------------------------------------------------- */
app.get("/ready", (req, res) => {
  res.status(200).json({
    ready: true,
    status: "ok",
  });
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

/* -------------------------------------------------
   /health alias (compatibility, no contract break)
------------------------------------------------- */
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "aaiu-portal-resolver",
    status: "ok",
  });
});

/* -------------------------------------------------
   Metadata (Canonical – Backend v1.2)
------------------------------------------------- */
app.get("/_meta", (req, res) => {
  res.status(200).json({
    service: "aaiu-cloudrun-backend",
    version: "v1.2",
    runtime: "cloud-run",
    auth: "firebase",
    contract: "firestore-contract.v1.2",
    status: "active",
  });
});

/* -------------------------------------------------
   Firestore health + index safety check
------------------------------------------------- */
app.get("/_health/firestore", async (req, res) => {
  try {
    await db.collection("_health").limit(1).get();
    res.status(200).json({ firestore: "connected" });
  } catch (error) {
    if (error.code === 9 || error.code === "FAILED_PRECONDITION") {
      return res.status(500).json({
        firestore: "index_missing",
        action: "Create required Firestore index",
      });
    }

    log("ERROR", "Firestore health failed", {
      error: error.message,
    });

    res.status(500).json({ firestore: "error" });
  }
});

/* -------------------------------------------------
   Firebase Auth middleware (ADMIN)
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

/* -------------------------------------------------
   reCAPTCHA verification (PUBLIC)
------------------------------------------------- */
async function verifyRecaptcha(req, res, next) {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) return next();

  const token = req.body?.recaptchaToken;
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
   Rate limiting (public only)
------------------------------------------------- */
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

/* -------------------------------------------------
   PUBLIC: Credential lookup (READ-ONLY)
------------------------------------------------- */
app.get(
  "/public/credentials",
  publicLimiter,
  verifyRecaptcha,
  async (req, res) => {
    try {
      if (!isCountryAllowed(req)) {
        return res.status(403).json({ error: "COUNTRY_BLOCKED" });
      }

      const email = req.query.email?.toLowerCase();
      if (!email) {
        return res.status(400).json({ error: "EMAIL_REQUIRED" });
      }

      const snapshot = await db
        .collection("credentials")
        .where("email", "==", email)
        .where("issued_status", "==", "finalized")
        .get();

      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json({ credentials: results });
    } catch (error) {
      log("ERROR", "Public credential lookup failed", {
        error: error.message,
      });
      res.status(500).json({ error: "INTERNAL_ERROR" });
    }
  }
);

/* -------------------------------------------------
   PUBLIC: Executive Insight access verification (LOCKED)
------------------------------------------------- */
app.post(
  "/public/verify-executive-insight",
  publicLimiter,
  verifyRecaptcha,
  async (req, res) => {
    try {
      const email = req.body?.email?.toLowerCase();
      if (!email) {
        return res.status(400).json({ allowed: false, error: "EMAIL_REQUIRED" });
      }

      const snapshot = await db
        .collection("advisory_entitlements")
        .where("buyer.email", "==", email)
        .where("artifact_code", "==", "EXEC_INSIGHT_V1")
        .where("access.status", "==", "active")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(200).json({ allowed: false });
      }

      const entitlement = snapshot.docs[0].data();

      if (entitlement.payment?.status !== "paid") {
        return res.status(200).json({ allowed: false });
      }

      return res.status(200).json({
        allowed: true,
        source: "advisory_entitlements",
      });
    } catch (error) {
      log("ERROR", "Executive Insight verification failed", {
        error: error.message,
      });
      return res.status(500).json({ allowed: false });
    }
  }
);

/* -------------------------------------------------
   ADMIN routes (AUTH + IP allowlist)
------------------------------------------------- */
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
