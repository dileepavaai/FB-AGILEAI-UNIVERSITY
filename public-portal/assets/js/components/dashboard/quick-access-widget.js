/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : quick-access-widget.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2D

   Purpose
   ----------------------------------------------------------
   Dashboard Quick Access Widget

   Renders the Quick Access section of the
   Student & Executive Dashboard.

   Responsibilities

   ✓ Render Quick Access Cards
   ✓ Render Empty Quick Access State
   ✓ Delegate Card Rendering
   ✓ Populate Dashboard Quick Access Section

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ API Calls
   ✗ Dashboard Orchestration
   ✗ HTML Generation Outside Widget Scope

   Governance

   • Dashboard Quick Access Widget Authority
   • Presentation Layer
   • Stateless Renderer
   • Single Responsibility
   • Enterprise Portal Standard

   Dependencies

   • DashboardWidgets DOM Helpers
   • QuickAccessCard

   Notes

   DashboardWidgets owns all shared DOM helper
   methods including:

   • getElement()
   • setText()
   • setHtml()
   • clearElement()

   QuickAccessCard is the authoritative renderer
   for individual Quick Access cards.

========================================================== */

(function (window) {

    "use strict";

    const QuickAccessWidget = {

        /* ==================================================
           QUICK ACCESS
        ================================================== */

        render(
            items,
            dashboard
        ) {

            if (
                !dashboard ||
                !Array.isArray(items)
            ) {
                return;
            }

            const container =
                dashboard.getElement(
                    "dashboardQuickAccess"
                );

            if (!container) {
                return;
            }

            /*
             * Quick Access Card Component
             * is the authoritative renderer.
             */

            if (

                !window.QuickAccessCard ||

                typeof window.QuickAccessCard.render !==
                    "function"

            ) {

                return;

            }

            if (items.length === 0) {

                dashboard.clearElement(
                    container
                );

                return;

            }

            const html = items

                .map(function (item) {

                    try {

                        return window
                            .QuickAccessCard
                            .render(
                                item
                            );

                    }
                    catch (error) {

                        console.error(

                            "[QuickAccessCard] Render failed.",

                            item,

                            error

                        );

                        return "";

                    }

                })

                .join("");

            dashboard.setHtml(

                container,

                html

            );

        }

    };

    Object.freeze(
        QuickAccessWidget
    );

    window.QuickAccessWidget =
        QuickAccessWidget;

})(window);