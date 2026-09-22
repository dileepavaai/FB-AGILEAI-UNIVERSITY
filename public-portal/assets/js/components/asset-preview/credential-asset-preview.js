/* ==========================================================
   LAAU
   Student & Executive Portal

   File      : credential-asset-preview.js
   Version   : 2.3.0
   Status    : ACTIVE
   Phase     : Credential Workspace Stabilization

   Purpose
   ----------------------------------------------------------
   Renders governed previews of published credential assets
   inside the shared Credential Workspace.

   Responsibilities
   ----------------------------------------------------------
   ✓ Render published credential asset previews
   ✓ Render PDF assets
   ✓ Render image assets
   ✓ Render preview navigation
   ✓ Render preview actions
   ✓ Support published asset download
   ✓ Support LinkedIn sharing
   ✓ Handle missing and unsupported assets
   ✓ Validate published URLs before rendering
   ✓ Reject legacy placeholder URL values
   ✓ Support governed and legacy asset-type formats
   ✓ Provide renderer-safe and accessible markup

   Non-Responsibilities
   ----------------------------------------------------------
   ✗ Overlay creation
   ✗ Overlay lifecycle
   ✗ Parent Credential Detail footer rendering
   ✗ Firestore access
   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement resolution
   ✗ Asset generation
   ✗ Asset upload
   ✗ Payment processing
   ✗ Credential mutation

   Architectural Position
   ----------------------------------------------------------
   Credential Detail Overlay
        ↓
   Credential Assets Section
        ↓
   Credential Asset Service
        ↓
   Credential Asset Preview
        ↓
   Asset-Specific Renderer

   Governance
   ----------------------------------------------------------
   • Credential Workspace Renderer

   • Published Asset Consumption Only

   • No Nested Overlay

   • Renderer-Based Architecture

   • No Firestore Access

   • No Authentication Logic

   • Student Portal Read-Only

   • Cloud Storage Asset Rendering

   • Only validated HTTP or HTTPS asset URLs may render.

   • Placeholder URLs must never reach iframe, image,
     anchor or download surfaces.

   • Asset preview navigation belongs in the preview header.

   • Parent Credential Detail actions must not be duplicated
     inside the preview footer.

   Asset Type Authority
   ----------------------------------------------------------
   Governed values:

   • university_certificate
   • trainer_certificate
   • digital_badge
   • recognition_asset

   Compatibility values:

   • university-certificate
   • trainer-certificate
   • digital-badge
   • recognition-asset

   Change History
   ----------------------------------------------------------
   v2.3.0

   • Refined preview workspace markup
   • Preserved a single header back action
   • Removed instructional note below the action footer
   • Improved PDF fallback presentation
   • Added explicit preview surface classes
   • Added accessible iframe title handling
   • Added download-button disabled state
   • Preserved all public APIs
   • Preserved asset URL validation
   • Preserved LinkedIn sharing
   • Preserved read-only portal architecture

   v2.2.0

   • Added published URL validation
   • Rejected placeholder and malformed preview URLs
   • Added governed asset-type normalization
   • Preserved existing public API

   v2.1.0

   • Accepted published asset ViewModel
   • Rendered Cloud Storage assets
   • Supported PDF and image previews
   • Preserved LinkedIn verification sharing

========================================================== */

