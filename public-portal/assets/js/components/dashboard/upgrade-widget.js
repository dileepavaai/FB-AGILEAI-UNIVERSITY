/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : upgrade-widget.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Sprint 2D

   Purpose
   ----------------------------------------------------------
   Dashboard Upgrade Widget

   Renders the Upgrade Opportunity section of the
   Student & Executive Dashboard.

   Responsibilities

   ✓ Render Upgrade Card
   ✓ Render Empty Upgrade State
   ✓ Delegate Upgrade Card Rendering
   ✓ Populate Dashboard Upgrade Section

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ API Calls
   ✗ Dashboard Orchestration
   ✗ HTML Generation Outside Widget Scope

   Governance

   • Dashboard Upgrade Widget Authority
   • Presentation Layer
   • Stateless Renderer
   • Single Responsibility
   • Enterprise Portal Standard

   Dependencies

   • DashboardWidgets DOM Helpers
   • UpgradeCard

   Notes

   DashboardWidgets owns all shared DOM helper
   methods including:

   • getElement()
   • setText()
   • setHtml()
   • clearElement()

   UpgradeCard is the authoritative renderer
   for the Upgrade Opportunity experience.

========================================================== */

(function (window) {

    "use strict";

    const UpgradeWidget = {

        /* ==================================================
           UPGRADE CARD
        ================================================== */

        render(
            upgrade,
            dashboard
        ) {

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

            /*
             * Upgrade Card Component
             * is the authoritative renderer.
             */

            if (

                !window.UpgradeCard ||

                typeof window.UpgradeCard.render !==
                    "function"

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

        }

    };

    Object.freeze(
        UpgradeWidget
    );

    window.UpgradeWidget =
        UpgradeWidget;

})(window);