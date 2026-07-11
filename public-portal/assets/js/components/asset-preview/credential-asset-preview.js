/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-asset-preview.js
   Version   : 2.1.0
   Status    : ACTIVE
   Phase     : Credential Asset Consumption

   Purpose
   ----------------------------------------------------------
   Credential Asset Preview Renderer

   Responsibilities

   ✓ Render Published Credential Asset Preview
   ✓ Render PDF Assets
   ✓ Render Image Assets
   ✓ Render Preview Actions
   ✓ Support Published Asset Download
   ✓ Support LinkedIn Share Action
   ✓ Handle Missing and Unsupported Assets

   Non Responsibilities

   ✗ Overlay Creation
   ✗ Overlay Lifecycle
   ✗ Firestore
   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement Resolution
   ✗ Asset Generation
   ✗ Asset Upload
   ✗ Payment Processing

   Governance

   • Credential Workspace Renderer
   • Published Asset Consumption Only
   • No Nested Overlay
   • Renderer-Based Architecture
   • No Firestore Access
   • No Authentication Logic
   • Student Portal Read-Only
   • Cloud Storage Asset Rendering

   Change History
   ----------------------------------------------------------
   v2.1.0
   • Accepts published asset ViewModel
   • Renders actual Cloud Storage assets
   • Supports PDF and image previews
   • Downloads using published asset URL
   • Removes dependency on credential-level asset URLs
   • Preserves LinkedIn verification sharing
   • Adds missing and unsupported asset states

========================================================== */

