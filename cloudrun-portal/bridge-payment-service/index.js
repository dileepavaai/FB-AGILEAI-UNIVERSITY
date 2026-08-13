/* ============================================================
   AGILE AI UNIVERSITY
   BRIDGE PAYMENT SERVICE

   File:
   cloudrun-portal/bridge-payment-service/index.js

   Version: 1.0.0
   Status: PRE-DEPLOYMENT
   Runtime: Node.js 20 / Cloud Run

   Purpose
   ------------------------------------------------------------
   - Authenticate the learner using Firebase ID tokens
   - Resolve the governed Bridge registration
   - Determine the authoritative payable amount server-side
   - Create a Razorpay order
   - Persist backend-owned payment state
   - Allow the learner to resolve trusted payment status

   Governance
   ------------------------------------------------------------
   - Browser-supplied amounts are never trusted
   - Browser checkout callbacks are not payment confirmation
   - Signed Razorpay webhook remains payment authority
   - Enrolment is not created by this service
============================================================ */

import crypto from "crypto";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import Razorpay from "razorpay";
import admin from "firebase-admin";

/* ============================================================
   SERVICE CONSTANTS
============================================================ */

const SERVICE_NAME =
  "aau-bridge-payment-service";

const SERVICE_VERSION =
  "1.0.0";

const FIREBASE_PROJECT_ID =
  "fb-agileai-university";

const REGISTRATION_COLLECTION =
  "bridge_programme_registrations";

const PAYMENT_COLLECTION =
  "payments";

const PRODUCT_CODE =
  "AOP_AIPA_BRIDGE";

const SOURCE_PROGRAMME_CODE =
  "AOP";

const TARGET_PROGRAMME_CODE =
  "AIPA";

const CURRENCY =
  "INR";

/*
 * Governed commercial values are expressed in rupees.
 */
const BASE_AMOUNT_RUPEES =
  7500;

const GST_RATE =
  18;

const GST_AMOUNT_RUPEES =
  1350;

const TOTAL_AMOUNT_RUPEES =
  8850;

/*
 * Razorpay expects the order amount in paise.
 */
const TOTAL_AMOUNT_PAISE =
  TOTAL_AMOUNT_RUPEES * 100;

/*
 * The introductory offer remains valid through
 * 20 August 2026 in India.
 *
 * 20 August 2026 23:59:59 IST
 * =
 * 20 August 2026 18:29:59 UTC
 */
const OFFER_EXPIRES_AT =
  "2026-08-20T18:29:59.999Z";

const ALLOWED_ORIGINS =
  new Set([
    "https://portal.agileai.university"
  ]);

/* ============================================================
   ENVIRONMENT
============================================================ */

const RAZORPAY_KEY_ID =
  String(
    process.env.RAZORPAY_KEY_ID || ""
  ).trim();

const RAZORPAY_KEY_SECRET =
  String(
    process.env.RAZORPAY_KEY_SECRET || ""
  ).trim();

/* ============================================================
   FIREBASE ADMIN
============================================================ */

if (!admin.apps.length) {
  admin.initializeApp({
    projectId:
      process.env.GOOGLE_CLOUD_PROJECT ||
      FIREBASE_PROJECT_ID
  });
}

const db =
  admin.firestore();

const serverTimestamp =
  admin.firestore.FieldValue
    .serverTimestamp;

/* ============================================================
   RAZORPAY
============================================================ */

let razorpayClient =
  null;

function getRazorpayClient() {
  if (
    !RAZORPAY_KEY_ID ||
    !RAZORPAY_KEY_SECRET
  ) {
    const error =
      new Error(
        "Razorpay credentials are unavailable."
      );

    error.code =
      "PAYMENT_CONFIGURATION_UNAVAILABLE";

    throw error;
  }

  if (!razorpayClient) {
    razorpayClient =
      new Razorpay({
        key_id:
          RAZORPAY_KEY_ID,

        key_secret:
          RAZORPAY_KEY_SECRET
      });
  }

  return razorpayClient;
}

/* ============================================================
   EXPRESS
============================================================ */

const app =
  express();

app.set(
  "trust proxy",
  1
);

app.disable(
  "x-powered-by"
);

app.use(
  express.json({
    limit: "32kb"
  })
);

/* ============================================================
   STRUCTURED LOGGING
============================================================ */

