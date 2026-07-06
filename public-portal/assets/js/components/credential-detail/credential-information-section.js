/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-information-section.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Sprint 2E

   Purpose
   ----------------------------------------------------------
   Credential Information Section

   Responsibilities

   ✓ Render non-duplicated credential metadata
   ✓ Render issue date
   ✓ Render validity
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

        render(
            credential
        ) {

            if (!credential) {
                return "";
            }

            const issueDate =
                credential.issue_date ||
                credential.issued_on ||
                "-";

            const validity =
                credential.validity ||
                "Lifetime";

            return `

                <section class="credential-information-section">

                    <h3 class="credential-section-title">

                        Credential Information

                    </h3>

                    <div class="credential-information-grid">

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