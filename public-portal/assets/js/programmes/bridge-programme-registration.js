/**
 * ========================================================================
 * Agile AI University
 * Bridge Programme Registration Page Controller
 * ------------------------------------------------------------------------
 * File:
 * public-portal/assets/js/programmes/bridge-programme-registration.js
 *
 * Version        : 2.0.0
 * Status         : ACTIVE
 * Phase          : Revenue Sprint
 * Owner          : Agile AI University
 *
 * Description
 * ------------------------------------------------------------------------
 * Thin page controller for the Bridge Programme Registration workspace.
 *
 * This page controller consumes the governed journey produced by:
 *
 * window.BridgeRegistrationController
 *
 * Responsibilities
 * ------------------------------------------------------------------------
 * • Cache and manage Bridge Programme page elements
 * • Read the page-level source and target programme context
 * • Invoke the governed BridgeRegistrationController
 * • Render eligibility, offer, registration and enrolment states
 * • Manage learner acknowledgement and registration interaction
 * • Present loading, error and accessibility announcements
 * • Expose page-level diagnostics
 *
 * Non-Responsibilities
 * ------------------------------------------------------------------------
 * This page controller does not:
 *
 * • Resolve Firebase Authentication directly
 * • Read or write Firestore directly
 * • Resolve credentials independently
 * • Call EligibilityService directly
 * • Call BridgeProgramService directly
 * • Call BridgeRegistrationService directly
 * • Determine academic eligibility rules
 * • Determine commercial pricing rules
 * • Verify payment independently
 * • Create enrolments independently
 * • Create a registration during normal page initialisation
 *
 * Architecture Chain
 * ------------------------------------------------------------------------
 * Authentication
 *      ↓
 * Eligibility and Entitlement Authorities
 *      ↓
 * BridgeRegistrationController
 *      ↓
 * BridgeProgrammeRegistration Page Controller
 *      ↓
 * Governed DOM Rendering
 *
 * Governance
 * ------------------------------------------------------------------------
 * • BridgeRegistrationController is the sole journey orchestrator.
 * • The page controller renders controller-produced models only.
 * • Page loading must never create a registration.
 * • Registration requires explicit learner acknowledgement.
 * • Registration creation requires an explicit learner action.
 * • The registration button must remain disabled while busy.
 * • Payment actions must remain unavailable until controller readiness
 *   confirms that the governed payment service is available.
 * • All dynamic page content must use textContent.
 *
 * Reconstruction Blocks
 * ------------------------------------------------------------------------
 * Block 1 - Foundation, configuration, DOM cache and page state
 * Block 2 - DOM lifecycle and visual page states
 * Block 3 - Controller integration and page initialisation
 * Block 4 - Journey and commercial rendering
 * Block 5 - Registration interaction and controller events
 * Block 6 - Diagnostics, public API and bootstrap
 *
 * Change History
 * ------------------------------------------------------------------------
 * v2.0.0
 *
 * • Reconstructed as a thin UI controller
 * • Removed direct EligibilityService orchestration
 * • Removed direct BridgeProgramService orchestration
 * • Removed credential polling and bridge relationship duplication
 * • Integrated BridgeRegistrationController as journey authority
 * • Added governed registration acknowledgement state
 * • Added controller-driven registration and enrolment rendering
 *
 * v1.0.0
 *
 * • Added initial Bridge Programme page orchestration
 * • Added eligibility and academic relationship rendering
 * • Added INR commercial formatting
 * • Added accessible page-state announcements
 *
 * ========================================================================
 */

