/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : upgrade-widget.js
   Version   : 1.3.0
   Status    : ACTIVE
   Phase     : Revenue Sprint

   Purpose
   ----------------------------------------------------------
   Dashboard Upgrade Widget

   Responsibilities

   ✓ Delegate upgrade rendering to UpgradeCard
   ✓ Hide empty or non-actionable upgrade sections
   ✓ Reveal successfully rendered upgrade recommendations
   ✓ Bind optional governed overlay actions
   ✓ Maintain accessible section visibility
   ✓ Fail closed

   Non Responsibilities

   ✗ Eligibility Resolution
   ✗ Commercial Business Rules
   ✗ Firestore
   ✗ Payments
   ✗ Upgrade ViewModel Construction
   ✗ HTML Generation

   Governance

   • Dashboard Upgrade Presentation Authority
   • Consumes Governed Upgrade ViewModel
   • Delegates Card Rendering
   • Presentation Layer
   • Fail Closed
   • Enterprise Portal Standard

   Dependencies

   • DashboardWidgets DOM Helpers
   • UpgradeCard
   • UpgradeRegistrationOverlay (optional)

   Change History
   ----------------------------------------------------------

   v1.3.0

   • Added governed dashboard section visibility
   • Added fail-closed rendering lifecycle
   • Hides section before every render attempt
   • Rejects empty or non-actionable card output
   • Added isolated card rendering error handling
   • Added accessible hidden-state management
   • Prevented duplicate overlay event binding
   • Preserved standard safe-link behavior

   v1.2.0

   • Added UpgradeCard rendering
   • Added optional upgrade registration overlay binding

========================================================== */

(function (window) {

    "use strict";

    const UpgradeWidget = {

        /* ==================================================
           RENDER
        ================================================== */

        render(upgrade, dashboard) {

            if (
                !dashboard ||
                typeof dashboard.getElement !== "function"
            ) {

                console.warn(
                    "[UpgradeWidget] Dashboard DOM helpers unavailable."
                );

                return false;

            }

            const section =
                dashboard.getElement(
                    "dashboardUpgradeSection"
                );

            const container =
                dashboard.getElement(
                    "dashboardUpgrade"
                );

            /*
             * Fail closed before attempting to render.
             */

            this.hideSection(
                section
            );

            if (!container) {

                console.warn(
                    "[UpgradeWidget] Upgrade container unavailable."
                );

                return false;

            }

            this.clearContainer(
                container,
                dashboard
            );

            if (
                !upgrade ||
                typeof upgrade !== "object"
            ) {

                return false;

            }

            if (
                !window.UpgradeCard ||
                typeof window.UpgradeCard.render !== "function"
            ) {

                console.warn(
                    "[UpgradeWidget] UpgradeCard unavailable."
                );

                return false;

            }

            let html = "";

            try {

                html =
                    window.UpgradeCard.render(
                        upgrade
                    );

            }
            catch (error) {

                console.error(
                    "[UpgradeWidget] Upgrade card rendering failed.",
                    error
                );

                return false;

            }

            if (
                typeof html !== "string" ||
                !html.trim()
            ) {

                return false;

            }

            try {

                dashboard.setHtml(
                    container,
                    html
                );

            }
            catch (error) {

                console.error(
                    "[UpgradeWidget] Upgrade content insertion failed.",
                    error
                );

                this.clearContainer(
                    container,
                    dashboard
                );

                return false;

            }

            /*
             * Confirm that the rendered component contains
             * a real actionable control before revealing it.
             *
             * Eligibility is not calculated here.
             */

            const action =
                container.querySelector(
                    "a[href], button"
                );

            if (!action) {

                this.clearContainer(
                    container,
                    dashboard
                );

                return false;

            }

            this.bindActions(
                container,
                upgrade
            );

            this.showSection(
                section
            );

            this.dispatchEvent(
                "aaiu:dashboard-upgrade-rendered",
                {
                    rendered: true
                }
            );

            return true;

        },


        /* ==================================================
           OPTIONAL OVERLAY ACTION

           Standard links remain functional unless the
           rendered card explicitly declares the governed
           overlay action class.
        ================================================== */

        bindActions(container, upgrade) {

            if (!container) {

                return;

            }

            const button =
                container.querySelector(
                    ".js-open-upgrade-registration"
                );

            if (!button) {

                return;

            }

            if (
                button.dataset &&
                button.dataset.upgradeActionBound === "true"
            ) {

                return;

            }

            if (
                !window.UpgradeRegistrationOverlay ||
                typeof window.UpgradeRegistrationOverlay.open !==
                    "function"
            ) {

                console.warn(
                    "[UpgradeWidget] Upgrade registration overlay unavailable."
                );

                /*
                 * Do not prevent the link's standard safe
                 * destination from operating.
                 */

                return;

            }

            if (button.dataset) {

                button.dataset.upgradeActionBound =
                    "true";

            }

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    try {

                        window
                            .UpgradeRegistrationOverlay
                            .open(
                                upgrade
                            );

                    }
                    catch (error) {

                        console.error(
                            "[UpgradeWidget] Upgrade registration overlay failed.",
                            error
                        );

                    }

                }
            );

        },


        /* ==================================================
           SECTION VISIBILITY
        ================================================== */

        showSection(section) {

            if (!section) {

                return;

            }

            section.hidden =
                false;

            section.setAttribute(
                "aria-hidden",
                "false"
            );

        },

        hideSection(section) {

            if (!section) {

                return;

            }

            section.hidden =
                true;

            section.setAttribute(
                "aria-hidden",
                "true"
            );

        },


        /* ==================================================
           CONTAINER CLEANUP
        ================================================== */

        clearContainer(
            container,
            dashboard
        ) {

            if (!container) {

                return;

            }

            if (
                dashboard &&
                typeof dashboard.clearElement === "function"
            ) {

                dashboard.clearElement(
                    container
                );

                return;

            }

            container.textContent =
                "";

        },


        /* ==================================================
           GOVERNANCE EVENT
        ================================================== */

        dispatchEvent(
            eventName,
            detail
        ) {

            if (
                typeof window.dispatchEvent !== "function" ||
                typeof window.CustomEvent !== "function"
            ) {

                return;

            }

            window.dispatchEvent(
                new window.CustomEvent(
                    eventName,
                    {
                        detail: detail || {}
                    }
                )
            );

        }

    };

    Object.freeze(
        UpgradeWidget
    );

    window.UpgradeWidget =
        UpgradeWidget;

})(window);