/**
 * =========================================================
 * Agile AI University — SendGrid Mailer + Callable Exports
 *
 * PURPOSE
 * - Single outbound email engine
 * - Export Firebase callable functions
 *
 * IMPORTANT (LOCKED):
 * - NO webhook changes
 * - NO secret changes
 * - NO logic refactor
 * =========================================================
 */

const logger = require("firebase-functions/logger");
const sgMail = require("@sendgrid/mail");

// 🔹 IMPORT CALLABLE FUNCTION (STEP-1)
const { createRazorpayOrder } = require("./createRazorpayOrder");

/* =========================================================
   SENDGRID INITIALIZATION (SAFE, IDEMPOTENT)
========================================================= */
function initSendGrid() {
  if (!process.env.SENDGRID_API_KEY) {
    logger.error("SENDGRID_API_KEY is missing");
    throw new Error("Missing SendGrid API Key");
  }

  // Safe to call multiple times
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/* =========================================================
   BUYER PAYMENT CONFIRMATION EMAIL (Email #1)
   CONTRACT (LOCKED):
   sendBuyerEmail({ to, name, paymentId })
========================================================= */
async function sendBuyerEmail({ to, name, paymentId }) {
  if (!to) {
    throw new Error("Recipient email (to) is required");
  }

  initSendGrid();

  await sgMail.send({
    to,
    from: {
      email: "insights@agileai.university",
      name: "Agile AI University",
    },
    subject: "Executive Insight Access Confirmed",
    html: `
      <h2>Payment Confirmed</h2>
      <p>Dear ${name || "Participant"},</p>

      <p>
        Your payment for the <strong>Executive Insight Report</strong>
        has been successfully received.
      </p>

      <p>
        Payment Reference:
        <strong>${paymentId || "N/A"}</strong>
      </p>

      <p>
        Your access is now unlocked in this session.
      </p>

      <p style="font-size:13px;color:#555;">
        This Executive Insight is advisory and interpretive in nature.
        It does not constitute certification, hiring evaluation,
        or performance scoring.
      </p>

      <p>— Agile AI University</p>
    `,
  });

  logger.info("Buyer email sent via SendGrid", {
    to,
    paymentId,
  });
}

/* =========================================================
   EXPORTS (LOCKED + EXTENDED)
========================================================= */
module.exports = {
  sendBuyerEmail,
  createRazorpayOrder, // 🔹 Callable function export
};
