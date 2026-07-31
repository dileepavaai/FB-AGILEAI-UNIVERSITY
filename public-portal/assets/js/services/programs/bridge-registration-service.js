/* ============================================================
   AGILE AI UNIVERSITY
   BRIDGE REGISTRATION SERVICE

   File:
   public-portal/assets/js/services/programs/
   bridge-registration-service.js

   Version: 1.0.0
   Status: ACTIVE
   Domain: Programme Registration
   Runtime: Browser Global

   Purpose
   ------------------------------------------------------------
   Provides the governed client-side registration service for
   Agile AI University Bridge Programmes.

   Responsibilities
   ------------------------------------------------------------
   - Define registration lifecycle constants
   - Validate registration input
   - Generate deterministic registration IDs
   - Resolve an existing learner registration
   - Create a new registration safely
   - Prevent duplicate registrations
   - Return immutable registration ViewModels

   Non-Responsibilities
   ------------------------------------------------------------
   This service does not:

   - Determine academic eligibility
   - Determine commercial eligibility
   - Verify payment
   - Create enrolment
   - Activate learning access
   - Modify trusted commercial states

   Architecture Chain
   ------------------------------------------------------------
   Identity
      ↓
   Credential Ownership
      ↓
   Academic Eligibility
      ↓
   Commercial Eligibility
      ↓
   BridgeRegistrationService
      ↓
   Payment
      ↓
   Enrolment
      ↓
   Learning Access

   Change History
   ------------------------------------------------------------
   1.0.0
   - Initial governed implementation
   - Added deterministic registration IDs
   - Added lifecycle constants
   - Added registration validation
   - Added immutable ViewModels
   - Added Firestore registration resolution
   - Added transactional create-only registration
   - Added duplicate-safe idempotent retries
   - Added readiness diagnostics
============================================================ */

