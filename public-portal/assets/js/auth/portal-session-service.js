/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : portal-session-service.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Dedicated Login and Session Stabilization

   Purpose
   ----------------------------------------------------------
   Provides the authoritative sign-out and authenticated
   portal-session cleanup workflow.

   Responsibilities
   ----------------------------------------------------------
   ✓ Coordinate Firebase sign-out
   ✓ Prevent duplicate sign-out requests
   ✓ Close open portal workspaces
   ✓ Clear portal-owned transient storage
   ✓ Clear governed service caches
   ✓ Reset toolbar and sidebar identity presentation
   ✓ Clear sensitive authenticated UI content
   ✓ Publish session lifecycle events
   ✓ Redirect safely to the dedicated login page
   ✓ Preserve theme and non-sensitive preferences
   ✓ Recover safely when optional services are unavailable
   ✓ Preserve authenticated UI when Firebase sign-out fails
   ✓ Support controlled sign-out without redirect
   ✓ Support explicit session cleanup diagnostics

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Authentication decisions
   ✗ Authorization decisions
   ✗ Entitlement resolution
   ✗ Firestore security
   ✗ Permanent account deletion
   ✗ Firebase internal storage manipulation
   ✗ Clearing all localStorage
   ✗ Clearing all sessionStorage
   ✗ Revoking authentication on other devices
   ✗ Server-side token revocation
   ✗ Redirecting unauthenticated users during startup
   ✗ Login-page orchestration
   ✗ Login-provider implementation

   Architectural Position
   ----------------------------------------------------------
   Toolbar / Account Menu
        ↓
   PortalSessionService
        ↓
   Close Sensitive Workspaces
        ↓
   Firebase Authentication Sign-Out
        ↓
   Portal Runtime Cleanup
        ↓
   Dedicated Login Experience

   Governance
   ----------------------------------------------------------
   • This service is the sole portal authority for explicit
     user-initiated sign-out.

   • UI components must call:

       PortalSessionService.signOut()

     and must not independently clear portal state.

   • Firebase Authentication remains the authentication
     authority.

   • Firestore Security Rules and backend authorization
     remain the actual security boundary.

   • Runtime cleanup improves privacy, memory hygiene and
     consistency but must never be treated as authorization.

   • Only Agile AI University-owned transient storage keys
     may be removed.

   • Theme, accessibility, language and other safe user
     preferences must remain available after sign-out.

   • Firebase internal browser-storage keys must never be
     removed manually.

   • Optional component cleanup must remain defensive and
     must not prevent Firebase sign-out.

   • The dedicated login page is:

       /login.html

   • Redirect must use location.replace() so browser Back
     does not reopen the authenticated portal route.

   • Portal runtime cleanup should occur after Firebase
     confirms sign-out.

   • Open sensitive overlays may be closed before Firebase
     sign-out to prevent continued interaction during the
     sign-out operation.

   Sign-Out Lifecycle
   ----------------------------------------------------------
   Sign-Out Requested
        ↓
   Duplicate Request Guard
        ↓
   portal:signout-started
        ↓
   Disable Sign-Out Interaction
        ↓
   Close Sensitive Workspaces
        ↓
   Firebase signOut()
        ↓
   Clear Governed Service Caches
        ↓
   Clear Portal-Owned Storage
        ↓
   Clear Sensitive Authenticated UI
        ↓
   Reset Runtime Globals
        ↓
   Reset Identity Presentation
        ↓
   portal:signout-completed
        ↓
   location.replace("/login.html")

   Failure Behaviour
   ----------------------------------------------------------
   Workspace cleanup failure
   → Log warning
   → Continue Firebase sign-out

   Firebase sign-out failure
   → Do not clear authenticated runtime state
   → Publish portal:signout-failed
   → Restore sign-out availability
   → Remain on the current page
   → Allow the user to retry

   Post-sign-out cleanup failure
   → Log warning
   → Continue redirect to login page

   Change History
   ----------------------------------------------------------
   v1.1.0

   • Changed default redirect to dedicated /login.html
   • Moved destructive portal cleanup after Firebase sign-out
   • Preserved authenticated runtime state on sign-out failure
   • Added sign-out UI state synchronization
   • Added page-level signing-out state
   • Added body interaction protection during sign-out
   • Added safer sensitive DOM cleanup
   • Added return-location cleanup
   • Added session service readiness API
   • Added explicit redirect API
   • Added cleanup diagnostics
   • Preserved theme and safe preferences
   • Preserved defensive optional-service integration

   v1.0.0

   • Introduced governed portal sign-out authority
   • Added duplicate sign-out protection
   • Added defensive workspace cleanup
   • Added governed cache cleanup
   • Added portal-owned storage cleanup
   • Added toolbar and sidebar identity reset
   • Added lifecycle events
   • Added configurable login redirect
   • Preserved theme and safe user preferences
   • Added failure recovery and diagnostics

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
        "PortalSessionService";

    const MODULE_VERSION =
        "1.1.0";


    /* ======================================================
       CONFIGURATION
    ====================================================== */

    const DEFAULT_LOGIN_URL =
        "/login.html";


    /*
     * An authenticated page may override the destination
     * before this service loads:
     *
     * window.__AAIU_PORTAL_LOGIN_URL__ =
     *     "/login.html";
     */

    function resolveLoginUrl() {

        const configuredUrl =
            normalizeString(
                window.__AAIU_PORTAL_LOGIN_URL__
            );


        return configuredUrl ||
            DEFAULT_LOGIN_URL;

    }


    /* ======================================================
       PORTAL-OWNED SESSION STORAGE KEYS

       These are transient portal values only.

       Never replace this with:

       sessionStorage.clear()
    ====================================================== */

    const OWNED_SESSION_STORAGE_KEYS =
        Object.freeze([

            "aaiu.portal.returnUrl",

            "aaiu.portal.return_url",

            "aaiu.portal.pendingRoute",

            "aaiu.portal.pending_route",

            "aaiu.portal.redirectAfterLogin",

            "aaiu.portal.redirect_after_login",

            "aaiu.portal.registration",

            "aaiu.portal.registrationDraft",

            "aaiu.portal.registration_draft",

            "aaiu.portal.selectedCredential",

            "aaiu.portal.selected_credential",

            "aaiu.portal.activeCredential",

            "aaiu.portal.active_credential",

            "aaiu.portal.activeAsset",

            "aaiu.portal.active_asset",

            "aaiu.portal.paymentDraft",

            "aaiu.portal.payment_draft",

            "aaiu.portal.entitlements",

            "aaiu.portal.resolvedEntitlements",

            "aaiu.portal.resolved_entitlements",

            "aaiu.portal.identity",

            "aaiu.portal.session",

            "aaiu.portal.authenticatedUser",

            "aaiu.portal.authenticated_user"

        ]);


    /* ======================================================
       PORTAL-OWNED LOCAL STORAGE KEYS

       Only temporary workflow data belongs here.

       Never add:

       • theme preference
       • appearance preference
       • language preference
       • accessibility preference
       • Firebase internal keys
    ====================================================== */

    const OWNED_LOCAL_STORAGE_KEYS =
        Object.freeze([

            "aaiu.portal.registrationDraft",

            "aaiu.portal.registration_draft",

            "aaiu.portal.paymentDraft",

            "aaiu.portal.payment_draft",

            "aaiu.portal.pendingRoute",

            "aaiu.portal.pending_route",

            "aaiu.portal.redirectAfterLogin",

            "aaiu.portal.redirect_after_login"

        ]);


    /* ======================================================
       TRANSIENT PORTAL PREFIXES
    ====================================================== */

    const OWNED_TRANSIENT_PREFIXES =
        Object.freeze([

            "aaiu.portal.temp.",

            "aaiu.portal.runtime.",

            "aaiu.portal.cache.",

            "aaiu.portal.draft."

        ]);


    /* ======================================================
       PORTAL RUNTIME GLOBALS
    ====================================================== */

    const PORTAL_RUNTIME_GLOBALS =
        Object.freeze([

            "__AAIU_PORTAL_STATE__",

            "__AAIU_SHARED_PORTAL_STATE__",

            "__AAIU_ENTITLEMENTS__",

            "__PORTAL_ENTITLEMENTS__",

            "__AAIU_RESOLVED_PORTAL_STATE__",

            "__AAIU_PORTAL_ACCESS__",

            "__AAIU_ACTIVE_CREDENTIAL__",

            "__AAIU_ACTIVE_CREDENTIAL_ID__",

            "__AAIU_ACTIVE_ASSET__",

            "__AAIU_PORTAL_IDENTITY__",

            "__AAIU_AUTHENTICATED_USER__",

            "__AAIU_AUTH_USER__",

            "__AAIU_DASHBOARD_VIEW_MODEL__"

        ]);


    /* ======================================================
       PORTAL RUNTIME FLAGS
    ====================================================== */

    const PORTAL_RUNTIME_FLAGS =
        Object.freeze([

            "__credentialsRendererInitialized",

            "__credentialServiceInitialized",

            "__portalEntitlementsResolved",

            "__portalIdentityResolved",

            "__portalDashboardInitialized",

            "__portalDashboardRendered"

        ]);


    /* ======================================================
       STATE
    ====================================================== */

    let signOutPromise =
        null;

    let signOutInProgress =
        false;

    let lastSignOutError =
        null;

    let initialized =
        false;


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


    function safeErrorMessage(
        error
    ) {

        return normalizeString(

            error?.message ||

            error?.code ||

            error

        ) ||
        "Unknown sign-out error.";

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
       PAGE SIGN-OUT STATE
    ====================================================== */

    function setPageSignOutState(
        active
    ) {

        try {

            document.documentElement
                .classList
                .toggle(
                    "portal-signing-out",
                    active
                );


            document.body
                ?.classList
                .toggle(
                    "portal-signing-out",
                    active
                );


            if (
                active
            ) {

                document.documentElement
                    .setAttribute(
                        "data-portal-session-state",
                        "signing-out"
                    );

            } else {

                document.documentElement
                    .removeAttribute(
                        "data-portal-session-state"
                    );

            }

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to update page sign-out state.`,
                error
            );

        }

    }


    /* ======================================================
       SIGN-OUT CONTROL STATE
    ====================================================== */

    function updateSignOutControls(
        active
    ) {

        const selectors = [

            "#btnSignOut",

            "#toolbarSignOut",

            "#sidebarSignOut",

            ".js-portal-sign-out",

            "[data-portal-sign-out]"

        ];


        selectors.forEach(

            selector => {

                document
                    .querySelectorAll(
                        selector
                    )
                    .forEach(

                        element => {

                            try {

                                if (
                                    "disabled" in element
                                ) {

                                    element.disabled =
                                        active;

                                }


                                element.setAttribute(
                                    "aria-busy",
                                    active
                                        ? "true"
                                        : "false"
                                );


                                if (
                                    active
                                ) {

                                    element.dataset
                                        .originalText =
                                            element.textContent ||
                                            "";

                                    element.textContent =
                                        "Signing Out…";

                                } else if (
                                    element.dataset
                                        .originalText
                                ) {

                                    element.textContent =
                                        element.dataset
                                            .originalText;

                                    delete element.dataset
                                        .originalText;

                                }

                            } catch (
                                error
                            ) {

                                console.warn(
                                    `[${MODULE_NAME}] Unable to update a sign-out control.`,
                                    error
                                );

                            }

                        }

                    );

            }

        );

    }


    /* ======================================================
       SAFE OPTIONAL METHOD INVOCATION
    ====================================================== */

    async function invokeOptionalMethod(
        owner,
        methodNames,
        label
    ) {

        if (
            !owner ||
            !Array.isArray(
                methodNames
            )
        ) {

            return false;

        }


        for (
            const methodName of methodNames
        ) {

            const method =
                owner[
                    methodName
                ];


            if (
                typeof method !==
                "function"
            ) {

                continue;

            }


            try {

                await method.call(
                    owner
                );


                console.info(
                    `[${MODULE_NAME}] ${label} completed using ${methodName}().`
                );


                return true;

            } catch (
                error
            ) {

                console.warn(
                    `[${MODULE_NAME}] ${label} failed using ${methodName}().`,
                    error
                );


                return false;

            }

        }


        return false;

    }


    /* ======================================================
       CLOSE OPEN PORTAL WORKSPACES

       This is permitted before Firebase sign-out because it
       prevents interaction with sensitive open content while
       the sign-out operation is running.
    ====================================================== */

    async function closeOpenWorkspaces() {

        const cleanupTargets = [

            {
                owner:
                    window.CredentialDetailOverlay,

                methods: [
                    "close",
                    "reset"
                ],

                label:
                    "Credential Detail Overlay cleanup"
            },

            {
                owner:
                    window.CredentialAssetPreview,

                methods: [
                    "close",
                    "reset"
                ],

                label:
                    "Credential Asset Preview cleanup"
            },

            {
                owner:
                    window.UpgradeRegistrationOverlay,

                methods: [
                    "close",
                    "reset"
                ],

                label:
                    "Upgrade Registration Overlay cleanup"
            },

            {
                owner:
                    window.PortalOverlay,

                methods: [
                    "closeAll",
                    "close",
                    "reset"
                ],

                label:
                    "Portal Overlay cleanup"
            }

        ];


        for (
            const target of cleanupTargets
        ) {

            await invokeOptionalMethod(
                target.owner,
                target.methods,
                target.label
            );

        }


        /*
         * Defensive visual fallback.
         *
         * Component lifecycle methods remain authoritative.
         */

        const overlaySelectors = [

            ".credential-detail-overlay",

            ".credential-asset-preview-overlay",

            ".upgrade-registration-overlay",

            ".portal-overlay",

            "[data-portal-overlay]"

        ];


        overlaySelectors.forEach(

            selector => {

                document
                    .querySelectorAll(
                        selector
                    )
                    .forEach(

                        element => {

                            try {

                                element.hidden =
                                    true;


                                element.setAttribute(
                                    "aria-hidden",
                                    "true"
                                );

                            } catch (
                                error
                            ) {

                                console.warn(
                                    `[${MODULE_NAME}] Unable to hide overlay ${selector}.`,
                                    error
                                );

                            }

                        }

                    );

            }

        );

    }


    /* ======================================================
       CLEAR GOVERNED SERVICE CACHES
    ====================================================== */

    async function clearServiceCaches() {

        const cacheTargets = [

            {
                owner:
                    window.ProgramService,

                methods: [
                    "clearCache",
                    "reset"
                ],

                label:
                    "ProgramService cache cleanup"
            },

            {
                owner:
                    window.CredentialService,

                methods: [
                    "clearCache",
                    "reset"
                ],

                label:
                    "CredentialService cache cleanup"
            },

            {
                owner:
                    window.CredentialRegistry,

                methods: [
                    "clearCache",
                    "reset"
                ],

                label:
                    "CredentialRegistry cache cleanup"
            },

            {
                owner:
                    window.CredentialAssetService,

                methods: [
                    "clearCache",
                    "reset"
                ],

                label:
                    "CredentialAssetService cache cleanup"
            },

            {
                owner:
                    window.LearningResourceService,

                methods: [
                    "clearCache",
                    "reset"
                ],

                label:
                    "LearningResourceService cache cleanup"
            },

            {
                owner:
                    window.EligibilityService,

                methods: [
                    "clearCache",
                    "reset"
                ],

                label:
                    "EligibilityService cache cleanup"
            },

            {
                owner:
                    window.EntitlementService,

                methods: [
                    "clearCache",
                    "reset"
                ],

                label:
                    "EntitlementService cache cleanup"
            },

            {
                owner:
                    window.PortalEntitlementService,

                methods: [
                    "clearCache",
                    "reset"
                ],

                label:
                    "PortalEntitlementService cache cleanup"
            },

            {
                owner:
                    window.RecognitionService,

                methods: [
                    "clearCache",
                    "reset"
                ],

                label:
                    "RecognitionService cache cleanup"
            },

            {
                owner:
                    window.DashboardService,

                methods: [
                    "clearCache",
                    "reset"
                ],

                label:
                    "DashboardService cache cleanup"
            }

        ];


        for (
            const target of cacheTargets
        ) {

            await invokeOptionalMethod(
                target.owner,
                target.methods,
                target.label
            );

        }

    }


    /* ======================================================
       RESET PORTAL IDENTITY PRESENTATION
    ====================================================== */

    async function resetIdentityPresentation() {

        const signedOutIdentity = {

            displayName:
                "Learner",

            email:
                "",

            roleLabel:
                "Student",

            membershipLabel:
                "University Member",

            initials:
                "LE"

        };


        try {

            if (
                window.PortalToolbar &&
                typeof window.PortalToolbar
                    .updateIdentity ===
                    "function"
            ) {

                window.PortalToolbar
                    .updateIdentity(
                        signedOutIdentity
                    );

            }

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Toolbar identity reset failed.`,
                error
            );

        }


        try {

            if (
                window.PortalSidebar &&
                typeof window.PortalSidebar
                    .updateIdentity ===
                    "function"
            ) {

                window.PortalSidebar
                    .updateIdentity(
                        signedOutIdentity
                    );

            }

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Sidebar identity reset failed.`,
                error
            );

        }

    }


    /* ======================================================
       STORAGE KEY REMOVAL
    ====================================================== */

    function removeStorageKey(
        storage,
        key,
        storageLabel
    ) {

        try {

            storage.removeItem(
                key
            );

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to remove ${storageLabel} key: ${key}.`,
                error
            );

        }

    }


    /* ======================================================
       PREFIXED STORAGE CLEANUP
    ====================================================== */

    function clearPrefixedStorage(
        storage,
        storageLabel
    ) {

        try {

            const keysToRemove =
                [];


            for (
                let index = 0;
                index < storage.length;
                index += 1
            ) {

                const key =
                    storage.key(
                        index
                    );


                if (
                    !key
                ) {

                    continue;

                }


                const owned =
                    OWNED_TRANSIENT_PREFIXES
                        .some(

                            prefix =>
                                key.startsWith(
                                    prefix
                                )

                        );


                if (
                    owned
                ) {

                    keysToRemove.push(
                        key
                    );

                }

            }


            keysToRemove
                .forEach(

                    key => {

                        removeStorageKey(
                            storage,
                            key,
                            storageLabel
                        );

                    }

                );

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to inspect ${storageLabel}.`,
                error
            );

        }

    }


    /* ======================================================
       CLEAR PORTAL-OWNED STORAGE
    ====================================================== */

    function clearOwnedStorage() {

        try {

            OWNED_SESSION_STORAGE_KEYS
                .forEach(

                    key => {

                        removeStorageKey(
                            window.sessionStorage,
                            key,
                            "sessionStorage"
                        );

                    }

                );


            clearPrefixedStorage(
                window.sessionStorage,
                "sessionStorage"
            );

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] sessionStorage cleanup failed.`,
                error
            );

        }


        try {

            OWNED_LOCAL_STORAGE_KEYS
                .forEach(

                    key => {

                        removeStorageKey(
                            window.localStorage,
                            key,
                            "localStorage"
                        );

                    }

                );


            clearPrefixedStorage(
                window.localStorage,
                "localStorage"
            );

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] localStorage cleanup failed.`,
                error
            );

        }

    }


    /* ======================================================
       RESET PORTAL RUNTIME GLOBALS
    ====================================================== */

    function resetRuntimeGlobals() {

        PORTAL_RUNTIME_GLOBALS
            .forEach(

                globalName => {

                    try {

                        if (
                            globalName in window
                        ) {

                            window[
                                globalName
                            ] =
                                null;

                        }

                    } catch (
                        error
                    ) {

                        console.warn(
                            `[${MODULE_NAME}] Unable to reset ${globalName}.`,
                            error
                        );

                    }

                }

            );


        PORTAL_RUNTIME_FLAGS
            .forEach(

                flagName => {

                    try {

                        if (
                            flagName in window
                        ) {

                            window[
                                flagName
                            ] =
                                false;

                        }

                    } catch (
                        error
                    ) {

                        console.warn(
                            `[${MODULE_NAME}] Unable to reset ${flagName}.`,
                            error
                        );

                    }

                }

            );

    }


    /* ======================================================
       CLEAR SENSITIVE DOM CONTENT

       Authenticated shell structure is preserved until the
       redirect occurs. Only sensitive dynamic content is
       removed.
    ====================================================== */

    function clearSensitiveDomContent() {

        const sensitiveSelectors = [

            "#credentials-container",

            "#credentials-list",

            "#recentCredentials",

            "#credential-preview-container",

            "#recognition-assets",

            "#credential-information",

            "#credential-actions",

            "#dashboardUpgrade",

            "#userName",

            "#userEmail",

            "[data-sensitive-portal-content]"

        ];


        sensitiveSelectors.forEach(

            selector => {

                document
                    .querySelectorAll(
                        selector
                    )
                    .forEach(

                        element => {

                            try {

                                element.textContent =
                                    "";

                                element.setAttribute(
                                    "aria-hidden",
                                    "true"
                                );

                            } catch (
                                error
                            ) {

                                console.warn(
                                    `[${MODULE_NAME}] Unable to clear sensitive content ${selector}.`,
                                    error
                                );

                            }

                        }

                    );

            }

        );

    }


    /* ======================================================
       POST-SIGN-OUT CLEANUP
    ====================================================== */

    async function clearRuntimeState() {

        publishEvent(
            "portal:session-cleanup-started"
        );


        try {

            await clearServiceCaches();

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Service cleanup encountered an error.`,
                error
            );

        }


        try {

            clearOwnedStorage();

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Storage cleanup encountered an error.`,
                error
            );

        }


        try {

            clearSensitiveDomContent();

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] DOM cleanup encountered an error.`,
                error
            );

        }


        try {

            resetRuntimeGlobals();

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Runtime-global cleanup encountered an error.`,
                error
            );

        }


        try {

            await resetIdentityPresentation();

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Identity cleanup encountered an error.`,
                error
            );

        }


        publishEvent(
            "portal:session-cleanup-completed"
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

            throw new Error(
                "Firebase Authentication is unavailable."
            );

        }


        const auth =
            window.firebase.auth();


        if (
            !auth ||
            typeof auth.signOut !==
                "function"
        ) {

            throw new Error(
                "Firebase Authentication signOut() is unavailable."
            );

        }


        return auth;

    }


    /* ======================================================
       REDIRECT
    ====================================================== */

    function redirectToLogin(
        redirectUrl
    ) {

        const targetUrl =
            normalizeString(
                redirectUrl
            ) ||
            resolveLoginUrl();


        console.info(
            `[${MODULE_NAME}] Redirecting to login experience:`,
            targetUrl
        );


        window.location.replace(
            targetUrl
        );

    }


    /* ======================================================
       SIGN OUT
    ====================================================== */

    async function signOut(
        options = {}
    ) {

        if (
            signOutPromise
        ) {

            return signOutPromise;

        }


        const redirect =
            options.redirect !==
            false;


        const redirectUrl =
            normalizeString(
                options.redirectUrl
            ) ||
            resolveLoginUrl();


        signOutInProgress =
            true;

        lastSignOutError =
            null;


        setPageSignOutState(
            true
        );


        updateSignOutControls(
            true
        );


        publishEvent(
            "portal:signout-started",
            {
                redirect,

                redirectUrl
            }
        );


        signOutPromise =
            (async function () {

                try {

                    /*
                     * Remove interaction with sensitive open
                     * workspaces before signing out.
                     *
                     * Failure here does not block sign-out.
                     */

                    try {

                        await closeOpenWorkspaces();

                    } catch (
                        cleanupError
                    ) {

                        console.warn(
                            `[${MODULE_NAME}] Pre-sign-out workspace cleanup failed.`,
                            cleanupError
                        );

                    }


                    /*
                     * Firebase Authentication is authoritative.
                     *
                     * Destructive runtime cleanup occurs only
                     * after signOut() succeeds.
                     */

                    const auth =
                        resolveFirebaseAuth();


                    await auth.signOut();


                    /*
                     * Authentication is now signed out.
                     * Runtime cleanup failures must not block
                     * redirect to the dedicated login page.
                     */

                    try {

                        await clearRuntimeState();

                    } catch (
                        cleanupError
                    ) {

                        console.warn(
                            `[${MODULE_NAME}] Post-sign-out runtime cleanup failed.`,
                            cleanupError
                        );

                    }


                    publishEvent(
                        "portal:signout-completed",
                        {
                            redirect,

                            redirectUrl
                        }
                    );


                    console.info(
                        `[${MODULE_NAME}] Sign-out completed successfully.`
                    );


                    if (
                        redirect
                    ) {

                        redirectToLogin(
                            redirectUrl
                        );

                    }


                    return Object.freeze({

                        success:
                            true,

                        redirected:
                            redirect,

                        redirectUrl:
                            redirect
                                ? redirectUrl
                                : ""

                    });

                } catch (
                    error
                ) {

                    lastSignOutError =
                        error;


                    publishEvent(
                        "portal:signout-failed",
                        {
                            message:
                                safeErrorMessage(
                                    error
                                )
                        }
                    );


                    console.error(
                        `[${MODULE_NAME}] Sign-out failed.`,
                        error
                    );


                    /*
                     * Preserve authenticated runtime state.
                     * Restore UI controls so the user can retry.
                     */

                    setPageSignOutState(
                        false
                    );


                    updateSignOutControls(
                        false
                    );


                    throw error;

                } finally {

                    signOutInProgress =
                        false;

                    signOutPromise =
                        null;


                    /*
                     * If redirect is disabled, restore normal
                     * page state after successful sign-out.
                     */

                    if (
                        !redirect
                    ) {

                        setPageSignOutState(
                            false
                        );


                        updateSignOutControls(
                            false
                        );

                    }

                }

            })();


        return signOutPromise;

    }


    /* ======================================================
       CONTROLLED SESSION CLEANUP

       This does not sign the user out.

       Use primarily for diagnostics, controlled reset flows
       and future authentication orchestration.

       Normal logout must call signOut().
    ====================================================== */

    async function clearSession(
        options = {}
    ) {

        const includeWorkspaceCleanup =
            options.includeWorkspaceCleanup !==
            false;


        const includeIdentityReset =
            options.includeIdentityReset !==
            false;


        if (
            includeWorkspaceCleanup
        ) {

            await closeOpenWorkspaces();

        }


        await clearServiceCaches();

        clearOwnedStorage();

        clearSensitiveDomContent();

        resetRuntimeGlobals();


        if (
            includeIdentityReset
        ) {

            await resetIdentityPresentation();

        }


        publishEvent(
            "portal:session-cleared"
        );


        return Object.freeze({

            success:
                true

        });

    }


    /* ======================================================
       STATE INSPECTION
    ====================================================== */

    function getState() {

        return Object.freeze({

            initialized,

            signOutInProgress,

            hasPendingSignOut:
                Boolean(
                    signOutPromise
                ),

            lastError:
                lastSignOutError

                    ? safeErrorMessage(
                        lastSignOutError
                    )

                    : null,

            loginUrl:
                resolveLoginUrl(),

            version:
                MODULE_VERSION

        });

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
            `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
        );


        publishEvent(
            "portal:session-service-ready",
            {
                loginUrl:
                    resolveLoginUrl()
            }
        );

    }


    /* ======================================================
       PUBLIC REGISTRATION
    ====================================================== */

    window.PortalSessionService =
        Object.freeze({

            signOut,

            clearSession,

            clearRuntimeState,

            closeOpenWorkspaces,

            redirectToLogin,

            getState,

            getLoginUrl() {

                return resolveLoginUrl();

            },

            isReady() {

                return initialized;

            },

            isSignOutInProgress() {

                return signOutInProgress;

            }

        });


    initialize();


})(window, document);