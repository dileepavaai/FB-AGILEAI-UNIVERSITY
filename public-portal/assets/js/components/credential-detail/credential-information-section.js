/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-information-section.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2E

   Purpose
   ----------------------------------------------------------
   Credential Information Section

   Responsibilities

   ✓ Render Credential Information
   ✓ Render Program Information
   ✓ Render Credential Metadata
   ✓ Presentation Only

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ Event Binding
   ✗ Overlay Rendering

   Governance

   • Credential Information Authority
   • Presentation Layer
   • Single Responsibility
   • Enterprise Portal Standard

========================================================== */

(function (window) {

    "use strict";

    const CredentialInformationSection = {

        /* ==================================================
           INFORMATION
        ================================================== */

        render(
            credential
        ) {

            if (!credential) {

                return "";

            }

            const program =
                credential.program || {};

            const programName =

                program.programName ||

                credential.programName ||

                credential.program_name ||

                "Credential";

            const programCode =

                program.programCode ||

                credential.programCode ||

                credential.program_code ||

                "-";

            const credentialId =

                credential.credential_id ||

                "-";

            const issuedBy =

                credential.issued_by ||

                "Agile AI University";

            const issueDate =

                credential.issue_date ||

                credential.issued_on ||

                "-";

            const validity =

                credential.validity ||

                "Lifetime";

            const status =

                credential.status ||

                "Active";

            return `

                <section
                    class="credential-information-section">

                    <h3
                        class="credential-section-title">

                        Credential Information

                    </h3>

                    <div
                        class="credential-information-grid">

                        <div class="credential-field">

                            <strong>Program</strong>

                            <span>

                                ${programName}

                            </span>

                        </div>

                        <div class="credential-field">

                            <strong>Program Code</strong>

                            <span>

                                ${programCode}

                            </span>

                        </div>

                        <div class="credential-field">

                            <strong>Credential ID</strong>

                            <span>

                                ${credentialId}

                            </span>

                        </div>

                        <div class="credential-field">

                            <strong>Issued By</strong>

                            <span>

                                ${issuedBy}

                            </span>

                        </div>

                        <div class="credential-field">

                            <strong>Issue Date</strong>

                            <span>

                                ${issueDate}

                            </span>

                        </div>

                        <div class="credential-field">

                            <strong>Validity</strong>

                            <span>

                                ${validity}

                            </span>

                        </div>

                        <div class="credential-field">

                            <strong>Status</strong>

                            <span>

                                ${status}

                            </span>

                        </div>

                    </div>

                </section>

            `;

        }

    };

    Object.freeze(
        CredentialInformationSection
    );

    window.CredentialInformationSection =
        CredentialInformationSection;

})(window);