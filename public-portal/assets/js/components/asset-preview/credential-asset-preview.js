/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-asset-preview.js
   Version   : 2.2.0
   Status    : ACTIVE
   Phase     : Credential Asset Consumption

   Purpose
   ----------------------------------------------------------
   Credential Asset Preview Renderer

   Responsibilities
   ----------------------------------------------------------
   ✓ Render published credential asset previews
   ✓ Render PDF assets
   ✓ Render image assets
   ✓ Render preview actions
   ✓ Support published asset download
   ✓ Support LinkedIn share action
   ✓ Handle missing and unsupported assets
   ✓ Validate published URLs before rendering
   ✓ Reject legacy placeholder URL values
   ✓ Support governed and legacy asset-type formats

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Overlay creation
   ✗ Overlay lifecycle
   ✗ Firestore access
   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement resolution
   ✗ Asset generation
   ✗ Asset upload
   ✗ Payment processing
   ✗ Credential mutation

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
   • Only validated HTTP or HTTPS asset URLs may render
   • Placeholder URLs must never reach iframe, image,
     anchor or download surfaces

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
   v2.2.0
   • Added published URL validation
   • Rejects placeholder and malformed preview URLs
   • Falls back from invalid preview URL to valid download URL
   • Supports underscore and hyphen asset-type values
   • Normalizes asset type before title and format resolution
   • Adds safe URL diagnostics
   • Preserves existing public API
   • Preserves overlay integration
   • Preserves LinkedIn sharing
   • Preserves read-only portal architecture

   v2.1.0
   • Accepted published asset ViewModel
   • Rendered actual Cloud Storage assets
   • Supported PDF and image previews
   • Downloaded using published asset URL
   • Removed dependency on credential-level asset URLs
   • Preserved LinkedIn verification sharing
   • Added missing and unsupported asset states

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
        "2.2.0";

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

            const hasDownload =
                Boolean(
                    downloadUrl
                );

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
                            class="btn btn-secondary js-back-to-credential-details">

                            ← Back to Credential Details

                        </button>

                    </header>

                    <div
                        class="credential-asset-preview-body">

                        ${preview}

                    </div>

                    <footer
                        class="credential-asset-preview-actions">

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

                        <button
                            type="button"
                            class="credential-asset-preview-button primary js-share-credential-linkedin"
                            data-credential-asset-type="${this.escapeAttribute(
                                normalizedAssetType
                            )}">

                            Share on LinkedIn

                        </button>

                    </footer>

                    <p
                        class="credential-asset-preview-note">

                        Tip: Download the asset first, then
                        upload it manually while sharing on
                        LinkedIn.

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

            if (
                !asset
            ) {

                return this.renderEmpty(
                    "Published asset unavailable",
                    "A published asset could not be found for this credential."
                );

            }

            const previewUrl =
                this.resolvePublishedPreviewUrl(
                    asset
                );

            if (
                !previewUrl
            ) {

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

                    <iframe
                        class="credential-published-asset-frame"
                        src="${escapedUrl}"
                        title="${escapedTitle}"
                        loading="lazy"
                        referrerpolicy="no-referrer">

                    </iframe>

                    <p
                        class="credential-published-asset-fallback">

                        Unable to see the PDF preview?

                        <a
                            href="${escapedUrl}"
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

                    <img
                        class="credential-published-asset-image"
                        src="${this.escapeAttribute(
                            previewUrl
                        )}"
                        alt="${this.escapeAttribute(
                            imageAlt
                        )}"
                        loading="lazy"
                        referrerpolicy="no-referrer">

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
                        class="btn btn-secondary"
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

            if (
                !url
            ) {

                window.alert(
                    "Download is not available because the published URL is missing or invalid."
                );

                return;

            }

            const anchor =
                document.createElement(
                    "a"
                );

            anchor.href =
                url;

            anchor.target =
                "_blank";

            anchor.rel =
                "noopener noreferrer";

            const fileName =
                normalizeString(
                    asset?.fileName
                );

            if (
                fileName
            ) {

                anchor.download =
                    fileName;

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

        shareOnLinkedIn(
            credential
        ) {

            if (
                !credential
            ) {

                window.alert(
                    "LinkedIn sharing is not available for this credential yet."
                );

                return;

            }

            const verificationUrl =
                this.resolveVerificationUrl(
                    credential
                );

            if (
                !verificationUrl
            ) {

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

            if (
                !asset
            ) {

                return "";

            }

            let servicePreviewUrl =
                "";

            let directPreviewUrl =
                "";

            let directDownloadUrl =
                "";

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

            directPreviewUrl =
                normalizeString(
                    asset.previewUrl ||
                    asset.preview_url
                );

            directDownloadUrl =
                normalizeString(
                    asset.downloadUrl ||
                    asset.download_url
                );

            const candidates = [
                servicePreviewUrl,
                directPreviewUrl,
                directDownloadUrl
            ];

            const resolvedUrl =
                candidates.find(
                    (
                        candidate
                    ) =>
                        this.isUsablePublishedUrl(
                            candidate
                        )
                ) ||
                "";

            if (
                !resolvedUrl
            ) {

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
            else if (
                directPreviewUrl &&
                !this.isUsablePublishedUrl(
                    directPreviewUrl
                ) &&
                resolvedUrl ===
                    directDownloadUrl
            ) {

                console.warn(
                    `[${MODULE_NAME}] Invalid preview URL rejected. Using download URL as fallback.`,
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

        resolvePublishedDownloadUrl(
            asset
        ) {

            if (
                !asset
            ) {

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
                    (
                        candidate
                    ) =>
                        this.isUsablePublishedUrl(
                            candidate
                        )
                ) ||
                "";

            if (
                !resolvedUrl
            ) {

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

            if (
                !normalizedValue
            ) {

                return false;

            }

            const lowercaseValue =
                normalizedValue.toLowerCase();

            /*
             * Reject known placeholder values and incomplete
             * documentation markers.
             */
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

            let parsedUrl =
                null;

            try {

                parsedUrl =
                    new URL(
                        normalizedValue,
                        window.location.origin
                    );

            }
            catch (
                error
            ) {

                return false;

            }

            /*
             * Asset URLs must be explicit HTTP or HTTPS URLs.
             * Relative URLs are rejected so placeholder text
             * cannot silently resolve against the portal host.
             */
            if (
                !/^https?:\/\//i.test(
                    normalizedValue
                )
            ) {

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

            if (
                !asset
            ) {

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

            /*
             * Asset-type fallback for historical records that
             * do not include MIME or file metadata.
             */

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

        resolveVerificationUrl(
            credential
        ) {

            if (
                !credential
            ) {

                return "";

            }

            const credentialId =
                normalizeString(
                    credential.credentialId ||
                    credential.credential_id ||
                    credential.id
                );

            const explicitUrl =
                normalizeString(
                    credential.verificationUrl ||
                    credential.verification_url ||
                    credential.verifyUrl ||
                    credential.verify_url ||
                    credential.registryUrl ||
                    credential.registry_url
                );

            if (
                explicitUrl &&
                this.isUsablePublishedUrl(
                    explicitUrl
                )
            ) {

                return explicitUrl;

            }

            if (
                credentialId
            ) {

                return (
                    "https://verify.agileai.university/?credentialId=" +
                    encodeURIComponent(
                        credentialId
                    )
                );

            }

            return (
                "https://verify.agileai.university"
            );

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

    console.info(
        `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
    );

})(window, document);