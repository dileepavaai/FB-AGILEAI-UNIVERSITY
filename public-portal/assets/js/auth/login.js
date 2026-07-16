/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : login.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Dedicated Authentication Stabilization

   Purpose
   ----------------------------------------------------------
   Provides the page-level controller for the dedicated
   Student & Executive Portal login experience.

   Responsibilities
   ----------------------------------------------------------
   ✓ Initialize the dedicated login page
   ✓ Resolve login-page elements
   ✓ Wire Google sign-in
   ✓ Wire passwordless email-link sign-in
   ✓ Validate registered email input
   ✓ Present authentication status and errors
   ✓ Observe restored Firebase authentication state
   ✓ Redirect authenticated users to the dashboard
   ✓ Prevent duplicate redirects
   ✓ Prevent duplicate authentication submissions
   ✓ Support asynchronous authentication readiness
   ✓ Preserve compatibility with PortalAuth
   ✓ Recover safely when optional APIs are unavailable

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Firebase application initialization
   ✗ Authentication policy decisions
   ✗ Authorization decisions
   ✗ Entitlement resolution
   ✗ Firestore queries
   ✗ Credential retrieval
   ✗ Session termination
   ✗ Portal runtime cleanup
   ✗ Dashboard rendering
   ✗ Business logic
   ✗ User-profile persistence

   Architectural Position
   ----------------------------------------------------------
   login.html
        ↓
   LoginController
        ↓
   PortalAuth
        ↓
   Firebase Authentication
        ↓
   Authenticated Dashboard

   Governance
   ----------------------------------------------------------
   • login.js is the dedicated login-page controller.

   • portal-auth.js remains the authentication authority.

   • firebase-init.js remains the Firebase bootstrap
     authority.

   • This controller may observe Firebase authentication
     readiness but must not initialize Firebase itself.

   • This controller must not resolve authorization or
     entitlements.

   • A restored authenticated session must redirect to the
     governed dashboard destination.

   • Redirects must use location.replace() so browser Back
     does not reopen the login page after authentication.

   • Only one dashboard redirect may be initiated during a
     page lifecycle.

   • Authentication buttons must be disabled while an
     operation is active.

   • Authentication errors must be shown without exposing
     unnecessary internal implementation details.

   • The controller must remain compatible with both the
     dedicated login page and existing PortalAuth methods.

   Required Element Contracts
   ----------------------------------------------------------
   btnGoogle
   • Google authentication button

   emailInput
   • Passwordless authentication email field

   btnEmailLink
   • Send-secure-login-link button

   emailStatus
   • Email authentication status region

   statusText
   • General authentication status region

   signedOutUI
   • Dedicated login card

   signedInUI
   • Authenticated-session redirect state

   Authentication Readiness
   ----------------------------------------------------------
   Page Loaded
        ↓
   Elements Cached
        ↓
   Events Bound
        ↓
   Firebase Auth Observer Registered
        ↓
   Firebase Restores Session
        ↓
   Authenticated User Found?
        ├── No  → Keep Login Experience Visible
        └── Yes → Show Redirect State
                  ↓
                Redirect to /index.html

   Change History
   ----------------------------------------------------------
   v1.1.0

   • Corrected login-page element IDs
   • Added Firebase auth-state readiness observer
   • Fixed authenticated-session redirect getting stuck
   • Added redirect-once protection
   • Added authenticated redirect-state presentation
   • Added dedicated dashboard URL resolution
   • Added button busy-state labels
   • Added safe authentication error normalization
   • Added PortalAuth API compatibility fallbacks
   • Added email Enter-key submission
   • Added authentication lifecycle events
   • Added defensive initialization protection
   • Preserved page-controller architecture

   v1.0.0

   • Introduced dedicated login-page controller
   • Added Google sign-in delegation
   • Added passwordless email-link delegation
   • Added email validation
   • Added authenticated-user redirect
   • Added login UI state handling

========================================================== */