function log(
  severity,
  message,
  metadata = {}
) {
  console.log(
    JSON.stringify({
      severity,
      service:
        SERVICE_NAME,
      version:
        SERVICE_VERSION,
      message,
      ...metadata
    })
  );
}

/* ============================================================
   CORS
============================================================ */

const corsOptions = {
  origin(
    origin,
    callback
  ) {
    /*
     * Requests without Origin are permitted so Cloud Run
     * health checks and controlled server requests work.
     */
    if (
      !origin ||
      ALLOWED_ORIGINS.has(
        origin
      )
    ) {
      callback(
        null,
        true
      );

      return;
    }

    const error =
      new Error(
        "Origin not allowed."
      );

    error.code =
      "ORIGIN_NOT_ALLOWED";

    callback(
      error
    );
  },

  methods: [
    "GET",
    "POST",
    "OPTIONS"
  ],

  allowedHeaders: [
    "Authorization",
    "Content-Type"
  ],

  maxAge:
    3600
};

app.use(
  cors(
    corsOptions
  )
);

app.options(
  "*",
  cors(
    corsOptions
  )
);

/* ============================================================
   RATE LIMITING
============================================================ */

const paymentLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max:
      30,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    handler(
      req,
      res
    ) {
      return res
        .status(429)
        .json({
          status:
            "error",

          error:
            "RATE_LIMIT_EXCEEDED"
        });
    }
  });

/* ============================================================
   HELPERS
============================================================ */

function normalizeString(
  value
) {
  return String(
    value ?? ""
  ).trim();
}

function normalizeEmail(
  value
) {
  return normalizeString(
    value
  ).toLowerCase();
}

function normalizeProgrammeCode(
  value
) {
  return normalizeString(
    value
  ).toUpperCase();
}

function isOfferActive() {
  return (
    Date.now() <=
    Date.parse(
      OFFER_EXPIRES_AT
    )
  );
}

function buildExpectedRegistrationId(
  learnerUid
) {
  return [
    learnerUid,
    SOURCE_PROGRAMME_CODE,
    TARGET_PROGRAMME_CODE
  ].join("_");
}

function buildPaymentDocumentId(
  registrationId
) {
  return [
    "BRIDGE",
    registrationId
  ].join("_");
}

function buildReceipt(
  registrationId
) {
  const digest =
    crypto
      .createHash(
        "sha256"
      )
      .update(
        registrationId
      )
      .digest(
        "hex"
      )
      .slice(
        0,
        24
      );

  return `AAU_BR_${digest}`;
}

function normalizePaymentStatus(
  paymentData
) {
  const status =
    normalizeString(
      paymentData
        ?.payment_status
    ).toUpperCase();

  if (
    status === "PAID" ||
    status === "CAPTURED" ||
    status === "CONFIRMED"
  ) {
    return "CONFIRMED";
  }

  if (
    status === "FAILED"
  ) {
    return "FAILED";
  }

  if (
    status === "CANCELLED"
  ) {
    return "CANCELLED";
  }

  if (
    status === "REFUNDED" ||
    status === "PARTIALLY_REFUNDED"
  ) {
    return status;
  }

  if (
    status === "ORDER_CREATED" ||
    status === "PENDING" ||
    status === "AUTHORIZED" ||
    status === "ORDER_CREATING"
  ) {
    return "PROCESSING";
  }

  return "NOT_INITIATED";
}

function createPublicPaymentView(
  paymentDocumentId,
  paymentData
) {
  return {
    paymentId:
      paymentDocumentId,

    status:
      normalizePaymentStatus(
        paymentData
      ),

    provider:
      "razorpay",

    providerOrderId:
      normalizeString(
        paymentData
          .gateway_order_id
      ),

    registrationId:
      normalizeString(
        paymentData
          .registration_id
      ),

    learnerUid:
      normalizeString(
        paymentData
          .learner_uid
      ),

    productCode:
      PRODUCT_CODE,

    sourceProgrammeCode:
      SOURCE_PROGRAMME_CODE,

    targetProgrammeCode:
      TARGET_PROGRAMME_CODE,

    currency:
      CURRENCY,

    baseAmount:
      BASE_AMOUNT_RUPEES,

    gstRate:
      GST_RATE,

    gstAmount:
      GST_AMOUNT_RUPEES,

    taxAmount:
      GST_AMOUNT_RUPEES,

    totalAmount:
      TOTAL_AMOUNT_RUPEES,

    gatewayAmount:
      TOTAL_AMOUNT_PAISE,

    keyId:
      RAZORPAY_KEY_ID,

    offerExpiresAt:
      OFFER_EXPIRES_AT
  };
}

