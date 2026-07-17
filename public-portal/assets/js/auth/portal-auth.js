/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : portal-auth.js
   Version   : 2.0.0
   Status    : ACTIVE
   Phase     : Identity-First Portal Authentication

   Purpose
   ----------------------------------------------------------
   Provides the governed portal authentication facade and
   protects authenticated portal pages before learner content
   becomes available.

   Responsibilities
   ----------------------------------------------------------
   ✓ Expose the public window.PortalAuth API
   ✓ Delegate authentication operations to window.AAIUAuth
   ✓ Resolve restored Firebase authentication state
   ✓ Protect authenticated portal pages
   ✓ Redirect unauthenticated users to /login.html
   ✓ Publish authentication and identity lifecycle events
   ✓ Revalidate protected pages restored from browser cache
   ✓ Reveal authenticated UI only after auth resolution
   ✓ Prevent duplicate redirects and observers

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Firebase application initialization
   ✗ Login-page button binding
   ✗ Login-page status presentation
   ✗ Explicit sign-out orchestration
   ✗ Portal cache or storage cleanup
   ✗ Authorization decisions
   ✗ Entitlement resolution
   ✗ Credential retrieval
   ✗ Firestore security

   Architectural Position
   ----------------------------------------------------------
   firebase-init.js / AAIUAuth
        ↓
   PortalAuth
        ├── login.js authentication delegation
        └── protected-page authentication guard
                 ↓
             Authorization
                 ↓
             Entitlements

   Governance
   ----------------------------------------------------------
   • Firebase Authentication remains the identity authority.

   • AAIUAuth remains the low-level authentication service.

   • PortalAuth is the public portal authentication facade.

   • login.js is the sole sign-in-page UI controller.

   • PortalSessionService is the sole explicit sign-out
     authority.

   • PortalAuth must never bind a Sign out button or call
     Firebase signOut() directly.

   • Protected content must remain unavailable until Firebase
     restores and confirms an authenticated user.

   • Unauthenticated protected routes redirect using
     location.replace() so browser Back does not restore a
     usable authenticated route.

   Change History
   ----------------------------------------------------------
   v2.0.0

   • Replaced legacy mixed page-controller architecture
   • Added governed public PortalAuth API
   • Removed login-page event bindings
   • Removed direct Firebase sign-out
   • Added authenticated-page protection
   • Added fail-closed unauthenticated redirection
   • Added browser back-forward cache revalidation
   • Added authentication lifecycle and identity events
   • Preserved Google and passwordless email delegation

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
        "PortalAuth";

    const MODULE_VERSION =
        "2.0.0";


    /* ======================================================
       CONFIGURATION
    ====================================================== */

    const DEFAULT_LOGIN_URL =
        "/login.html";


    const LOGIN_CONTEXTS =
        new Set([

            "portal-login",

            "login",

            "authentication-entry"

        ]);


    /* ======================================================
       STATE
    ====================================================== */

    let initialized =
        false;

    let authStateResolved =
        false;

    let currentUser =
        null;

    let redirectStarted =
        false;

    let authUnsubscribe =
        null;

    let readyResolve =
        null;


    const readyPromise =
        new Promise(
            function (
                resolve
            ) {

                readyResolve =
                    resolve;

            }
        );


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


    function resolveLoginUrl() {

        return normalizeString(
            window.__AAIU_PORTAL_LOGIN_URL__
        ) ||
        DEFAULT_LOGIN_URL;

    }


    function resolvePageContext() {

        return normalizeString(
            window.__AAIU_CONTEXT ||
            window.__AAIU_PAGE ||
            window.__AAIU_EXPERIENCE ||
            document.body?.dataset?.page ||
            document.body?.dataset?.experience
        )
            .toLowerCase();

    }


    function isLoginPage() {

        const values = [

            window.__AAIU_CONTEXT,

            window.__AAIU_PAGE,

            window.__AAIU_EXPERIENCE,

            document.body?.dataset?.page,

            document.body?.dataset?.experience

        ]
            .map(
                value =>
                    normalizeString(
                        value
                    )
                        .toLowerCase()
            );

        return values.some(
            value =>
                LOGIN_CONTEXTS.has(
                    value
                )
        );

    }


    function isProtectedPage() {

        return !isLoginPage();

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
       AUTHENTICATION SERVICE RESOLUTION
    ====================================================== */

    function resolveAAIUAuth() {

        const service =
            window.AAIUAuth;

        if (
            !service ||
            typeof service !==
                "object"
        ) {

            return null;

        }

        return service;

    }


    function resolveFirebaseAuth() {

        const service =
            resolveAAIUAuth();

        if (
            service &&
            typeof service.getAuth ===
                "function"
        ) {

            return service.getAuth();

        }

        try {

            if (
                window.firebase &&
                typeof window.firebase.auth ===
                    "function"
            ) {

                return window.firebase.auth();

            }

        } catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] Firebase Authentication resolution failed.`,
                error
            );

        }

        return null;

    }


    function getCurrentUser() {

        const service =
            resolveAAIUAuth();

        if (
            service &&
            typeof service.getCurrentUser ===
                "function"
        ) {

            return service.getCurrentUser();

        }

        return resolveFirebaseAuth()
            ?.currentUser ||
            currentUser ||
            null;

    }


    /* ======================================================
       AUTHENTICATION DELEGATION
    ====================================================== */

    async function signInWithGoogle() {

        const service =
            resolveAAIUAuth();

        if (
            !service ||
            typeof service.signInWithGoogle !==
                "function"
        ) {

            throw new Error(
                "Google authentication is unavailable."
            );

        }

        return service.signInWithGoogle();

    }


    async function sendEmailLink(
        email
    ) {

        const service =
            resolveAAIUAuth();

        if (
            !service ||
            typeof service.sendEmailLink !==
                "function"
        ) {

            throw new Error(
                "Email authentication is unavailable."
            );

        }

        return service.sendEmailLink(
            email
        );

    }


    async function completeEmailLinkSignIn(
        email = ""
    ) {

        const service =
            resolveAAIUAuth();

        if (
            !service ||
            typeof service.completeEmailLinkSignIn !==
                "function"
        ) {

            throw new Error(
                "Email-link completion is unavailable."
            );

        }

        return service.completeEmailLinkSignIn(
            email
        );

    }


    function isEmailLink() {

        const service =
            resolveAAIUAuth();

        return Boolean(
            service &&
            typeof service.isEmailLink ===
                "function" &&
            service.isEmailLink()
        );

    }


    /* ======================================================
       PROTECTED PAGE PRESENTATION
    ====================================================== */

    function setPageAuthState(
        state
    ) {

        const normalizedState =
            normalizeString(
                state
            );

        try {

            if (
                normalizedState
            ) {

                document.documentElement
                    .setAttribute(
                        "data-portal-auth-state",
                        normalizedState
                    );

                document.body
                    ?.setAttribute(
                        "data-portal-auth-state",
                        normalizedState
                    );

            }

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to update page authentication state.`,
                error
            );

        }

    }


    function revealAuthenticatedUi(
        user
    ) {

        setPageAuthState(
            "authenticated"
        );

        const signedOutUi =
            document.getElementById(
                "signedOutUI"
            );

        const signedInUi =
            document.getElementById(
                "signedInUI"
            );

        if (
            signedOutUi
        ) {

            signedOutUi.hidden =
                true;

            signedOutUi.setAttribute(
                "aria-hidden",
                "true"
            );

        }

        if (
            signedInUi
        ) {

            signedInUi.hidden =
                false;

            signedInUi.removeAttribute(
                "aria-hidden"
            );

        }

        publishEvent(
            "portal:identity-ready",
            {
                displayName:
                    normalizeString(
                        user?.displayName
                    ),

                email:
                    normalizeString(
                        user?.email
                    ),

                uid:
                    normalizeString(
                        user?.uid
                    ),

                user
            }
        );

        publishEvent(
            "portal:auth-authenticated",
            {
                email:
                    normalizeString(
                        user?.email
                    ),

                uid:
                    normalizeString(
                        user?.uid
                    )
            }
        );

    }


    function redirectToLogin(
        reason = "authentication-required"
    ) {

        if (
            redirectStarted ||
            !isProtectedPage()
        ) {

            return;

        }

        redirectStarted =
            true;

        setPageAuthState(
            "unauthenticated"
        );

        publishEvent(
            "portal:auth-redirecting",
            {
                reason,

                loginUrl:
                    resolveLoginUrl()
            }
        );

        window.location.replace(
            resolveLoginUrl()
        );

    }


    /* ======================================================
       AUTH STATE HANDLING
    ====================================================== */

    function handleResolvedUser(
        user,
        source
    ) {

        authStateResolved =
            true;

        currentUser =
            user ||
            null;

        readyResolve?.({
            user:
                currentUser,

            authenticated:
                Boolean(currentUser),

            source
        });

        readyResolve =
            null;

        if (
            !isProtectedPage()
        ) {

            publishEvent(
                "portal:auth-state-resolved",
                {
                    authenticated:
                        Boolean(currentUser),

                    source
                }
            );

            return;

        }

        if (
            currentUser
        ) {

            redirectStarted =
                false;

            revealAuthenticatedUi(
                currentUser
            );

            return;

        }

        redirectToLogin(
            source ||
            "authentication-required"
        );

    }


    function bindAuthStateObserver() {

        if (
            authUnsubscribe
        ) {

            return true;

        }

        const auth =
            resolveFirebaseAuth();

        if (
            !auth ||
            typeof auth.onAuthStateChanged !==
                "function"
        ) {

            console.error(
                `[${MODULE_NAME}] Firebase auth-state observer is unavailable.`
            );

            if (
                isProtectedPage()
            ) {

                redirectToLogin(
                    "authentication-unavailable"
                );

            }

            return false;

        }

        authUnsubscribe =
            auth.onAuthStateChanged(
                function (
                    user
                ) {

                    handleResolvedUser(
                        user,
                        "firebase-auth-state"
                    );

                },
                function (
                    error
                ) {

                    console.error(
                        `[${MODULE_NAME}] Authentication-state observation failed.`,
                        error
                    );

                    publishEvent(
                        "portal:auth-state-failed",
                        {
                            message:
                                normalizeString(
                                    error?.message ||
                                    error?.code
                                )
                        }
                    );

                    if (
                        isProtectedPage()
                    ) {

                        redirectToLogin(
                            "authentication-state-failed"
                        );

                    }

                }
            );

        return true;

    }


    async function resolveInitialState() {

        if (
            isProtectedPage()
        ) {

            setPageAuthState(
                "pending"
            );

        }

        bindAuthStateObserver();

        try {

            const readiness =
                await window.__AAIU_AUTH_READY__;

            if (
                readiness?.user
            ) {

                handleResolvedUser(
                    readiness.user,
                    "authentication-readiness"
                );

            } else if (
                isProtectedPage() &&
                !authStateResolved
            ) {

                handleResolvedUser(
                    null,
                    "authentication-readiness"
                );

            }

        } catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] Authentication readiness failed.`,
                error
            );

            if (
                isProtectedPage()
            ) {

                redirectToLogin(
                    "authentication-readiness-failed"
                );

            }

        }

    }


    /* ======================================================
       BROWSER CACHE REVALIDATION
    ====================================================== */

    function bindPageRestoreValidation() {

        window.addEventListener(
            "pageshow",
            function (
                event
            ) {

                if (
                    !isProtectedPage() ||
                    !event.persisted
                ) {

                    return;

                }

                const user =
                    getCurrentUser();

                if (
                    user
                ) {

                    revealAuthenticatedUi(
                        user
                    );

                    return;

                }

                redirectToLogin(
                    "browser-cache-restoration"
                );

            }
        );

    }


    /* ======================================================
       PUBLIC API
    ====================================================== */

    window.PortalAuth =
        Object.freeze({

            signInWithGoogle,

            googleSignIn:
                signInWithGoogle,

            sendEmailLink,

            sendSignInLink:
                sendEmailLink,

            completeEmailLinkSignIn,

            getCurrentUser,

            isEmailLink,

            whenReady() {

                return readyPromise;

            },

            isAuthenticated() {

                return Boolean(
                    getCurrentUser()
                );

            },

            getState() {

                return Object.freeze({

                    initialized,

                    authStateResolved,

                    authenticated:
                        Boolean(
                            getCurrentUser()
                        ),

                    pageContext:
                        resolvePageContext(),

                    protectedPage:
                        isProtectedPage(),

                    redirectStarted,

                    loginUrl:
                        resolveLoginUrl(),

                    version:
                        MODULE_VERSION

                });

            }

        });


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
            `[${MODULE_NAME}] Initializing v${MODULE_VERSION}.`
        );

        bindPageRestoreValidation();

        resolveInitialState();

        publishEvent(
            "portal:auth-service-ready",
            {
                pageContext:
                    resolvePageContext(),

                protectedPage:
                    isProtectedPage()
            }
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();

    }


})(window, document);