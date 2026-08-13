import express from "express";
import crypto from "crypto";
import admin from "firebase-admin";

const app = express();

/**
 * Razorpay signature verification requires the original request bytes.
 * Do not replace this with ordinary express.json().
 */
app.use(
  express.json({
    verify: (req, res, buffer) => {
      req.rawBody = buffer;
    },
  })
);

app.get("/", (req, res) => {
  res.status(200).send("Razorpay Webhook Service is running");
});

admin.initializeApp();

const db = admin.firestore();
const { FieldValue } = admin.firestore;

const RAZORPAY_WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET;

const BRIDGE_PRODUCT_CODE = "AOP_AIPA_BRIDGE";
const BRIDGE_EXPECTED_AMOUNT = 885000;
const BRIDGE_EXPECTED_CURRENCY = "INR";

function verifySignature(rawBody, signature, secret) {
  if (
    !Buffer.isBuffer(rawBody) ||
    typeof signature !== "string" ||
    typeof secret !== "string"
  ) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    signatureBuffer
  );
}

function normalizeEmail(email) {
  if (typeof email !== "string") {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  return normalized || null;
}

function normalizeCurrency(currency) {
  if (typeof currency !== "string") {
    return null;
  }

  return currency.trim().toUpperCase();
}

function isExplicitBridgePayment(payment) {
  return (
    payment?.notes?.product_code === BRIDGE_PRODUCT_CODE ||
    payment?.notes?.programme_code === BRIDGE_PRODUCT_CODE ||
    payment?.notes?.program_code === BRIDGE_PRODUCT_CODE
  );
}

/**
 * Find the authoritative backend payment record using the Razorpay order ID.
 */
async function findBridgePayment(orderId) {
  if (!orderId) {
    return null;
  }

  const snapshot = await db
    .collection("payments")
    .where("gateway_order_id", "==", orderId)
    .limit(2)
    .get();

  if (snapshot.empty) {
    return null;
  }

  if (snapshot.size > 1) {
    throw new Error(
      `Multiple payment records found for Razorpay order ${orderId}`
    );
  }

  const document = snapshot.docs[0];
  const data = document.data();

  if (data.product_code !== BRIDGE_PRODUCT_CODE) {
    return null;
  }

  return {
    ref: document.ref,
    id: document.id,
    data,
  };
}

async function processBridgePayment(
  bridgePayment,
  razorpayPayment,
  webhookEventId
) {
  const paymentRef = bridgePayment.ref;

  await db.runTransaction(async (tx) => {
    const paymentSnapshot = await tx.get(paymentRef);

    if (!paymentSnapshot.exists) {
      throw new Error("Bridge payment record no longer exists");
    }

    const paymentRecord = paymentSnapshot.data();

    const registrationId = paymentRecord.registration_id;
    const learnerUid = paymentRecord.learner_uid;

    if (!registrationId || !learnerUid) {
      throw new Error(
        "Bridge payment record is missing registration or learner identity"
      );
    }

    const registrationRef = db
      .collection("bridge_programme_registrations")
      .doc(registrationId);

    const registrationSnapshot = await tx.get(registrationRef);

    if (!registrationSnapshot.exists) {
      throw new Error(
        `Bridge registration ${registrationId} does not exist`
      );
    }

    const registration = registrationSnapshot.data();

    /**
     * Validate product and identity correlation.
     */
    if (paymentRecord.product_code !== BRIDGE_PRODUCT_CODE) {
      throw new Error("Unexpected payment product code");
    }

    if (
      registration.learner_uid &&
      registration.learner_uid !== learnerUid
    ) {
      throw new Error(
        "Learner identity does not match the registration"
      );
    }

    if (
      registration.registration_id &&
      registration.registration_id !== registrationId
    ) {
      throw new Error("Registration identity mismatch");
    }

    /**
     * Validate the Razorpay order against the backend-created order.
     */
    if (
      !razorpayPayment.order_id ||
      paymentRecord.gateway_order_id !== razorpayPayment.order_id
    ) {
      throw new Error("Razorpay order ID mismatch");
    }

    /**
     * Validate the authoritative Bridge price.
     * Razorpay amounts are in paise.
     */
    if (
      Number(razorpayPayment.amount) !== BRIDGE_EXPECTED_AMOUNT
    ) {
      throw new Error(
        `Bridge amount mismatch for order ${razorpayPayment.order_id}`
      );
    }

    if (
      normalizeCurrency(razorpayPayment.currency) !==
      BRIDGE_EXPECTED_CURRENCY
    ) {
      throw new Error(
        `Bridge currency mismatch for order ${razorpayPayment.order_id}`
      );
    }

    if (
      paymentRecord.gateway_amount !== undefined &&
      Number(paymentRecord.gateway_amount) !==
        BRIDGE_EXPECTED_AMOUNT
    ) {
      throw new Error(
        "Backend Bridge payment amount is not authoritative"
      );
    }

    if (
      paymentRecord.currency &&
      normalizeCurrency(paymentRecord.currency) !==
        BRIDGE_EXPECTED_CURRENCY
    ) {
      throw new Error(
        "Backend Bridge payment currency is invalid"
      );
    }

    /**
     * Idempotent webhook replay.
     */
    if (paymentRecord.payment_status === "PAID") {
      if (
        paymentRecord.gateway_payment_id === razorpayPayment.id
      ) {
        return;
      }

      throw new Error(
        "Payment record is already associated with another payment ID"
      );
    }

    const timestamp = FieldValue.serverTimestamp();

    tx.update(paymentRef, {
      payment_status: "PAID",
      gateway_status: "captured",
      gateway_payment_id: razorpayPayment.id,
      gateway_order_id: razorpayPayment.order_id,
      gateway_amount: BRIDGE_EXPECTED_AMOUNT,
      currency: BRIDGE_EXPECTED_CURRENCY,
      verification_source: "RAZORPAY_WEBHOOK",
      webhook_event_id: webhookEventId || null,
      captured_at: timestamp,
      verified_at: timestamp,
      updated_at: timestamp,
      updated_by: "system",
    });

    tx.update(registrationRef, {
      registration_status: "PAYMENT_CONFIRMED",
      payment_status: "PAID",
      payment_id: paymentRef.id,
      gateway: "razorpay",
      gateway_order_id: razorpayPayment.order_id,
      gateway_payment_id: razorpayPayment.id,
      payment_confirmed_at: timestamp,
      updated_at: timestamp,
      updated_by: "system",
    });
  });
}

/**
 * Preserve the existing Executive Insight entitlement flow.
 */
async function processExecutiveInsightPayment(payment) {
  const email = normalizeEmail(
    payment.email || payment.notes?.email || null
  );

  if (!email) {
    const error = new Error("Executive Insight email missing");
    error.statusCode = 400;
    throw error;
  }

  const productCode = "EXEC_INSIGHT";
  const docId = `${email}__${productCode}`;
  const entitlementRef = db
    .collection("entitlements")
    .doc(docId);

  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(entitlementRef);

    if (snapshot.exists) {
      return;
    }

    tx.set(entitlementRef, {
      email,
      product_code: productCode,
      status: "active",
      source: "razorpay",
      payment_id: payment.id,
      gateway: "razorpay",
      amount: payment.amount,
      currency: payment.currency,
      created_at: FieldValue.serverTimestamp(),
      created_by: "system",
    });
  });
}