function sendError(
  res,
  statusCode,
  errorCode,
  message
) {
  return res
    .status(
      statusCode
    )
    .json({
      status:
        "error",

      error:
        errorCode,

      message
    });
}

/* ============================================================
   AUTHENTICATION
============================================================ */

async function requireAuth(
  req,
  res,
  next
) {
  try {
    const authorization =
      normalizeString(
        req.headers
          .authorization
      );

    if (
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return sendError(
        res,
        401,
        "AUTHENTICATION_REQUIRED",
        "Authentication is required."
      );
    }

    const idToken =
      authorization
        .slice(
          7
        )
        .trim();

    if (!idToken) {
      return sendError(
        res,
        401,
        "AUTHENTICATION_REQUIRED",
        "Authentication is required."
      );
    }

    const decodedToken =
      await admin
        .auth()
        .verifyIdToken(
          idToken,
          true
        );

    req.user = {
      uid:
        normalizeString(
          decodedToken.uid
        ),

      email:
        normalizeEmail(
          decodedToken.email
        )
    };

    return next();
  } catch (error) {
    log(
      "WARNING",
      "Firebase authentication failed.",
      {
        errorCode:
          error?.code ||
          "UNKNOWN"
      }
    );

    return sendError(
      res,
      401,
      "INVALID_AUTHENTICATION",
      "The authentication session is invalid or expired."
    );
  }
}

/* ============================================================
   REGISTRATION GOVERNANCE
============================================================ */

async function resolveGovernedRegistration(
  registrationId,
  authenticatedUser
) {
  const normalizedRegistrationId =
    normalizeString(
      registrationId
    );

  const expectedRegistrationId =
    buildExpectedRegistrationId(
      authenticatedUser.uid
    );

  if (
    !normalizedRegistrationId ||
    normalizedRegistrationId !==
      expectedRegistrationId
  ) {
    const error =
      new Error(
        "The registration identifier is invalid."
      );

    error.code =
      "INVALID_REGISTRATION";

    throw error;
  }

  const registrationReference =
    db
      .collection(
        REGISTRATION_COLLECTION
      )
      .doc(
        normalizedRegistrationId
      );

  const registrationSnapshot =
    await registrationReference
      .get();

  if (
    !registrationSnapshot.exists
  ) {
    const error =
      new Error(
        "The Bridge Programme registration was not found."
      );

    error.code =
      "REGISTRATION_NOT_FOUND";

    throw error;
  }

  const registration =
    registrationSnapshot.data() ||
    {};

  if (
    normalizeString(
      registration
        .learner_uid
    ) !==
      authenticatedUser.uid
  ) {
    const error =
      new Error(
        "The registration does not belong to the authenticated learner."
      );

    error.code =
      "REGISTRATION_OWNERSHIP_MISMATCH";

    throw error;
  }

  const sourceProgrammeCode =
    normalizeProgrammeCode(
      registration
        .source_program_code
    );

  const targetProgrammeCode =
    normalizeProgrammeCode(
      registration
        .target_program_code
    );

  if (
    sourceProgrammeCode !==
      SOURCE_PROGRAMME_CODE ||
    targetProgrammeCode !==
      TARGET_PROGRAMME_CODE
  ) {
    const error =
      new Error(
        "The registration is not an AOP to AIPA Bridge registration."
      );

    error.code =
      "INVALID_BRIDGE_PATHWAY";

    throw error;
  }

  const registrationStatus =
    normalizeString(
      registration
        .registration_status
    ).toUpperCase();

  const paymentStatus =
    normalizeString(
      registration
        .payment_status
    ).toUpperCase();

  const blockedRegistrationStatuses =
    new Set([
      "CANCELLED",
      "EXPIRED",
      "FAILED",
      "BLOCKED"
    ]);

  if (
    blockedRegistrationStatuses.has(
      registrationStatus
    )
  ) {
    const error =
      new Error(
        "This registration is not currently payable."
      );

    error.code =
      "REGISTRATION_NOT_PAYABLE";

    throw error;
  }

  if (
    paymentStatus === "PAID" ||
    paymentStatus === "CAPTURED" ||
    paymentStatus === "CONFIRMED"
  ) {
    const error =
      new Error(
        "Payment has already been confirmed for this registration."
      );

    error.code =
      "PAYMENT_ALREADY_CONFIRMED";

    throw error;
  }

  return {
    registrationReference,
    registration
  };
}

