/* ============================================================
   AGILE AI UNIVERSITY
   BRIDGE REGISTRATION CONTROLLER

   File:
   public-portal/assets/js/controllers/programs/
   bridge-registration-controller.js

   Version: 1.1.0
   Status: ACTIVE
   Domain: Programme Registration
   Runtime: Browser Global

   Purpose
   ------------------------------------------------------------
   Orchestrates the authenticated learner journey for an
   Agile AI University Bridge Programme registration.

   Responsibilities
   ------------------------------------------------------------
   - Validate controller dependencies
   - Resolve the authenticated learner identity
   - Resolve programme context
   - Resolve academic eligibility
   - Resolve commercial eligibility and offer
   - Restore an existing registration
   - Create a registration after explicit acknowledgement
   - Coordinate registration and payment states
   - Coordinate enrolment resolution
   - Expose immutable controller state
   - Dispatch governed lifecycle events

   Non-Responsibilities
   ------------------------------------------------------------
   This controller does not:

   - Write directly to Firestore
   - Determine trusted payment status independently
   - Verify payment signatures
   - Create learner enrolments directly
   - Activate learning-resource access directly
   - Contain programme pricing rules
   - Contain academic eligibility rules
   - Render unrestricted HTML
   - Create a registration merely because a page was opened

   Architecture Chain
   ------------------------------------------------------------
   Authentication
      ↓
   Authorization
      ↓
   Academic Eligibility
      ↓
   Commercial Eligibility
      ↓
   BridgeRegistrationController
      ↓
   BridgeRegistrationService
      ↓
   Payment Orchestration
      ↓
   Enrolment
      ↓
   Learning Access

   Reconstruction Blocks
   ------------------------------------------------------------
   Block 1  - Header, constants and utilities
   Block 2  - Dependencies, state and readiness
   Block 3  - Authentication and learner identity
   Block 4  - Programme context and page context
   Block 5  - Eligibility and credential resolution
   Block 6  - Commercial offer resolution
   Block 7  - Registration input and normalisation
   Block 8  - Registration resolution and creation
   Block 9  - Payment and enrolment orchestration
   Block 10 - Complete journey, diagnostics and public API

   Governance Rules
   ------------------------------------------------------------
   - Registration creation requires explicit learner action.
   - Registration creation requires acknowledgementAccepted=true.
   - Page initialisation may restore an existing registration.
   - Page initialisation must never create a new registration.
   - Payment confirmation must come from a trusted service.
   - The learner UID is the canonical authenticated identity.
   - Programme pricing and eligibility remain service-owned.
   - All controller state exposed publicly must be immutable.

   Change History
   ------------------------------------------------------------
   1.1.0
   - Reconstructed controller into ten meaningful blocks
   - Separated academic and commercial eligibility authorities
   - Made ProgramService optional for the registration journey
   - Added governed credential-source resolution
   - Added explicit acknowledgement enforcement
   - Prevented registration creation during page initialisation
   - Preserved idempotent registration creation
   - Hardened concurrent operation handling

   1.0.0
   - Added governed controller foundation
   - Added dependency resolution
   - Added immutable controller state
   - Added controller lifecycle constants
   - Added readiness handling
   - Added lifecycle-event dispatcher
   - Added governed error handling
   - Added controller initialisation
============================================================ */

