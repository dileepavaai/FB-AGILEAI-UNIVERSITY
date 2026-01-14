/**
 * =========================================================
 * Agile AI University — Phase-3A Entitlement Service
 * Firebase Cloud Functions (Gen-1, Node 20 Compatible)
 * =========================================================
 */
"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
const Razorpay = require("razorpay");

if (!admin.apps.length) {
  admin.initializeApp();
}

const REGION = "asia-south1";
const ALLOWED_ORIGIN = "https://agileai.university";

/**
 * 🔒 PAYMENT MODE LOCK
 * true  = ₹1 / $1 SAFE TEST MODE
 * false = LIVE PRICING
 */
const TEST_MODE = true;

/* ===================== CORS ===================== */
function applyCors(req, res) {
  res.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return false;
  }
  return true;
}

/* ===================== CREATE ORDER ===================== */
exports.createExecutiveOrder = functions
  .region(REGION)
  .https.onRequest(async (req, res) => {
    if (!applyCors(req, res)) return;

    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const { currency, email, name } = req.body || {};
      if (!currency || !email) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const cfg = functions.config().razorpay || {};
      if (!cfg.key_id || !cfg.key_secret) {
        return res.status(500).json({ error: "Razorpay not configured" });
      }

      const razorpay = new Razorpay({
        key_id: cfg.key_id,
        key_secret: cfg.key_secret,
      });

      const amount = TEST_MODE ? 100 : req.body.amount;

      const order = await razorpay.orders.create({
        amount,
        currency,
        receipt: `exec_${Date.now()}`,
        payment_capture: 1,
        notes: {
          email,
          name: name || "Participant",
          mode: TEST_MODE ? "test" : "live",
        },
      });

      return res.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: cfg.key_id,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Order failed" });
    }
  });

/* ===================== PENDING BRIDGE ===================== */
exports.markExecutivePending = functions
  .region(REGION)
  .https.onRequest(async (req, res) => {
    applyCors(req, res);

    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ ok: false });
    }

    await admin.firestore()
      .collection("executiveEntitlements")
      .doc(email.toLowerCase())
      .set(
        {
          email: email.toLowerCase(),
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    return res.json({ ok: true });
  });

/* ===================== WEBHOOK ===================== */
exports.razorpayWebhook = functions
  .region(REGION)
  .https.onRequest(async (req, res) => {
    try {
      const secret = functions.config().razorpay?.webhook_secret;
      const signature = req.headers["x-razorpay-signature"];

      const expected = crypto
        .createHmac("sha256", secret)
        .update(req.rawBody)
        .digest("hex");

      if (signature !== expected) {
        return res.status(401).send("Invalid signature");
      }

      const event = JSON.parse(req.rawBody.toString("utf8"));
      if (event.event !== "payment.captured") {
        return res.status(200).send("Ignored");
      }

      const payment = event.payload.payment.entity;
      const email = payment.email || payment.notes?.email;

      if (!email) return res.status(200).send("No email");

      await admin.firestore()
        .collection("executiveEntitlements")
        .doc(email.toLowerCase())
        .set(
          {
            email: email.toLowerCase(),
            status: "entitled",
            entitled: true,
            paymentId: payment.id,
            capturedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

      return res.status(200).send("Entitled");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Webhook error");
    }
  });

/* ===================== ENTITLEMENT CHECK ===================== */
exports.checkExecutiveEntitlement = functions
  .region(REGION)
  .https.onRequest(async (req, res) => {
    applyCors(req, res);

    const email = req.query.email;
    if (!email) return res.json({ entitled: false });

    const doc = await admin.firestore()
      .collection("executiveEntitlements")
      .doc(email.toLowerCase())
      .get();

    return res.json({
      entitled: doc.exists && doc.data()?.status === "entitled",
    });
  });
