/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-service.js
   Version   : 1.3.0
   Status    : ACTIVE
   Phase     : Credential Portfolio Stabilization

   Purpose
   ----------------------------------------------------------
   Consumes resolved portal entitlement state and publishes
   the authenticated learner's visible credential portfolio.

   Responsibilities
   ----------------------------------------------------------
   ✓ Wait for portal entitlement readiness
   ✓ Recover when entitlement readiness occurred earlier
   ✓ Invoke the portal entitlement resolver
   ✓ Obtain resolver-approved visible credentials
   ✓ Validate visible credentials
   ✓ Normalize credential identifiers
   ✓ Enrich credentials with programme metadata
   ✓ Publish the normalized credential collection
   ✓ Provide safe credential lookup APIs
   ✓ Invoke the shared credential renderer
   ✓ Manage credential portfolio loading lifecycle
   ✓ Provide a governed refresh capability
   ✓ Publish lifecycle diagnostics

   Non-Responsibilities
   ----------------------------------------------------------
   ✗ Firestore queries
   ✗ Cloud Storage queries
   ✗ Credential asset queries
   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement rule definition
   ✗ Credential ownership decisions
   ✗ Credential filtering decisions
   ✗ Credential generation
   ✗ Credential registry writes
   ✗ Credential asset publication
   ✗ DOM rendering outside portfolio states

   Architectural Position
   ----------------------------------------------------------
   Authentication
        ↓
   Authorization
        ↓
   Entitlement Source Retrieval
        ↓
   resolvePortalEntitlements.js
        ↓
   CredentialService
        ↓
   CredentialRenderer
        ↓
   CredentialDetailActions
        ↓
   Credential Workspace

   Governance
   ----------------------------------------------------------
   Authentication
   → portal-auth.js

   Authorization
   → portal authorization services

   Entitlement source retrieval
   → entitlement.js

   Visibility resolution
   → resolvePortalEntitlements.js

   Programme metadata
   → ProgramService

   Credential validation
   → CredentialValidation

   Portfolio rendering
   → credential-renderer.js

   Credential assets
   → CredentialAssetService

   Credential workspace
   → CredentialDetailActions
   → CredentialDetailOverlay

   CredentialService remains a governed consumer of
   already-published portal state.

   The service must never independently determine whether
   a learner is entitled to a credential.

   Dependencies
   ----------------------------------------------------------
   Required globals:

   • window.resolvePortalEntitlements
   • window.renderCredentials
   • window.ProgramService
   • window.CredentialValidation

   Expected portal state:

   • window.portalEntitlementData
   • window.authState.user
     or Firebase Auth currentUser

   Events
   ----------------------------------------------------------
   Consumes:

   • entitlements:ready

   Publishes:

   • credentials:service-ready
   • credentials:service-error

   Public API
   ----------------------------------------------------------
   CredentialService.getCredentialById(id)

   CredentialService.getCredentials()

   CredentialService.hasCredential(id)

   CredentialService.normalizeCredentialId(id)

   CredentialService.resolveCredentialId(credential)

   CredentialService.refresh()

   CredentialService.isInitialized()

   Change History
   ----------------------------------------------------------
   v1.3.0

   • Added race-safe entitlement initialization
   • Added support for previously published entitlement state
   • Added governed refresh API
   • Added explicit service lifecycle events
   • Added loading and error-state accessibility handling
   • Added dependency diagnostics
   • Added duplicate-initialization protection
   • Added normalization for programme-code aliases
   • Added defensive resolver-result validation
   • Preserved resolver-owned visibility rules
   • Preserved synchronous credential lookup contract
   • Preserved service-oriented portal architecture

   v1.2.0

   • Added canonical credential ID normalization
   • Added support for credential_id and credentialId
   • Added support for legacy ID aliases
   • Added whitespace-safe and case-safe lookup
   • Added lookup diagnostics

   v1.1.0

   • Added CredentialService public API
   • Added getCredentialById()
   • Added credential validation integration

   v1.0.0

   • Initial governed implementation
   • Added lifecycle logging
   • Added empty-state handling
   • Added defensive validation

