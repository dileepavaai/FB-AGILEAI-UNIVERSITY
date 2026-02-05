import express from "express";
import { verifyFirebaseToken } from "./authMiddleware.js";
import { db } from "./firebaseAdmin.js";

const app = express();
app.use(express.json());

/**
 * Root health check
 * Existing behavior – unchanged
 */
app.get("/", (req, res) => {
  res.status(200).json({
    service: "aaiu-portal-resolver",
    status: "ok",
  });
});

/**
 * Metadata endpoint
 * Existing behavior – unchanged
 */
app.get("/_meta", (req, res) => {
  res.json({
    service: "aaiu-cloudrun-backend",
    version: "v1.0.0",
    auth: "firebase-auth",
  });
});

/**
 * Auth verification
 * Existing behavior – unchanged
 */
app.get("/auth/verify", verifyFirebaseToken, (req, res) => {
  res.status(200).json({
    authenticated: true,
    user: req.user,
  });
});

/**
 * Firestore connectivity check
 * SAFE:
 * - Read-only
 * - No data creation
 * - No schema dependency
 * - Does NOT affect portals or auth
 */
app.get("/_health/firestore", async (req, res) => {
  try {
    await db.collection("_health").limit(1).get();
    res.status(200).json({
      firestore: "connected",
    });
  } catch (error) {
    res.status(500).json({
      firestore: "error",
      message: error.message,
    });
  }
});

/**
 * 404 handler
 * Existing behavior – unchanged
 */
app.use((req, res) => {
  res.status(404).json({ error: "NOT_FOUND" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Cloud Run listening on ${PORT}`);
});