/* ============================================================
   HEALTH ENDPOINTS
============================================================ */

app.get(
  "/",
  (req, res) => {
    return res
      .status(200)
      .json({
        service:
          SERVICE_NAME,

        version:
          SERVICE_VERSION,

        status:
          "ok"
      });
  }
);

app.get(
  "/health",
  (req, res) => {
    return res
      .status(200)
      .json({
        service:
          SERVICE_NAME,

        version:
          SERVICE_VERSION,

        status:
          "ok",

        firebaseConfigured:
          true,

        razorpayConfigured:
          Boolean(
            RAZORPAY_KEY_ID &&
            RAZORPAY_KEY_SECRET
          )
      });
  }
);

app.get(
  "/ready",
  async (req, res) => {
    try {
      await db
        .collection(
          "_health"
        )
        .limit(
          1
        )
        .get();

      return res
        .status(200)
        .json({
          ready:
            true,

          firestore:
            "connected",

          razorpayConfigured:
            Boolean(
              RAZORPAY_KEY_ID &&
              RAZORPAY_KEY_SECRET
            )
        });
    } catch (error) {
      log(
        "ERROR",
        "Readiness check failed.",
        {
          error:
            error.message
        }
      );

      return res
        .status(503)
        .json({
          ready:
            false,

          firestore:
            "unavailable"
        });
    }
  }
);

/* ============================================================
   CREATE BRIDGE PAYMENT ORDER
============================================================ */

