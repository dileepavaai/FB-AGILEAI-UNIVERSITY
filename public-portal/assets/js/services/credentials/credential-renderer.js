/* =====================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Credential Renderer

File        : credential-renderer.js
Version     : 2.2.0
Status      : ACTIVE

Governance  : Portal Governance v1.0

Purpose
-----------------------------------------------------
Render credential portfolio cards from
resolver-approved credential data.

Architectural Position
-----------------------------------------------------
Authentication
    ↓
Entitlements
    ↓
Resolver
    ↓
Credential Service
    ↓
Credential Renderer
    ↓
Credential Workspace

Responsibilities
-----------------------------------------------------
✓ Render portfolio credential cards
✓ Render programme identity
✓ Render Credential ID
✓ Render credential validity
✓ Delegate Credential Workspace interaction
✓ Signal render completion
✓ Escape dynamic presentation values

Must Never
-----------------------------------------------------
✗ Call APIs
✗ Query Firestore
✗ Perform Authorization
✗ Resolve Entitlements
✗ Filter Credentials
✗ Modify Entitlement State
✗ Own Credential Workspace lifecycle
✗ Generate credential assets

Governance Rules
-----------------------------------------------------
• Resolver owns credential visibility decisions.

• Renderer consumes resolver-approved credential
  data only.

• Renderer remains UI-only.

• Credential ID is supporting metadata and must
  remain subordinate to programme identity.

• CredentialDetailActions remains the authority
  for opening the Credential Workspace.

• A single credential interaction path must be
  preserved.

Dependencies
-----------------------------------------------------
• credential-service.js
• credential-detail-actions.js
• credentials.css

Change History
-----------------------------------------------------
v2.2.0

• Added governed Credential ID presentation
• Added reusable credential identifier resolution
• Reused the resolved identifier for workspace actions
• Added camelCase and snake_case compatibility
• Added safe HTML and attribute escaping
• Added broader programme metadata compatibility
• Added missing-identifier action protection
• Preserved portfolio-only renderer responsibility
• Preserved CredentialDetailActions delegation

v2.1.0

• Updated portfolio action terminology
• Replaced View Credential with Open Credential Workspace
• Aligned portfolio interaction with Credential Workspace
  architecture
• Preserved shared CredentialDetailActions delegation

v2.0.0

• Refactored to portfolio-only renderer
• Delegated credential detail experience
• Removed inline credential preview
• Integrated CredentialDetailActions

v1.0.0

• Governance-aligned implementation
• Registry-aware rendering
• Credential verification support
• LinkedIn integration support
• Share experience support
• Completion signalling support

===================================================== */