========================================================== */

(function (window, document) {

    "use strict";


    /* ======================================================
       SERVICE IDENTITY
    ====================================================== */

    const VERSION =
        "1.3.0";

    const SERVICE_NAME =
        "CredentialService";


    /* ======================================================
       INITIALIZATION GUARD
    ====================================================== */

    if (
        window.CredentialService &&
        window.CredentialService.version === VERSION
    ) {

        console.log(
            `[Credential Service] v${VERSION} already initialized.`
        );

        return;

    }


    /* ======================================================
       INTERNAL STATE
    ====================================================== */

    let initialized =
        false;

    let initializationInProgress =
        false;

    let renderInProgress =
        false;

    let lastRenderCompletedAt =
        null;


    console.log(
        `[Credential Service] Loaded v${VERSION}`
    );


    /* ======================================================
       DOM TARGET
    ====================================================== */

    function getContainer() {

        return document.getElementById(
            "credentials-container"
        );

    }


    function setContainerBusy(
        isBusy
    ) {

        const container =
            getContainer();

        if (!container) {
            return;
        }

        container.setAttribute(
            "aria-busy",
            isBusy
                ? "true"
                : "false"
        );

    }


    /* ======================================================
       PORTFOLIO STATES
    ====================================================== */

    function showLoadingState() {

        const container =
            getContainer();

        if (!container) {
            return;
        }

        setContainerBusy(
            true
        );

        container.innerHTML = `

            <div
                class="loading-state"
                role="status">

                <span
                    class="loading-state-indicator"
                    aria-hidden="true">
                </span>

                <span>
                    Loading your credential portfolio...
                </span>

            </div>

        `;

    }


    function showErrorState(
        message = "Unable to load credentials."
    ) {

        const container =
            getContainer();

        if (!container) {
            return;
        }

        setContainerBusy(
            false
        );

        container.innerHTML = `

            <div
                class="error-state"
                role="alert">

                <p>
                    ${escapeHtml(message)}
                </p>

                <button
                    type="button"
                    class="credential-retry-action"
                    data-credential-retry>

                    Try Again

                </button>

            </div>

        `;

        const retryButton =
            container.querySelector(
                "[data-credential-retry]"
            );

        if (retryButton) {

            retryButton.addEventListener(

                "click",

                function handleRetry() {

                    refresh();

                },

                { once: true }

            );

        }

    }


    function showEmptyState() {

        const container =
            getContainer();

        if (!container) {
            return;
        }

        setContainerBusy(
            false
        );

        container.innerHTML = `

            <div
                class="empty-state"
                role="status">

                <h3>
                    No credentials available
                </h3>

                <p>
                    Your published Agile AI University
                    credentials will appear here.
                </p>

            </div>

        `;

    }


    /* ======================================================
       SAFE HTML UTILITY
    ====================================================== */

    function escapeHtml(
        value
    ) {

        return String(
            value ?? ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }


    /* ======================================================
       CREDENTIAL ID NORMALIZATION
    ====================================================== */

    function normalizeCredentialId(
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
            .trim()
            .toUpperCase();

    }


    function resolveCredentialId(
        credential
    ) {

        if (
            !credential ||
            typeof credential !== "object"
        ) {

            return "";

        }

        return normalizeCredentialId(

            credential.credential_id ||

            credential.credentialId ||

            credential.credentialID ||

            credential.credentialIdValue ||

            credential.id ||

            credential.documentId ||

            ""

        );

    }


    /* ======================================================
       PROGRAMME CODE NORMALIZATION
    ====================================================== */

    function normalizeProgramCode(
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
            .trim()
            .toUpperCase();

    }


    function resolveProgramCode(
        credential
    ) {

        if (
            !credential ||
            typeof credential !== "object"
        ) {

            return "";

        }

        return normalizeProgramCode(

            credential.program_code ||

            credential.programCode ||

            credential.program ||

            ""

        );

    }


    /* ======================================================
       CREDENTIAL NORMALIZATION
    ====================================================== */

    function normalizeCredential(
        credential
    ) {

        if (
            !credential ||
            typeof credential !== "object"
        ) {

            return null;

        }

        const canonicalCredentialId =
            resolveCredentialId(
                credential
            );

        const canonicalProgramCode =
            resolveProgramCode(
                credential
            );

        return {

            ...credential,

            /*
             * Canonical portal properties.
             */

            credential_id:
                canonicalCredentialId,

            program_code:
                canonicalProgramCode,

            /*
             * Compatibility aliases.
             */

            credentialId:
                canonicalCredentialId,

            programCode:
                canonicalProgramCode

        };

    }


    /* ======================================================
       DEPENDENCY VALIDATION
    ====================================================== */

    function validateDependencies() {

        const missingDependencies =
            [];

        if (
            typeof window.resolvePortalEntitlements !==
            "function"
        ) {

            missingDependencies.push(
                "resolvePortalEntitlements"
            );

        }

        if (
            typeof window.renderCredentials !==
            "function"
        ) {

            missingDependencies.push(
                "renderCredentials"
            );

        }

        if (
            !window.ProgramService ||
            typeof window.ProgramService.get !==
                "function"
        ) {

            missingDependencies.push(
                "ProgramService.get"
            );

        }

        if (
            !window.CredentialValidation ||
            typeof window.CredentialValidation.validate !==
                "function"
        ) {

            missingDependencies.push(
                "CredentialValidation.validate"
            );

        }

        if (
            missingDependencies.length >
            0
        ) {

            console.error(
                "[Credential Service] Missing dependencies:",
                missingDependencies
            );

            return {

                valid:
                    false,

                missingDependencies

            };

        }

        return {

            valid:
                true,

            missingDependencies:
                []

        };

    }


    /* ======================================================
       AUTHENTICATED USER RESOLUTION
    ====================================================== */

    function getAuthenticatedUser() {

        return (

            window.authState?.user ||

            window.firebase
                ?.auth?.()
                ?.currentUser ||

            null

        );

    }


    /* ======================================================
       ENTITLEMENT STATE RESOLUTION
    ====================================================== */

    function getEntitlementData() {

        const entitlementData =
            window.portalEntitlementData;

        if (
            !entitlementData ||
            typeof entitlementData !==
                "object" ||
            Array.isArray(
                entitlementData
            )
        ) {

            return {};

        }

        return entitlementData;

    }


    function hasPublishedEntitlementState() {

        if (
            window.portalEntitlementsReady ===
                true ||

            window.__portalEntitlementsReady ===
                true ||

            window.entitlementsReady ===
                true
        ) {

            return true;

        }

        return (
            window.portalEntitlementData !==
                undefined &&
            window.portalEntitlementData !==
                null
        );

    }


    /* ======================================================
       PROGRAMME RESOLUTION
    ====================================================== */

    async function resolveProgram(
        credential
    ) {

        const programCode =
            resolveProgramCode(
                credential
            );

        if (programCode) {

            return window.ProgramService.get(
                programCode
            );

        }

        if (
            typeof window.ProgramService
                .createUnknownProgram ===
            "function"
        ) {

            return window.ProgramService
                .createUnknownProgram();

        }

        return null;

    }


    /* ======================================================
       CREDENTIAL ENRICHMENT
    ====================================================== */

    async function enrichCredential(
        credential
    ) {

        const normalizedCredential =
            normalizeCredential(
                credential
            );

        if (!normalizedCredential) {

            console.warn(
                "[Credential Service] Invalid credential object:",
                credential
            );

            return null;

        }

        if (
            !normalizedCredential.credential_id
        ) {

            console.warn(
                "[Credential Service] Credential has no canonical ID:",
                normalizedCredential
            );

            return null;

        }

        if (
            !window.CredentialValidation.validate(
                normalizedCredential
            )
        ) {

            console.warn(
                "[Credential Service] Skipping invalid credential:",
                normalizedCredential
            );

            return null;

        }

        const program =
            await resolveProgram(
                normalizedCredential
            );

        return Object.freeze({

            ...normalizedCredential,

            program

        });

    }


    /* ======================================================
       RESOLVER EXECUTION
    ====================================================== */

    function resolveVisibleCredentials() {

        const authenticatedUser =
            getAuthenticatedUser();

        const entitlementData =
            getEntitlementData();

        console.log(
            "[Credential Service] Auth user:",
            authenticatedUser
                ? authenticatedUser.email ||
                    authenticatedUser.uid ||
                    "authenticated"
                : "not resolved"
        );

        const resolved =
            window.resolvePortalEntitlements({

                ...entitlementData,

                authenticatedUser

            });

        if (
            !resolved ||
            typeof resolved !==
                "object"
        ) {

            console.error(
                "[Credential Service] Resolver returned an invalid result:",
                resolved
            );

            return [];

        }

        return Array.isArray(
            resolved.visibleCredentials
        )
            ? resolved.visibleCredentials
            : [];

    }


    /* ======================================================
       SERVICE EVENTS
    ====================================================== */

    function publishServiceReady(
        credentials
    ) {

        document.dispatchEvent(

            new CustomEvent(
                "credentials:service-ready",
                {

                    detail: {

                        source:
                            SERVICE_NAME,

                        version:
                            VERSION,

                        count:
                            credentials.length,

                        credentials

                    }

                }
            )

        );

    }


    function publishServiceError(
        error
    ) {

        document.dispatchEvent(

            new CustomEvent(
                "credentials:service-error",
                {

                    detail: {

                        source:
                            SERVICE_NAME,

                        version:
                            VERSION,

                        message:
                            error?.message ||
                            "Unknown credential service error"

                    }

                }
            )

        );

    }


    /* ======================================================
       RENDERING LIFECYCLE
    ====================================================== */

    async function renderVisibleCredentials() {

        if (renderInProgress) {

            console.log(
                "[Credential Service] Render already in progress."
            );

            return;

        }

        renderInProgress =
            true;

        showLoadingState();

        try {

            const dependencyState =
                validateDependencies();

            if (!dependencyState.valid) {

                const error =
                    new Error(

                        "Missing credential service dependencies: " +

                        dependencyState
                            .missingDependencies
                            .join(", ")

                    );

                showErrorState(
                    "The credential portfolio could not be initialized."
                );

                publishServiceError(
                    error
                );

                return;

            }

            const visibleCredentials =
                resolveVisibleCredentials();

            console.log(
                `[Credential Service] Resolving ${visibleCredentials.length} credential(s).`
            );

            if (
                visibleCredentials.length ===
                0
            ) {

                window.portalCredentials =
                    [];

                showEmptyState();

                publishServiceReady(
                    []
                );

                return;

            }

            const enrichedCredentials = (

                await Promise.all(

                    visibleCredentials.map(
                        enrichCredential
                    )

                )

            ).filter(Boolean);

            if (
                enrichedCredentials.length ===
                0
            ) {

                window.portalCredentials =
                    [];

                console.warn(
                    "[Credential Service] No valid credentials remained after validation."
                );

                showEmptyState();

                publishServiceReady(
                    []
                );

                return;

            }

            window.portalCredentials =
                Object.freeze(
                    [...enrichedCredentials]
                );

            console.log(
                "[Credential Service] Published credentials:",
                enrichedCredentials.map(

                    function (credential) {

                        return {

                            credentialId:
                                resolveCredentialId(
                                    credential
                                ),

                            programCode:
                                resolveProgramCode(
                                    credential
                                ),

                            programName:
                                credential.program
                                    ?.programName ||
                                ""

                        };

                    }

                )
            );

            setContainerBusy(
                false
            );

            window.renderCredentials(
                enrichedCredentials
            );

            lastRenderCompletedAt =
                new Date();

            publishServiceReady(
                enrichedCredentials
            );

        } catch (error) {

            window.portalCredentials =
                [];

            console.error(
                "[Credential Service] Render failure:",
                error
            );

            showErrorState();

            publishServiceError(
                error
            );

        } finally {

            renderInProgress =
                false;

        }

    }


    /* ======================================================
       PUBLIC LOOKUP API
    ====================================================== */

    function getCredentialById(
        credentialId
    ) {

        const requestedCredentialId =
            normalizeCredentialId(
                credentialId
            );

        if (!requestedCredentialId) {

            console.warn(
                "[Credential Service] Missing credential ID."
            );

            return null;

        }

        const credentials =
            Array.isArray(
                window.portalCredentials
            )
                ? window.portalCredentials
                : [];

        const credential =
            credentials.find(

                function (candidate) {

                    return (
                        resolveCredentialId(
                            candidate
                        ) ===
                        requestedCredentialId
                    );

                }

            ) || null;

        if (!credential) {

            console.warn(
                "[Credential Service] Credential not found:",
                {

                    requestedCredentialId,

                    availableCredentialIds:
                        credentials.map(
                            resolveCredentialId
                        )

                }
            );

            return null;

        }

        return credential;

    }


    function getCredentials() {

        return Array.isArray(
            window.portalCredentials
        )
            ? [...window.portalCredentials]
            : [];

    }


    function hasCredential(
        credentialId
    ) {

        return Boolean(
            getCredentialById(
                credentialId
            )
        );

    }


    function isInitialized() {

        return initialized;

    }


    /* ======================================================
       INITIALIZATION
    ====================================================== */

    async function initialize() {

        if (
            initialized ||
            initializationInProgress
        ) {

            return;

        }

        initializationInProgress =
            true;

        console.log(
            `[Credential Service] Initializing v${VERSION}`
        );

        try {

            await renderVisibleCredentials();

            initialized =
                true;

        } finally {

            initializationInProgress =
                false;

        }

    }


    /* ======================================================
       GOVERNED REFRESH

       Refresh uses already-published portal entitlement
       state. It does not independently retrieve credentials
       or determine entitlement.
    ====================================================== */

    async function refresh() {

        console.log(
            `[Credential Service] Refresh requested v${VERSION}`
        );

        await renderVisibleCredentials();

    }


    /* ======================================================
       PUBLIC SERVICE
    ====================================================== */

    const CredentialService =
        Object.freeze({

            version:
                VERSION,

            getCredentialById,

            getCredentials,

            hasCredential,

            normalizeCredentialId,

            resolveCredentialId,

            refresh,

            isInitialized,

            getLastRenderCompletedAt() {

                return lastRenderCompletedAt
                    ? new Date(
                        lastRenderCompletedAt
                    )
                    : null;

            }

        });


    window.CredentialService =
        CredentialService;


    /* ======================================================
       EVENT-DRIVEN INITIALIZATION
    ====================================================== */

    document.addEventListener(

        "entitlements:ready",

        function handleEntitlementsReady() {

            initialize();

        },

        { once: true }

    );


    /* ======================================================
       RACE-SAFE INITIALIZATION

       When entitlement state was published before this
       script attached its listener, initialize from the
       already-published state.

       queueMicrotask ensures all scripts in the current
       execution stack finish loading first.
    ====================================================== */

    if (
        hasPublishedEntitlementState()
    ) {

        queueMicrotask(
            initialize
        );

    }


    /* ======================================================
       DOM READY FALLBACK

       This fallback protects pages where entitlement state
       is synchronously published during document loading.
    ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(

            "DOMContentLoaded",

            function handleDomReady() {

                if (
                    !initialized &&
                    hasPublishedEntitlementState()
                ) {

                    initialize();

                }

            },

            { once: true }

        );

    } else if (
        !initialized &&
        hasPublishedEntitlementState()
    ) {

        queueMicrotask(
            initialize
        );

    }

})(window, document);