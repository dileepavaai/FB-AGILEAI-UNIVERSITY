/* ============================================================
   AGILE AI UNIVERSITY
   BRIDGE PAYMENT CONTROLLER

   File:
   public-portal/assets/js/controllers/programs/
   payment-controller.js

   Version: 1.0.0
   Status: ACTIVE
   Runtime: Browser Global

   Purpose
   ------------------------------------------------------------
   - Convert the existing registration button into the secure
     payment action after registration is confirmed
   - Request the governed Razorpay order through PaymentService
   - Open Razorpay Checkout
   - Treat the browser callback only as an acknowledgement
   - Poll the backend for webhook-authoritative confirmation
   - Never create enrolment or learning access
============================================================ */

(function initialisePaymentController(
  global,
  document
) {
  "use strict";

  const CONTROLLER_NAME =
    "BridgePaymentController";

  const CONTROLLER_VERSION =
    "1.0.0";

  const PAYMENT_BUTTON_ID =
    "bridgeRegisterButton";

  const NOTICE_ID =
    "bridgeRegistrationNotice";

  const PAYMENT_LABEL =
    "Proceed to Secure Payment";

  const OPENING_LABEL =
    "Opening Secure Checkout…";

  const VERIFYING_LABEL =
    "Confirming Payment…";

  const CONFIRMED_LABEL =
    "Payment Confirmed";

  const POLL_INTERVAL_MS =
    2500;

  const MAX_POLL_ATTEMPTS =
    36;

  let paymentModeActive =
    false;

  let checkoutInProgress =
    false;

  let paymentPromise =
    null;

  let pollingPromise =
    null;

  let latestPayment =
    null;

  /* ==========================================================
     HELPERS
  ========================================================== */

  function freezeObject(value) {
    return Object.freeze(value);
  }

  function isObject(value) {
    return Boolean(
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    );
  }

  function normaliseString(value) {
    return typeof value === "string"
      ? value.trim()
      : "";
  }

  function normaliseStatus(value) {
    const status =
      normaliseString(value)
        .toUpperCase();

    if (
      status === "PAID" ||
      status === "CAPTURED" ||
      status === "SUCCESS" ||
      status === "SUCCEEDED" ||
      status === "COMPLETED"
    ) {
      return "CONFIRMED";
    }

    if (
      status === "ORDER_CREATED" ||
      status === "ORDER_CREATING" ||
      status === "PENDING" ||
      status === "AUTHORIZED"
    ) {
      return "PROCESSING";
    }

    return status;
  }

  function wait(milliseconds) {
    return new Promise(resolve => {
      global.setTimeout(
        resolve,
        milliseconds
      );
    });
  }

  function getButton() {
    return document.getElementById(
      PAYMENT_BUTTON_ID
    );
  }

  function getNotice() {
    return document.getElementById(
      NOTICE_ID
    );
  }

  function setButtonState({
    label,
    disabled
  }) {
    const button =
      getButton();

    if (!button) {
      return;
    }

    if (
      normaliseString(label)
    ) {
      button.textContent =
        label;
    }

    button.disabled =
      disabled === true;

    button.setAttribute(
      "aria-busy",
      disabled === true &&
      checkoutInProgress
        ? "true"
        : "false"
    );
  }

  function setNotice(
    message,
    isError = false
  ) {
    const notice =
      getNotice();

    if (!notice) {
      return;
    }

    notice.textContent =
      normaliseString(message);

    notice.dataset.paymentState =
      isError
        ? "error"
        : "information";
  }

  function announce(message) {
    const announcer =
      document.getElementById(
        "bridgeStatusAnnouncer"
      );

    if (announcer) {
      announcer.textContent =
        normaliseString(message);
    }
  }

  function dispatchEvent(
    eventName,
    detail = {}
  ) {
    global.dispatchEvent(
      new CustomEvent(
        eventName,
        {
          detail:
            freezeObject({
              ...detail
            })
        }
      )
    );
  }

  function getJourneyController() {
    const controller =
      global.BridgeRegistrationController;

    if (
      !controller ||
      typeof controller !==
        "object"
    ) {
      throw new Error(
        "Bridge Registration Controller is unavailable."
      );
    }

    return controller;
  }

  function getPaymentService() {
    const service =
      global.PaymentService ||
      global.BridgePaymentService;

    if (
      !service ||
      typeof service !==
        "object"
    ) {
      throw new Error(
        "PaymentService is unavailable."
      );
    }

    return service;
  }

  function getRegistration(
    controller
  ) {
    if (
      typeof controller
        .getResolvedRegistration ===
      "function"
    ) {
      const registration =
        controller
          .getResolvedRegistration();

      if (isObject(registration)) {
        return registration;
      }
    }

    if (
      typeof controller.getState ===
      "function"
    ) {
      const state =
        controller.getState();

      if (
        isObject(state) &&
        isObject(
          state.registration
        )
      ) {
        return state.registration;
      }
    }

    return null;
  }

  function getRegistrationId(
    registration
  ) {
    return normaliseString(
      registration?.registrationId ||
      registration?.registration_id ||
      registration?.id
    );
  }

  function isPaymentRequired() {
    try {
      const controller =
        getJourneyController();

      if (
        typeof controller
          .isPaymentRequired ===
        "function"
      ) {
        return controller
          .isPaymentRequired() ===
          true;
      }

      const state =
        typeof controller.getState ===
          "function"
          ? controller.getState()
          : {};

      return (
        normaliseStatus(
          state?.status
        ) === "PAYMENT_REQUIRED" ||
        normaliseStatus(
          state?.registration
            ?.paymentStatus
        ) === "NOT_INITIATED" ||
        normaliseStatus(
          state?.registration
            ?.paymentStatus
        ) === "PROCESSING"
      );
    } catch (error) {
      return false;
    }
  }

  function isPaymentConfirmed(
    payment
  ) {
    return (
      normaliseStatus(
        payment?.status
      ) === "CONFIRMED"
    );
  }

  /* ==========================================================
     PAYMENT ACTION MODE
  ========================================================== */

  function activatePaymentMode() {
    if (checkoutInProgress) {
      return;
    }

    const controller =
      getJourneyController();

    const registration =
      getRegistration(
        controller
      );

    if (
      !registration ||
      !getRegistrationId(
        registration
      )
    ) {
      return;
    }

    paymentModeActive =
      true;

    setButtonState({
      label:
        PAYMENT_LABEL,

      disabled:
        false
    });

    setNotice(
      "Your registration is confirmed. Continue to secure Razorpay checkout."
    );

    announce(
      "Registration confirmed. Secure payment is now available."
    );

    dispatchEvent(
      "bridge-payment-controller:payment-ready",
      {
        registrationId:
          getRegistrationId(
            registration
          )
      }
    );
  }

  function deactivatePaymentMode() {
    paymentModeActive =
      false;
  }

  /* ==========================================================
     RAZORPAY CHECKOUT
  ========================================================== */

  function resolveCheckoutFields(
    payment
  ) {
    const raw =
      isObject(payment?.raw)
        ? payment.raw
        : {};

    return freezeObject({
      keyId:
        normaliseString(
          payment?.keyId ||
          raw.keyId
        ),

      orderId:
        normaliseString(
          payment?.providerOrderId ||
          payment?.orderId ||
          raw.providerOrderId ||
          raw.orderId
        ),

      amount:
        Number(
          payment?.gatewayAmount ||
          raw.gatewayAmount ||
          0
        ),

      currency:
        normaliseString(
          payment?.currency ||
          raw.currency ||
          "INR"
        ).toUpperCase(),

      description:
        "AOP to AIPA Bridge Programme"
    });
  }

  function validateCheckoutFields(
    checkout
  ) {
    if (
      !checkout.keyId ||
      !checkout.orderId ||
      !Number.isFinite(
        checkout.amount
      ) ||
      checkout.amount <= 0 ||
      checkout.currency !== "INR"
    ) {
      throw new Error(
        "The governed payment order is incomplete. Please try again."
      );
    }
  }

  function getLearnerPrefill() {
    const user =
      global.firebase &&
      typeof global.firebase.auth ===
        "function"
        ? global.firebase
            .auth()
            .currentUser
        : null;

    return freezeObject({
      name:
        normaliseString(
          user?.displayName
        ),

      email:
        normaliseString(
          user?.email
        )
    });
  }

  function openRazorpayCheckout(
    payment,
    registration
  ) {
    if (
      typeof global.Razorpay !==
        "function"
    ) {
      throw new Error(
        "Secure Razorpay Checkout is unavailable. Please refresh the page and try again."
      );
    }

    const checkout =
      resolveCheckoutFields(
        payment
      );

    validateCheckoutFields(
      checkout
    );

    const prefill =
      getLearnerPrefill();

    const registrationId =
      getRegistrationId(
        registration
      );

    return new Promise(
      (
        resolve,
        reject
      ) => {
        let callbackReceived =
          false;

        const razorpay =
          new global.Razorpay({
            key:
              checkout.keyId,

            order_id:
              checkout.orderId,

            amount:
              checkout.amount,

            currency:
              checkout.currency,

            name:
              "Agile AI University",

            description:
              checkout.description,

            prefill: {
              name:
                prefill.name,

              email:
                prefill.email
            },

            notes: {
              product_code:
                "AOP_AIPA_BRIDGE",

              registration_id:
                registrationId
            },

            theme: {
              color:
                "#1f5eff"
            },

            handler(response) {
              callbackReceived =
                true;

              /*
               * This callback is not payment authority.
               * The signed webhook and backend payment record
               * remain authoritative.
               */

              resolve(
                freezeObject({
                  acknowledged:
                    true,

                  providerPaymentId:
                    normaliseString(
                      response
                        ?.razorpay_payment_id
                    ),

                  providerOrderId:
                    normaliseString(
                      response
                        ?.razorpay_order_id
                    )
                })
              );
            },

            modal: {
              ondismiss() {
                if (
                  callbackReceived
                ) {
                  return;
                }

                reject(
                  new Error(
                    "Payment checkout was closed before completion."
                  )
                );
              },

              confirm_close:
                true,

              escape:
                true
            },

            retry: {
              enabled:
                true
            }
          });

        razorpay.on(
          "payment.failed",
          response => {
            const reason =
              normaliseString(
                response?.error
                  ?.description
              ) ||
              "Razorpay reported that the payment attempt failed.";

            reject(
              new Error(reason)
            );
          }
        );

        razorpay.open();
      }
    );
  }

  /* ==========================================================
     WEBHOOK-AUTHORITATIVE STATUS POLLING
  ========================================================== */

  async function pollTrustedPaymentStatus(
    controller,
    registration,
    initialPayment
  ) {
    if (pollingPromise) {
      return pollingPromise;
    }

    pollingPromise =
      (async () => {
        let payment =
          initialPayment;

        for (
          let attempt = 1;
          attempt <=
            MAX_POLL_ATTEMPTS;
          attempt += 1
        ) {
          payment =
            await controller
              .resolvePaymentStatus({
                registration,

                payment,

                force:
                  true,

                source:
                  "STUDENT_PORTAL_WEBHOOK_POLL"
              });

          latestPayment =
            payment;

          if (
            isPaymentConfirmed(
              payment
            )
          ) {
            return payment;
          }

          if (
            attempt <
            MAX_POLL_ATTEMPTS
          ) {
            await wait(
              POLL_INTERVAL_MS
            );
          }
        }

        throw new Error(
          "Payment was submitted, but confirmation is still pending. Please refresh this page shortly."
        );
      })();

    try {
      return await pollingPromise;
    } finally {
      pollingPromise =
        null;
    }
  }

  /* ==========================================================
     COMPLETE PAYMENT ACTION
  ========================================================== */

  async function beginPayment() {
    if (paymentPromise) {
      return paymentPromise;
    }

    paymentPromise =
      (async () => {
        const controller =
          getJourneyController();

        getPaymentService();

        const registration =
          getRegistration(
            controller
          );

        const registrationId =
          getRegistrationId(
            registration
          );

        if (!registrationId) {
          throw new Error(
            "A confirmed Bridge Programme registration is required before payment."
          );
        }

        checkoutInProgress =
          true;

        setButtonState({
          label:
            OPENING_LABEL,

          disabled:
            true
        });

        setNotice(
          "Creating your secure, governed Razorpay order…"
        );

        announce(
          "Preparing secure payment checkout."
        );

        const payment =
          await controller
            .initiatePayment({
              registration,

              force:
                true,

              source:
                "STUDENT_PORTAL"
            });

        latestPayment =
          payment;

        if (
          isPaymentConfirmed(
            payment
          )
        ) {
          setButtonState({
            label:
              CONFIRMED_LABEL,

            disabled:
              true
          });

          setNotice(
            "Your payment has already been confirmed."
          );

          deactivatePaymentMode();

          return payment;
        }

        setNotice(
          "Complete the payment in the secure Razorpay window."
        );

        await openRazorpayCheckout(
          payment,
          registration
        );

        setButtonState({
          label:
            VERIFYING_LABEL,

          disabled:
            true
        });

        setNotice(
          "Payment received by Razorpay. Waiting for secure webhook confirmation…"
        );

        announce(
          "Payment submitted. Waiting for secure confirmation."
        );

        const confirmedPayment =
          await pollTrustedPaymentStatus(
            controller,
            registration,
            payment
          );

        setButtonState({
          label:
            CONFIRMED_LABEL,

          disabled:
            true
        });

        setNotice(
          "Your Bridge Programme payment has been securely confirmed."
        );

        announce(
          "Payment confirmed."
        );

        deactivatePaymentMode();

        dispatchEvent(
          "bridge-payment-controller:payment-confirmed",
          {
            registrationId,

            payment:
              confirmedPayment
          }
        );

        return confirmedPayment;
      })();

    try {
      return await paymentPromise;
    } catch (error) {
      checkoutInProgress =
        false;

      setButtonState({
        label:
          PAYMENT_LABEL,

        disabled:
          false
      });

      setNotice(
        normaliseString(
          error?.message
        ) ||
        "Secure payment could not be completed. Please try again.",
        true
      );

      announce(
        "Payment was not completed."
      );

      dispatchEvent(
        "bridge-payment-controller:error",
        {
          message:
            normaliseString(
              error?.message
            ),

          code:
            normaliseString(
              error?.code
            )
        }
      );

      throw error;
    } finally {
      checkoutInProgress =
        false;

      paymentPromise =
        null;
    }
  }

  /* ==========================================================
     EVENT HANDLING
  ========================================================== */

  function handlePaymentClick(
    event
  ) {
    if (
      !paymentModeActive
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    beginPayment().catch(
      error => {
        console.error(
          `[${CONTROLLER_NAME}]`,
          error
        );
      }
    );
  }

  function handlePaymentRequired() {
    global.setTimeout(
      activatePaymentMode,
      0
    );
  }

  function handlePaymentConfirmed() {
    deactivatePaymentMode();

    setButtonState({
      label:
        CONFIRMED_LABEL,

      disabled:
        true
    });

    setNotice(
      "Your Bridge Programme payment has been securely confirmed."
    );
  }

  function inspectCurrentJourney() {
    if (
      isPaymentRequired()
    ) {
      activatePaymentMode();
      return;
    }

    try {
      const controller =
        getJourneyController();

      if (
        typeof controller
          .isPaymentConfirmed ===
          "function" &&
        controller
          .isPaymentConfirmed() ===
          true
      ) {
        handlePaymentConfirmed();
      }
    } catch (error) {
      /*
       * The journey controller may still be initialising.
       * Its lifecycle events will activate payment later.
       */
    }
  }

  function bindEvents() {
    const button =
      getButton();

    if (button) {
      /*
       * Capture mode allows the payment controller to take
       * authority over the existing button after registration,
       * without modifying the large registration page controller.
       */
      button.addEventListener(
        "click",
        handlePaymentClick,
        true
      );
    }

    global.addEventListener(
      "bridge-registration-controller:payment-required",
      handlePaymentRequired
    );

    global.addEventListener(
      "bridge-registration-controller:payment-confirmed",
      handlePaymentConfirmed
    );

    global.addEventListener(
      "bridge-registration-controller:state-changed",
      () => {
        if (
          !checkoutInProgress &&
          isPaymentRequired()
        ) {
          global.setTimeout(
            activatePaymentMode,
            0
          );
        }
      }
    );
  }

  function initialise() {
    bindEvents();

    global.setTimeout(
      inspectCurrentJourney,
      0
    );

    dispatchEvent(
      "bridge-payment-controller:ready",
      {
        controller:
          CONTROLLER_NAME,

        version:
          CONTROLLER_VERSION
      }
    );

    return true;
  }

  /* ==========================================================
     PUBLIC API
  ========================================================== */

  const BridgePaymentController =
    freezeObject({
      CONTROLLER_NAME,
      CONTROLLER_VERSION,

      initialise,
      activatePaymentMode,
      beginPayment,

      getState() {
        return freezeObject({
          paymentModeActive,
          checkoutInProgress,
          payment:
            latestPayment
        });
      }
    });

  global.BridgePaymentController =
    BridgePaymentController;

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialise,
      {
        once:
          true
      }
    );
  } else {
    initialise();
  }

  console.info(
    `[${CONTROLLER_NAME}] v${CONTROLLER_VERSION} loaded successfully.`
  );
})(
  window,
  document
);