/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : firebase-init.js
   Version   : 1.4.0
   Status    : ACTIVE
   Phase     : Dedicated Authentication Stabilization

   Purpose
   ----------------------------------------------------------
   Initializes Firebase and exposes the governed low-level
   authentication service used by the portal authentication
   facade and dedicated sign-in experience.

   Responsibilities
   ----------------------------------------------------------
   ✓ Initialize Firebase once
   ✓ Expose Firebase Authentication runtime
   ✓ Expose Firestore runtime for governed read services
   ✓ Provide Google sign-in
   ✓ Send passwordless email sign-in links
   ✓ Complete passwordless email-link sign-in
   ✓ Maintain the authentication-readiness contract
   ✓ Preserve backward compatibility with legacy email keys
   ✓ Avoid browser-prompt authentication collection
   ✓ Publish authentication lifecycle diagnostics

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Portal authorization
   ✗ Entitlement resolution
   ✗ Credential retrieval
   ✗ Dashboard rendering
   ✗ Login-page UI rendering
   ✗ Protected-route redirection
   ✗ Explicit sign-out orchestration
   ✗ Portal cache or runtime cleanup

   Governance
   ----------------------------------------------------------
   • Firebase Authentication is the identity authority.

   • window.AAIUAuth is the low-level authentication API.

   • portal-auth.js owns the governed public PortalAuth API.

   • login.js owns dedicated sign-in-page interaction.

   • PortalSessionService is the sole explicit sign-out
     authority.

   • Authentication readiness resolves only after Firebase
     restores the initial authentication state.

   • An email-link return remains pending until the dedicated
     login controller completes it.

   • Portal-owned email-link state uses the namespaced key:

       aaiu.portal.emailForSignIn

   • Legacy keys are read temporarily and removed after a
     successful email-link completion.

   Change History
   ----------------------------------------------------------
   v1.4.0

   • Standardized the email-link return URL on /login.html
   • Standardized portal-owned email-link storage
   • Added legacy email-key compatibility and cleanup
   • Removed browser prompt dependency
   • Added explicit email-confirmation-required result
   • Added current-user and email-link inspection APIs
   • Added defensive storage handling
   • Aligned the configured production Storage bucket
   • Preserved Google sign-in and auth-readiness contracts

   v1.3.0

   • Added Firestore compat initialization
   • Exposed window.db for read-only portal services
   • Preserved auth readiness contract

========================================================== */

