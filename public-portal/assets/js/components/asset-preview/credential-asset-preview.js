/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-asset-preview.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2E.1

   Purpose
   ----------------------------------------------------------
   Credential Asset Preview Coordinator

   Responsibilities

   ✓ Open Credential Asset Preview
   ✓ Select Asset Renderer
   ✓ Render Preview Shell
   ✓ Wire Download Action
   ✓ Wire LinkedIn Share Action
   ✓ Close Preview

   Non Responsibilities

   ✗ Credential Detail Rendering
   ✗ Firestore
   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement Resolution
   ✗ Payment Processing

   Governance

   • Asset Preview Authority
   • Renderer Based Architecture
   • No Firestore Access
   • No Authentication Logic

========================================================== */

(function (window, document) {

    "use strict";

    const CredentialAssetPreview = {

        overlayId: "credentialAssetPreviewOverlay",

        open(credential, assetType) {

            if (!credential || !assetType) {
                return;
            }

            this.close();

            const overlay =
                document.createElement("div");

            overlay.id = this.overlayId;
            overlay.className = "credential-asset-preview-overlay";
            overlay.setAttribute("role", "dialog");
            overlay.setAttribute("aria-modal", "true");

            overlay.innerHTML =
                this.buildPreview(
                    credential,
                    assetType
                );

            document.body.appendChild(overlay);

            this.bindEvents(
                overlay,
                credential,
                assetType
            );

        },

        close() {

            const existing =
                document.getElementById(
                    this.overlayId
                );

            if (existing) {
                existing.remove();
            }

        },

        buildPreview(credential, assetType) {

            const title =
                this.resolveTitle(assetType);

            const body =
                this.renderAsset(
                    credential,
                    assetType
                );

            return `
                <div class="credential-asset-preview-backdrop" data-asset-preview-close></div>

                <section class="credential-asset-preview-dialog">

                    <header class="credential-asset-preview-header">
                        <div>
                            <p class="credential-asset-preview-label">
                                Credential Asset Preview
                            </p>

                            <h2>${this.escape(title)}</h2>
                        </div>

                        <button
                            type="button"
                            class="credential-asset-preview-close"
                            data-asset-preview-close
                            aria-label="Close asset preview">
                            ×
                        </button>
                    </header>

                    <div class="credential-asset-preview-body">
                        ${body}
                    </div>

                    <footer class="credential-asset-preview-actions">

                        <button
                            type="button"
                            class="credential-asset-preview-button secondary"
                            data-asset-preview-download>
                            Download
                        </button>

                        <button
                            type="button"
                            class="credential-asset-preview-button primary"
                            data-asset-preview-linkedin>
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
                window.CertificatePreview
            ) {
                return window.CertificatePreview.render(
                    credential
                );
            }

            if (
                assetType === "trainer-certificate" &&
                window.TrainerCertificatePreview
            ) {
                return window.TrainerCertificatePreview.render(
                    credential
                );
            }

            if (
                assetType === "digital-badge" &&
                window.BadgePreview
            ) {
                return window.BadgePreview.render(
                    credential
                );
            }

            return `
                <div class="asset-preview-empty">
                    <h3>Preview unavailable</h3>
                    <p>This credential asset preview is not available yet.</p>
                </div>
            `;

        },

        bindEvents(overlay, credential, assetType) {

            overlay
                .querySelectorAll("[data-asset-preview-close]")
                .forEach((element) => {

                    element.addEventListener(
                        "click",
                        () => this.close()
                    );

                });

            const downloadButton =
                overlay.querySelector(
                    "[data-asset-preview-download]"
                );

            if (downloadButton) {

                downloadButton.addEventListener(
                    "click",
                    () => this.download(
                        credential,
                        assetType
                    )
                );

            }

            const linkedInButton =
                overlay.querySelector(
                    "[data-asset-preview-linkedin]"
                );

            if (linkedInButton) {

                linkedInButton.addEventListener(
                    "click",
                    () => this.shareOnLinkedIn(
                        credential
                    )
                );

            }

            document.addEventListener(
                "keydown",
                this.handleEscape
            );

        },

        handleEscape(event) {

            if (event.key === "Escape") {
                window.CredentialAssetPreview.close();
            }

        },

        download(credential, assetType) {

            const url =
                this.resolveDownloadUrl(
                    credential,
                    assetType
                );

            if (!url) {
                alert("Download is not available for this asset yet.");
                return;
            }

            const anchor =
                document.createElement("a");

            anchor.href = url;
            anchor.download = "";
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";

            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();

        },

        shareOnLinkedIn(credential) {

            const verificationUrl =
                this.resolveVerificationUrl(
                    credential
                );

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

            const assets =
                credential.assets || {};

            if (assetType === "university-certificate") {
                return credential.certificateUrl ||
                    assets.universityCertificateUrl ||
                    assets.certificateUrl ||
                    "";
            }

            if (assetType === "trainer-certificate") {
                return credential.trainerCertificateUrl ||
                    assets.trainerCertificateUrl ||
                    "";
            }

            if (assetType === "digital-badge") {
                return credential.badgeUrl ||
                    assets.digitalBadgeUrl ||
                    assets.badgeUrl ||
                    "";
            }

            return "";

        },

        resolveVerificationUrl(credential) {

            return credential.verificationUrl ||
                credential.verifyUrl ||
                credential.registryUrl ||
                "https://verify.agileai.university";

        },

        resolveTitle(assetType) {

            const titles = {
                "university-certificate": "University Certificate",
                "trainer-certificate": "Trainer Certificate",
                "digital-badge": "Digital Badge"
            };

            return titles[assetType] || "Credential Asset";

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

    window.CredentialAssetPreview = CredentialAssetPreview;

})(window, document);