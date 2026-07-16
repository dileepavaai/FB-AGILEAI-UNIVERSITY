/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-detail-overlay.js
   Version   : 3.1.2
   Status    : ACTIVE
   Phase     : Sprint 2E.1

   Purpose
   ----------------------------------------------------------
   Credential Detail Workspace Overlay

   Responsibilities
   ----------------------------------------------------------
   ✓ Create Overlay
   ✓ Open Overlay
   ✓ Close Overlay
   ✓ Render Credential Details View
   ✓ Render Credential Asset Preview View
   ✓ Manage Workspace Navigation
   ✓ Manage Overlay Lifecycle
   ✓ Coordinate Credential Asset Actions
   ✓ Preserve Single-Overlay Workspace Architecture
   ✓ Provide Stable Delegated Event Handling
   ✓ Maintain Explicit Overlay Visibility State

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ Credential Generation
   ✗ Payment Processing

   Governance
   ----------------------------------------------------------
   • Credential Workspace Authority
   • Single Overlay Experience
   • No Nested Overlay
   • Presentation Orchestration Layer
   • Enterprise Portal Standard
   • CredentialAssetPreview owns preview actions
   • CredentialDetailOverlay owns shell and lifecycle
   • Native hidden state is authoritative
   • aria-hidden must remain synchronized
   • Async responses must never reopen a closed workspace

   Change History
   ----------------------------------------------------------
   v3.1.2

   • Added explicit native hidden-state lifecycle
   • Added aria-hidden synchronization
   • Prevented cleared overlay shell from remaining visible
   • Made close idempotent and deterministic
   • Made open explicitly restore visibility
   • Preserved delegated close handling
   • Preserved asset-preview request integrity
   • Preserved single-overlay workspace architecture

   v3.1.1

   • Added delegated overlay close handling
   • Stabilized close behaviour across workspace rerenders
   • Preserved backdrop close behaviour
   • Prevented dialog clicks from triggering close
   • Preserved Escape-key navigation
   • Preserved preview footer ownership
   • Removed dynamic Close-button rebinding requirement

   v3.1.0

   • Removed duplicated asset-preview footer actions
   • Delegated preview actions to CredentialAssetPreview
   • Hid the parent overlay footer during asset preview
   • Restored the Close footer when returning to details
   • Preserved the single-overlay architecture

   v3.0.0

   • Introduced governed Credential Detail Workspace
   • Added asset preview navigation
   • Added credential asset loading
   • Added download and LinkedIn orchestration
   • Added stale asynchronous response protection

========================================================== */