app.post(
  "/bridge/orders",
  paymentLimiter,
  requireAuth,
  async (req, res) => {
    const registrationId =
      normalizeString(
        req.body
          ?.registration_id ||
        req.body
          ?.registrationId
      );

    let paymentReference =
      null;

    let registrationReference =
      null;

    let reservationToken =
      "";

    try {
      if (
        !registrationId
      ) {
        return sendError(
          res,
          400,
          "REGISTRATION_ID_REQUIRED",
          "A Bridge Programme registration identifier is required."
        );
      }

      if (
        !isOfferActive()
      ) {
        return sendError(
          res,
          409,
          "OFFER_EXPIRED",
          "The introductory Bridge Programme offer has expired."
        );
      }

      const governedRegistration =
        await resolveGovernedRegistration(
          registrationId,
          req.user
        );

      registrationReference =
        governedRegistration
          .registrationReference;

      const registration =
        governedRegistration
          .registration;

      const paymentDocumentId =
        buildPaymentDocumentId(
          registrationId
        );

      paymentReference =
        db
          .collection(
            PAYMENT_COLLECTION
          )
          .doc(
            paymentDocumentId
          );

      reservationToken =
        crypto
          .randomUUID();

      const reservationResult =
        await db.runTransaction(
          async (
            transaction
          ) => {
            const paymentSnapshot =
              await transaction.get(
                paymentReference
              );

            if (
              paymentSnapshot.exists
            ) {
              const existingPayment =
                paymentSnapshot.data() ||
                {};

              const existingOwner =
                normalizeString(
                  existingPayment
                    .learner_uid
                );

              if (
                existingOwner &&
                existingOwner !==
                  req.user.uid
              ) {
                const error =
                  new Error(
                    "Payment ownership validation failed."
                  );

                error.code =
                  "PAYMENT_OWNERSHIP_MISMATCH";

                throw error;
              }

              const existingOrderId =
                normalizeString(
                  existingPayment
                    .gateway_order_id
                );

              const existingStatus =
                normalizeString(
                  existingPayment
                    .payment_status
                ).toUpperCase();

              if (
                existingOrderId &&
                (
                  existingStatus ===
                    "ORDER_CREATED" ||
                  existingStatus ===
                    "PENDING" ||
                  existingStatus ===
                    "AUTHORIZED" ||
                  existingStatus ===
                    "PAID"
                )
              ) {
                return {
                  reuse:
                    true,

                  paymentData:
                    existingPayment
                };
              }

              if (
                existingStatus ===
                  "ORDER_CREATING"
              ) {
                const error =
                  new Error(
                    "A payment order is already being created."
                  );

                error.code =
                  "ORDER_CREATION_IN_PROGRESS";

                throw error;
              }
            }

            const timestamp =
              serverTimestamp();

            const paymentReservation = {
              payment_id:
                paymentDocumentId,

              product_code:
                PRODUCT_CODE,

              registration_id:
                registrationId,

              learner_uid:
                req.user.uid,

              learner_email:
                req.user.email ||
                normalizeEmail(
                  registration
                    .learner_email
                ),

              credential_id:
                normalizeString(
                  registration
                    .credential_id
                ),

              source_programme_code:
                SOURCE_PROGRAMME_CODE,

              target_programme_code:
                TARGET_PROGRAMME_CODE,

              offer_code:
                normalizeString(
                  registration
                    .offer_code
                ),

              offer_expires_at:
                OFFER_EXPIRES_AT,

              currency:
                CURRENCY,

              base_amount:
                BASE_AMOUNT_RUPEES,

              gst_rate:
                GST_RATE,

              gst_amount:
                GST_AMOUNT_RUPEES,

              tax_amount:
                GST_AMOUNT_RUPEES,

              total_amount:
                TOTAL_AMOUNT_RUPEES,

              gateway_amount:
                TOTAL_AMOUNT_PAISE,

              gateway:
                "razorpay",

              gateway_order_id:
                null,

              gateway_payment_id:
                null,

              payment_status:
                "ORDER_CREATING",

              gateway_status:
                "created_pending",

              reservation_token:
                reservationToken,

              source:
                "BRIDGE_PAYMENT_SERVICE",

              order_attempt_count:
                admin.firestore
                  .FieldValue
                  .increment(
                    1
                  ),

              created_at:
                paymentSnapshot.exists
                  ? (
                      paymentSnapshot
                        .data()
                        ?.created_at ||
                      timestamp
                    )
                  : timestamp,

              updated_at:
                timestamp,

              created_by:
                "system",

              updated_by:
                "system",

              schema_version:
                "1.0.0",

              module_version:
                SERVICE_VERSION
            };

            transaction.set(
              paymentReference,
              paymentReservation,
              {
                merge:
                  true
              }
            );

            return {
              reuse:
                false
            };
          }
        );

      if (
        reservationResult.reuse
      ) {
        return res
          .status(200)
          .json({
            status:
              "success",

            reused:
              true,

            payment:
              createPublicPaymentView(
                paymentDocumentId,
                reservationResult
                  .paymentData
              )
          });
      }

      const razorpay =
        getRazorpayClient();

      const razorpayOrder =
        await razorpay
          .orders
          .create({
            amount:
              TOTAL_AMOUNT_PAISE,

            currency:
              CURRENCY,

            receipt:
              buildReceipt(
                registrationId
              ),

            notes: {
              product_code:
                PRODUCT_CODE,

              registration_id:
                registrationId,

              learner_uid:
                req.user.uid,

              source_programme_code:
                SOURCE_PROGRAMME_CODE,

              target_programme_code:
                TARGET_PROGRAMME_CODE,

              offer_code:
                normalizeString(
                  registration
                    .offer_code
                )
            }
          });

      if (
        !razorpayOrder?.id
      ) {
        const error =
          new Error(
            "Razorpay did not return an order identifier."
          );

        error.code =
          "INVALID_GATEWAY_RESPONSE";

        throw error;
      }

      const finalizedPayment =
        await db.runTransaction(
          async (
            transaction
          ) => {
            const paymentSnapshot =
              await transaction.get(
                paymentReference
              );

            if (
              !paymentSnapshot.exists
            ) {
              const error =
                new Error(
                  "The payment reservation was not found."
                );

              error.code =
                "PAYMENT_RESERVATION_MISSING";

              throw error;
            }

            const paymentData =
              paymentSnapshot.data() ||
              {};

            if (
              paymentData
                .reservation_token !==
              reservationToken
            ) {
              const error =
                new Error(
                  "The payment reservation changed before finalization."
                );

              error.code =
                "PAYMENT_RESERVATION_CHANGED";

              throw error;
            }

            const timestamp =
              serverTimestamp();

            transaction.update(
              paymentReference,
              {
                gateway_order_id:
                  razorpayOrder.id,

                gateway_status:
                  normalizeString(
                    razorpayOrder.status
                  ) ||
                  "created",

                payment_status:
                  "ORDER_CREATED",

                reservation_token:
                  null,

                order_created_at:
                  timestamp,

                updated_at:
                  timestamp,

                updated_by:
                  "system"
              }
            );

            transaction.update(
              registrationReference,
              {
                registration_status:
                  "PAYMENT_IN_PROGRESS",

                payment_status:
                  "ORDER_CREATED",

                payment_id:
                  paymentDocumentId,

                gateway:
                  "razorpay",

                gateway_order_id:
                  razorpayOrder.id,

                updated_at:
                  new Date()
                    .toISOString(),

                updated_by:
                  "system"
              }
            );

            return {
              ...paymentData,

              gateway_order_id:
                razorpayOrder.id,

              gateway_status:
                normalizeString(
                  razorpayOrder.status
                ) ||
                "created",

              payment_status:
                "ORDER_CREATED"
            };
          }
        );

      log(
        "INFO",
        "Bridge payment order created.",
        {
          registrationId,
          paymentDocumentId,
          gatewayOrderId:
            razorpayOrder.id,
          learnerUid:
            req.user.uid
        }
      );

      return res
        .status(201)
        .json({
          status:
            "success",

          reused:
            false,

          payment:
            createPublicPaymentView(
              paymentDocumentId,
              finalizedPayment
            )
        });
    } catch (error) {
      const errorCode =
        error?.code ||
        "ORDER_CREATION_FAILED";

      log(
        "ERROR",
        "Bridge payment order creation failed.",
        {
          registrationId:
            registrationId ||
            null,

          learnerUid:
            req.user?.uid ||
            null,

          errorCode,

          error:
            error.message
        }
      );

      /*
       * If the external order creation fails after a reservation
       * was created, make the payment retryable.
       */
      if (
        paymentReference &&
        reservationToken
      ) {
        try {
          await db.runTransaction(
            async (
              transaction
            ) => {
              const snapshot =
                await transaction.get(
                  paymentReference
                );

              if (
                !snapshot.exists
              ) {
                return;
              }

              const data =
                snapshot.data() ||
                {};

              if (
                data
                  .reservation_token !==
                reservationToken
              ) {
                return;
              }

              transaction.update(
                paymentReference,
                {
                  payment_status:
                    "FAILED",

                  gateway_status:
                    "order_creation_failed",

                  reservation_token:
                    null,

                  failure_code:
                    errorCode,

                  failure_reason:
                    "Unable to create the payment order.",

                  failed_at:
                    serverTimestamp(),

                  updated_at:
                    serverTimestamp(),

                  updated_by:
                    "system"
                }
              );
            }
          );
        } catch (
          recoveryError
        ) {
          log(
            "ERROR",
            "Unable to recover the failed payment reservation.",
            {
              registrationId:
                registrationId ||
                null,

              recoveryError:
                recoveryError.message
            }
          );
        }
      }

      const responseMap = {
        INVALID_REGISTRATION:
          400,

        REGISTRATION_NOT_FOUND:
          404,

        REGISTRATION_OWNERSHIP_MISMATCH:
          403,

        INVALID_BRIDGE_PATHWAY:
          409,

        REGISTRATION_NOT_PAYABLE:
          409,

        PAYMENT_ALREADY_CONFIRMED:
          409,

        PAYMENT_OWNERSHIP_MISMATCH:
          403,

        ORDER_CREATION_IN_PROGRESS:
          409,

        PAYMENT_CONFIGURATION_UNAVAILABLE:
          503
      };

      return sendError(
        res,
        responseMap[
          errorCode
        ] ||
        500,
        errorCode,
        errorCode ===
          "PAYMENT_CONFIGURATION_UNAVAILABLE"
          ? "Secure payment is temporarily unavailable."
          : "Unable to create the Bridge Programme payment order."
      );
    }
  }
);

