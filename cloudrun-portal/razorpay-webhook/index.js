import express from "express";
import crypto from "crypto";
import admin from "firebase-admin";

/**
 * ----------------------------------------
 * App initialization
 * ----------------------------------------
 */
const app = express();

/**
 * Razorpay requires RAW body for signature verification
 * ⚠️ DO NOT CHANGE THIS
 */
app.use(
  express.json({
    verify: (req, res, buffer) => {
      req.rawBody = buffer;
    }
  })
);

/**
 * ----------------------------------------
 * Health Check (Safe, Non-sensitive)
 * ----------------------------------------
 */
app.get("/", (req, res) => {
  res.status(200).send("Razorpay Webhook Service is running");
});

/**
 * ----------------------------------------
 * Firebase Admin SDK
 * (Cloud Run provides service account automatically)
 * ----------------------------------------
 */
admin.initializeApp();
const db = admin.firestore();

/**
 * ----------------------------------------
 * Environment Variables
 * ----------------------------------------
 */
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

/**
 * ----------------------------------------
 * Helper functions
 * ----------------------------------------
 */
function verifySignature(rawBody, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return expected === signature;
}

function normalizeEmail(email) {
  return email?.toLowerCase().trim();
}

/**
 * ----------------------------------------
 * Razorpay Webhook Endpoint
 * ----------------------------------------
 */
app.post("/razorpay/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    if (!signature || !RAZORPAY_WEBHOOK_SECRET) {
      return res.status(401).send("Unauthorized");
    }

    /**
     * Verify webhook authenticity
     */
    const isValid = verifySignature(
      req.rawBody,
      signature,
      RAZORPAY_WEBHOOK_SECRET
    );

    if (!isValid) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.body?.event;

    /**
     * We only process payment.captured
     */
    if (event !== "payment.captured") {
      return res.status(200).send("Ignored");
    }

    const payment = req.body?.payload?.payment?.entity;

    if (!payment || payment.status !== "captured") {
      return res.status(200).send("Not captured");
    }

    /**
     * Extract buyer email
     */
    const emailRaw =
      payment.email ||
      payment.notes?.email ||
      null;

    const email = normalizeEmail(emailRaw);

    if (!email) {
      return res.status(400).send("Email missing");
    }

    /**
     * ----------------------------------------
     * Phase-3: EXEC_INSIGHT entitlement
     * ----------------------------------------
     */
    const PRODUCT_CODE = "EXEC_INSIGHT";
    const docId = `${email}__${PRODUCT_CODE}`;
    const ref = db.collection("entitlements").doc(docId);

    /**
     * Idempotent entitlement creation
     */
    await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (snapshot.exists) {
        return; // already granted
      }

      tx.set(ref, {
        email,
        product_code: PRODUCT_CODE,
        status: "active",
        source: "razorpay",
        payment_id: payment.id,
        gateway: "razorpay",
        amount: payment.amount,
        currency: payment.currency,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: "system"
      });
    });

    return res.status(200).send("Entitlement processed");
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).send("Server error");
  }
});

/**
 * ----------------------------------------
 * Start server
 * ----------------------------------------
 */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Razorpay webhook listening on port ${PORT}`);
});