(function (
    window,
    document
) {

    "use strict";


    /* ======================================================
       CONSTANTS
    ====================================================== */

    const MODULE_NAME =
        "CredentialAssetPreview";

    const MODULE_VERSION =
        "2.4.0";

    const ASSET_TYPES =
        Object.freeze({

            UNIVERSITY_CERTIFICATE:
                "university_certificate",

            TRAINER_CERTIFICATE:
                "trainer_certificate",

            DIGITAL_BADGE:
                "digital_badge",

            RECOGNITION_ASSET:
                "recognition_asset"

        });

    const ASSET_TYPE_ALIASES =
        Object.freeze({

            "university_certificate":
                ASSET_TYPES.UNIVERSITY_CERTIFICATE,

            "university-certificate":
                ASSET_TYPES.UNIVERSITY_CERTIFICATE,

            "trainer_certificate":
                ASSET_TYPES.TRAINER_CERTIFICATE,

            "trainer-certificate":
                ASSET_TYPES.TRAINER_CERTIFICATE,

            "digital_badge":
                ASSET_TYPES.DIGITAL_BADGE,

            "digital-badge":
                ASSET_TYPES.DIGITAL_BADGE,

            "recognition_asset":
                ASSET_TYPES.RECOGNITION_ASSET,

            "recognition-asset":
                ASSET_TYPES.RECOGNITION_ASSET

        });

    const ASSET_TITLES =
        Object.freeze({

            [ASSET_TYPES.UNIVERSITY_CERTIFICATE]:
                "University Certificate",

            [ASSET_TYPES.TRAINER_CERTIFICATE]:
                "Trainer Certificate",

            [ASSET_TYPES.DIGITAL_BADGE]:
                "Digital Badge",

            [ASSET_TYPES.RECOGNITION_ASSET]:
                "Recognition Asset"

        });

    const IMAGE_FILE_EXTENSIONS =
        Object.freeze([
            "png",
            "jpg",
            "jpeg",
            "webp",
            "gif",
            "svg"
        ]);

    const IMAGE_ASSET_FORMATS =
        Object.freeze([
            "image",
            "png",
            "jpg",
            "jpeg",
            "webp",
            "gif",
            "svg"
        ]);


    /* ======================================================
       NORMALIZATION HELPERS
    ====================================================== */

    function normalizeString(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }

        return String(
            value
        ).trim();

    }


    function normalizeLowercase(
        value
    ) {

        return normalizeString(
            value
        ).toLowerCase();

    }


    /* ======================================================
       PUBLIC COMPONENT
    ====================================================== */

    // LAAU action repair: 20260922-badge-actions-1
    const MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024;
    const DOWNLOAD_TIMEOUT_MS = 20000;
    let downloadOperation = null;

    function signedInUid() {
        try {
            return normalizeString(window.firebase?.auth?.()?.currentUser?.uid);
        } catch {
            return "";
        }
    }

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

            const normalizedAssetType =
                this.normalizeAssetType(
                    assetType
                );

            const title =
                this.resolveTitle(
                    normalizedAssetType
                );

            const preview =
                this.renderAsset(
                    credential,
                    normalizedAssetType,
                    asset
                );

            const downloadUrl =
                this.resolvePublishedDownloadUrl(
                    asset
                );

            const hasDownload = Boolean(downloadUrl && new URL(downloadUrl).protocol === "https:");
            const verificationUrl = this.resolveVerificationUrl(credential);
            const linkedInUrl = verificationUrl ?
                "https://www.linkedin.com/sharing/share-offsite/?url=" +
                encodeURIComponent(verificationUrl) : "";

            return `

                <section
                    class="credential-asset-preview-workspace"
                    data-credential-section="asset-preview"
                    data-credential-asset-type="${this.escapeAttribute(
                        normalizedAssetType
                    )}">

                    <header
                        class="credential-asset-preview-header">

                        <div>

                            <p
                                class="credential-asset-preview-label">

                                Credential Asset Preview

                            </p>

                            <h2>

                                ${this.escape(
                                    title
                                )}

                            </h2>

                        </div>

                        <button
                            type="button"
                            class="credential-asset-preview-back js-back-to-credential-details"
                            aria-label="Return to credential details">

                            <span aria-hidden="true">
                                ←
                            </span>

                            <span>
                                Back to Credential Details
                            </span>

                        </button>

                    </header>

                    <div
                        class="credential-asset-preview-body">

                        ${preview}

                    </div>

                    <footer
                        class="credential-asset-preview-actions"
                        aria-label="Credential asset actions">

                        <button
                            type="button"
                            class="credential-asset-preview-button secondary js-download-credential-asset"
                            data-credential-asset-type="${this.escapeAttribute(
                                normalizedAssetType
                            )}"
                            ${hasDownload ? "" : "disabled"}
                            aria-disabled="${hasDownload ? "false" : "true"}">

                            Download

                        </button>

                        ${linkedInUrl ? `
                        <a class="credential-asset-preview-button primary js-share-credential-linkedin"
                            href="${this.escapeAttribute(linkedInUrl)}"
                            target="_blank" rel="noopener noreferrer">
                            Share on LinkedIn
                        </a>` : ""}

                        <p class="credential-asset-action-status" role="status"
                            aria-live="polite" aria-atomic="true"></p>
                        <p class="credential-asset-download-fallback" hidden>
                            The automatic download could not finish.
                            <a class="js-open-published-credential-asset"
                                href="${this.escapeAttribute(downloadUrl)}"
                                target="_blank" rel="noopener noreferrer">Open published file</a>
                            and use the browser's download control, or right-click
                            the badge and choose “Save image as…”.
                        </p>
                        ${verificationUrl ? `
                        <p class="credential-share-instructions">
                            LinkedIn shares your public verification link.
                            ${normalizedAssetType === ASSET_TYPES.DIGITAL_BADGE ?
                                "To include the badge image, attach the downloaded PNG to your LinkedIn post." :
                                "You can attach the downloaded certificate to your LinkedIn post."}
                            You can also copy this
                            <a href="${this.escapeAttribute(verificationUrl)}" target="_blank"
                                rel="noopener noreferrer">verification link</a> into your post.
                        </p>` : ""}

                    </footer>

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
                    "The published asset does not contain a valid preview URL."
                );

            }

            const assetFormat =
                this.resolveAssetFormat(
                    asset,
                    assetType
                );

            if (
                assetFormat ===
                "pdf"
            ) {

                return this.renderPdfAsset(
                    asset,
                    previewUrl
                );

            }

            if (
                assetFormat ===
                "image"
            ) {

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

            if (
                !this.isUsablePublishedUrl(
                    previewUrl
                )
            ) {

                return this.renderEmpty(
                    "PDF preview unavailable",
                    "The published PDF URL is invalid or has not yet been updated."
                );

            }

            const title =
                normalizeString(
                    asset?.assetLabel
                ) ||
                normalizeString(
                    asset?.fileName
                ) ||
                "Credential PDF";

            const escapedUrl =
                this.escapeAttribute(
                    previewUrl
                );

            const escapedTitle =
                this.escapeAttribute(
                    title
                );

            return `

                <div
                    class="credential-published-asset credential-published-asset--pdf">

                    <div
                        class="credential-published-asset-surface">

                        <iframe
                            class="credential-published-asset-frame"
                            src="${escapedUrl}"
                            title="${escapedTitle}"
                            loading="eager"
                            referrerpolicy="no-referrer">

                        </iframe>

                    </div>

                    <p
                        class="credential-published-asset-fallback">

                        Preview unavailable or difficult to read?

                        <a
                            href="${escapedUrl}"
                            target="_blank"
                            rel="noopener noreferrer">

                            Open certificate in a new tab

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

            if (
                !this.isUsablePublishedUrl(
                    previewUrl
                )
            ) {

                return this.renderEmpty(
                    "Image preview unavailable",
                    "The published image URL is invalid or has not yet been updated."
                );

            }

            const credentialName =
                normalizeString(
                    credential?.programName
                ) ||
                normalizeString(
                    credential?.program_name
                ) ||
                normalizeString(
                    credential?.credentialName
                ) ||
                normalizeString(
                    credential?.credential_name
                ) ||
                this.resolveTitle(
                    assetType
                );

            const imageAlt =
                normalizeString(
                    asset?.assetLabel
                ) ||
                normalizeString(
                    asset?.fileName
                ) ||
                `${credentialName} ${this.resolveTitle(
                    assetType
                )}`;

            return `

                <div
                    class="credential-published-asset credential-published-asset--image">

                    <div
                        class="credential-published-asset-surface">

                        <img
                            class="credential-published-asset-image asset-preview-image"
                            src="${this.escapeAttribute(
                                previewUrl
                            )}"
                            alt="${this.escapeAttribute(
                                imageAlt
                            )}"
                            loading="eager"
                            referrerpolicy="no-referrer">

                    </div>

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
                normalizeString(
                    asset?.fileName
                ) ||
                normalizeString(
                    asset?.assetLabel
                ) ||
                "Published credential asset";

            if (
                !this.isUsablePublishedUrl(
                    previewUrl
                )
            ) {

                return this.renderEmpty(
                    "Preview format unavailable",
                    "This asset does not contain a valid published URL."
                );

            }

            return `

                <div
                    class="asset-preview-empty">

                    <h3>
                        Preview format unavailable
                    </h3>

                    <p>
                        This published asset cannot be
                        previewed directly in the portal.
                    </p>

                    <a
                        class="credential-asset-preview-button secondary"
                        href="${this.escapeAttribute(
                            previewUrl
                        )}"
                        target="_blank"
                        rel="noopener noreferrer">

                        Open ${this.escape(
                            fileName
                        )}

                    </a>

                </div>

            `;

        },


        /* ==================================================
           EMPTY STATE
        ================================================== */

        renderEmpty(
            title = "Preview unavailable",
            message =
                "This credential asset preview is not available yet."
        ) {

            return `

                <div
                    class="asset-preview-empty">

                    <h3>
                        ${this.escape(
                            title
                        )}
                    </h3>

                    <p>
                        ${this.escape(
                            message
                        )}
                    </p>

                </div>

            `;

        },


        /* ==================================================
           DOWNLOAD
        ================================================== */

        async download(credential, assetType, asset) {
            const overlay = window.CredentialDetailOverlay;
            const workspace = overlay?.body?.querySelector(".credential-asset-preview-workspace");
            const status = workspace?.querySelector(".credential-asset-action-status");
            const button = workspace?.querySelector(".js-download-credential-asset");
            const fallback = workspace?.querySelector(".credential-asset-download-fallback");
            const uid = signedInUid();
            const normalizedType = this.normalizeAssetType(assetType);
            const credentialId = normalizeString(credential?.credentialId || credential?.credential_id || credential?.id);
            const matches = () => Boolean(
                uid && signedInUid() === uid && button && status && workspace?.isConnected &&
                overlay?.isOpen && overlay.activeCredential === credential &&
                overlay.activeAsset === asset &&
                this.normalizeAssetType(overlay.activeAssetType) === normalizedType
            );
            if (downloadOperation) return false;
            if (!credential || !asset || !matches() || asset.status !== "published" ||
                asset.isLatest !== true || asset.learnerUid !== uid ||
                normalizeString(asset.credentialId) !== credentialId ||
                this.normalizeAssetType(asset.assetType) !== normalizedType) {
                if (status) status.textContent = "Download unavailable. Reopen your credential and try again.";
                return false;
            }
            const url = this.resolvePublishedDownloadUrl(asset);
            if (!url || new URL(url).protocol !== "https:") {
                if (status) status.textContent = "The published download URL is missing or invalid.";
                return false;
            }
            const controller = new window.AbortController();
            const operation = { controller, button, status, fallback, cancelled: false };
            downloadOperation = operation;
            const current = () => downloadOperation === operation && !operation.cancelled && matches();
            button.disabled = true;
            button.setAttribute("aria-disabled", "true");
            button.setAttribute("aria-busy", "true");
            if (fallback) fallback.hidden = true;
            if (status) status.textContent = "Preparing your download…";
            const timer = window.setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
            try {
                // This is the published URL already approved by CredentialAssetService.
                // Never attach a Firebase ID token or ambient browser credentials.
                const response = await window.fetch(url, {
                    method: "GET", credentials: "omit", redirect: "error",
                    referrerPolicy: "no-referrer", signal: controller.signal
                });
                if (!response.ok || response.type === "opaque") throw new Error("download-response");
                const mime = normalizeLowercase(response.headers.get("Content-Type")).split(";")[0];
                const formats = {
                    "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp",
                    "image/gif": "gif", "application/pdf": "pdf"
                };
                const extension = formats[mime];
                const format = this.resolveAssetFormat(asset, normalizedType);
                if (!extension || (format === "pdf" && extension !== "pdf") ||
                    (format === "image" && extension === "pdf")) throw new Error("download-format");
                const reportedSize = Number(response.headers.get("Content-Length") || 0);
                if (reportedSize > MAX_DOWNLOAD_BYTES) throw new Error("download-size");
                const chunks = [];
                let size = 0;
                if (!response.body?.getReader) throw new Error("download-stream");
                const reader = response.body.getReader();
                while (true) {
                    if (!current()) throw new Error("download-stale");
                    const { value, done } = await reader.read();
                    if (done) break;
                    size += value.byteLength;
                    if (size > MAX_DOWNLOAD_BYTES) {
                        await reader.cancel();
                        throw new Error("download-size");
                    }
                    chunks.push(value);
                }
                if (!size || !current()) throw new Error("download-empty-or-stale");
                const blob = new window.Blob(chunks, { type: mime });
                const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
                const text = String.fromCharCode(...bytes);
                const correctSignature =
                    (extension === "png" && [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)) ||
                    (extension === "jpg" && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) ||
                    (extension === "pdf" && text.startsWith("%PDF-")) ||
                    (extension === "gif" && /^(GIF87a|GIF89a)/.test(text)) ||
                    (extension === "webp" && text.startsWith("RIFF") && text.slice(8,12) === "WEBP");
                if (!correctSignature) throw new Error("download-content");
                if (!current()) return false;
                const objectUrl = window.URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = objectUrl;
                anchor.download = this.resolveDownloadFileName(asset, credentialId, normalizedType, extension);
                document.body.appendChild(anchor);
                try { anchor.click(); } finally {
                    anchor.remove();
                    window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);
                }
                if (status) status.textContent = "Download started. Check your browser's Downloads.";
                return true;
            } catch (error) {
                if (current()) {
                    if (status) status.textContent = "Download could not finish. Use “Open published file” below to save a copy.";
                    if (fallback) fallback.hidden = false;
                }
                return false;
            } finally {
                window.clearTimeout(timer);
                controller.abort();
                if (downloadOperation === operation) downloadOperation = null;
                if (button?.isConnected) {
                    button.disabled = false;
                    button.setAttribute("aria-disabled", "false");
                    button.removeAttribute("aria-busy");
                }
            }
        },

        cancelDownload() {
            if (!downloadOperation) return;
            const operation = downloadOperation;
            downloadOperation = null;
            operation.cancelled = true;
            operation.controller.abort();
            if (operation.button?.isConnected) {
                operation.button.disabled = false;
                operation.button.setAttribute("aria-disabled", "false");
                operation.button.removeAttribute("aria-busy");
            }
            if (operation.status?.isConnected) operation.status.textContent = "";
            if (operation.fallback?.isConnected) operation.fallback.hidden = true;
        },

        resolveDownloadFileName(asset, credentialId, assetType, extension) {
            let name = normalizeString(asset?.fileName)
                .replace(/[<>:"/\\|?*\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/g, "_")
                .replace(/^[. ]+|[. ]+$/g, "");
            if (!name || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) {
                name = `${credentialId}_${assetType}`.replace(/[^a-zA-Z0-9_-]/g, "_");
            }
            name = name.replace(/\.[a-zA-Z0-9]{1,10}$/, "").slice(0, 150);
            return `${name || "credential-asset"}.${extension}`;
        },

        /* Native links in render() do not depend on popup JavaScript. */
        shareOnLinkedIn(credential) {
            const verificationUrl = this.resolveVerificationUrl(credential);
            if (!verificationUrl) return false;
            const anchor = document.createElement("a");
            anchor.href = "https://www.linkedin.com/sharing/share-offsite/?url=" +
                encodeURIComponent(verificationUrl);
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            return true;
        },


        /* ==================================================
           ASSET TYPE NORMALIZATION
        ================================================== */

        normalizeAssetType(
            assetType
        ) {

            const normalizedValue =
                normalizeLowercase(
                    assetType
                );

            return (
                ASSET_TYPE_ALIASES[
                    normalizedValue
                ] ||
                normalizedValue
            );

        },


        /* ==================================================
           PUBLISHED URL HELPERS
        ================================================== */

        resolvePublishedPreviewUrl(
            asset
        ) {

            if (!asset) {

                return "";

            }

            let servicePreviewUrl =
                "";

            const directPreviewUrl =
                normalizeString(
                    asset.previewUrl ||
                    asset.preview_url
                );

            const directDownloadUrl =
                normalizeString(
                    asset.downloadUrl ||
                    asset.download_url
                );

            if (
                window.CredentialAssetService &&
                typeof window.CredentialAssetService
                    .getPreviewUrl ===
                    "function"
            ) {

                servicePreviewUrl =
                    normalizeString(
                        window.CredentialAssetService
                            .getPreviewUrl(
                                asset
                            )
                    );

            }

            const candidates = [
                servicePreviewUrl,
                directPreviewUrl,
                directDownloadUrl
            ];

            const resolvedUrl =
                candidates.find(
                    candidate =>
                        this.isUsablePublishedUrl(
                            candidate
                        )
                ) ||
                "";

            if (!resolvedUrl) {

                console.warn(
                    `[${MODULE_NAME}] No usable preview URL could be resolved.`,
                    {
                        assetType:
                            asset.assetType ||
                            asset.asset_type ||
                            "",

                        documentId:
                            asset.id ||
                            "",

                        previewUrlPresent:
                            Boolean(
                                directPreviewUrl
                            ),

                        downloadUrlPresent:
                            Boolean(
                                directDownloadUrl
                            )
                    }
                );

            }

            return resolvedUrl;

        },


        resolvePublishedDownloadUrl(
            asset
        ) {

            if (!asset) {

                return "";

            }

            let serviceDownloadUrl =
                "";

            const directDownloadUrl =
                normalizeString(
                    asset.downloadUrl ||
                    asset.download_url
                );

            const directPreviewUrl =
                normalizeString(
                    asset.previewUrl ||
                    asset.preview_url
                );

            if (
                window.CredentialAssetService &&
                typeof window.CredentialAssetService
                    .getDownloadUrl ===
                    "function"
            ) {

                serviceDownloadUrl =
                    normalizeString(
                        window.CredentialAssetService
                            .getDownloadUrl(
                                asset
                            )
                    );

            }

            const candidates = [
                serviceDownloadUrl,
                directDownloadUrl,
                directPreviewUrl
            ];

            const resolvedUrl =
                candidates.find(
                    candidate =>
                        this.isUsablePublishedUrl(
                            candidate
                        )
                ) ||
                "";

            if (!resolvedUrl) {

                console.warn(
                    `[${MODULE_NAME}] No usable download URL could be resolved.`,
                    {
                        documentId:
                            asset.id ||
                            "",

                        assetType:
                            asset.assetType ||
                            asset.asset_type ||
                            ""
                    }
                );

            }

            return resolvedUrl;

        },


        /* ==================================================
           URL VALIDATION
        ================================================== */

        isUsablePublishedUrl(
            value
        ) {

            const normalizedValue =
                normalizeString(
                    value
                );

            if (!normalizedValue) {

                return false;

            }

            const lowercaseValue =
                normalizedValue.toLowerCase();

            if (
                lowercaseValue.includes(
                    "<same as"
                ) ||
                lowercaseValue.includes(
                    "same as download"
                ) ||
                lowercaseValue.includes(
                    "same_as_download"
                ) ||
                lowercaseValue.includes(
                    "placeholder"
                ) ||
                lowercaseValue ===
                    "todo" ||
                lowercaseValue ===
                    "tbd" ||
                lowercaseValue ===
                    "null" ||
                lowercaseValue ===
                    "undefined"
            ) {

                return false;

            }

            if (
                normalizedValue.startsWith(
                    "<"
                ) ||
                normalizedValue.endsWith(
                    ">"
                )
            ) {

                return false;

            }

            let parsedUrl;

            try {

                parsedUrl =
                    new URL(
                        normalizedValue
                    );

            } catch {

                return false;

            }

            if (
                parsedUrl.protocol !==
                    "https:" &&
                parsedUrl.protocol !==
                    "http:"
            ) {

                return false;

            }

            return true;

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

            const normalizedAssetType =
                this.normalizeAssetType(
                    assetType ||
                    asset.assetType ||
                    asset.asset_type
                );

            const mimeType =
                normalizeLowercase(
                    asset.mimeType ||
                    asset.mime_type
                );

            const fileExtension =
                normalizeLowercase(
                    asset.fileExtension ||
                    asset.file_extension
                ).replace(
                    ".",
                    ""
                );

            const assetFormat =
                normalizeLowercase(
                    asset.assetFormat ||
                    asset.asset_format
                );

            if (
                mimeType ===
                    "application/pdf" ||
                fileExtension ===
                    "pdf" ||
                assetFormat ===
                    "pdf"
            ) {

                return "pdf";

            }

            if (
                mimeType.startsWith(
                    "image/"
                ) ||
                IMAGE_FILE_EXTENSIONS.includes(
                    fileExtension
                ) ||
                IMAGE_ASSET_FORMATS.includes(
                    assetFormat
                )
            ) {

                return "image";

            }

            if (
                normalizedAssetType ===
                    ASSET_TYPES.UNIVERSITY_CERTIFICATE ||
                normalizedAssetType ===
                    ASSET_TYPES.TRAINER_CERTIFICATE
            ) {

                return "pdf";

            }

            if (
                normalizedAssetType ===
                    ASSET_TYPES.DIGITAL_BADGE
            ) {

                return "image";

            }

            return "";

        },


        /* ==================================================
           VERIFICATION URL
        ================================================== */

        resolveVerificationUrl(credential) {
            if (!credential) return "";
            const credentialId = normalizeString(
                credential.credentialId || credential.credential_id || credential.id
            ).toUpperCase();
            // Share only the public verifier for this credential. Stored asset URLs
            // may contain private download tokens and must never be shared here.
            if (!/^(?:LAAU|AAU)-[A-Z0-9]{8}$/.test(credentialId)) return "";
            return "https://verify.laau.university/?credentialId=" +
                encodeURIComponent(credentialId);
        },


        /* ==================================================
           TITLE
        ================================================== */

        resolveTitle(
            assetType
        ) {

            const normalizedAssetType =
                this.normalizeAssetType(
                    assetType
                );

            return (
                ASSET_TITLES[
                    normalizedAssetType
                ] ||
                "Credential Asset"
            );

        },


        /* ==================================================
           COMPATIBILITY
        ================================================== */

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

            const normalizedAssetType =
                this.normalizeAssetType(
                    assetType
                );

            if (
                window.CredentialDetailOverlay &&
                typeof window.CredentialDetailOverlay
                    .showAssetPreview ===
                    "function"
            ) {

                window.CredentialDetailOverlay
                    .showAssetPreview(
                        normalizedAssetType
                    );

                return;

            }

            console.warn(
                `[${MODULE_NAME}] open() is deprecated. Use CredentialDetailOverlay.showAssetPreview().`
            );

        },


        /* ==================================================
           ESCAPING
        ================================================== */

        escape(
            value
        ) {

            return normalizeString(
                value
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        },


        escapeAttribute(
            value
        ) {

            return this.escape(
                value
            );

        },


        /* ==================================================
           PUBLIC CONSTANT ACCESS
        ================================================== */

        getAssetTypes() {

            return {
                ...ASSET_TYPES
            };

        }

    };


    /* ======================================================
       PUBLIC REGISTRATION
    ====================================================== */

    window.CredentialAssetPreview =
        CredentialAssetPreview;

    for (const name of [
        "portal:session-cleanup-started", "portal:session-cleared",
        "portal:signout-started", "portal:auth-redirecting"
    ]) {
        window.addEventListener(name, () => CredentialAssetPreview.cancelDownload());
        document.addEventListener(name, () => CredentialAssetPreview.cancelDownload());
    }

    window.addEventListener("pagehide", () => CredentialAssetPreview.cancelDownload());

    console.info(
        `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
    );

})(window, document);