/* ============================================================
   RESOLVE BRIDGE PAYMENT STATUS
============================================================ */

app.get(
  "/bridge/payments/:registrationId",
  paymentLimiter,
  requireAuth,
  async (req, res) => {
    try {
      const registrationId =
        normalizeString(
          req.params
            .registrationId
        );

      await resolveGovernedRegistration(
        registrationId,
        req.user
      );

      const paymentDocumentId =
        buildPaymentDocumentId(
          registrationId
        );

      const paymentSnapshot =
        await db
          .collection(
            PAYMENT_COLLECTION
          )
          .doc(
            paymentDocumentId
          )
          .get();

      if (
        !paymentSnapshot.exists
      ) {
        return res
          .status(200)
          .json({
            status:
              "success",

            payment: {
              paymentId:
                paymentDocumentId,

              registrationId,

              learnerUid:
                req.user.uid,

              provider:
                "razorpay",

              status:
                "NOT_INITIATED"
            }
          });
      }

      const paymentData =
        paymentSnapshot.data() ||
        {};

      if (
        normalizeString(
          paymentData
            .learner_uid
        ) !==
        req.user.uid
      ) {
        return sendError(
          res,
          403,
          "PAYMENT_OWNERSHIP_MISMATCH",
          "The payment record does not belong to the authenticated learner."
        );
      }

      return res
        .status(200)
        .json({
          status:
            "success",

          payment:
            createPublicPaymentView(
              paymentDocumentId,
              paymentData
            )
        });
    } catch (error) {
      const errorCode =
        error?.code ||
        "PAYMENT_STATUS_RESOLUTION_FAILED";

      log(
        "ERROR",
        "Bridge payment status resolution failed.",
        {
          learnerUid:
            req.user?.uid ||
            null,

          errorCode,

          error:
            error.message
        }
      );

      const responseMap = {
        INVALID_REGISTRATION:
          400,

        REGISTRATION_NOT_FOUND:
          404,

        REGISTRATION_OWNERSHIP_MISMATCH:
          403,

        INVALID_BRIDGE_PATHWAY:
          409,

        REGISTRATION_NOT_PAYABLE:
          409,

        PAYMENT_ALREADY_CONFIRMED:
          409
      };

      /*
       * Payment status must remain readable after confirmation.
       */
      if (
        errorCode ===
        "PAYMENT_ALREADY_CONFIRMED"
      ) {
        const registrationId =
          normalizeString(
            req.params
              .registrationId
          );

        const paymentDocumentId =
          buildPaymentDocumentId(
            registrationId
          );

        const paymentSnapshot =
          await db
            .collection(
              PAYMENT_COLLECTION
            )
            .doc(
              paymentDocumentId
            )
            .get();

        if (
          paymentSnapshot.exists &&
          normalizeString(
            paymentSnapshot
              .data()
              ?.learner_uid
          ) ===
            req.user.uid
        ) {
          return res
            .status(200)
            .json({
              status:
                "success",

              payment:
                createPublicPaymentView(
                  paymentDocumentId,
                  paymentSnapshot.data()
                )
            });
        }
      }

      return sendError(
        res,
        responseMap[
          errorCode
        ] ||
        500,
        errorCode,
        "Unable to resolve the Bridge Programme payment status."
      );
    }
  }
);

/* ============================================================
   NOT FOUND
============================================================ */

app.use(
  (req, res) => {
    return res
      .status(404)
      .json({
        status:
          "error",

        error:
          "NOT_FOUND",

        path:
          req.originalUrl
      });
  }
);

/* ============================================================
   EXPRESS ERROR HANDLER
============================================================ */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error?.code ===
      "ORIGIN_NOT_ALLOWED"
    ) {
      return sendError(
        res,
        403,
        "ORIGIN_NOT_ALLOWED",
        "The request origin is not permitted."
      );
    }

    log(
      "ERROR",
      "Unhandled Bridge payment service error.",
      {
        error:
          error?.message ||
          "Unknown error"
      }
    );

    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "The Bridge payment service encountered an unexpected error."
    );
  }
);

/* ============================================================
   SERVER
============================================================ */

const PORT =
  process.env.PORT ||
  8080;

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    log(
      "INFO",
      "Bridge payment service started.",
      {
        port:
          PORT,

        razorpayConfigured:
          Boolean(
            RAZORPAY_KEY_ID &&
            RAZORPAY_KEY_SECRET
          )
      }
    );
  }
);