(function (
    window,
    document
) {

    "use strict";


    /* ======================================================
       MODULE
    ====================================================== */

    const MODULE_NAME =
        "CredentialDetailOverlay";

    const MODULE_VERSION =
        "3.1.2";


    /* ======================================================
       COMPONENT
    ====================================================== */

    const CredentialDetailOverlay = {


        /* ==================================================
           CONSTANTS
        ================================================== */

        views: Object.freeze({

            DETAILS:
                "details",

            ASSET_PREVIEW:
                "asset-preview"

        }),


        /* ==================================================
           STATE
        ================================================== */

        overlay:
            null,

        backdrop:
            null,

        container:
            null,

        title:
            null,

        body:
            null,

        footer:
            null,

        activeCredential:
            null,

        activeOptions:
            {},

        activeView:
            "details",

        activeAssetType:
            null,

        activeAsset:
            null,

        isOpen:
            false,

        initialized:
            false,

        escapeHandler:
            null,


        /* ==================================================
           INITIALIZATION
        ================================================== */

        initialize() {

            if (this.initialized) {

                return;

            }

            const created =
                this.createOverlay();

            if (!created) {

                console.error(
                    `[${MODULE_NAME}] Initialization failed because the overlay could not be created.`
                );

                return;

            }

            this.initialized =
                true;

            console.info(
                `[${MODULE_NAME}] Initialized v${MODULE_VERSION}`
            );

        },


        /* ==================================================
           CREATE OVERLAY
        ================================================== */

        createOverlay() {

            if (this.overlay) {

                return true;

            }

            /*
             * Defensive cleanup.
             *
             * A stale overlay from an earlier script load must
             * never coexist with the governed active overlay.
             */

            const existingOverlay =
                document.getElementById(
                    "credential-detail-overlay"
                );

            if (existingOverlay) {

                existingOverlay.remove();

            }

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.innerHTML =
                this.render().trim();

            this.overlay =
                wrapper.firstElementChild;

            if (!this.overlay) {

                console.error(
                    `[${MODULE_NAME}] Overlay creation failed.`
                );

                return false;

            }

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

            if (
                !this.backdrop ||
                !this.container ||
                !this.title ||
                !this.body ||
                !this.footer
            ) {

                console.error(
                    `[${MODULE_NAME}] Required overlay elements are unavailable.`
                );

                this.overlay =
                    null;

                this.backdrop =
                    null;

                this.container =
                    null;

                this.title =
                    null;

                this.body =
                    null;

                this.footer =
                    null;

                return false;

            }

            document.body.appendChild(
                this.overlay
            );

            this.bindEvents();

            return true;

        },


        /* ==================================================
           RENDER SHELL
        ================================================== */

        render() {

            return `

                <div
                    id="credential-detail-overlay"
                    class="overlay credential-detail-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="credential-detail-overlay-title"
                    aria-hidden="true"
                    hidden>

                    <div
                        class="overlay-backdrop"
                        aria-hidden="true">
                    </div>

                    <div
                        class="overlay-container"
                        role="document">

                        <div
                            class="overlay-header">

                            <h2
                                id="credential-detail-overlay-title"
                                class="overlay-title">

                                Credential Details

                            </h2>

                            <button
                                type="button"
                                class="overlay-close"
                                aria-label="Close credential workspace"
                                title="Close">

                                ×

                            </button>

                        </div>

                        <div
                            class="overlay-body">

                            <div
                                class="credential-empty">

                                Select a credential to
                                view its details.

                            </div>

                        </div>

                        <div
                            class="overlay-footer">

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

            if (
                !this.overlay ||
                !this.backdrop ||
                !this.body
            ) {

                console.warn(
                    `[${MODULE_NAME}] Required overlay elements are unavailable for event binding.`
                );

                return;

            }

            /*
             * Overlay-level delegated click handling.
             *
             * This remains stable when the footer or body is
             * recreated while switching views.
             */

            this.overlay.addEventListener(

                "click",

                event => {

                    const closeButton =
                        event.target.closest(
                            ".overlay-close, .overlay-close-button"
                        );

                    if (closeButton) {

                        event.preventDefault();

                        event.stopPropagation();

                        this.close();

                        return;

                    }

                    /*
                     * Backdrop closes only when the backdrop
                     * itself is the event target.
                     */

                    if (
                        event.target ===
                        this.backdrop
                    ) {

                        event.preventDefault();

                        event.stopPropagation();

                        this.close();

                    }

                }

            );

            /*
             * Body actions remain delegated because body HTML
             * is recreated between details and preview views.
             */

            this.body.addEventListener(

                "click",

                event => {

                    this.handleBodyClick(
                        event
                    );

                }

            );

            /*
             * Keep a stable handler reference.
             */

            this.escapeHandler =
                event => {

                    this.handleEscape(
                        event
                    );

                };

            document.addEventListener(
                "keydown",
                this.escapeHandler
            );

        },


        /* ==================================================
           BODY CLICK ROUTER
        ================================================== */

        handleBodyClick(
            event
        ) {

            if (!event) {

                return;

            }

            const assetButton =
                event.target.closest(
                    ".js-open-credential-asset-preview"
                );

            if (assetButton) {

                event.preventDefault();

                event.stopPropagation();

                const assetType =
                    assetButton.dataset
                        .credentialAssetType;

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

                event.stopPropagation();

                this.showDetails();

                return;

            }


            const downloadButton =
                event.target.closest(
                    ".js-download-credential-asset"
                );

            if (downloadButton) {

                event.preventDefault();

                event.stopPropagation();

                this.downloadActiveAsset(
                    downloadButton.dataset
                        .credentialAssetType
                );

                return;

            }


            const linkedInButton =
                event.target.closest(
                    ".js-share-credential-linkedin"
                );

            if (linkedInButton) {

                event.preventDefault();

                event.stopPropagation();

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

            if (
                !this.overlay ||
                !this.body
            ) {

                console.error(
                    `[${MODULE_NAME}] Overlay is unavailable.`
                );

                return;

            }

            if (!credential) {

                console.warn(
                    `[${MODULE_NAME}] Missing credential.`
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

            /*
             * Explicit visibility restoration.
             *
             * Native hidden state is authoritative. The
             * is-open class remains for generic overlay
             * animation and styling compatibility.
             */

            this.overlay.hidden =
                false;

            this.overlay.setAttribute(
                "aria-hidden",
                "false"
            );

            this.overlay.classList.add(
                "is-open"
            );

            document.body.style.overflow =
                "hidden";

            this.isOpen =
                true;

            this.renderDetailsView();

            this.focusRequestedSection();

        },


        /* ==================================================
           DETAILS VIEW
        ================================================== */

        showDetails() {

            if (
                !this.isOpen ||
                !this.activeCredential
            ) {

                return;

            }

            this.activeView =
                this.views.DETAILS;

            this.activeAssetType =
                null;

            this.activeAsset =
                null;

            this.renderDetailsView();

        },


        renderDetailsView() {

            if (
                !this.isOpen ||
                !this.activeCredential
            ) {

                return;

            }

            this.setTitle(
                "Credential Details"
            );

            this.renderSections();

            this.renderDefaultFooter();

            this.scrollToTop();

        },


        /* ==================================================
           ASSET PREVIEW VIEW
        ================================================== */

        async showAssetPreview(
            assetType
        ) {

            if (
                !this.isOpen ||
                !this.activeCredential
            ) {

                console.warn(
                    `[${MODULE_NAME}] No active credential is available for asset preview.`
                );

                return;

            }

            if (!assetType) {

                console.warn(
                    `[${MODULE_NAME}] Missing asset type.`
                );

                return;

            }

            if (
                !window.CredentialAssetService ||
                typeof window.CredentialAssetService
                    .getAssetByType !==
                    "function"
            ) {

                console.warn(
                    `[${MODULE_NAME}] CredentialAssetService is unavailable.`
                );

                return;

            }

            if (
                !window.CredentialAssetPreview ||
                typeof window.CredentialAssetPreview
                    .render !==
                    "function"
            ) {

                console.warn(
                    `[${MODULE_NAME}] CredentialAssetPreview renderer is unavailable.`
                );

                return;

            }

            const normalizedAssetType =
                this.normalizeAssetType(
                    assetType
                );

            const firestoreAssetType =
                this.resolveFirestoreAssetType(
                    normalizedAssetType
                );

            if (!firestoreAssetType) {

                console.warn(
                    `[${MODULE_NAME}] Unsupported asset type:`,
                    assetType
                );

                return;

            }

            const credentialId =
                String(
                    this.activeCredential
                        .credentialId ||
                    this.activeCredential
                        .credential_id ||
                    this.activeCredential
                        .id ||
                    ""
                ).trim();

            if (!credentialId) {

                console.warn(
                    `[${MODULE_NAME}] Credential ID is unavailable for asset preview.`
                );

                return;

            }

            /*
             * Capture the exact request context.
             */

            const requestedCredential =
                this.activeCredential;

            const requestedAssetType =
                normalizedAssetType;

            this.activeView =
                this.views.ASSET_PREVIEW;

            this.activeAssetType =
                normalizedAssetType;

            this.activeAsset =
                null;

            this.setTitle(
                this.resolveAssetTitle(
                    normalizedAssetType
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
                    await window
                        .CredentialAssetService
                        .getAssetByType(
                            credentialId,
                            firestoreAssetType
                        );

                /*
                 * Never render a delayed response after close,
                 * navigation, or credential replacement.
                 */

                if (
                    !this.isCurrentAssetRequest(
                        requestedCredential,
                        requestedAssetType
                    )
                ) {

                    return;

                }

                this.activeAsset =
                    asset || null;

                if (!this.activeAsset) {

                    console.warn(
                        `[${MODULE_NAME}] Published credential asset was not found.`,
                        {
                            credentialId,
                            assetType:
                                firestoreAssetType
                        }
                    );

                }

                this.body.innerHTML =
                    window.CredentialAssetPreview
                        .render(
                            this.activeCredential,
                            normalizedAssetType,
                            this.activeAsset
                        );

                this.renderAssetPreviewFooter();

                this.scrollToTop();

            } catch (error) {

                if (
                    !this.isCurrentAssetRequest(
                        requestedCredential,
                        requestedAssetType
                    )
                ) {

                    return;

                }

                this.activeAsset =
                    null;

                console.error(
                    `[${MODULE_NAME}] Published asset loading failed.`,
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

                            The published credential asset
                            could not be loaded. Please try
                            again.

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
           ASYNC REQUEST INTEGRITY
        ================================================== */

        isCurrentAssetRequest(
            requestedCredential,
            requestedAssetType
        ) {

            return (

                this.isOpen === true &&

                this.overlay !== null &&

                this.overlay.hidden === false &&

                this.activeView ===
                    this.views.ASSET_PREVIEW &&

                this.activeCredential ===
                    requestedCredential &&

                this.activeAssetType ===
                    requestedAssetType

            );

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

                    <div
                        class="credential-empty">

                        Select a credential
                        to view its details.

                    </div>

                `;

                return;

            }

            const sections =
                [];


            if (
                window.CredentialDetailHeader &&
                typeof window.CredentialDetailHeader
                    .render ===
                    "function"
            ) {

                sections.push(

                    window.CredentialDetailHeader
                        .render(
                            this.activeCredential
                        )

                );

            }


            if (
                window.CredentialInformationSection &&
                typeof window.CredentialInformationSection
                    .render ===
                    "function"
            ) {

                sections.push(

                    window.CredentialInformationSection
                        .render(
                            this.activeCredential
                        )

                );

            }


            if (
                window.CredentialRecognitionSection &&
                typeof window.CredentialRecognitionSection
                    .render ===
                    "function"
            ) {

                sections.push(

                    window.CredentialRecognitionSection
                        .render(
                            this.activeCredential
                        )

                );

            }


            if (
                window.CredentialVerificationSection &&
                typeof window.CredentialVerificationSection
                    .render ===
                    "function"
            ) {

                sections.push(

                    window.CredentialVerificationSection
                        .render(
                            this.activeCredential
                        )

                );

            }


            if (
                window.CredentialAssetsSection &&
                typeof window.CredentialAssetsSection
                    .render ===
                    "function"
            ) {

                sections.push(

                    window.CredentialAssetsSection
                        .render(
                            this.activeCredential
                        )

                );

            }


            this.body.innerHTML =
                sections.join(
                    ""
                );

        },


        /* ==================================================
           FOOTERS
        ================================================== */

        renderDefaultFooter() {

            if (!this.footer) {

                return;

            }

            /*
             * Credential Details owns only the standard
             * overlay Close action.
             *
             * Click handling is delegated to the overlay.
             */

            this.footer.hidden =
                false;

            this.footer.removeAttribute(
                "aria-hidden"
            );

            this.footer.innerHTML = `

                <button
                    type="button"
                    class="btn btn-secondary overlay-close-button">

                    Close

                </button>

            `;

        },


        renderAssetPreviewFooter() {

            if (!this.footer) {

                return;

            }

            /*
             * CredentialAssetPreview owns:
             *
             * • Back to Credential Details
             * • Download
             * • Share on LinkedIn
             *
             * The parent footer remains hidden in preview.
             */

            this.footer.innerHTML =
                "";

            this.footer.hidden =
                true;

            this.footer.setAttribute(
                "aria-hidden",
                "true"
            );

        },


        /* ==================================================
           ACTIONS
        ================================================== */

        downloadActiveAsset(
            assetType
        ) {

            if (
                !window.CredentialAssetPreview ||
                typeof window.CredentialAssetPreview
                    .download !==
                    "function"
            ) {

                console.warn(
                    `[${MODULE_NAME}] Download handler is unavailable.`
                );

                return;

            }

            if (!this.activeAsset) {

                console.warn(
                    `[${MODULE_NAME}] No published asset is available for download.`
                );

                return;

            }

            window.CredentialAssetPreview
                .download(
                    this.activeCredential,
                    assetType ||
                        this.activeAssetType,
                    this.activeAsset
                );

        },


        shareActiveCredentialOnLinkedIn() {

            if (
                !window.CredentialAssetPreview ||
                typeof window.CredentialAssetPreview
                    .shareOnLinkedIn !==
                    "function"
            ) {

                console.warn(
                    `[${MODULE_NAME}] LinkedIn share handler is unavailable.`
                );

                return;

            }

            if (!this.activeCredential) {

                return;

            }

            window.CredentialAssetPreview
                .shareOnLinkedIn(
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
                    `[data-credential-section="${this.escapeAttribute(
                        section
                    )}"]`
                );

            if (!target) {

                return;

            }

            this.body
                .querySelectorAll(
                    ".credential-section--focused"
                )
                .forEach(
                    focusedSection => {

                        focusedSection
                            .classList
                            .remove(
                                "credential-section--focused"
                            );

                    }
                );

            target.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

            target.classList.add(
                "credential-section--focused"
            );

        },


        /* ==================================================
           CLOSE
        ================================================== */

        close() {

            if (!this.overlay) {

                return;

            }

            /*
             * Mark closed before resetting any workspace data.
             *
             * This immediately invalidates in-flight asset
             * preview responses.
             */

            this.isOpen =
                false;

            /*
             * Hide the visual shell before changing content.
             */

            this.overlay.classList.remove(
                "is-open"
            );

            this.overlay.hidden =
                true;

            this.overlay.setAttribute(
                "aria-hidden",
                "true"
            );

            document.body.style.overflow =
                "";

            /*
             * Reset workspace state.
             */

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

                    <div
                        class="credential-empty">

                        Select a credential
                        to view its details.

                    </div>

                `;

                this.body.scrollTop =
                    0;

            }

            this.renderDefaultFooter();

        },


        /* ==================================================
           ESCAPE
        ================================================== */

        handleEscape(
            event
        ) {

            if (
                !event ||
                event.key !==
                    "Escape"
            ) {

                return;

            }

            if (!this.isOpen) {

                return;

            }

            event.preventDefault();

            if (
                this.activeView ===
                this.views.ASSET_PREVIEW
            ) {

                this.showDetails();

                return;

            }

            this.close();

        },


        /* ==================================================
           HELPERS
        ================================================== */

        setTitle(
            value
        ) {

            if (!this.title) {

                return;

            }

            this.title.textContent =
                value ||
                "Credential Details";

        },


        scrollToTop() {

            if (!this.body) {

                return;

            }

            this.body.scrollTop =
                0;

        },


        normalizeAssetType(
            assetType
        ) {

            return String(
                assetType ||
                ""
            )
                .trim()
                .toLowerCase();

        },


        resolveFirestoreAssetType(
            assetType
        ) {

            const assetTypes =
                Object.freeze({

                    "university-certificate":
                        "university_certificate",

                    "university_certificate":
                        "university_certificate",

                    "trainer-certificate":
                        "trainer_certificate",

                    "trainer_certificate":
                        "trainer_certificate",

                    "digital-badge":
                        "digital_badge",

                    "digital_badge":
                        "digital_badge",

                    "recognition-asset":
                        "recognition_asset",

                    "recognition_asset":
                        "recognition_asset"

                });

            return (
                assetTypes[
                    assetType
                ] ||
                ""
            );

        },


        resolveAssetTitle(
            assetType
        ) {

            const titles =
                Object.freeze({

                    "university-certificate":
                        "University Certificate",

                    "university_certificate":
                        "University Certificate",

                    "trainer-certificate":
                        "Trainer Certificate",

                    "trainer_certificate":
                        "Trainer Certificate",

                    "digital-badge":
                        "Digital Badge",

                    "digital_badge":
                        "Digital Badge",

                    "recognition-asset":
                        "Recognition Asset",

                    "recognition_asset":
                        "Recognition Asset"

                });

            return (
                titles[
                    assetType
                ] ||
                "Credential Asset"
            );

        },


        escape(
            value
        ) {

            return String(
                value ||
                ""
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

        }

    };


    /* ======================================================
       PUBLIC REGISTRATION
    ====================================================== */

    window.CredentialDetailOverlay =
        CredentialDetailOverlay;


    console.info(
        `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
    );

})(window, document);