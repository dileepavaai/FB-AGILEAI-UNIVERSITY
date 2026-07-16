/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-card.js
   Version   : 1.2.0
   Status    : ACTIVE
   Phase     : Credential Workspace Stabilization

   Purpose
   ----------------------------------------------------------
   Credential Card Component

   Responsibilities
   ----------------------------------------------------------
   ✓ Render Credential Card
   ✓ Render Credential Identifier
   ✓ Render Credential Validity
   ✓ Render Credential Assets
   ✓ Render Empty Credential State
   ✓ Normalize Credential Display Values
   ✓ Escape Dynamic Presentation Values
   ✓ Delegate Credential Workspace Actions

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Dashboard Rendering
   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement Resolution
   ✗ Firestore
   ✗ Business Logic
   ✗ Credential Filtering
   ✗ DOM Manipulation
   ✗ Credential Detail Rendering
   ✗ Asset Preview Rendering
   ✗ Credential Workspace Lifecycle

   Architectural Position
   ----------------------------------------------------------
   Resolved Credential ViewModel
        ↓
   Credential Card
        ↓
   Credential Detail Actions
        ↓
   Credential Workspace

   Governance
   ----------------------------------------------------------
   • Credential Card Authority

   • Shared UI Component

   • Single Responsibility

   • Enterprise Portal Standard

   • Credential visibility must be resolved before this
     component is called.

   • Credential ID is supporting metadata and must not
     compete visually with programme identity.

   • Credential Card must not resolve authorization,
     entitlement or business rules.

   • Credential Card delegates user actions through
     governed action classes and credential identifiers.

   • The primary action terminology must align with the
     governed Credential Workspace architecture.

   • Issuer information belongs inside Credential Details
     and must not overload the compact card.

   Change History
   ----------------------------------------------------------
   v1.2.0

   • Standardised dashboard credential-card hierarchy
   • Changed primary CTA to Open Credential Workspace
   • Retained subtle Credential ID presentation
   • Retained validity as essential summary metadata
   • Removed redundant Issued By card metadata
   • Added missing-identifier action protection
   • Preserved credential asset action classes
   • Preserved shared dashboard-card structure
   • Preserved presentation-only responsibility

   v1.1.0

   • Added subtle Credential ID presentation
   • Added governed credential identifier resolution
   • Added safe HTML and attribute escaping
   • Added camelCase and snake_case compatibility
   • Preserved credential asset action classes
   • Preserved existing shared dashboard-card structure
   • Preserved presentation-only responsibility

   v1.0.0

   • Initial governed Credential Card component
   • Added credential rendering
   • Added credential asset actions
   • Added empty credential state

========================================================== */

