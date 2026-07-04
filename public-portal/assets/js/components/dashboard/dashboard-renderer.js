/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : dashboard-renderer.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2C

   Purpose
   ----------------------------------------------------------
   Dashboard Rendering Layer

   Responsibilities

   ✓ Render complete dashboard
   ✓ Delegate rendering to widget layer
   ✓ UI orchestration only

   Non Responsibilities

   ✗ Business Logic
   ✗ Firestore
   ✗ Authentication
   ✗ Authorization
   ✗ Eligibility
   ✗ HTML Generation

   Governance

   • Presentation Layer
   • Renderer Pattern
   • Stateless
   • Enterprise Portal Standard

========================================================== */

(function (window) {

    "use strict";

    const DashboardRenderer = {

        /* ==================================================
           RENDER
        ================================================== */

        render(dashboard = {}) {

            console.info(
                "[DashboardRenderer] Rendering dashboard",
                dashboard
            );

            this.renderWidgets(dashboard);

        },

        /* ==================================================
           WIDGETS
        ================================================== */

        renderWidgets(dashboard) {

            if (
                !window.DashboardWidgets ||
                typeof window.DashboardWidgets.render !== "function"
            ) {

                console.warn(
                    "[DashboardRenderer] DashboardWidgets unavailable."
                );

                return;

            }

            window.DashboardWidgets.render(
                dashboard
            );

        }

    };

    Object.freeze(DashboardRenderer);

    window.DashboardRenderer = DashboardRenderer;

})(window);