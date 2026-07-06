/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-assets-section.js
   Version   : 1.3.0
   Status    : ACTIVE
   Phase     : Sprint 2E.1

   Purpose
   ----------------------------------------------------------
   Credential Assets Section

   Responsibilities

   ✓ Render available credential assets
   ✓ Render asset preview actions
   ✓ Provide asset type metadata
   ✓ Presentation Only

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ Overlay Rendering
   ✗ Download Logic
   ✗ LinkedIn Sharing Logic
   ✗ Wallet Export Logic

   Governance

   • Credential Assets Authority
   • Presentation Layer
   • Asset Preview Entry Point
   • Single Responsibility
   • Enterprise Portal Standard

========================================================== */

(function (window) {

    "use strict";

    const CredentialAssetsSection = {

        render(credential) {

            if (!credential) {
                return "";
            }

            const assets =
                credential.program?.availableAssets ||
                credential.available_assets ||
                credential.availableAssets ||
                {};

            const credentialId =
                credential.credential_id ||
                credential.credentialId ||
                credential.id ||
                "";

            const assetButtons = [

                this.renderAssetButton(
                    assets.universityCertificate,
                    credentialId,
                    "university-certificate",
                    "University Certificate"
                ),

                this.renderAssetButton(
                    assets.trainerCertificate,
                    credentialId,
                    "trainer-certificate",
                    "Trainer Certificate"
                ),

                this.renderAssetButton(
                    assets.digitalBadge,
                    credentialId,
                    "digital-badge",
                    "Digital Badge"
                ),

                this.renderAssetButton(
                    assets.recognitionAsset,
                    credentialId,
                    "recognition-asset",
                    "Recognition"
                )

            ].join("");

            if (!assetButtons.trim()) {
                return "";
            }

            return `

                <section
                    class="credential-assets-section"
                    data-credential-section="assets">

                    <h3 class="credential-section-title">
                        Credential Assets
                    </h3>

                    <div class="credential-assets-grid">
                        ${assetButtons}
                    </div>

                </section>

            `;

        },

        renderAssetButton(
            isAvailable,
            credentialId,
            assetType,
            label
        ) {

            if (!isAvailable) {
                return "";
            }

            return `
                <button
                    type="button"
                    class="btn btn-secondary js-open-credential-asset-preview"
                    data-credential-id="${this.escape(credentialId)}"
                    data-credential-asset-type="${this.escape(assetType)}">
                    ${this.escape(label)}
                </button>
            `;

        },

        escape(value) {

            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        }

    };

    Object.freeze(
        CredentialAssetsSection
    );

    window.CredentialAssetsSection =
        CredentialAssetsSection;

})(window);