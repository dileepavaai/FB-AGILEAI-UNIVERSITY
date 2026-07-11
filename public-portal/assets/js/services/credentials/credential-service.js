/* ==========================================================

   Agile AI University
   Student & Executive Portal

   File      : credential-service.js
   Version   : 1.2.0
   Status    : ACTIVE
   Phase     : Credential Experience

   Purpose
   ----------------------------------------------------------
   Consumes resolved portal entitlements and publishes the
   authenticated learner's visible credential portfolio.

   Responsibilities
   ----------------------------------------------------------
   ✓ Wait for entitlement readiness
   ✓ Invoke portal entitlement resolver
   ✓ Obtain visible credentials
   ✓ Validate visible credentials
   ✓ Enrich credentials with programme metadata
   ✓ Publish normalized portal credential collection
   ✓ Provide safe credential lookup API
   ✓ Invoke credential renderer
   ✓ Handle credential rendering lifecycle

   Non-Responsibilities
   ----------------------------------------------------------
   ✗ Firestore queries
   ✗ Credential asset queries
   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement resolution rules
   ✗ Credential ownership decisions
   ✗ Credential filtering rules
   ✗ Credential generation
   ✗ Credential registry writes

   Governance
   ----------------------------------------------------------
   Authentication
   → portal-auth.js

   Entitlements
   → entitlement.js

   Resolver
   → resolvePortalEntitlements.js

   Authorization
   → portal-authorization.js

   Rendering
   → credential-renderer.js

   Credential Assets
   → credential-asset-service.js

   This service remains a governed consumer of already
   resolved portal credential data.

   Dependencies
   ----------------------------------------------------------
   • resolvePortalEntitlements.js
   • credential-renderer.js
   • ProgramService
   • CredentialValidation

   Change History
   ----------------------------------------------------------
   v1.2.0
   • Added canonical credential ID normalization
   • Added support for credential_id and credentialId
   • Added support for legacy ID aliases
   • Added whitespace-safe and case-safe lookup
   • Preserved synchronous lookup contract
   • Added lookup diagnostics
   • Preserved consumer-only architecture

   v1.1.0
   • Added CredentialService public API
   • Added getCredentialById()
   • Published portal credential lookup service
   • Added credential validation integration

   v1.0.0
   • Initial governed implementation
   • Added lifecycle logging
   • Added empty state handling
   • Added defensive validation

========================================================== */

(function (window, document) {

    "use strict";

    const VERSION =
        "1.2.0";

    let initialized =
        false;

    console.log(
        `[Credential Service] Loaded v${VERSION}`
    );


    /* ======================================================
       DOM STATE
    ====================================================== */

    function getContainer() {

        return document.getElementById(
            "credentials-container"
        );

    }


    function showErrorState() {

        const container =
            getContainer();

        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="error-state">
                Unable to load credentials.
            </div>
        `;

    }


    function showEmptyState() {

        const container =
            getContainer();

        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="empty-state">
                No credentials available.
            </div>
        `;

    }


    /* ======================================================
       CREDENTIAL ID NORMALIZATION
    ====================================================== */

    function normalizeCredentialId(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }

        return String(value)
            .trim()
            .toUpperCase();

    }


    function resolveCredentialId(credential) {

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

        return {

            ...credential,

            /*
             * Canonical portal property.
             */

            credential_id:
                canonicalCredentialId,

            /*
             * Compatibility property for newer components.
             */

            credentialId:
                canonicalCredentialId

        };

    }


    /* ======================================================
       DEPENDENCY VALIDATION
    ====================================================== */

    function validateDependencies() {

        if (
            typeof window.resolvePortalEntitlements !==
            "function"
        ) {

            console.error(
                "[Credential Service] Resolver not available."
            );

            return false;

        }

        if (
            typeof window.renderCredentials !==
            "function"
        ) {

            console.error(
                "[Credential Service] Renderer not available."
            );

            return false;

        }

        if (
            !window.ProgramService ||
            typeof window.ProgramService.get !==
                "function"
        ) {

            console.error(
                "[Credential Service] ProgramService not available."
            );

            return false;

        }

        if (
            !window.CredentialValidation ||
            typeof window.CredentialValidation.validate !==
                "function"
        ) {

            console.error(
                "[Credential Service] CredentialValidation not available."
            );

            return false;

        }

        return true;

    }


    /* ======================================================
       PROGRAMME RESOLUTION
    ====================================================== */

    async function resolveProgram(
        credential
    ) {

        const programCode =

            credential.program_code ||

            credential.programCode ||

            "";

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

        return {

            ...normalizedCredential,

            program

        };

    }


    /* ======================================================
       RENDERING LIFECYCLE
    ====================================================== */

    async function renderVisibleCredentials() {

        try {

            if (!validateDependencies()) {

                showErrorState();

                return;

            }

            const authenticatedUser =

                window.authState?.user ||

                window.firebase
                    ?.auth()
                    ?.currentUser ||

                null;

            console.log(
                "[Credential Service] Auth User:",
                authenticatedUser
            );

            const entitlementData =
                window.portalEntitlementData ||
                {};

            const resolved =
                window.resolvePortalEntitlements({

                    ...entitlementData,

                    authenticatedUser

                });

            const visibleCredentials =

                Array.isArray(
                    resolved?.visibleCredentials
                )

                    ? resolved.visibleCredentials

                    : [];

            console.log(
                `[Credential Service] Resolving ${visibleCredentials.length} credential(s).`
            );

            if (
                visibleCredentials.length ===
                0
            ) {

                window.portalCredentials =
                    [];

                console.log(
                    "[Credential Service] No visible credentials."
                );

                showEmptyState();

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
                    "[Credential Service] No valid credentials available."
                );

                showEmptyState();

                return;

            }

            window.portalCredentials =
                enrichedCredentials;

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
                                credential.program_code ||
                                credential.programCode ||
                                "",

                            rawCredential:
                                credential

                        };

                    }
                )
            );

            window.renderCredentials(
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


    window.CredentialService =
        Object.freeze({

            getCredentialById,

            getCredentials,

            hasCredential,

            normalizeCredentialId,

            resolveCredentialId

        });


    /* ======================================================
       INITIALIZATION
    ====================================================== */

    function initialize() {

        if (initialized) {
            return;
        }

        initialized =
            true;

        console.log(
            `[Credential Service] Initializing v${VERSION}`
        );

        renderVisibleCredentials();

    }


    document.addEventListener(
        "entitlements:ready",
        initialize
    );

})(window, document);