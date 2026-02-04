const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const crypto = require("crypto");
const admin = require("firebase-admin");

/**
 * =========================================================
 * Razorpay Webhook — Executive Insight (PRODUCTION, LOCKED)
 * =========================================================
 * - Firebase Functions v2
 * - RAW BODY signature verification (MANDATORY)
 * - Accepts ONLY payment.captured
 * - Firestore write via Admin SDK
 * - Idempotent by email
 * =========================================================
 */

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.razorpayWebhook = onRequest(
  {
    secrets: ["RAZORPAY_WEBHOOK_SECRET"],

    // 🔒 DO NOT REMOVE — REQUIRED FOR RAZORPAY
    bodyParser: false,
  },
  async (req, res) => {
    try {
      /* =====================================================
         STEP 1 — VERIFY SIGNATURE (RAW BODY ONLY)
      ===================================================== */

      const signature = req.headers["x-razorpay-signature"];
      if (!signature) {
        logger.error("Missing Razorpay signature header");
        return res.status(400).send("Signature missing");
      }

      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!secret) {
        logger.error("RAZORPAY_WEBHOOK_SECRET not configured");
        return res.status(500).send("Server misconfigured");
      }

      if (!req.rawBody) {
        logger.error("rawBody missing — bodyParser not disabled");
        return res.status(400).send("rawBody missing");
      }

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.rawBody)
        .digest("hex");

      /* =====================================================
         🔬 STEP-A — TEMPORARY FORENSIC LOGGING (SAFE)
         (REMOVE AFTER DIAGNOSIS)
      ===================================================== */

      logger.error("SIGNATURE DEBUG", {
        razorpaySignature: signature,
        computedSignature: expectedSignature,
        rawBodyType: typeof req.rawBody,
        rawBodyLength: req.rawBody.length,
      });

      if (
        !crypto.timingSafeEqual(
          Buffer.from(signature, "utf8"),
          Buffer.from(expectedSignature, "utf8")
        )
      ) {
        logger.error("Invalid Razorpay signature");
        return res.status(401).send("Invalid signature");
      }

      /* =====================================================
         STEP 2 — PARSE PAYLOAD (AFTER VERIFICATION)
      ===================================================== */

      let payload;
      try {
        payload = JSON.parse(req.rawBody.toString("utf8"));
      } catch (e) {
        logger.error("Failed to parse Razorpay payload", e);
        return res.status(400).send("Invalid JSON");
      }

      /* =====================================================
         STEP 3 — ACCEPT ONLY payment.captured
      ===================================================== */

      if (payload.event !== "payment.captured") {
        logger.info("Ignoring Razorpay event", { event: payload.event });
        return res.status(200).send("Ignored");
      }

      const payment = payload?.payload?.payment?.entity;
      if (!payment) {
        logger.error("Missing payment entity");
        return res.status(400).send("Invalid payload");
      }

      const email = payment.email?.toLowerCase().trim();
      const paymentId = payment.id;
      const amount = payment.amount;
      const currency = payment.currency;

      if (!email || !paymentId) {
        logger.error("Missing critical payment fields", {
          email,
          paymentId,
        });
        return res.status(400).send("Incomplete payment data");
      }

      /* =====================================================
         STEP 4 — IDEMPOTENT FIRESTORE WRITE
      ===================================================== */

      const ref = db.collection("executiveEntitlements").doc(email);

      const existing = await ref.get();
      if (existing.exists && existing.data()?.entitled === true) {
        logger.warn("Duplicate entitlement ignored", { email });
        return res.status(200).send("Already entitled");
      }

      await ref.set(
        {
          email,
          entitled: true,
          amount,
          currency,
          paymentId,
          source: "razorpay",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      logger.info("Executive entitlement created", {
        email,
        paymentId,
      });

      /* =====================================================
         STEP 5 — ACKNOWLEDGE RAZORPAY (MANDATORY)
      ===================================================== */

      return res.status(200).json({ status: "ok" });

    } catch (err) {
      logger.error("Webhook fatal error", err);
      return res.status(500).send("Webhook error");
    }
  }
);