(function (window, document) {

    "use strict";

    const CredentialAssetPreview = {

        /* ==================================================
           RENDER
        ================================================== */

        render(
            credential,
            assetType,
            asset
        ) {

            if (
                !credential ||
                !assetType
            ) {

                return this.renderEmpty(
                    "Preview unavailable",
                    "Credential information is unavailable."
                );

            }

            const title =
                this.resolveTitle(
                    assetType
                );

            const preview =
                this.renderAsset(
                    credential,
                    assetType,
                    asset
                );

            const hasDownload =
                Boolean(
                    this.resolvePublishedDownloadUrl(
                        asset
                    )
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
                            data-credential-asset-type="${this.escape(assetType)}"
                            ${hasDownload ? "" : "disabled"}
                            aria-disabled="${hasDownload ? "false" : "true"}">

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

        /* ==================================================
           ASSET RENDERER
        ================================================== */

        renderAsset(
            credential,
            assetType,
            asset
        ) {

            if (!asset) {

                return this.renderEmpty(
                    "Published asset unavailable",
                    "A published asset could not be found for this credential."
                );

            }

            const previewUrl =
                this.resolvePublishedPreviewUrl(
                    asset
                );

            if (!previewUrl) {

                return this.renderEmpty(
                    "Preview unavailable",
                    "The published asset does not contain a usable preview URL."
                );

            }

            const assetFormat =
                this.resolveAssetFormat(
                    asset,
                    assetType
                );

            if (assetFormat === "pdf") {

                return this.renderPdfAsset(
                    asset,
                    previewUrl
                );

            }

            if (assetFormat === "image") {

                return this.renderImageAsset(
                    credential,
                    assetType,
                    asset,
                    previewUrl
                );

            }

            return this.renderUnsupportedAsset(
                asset,
                previewUrl
            );

        },

        /* ==================================================
           PDF RENDERER
        ================================================== */

        renderPdfAsset(
            asset,
            previewUrl
        ) {

            const title =
                asset.assetLabel ||
                asset.fileName ||
                "Credential PDF";

            return `

                <div
                    class="credential-published-asset credential-published-asset--pdf">

                    <iframe
                        class="credential-published-asset-frame"
                        src="${this.escapeAttribute(previewUrl)}"
                        title="${this.escapeAttribute(title)}"
                        loading="lazy">

                    </iframe>

                    <p class="credential-published-asset-fallback">

                        Unable to see the PDF preview?

                        <a
                            href="${this.escapeAttribute(previewUrl)}"
                            target="_blank"
                            rel="noopener noreferrer">

                            Open the published PDF

                        </a>

                    </p>

                </div>

            `;

        },

        /* ==================================================
           IMAGE RENDERER
        ================================================== */

        renderImageAsset(
            credential,
            assetType,
            asset,
            previewUrl
        ) {

            const credentialName =
                credential.programName ||
                credential.program_name ||
                credential.credentialName ||
                credential.credential_name ||
                this.resolveTitle(assetType);

            const imageAlt =
                asset.assetLabel ||
                asset.fileName ||
                `${credentialName} ${this.resolveTitle(assetType)}`;

            return `

                <div
                    class="credential-published-asset credential-published-asset--image">

                    <img
                        class="credential-published-asset-image"
                        src="${this.escapeAttribute(previewUrl)}"
                        alt="${this.escapeAttribute(imageAlt)}"
                        loading="lazy">

                </div>

            `;

        },

        /* ==================================================
           UNSUPPORTED ASSET
        ================================================== */

        renderUnsupportedAsset(
            asset,
            previewUrl
        ) {

            const fileName =
                asset.fileName ||
                asset.assetLabel ||
                "Published credential asset";

            return `

                <div class="asset-preview-empty">

                    <h3>

                        Preview format unavailable

                    </h3>

                    <p>

                        This published asset cannot be previewed directly
                        in the portal.

                    </p>

                    <a
                        class="btn btn-secondary"
                        href="${this.escapeAttribute(previewUrl)}"
                        target="_blank"
                        rel="noopener noreferrer">

                        Open ${this.escape(fileName)}

                    </a>

                </div>

            `;

        },

        /* ==================================================
           EMPTY STATE
        ================================================== */

        renderEmpty(
            title = "Preview unavailable",
            message = "This credential asset preview is not available yet."
        ) {

            return `

                <div class="asset-preview-empty">

                    <h3>

                        ${this.escape(title)}

                    </h3>

                    <p>

                        ${this.escape(message)}

                    </p>

                </div>

            `;

        },

        /* ==================================================
           DOWNLOAD
        ================================================== */

        download(
            credential,
            assetType,
            asset
        ) {

            if (
                !credential ||
                !assetType ||
                !asset
            ) {

                window.alert(
                    "Download is not available for this asset yet."
                );

                return;

            }

            const url =
                this.resolvePublishedDownloadUrl(
                    asset
                );

            if (!url) {

                window.alert(
                    "Download is not available for this asset yet."
                );

                return;

            }

            const anchor =
                document.createElement("a");

            anchor.href =
                url;

            anchor.target =
                "_blank";

            anchor.rel =
                "noopener noreferrer";

            if (asset.fileName) {

                anchor.download =
                    asset.fileName;

            }
            else {

                anchor.download =
                    "";

            }

            document.body.appendChild(
                anchor
            );

            anchor.click();

            anchor.remove();

        },

        /* ==================================================
           LINKEDIN SHARE
        ================================================== */

        shareOnLinkedIn(credential) {

            if (!credential) {

                window.alert(
                    "LinkedIn sharing is not available for this credential yet."
                );

                return;

            }

            const verificationUrl =
                this.resolveVerificationUrl(
                    credential
                );

            if (!verificationUrl) {

                window.alert(
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

        /* ==================================================
           PUBLISHED URL HELPERS
        ================================================== */

        resolvePublishedPreviewUrl(asset) {

            if (!asset) {
                return "";
            }

            if (
                window.CredentialAssetService &&
                typeof window.CredentialAssetService.getPreviewUrl ===
                    "function"
            ) {

                return (
                    window.CredentialAssetService.getPreviewUrl(
                        asset
                    ) || ""
                );

            }

            return (
                asset.previewUrl ||
                asset.downloadUrl ||
                ""
            );

        },

        resolvePublishedDownloadUrl(asset) {

            if (!asset) {
                return "";
            }

            if (
                window.CredentialAssetService &&
                typeof window.CredentialAssetService.getDownloadUrl ===
                    "function"
            ) {

                return (
                    window.CredentialAssetService.getDownloadUrl(
                        asset
                    ) || ""
                );

            }

            return (
                asset.downloadUrl ||
                asset.previewUrl ||
                ""
            );

        },

        /* ==================================================
           ASSET FORMAT
        ================================================== */

        resolveAssetFormat(
            asset,
            assetType
        ) {

            if (!asset) {
                return "";
            }

            const mimeType =
                String(
                    asset.mimeType || ""
                ).toLowerCase();

            const fileExtension =
                String(
                    asset.fileExtension || ""
                )
                    .toLowerCase()
                    .replace(".", "");

            const assetFormat =
                String(
                    asset.assetFormat || ""
                ).toLowerCase();

            if (
                mimeType === "application/pdf" ||
                fileExtension === "pdf" ||
                assetFormat === "pdf"
            ) {

                return "pdf";

            }

            if (
                mimeType.startsWith("image/") ||
                [
                    "png",
                    "jpg",
                    "jpeg",
                    "webp",
                    "gif",
                    "svg"
                ].includes(fileExtension) ||
                [
                    "image",
                    "png",
                    "jpg",
                    "jpeg",
                    "webp",
                    "svg"
                ].includes(assetFormat)
            ) {

                return "image";

            }

            /*
             * Asset-type fallback where historical records
             * do not yet include MIME or file metadata.
             */

            if (
                assetType === "university-certificate" ||
                assetType === "trainer-certificate"
            ) {

                return "pdf";

            }

            if (
                assetType === "digital-badge"
            ) {

                return "image";

            }

            return "";

        },

        /* ==================================================
           VERIFICATION URL
        ================================================== */

        resolveVerificationUrl(credential) {

            if (!credential) {
                return "";
            }

            const credentialId =
                String(
                    credential.credentialId ||
                    credential.credential_id ||
                    credential.id ||
                    ""
                ).trim();

            const explicitUrl =
                credential.verificationUrl ||
                credential.verification_url ||
                credential.verifyUrl ||
                credential.verify_url ||
                credential.registryUrl ||
                credential.registry_url ||
                "";

            if (explicitUrl) {
                return explicitUrl;
            }

            if (credentialId) {

                return (
                    "https://verify.agileai.university/?credentialId=" +
                    encodeURIComponent(
                        credentialId
                    )
                );

            }

            return "https://verify.agileai.university";

        },

        /* ==================================================
           TITLE
        ================================================== */

        resolveTitle(assetType) {

            const titles = {

                "university-certificate":
                    "University Certificate",

                "trainer-certificate":
                    "Trainer Certificate",

                "digital-badge":
                    "Digital Badge",

                "recognition-asset":
                    "Recognition Asset"

            };

            return (
                titles[assetType] ||
                "Credential Asset"
            );

        },

        /* ==================================================
           COMPATIBILITY
        ================================================== */

        /*
         * Temporary compatibility method.
         *
         * Existing callers should be migrated to:
         *
         * CredentialDetailOverlay.showAssetPreview(assetType)
         */

        open(
            credential,
            assetType
        ) {

            if (
                !credential ||
                !assetType
            ) {

                return;

            }

            if (
                window.CredentialDetailOverlay &&
                typeof window.CredentialDetailOverlay.showAssetPreview ===
                    "function"
            ) {

                window.CredentialDetailOverlay.showAssetPreview(
                    assetType
                );

                return;

            }

            console.warn(
                "[CredentialAssetPreview] open() is deprecated. Use CredentialDetailOverlay.showAssetPreview()."
            );

        },

        /* ==================================================
           ESCAPING
        ================================================== */

        escape(value) {

            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        },

        escapeAttribute(value) {

            return this.escape(
                value
            );

        }

    };

    window.CredentialAssetPreview =
        CredentialAssetPreview;

    console.info(
        "[CredentialAssetPreview] Loaded v2.1.0"
    );

})(window, document);