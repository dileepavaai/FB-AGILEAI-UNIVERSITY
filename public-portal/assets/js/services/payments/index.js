/* ============================================================
   AGILE AI UNIVERSITY
   BRIDGE PAYMENT SERVICE — PORTAL CLIENT

   File:
   public-portal/assets/js/services/payments/index.js

   Version: 1.0.0
   Status: ACTIVE
   Runtime: Browser Global

   Purpose
   ------------------------------------------------------------
   - Obtain the authenticated learner's Firebase ID token
   - Request a governed Bridge payment order
   - Resolve trusted payment status
   - Never trust browser-supplied amounts
   - Never treat the Razorpay browser callback as confirmation
============================================================ */

(function initialisePaymentService(global) {
  "use strict";

  const SERVICE_NAME =
    "PaymentService";

  const SERVICE_VERSION =
    "1.0.0";

  const BRIDGE_PAYMENT_API =
    "https://aau-bridge-payment-service-458881040066.asia-south1.run.app";

  const REQUEST_TIMEOUT_MS =
    20000;

  const PRODUCT_CODE =
    "AOP_AIPA_BRIDGE";

  const SOURCE_PROGRAMME_CODE =
    "AOP";

  const TARGET_PROGRAMME_CODE =
    "AIPA";

  /* ==========================================================
     GENERAL HELPERS
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

  function createServiceError(
    code,
    message,
    details = {}
  ) {
    const error =
      new Error(
        normaliseString(message) ||
        "The payment service request failed."
      );

    error.name =
      "PaymentServiceError";

    error.code =
      normaliseString(code) ||
      "PAYMENT_SERVICE_ERROR";

    error.details =
      isObject(details)
        ? freezeObject({
            ...details
          })
        : freezeObject({});

    return error;
  }

  /* ==========================================================
     FIREBASE AUTHENTICATION
  ========================================================== */

  function getFirebaseAuth() {
    if (
      !global.firebase ||
      typeof global.firebase.auth !==
        "function"
    ) {
      throw createServiceError(
        "AUTHENTICATION_UNAVAILABLE",
        "Firebase Authentication is unavailable."
      );
    }

    return global.firebase.auth();
  }

  async function getAuthenticatedUser() {
    const auth =
      getFirebaseAuth();

    if (auth.currentUser) {
      return auth.currentUser;
    }

    const user =
      await new Promise(
        (
          resolve,
          reject
        ) => {
          let settled =
            false;

          let unsubscribe =
            null;

          const timeoutId =
            global.setTimeout(
              () => {
                if (settled) {
                  return;
                }

                settled =
                  true;

                if (
                  typeof unsubscribe ===
                    "function"
                ) {
                  unsubscribe();
                }

                reject(
                  createServiceError(
                    "AUTHENTICATION_TIMEOUT",
                    "The authenticated learner session could not be resolved."
                  )
                );
              },
              10000
            );

          unsubscribe =
            auth.onAuthStateChanged(
              authenticatedUser => {
                if (settled) {
                  return;
                }

                settled =
                  true;

                global.clearTimeout(
                  timeoutId
                );

                if (
                  typeof unsubscribe ===
                    "function"
                ) {
                  unsubscribe();
                }

                resolve(
                  authenticatedUser ||
                  null
                );
              },
              error => {
                if (settled) {
                  return;
                }

                settled =
                  true;

                global.clearTimeout(
                  timeoutId
                );

                if (
                  typeof unsubscribe ===
                    "function"
                ) {
                  unsubscribe();
                }

                reject(error);
              }
            );
        }
      );

    if (!user) {
      throw createServiceError(
        "AUTHENTICATION_REQUIRED",
        "Please sign in before continuing to payment."
      );
    }

    return user;
  }

  async function getIdToken() {
    const user =
      await getAuthenticatedUser();

    const idToken =
      await user.getIdToken(
        true
      );

    if (!normaliseString(idToken)) {
      throw createServiceError(
        "TOKEN_UNAVAILABLE",
        "The authenticated learner token is unavailable."
      );
    }

    return idToken;
  }

  /* ==========================================================
     HTTP REQUEST
  ========================================================== */

  async function parseResponse(response) {
    const contentType =
      normaliseString(
        response.headers.get(
          "content-type"
        )
      ).toLowerCase();

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      try {
        return await response.json();
      } catch (error) {
        return {};
      }
    }

    try {
      const text =
        await response.text();

      return {
        message:
          normaliseString(text)
      };
    } catch (error) {
      return {};
    }
  }

  async function request(
    path,
    options = {}
  ) {
    const safePath =
      normaliseString(path);

    if (
      !safePath ||
      !safePath.startsWith("/")
    ) {
      throw createServiceError(
        "INVALID_REQUEST_PATH",
        "A valid payment service request path is required."
      );
    }

    const idToken =
      await getIdToken();

    const abortController =
      new AbortController();

    const timeoutId =
      global.setTimeout(
        () => {
          abortController.abort();
        },
        REQUEST_TIMEOUT_MS
      );

    try {
      const response =
        await global.fetch(
          `${BRIDGE_PAYMENT_API}${safePath}`,
          {
            method:
              normaliseString(
                options.method
              ).toUpperCase() ||
              "GET",

            headers: {
              Accept:
                "application/json",

              Authorization:
                `Bearer ${idToken}`,

              ...(
                options.body
                  ? {
                      "Content-Type":
                        "application/json"
                    }
                  : {}
              )
            },

            body:
              options.body
                ? JSON.stringify(
                    options.body
                  )
                : undefined,

            cache:
              "no-store",

            credentials:
              "omit",

            signal:
              abortController.signal
          }
        );

      const payload =
        await parseResponse(
          response
        );

      if (!response.ok) {
        throw createServiceError(
          payload.error ||
          payload.code ||
          `HTTP_${response.status}`,

          payload.message ||
          "The secure payment service request failed.",

          {
            status:
              response.status,

            path:
              safePath
          }
        );
      }

      if (
        !isObject(payload) ||
        payload.status !==
          "success"
      ) {
        throw createServiceError(
          "INVALID_PAYMENT_RESPONSE",
          "The secure payment service returned an invalid response.",
          {
            path:
              safePath
          }
        );
      }

      return payload;
    } catch (error) {
      if (
        error &&
        error.name ===
          "PaymentServiceError"
      ) {
        throw error;
      }

      if (
        error &&
        error.name ===
          "AbortError"
      ) {
        throw createServiceError(
          "PAYMENT_REQUEST_TIMEOUT",
          "The secure payment service did not respond in time."
        );
      }

      throw createServiceError(
        "PAYMENT_NETWORK_ERROR",
        "The secure payment service could not be reached.",
        {
          originalMessage:
            normaliseString(
              error?.message
            )
        }
      );
    } finally {
      global.clearTimeout(
        timeoutId
      );
    }
  }

  /* ==========================================================
     INPUT VALIDATION
  ========================================================== */

  function resolveRegistrationId(input) {
    const safeInput =
      isObject(input)
        ? input
        : {};

    const registrationId =
      normaliseString(
        safeInput.registrationId ||
        safeInput.registration_id
      );

    if (!registrationId) {
      throw createServiceError(
        "REGISTRATION_ID_REQUIRED",
        "A Bridge Programme registration identifier is required."
      );
    }

    return registrationId;
  }

  /* ==========================================================
     CREATE ORDER
  ========================================================== */

  async function initiateBridgePayment(
    input = {}
  ) {
    const registrationId =
      resolveRegistrationId(
        input
      );

    const payload =
      await request(
        "/bridge/orders",
        {
          method:
            "POST",

          body: {
            registrationId
          }
        }
      );

    if (
      !isObject(
        payload.payment
      )
    ) {
      throw createServiceError(
        "INVALID_PAYMENT_ORDER",
        "The secure payment service did not return a payment order."
      );
    }

    return freezeObject({
      ...payload.payment,

      registrationId,

      productCode:
        PRODUCT_CODE,

      sourceProgrammeCode:
        SOURCE_PROGRAMME_CODE,

      targetProgrammeCode:
        TARGET_PROGRAMME_CODE,

      reused:
        payload.reused ===
        true
    });
  }

  /* ==========================================================
     RESOLVE TRUSTED PAYMENT STATUS
  ========================================================== */

  async function resolveBridgePaymentStatus(
    input = {}
  ) {
    const registrationId =
      resolveRegistrationId(
        input
      );

    const payload =
      await request(
        `/bridge/payments/${encodeURIComponent(
          registrationId
        )}`,
        {
          method:
            "GET"
        }
      );

    if (
      !isObject(
        payload.payment
      )
    ) {
      throw createServiceError(
        "INVALID_PAYMENT_STATUS",
        "The secure payment service did not return a payment status."
      );
    }

    return freezeObject({
      ...payload.payment,

      registrationId,

      productCode:
        PRODUCT_CODE,

      sourceProgrammeCode:
        SOURCE_PROGRAMME_CODE,

      targetProgrammeCode:
        TARGET_PROGRAMME_CODE
    });
  }

  /* ==========================================================
     DIAGNOSTICS
  ========================================================== */

  function getReadiness() {
    let firebaseAvailable =
      false;

    let authAvailable =
      false;

    let authenticated =
      false;

    try {
      firebaseAvailable =
        Boolean(
          global.firebase
        );

      authAvailable =
        Boolean(
          firebaseAvailable &&
          typeof global.firebase.auth ===
            "function"
        );

      authenticated =
        Boolean(
          authAvailable &&
          global.firebase
            .auth()
            .currentUser
        );
    } catch (error) {
      authenticated =
        false;
    }

    return freezeObject({
      ready:
        firebaseAvailable &&
        authAvailable,

      firebaseAvailable,

      authAvailable,

      authenticated,

      apiConfigured:
        Boolean(
          BRIDGE_PAYMENT_API
        )
    });
  }

  function getDiagnostics() {
    return freezeObject({
      serviceName:
        SERVICE_NAME,

      serviceVersion:
        SERVICE_VERSION,

      productCode:
        PRODUCT_CODE,

      sourceProgrammeCode:
        SOURCE_PROGRAMME_CODE,

      targetProgrammeCode:
        TARGET_PROGRAMME_CODE,

      readiness:
        getReadiness()
    });
  }

  /* ==========================================================
     PUBLIC API
  ========================================================== */

  const PaymentService =
    freezeObject({
      SERVICE_NAME,
      SERVICE_VERSION,

      initiateBridgePayment,
      createBridgePayment:
        initiateBridgePayment,
      createOrder:
        initiateBridgePayment,

      resolveBridgePaymentStatus,
      getBridgePaymentStatus:
        resolveBridgePaymentStatus,
      resolvePaymentStatus:
        resolveBridgePaymentStatus,
      getPaymentStatus:
        resolveBridgePaymentStatus,

      getReadiness,
      getDiagnostics
    });

  global.PaymentService =
    PaymentService;

  global.BridgePaymentService =
    PaymentService;

  global.dispatchEvent(
    new CustomEvent(
      "payment-service:ready",
      {
        detail: {
          service:
            SERVICE_NAME,

          version:
            SERVICE_VERSION,

          readiness:
            getReadiness()
        }
      }
    )
  );

  console.info(
    `[${SERVICE_NAME}] v${SERVICE_VERSION} loaded successfully.`
  );
})(window);