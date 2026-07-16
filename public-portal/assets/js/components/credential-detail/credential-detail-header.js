/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-detail-header.js
   Version   : 1.2.0
   Status    : ACTIVE
   Phase     : Credential Workspace Stabilization

   Purpose
   ----------------------------------------------------------
   Credential Detail Header Component

   Responsibilities
   ----------------------------------------------------------
   ✓ Render Credential Holder Name
   ✓ Render Credential Header
   ✓ Render Program Information
   ✓ Render Credential Status
   ✓ Render Credential Metadata
   ✓ Normalize Display Values
   ✓ Escape Rendered Content
   ✓ Presentation Only

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement Resolution
   ✗ Credential Retrieval
   ✗ Firestore Access
   ✗ Business Rules
   ✗ Identity Resolution from Firebase Auth
   ✗ DOM Event Handling

   Architectural Position
   ----------------------------------------------------------
   Credential Service
        ↓
   Resolved Credential ViewModel
        ↓
   Credential Detail Header
        ↓
   Credential Workspace

   Governance
   ----------------------------------------------------------
   • Credential data remains authoritative.

   • The learner name must be resolved from the
     credential ViewModel.

   • Firebase Auth identity must not be used as the
     primary credential-holder authority.

   • This component remains presentation-only.

   • All dynamic values must be escaped before rendering.

   Name Resolution Order
   ----------------------------------------------------------
   1. fullName
   2. full_name
   3. learnerName
   4. learner_name
   5. credentialHolderName
   6. credential_holder_name
   7. holderName
   8. holder_name
   9. displayName
   10. display_name

   Change History
   ----------------------------------------------------------
   v1.2.0

   • Added credential-holder name presentation
   • Added governed name-resolution order
   • Added safe HTML escaping
   • Added safe date normalization
   • Added broader ViewModel field compatibility
   • Preserved existing credential metadata presentation
   • Preserved presentation-only responsibility

   v1.1.0

   • Rendered credential header
   • Rendered program information
   • Rendered status and credential metadata

========================================================== */

(function (
    window
) {

    "use strict";


    const MODULE_NAME =
        "CredentialDetailHeader";

    const MODULE_VERSION =
        "1.2.0";


    const CredentialDetailHeader = {


        /* ==================================================
           RENDER
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


            const learnerName =
                this.resolveLearnerName(
                    credential
                );


            const programCode =
                this.firstValue([

                    program.programCode,

                    program.program_code,

                    credential.programCode,

                    credential.program_code,

                    credential.credentialType,

                    credential.credential_type

                ]) ||
                "—";


            const programName =
                this.firstValue([

                    program.programName,

                    program.program_name,

                    credential.programName,

                    credential.program_name,

                    credential.credentialName,

                    credential.credential_name

                ]) ||
                "Credential";


            const status =
                this.firstValue([

                    credential.status,

                    credential.issuedStatus,

                    credential.issued_status

                ]) ||
                "Active";


            const credentialId =
                this.firstValue([

                    credential.credentialId,

                    credential.credential_id,

                    credential.id

                ]) ||
                "—";


            const issuedBy =
                this.firstValue([

                    credential.issuedBy,

                    credential.issued_by,

                    credential.issuerName,

                    credential.issuer_name

                ]) ||
                "Agile AI University";


            const issueDate =
                this.firstValue([

                    credential.issueDate,

                    credential.issue_date,

                    credential.issuedOn,

                    credential.issued_on,

                    credential.issuedAt,

                    credential.issued_at

                ]);


            const validity =
                this.firstValue([

                    credential.validity,

                    credential.validityLabel,

                    credential.validity_label

                ]) ||
                "Lifetime";


            const learnerNameHtml =
                learnerName

                    ? `

                        <p
                            class="credential-detail-holder-label">

                            Credential Holder

                        </p>

                        <h3
                            class="credential-detail-holder-name">

                            ${this.escape(
                                learnerName
                            )}

                        </h3>

                    `

                    : "";


            const issueDateHtml =
                issueDate

                    ? `

                        <div
                            class="credential-detail-issue-date">

                            <strong>
                                Issue Date:
                            </strong>

                            <span>

                                ${this.escape(
                                    this.formatDate(
                                        issueDate
                                    )
                                )}

                            </span>

                        </div>

                    `

                    : "";


            return `

                <section
                    class="credential-detail-header"
                    data-credential-section="header">

                    <div
                        class="credential-detail-header-main">

                        ${learnerNameHtml}

                        <div
                            class="credential-detail-program-code">

                            ${this.escape(
                                programCode
                            )}

                        </div>

                        <h2
                            class="credential-detail-program-name">

                            ${this.escape(
                                programName
                            )}

                        </h2>

                    </div>

                    <div
                        class="credential-detail-header-meta">

                        <div
                            class="credential-detail-status">

                            <strong>
                                Status:
                            </strong>

                            <span>

                                ${this.escape(
                                    status
                                )}

                            </span>

                        </div>

                        <div
                            class="credential-detail-id">

                            <strong>
                                Credential ID:
                            </strong>

                            <span>

                                ${this.escape(
                                    credentialId
                                )}

                            </span>

                        </div>

                        <div
                            class="credential-detail-issued-by">

                            <strong>
                                Issued By:
                            </strong>

                            <span>

                                ${this.escape(
                                    issuedBy
                                )}

                            </span>

                        </div>

                        ${issueDateHtml}

                        <div
                            class="credential-detail-validity">

                            <strong>
                                Validity:
                            </strong>

                            <span>

                                ${this.escape(
                                    validity
                                )}

                            </span>

                        </div>

                    </div>

                </section>

            `;

        },


        /* ==================================================
           LEARNER NAME
        ================================================== */

        resolveLearnerName(
            credential
        ) {

            return this.firstValue([

                credential.fullName,

                credential.full_name,

                credential.learnerName,

                credential.learner_name,

                credential.credentialHolderName,

                credential.credential_holder_name,

                credential.holderName,

                credential.holder_name,

                credential.displayName,

                credential.display_name

            ]);

        },


        /* ==================================================
           FIRST VALUE
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
           DATE FORMAT
        ================================================== */

        formatDate(
            value
        ) {

            try {

                const resolvedDate =
                    typeof value?.toDate ===
                        "function"

                        ? value.toDate()

                        : value instanceof Date

                            ? value

                            : new Date(
                                value
                            );


                if (
                    !(resolvedDate instanceof Date) ||
                    Number.isNaN(
                        resolvedDate.getTime()
                    )
                ) {

                    return String(
                        value
                    );

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

                return String(
                    value ||
                    ""
                );

            }

        },


        /* ==================================================
           ESCAPE
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

        }

    };


    Object.freeze(
        CredentialDetailHeader
    );


    window.CredentialDetailHeader =
        CredentialDetailHeader;


    console.info(
        `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
    );

})(window);