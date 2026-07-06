/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-verification-section.js
   Version   : 1.2.0
   Status    : ACTIVE
   Phase     : Sprint 2E

   Purpose
   ----------------------------------------------------------
   Credential Verification Section

   Responsibilities

   ✓ Render verification information
   ✓ Render verification status
   ✓ Render verification action
   ✓ Presentation Only

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ Event Binding
   ✗ Overlay Rendering

   Governance

   • Credential Verification Authority
   • Presentation Layer
   • Single Responsibility
   • Enterprise Portal Standard

========================================================== */

(function (window) {

    "use strict";

    const CredentialVerificationSection = {

        /* ==================================================
           VERIFICATION
        ================================================== */

        render(
            credential
        ) {

            if (!credential) {

                return "";

            }

            const verificationUrl =

                credential.verification_url ||

                credential.verify_url ||

                "https://verify.agileai.university";

            const verificationStatus =

                credential.verification_status ||

                "Verifiable";

            return `

                <section
                    class="credential-verification-section">

                    <h3
                        class="credential-section-title">

                        Verification

                    </h3>

                    <div
                        class="credential-information-grid">

                        <div
                            class="credential-field">

                            <strong>Verification Status</strong>

                            <span>

                                ${verificationStatus}

                            </span>

                        </div>

                        <div
                            class="credential-field">

                            <strong>Verification Portal</strong>

                            <span>

                                <a
                                    href="${verificationUrl}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="btn btn-secondary">

                                    Verify Credential

                                </a>

                            </span>

                        </div>

                    </div>

                </section>

            `;

        }

    };

    Object.freeze(
        CredentialVerificationSection
    );

    window.CredentialVerificationSection =
        CredentialVerificationSection;

})(window);