(function initialiseBridgeProgrammeRegistrationPage(
    window,
    document
) {

    "use strict";

    /* ====================================================================
       PAGE CONTROLLER IDENTITY
    ==================================================================== */

    const PAGE_CONTROLLER_NAME =
        "BridgeProgrammeRegistrationController";

    const PAGE_CONTROLLER_VERSION =
        "2.0.0";

    /* ====================================================================
       PAGE STATUS
    ==================================================================== */

    const PAGE_STATUS =
        Object.freeze({

            IDLE:
                "IDLE",

            INITIALISING:
                "INITIALISING",

            LOADING:
                "LOADING",

            READY:
                "READY",

            NOT_ELIGIBLE:
                "NOT_ELIGIBLE",

            REGISTRATION_AVAILABLE:
                "REGISTRATION_AVAILABLE",

            REGISTERING:
                "REGISTERING",

            REGISTERED:
                "REGISTERED",

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

            BLOCKED:
                "BLOCKED",

            ERROR:
                "ERROR"

        });

    /* ====================================================================
       PAGE EVENTS
    ==================================================================== */

    const PAGE_EVENT =
        Object.freeze({

            READY:
                "bridge-programme-registration:ready",

            STATE_CHANGED:
                "bridge-programme-registration:state-changed",

            JOURNEY_RENDERED:
                "bridge-programme-registration:journey-rendered",

            REGISTRATION_STARTED:
                "bridge-programme-registration:registration-started",

            REGISTRATION_COMPLETED:
                "bridge-programme-registration:registration-completed",

            ERROR:
                "bridge-programme-registration:error"

        });

    /* ====================================================================
       CONFIGURATION
    ==================================================================== */

    const DEFAULT_SOURCE_PROGRAMME_CODE =
        "AOP";

    const DEFAULT_TARGET_PROGRAMME_CODE =
        "AIPA";

    const DEFAULT_REGISTRATION_LABEL =
        "Register for Bridge Programme";

    const REGISTERING_LABEL =
        "Creating Registration...";

    const PAYMENT_REQUIRED_LABEL =
        "Continue to Payment";

    const DEFAULT_REGISTRATION_NOTICE =
        "Review the programme pathway, fee and applicable tax information, then confirm to continue.";

    const ACKNOWLEDGEMENT_REQUIRED_NOTICE =
        "Select the confirmation above to enable registration.";

    const REGISTRATION_IN_PROGRESS_NOTICE =
        "Please wait while your Bridge Programme registration is created.";

    const REGISTRATION_COMPLETED_NOTICE =
        "Your Bridge Programme registration has been created successfully.";

    const PAYMENT_SERVICE_UNAVAILABLE_NOTICE =
        "Registration is complete. Secure payment will be enabled when the governed payment service is available.";

    const PROGRAMME_NAMES =
        Object.freeze({

            AOP:
                "Agile Outcome Practitioner",

            AAIA:
                "Agile AI Associate",

            AIPA:
                "Artificial Intelligence Professional Agilist",

            AAIP:
                "Agentic AI Professional",

            AIAL:
                "Agile AI Leadership",

            AISD:
                "AI System Design",

            AAIM:
                "Agile AI Management",

            AAICC:
                "Agile AI Coaching and Consulting",

            AISL:
                "AI Strategy and Leadership",

            AIOL:
                "AI Operations Leadership",

            AIPL:
                "AI Product Leadership"

        });

    /* ====================================================================
       INTERNAL UTILITIES
    ==================================================================== */

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

    function normaliseProgrammeCode(
        value
    ) {

        return normaliseString(
            value
        ).toUpperCase();

    }

    function normaliseStatus(
        value
    ) {

        return normaliseString(
            value
        ).toUpperCase();

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

    function nowIsoString() {

        return new Date()
            .toISOString();

    }

    function resolveProgrammeName(
        programmeCode
    ) {

        const governedProgrammeCode =
            normaliseProgrammeCode(
                programmeCode
            );

        return (

            PROGRAMME_NAMES[
                governedProgrammeCode
            ] ||
            governedProgrammeCode ||
            "Programme"

        );

    }

    /* ====================================================================
       ELEMENT CACHE
    ==================================================================== */

    const elements = {

        portalApp:
            null,

        mainContent:
            null,

        loadingState:
            null,

        errorState:
            null,

        errorMessage:
            null,

        retryButton:
            null,

        notEligibleState:
            null,

        notEligibleReason:
            null,

        registeredState:
            null,

        registeredMessage:
            null,

        enrolledState:
            null,

        enrolledMessage:
            null,

        eligibleState:
            null,

        statusAnnouncer:
            null,

        offerTitle:
            null,

        offerDescription:
            null,

        eligibilityBadge:
            null,

        currentProgramName:
            null,

        currentProgramCode:
            null,

        targetProgramName:
            null,

        targetProgramCode:
            null,

        offerExpiryBadge:
            null,

        baseFee:
            null,

        gstRate:
            null,

        gstAmount:
            null,

        totalPayable:
            null,

        standardFee:
            null,

        fullProgrammeFee:
            null,

        offerExpiry:
            null,

        taxDisclaimer:
            null,

        termsConfirmation:
            null,

        registrationNotice:
            null,

        registerButton:
            null

    };

    /* ====================================================================
       PAGE CONTEXT
    ==================================================================== */

    function resolvePageContext() {

        const portalApp =
            elements.portalApp ||
            document.getElementById(
                "portalApp"
            );

        const sourceProgrammeCode =
            normaliseProgrammeCode(

                portalApp &&
                portalApp.dataset
                    ? portalApp.dataset
                        .sourceProgrammeCode
                    : ""

            ) ||
            DEFAULT_SOURCE_PROGRAMME_CODE;

        const targetProgrammeCode =
            normaliseProgrammeCode(

                portalApp &&
                portalApp.dataset
                    ? portalApp.dataset
                        .targetProgrammeCode
                    : ""

            ) ||
            DEFAULT_TARGET_PROGRAMME_CODE;

        return freezeObject({

            sourceProgrammeCode,

            targetProgrammeCode

        });

    }

    /* ====================================================================
       INTERNAL PAGE STATE
    ==================================================================== */

    function createInitialPageState() {

        return freezeObject({

            status:
                PAGE_STATUS.IDLE,

            initialised:
                false,

            loading:
                false,

            busy:
                false,

            acknowledgementAccepted:
                false,

            registrationActionAvailable:
                false,

            paymentActionAvailable:
                false,

            sourceProgrammeCode:
                "",

            targetProgrammeCode:
                "",

            journey:
                null,

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

    let pageState =
        createInitialPageState();

    let pageInitialisationPromise =
        null;

    let registrationActionPromise =
        null;

    let eventsBound =
        false;

    /* ====================================================================
   PAGE STATE ACCESS
==================================================================== */

function buildPageState(
    patch
) {

    const safePatch =
        isObject(
            patch
        )
            ? patch
            : {};

    const hasPatchProperty =
        function hasPatchProperty(
            propertyName
        ) {

            return Object.prototype
                .hasOwnProperty
                .call(
                    safePatch,
                    propertyName
                );

        };

    return freezeObject({

        ...pageState,

        ...safePatch,

        status:
            hasPatchProperty(
                "status"
            )
                ? (
                    normaliseStatus(
                        safePatch.status
                    ) ||
                    PAGE_STATUS.IDLE
                )
                : pageState.status,

        initialised:
            hasPatchProperty(
                "initialised"
            )
                ? safePatch.initialised ===
                    true
                : pageState.initialised,

        loading:
            hasPatchProperty(
                "loading"
            )
                ? safePatch.loading ===
                    true
                : pageState.loading,

        busy:
            hasPatchProperty(
                "busy"
            )
                ? safePatch.busy ===
                    true
                : pageState.busy,

        acknowledgementAccepted:
            hasPatchProperty(
                "acknowledgementAccepted"
            )
                ? safePatch
                    .acknowledgementAccepted ===
                    true
                : pageState
                    .acknowledgementAccepted,

        registrationActionAvailable:
            hasPatchProperty(
                "registrationActionAvailable"
            )
                ? safePatch
                    .registrationActionAvailable ===
                    true
                : pageState
                    .registrationActionAvailable,

        paymentActionAvailable:
            hasPatchProperty(
                "paymentActionAvailable"
            )
                ? safePatch
                    .paymentActionAvailable ===
                    true
                : pageState
                    .paymentActionAvailable,

        sourceProgrammeCode:
            hasPatchProperty(
                "sourceProgrammeCode"
            )
                ? normaliseProgrammeCode(
                    safePatch
                        .sourceProgrammeCode
                )
                : pageState
                    .sourceProgrammeCode,

        targetProgrammeCode:
            hasPatchProperty(
                "targetProgrammeCode"
            )
                ? normaliseProgrammeCode(
                    safePatch
                        .targetProgrammeCode
                )
                : pageState
                    .targetProgrammeCode,

        journey:
            hasPatchProperty(
                "journey"
            )
                ? (
                    isObject(
                        safePatch.journey
                    )
                        ? safePatch.journey
                        : null
                )
                : pageState.journey,

        eligibility:
            hasPatchProperty(
                "eligibility"
            )
                ? (
                    isObject(
                        safePatch.eligibility
                    )
                        ? safePatch.eligibility
                        : null
                )
                : pageState.eligibility,

        offer:
            hasPatchProperty(
                "offer"
            )
                ? (
                    isObject(
                        safePatch.offer
                    )
                        ? safePatch.offer
                        : null
                )
                : pageState.offer,

        registration:
            hasPatchProperty(
                "registration"
            )
                ? (
                    isObject(
                        safePatch.registration
                    )
                        ? safePatch.registration
                        : null
                )
                : pageState.registration,

        payment:
            hasPatchProperty(
                "payment"
            )
                ? (
                    isObject(
                        safePatch.payment
                    )
                        ? safePatch.payment
                        : null
                )
                : pageState.payment,

        enrolment:
            hasPatchProperty(
                "enrolment"
            )
                ? (
                    isObject(
                        safePatch.enrolment
                    )
                        ? safePatch.enrolment
                        : null
                )
                : pageState.enrolment,

        error:
            hasPatchProperty(
                "error"
            )
                ? (
                    safePatch.error ||
                    null
                )
                : pageState.error,

        initialisedAt:
            hasPatchProperty(
                "initialisedAt"
            )
                ? (
                    safePatch.initialisedAt ||
                    null
                )
                : pageState.initialisedAt,

        updatedAt:
            nowIsoString()

    });

}

    function setPageState(
        patch
    ) {

        pageState =
            buildPageState(
                patch
            );

        dispatchPageEvent(

            PAGE_EVENT
                .STATE_CHANGED,

            {

                state:
                    pageState

            }

        );

        return pageState;

    }

    function getPageState() {

        return pageState;

    }

    function resetPageState() {

        pageInitialisationPromise =
            null;

        registrationActionPromise =
            null;

        pageState =
            createInitialPageState();

        dispatchPageEvent(

            PAGE_EVENT
                .STATE_CHANGED,

            {

                state:
                    pageState,

                reset:
                    true

            }

        );

        return pageState;

    }

    /* ====================================================================
       PAGE EVENT DISPATCH
    ==================================================================== */

    function dispatchPageEvent(
        eventName,
        detail
    ) {

        if (
            !isNonEmptyString(
                eventName
            ) ||
            typeof window.dispatchEvent !==
                "function" ||
            typeof window.CustomEvent !==
                "function"
        ) {

            return false;

        }

        try {

            window.dispatchEvent(

                new window.CustomEvent(

                    eventName,

                    {

                        detail:
                            freezeObject({

                                pageControllerName:
                                    PAGE_CONTROLLER_NAME,

                                pageControllerVersion:
                                    PAGE_CONTROLLER_VERSION,

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

        }
        catch (error) {

            console.warn(

                `[${PAGE_CONTROLLER_NAME}] Unable to dispatch event "${eventName}".`,

                error

            );

            return false;

        }

    }

    /* ====================================================================
       END OF BLOCK 1 OF 6

       Do not close the IIFE here.
       Block 2 must continue immediately below this section.
    ==================================================================== */

        /* ====================================================================
       BLOCK 2 OF 6
       DOM LIFECYCLE, EVENT BINDING AND VISUAL PAGE STATES
    ==================================================================== */

    /* ====================================================================
       ELEMENT CACHING
    ==================================================================== */

    function cacheElements() {

        elements.portalApp =
            document.getElementById(
                "portalApp"
            );

        elements.mainContent =
            document.getElementById(
                "mainContent"
            );

        elements.loadingState =
            document.getElementById(
                "bridgeLoadingState"
            );

        elements.errorState =
            document.getElementById(
                "bridgeErrorState"
            );

        elements.errorMessage =
            document.getElementById(
                "bridgeErrorMessage"
            );

        elements.retryButton =
            document.getElementById(
                "bridgeRetryButton"
            );

        elements.notEligibleState =
            document.getElementById(
                "bridgeNotEligibleState"
            );

        elements.notEligibleReason =
            document.getElementById(
                "bridgeNotEligibleReason"
            );

        elements.registeredState =
            document.getElementById(
                "bridgeRegisteredState"
            );

        elements.registeredMessage =
            document.getElementById(
                "bridgeRegisteredMessage"
            );

        elements.enrolledState =
            document.getElementById(
                "bridgeEnrolledState"
            );

        elements.enrolledMessage =
            document.getElementById(
                "bridgeEnrolledMessage"
            );

        elements.eligibleState =
            document.getElementById(
                "bridgeEligibleState"
            );

        elements.statusAnnouncer =
            document.getElementById(
                "bridgeStatusAnnouncer"
            );

        elements.offerTitle =
            document.getElementById(
                "bridgeOfferTitle"
            );

        elements.offerDescription =
            document.getElementById(
                "bridgeOfferDescription"
            );

        elements.eligibilityBadge =
            document.getElementById(
                "bridgeEligibilityBadge"
            );

        elements.currentProgramName =
            document.getElementById(
                "bridgeCurrentProgramName"
            );

        elements.currentProgramCode =
            document.getElementById(
                "bridgeCurrentProgramCode"
            );

        elements.targetProgramName =
            document.getElementById(
                "bridgeTargetProgramName"
            );

        elements.targetProgramCode =
            document.getElementById(
                "bridgeTargetProgramCode"
            );

        elements.offerExpiryBadge =
            document.getElementById(
                "bridgeOfferExpiryBadge"
            );

        elements.baseFee =
            document.getElementById(
                "bridgeBaseFee"
            );

        elements.gstRate =
            document.getElementById(
                "bridgeGstRate"
            );

        elements.gstAmount =
            document.getElementById(
                "bridgeGstAmount"
            );

        elements.totalPayable =
            document.getElementById(
                "bridgeTotalPayable"
            );

        elements.standardFee =
            document.getElementById(
                "bridgeStandardFee"
            );

        elements.fullProgrammeFee =
            document.getElementById(
                "bridgeFullProgrammeFee"
            );

        elements.offerExpiry =
            document.getElementById(
                "bridgeOfferExpiry"
            );

        elements.taxDisclaimer =
            document.getElementById(
                "bridgeTaxDisclaimer"
            );

        elements.termsConfirmation =
            document.getElementById(
                "bridgeTermsConfirmation"
            );

        elements.registrationNotice =
            document.getElementById(
                "bridgeRegistrationNotice"
            );

        elements.registerButton =
            document.getElementById(
                "bridgeRegisterButton"
            );

        return elements;

    }

    /* ====================================================================
       REQUIRED PAGE ELEMENT VALIDATION
    ==================================================================== */

    function validateRequiredPageElements() {

        const requiredElements =
            [

                [
                    "portalApp",
                    elements.portalApp
                ],

                [
                    "bridgeLoadingState",
                    elements.loadingState
                ],

                [
                    "bridgeErrorState",
                    elements.errorState
                ],

                [
                    "bridgeNotEligibleState",
                    elements.notEligibleState
                ],

                [
                    "bridgeRegisteredState",
                    elements.registeredState
                ],

                [
                    "bridgeEnrolledState",
                    elements.enrolledState
                ],

                [
                    "bridgeEligibleState",
                    elements.eligibleState
                ],

                [
                    "bridgeTermsConfirmation",
                    elements.termsConfirmation
                ],

                [
                    "bridgeRegisterButton",
                    elements.registerButton
                ]

            ];

        const missingElements =
            requiredElements
                .filter(
                    function findMissingElement(
                        entry
                    ) {

                        return !entry[1];

                    }
                )
                .map(
                    function resolveMissingElementName(
                        entry
                    ) {

                        return entry[0];

                    }
                );

        if (
            missingElements.length >
            0
        ) {

            const error =
                new Error(
                    "Required Bridge Programme page elements are unavailable."
                );

            error.name =
                "BridgeProgrammeRegistrationPageError";

            error.code =
                "BRIDGE_PROGRAMME_PAGE_ELEMENTS_UNAVAILABLE";

            error.details =
                freezeObject({

                    missingElements:
                        freezeArray(
                            missingElements
                        )

                });

            throw error;

        }

        return true;

    }

    /* ====================================================================
       EVENT BINDING
    ==================================================================== */

    function bindEvents() {

    if (
        eventsBound ===
        true
    ) {

        return false;

    }

    if (
        elements.retryButton
    ) {

        elements.retryButton
            .addEventListener(

                "click",

                function handleRetryButtonClick(
                    event
                ) {

                    Promise.resolve(
                        handleRetryAction(
                            event
                        )
                    ).catch(

                        function handleRetryActionError(
                            error
                        ) {

                            /*
                             * handleRetryAction() and the journey loader
                             * already render the governed error state.
                             * This catch prevents an unhandled rejection.
                             */

                            console.warn(

                                `[${PAGE_CONTROLLER_NAME}] Retry action completed with an error.`,

                                error

                            );

                        }

                    );

                }

            );

    }

    if (
        elements
            .termsConfirmation
    ) {

        elements
            .termsConfirmation
            .addEventListener(

                "change",

                handleTermsConfirmationChange

            );

    }

    if (
        elements.registerButton
    ) {

        elements.registerButton
            .addEventListener(

                "click",

                function handleRegisterButtonClick(
                    event
                ) {

                    Promise.resolve(
                        handleRegistrationAction(
                            event
                        )
                    ).catch(

                        function handleRegistrationActionError(
                            error
                        ) {

                            /*
                             * handleRegistrationAction() already restores
                             * or renders the appropriate governed page
                             * state. This catch only prevents an unhandled
                             * promise rejection from the DOM listener.
                             */

                            console.warn(

                                `[${PAGE_CONTROLLER_NAME}] Registration action completed with an error.`,

                                error

                            );

                        }

                    );

                }

            );

    }

    /*
     * Portal readiness events may occur after the page script
     * has loaded. They are handled defensively and do not
     * independently execute business logic.
     */

    window.addEventListener(

        "portal:identity-ready",

        handlePortalReadinessEvent

    );

    window.addEventListener(

        "profile:ready",

        handlePortalReadinessEvent

    );

    window.addEventListener(

        "entitlements:ready",

        handlePortalReadinessEvent

    );

    window.addEventListener(

        "credentials:rendered",

        handlePortalReadinessEvent

    );

    window.addEventListener(

        "credentials:ready",

        handlePortalReadinessEvent

    );

    /*
     * Governed journey-controller lifecycle events.
     */

    window.addEventListener(

        "bridge-registration-controller:state-changed",

        handleJourneyControllerStateChanged

    );

    window.addEventListener(

        "bridge-registration-controller:registration-created",

        handleJourneyControllerRegistrationCreated

    );

    window.addEventListener(

        "bridge-registration-controller:registration-resolved",

        handleJourneyControllerRegistrationResolved

    );

    window.addEventListener(

        "bridge-registration-controller:payment-required",

        handleJourneyControllerPaymentRequired

    );

    window.addEventListener(

        "bridge-registration-controller:payment-confirmed",

        handleJourneyControllerPaymentConfirmed

    );

    window.addEventListener(

        "bridge-registration-controller:enrolment-resolved",

        handleJourneyControllerEnrolmentResolved

    );

    window.addEventListener(

        "bridge-registration-controller:error",

        handleJourneyControllerError

    );

    eventsBound =
        true;

    return true;

}

    /* ====================================================================
       DOM HELPERS
    ==================================================================== */

    function setHidden(
        element,
        hidden
    ) {

        if (
            !element
        ) {

            return;

        }

        element.hidden =
            Boolean(
                hidden
            );

    }

    function setText(
        element,
        value
    ) {

        if (
            !element
        ) {

            return;

        }

        element.textContent =
            value ===
                null ||
            value ===
                undefined
                ? ""
                : String(
                    value
                );

    }

    function setDisabled(
        element,
        disabled
    ) {

        if (
            !element
        ) {

            return;

        }

        const governedDisabled =
            disabled ===
            true;

        element.disabled =
            governedDisabled;

        element.setAttribute(

            "aria-disabled",

            governedDisabled
                ? "true"
                : "false"

        );

    }

    function focusMainContent() {

        if (
            !elements.mainContent ||
            typeof elements
                .mainContent
                .focus !==
                "function"
        ) {

            return;

        }

        try {

            elements.mainContent
                .focus({

                    preventScroll:
                        true

                });

        }
        catch (error) {

            elements.mainContent
                .focus();

        }

    }

    function announce(
        message
    ) {

        if (
            !elements.statusAnnouncer
        ) {

            return;

        }

        elements.statusAnnouncer
            .textContent =
            "";

        window.setTimeout(

            function updateAnnouncement() {

                elements
                    .statusAnnouncer
                    .textContent =
                    normaliseString(
                        message
                    );

            },

            20

        );

    }

    /* ====================================================================
       VISUAL PAGE STATE RESET
    ==================================================================== */

    function hideAllStates() {

        setHidden(
            elements.loadingState,
            true
        );

        setHidden(
            elements.errorState,
            true
        );

        setHidden(
            elements.notEligibleState,
            true
        );

        setHidden(
            elements.registeredState,
            true
        );

        setHidden(
            elements.enrolledState,
            true
        );

        setHidden(
            elements.eligibleState,
            true
        );

    }

    function resetAcknowledgementControl() {

        if (
            elements
                .termsConfirmation
        ) {

            elements
                .termsConfirmation
                .checked =
                false;

            elements
                .termsConfirmation
                .disabled =
                true;

        }

        setPageState({

            acknowledgementAccepted:
                false,

            registrationActionAvailable:
                false

        });

    }

    function resetRegistrationAction() {

        setDisabled(
            elements.registerButton,
            true
        );

        setText(
            elements.registerButton,
            DEFAULT_REGISTRATION_LABEL
        );

        setText(
            elements.registrationNotice,
            DEFAULT_REGISTRATION_NOTICE
        );

    }

    function resetInteractiveControls() {

        resetAcknowledgementControl();

        resetRegistrationAction();

    }

    /* ====================================================================
       LOADING STATE
    ==================================================================== */

    function showLoadingState(
        message
    ) {

        hideAllStates();

        resetInteractiveControls();

        setHidden(
            elements.loadingState,
            false
        );

        const announcement =
            normaliseString(
                message
            ) ||
            "Checking your Bridge Programme eligibility.";

        setPageState({

            status:
                PAGE_STATUS.LOADING,

            loading:
                true,

            busy:
                true,

            error:
                null

        });

        announce(
            announcement
        );

    }

    /* ====================================================================
       ERROR STATE
    ==================================================================== */

    function showErrorState(
        message,
        error
    ) {

        hideAllStates();

        resetInteractiveControls();

        const governedMessage =
            normaliseString(
                message
            ) ||
            "We could not load your Bridge Programme registration details. Please refresh the page or try again later.";

        setText(
            elements.errorMessage,
            governedMessage
        );

        setHidden(
            elements.errorState,
            false
        );

        setPageState({

            status:
                PAGE_STATUS.ERROR,

            loading:
                false,

            busy:
                false,

            error:
                error ||
                freezeObject({

                    message:
                        governedMessage

                })

        });

        announce(
            "Bridge Programme registration details could not be loaded."
        );

        dispatchPageEvent(

            PAGE_EVENT.ERROR,

            {

                message:
                    governedMessage,

                error:
                    error ||
                    null,

                state:
                    pageState

            }

        );

    }

    /* ====================================================================
       NOT ELIGIBLE STATE
    ==================================================================== */

    function showNotEligibleState(
        reason
    ) {

        hideAllStates();

        resetInteractiveControls();

        const governedReason =
            normaliseString(
                reason
            ) ||
            "No eligible Bridge Programme pathway is currently available for your credential.";

        setText(
            elements.notEligibleReason,
            governedReason
        );

        setHidden(
            elements.notEligibleState,
            false
        );

        setPageState({

            status:
                PAGE_STATUS.NOT_ELIGIBLE,

            loading:
                false,

            busy:
                false,

            registrationActionAvailable:
                false,

            paymentActionAvailable:
                false,

            error:
                null

        });

        announce(
            governedReason
        );

    }

    /* ====================================================================
       ELIGIBLE REGISTRATION STATE
    ==================================================================== */

    function showEligibleState() {

        hideAllStates();

        setHidden(
            elements.eligibleState,
            false
        );

        setPageState({

            status:
                PAGE_STATUS
                    .REGISTRATION_AVAILABLE,

            loading:
                false,

            busy:
                false,

            error:
                null

        });

        announce(
            "Your Bridge Programme eligibility has been confirmed."
        );

    }

    /* ====================================================================
       REGISTERED STATE
    ==================================================================== */

    function showRegisteredState(
        message
    ) {

        hideAllStates();

        resetInteractiveControls();

        const governedMessage =
            normaliseString(
                message
            ) ||
            "Your Bridge Programme registration is already available in your enrolment workspace.";

        setText(
            elements.registeredMessage,
            governedMessage
        );

        setHidden(
            elements.registeredState,
            false
        );

        setPageState({

            status:
                PAGE_STATUS.REGISTERED,

            loading:
                false,

            busy:
                false,

            registrationActionAvailable:
                false,

            error:
                null

        });

        announce(
            "You are already registered for this Bridge Programme."
        );

    }

    /* ====================================================================
       PAYMENT REQUIRED STATE
    ==================================================================== */

    function showPaymentRequiredState(
        message
    ) {

        /*
         * The current HTML does not have a separate payment card.
         * Until that surface is added, the eligible workspace remains
         * visible and presents the confirmed registration status.
         */

        hideAllStates();

        setHidden(
            elements.eligibleState,
            false
        );

        if (
            elements
                .termsConfirmation
        ) {

            elements
                .termsConfirmation
                .checked =
                true;

            elements
                .termsConfirmation
                .disabled =
                true;

        }

        setDisabled(
            elements.registerButton,
            true
        );

        setText(
            elements.registerButton,
            PAYMENT_REQUIRED_LABEL
        );

        setText(

            elements
                .registrationNotice,

            normaliseString(
                message
            ) ||
            PAYMENT_SERVICE_UNAVAILABLE_NOTICE

        );

        setPageState({

            status:
                PAGE_STATUS
                    .PAYMENT_REQUIRED,

            loading:
                false,

            busy:
                false,

            acknowledgementAccepted:
                true,

            registrationActionAvailable:
                false,

            paymentActionAvailable:
                false,

            error:
                null

        });

        announce(
            "Your registration is confirmed and payment is required."
        );

    }

    /* ====================================================================
       PAYMENT IN PROGRESS STATE
    ==================================================================== */

    function showPaymentInProgressState(
        message
    ) {

        hideAllStates();

        setHidden(
            elements.eligibleState,
            false
        );

        if (
            elements
                .termsConfirmation
        ) {

            elements
                .termsConfirmation
                .checked =
                true;

            elements
                .termsConfirmation
                .disabled =
                true;

        }

        setDisabled(
            elements.registerButton,
            true
        );

        setText(
            elements.registerButton,
            "Payment in Progress"
        );

        setText(

            elements
                .registrationNotice,

            normaliseString(
                message
            ) ||
            "Your payment is currently being processed."

        );

        setPageState({

            status:
                PAGE_STATUS
                    .PAYMENT_IN_PROGRESS,

            loading:
                false,

            busy:
                true,

            acknowledgementAccepted:
                true,

            registrationActionAvailable:
                false,

            paymentActionAvailable:
                false,

            error:
                null

        });

        announce(
            "Your Bridge Programme payment is being processed."
        );

    }

    /* ====================================================================
       PAYMENT CONFIRMED STATE
    ==================================================================== */

    function showPaymentConfirmedState(
        message
    ) {

        hideAllStates();

        setHidden(
            elements.eligibleState,
            false
        );

        if (
            elements
                .termsConfirmation
        ) {

            elements
                .termsConfirmation
                .checked =
                true;

            elements
                .termsConfirmation
                .disabled =
                true;

        }

        setDisabled(
            elements.registerButton,
            true
        );

        setText(
            elements.registerButton,
            "Payment Confirmed"
        );

        setText(

            elements
                .registrationNotice,

            normaliseString(
                message
            ) ||
            "Your payment has been confirmed. Enrolment is being prepared."

        );

        setPageState({

            status:
                PAGE_STATUS
                    .PAYMENT_CONFIRMED,

            loading:
                false,

            busy:
                false,

            acknowledgementAccepted:
                true,

            registrationActionAvailable:
                false,

            paymentActionAvailable:
                false,

            error:
                null

        });

        announce(
            "Your Bridge Programme payment has been confirmed."
        );

    }

    /* ====================================================================
       ENROLMENT PENDING STATE
    ==================================================================== */

    function showEnrolmentPendingState(
        message
    ) {

        hideAllStates();

        setHidden(
            elements.eligibleState,
            false
        );

        if (
            elements
                .termsConfirmation
        ) {

            elements
                .termsConfirmation
                .checked =
                true;

            elements
                .termsConfirmation
                .disabled =
                true;

        }

        setDisabled(
            elements.registerButton,
            true
        );

        setText(
            elements.registerButton,
            "Enrolment Pending"
        );

        setText(

            elements
                .registrationNotice,

            normaliseString(
                message
            ) ||
            "Your registration and payment are confirmed. Enrolment is being completed."

        );

        setPageState({

            status:
                PAGE_STATUS
                    .ENROLMENT_PENDING,

            loading:
                false,

            busy:
                true,

            acknowledgementAccepted:
                true,

            registrationActionAvailable:
                false,

            paymentActionAvailable:
                false,

            error:
                null

        });

        announce(
            "Your Bridge Programme enrolment is being completed."
        );

    }

    /* ====================================================================
       ENROLLED STATE
    ==================================================================== */

    function showEnrolledState(
        message
    ) {

        hideAllStates();

        resetInteractiveControls();

        const governedMessage =
            normaliseString(
                message
            ) ||
            "Your Bridge Programme enrolment has already been confirmed.";

        setText(
            elements.enrolledMessage,
            governedMessage
        );

        setHidden(
            elements.enrolledState,
            false
        );

        setPageState({

            status:
                PAGE_STATUS.ENROLLED,

            loading:
                false,

            busy:
                false,

            registrationActionAvailable:
                false,

            paymentActionAvailable:
                false,

            error:
                null

        });

        announce(
            "You are already enrolled in this Bridge Programme."
        );

    }

    /* ====================================================================
       BLOCKED STATE
    ==================================================================== */

    function showBlockedState(
        message
    ) {

        hideAllStates();

        resetInteractiveControls();

        const governedMessage =
            normaliseString(
                message
            ) ||
            "This Bridge Programme registration cannot currently continue.";

        setText(
            elements.errorMessage,
            governedMessage
        );

        setHidden(
            elements.errorState,
            false
        );

        setPageState({

            status:
                PAGE_STATUS.BLOCKED,

            loading:
                false,

            busy:
                false,

            registrationActionAvailable:
                false,

            paymentActionAvailable:
                false,

            error:
                freezeObject({

                    message:
                        governedMessage,

                    blocked:
                        true

                })

        });

        announce(
            governedMessage
        );

    }

    /* ====================================================================
       REGISTRATION BUSY STATE
    ==================================================================== */

    function showRegistrationInProgressState() {

        hideAllStates();

        setHidden(
            elements.eligibleState,
            false
        );

        if (
            elements
                .termsConfirmation
        ) {

            elements
                .termsConfirmation
                .disabled =
                true;

        }

        setDisabled(
            elements.registerButton,
            true
        );

        setText(
            elements.registerButton,
            REGISTERING_LABEL
        );

        setText(
            elements.registrationNotice,
            REGISTRATION_IN_PROGRESS_NOTICE
        );

        setPageState({

            status:
                PAGE_STATUS.REGISTERING,

            loading:
                false,

            busy:
                true,

            registrationActionAvailable:
                false,

            error:
                null

        });

        announce(
            "Creating your Bridge Programme registration."
        );

    }

    /* ====================================================================
       REGISTRATION INTERACTION READINESS
    ==================================================================== */

    function enableRegistrationInteraction() {

        if (
            elements
                .termsConfirmation
        ) {

            elements
                .termsConfirmation
                .disabled =
                false;

            elements
                .termsConfirmation
                .checked =
                false;

        }

        setDisabled(
            elements.registerButton,
            true
        );

        setText(
            elements.registerButton,
            DEFAULT_REGISTRATION_LABEL
        );

        setText(
            elements.registrationNotice,
            ACKNOWLEDGEMENT_REQUIRED_NOTICE
        );

        setPageState({

            status:
                PAGE_STATUS
                    .REGISTRATION_AVAILABLE,

            busy:
                false,

            acknowledgementAccepted:
                false,

            registrationActionAvailable:
                false,

            paymentActionAvailable:
                false,

            error:
                null

        });

    }

    /* ====================================================================
       END OF BLOCK 2 OF 6

       Do not close the IIFE here.
       Block 3 must continue immediately below this section.
    ==================================================================== */

        /* ====================================================================
       BLOCK 3 OF 6
       CONTROLLER INTEGRATION AND PAGE INITIALISATION
    ==================================================================== */

    /* ====================================================================
       JOURNEY CONTROLLER ACCESS
    ==================================================================== */

    function getJourneyController() {

        const controller =
            window
                .BridgeRegistrationController;

        if (
            !controller ||
            typeof controller !==
                "object"
        ) {

            return null;

        }

        return controller;

    }

    function getRequiredJourneyController() {

        const controller =
            getJourneyController();

        if (
            !controller
        ) {

            const error =
                new Error(
                    "BridgeRegistrationController is unavailable."
                );

            error.name =
                "BridgeProgrammeRegistrationPageError";

            error.code =
                "BRIDGE_REGISTRATION_CONTROLLER_UNAVAILABLE";

            throw error;

        }

        const requiredMethods =
            [

                "initialiseRegistrationJourney",

                "resolveRegistrationJourney",

                "getState",

                "getReadiness",

                "getControllerReadiness"

            ];

        const missingMethods =
            requiredMethods.filter(

                function findMissingControllerMethod(
                    methodName
                ) {

                    return typeof controller[
                        methodName
                    ] !==
                    "function";

                }

            );

        if (
            missingMethods.length >
            0
        ) {

            const error =
                new Error(
                    "BridgeRegistrationController does not expose the required page-integration contract."
                );

            error.name =
                "BridgeProgrammeRegistrationPageError";

            error.code =
                "BRIDGE_REGISTRATION_CONTROLLER_CONTRACT_INVALID";

            error.details =
                freezeObject({

                    missingMethods:
                        freezeArray(
                            missingMethods
                        )

                });

            throw error;

        }

        return controller;

    }

    /* ====================================================================
       JOURNEY CONTROLLER READINESS
    ==================================================================== */

    function resolveJourneyControllerReadiness() {

        const controller =
            getJourneyController();

        if (
            !controller
        ) {

            return freezeObject({

                available:
                    false,

                foundationReady:
                    false,

                programmeResolutionReady:
                    false,

                paymentResolutionReady:
                    false,

                enrolmentResolutionReady:
                    false,

                authenticated:
                    false,

                controllerVersion:
                    null

            });

        }

        try {

            const readiness =
                typeof controller
                    .getReadiness ===
                    "function"
                    ? controller
                        .getReadiness()
                    : null;

            const safeReadiness =
                isObject(
                    readiness
                )
                    ? readiness
                    : {};

            return freezeObject({

                available:
                    true,

                foundationReady:
                    safeReadiness
                        .foundationReady ===
                    true,

                programmeResolutionReady:
                    safeReadiness
                        .programmeResolutionReady ===
                    true,

                paymentResolutionReady:
                    safeReadiness
                        .paymentResolutionReady ===
                    true,

                enrolmentResolutionReady:
                    safeReadiness
                        .enrolmentResolutionReady ===
                    true,

                authenticated:
                    safeReadiness
                        .authenticated ===
                    true,

                controllerVersion:
                    normaliseString(
                        safeReadiness
                            .controllerVersion
                    ) ||
                    null,

                raw:
                    freezeObject(
                        safeReadiness
                    )

            });

        }
        catch (error) {

            console.warn(

                `[${PAGE_CONTROLLER_NAME}] Journey controller readiness could not be resolved.`,

                error

            );

            return freezeObject({

                available:
                    true,

                foundationReady:
                    false,

                programmeResolutionReady:
                    false,

                paymentResolutionReady:
                    false,

                enrolmentResolutionReady:
                    false,

                authenticated:
                    false,

                controllerVersion:
                    null,

                error

            });

        }

    }

    /* ====================================================================
       PAGE INITIALISATION INPUT
    ==================================================================== */

    function buildPageInitialisationInput(
        options
    ) {

        const safeOptions =
            isObject(
                options
            )
                ? options
                : {};

        const pageContext =
            resolvePageContext();

        return freezeObject({

            sourceProgrammeCode:
                normaliseProgrammeCode(

                    safeOptions
                        .sourceProgrammeCode ||
                    pageContext
                        .sourceProgrammeCode

                ),

            targetProgrammeCode:
                normaliseProgrammeCode(

                    safeOptions
                        .targetProgrammeCode ||
                    pageContext
                        .targetProgrammeCode

                ),

            waitForAuth:
                safeOptions
                    .waitForAuth !==
                false,

            timeoutMs:
                normaliseNumber(
                    safeOptions
                        .timeoutMs,
                    10000
                ),

            forceIdentity:
                safeOptions
                    .forceIdentity ===
                true,

            forceEligibility:
                safeOptions
                    .forceEligibility ===
                true,

            forceOffer:
                safeOptions
                    .forceOffer ===
                true,

            forceRegistrationResolution:
                safeOptions
                    .forceRegistrationResolution ===
                true,

            resolvePaymentStatus:
                safeOptions
                    .resolvePaymentStatus ===
                true,

            resolveEnrolmentAfterPayment:
                safeOptions
                    .resolveEnrolmentAfterPayment ===
                true,

            /*
             * The controller enforces this rule independently,
             * but the page also states it explicitly.
             */

            createIfMissing:
                false,

            source:
                normaliseString(
                    safeOptions.source
                ) ||
                "STUDENT_PORTAL"

        });

    }

    /* ====================================================================
       JOURNEY RESULT NORMALISATION
    ==================================================================== */

    function normaliseJourneyResult(
        result,
        input
    ) {

        const safeResult =
            isObject(
                result
            )
                ? result
                : {};

        const safeInput =
            isObject(
                input
            )
                ? input
                : {};

        const controllerState =
            isObject(
                safeResult.state
            )
                ? safeResult.state
                : {};

        const eligibility =
            isObject(
                safeResult.eligibility
            )
                ? safeResult.eligibility
                : (
                    isObject(
                        controllerState
                            .eligibility
                    )
                        ? controllerState
                            .eligibility
                        : null
                );

        const offer =
            isObject(
                safeResult.offer
            )
                ? safeResult.offer
                : (
                    isObject(
                        controllerState.offer
                    )
                        ? controllerState.offer
                        : null
                );

        const registration =
            isObject(
                safeResult.registration
            )
                ? safeResult.registration
                : (
                    isObject(
                        controllerState
                            .registration
                    )
                        ? controllerState
                            .registration
                        : null
                );

        const payment =
            isObject(
                safeResult.payment
            )
                ? safeResult.payment
                : (
                    isObject(
                        controllerState.payment
                    )
                        ? controllerState.payment
                        : null
                );

        const enrolment =
            isObject(
                safeResult.enrolment
            )
                ? safeResult.enrolment
                : (
                    isObject(
                        controllerState.enrolment
                    )
                        ? controllerState.enrolment
                        : null
                );

        const eligible =
            safeResult.eligible ===
                true ||
            Boolean(
                eligibility &&
                eligibility.eligible ===
                    true
            );

        const offerAvailable =
            safeResult.offerAvailable ===
                true ||
            Boolean(
                offer &&
                offer.offerAvailable ===
                    true
            );

        const registrationExists =
            safeResult.registrationExists ===
                true ||
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

        const status =
            normaliseStatus(

                safeResult.status ||
                controllerState.status

            ) ||
            "READY";

        return freezeObject({

            eligible,

            offerAvailable,

            registrationExists,

            created:
                safeResult.created ===
                true,

            restored:
                safeResult.restored ===
                true,

            existing:
                safeResult.existing ===
                true,

            idempotent:
                safeResult.idempotent ===
                true,

            creationRequired:
                safeResult.creationRequired ===
                true,

            acknowledgementRequired:
                safeResult
                    .acknowledgementRequired ===
                true,

            sourceProgrammeCode:
                normaliseProgrammeCode(

                    controllerState
                        .sourceProgrammeCode ||
                    safeInput
                        .sourceProgrammeCode

                ),

            targetProgrammeCode:
                normaliseProgrammeCode(

                    controllerState
                        .targetProgrammeCode ||
                    safeInput
                        .targetProgrammeCode

                ),

            eligibility,

            offer,

            registration,

            payment,

            enrolment,

            status,

            pageContext:
                isObject(
                    safeResult.pageContext
                )
                    ? safeResult.pageContext
                    : null,

            controllerState:
                freezeObject(
                    controllerState
                ),

            raw:
                freezeObject(
                    safeResult
                )

        });

    }

    /* ====================================================================
       PAGE INITIALISATION
    ==================================================================== */

    async function initialisePage(
        options
    ) {

        const safeOptions =
            isObject(
                options
            )
                ? options
                : {};

        if (
            pageState.initialised &&
            safeOptions.force !==
                true
        ) {

            return pageState;

        }

        if (
            pageInitialisationPromise
        ) {

            return pageInitialisationPromise;

        }

        pageInitialisationPromise =
            (
                async function performPageInitialisation() {

                    setPageState({

                        status:
                            PAGE_STATUS
                                .INITIALISING,

                        loading:
                            true,

                        busy:
                            true,

                        error:
                            null

                    });

                    try {

                        cacheElements();

                        validateRequiredPageElements();

                        bindEvents();

                        const pageContext =
                            resolvePageContext();

                        setPageState({

                            sourceProgrammeCode:
                                pageContext
                                    .sourceProgrammeCode,

                            targetProgrammeCode:
                                pageContext
                                    .targetProgrammeCode

                        });

                        resetInteractiveControls();

                        const journey =
                            await loadRegistrationJourney({

                                ...safeOptions,

                                force:
                                    safeOptions.force ===
                                    true

                            });

                        const timestamp =
                            nowIsoString();

                        const nextState =
                            setPageState({

                                initialised:
                                    true,

                                loading:
                                    false,

                                busy:
                                    false,

                                initialisedAt:
                                    pageState
                                        .initialisedAt ||
                                    timestamp,

                                error:
                                    null

                            });

                        dispatchPageEvent(

                            PAGE_EVENT.READY,

                            {

                                journey,

                                state:
                                    nextState

                            }

                        );

                        console.info(

                            `[${PAGE_CONTROLLER_NAME}] v${PAGE_CONTROLLER_VERSION} initialised successfully.`

                        );

                        return nextState;

                    }
                    catch (error) {

                        console.error(

                            `[${PAGE_CONTROLLER_NAME}] Initialisation failed.`,

                            error

                        );

                        showErrorState(

                            resolvePageErrorMessage(
                                error
                            ),

                            error

                        );

                        throw error;

                    }

                }
            )();

        try {

            return await pageInitialisationPromise;

        }
        finally {

            pageInitialisationPromise =
                null;

        }

    }

    /* ====================================================================
       JOURNEY LOADING
    ==================================================================== */

    async function loadRegistrationJourney(
        options
    ) {

        const safeOptions =
            isObject(
                options
            )
                ? options
                : {};

        showLoadingState(
            "Checking your Bridge Programme eligibility."
        );

        try {

            const controller =
                getRequiredJourneyController();

            const input =
                buildPageInitialisationInput(
                    safeOptions
                );

            setPageState({

                sourceProgrammeCode:
                    input.sourceProgrammeCode,

                targetProgrammeCode:
                    input.targetProgrammeCode,

                loading:
                    true,

                busy:
                    true,

                error:
                    null

            });

            const result =
                await controller
                    .initialiseRegistrationJourney(
                        input
                    );

            const journey =
                normaliseJourneyResult(
                    result,
                    input
                );

            setPageState({

                journey,

                eligibility:
                    journey.eligibility,

                offer:
                    journey.offer,

                registration:
                    journey.registration,

                payment:
                    journey.payment,

                enrolment:
                    journey.enrolment,

                sourceProgrammeCode:
                    journey
                        .sourceProgrammeCode,

                targetProgrammeCode:
                    journey
                        .targetProgrammeCode,

                loading:
                    false,

                busy:
                    false,

                error:
                    null

            });

            renderRegistrationJourney(
                journey
            );

            dispatchPageEvent(

                PAGE_EVENT
                    .JOURNEY_RENDERED,

                {

                    journey,

                    state:
                        pageState

                }

            );

            return journey;

        }
        catch (error) {

            console.error(

                `[${PAGE_CONTROLLER_NAME}] Journey loading failed.`,

                error

            );

            showErrorState(

                resolvePageErrorMessage(
                    error
                ),

                error

            );

            throw error;

        }

    }

    /* ====================================================================
       JOURNEY REFRESH
    ==================================================================== */

    async function refreshRegistrationJourney(
        options
    ) {

        const safeOptions =
            isObject(
                options
            )
                ? options
                : {};

        return loadRegistrationJourney({

            ...safeOptions,

            force:
                true,

            forceIdentity:
                safeOptions
                    .forceIdentity ===
                true,

            forceEligibility:
                safeOptions
                    .forceEligibility !==
                false,

            forceOffer:
                safeOptions
                    .forceOffer !==
                false,

            forceRegistrationResolution:
                true

        });

    }

    /* ====================================================================
       RETRY ACTION
    ==================================================================== */

    async function handleRetryAction(
        event
    ) {

        if (
            event &&
            typeof event.preventDefault ===
                "function"
        ) {

            event.preventDefault();

        }

        if (
            pageState.busy
        ) {

            return;

        }

        try {

            await refreshRegistrationJourney({

                forceIdentity:
                    false,

                forceEligibility:
                    true,

                forceOffer:
                    true

            });

        }
        catch (error) {

            /*
             * loadRegistrationJourney() already renders the error.
             */

        }

    }

    /* ====================================================================
       PORTAL READINESS EVENTS
    ==================================================================== */

    function handlePortalReadinessEvent() {

        if (
            pageState.busy ||
            pageState.loading
        ) {

            return;

        }

        /*
         * Portal events should only trigger another journey load
         * when the page has not yet obtained a usable model.
         */

        if (
            !pageState.journey ||
            pageState.status ===
                PAGE_STATUS.ERROR
        ) {

            refreshRegistrationJourney({

                forceIdentity:
                    false,

                forceEligibility:
                    true,

                forceOffer:
                    true

            }).catch(

                function handleReadinessRefreshError(
                    error
                ) {

                    console.warn(

                        `[${PAGE_CONTROLLER_NAME}] Portal-readiness refresh failed.`,

                        error

                    );

                }

            );

        }

    }

    /* ====================================================================
       PAGE ERROR MESSAGE RESOLUTION
    ==================================================================== */

    function resolvePageErrorMessage(
        error
    ) {

        const errorCode =
            normaliseStatus(
                error &&
                error.code
            );

        const errorMessage =
            normaliseString(
                error &&
                error.message
            );

        if (
            errorCode ===
                "BRIDGE_REGISTRATION_CONTROLLER_UNAVAILABLE" ||
            errorCode ===
                "BRIDGE_REGISTRATION_CONTROLLER_CONTRACT_INVALID" ||
            errorMessage.includes(
                "BridgeRegistrationController"
            )
        ) {

            return "The Bridge Programme registration controller could not be loaded. Please refresh the page.";

        }

        if (
            errorCode.includes(
                "AUTH_REQUIRED"
            ) ||
            errorMessage
                .toLowerCase()
                .includes(
                    "authenticated learner"
                )
        ) {

            return "Your authenticated learner identity could not be resolved. Please sign in again and retry.";

        }

        if (
            errorCode.includes(
                "DEPENDENCY_UNAVAILABLE"
            )
        ) {

            return "A required Bridge Programme service could not be loaded. Please refresh the page.";

        }

        if (
            errorCode.includes(
                "REGISTRATION_RESOLUTION_FAILED"
            )
        ) {

            return "Your existing Bridge Programme registration could not be checked. Please retry.";

        }

        if (
            errorCode.includes(
                "ELIGIBILITY_RESOLUTION_FAILED"
            ) ||
            errorCode.includes(
                "OFFER_RESOLUTION_FAILED"
            )
        ) {

            return "Your Bridge Programme eligibility or approved offer could not be resolved. Please retry.";

        }

        return "We could not load your Bridge Programme registration details. Please refresh the page or try again later.";

    }

    /* ====================================================================
       END OF BLOCK 3 OF 6

       Do not close the IIFE here.
       Block 4 must continue immediately below this section.
    ==================================================================== */

        /* ====================================================================
       BLOCK 4 OF 6
       JOURNEY AND COMMERCIAL RENDERING
    ==================================================================== */

    /* ====================================================================
       JOURNEY STATUS RESOLUTION
    ==================================================================== */

    function resolveJourneyStatus(
        journey
    ) {

        const safeJourney =
            isObject(
                journey
            )
                ? journey
                : {};

        const registration =
            isObject(
                safeJourney.registration
            )
                ? safeJourney.registration
                : {};

        const payment =
            isObject(
                safeJourney.payment
            )
                ? safeJourney.payment
                : {};

        const enrolment =
            isObject(
                safeJourney.enrolment
            )
                ? safeJourney.enrolment
                : {};

        const controllerStatus =
            normaliseStatus(
                safeJourney.status
            );

        const registrationStatus =
            normaliseStatus(
                registration.status ||
                registration
                    .registrationStatus
            );

        const paymentStatus =
            normaliseStatus(
                payment.status ||
                registration
                    .paymentStatus
            );

        const enrolmentStatus =
            normaliseStatus(
                enrolment.status ||
                registration
                    .enrolmentStatus ||
                registration
                    .enrollmentStatus
            );

        if (
            controllerStatus ===
                "ENROLLED" ||
            registrationStatus ===
                "ENROLLED" ||
            enrolmentStatus ===
                "ENROLLED"
        ) {

            return PAGE_STATUS
                .ENROLLED;

        }

        if (
            controllerStatus ===
                "ENROLMENT_PENDING" ||
            registrationStatus ===
                "ENROLMENT_PENDING" ||
            enrolmentStatus ===
                "PENDING"
        ) {

            return PAGE_STATUS
                .ENROLMENT_PENDING;

        }

        if (
            controllerStatus ===
                "PAYMENT_CONFIRMED" ||
            registrationStatus ===
                "PAYMENT_CONFIRMED" ||
            paymentStatus ===
                "CONFIRMED"
        ) {

            return PAGE_STATUS
                .PAYMENT_CONFIRMED;

        }

        if (
            controllerStatus ===
                "PAYMENT_IN_PROGRESS" ||
            registrationStatus ===
                "PAYMENT_PROCESSING" ||
            paymentStatus ===
                "PROCESSING"
        ) {

            return PAGE_STATUS
                .PAYMENT_IN_PROGRESS;

        }

        if (
            controllerStatus ===
                "PAYMENT_REQUIRED" ||
            registrationStatus ===
                "PENDING_PAYMENT" ||
            paymentStatus ===
                "PENDING"
        ) {

            return PAGE_STATUS
                .PAYMENT_REQUIRED;

        }

        if (
            controllerStatus ===
                "BLOCKED" ||
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

            return PAGE_STATUS
                .BLOCKED;

        }

        if (
            safeJourney.registrationExists ===
                true
        ) {

            return PAGE_STATUS
                .REGISTERED;

        }

        if (
            safeJourney.eligible ===
                true &&
            safeJourney.offerAvailable ===
                true
        ) {

            return PAGE_STATUS
                .REGISTRATION_AVAILABLE;

        }

        if (
            safeJourney.eligible !==
                true
        ) {

            return PAGE_STATUS
                .NOT_ELIGIBLE;

        }

        return PAGE_STATUS
            .READY;

    }

    /* ====================================================================
       COMPLETE JOURNEY RENDERING
    ==================================================================== */

    function renderRegistrationJourney(
        journey
    ) {

        const safeJourney =
            isObject(
                journey
            )
                ? journey
                : {};

        const journeyStatus =
            resolveJourneyStatus(
                safeJourney
            );

        setPageState({

            journey:
                safeJourney,

            eligibility:
                safeJourney
                    .eligibility ||
                null,

            offer:
                safeJourney.offer ||
                null,

            registration:
                safeJourney
                    .registration ||
                null,

            payment:
                safeJourney.payment ||
                null,

            enrolment:
                safeJourney
                    .enrolment ||
                null,

            loading:
                false,

            busy:
                false,

            error:
                null

        });

        if (
            journeyStatus ===
                PAGE_STATUS
                    .NOT_ELIGIBLE
        ) {

            showNotEligibleState(
                resolveJourneyIneligibilityReason(
                    safeJourney
                )
            );

            return;

        }

        if (
            journeyStatus ===
                PAGE_STATUS.BLOCKED
        ) {

            renderEligibleJourneyModel(
                safeJourney
            );

            showBlockedState(
                resolveBlockedMessage(
                    safeJourney
                )
            );

            return;

        }

        if (
            journeyStatus ===
                PAGE_STATUS.ENROLLED
        ) {

            showEnrolledState(
                resolveEnrolledMessage(
                    safeJourney
                )
            );

            return;

        }

        if (
            journeyStatus ===
                PAGE_STATUS
                    .ENROLMENT_PENDING
        ) {

            renderEligibleJourneyModel(
                safeJourney
            );

            showEnrolmentPendingState(
                resolveEnrolmentPendingMessage(
                    safeJourney
                )
            );

            return;

        }

        if (
            journeyStatus ===
                PAGE_STATUS
                    .PAYMENT_CONFIRMED
        ) {

            renderEligibleJourneyModel(
                safeJourney
            );

            showPaymentConfirmedState(
                resolvePaymentConfirmedMessage(
                    safeJourney
                )
            );

            return;

        }

        if (
            journeyStatus ===
                PAGE_STATUS
                    .PAYMENT_IN_PROGRESS
        ) {

            renderEligibleJourneyModel(
                safeJourney
            );

            showPaymentInProgressState(
                resolvePaymentInProgressMessage(
                    safeJourney
                )
            );

            return;

        }

        if (
            journeyStatus ===
                PAGE_STATUS
                    .PAYMENT_REQUIRED
        ) {

            renderEligibleJourneyModel(
                safeJourney
            );

            showPaymentRequiredState(
                resolvePaymentRequiredMessage(
                    safeJourney
                )
            );

            return;

        }

        if (
            journeyStatus ===
                PAGE_STATUS.REGISTERED
        ) {

            showRegisteredState(
                resolveRegisteredMessage(
                    safeJourney
                )
            );

            return;

        }

        if (
            journeyStatus ===
                PAGE_STATUS
                    .REGISTRATION_AVAILABLE
        ) {

            renderEligibleJourneyModel(
                safeJourney
            );

            showEligibleState();

            enableRegistrationInteraction();

            return;

        }

        showErrorState(

            "The Bridge Programme journey returned an unsupported state.",

            freezeObject({

                code:
                    "BRIDGE_PROGRAMME_PAGE_UNSUPPORTED_JOURNEY_STATE",

                journeyStatus,

                journey:
                    safeJourney

            })

        );

    }

    /* ====================================================================
       ELIGIBLE JOURNEY MODEL
    ==================================================================== */

    function renderEligibleJourneyModel(
        journey
    ) {

        const safeJourney =
            isObject(
                journey
            )
                ? journey
                : {};

        const eligibility =
            isObject(
                safeJourney.eligibility
            )
                ? safeJourney
                    .eligibility
                : {};

        const offer =
            isObject(
                safeJourney.offer
            )
                ? safeJourney.offer
                : {};

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

        const sourceProgrammeCode =
            normaliseProgrammeCode(

                safeJourney
                    .sourceProgrammeCode ||
                eligibility
                    .sourceProgrammeCode ||
                academicEligibility
                    .sourceProgrammeCode ||
                academicEligibility
                    .sourceProgram ||
                commercialEligibility
                    .sourceProgrammeCode ||
                pageState
                    .sourceProgrammeCode

            );

        const targetProgrammeCode =
            normaliseProgrammeCode(

                safeJourney
                    .targetProgrammeCode ||
                eligibility
                    .targetProgrammeCode ||
                academicEligibility
                    .targetProgrammeCode ||
                academicEligibility
                    .targetProgram ||
                commercialEligibility
                    .targetProgrammeCode ||
                pageState
                    .targetProgrammeCode

            );

        const sourceProgrammeName =
            resolveJourneyProgrammeName(

                sourceProgrammeCode,

                [

                    academicEligibility
                        .sourceProgrammeName,

                    academicEligibility
                        .sourceProgramName,

                    commercialEligibility
                        .currentProgram &&
                    commercialEligibility
                        .currentProgram
                        .name,

                    commercialEligibility
                        .sourceProgrammeName

                ]

            );

        const targetProgrammeName =
            resolveJourneyProgrammeName(

                targetProgrammeCode,

                [

                    academicEligibility
                        .targetProgrammeName,

                    academicEligibility
                        .targetProgramName,

                    commercialEligibility
                        .programName,

                    commercialEligibility
                        .programmeName,

                    commercialEligibility
                        .nextProgram &&
                    commercialEligibility
                        .nextProgram
                        .name,

                    commercialEligibility
                        .targetProgrammeName

                ]

            );

        setText(

            elements.offerTitle,

            resolveFirstString([

                offer.title,

                commercialEligibility
                    .bridgeProgram,

                commercialEligibility
                    .bridgeProgramme,

                academicEligibility.title,

                "Bridge Programme"

            ])

        );

        setText(

            elements.offerDescription,

            resolveFirstString([

                offer.description,

                commercialEligibility
                    .description,

                academicEligibility
                    .description,

                "Upgrade through the approved Agile AI University Bridge Programme."

            ])

        );

        setText(
            elements.eligibilityBadge,
            "Eligible"
        );

        setText(
            elements.currentProgramName,
            sourceProgrammeName
        );

        setText(

            elements.currentProgramCode,

            sourceProgrammeCode ||
            "—"

        );

        setText(
            elements.targetProgramName,
            targetProgrammeName
        );

        setText(

            elements.targetProgramCode,

            targetProgrammeCode ||
            "—"

        );

        renderCommercialInformation(
            offer,
            commercialEligibility
        );

        setPageState({

            sourceProgrammeCode,

            targetProgrammeCode,

            eligibility,

            offer

        });

    }

    /* ====================================================================
       COMMERCIAL INFORMATION RENDERING
    ==================================================================== */

    function renderCommercialInformation(
        offer,
        commercialEligibility
    ) {

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

        const currency =
            normaliseString(

                governedOffer.currency ||
                governedCommercialEligibility
                    .currency ||
                "INR"

            ).toUpperCase();

        const baseAmount =
            resolveFirstFiniteNumber([

                governedOffer
                    .baseAmount,

                governedCommercialEligibility
                    .baseAmount,

                governedCommercialEligibility
                    .baseFee

            ]);

        const gstRate =
            resolveFirstFiniteNumber([

                governedOffer.taxRate,

                governedOffer.gstRate,

                governedCommercialEligibility
                    .gstRate,

                governedCommercialEligibility
                    .taxRate

            ]);

        const gstAmount =
            resolveFirstFiniteNumber([

                governedOffer
                    .taxAmount,

                governedOffer
                    .gstAmount,

                governedCommercialEligibility
                    .gstAmount,

                governedCommercialEligibility
                    .taxAmount

            ]);

        const totalAmount =
            resolveFirstFiniteNumber([

                governedOffer
                    .totalAmount,

                governedCommercialEligibility
                    .totalPayable,

                governedCommercialEligibility
                    .totalAmount,

                governedCommercialEligibility
                    .payableAmount

            ]);

        const standardFee =
            resolveFirstFiniteNumber([

                governedOffer
                    .standardFee,

                governedCommercialEligibility
                    .standardFee

            ]);

        const fullProgrammeFee =
            resolveFirstFiniteNumber([

                governedOffer
                    .fullProgrammeFee,

                governedCommercialEligibility
                    .fullProgrammeFee

            ]);

        setText(

            elements.baseFee,

            formatCurrency(
                baseAmount,
                currency
            )

        );

        setText(

            elements.gstRate,

            formatGstRate(
                gstRate
            )

        );

        setText(

            elements.gstAmount,

            formatCurrency(
                gstAmount,
                currency
            )

        );

        setText(

            elements.totalPayable,

            formatCurrency(
                totalAmount,
                currency
            )

        );

        setText(

            elements.standardFee,

            formatCurrency(
                standardFee,
                currency
            )

        );

        setText(

            elements.fullProgrammeFee,

            formatCurrency(
                fullProgrammeFee,
                currency
            )

        );

        const offerExpiryValue =
            resolveFirstString([

                governedOffer
                    .validUntil,

                governedCommercialEligibility
                    .offerEndsOn,

                governedCommercialEligibility
                    .validUntil,

                governedCommercialEligibility
                    .expiresAt

            ]);

        renderOfferExpiry(
            offerExpiryValue
        );

        setText(

            elements.taxDisclaimer,

            resolveFirstString([

                governedOffer
                    .taxDisclaimer,

                governedCommercialEligibility
                    .taxDisclaimer,

                "Final tax and payable amount will be confirmed during secure checkout."

            ])

        );

    }

    /* ====================================================================
       OFFER EXPIRY RENDERING
    ==================================================================== */

    function renderOfferExpiry(
        offerExpiryValue
    ) {

        const formattedOfferDate =
            formatOfferDate(
                offerExpiryValue
            );

        if (
            formattedOfferDate
        ) {

            setText(

                elements.offerExpiry,

                "Offer available through " +
                formattedOfferDate +
                "."

            );

            setText(

                elements.offerExpiryBadge,

                "Available through " +
                formattedOfferDate

            );

            return;

        }

        setText(

            elements.offerExpiry,

            "Offer availability is subject to the current approved campaign."

        );

        setText(

            elements.offerExpiryBadge,

            "Limited-time offer"

        );

    }

    /* ====================================================================
       JOURNEY MESSAGE RESOLUTION
    ==================================================================== */

    function resolveJourneyIneligibilityReason(
        journey
    ) {

        const eligibility =
            isObject(
                journey &&
                journey.eligibility
            )
                ? journey.eligibility
                : {};

        return resolveFirstString([

            eligibility.reason,

            eligibility.message,

            journey &&
            journey.reason,

            "No eligible Bridge Programme pathway is currently available for your credential."

        ]);

    }

    function resolveRegisteredMessage(
        journey
    ) {

        const registration =
            isObject(
                journey &&
                journey.registration
            )
                ? journey.registration
                : {};

        return resolveFirstString([

            registration.message,

            registration
                .statusMessage,

            "Your Bridge Programme registration is already available in your enrolment workspace."

        ]);

    }

    function resolvePaymentRequiredMessage(
        journey
    ) {

        const registration =
            isObject(
                journey &&
                journey.registration
            )
                ? journey.registration
                : {};

        return resolveFirstString([

            registration
                .paymentMessage,

            registration.message,

            PAYMENT_SERVICE_UNAVAILABLE_NOTICE

        ]);

    }

    function resolvePaymentInProgressMessage(
        journey
    ) {

        const payment =
            isObject(
                journey &&
                journey.payment
            )
                ? journey.payment
                : {};

        return resolveFirstString([

            payment.message,

            payment.failureReason,

            "Your payment is currently being processed."

        ]);

    }

    function resolvePaymentConfirmedMessage(
        journey
    ) {

        const payment =
            isObject(
                journey &&
                journey.payment
            )
                ? journey.payment
                : {};

        return resolveFirstString([

            payment.message,

            "Your payment has been confirmed. Enrolment is being prepared."

        ]);

    }

    function resolveEnrolmentPendingMessage(
        journey
    ) {

        const enrolment =
            isObject(
                journey &&
                journey.enrolment
            )
                ? journey.enrolment
                : {};

        return resolveFirstString([

            enrolment.message,

            "Your registration and payment are confirmed. Enrolment is being completed."

        ]);

    }

    function resolveEnrolledMessage(
        journey
    ) {

        const enrolment =
            isObject(
                journey &&
                journey.enrolment
            )
                ? journey.enrolment
                : {};

        return resolveFirstString([

            enrolment.message,

            "Your Bridge Programme enrolment has already been confirmed."

        ]);

    }

    function resolveBlockedMessage(
        journey
    ) {

        const registration =
            isObject(
                journey &&
                journey.registration
            )
                ? journey.registration
                : {};

        const payment =
            isObject(
                journey &&
                journey.payment
            )
                ? journey.payment
                : {};

        const enrolment =
            isObject(
                journey &&
                journey.enrolment
            )
                ? journey.enrolment
                : {};

        return resolveFirstString([

            registration.message,

            payment.failureReason,

            payment.message,

            enrolment.message,

            "This Bridge Programme registration cannot currently continue."

        ]);

    }

    /* ====================================================================
       VALUE RESOLUTION HELPERS
    ==================================================================== */

    function resolveFirstString(
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

    function resolveFirstFiniteNumber(
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

            const value =
                values[index];

            if (
                value ===
                    null ||
                value ===
                    undefined ||
                value ===
                    ""
            ) {

                continue;

            }

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

        }

        return null;

    }

    function resolveJourneyProgrammeName(
        programmeCode,
        candidateNames
    ) {

        const resolvedName =
            resolveFirstString(
                candidateNames
            );

        if (
            isNonEmptyString(
                resolvedName
            )
        ) {

            return resolvedName;

        }

        return resolveProgrammeName(
            programmeCode
        );

    }

    /* ====================================================================
       CURRENCY FORMATTING
    ==================================================================== */

    function formatCurrency(
        value,
        currency
    ) {

        if (
            value ===
                null ||
            value ===
                undefined ||
            value ===
                ""
        ) {

            return "—";

        }

        const amount =
            Number(
                value
            );

        if (
            !Number.isFinite(
                amount
            )
        ) {

            return "—";

        }

        const governedCurrency =
            normaliseString(
                currency
            ).toUpperCase() ||
            "INR";

        try {

            return new Intl.NumberFormat(

                "en-IN",

                {

                    style:
                        "currency",

                    currency:
                        governedCurrency,

                    minimumFractionDigits:
                        0,

                    maximumFractionDigits:
                        2

                }

            ).format(
                amount
            );

        }
        catch (error) {

            console.warn(

                `[${PAGE_CONTROLLER_NAME}] Currency formatting failed.`,

                error

            );

            if (
                governedCurrency ===
                    "INR"
            ) {

                return "₹" +
                    amount.toLocaleString(
                        "en-IN"
                    );

            }

            return governedCurrency +
                " " +
                amount.toLocaleString(
                    "en-IN"
                );

        }

    }

    function formatGstRate(
        value
    ) {

        if (
            value ===
                null ||
            value ===
                undefined ||
            value ===
                ""
        ) {

            return "—";

        }

        const rate =
            Number(
                value
            );

        if (
            !Number.isFinite(
                rate
            )
        ) {

            return "—";

        }

        return "(" +
            rate +
            "%)";

    }

    /* ====================================================================
       OFFER DATE FORMATTING
    ==================================================================== */

    function formatOfferDate(
        value
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

            return null;

        }

        let date =
            null;

        if (
            /^\d{4}-\d{2}-\d{2}$/.test(
                governedValue
            )
        ) {

            const parts =
                governedValue.split(
                    "-"
                );

            date =
                new Date(

                    Date.UTC(

                        Number(
                            parts[0]
                        ),

                        Number(
                            parts[1]
                        ) -
                        1,

                        Number(
                            parts[2]
                        )

                    )

                );

        }
        else {

            const parsedTimestamp =
                Date.parse(
                    governedValue
                );

            if (
                Number.isFinite(
                    parsedTimestamp
                )
            ) {

                date =
                    new Date(
                        parsedTimestamp
                    );

            }

        }

        if (
            !date ||
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null;

        }

        try {

            return new Intl.DateTimeFormat(

                "en-IN",

                {

                    day:
                        "numeric",

                    month:
                        "long",

                    year:
                        "numeric",

                    timeZone:
                        "UTC"

                }

            ).format(
                date
            );

        }
        catch (error) {

            return null;

        }

    }

    /* ====================================================================
       END OF BLOCK 4 OF 6

       Do not close the IIFE here.
       Block 5 must continue immediately below this section.
    ==================================================================== */

        /* ====================================================================
       BLOCK 5 OF 6
       REGISTRATION INTERACTION AND JOURNEY CONTROLLER EVENTS
    ==================================================================== */

    /* ====================================================================
       REGISTRATION ACTION READINESS
    ==================================================================== */

    function canCreateRegistration() {

        return Boolean(

            pageState.initialised ===
                true &&

            pageState.busy !==
                true &&

            pageState.loading !==
                true &&

            pageState.status ===
                PAGE_STATUS
                    .REGISTRATION_AVAILABLE &&

            pageState.acknowledgementAccepted ===
                true &&

            pageState.registrationActionAvailable ===
                true &&

            pageState.journey &&

            pageState.journey.eligible ===
                true &&

            pageState.journey.offerAvailable ===
                true &&

            pageState.journey.registrationExists !==
                true

        );

    }

    function updateRegistrationActionReadiness() {

        const acknowledgementAccepted =
            Boolean(

                elements
                    .termsConfirmation &&
                elements
                    .termsConfirmation
                    .checked ===
                    true

            );

        const journey =
            isObject(
                pageState.journey
            )
                ? pageState.journey
                : {};

        const registrationAvailable =
            Boolean(

                pageState.status ===
                    PAGE_STATUS
                        .REGISTRATION_AVAILABLE &&

                journey.eligible ===
                    true &&

                journey.offerAvailable ===
                    true &&

                journey.registrationExists !==
                    true &&

                pageState.busy !==
                    true

            );

        const registrationActionAvailable =
            Boolean(

                registrationAvailable &&
                acknowledgementAccepted

            );

        setPageState({

            acknowledgementAccepted,

            registrationActionAvailable

        });

        setDisabled(

            elements.registerButton,

            !registrationActionAvailable

        );

        setText(

            elements.registerButton,

            DEFAULT_REGISTRATION_LABEL

        );

        if (
            registrationActionAvailable
        ) {

            setText(

                elements.registrationNotice,

                "Your confirmation is recorded. Select Register for Bridge Programme to continue."

            );

            return;

        }

        if (
            registrationAvailable
        ) {

            setText(

                elements.registrationNotice,

                ACKNOWLEDGEMENT_REQUIRED_NOTICE

            );

            return;

        }

        setText(

            elements.registrationNotice,

            DEFAULT_REGISTRATION_NOTICE

        );

    }

    /* ====================================================================
       ACKNOWLEDGEMENT CHANGE
    ==================================================================== */

    function handleTermsConfirmationChange() {

        if (
            pageState.busy ||
            pageState.loading
        ) {

            if (
                elements
                    .termsConfirmation
            ) {

                elements
                    .termsConfirmation
                    .checked =
                    pageState
                        .acknowledgementAccepted ===
                    true;

            }

            return;

        }

        updateRegistrationActionReadiness();

        if (
            pageState
                .acknowledgementAccepted ===
            true
        ) {

            announce(
                "Registration confirmation accepted. The registration button is now available."
            );

        }
        else {

            announce(
                "Registration confirmation removed. Confirm the information to continue."
            );

        }

    }

    /* ====================================================================
       REGISTRATION CREATION INPUT
    ==================================================================== */

    function buildRegistrationActionInput() {

        const pageContext =
            resolvePageContext();

        const journey =
            isObject(
                pageState.journey
            )
                ? pageState.journey
                : {};

        const eligibility =
            isObject(
                pageState.eligibility
            )
                ? pageState.eligibility
                : (
                    isObject(
                        journey.eligibility
                    )
                        ? journey.eligibility
                        : null
                );

        const offer =
            isObject(
                pageState.offer
            )
                ? pageState.offer
                : (
                    isObject(
                        journey.offer
                    )
                        ? journey.offer
                        : null
                );

        return freezeObject({

            sourceProgrammeCode:
                normaliseProgrammeCode(

                    pageState
                        .sourceProgrammeCode ||
                    journey
                        .sourceProgrammeCode ||
                    pageContext
                        .sourceProgrammeCode

                ),

            targetProgrammeCode:
                normaliseProgrammeCode(

                    pageState
                        .targetProgrammeCode ||
                    journey
                        .targetProgrammeCode ||
                    pageContext
                        .targetProgrammeCode

                ),

            createIfMissing:
                true,

            acknowledgementAccepted:
                true,

            acknowledgementAcceptedAt:
                nowIsoString(),

            eligibility,

            offer,

            forceEligibility:
                false,

            forceOffer:
                false,

            forceRegistrationResolution:
                true,

            initiatePayment:
                false,

            resolvePaymentStatus:
                false,

            resolveEnrolmentAfterPayment:
                false,

            source:
                "STUDENT_PORTAL"

        });

    }

    /* ====================================================================
       REGISTRATION ACTION
    ==================================================================== */

    async function handleRegistrationAction(
        event
    ) {

        if (
            event &&
            typeof event.preventDefault ===
                "function"
        ) {

            event.preventDefault();

        }

        if (
            registrationActionPromise
        ) {

            return registrationActionPromise;

        }

        if (
            !canCreateRegistration()
        ) {

            updateRegistrationActionReadiness();

            announce(
                "Please review and confirm the Bridge Programme information before registering."
            );

            return null;

        }

        registrationActionPromise =
            (
                async function performRegistrationAction() {

                    showRegistrationInProgressState();

                    dispatchPageEvent(

                        PAGE_EVENT
                            .REGISTRATION_STARTED,

                        {

                            state:
                                pageState

                        }

                    );

                    try {

                        const controller =
                            getRequiredJourneyController();

                        const input =
                            buildRegistrationActionInput();

                        const result =
                            await controller
                                .resolveRegistrationJourney(
                                    input
                                );

                        const journey =
                            normaliseJourneyResult(
                                result,
                                input
                            );

                        setPageState({

                            journey,

                            eligibility:
                                journey.eligibility,

                            offer:
                                journey.offer,

                            registration:
                                journey.registration,

                            payment:
                                journey.payment,

                            enrolment:
                                journey.enrolment,

                            acknowledgementAccepted:
                                true,

                            registrationActionAvailable:
                                false,

                            busy:
                                false,

                            loading:
                                false,

                            error:
                                null

                        });

                        renderRegistrationJourney(
                            journey
                        );

                        dispatchPageEvent(

                            PAGE_EVENT
                                .REGISTRATION_COMPLETED,

                            {

                                journey,

                                registration:
                                    journey.registration,

                                created:
                                    journey.created ===
                                    true,

                                restored:
                                    journey.restored ===
                                    true,

                                existing:
                                    journey.existing ===
                                    true,

                                idempotent:
                                    journey.idempotent ===
                                    true,

                                state:
                                    pageState

                            }

                        );

                        announce(

                            journey.created ===
                                true
                                ? "Your Bridge Programme registration has been created successfully."
                                : "Your existing Bridge Programme registration has been restored."

                        );

                        return journey;

                    }
                    catch (error) {

                        console.error(

                            `[${PAGE_CONTROLLER_NAME}] Registration action failed.`,

                            error

                        );

                        /*
                         * Restore the eligible workspace whenever the
                         * controller still reports a valid offer.
                         */

                        const controller =
                            getJourneyController();

                        const controllerState =
                            controller &&
                            typeof controller
                                .getState ===
                                "function"
                                ? controller
                                    .getState()
                                : null;

                        const fallbackJourney =
                            normaliseJourneyResult(

                                {

                                    eligible:
                                        Boolean(
                                            controllerState &&
                                            controllerState
                                                .eligibility &&
                                            controllerState
                                                .eligibility
                                                .eligible ===
                                                true
                                        ),

                                    offerAvailable:
                                        Boolean(
                                            controllerState &&
                                            controllerState.offer &&
                                            controllerState
                                                .offer
                                                .offerAvailable ===
                                                true
                                        ),

                                    registrationExists:
                                        Boolean(
                                            controllerState &&
                                            controllerState
                                                .registration &&
                                            controllerState
                                                .registration
                                                .registrationExists ===
                                                true
                                        ),

                                    eligibility:
                                        controllerState
                                            ? controllerState
                                                .eligibility
                                            : pageState
                                                .eligibility,

                                    offer:
                                        controllerState
                                            ? controllerState
                                                .offer
                                            : pageState.offer,

                                    registration:
                                        controllerState
                                            ? controllerState
                                                .registration
                                            : pageState
                                                .registration,

                                    payment:
                                        controllerState
                                            ? controllerState
                                                .payment
                                            : pageState.payment,

                                    enrolment:
                                        controllerState
                                            ? controllerState
                                                .enrolment
                                            : pageState
                                                .enrolment,

                                    status:
                                        controllerState
                                            ? controllerState.status
                                            : "ERROR",

                                    state:
                                        controllerState ||
                                        {}

                                },

                                buildRegistrationActionInput()

                            );

                        if (
                            fallbackJourney.eligible ===
                                true &&
                            fallbackJourney.offerAvailable ===
                                true &&
                            fallbackJourney.registrationExists !==
                                true
                        ) {

                            setPageState({

                                journey:
                                    fallbackJourney,

                                eligibility:
                                    fallbackJourney
                                        .eligibility,

                                offer:
                                    fallbackJourney.offer,

                                registration:
                                    null,

                                payment:
                                    fallbackJourney.payment,

                                enrolment:
                                    fallbackJourney.enrolment,

                                status:
                                    PAGE_STATUS
                                        .REGISTRATION_AVAILABLE,

                                busy:
                                    false,

                                loading:
                                    false,

                                acknowledgementAccepted:
                                    false,

                                registrationActionAvailable:
                                    false,

                                error

                            });

                            renderEligibleJourneyModel(
                                fallbackJourney
                            );

                            showEligibleState();

                            enableRegistrationInteraction();

                            setText(

                                elements
                                    .registrationNotice,

                                resolveRegistrationErrorMessage(
                                    error
                                )

                            );

                            announce(
                                "Your registration could not be completed. Please review the message and try again."
                            );

                        }
                        else {

                            showErrorState(

                                resolveRegistrationErrorMessage(
                                    error
                                ),

                                error

                            );

                        }

                        throw error;

                    }

                }
            )();

        try {

            return await registrationActionPromise;

        }
        finally {

            registrationActionPromise =
                null;

        }

    }

    /* ====================================================================
       REGISTRATION ERROR MESSAGE RESOLUTION
    ==================================================================== */

    function resolveRegistrationErrorMessage(
        error
    ) {

        const errorCode =
            normaliseStatus(
                error &&
                error.code
            );

        const errorMessage =
            normaliseString(
                error &&
                error.message
            );

        if (
            errorMessage
                .toLowerCase()
                .includes(
                    "acknowledgement"
                )
        ) {

            return "Please confirm that you reviewed the Bridge Programme pathway, fee and tax information before continuing.";

        }

        if (
            errorCode.includes(
                "REGISTRATION_CREATION_FAILED"
            )
        ) {

            if (
                errorMessage
            ) {

                return errorMessage;

            }

            return "Your Bridge Programme registration could not be created. Please try again.";

        }

        if (
            errorCode.includes(
                "REGISTRATION_RESOLUTION_FAILED"
            )
        ) {

            return "We could not confirm whether an existing registration is available. Please retry.";

        }

        if (
            errorCode.includes(
                "DEPENDENCY_UNAVAILABLE"
            )
        ) {

            return "The registration service is temporarily unavailable. Please refresh the page and retry.";

        }

        if (
            errorCode.includes(
                "AUTH_REQUIRED"
            )
        ) {

            return "Your authenticated learner session is unavailable. Please sign in again before registering.";

        }

        return "Your Bridge Programme registration could not be completed. Please retry.";

    }

    /* ====================================================================
       JOURNEY CONTROLLER EVENT DETAIL
    ==================================================================== */

    function resolveControllerEventState(
        event
    ) {

        const detail =
            event &&
            isObject(
                event.detail
            )
                ? event.detail
                : {};

        return isObject(
            detail.state
        )
            ? detail.state
            : null;

    }

    function buildJourneyFromControllerState(
        controllerState
    ) {

        const safeControllerState =
            isObject(
                controllerState
            )
                ? controllerState
                : {};

        const registration =
            isObject(
                safeControllerState
                    .registration
            )
                ? safeControllerState
                    .registration
                : null;

        return normaliseJourneyResult(

            {

                eligible:
                    Boolean(
                        safeControllerState
                            .eligibility &&
                        safeControllerState
                            .eligibility
                            .eligible ===
                            true
                    ),

                offerAvailable:
                    Boolean(
                        safeControllerState.offer &&
                        safeControllerState
                            .offer
                            .offerAvailable ===
                            true
                    ),

                registrationExists:
                    Boolean(
                        registration &&
                        registration
                            .registrationExists ===
                            true
                    ),

                eligibility:
                    safeControllerState
                        .eligibility,

                offer:
                    safeControllerState.offer,

                registration,

                payment:
                    safeControllerState.payment,

                enrolment:
                    safeControllerState
                        .enrolment,

                status:
                    safeControllerState.status,

                state:
                    safeControllerState

            },

            {

                sourceProgrammeCode:
                    safeControllerState
                        .sourceProgrammeCode ||
                    pageState
                        .sourceProgrammeCode,

                targetProgrammeCode:
                    safeControllerState
                        .targetProgrammeCode ||
                    pageState
                        .targetProgrammeCode

            }

        );

    }

    /* ====================================================================
       CONTROLLER STATE-CHANGED EVENT
    ==================================================================== */

    function handleJourneyControllerStateChanged(
        event
    ) {

        const controllerState =
            resolveControllerEventState(
                event
            );

        if (
            !controllerState
        ) {

            return;

        }

        const controllerStatus =
            normaliseStatus(
                controllerState.status
            );

        if (
            controllerStatus ===
                "RESOLVING_IDENTITY" ||
            controllerStatus ===
                "RESOLVING_ELIGIBILITY" ||
            controllerStatus ===
                "RESOLVING_OFFER" ||
            controllerStatus ===
                "RESOLVING_REGISTRATION"
        ) {

            if (
                !pageState.busy
            ) {

                showLoadingState(
                    "Checking your Bridge Programme registration details."
                );

            }

            return;

        }

        if (
            controllerStatus ===
                "CREATING_REGISTRATION"
        ) {

            showRegistrationInProgressState();

            return;

        }

        if (
            controllerStatus ===
                "PAYMENT_IN_PROGRESS"
        ) {

            const journey =
                buildJourneyFromControllerState(
                    controllerState
                );

            renderEligibleJourneyModel(
                journey
            );

            showPaymentInProgressState();

            return;

        }

        if (
            controllerStatus ===
                "ENROLMENT_PENDING"
        ) {

            const journey =
                buildJourneyFromControllerState(
                    controllerState
                );

            renderEligibleJourneyModel(
                journey
            );

            showEnrolmentPendingState();

        }

    }

    /* ====================================================================
       REGISTRATION CREATED EVENT
    ==================================================================== */

    function handleJourneyControllerRegistrationCreated(
        event
    ) {

        const detail =
            event &&
            isObject(
                event.detail
            )
                ? event.detail
                : {};

        const controllerState =
            isObject(
                detail.state
            )
                ? detail.state
                : null;

        if (
            !controllerState
        ) {

            return;

        }

        const journey =
            buildJourneyFromControllerState(
                controllerState
            );

        setPageState({

            journey,

            eligibility:
                journey.eligibility,

            offer:
                journey.offer,

            registration:
                journey.registration,

            payment:
                journey.payment,

            enrolment:
                journey.enrolment,

            acknowledgementAccepted:
                true,

            registrationActionAvailable:
                false,

            busy:
                false,

            error:
                null

        });

        renderRegistrationJourney(
            journey
        );

    }

    /* ====================================================================
       REGISTRATION RESOLVED EVENT
    ==================================================================== */

    function handleJourneyControllerRegistrationResolved(
        event
    ) {

        const detail =
            event &&
            isObject(
                event.detail
            )
                ? event.detail
                : {};

        const controllerState =
            isObject(
                detail.state
            )
                ? detail.state
                : null;

        if (
            !controllerState ||
            pageState.busy
        ) {

            return;

        }

        const journey =
            buildJourneyFromControllerState(
                controllerState
            );

        setPageState({

            journey,

            eligibility:
                journey.eligibility,

            offer:
                journey.offer,

            registration:
                journey.registration,

            payment:
                journey.payment,

            enrolment:
                journey.enrolment,

            busy:
                false,

            error:
                null

        });

        renderRegistrationJourney(
            journey
        );

    }

    /* ====================================================================
       PAYMENT REQUIRED EVENT
    ==================================================================== */

    function handleJourneyControllerPaymentRequired(
        event
    ) {

        const controllerState =
            resolveControllerEventState(
                event
            );

        if (
            !controllerState
        ) {

            return;

        }

        const journey =
            buildJourneyFromControllerState(
                controllerState
            );

        renderEligibleJourneyModel(
            journey
        );

        setPageState({

            journey,

            registration:
                journey.registration,

            payment:
                journey.payment,

            status:
                PAGE_STATUS
                    .PAYMENT_REQUIRED,

            busy:
                false,

            paymentActionAvailable:
                false,

            error:
                null

        });

        showPaymentRequiredState();

    }

    /* ====================================================================
       PAYMENT CONFIRMED EVENT
    ==================================================================== */

    function handleJourneyControllerPaymentConfirmed(
        event
    ) {

        const controllerState =
            resolveControllerEventState(
                event
            );

        if (
            !controllerState
        ) {

            return;

        }

        const journey =
            buildJourneyFromControllerState(
                controllerState
            );

        renderEligibleJourneyModel(
            journey
        );

        setPageState({

            journey,

            registration:
                journey.registration,

            payment:
                journey.payment,

            status:
                PAGE_STATUS
                    .PAYMENT_CONFIRMED,

            busy:
                false,

            error:
                null

        });

        showPaymentConfirmedState();

    }

    /* ====================================================================
       ENROLMENT RESOLVED EVENT
    ==================================================================== */

    function handleJourneyControllerEnrolmentResolved(
        event
    ) {

        const controllerState =
            resolveControllerEventState(
                event
            );

        if (
            !controllerState
        ) {

            return;

        }

        const journey =
            buildJourneyFromControllerState(
                controllerState
            );

        setPageState({

            journey,

            registration:
                journey.registration,

            payment:
                journey.payment,

            enrolment:
                journey.enrolment,

            busy:
                false,

            error:
                null

        });

        renderRegistrationJourney(
            journey
        );

    }

    /* ====================================================================
       JOURNEY CONTROLLER ERROR EVENT
    ==================================================================== */

    function handleJourneyControllerError(
        event
    ) {

        const detail =
            event &&
            isObject(
                event.detail
            )
                ? event.detail
                : {};

        const error =
            detail.error ||
            null;

        if (
            registrationActionPromise
        ) {

            /*
             * The registration-action catch block owns the visual
             * recovery while that action is active.
             */

            return;

        }

        showErrorState(

            resolvePageErrorMessage(
                error
            ),

            error

        );

    }

    /* ====================================================================
       END OF BLOCK 5 OF 6

       Do not close the IIFE here.
       Block 6 must continue immediately below this section.
    ==================================================================== */

        /* ====================================================================
       BLOCK 6 OF 6
       DIAGNOSTICS, PUBLIC API AND BOOTSTRAP
    ==================================================================== */

    /* ====================================================================
       PAGE CONTROLLER READINESS
    ==================================================================== */

    function getPageControllerReadiness() {

        const journeyControllerReadiness =
            resolveJourneyControllerReadiness();

        const pageContext =
            resolvePageContext();

        const requiredElementsAvailable =
            Boolean(

                elements.portalApp &&
                elements.loadingState &&
                elements.errorState &&
                elements.notEligibleState &&
                elements.registeredState &&
                elements.enrolledState &&
                elements.eligibleState &&
                elements.termsConfirmation &&
                elements.registerButton

            );

        const programmeContextAvailable =
            Boolean(

                isNonEmptyString(
                    pageContext
                        .sourceProgrammeCode
                ) &&

                isNonEmptyString(
                    pageContext
                        .targetProgrammeCode
                ) &&

                pageContext
                    .sourceProgrammeCode !==
                pageContext
                    .targetProgrammeCode

            );

        return freezeObject({

            ready:
                requiredElementsAvailable &&
                programmeContextAvailable &&
                journeyControllerReadiness
                    .available &&
                journeyControllerReadiness
                    .foundationReady,

            pageElementsReady:
                requiredElementsAvailable,

            programmeContextReady:
                programmeContextAvailable,

            journeyControllerAvailable:
                journeyControllerReadiness
                    .available,

            journeyControllerFoundationReady:
                journeyControllerReadiness
                    .foundationReady,

            programmeResolutionReady:
                journeyControllerReadiness
                    .programmeResolutionReady,

            paymentResolutionReady:
                journeyControllerReadiness
                    .paymentResolutionReady,

            enrolmentResolutionReady:
                journeyControllerReadiness
                    .enrolmentResolutionReady,

            authenticated:
                journeyControllerReadiness
                    .authenticated,

            sourceProgrammeCode:
                pageContext
                    .sourceProgrammeCode,

            targetProgrammeCode:
                pageContext
                    .targetProgrammeCode,

            initialised:
                pageState.initialised ===
                true,

            loading:
                pageState.loading ===
                true,

            busy:
                pageState.busy ===
                true,

            status:
                pageState.status,

            pageControllerName:
                PAGE_CONTROLLER_NAME,

            pageControllerVersion:
                PAGE_CONTROLLER_VERSION,

            journeyControllerVersion:
                journeyControllerReadiness
                    .controllerVersion

        });

    }

    /* ====================================================================
       REGISTRATION ACTION READINESS
    ==================================================================== */

    function getRegistrationActionReadiness() {

        const journey =
            isObject(
                pageState.journey
            )
                ? pageState.journey
                : {};

        return freezeObject({

            eligible:
                journey.eligible ===
                true,

            offerAvailable:
                journey.offerAvailable ===
                true,

            registrationExists:
                journey.registrationExists ===
                true,

            acknowledgementAccepted:
                pageState
                    .acknowledgementAccepted ===
                true,

            pageBusy:
                pageState.busy ===
                true,

            pageLoading:
                pageState.loading ===
                true,

            registrationActionAvailable:
                pageState
                    .registrationActionAvailable ===
                true,

            canCreateRegistration:
                canCreateRegistration(),

            registrationInProgress:
                Boolean(
                    registrationActionPromise
                )

        });

    }

    /* ====================================================================
       PAYMENT AND ENROLMENT READINESS
    ==================================================================== */

    function getPaymentAndEnrolmentReadiness() {

        const controller =
            getJourneyController();

        if (
            !controller ||
            typeof controller
                .getPaymentAndEnrolmentReadiness !==
                "function"
        ) {

            return freezeObject({

                available:
                    false,

                paymentServiceAvailable:
                    false,

                enrolmentServiceAvailable:
                    false,

                readyForPayment:
                    false,

                readyForPaymentStatusResolution:
                    false,

                readyForEnrolmentResolution:
                    false

            });

        }

        try {

            const readiness =
                controller
                    .getPaymentAndEnrolmentReadiness();

            return freezeObject({

                available:
                    true,

                ...(
                    isObject(
                        readiness
                    )
                        ? readiness
                        : {}
                )

            });

        }
        catch (error) {

            return freezeObject({

                available:
                    true,

                paymentServiceAvailable:
                    false,

                enrolmentServiceAvailable:
                    false,

                readyForPayment:
                    false,

                readyForPaymentStatusResolution:
                    false,

                readyForEnrolmentResolution:
                    false,

                error

            });

        }

    }

    /* ====================================================================
       PAGE DIAGNOSTICS
    ==================================================================== */

    function getDiagnostics() {

        const controller =
            getJourneyController();

        let journeyControllerDiagnostics =
            null;

        if (
            controller &&
            typeof controller
                .getDiagnostics ===
                "function"
        ) {

            try {

                journeyControllerDiagnostics =
                    controller
                        .getDiagnostics();

            }
            catch (error) {

                journeyControllerDiagnostics =
                    freezeObject({

                        error

                    });

            }

        }

        return freezeObject({

            pageControllerName:
                PAGE_CONTROLLER_NAME,

            pageControllerVersion:
                PAGE_CONTROLLER_VERSION,

            timestamp:
                nowIsoString(),

            readiness:
                getPageControllerReadiness(),

            registrationAction:
                getRegistrationActionReadiness(),

            paymentAndEnrolment:
                getPaymentAndEnrolmentReadiness(),

            operations:
                freezeObject({

                    pageInitialisationInProgress:
                        Boolean(
                            pageInitialisationPromise
                        ),

                    registrationActionInProgress:
                        Boolean(
                            registrationActionPromise
                        )

                }),

            elements:
                freezeObject({

                    portalApp:
                        Boolean(
                            elements.portalApp
                        ),

                    mainContent:
                        Boolean(
                            elements.mainContent
                        ),

                    loadingState:
                        Boolean(
                            elements.loadingState
                        ),

                    errorState:
                        Boolean(
                            elements.errorState
                        ),

                    notEligibleState:
                        Boolean(
                            elements.notEligibleState
                        ),

                    registeredState:
                        Boolean(
                            elements.registeredState
                        ),

                    enrolledState:
                        Boolean(
                            elements.enrolledState
                        ),

                    eligibleState:
                        Boolean(
                            elements.eligibleState
                        ),

                    termsConfirmation:
                        Boolean(
                            elements
                                .termsConfirmation
                        ),

                    registerButton:
                        Boolean(
                            elements
                                .registerButton
                        )

                }),

            pageState,

            journeyController:
                journeyControllerDiagnostics

        });

    }

    /* ====================================================================
       SAFE PAGE RELOAD
    ==================================================================== */

    async function reloadPageJourney(
        options
    ) {

        const safeOptions =
            isObject(
                options
            )
                ? options
                : {};

        if (
            pageState.busy ||
            pageState.loading
        ) {

            return pageState.journey;

        }

        return refreshRegistrationJourney({

            ...safeOptions,

            forceIdentity:
                safeOptions
                    .forceIdentity ===
                true,

            forceEligibility:
                safeOptions
                    .forceEligibility !==
                false,

            forceOffer:
                safeOptions
                    .forceOffer !==
                false

        });

    }

    /* ====================================================================
       SAFE PAGE RESET
    ==================================================================== */

    function resetPageController() {

        resetPageState();

        hideAllStates();

        resetInteractiveControls();

        setHidden(
            elements.loadingState,
            false
        );

        announce(
            "Bridge Programme registration page has been reset."
        );

        return pageState;

    }

    /* ====================================================================
       PUBLIC PAGE API
    ==================================================================== */

    const BridgeProgrammeRegistrationController =
        freezeObject({

            PAGE_CONTROLLER_NAME,

            PAGE_CONTROLLER_VERSION,

            PAGE_STATUS,

            PAGE_EVENT,

            initialise:
                initialisePage,

            reload:
                reloadPageJourney,

            refresh:
                refreshRegistrationJourney,

            register:
                function registerFromPublicApi(
                    options
                ) {

                    const safeOptions =
                        isObject(
                            options
                        )
                            ? options
                            : {};

                    if (
                        safeOptions
                            .acknowledgementAccepted ===
                        true &&
                        elements
                            .termsConfirmation
                    ) {

                        elements
                            .termsConfirmation
                            .checked =
                            true;

                        updateRegistrationActionReadiness();

                    }

                    return handleRegistrationAction(
                        null
                    );

                },

            getState:
                getPageState,

            getReadiness:
                getPageControllerReadiness,

            getRegistrationActionReadiness,

            getPaymentAndEnrolmentReadiness,

            getDiagnostics,

            reset:
                resetPageController,

            resolvePageContext,

            renderJourney:
                function renderJourneyFromPublicApi(
                    journey
                ) {

                    const input =
                        buildPageInitialisationInput(
                            {}
                        );

                    const normalisedJourney =
                        normaliseJourneyResult(
                            journey,
                            input
                        );

                    setPageState({

                        journey:
                            normalisedJourney,

                        eligibility:
                            normalisedJourney
                                .eligibility,

                        offer:
                            normalisedJourney
                                .offer,

                        registration:
                            normalisedJourney
                                .registration,

                        payment:
                            normalisedJourney
                                .payment,

                        enrolment:
                            normalisedJourney
                                .enrolment,

                        sourceProgrammeCode:
                            normalisedJourney
                                .sourceProgrammeCode,

                        targetProgrammeCode:
                            normalisedJourney
                                .targetProgrammeCode,

                        loading:
                            false,

                        busy:
                            false,

                        error:
                            null

                    });

                    renderRegistrationJourney(
                        normalisedJourney
                    );

                    return normalisedJourney;

                }

        });

    /* ====================================================================
       GLOBAL REGISTRATION
    ==================================================================== */

    if (
        window
            .BridgeProgrammeRegistrationController &&
        window
            .BridgeProgrammeRegistrationController !==
            BridgeProgrammeRegistrationController
    ) {

        console.warn(

            `[${PAGE_CONTROLLER_NAME}] An existing global page-controller registration was replaced.`

        );

    }

    window
        .BridgeProgrammeRegistrationController =
        BridgeProgrammeRegistrationController;

    /* ====================================================================
       BOOTSTRAP
    ==================================================================== */

    async function bootstrapPageController() {

        try {

            await initialisePage({

                waitForAuth:
                    true,

                force:
                    false,

                forceIdentity:
                    false,

                forceEligibility:
                    false,

                forceOffer:
                    false,

                forceRegistrationResolution:
                    false,

                resolvePaymentStatus:
                    false,

                resolveEnrolmentAfterPayment:
                    false,

                source:
                    "STUDENT_PORTAL"

            });

        }
        catch (error) {

            /*
             * initialisePage() already renders the governed error state.
             * The bootstrap catch prevents an unhandled promise rejection.
             */

            console.error(

                `[${PAGE_CONTROLLER_NAME}] Bootstrap failed.`,

                error

            );

        }

    }

    if (
        document.readyState ===
            "loading"
    ) {

        document.addEventListener(

            "DOMContentLoaded",

            bootstrapPageController,

            {

                once:
                    true

            }

        );

    }
    else {

        bootstrapPageController();

    }

    console.info(

        `[${PAGE_CONTROLLER_NAME}] v${PAGE_CONTROLLER_VERSION} loaded successfully.`

    );

    /* ====================================================================
       END OF BLOCK 6 OF 6
    ==================================================================== */

})(
    window,
    document
);