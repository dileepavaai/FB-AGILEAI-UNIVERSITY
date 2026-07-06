/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-detail-overlay.js
   Version   : 2.0.0
   Status    : ACTIVE
   Phase     : Sprint 2E

   Purpose
   ----------------------------------------------------------
   Credential Detail Overlay

   Responsibilities

   ✓ Create Overlay
   ✓ Open Overlay
   ✓ Close Overlay
   ✓ Render Overlay Shell
   ✓ Manage Overlay Lifecycle

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ Credential Rendering
   ✗ Certificate Generation

   Governance

   • Credential Detail Overlay Authority
   • Presentation Layer
   • Single Responsibility
   • Enterprise Portal Standard

========================================================== */

(function (window, document) {

    "use strict";

    const CredentialDetailOverlay = {

        /* ==================================================
           STATE
        ================================================== */

        overlay: null,

        backdrop: null,

        container: null,

        body: null,

        footer: null,

        activeCredential: null,

        activeOptions: {},

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

            wrapper.innerHTML = this.render();

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
           RENDER
        ================================================== */

        render() {

            return `

                <div
                    class="overlay credential-detail-overlay">

                    <div
                        class="overlay-backdrop">
                    </div>

                    <div
                        class="overlay-container">

                        <div
                            class="overlay-header">

                            <h2
                                class="overlay-title">

                                Credential Details

                            </h2>

                            <button
                                type="button"
                                class="overlay-close"
                                aria-label="Close">

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

            this.backdrop

                .addEventListener(

                    "click",

                    this.close.bind(this)

                );

            document.addEventListener(

                "keydown",

                this.handleEscape.bind(this)

            );

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

            console.info(
                "[CredentialDetailOverlay] Opening:",
                credential.credential_id,
                this.activeOptions
            );

            if (!this.isOpen) {

                this.overlay.classList.add(
                    "is-open"
                );

                document.body.style.overflow =
                    "hidden";

                this.isOpen = true;

            }

            this.renderSections();

            this.focusRequestedSection();

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

            /*
             * Header
             */

            if (

                window.CredentialDetailHeader &&

                typeof window
                    .CredentialDetailHeader
                    .render === "function"

            ) {

                sections.push(

                    window
                        .CredentialDetailHeader
                        .render(

                            this.activeCredential

                        )

                );

            }

            /*
             * Credential Information
             */

            if (

                window.CredentialInformationSection &&

                typeof window
                    .CredentialInformationSection
                    .render === "function"

            ) {

                sections.push(

                    window
                        .CredentialInformationSection
                        .render(

                            this.activeCredential

                        )

                );

            }

            /*
             * Recognition
             */

            if (

                window.CredentialRecognitionSection &&

                typeof window
                    .CredentialRecognitionSection
                    .render === "function"

            ) {

                sections.push(

                    window
                        .CredentialRecognitionSection
                        .render(

                            this.activeCredential

                        )

                );

            }

            /*
             * Verification
             */

            if (

                window.CredentialVerificationSection &&

                typeof window
                    .CredentialVerificationSection
                    .render === "function"

            ) {

                sections.push(

                    window
                        .CredentialVerificationSection
                        .render(

                            this.activeCredential

                        )

                );

            }

            /*
             * Assets
             */

            if (

                window.CredentialAssetsSection &&

                typeof window
                    .CredentialAssetsSection
                    .render === "function"

            ) {

                sections.push(

                    window
                        .CredentialAssetsSection
                        .render(

                            this.activeCredential

                        )

                );

            }

            this.body.innerHTML =
                sections.join("");

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

            console.info(

                "[CredentialDetailOverlay] Closed"

            );

            this.overlay.classList.remove(

                "is-open"

            );

            document.body.style.overflow = "";

                this.activeCredential = null;
                this.activeOptions = {};

            if (this.body) {

                this.body.innerHTML = `

                    <div
                        class="credential-empty">

                        Select a credential
                        to view its details.

                    </div>

                `;

            }

            this.isOpen = false;

        },

        /* ==================================================
           ESCAPE
        ================================================== */

        handleEscape(
            event
        ) {

            if (
                event.key !== "Escape"
            ) {
                return;
            }

            this.close();

        },

    };

    window.CredentialDetailOverlay =
        CredentialDetailOverlay;

    })(
        window,
        document
);        