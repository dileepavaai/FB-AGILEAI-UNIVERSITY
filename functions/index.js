/**
 * =========================================================
 * Agile AI University — Phase-3A Entitlement Service
 * Firebase Cloud Functions (Canonical Authority)
 *
 * PURPOSE
 * - Grant Executive Insight entitlement
 * - Manual (admin) + Razorpay webhook based
 * - Server-authoritative entitlement verification
 *
 * SECURITY MODEL
 * - Frontend NEVER touches Firestore
 * - Frontend calls checkExecutiveEntitlement only
 *
 * STATUS
 * - Production safe
 * - CORS-safe
 * - Canonical
 * =========================================================
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();

/**
 * =========================================================
 * Firestore Structure (LOCKED)
 *
 * executiveEntitlements/{email}
 * {
 *   email: string,
 *   entitled: true,
 *   source: "manual" | "razorpay",
 *   paymentId: string | null,
 *   amount: number | null,
 *   currency: string | null,
 *   createdAt: serverTimestamp
 * }
 * =========================================================
 */

/**
 * =========================================================
 * STEP 3A-1 — MANUAL / ADMIN GRANT
 *
 * METHOD: POST
 * BODY: { email }
 * =========================================================
 */
exports.grantExecutiveEntitlement = functions.https.onRequest(
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      await admin
        .firestore()
        .collection("executiveEntitlements")
        .doc(email.toLowerCase())
        .set({
          email: email.toLowerCase(),
          entitled: true,
          source: "manual",
          paymentId: null,
          amount: null,
          currency: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return res.status(200).json({
        status: "ENTITLEMENT_GRANTED_MANUAL",
        email,
      });

    } catch (err) {
      console.error("Manual entitlement error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * =========================================================
 * STEP 3A-2 — RAZORPAY WEBHOOK (AUTOMATED)
 *
 * METHOD: POST
 * SOURCE: Razorpay Webhook
 *
 * CRITICAL:
 * - Signature verified using RAW BODY (req.rawBody)
 * =========================================================
 */
exports.razorpayWebhook = functions.https.onRequest(
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Method not allowed");
      }

      const WEBHOOK_SECRET = "AAIU_RZP_EXEC_5603_I9FhQx7@KpZ_1EABAB";

      const receivedSignature = req.headers["x-razorpay-signature"];
      if (!receivedSignature) {
        return res.status(400).send("Signature missing");
      }

      const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(req.rawBody)
        .digest("hex");

      if (receivedSignature !== expectedSignature) {
        return res.status(401).send("Invalid signature");
      }

      if (req.body.event !== "payment.captured") {
        return res.status(200).send("Event ignored");
      }

      const payment = req.body.payload?.payment?.entity;
      if (!payment) {
        return res.status(400).send("Invalid payload");
      }

      const email =
        payment.email ||
        payment.notes?.email ||
        null;

      if (!email) {
        return res.status(400).send("Email not found");
      }

      await admin
        .firestore()
        .collection("executiveEntitlements")
        .doc(email.toLowerCase())
        .set({
          email: email.toLowerCase(),
          entitled: true,
          source: "razorpay",
          paymentId: payment.id,
          amount: payment.amount / 100,
          currency: payment.currency,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return res.status(200).json({
        status: "ENTITLEMENT_GRANTED_RAZORPAY",
        email,
        paymentId: payment.id,
      });

    } catch (err) {
      console.error("Razorpay webhook error:", err);
      return res.status(500).send("Internal server error");
    }
  }
);

/**
 * =========================================================
 * STEP C1 — EXECUTIVE ENTITLEMENT CHECK (READ-ONLY)
 *
 * METHOD: POST
 * BODY: { email }
 *
 * PURPOSE
 * - Frontend-safe entitlement verification
 * - No Firestore exposure
 * - No auth required
 *
 * RETURNS
 * { entitled: true | false }
 * =========================================================
 */
exports.checkExecutiveEntitlement = functions.https.onRequest(
  async (req, res) => {
    try {
      // ----- CORS (explicit & safe) -----
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      if (req.method !== "POST") {
        return res.status(405).json({ entitled: false });
      }

      const { email } = req.body;

      if (!email) {
        return res.status(200).json({ entitled: false });
      }

      const snap = await admin
        .firestore()
        .collection("executiveEntitlements")
        .doc(email.toLowerCase())
        .get();

      if (!snap.exists) {
        return res.status(200).json({ entitled: false });
      }

      return res.status(200).json({
        entitled: snap.data().entitled === true,
      });

    } catch (err) {
      console.error("Entitlement check failed:", err);
      return res.status(200).json({ entitled: false });
    }
  }
);
