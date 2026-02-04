/**
 * =========================================================
 * Agile AI University — Razorpay Order Creation
 * Phase-1A: Executive Insight (One-Time Payment)
 *
 * FILE STATUS: LOCKED (Phase-1A)
 *
 * Responsibilities:
 * - Validate request
 * - Validate product code (server-authoritative)
 * - Create Razorpay order
 * - Return ONLY what client needs to launch checkout
 *
 * IMPORTANT:
 * - Does NOT grant entitlements
 * - Does NOT assume payment success
 * - Webhook is the source of truth
 * =========================================================
 */

const Razorpay = require("razorpay");
const products = require("../config/products");

/**
 * Razorpay client (server-side only)
 */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create Razorpay Order
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    // Enforce POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { productCode, email, fullName } = req.body || {};

    // Basic validation
    if (!productCode || !email || !fullName) {
      return res.status(400).json({
        error: "Missing required fields: productCode, email, fullName"
      });
    }

    // Server-authoritative product lookup
    const product = products[productCode];
    if (!product) {
      return res.status(400).json({
        error: "Invalid product code"
      });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: product.amount, // in paise
      currency: product.currency,
      receipt: `exec_insight_${Date.now()}`,
      notes: {
        productCode: product.productCode,
        email,
        fullName
      }
    });

    // Respond with checkout-required fields only
    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("❌ Razorpay order creation failed", {
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      error: "Failed to create Razorpay order"
    });
  }
};