(function (
    window,
    document
) {

    "use strict";


    /* =====================================================
       MODULE IDENTITY
    ===================================================== */

    const MODULE_NAME =
        "Credential Renderer";

    const MODULE_VERSION =
        "2.2.0";


    console.log(
        `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
    );


    /* =====================================================
       INITIALIZATION GUARD
    ===================================================== */

    if (
        window.__credentialsRendererInitialized ===
        true
    ) {

        return;

    }

    window.__credentialsRendererInitialized =
        true;


    /* =====================================================
       STATE
    ===================================================== */

    let renderCompleted =
        false;

    let completionSignalled =
        false;


    /* =====================================================
       FIRST NON-EMPTY VALUE
    ===================================================== */

    function firstValue(
        values
    ) {

        if (!Array.isArray(values)) {

            return "";

        }

        for (
            const value of values
        ) {

            if (
                value === null ||
                value === undefined
            ) {

                continue;

            }

            const normalizedValue =
                String(
                    value
                ).trim();

            if (normalizedValue) {

                return normalizedValue;

            }

        }

        return "";

    }


    /* =====================================================
       SAFE HTML ESCAPING
    ===================================================== */

    function escapeHtml(
        value
    ) {

        return String(
            value === null ||
            value === undefined

                ? ""

                : value
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    function escapeAttribute(
        value
    ) {

        return escapeHtml(
            value
        );

    }


    /* =====================================================
       SAFE DATE NORMALIZATION

       Retained for compatibility with future portfolio
       metadata extensions.
    ===================================================== */

    function safeDate(
        input
    ) {

        try {

            const resolvedDate =
                typeof input?.toDate ===
                    "function"

                    ? input.toDate()

                    : input instanceof Date

                        ? input

                        : new Date(
                            input
                        );


            if (
                !(resolvedDate instanceof Date) ||
                Number.isNaN(
                    resolvedDate.getTime()
                )
            ) {

                return "—";

            }


            return resolvedDate
                .toLocaleDateString(
                    "en-GB",
                    {
                        day:
                            "2-digit",

                        month:
                            "short",

                        year:
                            "numeric"
                    }
                );

        } catch {

            return "—";

        }

    }


    /*
     * Retain the helper reference for future governed
     * portfolio metadata without invoking it prematurely.
     */

    void safeDate;


    /* =====================================================
       VALIDITY INTEGRITY GUARDRAIL — LOCKED
    ===================================================== */

    function assertCredentialValidityIntegrity(
        credential
    ) {

        if (
            !credential ||
            !credential.validity
        ) {

            return;

        }

        const validity =
            String(
                credential.validity
            )
                .trim()
                .toLowerCase();


        if (
            validity ===
                "lifetime" &&

            (
                "expiryDate" in credential ||
                "expiry_date" in credential ||
                "expiresOn" in credential ||
                "expires_on" in credential ||
                "validUntil" in credential ||
                "valid_until" in credential ||
                "expiration" in credential
            )
        ) {

            throw new Error(
                "SYSTEM VIOLATION: Lifetime credentials must not define expiry fields."
            );

        }

    }


    /* =====================================================
       CREDENTIAL IDENTIFIER
    ===================================================== */

    function resolveCredentialId(
        credential
    ) {

        if (!credential) {

            return "";

        }

        return firstValue([

            credential.credentialId,

            credential.credential_id,

            credential.id

        ]);

    }


    /* =====================================================
       PROGRAMME CODE
    ===================================================== */

    function resolveProgramCode(
        credential,
        program
    ) {

        return firstValue([

            program.programCode,

            program.program_code,

            credential.programCode,

            credential.program_code,

            credential.credentialCode,

            credential.credential_code,

            credential.credentialType,

            credential.credential_type

        ]) ||
        "—";

    }


    /* =====================================================
       PROGRAMME NAME
    ===================================================== */

    function resolveProgramName(
        credential,
        program
    ) {

        return firstValue([

            program.programName,

            program.program_name,

            credential.programName,

            credential.program_name,

            credential.credentialName,

            credential.credential_name,

            credential.program_code,

            credential.credential_type

        ]) ||
        "Credential";

    }


    /* =====================================================
       VALIDITY
    ===================================================== */

    function resolveValidity(
        credential
    ) {

        const validity =
            firstValue([

                credential.validity,

                credential.validityLabel,

                credential.validity_label

            ]);


        if (
            validity.toLowerCase() ===
            "lifetime"
        ) {

            return "Lifetime";

        }

        return (
            validity ||
            "Active"
        );

    }


    /* =====================================================
       COMPLETION SIGNAL
       EVENT SAFE — FIRE ONCE
    ===================================================== */

    function signalRenderComplete() {

        if (completionSignalled) {

            return;

        }

        completionSignalled =
            true;

        document.dispatchEvent(

            new CustomEvent(
                "credentials:rendered",
                {
                    detail: {
                        source:
                            "renderCredentials"
                    }
                }
            )

        );

        console.log(
            `[${MODULE_NAME}] credentials:rendered dispatched`
        );

    }


    /* =====================================================
       RENDER TARGET
    ===================================================== */

    function resolveRenderContainer() {

        return (

            document.getElementById(
                "credentials-container"
            ) ||

            document.getElementById(
                "credentials-list"
            ) ||

            document.getElementById(
                "recentCredentials"
            )

        );

    }


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    function renderEmptyState(
        container
    ) {

        container.innerHTML = `

            <div
                class="empty-state">

                <h3>
                    No credentials available
                </h3>

                <p>
                    Your Agile AI University credentials
                    will appear here when they become
                    available.
                </p>

            </div>

        `;

    }


    /* =====================================================
       CREDENTIAL CARD
    ===================================================== */

    function createCredentialCard(
        credential
    ) {

        assertCredentialValidityIntegrity(
            credential
        );


        const program =
            credential.program &&
            typeof credential.program ===
                "object"

                ? credential.program

                : {};


        const programCode =
            resolveProgramCode(
                credential,
                program
            );


        const programName =
            resolveProgramName(
                credential,
                program
            );


        const credentialId =
            resolveCredentialId(
                credential
            );


        const validity =
            resolveValidity(
                credential
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "credential-card";


        if (credentialId) {

            card.dataset.credentialId =
                credentialId;

        }


        card.innerHTML = `

            <div
                class="credential-portfolio-card">

                <img
                    class="credential-portfolio-emblem"
                    src="/assets/images/aau-emblem.png"
                    alt="Agile AI University">

                <div
                    class="credential-portfolio-code">

                    ${escapeHtml(
                        programCode
                    )}

                </div>

                <div
                    class="credential-portfolio-title">

                    ${escapeHtml(
                        programName
                    )}

                </div>

                <div
                    class="credential-portfolio-id"
                    aria-label="Credential identifier">

                    <span
                        class="credential-portfolio-id-label">

                        Credential ID

                    </span>

                    <span
                        class="credential-portfolio-id-value">

                        ${escapeHtml(
                            credentialId ||
                            "Not available"
                        )}

                    </span>

                </div>

                <div
                    class="credential-portfolio-validity-block"
                    aria-label="Credential validity">

                    <span
                        class="credential-portfolio-validity-label">

                        Validity

                    </span>

                    <span
                        class="credential-portfolio-validity-value">

                        ${escapeHtml(
                            validity
                        )}

                    </span>

                </div>

                <button
                    type="button"
                    class="credential-portfolio-action"
                    data-credential-id="${escapeAttribute(
                        credentialId
                    )}"
                    ${credentialId
                        ? ""
                        : `
                            disabled
                            aria-disabled="true"
                          `
                    }>

                    Open Credential Workspace

                </button>

            </div>

        `;


        /* =================================================
           PORTFOLIO SELECTION EXPERIENCE

           Governance

           • Card owns credential selection.
           • Button delegates to the card.
           • A single interaction path is preserved.
           • CredentialDetailActions owns workspace opening.
        ================================================= */

        card.addEventListener(

            "click",

            function (
                event
            ) {

                /*
                 * Disabled credentials must not attempt
                 * workspace navigation.
                 */

                if (!credentialId) {

                    event.preventDefault();

                    return;

                }


                if (
                    !window.CredentialDetailActions ||
                    typeof window.CredentialDetailActions
                        .open !==
                        "function"
                ) {

                    console.warn(
                        `[${MODULE_NAME}] CredentialDetailActions.open is unavailable.`
                    );

                    return;

                }


                window.CredentialDetailActions
                    .open(
                        credentialId
                    );

            }

        );


        const actionButton =
            card.querySelector(
                ".credential-portfolio-action"
            );


        if (actionButton) {

            actionButton.addEventListener(

                "click",

                function (
                    event
                ) {

                    event.preventDefault();

                    event.stopPropagation();


                    if (!credentialId) {

                        return;

                    }


                    card.click();

                }

            );

        }


        return card;

    }


    /* =====================================================
       MAIN RENDER ENTRY
       PORTFOLIO CARD EXPERIENCE
    ===================================================== */

    window.renderCredentials =
        function renderCredentials(
            credentials
        ) {

            if (
                renderCompleted ===
                true
            ) {

                signalRenderComplete();

                return;

            }


            const container =
                resolveRenderContainer();


            if (!container) {

                console.warn(
                    `[${MODULE_NAME}] No supported render container was found.`
                );

                return;

            }


            if (
                !Array.isArray(
                    credentials
                ) ||
                credentials.length ===
                    0
            ) {

                renderEmptyState(
                    container
                );

                renderCompleted =
                    true;

                signalRenderComplete();

                return;

            }


            console.assert(

                credentials.every(
                    credential =>
                        credential &&
                        typeof credential ===
                            "object"
                ),

                "[Credentials Renderer Invariant] Invalid credential payload."

            );


            container.innerHTML =
                "";


            credentials.forEach(

                function (
                    credential
                ) {

                    if (
                        !credential ||
                        typeof credential !==
                            "object"
                    ) {

                        console.warn(
                            `[${MODULE_NAME}] Invalid credential skipped.`,
                            credential
                        );

                        return;

                    }


                    const card =
                        createCredentialCard(
                            credential
                        );


                    container.appendChild(
                        card
                    );

                }

            );


            renderCompleted =
                true;


            console.log(
                `[${MODULE_NAME}] Render complete`
            );


            signalRenderComplete();

        };


})(window, document);