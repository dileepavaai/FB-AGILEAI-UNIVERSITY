/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-verification-section.js
   Version   : 1.3.0
   Status    : ACTIVE
   Phase     : Sprint 2E

   Purpose
   ----------------------------------------------------------
   Credential Verification Section

   Responsibilities

   ✓ Render credential verification action
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

            return `

                <section class="credential-verification-section">

                    <h3 class="credential-section-title">

                        Verification

                    </h3>

                    <div class="credential-information-grid">

                        <div class="credential-field">

                            <a
                                href="${verificationUrl}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="btn btn-secondary">

                                Verify Credential

                            </a>

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