(function (
    window
) {

    "use strict";


    /* ======================================================
       MODULE IDENTITY
    ====================================================== */

    const MODULE_NAME =
        "CredentialCard";

    const MODULE_VERSION =
        "1.2.0";


    /* ======================================================
       COMPONENT
    ====================================================== */

    const CredentialCard = {


        /* ==================================================
           EMPTY STATE
        ================================================== */

        renderEmpty() {

            return `

                <article
                    class="dashboard-card credential-card credential-card--empty">

                    <div
                        class="dashboard-card-body">

                        <div
                            class="dashboard-card-empty">

                            <div
                                class="dashboard-card-empty-icon"
                                aria-hidden="true">

                                🎓

                            </div>

                            <div
                                class="dashboard-card-empty-title">

                                No Credentials Yet

                            </div>

                            <div
                                class="dashboard-card-empty-text">

                                Your Agile AI University
                                credentials will appear
                                here after successful
                                completion.

                            </div>

                        </div>

                    </div>

                </article>

            `;

        },


        /* ==================================================
           ASSET BUTTONS
        ================================================== */

        renderAssetButtons(
            credential,
            assets = {}
        ) {

            if (!credential) {

                return "";

            }

            const credentialId =
                this.resolveCredentialId(
                    credential
                );

            if (!credentialId) {

                return "";

            }

            const escapedCredentialId =
                this.escapeAttribute(
                    credentialId
                );

            return [

                this.isAssetAvailable(
                    assets,
                    "universityCertificate",
                    "university_certificate"
                )
                    ? `

                        <a
                            href="#"
                            class="btn btn-secondary js-open-university-certificate"
                            data-credential-id="${escapedCredentialId}">

                            University Certificate

                        </a>

                    `
                    : "",


                this.isAssetAvailable(
                    assets,
                    "trainerCertificate",
                    "trainer_certificate"
                )
                    ? `

                        <a
                            href="#"
                            class="btn btn-secondary js-open-trainer-certificate"
                            data-credential-id="${escapedCredentialId}">

                            Trainer Certificate

                        </a>

                    `
                    : "",


                this.isAssetAvailable(
                    assets,
                    "digitalBadge",
                    "digital_badge"
                )
                    ? `

                        <a
                            href="#"
                            class="btn btn-secondary js-open-digital-badge"
                            data-credential-id="${escapedCredentialId}">

                            Digital Badge

                        </a>

                    `
                    : "",


                this.isAssetAvailable(
                    assets,
                    "recognitionAsset",
                    "recognition_asset"
                )
                    ? `

                        <a
                            href="#"
                            class="btn btn-secondary js-open-recognition"
                            data-credential-id="${escapedCredentialId}">

                            Recognition Asset

                        </a>

                    `
                    : ""

            ].join(
                ""
            );

        },


        /* ==================================================
           CREDENTIAL CARD
        ================================================== */

        render(
            credential
        ) {

            if (!credential) {

                return "";

            }

            const program =
                credential.program &&
                typeof credential.program ===
                    "object"

                    ? credential.program

                    : {};


            const programName =
                this.firstValue([

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


            const programCode =
                this.firstValue([

                    program.programCode,

                    program.program_code,

                    credential.programCode,

                    credential.program_code,

                    credential.credentialCode,

                    credential.credential_code,

                    credential.credential_type

                ]) ||
                "—";


            const credentialId =
                this.resolveCredentialId(
                    credential
                );


            const validity =
                this.firstValue([

                    credential.validity,

                    credential.validityLabel,

                    credential.validity_label

                ]) ||
                "Lifetime";


            const escapedCredentialId =
                this.escapeAttribute(
                    credentialId
                );


            const actionDisabled =
                credentialId

                    ? ""

                    : `
                        aria-disabled="true"
                        tabindex="-1"
                    `;


            return `

                <article
                    class="dashboard-card credential-card"
                    data-credential-id="${escapedCredentialId}">

                    <div
                        class="dashboard-card-header">

                        <div
                            class="credential-card-identity">

                            <h3
                                class="dashboard-card-title">

                                ${this.escape(
                                    programCode
                                )}

                            </h3>

                            <div
                                class="dashboard-card-subtitle">

                                ${this.escape(
                                    programName
                                )}

                            </div>

                            <div
                                class="credential-card-id"
                                aria-label="Credential identifier">

                                <span
                                    class="credential-card-id-label">

                                    Credential ID

                                </span>

                                <span
                                    class="credential-card-id-value">

                                    ${this.escape(
                                        credentialId ||
                                        "Not available"
                                    )}

                                </span>

                            </div>

                        </div>

                    </div>

                    <div
                        class="dashboard-card-body">

                        <div
                            class="credential-card-validity">

                            <span
                                class="credential-card-validity-label">

                                Validity

                            </span>

                            <span
                                class="credential-card-validity-value">

                                ${this.escape(
                                    validity
                                )}

                            </span>

                        </div>

                    </div>

                    <div
                        class="dashboard-card-footer">

                        <div
                            class="dashboard-card-actions">

                            <a
                                href="#"
                                class="btn btn-primary js-view-credential"
                                data-credential-id="${escapedCredentialId}"
                                ${actionDisabled}>

                                Open Credential Workspace

                            </a>

                        </div>

                    </div>

                </article>

            `;

        },


        /* ==================================================
           CREDENTIAL ID
        ================================================== */

        resolveCredentialId(
            credential
        ) {

            if (!credential) {

                return "";

            }

            return this.firstValue([

                credential.credentialId,

                credential.credential_id,

                credential.id

            ]);

        },


        /* ==================================================
           ASSET AVAILABILITY
        ================================================== */

        isAssetAvailable(
            assets,
            camelCaseKey,
            snakeCaseKey
        ) {

            if (
                !assets ||
                typeof assets !==
                    "object"
            ) {

                return false;

            }

            return (

                assets[
                    camelCaseKey
                ] === true ||

                assets[
                    snakeCaseKey
                ] === true

            );

        },


        /* ==================================================
           FIRST NON-EMPTY VALUE
        ================================================== */

        firstValue(
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

        },


        /* ==================================================
           ESCAPING
        ================================================== */

        escape(
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

        },


        escapeAttribute(
            value
        ) {

            return this.escape(
                value
            );

        }

    };


    /* ======================================================
       PUBLIC REGISTRATION
    ====================================================== */

    Object.freeze(
        CredentialCard
    );


    window.CredentialCard =
        CredentialCard;


    console.info(
        `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
    );

})(window);