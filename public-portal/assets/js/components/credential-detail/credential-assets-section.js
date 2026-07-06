/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-assets-section.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2E

   Purpose
   ----------------------------------------------------------
   Credential Assets Section

   Responsibilities

   ✓ Render Credential Assets
   ✓ Render Asset Actions
   ✓ Presentation Only

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ Event Binding
   ✗ Overlay Rendering

   Governance

   • Credential Assets Authority
   • Presentation Layer
   • Single Responsibility
   • Enterprise Portal Standard

========================================================== */

(function (window) {

    "use strict";

    const CredentialAssetsSection = {

        /* ==================================================
           ASSETS
        ================================================== */

        render(
            credential
        ) {

            if (!credential) {

                return "";

            }

            const assets =

                credential.program?.availableAssets ||

                credential.available_assets ||

                {};

            const credentialId =

                credential.credential_id ||

                "";

            return `

                <section
                    class="credential-assets-section"
                    data-credential-section="assets">

                    <h3
                        class="credential-section-title">

                        Credential Assets

                    </h3>

                    <div
                        class="credential-assets-grid">

                        ${assets.universityCertificate ? `

                            <a
                                href="#"
                                class="btn btn-secondary js-open-university-certificate"
                                data-credential-id="${credentialId}">

                                University Certificate

                            </a>

                        ` : ""}

                        ${assets.trainerCertificate ? `

                            <a
                                href="#"
                                class="btn btn-secondary js-open-trainer-certificate"
                                data-credential-id="${credentialId}">

                                Trainer Certificate

                            </a>

                        ` : ""}

                        ${assets.digitalBadge ? `

                            <a
                                href="#"
                                class="btn btn-secondary js-open-digital-badge"
                                data-credential-id="${credentialId}">

                                Digital Badge

                            </a>

                        ` : ""}

                        ${assets.recognitionAsset ? `

                            <a
                                href="#"
                                class="btn btn-secondary js-open-recognition"
                                data-credential-id="${credentialId}">

                                Recognition

                            </a>

                        ` : ""}

                        <a
                            href="#"
                            class="btn btn-secondary js-share-linkedin"
                            data-credential-id="${credentialId}">

                            Share on LinkedIn

                        </a>

                        <a
                            href="#"
                            class="btn btn-secondary js-export-wallet"
                            data-credential-id="${credentialId}">

                            Export to Wallet

                        </a>

                    </div>

                </section>

            `;

        }

    };

    Object.freeze(
        CredentialAssetsSection
    );

    window.CredentialAssetsSection =
        CredentialAssetsSection;

})(window);