(function initialiseBridgeRegistrationService(global) {
  "use strict";

  const SERVICE_NAME = "BridgeRegistrationService";
  const SERVICE_VERSION = "1.0.0";

  const COLLECTION_NAME =
    "bridge_programme_registrations";

  /* ==========================================================
     REGISTRATION STATUS
  ========================================================== */

  const REGISTRATION_STATUS = Object.freeze({
    PAYMENT_PENDING: "PAYMENT_PENDING",

    PAYMENT_IN_PROGRESS:
      "PAYMENT_IN_PROGRESS",

    PAYMENT_CONFIRMED:
      "PAYMENT_CONFIRMED",

    REGISTERED: "REGISTERED",

    ENROLMENT_PENDING:
      "ENROLMENT_PENDING",

    ENROLLED: "ENROLLED",

    FAILED: "FAILED",

    EXPIRED: "EXPIRED",

    CANCELLED: "CANCELLED"
  });

  /* ==========================================================
     PAYMENT STATUS
  ========================================================== */

  const PAYMENT_STATUS = Object.freeze({
    NOT_INITIATED: "NOT_INITIATED",

    ORDER_CREATED: "ORDER_CREATED",

    PENDING: "PENDING",

    AUTHORIZED: "AUTHORIZED",

    PAID: "PAID",

    FAILED: "FAILED",

    CANCELLED: "CANCELLED",

    REFUNDED: "REFUNDED",

    PARTIALLY_REFUNDED:
      "PARTIALLY_REFUNDED"
  });

  /* ==========================================================
     ENROLMENT STATUS
  ========================================================== */

  const ENROLMENT_STATUS = Object.freeze({
    NOT_CREATED: "NOT_CREATED",

    PENDING: "PENDING",

    ACTIVE: "ACTIVE",

    COMPLETED: "COMPLETED",

    FAILED: "FAILED",

    CANCELLED: "CANCELLED",

    WITHDRAWN: "WITHDRAWN"
  });

  /* ==========================================================
     REGISTRATION SOURCE
  ========================================================== */

  const REGISTRATION_SOURCE = Object.freeze({
    STUDENT_PORTAL: "STUDENT_PORTAL",

    ADMIN_PORTAL: "ADMIN_PORTAL",

    BACKEND: "BACKEND"
  });

  /* ==========================================================
     ERROR CODES
  ========================================================== */

  const ERROR_CODE = Object.freeze({
    INVALID_INPUT:
      "BRIDGE_REGISTRATION_INVALID_INPUT",

    AUTH_REQUIRED:
      "BRIDGE_REGISTRATION_AUTH_REQUIRED",

    FIRESTORE_UNAVAILABLE:
      "BRIDGE_REGISTRATION_FIRESTORE_UNAVAILABLE",

    REGISTRATION_NOT_FOUND:
      "BRIDGE_REGISTRATION_NOT_FOUND",

    REGISTRATION_CREATE_FAILED:
      "BRIDGE_REGISTRATION_CREATE_FAILED",

    REGISTRATION_READ_FAILED:
      "BRIDGE_REGISTRATION_READ_FAILED",

    REGISTRATION_CONFLICT:
      "BRIDGE_REGISTRATION_CONFLICT",

    INTERNAL_ERROR:
      "BRIDGE_REGISTRATION_INTERNAL_ERROR"
  });

  /* ==========================================================
     TERMINAL AND RETRYABLE STATES
  ========================================================== */

  const TERMINAL_REGISTRATION_STATUSES =
    Object.freeze([
      REGISTRATION_STATUS.ENROLLED,

      REGISTRATION_STATUS.EXPIRED,

      REGISTRATION_STATUS.CANCELLED
    ]);

  const RETRYABLE_REGISTRATION_STATUSES =
    Object.freeze([
      REGISTRATION_STATUS.PAYMENT_PENDING,

      REGISTRATION_STATUS.PAYMENT_IN_PROGRESS,

      REGISTRATION_STATUS.FAILED
    ]);

  /* ==========================================================
     INTERNAL UTILITIES
  ========================================================== */

  function createServiceError(
    code,
    message,
    details
  ) {
    const error = new Error(message);

    error.name =
      "BridgeRegistrationServiceError";

    error.code = code;

    error.details = details || null;

    error.service = SERVICE_NAME;

    error.serviceVersion =
      SERVICE_VERSION;

    return error;
  }

  function isNonEmptyString(value) {
    return (
      typeof value === "string" &&
      value.trim().length > 0
    );
  }

  function normaliseString(value) {
    return isNonEmptyString(value)
      ? value.trim()
      : "";
  }

  function normaliseProgrammeCode(value) {
    return normaliseString(
      value
    ).toUpperCase();
  }

  function normaliseEmail(value) {
    return normaliseString(
      value
    ).toLowerCase();
  }

  function normaliseCredentialId(value) {
    return normaliseString(
      value
    ).toUpperCase();
  }

  function freezeObject(value) {
    if (
      !value ||
      typeof value !== "object"
    ) {
      return value;
    }

    return Object.freeze({
      ...value
    });
  }

  function sanitiseIdentifierPart(value) {
    return normaliseString(value)
      .replace(
        /[^A-Za-z0-9_-]/g,
        "_"
      )
      .replace(
        /_+/g,
        "_"
      )
      .replace(
        /^_+|_+$/g,
        ""
      );
  }

  function requireNonEmptyString(
    value,
    fieldName
  ) {
    if (!isNonEmptyString(value)) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,

        `${fieldName} is required.`,

        {
          field: fieldName,

          receivedValue: value
        }
      );
    }

    return value.trim();
  }

  function requireFiniteNonNegativeNumber(
    value,
    fieldName
  ) {
    const numericValue =
      Number(value);

    if (
      !Number.isFinite(
        numericValue
      ) ||
      numericValue < 0
    ) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,

        `${fieldName} must be a valid non-negative number.`,

        {
          field: fieldName,

          receivedValue: value
        }
      );
    }

    return numericValue;
  }

  function isTerminalRegistrationStatus(
    status
  ) {
    return TERMINAL_REGISTRATION_STATUSES
      .includes(status);
  }

  function isRetryableRegistrationStatus(
    status
  ) {
    return RETRYABLE_REGISTRATION_STATUSES
      .includes(status);
  }
    /* ==========================================================
     DETERMINISTIC REGISTRATION ID
  ========================================================== */

  function buildRegistrationId(input) {
    const safeInput = input || {};

    const learnerUid = sanitiseIdentifierPart(
      requireNonEmptyString(
        safeInput.learnerUid,
        "learnerUid"
      )
    );

    const sourceProgrammeCode =
      sanitiseIdentifierPart(
        normaliseProgrammeCode(
          requireNonEmptyString(
            safeInput.sourceProgrammeCode,
            "sourceProgrammeCode"
          )
        )
      );

    const targetProgrammeCode =
      sanitiseIdentifierPart(
        normaliseProgrammeCode(
          requireNonEmptyString(
            safeInput.targetProgrammeCode,
            "targetProgrammeCode"
          )
        )
      );

    if (
      !learnerUid ||
      !sourceProgrammeCode ||
      !targetProgrammeCode
    ) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,
        "Unable to generate a valid registration ID.",
        {
          learnerUid,
          sourceProgrammeCode,
          targetProgrammeCode
        }
      );
    }

    if (
      sourceProgrammeCode ===
      targetProgrammeCode
    ) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,
        "Source and target programme codes must be different.",
        {
          sourceProgrammeCode,
          targetProgrammeCode
        }
      );
    }

    return [
      learnerUid,
      sourceProgrammeCode,
      targetProgrammeCode
    ].join("_");
  }

  /* ==========================================================
     REGISTRATION IDENTITY INPUT VALIDATION
  ========================================================== */

    function validateRegistrationIdentityInput(
        input
    ) {
    if (
      !input ||
      typeof input !== "object"
    ) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,
        "Registration identity input must be an object."
      );
    }

    const learnerUid =
      requireNonEmptyString(
        input.learnerUid,
        "learnerUid"
      );

    const sourceProgrammeCode =
      normaliseProgrammeCode(
        requireNonEmptyString(
          input.sourceProgrammeCode,
          "sourceProgrammeCode"
        )
      );

    const targetProgrammeCode =
      normaliseProgrammeCode(
        requireNonEmptyString(
          input.targetProgrammeCode,
          "targetProgrammeCode"
        )
      );

    if (
      sourceProgrammeCode ===
      targetProgrammeCode
    ) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,
        "Source and target programmes cannot be the same.",
        {
          sourceProgrammeCode,
          targetProgrammeCode
        }
      );
    }

    return freezeObject({
      registrationId:
        buildRegistrationId({
          learnerUid,
          sourceProgrammeCode,
          targetProgrammeCode
        }),

      learnerUid,

      learnerEmail:
        normaliseEmail(
          input.learnerEmail
        ),

      sourceProgrammeCode,

      targetProgrammeCode
    });
  }

  /* ==========================================================
     REGISTRATION INPUT VALIDATION
  ========================================================== */

  function validateRegistrationInput(
    input
  ) {
    if (
      !input ||
      typeof input !== "object"
    ) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,
        "Registration input must be an object."
      );
    }

    const learnerUid =
      requireNonEmptyString(
        input.learnerUid,
        "learnerUid"
      );

    const sourceProgrammeCode =
      normaliseProgrammeCode(
        requireNonEmptyString(
          input.sourceProgrammeCode,
          "sourceProgrammeCode"
        )
      );

    const targetProgrammeCode =
      normaliseProgrammeCode(
        requireNonEmptyString(
          input.targetProgrammeCode,
          "targetProgrammeCode"
        )
      );

    if (
      sourceProgrammeCode ===
      targetProgrammeCode
    ) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,
        "Source and target programmes cannot be the same.",
        {
          sourceProgrammeCode,
          targetProgrammeCode
        }
      );
    }

    const learnerEmail =
      normaliseEmail(
        input.learnerEmail
      );

    const credentialId =
      normaliseCredentialId(
        input.credentialId
      );

    const baseAmount =
      requireFiniteNonNegativeNumber(
        input.baseAmount,
        "baseAmount"
      );

    const gstRate =
      requireFiniteNonNegativeNumber(
        input.gstRate,
        "gstRate"
      );

    const gstAmount =
      requireFiniteNonNegativeNumber(
        input.gstAmount,
        "gstAmount"
      );

    const totalAmount =
      requireFiniteNonNegativeNumber(
        input.totalAmount,
        "totalAmount"
      );

    if (
      totalAmount <
      baseAmount
    ) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,
        "Total amount cannot be lower than the base amount.",
        {
          baseAmount,
          gstAmount,
          totalAmount
        }
      );
    }

    const calculatedTotal =
      Number(
        (
          baseAmount +
          gstAmount
        ).toFixed(2)
      );

    const suppliedTotal =
      Number(
        totalAmount.toFixed(2)
      );

    if (
      calculatedTotal !==
      suppliedTotal
    ) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,
        "The supplied total amount does not match the base amount and GST amount.",
        {
          baseAmount,
          gstAmount,
          expectedTotalAmount:
            calculatedTotal,
          suppliedTotalAmount:
            suppliedTotal
        }
      );
    }

    const registrationId =
      buildRegistrationId({
        learnerUid,
        sourceProgrammeCode,
        targetProgrammeCode
      });

    return freezeObject({
      registrationId,

      learnerUid,

      learnerEmail,

      credentialId,

      sourceProgrammeCode,

      targetProgrammeCode,

      relationshipCode:
        normaliseString(
          input.relationshipCode
        ).toUpperCase(),

      relationshipType:
        normaliseString(
          input.relationshipType
        ).toUpperCase(),

      offerCode:
        normaliseString(
          input.offerCode
        ).toUpperCase(),

      currency:
        normaliseString(
          input.currency ||
            "INR"
        ).toUpperCase(),

      baseAmount,

      gstRate,

      gstAmount,

      totalAmount,

      offerExpiresAt:
        input.offerExpiresAt ||
        null,

      acknowledgementAccepted:
        input.acknowledgementAccepted ===
        true,

      source:
        input.source ||
        REGISTRATION_SOURCE.STUDENT_PORTAL
    });
  }
    /* ==========================================================
     FIREBASE HELPERS
  ========================================================== */

  function getFirestore() {
    if (
      global.firebase &&
      typeof global.firebase.firestore ===
        "function"
    ) {
      return global.firebase.firestore();
    }

    throw createServiceError(
      ERROR_CODE.FIRESTORE_UNAVAILABLE,
      "Firebase Firestore is not available."
    );
  }

  function getCollection() {
    return getFirestore()
      .collection(
        COLLECTION_NAME
      );
  }

  function getDocumentReference(
    registrationId
  ) {
    requireNonEmptyString(
      registrationId,
      "registrationId"
    );

    return getCollection()
      .doc(
        registrationId
      );
  }

  /* ==========================================================
     DOCUMENT HELPERS
  ========================================================== */

  function nowIsoString() {
    return new Date()
      .toISOString();
  }

  function buildRegistrationDocument(
    validatedInput
  ) {
    const timestamp =
      nowIsoString();

    return freezeObject({
      registration_id:
        validatedInput.registrationId,

      learner_uid:
        validatedInput.learnerUid,

      learner_email:
        validatedInput.learnerEmail,

      credential_id:
        validatedInput.credentialId,

      source_program_code:
        validatedInput.sourceProgrammeCode,

      target_program_code:
        validatedInput.targetProgrammeCode,

      relationship_code:
        validatedInput.relationshipCode,

      relationship_type:
        validatedInput.relationshipType,

      offer_code:
        validatedInput.offerCode,

      currency:
        validatedInput.currency,

      base_amount:
        validatedInput.baseAmount,

      gst_rate:
        validatedInput.gstRate,

      gst_amount:
        validatedInput.gstAmount,

      total_amount:
        validatedInput.totalAmount,

      offer_expires_at:
        validatedInput.offerExpiresAt,

      acknowledgement_accepted:
        validatedInput
          .acknowledgementAccepted,

      registration_status:
        REGISTRATION_STATUS
          .PAYMENT_PENDING,

      payment_status:
        PAYMENT_STATUS
          .NOT_INITIATED,

      enrolment_status:
        ENROLMENT_STATUS
          .NOT_CREATED,

      source:
        validatedInput.source,

      created_at:
        timestamp,

      updated_at:
        timestamp,

      created_by:
        validatedInput.learnerUid,

      updated_by:
        validatedInput.learnerUid,

      schema_version:
        "1.0.0",

      module_version:
        SERVICE_VERSION
    });
  }

  function buildRegistrationViewModel(
    documentData
  ) {
    if (!documentData) {
      return null;
    }

    return freezeObject({
      registrationId:
        documentData
          .registration_id,

      learnerUid:
        documentData
          .learner_uid,

      learnerEmail:
        documentData
          .learner_email,

      credentialId:
        documentData
          .credential_id,

      sourceProgrammeCode:
        documentData
          .source_program_code,

      targetProgrammeCode:
        documentData
          .target_program_code,

      relationshipCode:
        documentData
          .relationship_code,

      relationshipType:
        documentData
          .relationship_type,

      offerCode:
        documentData
          .offer_code,

      currency:
        documentData
          .currency,

      baseAmount:
        documentData
          .base_amount,

      gstRate:
        documentData
          .gst_rate,

      gstAmount:
        documentData
          .gst_amount,

      totalAmount:
        documentData
          .total_amount,

      offerExpiresAt:
        documentData
          .offer_expires_at,

      acknowledgementAccepted:
        documentData
          .acknowledgement_accepted,

      registrationStatus:
        documentData
          .registration_status,

      paymentStatus:
        documentData
          .payment_status,

      enrolmentStatus:
        documentData
          .enrolment_status,

      createdAt:
        documentData
          .created_at,

      updatedAt:
        documentData
          .updated_at,

      source:
        documentData
          .source
    });
  }
    /* ==========================================================
     REGISTRATION LOOKUP
  ========================================================== */

  async function getRegistration(
    registrationId
  ) {
    try {
      const documentReference =
        getDocumentReference(
          registrationId
        );

      const snapshot =
        await documentReference.get();

      if (!snapshot.exists) {
        return null;
      }

      return buildRegistrationViewModel(
        snapshot.data()
      );
    } catch (error) {
      if (
        error &&
        error.name ===
          "BridgeRegistrationServiceError"
      ) {
        throw error;
      }

      throw createServiceError(
        ERROR_CODE.REGISTRATION_READ_FAILED,
        "Unable to read Bridge Programme registration.",
        error
      );
    }
  }

  async function registrationExists(
    registrationId
  ) {
    const registration =
      await getRegistration(
        registrationId
      );

    return registration !== null;
  }

  async function getRegistrationByInput(
    input
  ) {
    const validatedInput =
        validateRegistrationIdentityInput(
        input
    );

    return getRegistration(
      validatedInput.registrationId
    );
  }

  /* ==========================================================
     DUPLICATE RESOLUTION
  ========================================================== */

  async function resolveExistingRegistration(
    validatedInput
  ) {
    const existingRegistration =
      await getRegistration(
        validatedInput.registrationId
      );

    if (!existingRegistration) {
      return null;
    }

    return freezeObject({
      registration:
        existingRegistration,

      isExisting:
        true,

      isTerminal:
        isTerminalRegistrationStatus(
          existingRegistration
            .registrationStatus
        ),

      isRetryable:
        isRetryableRegistrationStatus(
          existingRegistration
            .registrationStatus
        )
    });
  }

  /* ==========================================================
     AUTHENTICATED LEARNER VALIDATION
  ========================================================== */

  function getAuthenticatedUser() {
    if (
      !global.firebase ||
      typeof global.firebase.auth !==
        "function"
    ) {
      throw createServiceError(
        ERROR_CODE.AUTH_REQUIRED,
        "Firebase Authentication is not available."
      );
    }

    const user =
      global.firebase.auth()
        .currentUser;

    if (
      !user ||
      !isNonEmptyString(
        user.uid
      )
    ) {
      throw createServiceError(
        ERROR_CODE.AUTH_REQUIRED,
        "An authenticated learner is required to create a Bridge Programme registration."
      );
    }

    return user;
  }

  function validateAuthenticatedLearner(
    validatedInput
  ) {
    const authenticatedUser =
      getAuthenticatedUser();

    if (
      authenticatedUser.uid !==
      validatedInput.learnerUid
    ) {
      throw createServiceError(
        ERROR_CODE.AUTH_REQUIRED,
        "The authenticated learner does not match the registration learner.",
        {
          authenticatedLearnerUid:
            authenticatedUser.uid,

          registrationLearnerUid:
            validatedInput.learnerUid
        }
      );
    }

    if (
      validatedInput.learnerEmail &&
      authenticatedUser.email &&
      normaliseEmail(
        authenticatedUser.email
      ) !==
        validatedInput.learnerEmail
    ) {
      throw createServiceError(
        ERROR_CODE.AUTH_REQUIRED,
        "The authenticated learner email does not match the registration email.",
        {
          authenticatedEmail:
            normaliseEmail(
              authenticatedUser.email
            ),

          registrationEmail:
            validatedInput.learnerEmail
        }
      );
    }

    return authenticatedUser;
  }
    /* ==========================================================
     REGISTRATION CREATION VALIDATION
  ========================================================== */

  function validateRegistrationCreation(
    validatedInput
  ) {
    if (
      validatedInput.acknowledgementAccepted !==
      true
    ) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,
        "The learner must accept the Bridge Programme acknowledgement before registration.",
        {
          field:
            "acknowledgementAccepted",

          receivedValue:
            validatedInput
              .acknowledgementAccepted
        }
      );
    }

    if (
      !isNonEmptyString(
        validatedInput
          .relationshipCode
      )
    ) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,
        "relationshipCode is required.",
        {
          field:
            "relationshipCode"
        }
      );
    }

    if (
      !isNonEmptyString(
        validatedInput
          .offerCode
      )
    ) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,
        "offerCode is required.",
        {
          field:
            "offerCode"
        }
      );
    }

    if (
      validatedInput.totalAmount <=
      0
    ) {
      throw createServiceError(
        ERROR_CODE.INVALID_INPUT,
        "The registration total amount must be greater than zero.",
        {
          totalAmount:
            validatedInput
              .totalAmount
        }
      );
    }

    return validatedInput;
  }

  /* ==========================================================
     IDEMPOTENT CREATE RESULT
  ========================================================== */

  function buildCreateResult(
    input
  ) {
    const safeInput =
      input || {};

    const registration =
      safeInput.registration ||
      null;

    return freezeObject({
      registration,

      registrationId:
        registration
          ? registration
              .registrationId
          : "",

      created:
        safeInput.created ===
        true,

      existing:
        safeInput.existing ===
        true,

      idempotent:
        safeInput.existing ===
        true,

      isTerminal:
        registration
          ? isTerminalRegistrationStatus(
              registration
                .registrationStatus
            )
          : false,

      isRetryable:
        registration
          ? isRetryableRegistrationStatus(
              registration
                .registrationStatus
            )
          : false
    });
  }
    /* ==========================================================
     IDEMPOTENT REGISTRATION CREATION
  ========================================================== */

  async function createRegistration(
    input
  ) {
    const validatedInput =
      validateRegistrationCreation(
        validateRegistrationInput(
          input
        )
      );

    validateAuthenticatedLearner(
      validatedInput
    );

    const firestore =
      getFirestore();

    const documentReference =
      getDocumentReference(
        validatedInput
          .registrationId
      );

    try {
      const transactionResult =
        await firestore.runTransaction(
          async function createRegistrationTransaction(
            transaction
          ) {
            const existingSnapshot =
              await transaction.get(
                documentReference
              );

            if (
              existingSnapshot.exists
            ) {
              return {
                created:
                  false,

                existing:
                  true,

                documentData:
                  existingSnapshot.data()
              };
            }

            const registrationDocument =
              buildRegistrationDocument(
                validatedInput
              );

            transaction.set(
              documentReference,
              registrationDocument
            );

            return {
              created:
                true,

              existing:
                false,

              documentData:
                registrationDocument
            };
          }
        );

      const registrationViewModel =
        buildRegistrationViewModel(
          transactionResult
            .documentData
        );

      return buildCreateResult({
        registration:
          registrationViewModel,

        created:
          transactionResult
            .created,

        existing:
          transactionResult
            .existing
      });
    } catch (error) {
      if (
        error &&
        error.name ===
          "BridgeRegistrationServiceError"
      ) {
        throw error;
      }

      /*
       * A concurrent request may create the deterministic
       * document between the transaction read and commit.
       *
       * Resolve the canonical document before treating the
       * operation as a failure. This makes repeated clicks,
       * browser retries and network retries safely idempotent.
       */
      try {
        const existingRegistration =
          await getRegistration(
            validatedInput
              .registrationId
          );

        if (
          existingRegistration
        ) {
          return buildCreateResult({
            registration:
              existingRegistration,

            created:
              false,

            existing:
              true
          });
        }
      } catch (readError) {
        console.warn(
          `[${SERVICE_NAME}] Unable to resolve the registration after a create failure.`,
          readError
        );
      }

      throw createServiceError(
        ERROR_CODE
          .REGISTRATION_CREATE_FAILED,

        "Unable to create the Bridge Programme registration.",

        {
          registrationId:
            validatedInput
              .registrationId,

          originalError:
            error
        }
      );
    }
  }

  /* ==========================================================
     CREATE OR RESOLVE
  ========================================================== */

  async function createOrResolveRegistration(
    input
  ) {
    const validatedInput =
      validateRegistrationCreation(
        validateRegistrationInput(
          input
        )
      );

    validateAuthenticatedLearner(
      validatedInput
    );

    const existingResult =
      await resolveExistingRegistration(
        validatedInput
      );

    if (
      existingResult
    ) {
      return buildCreateResult({
        registration:
          existingResult
            .registration,

        created:
          false,

        existing:
          true
      });
    }

    return createRegistration(
      validatedInput
    );
  }
    /* ==========================================================
     LEARNER REGISTRATION RESOLUTION
  ========================================================== */

  async function resolveLearnerRegistration(
    input
  ) {
    const validatedInput =
        validateRegistrationIdentityInput(
        input
    );

    validateAuthenticatedLearner(
      validatedInput
    );

    const registration =
      await getRegistration(
        validatedInput
          .registrationId
      );

    if (
      !registration
    ) {
      return freezeObject({
        found:
          false,

        registration:
          null,

        registrationId:
          validatedInput
            .registrationId,

        isTerminal:
          false,

        isRetryable:
          false
      });
    }

    return freezeObject({
      found:
        true,

      registration,

      registrationId:
        registration
          .registrationId,

      isTerminal:
        isTerminalRegistrationStatus(
          registration
            .registrationStatus
        ),

      isRetryable:
        isRetryableRegistrationStatus(
          registration
            .registrationStatus
        )
    });
  }

  /* ==========================================================
     REGISTRATION STATE HELPERS
  ========================================================== */

  function canProceedToPayment(
    registration
  ) {
    if (
      !registration
    ) {
      return false;
    }

    return (
      registration
        .registrationStatus ===
        REGISTRATION_STATUS
          .PAYMENT_PENDING &&
      (
        registration
          .paymentStatus ===
          PAYMENT_STATUS
            .NOT_INITIATED ||

        registration
          .paymentStatus ===
          PAYMENT_STATUS
            .FAILED ||

        registration
          .paymentStatus ===
          PAYMENT_STATUS
            .CANCELLED
      )
    );
  }

  function hasConfirmedPayment(
    registration
  ) {
    if (
      !registration
    ) {
      return false;
    }

    return (
      registration
        .paymentStatus ===
        PAYMENT_STATUS
          .PAID ||

      registration
        .registrationStatus ===
        REGISTRATION_STATUS
          .PAYMENT_CONFIRMED ||

      registration
        .registrationStatus ===
        REGISTRATION_STATUS
          .REGISTERED ||

      registration
        .registrationStatus ===
        REGISTRATION_STATUS
          .ENROLMENT_PENDING ||

      registration
        .registrationStatus ===
        REGISTRATION_STATUS
          .ENROLLED
    );
  }

  function hasActiveEnrolment(
    registration
  ) {
    if (
      !registration
    ) {
      return false;
    }

    return (
      registration
        .enrolmentStatus ===
        ENROLMENT_STATUS
          .ACTIVE ||

      registration
        .enrolmentStatus ===
        ENROLMENT_STATUS
          .COMPLETED ||

      registration
        .registrationStatus ===
        REGISTRATION_STATUS
          .ENROLLED
    );
  }

  /* ==========================================================
     SERVICE READINESS
  ========================================================== */

  function getReadiness() {
    const firebaseAvailable =
      Boolean(
        global.firebase
      );

    const authAvailable =
      Boolean(
        global.firebase &&
        typeof global.firebase.auth ===
          "function"
      );

    const firestoreAvailable =
      Boolean(
        global.firebase &&
        typeof global.firebase.firestore ===
          "function"
      );

    const authenticatedUser =
      authAvailable
        ? global.firebase.auth()
            .currentUser
        : null;

    return freezeObject({
      ready:
        firebaseAvailable &&
        authAvailable &&
        firestoreAvailable,

      firebaseAvailable,

      authAvailable,

      firestoreAvailable,

      authenticated:
        Boolean(
          authenticatedUser &&
          isNonEmptyString(
            authenticatedUser.uid
          )
        ),

      authenticatedLearnerUid:
        authenticatedUser &&
        isNonEmptyString(
          authenticatedUser.uid
        )
          ? authenticatedUser.uid
          : null,

      collectionName:
        COLLECTION_NAME,

      serviceName:
        SERVICE_NAME,

      serviceVersion:
        SERVICE_VERSION
    });
  }

  function assertReady() {
    const readiness =
      getReadiness();

    if (
      !readiness
        .firebaseAvailable
    ) {
      throw createServiceError(
        ERROR_CODE
          .FIRESTORE_UNAVAILABLE,

        "Firebase is not available."
      );
    }

    if (
      !readiness
        .authAvailable
    ) {
      throw createServiceError(
        ERROR_CODE
          .AUTH_REQUIRED,

        "Firebase Authentication is not available."
      );
    }

    if (
      !readiness
        .firestoreAvailable
    ) {
      throw createServiceError(
        ERROR_CODE
          .FIRESTORE_UNAVAILABLE,

        "Firebase Firestore is not available."
      );
    }

    return readiness;
  }
    /* ==========================================================
     SERVICE DIAGNOSTICS
  ========================================================== */

  function getDiagnostics() {
    const readiness =
      getReadiness();

    return freezeObject({
      service:
        SERVICE_NAME,

      version:
        SERVICE_VERSION,

      collection:
        COLLECTION_NAME,

      ready:
        readiness.ready,

      authenticated:
        readiness.authenticated,

      authenticatedLearnerUid:
        readiness
          .authenticatedLearnerUid,

      firebaseAvailable:
        readiness
          .firebaseAvailable,

      authAvailable:
        readiness
          .authAvailable,

      firestoreAvailable:
        readiness
          .firestoreAvailable,

      timestamp:
        nowIsoString()
    });
  }

  /* ==========================================================
     PUBLIC SERVICE API
  ========================================================== */

  const BridgeRegistrationService =
    freezeObject({
      SERVICE_NAME,

      SERVICE_VERSION,

      COLLECTION_NAME,

      REGISTRATION_STATUS,

      PAYMENT_STATUS,

      ENROLMENT_STATUS,

      REGISTRATION_SOURCE,

      ERROR_CODE,

      buildRegistrationId,

      validateRegistrationIdentityInput,

      validateRegistrationInput,

      getRegistration,

      registrationExists,

      getRegistrationByInput,

      resolveExistingRegistration,

      resolveLearnerRegistration,

      createRegistration,

      createOrResolveRegistration,

      canProceedToPayment,

      hasConfirmedPayment,

      hasActiveEnrolment,

      getReadiness,

      assertReady,

      getDiagnostics
    });

  /* ==========================================================
     GLOBAL REGISTRATION
  ========================================================== */

  global.BridgeRegistrationService =
    BridgeRegistrationService;

  /* ==========================================================
     SERVICE READY EVENT
  ========================================================== */

  try {
    const readiness =
      getReadiness();

    global.dispatchEvent(
      new CustomEvent(
        "bridge-registration-service:ready",
        {
          detail:
            freezeObject({
              serviceName:
                SERVICE_NAME,

              serviceVersion:
                SERVICE_VERSION,

              collectionName:
                COLLECTION_NAME,

              ready:
                readiness.ready,

              authenticated:
                readiness.authenticated,

              firebaseAvailable:
                readiness.firebaseAvailable,

              authAvailable:
                readiness.authAvailable,

              firestoreAvailable:
                readiness.firestoreAvailable
            })
        }
      )
    );
  } catch (error) {
    console.warn(
      `[${SERVICE_NAME}] Unable to dispatch the service-ready event.`,
      error
    );
  }

  console.info(
    `[${SERVICE_NAME}] v${SERVICE_VERSION} initialized successfully.`
  );

})(window);