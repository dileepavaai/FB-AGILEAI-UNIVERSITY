/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-verification-section.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2E

   Purpose
   ----------------------------------------------------------
   Credential Verification Section

   Responsibilities

   ✓ Render Verification Information
   ✓ Render Verification Metadata
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

            const credentialId =

                credential.credential_id ||

                "-";

            const verificationStatus =

                credential.verification_status ||

                "Verifiable";

            const issuer =

                credential.issued_by ||

                "Agile AI University";

            const validity =

                credential.validity ||

                "Lifetime";

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

                            <strong>Status</strong>

                            <span>

                                ${verificationStatus}

                            </span>

                        </div>

                        <div
                            class="credential-field">

                            <strong>Credential ID</strong>

                            <span>

                                ${credentialId}

                            </span>

                        </div>

                        <div
                            class="credential-field">

                            <strong>Issued By</strong>

                            <span>

                                ${issuer}

                            </span>

                        </div>

                        <div
                            class="credential-field">

                            <strong>Validity</strong>

                            <span>

                                ${validity}

                            </span>

                        </div>

                        <div
                            class="credential-field">

                            <strong>Verification URL</strong>

                            <span>

                                <a
                                    href="${verificationUrl}"
                                    target="_blank"
                                    rel="noopener noreferrer">

                                    ${verificationUrl}

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