app.post("/razorpay/webhook", async (req, res) => {
  try {
    const signature =
      req.headers["x-razorpay-signature"];

    if (!signature || !RAZORPAY_WEBHOOK_SECRET) {
      return res.status(401).send("Unauthorized");
    }

    if (
      !verifySignature(
        req.rawBody,
        signature,
        RAZORPAY_WEBHOOK_SECRET
      )
    ) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.body?.event;

    if (event !== "payment.captured") {
      return res.status(200).send("Ignored");
    }

    const payment =
      req.body?.payload?.payment?.entity;

    if (!payment || payment.status !== "captured") {
      return res.status(200).send("Not captured");
    }

    if (!payment.id || !payment.order_id) {
      return res
        .status(400)
        .send("Payment or order ID missing");
    }

    const bridgePayment = await findBridgePayment(
      payment.order_id
    );

    if (bridgePayment) {
      await processBridgePayment(
        bridgePayment,
        payment,
        req.body?.id || null
      );

      return res
        .status(200)
        .send("Bridge payment processed");
    }

    /**
     * Never let a Bridge-labelled payment fall through to
     * Executive Insight.
     *
     * Returning 500 asks Razorpay to retry while the missing
     * backend correlation is investigated.
     */
    if (isExplicitBridgePayment(payment)) {
      console.error(
        "Bridge payment record not found",
        {
          paymentId: payment.id,
          orderId: payment.order_id,
        }
      );

      return res
        .status(500)
        .send("Bridge payment correlation unavailable");
    }

    await processExecutiveInsightPayment(payment);

    return res
      .status(200)
      .send("Entitlement processed");
  } catch (error) {
    console.error("Webhook error:", {
      message: error?.message,
      stack: error?.stack,
    });

    return res
      .status(error?.statusCode || 500)
      .send("Server error");
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Razorpay webhook listening on port ${PORT}`
  );
});