(function (
    window
) {

    "use strict";


    /* ======================================================
       MODULE IDENTITY
    ====================================================== */

    const MODULE_NAME =
        "AAIUAuth";

    const MODULE_VERSION =
        "1.4.0";


    /* ======================================================
       CONFIGURATION
    ====================================================== */

    const FIREBASE_CONFIG =
        Object.freeze({

            apiKey:
                "AIzaSyCti7ubJjnU8LJTghNaXhaSZzqCpozkeXg",

            authDomain:
                "fb-agileai-university.firebaseapp.com",

            projectId:
                "fb-agileai-university",

            storageBucket:
                "fb-agileai-university.firebasestorage.app",

            messagingSenderId:
                "458881040066",

            appId:
                "1:458881040066:web:c832c420f9b4282e76c55b"

        });


    const DEFAULT_EMAIL_LINK_RETURN_URL =
        "https://portal.agileai.university/login.html";


    const EMAIL_STORAGE_KEY =
        "aaiu.portal.emailForSignIn";


    const LEGACY_EMAIL_STORAGE_KEYS =
        Object.freeze([

            "aaiuEmailForSignIn",

            "emailForSignIn"

        ]);


    /* ======================================================
       STATE
    ====================================================== */

    let auth =
        null;

    let db =
        null;

    let authReadyResolved =
        false;

    let resolveAuthReady =
        null;


    /* ======================================================
       AUTHENTICATION READINESS CONTRACT
    ====================================================== */

    window.__AAIU_AUTH_READY__ =
        new Promise(
            function (
                resolve
            ) {

                resolveAuthReady =
                    resolve;

            }
        );


    function resolveReadiness(
        user,
        error = null
    ) {

        if (
            authReadyResolved
        ) {

            return;

        }

        authReadyResolved =
            true;

        resolveAuthReady?.({

            auth,

            user:
                user ||
                null,

            db:
                db ||
                null,

            error:
                error ||
                null

        });

    }


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


    function normalizeEmail(
        value
    ) {

        return normalizeString(
            value
        )
            .toLowerCase();

    }


    function resolveEmailLinkReturnUrl() {

        return normalizeString(
            window.__AAIU_EMAIL_LINK_RETURN_URL__
        ) ||
        DEFAULT_EMAIL_LINK_RETURN_URL;

    }


    /* ======================================================
       STORAGE HELPERS
    ====================================================== */

    function readStoredEmail() {

        const keys = [

            EMAIL_STORAGE_KEY,

            ...LEGACY_EMAIL_STORAGE_KEYS

        ];

        for (
            const key of keys
        ) {

            try {

                const email =
                    normalizeEmail(
                        window.localStorage
                            .getItem(
                                key
                            )
                    );

                if (
                    email
                ) {

                    return email;

                }

            } catch (
                error
            ) {

                console.warn(
                    `[${MODULE_NAME}] Unable to read email-link state.`,
                    error
                );

                return "";

            }

        }

        return "";

    }


    function storeEmail(
        email
    ) {

        const normalizedEmail =
            normalizeEmail(
                email
            );

        if (
            !normalizedEmail
        ) {

            return;

        }

        try {

            window.localStorage
                .setItem(
                    EMAIL_STORAGE_KEY,
                    normalizedEmail
                );

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to preserve email-link state.`,
                error
            );

        }

    }


    function clearStoredEmail() {

        const keys = [

            EMAIL_STORAGE_KEY,

            ...LEGACY_EMAIL_STORAGE_KEYS

        ];

        keys.forEach(
            function (
                key
            ) {

                try {

                    window.localStorage
                        .removeItem(
                            key
                        );

                } catch (
                    error
                ) {

                    console.warn(
                        `[${MODULE_NAME}] Unable to clear email-link state.`,
                        error
                    );

                }

            }
        );

    }


    /* ======================================================
       RUNTIME ACCESS
    ====================================================== */

    function getAuth() {

        return auth;

    }


    function getCurrentUser() {

        return auth?.currentUser ||
            null;

    }


    function isEmailLink(
        url = window.location.href
    ) {

        if (
            !auth ||
            typeof auth.isSignInWithEmailLink !==
                "function"
        ) {

            return false;

        }

        try {

            return auth.isSignInWithEmailLink(
                url
            );

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to inspect email sign-in link.`,
                error
            );

            return false;

        }

    }


    /* ======================================================
       GOOGLE SIGN-IN
    ====================================================== */

    async function signInWithGoogle() {

        if (
            !auth
        ) {

            throw new Error(
                "Firebase Authentication is unavailable."
            );

        }

        const provider =
            new window.firebase.auth
                .GoogleAuthProvider();

        return auth.signInWithPopup(
            provider
        );

    }


    /* ======================================================
       SEND EMAIL SIGN-IN LINK
    ====================================================== */

    async function sendEmailLink(
        email
    ) {

        if (
            !auth
        ) {

            throw new Error(
                "Firebase Authentication is unavailable."
            );

        }

        const normalizedEmail =
            normalizeEmail(
                email
            );

        if (
            !normalizedEmail
        ) {

            throw new Error(
                "A valid email address is required."
            );

        }

        const actionCodeSettings = {

            url:
                resolveEmailLinkReturnUrl(),

            handleCodeInApp:
                true

        };

        await auth.sendSignInLinkToEmail(
            normalizedEmail,
            actionCodeSettings
        );

        storeEmail(
            normalizedEmail
        );

        return Object.freeze({

            success:
                true,

            email:
                normalizedEmail,

            returnUrl:
                actionCodeSettings.url

        });

    }


    /* ======================================================
       COMPLETE EMAIL-LINK SIGN-IN
    ====================================================== */

    async function completeEmailLinkSignIn(
        suppliedEmail = ""
    ) {

        if (
            !auth
        ) {

            throw new Error(
                "Firebase Authentication is unavailable."
            );

        }

        const currentUrl =
            window.location.href;

        if (
            !isEmailLink(
                currentUrl
            )
        ) {

            return Object.freeze({

                completed:
                    false,

                requiresEmail:
                    false,

                reason:
                    "not-email-link"

            });

        }

        const email =
            normalizeEmail(
                suppliedEmail
            ) ||
            readStoredEmail();

        if (
            !email
        ) {

            return Object.freeze({

                completed:
                    false,

                requiresEmail:
                    true,

                reason:
                    "email-confirmation-required"

            });

        }

        const result =
            await auth.signInWithEmailLink(
                email,
                currentUrl
            );

        clearStoredEmail();

        resolveReadiness(
            result?.user ||
            auth.currentUser ||
            null
        );

        return Object.freeze({

            completed:
                true,

            requiresEmail:
                false,

            user:
                result?.user ||
                auth.currentUser ||
                null,

            result

        });

    }


    /* ======================================================
       PUBLIC AUTHENTICATION API
    ====================================================== */

    function registerPublicApi() {

        window.AAIUAuth =
            Object.freeze({

                signInWithGoogle,

                sendEmailLink,

                completeEmailLinkSignIn,

                getAuth,

                getCurrentUser,

                isEmailLink,

                getStoredEmail() {

                    return readStoredEmail();

                },

                clearStoredEmail,

                getState() {

                    return Object.freeze({

                        initialized:
                            Boolean(auth),

                        authReadyResolved,

                        hasCurrentUser:
                            Boolean(
                                getCurrentUser()
                            ),

                        isEmailLink:
                            isEmailLink(),

                        version:
                            MODULE_VERSION

                    });

                }

            });

    }


    /* ======================================================
       INITIALIZATION
    ====================================================== */

    function initialize() {

        console.info(
            `[${MODULE_NAME}] Firebase Auth Service v${MODULE_VERSION} initializing.`
        );

        try {

            if (
                !window.firebase
            ) {

                throw new Error(
                    "Firebase SDK is unavailable."
                );

            }

            if (
                !window.firebase.apps.length
            ) {

                window.firebase.initializeApp(
                    FIREBASE_CONFIG
                );

                console.info(
                    `[${MODULE_NAME}] Firebase initialized.`
                );

            }

            auth =
                window.firebase.auth();

            if (
                window.firebase.firestore &&
                typeof window.firebase.firestore ===
                    "function"
            ) {

                db =
                    window.firebase.firestore();

                window.db =
                    db;

                console.info(
                    `[${MODULE_NAME}] Firestore ready.`
                );

            } else {

                console.warn(
                    `[${MODULE_NAME}] Firestore compat SDK is not loaded.`
                );

            }

            registerPublicApi();

            auth.onAuthStateChanged(
                function (
                    user
                ) {

                    if (
                        authReadyResolved
                    ) {

                        return;

                    }

                    if (
                        !user &&
                        isEmailLink()
                    ) {

                        console.info(
                            `[${MODULE_NAME}] Waiting for email-link completion.`
                        );

                        return;

                    }

                    console.info(
                        `[${MODULE_NAME}] Authentication ready:`,
                        user?.email ||
                        "anonymous"
                    );

                    resolveReadiness(
                        user ||
                        null
                    );

                },
                function (
                    error
                ) {

                    console.error(
                        `[${MODULE_NAME}] Authentication-state restoration failed.`,
                        error
                    );

                    resolveReadiness(
                        null,
                        error
                    );

                }
            );

        } catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] Initialization failed.`,
                error
            );

            registerPublicApi();

            resolveReadiness(
                null,
                error
            );

        }

    }


    initialize();


})(window);