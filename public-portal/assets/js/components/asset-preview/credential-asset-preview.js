/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-asset-preview.js
   Version   : 2.0.1
   Status    : ACTIVE
   Phase     : Sprint 2E.1

   Purpose
   ----------------------------------------------------------
   Credential Asset Preview Renderer

   Responsibilities

   ✓ Render Credential Asset Preview
   ✓ Select Asset Renderer
   ✓ Render Preview Actions
   ✓ Support Download Action
   ✓ Support LinkedIn Share Action

   Non Responsibilities

   ✗ Overlay Creation
   ✗ Overlay Lifecycle
   ✗ Firestore
   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement Resolution
   ✗ Payment Processing

   Governance

   • Credential Workspace Renderer
   • No Nested Overlay
   • Renderer Based Architecture
   • No Firestore Access
   • No Authentication Logic

========================================================== */

(function (window) {

    "use strict";

    const CredentialAssetPreview = {

        render(credential, assetType) {

            if (!credential || !assetType) {
                return this.renderEmpty();
            }

            const title =
                this.resolveTitle(assetType);

            const preview =
                this.renderAsset(
                    credential,
                    assetType
                );

            return `

                <section
                    class="credential-asset-preview-workspace"
                    data-credential-section="asset-preview"
                    data-credential-asset-type="${this.escape(assetType)}">

                    <header class="credential-asset-preview-header">

                        <div>

                            <p class="credential-asset-preview-label">

                                Credential Asset Preview

                            </p>

                            <h2>

                                ${this.escape(title)}

                            </h2>

                        </div>

                        <button
                            type="button"
                            class="btn btn-secondary js-back-to-credential-details">

                            ← Back to Credential Details

                        </button>

                    </header>

                    <div class="credential-asset-preview-body">

                        ${preview}

                    </div>

                    <footer class="credential-asset-preview-actions">

                        <button
                            type="button"
                            class="credential-asset-preview-button secondary js-download-credential-asset"
                            data-credential-asset-type="${this.escape(assetType)}">

                            Download

                        </button>

                        <button
                            type="button"
                            class="credential-asset-preview-button primary js-share-credential-linkedin"
                            data-credential-asset-type="${this.escape(assetType)}">

                            Share on LinkedIn

                        </button>

                    </footer>

                    <p class="credential-asset-preview-note">

                        Tip: Download the asset first, then upload it manually while sharing on LinkedIn.

                    </p>

                </section>

            `;

        },

        renderAsset(credential, assetType) {

            if (
                assetType === "university-certificate" &&
                window.CertificatePreview &&
                typeof window.CertificatePreview.render === "function"
            ) {

                return window.CertificatePreview.render(
                    credential
                );

            }

            if (
                assetType === "trainer-certificate" &&
                window.TrainerCertificatePreview &&
                typeof window.TrainerCertificatePreview.render === "function"
            ) {

                return window.TrainerCertificatePreview.render(
                    credential
                );

            }

            if (
                assetType === "digital-badge" &&
                window.BadgePreview &&
                typeof window.BadgePreview.render === "function"
            ) {

                return window.BadgePreview.render(
                    credential
                );

            }

            return this.renderEmpty();

        },

        renderEmpty() {

            return `

                <div class="asset-preview-empty">

                    <h3>

                        Preview unavailable

                    </h3>

                    <p>

                        This credential asset preview is not available yet.

                    </p>

                </div>

            `;

        },

        download(credential, assetType) {

            if (!credential || !assetType) {

                alert(
                    "Download is not available for this asset yet."
                );

                return;

            }

            const url =
                this.resolveDownloadUrl(
                    credential,
                    assetType
                );

            if (!url) {

                alert(
                    "Download is not available for this asset yet."
                );

                return;

            }

            const anchor =
                document.createElement("a");

            anchor.href = url;
            anchor.download = "";
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";

            document.body.appendChild(
                anchor
            );

            anchor.click();

            anchor.remove();

        },

        shareOnLinkedIn(credential) {

            if (!credential) {

                alert(
                    "LinkedIn sharing is not available for this credential yet."
                );

                return;

            }

            const verificationUrl =
                this.resolveVerificationUrl(
                    credential
                );

            if (!verificationUrl) {

                alert(
                    "LinkedIn sharing is not available for this credential yet."
                );

                return;

            }

            const linkedInUrl =
                "https://www.linkedin.com/sharing/share-offsite/?url=" +
                encodeURIComponent(
                    verificationUrl
                );

            window.open(
                linkedInUrl,
                "_blank",
                "noopener,noreferrer"
            );

        },

        resolveDownloadUrl(credential, assetType) {

            if (!credential || !assetType) {
                return "";
            }

            const assets =
                credential.assets || {};

            if (assetType === "university-certificate") {

                return credential.certificateUrl ||
                    credential.certificate_url ||
                    credential.universityCertificateUrl ||
                    credential.university_certificate_url ||
                    assets.universityCertificateUrl ||
                    assets.university_certificate_url ||
                    assets.certificateUrl ||
                    assets.certificate_url ||
                    "";

            }

            if (assetType === "trainer-certificate") {

                return credential.trainerCertificateUrl ||
                    credential.trainer_certificate_url ||
                    assets.trainerCertificateUrl ||
                    assets.trainer_certificate_url ||
                    "";

            }

            if (assetType === "digital-badge") {

                return credential.badgeUrl ||
                    credential.badge_url ||
                    credential.digitalBadgeUrl ||
                    credential.digital_badge_url ||
                    assets.digitalBadgeUrl ||
                    assets.digital_badge_url ||
                    assets.badgeUrl ||
                    assets.badge_url ||
                    "";

            }

            return "";

        },

        resolveVerificationUrl(credential) {

            if (!credential) {
                return "";
            }

            return credential.verificationUrl ||
                credential.verification_url ||
                credential.verifyUrl ||
                credential.verify_url ||
                credential.registryUrl ||
                credential.registry_url ||
                "https://verify.agileai.university";

        },

        resolveTitle(assetType) {

            const titles = {
                "university-certificate": "University Certificate",
                "trainer-certificate": "Trainer Certificate",
                "digital-badge": "Digital Badge",
                "recognition-asset": "Recognition Asset"
            };

            return titles[assetType] ||
                "Credential Asset";

        },

        /*
         * Temporary compatibility method.
         * Existing callers should be migrated to:
         *
         * CredentialDetailOverlay.showAssetPreview(assetType)
         */

        open(credential, assetType) {

            if (!credential || !assetType) {
                return;
            }

            if (
                window.CredentialDetailOverlay &&
                typeof window.CredentialDetailOverlay.showAssetPreview === "function"
            ) {

                window.CredentialDetailOverlay.showAssetPreview(
                    assetType
                );

                return;

            }

            console.warn(
                "[CredentialAssetPreview] open() is deprecated. Use render() inside CredentialDetailOverlay."
            );

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

    window.CredentialAssetPreview =
        CredentialAssetPreview;

})(window);