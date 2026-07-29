/**
 * ========================================================================
 * Agile AI University
 * Bridge Programme Registration Controller
 * ------------------------------------------------------------------------
 * File:
 * public-portal/assets/js/programmes/bridge-programme-registration.js
 *
 * Version        : 1.0.0
 * Status         : ACTIVE
 * Phase          : Revenue Sprint
 * Owner          : Agile AI University
 *
 * Description
 * ------------------------------------------------------------------------
 * Page controller for the Bridge Programme Registration workspace.
 *
 * Responsibilities
 * ------------------------------------------------------------------------
 * • Wait for portal credential availability
 * • Resolve the governed upgrade model
 * • Validate the academic Bridge Programme relationship
 * • Render eligibility, pathway and commercial information
 * • Control loading, eligible, ineligible and error states
 * • Keep registration and payment actions disabled until the
 *   governed write workflow is implemented
 *
 * This controller does NOT:
 *
 * • Create registrations
 * • Create enrolments
 * • Initiate payments
 * • Write to Firestore
 * • Resolve authentication
 * • Resolve authorization
 * • Determine commercial pricing rules
 * • Determine academic Bridge Programme rules
 *
 * Governance
 * ------------------------------------------------------------------------
 * • EligibilityService is authoritative for commercial eligibility,
 *   pricing, GST and offer expiry.
 * • BridgeProgramService is authoritative for academic bridge
 *   relationship validation.
 * • CredentialService is the primary credential source.
 * • The page controller renders service-produced models only.
 * • Registration actions remain disabled until a governed
 *   RegistrationService is connected.
 *
 * Change History
 * ------------------------------------------------------------------------
 * v1.0.0
 *
 * • Added governed Bridge Programme page orchestration.
 * • Added resilient credential readiness handling.
 * • Added eligibility and academic relationship validation.
 * • Added INR commercial formatting using the en-IN locale.
 * • Added accessible page-state announcements.
 * • Added retry handling.
 * • Preserved registration and payment safety boundaries.
 *
 * ========================================================================
 */