(function (
    window,
    document
) {

    "use strict";


    /* ======================================================
       MODULE IDENTITY
    ====================================================== */

    const MODULE_NAME =
        "LoginController";

    const MODULE_VERSION =
        "1.1.0";


    /* ======================================================
       CONFIGURATION
    ====================================================== */

    const DEFAULT_DASHBOARD_URL =
        "/index.html";


    const EMAIL_PATTERN =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    const AUTH_RESTORE_TIMEOUT_MS =
        12000;


    /* ======================================================
       STATE
    ====================================================== */

    let initialized =
        false;

    let busy =
        false;

    let redirectStarted =
        false;

    let authStateResolved =
        false;

    let authUnsubscribe =
        null;

    let authRestoreTimer =
        null;


    /* ======================================================
       ELEMENT REFERENCES
    ====================================================== */

    const elements = {

        googleButton:
            null,

        emailInput:
            null,

        emailButton:
            null,

        emailStatus:
            null,

        generalStatus:
            null,

        signedOutUI:
            null,

        signedInUI:
            null

    };


    /* ======================================================
       VALUE HELPERS
    ====================================================== */

    function normalizeString(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(
            value
        )
            .trim();

    }


    function resolveDashboardUrl() {

        return normalizeString(
            window.__AAIU_PORTAL_DASHBOARD_URL__
        ) ||
        DEFAULT_DASHBOARD_URL;

    }


    function normalizeEmail(
        value
    ) {

        return normalizeString(
            value
        )
            .toLowerCase();

    }


    function isValidEmail(
        email
    ) {

        return EMAIL_PATTERN.test(
            email
        );

    }


    /* ======================================================
       AUTHENTICATION ERROR NORMALIZATION
    ====================================================== */

    function getFriendlyErrorMessage(
        error,
        fallbackMessage
    ) {

        const errorCode =
            normalizeString(
                error?.code
            )
                .toLowerCase();


        switch (
            errorCode
        ) {

            case "auth/popup-closed-by-user":

                return "Google sign-in was cancelled.";


            case "auth/cancelled-popup-request":

                return "Another sign-in request is already open.";


            case "auth/popup-blocked":

                return "Your browser blocked the sign-in window. Please allow pop-ups and try again.";


            case "auth/network-request-failed":

                return "A network error occurred. Please check your connection and try again.";


            case "auth/invalid-email":

                return "Please enter a valid email address.";


            case "auth/user-disabled":

                return "This account is currently unavailable. Please contact Agile AI University support.";


            case "auth/unauthorized-domain":

                return "This portal domain is not authorized for authentication.";


            case "auth/operation-not-allowed":

                return "This authentication method is currently unavailable.";


            case "auth/too-many-requests":

                return "Too many sign-in attempts were made. Please wait and try again.";


            case "auth/internal-error":

                return "Authentication could not be completed. Please try again.";


            default:

                return normalizeString(
                    error?.message
                ) ||
                fallbackMessage;

        }

    }


    /* ======================================================
       EVENT PUBLISHING
    ====================================================== */

    function publishEvent(
        eventName,
        detail = {}
    ) {

        try {

            document.dispatchEvent(

                new CustomEvent(
                    eventName,
                    {
                        detail: {

                            source:
                                MODULE_NAME,

                            version:
                                MODULE_VERSION,

                            timestamp:
                                new Date()
                                    .toISOString(),

                            ...detail

                        }
                    }
                )

            );

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to publish ${eventName}.`,
                error
            );

        }

    }


    /* ======================================================
       ELEMENT CACHING
    ====================================================== */

    function cacheElements() {

        elements.googleButton =
            document.getElementById(
                "btnGoogle"
            );


        elements.emailInput =
            document.getElementById(
                "emailInput"
            );


        elements.emailButton =
            document.getElementById(
                "btnEmailLink"
            );


        elements.emailStatus =
            document.getElementById(
                "emailStatus"
            );


        elements.generalStatus =
            document.getElementById(
                "statusText"
            );


        elements.signedOutUI =
            document.getElementById(
                "signedOutUI"
            );


        elements.signedInUI =
            document.getElementById(
                "signedInUI"
            );

    }


    /* ======================================================
       ELEMENT CONTRACT VALIDATION
    ====================================================== */

    function validateElementContracts() {

        const requiredElements = [

            {
                name:
                    "btnGoogle",

                value:
                    elements.googleButton
            },

            {
                name:
                    "emailInput",

                value:
                    elements.emailInput
            },

            {
                name:
                    "btnEmailLink",

                value:
                    elements.emailButton
            },

            {
                name:
                    "emailStatus",

                value:
                    elements.emailStatus
            }

        ];


        const missingElements =
            requiredElements
                .filter(
                    item =>
                        !item.value
                )
                .map(
                    item =>
                        item.name
                );


        if (
            missingElements.length >
            0
        ) {

            console.error(
                `[${MODULE_NAME}] Missing required login elements:`,
                missingElements
            );


            showGeneralError(
                "The login experience could not be initialized. Please refresh the page."
            );


            return false;

        }


        return true;

    }


    /* ======================================================
       STATUS PRESENTATION
    ====================================================== */

    function setStatusElement(
        element,
        message,
        state
    ) {

        if (
            !element
        ) {

            return;

        }


        element.textContent =
            normalizeString(
                message
            );


        element.classList.remove(
            "success",
            "error",
            "info",
            "loading"
        );


        if (
            state
        ) {

            element.classList.add(
                state
            );

        }

    }


    function showEmailMessage(
        message
    ) {

        setStatusElement(
            elements.emailStatus,
            message,
            "success"
        );

    }


    function showEmailError(
        message
    ) {

        setStatusElement(
            elements.emailStatus,
            message,
            "error"
        );

    }


    function clearEmailStatus() {

        setStatusElement(
            elements.emailStatus,
            "",
            ""
        );

    }


    function showGeneralMessage(
        message
    ) {

        setStatusElement(
            elements.generalStatus,
            message,
            "info"
        );

    }


    function showGeneralError(
        message
    ) {

        setStatusElement(
            elements.generalStatus,
            message,
            "error"
        );

    }


    /* ======================================================
       BUTTON TEXT HELPERS
    ====================================================== */

    function rememberButtonLabel(
        button
    ) {

        if (
            !button ||
            button.dataset.originalLabel
        ) {

            return;

        }


        button.dataset.originalLabel =
            normalizeString(
                button.textContent
            );

    }


    function restoreButtonLabel(
        button
    ) {

        if (
            !button ||
            !button.dataset.originalLabel
        ) {

            return;

        }


        button.textContent =
            button.dataset.originalLabel;


        delete button.dataset
            .originalLabel;

    }


    /* ======================================================
       BUSY STATE
    ====================================================== */

    function setBusy(
        isBusy,
        activeAction = ""
    ) {

        busy =
            Boolean(
                isBusy
            );


        const buttons = [

            elements.googleButton,

            elements.emailButton

        ];


        buttons.forEach(

            button => {

                if (
                    !button
                ) {

                    return;

                }


                button.disabled =
                    busy;


                button.setAttribute(
                    "aria-busy",
                    busy
                        ? "true"
                        : "false"
                );


                if (
                    busy
                ) {

                    rememberButtonLabel(
                        button
                    );

                } else {

                    restoreButtonLabel(
                        button
                    );

                }

            }

        );


        if (
            busy &&
            activeAction ===
                "google" &&
            elements.googleButton
        ) {

            elements.googleButton.textContent =
                "Opening Google Sign-In…";

        }


        if (
            busy &&
            activeAction ===
                "email" &&
            elements.emailButton
        ) {

            elements.emailButton.textContent =
                "Sending Secure Link…";

        }


        if (
            elements.emailInput
        ) {

            elements.emailInput.disabled =
                busy;

        }

    }


    /* ======================================================
       AUTHENTICATED REDIRECT STATE
    ====================================================== */

    function showAuthenticatedRedirectState() {

        if (
            elements.signedOutUI
        ) {

            elements.signedOutUI.hidden =
                true;


            elements.signedOutUI.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        if (
            elements.signedInUI
        ) {

            elements.signedInUI.hidden =
                false;


            elements.signedInUI.removeAttribute(
                "aria-hidden"
            );

        }


        setBusy(
            true
        );

    }


    function showLoginState() {

        if (
            elements.signedOutUI
        ) {

            elements.signedOutUI.hidden =
                false;


            elements.signedOutUI.removeAttribute(
                "aria-hidden"
            );

        }


        if (
            elements.signedInUI
        ) {

            elements.signedInUI.hidden =
                true;


            elements.signedInUI.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        setBusy(
            false
        );

    }


    /* ======================================================
       DASHBOARD REDIRECT
    ====================================================== */

    function redirectToDashboard(
        user,
        reason = "authenticated-session"
    ) {

        if (
            redirectStarted
        ) {

            return;

        }


        redirectStarted =
            true;


        const dashboardUrl =
            resolveDashboardUrl();


        showAuthenticatedRedirectState();


        publishEvent(
            "portal:login-redirect-started",
            {
                reason,

                dashboardUrl,

                userId:
                    normalizeString(
                        user?.uid
                    ),

                email:
                    normalizeString(
                        user?.email
                    )
            }
        );


        console.info(
            `[${MODULE_NAME}] Authenticated session found. Redirecting to:`,
            dashboardUrl
        );


        /*
         * Allow the redirect state to render before replacing
         * the login-page history entry.
         */

        window.setTimeout(

            function () {

                window.location.replace(
                    dashboardUrl
                );

            },

            50

        );

    }


    /* ======================================================
       FIREBASE AUTH RESOLUTION
    ====================================================== */

    function resolveFirebaseAuth() {

        if (
            !window.firebase ||
            typeof window.firebase.auth !==
                "function"
        ) {

            return null;

        }


        try {

            return window.firebase
                .auth();

        } catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] Unable to resolve Firebase Authentication.`,
                error
            );


            return null;

        }

    }


    /* ======================================================
       PORTAL AUTH CURRENT USER
    ====================================================== */

    function resolveCurrentUser() {

        try {

            if (
                window.PortalAuth &&
                typeof window.PortalAuth
                    .getCurrentUser ===
                    "function"
            ) {

                const portalUser =
                    window.PortalAuth
                        .getCurrentUser();


                if (
                    portalUser
                ) {

                    return portalUser;

                }

            }

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] PortalAuth current-user lookup failed.`,
                error
            );

        }


        const auth =
            resolveFirebaseAuth();


        return auth?.currentUser ||
            null;

    }


    /* ======================================================
       AUTH STATE OBSERVER
    ====================================================== */

    function bindAuthStateObserver() {

        const auth =
            resolveFirebaseAuth();


        if (
            !auth ||
            typeof auth.onAuthStateChanged !==
                "function"
        ) {

            showGeneralError(
                "Authentication is still initializing. Please refresh the page if this message remains."
            );


            console.error(
                `[${MODULE_NAME}] Firebase auth-state observer is unavailable.`
            );


            return false;

        }


        authUnsubscribe =
            auth.onAuthStateChanged(

                function (
                    user
                ) {

                    authStateResolved =
                        true;


                    if (
                        authRestoreTimer
                    ) {

                        window.clearTimeout(
                            authRestoreTimer
                        );


                        authRestoreTimer =
                            null;

                    }


                    if (
                        user
                    ) {

                        redirectToDashboard(
                            user,
                            "firebase-auth-state"
                        );


                        return;

                    }


                    redirectStarted =
                        false;


                    showLoginState();


                    showGeneralMessage(
                        "Sign in using your registered Google account or request a secure passwordless email link."
                    );


                    publishEvent(
                        "portal:login-ready"
                    );

                },

                function (
                    error
                ) {

                    authStateResolved =
                        true;


                    if (
                        authRestoreTimer
                    ) {

                        window.clearTimeout(
                            authRestoreTimer
                        );


                        authRestoreTimer =
                            null;

                    }


                    console.error(
                        `[${MODULE_NAME}] Authentication-state observation failed.`,
                        error
                    );


                    showLoginState();


                    showGeneralError(
                        getFriendlyErrorMessage(
                            error,
                            "Authentication could not be initialized. Please refresh the page."
                        )
                    );


                    publishEvent(
                        "portal:login-auth-state-failed",
                        {
                            message:
                                getFriendlyErrorMessage(
                                    error,
                                    "Authentication-state observation failed."
                                )
                        }
                    );

                }

            );


        authRestoreTimer =
            window.setTimeout(

                function () {

                    if (
                        authStateResolved ||
                        redirectStarted
                    ) {

                        return;

                    }


                    const currentUser =
                        resolveCurrentUser();


                    if (
                        currentUser
                    ) {

                        redirectToDashboard(
                            currentUser,
                            "authentication-restore-timeout-fallback"
                        );


                        return;

                    }


                    showLoginState();


                    showGeneralError(
                        "Authentication is taking longer than expected. Please refresh the page and try again."
                    );

                },

                AUTH_RESTORE_TIMEOUT_MS

            );


        return true;

    }


    /* ======================================================
       GOOGLE AUTH METHOD RESOLUTION
    ====================================================== */

    function resolveGoogleSignInMethod() {

        const portalAuth =
            window.PortalAuth;


        if (
            !portalAuth
        ) {

            return null;

        }


        const methodNames = [

            "signInWithGoogle",

            "googleSignIn",

            "loginWithGoogle",

            "signInGoogle"

        ];


        for (
            const methodName of methodNames
        ) {

            if (
                typeof portalAuth[
                    methodName
                ] ===
                    "function"
            ) {

                return portalAuth[
                    methodName
                ].bind(
                    portalAuth
                );

            }

        }


        return null;

    }


    /* ======================================================
       EMAIL-LINK AUTH METHOD RESOLUTION
    ====================================================== */

    function resolveEmailLinkMethod() {

        const portalAuth =
            window.PortalAuth;


        if (
            !portalAuth
        ) {

            return null;

        }


        const methodNames = [

            "sendEmailLink",

            "sendSignInLink",

            "sendEmailSignInLink",

            "signInWithEmailLink",

            "requestEmailLink"

        ];


        for (
            const methodName of methodNames
        ) {

            if (
                typeof portalAuth[
                    methodName
                ] ===
                    "function"
            ) {

                return portalAuth[
                    methodName
                ].bind(
                    portalAuth
                );

            }

        }


        return null;

    }


    /* ======================================================
       GOOGLE SIGN-IN
    ====================================================== */

    async function signInWithGoogle() {

        if (
            busy ||
            redirectStarted
        ) {

            return;

        }


        clearEmailStatus();


        const signInMethod =
            resolveGoogleSignInMethod();


        if (
            !signInMethod
        ) {

            showGeneralError(
                "Google authentication is currently unavailable."
            );


            console.error(
                `[${MODULE_NAME}] PortalAuth Google sign-in method is unavailable.`
            );


            return;

        }


        setBusy(
            true,
            "google"
        );


        showGeneralMessage(
            "Opening secure Google authentication…"
        );


        publishEvent(
            "portal:google-signin-started"
        );


        try {

            const result =
                await Promise.resolve(
                    signInMethod()
                );


            const user =
                result?.user ||
                resolveCurrentUser();


            if (
                user
            ) {

                redirectToDashboard(
                    user,
                    "google-signin-completed"
                );


                return;

            }


            /*
             * The auth-state observer remains authoritative.
             * Some PortalAuth implementations complete the
             * provider operation without returning the user.
             */

            showGeneralMessage(
                "Authentication completed. Preparing your portal…"
            );

        } catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] Google sign-in failed.`,
                error
            );


            showGeneralError(
                getFriendlyErrorMessage(
                    error,
                    "Google sign-in failed. Please try again."
                )
            );


            publishEvent(
                "portal:google-signin-failed",
                {
                    message:
                        getFriendlyErrorMessage(
                            error,
                            "Google sign-in failed."
                        )
                }
            );

        } finally {

            if (
                !redirectStarted
            ) {

                setBusy(
                    false
                );

            }

        }

    }


    /* ======================================================
       EMAIL-LINK SIGN-IN
    ====================================================== */

    async function signInWithEmail() {

        if (
            busy ||
            redirectStarted
        ) {

            return;

        }


        const email =
            normalizeEmail(
                elements.emailInput
                    ?.value
            );


        if (
            !email
        ) {

            showEmailError(
                "Please enter your registered email address."
            );


            elements.emailInput
                ?.focus();


            return;

        }


        if (
            !isValidEmail(
                email
            )
        ) {

            showEmailError(
                "Please enter a valid email address."
            );


            elements.emailInput
                ?.focus();


            return;

        }


        const emailLinkMethod =
            resolveEmailLinkMethod();


        if (
            !emailLinkMethod
        ) {

            showEmailError(
                "Passwordless email authentication is currently unavailable."
            );


            console.error(
                `[${MODULE_NAME}] PortalAuth email-link method is unavailable.`
            );


            return;

        }


        clearEmailStatus();


        setBusy(
            true,
            "email"
        );


        showGeneralMessage(
            "Preparing your secure sign-in link…"
        );


        publishEvent(
            "portal:email-link-started",
            {
                email
            }
        );


        try {

            await Promise.resolve(
                emailLinkMethod(
                    email
                )
            );


            /*
             * Keep a portal-owned email fallback for
             * completion flows that need to recover the
             * originating email address.
             */

            try {

                window.localStorage
                    .setItem(
                        "emailForSignIn",
                        email
                    );

            } catch (
                storageError
            ) {

                console.warn(
                    `[${MODULE_NAME}] Unable to store email-link completion hint.`,
                    storageError
                );

            }


            showEmailMessage(
                "A secure sign-in link has been sent. Please check your email and open the link on this device."
            );


            showGeneralMessage(
                "Secure login link sent successfully."
            );


            publishEvent(
                "portal:email-link-sent",
                {
                    email
                }
            );

        } catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] Email-link request failed.`,
                error
            );


            const message =
                getFriendlyErrorMessage(
                    error,
                    "Unable to send the secure sign-in link. Please try again."
                );


            showEmailError(
                message
            );


            showGeneralError(
                message
            );


            publishEvent(
                "portal:email-link-failed",
                {
                    email,

                    message
                }
            );

        } finally {

            setBusy(
                false
            );

        }

    }


    /* ======================================================
       DOM EVENTS
    ====================================================== */

    function bindEvents() {

        elements.googleButton
            ?.addEventListener(

                "click",

                signInWithGoogle

            );


        elements.emailButton
            ?.addEventListener(

                "click",

                signInWithEmail

            );


        elements.emailInput
            ?.addEventListener(

                "keydown",

                function (
                    event
                ) {

                    if (
                        event.key !==
                        "Enter"
                    ) {

                        return;

                    }


                    event.preventDefault();


                    signInWithEmail();

                }

            );


        elements.emailInput
            ?.addEventListener(

                "input",

                function () {

                    if (
                        elements.emailStatus
                            ?.classList
                            .contains(
                                "error"
                            )
                    ) {

                        clearEmailStatus();

                    }

                }

            );

    }


    /* ======================================================
       IMMEDIATE USER CHECK

       This catches cases where Firebase has already restored
       the user before the observer is registered.

       The auth-state observer remains the final authority.
    ====================================================== */

    function redirectIfAuthenticated() {

        const user =
            resolveCurrentUser();


        if (
            user
        ) {

            redirectToDashboard(
                user,
                "immediate-current-user"
            );


            return true;

        }


        return false;

    }


    /* ======================================================
       CLEANUP
    ====================================================== */

    function cleanup() {

        if (
            typeof authUnsubscribe ===
                "function"
        ) {

            try {

                authUnsubscribe();

            } catch (
                error
            ) {

                console.warn(
                    `[${MODULE_NAME}] Unable to remove auth-state observer.`,
                    error
                );

            }


            authUnsubscribe =
                null;

        }


        if (
            authRestoreTimer
        ) {

            window.clearTimeout(
                authRestoreTimer
            );


            authRestoreTimer =
                null;

        }

    }


    /* ======================================================
       INITIALIZATION
    ====================================================== */

    function initialize() {

        if (
            initialized
        ) {

            return;

        }


        initialized =
            true;


        console.info(
            `[${MODULE_NAME}] Initializing v${MODULE_VERSION}`
        );


        cacheElements();


        if (
            !validateElementContracts()
        ) {

            return;

        }


        bindEvents();


        showGeneralMessage(
            "Checking for an existing authenticated session…"
        );


        const immediateRedirect =
            redirectIfAuthenticated();


        if (
            !immediateRedirect
        ) {

            bindAuthStateObserver();

        }


        window.addEventListener(
            "pagehide",
            cleanup,
            {
                once:
                    true
            }
        );


        publishEvent(
            "portal:login-controller-ready",
            {
                dashboardUrl:
                    resolveDashboardUrl()
            }
        );

    }


    /* ======================================================
       PUBLIC API
    ====================================================== */

    window.LoginController =
        Object.freeze({

            initialize,

            signInWithGoogle,

            signInWithEmail,

            redirectIfAuthenticated,

            getState() {

                return Object.freeze({

                    initialized,

                    busy,

                    redirectStarted,

                    authStateResolved,

                    dashboardUrl:
                        resolveDashboardUrl(),

                    version:
                        MODULE_VERSION

                });

            }

        });


    /* ======================================================
       STARTUP
    ====================================================== */

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

    } else {

        initialize();

    }


})(window, document);