(function initialiseBridgeRegistrationController(
  global
) {
  "use strict";

  /* ==========================================================
     CONTROLLER IDENTITY
  ========================================================== */

  const CONTROLLER_NAME =
    "BridgeRegistrationController";

  const CONTROLLER_VERSION =
    "1.1.0";

  /* ==========================================================
     CONTROLLER STATUS
  ========================================================== */

  const CONTROLLER_STATUS =
    Object.freeze({
      IDLE:
        "IDLE",

      INITIALISING:
        "INITIALISING",

      READY:
        "READY",

      RESOLVING_IDENTITY:
        "RESOLVING_IDENTITY",

      RESOLVING_ELIGIBILITY:
        "RESOLVING_ELIGIBILITY",

      RESOLVING_OFFER:
        "RESOLVING_OFFER",

      RESOLVING_REGISTRATION:
        "RESOLVING_REGISTRATION",

      CREATING_REGISTRATION:
        "CREATING_REGISTRATION",

      PAYMENT_REQUIRED:
        "PAYMENT_REQUIRED",

      PAYMENT_IN_PROGRESS:
        "PAYMENT_IN_PROGRESS",

      PAYMENT_CONFIRMED:
        "PAYMENT_CONFIRMED",

      ENROLMENT_PENDING:
        "ENROLMENT_PENDING",

      ENROLLED:
        "ENROLLED",

      NOT_ELIGIBLE:
        "NOT_ELIGIBLE",

      BLOCKED:
        "BLOCKED",

      ERROR:
        "ERROR"
    });

  /* ==========================================================
     CONTROLLER EVENTS
  ========================================================== */

  const CONTROLLER_EVENT =
    Object.freeze({
      READY:
        "bridge-registration-controller:ready",

      STATE_CHANGED:
        "bridge-registration-controller:state-changed",

      IDENTITY_RESOLVED:
        "bridge-registration-controller:identity-resolved",

      ELIGIBILITY_RESOLVED:
        "bridge-registration-controller:eligibility-resolved",

      OFFER_RESOLVED:
        "bridge-registration-controller:offer-resolved",

      REGISTRATION_RESOLVED:
        "bridge-registration-controller:registration-resolved",

      REGISTRATION_CREATED:
        "bridge-registration-controller:registration-created",

      PAYMENT_REQUIRED:
        "bridge-registration-controller:payment-required",

      PAYMENT_STARTED:
        "bridge-registration-controller:payment-started",

      PAYMENT_CONFIRMED:
        "bridge-registration-controller:payment-confirmed",

      ENROLMENT_RESOLVED:
        "bridge-registration-controller:enrolment-resolved",

      ERROR:
        "bridge-registration-controller:error"
    });

  /* ==========================================================
     ERROR CODES
  ========================================================== */

  const ERROR_CODE =
    Object.freeze({
      INVALID_INPUT:
        "BRIDGE_REGISTRATION_CONTROLLER_INVALID_INPUT",

      DEPENDENCY_UNAVAILABLE:
        "BRIDGE_REGISTRATION_CONTROLLER_DEPENDENCY_UNAVAILABLE",

      AUTH_REQUIRED:
        "BRIDGE_REGISTRATION_CONTROLLER_AUTH_REQUIRED",

      INITIALISATION_FAILED:
        "BRIDGE_REGISTRATION_CONTROLLER_INITIALISATION_FAILED",

      IDENTITY_RESOLUTION_FAILED:
        "BRIDGE_REGISTRATION_CONTROLLER_IDENTITY_RESOLUTION_FAILED",

      ELIGIBILITY_RESOLUTION_FAILED:
        "BRIDGE_REGISTRATION_CONTROLLER_ELIGIBILITY_RESOLUTION_FAILED",

      OFFER_RESOLUTION_FAILED:
        "BRIDGE_REGISTRATION_CONTROLLER_OFFER_RESOLUTION_FAILED",

      REGISTRATION_RESOLUTION_FAILED:
        "BRIDGE_REGISTRATION_CONTROLLER_REGISTRATION_RESOLUTION_FAILED",

      REGISTRATION_CREATION_FAILED:
        "BRIDGE_REGISTRATION_CONTROLLER_REGISTRATION_CREATION_FAILED",

      PAYMENT_FAILED:
        "BRIDGE_REGISTRATION_CONTROLLER_PAYMENT_FAILED",

      ENROLMENT_RESOLUTION_FAILED:
        "BRIDGE_REGISTRATION_CONTROLLER_ENROLMENT_RESOLUTION_FAILED",

      INTERNAL_ERROR:
        "BRIDGE_REGISTRATION_CONTROLLER_INTERNAL_ERROR"
    });

  /* ==========================================================
     INTERNAL UTILITIES
  ========================================================== */

  function isObject(
    value
  ) {
    return Boolean(
      value &&
      typeof value ===
        "object" &&
      !Array.isArray(
        value
      )
    );
  }

  function isNonEmptyString(
    value
  ) {
    return (
      typeof value ===
        "string" &&
      value.trim().length >
        0
    );
  }

  function normaliseString(
    value
  ) {
    return isNonEmptyString(
      value
    )
      ? value.trim()
      : "";
  }

  function normaliseEmail(
    value
  ) {
    return normaliseString(
      value
    ).toLowerCase();
  }

  function normaliseProgrammeCode(
    value
  ) {
    return normaliseString(
      value
    ).toUpperCase();
  }

  function normaliseBoolean(
    value
  ) {
    return value ===
      true;
  }

  function normaliseNumber(
    value,
    fallbackValue
  ) {
    const numericValue =
      Number(
        value
      );

    if (
      Number.isFinite(
        numericValue
      )
    ) {
      return numericValue;
    }

    const numericFallback =
      Number(
        fallbackValue
      );

    return Number.isFinite(
      numericFallback
    )
      ? numericFallback
      : 0;
  }

  function nowIsoString() {
    return new Date()
      .toISOString();
  }

  function freezeArray(
    value
  ) {
    if (
      !Array.isArray(
        value
      )
    ) {
      return Object.freeze(
        []
      );
    }

    return Object.freeze([
      ...value
    ]);
  }

  function freezeObject(
    value
  ) {
    if (
      !isObject(
        value
      )
    ) {
      return value;
    }

    return Object.freeze({
      ...value
    });
  }

  function createControllerError(
    code,
    message,
    details
  ) {
    const governedMessage =
      normaliseString(
        message
      ) ||
      "A Bridge Registration Controller error occurred.";

    const error =
      new Error(
        governedMessage
      );

    error.name =
      "BridgeRegistrationControllerError";

    error.code =
      normaliseString(
        code
      ) ||
      ERROR_CODE
        .INTERNAL_ERROR;

    error.details =
      isObject(
        details
      )
        ? freezeObject(
            details
          )
        : null;

    error.controller =
      CONTROLLER_NAME;

    error.controllerVersion =
      CONTROLLER_VERSION;

    return error;
  }

  function serialiseError(
    error
  ) {
    if (!error) {
      return null;
    }

    return freezeObject({
      name:
        normaliseString(
          error.name
        ) ||
        "Error",

      code:
        normaliseString(
          error.code
        ) ||
        ERROR_CODE
          .INTERNAL_ERROR,

      message:
        normaliseString(
          error.message
        ) ||
        "An unexpected controller error occurred.",

      details:
        isObject(
          error.details
        )
          ? freezeObject(
              error.details
            )
          : null,

      controller:
        normaliseString(
          error.controller
        ) ||
        CONTROLLER_NAME,

      controllerVersion:
        normaliseString(
          error.controllerVersion
        ) ||
        CONTROLLER_VERSION
    });
  }

  function normaliseStatus(
    value
  ) {
    return normaliseString(
      value
    ).toUpperCase();
  }

  function hasOwnProperty(
    objectValue,
    propertyName
  ) {
    return Boolean(
      objectValue &&
      Object.prototype
        .hasOwnProperty
        .call(
          objectValue,
          propertyName
        )
    );
  }

  function getFirstNonEmptyString(
    values
  ) {
    if (
      !Array.isArray(
        values
      )
    ) {
      return "";
    }

    for (
      let index = 0;
      index <
        values.length;
      index += 1
    ) {
      const value =
        normaliseString(
          values[index]
        );

      if (
        isNonEmptyString(
          value
        )
      ) {
        return value;
      }
    }

    return "";
  }

  function getFirstObject(
    values
  ) {
    if (
      !Array.isArray(
        values
      )
    ) {
      return null;
    }

    for (
      let index = 0;
      index <
        values.length;
      index += 1
    ) {
      if (
        isObject(
          values[index]
        )
      ) {
        return values[index];
      }
    }

    return null;
  }

  function getFirstArray(
    values
  ) {
    if (
      !Array.isArray(
        values
      )
    ) {
      return [];
    }

    for (
      let index = 0;
      index <
        values.length;
      index += 1
    ) {
      if (
        Array.isArray(
          values[index]
        )
      ) {
        return values[index];
      }
    }

    return [];
  }

  function valuesApproximatelyEqual(
    firstValue,
    secondValue,
    precision
  ) {
    const governedPrecision =
      Number.isInteger(
        precision
      ) &&
      precision >=
        0
        ? precision
        : 2;

    const firstNumber =
      normaliseNumber(
        firstValue,
        0
      );

    const secondNumber =
      normaliseNumber(
        secondValue,
        0
      );

    return (
      Number(
        firstNumber.toFixed(
          governedPrecision
        )
      ) ===
      Number(
        secondNumber.toFixed(
          governedPrecision
        )
      )
    );
  }

  function ensurePositiveNumber(
    value,
    fieldName,
    errorCode,
    errorMessage
  ) {
    const numericValue =
      normaliseNumber(
        value,
        0
      );

    if (
      numericValue <=
      0
    ) {
      throw createControllerError(
        errorCode ||
          ERROR_CODE
            .INVALID_INPUT,

        errorMessage ||
          `${normaliseString(
            fieldName
          ) || "Value"} must be greater than zero.`,

        {
          field:
            normaliseString(
              fieldName
            ),

          value:
            numericValue
        }
      );
    }

    return numericValue;
  }

  function ensureRequiredString(
    value,
    fieldName,
    errorCode,
    errorMessage
  ) {
    const governedValue =
      normaliseString(
        value
      );

    if (
      !isNonEmptyString(
        governedValue
      )
    ) {
      throw createControllerError(
        errorCode ||
          ERROR_CODE
            .INVALID_INPUT,

        errorMessage ||
          `${normaliseString(
            fieldName
          ) || "Value"} is required.`,

        {
          field:
            normaliseString(
              fieldName
            )
        }
      );
    }

    return governedValue;
  }

  /* ==========================================================
     END OF BLOCK 1 OF 10

     Do not close the IIFE here.
     Block 2 must continue immediately below this section.
  ========================================================== */

    /* ==========================================================
     BLOCK 2 OF 10
     DEPENDENCIES, STATE AND READINESS
  ========================================================== */

  /* ==========================================================
     DEPENDENCY RESOLUTION
  ========================================================== */

  function getFirebaseAuth() {
    if (
      !global.firebase ||
      typeof global.firebase.auth !==
        "function"
    ) {
      return null;
    }

    try {
      return global.firebase.auth();
    } catch (error) {
      console.warn(
        `[${CONTROLLER_NAME}] Firebase Authentication could not be resolved.`,
        error
      );

      return null;
    }
  }

  function getRegistrationService() {
    const service =
      global.BridgeRegistrationService;

    if (
      !service ||
      typeof service !==
        "object"
    ) {
      return null;
    }

    return service;
  }

  function getProgramService() {
    const service =
      global.ProgramService;

    if (
      !service ||
      typeof service !==
        "object"
    ) {
      return null;
    }

    return service;
  }

  function getEligibilityService() {
    const service =
      global.EligibilityService;

    if (
      !service ||
      typeof service !==
        "object"
    ) {
      return null;
    }

    return service;
  }

  function getBridgeProgramService() {
    const service =
      global.BridgeProgramService;

    if (
      !service ||
      typeof service !==
        "object"
    ) {
      return null;
    }

    return service;
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
      return null;
    }

    return service;
  }

  function getEnrolmentService() {
    const service =
      global.EnrolmentService ||
      global.ProgramEnrolmentService;

    if (
      !service ||
      typeof service !==
        "object"
    ) {
      return null;
    }

    return service;
  }

  function resolveDependencies() {
    const firebaseAuth =
      getFirebaseAuth();

    const registrationService =
      getRegistrationService();

    const programService =
      getProgramService();

    const eligibilityService =
      getEligibilityService();

    const bridgeProgramService =
      getBridgeProgramService();

    const paymentService =
      getPaymentService();

    const enrolmentService =
      getEnrolmentService();

    return freezeObject({
      firebaseAuth,

      registrationService,

      programService,

      eligibilityService,

      bridgeProgramService,

      paymentService,

      enrolmentService,

      firebaseAvailable:
        Boolean(
          global.firebase
        ),

      authAvailable:
        Boolean(
          firebaseAuth
        ),

      registrationServiceAvailable:
        Boolean(
          registrationService
        ),

      programServiceAvailable:
        Boolean(
          programService
        ),

      eligibilityServiceAvailable:
        Boolean(
          eligibilityService
        ),

      bridgeProgramServiceAvailable:
        Boolean(
          bridgeProgramService
        ),

      paymentServiceAvailable:
        Boolean(
          paymentService
        ),

      enrolmentServiceAvailable:
        Boolean(
          enrolmentService
        )
    });
  }

  function assertRequiredDependencies(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const requireProgramService =
      safeOptions
        .requireProgramService ===
      true;

    const requireEligibilityService =
      safeOptions
        .requireEligibilityService ===
      true;

    const requireBridgeProgramService =
      safeOptions
        .requireBridgeProgramService ===
      true;

    const requirePaymentService =
      safeOptions
        .requirePaymentService ===
      true;

    const requireEnrolmentService =
      safeOptions
        .requireEnrolmentService ===
      true;

    const dependencies =
      resolveDependencies();

    const missingDependencies =
      [];

    if (
      !dependencies.authAvailable
    ) {
      missingDependencies.push(
        "Firebase Authentication"
      );
    }

    if (
      !dependencies
        .registrationServiceAvailable
    ) {
      missingDependencies.push(
        "BridgeRegistrationService"
      );
    }

    if (
      requireProgramService &&
      !dependencies
        .programServiceAvailable
    ) {
      missingDependencies.push(
        "ProgramService"
      );
    }

    if (
      requireEligibilityService &&
      !dependencies
        .eligibilityServiceAvailable
    ) {
      missingDependencies.push(
        "EligibilityService"
      );
    }

    if (
      requireBridgeProgramService &&
      !dependencies
        .bridgeProgramServiceAvailable
    ) {
      missingDependencies.push(
        "BridgeProgramService"
      );
    }

    if (
      requirePaymentService &&
      !dependencies
        .paymentServiceAvailable
    ) {
      missingDependencies.push(
        "PaymentService"
      );
    }

    if (
      requireEnrolmentService &&
      !dependencies
        .enrolmentServiceAvailable
    ) {
      missingDependencies.push(
        "EnrolmentService"
      );
    }

    if (
      missingDependencies.length >
      0
    ) {
      throw createControllerError(
        ERROR_CODE
          .DEPENDENCY_UNAVAILABLE,

        "Required Bridge Registration Controller dependencies are unavailable.",

        {
          missingDependencies:
            freezeArray(
              missingDependencies
            )
        }
      );
    }

    return dependencies;
  }

  /* ==========================================================
     CONTROLLER STATE
  ========================================================== */

  function createInitialState() {
    return freezeObject({
      status:
        CONTROLLER_STATUS.IDLE,

      initialised:
        false,

      busy:
        false,

      learner:
        null,

      sourceProgrammeCode:
        "",

      targetProgrammeCode:
        "",

      eligibility:
        null,

      offer:
        null,

      registration:
        null,

      payment:
        null,

      enrolment:
        null,

      error:
        null,

      initialisedAt:
        null,

      updatedAt:
        nowIsoString()
    });
  }

  let controllerState =
    createInitialState();

  /*
   * Shared operation promises prevent duplicate concurrent
   * executions caused by repeated rendering, double-clicks,
   * retries, or overlapping lifecycle events.
   */

  let identityResolutionPromise =
    null;

  let eligibilityResolutionPromise =
    null;

  let offerResolutionPromise =
    null;

  let registrationResolutionPromise =
    null;

  let registrationCreationPromise =
    null;

  let paymentInitiationPromise =
    null;

  let paymentStatusResolutionPromise =
    null;

  let enrolmentResolutionPromise =
    null;

  let registrationJourneyInitialisationPromise =
    null;

  function buildState(
    nextState
  ) {
    const safeState =
      isObject(
        nextState
      )
        ? nextState
        : {};

    return freezeObject({
      status:
        normaliseString(
          safeState.status
        ) ||
        controllerState.status,

      initialised:
        normaliseBoolean(
          safeState.initialised
        ),

      busy:
        normaliseBoolean(
          safeState.busy
        ),

      learner:
        safeState.learner ||
        null,

      sourceProgrammeCode:
        normaliseProgrammeCode(
          safeState
            .sourceProgrammeCode
        ),

      targetProgrammeCode:
        normaliseProgrammeCode(
          safeState
            .targetProgrammeCode
        ),

      eligibility:
        safeState.eligibility ||
        null,

      offer:
        safeState.offer ||
        null,

      registration:
        safeState.registration ||
        null,

      payment:
        safeState.payment ||
        null,

      enrolment:
        safeState.enrolment ||
        null,

      error:
        safeState.error ||
        null,

      initialisedAt:
        safeState.initialisedAt ||
        null,

      updatedAt:
        nowIsoString()
    });
  }

  /* ==========================================================
     CONTROLLER EVENT DISPATCH
  ========================================================== */

  function dispatchControllerEvent(
    eventName,
    detail
  ) {
    if (
      !isNonEmptyString(
        eventName
      ) ||
      typeof global.dispatchEvent !==
        "function" ||
      typeof global.CustomEvent !==
        "function"
    ) {
      return false;
    }

    try {
      global.dispatchEvent(
        new global.CustomEvent(
          eventName,
          {
            detail:
              freezeObject({
                controllerName:
                  CONTROLLER_NAME,

                controllerVersion:
                  CONTROLLER_VERSION,

                timestamp:
                  nowIsoString(),

                ...(
                  isObject(
                    detail
                  )
                    ? detail
                    : {}
                )
              })
          }
        )
      );

      return true;
    } catch (error) {
      console.warn(
        `[${CONTROLLER_NAME}] Unable to dispatch event "${eventName}".`,
        error
      );

      return false;
    }
  }

  /* ==========================================================
     STATE ACCESS AND MUTATION
  ========================================================== */

  function setState(
    patch
  ) {
    const safePatch =
      isObject(
        patch
      )
        ? patch
        : {};

    controllerState =
      buildState({
        ...controllerState,
        ...safePatch
      });

    dispatchControllerEvent(
      CONTROLLER_EVENT
        .STATE_CHANGED,

      {
        state:
          controllerState
      }
    );

    return controllerState;
  }

  function getState() {
    return controllerState;
  }

  function resetState() {
    identityResolutionPromise =
      null;

    eligibilityResolutionPromise =
      null;

    offerResolutionPromise =
      null;

    registrationResolutionPromise =
      null;

    registrationCreationPromise =
      null;

    paymentInitiationPromise =
      null;

    paymentStatusResolutionPromise =
      null;

    enrolmentResolutionPromise =
      null;

    registrationJourneyInitialisationPromise =
      null;

    controllerState =
      createInitialState();

    dispatchControllerEvent(
      CONTROLLER_EVENT
        .STATE_CHANGED,

      {
        state:
          controllerState,

        reset:
          true
      }
    );

    return controllerState;
  }

  /* ==========================================================
     ERROR STATE HANDLING
  ========================================================== */

  function handleControllerError(
    error,
    fallbackCode,
    fallbackMessage
  ) {
    const governedError =
      error &&
      error.name ===
        "BridgeRegistrationControllerError"
        ? error
        : createControllerError(
            fallbackCode ||
              ERROR_CODE
                .INTERNAL_ERROR,

            fallbackMessage ||
              "An unexpected Bridge Registration Controller error occurred.",

            {
              originalError:
                error ||
                null
            }
          );

    const serialisedError =
      serialiseError(
        governedError
      );

    setState({
      status:
        CONTROLLER_STATUS.ERROR,

      busy:
        false,

      error:
        serialisedError
    });

    dispatchControllerEvent(
      CONTROLLER_EVENT.ERROR,

      {
        error:
          serialisedError,

        state:
          controllerState
      }
    );

    return governedError;
  }

  function clearControllerError() {
    if (
      !controllerState.error
    ) {
      return controllerState;
    }

    return setState({
      error:
        null
    });
  }

  /* ==========================================================
     READINESS
  ========================================================== */

  function getReadiness() {
    const dependencies =
      resolveDependencies();

    const authenticatedUser =
      dependencies.firebaseAuth
        ? dependencies
            .firebaseAuth
            .currentUser
        : null;

    const foundationReady =
      dependencies.authAvailable &&
      dependencies
        .registrationServiceAvailable;

    /*
     * ProgramService is optional for the core registration
     * journey and remains a metadata/diagnostic authority.
     */

    const programmeMetadataReady =
      dependencies
        .programServiceAvailable;

    const academicEligibilityReady =
      dependencies
        .bridgeProgramServiceAvailable;

    const commercialEligibilityReady =
      dependencies
        .eligibilityServiceAvailable;

    const programmeResolutionReady =
      foundationReady &&
      academicEligibilityReady &&
      commercialEligibilityReady;

    const paymentResolutionReady =
      programmeResolutionReady &&
      dependencies
        .paymentServiceAvailable;

    const enrolmentResolutionReady =
      paymentResolutionReady &&
      dependencies
        .enrolmentServiceAvailable;

    return freezeObject({
      ready:
        foundationReady,

      foundationReady,

      programmeMetadataReady,

      academicEligibilityReady,

      commercialEligibilityReady,

      programmeResolutionReady,

      paymentResolutionReady,

      enrolmentResolutionReady,

      firebaseAvailable:
        dependencies
          .firebaseAvailable,

      authAvailable:
        dependencies
          .authAvailable,

      registrationServiceAvailable:
        dependencies
          .registrationServiceAvailable,

      programServiceAvailable:
        dependencies
          .programServiceAvailable,

      eligibilityServiceAvailable:
        dependencies
          .eligibilityServiceAvailable,

      bridgeProgramServiceAvailable:
        dependencies
          .bridgeProgramServiceAvailable,

      paymentServiceAvailable:
        dependencies
          .paymentServiceAvailable,

      enrolmentServiceAvailable:
        dependencies
          .enrolmentServiceAvailable,

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

      controllerName:
        CONTROLLER_NAME,

      controllerVersion:
        CONTROLLER_VERSION
    });
  }

  function assertReady(
    options
  ) {
    const dependencies =
      assertRequiredDependencies(
        options
      );

    return freezeObject({
      ready:
        true,

      dependencies,

      readiness:
        getReadiness()
    });
  }

  /* ==========================================================
     CONTROLLER FOUNDATION INITIALISATION
  ========================================================== */

  async function initialise(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    if (
      controllerState.busy
    ) {
      return controllerState;
    }

    if (
      controllerState.initialised &&
      safeOptions.force !==
        true
    ) {
      return controllerState;
    }

    setState({
      status:
        CONTROLLER_STATUS
          .INITIALISING,

      busy:
        true,

      error:
        null
    });

    try {
      assertRequiredDependencies();

      const timestamp =
        nowIsoString();

      const nextState =
        setState({
          status:
            CONTROLLER_STATUS.READY,

          initialised:
            true,

          busy:
            false,

          sourceProgrammeCode:
            normaliseProgrammeCode(
              safeOptions
                .sourceProgrammeCode
            ),

          targetProgrammeCode:
            normaliseProgrammeCode(
              safeOptions
                .targetProgrammeCode
            ),

          initialisedAt:
            controllerState
              .initialisedAt ||
            timestamp,

          error:
            null
        });

      dispatchControllerEvent(
        CONTROLLER_EVENT.READY,

        {
          state:
            nextState,

          readiness:
            getReadiness()
        }
      );

      console.info(
        `[${CONTROLLER_NAME}] v${CONTROLLER_VERSION} foundation initialised successfully.`
      );

      return nextState;
    } catch (error) {
      throw handleControllerError(
        error,

        ERROR_CODE
          .INITIALISATION_FAILED,

        "Unable to initialise the Bridge Registration Controller."
      );
    }
  }

  /* ==========================================================
     END OF BLOCK 2 OF 10

     Do not close the IIFE here.
     Block 3 must continue immediately below this section.
  ========================================================== */

   /* ==========================================================
     BLOCK 3 OF 10
     AUTHENTICATION AND LEARNER IDENTITY
  ========================================================== */

  /* ==========================================================
     AUTHENTICATED LEARNER VIEW MODEL
  ========================================================== */

  function buildLearnerViewModel(
    authenticatedUser
  ) {
    if (
      !authenticatedUser ||
      !isNonEmptyString(
        authenticatedUser.uid
      )
    ) {
      return null;
    }

    const providerIds =
      Array.isArray(
        authenticatedUser.providerData
      )
        ? authenticatedUser
            .providerData
            .map(
              function mapProvider(
                provider
              ) {
                if (
                  !provider ||
                  !isNonEmptyString(
                    provider.providerId
                  )
                ) {
                  return "";
                }

                return normaliseString(
                  provider.providerId
                );
              }
            )
            .filter(
              isNonEmptyString
            )
        : [];

    return freezeObject({
      learnerUid:
        normaliseString(
          authenticatedUser.uid
        ),

      email:
        normaliseEmail(
          authenticatedUser.email
        ),

      displayName:
        normaliseString(
          authenticatedUser.displayName
        ),

      emailVerified:
        authenticatedUser
          .emailVerified ===
        true,

      phoneNumber:
        normaliseString(
          authenticatedUser.phoneNumber
        ),

      photoUrl:
        normaliseString(
          authenticatedUser.photoURL
        ),

      isAnonymous:
        authenticatedUser
          .isAnonymous ===
        true,

      providerIds:
        freezeArray(
          providerIds
        )
    });
  }

  function validateLearnerIdentity(
    learner
  ) {
    if (
      !isObject(
        learner
      )
    ) {
      throw createControllerError(
        ERROR_CODE
          .IDENTITY_RESOLUTION_FAILED,

        "The authenticated learner identity could not be resolved."
      );
    }

    if (
      !isNonEmptyString(
        learner.learnerUid
      )
    ) {
      throw createControllerError(
        ERROR_CODE
          .IDENTITY_RESOLUTION_FAILED,

        "The authenticated learner UID is unavailable.",

        {
          field:
            "learnerUid"
        }
      );
    }

    if (
      learner.isAnonymous ===
      true
    ) {
      throw createControllerError(
        ERROR_CODE
          .AUTH_REQUIRED,

        "Anonymous authentication cannot be used for Bridge Programme registration.",

        {
          learnerUid:
            learner.learnerUid
        }
      );
    }

    return learner;
  }

  /* ==========================================================
     CURRENT AUTHENTICATED USER
  ========================================================== */

  function getCurrentAuthenticatedUser() {
    const dependencies =
      assertRequiredDependencies();

    const authenticatedUser =
      dependencies
        .firebaseAuth
        .currentUser;

    if (
      !authenticatedUser ||
      !isNonEmptyString(
        authenticatedUser.uid
      )
    ) {
      throw createControllerError(
        ERROR_CODE
          .AUTH_REQUIRED,

        "An authenticated learner is required to access the Bridge Programme registration journey."
      );
    }

    return authenticatedUser;
  }

  /* ==========================================================
     AUTHENTICATION WAITING
  ========================================================== */

  async function waitForAuthenticatedUser(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const requestedTimeoutMs =
      normaliseNumber(
        safeOptions.timeoutMs,
        10000
      );

    const governedTimeoutMs =
      requestedTimeoutMs >
      0
        ? requestedTimeoutMs
        : 10000;

    const dependencies =
      assertRequiredDependencies();

    const firebaseAuth =
      dependencies.firebaseAuth;

    if (
      firebaseAuth.currentUser &&
      isNonEmptyString(
        firebaseAuth
          .currentUser
          .uid
      )
    ) {
      return firebaseAuth
        .currentUser;
    }

    if (
      typeof firebaseAuth
        .onAuthStateChanged !==
      "function"
    ) {
      throw createControllerError(
        ERROR_CODE
          .AUTH_REQUIRED,

        "Firebase Authentication state monitoring is unavailable."
      );
    }

    return new Promise(
      function waitForAuthentication(
        resolve,
        reject
      ) {
        let settled =
          false;

        let unsubscribe =
          null;

        const complete =
          function completeAuthenticationWait(
            callback
          ) {
            if (settled) {
              return;
            }

            settled =
              true;

            global.clearTimeout(
              timeoutHandle
            );

            if (
              typeof unsubscribe ===
              "function"
            ) {
              try {
                unsubscribe();
              } catch (
                unsubscribeError
              ) {
                console.warn(
                  `[${CONTROLLER_NAME}] Unable to unsubscribe from Firebase Authentication state monitoring.`,
                  unsubscribeError
                );
              }
            }

            callback();
          };

        const timeoutHandle =
          global.setTimeout(
            function handleTimeout() {
              complete(
                function rejectTimeout() {
                  reject(
                    createControllerError(
                      ERROR_CODE
                        .AUTH_REQUIRED,

                      "Timed out while waiting for an authenticated learner.",

                      {
                        timeoutMs:
                          governedTimeoutMs
                      }
                    )
                  );
                }
              );
            },

            governedTimeoutMs
          );

        try {
          unsubscribe =
            firebaseAuth
              .onAuthStateChanged(
                function handleUser(
                  authenticatedUser
                ) {
                  if (
                    !authenticatedUser ||
                    !isNonEmptyString(
                      authenticatedUser.uid
                    )
                  ) {
                    return;
                  }

                  complete(
                    function resolveUser() {
                      resolve(
                        authenticatedUser
                      );
                    }
                  );
                },

                function handleAuthError(
                  error
                ) {
                  complete(
                    function rejectAuthError() {
                      reject(
                        createControllerError(
                          ERROR_CODE
                            .AUTH_REQUIRED,

                          "Unable to resolve the authenticated learner.",

                          {
                            originalError:
                              error ||
                              null
                          }
                        )
                      );
                    }
                  );
                }
              );
        } catch (error) {
          complete(
            function rejectSubscriptionError() {
              reject(
                createControllerError(
                  ERROR_CODE
                    .AUTH_REQUIRED,

                  "Unable to subscribe to Firebase Authentication state changes.",

                  {
                    originalError:
                      error ||
                      null
                  }
                )
              );
            }
          );
        }
      }
    );
  }

  /* ==========================================================
     AUTHENTICATED LEARNER RESOLUTION
  ========================================================== */

  async function resolveAuthenticatedLearner(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    if (
      hasResolvedLearner() &&
      safeOptions.force !==
        true
    ) {
      return controllerState
        .learner;
    }

    if (
      identityResolutionPromise
    ) {
      return identityResolutionPromise;
    }

    identityResolutionPromise =
      (
        async function performIdentityResolution() {
          setState({
            status:
              CONTROLLER_STATUS
                .RESOLVING_IDENTITY,

            busy:
              true,

            error:
              null
          });

          try {
            assertRequiredDependencies();

            const authenticatedUser =
              safeOptions.waitForAuth ===
              false
                ? getCurrentAuthenticatedUser()
                : await waitForAuthenticatedUser({
                    timeoutMs:
                      safeOptions
                        .timeoutMs
                  });

            const learner =
              validateLearnerIdentity(
                buildLearnerViewModel(
                  authenticatedUser
                )
              );

            const nextStatus =
              controllerState
                .initialised ===
              true
                ? CONTROLLER_STATUS
                    .READY
                : CONTROLLER_STATUS
                    .IDLE;

            const nextState =
              setState({
                status:
                  nextStatus,

                busy:
                  false,

                learner,

                error:
                  null
              });

            dispatchControllerEvent(
              CONTROLLER_EVENT
                .IDENTITY_RESOLVED,

              {
                learner,

                state:
                  nextState
              }
            );

            return learner;
          } catch (error) {
            throw handleControllerError(
              error,

              ERROR_CODE
                .IDENTITY_RESOLUTION_FAILED,

              "Unable to resolve the authenticated learner identity."
            );
          }
        }
      )();

    try {
      return await identityResolutionPromise;
    } finally {
      identityResolutionPromise =
        null;
    }
  }

  /* ==========================================================
     LEARNER IDENTITY STATE
  ========================================================== */

  function hasResolvedLearner() {
    return Boolean(
      controllerState.learner &&
      isNonEmptyString(
        controllerState
          .learner
          .learnerUid
      )
    );
  }

  function getResolvedLearner() {
    return controllerState
      .learner;
  }

  function getLearnerIdentityReadiness() {
    const learner =
      controllerState.learner;

    return freezeObject({
      authenticated:
        Boolean(
          getReadiness()
            .authenticated
        ),

      learnerResolved:
        hasResolvedLearner(),

      learnerUid:
        hasResolvedLearner()
          ? learner.learnerUid
          : null,

      learnerEmail:
        hasResolvedLearner()
          ? learner.email ||
            null
          : null,

      emailVerified:
        hasResolvedLearner() &&
        learner.emailVerified ===
          true,

      anonymous:
        hasResolvedLearner() &&
        learner.isAnonymous ===
          true,

      ready:
        hasResolvedLearner() &&
        learner.isAnonymous !==
          true
    });
  }

  /* ==========================================================
     END OF BLOCK 3 OF 10

     Do not close the IIFE here.
     Block 4 must continue immediately below this section.
  ========================================================== */
  
  /* ==========================================================
     BLOCK 4 OF 10
     PROGRAMME CONTEXT AND PAGE CONTEXT
  ========================================================== */

  /* ==========================================================
     PROGRAMME CONTEXT VALIDATION
  ========================================================== */

  function validateProgrammeContext(
    input
  ) {
    const safeInput =
      isObject(
        input
      )
        ? input
        : {};

    const sourceProgrammeCode =
      normaliseProgrammeCode(
        safeInput
          .sourceProgrammeCode ||
        controllerState
          .sourceProgrammeCode
      );

    const targetProgrammeCode =
      normaliseProgrammeCode(
        safeInput
          .targetProgrammeCode ||
        controllerState
          .targetProgrammeCode
      );

    if (
      !isNonEmptyString(
        sourceProgrammeCode
      )
    ) {
      throw createControllerError(
        ERROR_CODE
          .INVALID_INPUT,

        "sourceProgrammeCode is required.",

        {
          field:
            "sourceProgrammeCode"
        }
      );
    }

    if (
      !isNonEmptyString(
        targetProgrammeCode
      )
    ) {
      throw createControllerError(
        ERROR_CODE
          .INVALID_INPUT,

        "targetProgrammeCode is required.",

        {
          field:
            "targetProgrammeCode"
        }
      );
    }

    if (
      sourceProgrammeCode ===
      targetProgrammeCode
    ) {
      throw createControllerError(
        ERROR_CODE
          .INVALID_INPUT,

        "Source and target programme codes must be different.",

        {
          sourceProgrammeCode,

          targetProgrammeCode
        }
      );
    }

    return freezeObject({
      sourceProgrammeCode,

      targetProgrammeCode
    });
  }

  /* ==========================================================
     PROGRAMME CONTEXT STATE
  ========================================================== */

  function hasProgrammeContext() {
    return Boolean(
      isNonEmptyString(
        controllerState
          .sourceProgrammeCode
      ) &&
      isNonEmptyString(
        controllerState
          .targetProgrammeCode
      ) &&
      controllerState
        .sourceProgrammeCode !==
      controllerState
        .targetProgrammeCode
    );
  }

  function getProgrammeContext() {
    return freezeObject({
      sourceProgrammeCode:
        controllerState
          .sourceProgrammeCode,

      targetProgrammeCode:
        controllerState
          .targetProgrammeCode
    });
  }

  function programmeContextMatches(
    programmeContext
  ) {
    if (
      !isObject(
        programmeContext
      )
    ) {
      return false;
    }

    return Boolean(
      hasProgrammeContext() &&
      controllerState
        .sourceProgrammeCode ===
        programmeContext
          .sourceProgrammeCode &&
      controllerState
        .targetProgrammeCode ===
        programmeContext
          .targetProgrammeCode
    );
  }

  function clearJourneyResolutionPromises() {
    eligibilityResolutionPromise =
      null;

    offerResolutionPromise =
      null;

    registrationResolutionPromise =
      null;

    registrationCreationPromise =
      null;

    paymentInitiationPromise =
      null;

    paymentStatusResolutionPromise =
      null;

    enrolmentResolutionPromise =
      null;

    registrationJourneyInitialisationPromise =
      null;
  }

  function setProgrammeContext(
    input
  ) {
    const programmeContext =
      validateProgrammeContext(
        input
      );

    if (
      programmeContextMatches(
        programmeContext
      )
    ) {
      return programmeContext;
    }

    /*
     * Changing the source or target programme invalidates all
     * previously resolved downstream journey information.
     */

    clearJourneyResolutionPromises();

    setState({
      sourceProgrammeCode:
        programmeContext
          .sourceProgrammeCode,

      targetProgrammeCode:
        programmeContext
          .targetProgrammeCode,

      eligibility:
        null,

      offer:
        null,

      registration:
        null,

      payment:
        null,

      enrolment:
        null,

      error:
        null
    });

    return programmeContext;
  }

  /* ==========================================================
     PAGE CONTEXT INITIALISATION
  ========================================================== */

  async function initialisePageContext(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    try {
      const requestedProgrammeContext =
        validateProgrammeContext({
          sourceProgrammeCode:
            safeOptions
              .sourceProgrammeCode,

          targetProgrammeCode:
            safeOptions
              .targetProgrammeCode
        });

      await initialise({
        force:
          safeOptions.force ===
          true,

        sourceProgrammeCode:
          requestedProgrammeContext
            .sourceProgrammeCode,

        targetProgrammeCode:
          requestedProgrammeContext
            .targetProgrammeCode
      });

      const programmeContext =
        setProgrammeContext(
          requestedProgrammeContext
        );

      const learner =
        await resolveAuthenticatedLearner({
          force:
            safeOptions
              .forceIdentity ===
            true,

          waitForAuth:
            safeOptions
              .waitForAuth !==
            false,

          timeoutMs:
            safeOptions
              .timeoutMs
        });

      const state =
        setState({
          status:
            CONTROLLER_STATUS
              .READY,

          initialised:
            true,

          busy:
            false,

          learner,

          sourceProgrammeCode:
            programmeContext
              .sourceProgrammeCode,

          targetProgrammeCode:
            programmeContext
              .targetProgrammeCode,

          error:
            null
        });

      return freezeObject({
        learner,

        programmeContext,

        state
      });
    } catch (error) {
      if (
        error &&
        error.name ===
          "BridgeRegistrationControllerError"
      ) {
        throw error;
      }

      throw handleControllerError(
        error,

        ERROR_CODE
          .INITIALISATION_FAILED,

        "Unable to initialise the Bridge Programme registration page context."
      );
    }
  }

  /* ==========================================================
     PAGE CONTEXT READINESS
  ========================================================== */

  function getPageContextReadiness() {
    const controllerInitialised =
      controllerState
        .initialised ===
      true;

    const learnerResolved =
      hasResolvedLearner();

    const programmeContextResolved =
      hasProgrammeContext();

    return freezeObject({
      controllerInitialised,

      learnerResolved,

      programmeContextResolved,

      ready:
        controllerInitialised &&
        learnerResolved &&
        programmeContextResolved,

      learnerUid:
        learnerResolved
          ? controllerState
              .learner
              .learnerUid
          : null,

      learnerEmail:
        learnerResolved
          ? controllerState
              .learner
              .email ||
            null
          : null,

      sourceProgrammeCode:
        controllerState
          .sourceProgrammeCode,

      targetProgrammeCode:
        controllerState
          .targetProgrammeCode,

      status:
        controllerState.status,

      busy:
        controllerState.busy ===
        true,

      error:
        controllerState.error
    });
  }

  /* ==========================================================
     PAGE CONTEXT ASSERTION
  ========================================================== */

  function assertPageContextReady() {
    const readiness =
      getPageContextReadiness();

    if (
      readiness.ready ===
      true
    ) {
      return readiness;
    }

    const missingContext =
      [];

    if (
      readiness
        .controllerInitialised !==
      true
    ) {
      missingContext.push(
        "Controller initialisation"
      );
    }

    if (
      readiness
        .learnerResolved !==
      true
    ) {
      missingContext.push(
        "Authenticated learner identity"
      );
    }

    if (
      readiness
        .programmeContextResolved !==
      true
    ) {
      missingContext.push(
        "Programme context"
      );
    }

    throw createControllerError(
      ERROR_CODE
        .INITIALISATION_FAILED,

      "The Bridge Programme registration page context is not ready.",

      {
        missingContext:
          freezeArray(
            missingContext
          ),

        readiness
      }
    );
  }

  /* ==========================================================
     END OF BLOCK 4 OF 10

     Do not close the IIFE here.
     Block 5 must continue immediately below this section.
  ========================================================== */
  
      /* ==========================================================
     BLOCK 5 OF 10
     ELIGIBILITY AND CREDENTIAL RESOLUTION
  ========================================================== */

  /* ==========================================================
     PROGRAMME AND ELIGIBILITY SERVICE ACCESS
  ========================================================== */

  function getRequiredProgramService() {
    const dependencies =
      assertRequiredDependencies({
        requireProgramService:
          true
      });

    return dependencies
      .programService;
  }

  function getRequiredEligibilityService() {
    const dependencies =
      assertRequiredDependencies({
        requireEligibilityService:
          true
      });

    return dependencies
      .eligibilityService;
  }

  function getRequiredBridgeProgramService() {
    const dependencies =
      assertRequiredDependencies({
        requireBridgeProgramService:
          true
      });

    return dependencies
      .bridgeProgramService;
  }

  /* ==========================================================
     SERVICE METHOD RESOLUTION
  ========================================================== */

  function findServiceMethod(
    service,
    methodNames
  ) {
    if (
      !service ||
      typeof service !==
        "object" ||
      !Array.isArray(
        methodNames
      )
    ) {
      return null;
    }

    for (
      let index = 0;
      index <
        methodNames.length;
      index += 1
    ) {
      const methodName =
        normaliseString(
          methodNames[index]
        );

      if (
        !isNonEmptyString(
          methodName
        )
      ) {
        continue;
      }

      if (
        typeof service[
          methodName
        ] !==
        "function"
      ) {
        continue;
      }

      return freezeObject({
        methodName,

        method:
          service[
            methodName
          ].bind(
            service
          )
      });
    }

    return null;
  }

  async function invokeServiceMethod(
    service,
    methodNames,
    payload,
    errorCode,
    errorMessage
  ) {
    const resolvedMethod =
      findServiceMethod(
        service,
        methodNames
      );

    if (!resolvedMethod) {
      throw createControllerError(
        ERROR_CODE
          .DEPENDENCY_UNAVAILABLE,

        errorMessage ||
          "The required service method is unavailable.",

        {
          expectedMethods:
            freezeArray(
              methodNames
            )
        }
      );
    }

    try {
      const result =
        await resolvedMethod
          .method(
            payload
          );

      return freezeObject({
        methodName:
          resolvedMethod
            .methodName,

        result:
          result ===
          undefined
            ? null
            : result
      });
    } catch (error) {
      if (
        error &&
        error.name ===
          "BridgeRegistrationControllerError"
      ) {
        throw error;
      }

      throw createControllerError(
        errorCode ||
          ERROR_CODE
            .INTERNAL_ERROR,

        errorMessage ||
          "A Bridge Programme service operation failed.",

        {
          methodName:
            resolvedMethod
              .methodName,

          originalError:
            error ||
            null
        }
      );
    }
  }

  /* ==========================================================
     ELIGIBILITY INPUT
  ========================================================== */

  function buildEligibilityInput(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const learner =
      validateLearnerIdentity(
        safeOptions.learner ||
        controllerState.learner
      );

    const programmeContext =
      validateProgrammeContext({
        sourceProgrammeCode:
          safeOptions
            .sourceProgrammeCode,

        targetProgrammeCode:
          safeOptions
            .targetProgrammeCode
      });

    return freezeObject({
      learnerUid:
        learner.learnerUid,

      learnerEmail:
        learner.email ||
        "",

      emailVerified:
        learner.emailVerified ===
        true,

      sourceProgrammeCode:
        programmeContext
          .sourceProgrammeCode,

      targetProgrammeCode:
        programmeContext
          .targetProgrammeCode
    });
  }

  /* ==========================================================
     ELIGIBILITY RESULT NORMALISATION
  ========================================================== */

  function normaliseEligibilityResult(
    rawResult,
    input
  ) {
    const result =
      isObject(
        rawResult
      )
        ? rawResult
        : {};

    const governedInput =
      isObject(
        input
      )
        ? input
        : {};

    const eligible =
      result.eligible ===
        true ||
      result.isEligible ===
        true ||
      result.allowed ===
        true ||
      result.approved ===
        true;

    const status =
      normaliseString(
        result.status
      ) ||
      (
        eligible
          ? "ELIGIBLE"
          : "NOT_ELIGIBLE"
      );

    const reasonCode =
      normaliseString(
        result.reasonCode ||
        result.code
      );

    const reason =
      normaliseString(
        result.reason ||
        result.message ||
        result.explanation
      );

    const academicEligibility =
      isObject(
        result.academicEligibility
      )
        ? freezeObject(
            result
              .academicEligibility
          )
        : (
            isObject(
              result.academic
            )
              ? freezeObject(
                  result.academic
                )
              : null
          );

    const commercialEligibility =
      isObject(
        result
          .commercialEligibility
      )
        ? freezeObject(
            result
              .commercialEligibility
          )
        : (
            isObject(
              result.commercial
            )
              ? freezeObject(
                  result.commercial
                )
              : null
          );

    const blockingConditions =
      Array.isArray(
        result.blockingConditions
      )
        ? result
            .blockingConditions
            .map(
              function normaliseBlockingCondition(
                condition
              ) {
                return normaliseString(
                  condition
                );
              }
            )
            .filter(
              isNonEmptyString
            )
        : [];

    return freezeObject({
      eligible,

      status:
        status.toUpperCase(),

      reasonCode:
        reasonCode.toUpperCase(),

      reason,

      learnerUid:
        normaliseString(
          governedInput
            .learnerUid
        ),

      learnerEmail:
        normaliseEmail(
          governedInput
            .learnerEmail
        ),

      sourceProgrammeCode:
        normaliseProgrammeCode(
          governedInput
            .sourceProgrammeCode
        ),

      targetProgrammeCode:
        normaliseProgrammeCode(
          governedInput
            .targetProgrammeCode
        ),

      academicEligibility,

      commercialEligibility,

      prerequisiteSatisfied:
        result
          .prerequisiteSatisfied ===
        true,

      blockingConditions:
        freezeArray(
          blockingConditions
        ),

      resolvedAt:
        nowIsoString(),

      raw:
        freezeObject(
          result
        )
    });
  }

  /* ==========================================================
     VISIBLE CREDENTIAL RESOLUTION
  ========================================================== */

  function resolveVisibleCredentials(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    /*
     * Explicit controller input has the highest authority.
     */

    if (
      Array.isArray(
        safeOptions.credentials
      )
    ) {
      return freezeArray(
        safeOptions.credentials
      );
    }

    /*
     * Prefer the governed CredentialService when available.
     */

    if (
      global.CredentialService &&
      typeof global
        .CredentialService
        .getCredentials ===
        "function"
    ) {
      try {
        const credentials =
          global
            .CredentialService
            .getCredentials();

        if (
          Array.isArray(
            credentials
          ) &&
          credentials.length >
            0
        ) {
          return freezeArray(
            credentials
          );
        }
      } catch (error) {
        console.warn(
          `[${CONTROLLER_NAME}] CredentialService.getCredentials() failed.`,
          error
        );
      }
    }

    /*
     * Support the existing portal-level credential cache.
     */

    if (
      Array.isArray(
        global.portalCredentials
      ) &&
      global.portalCredentials
        .length >
        0
    ) {
      return freezeArray(
        global.portalCredentials
      );
    }

    /*
     * Support the entitlement resolver's published portal
     * entitlement data.
     */

    const portalEntitlementData =
      global.portalEntitlementData;

    if (
      isObject(
        portalEntitlementData
      ) &&
      Array.isArray(
        portalEntitlementData
          .visibleCredentials
      ) &&
      portalEntitlementData
        .visibleCredentials
        .length >
        0
    ) {
      return freezeArray(
        portalEntitlementData
          .visibleCredentials
      );
    }

    /*
     * Support the alternative entitlement-state contract.
     */

    const entitlements =
      global
        .__AAIU_ENTITLEMENTS__;

    if (
      isObject(
        entitlements
      ) &&
      Array.isArray(
        entitlements
          .visibleCredentials
      ) &&
      entitlements
        .visibleCredentials
        .length >
        0
    ) {
      return freezeArray(
        entitlements
          .visibleCredentials
      );
    }

    /*
     * EligibilityService may expose its own governed view.
     */

    const eligibilityService =
      getEligibilityService();

    if (
      eligibilityService &&
      typeof eligibilityService
        .getVisibleCredentials ===
        "function"
    ) {
      try {
        const credentials =
          eligibilityService
            .getVisibleCredentials();

        if (
          Array.isArray(
            credentials
          ) &&
          credentials.length >
            0
        ) {
          return freezeArray(
            credentials
          );
        }
      } catch (error) {
        console.warn(
          `[${CONTROLLER_NAME}] EligibilityService.getVisibleCredentials() failed.`,
          error
        );
      }
    }

    return freezeArray(
      []
    );
  }

  /* ==========================================================
     CREDENTIAL SERVICE READINESS
  ========================================================== */

  function isCredentialServiceInitialised() {
    if (
      !global.CredentialService ||
      typeof global
        .CredentialService
        .isInitialized !==
        "function"
    ) {
      return false;
    }

    try {
      return global
        .CredentialService
        .isInitialized() ===
        true;
    } catch (error) {
      console.warn(
        `[${CONTROLLER_NAME}] CredentialService.isInitialized() failed.`,
        error
      );

      return false;
    }
  }

  function resolveCredentialWaitTimeout(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const requestedTimeoutMs =
      normaliseNumber(
        safeOptions
          .credentialTimeoutMs ??
        safeOptions.timeoutMs,
        10000
      );

    if (
      requestedTimeoutMs <=
      0
    ) {
      return 10000;
    }

    return Math.min(
      requestedTimeoutMs,
      15000
    );
  }

  async function waitForVisibleCredentials(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    /*
     * Explicit credentials are authoritative, including an
     * explicitly supplied empty array.
     */

    if (
      Array.isArray(
        safeOptions.credentials
      )
    ) {
      return freezeArray(
        safeOptions.credentials
      );
    }

    const immediateCredentials =
      resolveVisibleCredentials(
        safeOptions
      );

    if (
      immediateCredentials.length >
      0
    ) {
      return immediateCredentials;
    }

    /*
     * When CredentialService has completed and published an
     * empty collection, the empty result is authoritative.
     */

    if (
      isCredentialServiceInitialised()
    ) {
      return freezeArray(
        []
      );
    }

    const documentTarget =
      global.document;

    if (
      !documentTarget ||
      typeof documentTarget
        .addEventListener !==
        "function" ||
      typeof documentTarget
        .removeEventListener !==
        "function"
    ) {
      return resolveVisibleCredentials(
        safeOptions
      );
    }

    const governedTimeoutMs =
      resolveCredentialWaitTimeout(
        safeOptions
      );

    return new Promise(
      function waitForCredentialService(
        resolve
      ) {
        let settled =
          false;

        let timeoutHandle =
          null;

        const complete =
          function completeCredentialWait(
            credentials,
            reason
          ) {
            if (settled) {
              return;
            }

            settled =
              true;

            if (timeoutHandle) {
              global.clearTimeout(
                timeoutHandle
              );
            }

            documentTarget
              .removeEventListener(
                "credentials:service-ready",
                handleCredentialServiceReady
              );

            documentTarget
              .removeEventListener(
                "credentials:service-error",
                handleCredentialServiceError
              );

            const governedCredentials =
              Array.isArray(
                credentials
              )
                ? credentials
                : [];

            console.info(
              `[${CONTROLLER_NAME}] Credential readiness completed.`,
              {
                reason:
                  normaliseString(
                    reason
                  ) ||
                  "UNKNOWN",

                credentialCount:
                  governedCredentials
                    .length
              }
            );

            resolve(
              freezeArray(
                governedCredentials
              )
            );
          };

        const resolveCurrentCredentials =
          function resolveCurrentCredentials() {
            return resolveVisibleCredentials(
              safeOptions
            );
          };

        function handleCredentialServiceReady(
          event
        ) {
          const eventDetail =
            event &&
            isObject(
              event.detail
            )
              ? event.detail
              : {};

          const eventCredentials =
            Array.isArray(
              eventDetail.credentials
            )
              ? eventDetail.credentials
              : [];

          if (
            eventCredentials.length >
            0
          ) {
            complete(
              eventCredentials,
              "CREDENTIAL_SERVICE_READY_EVENT"
            );

            return;
          }

          complete(
            resolveCurrentCredentials(),
            "CREDENTIAL_SERVICE_READY_EMPTY"
          );
        }

        function handleCredentialServiceError(
          event
        ) {
          console.warn(
            `[${CONTROLLER_NAME}] CredentialService reported an error while eligibility was waiting.`,
            event &&
            event.detail
              ? event.detail
              : null
          );

          complete(
            resolveCurrentCredentials(),
            "CREDENTIAL_SERVICE_ERROR"
          );
        }

        documentTarget
          .addEventListener(
            "credentials:service-ready",
            handleCredentialServiceReady
          );

        documentTarget
          .addEventListener(
            "credentials:service-error",
            handleCredentialServiceError
          );

        /*
         * Race-safe recheck after listeners are attached.
         */

        const credentialsAfterBinding =
          resolveCurrentCredentials();

        if (
          credentialsAfterBinding.length >
          0
        ) {
          complete(
            credentialsAfterBinding,
            "CREDENTIALS_AVAILABLE_AFTER_BINDING"
          );

          return;
        }

        if (
          isCredentialServiceInitialised()
        ) {
          complete(
            [],
            "CREDENTIAL_SERVICE_ALREADY_INITIALISED_EMPTY"
          );

          return;
        }

        timeoutHandle =
          global.setTimeout(
            function handleCredentialWaitTimeout() {
              complete(
                resolveCurrentCredentials(),
                "CREDENTIAL_WAIT_TIMEOUT"
              );
            },

            governedTimeoutMs
          );
      }
    );
  }

  /* ==========================================================
     CREDENTIAL PROGRAMME CODE RESOLUTION
  ========================================================== */

  function resolveCredentialProgrammeCode(
    credential
  ) {
    if (
      !isObject(
        credential
      )
    ) {
      return "";
    }

    return normaliseProgrammeCode(
      credential
        .programmeCode ||
      credential
        .programCode ||
      credential
        .programme_code ||
      credential
        .program_code ||
      credential
        .credentialProgrammeCode ||
      credential
        .credentialProgramCode ||
      credential
        .credentialCode ||
      credential
        .credential_code ||
      credential
        .credentialType ||
      credential
        .credential_type
    );
  }

  function resolveCredentialId(
    credential
  ) {
    if (
      !isObject(
        credential
      )
    ) {
      return "";
    }

    return normaliseString(
      credential
        .credentialId ||
      credential
        .credential_id ||
      credential
        .credentialID ||
      credential.id ||
      credential.documentId
    ).toUpperCase();
  }

  function resolveSourceCredential(
    credentials,
    sourceProgrammeCode
  ) {
    const governedCredentials =
      Array.isArray(
        credentials
      )
        ? credentials
        : [];

    const governedSourceProgrammeCode =
      normaliseProgrammeCode(
        sourceProgrammeCode
      );

    if (
      !isNonEmptyString(
        governedSourceProgrammeCode
      )
    ) {
      return null;
    }

    return (
      governedCredentials
        .find(
          function findSourceCredential(
            credential
          ) {
            return (
              resolveCredentialProgrammeCode(
                credential
              ) ===
              governedSourceProgrammeCode
            );
          }
        ) ||
      null
    );
  }

  /* ==========================================================
     COMMERCIAL MODEL PROGRAMME RESOLUTION
  ========================================================== */

  function resolveCommercialSourceProgrammeCode(
    commercialModel
  ) {
    if (
      !isObject(
        commercialModel
      )
    ) {
      return "";
    }

    const currentProgram =
      isObject(
        commercialModel
          .currentProgram
      )
        ? commercialModel
            .currentProgram
        : {};

    return normaliseProgrammeCode(
      currentProgram.code ||
      currentProgram
        .programmeCode ||
      currentProgram
        .programCode ||
      currentProgram
        .programme_code ||
      currentProgram
        .program_code ||
      commercialModel
        .sourceProgrammeCode ||
      commercialModel
        .sourceProgramCode
    );
  }

  function resolveCommercialTargetProgrammeCode(
    commercialModel
  ) {
    if (
      !isObject(
        commercialModel
      )
    ) {
      return "";
    }

    const nextProgram =
      commercialModel
        .nextProgram;

    if (
      isObject(
        nextProgram
      )
    ) {
      return normaliseProgrammeCode(
        nextProgram.code ||
        nextProgram
          .programmeCode ||
        nextProgram
          .programCode ||
        nextProgram
          .programme_code ||
        nextProgram
          .program_code
      );
    }

    return normaliseProgrammeCode(
      nextProgram ||
      commercialModel
        .targetProgrammeCode ||
      commercialModel
        .targetProgramCode ||
      commercialModel
        .programmeCode ||
      commercialModel
        .programCode
    );
  }

  /* ==========================================================
     BRIDGE RELATIONSHIP DEFINITION
  ========================================================== */

  function buildBridgeRelationshipDefinition(
    input,
    commercialModel
  ) {
    const governedInput =
      isObject(
        input
      )
        ? input
        : {};

    const governedCommercialModel =
      isObject(
        commercialModel
      )
        ? commercialModel
        : {};

    const sourceProgrammeCode =
      normaliseProgrammeCode(
        governedInput
          .sourceProgrammeCode
      );

    const targetProgrammeCode =
      normaliseProgrammeCode(
        governedInput
          .targetProgrammeCode
      );

    return freezeObject({
      id:
        [
          sourceProgrammeCode,
          targetProgrammeCode
        ].join(
          "_TO_"
        ),

      source:
        sourceProgrammeCode,

      target:
        targetProgrammeCode,

      relationship:
        normaliseString(
          governedCommercialModel
            .relationshipType ||
          governedCommercialModel
            .relationship ||
          "CAPABILITY_UPGRADE"
        ).toUpperCase(),

      title:
        normaliseString(
          governedCommercialModel
            .bridgeProgram ||
          governedCommercialModel
            .bridgeProgramme ||
          governedCommercialModel
            .title
        ) ||
        "Bridge Programme",

      description:
        normaliseString(
          governedCommercialModel
            .description
        ),

      active:
        true,

      status:
        "ACTIVE"
    });
  }

  /* ==========================================================
     ACADEMIC BRIDGE MATCHING
  ========================================================== */

  function findAcademicBridge(
    bridgeOpportunities,
    input
  ) {
    const opportunities =
      Array.isArray(
        bridgeOpportunities
      )
        ? bridgeOpportunities
        : [];

    const governedInput =
      isObject(
        input
      )
        ? input
        : {};

    return (
      opportunities.find(
        function findMatchingBridge(
          opportunity
        ) {
          if (
            !isObject(
              opportunity
            )
          ) {
            return false;
          }

          const sourceProgrammeCode =
            normaliseProgrammeCode(
              opportunity
                .sourceProgram ||
              opportunity
                .sourceProgramme ||
              opportunity
                .sourceProgrammeCode ||
              opportunity
                .sourceProgramCode ||
              opportunity.source
            );

          const targetProgrammeCode =
            normaliseProgrammeCode(
              opportunity
                .targetProgram ||
              opportunity
                .targetProgramme ||
              opportunity
                .targetProgrammeCode ||
              opportunity
                .targetProgramCode ||
              opportunity.target
            );

          return (
            sourceProgrammeCode ===
              governedInput
                .sourceProgrammeCode &&
            targetProgrammeCode ===
              governedInput
                .targetProgrammeCode
          );
        }
      ) ||
      null
    );
  }

  /* ==========================================================
     ELIGIBILITY RESOLUTION
  ========================================================== */

  async function resolveEligibility(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    if (
      hasResolvedEligibility() &&
      safeOptions.force !==
        true
    ) {
      return controllerState
        .eligibility;
    }

    if (
      eligibilityResolutionPromise
    ) {
      return eligibilityResolutionPromise;
    }

    eligibilityResolutionPromise =
      (
        async function performEligibilityResolution() {
          setState({
            status:
              CONTROLLER_STATUS
                .RESOLVING_ELIGIBILITY,

            busy:
              true,

            eligibility:
              safeOptions.force ===
              true
                ? null
                : controllerState
                    .eligibility,

            offer:
              safeOptions.force ===
              true
                ? null
                : controllerState
                    .offer,

            registration:
              safeOptions.force ===
              true
                ? null
                : controllerState
                    .registration,

            payment:
              safeOptions.force ===
              true
                ? null
                : controllerState
                    .payment,

            enrolment:
              safeOptions.force ===
              true
                ? null
                : controllerState
                    .enrolment,

            error:
              null
          });

          try {
            assertPageContextReady();

            const eligibilityService =
              getRequiredEligibilityService();

            const bridgeProgramService =
              getRequiredBridgeProgramService();

            const input =
              buildEligibilityInput(
                safeOptions
              );

            if (
              typeof eligibilityService
                .getUpgradeModel !==
              "function"
            ) {
              throw createControllerError(
                ERROR_CODE
                  .DEPENDENCY_UNAVAILABLE,

                "EligibilityService.getUpgradeModel() is unavailable.",

                {
                  expectedMethod:
                    "getUpgradeModel"
                }
              );
            }

            if (
              typeof bridgeProgramService
                .resolveBridgePrograms !==
              "function"
            ) {
              throw createControllerError(
                ERROR_CODE
                  .DEPENDENCY_UNAVAILABLE,

                "BridgeProgramService.resolveBridgePrograms() is unavailable.",

                {
                  expectedMethod:
                    "resolveBridgePrograms"
                }
              );
            }

            /*
             * Credential readiness must be resolved before the
             * commercial EligibilityService is invoked because
             * EligibilityService consumes the same governed
             * credential publication sources.
             */

            const governedCredentials =
              await waitForVisibleCredentials(
                safeOptions
              );

            const sourceCredential =
              resolveSourceCredential(
                governedCredentials,
                input
                  .sourceProgrammeCode
              );

            const upgradeModel =
              await eligibilityService
                .getUpgradeModel();

            const safeUpgradeModel =
              isObject(
                upgradeModel
              )
                ? upgradeModel
                : {};

            const resolvedSourceProgrammeCode =
              resolveCommercialSourceProgrammeCode(
                safeUpgradeModel
              );

            const resolvedTargetProgrammeCode =
              resolveCommercialTargetProgrammeCode(
                safeUpgradeModel
              );

            const sourceProgrammeMatches =
              resolvedSourceProgrammeCode ===
              input
                .sourceProgrammeCode;

            const targetProgrammeMatches =
              resolvedTargetProgrammeCode ===
              input
                .targetProgrammeCode;

            const commercialEligible =
              safeUpgradeModel
                .eligible ===
              true;

            const relationshipDefinition =
              buildBridgeRelationshipDefinition(
                input,
                safeUpgradeModel
              );

            const bridgeOpportunitiesResult =
              await Promise.resolve(
                bridgeProgramService
                  .resolveBridgePrograms(
                    governedCredentials,

                    {
                      bridgePrograms:
                        [
                          relationshipDefinition
                        ]
                    }
                  )
              );

            const bridgeOpportunities =
              Array.isArray(
                bridgeOpportunitiesResult
              )
                ? bridgeOpportunitiesResult
                : [];

            const academicBridge =
              findAcademicBridge(
                bridgeOpportunities,
                input
              );

            const academicEligible =
              Boolean(
                academicBridge
              );

            const contextMatches =
              sourceProgrammeMatches &&
              targetProgrammeMatches;

            const eligible =
              commercialEligible &&
              academicEligible &&
              contextMatches;

            let reason =
              normaliseString(
                safeUpgradeModel
                  .reason
              );

            let reasonCode =
              "";

            if (
              governedCredentials.length ===
              0
            ) {
              reasonCode =
                "CREDENTIALS_UNAVAILABLE";

              reason =
                "The learner credential portfolio was not available for Bridge Programme eligibility resolution.";
            } else if (
              !sourceCredential
            ) {
              reasonCode =
                "SOURCE_CREDENTIAL_UNAVAILABLE";

              reason =
                "The required source credential was not found in the learner's governed credential portfolio.";
            } else if (
              commercialEligible &&
              !sourceProgrammeMatches
            ) {
              reasonCode =
                "SOURCE_PROGRAMME_MISMATCH";

              reason =
                "The resolved current programme does not match the requested Bridge Programme source.";
            } else if (
              commercialEligible &&
              !targetProgrammeMatches
            ) {
              reasonCode =
                "TARGET_PROGRAMME_MISMATCH";

              reason =
                "The resolved upgrade programme does not match the requested Bridge Programme destination.";
            } else if (
              commercialEligible &&
              !academicEligible
            ) {
              reasonCode =
                "ACADEMIC_BRIDGE_UNAVAILABLE";

              reason =
                "The learner does not currently satisfy the academic requirements for this Bridge Programme.";
            } else if (
              !commercialEligible
            ) {
              reasonCode =
                normaliseString(
                  safeUpgradeModel
                    .reasonCode
                ).toUpperCase() ||
                "COMMERCIAL_ELIGIBILITY_UNAVAILABLE";
            }

            if (
              eligible &&
              !isNonEmptyString(
                reason
              )
            ) {
              reason =
                "The learner satisfies the academic and commercial requirements for this Bridge Programme.";
            }

            const eligibility =
              normaliseEligibilityResult(
                {
                  eligible,

                  status:
                    eligible
                      ? "ELIGIBLE"
                      : "NOT_ELIGIBLE",

                  reasonCode,

                  reason,

                  prerequisiteSatisfied:
                    academicEligible,

                  academicEligibility:
                    academicBridge
                      ? freezeObject({
                          ...academicBridge,

                          credentialId:
                            resolveCredentialId(
                              sourceCredential
                            ),

                          sourceCredential:
                            sourceCredential
                              ? freezeObject(
                                  sourceCredential
                                )
                              : null
                        })
                      : null,

                  commercialEligibility:
                    safeUpgradeModel,

                  blockingConditions:
                    eligible
                      ? []
                      : [
                          reasonCode ||
                          "BRIDGE_PROGRAMME_UNAVAILABLE"
                        ]
                },

                input
              );

            const nextStatus =
              eligibility.eligible
                ? CONTROLLER_STATUS
                    .READY
                : CONTROLLER_STATUS
                    .NOT_ELIGIBLE;

            const nextState =
              setState({
                status:
                  nextStatus,

                busy:
                  false,

                learner:
                  controllerState
                    .learner,

                sourceProgrammeCode:
                  input
                    .sourceProgrammeCode,

                targetProgrammeCode:
                  input
                    .targetProgrammeCode,

                eligibility,

                offer:
                  eligibility.eligible
                    ? controllerState
                        .offer
                    : null,

                registration:
                  eligibility.eligible
                    ? controllerState
                        .registration
                    : null,

                payment:
                  eligibility.eligible
                    ? controllerState
                        .payment
                    : null,

                enrolment:
                  eligibility.eligible
                    ? controllerState
                        .enrolment
                    : null,

                error:
                  null
              });

            dispatchControllerEvent(
              CONTROLLER_EVENT
                .ELIGIBILITY_RESOLVED,

              {
                eligibility,

                commercialEligibility:
                  safeUpgradeModel,

                academicEligibility:
                  academicBridge,

                credentialCount:
                  governedCredentials
                    .length,

                credentialsReady:
                  governedCredentials
                    .length >
                  0,

                sourceCredential:
                  sourceCredential
                    ? freezeObject(
                        sourceCredential
                      )
                    : null,

                serviceMethod:
                  "CredentialService readiness + EligibilityService.getUpgradeModel + BridgeProgramService.resolveBridgePrograms",

                state:
                  nextState
              }
            );

            return eligibility;
          } catch (error) {
            throw handleControllerError(
              error,

              ERROR_CODE
                .ELIGIBILITY_RESOLUTION_FAILED,

              "Unable to resolve Bridge Programme eligibility."
            );
          }
        }
      )();

    try {
      return await eligibilityResolutionPromise;
    } finally {
      eligibilityResolutionPromise =
        null;
    }
  }

  /* ==========================================================
     ELIGIBILITY STATE
  ========================================================== */

  function hasResolvedEligibility() {
    return Boolean(
      controllerState
        .eligibility &&
      typeof controllerState
        .eligibility
        .eligible ===
        "boolean"
    );
  }

  function getResolvedEligibility() {
    return controllerState
      .eligibility;
  }

  function isLearnerEligible() {
    return Boolean(
      hasResolvedEligibility() &&
      controllerState
        .eligibility
        .eligible ===
        true
    );
  }

  /* ==========================================================
     ELIGIBILITY READINESS
  ========================================================== */

  function getEligibilityReadiness() {
    const pageContextReadiness =
      getPageContextReadiness();

    const readiness =
      getReadiness();

    const eligibility =
      controllerState
        .eligibility;

    const visibleCredentials =
      resolveVisibleCredentials(
        {}
      );

    return freezeObject({
      pageContextReady:
        pageContextReadiness.ready,

      eligibilityServiceAvailable:
        readiness
          .eligibilityServiceAvailable,

      bridgeProgramServiceAvailable:
        readiness
          .bridgeProgramServiceAvailable,

      requiredServicesAvailable:
        readiness
          .eligibilityServiceAvailable &&
        readiness
          .bridgeProgramServiceAvailable,

      credentialServiceAvailable:
        Boolean(
          global.CredentialService
        ),

      credentialServiceInitialised:
        isCredentialServiceInitialised(),

      credentialsAvailable:
        visibleCredentials.length >
        0,

      credentialCount:
        visibleCredentials.length,

      eligibilityResolved:
        hasResolvedEligibility(),

      learnerEligible:
        isLearnerEligible(),

      eligibilityStatus:
        hasResolvedEligibility()
          ? eligibility.status
          : null,

      reasonCode:
        hasResolvedEligibility()
          ? eligibility
              .reasonCode ||
            null
          : null,

      reason:
        hasResolvedEligibility()
          ? eligibility.reason ||
            null
          : null,

      academicEligibilityResolved:
        Boolean(
          hasResolvedEligibility() &&
          eligibility
            .academicEligibility
        ),

      commercialEligibilityResolved:
        Boolean(
          hasResolvedEligibility() &&
          eligibility
            .commercialEligibility
        ),

      readyForOfferResolution:
        pageContextReadiness.ready &&
        readiness
          .eligibilityServiceAvailable &&
        readiness
          .bridgeProgramServiceAvailable &&
        isLearnerEligible()
    });
  }

  /* ==========================================================
     END OF BLOCK 5 OF 10

     Do not close the IIFE here.
     Block 6 must continue immediately below this section.
  ========================================================== */

    /* ==========================================================
     BLOCK 6 OF 10
     COMMERCIAL OFFER RESOLUTION
  ========================================================== */

  /* ==========================================================
     OFFER INPUT
  ========================================================== */

  function buildOfferInput(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const learner =
      validateLearnerIdentity(
        safeOptions.learner ||
        controllerState.learner
      );

    const programmeContext =
      validateProgrammeContext({
        sourceProgrammeCode:
          safeOptions
            .sourceProgrammeCode,

        targetProgrammeCode:
          safeOptions
            .targetProgrammeCode
      });

    const eligibility =
      safeOptions.eligibility ||
      controllerState
        .eligibility;

    if (
      !isObject(
        eligibility
      ) ||
      eligibility.eligible !==
        true
    ) {
      throw createControllerError(
        ERROR_CODE
          .OFFER_RESOLUTION_FAILED,

        "A confirmed eligible learner is required before resolving a Bridge Programme offer.",

        {
          eligibility:
            eligibility ||
            null
        }
      );
    }

    return freezeObject({
      learnerUid:
        learner.learnerUid,

      learnerEmail:
        learner.email ||
        "",

      sourceProgrammeCode:
        programmeContext
          .sourceProgrammeCode,

      targetProgrammeCode:
        programmeContext
          .targetProgrammeCode,

      eligibility
    });
  }

  /* ==========================================================
     COMMERCIAL MODEL FIELD RESOLUTION
  ========================================================== */

  function resolveCommercialOfferCode(
    commercialModel,
    input
  ) {
    const model =
      isObject(
        commercialModel
      )
        ? commercialModel
        : {};

    const governedInput =
      isObject(
        input
      )
        ? input
        : {};

    const generatedOfferCode =
      [
        normaliseProgrammeCode(
          governedInput
            .sourceProgrammeCode
        ),

        normaliseProgrammeCode(
          governedInput
            .targetProgrammeCode
        ),

        "BRIDGE_OFFER"
      ].join(
        "_"
      );

    return normaliseString(
      model.offerCode ||
      model.offer_code ||
      model.campaignCode ||
      model.campaign_code ||
      model.code ||
      generatedOfferCode
    ).toUpperCase();
  }

  function resolveCommercialOfferId(
    commercialModel,
    offerCode
  ) {
    const model =
      isObject(
        commercialModel
      )
        ? commercialModel
        : {};

    return normaliseString(
      model.offerId ||
      model.offer_id ||
      model.campaignId ||
      model.campaign_id ||
      model.id ||
      offerCode
    );
  }

  function resolveCommercialCurrency(
    commercialModel
  ) {
    const model =
      isObject(
        commercialModel
      )
        ? commercialModel
        : {};

    return normaliseString(
      model.currency
    ).toUpperCase() ||
    "INR";
  }

  function resolveCommercialBaseAmount(
    commercialModel
  ) {
    const model =
      isObject(
        commercialModel
      )
        ? commercialModel
        : {};

    return normaliseNumber(
      model.baseAmount ??
      model.baseFee ??
      model.amount ??
      model.fee,
      0
    );
  }

  function resolveCommercialTaxAmount(
    commercialModel
  ) {
    const model =
      isObject(
        commercialModel
      )
        ? commercialModel
        : {};

    return normaliseNumber(
      model.taxAmount ??
      model.gstAmount ??
      model.tax,
      0
    );
  }

  function resolveCommercialTaxRate(
    commercialModel
  ) {
    const model =
      isObject(
        commercialModel
      )
        ? commercialModel
        : {};

    return normaliseNumber(
      model.taxRate ??
      model.gstRate,
      0
    );
  }

  function resolveCommercialTotalAmount(
    commercialModel,
    baseAmount,
    taxAmount
  ) {
    const model =
      isObject(
        commercialModel
      )
        ? commercialModel
        : {};

    return normaliseNumber(
      model.totalAmount ??
      model.totalPayable ??
      model.payableAmount,
      normaliseNumber(
        baseAmount,
        0
      ) +
      normaliseNumber(
        taxAmount,
        0
      )
    );
  }

  function resolveCommercialOfferValidity(
    commercialModel
  ) {
    const model =
      isObject(
        commercialModel
      )
        ? commercialModel
        : {};

    return freezeObject({
      validFrom:
        normaliseString(
          model.validFrom ||
          model.startsAt ||
          model.offerStartsOn
        ),

      validUntil:
        normaliseString(
          model.validUntil ||
          model.expiresAt ||
          model.offerEndsOn
        )
    });
  }

  function resolveCommercialOfferTitle(
    commercialModel,
    academicBridge
  ) {
    const model =
      isObject(
        commercialModel
      )
        ? commercialModel
        : {};

    const bridge =
      isObject(
        academicBridge
      )
        ? academicBridge
        : {};

    return normaliseString(
      model.bridgeProgram ||
      model.bridgeProgramme ||
      model.title ||
      model.programName ||
      model.programmeName ||
      bridge.title
    ) ||
    "Bridge Programme";
  }

  function resolveCommercialOfferDescription(
    commercialModel,
    academicBridge
  ) {
    const model =
      isObject(
        commercialModel
      )
        ? commercialModel
        : {};

    const bridge =
      isObject(
        academicBridge
      )
        ? academicBridge
        : {};

    return normaliseString(
      model.description ||
      bridge.description
    );
  }

  function isCommercialOfferConfirmed(
    commercialModel
  ) {
    if (
      !isObject(
        commercialModel
      )
    ) {
      return false;
    }

    return Boolean(
      commercialModel.eligible ===
        true ||
      commercialModel
        .offerAvailable ===
        true ||
      commercialModel.available ===
        true ||
      commercialModel.active ===
        true
    );
  }

  /* ==========================================================
     OFFER RESULT NORMALISATION
  ========================================================== */

  function normaliseOfferResult(
    rawResult,
    input
  ) {
    const result =
      isObject(
        rawResult
      )
        ? rawResult
        : {};

    const governedInput =
      isObject(
        input
      )
        ? input
        : {};

    const offerAvailable =
      result.offerAvailable ===
        true ||
      result.available ===
        true ||
      result.eligible ===
        true ||
      result.active ===
        true;

    const offerId =
      normaliseString(
        result.offerId ||
        result.id ||
        result.code
      );

    const offerCode =
      normaliseString(
        result.offerCode ||
        result.code
      ).toUpperCase();

    const currency =
      normaliseString(
        result.currency
      ).toUpperCase() ||
      "INR";

    const baseAmount =
      normaliseNumber(
        result.baseAmount ??
        result.amount ??
        result.fee,
        0
      );

    const taxAmount =
      normaliseNumber(
        result.taxAmount ??
        result.gstAmount ??
        result.tax,
        0
      );

    const totalAmount =
      normaliseNumber(
        result.totalAmount ??
        result.totalPayable ??
        result.payableAmount,
        baseAmount +
        taxAmount
      );

    const taxRate =
      normaliseNumber(
        result.taxRate ??
        result.gstRate,
        0
      );

    return freezeObject({
      offerAvailable,

      status:
        normaliseString(
          result.status
        ).toUpperCase() ||
        (
          offerAvailable
            ? "AVAILABLE"
            : "UNAVAILABLE"
        ),

      offerId,

      offerCode,

      title:
        normaliseString(
          result.title ||
          result.name
        ),

      description:
        normaliseString(
          result.description
        ),

      currency,

      baseAmount,

      taxAmount,

      totalAmount,

      taxRate,

      discountAmount:
        normaliseNumber(
          result.discountAmount,
          0
        ),

      discountPercentage:
        normaliseNumber(
          result
            .discountPercentage,
          0
        ),

      validFrom:
        normaliseString(
          result.validFrom ||
          result.startsAt
        ),

      validUntil:
        normaliseString(
          result.validUntil ||
          result.expiresAt
        ),

      standardFee:
        normaliseNumber(
          result.standardFee,
          0
        ),

      fullProgrammeFee:
        normaliseNumber(
          result
            .fullProgrammeFee,
          0
        ),

      taxDisclaimer:
        normaliseString(
          result.taxDisclaimer
        ),

      sourceProgrammeCode:
        normaliseProgrammeCode(
          governedInput
            .sourceProgrammeCode
        ),

      targetProgrammeCode:
        normaliseProgrammeCode(
          governedInput
            .targetProgrammeCode
        ),

      learnerUid:
        normaliseString(
          governedInput
            .learnerUid
        ),

      resolvedAt:
        nowIsoString(),

      raw:
        freezeObject(
          result
        )
    });
  }

  /* ==========================================================
     GOVERNED OFFER CONSTRUCTION
  ========================================================== */

  function buildGovernedOfferResult(
    commercialModel,
    academicBridge,
    input
  ) {
    if (
      !isObject(
        commercialModel
      )
    ) {
      throw createControllerError(
        ERROR_CODE
          .OFFER_RESOLUTION_FAILED,

        "The governed commercial offer model is unavailable.",

        {
          field:
            "eligibility.commercialEligibility"
        }
      );
    }

    const offerCode =
      resolveCommercialOfferCode(
        commercialModel,
        input
      );

    const offerId =
      resolveCommercialOfferId(
        commercialModel,
        offerCode
      );

    const baseAmount =
      resolveCommercialBaseAmount(
        commercialModel
      );

    const taxAmount =
      resolveCommercialTaxAmount(
        commercialModel
      );

    const taxRate =
      resolveCommercialTaxRate(
        commercialModel
      );

    const totalAmount =
      resolveCommercialTotalAmount(
        commercialModel,
        baseAmount,
        taxAmount
      );

    const validity =
      resolveCommercialOfferValidity(
        commercialModel
      );

    const commercialEligibilityConfirmed =
      isCommercialOfferConfirmed(
        commercialModel
      );

    const eligibility =
      isObject(
        input.eligibility
      )
        ? input.eligibility
        : {};

    const offerAvailable =
      eligibility.eligible ===
        true &&
      commercialEligibilityConfirmed &&
      baseAmount >
        0 &&
      totalAmount >
        0;

    return freezeObject({
      offerAvailable,

      available:
        offerAvailable,

      active:
        offerAvailable,

      eligible:
        offerAvailable,

      status:
        offerAvailable
          ? "AVAILABLE"
          : "UNAVAILABLE",

      offerId,

      offerCode,

      title:
        resolveCommercialOfferTitle(
          commercialModel,
          academicBridge
        ),

      description:
        resolveCommercialOfferDescription(
          commercialModel,
          academicBridge
        ),

      currency:
        resolveCommercialCurrency(
          commercialModel
        ),

      baseAmount,

      taxAmount,

      totalAmount,

      taxRate,

      discountAmount:
        normaliseNumber(
          commercialModel
            .discountAmount,
          0
        ),

      discountPercentage:
        normaliseNumber(
          commercialModel
            .discountPercentage,
          0
        ),

      validFrom:
        validity.validFrom,

      validUntil:
        validity.validUntil,

      standardFee:
        normaliseNumber(
          commercialModel
            .standardFee,
          0
        ),

      fullProgrammeFee:
        normaliseNumber(
          commercialModel
            .fullProgrammeFee,
          0
        ),

      taxDisclaimer:
        normaliseString(
          commercialModel
            .taxDisclaimer
        )
    });
  }

  /* ==========================================================
     OFFER RESOLUTION
  ========================================================== */

  async function resolveOffer(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    if (
      hasResolvedOffer() &&
      safeOptions.force !==
        true
    ) {
      return controllerState
        .offer;
    }

    if (
      offerResolutionPromise
    ) {
      return offerResolutionPromise;
    }

    offerResolutionPromise =
      (
        async function performOfferResolution() {
          if (
            !hasResolvedEligibility() ||
            safeOptions
              .forceEligibility ===
            true
          ) {
            await resolveEligibility({
              ...safeOptions,

              force:
                safeOptions
                  .forceEligibility ===
                true
            });
          }

          if (
            !isLearnerEligible()
          ) {
            setState({
              status:
                CONTROLLER_STATUS
                  .NOT_ELIGIBLE,

              busy:
                false,

              offer:
                null,

              registration:
                null,

              payment:
                null,

              enrolment:
                null,

              error:
                null
            });

            return null;
          }

          setState({
            status:
              CONTROLLER_STATUS
                .RESOLVING_OFFER,

            busy:
              true,

            offer:
              safeOptions.force ===
              true
                ? null
                : controllerState
                    .offer,

            registration:
              safeOptions.force ===
              true
                ? null
                : controllerState
                    .registration,

            payment:
              safeOptions.force ===
              true
                ? null
                : controllerState
                    .payment,

            enrolment:
              safeOptions.force ===
              true
                ? null
                : controllerState
                    .enrolment,

            error:
              null
          });

          try {
            assertPageContextReady();

            const input =
              buildOfferInput(
                safeOptions
              );

            const eligibility =
              input.eligibility;

            const commercialModel =
              isObject(
                eligibility
                  .commercialEligibility
              )
                ? eligibility
                    .commercialEligibility
                : null;

            const academicBridge =
              isObject(
                eligibility
                  .academicEligibility
              )
                ? eligibility
                    .academicEligibility
                : null;

            const governedOfferInput =
              buildGovernedOfferResult(
                commercialModel,
                academicBridge,
                input
              );

            const offer =
              normaliseOfferResult(
                governedOfferInput,
                input
              );

            const nextStatus =
              offer.offerAvailable
                ? CONTROLLER_STATUS
                    .READY
                : CONTROLLER_STATUS
                    .BLOCKED;

            const nextState =
              setState({
                status:
                  nextStatus,

                busy:
                  false,

                offer,

                registration:
                  offer.offerAvailable
                    ? controllerState
                        .registration
                    : null,

                payment:
                  offer.offerAvailable
                    ? controllerState
                        .payment
                    : null,

                enrolment:
                  offer.offerAvailable
                    ? controllerState
                        .enrolment
                    : null,

                error:
                  null
              });

            dispatchControllerEvent(
              CONTROLLER_EVENT
                .OFFER_RESOLVED,

              {
                offer,

                commercialEligibility:
                  commercialModel,

                academicEligibility:
                  academicBridge,

                serviceMethod:
                  "EligibilityService.getUpgradeModel",

                state:
                  nextState
              }
            );

            return offer;
          } catch (error) {
            throw handleControllerError(
              error,

              ERROR_CODE
                .OFFER_RESOLUTION_FAILED,

              "Unable to resolve the applicable Bridge Programme offer."
            );
          }
        }
      )();

    try {
      return await offerResolutionPromise;
    } finally {
      offerResolutionPromise =
        null;
    }
  }

  /* ==========================================================
     OFFER STATE
  ========================================================== */

  function hasResolvedOffer() {
    return Boolean(
      controllerState.offer &&
      typeof controllerState
        .offer
        .offerAvailable ===
        "boolean"
    );
  }

  function getResolvedOffer() {
    return controllerState
      .offer;
  }

  function isOfferAvailable() {
    return Boolean(
      hasResolvedOffer() &&
      controllerState
        .offer
        .offerAvailable ===
        true
    );
  }

  /* ==========================================================
     COMBINED ELIGIBILITY AND OFFER RESOLUTION
  ========================================================== */

  async function resolveEligibilityAndOffer(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const eligibility =
      await resolveEligibility({
        ...safeOptions,

        force:
          safeOptions.force ===
            true ||
          safeOptions
            .forceEligibility ===
            true
      });

    if (
      !eligibility ||
      eligibility.eligible !==
        true
    ) {
      return freezeObject({
        eligible:
          false,

        offerAvailable:
          false,

        eligibility,

        offer:
          null,

        state:
          controllerState
      });
    }

    const offer =
      await resolveOffer({
        ...safeOptions,

        eligibility,

        force:
          safeOptions.force ===
            true ||
          safeOptions
            .forceOffer ===
            true
      });

    return freezeObject({
      eligible:
        true,

      offerAvailable:
        Boolean(
          offer &&
          offer.offerAvailable ===
            true
        ),

      eligibility,

      offer,

      state:
        controllerState
    });
  }

  /* ==========================================================
     ELIGIBILITY AND OFFER READINESS
  ========================================================== */

  function getEligibilityAndOfferReadiness() {
    const pageContextReadiness =
      getPageContextReadiness();

    const readiness =
      getReadiness();

    const requiredServicesAvailable =
      readiness
        .eligibilityServiceAvailable &&
      readiness
        .bridgeProgramServiceAvailable;

    const eligibility =
      controllerState
        .eligibility;

    const offer =
      controllerState.offer;

    return freezeObject({
      pageContextReady:
        pageContextReadiness
          .ready,

      programServiceAvailable:
        readiness
          .programServiceAvailable,

      eligibilityServiceAvailable:
        readiness
          .eligibilityServiceAvailable,

      bridgeProgramServiceAvailable:
        readiness
          .bridgeProgramServiceAvailable,

      requiredServicesAvailable,

      eligibilityResolved:
        hasResolvedEligibility(),

      learnerEligible:
        isLearnerEligible(),

      eligibilityStatus:
        hasResolvedEligibility()
          ? eligibility.status
          : null,

      offerResolved:
        hasResolvedOffer(),

      offerAvailable:
        isOfferAvailable(),

      offerStatus:
        hasResolvedOffer()
          ? offer.status
          : null,

      offerCode:
        hasResolvedOffer()
          ? offer.offerCode ||
            null
          : null,

      currency:
        hasResolvedOffer()
          ? offer.currency ||
            null
          : null,

      totalAmount:
        hasResolvedOffer()
          ? offer.totalAmount
          : null,

      readyForRegistration:
        pageContextReadiness
          .ready &&
        requiredServicesAvailable &&
        isLearnerEligible() &&
        isOfferAvailable()
    });
  }

  /* ==========================================================
     END OF BLOCK 6 OF 10

     Do not close the IIFE here.
     Block 7 must continue immediately below this section.
  ========================================================== */

    /* ==========================================================
     BLOCK 7 OF 10
     REGISTRATION INPUT, STATUS AND RESULT NORMALISATION
  ========================================================== */

  /* ==========================================================
     REGISTRATION SERVICE ACCESS
  ========================================================== */

  function getRequiredRegistrationService() {
    const dependencies =
      assertRequiredDependencies();

    if (
      !dependencies
        .registrationServiceAvailable ||
      !dependencies.registrationService
    ) {
      throw createControllerError(
        ERROR_CODE
          .DEPENDENCY_UNAVAILABLE,

        "BridgeRegistrationService is unavailable."
      );
    }

    return dependencies
      .registrationService;
  }

  /* ==========================================================
     REGISTRATION STATUS NORMALISATION
  ========================================================== */

  function normaliseRegistrationStatus(
    value
  ) {
    const status =
      normaliseStatus(
        value
      );

    const statusAliases =
      Object.freeze({
        CREATED:
          "PENDING_PAYMENT",

        PENDING:
          "PENDING_PAYMENT",

        PAYMENT_PENDING:
          "PENDING_PAYMENT",

        AWAITING_PAYMENT:
          "PENDING_PAYMENT",

        PAYMENT_REQUIRED:
          "PENDING_PAYMENT",

        PROCESSING:
          "PAYMENT_PROCESSING",

        IN_PROGRESS:
          "PAYMENT_PROCESSING",

        PAID:
          "PAYMENT_CONFIRMED",

        PAYMENT_SUCCESS:
          "PAYMENT_CONFIRMED",

        PAYMENT_COMPLETED:
          "PAYMENT_CONFIRMED",

        COMPLETED:
          "PAYMENT_CONFIRMED",

        ACTIVE:
          "ENROLLED",

        ENROLMENT_COMPLETED:
          "ENROLLED",

        ENROLLMENT_COMPLETED:
          "ENROLLED",

        CANCELLED:
          "CANCELLED",

        CANCELED:
          "CANCELLED",

        EXPIRED:
          "EXPIRED",

        FAILED:
          "FAILED",

        BLOCKED:
          "BLOCKED"
      });

    return (
      statusAliases[
        status
      ] ||
      status ||
      "UNKNOWN"
    );
  }

  function normalisePaymentStatus(
    value
  ) {
    const status =
      normaliseStatus(
        value
      );

    const statusAliases =
      Object.freeze({
        CREATED:
          "PENDING",

        REQUIRED:
          "PENDING",

        PAYMENT_REQUIRED:
          "PENDING",

        PAYMENT_PENDING:
          "PENDING",

        AWAITING_PAYMENT:
          "PENDING",

        INITIATED:
          "PROCESSING",

        IN_PROGRESS:
          "PROCESSING",

        PAYMENT_PROCESSING:
          "PROCESSING",

        SUCCESS:
          "CONFIRMED",

        SUCCEEDED:
          "CONFIRMED",

        PAID:
          "CONFIRMED",

        COMPLETED:
          "CONFIRMED",

        VERIFIED:
          "CONFIRMED",

        PAYMENT_CONFIRMED:
          "CONFIRMED",

        CANCELLED:
          "CANCELLED",

        CANCELED:
          "CANCELLED",

        EXPIRED:
          "EXPIRED",

        FAILED:
          "FAILED"
      });

    return (
      statusAliases[
        status
      ] ||
      status ||
      "UNKNOWN"
    );
  }

  function normaliseEnrolmentStatus(
    value
  ) {
    const status =
      normaliseStatus(
        value
      );

    const statusAliases =
      Object.freeze({
        CREATED:
          "PENDING",

        PROCESSING:
          "PENDING",

        IN_PROGRESS:
          "PENDING",

        ENROLMENT_PENDING:
          "PENDING",

        ENROLLMENT_PENDING:
          "PENDING",

        ACTIVE:
          "ENROLLED",

        COMPLETED:
          "ENROLLED",

        ENROLLED:
          "ENROLLED",

        ENROLMENT_COMPLETED:
          "ENROLLED",

        ENROLLMENT_COMPLETED:
          "ENROLLED",

        FAILED:
          "FAILED",

        BLOCKED:
          "BLOCKED",

        CANCELLED:
          "CANCELLED",

        CANCELED:
          "CANCELLED"
      });

    return (
      statusAliases[
        status
      ] ||
      status ||
      "UNKNOWN"
    );
  }

  /* ==========================================================
     REGISTRATION IDENTITY INPUT
  ========================================================== */

  function buildRegistrationIdentityInput(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const learner =
      validateLearnerIdentity(
        safeOptions.learner ||
        controllerState.learner
      );

    const programmeContext =
      validateProgrammeContext({
        sourceProgrammeCode:
          safeOptions
            .sourceProgrammeCode,

        targetProgrammeCode:
          safeOptions
            .targetProgrammeCode
      });

    return freezeObject({
      learnerUid:
        learner.learnerUid,

      learnerEmail:
        learner.email ||
        "",

      sourceProgrammeCode:
        programmeContext
          .sourceProgrammeCode,

      targetProgrammeCode:
        programmeContext
          .targetProgrammeCode
    });
  }

  /* ==========================================================
     REGISTRATION RELATIONSHIP RESOLUTION
  ========================================================== */

  function resolveRegistrationRelationshipCode(
    options,
    eligibility,
    identityInput
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const academicEligibility =
      isObject(
        eligibility &&
        eligibility
          .academicEligibility
      )
        ? eligibility
            .academicEligibility
        : {};

    const generatedRelationshipCode =
      [
        identityInput
          .sourceProgrammeCode,

        identityInput
          .targetProgrammeCode
      ].join(
        "_TO_"
      );

    return normaliseString(
      safeOptions
        .relationshipCode ||
      academicEligibility
        .relationshipId ||
      academicEligibility
        .relationshipCode ||
      academicEligibility.id ||
      generatedRelationshipCode
    ).toUpperCase();
  }

  function resolveRegistrationRelationshipType(
    options,
    eligibility
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const academicEligibility =
      isObject(
        eligibility &&
        eligibility
          .academicEligibility
      )
        ? eligibility
            .academicEligibility
        : {};

    return normaliseString(
      safeOptions
        .relationshipType ||
      academicEligibility
        .relationshipType ||
      academicEligibility
        .relationship ||
      "CAPABILITY_UPGRADE"
    ).toUpperCase();
  }

  function resolveRegistrationCredentialId(
    options,
    eligibility
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const academicEligibility =
      isObject(
        eligibility &&
        eligibility
          .academicEligibility
      )
        ? eligibility
            .academicEligibility
        : {};

    const commercialEligibility =
      isObject(
        eligibility &&
        eligibility
          .commercialEligibility
      )
        ? eligibility
            .commercialEligibility
        : {};

    const sourceCredential =
      isObject(
        academicEligibility
          .sourceCredential
      )
        ? academicEligibility
            .sourceCredential
        : {};

    return normaliseString(
      safeOptions
        .credentialId ||
      academicEligibility
        .credentialId ||
      academicEligibility
        .credential_id ||
      sourceCredential
        .credentialId ||
      sourceCredential
        .credential_id ||
      commercialEligibility
        .credentialId ||
      commercialEligibility
        .credential_id
    ).toUpperCase();
  }

  /* ==========================================================
     REGISTRATION COMMERCIAL VALUES
  ========================================================== */

  function resolveRegistrationOfferCode(
    options,
    offer,
    commercialEligibility
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const governedOffer =
      isObject(
        offer
      )
        ? offer
        : {};

    const governedCommercialEligibility =
      isObject(
        commercialEligibility
      )
        ? commercialEligibility
        : {};

    return normaliseString(
      safeOptions.offerCode ||
      governedOffer.offerCode ||
      governedCommercialEligibility
        .offerCode ||
      governedCommercialEligibility
        .campaignCode
    ).toUpperCase();
  }

  function resolveRegistrationOfferExpiry(
    options,
    offer,
    commercialEligibility
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const governedOffer =
      isObject(
        offer
      )
        ? offer
        : {};

    const governedCommercialEligibility =
      isObject(
        commercialEligibility
      )
        ? commercialEligibility
        : {};

    return (
      safeOptions
        .offerExpiresAt ||
      governedOffer
        .validUntil ||
      governedCommercialEligibility
        .offerEndsOn ||
      governedCommercialEligibility
        .validUntil ||
      governedCommercialEligibility
        .expiresAt ||
      null
    );
  }

  /* ==========================================================
     REGISTRATION CREATION INPUT
  ========================================================== */

  function buildRegistrationCreationInput(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const identityInput =
      buildRegistrationIdentityInput(
        safeOptions
      );

    const eligibility =
      safeOptions.eligibility ||
      controllerState
        .eligibility;

    const offer =
      safeOptions.offer ||
      controllerState.offer;

    if (
      !isObject(
        eligibility
      ) ||
      eligibility.eligible !==
        true
    ) {
      throw createControllerError(
        ERROR_CODE
          .REGISTRATION_CREATION_FAILED,

        "Confirmed Bridge Programme eligibility is required before creating a registration.",

        {
          eligibility:
            eligibility ||
            null
        }
      );
    }

    if (
      !isObject(
        offer
      ) ||
      offer.offerAvailable !==
        true
    ) {
      throw createControllerError(
        ERROR_CODE
          .REGISTRATION_CREATION_FAILED,

        "An available Bridge Programme offer is required before creating a registration.",

        {
          offer:
            offer ||
            null
        }
      );
    }

    const acknowledgementAccepted =
      safeOptions
        .acknowledgementAccepted ===
      true;

    if (
      !acknowledgementAccepted
    ) {
      throw createControllerError(
        ERROR_CODE
          .REGISTRATION_CREATION_FAILED,

        "The learner must accept the Bridge Programme acknowledgement before registration.",

        {
          field:
            "acknowledgementAccepted",

          receivedValue:
            safeOptions
              .acknowledgementAccepted
        }
      );
    }

    const academicEligibility =
      isObject(
        eligibility
          .academicEligibility
      )
        ? eligibility
            .academicEligibility
        : {};

    const commercialEligibility =
      isObject(
        eligibility
          .commercialEligibility
      )
        ? eligibility
            .commercialEligibility
        : {};

    const relationshipCode =
      resolveRegistrationRelationshipCode(
        safeOptions,
        eligibility,
        identityInput
      );

    const relationshipType =
      resolveRegistrationRelationshipType(
        safeOptions,
        eligibility
      );

    const credentialId =
      resolveRegistrationCredentialId(
        safeOptions,
        eligibility
      );

    const offerCode =
      resolveRegistrationOfferCode(
        safeOptions,
        offer,
        commercialEligibility
      );

    if (
      !isNonEmptyString(
        offerCode
      )
    ) {
      throw createControllerError(
        ERROR_CODE
          .REGISTRATION_CREATION_FAILED,

        "A governed Bridge Programme offer code is required before registration.",

        {
          field:
            "offerCode"
        }
      );
    }

    const baseAmount =
      normaliseNumber(
        offer.baseAmount ??
        commercialEligibility
          .baseAmount ??
        commercialEligibility
          .baseFee,
        0
      );

    const gstRate =
      normaliseNumber(
        offer.taxRate ??
        commercialEligibility
          .gstRate ??
        commercialEligibility
          .taxRate,
        0
      );

    const gstAmount =
      normaliseNumber(
        offer.taxAmount ??
        commercialEligibility
          .gstAmount ??
        commercialEligibility
          .taxAmount,
        0
      );

    const totalAmount =
      normaliseNumber(
        offer.totalAmount ??
        commercialEligibility
          .totalPayable ??
        commercialEligibility
          .totalAmount,
        baseAmount +
        gstAmount
      );

    if (
      baseAmount <=
        0 ||
      totalAmount <=
        0
    ) {
      throw createControllerError(
        ERROR_CODE
          .REGISTRATION_CREATION_FAILED,

        "The governed Bridge Programme pricing is invalid.",

        {
          baseAmount,

          gstAmount,

          totalAmount
        }
      );
    }

    const calculatedTotal =
      baseAmount +
      gstAmount;

    if (
      !valuesApproximatelyEqual(
        calculatedTotal,
        totalAmount,
        2
      )
    ) {
      throw createControllerError(
        ERROR_CODE
          .REGISTRATION_CREATION_FAILED,

        "The Bridge Programme total amount does not match the base amount and GST amount.",

        {
          baseAmount,

          gstAmount,

          expectedTotalAmount:
            Number(
              calculatedTotal
                .toFixed(
                  2
                )
            ),

          suppliedTotalAmount:
            Number(
              totalAmount
                .toFixed(
                  2
                )
            )
        }
      );
    }

    const currency =
      normaliseString(
        offer.currency ||
        commercialEligibility
          .currency ||
        "INR"
      ).toUpperCase();

    const offerExpiresAt =
      resolveRegistrationOfferExpiry(
        safeOptions,
        offer,
        commercialEligibility
      );

    return freezeObject({
      ...identityInput,

      credentialId,

      relationshipCode,

      relationshipType,

      offerId:
        normaliseString(
          offer.offerId
        ),

      offerCode,

      currency,

      baseAmount,

      gstRate,

      gstAmount,

      taxRate:
        gstRate,

      taxAmount:
        gstAmount,

      totalAmount,

      payableAmount:
        totalAmount,

      offerExpiresAt,

      acknowledgementAccepted,

      acknowledgementAcceptedAt:
        safeOptions
          .acknowledgementAcceptedAt ||
        nowIsoString(),

      source:
        normaliseString(
          safeOptions.source
        ) ||
        "STUDENT_PORTAL",

      eligibility,

      offer,

      academicEligibility,

      commercialEligibility
    });
  }

  /* ==========================================================
     REGISTRATION RESULT SOURCE
  ========================================================== */

  function resolveRegistrationData(
    rawResult
  ) {
    const result =
      isObject(
        rawResult
      )
        ? rawResult
        : {};

    const nestedRegistration =
      isObject(
        result.registration
      )
        ? result.registration
        : {};

    return Object.keys(
      nestedRegistration
    ).length >
      0
      ? nestedRegistration
      : result;
  }

  /* ==========================================================
     REGISTRATION RESULT NORMALISATION
  ========================================================== */

  function normaliseRegistrationResult(
    rawResult,
    input
  ) {
    const result =
      isObject(
        rawResult
      )
        ? rawResult
        : {};

    const governedInput =
      isObject(
        input
      )
        ? input
        : {};

    const registrationData =
      resolveRegistrationData(
        result
      );

    const registrationId =
      normaliseString(
        registrationData
          .registrationId ||
        registrationData.id ||
        registrationData
          .bridgeRegistrationId ||
        result.registrationId ||
        result.id
      );

    const explicitlyExists =
      registrationData.exists ===
        true ||
      result.exists ===
        true ||
      registrationData
        .registrationExists ===
        true ||
      result.registrationExists ===
        true ||
      registrationData.found ===
        true ||
      result.found ===
        true;

    const explicitlyMissing =
      registrationData.exists ===
        false ||
      result.exists ===
        false ||
      registrationData
        .registrationExists ===
        false ||
      result.registrationExists ===
        false ||
      registrationData.found ===
        false ||
      result.found ===
        false;

    const registrationExists =
      explicitlyMissing
        ? false
        : (
            explicitlyExists ||
            isNonEmptyString(
              registrationId
            )
          );

    const registrationStatus =
      normaliseRegistrationStatus(
        registrationData.status ||
        registrationData
          .registrationStatus ||
        result.status ||
        result.registrationStatus
      );

    const paymentSource =
      isObject(
        registrationData.payment
      )
        ? registrationData.payment
        : (
            isObject(
              result.payment
            )
              ? result.payment
              : null
          );

    const enrolmentSource =
      isObject(
        registrationData
          .enrolment
      )
        ? registrationData
            .enrolment
        : (
            isObject(
              registrationData
                .enrollment
            )
              ? registrationData
                  .enrollment
              : (
                  isObject(
                    result.enrolment
                  )
                    ? result.enrolment
                    : (
                        isObject(
                          result.enrollment
                        )
                          ? result.enrollment
                          : null
                      )
                )
          );

    const paymentStatus =
      normalisePaymentStatus(
        registrationData
          .paymentStatus ||
        result.paymentStatus ||
        (
          paymentSource
            ? paymentSource.status
            : ""
        )
      );

    const enrolmentStatus =
      normaliseEnrolmentStatus(
        registrationData
          .enrolmentStatus ||
        registrationData
          .enrollmentStatus ||
        result.enrolmentStatus ||
        result.enrollmentStatus ||
        (
          enrolmentSource
            ? enrolmentSource.status
            : ""
        )
      );

    const payment =
      paymentSource
        ? freezeObject(
            paymentSource
          )
        : null;

    const enrolment =
      enrolmentSource
        ? freezeObject(
            enrolmentSource
          )
        : null;

    return freezeObject({
      registrationExists,

      registrationId,

      status:
        registrationStatus,

      paymentStatus,

      enrolmentStatus,

      learnerUid:
        normaliseString(
          registrationData
            .learnerUid ||
          result.learnerUid ||
          governedInput
            .learnerUid
        ),

      learnerEmail:
        normaliseEmail(
          registrationData
            .learnerEmail ||
          result.learnerEmail ||
          governedInput
            .learnerEmail
        ),

      sourceProgrammeCode:
        normaliseProgrammeCode(
          registrationData
            .sourceProgrammeCode ||
          result
            .sourceProgrammeCode ||
          governedInput
            .sourceProgrammeCode
        ),

      targetProgrammeCode:
        normaliseProgrammeCode(
          registrationData
            .targetProgrammeCode ||
          result
            .targetProgrammeCode ||
          governedInput
            .targetProgrammeCode
        ),

      credentialId:
        normaliseString(
          registrationData
            .credentialId ||
          result.credentialId ||
          governedInput
            .credentialId
        ).toUpperCase(),

      relationshipCode:
        normaliseString(
          registrationData
            .relationshipCode ||
          result
            .relationshipCode ||
          governedInput
            .relationshipCode
        ).toUpperCase(),

      relationshipType:
        normaliseString(
          registrationData
            .relationshipType ||
          result
            .relationshipType ||
          governedInput
            .relationshipType
        ).toUpperCase(),

      offerId:
        normaliseString(
          registrationData
            .offerId ||
          result.offerId ||
          governedInput
            .offerId
        ),

      offerCode:
        normaliseString(
          registrationData
            .offerCode ||
          result.offerCode ||
          governedInput
            .offerCode
        ).toUpperCase(),

      currency:
        normaliseString(
          registrationData.currency ||
          result.currency ||
          governedInput.currency
        ).toUpperCase(),

      baseAmount:
        normaliseNumber(
          registrationData
            .baseAmount ??
          result.baseAmount ??
          governedInput
            .baseAmount,
          0
        ),

      gstRate:
        normaliseNumber(
          registrationData
            .gstRate ??
          registrationData
            .taxRate ??
          result.gstRate ??
          result.taxRate ??
          governedInput
            .gstRate ??
          governedInput
            .taxRate,
          0
        ),

      gstAmount:
        normaliseNumber(
          registrationData
            .gstAmount ??
          registrationData
            .taxAmount ??
          result.gstAmount ??
          result.taxAmount ??
          governedInput
            .gstAmount ??
          governedInput
            .taxAmount,
          0
        ),

      taxAmount:
        normaliseNumber(
          registrationData
            .taxAmount ??
          registrationData
            .gstAmount ??
          result.taxAmount ??
          result.gstAmount ??
          governedInput
            .taxAmount ??
          governedInput
            .gstAmount,
          0
        ),

      totalAmount:
        normaliseNumber(
          registrationData
            .totalAmount ??
          registrationData
            .payableAmount ??
          result.totalAmount ??
          result.payableAmount ??
          governedInput
            .totalAmount ??
          governedInput
            .payableAmount,
          0
        ),

      offerExpiresAt:
        registrationData
          .offerExpiresAt ||
        result.offerExpiresAt ||
        governedInput
          .offerExpiresAt ||
        null,

      acknowledgementAccepted:
        registrationData
          .acknowledgementAccepted ===
          true ||
        result
          .acknowledgementAccepted ===
          true ||
        governedInput
          .acknowledgementAccepted ===
          true,

      source:
        normaliseString(
          registrationData.source ||
          result.source ||
          governedInput.source
        ),

      created:
        result.created ===
        true,

      existing:
        result.existing ===
          true ||
        result.idempotent ===
          true,

      idempotent:
        result.idempotent ===
        true,

      createdAt:
        normaliseString(
          registrationData
            .createdAt ||
          result.createdAt
        ),

      updatedAt:
        normaliseString(
          registrationData
            .updatedAt ||
          result.updatedAt
        ),

      payment,

      enrolment,

      resolvedAt:
        nowIsoString(),

      raw:
        freezeObject(
          registrationData
        )
    });
  }

  /* ==========================================================
     CONTROLLER STATUS FROM REGISTRATION
  ========================================================== */

  function resolveControllerStatusFromRegistration(
    registration
  ) {
    if (
      !isObject(
        registration
      ) ||
      registration
        .registrationExists !==
      true
    ) {
      return CONTROLLER_STATUS
        .READY;
    }

    const registrationStatus =
      normaliseRegistrationStatus(
        registration.status
      );

    const paymentStatus =
      normalisePaymentStatus(
        registration
          .paymentStatus
      );

    const enrolmentStatus =
      normaliseEnrolmentStatus(
        registration
          .enrolmentStatus
      );

    if (
      registrationStatus ===
        "ENROLLED" ||
      enrolmentStatus ===
        "ENROLLED"
    ) {
      return CONTROLLER_STATUS
        .ENROLLED;
    }

    if (
      enrolmentStatus ===
        "PENDING" ||
      registrationStatus ===
        "ENROLMENT_PENDING"
    ) {
      return CONTROLLER_STATUS
        .ENROLMENT_PENDING;
    }

    if (
      paymentStatus ===
        "CONFIRMED" ||
      registrationStatus ===
        "PAYMENT_CONFIRMED"
    ) {
      return CONTROLLER_STATUS
        .PAYMENT_CONFIRMED;
    }

    if (
      paymentStatus ===
        "PROCESSING" ||
      registrationStatus ===
        "PAYMENT_PROCESSING"
    ) {
      return CONTROLLER_STATUS
        .PAYMENT_IN_PROGRESS;
    }

    if (
      paymentStatus ===
        "PENDING" ||
      registrationStatus ===
        "PENDING_PAYMENT"
    ) {
      return CONTROLLER_STATUS
        .PAYMENT_REQUIRED;
    }

    if (
      registrationStatus ===
        "BLOCKED" ||
      registrationStatus ===
        "FAILED" ||
      registrationStatus ===
        "CANCELLED" ||
      registrationStatus ===
        "EXPIRED" ||
      paymentStatus ===
        "FAILED" ||
      paymentStatus ===
        "CANCELLED" ||
      paymentStatus ===
        "EXPIRED" ||
      enrolmentStatus ===
        "FAILED" ||
      enrolmentStatus ===
        "BLOCKED" ||
      enrolmentStatus ===
        "CANCELLED"
    ) {
      return CONTROLLER_STATUS
        .BLOCKED;
    }

    return CONTROLLER_STATUS
      .READY;
  }

  /* ==========================================================
     END OF BLOCK 7 OF 10

     Do not close the IIFE here.
     Block 8 must continue immediately below this section.
  ========================================================== */

    /* ==========================================================
     BLOCK 8 OF 10
     REGISTRATION RESOLUTION AND CREATION
  ========================================================== */

  /* ==========================================================
     EXISTING REGISTRATION RESOLUTION
  ========================================================== */

  async function resolveExistingRegistration(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    if (
      hasResolvedRegistration() &&
      safeOptions.force !==
        true
    ) {
      return controllerState
        .registration;
    }

    if (
      registrationResolutionPromise
    ) {
      return registrationResolutionPromise;
    }

    registrationResolutionPromise =
      (
        async function performRegistrationResolution() {
          setState({
            status:
              CONTROLLER_STATUS
                .RESOLVING_REGISTRATION,

            busy:
              true,

            registration:
              safeOptions.force ===
              true
                ? null
                : controllerState
                    .registration,

            payment:
              safeOptions.force ===
              true
                ? null
                : controllerState
                    .payment,

            enrolment:
              safeOptions.force ===
              true
                ? null
                : controllerState
                    .enrolment,

            error:
              null
          });

          try {
            assertPageContextReady();

            const registrationService =
              getRequiredRegistrationService();

            const input =
              buildRegistrationIdentityInput(
                safeOptions
              );

            const response =
              await invokeServiceMethod(
                registrationService,

                [
                  "resolveLearnerRegistration",
                  "getRegistrationByInput",
                  "resolveExistingRegistration",
                  "getExistingRegistration",
                  "findExistingRegistration",
                  "resolveRegistration",
                  "findRegistration"
                ],

                input,

                ERROR_CODE
                  .REGISTRATION_RESOLUTION_FAILED,

                "Unable to resolve an existing Bridge Programme registration."
              );

            const registration =
              normaliseRegistrationResult(
                response.result,
                input
              );

            const registrationExists =
              registration
                .registrationExists ===
              true;

            const nextStatus =
              resolveControllerStatusFromRegistration(
                registration
              );

            const nextState =
              setState({
                status:
                  nextStatus,

                busy:
                  false,

                registration:
                  registrationExists
                    ? registration
                    : null,

                payment:
                  registrationExists
                    ? registration.payment
                    : null,

                enrolment:
                  registrationExists
                    ? registration.enrolment
                    : null,

                error:
                  null
              });

            dispatchControllerEvent(
              CONTROLLER_EVENT
                .REGISTRATION_RESOLVED,

              {
                registration:
                  registrationExists
                    ? registration
                    : null,

                registrationExists,

                created:
                  false,

                restored:
                  registrationExists,

                serviceMethod:
                  response.methodName,

                state:
                  nextState
              }
            );

            if (
              registrationExists &&
              nextStatus ===
                CONTROLLER_STATUS
                  .PAYMENT_REQUIRED
            ) {
              dispatchControllerEvent(
                CONTROLLER_EVENT
                  .PAYMENT_REQUIRED,

                {
                  registration,

                  payment:
                    registration.payment,

                  created:
                    false,

                  restored:
                    true,

                  state:
                    nextState
                }
              );
            }

            return registrationExists
              ? registration
              : null;
          } catch (error) {
            throw handleControllerError(
              error,

              ERROR_CODE
                .REGISTRATION_RESOLUTION_FAILED,

              "Unable to resolve an existing Bridge Programme registration."
            );
          }
        }
      )();

    try {
      return await registrationResolutionPromise;
    } finally {
      registrationResolutionPromise =
        null;
    }
  }

  /* ==========================================================
     REGISTRATION STATE
  ========================================================== */

  function hasResolvedRegistration() {
    return Boolean(
      controllerState
        .registration &&
      controllerState
        .registration
        .registrationExists ===
        true &&
      isNonEmptyString(
        controllerState
          .registration
          .registrationId
      )
    );
  }

  function getResolvedRegistration() {
    return controllerState
      .registration;
  }

  /* ==========================================================
     REGISTRATION CREATION
  ========================================================== */

  async function createRegistration(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    if (
      hasResolvedRegistration() &&
      safeOptions.force !==
        true
    ) {
      return controllerState
        .registration;
    }

    if (
      registrationCreationPromise
    ) {
      return registrationCreationPromise;
    }

    registrationCreationPromise =
      (
        async function performRegistrationCreation() {
          if (
            !hasResolvedEligibility() ||
            !isLearnerEligible() ||
            !hasResolvedOffer() ||
            !isOfferAvailable()
          ) {
            await resolveEligibilityAndOffer({
              ...safeOptions,

              forceEligibility:
                safeOptions
                  .forceEligibility ===
                true,

              forceOffer:
                safeOptions
                  .forceOffer ===
                true
            });
          }

          if (
            !isLearnerEligible()
          ) {
            setState({
              status:
                CONTROLLER_STATUS
                  .NOT_ELIGIBLE,

              busy:
                false,

              registration:
                null,

              payment:
                null,

              enrolment:
                null,

              error:
                null
            });

            throw createControllerError(
              ERROR_CODE
                .REGISTRATION_CREATION_FAILED,

              "The learner is not eligible for this Bridge Programme registration."
            );
          }

          if (
            !isOfferAvailable()
          ) {
            setState({
              status:
                CONTROLLER_STATUS
                  .BLOCKED,

              busy:
                false,

              registration:
                null,

              payment:
                null,

              enrolment:
                null,

              error:
                null
            });

            throw createControllerError(
              ERROR_CODE
                .REGISTRATION_CREATION_FAILED,

              "An active Bridge Programme offer is unavailable for this learner."
            );
          }

          /*
           * This performs the governed acknowledgement,
           * relationship, credential, offer and pricing checks
           * before any registration write is attempted.
           */

          const input =
            buildRegistrationCreationInput(
              safeOptions
            );

          if (
            safeOptions
              .skipExistingRegistrationCheck !==
            true
          ) {
            const existingRegistration =
              await resolveExistingRegistration({
                ...safeOptions,

                force:
                  true
              });

            if (
              existingRegistration
            ) {
              return existingRegistration;
            }
          }

          setState({
            status:
              CONTROLLER_STATUS
                .CREATING_REGISTRATION,

            busy:
              true,

            registration:
              null,

            payment:
              null,

            enrolment:
              null,

            error:
              null
          });

          try {
            const registrationService =
              getRequiredRegistrationService();

            const response =
              await invokeServiceMethod(
                registrationService,

                [
                  "createOrResolveRegistration",
                  "createRegistration",
                  "createBridgeRegistration",
                  "registerLearner",
                  "create"
                ],

                input,

                ERROR_CODE
                  .REGISTRATION_CREATION_FAILED,

                "Unable to create the Bridge Programme registration."
              );

            const serviceResult =
              isObject(
                response.result
              )
                ? response.result
                : {};

            const registration =
              normaliseRegistrationResult(
                serviceResult,
                input
              );

            if (
              registration
                .registrationExists !==
                true ||
              !isNonEmptyString(
                registration
                  .registrationId
              )
            ) {
              throw createControllerError(
                ERROR_CODE
                  .REGISTRATION_CREATION_FAILED,

                "BridgeRegistrationService did not return a valid registration.",

                {
                  serviceMethod:
                    response.methodName,

                  serviceResult:
                    response.result ||
                    null
                }
              );
            }

            const created =
              registration.created ===
                true ||
              serviceResult.created ===
                true;

            const idempotent =
              registration.idempotent ===
                true ||
              serviceResult.idempotent ===
                true;

            const existing =
              registration.existing ===
                true ||
              serviceResult.existing ===
                true ||
              idempotent ||
              created !==
                true;

            const nextStatus =
              resolveControllerStatusFromRegistration(
                registration
              );

            const nextState =
              setState({
                status:
                  nextStatus,

                busy:
                  false,

                registration,

                payment:
                  registration.payment,

                enrolment:
                  registration.enrolment,

                error:
                  null
              });

            if (
              created
            ) {
              dispatchControllerEvent(
                CONTROLLER_EVENT
                  .REGISTRATION_CREATED,

                {
                  registration,

                  created:
                    true,

                  existing:
                    false,

                  restored:
                    false,

                  idempotent:
                    false,

                  serviceMethod:
                    response.methodName,

                  state:
                    nextState
                }
              );
            } else {
              dispatchControllerEvent(
                CONTROLLER_EVENT
                  .REGISTRATION_RESOLVED,

                {
                  registration,

                  registrationExists:
                    true,

                  created:
                    false,

                  existing,

                  restored:
                    true,

                  idempotent,

                  serviceMethod:
                    response.methodName,

                  state:
                    nextState
                }
              );
            }

            if (
              nextStatus ===
                CONTROLLER_STATUS
                  .PAYMENT_REQUIRED
            ) {
              dispatchControllerEvent(
                CONTROLLER_EVENT
                  .PAYMENT_REQUIRED,

                {
                  registration,

                  payment:
                    registration.payment,

                  created,

                  existing,

                  restored:
                    created !==
                    true,

                  idempotent,

                  state:
                    nextState
                }
              );
            }

            return registration;
          } catch (error) {
            throw handleControllerError(
              error,

              ERROR_CODE
                .REGISTRATION_CREATION_FAILED,

              "Unable to create the Bridge Programme registration."
            );
          }
        }
      )();

    try {
      return await registrationCreationPromise;
    } finally {
      registrationCreationPromise =
        null;
    }
  }

  /* ==========================================================
     REGISTRATION ORCHESTRATION
  ========================================================== */

  async function resolveOrCreateRegistration(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    if (
      !getPageContextReadiness()
        .ready
    ) {
      await initialisePageContext({
        ...safeOptions,

        force:
          safeOptions
            .forcePageContext ===
          true
      });
    }

    if (
      !getEligibilityAndOfferReadiness()
        .readyForRegistration
    ) {
      const eligibilityAndOffer =
        await resolveEligibilityAndOffer({
          ...safeOptions,

          forceEligibility:
            safeOptions
              .forceEligibility ===
            true,

          forceOffer:
            safeOptions
              .forceOffer ===
            true
        });

      if (
        !eligibilityAndOffer ||
        eligibilityAndOffer
          .eligible !==
        true
      ) {
        return freezeObject({
          registration:
            null,

          created:
            false,

          restored:
            false,

          existing:
            false,

          idempotent:
            false,

          creationRequired:
            false,

          eligible:
            false,

          offerAvailable:
            false,

          acknowledgementRequired:
            false,

          state:
            controllerState
        });
      }

      if (
        eligibilityAndOffer
          .offerAvailable !==
        true
      ) {
        return freezeObject({
          registration:
            null,

          created:
            false,

          restored:
            false,

          existing:
            false,

          idempotent:
            false,

          creationRequired:
            false,

          eligible:
            true,

          offerAvailable:
            false,

          acknowledgementRequired:
            false,

          state:
            controllerState
        });
      }
    }

    const existingRegistration =
      await resolveExistingRegistration({
        ...safeOptions,

        force:
          safeOptions
            .forceRegistrationResolution ===
          true
      });

    if (
      existingRegistration
    ) {
      return freezeObject({
        registration:
          existingRegistration,

        created:
          false,

        restored:
          true,

        existing:
          true,

        idempotent:
          existingRegistration
            .idempotent ===
          true,

        creationRequired:
          false,

        eligible:
          true,

        offerAvailable:
          true,

        acknowledgementRequired:
          false,

        state:
          controllerState
      });
    }

    /*
     * Normal page loading stops here.
     *
     * A registration may be created only when the caller
     * explicitly requests creation after learner acknowledgement.
     */

    const createIfMissing =
      safeOptions
        .createIfMissing ===
      true;

    if (
      !createIfMissing
    ) {
      const nextState =
        setState({
          status:
            CONTROLLER_STATUS
              .READY,

          busy:
            false,

          registration:
            null,

          payment:
            null,

          enrolment:
            null,

          error:
            null
        });

      return freezeObject({
        registration:
          null,

        created:
          false,

        restored:
          false,

        existing:
          false,

        idempotent:
          false,

        creationRequired:
          true,

        eligible:
          true,

        offerAvailable:
          true,

        acknowledgementRequired:
          true,

        state:
          nextState
      });
    }

    if (
      safeOptions
        .acknowledgementAccepted !==
      true
    ) {
      throw createControllerError(
        ERROR_CODE
          .REGISTRATION_CREATION_FAILED,

        "The learner must accept the Bridge Programme acknowledgement before registration.",

        {
          field:
            "acknowledgementAccepted",

          receivedValue:
            safeOptions
              .acknowledgementAccepted
        }
      );
    }

    const registration =
      await createRegistration({
        ...safeOptions,

        acknowledgementAccepted:
          true,

        skipExistingRegistrationCheck:
          true
      });

    const created =
      registration &&
      registration.created ===
        true;

    const idempotent =
      registration &&
      registration.idempotent ===
        true;

    const existing =
      registration &&
      (
        registration.existing ===
          true ||
        idempotent ||
        created !==
          true
      );

    return freezeObject({
      registration,

      created,

      restored:
        created !==
        true,

      existing,

      idempotent,

      creationRequired:
        false,

      eligible:
        true,

      offerAvailable:
        true,

      acknowledgementRequired:
        false,

      state:
        controllerState
    });
  }

  /* ==========================================================
     REGISTRATION READINESS
  ========================================================== */

  function getRegistrationReadiness() {
    const eligibilityAndOfferReadiness =
      getEligibilityAndOfferReadiness();

    const registration =
      controllerState
        .registration;

    const registrationResolved =
      hasResolvedRegistration();

    const registrationStatus =
      registrationResolved
        ? registration.status
        : null;

    const paymentStatus =
      registrationResolved
        ? registration
            .paymentStatus
        : null;

    const enrolmentStatus =
      registrationResolved
        ? registration
            .enrolmentStatus
        : null;

    const paymentRequired =
      controllerState.status ===
        CONTROLLER_STATUS
          .PAYMENT_REQUIRED;

    const paymentConfirmed =
      controllerState.status ===
        CONTROLLER_STATUS
          .PAYMENT_CONFIRMED;

    const enrolled =
      controllerState.status ===
        CONTROLLER_STATUS
          .ENROLLED;

    return freezeObject({
      pageContextReady:
        eligibilityAndOfferReadiness
          .pageContextReady,

      requiredServicesAvailable:
        eligibilityAndOfferReadiness
          .requiredServicesAvailable,

      learnerEligible:
        eligibilityAndOfferReadiness
          .learnerEligible,

      offerAvailable:
        eligibilityAndOfferReadiness
          .offerAvailable,

      registrationResolved,

      registrationExists:
        registrationResolved,

      registrationId:
        registrationResolved
          ? registration
              .registrationId
          : null,

      registrationStatus,

      paymentStatus,

      enrolmentStatus,

      created:
        registrationResolved &&
        registration.created ===
          true,

      existing:
        registrationResolved &&
        registration.existing ===
          true,

      idempotent:
        registrationResolved &&
        registration.idempotent ===
          true,

      paymentRequired,

      paymentConfirmed,

      enrolled,

      creationRequired:
        eligibilityAndOfferReadiness
          .readyForRegistration &&
        !registrationResolved,

      acknowledgementRequired:
        eligibilityAndOfferReadiness
          .readyForRegistration &&
        !registrationResolved,

      readyForCreation:
        eligibilityAndOfferReadiness
          .readyForRegistration &&
        !registrationResolved,

      readyForPayment:
        registrationResolved &&
        paymentRequired,

      readyForEnrolmentResolution:
        registrationResolved &&
        paymentConfirmed &&
        !enrolled
    });
  }

  /* ==========================================================
     END OF BLOCK 8 OF 10

     Do not close the IIFE here.
     Block 9 must continue immediately below this section.
  ========================================================== */

    /* ==========================================================
     BLOCK 9 OF 10
     PAYMENT AND ENROLMENT ORCHESTRATION
  ========================================================== */

  /* ==========================================================
     PAYMENT SERVICE ACCESS
  ========================================================== */

  function getRequiredPaymentService() {
    const dependencies =
      assertRequiredDependencies({
        requirePaymentService:
          true
      });

    if (
      !dependencies
        .paymentServiceAvailable ||
      !dependencies.paymentService
    ) {
      throw createControllerError(
        ERROR_CODE
          .DEPENDENCY_UNAVAILABLE,

        "PaymentService is unavailable."
      );
    }

    return dependencies
      .paymentService;
  }

  /* ==========================================================
     REGISTRATION VALIDATION FOR PAYMENT
  ========================================================== */

  function validateRegistrationForPayment(
    registration
  ) {
    if (
      !isObject(
        registration
      ) ||
      registration
        .registrationExists !==
      true ||
      !isNonEmptyString(
        registration
          .registrationId
      )
    ) {
      throw createControllerError(
        ERROR_CODE
          .PAYMENT_FAILED,

        "A valid Bridge Programme registration is required before payment can be initiated.",

        {
          registration:
            registration ||
            null
        }
      );
    }

    const registrationStatus =
      normaliseRegistrationStatus(
        registration.status
      );

    const paymentStatus =
      normalisePaymentStatus(
        registration
          .paymentStatus ||
        (
          isObject(
            registration.payment
          )
            ? registration
                .payment
                .status
            : ""
        )
      );

    const enrolmentStatus =
      normaliseEnrolmentStatus(
        registration
          .enrolmentStatus ||
        (
          isObject(
            registration.enrolment
          )
            ? registration
                .enrolment
                .status
            : ""
        )
      );

    if (
      registrationStatus ===
        "ENROLLED" ||
      enrolmentStatus ===
        "ENROLLED"
    ) {
      return registration;
    }

    if (
      registrationStatus ===
        "BLOCKED" ||
      registrationStatus ===
        "FAILED" ||
      registrationStatus ===
        "CANCELLED" ||
      registrationStatus ===
        "EXPIRED"
    ) {
      throw createControllerError(
        ERROR_CODE
          .PAYMENT_FAILED,

        "Payment cannot be initiated for a blocked, failed, cancelled, or expired registration.",

        {
          registrationId:
            registration
              .registrationId,

          registrationStatus
        }
      );
    }

    if (
      paymentStatus ===
        "FAILED" &&
      registrationStatus ===
        "FAILED"
    ) {
      throw createControllerError(
        ERROR_CODE
          .PAYMENT_FAILED,

        "The Bridge Programme registration is not eligible for another payment attempt.",

        {
          registrationId:
            registration
              .registrationId,

          paymentStatus
        }
      );
    }

    return registration;
  }

  /* ==========================================================
     PAYMENT INPUT
  ========================================================== */

  function buildPaymentInput(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const registration =
      validateRegistrationForPayment(
        safeOptions.registration ||
        controllerState
          .registration
      );

    const learner =
      validateLearnerIdentity(
        safeOptions.learner ||
        controllerState.learner
      );

    return freezeObject({
      learnerUid:
        learner.learnerUid,

      learnerEmail:
        learner.email ||
        registration
          .learnerEmail ||
        "",

      registrationId:
        registration
          .registrationId,

      sourceProgrammeCode:
        registration
          .sourceProgrammeCode,

      targetProgrammeCode:
        registration
          .targetProgrammeCode,

      credentialId:
        registration
          .credentialId ||
        "",

      relationshipCode:
        registration
          .relationshipCode ||
        "",

      relationshipType:
        registration
          .relationshipType ||
        "",

      offerId:
        registration.offerId ||
        "",

      offerCode:
        registration.offerCode ||
        "",

      currency:
        normaliseString(
          registration.currency ||
          "INR"
        ).toUpperCase(),

      baseAmount:
        normaliseNumber(
          registration.baseAmount,
          0
        ),

      gstRate:
        normaliseNumber(
          registration.gstRate,
          0
        ),

      gstAmount:
        normaliseNumber(
          registration
            .gstAmount ??
          registration
            .taxAmount,
          0
        ),

      taxAmount:
        normaliseNumber(
          registration
            .taxAmount ??
          registration
            .gstAmount,
          0
        ),

      totalAmount:
        normaliseNumber(
          registration
            .totalAmount,
          0
        ),

      payableAmount:
        normaliseNumber(
          registration
            .totalAmount,
          0
        ),

      paymentProvider:
        normaliseString(
          safeOptions
            .paymentProvider
        ),

      returnUrl:
        normaliseString(
          safeOptions.returnUrl
        ),

      cancelUrl:
        normaliseString(
          safeOptions.cancelUrl
        ),

      source:
        normaliseString(
          safeOptions.source
        ) ||
        "STUDENT_PORTAL"
    });
  }

  /* ==========================================================
     PAYMENT RESULT NORMALISATION
  ========================================================== */

  function normalisePaymentResult(
    rawResult,
    input
  ) {
    const result =
      isObject(
        rawResult
      )
        ? rawResult
        : {};

    const governedInput =
      isObject(
        input
      )
        ? input
        : {};

    const nestedPayment =
      isObject(
        result.payment
      )
        ? result.payment
        : {};

    const paymentData =
      Object.keys(
        nestedPayment
      ).length >
        0
        ? nestedPayment
        : result;

    const status =
      normalisePaymentStatus(
        paymentData.status ||
        paymentData
          .paymentStatus ||
        result.status ||
        result.paymentStatus
      );

    const paymentId =
      normaliseString(
        paymentData.paymentId ||
        paymentData.id ||
        paymentData
          .bridgePaymentId ||
        result.paymentId ||
        result.id
      );

    const paymentUrl =
      normaliseString(
        paymentData.paymentUrl ||
        paymentData.checkoutUrl ||
        paymentData.redirectUrl ||
        paymentData.url ||
        result.paymentUrl ||
        result.checkoutUrl ||
        result.redirectUrl ||
        result.url
      );

    return freezeObject({
      paymentId,

      status,

      paymentUrl,

      provider:
        normaliseString(
          paymentData.provider ||
          paymentData
            .paymentProvider ||
          result.provider ||
          result
            .paymentProvider
        ),

      providerOrderId:
        normaliseString(
          paymentData
            .providerOrderId ||
          paymentData.orderId ||
          result
            .providerOrderId ||
          result.orderId
        ),

      providerPaymentId:
        normaliseString(
          paymentData
            .providerPaymentId ||
          paymentData
            .gatewayPaymentId ||
          result
            .providerPaymentId ||
          result
            .gatewayPaymentId
        ),

      providerSignature:
        normaliseString(
          paymentData
            .providerSignature ||
          paymentData.signature ||
          result
            .providerSignature ||
          result.signature
        ),

      registrationId:
        normaliseString(
          paymentData
            .registrationId ||
          result.registrationId ||
          governedInput
            .registrationId
        ),

      learnerUid:
        normaliseString(
          paymentData
            .learnerUid ||
          result.learnerUid ||
          governedInput
            .learnerUid
        ),

      currency:
        normaliseString(
          paymentData.currency ||
          result.currency ||
          governedInput.currency ||
          "INR"
        ).toUpperCase(),

      baseAmount:
        normaliseNumber(
          paymentData
            .baseAmount ??
          result.baseAmount ??
          governedInput
            .baseAmount,
          0
        ),

      gstAmount:
        normaliseNumber(
          paymentData
            .gstAmount ??
          paymentData
            .taxAmount ??
          result.gstAmount ??
          result.taxAmount ??
          governedInput
            .gstAmount ??
          governedInput
            .taxAmount,
          0
        ),

      taxAmount:
        normaliseNumber(
          paymentData
            .taxAmount ??
          paymentData
            .gstAmount ??
          result.taxAmount ??
          result.gstAmount ??
          governedInput
            .taxAmount ??
          governedInput
            .gstAmount,
          0
        ),

      totalAmount:
        normaliseNumber(
          paymentData
            .totalAmount ??
          paymentData
            .amount ??
          result.totalAmount ??
          result.amount ??
          governedInput
            .totalAmount,
          0
        ),

      initiatedAt:
        normaliseString(
          paymentData
            .initiatedAt ||
          paymentData.createdAt ||
          result.initiatedAt ||
          result.createdAt
        ),

      confirmedAt:
        normaliseString(
          paymentData
            .confirmedAt ||
          paymentData.paidAt ||
          result.confirmedAt ||
          result.paidAt
        ),

      failedAt:
        normaliseString(
          paymentData.failedAt ||
          result.failedAt
        ),

      failureCode:
        normaliseString(
          paymentData
            .failureCode ||
          paymentData
            .errorCode ||
          result.failureCode ||
          result.errorCode
        ),

      failureReason:
        normaliseString(
          paymentData
            .failureReason ||
          paymentData
            .errorMessage ||
          result.failureReason ||
          result.errorMessage
        ),

      resolvedAt:
        nowIsoString(),

      raw:
        freezeObject(
          paymentData
        )
    });
  }

  /* ==========================================================
     CONTROLLER STATUS FROM PAYMENT
  ========================================================== */

  function resolveControllerStatusFromPayment(
    payment
  ) {
    if (
      !isObject(
        payment
      )
    ) {
      return CONTROLLER_STATUS
        .PAYMENT_REQUIRED;
    }

    const paymentStatus =
      normalisePaymentStatus(
        payment.status
      );

    if (
      paymentStatus ===
        "CONFIRMED"
    ) {
      return CONTROLLER_STATUS
        .PAYMENT_CONFIRMED;
    }

    if (
      paymentStatus ===
        "PROCESSING"
    ) {
      return CONTROLLER_STATUS
        .PAYMENT_IN_PROGRESS;
    }

    if (
      paymentStatus ===
        "FAILED" ||
      paymentStatus ===
        "CANCELLED" ||
      paymentStatus ===
        "EXPIRED"
    ) {
      return CONTROLLER_STATUS
        .BLOCKED;
    }

    return CONTROLLER_STATUS
      .PAYMENT_REQUIRED;
  }

  /* ==========================================================
     PAYMENT INITIATION
  ========================================================== */

  async function initiatePayment(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    if (
      paymentInitiationPromise
    ) {
      return paymentInitiationPromise;
    }

    paymentInitiationPromise =
      (
        async function performPaymentInitiation() {
          if (
            !hasResolvedRegistration()
          ) {
            const registrationResult =
              await resolveOrCreateRegistration({
                ...safeOptions,

                createIfMissing:
                  safeOptions
                    .createIfMissing ===
                  true,

                acknowledgementAccepted:
                  safeOptions
                    .acknowledgementAccepted ===
                  true
              });

            if (
              !registrationResult ||
              !registrationResult
                .registration
            ) {
              throw createControllerError(
                ERROR_CODE
                  .PAYMENT_FAILED,

                "A Bridge Programme registration must be created before payment can be initiated.",

                {
                  creationRequired:
                    Boolean(
                      registrationResult &&
                      registrationResult
                        .creationRequired ===
                        true
                    ),

                  acknowledgementRequired:
                    Boolean(
                      registrationResult &&
                      registrationResult
                        .acknowledgementRequired ===
                        true
                    )
                }
              );
            }
          }

          const registration =
            validateRegistrationForPayment(
              controllerState
                .registration
            );

          const existingPayment =
            isObject(
              controllerState.payment
            )
              ? controllerState.payment
              : (
                  isObject(
                    registration.payment
                  )
                    ? registration.payment
                    : null
                );

          const existingPaymentStatus =
            normalisePaymentStatus(
              registration
                .paymentStatus ||
              (
                existingPayment
                  ? existingPayment.status
                  : ""
              )
            );

          if (
            existingPaymentStatus ===
              "CONFIRMED"
          ) {
            setState({
              status:
                CONTROLLER_STATUS
                  .PAYMENT_CONFIRMED,

              busy:
                false,

              payment:
                existingPayment,

              error:
                null
            });

            return existingPayment;
          }

          if (
            existingPaymentStatus ===
              "PROCESSING" &&
            safeOptions.force !==
              true
          ) {
            return existingPayment;
          }

          setState({
            status:
              CONTROLLER_STATUS
                .PAYMENT_IN_PROGRESS,

            busy:
              true,

            error:
              null
          });

          try {
            const paymentService =
              getRequiredPaymentService();

            const input =
              buildPaymentInput(
                safeOptions
              );

            const response =
              await invokeServiceMethod(
                paymentService,

                [
                  "initiateBridgePayment",
                  "createBridgePayment",
                  "initiatePayment",
                  "createPayment",
                  "createCheckoutSession",
                  "createOrder"
                ],

                input,

                ERROR_CODE
                  .PAYMENT_FAILED,

                "Unable to initiate payment for the Bridge Programme registration."
              );

            const payment =
              normalisePaymentResult(
                response.result,
                input
              );

            if (
              !isNonEmptyString(
                payment.paymentId
              ) &&
              !isNonEmptyString(
                payment.paymentUrl
              ) &&
              payment.status !==
                "CONFIRMED"
            ) {
              throw createControllerError(
                ERROR_CODE
                  .PAYMENT_FAILED,

                "The payment service did not return a valid payment reference.",

                {
                  serviceMethod:
                    response.methodName,

                  serviceResult:
                    response.result ||
                    null
                }
              );
            }

            const nextStatus =
              resolveControllerStatusFromPayment(
                payment
              );

            const nextRegistration =
              freezeObject({
                ...registration,

                paymentStatus:
                  payment.status,

                payment,

                status:
                  payment.status ===
                    "CONFIRMED"
                    ? "PAYMENT_CONFIRMED"
                    : registration.status,

                updatedAt:
                  nowIsoString()
              });

            const nextState =
              setState({
                status:
                  nextStatus,

                busy:
                  false,

                registration:
                  nextRegistration,

                payment,

                error:
                  null
              });

            dispatchControllerEvent(
              CONTROLLER_EVENT
                .PAYMENT_STARTED,

              {
                payment,

                registration:
                  nextRegistration,

                serviceMethod:
                  response.methodName,

                state:
                  nextState
              }
            );

            if (
              nextStatus ===
                CONTROLLER_STATUS
                  .PAYMENT_REQUIRED
            ) {
              dispatchControllerEvent(
                CONTROLLER_EVENT
                  .PAYMENT_REQUIRED,

                {
                  payment,

                  registration:
                    nextRegistration,

                  state:
                    nextState
                }
              );
            }

            if (
              nextStatus ===
                CONTROLLER_STATUS
                  .PAYMENT_CONFIRMED
            ) {
              dispatchControllerEvent(
                CONTROLLER_EVENT
                  .PAYMENT_CONFIRMED,

                {
                  payment,

                  registration:
                    nextRegistration,

                  state:
                    nextState
                }
              );
            }

            return payment;
          } catch (error) {
            throw handleControllerError(
              error,

              ERROR_CODE
                .PAYMENT_FAILED,

              "Unable to initiate payment for the Bridge Programme registration."
            );
          }
        }
      )();

    try {
      return await paymentInitiationPromise;
    } finally {
      paymentInitiationPromise =
        null;
    }
  }

  /* ==========================================================
     PAYMENT STATUS RESOLUTION
  ========================================================== */

  async function resolvePaymentStatus(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    if (
      paymentStatusResolutionPromise
    ) {
      return paymentStatusResolutionPromise;
    }

    paymentStatusResolutionPromise =
      (
        async function performPaymentStatusResolution() {
          const registration =
            validateRegistrationForPayment(
              safeOptions.registration ||
              controllerState
                .registration
            );

          setState({
            status:
              CONTROLLER_STATUS
                .PAYMENT_IN_PROGRESS,

            busy:
              true,

            error:
              null
          });

          try {
            const paymentService =
              getRequiredPaymentService();

            const currentPayment =
              safeOptions.payment ||
              controllerState.payment ||
              registration.payment ||
              null;

            const payload =
              freezeObject({
                learnerUid:
                  controllerState.learner
                    ? controllerState
                        .learner
                        .learnerUid
                    : "",

                registrationId:
                  registration
                    .registrationId,

                paymentId:
                  isObject(
                    currentPayment
                  )
                    ? normaliseString(
                        currentPayment
                          .paymentId
                      )
                    : "",

                providerOrderId:
                  isObject(
                    currentPayment
                  )
                    ? normaliseString(
                        currentPayment
                          .providerOrderId
                      )
                    : "",

                providerPaymentId:
                  isObject(
                    currentPayment
                  )
                    ? normaliseString(
                        currentPayment
                          .providerPaymentId
                      )
                    : "",

                currency:
                  registration.currency,

                baseAmount:
                  registration
                    .baseAmount,

                gstAmount:
                  registration
                    .gstAmount,

                taxAmount:
                  registration
                    .taxAmount,

                totalAmount:
                  registration
                    .totalAmount
              });

            const response =
              await invokeServiceMethod(
                paymentService,

                [
                  "resolveBridgePaymentStatus",
                  "getBridgePaymentStatus",
                  "resolvePaymentStatus",
                  "getPaymentStatus",
                  "verifyPaymentStatus",
                  "getPayment"
                ],

                payload,

                ERROR_CODE
                  .PAYMENT_FAILED,

                "Unable to resolve the Bridge Programme payment status."
              );

            const payment =
              normalisePaymentResult(
                response.result,

                {
                  ...payload,

                  registrationId:
                    registration
                      .registrationId
                }
              );

            const nextStatus =
              resolveControllerStatusFromPayment(
                payment
              );

            const nextRegistration =
              freezeObject({
                ...registration,

                paymentStatus:
                  payment.status,

                payment,

                status:
                  payment.status ===
                    "CONFIRMED"
                    ? "PAYMENT_CONFIRMED"
                    : registration.status,

                updatedAt:
                  nowIsoString()
              });

            const nextState =
              setState({
                status:
                  nextStatus,

                busy:
                  false,

                registration:
                  nextRegistration,

                payment,

                error:
                  null
              });

            if (
              nextStatus ===
                CONTROLLER_STATUS
                  .PAYMENT_CONFIRMED
            ) {
              dispatchControllerEvent(
                CONTROLLER_EVENT
                  .PAYMENT_CONFIRMED,

                {
                  payment,

                  registration:
                    nextRegistration,

                  serviceMethod:
                    response.methodName,

                  state:
                    nextState
                }
              );
            } else if (
              nextStatus ===
                CONTROLLER_STATUS
                  .PAYMENT_REQUIRED
            ) {
              dispatchControllerEvent(
                CONTROLLER_EVENT
                  .PAYMENT_REQUIRED,

                {
                  payment,

                  registration:
                    nextRegistration,

                  serviceMethod:
                    response.methodName,

                  state:
                    nextState
                }
              );
            }

            return payment;
          } catch (error) {
            throw handleControllerError(
              error,

              ERROR_CODE
                .PAYMENT_FAILED,

              "Unable to resolve the Bridge Programme payment status."
            );
          }
        }
      )();

    try {
      return await paymentStatusResolutionPromise;
    } finally {
      paymentStatusResolutionPromise =
        null;
    }
  }

  /* ==========================================================
     PAYMENT STATE
  ========================================================== */

  function hasResolvedPayment() {
    return Boolean(
      controllerState.payment &&
      (
        isNonEmptyString(
          controllerState
            .payment
            .paymentId
        ) ||
        isNonEmptyString(
          controllerState
            .payment
            .paymentUrl
        ) ||
        isNonEmptyString(
          controllerState
            .payment
            .status
        )
      )
    );
  }

  function getResolvedPayment() {
    return controllerState.payment;
  }

  function hasConfirmedPayment() {
    return Boolean(
      hasResolvedPayment() &&
      normalisePaymentStatus(
        controllerState
          .payment
          .status
      ) ===
        "CONFIRMED"
    );
  }

  /* ==========================================================
     ENROLMENT SERVICE ACCESS
  ========================================================== */

  function getRequiredEnrolmentService() {
    const dependencies =
      assertRequiredDependencies({
        requireEnrolmentService:
          true
      });

    if (
      !dependencies
        .enrolmentServiceAvailable ||
      !dependencies.enrolmentService
    ) {
      throw createControllerError(
        ERROR_CODE
          .DEPENDENCY_UNAVAILABLE,

        "EnrolmentService is unavailable."
      );
    }

    return dependencies
      .enrolmentService;
  }

  /* ==========================================================
     ENROLMENT INPUT
  ========================================================== */

  function buildEnrolmentInput(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    const registration =
      validateRegistrationForPayment(
        safeOptions.registration ||
        controllerState.registration
      );

    const payment =
      safeOptions.payment ||
      controllerState.payment ||
      registration.payment ||
      null;

    if (
      !isObject(
        payment
      ) ||
      normalisePaymentStatus(
        payment.status
      ) !==
        "CONFIRMED"
    ) {
      throw createControllerError(
        ERROR_CODE
          .ENROLMENT_RESOLUTION_FAILED,

        "Confirmed payment is required before resolving Bridge Programme enrolment.",

        {
          registrationId:
            registration
              .registrationId,

          payment:
            payment ||
            null
        }
      );
    }

    return freezeObject({
      learnerUid:
        registration
          .learnerUid,

      learnerEmail:
        registration
          .learnerEmail,

      registrationId:
        registration
          .registrationId,

      paymentId:
        normaliseString(
          payment.paymentId
        ),

      providerOrderId:
        normaliseString(
          payment.providerOrderId
        ),

      providerPaymentId:
        normaliseString(
          payment.providerPaymentId
        ),

      sourceProgrammeCode:
        registration
          .sourceProgrammeCode,

      targetProgrammeCode:
        registration
          .targetProgrammeCode,

      credentialId:
        registration
          .credentialId,

      relationshipCode:
        registration
          .relationshipCode,

      relationshipType:
        registration
          .relationshipType,

      offerId:
        registration.offerId,

      offerCode:
        registration.offerCode,

      currency:
        registration.currency,

      totalAmount:
        registration
          .totalAmount,

      cohortId:
        normaliseString(
          safeOptions.cohortId
        ),

      source:
        normaliseString(
          safeOptions.source
        ) ||
        "STUDENT_PORTAL"
    });
  }

  /* ==========================================================
     ENROLMENT RESULT NORMALISATION
  ========================================================== */

  function normaliseEnrolmentResult(
    rawResult,
    input
  ) {
    const result =
      isObject(
        rawResult
      )
        ? rawResult
        : {};

    const governedInput =
      isObject(
        input
      )
        ? input
        : {};

    const nestedEnrolment =
      isObject(
        result.enrolment
      )
        ? result.enrolment
        : (
            isObject(
              result.enrollment
            )
              ? result.enrollment
              : {}
          );

    const enrolmentData =
      Object.keys(
        nestedEnrolment
      ).length >
        0
        ? nestedEnrolment
        : result;

    return freezeObject({
      enrolmentId:
        normaliseString(
          enrolmentData
            .enrolmentId ||
          enrolmentData
            .enrollmentId ||
          enrolmentData.id ||
          result.enrolmentId ||
          result.enrollmentId ||
          result.id
        ),

      status:
        normaliseEnrolmentStatus(
          enrolmentData.status ||
          enrolmentData
            .enrolmentStatus ||
          enrolmentData
            .enrollmentStatus ||
          result.status ||
          result.enrolmentStatus ||
          result.enrollmentStatus
        ),

      learnerUid:
        normaliseString(
          enrolmentData
            .learnerUid ||
          result.learnerUid ||
          governedInput
            .learnerUid
        ),

      registrationId:
        normaliseString(
          enrolmentData
            .registrationId ||
          result.registrationId ||
          governedInput
            .registrationId
        ),

      paymentId:
        normaliseString(
          enrolmentData
            .paymentId ||
          result.paymentId ||
          governedInput.paymentId
        ),

      sourceProgrammeCode:
        normaliseProgrammeCode(
          enrolmentData
            .sourceProgrammeCode ||
          result
            .sourceProgrammeCode ||
          governedInput
            .sourceProgrammeCode
        ),

      targetProgrammeCode:
        normaliseProgrammeCode(
          enrolmentData
            .targetProgrammeCode ||
          result
            .targetProgrammeCode ||
          governedInput
            .targetProgrammeCode
        ),

      cohortId:
        normaliseString(
          enrolmentData.cohortId ||
          result.cohortId ||
          governedInput.cohortId
        ),

      enrolledAt:
        normaliseString(
          enrolmentData.enrolledAt ||
          enrolmentData.createdAt ||
          result.enrolledAt ||
          result.createdAt
        ),

      activatedAt:
        normaliseString(
          enrolmentData.activatedAt ||
          result.activatedAt
        ),

      resolvedAt:
        nowIsoString(),

      raw:
        freezeObject(
          enrolmentData
        )
    });
  }

  /* ==========================================================
     ENROLMENT RESOLUTION
  ========================================================== */

  async function resolveEnrolment(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    if (
      hasResolvedEnrolment() &&
      safeOptions.force !==
        true
    ) {
      return controllerState
        .enrolment;
    }

    if (
      enrolmentResolutionPromise
    ) {
      return enrolmentResolutionPromise;
    }

    enrolmentResolutionPromise =
      (
        async function performEnrolmentResolution() {
          if (
            !hasConfirmedPayment()
          ) {
            await resolvePaymentStatus({
              ...safeOptions
            });
          }

          if (
            !hasConfirmedPayment()
          ) {
            return null;
          }

          setState({
            status:
              CONTROLLER_STATUS
                .ENROLMENT_PENDING,

            busy:
              true,

            error:
              null
          });

          try {
            const enrolmentService =
              getRequiredEnrolmentService();

            const input =
              buildEnrolmentInput(
                safeOptions
              );

            const response =
              await invokeServiceMethod(
                enrolmentService,

                [
                  "resolveBridgeEnrolment",
                  "resolveBridgeEnrollment",
                  "getBridgeEnrolment",
                  "getBridgeEnrollment",
                  "resolveEnrolment",
                  "resolveEnrollment",
                  "getEnrolment",
                  "getEnrollment"
                ],

                input,

                ERROR_CODE
                  .ENROLMENT_RESOLUTION_FAILED,

                "Unable to resolve the Bridge Programme enrolment."
              );

            const enrolment =
              normaliseEnrolmentResult(
                response.result,
                input
              );

            const enrolled =
              enrolment.status ===
                "ENROLLED";

            const blocked =
              enrolment.status ===
                "FAILED" ||
              enrolment.status ===
                "BLOCKED" ||
              enrolment.status ===
                "CANCELLED";

            const nextStatus =
              enrolled
                ? CONTROLLER_STATUS
                    .ENROLLED
                : (
                    blocked
                      ? CONTROLLER_STATUS
                          .BLOCKED
                      : CONTROLLER_STATUS
                          .ENROLMENT_PENDING
                  );

            const registration =
              controllerState
                .registration;

            const nextRegistration =
              registration
                ? freezeObject({
                    ...registration,

                    enrolmentStatus:
                      enrolment.status,

                    enrolment,

                    status:
                      enrolled
                        ? "ENROLLED"
                        : registration
                            .status,

                    updatedAt:
                      nowIsoString()
                  })
                : null;

            const nextState =
              setState({
                status:
                  nextStatus,

                busy:
                  false,

                registration:
                  nextRegistration,

                enrolment,

                error:
                  null
              });

            dispatchControllerEvent(
              CONTROLLER_EVENT
                .ENROLMENT_RESOLVED,

              {
                enrolment,

                enrolled,

                registration:
                  nextRegistration,

                serviceMethod:
                  response.methodName,

                state:
                  nextState
              }
            );

            return enrolment;
          } catch (error) {
            throw handleControllerError(
              error,

              ERROR_CODE
                .ENROLMENT_RESOLUTION_FAILED,

              "Unable to resolve the Bridge Programme enrolment."
            );
          }
        }
      )();

    try {
      return await enrolmentResolutionPromise;
    } finally {
      enrolmentResolutionPromise =
        null;
    }
  }

  /* ==========================================================
     ENROLMENT STATE
  ========================================================== */

  function hasResolvedEnrolment() {
    return Boolean(
      controllerState.enrolment &&
      (
        isNonEmptyString(
          controllerState
            .enrolment
            .enrolmentId
        ) ||
        isNonEmptyString(
          controllerState
            .enrolment
            .status
        )
      )
    );
  }

  function getResolvedEnrolment() {
    return controllerState
      .enrolment;
  }

  function isLearnerEnrolled() {
    return Boolean(
      hasResolvedEnrolment() &&
      normaliseEnrolmentStatus(
        controllerState
          .enrolment
          .status
      ) ===
        "ENROLLED"
    );
  }

  /* ==========================================================
     PAYMENT AND ENROLMENT READINESS
  ========================================================== */

  function getPaymentAndEnrolmentReadiness() {
    const readiness =
      getReadiness();

    const registrationReadiness =
      getRegistrationReadiness();

    return freezeObject({
      registrationResolved:
        registrationReadiness
          .registrationResolved,

      registrationId:
        registrationReadiness
          .registrationId,

      paymentServiceAvailable:
        readiness
          .paymentServiceAvailable,

      enrolmentServiceAvailable:
        readiness
          .enrolmentServiceAvailable,

      paymentResolved:
        hasResolvedPayment(),

      paymentStatus:
        hasResolvedPayment()
          ? controllerState
              .payment
              .status
          : null,

      paymentConfirmed:
        hasConfirmedPayment(),

      enrolmentResolved:
        hasResolvedEnrolment(),

      enrolmentStatus:
        hasResolvedEnrolment()
          ? controllerState
              .enrolment
              .status
          : null,

      enrolled:
        isLearnerEnrolled(),

      readyForPayment:
        registrationReadiness
          .readyForPayment &&
        readiness
          .paymentServiceAvailable,

      readyForPaymentStatusResolution:
        registrationReadiness
          .registrationResolved &&
        readiness
          .paymentServiceAvailable,

      readyForEnrolmentResolution:
        registrationReadiness
          .registrationResolved &&
        hasConfirmedPayment() &&
        readiness
          .enrolmentServiceAvailable &&
        !isLearnerEnrolled()
    });
  }

  /* ==========================================================
     END OF BLOCK 9 OF 10

     Do not close the IIFE here.
     Block 10 must continue immediately below this section.
  ========================================================== */

    /* ==========================================================
     BLOCK 10 OF 10
     COMPLETE JOURNEY, DIAGNOSTICS AND PUBLIC API
  ========================================================== */

  /* ==========================================================
     COMPLETE PAGE JOURNEY INITIALISATION
  ========================================================== */

  async function initialiseRegistrationJourney(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    if (
      registrationJourneyInitialisationPromise
    ) {
      return registrationJourneyInitialisationPromise;
    }

    registrationJourneyInitialisationPromise =
      (
        async function performRegistrationJourneyInitialisation() {
          try {
            /*
             * Page initialisation is read-only regarding new
             * registration creation.
             *
             * It may:
             * - initialise authentication and programme context;
             * - resolve eligibility and the commercial offer;
             * - restore an existing registration;
             * - resolve payment or enrolment state when requested.
             *
             * It must never create a new registration merely
             * because the learner opened the page.
             */

            const pageContext =
              await initialisePageContext({
                ...safeOptions
              });

            const eligibilityAndOffer =
              await resolveEligibilityAndOffer({
                ...safeOptions,

                forceEligibility:
                  safeOptions
                    .forceEligibility ===
                  true,

                forceOffer:
                  safeOptions
                    .forceOffer ===
                  true
              });

            if (
              !eligibilityAndOffer ||
              eligibilityAndOffer
                .eligible !==
              true
            ) {
              return freezeObject({
                pageContext,

                eligible:
                  false,

                offerAvailable:
                  false,

                registrationExists:
                  false,

                created:
                  false,

                restored:
                  false,

                existing:
                  false,

                idempotent:
                  false,

                creationRequired:
                  false,

                acknowledgementRequired:
                  false,

                eligibility:
                  controllerState
                    .eligibility,

                offer:
                  null,

                registration:
                  null,

                payment:
                  null,

                enrolment:
                  null,

                status:
                  controllerState.status,

                state:
                  controllerState
              });
            }

            if (
              eligibilityAndOffer
                .offerAvailable !==
              true
            ) {
              return freezeObject({
                pageContext,

                eligible:
                  true,

                offerAvailable:
                  false,

                registrationExists:
                  false,

                created:
                  false,

                restored:
                  false,

                existing:
                  false,

                idempotent:
                  false,

                creationRequired:
                  false,

                acknowledgementRequired:
                  false,

                eligibility:
                  controllerState
                    .eligibility,

                offer:
                  controllerState
                    .offer,

                registration:
                  null,

                payment:
                  null,

                enrolment:
                  null,

                status:
                  controllerState.status,

                state:
                  controllerState
              });
            }

            const registrationResult =
              await resolveOrCreateRegistration({
                ...safeOptions,

                /*
                 * This is the locked production-safety rule:
                 * page loading never creates a registration.
                 */

                createIfMissing:
                  false,

                forceRegistrationResolution:
                  safeOptions
                    .forceRegistrationResolution ===
                  true
              });

            let registration =
              registrationResult &&
              registrationResult
                .registration
                ? registrationResult
                    .registration
                : controllerState
                    .registration;

            /*
             * Resolve trusted payment status only when explicitly
             * requested and an existing registration is available.
             */

            if (
              registration &&
              safeOptions
                .resolvePaymentStatus ===
              true
            ) {
              await resolvePaymentStatus({
                ...safeOptions,

                registration
              });

              registration =
                controllerState
                  .registration;
            }

            /*
             * Enrolment resolution is permitted only after trusted
             * payment confirmation and only when explicitly asked.
             */

            if (
              (
                controllerState.status ===
                  CONTROLLER_STATUS
                    .PAYMENT_CONFIRMED ||
                hasConfirmedPayment()
              ) &&
              safeOptions
                .resolveEnrolmentAfterPayment ===
              true
            ) {
              await resolveEnrolment({
                ...safeOptions,

                registration:
                  controllerState
                    .registration,

                payment:
                  controllerState
                    .payment
              });

              registration =
                controllerState
                  .registration;
            }

            const registrationExists =
              Boolean(
                registration &&
                registration
                  .registrationExists ===
                  true &&
                isNonEmptyString(
                  registration
                    .registrationId
                )
              );

            return freezeObject({
              pageContext,

              eligible:
                true,

              offerAvailable:
                true,

              registrationExists,

              created:
                false,

              restored:
                Boolean(
                  registrationResult &&
                  registrationResult
                    .restored ===
                    true
                ),

              existing:
                Boolean(
                  registrationResult &&
                  registrationResult
                    .existing ===
                    true
                ),

              idempotent:
                Boolean(
                  registrationResult &&
                  registrationResult
                    .idempotent ===
                    true
                ),

              creationRequired:
                Boolean(
                  registrationResult &&
                  registrationResult
                    .creationRequired ===
                    true
                ),

              acknowledgementRequired:
                Boolean(
                  registrationResult &&
                  registrationResult
                    .acknowledgementRequired ===
                    true
                ),

              eligibility:
                controllerState
                  .eligibility,

              offer:
                controllerState.offer,

              registration,

              payment:
                controllerState.payment,

              enrolment:
                controllerState.enrolment,

              status:
                controllerState.status,

              state:
                controllerState
            });
          } catch (error) {
            if (
              error &&
              error.name ===
                "BridgeRegistrationControllerError"
            ) {
              throw error;
            }

            throw handleControllerError(
              error,

              ERROR_CODE
                .INITIALISATION_FAILED,

              "Unable to initialise the complete Bridge Programme registration journey."
            );
          }
        }
      )();

    try {
      return await registrationJourneyInitialisationPromise;
    } finally {
      registrationJourneyInitialisationPromise =
        null;
    }
  }

  /* ==========================================================
     COMPLETE REGISTRATION JOURNEY
  ========================================================== */

  async function resolveRegistrationJourney(
    options
  ) {
    const safeOptions =
      isObject(
        options
      )
        ? options
        : {};

    /*
     * Without an explicit creation request this behaves as the
     * safe page-initialisation journey.
     */

    if (
      safeOptions.createIfMissing !==
      true
    ) {
      return initialiseRegistrationJourney({
        ...safeOptions
      });
    }

    /*
     * An explicit creation journey must include learner
     * acknowledgement. buildRegistrationCreationInput() performs
     * the final governed validation as well.
     */

    if (
      safeOptions
        .acknowledgementAccepted !==
      true
    ) {
      throw createControllerError(
        ERROR_CODE
          .REGISTRATION_CREATION_FAILED,

        "The learner must accept the Bridge Programme acknowledgement before registration.",

        {
          field:
            "acknowledgementAccepted",

          receivedValue:
            safeOptions
              .acknowledgementAccepted
        }
      );
    }

    if (
      !getPageContextReadiness()
        .ready
    ) {
      await initialisePageContext({
        ...safeOptions
      });
    }

    const registrationResult =
      await resolveOrCreateRegistration({
        ...safeOptions,

        createIfMissing:
          true,

        acknowledgementAccepted:
          true
      });

    let payment =
      controllerState.payment;

    let enrolment =
      controllerState.enrolment;

    if (
      registrationResult &&
      registrationResult
        .registration &&
      safeOptions
        .initiatePayment ===
      true
    ) {
      payment =
        await initiatePayment({
          ...safeOptions,

          registration:
            registrationResult
              .registration
        });
    }

    if (
      safeOptions
        .resolvePaymentStatus ===
        true &&
      registrationResult &&
      registrationResult
        .registration
    ) {
      payment =
        await resolvePaymentStatus({
          ...safeOptions,

          registration:
            controllerState
              .registration,

          payment:
            payment ||
            controllerState
              .payment
        });
    }

    if (
      (
        hasConfirmedPayment() ||
        controllerState.status ===
          CONTROLLER_STATUS
            .PAYMENT_CONFIRMED
      ) &&
      safeOptions
        .resolveEnrolmentAfterPayment ===
      true
    ) {
      enrolment =
        await resolveEnrolment({
          ...safeOptions,

          registration:
            controllerState
              .registration,

          payment:
            controllerState
              .payment
        });
    }

    return freezeObject({
      eligible:
        isLearnerEligible(),

      offerAvailable:
        isOfferAvailable(),

      registrationExists:
        hasResolvedRegistration(),

      created:
        Boolean(
          registrationResult &&
          registrationResult
            .created ===
            true
        ),

      restored:
        Boolean(
          registrationResult &&
          registrationResult
            .restored ===
            true
        ),

      existing:
        Boolean(
          registrationResult &&
          registrationResult
            .existing ===
            true
        ),

      idempotent:
        Boolean(
          registrationResult &&
          registrationResult
            .idempotent ===
            true
        ),

      creationRequired:
        Boolean(
          registrationResult &&
          registrationResult
            .creationRequired ===
            true
        ),

      acknowledgementRequired:
        Boolean(
          registrationResult &&
          registrationResult
            .acknowledgementRequired ===
            true
        ),

      eligibility:
        controllerState
          .eligibility,

      offer:
        controllerState.offer,

      registration:
        controllerState
          .registration,

      payment:
        payment ||
        controllerState.payment,

      enrolment:
        enrolment ||
        controllerState
          .enrolment,

      status:
        controllerState.status,

      state:
        controllerState
    });
  }

  /* ==========================================================
     CONTROLLER STATE HELPERS
  ========================================================== */

  function isControllerInitialised() {
    return controllerState
      .initialised ===
      true;
  }

  function isControllerBusy() {
    return controllerState
      .busy ===
      true;
  }

  function getControllerStatus() {
    return controllerState
      .status;
  }

  function hasControllerError() {
    return Boolean(
      controllerState.error
    );
  }

  function getControllerError() {
    return controllerState
      .error;
  }

  function isPaymentRequired() {
    return controllerState.status ===
      CONTROLLER_STATUS
        .PAYMENT_REQUIRED;
  }

  function isPaymentInProgress() {
    return controllerState.status ===
      CONTROLLER_STATUS
        .PAYMENT_IN_PROGRESS;
  }

  function isPaymentConfirmed() {
    return Boolean(
      controllerState.status ===
        CONTROLLER_STATUS
          .PAYMENT_CONFIRMED ||
      hasConfirmedPayment()
    );
  }

  function isRegistrationBlocked() {
    return controllerState.status ===
      CONTROLLER_STATUS
        .BLOCKED;
  }

  /* ==========================================================
     COMPLETE CONTROLLER READINESS
  ========================================================== */

  function getControllerReadiness() {
    const foundationReadiness =
      getReadiness();

    const learnerIdentityReadiness =
      getLearnerIdentityReadiness();

    const pageContextReadiness =
      getPageContextReadiness();

    const eligibilityReadiness =
      getEligibilityReadiness();

    const eligibilityAndOfferReadiness =
      getEligibilityAndOfferReadiness();

    const registrationReadiness =
      getRegistrationReadiness();

    const paymentAndEnrolmentReadiness =
      getPaymentAndEnrolmentReadiness();

    return freezeObject({
      ready:
        foundationReadiness.ready,

      foundation:
        foundationReadiness,

      learnerIdentity:
        learnerIdentityReadiness,

      pageContext:
        pageContextReadiness,

      eligibility:
        eligibilityReadiness,

      eligibilityAndOffer:
        eligibilityAndOfferReadiness,

      registration:
        registrationReadiness,

      paymentAndEnrolment:
        paymentAndEnrolmentReadiness,

      readyForPageContext:
        foundationReadiness.ready &&
        foundationReadiness
          .authAvailable,

      readyForEligibility:
        pageContextReadiness.ready &&
        eligibilityReadiness
          .requiredServicesAvailable,

      readyForRegistration:
        eligibilityAndOfferReadiness
          .readyForRegistration,

      readyForPayment:
        paymentAndEnrolmentReadiness
          .readyForPayment,

      readyForPaymentStatusResolution:
        paymentAndEnrolmentReadiness
          .readyForPaymentStatusResolution,

      readyForEnrolmentResolution:
        paymentAndEnrolmentReadiness
          .readyForEnrolmentResolution,

      complete:
        isLearnerEnrolled(),

      status:
        controllerState.status,

      busy:
        controllerState.busy ===
        true,

      error:
        controllerState.error
    });
  }

  /* ==========================================================
     DIAGNOSTICS
  ========================================================== */

  function getDiagnostics() {
    const dependencies =
      resolveDependencies();

    return freezeObject({
      controllerName:
        CONTROLLER_NAME,

      controllerVersion:
        CONTROLLER_VERSION,

      timestamp:
        nowIsoString(),

      status:
        controllerState.status,

      initialised:
        controllerState
          .initialised ===
        true,

      busy:
        controllerState.busy ===
        true,

      hasError:
        Boolean(
          controllerState.error
        ),

      error:
        controllerState.error,

      dependencies:
        freezeObject({
          firebaseAvailable:
            dependencies
              .firebaseAvailable,

          authAvailable:
            dependencies
              .authAvailable,

          registrationServiceAvailable:
            dependencies
              .registrationServiceAvailable,

          programServiceAvailable:
            dependencies
              .programServiceAvailable,

          eligibilityServiceAvailable:
            dependencies
              .eligibilityServiceAvailable,

          bridgeProgramServiceAvailable:
            dependencies
              .bridgeProgramServiceAvailable,

          paymentServiceAvailable:
            dependencies
              .paymentServiceAvailable,

          enrolmentServiceAvailable:
            dependencies
              .enrolmentServiceAvailable
        }),

      operations:
        freezeObject({
          identityResolutionInProgress:
            Boolean(
              identityResolutionPromise
            ),

          eligibilityResolutionInProgress:
            Boolean(
              eligibilityResolutionPromise
            ),

          offerResolutionInProgress:
            Boolean(
              offerResolutionPromise
            ),

          registrationResolutionInProgress:
            Boolean(
              registrationResolutionPromise
            ),

          registrationCreationInProgress:
            Boolean(
              registrationCreationPromise
            ),

          paymentInitiationInProgress:
            Boolean(
              paymentInitiationPromise
            ),

          paymentStatusResolutionInProgress:
            Boolean(
              paymentStatusResolutionPromise
            ),

          enrolmentResolutionInProgress:
            Boolean(
              enrolmentResolutionPromise
            ),

          registrationJourneyInitialisationInProgress:
            Boolean(
              registrationJourneyInitialisationPromise
            )
        }),

      identity:
        freezeObject({
          learnerResolved:
            hasResolvedLearner(),

          learnerUid:
            hasResolvedLearner()
              ? controllerState
                  .learner
                  .learnerUid
              : null,

          learnerEmail:
            hasResolvedLearner()
              ? controllerState
                  .learner
                  .email ||
                null
              : null,

          emailVerified:
            hasResolvedLearner() &&
            controllerState
              .learner
              .emailVerified ===
              true
        }),

      programmeContext:
        freezeObject({
          resolved:
            hasProgrammeContext(),

          sourceProgrammeCode:
            controllerState
              .sourceProgrammeCode,

          targetProgrammeCode:
            controllerState
              .targetProgrammeCode
        }),

      journey:
        freezeObject({
          eligibilityResolved:
            hasResolvedEligibility(),

          learnerEligible:
            isLearnerEligible(),

          offerResolved:
            hasResolvedOffer(),

          offerAvailable:
            isOfferAvailable(),

          registrationResolved:
            hasResolvedRegistration(),

          paymentResolved:
            hasResolvedPayment(),

          paymentConfirmed:
            hasConfirmedPayment(),

          enrolmentResolved:
            hasResolvedEnrolment(),

          enrolled:
            isLearnerEnrolled()
        }),

      readiness:
        getControllerReadiness(),

      state:
        controllerState
    });
  }

  /* ==========================================================
     PUBLIC CONTROLLER API
  ========================================================== */

  const BridgeRegistrationController =
    freezeObject({
      CONTROLLER_NAME,

      CONTROLLER_VERSION,

      CONTROLLER_STATUS,

      CONTROLLER_EVENT,

      ERROR_CODE,

      initialise,

      initialisePageContext,

      initialiseRegistrationJourney,

      resolveRegistrationJourney,

      resolveAuthenticatedLearner,

      getResolvedLearner,

      hasResolvedLearner,

      getLearnerIdentityReadiness,

      validateProgrammeContext,

      setProgrammeContext,

      getProgrammeContext,

      hasProgrammeContext,

      assertPageContextReady,

      resolveVisibleCredentials,

      resolveEligibility,

      getResolvedEligibility,

      hasResolvedEligibility,

      isLearnerEligible,

      getEligibilityReadiness,

      resolveOffer,

      getResolvedOffer,

      hasResolvedOffer,

      isOfferAvailable,

      resolveEligibilityAndOffer,

      resolveExistingRegistration,

      createRegistration,

      resolveOrCreateRegistration,

      getResolvedRegistration,

      hasResolvedRegistration,

      initiatePayment,

      resolvePaymentStatus,

      getResolvedPayment,

      hasResolvedPayment,

      hasConfirmedPayment,

      resolveEnrolment,

      getResolvedEnrolment,

      hasResolvedEnrolment,

      isLearnerEnrolled,

      getState,

      resetState,

      clearControllerError,

      getReadiness,

      getPageContextReadiness,

      getEligibilityAndOfferReadiness,

      getRegistrationReadiness,

      getPaymentAndEnrolmentReadiness,

      getControllerReadiness,

      assertReady,

      getDiagnostics,

      isControllerInitialised,

      isControllerBusy,

      getControllerStatus,

      hasControllerError,

      getControllerError,

      isPaymentRequired,

      isPaymentInProgress,

      isPaymentConfirmed,

      isRegistrationBlocked
    });

  /* ==========================================================
     GLOBAL REGISTRATION
  ========================================================== */

  if (
    global.BridgeRegistrationController &&
    global.BridgeRegistrationController !==
      BridgeRegistrationController
  ) {
    console.warn(
      `[${CONTROLLER_NAME}] An existing global controller registration was replaced.`
    );
  }

  global.BridgeRegistrationController =
    BridgeRegistrationController;

  dispatchControllerEvent(
    CONTROLLER_EVENT.READY,

    {
      loaded:
        true,

      initialised:
        false,

      readiness:
        getReadiness()
    }
  );

  console.info(
    `[${CONTROLLER_NAME}] v${CONTROLLER_VERSION} loaded successfully.`
  );

  /* ==========================================================
     END OF BLOCK 10 OF 10
  ========================================================== */

})(
  window
);