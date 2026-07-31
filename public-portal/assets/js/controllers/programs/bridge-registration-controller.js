/* ============================================================
   AGILE AI UNIVERSITY
   BRIDGE REGISTRATION CONTROLLER

   File:
   public-portal/assets/js/controllers/programs/
   bridge-registration-controller.js

   Version: 1.0.0
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
   - Resolve the authenticated learner
   - Resolve academic and commercial eligibility
   - Resolve the applicable bridge offer
   - Restore an existing registration
   - Create a registration when required
   - Coordinate registration and payment states
   - Expose immutable controller state
   - Dispatch governed lifecycle events

   Non-Responsibilities
   ------------------------------------------------------------
   This controller does not:

   - Write directly to Firestore
   - Determine trusted payment status
   - Verify payment signatures
   - Create learner enrolments directly
   - Activate learning-resource access directly
   - Contain programme pricing rules
   - Contain academic eligibility rules
   - Render unrestricted HTML

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

   Implementation Blocks
   ------------------------------------------------------------
   Block 1 - Controller foundation
   Block 2 - Identity and programme context
   Block 3 - Eligibility and commercial offer
   Block 4 - Registration orchestration
   Block 5 - Payment and enrolment orchestration
   Block 6 - Diagnostics and public registration

   Change History
   ------------------------------------------------------------
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

(function initialiseBridgeRegistrationController(global) {
  "use strict";

  /* ==========================================================
     CONTROLLER IDENTITY
  ========================================================== */

  const CONTROLLER_NAME =
    "BridgeRegistrationController";

  const CONTROLLER_VERSION =
    "1.0.0";

  /* ==========================================================
     CONTROLLER STATUS
  ========================================================== */

  const CONTROLLER_STATUS = Object.freeze({
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

  const CONTROLLER_EVENT = Object.freeze({
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

  const ERROR_CODE = Object.freeze({
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

  function isObject(value) {
    return Boolean(
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    );
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

  function normaliseEmail(value) {
    return normaliseString(
      value
    ).toLowerCase();
  }

  function normaliseProgrammeCode(value) {
    return normaliseString(
      value
    ).toUpperCase();
  }

  function normaliseBoolean(value) {
    return value === true;
  }

  function normaliseNumber(
    value,
    fallbackValue
  ) {
    const numericValue =
      Number(value);

    if (
      Number.isFinite(
        numericValue
      )
    ) {
      return numericValue;
    }

    return Number.isFinite(
      Number(fallbackValue)
    )
      ? Number(fallbackValue)
      : 0;
  }

  function nowIsoString() {
    return new Date()
      .toISOString();
  }

  function freezeArray(value) {
    if (
      !Array.isArray(value)
    ) {
      return Object.freeze([]);
    }

    return Object.freeze([
      ...value
    ]);
  }

  function freezeObject(value) {
    if (
      !isObject(value)
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
    const error =
      new Error(
        normaliseString(message) ||
        "A Bridge Registration Controller error occurred."
      );

    error.name =
      "BridgeRegistrationControllerError";

    error.code =
      normaliseString(code) ||
      ERROR_CODE.INTERNAL_ERROR;

    error.details =
      isObject(details)
        ? freezeObject(details)
        : null;

    error.controller =
      CONTROLLER_NAME;

    error.controllerVersion =
      CONTROLLER_VERSION;

    return error;
  }

  function serialiseError(error) {
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
        ERROR_CODE.INTERNAL_ERROR,

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
      typeof service !== "object"
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
      typeof service !== "object"
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
      typeof service !== "object"
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
      typeof service !== "object"
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

    const paymentService =
      getPaymentService();

    const enrolmentService =
      getEnrolmentService();

    return freezeObject({
      firebaseAuth,

      registrationService,

      programService,

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
      isObject(options)
        ? options
        : {};

    const requireProgramService =
      safeOptions
        .requireProgramService ===
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

  function buildState(nextState) {
    const safeState =
      isObject(nextState)
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

                ...(isObject(detail)
                  ? detail
                  : {})
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

  function setState(patch) {
    const safePatch =
      isObject(patch)
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
              ERROR_CODE.INTERNAL_ERROR,

            fallbackMessage ||
              "An unexpected Bridge Registration Controller error occurred.",

            {
              originalError:
                error || null
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
        ? dependencies.firebaseAuth
            .currentUser
        : null;

    const foundationReady =
      dependencies.authAvailable &&
      dependencies
        .registrationServiceAvailable;

    const programmeResolutionReady =
      foundationReady &&
      dependencies
        .programServiceAvailable;

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
     CONTROLLER INITIALISATION
  ========================================================== */

  async function initialise(options) {
    const safeOptions =
      isObject(options)
        ? options
        : {};

    if (
      controllerState.busy
    ) {
      return controllerState;
    }

    if (
      controllerState.initialised &&
      safeOptions.force !== true
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
     END OF BLOCK 1 OF 6

     Do not close the IIFE here.
     Block 2 must continue immediately below this section.
  ========================================================== */
    /* ==========================================================
     BLOCK 2 OF 6
     AUTHENTICATED LEARNER AND PROGRAMME CONTEXT
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
                return provider &&
                  isNonEmptyString(
                    provider.providerId
                  )
                  ? normaliseString(
                      provider.providerId
                    )
                  : "";
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
          .emailVerified === true,

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
          .isAnonymous === true,

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
      !isObject(learner)
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
      learner.isAnonymous === true
    ) {
      throw createControllerError(
        ERROR_CODE.AUTH_REQUIRED,

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
      dependencies.firebaseAuth
        .currentUser;

    if (
      !authenticatedUser ||
      !isNonEmptyString(
        authenticatedUser.uid
      )
    ) {
      throw createControllerError(
        ERROR_CODE.AUTH_REQUIRED,

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
      isObject(options)
        ? options
        : {};

    const timeoutMs =
      normaliseNumber(
        safeOptions.timeoutMs,
        10000
      );

    const governedTimeoutMs =
      timeoutMs > 0
        ? timeoutMs
        : 10000;

    const dependencies =
      assertRequiredDependencies();

    const firebaseAuth =
      dependencies.firebaseAuth;

    if (
      firebaseAuth.currentUser &&
      isNonEmptyString(
        firebaseAuth.currentUser.uid
      )
    ) {
      return firebaseAuth.currentUser;
    }

    if (
      typeof firebaseAuth
        .onAuthStateChanged !==
      "function"
    ) {
      throw createControllerError(
        ERROR_CODE.AUTH_REQUIRED,

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

        const timeoutHandle =
          global.setTimeout(
            function handleTimeout() {
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
                createControllerError(
                  ERROR_CODE.AUTH_REQUIRED,

                  "Timed out while waiting for an authenticated learner.",

                  {
                    timeoutMs:
                      governedTimeoutMs
                  }
                )
              );
            },

            governedTimeoutMs
          );

        unsubscribe =
          firebaseAuth.onAuthStateChanged(
            function handleUser(
              authenticatedUser
            ) {
              if (
                settled ||
                !authenticatedUser ||
                !isNonEmptyString(
                  authenticatedUser.uid
                )
              ) {
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
                unsubscribe();
              }

              resolve(
                authenticatedUser
              );
            },

            function handleAuthError(
              error
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
                unsubscribe();
              }

              reject(
                createControllerError(
                  ERROR_CODE.AUTH_REQUIRED,

                  "Unable to resolve the authenticated learner.",

                  {
                    originalError:
                      error || null
                  }
                )
              );
            }
          );
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
        isObject(options)
        ? options
        : {};

    if (
        hasResolvedLearner() &&
        safeOptions.force !== true
    ) {
        return controllerState.learner;
    }

    if (identityResolutionPromise) {
        return identityResolutionPromise;
    }

    identityResolutionPromise =
        (async function performIdentityResolution() {
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
                    safeOptions.timeoutMs
                });

            const learner =
            validateLearnerIdentity(
                buildLearnerViewModel(
                authenticatedUser
                )
            );

            const nextStatus =
            controllerState.initialised
                ? CONTROLLER_STATUS.READY
                : CONTROLLER_STATUS.IDLE;

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
        })();

    try {
        return await identityResolutionPromise;
    } finally {
        identityResolutionPromise =
        null;
    }
  }

  function hasResolvedLearner() {
    return Boolean(
      controllerState.learner &&
      isNonEmptyString(
        controllerState.learner
          .learnerUid
      )
    );
  }

  function getResolvedLearner() {
    return controllerState.learner;
  }

  /* ==========================================================
     PROGRAMME CONTEXT VALIDATION
  ========================================================== */

  function validateProgrammeContext(
    input
  ) {
    const safeInput =
      isObject(input)
        ? input
        : {};

    const sourceProgrammeCode =
      normaliseProgrammeCode(
        safeInput.sourceProgrammeCode ||
        controllerState
          .sourceProgrammeCode
      );

    const targetProgrammeCode =
      normaliseProgrammeCode(
        safeInput.targetProgrammeCode ||
        controllerState
          .targetProgrammeCode
      );

    if (
      !isNonEmptyString(
        sourceProgrammeCode
      )
    ) {
      throw createControllerError(
        ERROR_CODE.INVALID_INPUT,

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
        ERROR_CODE.INVALID_INPUT,

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
        ERROR_CODE.INVALID_INPUT,

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

  function setProgrammeContext(
    input
  ) {
    const programmeContext =
      validateProgrammeContext(
        input
      );

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

  /* ==========================================================
     PAGE CONTEXT INITIALISATION
  ========================================================== */

  async function initialisePageContext(
    options
  ) {
    const safeOptions =
      isObject(options)
        ? options
        : {};

    try {
      await initialise({
        force:
          safeOptions.force === true,

        sourceProgrammeCode:
          safeOptions
            .sourceProgrammeCode,

        targetProgrammeCode:
          safeOptions
            .targetProgrammeCode
      });

      const programmeContext =
        setProgrammeContext({
          sourceProgrammeCode:
            safeOptions
              .sourceProgrammeCode,

          targetProgrammeCode:
            safeOptions
              .targetProgrammeCode
        });

      const learner =
        await resolveAuthenticatedLearner({
          force:
            safeOptions
              .forceIdentity === true,

          waitForAuth:
            safeOptions.waitForAuth !==
            false,

          timeoutMs:
            safeOptions.timeoutMs
        });

      const state =
        setState({
          status:
            CONTROLLER_STATUS.READY,

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
     BLOCK 2 READINESS
  ========================================================== */

  function getPageContextReadiness() {
    return freezeObject({
      controllerInitialised:
        controllerState
          .initialised === true,

      learnerResolved:
        hasResolvedLearner(),

      programmeContextResolved:
        hasProgrammeContext(),

      ready:
        controllerState
          .initialised === true &&
        hasResolvedLearner() &&
        hasProgrammeContext(),

      learnerUid:
        hasResolvedLearner()
          ? controllerState
              .learner
              .learnerUid
          : null,

      sourceProgrammeCode:
        controllerState
          .sourceProgrammeCode,

      targetProgrammeCode:
        controllerState
          .targetProgrammeCode
    });
  }

  /* ==========================================================
     END OF BLOCK 2 OF 6

     Do not add diagnostics, the public API, global registration,
     or the closing IIFE yet.

     Block 3 must continue immediately below this section.
  ========================================================== */

    /* ==========================================================
     BLOCK 3 OF 6
     ACADEMIC ELIGIBILITY AND COMMERCIAL OFFER RESOLUTION
  ========================================================== */

  /* ==========================================================
     PROGRAM SERVICE ACCESS
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

  function findServiceMethod(
    service,
    methodNames
  ) {
    if (
      !service ||
      typeof service !== "object" ||
      !Array.isArray(methodNames)
    ) {
      return null;
    }

    for (
      let index = 0;
      index < methodNames.length;
      index += 1
    ) {
      const methodName =
        methodNames[index];

      if (
        isNonEmptyString(
          methodName
        ) &&
        typeof service[
          methodName
        ] === "function"
      ) {
        return freezeObject({
          methodName,

          method:
            service[
              methodName
            ].bind(service)
        });
      }
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
          "The required ProgramService method is unavailable.",

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
          .method(payload);

      return freezeObject({
        methodName:
          resolvedMethod
            .methodName,

        result:
          result === undefined
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
          "A programme service operation failed.",

        {
          methodName:
            resolvedMethod
              .methodName,

          originalError:
            error || null
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
      isObject(options)
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
        learner.email || "",

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
      isObject(rawResult)
        ? rawResult
        : {};

    const eligible =
      result.eligible === true ||
      result.isEligible === true ||
      result.allowed === true ||
      result.approved === true;

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

    return freezeObject({
      eligible,

      status:
        status.toUpperCase(),

      reasonCode,

      reason,

      learnerUid:
        input.learnerUid,

      learnerEmail:
        input.learnerEmail,

      sourceProgrammeCode:
        input
          .sourceProgrammeCode,

      targetProgrammeCode:
        input
          .targetProgrammeCode,

      academicEligibility:
        result
          .academicEligibility ||
        result.academic ||
        null,

      commercialEligibility:
        result
          .commercialEligibility ||
        result.commercial ||
        null,

      prerequisiteSatisfied:
        result
          .prerequisiteSatisfied ===
        true,

      blockingConditions:
        freezeArray(
          Array.isArray(
            result.blockingConditions
          )
            ? result
                .blockingConditions
            : []
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
    ELIGIBILITY RESOLUTION
    ========================================================== */

    async function resolveEligibility(
  options
) {
  const safeOptions =
    isObject(options)
      ? options
      : {};

  if (
    hasResolvedEligibility() &&
    safeOptions.force !== true
  ) {
    return controllerState
      .eligibility;
  }

  if (eligibilityResolutionPromise) {
    return eligibilityResolutionPromise;
  }

  eligibilityResolutionPromise =
    (async function performEligibilityResolution() {
      setState({
        status:
          CONTROLLER_STATUS
            .RESOLVING_ELIGIBILITY,

        busy:
          true,

        eligibility:
          safeOptions.force === true
            ? null
            : controllerState
                .eligibility,

        offer:
          safeOptions.force === true
            ? null
            : controllerState.offer,

        error:
          null
      });

      try {
        const programService =
          getRequiredProgramService();

        const input =
          buildEligibilityInput(
            safeOptions
          );

        const response =
          await invokeServiceMethod(
            programService,

            [
              "resolveBridgeEligibility",
              "getBridgeEligibility",
              "evaluateBridgeEligibility",
              "resolveEligibility",
              "checkEligibility"
            ],

            input,

            ERROR_CODE
              .ELIGIBILITY_RESOLUTION_FAILED,

            "Unable to resolve Bridge Programme eligibility."
          );

        const eligibility =
          normaliseEligibilityResult(
            response.result,
            input
          );

        const nextStatus =
          eligibility.eligible
            ? CONTROLLER_STATUS.READY
            : CONTROLLER_STATUS
                .NOT_ELIGIBLE;

        const nextState =
          setState({
            status:
              nextStatus,

            busy:
              false,

            learner:
              controllerState.learner,

            sourceProgrammeCode:
              input
                .sourceProgrammeCode,

            targetProgrammeCode:
              input
                .targetProgrammeCode,

            eligibility,

            offer:
              eligibility.eligible
                ? controllerState.offer
                : null,

            error:
              null
          });

        dispatchControllerEvent(
          CONTROLLER_EVENT
            .ELIGIBILITY_RESOLVED,

          {
            eligibility,

            serviceMethod:
              response.methodName,

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
    })();

  try {
    return await eligibilityResolutionPromise;
  } finally {
    eligibilityResolutionPromise =
      null;
  }
}
  function hasResolvedEligibility() {
    return Boolean(
      controllerState
        .eligibility &&
      typeof controllerState
        .eligibility.eligible ===
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
        .eligibility.eligible ===
        true
    );
  }

  /* ==========================================================
     OFFER INPUT
  ========================================================== */

  function buildOfferInput(
    options
  ) {
    const safeOptions =
      isObject(options)
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
      !isObject(eligibility) ||
      eligibility.eligible !== true
    ) {
      throw createControllerError(
        ERROR_CODE
          .OFFER_RESOLUTION_FAILED,

        "A confirmed eligible learner is required before resolving a Bridge Programme offer.",

        {
          eligibility:
            eligibility || null
        }
      );
    }

    return freezeObject({
      learnerUid:
        learner.learnerUid,

      learnerEmail:
        learner.email || "",

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
     OFFER RESULT NORMALISATION
  ========================================================== */

  function normaliseOfferResult(
    rawResult,
    input
  ) {
    const result =
      isObject(rawResult)
        ? rawResult
        : {};

    const offerAvailable =
      result.offerAvailable ===
        true ||
      result.available === true ||
      result.eligible === true ||
      result.active === true;

    const offerId =
      normaliseString(
        result.offerId ||
        result.id ||
        result.code
      );

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
        result.payableAmount,
        baseAmount +
        taxAmount
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

      offerCode:
        normaliseString(
          result.offerCode ||
          result.code
        ),

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

      taxRate:
        normaliseNumber(
          result.taxRate ??
          result.gstRate,
          0
        ),

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

      sourceProgrammeCode:
        input
          .sourceProgrammeCode,

      targetProgrammeCode:
        input
          .targetProgrammeCode,

      learnerUid:
        input.learnerUid,

      resolvedAt:
        nowIsoString(),

      raw:
        freezeObject(
          result
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
        isObject(options)
        ? options
        : {};

    if (
        hasResolvedOffer() &&
        safeOptions.force !== true
    ) {
        return controllerState.offer;
    }

    if (offerResolutionPromise) {
        return offerResolutionPromise;
    }

    offerResolutionPromise =
        (async function performOfferResolution() {
        if (
            !hasResolvedEligibility() ||
            safeOptions
            .forceEligibility === true
        ) {
            await resolveEligibility({
            ...safeOptions,

            force:
                safeOptions
                .forceEligibility ===
                true
            });
        }

        if (!isLearnerEligible()) {
            setState({
            status:
                CONTROLLER_STATUS
                .NOT_ELIGIBLE,

            busy:
                false,

            offer:
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
            safeOptions.force === true
                ? null
                : controllerState.offer,

            error:
            null
        });

        try {
            const programService =
            getRequiredProgramService();

            const input =
            buildOfferInput(
                safeOptions
            );

            const response =
            await invokeServiceMethod(
                programService,

                [
                "resolveBridgeOffer",
                "getBridgeOffer",
                "resolveCommercialOffer",
                "getCommercialOffer",
                "resolveOffer",
                "getOffer"
                ],

                input,

                ERROR_CODE
                .OFFER_RESOLUTION_FAILED,

                "Unable to resolve the applicable Bridge Programme offer."
            );

            const offer =
            normaliseOfferResult(
                response.result,
                input
            );

            const nextStatus =
            offer.offerAvailable
                ? CONTROLLER_STATUS.READY
                : CONTROLLER_STATUS.BLOCKED;

            const nextState =
            setState({
                status:
                nextStatus,

                busy:
                false,

                offer,

                error:
                null
            });

            dispatchControllerEvent(
            CONTROLLER_EVENT
                .OFFER_RESOLVED,

            {
                offer,

                serviceMethod:
                response.methodName,

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
        })();

    try {
        return await offerResolutionPromise;
    } finally {
        offerResolutionPromise =
        null;
    }
  }

  function hasResolvedOffer() {
    return Boolean(
      controllerState.offer &&
      typeof controllerState
        .offer.offerAvailable ===
        "boolean"
    );
  }

  function getResolvedOffer() {
    return controllerState.offer;
  }

  function isOfferAvailable() {
    return Boolean(
      hasResolvedOffer() &&
      controllerState
        .offer.offerAvailable ===
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
      isObject(options)
        ? options
        : {};

    const eligibility =
      await resolveEligibility({
        ...safeOptions,

        force:
          safeOptions.force === true ||
          safeOptions
            .forceEligibility ===
            true
      });

    if (
      !eligibility ||
      eligibility.eligible !== true
    ) {
      return freezeObject({
        eligible:
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
          safeOptions.force === true ||
          safeOptions
            .forceOffer === true
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
     BLOCK 3 READINESS
  ========================================================== */

  function getEligibilityAndOfferReadiness() {
    const pageContextReadiness =
      getPageContextReadiness();

    const readiness =
      getReadiness();

    return freezeObject({
      pageContextReady:
        pageContextReadiness.ready,

      programServiceAvailable:
        readiness
          .programServiceAvailable,

      eligibilityResolved:
        hasResolvedEligibility(),

      learnerEligible:
        isLearnerEligible(),

      offerResolved:
        hasResolvedOffer(),

      offerAvailable:
        isOfferAvailable(),

      readyForRegistration:
        pageContextReadiness.ready &&
        readiness
          .programServiceAvailable &&
        isLearnerEligible() &&
        isOfferAvailable()
    });
  }

  /* ==========================================================
     END OF BLOCK 3 OF 6

     Do not add diagnostics, the public API, global registration,
     or the closing IIFE yet.

     Block 4 must continue immediately below this section.
  ========================================================== */

    /* ==========================================================
     BLOCK 4 OF 6
     REGISTRATION RESOLUTION AND CREATION
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
      normaliseString(
        value
      ).toUpperCase();

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
      statusAliases[status] ||
      status ||
      "UNKNOWN"
    );
  }

  function normalisePaymentStatus(
    value
  ) {
    const status =
      normaliseString(
        value
      ).toUpperCase();

    const statusAliases =
      Object.freeze({
        CREATED:
          "PENDING",

        REQUIRED:
          "PENDING",

        PAYMENT_REQUIRED:
          "PENDING",

        AWAITING_PAYMENT:
          "PENDING",

        INITIATED:
          "PROCESSING",

        IN_PROGRESS:
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
      statusAliases[status] ||
      status ||
      "UNKNOWN"
    );
  }

  function normaliseEnrolmentStatus(
    value
  ) {
    const status =
      normaliseString(
        value
      ).toUpperCase();

    const statusAliases =
      Object.freeze({
        CREATED:
          "PENDING",

        PROCESSING:
          "PENDING",

        IN_PROGRESS:
          "PENDING",

        ACTIVE:
          "ENROLLED",

        COMPLETED:
          "ENROLLED",

        ENROLMENT_COMPLETED:
          "ENROLLED",

        ENROLLMENT_COMPLETED:
          "ENROLLED",

        FAILED:
          "FAILED",

        BLOCKED:
          "BLOCKED"
      });

    return (
      statusAliases[status] ||
      status ||
      "UNKNOWN"
    );
  }

  /* ==========================================================
     REGISTRATION INPUT
  ========================================================== */

  function buildRegistrationIdentityInput(
    options
  ) {
    const safeOptions =
      isObject(options)
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
        learner.email || "",

      sourceProgrammeCode:
        programmeContext
          .sourceProgrammeCode,

      targetProgrammeCode:
        programmeContext
          .targetProgrammeCode
    });
  }

  function buildRegistrationCreationInput(
    options
  ) {
    const safeOptions =
      isObject(options)
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
      !isObject(eligibility) ||
      eligibility.eligible !== true
    ) {
      throw createControllerError(
        ERROR_CODE
          .REGISTRATION_CREATION_FAILED,

        "Confirmed Bridge Programme eligibility is required before creating a registration.",

        {
          eligibility:
            eligibility || null
        }
      );
    }

    if (
      !isObject(offer) ||
      offer.offerAvailable !== true
    ) {
      throw createControllerError(
        ERROR_CODE
          .REGISTRATION_CREATION_FAILED,

        "An available Bridge Programme offer is required before creating a registration.",

        {
          offer:
            offer || null
        }
      );
    }

    return freezeObject({
      ...identityInput,

      offerId:
        normaliseString(
          offer.offerId
        ),

      offerCode:
        normaliseString(
          offer.offerCode
        ),

      currency:
        normaliseString(
          offer.currency
        ).toUpperCase(),

      eligibility,

      offer
    });
  }

  /* ==========================================================
     REGISTRATION RESULT NORMALISATION
  ========================================================== */

  function normaliseRegistrationResult(
    rawResult,
    input
  ) {
    const result =
      isObject(rawResult)
        ? rawResult
        : {};

    const nestedRegistration =
      isObject(result.registration)
        ? result.registration
        : {};

    const registrationData =
      Object.keys(
        nestedRegistration
      ).length > 0
        ? nestedRegistration
        : result;

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
      result.exists === true ||
      registrationData
        .registrationExists ===
        true ||
      result.registrationExists ===
        true ||
      registrationData.found ===
        true ||
      result.found === true;

    const explicitlyMissing =
      registrationData.exists ===
        false ||
      result.exists === false ||
      registrationData
        .registrationExists ===
        false ||
      result.registrationExists ===
        false ||
      registrationData.found ===
        false ||
      result.found === false;

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

    const paymentStatus =
      normalisePaymentStatus(
        registrationData
          .paymentStatus ||
        result.paymentStatus ||
        (
          isObject(
            registrationData.payment
          )
            ? registrationData
                .payment.status
            : ""
        ) ||
        (
          isObject(result.payment)
            ? result.payment.status
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
          isObject(
            registrationData.enrolment
          )
            ? registrationData
                .enrolment.status
            : ""
        ) ||
        (
          isObject(result.enrolment)
            ? result.enrolment.status
            : ""
        )
      );

    const payment =
      isObject(
        registrationData.payment
      )
        ? freezeObject(
            registrationData.payment
          )
        : (
            isObject(result.payment)
              ? freezeObject(
                  result.payment
                )
              : null
          );

    const enrolment =
      isObject(
        registrationData.enrolment
      )
        ? freezeObject(
            registrationData
              .enrolment
          )
        : (
            isObject(result.enrolment)
              ? freezeObject(
                  result.enrolment
                )
              : null
          );

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
          input.learnerUid
        ),

      learnerEmail:
        normaliseEmail(
          registrationData
            .learnerEmail ||
          result.learnerEmail ||
          input.learnerEmail
        ),

      sourceProgrammeCode:
        normaliseProgrammeCode(
          registrationData
            .sourceProgrammeCode ||
          result
            .sourceProgrammeCode ||
          input
            .sourceProgrammeCode
        ),

      targetProgrammeCode:
        normaliseProgrammeCode(
          registrationData
            .targetProgrammeCode ||
          result
            .targetProgrammeCode ||
          input
            .targetProgrammeCode
        ),

      offerId:
        normaliseString(
          registrationData
            .offerId ||
          result.offerId
        ),

      offerCode:
        normaliseString(
          registrationData
            .offerCode ||
          result.offerCode
        ),

      currency:
        normaliseString(
          registrationData.currency ||
          result.currency
        ).toUpperCase(),

      baseAmount:
        normaliseNumber(
          registrationData
            .baseAmount ??
          result.baseAmount,
          0
        ),

      taxAmount:
        normaliseNumber(
          registrationData
            .taxAmount ??
          result.taxAmount,
          0
        ),

      totalAmount:
        normaliseNumber(
          registrationData
            .totalAmount ??
          registrationData
            .payableAmount ??
          result.totalAmount ??
          result.payableAmount,
          0
        ),

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
      !isObject(registration) ||
      registration
        .registrationExists !== true
    ) {
      return CONTROLLER_STATUS.READY;
    }

    const registrationStatus =
      normaliseRegistrationStatus(
        registration.status
      );

    const paymentStatus =
      normalisePaymentStatus(
        registration.paymentStatus
      );

    const enrolmentStatus =
      normaliseEnrolmentStatus(
        registration.enrolmentStatus
      );

    if (
      registrationStatus ===
        "ENROLLED" ||
      enrolmentStatus ===
        "ENROLLED"
    ) {
      return CONTROLLER_STATUS.ENROLLED;
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
        "BLOCKED"
    ) {
      return CONTROLLER_STATUS.BLOCKED;
    }

    return CONTROLLER_STATUS.READY;
  }

  /* ==========================================================
   EXISTING REGISTRATION RESOLUTION
========================================================== */

async function resolveExistingRegistration(
  options
) {
  const safeOptions =
    isObject(options)
      ? options
      : {};

  if (
    hasResolvedRegistration() &&
    safeOptions.force !== true
  ) {
    return controllerState
      .registration;
  }

  if (registrationResolutionPromise) {
    return registrationResolutionPromise;
  }

  registrationResolutionPromise =
    (async function performRegistrationResolution() {
      setState({
        status:
          CONTROLLER_STATUS
            .RESOLVING_REGISTRATION,

        busy:
          true,

        registration:
          safeOptions.force === true
            ? null
            : controllerState
                .registration,

        payment:
          safeOptions.force === true
            ? null
            : controllerState.payment,

        enrolment:
          safeOptions.force === true
            ? null
            : controllerState.enrolment,

        error:
          null
      });

      try {
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
              "resolveExistingRegistration",
              "getExistingRegistration",
              "findExistingRegistration",
              "resolveRegistration",
              "getRegistration",
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
              registration
                .registrationExists
                  ? registration
                  : null,

            payment:
              registration
                .registrationExists
                  ? registration
                      .payment
                  : null,

            enrolment:
              registration
                .registrationExists
                  ? registration
                      .enrolment
                  : null,

            error:
              null
          });

        dispatchControllerEvent(
          CONTROLLER_EVENT
            .REGISTRATION_RESOLVED,

          {
            registration:
              registration
                .registrationExists
                  ? registration
                  : null,

            registrationExists:
              registration
                .registrationExists,

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
              registration,

              payment:
                registration.payment,

              state:
                nextState
            }
          );
        }

        return registration
          .registrationExists
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
    })();

  try {
    return await registrationResolutionPromise;
  } finally {
    registrationResolutionPromise =
      null;
  }
}

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
    isObject(options)
      ? options
      : {};

  if (
    hasResolvedRegistration() &&
    safeOptions.force !== true
  ) {
    return controllerState
      .registration;
  }

  if (registrationCreationPromise) {
    return registrationCreationPromise;
  }

  registrationCreationPromise =
    (async function performRegistrationCreation() {
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

      if (!isLearnerEligible()) {
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

      if (!isOfferAvailable()) {
        setState({
          status:
            CONTROLLER_STATUS.BLOCKED,

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

        if (existingRegistration) {
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

        const input =
          buildRegistrationCreationInput(
            safeOptions
          );

        const response =
          await invokeServiceMethod(
            registrationService,

            [
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

        const registration =
          normaliseRegistrationResult(
            response.result,
            input
          );

        if (
          !registration
            .registrationExists ||
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
                response.result || null
            }
          );
        }

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

        dispatchControllerEvent(
          CONTROLLER_EVENT
            .REGISTRATION_CREATED,

          {
            registration,

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
              registration,

              payment:
                registration.payment,

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
    })();

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
      isObject(options)
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
              .forceOffer === true
        });

      if (
        !eligibilityAndOffer
          .eligible
      ) {
        return freezeObject({
          registration:
            null,

          created:
            false,

          restored:
            false,

          eligible:
            false,

          offerAvailable:
            false,

          state:
            controllerState
        });
      }

      if (
        !eligibilityAndOffer
          .offerAvailable
      ) {
        return freezeObject({
          registration:
            null,

          created:
            false,

          restored:
            false,

          eligible:
            true,

          offerAvailable:
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

    if (existingRegistration) {
      return freezeObject({
        registration:
          existingRegistration,

        created:
          false,

        restored:
          true,

        eligible:
          true,

        offerAvailable:
          true,

        state:
          controllerState
      });
    }

    const createdRegistration =
      await createRegistration({
        ...safeOptions,

        skipExistingRegistrationCheck:
          true
      });

    return freezeObject({
      registration:
        createdRegistration,

      created:
        true,

      restored:
        false,

      eligible:
        true,

      offerAvailable:
        true,

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

    return freezeObject({
      pageContextReady:
        eligibilityAndOfferReadiness
          .pageContextReady,

      learnerEligible:
        eligibilityAndOfferReadiness
          .learnerEligible,

      offerAvailable:
        eligibilityAndOfferReadiness
          .offerAvailable,

      registrationResolved:
        hasResolvedRegistration(),

      registrationId:
        hasResolvedRegistration()
          ? registration
              .registrationId
          : null,

      registrationStatus:
        hasResolvedRegistration()
          ? registration.status
          : null,

      paymentStatus:
        hasResolvedRegistration()
          ? registration
              .paymentStatus
          : null,

      enrolmentStatus:
        hasResolvedRegistration()
          ? registration
              .enrolmentStatus
          : null,

      paymentRequired:
        controllerState.status ===
          CONTROLLER_STATUS
            .PAYMENT_REQUIRED,

      paymentConfirmed:
        controllerState.status ===
          CONTROLLER_STATUS
            .PAYMENT_CONFIRMED,

      enrolled:
        controllerState.status ===
          CONTROLLER_STATUS.ENROLLED,

      readyForPayment:
        hasResolvedRegistration() &&
        controllerState.status ===
          CONTROLLER_STATUS
            .PAYMENT_REQUIRED
    });
  }

  /* ==========================================================
     END OF BLOCK 4 OF 6

     Do not add diagnostics, the public API, global registration,
     or the closing IIFE yet.

     Block 5 must continue immediately below this section.
  ========================================================== */

    /* ==========================================================
     BLOCK 5 OF 6
     PAYMENT ORCHESTRATION AND ENROLMENT RESOLUTION
  ========================================================== */

  /* ==========================================================
     PAYMENT AND ENROLMENT SERVICE ACCESS
  ========================================================== */

  function getRequiredPaymentService() {
    const dependencies =
      assertRequiredDependencies({
        requirePaymentService:
          true
      });

    return dependencies
      .paymentService;
  }

  function getRequiredEnrolmentService() {
    const dependencies =
      assertRequiredDependencies({
        requireEnrolmentService:
          true
      });

    return dependencies
      .enrolmentService;
  }

  /* ==========================================================
     PAYMENT INPUT VALIDATION
  ========================================================== */

  function validateRegistrationForPayment(
    registration
  ) {
    if (
      !isObject(registration) ||
      registration
        .registrationExists !== true
    ) {
      throw createControllerError(
        ERROR_CODE.PAYMENT_FAILED,

        "A valid Bridge Programme registration is required before payment can begin."
      );
    }

    if (
      !isNonEmptyString(
        registration.registrationId
      )
    ) {
      throw createControllerError(
        ERROR_CODE.PAYMENT_FAILED,

        "The Bridge Programme registration ID is unavailable.",

        {
          field:
            "registrationId"
        }
      );
    }

    return registration;
  }

  function buildPaymentInput(
    options
  ) {
    const safeOptions =
      isObject(options)
        ? options
        : {};

    const learner =
      validateLearnerIdentity(
        safeOptions.learner ||
        controllerState.learner
      );

    const registration =
      validateRegistrationForPayment(
        safeOptions.registration ||
        controllerState.registration
      );

    const offer =
      safeOptions.offer ||
      controllerState.offer ||
      null;

    return freezeObject({
      learnerUid:
        learner.learnerUid,

      learnerEmail:
        learner.email || "",

      registrationId:
        registration.registrationId,

      sourceProgrammeCode:
        registration
          .sourceProgrammeCode ||
        controllerState
          .sourceProgrammeCode,

      targetProgrammeCode:
        registration
          .targetProgrammeCode ||
        controllerState
          .targetProgrammeCode,

      offerId:
        normaliseString(
          registration.offerId ||
          (
            isObject(offer)
              ? offer.offerId
              : ""
          )
        ),

      offerCode:
        normaliseString(
          registration.offerCode ||
          (
            isObject(offer)
              ? offer.offerCode
              : ""
          )
        ),

      currency:
        normaliseString(
          registration.currency ||
          (
            isObject(offer)
              ? offer.currency
              : ""
          ) ||
          "INR"
        ).toUpperCase(),

      baseAmount:
        normaliseNumber(
          registration.baseAmount ??
          (
            isObject(offer)
              ? offer.baseAmount
              : 0
          ),
          0
        ),

      taxAmount:
        normaliseNumber(
          registration.taxAmount ??
          (
            isObject(offer)
              ? offer.taxAmount
              : 0
          ),
          0
        ),

      totalAmount:
        normaliseNumber(
          registration.totalAmount ??
          (
            isObject(offer)
              ? offer.totalAmount
              : 0
          ),
          0
        ),

      successUrl:
        normaliseString(
          safeOptions.successUrl
        ),

      cancelUrl:
        normaliseString(
          safeOptions.cancelUrl
        ),

      returnUrl:
        normaliseString(
          safeOptions.returnUrl
        ),

      metadata:
        isObject(
          safeOptions.metadata
        )
          ? freezeObject(
              safeOptions.metadata
            )
          : null
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
      isObject(rawResult)
        ? rawResult
        : {};

    const nestedPayment =
      isObject(result.payment)
        ? result.payment
        : {};

    const paymentData =
      Object.keys(
        nestedPayment
      ).length > 0
        ? nestedPayment
        : result;

    const paymentId =
      normaliseString(
        paymentData.paymentId ||
        paymentData.id ||
        paymentData
          .transactionId ||
        paymentData.orderId ||
        result.paymentId ||
        result.transactionId ||
        result.orderId
      );

    const paymentStatus =
      normalisePaymentStatus(
        paymentData.status ||
        paymentData
          .paymentStatus ||
        result.status ||
        result.paymentStatus
      );

    const paymentUrl =
      normaliseString(
        paymentData.paymentUrl ||
        paymentData.checkoutUrl ||
        paymentData.redirectUrl ||
        paymentData.url ||
        result.paymentUrl ||
        result.checkoutUrl ||
        result.redirectUrl
      );

    const registrationId =
      normaliseString(
        paymentData.registrationId ||
        result.registrationId ||
        input.registrationId
      );

    return freezeObject({
      paymentId,

      registrationId,

      status:
        paymentStatus,

      provider:
        normaliseString(
          paymentData.provider ||
          paymentData.gateway ||
          result.provider ||
          result.gateway
        ),

      providerOrderId:
        normaliseString(
          paymentData
            .providerOrderId ||
          paymentData.orderId ||
          result.providerOrderId ||
          result.orderId
        ),

      providerPaymentId:
        normaliseString(
          paymentData
            .providerPaymentId ||
          paymentData.transactionId ||
          result.providerPaymentId ||
          result.transactionId
        ),

      paymentUrl,

      currency:
        normaliseString(
          paymentData.currency ||
          result.currency ||
          input.currency
        ).toUpperCase(),

      baseAmount:
        normaliseNumber(
          paymentData.baseAmount ??
          result.baseAmount ??
          input.baseAmount,
          0
        ),

      taxAmount:
        normaliseNumber(
          paymentData.taxAmount ??
          result.taxAmount ??
          input.taxAmount,
          0
        ),

      totalAmount:
        normaliseNumber(
          paymentData.totalAmount ??
          paymentData
            .payableAmount ??
          result.totalAmount ??
          result.payableAmount ??
          input.totalAmount,
          0
        ),

      createdAt:
        normaliseString(
          paymentData.createdAt ||
          result.createdAt
        ),

      updatedAt:
        normaliseString(
          paymentData.updatedAt ||
          result.updatedAt
        ),

      confirmedAt:
        normaliseString(
          paymentData.confirmedAt ||
          paymentData.paidAt ||
          result.confirmedAt ||
          result.paidAt
        ),

      failureCode:
        normaliseString(
          paymentData.failureCode ||
          paymentData.errorCode ||
          result.failureCode ||
          result.errorCode
        ),

      failureReason:
        normaliseString(
          paymentData.failureReason ||
          paymentData.errorMessage ||
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
     PAYMENT CONTROLLER STATUS
  ========================================================== */

  function resolveControllerStatusFromPayment(
    payment
  ) {
    if (!isObject(payment)) {
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
      return CONTROLLER_STATUS.BLOCKED;
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
        isObject(options)
        ? options
        : {};

    if (paymentInitiationPromise) {
        return paymentInitiationPromise;
    }

    paymentInitiationPromise =
        (async function performPaymentInitiation() {
        if (
            !hasResolvedRegistration()
        ) {
            await resolveOrCreateRegistration({
            ...safeOptions
            });
        }

        const registration =
            validateRegistrationForPayment(
            controllerState.registration
            );

        const existingPaymentStatus =
            normalisePaymentStatus(
            registration.paymentStatus ||
            (
                isObject(
                controllerState.payment
                )
                ? controllerState
                    .payment.status
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

            error:
                null
            });

            return controllerState.payment;
        }

        if (
            existingPaymentStatus ===
            "PROCESSING" &&
            safeOptions.force !== true
        ) {
            return controllerState.payment;
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

                ERROR_CODE.PAYMENT_FAILED,

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
            )
            ) {
            throw createControllerError(
                ERROR_CODE.PAYMENT_FAILED,

                "The payment service did not return a valid payment reference.",

                {
                serviceMethod:
                    response.methodName,

                serviceResult:
                    response.result || null
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

            ERROR_CODE.PAYMENT_FAILED,

            "Unable to initiate payment for the Bridge Programme registration."
            );
        }
        })();

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
        isObject(options)
        ? options
        : {};

    if (paymentStatusResolutionPromise) {
        return paymentStatusResolutionPromise;
    }

    paymentStatusResolutionPromise =
        (async function performPaymentStatusResolution() {
        const registration =
            validateRegistrationForPayment(
            safeOptions.registration ||
            controllerState.registration
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
                        .learner.learnerUid
                    : "",

                registrationId:
                registration.registrationId,

                paymentId:
                isObject(currentPayment)
                    ? normaliseString(
                        currentPayment
                        .paymentId
                    )
                    : "",

                providerOrderId:
                isObject(currentPayment)
                    ? normaliseString(
                        currentPayment
                        .providerOrderId
                    )
                    : "",

                providerPaymentId:
                isObject(currentPayment)
                    ? normaliseString(
                        currentPayment
                        .providerPaymentId
                    )
                    : ""
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

                ERROR_CODE.PAYMENT_FAILED,

                "Unable to resolve the Bridge Programme payment status."
            );

            const payment =
            normalisePaymentResult(
                response.result,
                {
                registrationId:
                    registration
                    .registrationId,

                currency:
                    registration.currency,

                baseAmount:
                    registration.baseAmount,

                taxAmount:
                    registration.taxAmount,

                totalAmount:
                    registration.totalAmount
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

            ERROR_CODE.PAYMENT_FAILED,

            "Unable to resolve the Bridge Programme payment status."
            );
        }
        })();

    try {
        return await paymentStatusResolutionPromise;
    } finally {
        paymentStatusResolutionPromise =
        null;
    }
  }

  function hasConfirmedPayment() {
    const paymentStatus =
      normalisePaymentStatus(
        controllerState.payment
          ? controllerState
              .payment.status
          : (
              controllerState
                .registration
                ? controllerState
                    .registration
                    .paymentStatus
                : ""
            )
      );

    return (
      paymentStatus ===
      "CONFIRMED"
    );
  }

  function getResolvedPayment() {
    return controllerState.payment;
  }

  /* ==========================================================
     ENROLMENT INPUT
  ========================================================== */

  function buildEnrolmentInput(
    options
  ) {
    const safeOptions =
      isObject(options)
        ? options
        : {};

    const learner =
      validateLearnerIdentity(
        safeOptions.learner ||
        controllerState.learner
      );

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
      !hasConfirmedPayment() &&
      normalisePaymentStatus(
        isObject(payment)
          ? payment.status
          : registration.paymentStatus
      ) !== "CONFIRMED"
    ) {
      throw createControllerError(
        ERROR_CODE
          .ENROLMENT_RESOLUTION_FAILED,

        "Confirmed payment is required before Bridge Programme enrolment can be resolved.",

        {
          registrationId:
            registration
              .registrationId,

          paymentStatus:
            isObject(payment)
              ? payment.status
              : registration
                  .paymentStatus
        }
      );
    }

    return freezeObject({
      learnerUid:
        learner.learnerUid,

      learnerEmail:
        learner.email || "",

      registrationId:
        registration.registrationId,

      paymentId:
        isObject(payment)
          ? normaliseString(
              payment.paymentId
            )
          : "",

      sourceProgrammeCode:
        registration
          .sourceProgrammeCode,

      targetProgrammeCode:
        registration
          .targetProgrammeCode,

      offerId:
        registration.offerId,

      offerCode:
        registration.offerCode
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
      isObject(rawResult)
        ? rawResult
        : {};

    const nestedEnrolment =
      isObject(result.enrolment)
        ? result.enrolment
        : (
            isObject(result.enrollment)
              ? result.enrollment
              : {}
          );

    const enrolmentData =
      Object.keys(
        nestedEnrolment
      ).length > 0
        ? nestedEnrolment
        : result;

    const enrolmentId =
      normaliseString(
        enrolmentData.enrolmentId ||
        enrolmentData.enrollmentId ||
        enrolmentData.id ||
        result.enrolmentId ||
        result.enrollmentId ||
        result.id
      );

    const status =
      normaliseEnrolmentStatus(
        enrolmentData.status ||
        enrolmentData
          .enrolmentStatus ||
        enrolmentData
          .enrollmentStatus ||
        result.status ||
        result.enrolmentStatus ||
        result.enrollmentStatus
      );

    const explicitlyExists =
      enrolmentData.exists ===
        true ||
      result.exists === true ||
      enrolmentData
        .enrolmentExists === true ||
      result.enrolmentExists ===
        true ||
      enrolmentData
        .enrollmentExists === true ||
      result.enrollmentExists ===
        true;

    const explicitlyMissing =
      enrolmentData.exists ===
        false ||
      result.exists === false ||
      enrolmentData
        .enrolmentExists === false ||
      result.enrolmentExists ===
        false ||
      enrolmentData
        .enrollmentExists === false ||
      result.enrollmentExists ===
        false;

    const enrolmentExists =
      explicitlyMissing
        ? false
        : (
            explicitlyExists ||
            isNonEmptyString(
              enrolmentId
            ) ||
            status === "ENROLLED"
          );

    return freezeObject({
      enrolmentExists,

      enrolmentId,

      status,

      learnerUid:
        normaliseString(
          enrolmentData.learnerUid ||
          result.learnerUid ||
          input.learnerUid
        ),

      registrationId:
        normaliseString(
          enrolmentData
            .registrationId ||
          result.registrationId ||
          input.registrationId
        ),

      sourceProgrammeCode:
        normaliseProgrammeCode(
          enrolmentData
            .sourceProgrammeCode ||
          result
            .sourceProgrammeCode ||
          input
            .sourceProgrammeCode
        ),

      targetProgrammeCode:
        normaliseProgrammeCode(
          enrolmentData
            .targetProgrammeCode ||
          result
            .targetProgrammeCode ||
          input
            .targetProgrammeCode
        ),

      cohortId:
        normaliseString(
          enrolmentData.cohortId ||
          result.cohortId
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
    isObject(options)
      ? options
      : {};

  if (
    hasResolvedEnrolment() &&
    safeOptions.force !== true
  ) {
    return controllerState.enrolment;
  }

  if (enrolmentResolutionPromise) {
    return enrolmentResolutionPromise;
  }

  enrolmentResolutionPromise =
    (async function performEnrolmentResolution() {
      if (!hasConfirmedPayment()) {
        await resolvePaymentStatus({
          ...safeOptions
        });
      }

      if (!hasConfirmedPayment()) {
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
            "BLOCKED";

        const nextStatus =
          enrolled
            ? CONTROLLER_STATUS.ENROLLED
            : (
                blocked
                  ? CONTROLLER_STATUS
                      .BLOCKED
                  : CONTROLLER_STATUS
                      .ENROLMENT_PENDING
              );

        const registration =
          controllerState.registration;

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
                    : registration.status,

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
    })();

  try {
    return await enrolmentResolutionPromise;
  } finally {
    enrolmentResolutionPromise =
      null;
  }
}

  function hasResolvedEnrolment() {
    return Boolean(
      controllerState.enrolment &&
      (
        isNonEmptyString(
          controllerState
            .enrolment
            .enrolmentId
        ) ||
        controllerState
          .enrolment.status ===
          "ENROLLED"
      )
    );
  }

  function isLearnerEnrolled() {
    return Boolean(
      controllerState.status ===
        CONTROLLER_STATUS.ENROLLED ||
      (
        controllerState.enrolment &&
        normaliseEnrolmentStatus(
          controllerState
            .enrolment.status
        ) === "ENROLLED"
      )
    );
  }

  function getResolvedEnrolment() {
    return controllerState.enrolment;
  }

  /* ==========================================================
     COMPLETE REGISTRATION JOURNEY
  ========================================================== */

  async function resolveRegistrationJourney(
    options
  ) {
    const safeOptions =
      isObject(options)
        ? options
        : {};

    const registrationResult =
      await resolveOrCreateRegistration({
        ...safeOptions
      });

    if (
      !registrationResult ||
      !registrationResult
        .registration
    ) {
      return freezeObject({
        registration:
          null,

        payment:
          null,

        enrolment:
          null,

        state:
          controllerState
      });
    }

    if (
      controllerState.status ===
        CONTROLLER_STATUS.ENROLLED
    ) {
      return freezeObject({
        registration:
          controllerState
            .registration,

        payment:
          controllerState.payment,

        enrolment:
          controllerState.enrolment,

        state:
          controllerState
      });
    }

    if (
      controllerState.status ===
        CONTROLLER_STATUS
          .PAYMENT_CONFIRMED ||
      hasConfirmedPayment()
    ) {
      const enrolment =
        await resolveEnrolment({
          ...safeOptions
        });

      return freezeObject({
        registration:
          controllerState
            .registration,

        payment:
          controllerState.payment,

        enrolment,

        state:
          controllerState
      });
    }

    return freezeObject({
      registration:
        controllerState
          .registration,

      payment:
        controllerState.payment,

      enrolment:
        controllerState.enrolment,

      paymentRequired:
        controllerState.status ===
          CONTROLLER_STATUS
            .PAYMENT_REQUIRED,

      state:
        controllerState
    });
  }

  /* ==========================================================
     BLOCK 5 READINESS
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
        Boolean(
          controllerState.payment
        ),

      paymentStatus:
        controllerState.payment
          ? controllerState
              .payment.status
          : registrationReadiness
              .paymentStatus,

      paymentRequired:
        controllerState.status ===
          CONTROLLER_STATUS
            .PAYMENT_REQUIRED,

      paymentInProgress:
        controllerState.status ===
          CONTROLLER_STATUS
            .PAYMENT_IN_PROGRESS,

      paymentConfirmed:
        hasConfirmedPayment(),

      enrolmentResolved:
        hasResolvedEnrolment(),

      enrolmentStatus:
        controllerState.enrolment
          ? controllerState
              .enrolment.status
          : registrationReadiness
              .enrolmentStatus,

      enrolled:
        isLearnerEnrolled(),

      readyToInitiatePayment:
        registrationReadiness
          .readyForPayment &&
        readiness
          .paymentServiceAvailable,

      readyToResolveEnrolment:
        hasConfirmedPayment() &&
        readiness
          .enrolmentServiceAvailable
    });
  }

  /* ==========================================================
     END OF BLOCK 5 OF 6

     Do not add the closing IIFE yet.

     Block 6 must continue immediately below this section and
     will add diagnostics, the public controller API, global
     registration, and the final IIFE closing statement.
  ========================================================== */

    /* ==========================================================
     BLOCK 6 OF 6
     DIAGNOSTICS, PUBLIC API, AND GLOBAL REGISTRATION
  ========================================================== */

  /* ==========================================================
     COMPLETE CONTROLLER READINESS
  ========================================================== */

  function getControllerReadiness() {
    const dependencyReadiness =
      getReadiness();

    const pageContextReadiness =
      getPageContextReadiness();

    const eligibilityAndOfferReadiness =
      getEligibilityAndOfferReadiness();

    const registrationReadiness =
      getRegistrationReadiness();

    const paymentAndEnrolmentReadiness =
      getPaymentAndEnrolmentReadiness();

    return freezeObject({
      controllerName:
        CONTROLLER_NAME,

      controllerVersion:
        CONTROLLER_VERSION,

      controllerInitialised:
        controllerState.initialised ===
        true,

      controllerBusy:
        controllerState.busy ===
        true,

      controllerStatus:
        controllerState.status,

      foundationReady:
        dependencyReadiness
          .foundationReady,

      programmeResolutionReady:
        dependencyReadiness
          .programmeResolutionReady,

      paymentResolutionReady:
        dependencyReadiness
          .paymentResolutionReady,

      enrolmentResolutionReady:
        dependencyReadiness
          .enrolmentResolutionReady,

      pageContextReady:
        pageContextReadiness.ready,

      learnerResolved:
        pageContextReadiness
          .learnerResolved,

      programmeContextResolved:
        pageContextReadiness
          .programmeContextResolved,

      eligibilityResolved:
        eligibilityAndOfferReadiness
          .eligibilityResolved,

      learnerEligible:
        eligibilityAndOfferReadiness
          .learnerEligible,

      offerResolved:
        eligibilityAndOfferReadiness
          .offerResolved,

      offerAvailable:
        eligibilityAndOfferReadiness
          .offerAvailable,

      registrationResolved:
        registrationReadiness
          .registrationResolved,

      paymentRequired:
        paymentAndEnrolmentReadiness
          .paymentRequired,

      paymentInProgress:
        paymentAndEnrolmentReadiness
          .paymentInProgress,

      paymentConfirmed:
        paymentAndEnrolmentReadiness
          .paymentConfirmed,

      enrolmentResolved:
        paymentAndEnrolmentReadiness
          .enrolmentResolved,

      enrolled:
        paymentAndEnrolmentReadiness
          .enrolled,

      readyForRegistration:
        eligibilityAndOfferReadiness
          .readyForRegistration,

      readyToInitiatePayment:
        paymentAndEnrolmentReadiness
          .readyToInitiatePayment,

      readyToResolveEnrolment:
        paymentAndEnrolmentReadiness
          .readyToResolveEnrolment,

      errorPresent:
        Boolean(
          controllerState.error
        ),

      timestamp:
        nowIsoString()
    });
  }

  /* ==========================================================
     DIAGNOSTICS
  ========================================================== */

  function getDiagnostics() {
    const readiness =
      getReadiness();

    const pageContextReadiness =
      getPageContextReadiness();

    const eligibilityAndOfferReadiness =
      getEligibilityAndOfferReadiness();

    const registrationReadiness =
      getRegistrationReadiness();

    const paymentAndEnrolmentReadiness =
      getPaymentAndEnrolmentReadiness();

    return freezeObject({
      controller:
        freezeObject({
          name:
            CONTROLLER_NAME,

          version:
            CONTROLLER_VERSION,

          status:
            controllerState.status,

          initialised:
            controllerState
              .initialised === true,

          busy:
            controllerState
              .busy === true,

          initialisedAt:
            controllerState
              .initialisedAt,

          updatedAt:
            controllerState
              .updatedAt
        }),

      dependencies:
        freezeObject({
          firebaseAvailable:
            readiness
              .firebaseAvailable,

          authAvailable:
            readiness
              .authAvailable,

          registrationServiceAvailable:
            readiness
              .registrationServiceAvailable,

          programServiceAvailable:
            readiness
              .programServiceAvailable,

          paymentServiceAvailable:
            readiness
              .paymentServiceAvailable,

          enrolmentServiceAvailable:
            readiness
              .enrolmentServiceAvailable
        }),

      authentication:
        freezeObject({
          authenticated:
            readiness.authenticated,

          authenticatedLearnerUid:
            readiness
              .authenticatedLearnerUid,

          learnerResolved:
            pageContextReadiness
              .learnerResolved
        }),

      programmeContext:
        freezeObject({
          resolved:
            pageContextReadiness
              .programmeContextResolved,

          sourceProgrammeCode:
            controllerState
              .sourceProgrammeCode,

          targetProgrammeCode:
            controllerState
              .targetProgrammeCode
        }),

      eligibility:
        freezeObject({
          resolved:
            eligibilityAndOfferReadiness
              .eligibilityResolved,

          learnerEligible:
            eligibilityAndOfferReadiness
              .learnerEligible,

          value:
            controllerState
              .eligibility
        }),

      offer:
        freezeObject({
          resolved:
            eligibilityAndOfferReadiness
              .offerResolved,

          available:
            eligibilityAndOfferReadiness
              .offerAvailable,

          value:
            controllerState.offer
        }),

      registration:
        freezeObject({
          resolved:
            registrationReadiness
              .registrationResolved,

          registrationId:
            registrationReadiness
              .registrationId,

          registrationStatus:
            registrationReadiness
              .registrationStatus,

          value:
            controllerState
              .registration
        }),

      payment:
        freezeObject({
          resolved:
            paymentAndEnrolmentReadiness
              .paymentResolved,

          required:
            paymentAndEnrolmentReadiness
              .paymentRequired,

          inProgress:
            paymentAndEnrolmentReadiness
              .paymentInProgress,

          confirmed:
            paymentAndEnrolmentReadiness
              .paymentConfirmed,

          status:
            paymentAndEnrolmentReadiness
              .paymentStatus,

          value:
            controllerState.payment
        }),

      enrolment:
        freezeObject({
          resolved:
            paymentAndEnrolmentReadiness
              .enrolmentResolved,

          enrolled:
            paymentAndEnrolmentReadiness
              .enrolled,

          status:
            paymentAndEnrolmentReadiness
              .enrolmentStatus,

          value:
            controllerState
              .enrolment
        }),

      readiness:
        getControllerReadiness(),

      error:
        controllerState.error,

      state:
        controllerState,

      timestamp:
        nowIsoString()
    });
  }

  /* ==========================================================
     STATE QUERY HELPERS
  ========================================================== */

  function isControllerInitialised() {
    return (
      controllerState.initialised ===
      true
    );
  }

  function isControllerBusy() {
    return (
      controllerState.busy === true
    );
  }

  function getControllerStatus() {
    return controllerState.status;
  }

  function hasControllerError() {
    return Boolean(
      controllerState.error
    );
  }

  function getControllerError() {
    return controllerState.error;
  }

  function isPaymentRequired() {
    return (
      controllerState.status ===
      CONTROLLER_STATUS
        .PAYMENT_REQUIRED
    );
  }

  function isPaymentInProgress() {
    return (
      controllerState.status ===
      CONTROLLER_STATUS
        .PAYMENT_IN_PROGRESS
    );
  }

  function isPaymentConfirmed() {
    return hasConfirmedPayment();
  }

  function isRegistrationBlocked() {
    return (
      controllerState.status ===
        CONTROLLER_STATUS.BLOCKED ||
      controllerState.status ===
        CONTROLLER_STATUS
          .NOT_ELIGIBLE
    );
  }

  /* ==========================================================
   COMPLETE PAGE JOURNEY INITIALISATION
========================================================== */

async function initialiseRegistrationJourney(
  options
) {
  const safeOptions =
    isObject(options)
      ? options
      : {};

  if (
    registrationJourneyInitialisationPromise
  ) {
    return registrationJourneyInitialisationPromise;
  }

  registrationJourneyInitialisationPromise =
    (async function performRegistrationJourneyInitialisation() {
      try {
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
            .eligible !== true
        ) {
          return freezeObject({
            pageContext,

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
            .offerAvailable !== true
        ) {
          return freezeObject({
            pageContext,

            eligibility:
              controllerState
                .eligibility,

            offer:
              controllerState.offer,

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

            forceRegistrationResolution:
              safeOptions
                .forceRegistrationResolution ===
              true
          });

        if (
          controllerState.status ===
            CONTROLLER_STATUS
              .PAYMENT_CONFIRMED &&
          safeOptions
            .resolveEnrolmentAfterPayment ===
            true
        ) {
          await resolveEnrolment({
            ...safeOptions
          });
        }

        return freezeObject({
          pageContext,

          eligibility:
            controllerState
              .eligibility,

          offer:
            controllerState.offer,

          registration:
            registrationResult
              ? registrationResult
                  .registration
              : controllerState
                  .registration,

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
    })();

  try {
    return await registrationJourneyInitialisationPromise;
  } finally {
    registrationJourneyInitialisationPromise =
      null;
  }
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

      resolveAuthenticatedLearner,

      getResolvedLearner,

      hasResolvedLearner,

      validateProgrammeContext,

      setProgrammeContext,

      getProgrammeContext,

      hasProgrammeContext,

      resolveEligibility,

      getResolvedEligibility,

      hasResolvedEligibility,

      isLearnerEligible,

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

      hasConfirmedPayment,

      resolveEnrolment,

      getResolvedEnrolment,

      hasResolvedEnrolment,

      isLearnerEnrolled,

      resolveRegistrationJourney,

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
     END OF BLOCK 6 OF 6
  ========================================================== */

})(window);