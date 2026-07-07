/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : upgrade-registration-overlay.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Revenue Sprint

   Purpose
   ----------------------------------------------------------
   Upgrade Registration Overlay

   Responsibilities

   ✓ Create Upgrade Registration Overlay
   ✓ Open Registration Experience
   ✓ Close Registration Experience
   ✓ Render Upgrade Offer Summary
   ✓ Render Learner Confirmation
   ✓ Prepare Payment Action
   ✓ Preserve No-Navigation Learner Experience

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore Writes
   ✗ Payment Gateway Processing
   ✗ Entitlement Resolution
   ✗ Dashboard Rendering

   Governance

   • Revenue Experience Component
   • Single Overlay Experience
   • No Learner Navigation
   • Payment Gateway Ready
   • Enterprise Portal Standard

========================================================== */

(function (window, document) {

    "use strict";

    const UpgradeRegistrationOverlay = {

        overlay: null,

        backdrop: null,

        container: null,

        title: null,

        body: null,

        footer: null,

        activeUpgrade: null,

        isOpen: false,

        initialized: false,

        initialize() {

            if (this.initialized) {
                return;
            }

            this.createOverlay();

            this.initialized = true;

        },

        createOverlay() {

            if (this.overlay) {
                return;
            }

            const wrapper =
                document.createElement("div");

            wrapper.innerHTML =
                this.renderShell();

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

        renderShell() {

            return `

                <div class="overlay upgrade-registration-overlay">

                    <div class="overlay-backdrop">
                    </div>

                    <div class="overlay-container upgrade-registration-container">

                        <div class="overlay-header">

                            <h2 class="overlay-title">

                                Upgrade Registration

                            </h2>

                            <button
                                type="button"
                                class="overlay-close"
                                aria-label="Close">

                                ×

                            </button>

                        </div>

                        <div class="overlay-body">

                            <div class="upgrade-registration-empty">

                                Select an upgrade offer to continue.

                            </div>

                        </div>

                        <div class="overlay-footer">

                            <button
                                type="button"
                                class="btn btn-secondary js-close-upgrade-registration">

                                Close

                            </button>

                        </div>

                    </div>

                </div>

            `;

        },

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

            this.backdrop.addEventListener(
                "click",
                this.close.bind(this)
            );

            this.overlay.addEventListener(
                "click",
                this.handleClick.bind(this)
            );

            document.addEventListener(
                "keydown",
                this.handleEscape.bind(this)
            );

        },

        open(upgrade) {

            this.initialize();

            this.activeUpgrade =
                this.normalizeUpgrade(
                    upgrade
                );

            if (!this.activeUpgrade) {

                console.warn(
                    "[UpgradeRegistrationOverlay] Missing upgrade model."
                );

                return;

            }

            this.setTitle(
                "Upgrade Registration"
            );

            this.renderBody();

            this.renderFooter();

            this.overlay.classList.add(
                "is-open"
            );

            document.body.style.overflow =
                "hidden";

            this.isOpen =
                true;

        },

        renderBody() {

            if (!this.body || !this.activeUpgrade) {
                return;
            }

            const upgrade =
                this.activeUpgrade;

            this.body.innerHTML = `

                <section class="upgrade-registration-workspace">

                    <header class="upgrade-registration-hero">

                        <p class="upgrade-registration-label">

                            Recommended Upgrade

                        </p>

                        <h3>

                            ${this.escape(upgrade.title)}

                        </h3>

                        <p>

                            ${this.escape(upgrade.description)}

                        </p>

                    </header>

                    <div class="upgrade-registration-summary">

                        <div class="upgrade-registration-row">

                            <span>Current Programme</span>

                            <strong>
                                ${this.escape(upgrade.currentProgram)}
                            </strong>

                        </div>

                        <div class="upgrade-registration-row">

                            <span>Next Programme</span>

                            <strong>
                                ${this.escape(upgrade.nextProgram)}
                            </strong>

                        </div>

                        <div class="upgrade-registration-row">

                            <span>Offer Fee</span>

                            <strong>
                                ${this.formatMoney(upgrade.baseFee)}
                            </strong>

                        </div>

                        <div class="upgrade-registration-row">

                            <span>GST</span>

                            <strong>
                                ${upgrade.gstApplicable ? "18% applicable" : "Not applicable"}
                            </strong>

                        </div>

                        <div class="upgrade-registration-row upgrade-registration-total">

                            <span>Total Payable</span>

                            <strong>
                                ${this.formatMoney(upgrade.totalPayable)}
                            </strong>

                        </div>

                    </div>

                    <div class="upgrade-registration-note">

                        <strong>Important:</strong>
                        Registration will be completed after successful payment confirmation.

                    </div>

                </section>

            `;

        },

        renderFooter() {

            if (!this.footer) {
                return;
            }

            this.footer.innerHTML = `

                <button
                    type="button"
                    class="btn btn-secondary js-close-upgrade-registration">

                    Close

                </button>

                <button
                    type="button"
                    class="btn js-start-upgrade-payment">

                    Continue to Payment

                </button>

            `;

        },

        handleClick(event) {

            const closeButton =
                event.target.closest(
                    ".js-close-upgrade-registration"
                );

            if (closeButton) {

                event.preventDefault();

                this.close();

                return;

            }

            const paymentButton =
                event.target.closest(
                    ".js-start-upgrade-payment"
                );

            if (paymentButton) {

                event.preventDefault();

                this.startPayment();

            }

        },

        startPayment() {

            if (!this.activeUpgrade) {

                console.warn(
                    "[UpgradeRegistrationOverlay] No active upgrade selected."
                );

                return;

            }

            if (
                window.UpgradePaymentService &&
                typeof window.UpgradePaymentService.start === "function"
            ) {

                window.UpgradePaymentService.start(
                    this.activeUpgrade
                );

                return;

            }

            alert(
                "Payment integration is not connected yet. This registration flow is ready for payment gateway integration."
            );

            console.info(
                "[UpgradeRegistrationOverlay] Payment payload:",
                this.activeUpgrade
            );

        },

        close() {

            if (!this.overlay || !this.isOpen) {
                return;
            }

            this.overlay.classList.remove(
                "is-open"
            );

            document.body.style.overflow =
                "";

            this.activeUpgrade =
                null;

            this.isOpen =
                false;

        },

        handleEscape(event) {

            if (event.key !== "Escape") {
                return;
            }

            if (!this.isOpen) {
                return;
            }

            this.close();

        },

        normalizeUpgrade(upgrade) {

            if (!upgrade) {
                return null;
            }

            const baseFee =
                Number(
                    upgrade.baseFee ||
                    upgrade.offerFee ||
                    upgrade.fee ||
                    0
                );

            const gstApplicable =
                upgrade.gstApplicable !== false;

            const gstAmount =
                gstApplicable
                    ? Math.round(baseFee * 0.18)
                    : 0;

            const totalPayable =
                Number(
                    upgrade.totalPayable ||
                    upgrade.total ||
                    baseFee + gstAmount
                );

            return {
                eligible: upgrade.eligible !== false,
                programCode: upgrade.programCode || "",
                programName: upgrade.programName || "",
                currentProgram: upgrade.currentProgram || "Current Programme",
                nextProgram: upgrade.nextProgram || upgrade.programName || "Recommended Programme",
                title: upgrade.title || "Recommended Programme Upgrade",
                description: upgrade.description || "You are eligible for this upgrade based on your current credential profile.",
                buttonText: upgrade.buttonText || "Continue to Payment",
                currency: upgrade.currency || "INR",
                baseFee,
                gstApplicable,
                gstAmount,
                totalPayable,
                offerEndsOn: upgrade.offerEndsOn || "",
                url: upgrade.url || "/upgrade/upgrade.html",
                source: upgrade
            };

        },

        setTitle(value) {

            if (!this.title) {
                return;
            }

            this.title.textContent =
                value || "Upgrade Registration";

        },

        formatMoney(value) {

            const amount =
                Number(value || 0);

            return "₹" +
                amount.toLocaleString(
                    "en-IN"
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

    window.UpgradeRegistrationOverlay =
        UpgradeRegistrationOverlay;

})(window, document);