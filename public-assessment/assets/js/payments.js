(function () {
  "use strict";

  /**
   * =========================================================
   * Agile AI University — Executive Insight Payment (Client)
   * SAFE CANONICAL VERSION — FINAL (REDIRECT FIXED)
   * =========================================================
   * Rules:
   * - Webhook is the ONLY authority
   * - Client NEVER sets entitlement
   * - Client NEVER guesses identity
   * - Client only verifies + hands off access
   * =========================================================
   */

  /* ===================== ENDPOINTS (LOCKED) ===================== */

  const ORDER_ENDPOINT =
    "https://asia-south1-fb-agileai-university.cloudfunctions.net/createExecutiveOrder";

  const ENTITLEMENT_ENDPOINT =
    "https://asia-south1-fb-agileai-university.cloudfunctions.net/checkExecutiveEntitlement";

  /* ===================== DOM ===================== */

  const payInrBtn = document.getElementById("pay-inr");
  const payUsdBtn = document.getElementById("pay-usd");
  const statusEl = document.getElementById("status");

  if (!payInrBtn || !payUsdBtn || !statusEl) return;

  /* ===================== SESSION (READ-ONLY) ===================== */

  const email = sessionStorage.getItem("assessmentEmail");
  const name =
    sessionStorage.getItem("assessmentName") || "Executive Insight User";

  // 🔒 Hard gate — prevent invalid entry
  if (!email) {
    window.location.replace(
      "https://assessment.agileai.university/report.html"
    );
    return;
  }

  /* ===================== HELPERS ===================== */

  function setStatus(msg) {
    statusEl.textContent = msg || "";
  }

  function disablePayButtons(state) {
    payInrBtn.disabled = state;
    payUsdBtn.disabled = state;
  }

  async function createOrder(currency, amount) {
    const res = await fetch(ORDER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currency,
        amount,
        email,
        name,
      }),
    });

    if (!res.ok) throw new Error("Order creation failed");
    return res.json();
  }

  async function checkEntitlement() {
    const res = await fetch(ENTITLEMENT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) return false;
    const data = await res.json();
    return data.entitled === true;
  }

  /* ===================== PAYMENT FLOW ===================== */

  async function startPayment(currency) {
    try {
      if (typeof window.Razorpay !== "function") {
        throw new Error("Razorpay SDK not loaded");
      }

      disablePayButtons(true);
      setStatus("Preparing secure checkout…");

      const amount =
        currency === "INR"
          ? 499900 // ₹4,999
          : 5900;  // $59

      const order = await createOrder(currency, amount);

      const rzp = new Razorpay({
        key: order.key_id,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: "Agile AI University",
        description: "Executive Insight Report",
        prefill: { email, name },
        theme: { color: "#111827" },

        handler: async function () {
          setStatus("Confirming access…");

          const entitled = await checkEntitlement();

          if (entitled) {
            // 🔒 ACCESS HANDOFF (CANONICAL)
            sessionStorage.setItem("execInsightUnlocked", "true");
            sessionStorage.setItem("execInsightSource", "portal");

            window.location.href =
              "https://assessment.agileai.university/executive-insight.html?from=portal";
          } else {
            disablePayButtons(false);
            setStatus(
              "Payment received, but access is still being finalized. Please refresh shortly."
            );
          }
        },

        modal: {
          ondismiss: function () {
            disablePayButtons(false);
            setStatus("Payment cancelled.");
          },
        },
      });

      rzp.open();
    } catch (err) {
      console.error("[Payment] Error:", err);
      disablePayButtons(false);
      setStatus("Unable to start payment. Please try again.");
    }
  }

  /* ===================== EVENTS ===================== */

  payInrBtn.addEventListener("click", () => startPayment("INR"));
  payUsdBtn.addEventListener("click", () => startPayment("USD"));
})();