(function (window, document) {

    "use strict";

    console.log(
        "[BridgeProgrammeRegistration] Loaded v1.0.0"
    );

    /* ====================================================================
       CONFIGURATION
    ==================================================================== */

    const CONTROLLER_VERSION =
        "1.0.0";

    const CREDENTIAL_WAIT_TIMEOUT_MS =
        12000;

    const CREDENTIAL_WAIT_INTERVAL_MS =
        250;

    const DEFAULT_REGISTRATION_LABEL =
        "Registration Coming Soon";

    const DEFAULT_REGISTRATION_NOTICE =
        "Registration activation will be enabled after the registration service and secure payment workflow are connected.";

    const PROGRAM_NAMES = Object.freeze({

        AOP:
            "Agile Outcome Practitioner",

        AAIA:
            "Agile AI Associate",

        AIPA:
            "Artificial Intelligence Professional Agilist",

        AAIP:
            "Agentic AI Professional",

        AIAL:
            "Agile AI Leadership"

    });

    const BRIDGE_RELATIONSHIPS = Object.freeze({

        bridgePrograms: Object.freeze([

            Object.freeze({

                id:
                    "AOP_TO_AIPA",

                source:
                    "AOP",

                target:
                    "AIPA",

                relationship:
                    "CAPABILITY_UPGRADE",

                title:
                    "AIPA Capability Upgrade",

                description:
                    "Progress from the Agile Outcome Practitioner credential to the Artificial Intelligence Professional Agilist programme through the approved Bridge Programme.",

                cta:
                    "Register for AIPA Bridge",

                registrationUrl:
                    "/programmes/bridge-programme-registration.html",

                status:
                    "ACTIVE",

                active:
                    true

            }),

            Object.freeze({

                id:
                    "AAIA_TO_AIPA",

                source:
                    "AAIA",

                target:
                    "AIPA",

                relationship:
                    "CAPABILITY_UPGRADE",

                title:
                    "AIPA Capability Upgrade",

                description:
                    "Progress from the Agile AI Associate credential to the Artificial Intelligence Professional Agilist programme through the approved Bridge Programme.",

                cta:
                    "Register for AIPA Bridge",

                registrationUrl:
                    "/programmes/bridge-programme-registration.html",

                status:
                    "ACTIVE",

                active:
                    true

            })

        ])

    });

    /* ====================================================================
       ELEMENT CACHE
    ==================================================================== */

    const elements = {

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

        enrolledState:
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
       INTERNAL STATE
    ==================================================================== */

    const state = {

        initialized:
            false,

        loading:
            false,

        currentUpgradeModel:
            null,

        currentBridgeModel:
            null,

        credentials:
            []

    };

    /* ====================================================================
       INITIALIZATION
    ==================================================================== */

    function cacheElements() {

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

        elements.enrolledState =
            document.getElementById(
                "bridgeEnrolledState"
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

    }

    function bindEvents() {

        if (elements.retryButton) {

            elements.retryButton.addEventListener(
                "click",
                function () {

                    loadBridgeProgramme();

                }
            );

        }

        if (elements.termsConfirmation) {

            elements.termsConfirmation.addEventListener(
                "change",
                handleTermsConfirmationChange
            );

        }

        if (elements.registerButton) {

            elements.registerButton.addEventListener(
                "click",
                handleRegistrationAction
            );

        }

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

    }

    async function initialize() {

        if (state.initialized) {

            return;

        }

        state.initialized =
            true;

        cacheElements();

        bindEvents();

        enforceRegistrationSafety();

        await loadBridgeProgramme();

    }

    /* ====================================================================
       PAGE STATE CONTROL
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

    function showLoadingState() {

        hideAllStates();

        setHidden(
            elements.loadingState,
            false
        );

        announce(
            "Checking your Bridge Programme eligibility."
        );

    }

    function showErrorState(message) {

        hideAllStates();

        setText(
            elements.errorMessage,
            message ||
            "Please refresh the page or try again later."
        );

        setHidden(
            elements.errorState,
            false
        );

        announce(
            "Bridge Programme registration details could not be loaded."
        );

    }

    function showNotEligibleState(reason) {

        hideAllStates();

        setText(
            elements.notEligibleReason,
            reason ||
            "No eligible Bridge Programme pathway is currently available for your credential."
        );

        setHidden(
            elements.notEligibleState,
            false
        );

        announce(
            reason ||
            "No Bridge Programme is currently available."
        );

    }

    function showEligibleState() {

        hideAllStates();

        setHidden(
            elements.eligibleState,
            false
        );

        announce(
            "Your Bridge Programme eligibility has been confirmed."
        );

    }

    function showRegisteredState(message) {

        hideAllStates();

        const registeredMessage =
            document.getElementById(
                "bridgeRegisteredMessage"
            );

        if (message) {

            setText(
                registeredMessage,
                message
            );

        }

        setHidden(
            elements.registeredState,
            false
        );

        announce(
            "You are already registered for this Bridge Programme."
        );

    }

    function showEnrolledState(message) {

        hideAllStates();

        const enrolledMessage =
            document.getElementById(
                "bridgeEnrolledMessage"
            );

        if (message) {

            setText(
                enrolledMessage,
                message
            );

        }

        setHidden(
            elements.enrolledState,
            false
        );

        announce(
            "You are already enrolled in this Bridge Programme."
        );

    }

    /* ====================================================================
       MAIN ORCHESTRATION
    ==================================================================== */

    async function loadBridgeProgramme() {

        if (state.loading) {

            return;

        }

        state.loading =
            true;

        showLoadingState();

        try {

            validateRequiredServices();

            const credentials =
                await waitForCredentials();

            state.credentials =
                credentials;

            const upgradeModel =
                await window.EligibilityService
                    .getUpgradeModel();

            state.currentUpgradeModel =
                upgradeModel;

            if (
                !upgradeModel ||
                upgradeModel.eligible !== true
            ) {

                showNotEligibleState(
                    resolveIneligibilityReason(
                        upgradeModel
                    )
                );

                return;

            }

            const academicBridgeModel =
                resolveAcademicBridgeModel(
                    credentials,
                    upgradeModel
                );

            state.currentBridgeModel =
                academicBridgeModel;

            if (!academicBridgeModel) {

                showNotEligibleState(
                    "Your credential does not currently satisfy the academic requirements for this Bridge Programme."
                );

                return;

            }

            const participationState =
                resolveParticipationState(
                    upgradeModel,
                    academicBridgeModel
                );

            if (
                participationState.status ===
                "REGISTERED"
            ) {

                showRegisteredState(
                    participationState.message
                );

                return;

            }

            if (
                participationState.status ===
                "ENROLLED"
            ) {

                showEnrolledState(
                    participationState.message
                );

                return;

            }

            renderEligibleModel(
                upgradeModel,
                academicBridgeModel
            );

            showEligibleState();

        }
        catch (error) {

            console.error(
                "[BridgeProgrammeRegistration] Load failed.",
                error
            );

            showErrorState(
                resolveErrorMessage(error)
            );

        }
        finally {

            state.loading =
                false;

        }

    }

    /* ====================================================================
       SERVICE VALIDATION
    ==================================================================== */

    function validateRequiredServices() {

        if (
            !window.EligibilityService ||
            typeof window.EligibilityService
                .getUpgradeModel !== "function"
        ) {

            throw new Error(
                "EligibilityService is unavailable."
            );

        }

        if (
            !window.BridgeProgramService ||
            typeof window.BridgeProgramService
                .resolveBridgePrograms !== "function"
        ) {

            throw new Error(
                "BridgeProgramService is unavailable."
            );

        }

    }

    /* ====================================================================
       CREDENTIAL READINESS
    ==================================================================== */

    async function waitForCredentials() {

        const immediateCredentials =
            getVisibleCredentials();

        if (immediateCredentials.length > 0) {

            return immediateCredentials;

        }

        const startedAt =
            Date.now();

        while (
            Date.now() - startedAt <
            CREDENTIAL_WAIT_TIMEOUT_MS
        ) {

            await delay(
                CREDENTIAL_WAIT_INTERVAL_MS
            );

            const credentials =
                getVisibleCredentials();

            if (credentials.length > 0) {

                return credentials;

            }

        }

        /*
         * Do not throw here. EligibilityService may still
         * return a governed ineligible model.
         */

        return [];

    }

    function getVisibleCredentials() {

        if (
            window.CredentialService &&
            typeof window.CredentialService
                .getCredentials === "function"
        ) {

            const credentials =
                window.CredentialService
                    .getCredentials();

            if (Array.isArray(credentials)) {

                return credentials;

            }

        }

        if (
            Array.isArray(
                window.portalCredentials
            )
        ) {

            return window.portalCredentials;

        }

        const entitlements =
            window.__AAIU_ENTITLEMENTS__;

        if (
            entitlements &&
            Array.isArray(
                entitlements.visibleCredentials
            )
        ) {

            return entitlements.visibleCredentials;

        }

        return [];

    }

    /* ====================================================================
       ACADEMIC BRIDGE RESOLUTION
    ==================================================================== */

    function resolveAcademicBridgeModel(
        credentials,
        upgradeModel
    ) {

        const opportunities =
            window.BridgeProgramService
                .resolveBridgePrograms(
                    credentials,
                    BRIDGE_RELATIONSHIPS
                );

        if (
            !Array.isArray(opportunities) ||
            opportunities.length === 0
        ) {

            return null;

        }

        const currentProgramCode =
            normalizeProgramCode(
                upgradeModel?.currentProgram?.code
            );

        const targetProgramCode =
            normalizeProgramCode(
                upgradeModel?.nextProgram ||
                upgradeModel?.programCode
            );

        const exactOpportunity =
            opportunities.find(
                function (opportunity) {

                    return (

                        normalizeProgramCode(
                            opportunity.sourceProgram
                        ) === currentProgramCode &&

                        normalizeProgramCode(
                            opportunity.targetProgram
                        ) === targetProgramCode

                    );

                }
            );

        return (
            exactOpportunity ||
            opportunities[0] ||
            null
        );

    }

    /* ====================================================================
       PARTICIPATION STATE
    ==================================================================== */

    function resolveParticipationState(
        upgradeModel,
        bridgeModel
    ) {

        /*
         * Registration and enrolment services are not yet
         * connected. This method provides the governed
         * extension point without inventing persisted state.
         */

        if (
            window.BridgeRegistrationService &&
            typeof window.BridgeRegistrationService
                .getParticipationState === "function"
        ) {

            try {

                const resolvedState =
                    window.BridgeRegistrationService
                        .getParticipationState(
                            {
                                upgradeModel:
                                    upgradeModel,

                                bridgeModel:
                                    bridgeModel
                            }
                        );

                if (
                    resolvedState &&
                    typeof resolvedState === "object"
                ) {

                    return {

                        status:
                            normalizeStatus(
                                resolvedState.status
                            ) || "AVAILABLE",

                        message:
                            resolvedState.message ||
                            null

                    };

                }

            }
            catch (error) {

                console.warn(
                    "[BridgeProgrammeRegistration] Participation state resolution failed.",
                    error
                );

            }

        }

        return {

            status:
                "AVAILABLE",

            message:
                null

        };

    }

    /* ====================================================================
       ELIGIBLE MODEL RENDERING
    ==================================================================== */

    function renderEligibleModel(
        upgradeModel,
        bridgeModel
    ) {

        const currentProgramCode =
            normalizeProgramCode(

                bridgeModel.sourceProgram ||
                upgradeModel?.currentProgram?.code

            );

        const targetProgramCode =
            normalizeProgramCode(

                bridgeModel.targetProgram ||
                upgradeModel.nextProgram ||
                upgradeModel.programCode

            );

        const currentProgramName =
            upgradeModel?.currentProgram?.name ||
            PROGRAM_NAMES[currentProgramCode] ||
            currentProgramCode ||
            "Current programme";

        const targetProgramName =
            upgradeModel.programName ||
            PROGRAM_NAMES[targetProgramCode] ||
            targetProgramCode ||
            "Bridge destination";

        setText(
            elements.offerTitle,
            upgradeModel.bridgeProgram ||
            bridgeModel.title ||
            upgradeModel.title ||
            "Bridge Programme"
        );

        setText(
            elements.offerDescription,
            upgradeModel.description ||
            bridgeModel.description ||
            "Upgrade through the approved Agile AI University Bridge Programme."
        );

        setText(
            elements.eligibilityBadge,
            "Eligible"
        );

        setText(
            elements.currentProgramName,
            currentProgramName
        );

        setText(
            elements.currentProgramCode,
            currentProgramCode || "—"
        );

        setText(
            elements.targetProgramName,
            targetProgramName
        );

        setText(
            elements.targetProgramCode,
            targetProgramCode || "—"
        );

        renderCommercialInformation(
            upgradeModel
        );

        enforceRegistrationSafety();

    }

    function renderCommercialInformation(
        upgradeModel
    ) {

        setText(
            elements.baseFee,
            formatCurrency(
                upgradeModel.baseFee,
                upgradeModel.currency
            )
        );

        setText(
            elements.gstRate,
            formatGstRate(
                upgradeModel.gstRate
            )
        );

        setText(
            elements.gstAmount,
            formatCurrency(
                upgradeModel.gstAmount,
                upgradeModel.currency
            )
        );

        setText(
            elements.totalPayable,
            formatCurrency(
                upgradeModel.totalPayable,
                upgradeModel.currency
            )
        );

        setText(
            elements.standardFee,
            formatCurrency(
                upgradeModel.standardFee,
                upgradeModel.currency
            )
        );

        setText(
            elements.fullProgrammeFee,
            formatCurrency(
                upgradeModel.fullProgrammeFee,
                upgradeModel.currency
            )
        );

        const formattedOfferDate =
            formatOfferDate(
                upgradeModel.offerEndsOn
            );

        if (formattedOfferDate) {

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

        }
        else {

            setText(
                elements.offerExpiry,
                "Offer availability is subject to the current approved campaign."
            );

            setText(
                elements.offerExpiryBadge,
                "Limited-time offer"
            );

        }

        setText(
            elements.taxDisclaimer,
            upgradeModel.taxDisclaimer ||
            "Final tax and payable amount will be confirmed during secure checkout."
        );

    }

    /* ====================================================================
       REGISTRATION SAFETY
    ==================================================================== */

    function enforceRegistrationSafety() {

        if (elements.termsConfirmation) {

            elements.termsConfirmation.checked =
                false;

            elements.termsConfirmation.disabled =
                true;

        }

        if (elements.registerButton) {

            elements.registerButton.disabled =
                true;

            elements.registerButton.textContent =
                DEFAULT_REGISTRATION_LABEL;

            elements.registerButton.setAttribute(
                "aria-disabled",
                "true"
            );

        }

        setText(
            elements.registrationNotice,
            DEFAULT_REGISTRATION_NOTICE
        );

    }

    function handleTermsConfirmationChange() {

        /*
         * Reserved for the governed registration-service
         * implementation. The control remains disabled in
         * the current Revenue Sprint foundation.
         */

        enforceRegistrationSafety();

    }

    function handleRegistrationAction(event) {

        if (event) {

            event.preventDefault();

        }

        announce(
            "Bridge Programme registration is not yet enabled."
        );

        console.warn(
            "[BridgeProgrammeRegistration] Registration action blocked because no governed registration workflow is connected."
        );

    }

    /* ====================================================================
       PORTAL EVENTS
    ==================================================================== */

    function handlePortalReadinessEvent() {

        if (
            !state.loading &&
            !state.currentUpgradeModel
        ) {

            loadBridgeProgramme();

        }

    }

    /* ====================================================================
       FORMATTING
    ==================================================================== */

    function formatCurrency(
        value,
        currency = "INR"
    ) {

        const amount =
            Number(value);

        if (!Number.isFinite(amount)) {

            return "—";

        }

        try {

            return new Intl.NumberFormat(
                "en-IN",
                {
                    style:
                        "currency",

                    currency:
                        currency || "INR",

                    minimumFractionDigits:
                        0,

                    maximumFractionDigits:
                        2
                }
            ).format(amount);

        }
        catch (error) {

            console.warn(
                "[BridgeProgrammeRegistration] Currency formatting failed.",
                error
            );

            return "₹" +
                amount.toLocaleString(
                    "en-IN"
                );

        }

    }

    function formatGstRate(value) {

        const rate =
            Number(value);

        if (!Number.isFinite(rate)) {

            return "";

        }

        return "(" + rate + "%)";

    }

    function formatOfferDate(dateKey) {

        if (
            typeof dateKey !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(
                dateKey
            )
        ) {

            return null;

        }

        const parts =
            dateKey.split("-");

        const year =
            Number(parts[0]);

        const month =
            Number(parts[1]);

        const day =
            Number(parts[2]);

        const date =
            new Date(
                Date.UTC(
                    year,
                    month - 1,
                    day
                )
            );

        if (
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
            ).format(date);

        }
        catch (error) {

            return (
                day +
                " " +
                resolveMonthName(month) +
                " " +
                year
            );

        }

    }

    function resolveMonthName(month) {

        const names = [

            "",

            "January",

            "February",

            "March",

            "April",

            "May",

            "June",

            "July",

            "August",

            "September",

            "October",

            "November",

            "December"

        ];

        return names[month] || "";

    }

    /* ====================================================================
       NORMALIZATION
    ==================================================================== */

    function normalizeProgramCode(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return null;

        }

        const normalized =
            String(value)
                .trim()
                .toUpperCase();

        return normalized || null;

    }

    function normalizeStatus(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return null;

        }

        const normalized =
            String(value)
                .trim()
                .toUpperCase();

        return normalized || null;

    }

    /* ====================================================================
       ERROR HANDLING
    ==================================================================== */

    function resolveIneligibilityReason(
        upgradeModel
    ) {

        if (
            upgradeModel &&
            typeof upgradeModel.reason ===
                "string" &&
            upgradeModel.reason.trim()
        ) {

            return upgradeModel.reason.trim();

        }

        if (
            upgradeModel &&
            Array.isArray(
                upgradeModel.reasons
            ) &&
            upgradeModel.reasons.length > 0
        ) {

            return String(
                upgradeModel.reasons[0]
            );

        }

        return "No eligible Bridge Programme pathway is currently available for your credential.";

    }

    function resolveErrorMessage(error) {

        if (
            error &&
            typeof error.message ===
                "string" &&
            error.message.trim()
        ) {

            if (
                error.message.includes(
                    "EligibilityService"
                ) ||
                error.message.includes(
                    "BridgeProgramService"
                )
            ) {

                return "A required Bridge Programme service could not be loaded. Please refresh the page.";

            }

        }

        return "We could not load your Bridge Programme registration details. Please refresh the page or try again later.";

    }

    /* ====================================================================
       DOM HELPERS
    ==================================================================== */

    function setHidden(
        element,
        hidden
    ) {

        if (!element) {

            return;

        }

        element.hidden =
            Boolean(hidden);

    }

    function setText(
        element,
        value
    ) {

        if (!element) {

            return;

        }

        element.textContent =
            value === null ||
            value === undefined
                ? ""
                : String(value);

    }

    function announce(message) {

        if (!elements.statusAnnouncer) {

            return;

        }

        elements.statusAnnouncer.textContent =
            "";

        window.setTimeout(
            function () {

                elements.statusAnnouncer.textContent =
                    message || "";

            },
            20
        );

    }

    function delay(milliseconds) {

        return new Promise(
            function (resolve) {

                window.setTimeout(
                    resolve,
                    milliseconds
                );

            }
        );

    }

    /* ====================================================================
       PUBLIC DIAGNOSTIC API
    ==================================================================== */

    const BridgeProgrammeRegistrationController =
        Object.freeze({

            version:
                CONTROLLER_VERSION,

            reload:
                loadBridgeProgramme,

            getState:
                function () {

                    return Object.freeze({

                        initialized:
                            state.initialized,

                        loading:
                            state.loading,

                        credentials:
                            Array.isArray(
                                state.credentials
                            )
                                ? state.credentials.slice()
                                : [],

                        upgradeModel:
                            state.currentUpgradeModel,

                        bridgeModel:
                            state.currentBridgeModel

                    });

                }

        });

    window.BridgeProgrammeRegistrationController =
        BridgeProgrammeRegistrationController;

    /* ====================================================================
       BOOTSTRAP
    ==================================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once:
                    true
            }
        );

    }
    else {

        initialize();

    }

})(window, document);