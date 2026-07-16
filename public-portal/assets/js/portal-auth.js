/* ============================================================
   Agile AI University Portal
   Portal Authentication Controller

   File       : portal-auth.js
   Version    : 1.2.1
   Status     : ACTIVE
   Governance : LOCKED
   Owner      : Agile AI University

   Purpose
   ------------------------------------------------------------
   Coordinates portal authentication interactions and safely
   updates authentication-related UI regions when those regions
   exist on the current page.

   Responsibilities
   ------------------------------------------------------------
   ✓ Google Sign-In
   ✓ Email Magic Link Sign-In
   ✓ Email Link Completion
   ✓ Authentication State Resolution
   ✓ Portal Authentication UI State Management
   ✓ Sign-Out
   ✓ Page-safe DOM updates
   ✓ Authentication lifecycle diagnostics

   Non-Responsibilities
   ------------------------------------------------------------
   ✗ Credential retrieval
   ✗ Credential rendering
   ✗ Credential visibility decisions
   ✗ Entitlement resolution
   ✗ Authorization rules
   ✗ Registry access
   ✗ Firestore queries
   ✗ Cloud Storage access
   ✗ Dashboard orchestration

   Dependencies
   ------------------------------------------------------------
   • firebase-init.js
   • Firebase Auth compat SDK
   • window.AAIUAuth
   • window.__AAIU_AUTH_READY__

   Architectural Position
   ------------------------------------------------------------
   Firebase Authentication
        ↓
   firebase-init.js
        ↓
   window.AAIUAuth
        ↓
   portal-auth.js
        ↓
   Page Authentication UI

   Design Principles
   ------------------------------------------------------------
   • UI Controller Only
   • No Credential Logic
   • No Entitlement Logic
   • No Registry Logic
   • Authentication Orchestration Only
   • Shared Across Portal Pages
   • DOM Access Must Be Null-Safe
   • Page-Specific Elements Are Optional

   Public Behaviour
   ------------------------------------------------------------
   Dashboard pages may provide:

   • signedOutUI
   • signedInUI
   • userName
   • userEmail
   • btnGoogle
   • btnEmailLink
   • btnSignOut
   • emailInput
   • emailStatus

   Other authenticated portal pages may omit some or all
   of these elements.

   Missing optional elements must never cause authentication
   initialization to fail.

   Change History
   ------------------------------------------------------------
   v1.2.1

   • Made profile DOM updates page-safe
   • Added null protection for userName
   • Added null protection for all optional UI elements
   • Removed dashboard-only DOM assumptions
   • Added safer AAIUAuth dependency checks
   • Added safer Firebase Auth dependency checks
   • Added safe display-name normalization
   • Preserved Google Sign-In flow
   • Preserved passwordless email-link flow
   • Preserved auth readiness architecture

   v1.2.0

   • Fixed auth readiness consistency
   • Added safe email validation
   • Added governance logging
   • Added user-visible diagnostics
   • Added defensive null protection
   • Preserved existing authentication flow

   v1.0.0

   • Initial MVP implementation

============================================================ */

