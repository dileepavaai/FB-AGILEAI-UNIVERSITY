(function () {
  "use strict";

  /**
   * =========================================================
   * Agile AI University — Executive Insight Payment (Client)
   * MODE: EXPLICIT CONTINUATION + WEBHOOK AUTHORITATIVE (LOCKED)
   * =========================================================
   * Principles:
   * - Frontend NEVER grants entitlement
   * - Webhook is the only source of truth
   * - No automatic redirect (avoids race conditions)
   * - User explicitly continues once payment is confirmed
   * - Deterministic, auditable UX
   */

  // ---------------------------------------------------------
  // ENDPOINTS (LOCKED)
  // ---------------------------------------------------------
  const ORDER_ENDPOINT =
    "https://asia-south1-fb-agileai-university.cloudfunctions.net/createExecutiveOrder";

  const ENTITLEMENT_ENDPOINT =
    "https://asia-south1-fb-agileai-university.cloudfunctions.net/checkExecutiveEntitlement";

  // ---------------------------------------------------------
  // DOM
  // ---------------------------------------------------------
  const payInrBtn = document.getElementById("pay-inr");
  const payUsdBtn = document.getElementById("pay-usd");
  const continueBtn = document.getElementById("continue-btn");
  const statusEl = document.getElementById("status");

  if (!payInrBtn || !payUsdBtn || !continueBtn || !statusEl) {
    console.error("[Payment] ❌ Required DOM elements not found");
    return;
  }

  continueBtn.style.display = "none";
  continueBtn.disabled = true;

  // ---------------------------------------------------------
  // VISUAL LOADING INDICATOR (SAFE)
  // ---------------------------------------------------------
  let loadingTimer = null;
  let loadingStep = 0;
  const loadingFrames = [
    "Verifying access…",
    "Verifying access… ⏳",
    "Verifying access… ⏳⏳",
  ];

  function startLoading() {
    stopLoading();
    loadingStep = 0;
    setStatus(loadingFrames[0]);
    loadingTimer = setInterval(() => {
      loadingStep = (loadingStep + 1) % loadingFrames.length;
      setStatus(loadingFrames[loadingStep]);
    }, 600);
  }

  function stopLoading() {
    if (loadingTimer) {
      clearInterval(loadingTimer);
      loadingTimer = null;
    }
  }

  // ---------------------------------------------------------
  // EVENTS
  // ---------------------------------------------------------
  payInrBtn.addEventListener("click", () => startPayment("INR"));
  payUsdBtn.addEventListener("click", () => startPayment("USD"));
  continueBtn.addEventListener("click", handleContinue);

  // ---------------------------------------------------------
  // PAYMENT FLOW
  // ---------------------------------------------------------
  async function startPayment(currency) {
    try {
      if (typeof window.Razorpay !== "function") {
        throw new Error("Razorpay SDK not loaded");
      }

      const email = window.prompt("Please enter your email address:");
      if (!email || !email.includes("@")) {
        alert("Please enter a valid email address.");
        return;
      }

      sessionStorage.setItem("exec_email", email);
      disablePayButtons(true);
      setStatus("Preparing secure checkout…");

      const res = await fetch(ORDER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency,
          email,
          name: "Executive Insight Buyer",
        }),
      });

      const order = await res.json();
      if (!order || !order.id || !order.key_id) {
        throw new Error("Invalid order response");
      }

      const rzp = new Razorpay({
        key: order.key_id,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: "Agile AI University",
        description: "Executive Insight Report",
        prefill: { email },
        theme: { color: "#111827" },

        handler: function () {
          revealContinueButton();
          setStatus(
            "Payment received. Access is being unlocked. Please try again in a moment."
          );
        },

        modal: {
          ondismiss: function () {
            disablePayButtons(false);
            setStatus("");
          },
        },
      });

      rzp.open();
    } catch (err) {
      console.error("[Payment] ❌ Error:", err);
      alert("Unable to start payment. Please try again.");
      disablePayButtons(false);
      setStatus("");
    }
  }

  // ---------------------------------------------------------
  // CONTINUE FLOW
  // ---------------------------------------------------------
  async function handleContinue() {
    const email = sessionStorage.getItem("exec_email");
    if (!email) {
      alert("Session expired. Please refresh and try again.");
      return;
    }

    continueBtn.disabled = true;
    startLoading();

    try {
      const res = await fetch(
        ENTITLEMENT_ENDPOINT + "?email=" + encodeURIComponent(email)
      );
      const result = await res.json();

      if (result && result.entitled === true) {
        stopLoading();
        sessionStorage.removeItem("exec_email");
        window.location.href =
          "/public-assessment/executive-insight.html";
        return;
      }

      stopLoading();
      continueBtn.disabled = false;
      setStatus(
        "Payment received. Access is being unlocked. Please try again in a moment."
      );
    } catch (err) {
      stopLoading();
      console.error("[Entitlement] ❌ Error:", err);
      continueBtn.disabled = false;
      setStatus("Unable to verify access. Please try again.");
    }
  }

  // ---------------------------------------------------------
  // SELF-HEAL ON PAGE LOAD
  // ---------------------------------------------------------
  (async function checkOnLoad() {
    const email = sessionStorage.getItem("exec_email");
    if (!email) return;

    try {
      const res = await fetch(
        ENTITLEMENT_ENDPOINT + "?email=" + encodeURIComponent(email)
      );
      const result = await res.json();

      if (result && result.entitled === true) {
        revealContinueButton();
        setStatus("Access unlocked. You may continue.");
      }
    } catch (_) {
      // silent
    }
  })();

  // ---------------------------------------------------------
  // UI HELPERS
  // ---------------------------------------------------------
  function disablePayButtons(state) {
    payInrBtn.disabled = state;
    payUsdBtn.disabled = state;
  }

  function revealContinueButton() {
    continueBtn.style.display = "block";
    continueBtn.disabled = false;
  }

  function setStatus(msg) {
    statusEl.textContent = msg || "";
  }
})();
