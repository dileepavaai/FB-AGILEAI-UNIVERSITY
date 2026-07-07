/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : upgrade-widget.js
   Version   : 1.2.0
   Status    : ACTIVE
   Phase     : Revenue Sprint

========================================================== */

(function (window) {

    "use strict";

    const UpgradeWidget = {

        render(upgrade, dashboard) {

            if (!dashboard) {
                return;
            }

            const container =
                dashboard.getElement(
                    "dashboardUpgrade"
                );

            if (!container) {
                return;
            }

            if (!upgrade) {

                dashboard.clearElement(
                    container
                );

                return;

            }

            if (
                !window.UpgradeCard ||
                typeof window.UpgradeCard.render !== "function"
            ) {

                console.warn(
                    "[UpgradeWidget] UpgradeCard unavailable."
                );

                return;

            }

            dashboard.setHtml(
                container,
                window.UpgradeCard.render(
                    upgrade
                )
            );

            this.bindActions(
                container,
                upgrade
            );

        },

        bindActions(container, upgrade) {

            const button =
                container.querySelector(
                    ".js-open-upgrade-registration"
                );

            if (!button) {
                return;
            }

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    if (
                        window.UpgradeRegistrationOverlay &&
                        typeof window.UpgradeRegistrationOverlay.open === "function"
                    ) {

                        window.UpgradeRegistrationOverlay.open(
                            upgrade
                        );

                        return;

                    }

                    console.warn(
                        "[UpgradeWidget] UpgradeRegistrationOverlay unavailable."
                    );

                }
            );

        }

    };

    Object.freeze(
        UpgradeWidget
    );

    window.UpgradeWidget =
        UpgradeWidget;

})(window);