document.addEventListener(

    "DOMContentLoaded",

    async function initializePortalAuthentication() {

        "use strict";


        /* ==================================================
           CONTROLLER IDENTITY
        ================================================== */

        const VERSION =
            "1.2.1";

        const CONTROLLER_NAME =
            "Portal Auth";


        console.log(
            `[${CONTROLLER_NAME}] Controller v${VERSION} initializing`
        );


        /* ==================================================
           DOM REFERENCES

           Governance
           --------------------------------------------------
           Every reference is optional.

           portal-auth.js is shared by multiple pages and
           must never assume dashboard-specific elements
           exist.
        ================================================== */

        const signedOutUI =
            document.getElementById(
                "signedOutUI"
            );

        const signedInUI =
            document.getElementById(
                "signedInUI"
            );

        const userName =
            document.getElementById(
                "userName"
            );

        const userEmail =
            document.getElementById(
                "userEmail"
            );

        const btnGoogle =
            document.getElementById(
                "btnGoogle"
            );

        const btnEmailLink =
            document.getElementById(
                "btnEmailLink"
            );

        const btnSignOut =
            document.getElementById(
                "btnSignOut"
            );

        const emailInput =
            document.getElementById(
                "emailInput"
            );

        const emailStatus =
            document.getElementById(
                "emailStatus"
            );

        const statusText =
            document.getElementById(
                "statusText"
            );


        /* ==================================================
           DEPENDENCY HELPERS
        ================================================== */

        function getAAIUAuth() {

            if (
                !window.AAIUAuth ||
                typeof window.AAIUAuth !==
                    "object"
            ) {

                return null;

            }

            return window.AAIUAuth;

        }


        function getFirebaseAuth() {

            try {

                if (
                    !window.firebase ||
                    typeof window.firebase.auth !==
                        "function"
                ) {

                    return null;

                }

                return window.firebase.auth();

            } catch (error) {

                console.error(
                    `[${CONTROLLER_NAME}] Firebase Auth resolution failed`,
                    error
                );

                return null;

            }

        }


        /* ==================================================
           TEXT NORMALIZATION
        ================================================== */

        function normalizeText(
            value
        ) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }

            return String(value)
                .trim();

        }


        function resolveDisplayName(
            user
        ) {

            const displayName =
                normalizeText(
                    user?.displayName
                );

            if (displayName) {

                return displayName;

            }

            const email =
                normalizeText(
                    user?.email
                );

            if (email) {

                const emailName =
                    email.split("@")[0];

                if (emailName) {

                    return emailName;

                }

            }

            return "Agile AI University User";

        }


        /* ==================================================
           STATUS HELPERS
        ================================================== */

        function setStatusText(
            message
        ) {

            if (!statusText) {
                return;
            }

            statusText.textContent =
                normalizeText(
                    message
                );

        }


        function setEmailStatus(
            message,
            type = "neutral"
        ) {

            if (!emailStatus) {
                return;
            }

            emailStatus.textContent =
                normalizeText(
                    message
                );

            switch (type) {

                case "success":

                    emailStatus.style.color =
                        "#15803d";

                    break;

                case "error":

                    emailStatus.style.color =
                        "#b91c1c";

                    break;

                default:

                    emailStatus.style.color =
                        "";

                    break;

            }

        }


        /* ==================================================
           UI HELPERS
        ================================================== */

        function showSignedOut() {

            if (signedOutUI) {

                signedOutUI.hidden =
                    false;

                signedOutUI.style.display =
                    "block";

            }

            if (signedInUI) {

                signedInUI.hidden =
                    true;

                signedInUI.style.display =
                    "none";

            }

            if (userName) {

                userName.textContent =
                    "";

            }

            if (userEmail) {

                userEmail.textContent =
                    "";

            }

        }


        function showSignedIn(
            user
        ) {

            if (signedOutUI) {

                signedOutUI.hidden =
                    true;

                signedOutUI.style.display =
                    "none";

            }

            if (signedInUI) {

                signedInUI.hidden =
                    false;

                signedInUI.style.display =
                    "block";

            }

            if (userName) {

                userName.textContent =
                    resolveDisplayName(
                        user
                    );

            }

            if (userEmail) {

                userEmail.textContent =
                    normalizeText(
                        user?.email
                    );

            }

        }


        /* ==================================================
           COMPLETE EMAIL LINK SIGN-IN
        ================================================== */

        async function completeEmailLinkSignIn() {

            const authService =
                getAAIUAuth();

            if (
                !authService ||
                typeof authService
                    .completeEmailLinkSignIn !==
                    "function"
            ) {

                console.warn(
                    `[${CONTROLLER_NAME}] Email-link completion service not available`
                );

                return;

            }

            try {

                await authService
                    .completeEmailLinkSignIn();

                console.log(
                    `[${CONTROLLER_NAME}] Email link completion processed`
                );

            } catch (error) {

                console.error(
                    `[${CONTROLLER_NAME}] Email link sign-in failed`,
                    error
                );

                setEmailStatus(
                    error?.message ||
                    "Unable to complete email sign-in.",
                    "error"
                );

            }

        }


        /* ==================================================
           AUTH READINESS
        ================================================== */

        async function resolveInitialAuthenticationState() {

            try {

                if (
                    !window.__AAIU_AUTH_READY__
                ) {

                    console.warn(
                        `[${CONTROLLER_NAME}] __AAIU_AUTH_READY__ not available`
                    );

                    showSignedOut();

                    return null;

                }

                const authState =
                    await window
                        .__AAIU_AUTH_READY__;

                if (authState?.user) {

                    console.log(
                        `[${CONTROLLER_NAME}] Existing authenticated session found`
                    );

                    showSignedIn(
                        authState.user
                    );

                    return authState.user;

                }

                showSignedOut();

                return null;

            } catch (error) {

                console.error(
                    `[${CONTROLLER_NAME}] Auth initialization failed`,
                    error
                );

                showSignedOut();

                return null;

            }

        }


        /* ==================================================
           AUTH STATE LISTENER
        ================================================== */

        function registerAuthStateListener() {

            const firebaseAuth =
                getFirebaseAuth();

            if (
                !firebaseAuth ||
                typeof firebaseAuth
                    .onAuthStateChanged !==
                    "function"
            ) {

                console.warn(
                    `[${CONTROLLER_NAME}] Firebase Auth state listener not available`
                );

                return;

            }

            firebaseAuth.onAuthStateChanged(

                function handleAuthStateChanged(
                    user
                ) {

                    if (user) {

                        console.log(
                            `[${CONTROLLER_NAME}] Authenticated:`,
                            user.email ||
                            user.uid ||
                            "authenticated user"
                        );

                        showSignedIn(
                            user
                        );

                    } else {

                        console.log(
                            `[${CONTROLLER_NAME}] Signed out`
                        );

                        showSignedOut();

                    }

                },

                function handleAuthStateError(
                    error
                ) {

                    console.error(
                        `[${CONTROLLER_NAME}] Auth state listener failed`,
                        error
                    );

                    showSignedOut();

                }

            );

        }


        /* ==================================================
           GOOGLE SIGN-IN
        ================================================== */

        if (btnGoogle) {

            btnGoogle.addEventListener(

                "click",

                async function handleGoogleSignIn() {

                    const authService =
                        getAAIUAuth();

                    if (
                        !authService ||
                        typeof authService
                            .signInWithGoogle !==
                            "function"
                    ) {

                        console.error(
                            `[${CONTROLLER_NAME}] Google sign-in service not available`
                        );

                        setStatusText(
                            "Google Sign-In is temporarily unavailable."
                        );

                        return;

                    }

                    btnGoogle.disabled =
                        true;

                    try {

                        setStatusText(
                            "Opening secure Google Sign-In..."
                        );

                        await authService
                            .signInWithGoogle();

                    } catch (error) {

                        console.error(
                            `[${CONTROLLER_NAME}] Google sign-in failed`,
                            error
                        );

                        setStatusText(
                            error?.message ||
                            "Unable to sign in with Google."
                        );

                    } finally {

                        btnGoogle.disabled =
                            false;

                    }

                }

            );

        }


        /* ==================================================
           EMAIL VALIDATION
        ================================================== */

        function isValidEmail(
            value
        ) {

            const email =
                normalizeText(
                    value
                );

            if (!email) {

                return false;

            }

            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email);

        }


        /* ==================================================
           EMAIL MAGIC LINK
        ================================================== */

        if (btnEmailLink) {

            btnEmailLink.addEventListener(

                "click",

                async function handleEmailLinkRequest() {

                    const email =
                        normalizeText(
                            emailInput?.value
                        );

                    if (!email) {

                        setEmailStatus(
                            "Please enter your email address.",
                            "error"
                        );

                        emailInput?.focus();

                        return;

                    }

                    if (
                        !isValidEmail(
                            email
                        )
                    ) {

                        setEmailStatus(
                            "Please enter a valid email address.",
                            "error"
                        );

                        emailInput?.focus();

                        return;

                    }

                    const authService =
                        getAAIUAuth();

                    if (
                        !authService ||
                        typeof authService
                            .sendEmailLink !==
                            "function"
                    ) {

                        console.error(
                            `[${CONTROLLER_NAME}] Email-link service not available`
                        );

                        setEmailStatus(
                            "Email sign-in is temporarily unavailable.",
                            "error"
                        );

                        return;

                    }

                    btnEmailLink.disabled =
                        true;

                    setEmailStatus(
                        "Sending secure login link...",
                        "neutral"
                    );

                    try {

                        await authService
                            .sendEmailLink(
                                email
                            );

                        setEmailStatus(
                            "Login link sent. Check your email.",
                            "success"
                        );

                        console.log(
                            `[${CONTROLLER_NAME}] Login link sent`,
                            email
                        );

                    } catch (error) {

                        console.error(
                            `[${CONTROLLER_NAME}] Email link failed`,
                            error
                        );

                        setEmailStatus(
                            error?.message ||
                            error?.code ||
                            "Unable to send login link.",
                            "error"
                        );

                    } finally {

                        btnEmailLink.disabled =
                            false;

                    }

                }

            );

        }


        /* ==================================================
           EMAIL INPUT EXPERIENCE
        ================================================== */

        if (emailInput) {

            emailInput.addEventListener(

                "input",

                function handleEmailInput() {

                    if (
                        emailStatus &&
                        emailStatus.textContent
                    ) {

                        setEmailStatus(
                            "",
                            "neutral"
                        );

                    }

                }

            );

            emailInput.addEventListener(

                "keydown",

                function handleEmailEnter(
                    event
                ) {

                    if (
                        event.key ===
                        "Enter" &&
                        btnEmailLink
                    ) {

                        event.preventDefault();

                        btnEmailLink.click();

                    }

                }

            );

        }


        /* ==================================================
           SIGN OUT
        ================================================== */

        if (btnSignOut) {

            btnSignOut.addEventListener(

                "click",

                async function handleSignOut() {

                    const firebaseAuth =
                        getFirebaseAuth();

                    if (
                        !firebaseAuth ||
                        typeof firebaseAuth.signOut !==
                            "function"
                    ) {

                        console.error(
                            `[${CONTROLLER_NAME}] Sign-out service not available`
                        );

                        return;

                    }

                    btnSignOut.disabled =
                        true;

                    try {

                        await firebaseAuth
                            .signOut();

                        console.log(
                            `[${CONTROLLER_NAME}] Sign out successful`
                        );

                    } catch (error) {

                        console.error(
                            `[${CONTROLLER_NAME}] Sign out failed`,
                            error
                        );

                    } finally {

                        btnSignOut.disabled =
                            false;

                    }

                }

            );

        }


        /* ==================================================
           INITIALIZATION SEQUENCE
        ================================================== */

        await completeEmailLinkSignIn();

        await resolveInitialAuthenticationState();

        registerAuthStateListener();


        console.log(
            `[${CONTROLLER_NAME}] Controller v${VERSION} ready`
        );

    }

);