/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-detail-overlay.js
   Version   : 3.0.0
   Status    : ACTIVE
   Phase     : Sprint 2E.1

   Purpose
   ----------------------------------------------------------
   Credential Detail Workspace Overlay

   Responsibilities

   ✓ Create Overlay
   ✓ Open Overlay
   ✓ Close Overlay
   ✓ Render Credential Details View
   ✓ Render Credential Asset Preview View
   ✓ Manage Workspace Navigation
   ✓ Manage Overlay Lifecycle

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ Credential Generation
   ✗ Payment Processing

   Governance

   • Credential Workspace Authority
   • Single Overlay Experience
   • No Nested Overlay
   • Presentation Orchestration Layer
   • Enterprise Portal Standard

========================================================== */

(function (window, document) {

    "use strict";

    const CredentialDetailOverlay = {

        /* ==================================================
           CONSTANTS
        ================================================== */

        views: {
            DETAILS: "details",
            ASSET_PREVIEW: "asset-preview"
        },

        /* ==================================================
           STATE
        ================================================== */

        overlay: null,

        backdrop: null,

        container: null,

        title: null,

        body: null,

        footer: null,

        activeCredential: null,

        activeOptions: {},

        activeView: "details",

        activeAssetType: null,

        activeAsset: null,

        isOpen: false,

        initialized: false,

        /* ==================================================
           INITIALIZATION
        ================================================== */

        initialize() {

            if (this.initialized) {
                return;
            }

            this.createOverlay();

            this.initialized = true;

        },

        /* ==================================================
           CREATE OVERLAY
        ================================================== */

        createOverlay() {

            if (this.overlay) {
                return;
            }

            const wrapper =
                document.createElement("div");

            wrapper.innerHTML =
                this.render();

            this.overlay =
                wrapper.firstElementChild;

            this.backdrop =
                this.overlay.querySelector(
                    ".overlay-backdrop"
                );

            this.container =
                this.overlay.querySelector(
                    ".overlay-container"
                );

            this.title =
                this.overlay.querySelector(
                    ".overlay-title"
                );

            this.body =
                this.overlay.querySelector(
                    ".overlay-body"
                );

            this.footer =
                this.overlay.querySelector(
                    ".overlay-footer"
                );

            document.body.appendChild(
                this.overlay
            );

            this.bindEvents();

        },

        /* ==================================================
           RENDER SHELL
        ================================================== */

        render() {

            return `

                <div class="overlay credential-detail-overlay">

                    <div class="overlay-backdrop">
                    </div>

                    <div class="overlay-container">

                        <div class="overlay-header">

                            <h2 class="overlay-title">

                                Credential Details

                            </h2>

                            <button
                                type="button"
                                class="overlay-close"
                                aria-label="Close">

                                ×

                            </button>

                        </div>

                        <div class="overlay-body">

                            <div class="credential-empty">

                                Select a credential to
                                view its details.

                            </div>

                        </div>

                        <div class="overlay-footer">

                            <button
                                type="button"
                                class="btn btn-secondary overlay-close-button">

                                Close

                            </button>

                        </div>

                    </div>

                </div>

            `;

        },

        /* ==================================================
           EVENT BINDING
        ================================================== */

        bindEvents() {

            if (!this.overlay) {
                return;
            }

            this.overlay
                .querySelector(".overlay-close")
                .addEventListener(
                    "click",
                    this.close.bind(this)
                );

            this.overlay
                .querySelector(".overlay-close-button")
                .addEventListener(
                    "click",
                    this.close.bind(this)
                );

            this.backdrop.addEventListener(
                "click",
                this.close.bind(this)
            );

            document.addEventListener(
                "keydown",
                this.handleEscape.bind(this)
            );

            this.body.addEventListener(
                "click",
                this.handleBodyClick.bind(this)
            );

        },

        /* ==================================================
           BODY CLICK ROUTER
        ================================================== */

        handleBodyClick(event) {

            const assetButton =
                event.target.closest(
                    ".js-open-credential-asset-preview"
                );

            if (assetButton) {

                event.preventDefault();

                const assetType =
                    assetButton.dataset.credentialAssetType;

                this.showAssetPreview(
                    assetType
                );

                return;

            }

            const backButton =
                event.target.closest(
                    ".js-back-to-credential-details"
                );

            if (backButton) {

                event.preventDefault();

                this.showDetails();

                return;

            }

            const downloadButton =
                event.target.closest(
                    ".js-download-credential-asset"
                );

            if (downloadButton) {

                event.preventDefault();

                this.downloadActiveAsset(
                    downloadButton.dataset.credentialAssetType
                );

                return;

            }

            const linkedInButton =
                event.target.closest(
                    ".js-share-credential-linkedin"
                );

            if (linkedInButton) {

                event.preventDefault();

                this.shareActiveCredentialOnLinkedIn();

            }

        },

        /* ==================================================
           OPEN
        ================================================== */

        open(
            credential,
            options = {}
        ) {

            this.initialize();

            if (!credential) {

                console.warn(
                    "[CredentialDetailOverlay] Missing credential."
                );

                return;

            }

            this.activeCredential =
                credential;

            this.activeOptions =
                options || {};

            this.activeView =
                this.views.DETAILS;

            this.activeAssetType =
                null;
            
            this.activeAsset =
                null;

            if (!this.isOpen) {

                this.overlay.classList.add(
                    "is-open"
                );

                document.body.style.overflow =
                    "hidden";

                this.isOpen = true;

            }

            this.renderDetailsView();

            this.focusRequestedSection();

        },

        /* ==================================================
           DETAILS VIEW
        ================================================== */

        showDetails() {

            this.activeView =
                this.views.DETAILS;

            this.activeAssetType =
                null;

            this.activeAsset =
                null;

            this.renderDetailsView();

        },

        renderDetailsView() {

            this.setTitle(
                "Credential Details"
            );

            this.renderSections();

            this.renderDefaultFooter();

        },

        /* ==================================================
           ASSET PREVIEW VIEW
        ================================================== */

        async showAssetPreview(assetType) {

            if (!this.activeCredential) {

                console.warn(
                    "[CredentialDetailOverlay] No active credential for asset preview."
                );

                return;

            }

            if (!assetType) {

                console.warn(
                    "[CredentialDetailOverlay] Missing asset type."
                );

                return;

            }

            if (
                !window.CredentialAssetService ||
                typeof window.CredentialAssetService.getAssetByType !==
                    "function"
            ) {

                console.warn(
                    "[CredentialDetailOverlay] CredentialAssetService is unavailable."
                );

                return;

            }

            if (
                !window.CredentialAssetPreview ||
                typeof window.CredentialAssetPreview.render !==
                    "function"
            ) {

                console.warn(
                    "[CredentialDetailOverlay] CredentialAssetPreview renderer is unavailable."
                );

                return;

            }

            const firestoreAssetType =
                this.resolveFirestoreAssetType(
                    assetType
                );

            if (!firestoreAssetType) {

                console.warn(
                    "[CredentialDetailOverlay] Unsupported asset type:",
                    assetType
                );

                return;

            }

            const credentialId =
                String(
                    this.activeCredential.credentialId ||
                    this.activeCredential.credential_id ||
                    this.activeCredential.id ||
                    ""
                ).trim();

            if (!credentialId) {

                console.warn(
                    "[CredentialDetailOverlay] Credential ID is unavailable for asset preview."
                );

                return;

            }

            /*
             * Capture the current request context.
             * This prevents a delayed response from rendering
             * after the learner closes the overlay, returns to
             * details, or opens another credential.
             */

            const requestedCredential =
                this.activeCredential;

            const requestedAssetType =
                assetType;

            this.activeView =
                this.views.ASSET_PREVIEW;

            this.activeAssetType =
                assetType;

            this.activeAsset =
                null;

            this.setTitle(
                this.resolveAssetTitle(
                    assetType
                )
            );

            this.body.innerHTML = `

                <div
                    class="credential-asset-preview-loading"
                    role="status"
                    aria-live="polite">

                    <p>

                        Loading published credential asset…

                    </p>

                </div>

            `;

            this.renderAssetPreviewFooter();

            this.scrollToTop();

            try {

                const asset =
                    await window.CredentialAssetService
                        .getAssetByType(
                            credentialId,
                            firestoreAssetType
                        );

                /*
                 * Ignore a stale asynchronous response.
                 */

                if (
                    !this.isOpen ||
                    this.activeView !==
                        this.views.ASSET_PREVIEW ||
                    this.activeCredential !==
                        requestedCredential ||
                    this.activeAssetType !==
                        requestedAssetType
                ) {

                    return;

                }

                this.activeAsset =
                    asset || null;

                if (!this.activeAsset) {

                    console.warn(
                        "[CredentialDetailOverlay] Published credential asset was not found:",
                        {
                            credentialId,
                            assetType:
                                firestoreAssetType
                        }
                    );

                }

                this.body.innerHTML =
                    window.CredentialAssetPreview.render(
                        this.activeCredential,
                        assetType,
                        this.activeAsset
                    );

                this.renderAssetPreviewFooter();

                this.scrollToTop();

            }
            catch (error) {

                if (
                    !this.isOpen ||
                    this.activeView !==
                        this.views.ASSET_PREVIEW ||
                    this.activeCredential !==
                        requestedCredential ||
                    this.activeAssetType !==
                        requestedAssetType
                ) {

                    return;

                }

                this.activeAsset =
                    null;

                console.error(
                    "[CredentialDetailOverlay] Published asset loading failed:",
                    {
                        credentialId,
                        assetType:
                            firestoreAssetType,
                        error
                    }
                );

                this.body.innerHTML = `

                    <div
                        class="credential-asset-preview-error"
                        role="alert">

                        <h3>

                            Asset unavailable

                        </h3>

                        <p>

                            The published credential asset could not be loaded.
                            Please try again.

                        </p>

                        <button
                            type="button"
                            class="btn btn-secondary js-back-to-credential-details">

                            ← Back to Credential Details

                        </button>

                    </div>

                `;

                this.renderAssetPreviewFooter();

                this.scrollToTop();

            }

        },

        /* ==================================================
           RENDER SECTIONS
        ================================================== */

        renderSections() {

            if (!this.body) {
                return;
            }

            if (!this.activeCredential) {

                this.body.innerHTML = `

                    <div class="credential-empty">

                        Select a credential
                        to view its details.

                    </div>

                `;

                return;

            }

            const sections = [];

            if (
                window.CredentialDetailHeader &&
                typeof window.CredentialDetailHeader.render === "function"
            ) {

                sections.push(
                    window.CredentialDetailHeader.render(
                        this.activeCredential
                    )
                );

            }

            if (
                window.CredentialInformationSection &&
                typeof window.CredentialInformationSection.render === "function"
            ) {

                sections.push(
                    window.CredentialInformationSection.render(
                        this.activeCredential
                    )
                );

            }

            if (
                window.CredentialRecognitionSection &&
                typeof window.CredentialRecognitionSection.render === "function"
            ) {

                sections.push(
                    window.CredentialRecognitionSection.render(
                        this.activeCredential
                    )
                );

            }

            if (
                window.CredentialVerificationSection &&
                typeof window.CredentialVerificationSection.render === "function"
            ) {

                sections.push(
                    window.CredentialVerificationSection.render(
                        this.activeCredential
                    )
                );

            }

            if (
                window.CredentialAssetsSection &&
                typeof window.CredentialAssetsSection.render === "function"
            ) {

                sections.push(
                    window.CredentialAssetsSection.render(
                        this.activeCredential
                    )
                );

            }

            this.body.innerHTML =
                sections.join("");

        },

        /* ==================================================
           FOOTERS
        ================================================== */

        renderDefaultFooter() {

            if (!this.footer) {
                return;
            }

            this.footer.innerHTML = `

                <button
                    type="button"
                    class="btn btn-secondary overlay-close-button">

                    Close

                </button>

            `;

            this.footer
                .querySelector(".overlay-close-button")
                .addEventListener(
                    "click",
                    this.close.bind(this)
                );

        },

        renderAssetPreviewFooter() {

            if (!this.footer) {
                return;
            }

            this.footer.innerHTML = `

                <button
                    type="button"
                    class="btn btn-secondary js-back-to-credential-details">

                    ← Back to Credential Details

                </button>

                <button
                    type="button"
                    class="btn btn-secondary js-download-credential-asset"
                    data-credential-asset-type="${this.escape(this.activeAssetType)}">

                    Download

                </button>

                <button
                    type="button"
                    class="btn js-share-credential-linkedin"
                    data-credential-asset-type="${this.escape(this.activeAssetType)}">

                    Share on LinkedIn

                </button>

            `;

            this.footer
                .querySelector(".js-back-to-credential-details")
                .addEventListener(
                    "click",
                    this.showDetails.bind(this)
                );

            this.footer
                .querySelector(".js-download-credential-asset")
                .addEventListener(
                    "click",
                    () => this.downloadActiveAsset(
                        this.activeAssetType
                    )
                );

            this.footer
                .querySelector(".js-share-credential-linkedin")
                .addEventListener(
                    "click",
                    this.shareActiveCredentialOnLinkedIn.bind(this)
                );

        },

        /* ==================================================
           ACTIONS
        ================================================== */

        downloadActiveAsset(assetType) {

            if (
                !window.CredentialAssetPreview ||
                typeof window.CredentialAssetPreview.download !==
                    "function"
            ) {

                console.warn(
                    "[CredentialDetailOverlay] Download handler unavailable."
                );

                return;

            }

            if (!this.activeAsset) {

                console.warn(
                    "[CredentialDetailOverlay] No published asset is available for download."
                );

                return;

            }

            window.CredentialAssetPreview.download(
                this.activeCredential,
                assetType || this.activeAssetType,
                this.activeAsset
            );

        },

        shareActiveCredentialOnLinkedIn() {

            if (
                !window.CredentialAssetPreview ||
                typeof window.CredentialAssetPreview.shareOnLinkedIn !== "function"
            ) {

                console.warn(
                    "[CredentialDetailOverlay] LinkedIn share handler unavailable."
                );

                return;

            }

            window.CredentialAssetPreview.shareOnLinkedIn(
                this.activeCredential
            );

        },

        /* ==================================================
           FOCUS REQUESTED SECTION
        ================================================== */

        focusRequestedSection() {

            if (
                !this.body ||
                !this.activeOptions
            ) {
                return;
            }

            const section =
                this.activeOptions.section;

            if (!section) {
                return;
            }

            const target =
                this.body.querySelector(
                    `[data-credential-section="${section}"]`
                );

            if (!target) {
                return;
            }

            this.body
                .querySelectorAll(
                    ".credential-section--focused"
                )
                .forEach(function (focusedSection) {

                    focusedSection.classList.remove(
                        "credential-section--focused"
                    );

                });

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            target.classList.add(
                "credential-section--focused"
            );

        },

        /* ==================================================
           CLOSE
        ================================================== */

        close() {

            if (
                !this.overlay ||
                !this.isOpen
            ) {
                return;
            }

            this.overlay.classList.remove(
                "is-open"
            );

            document.body.style.overflow =
                "";

            this.activeCredential =
                null;

            this.activeOptions =
                {};

            this.activeView =
                this.views.DETAILS;

            this.activeAssetType =
                null;

            this.activeAsset =
                null;

            this.setTitle(
                "Credential Details"
            );

            if (this.body) {

                this.body.innerHTML = `

                    <div class="credential-empty">

                        Select a credential
                        to view its details.

                    </div>

                `;

            }

            this.renderDefaultFooter();

            this.isOpen =
                false;

        },

        /* ==================================================
           ESCAPE
        ================================================== */

        handleEscape(event) {

            if (event.key !== "Escape") {
                return;
            }

            if (
                this.isOpen &&
                this.activeView === this.views.ASSET_PREVIEW
            ) {

                this.showDetails();

                return;

            }

            this.close();

        },

        /* ==================================================
           HELPERS
        ================================================== */

        setTitle(value) {

            if (!this.title) {
                return;
            }

            this.title.textContent =
                value || "Credential Details";

        },

        scrollToTop() {

            if (!this.body) {
                return;
            }

            this.body.scrollTop =
                0;

        },

        resolveFirestoreAssetType(assetType) {

            const assetTypes = {

                "university-certificate":
                    "university_certificate",

                "trainer-certificate":
                    "trainer_certificate",

                "digital-badge":
                    "digital_badge",

                "recognition-asset":
                    "recognition_asset"

            };

            return assetTypes[assetType] || "";

        },

        resolveAssetTitle(assetType) {

            const titles = {
                "university-certificate": "University Certificate",
                "trainer-certificate": "Trainer Certificate",
                "digital-badge": "Digital Badge",
                "recognition-asset": "Recognition Asset"
            };

            return titles[assetType] ||
                "Credential Asset";

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

    window.CredentialDetailOverlay =
        CredentialDetailOverlay;

})(window, document);