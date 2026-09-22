/* ==========================================================
   LAAU
   Student & Executive Portal

   File      : credential-detail-header.js
   Version   : 1.3.0
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
        "1.3.0";


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
                "LAAU";


            // Preserve typed timestamps until formatting; firstValue() is for text.
            const issueDate = this.resolveIssueDate(credential);


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
                                    issueDate
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

        // LAAU issue-date repair: 20260922-issue-date-1
        resolveIssueDate(credential) {
            for (const value of [
                credential.issueDate, credential.issue_date,
                credential.issuedOn, credential.issued_on,
                credential.issuedAt, credential.issued_at
            ]) {
                const label = this.formatDate(value);
                if (label) return label;
            }
            return "";
        },

        formatDate(value) {
            try {
                let date;
                let dateOnly = false;
                const validCalendar = (year, month, day) => {
                    if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return false;
                    const calendar = new Date(0);
                    calendar.setUTCFullYear(year, month - 1, day);
                    calendar.setUTCHours(0, 0, 0, 0);
                    return calendar.getUTCFullYear() === year &&
                        calendar.getUTCMonth() === month - 1 && calendar.getUTCDate() === day;
                };
                if (value === null || value === undefined || value === "") return "";
                if (typeof value === "string") {
                    const text = value.trim();
                    const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
                    if (plain) {
                        const [year, month, day] = plain.slice(1).map(Number);
                        if (!validCalendar(year, month, day)) return "";
                        date = new Date(0);
                        date.setUTCFullYear(year, month - 1, day);
                        date.setUTCHours(0, 0, 0, 0);
                        dateOnly = true;
                    } else {
                        // Accept an explicit timestamp, not an ambiguous locale date.
                        const iso = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})$/.exec(text);
                        if (!iso || !validCalendar(Number(iso[1]), Number(iso[2]), Number(iso[3])) ||
                            Number(iso[4]) > 23 || Number(iso[5]) > 59 || Number(iso[6] || 0) > 59) return "";
                        date = new Date(text);
                    }
                } else if (typeof value === "object") {
                    if (typeof value.toDate === "function") {
                        date = value.toDate();
                    } else {
                        // Date.prototype accepts real Dates across JavaScript realms.
                        try { date = new Date(Date.prototype.getTime.call(value)); }
                        catch {
                            const seconds = value.seconds ?? value._seconds;
                            const nanoseconds = value.nanoseconds ?? value._nanoseconds ?? 0;
                            if (!Number.isSafeInteger(seconds) || !Number.isInteger(nanoseconds) ||
                                seconds < -62135596800 || seconds > 253402300799 ||
                                nanoseconds < 0 || nanoseconds > 999999999 ||
                                (value.seconds !== undefined && value._seconds !== undefined && value.seconds !== value._seconds) ||
                                (value.nanoseconds !== undefined && value._nanoseconds !== undefined && value.nanoseconds !== value._nanoseconds)) return "";
                            date = new Date(seconds * 1000 + Math.floor(nanoseconds / 1000000));
                        }
                    }
                } else {
                    return "";
                }
                const milliseconds = Date.prototype.getTime.call(date);
                if (!Number.isFinite(milliseconds)) return "";
                return new Date(milliseconds).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                    ...(dateOnly ? { timeZone: "UTC" } : {})
                });
            } catch {
                return "";
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