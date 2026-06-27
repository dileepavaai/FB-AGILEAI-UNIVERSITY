/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : widgets.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2B

   Purpose
   ----------------------------------------------------------
   Dashboard Widget Renderer

   Responsibilities

   ✓ Render dashboard widgets
   ✓ Render KPI summary
   ✓ Render Quick Access
   ✓ Render dashboard placeholders
   ✓ Update dashboard UI

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Business Logic
   ✗ Firestore
   ✗ API Calls

   Governance

   • Dashboard Rendering Authority
   • UI Layer
   • Single Responsibility
   • Enterprise Portal Standard

========================================================== */

(function (window, document) {

    "use strict";

    const DashboardWidgets = {

        /* ==================================================
           ROOT RENDER
        ================================================== */

        render(data) {

            this.renderSummary(data.summary);

            this.renderKpiCards(data.kpi);

            this.renderQuickAccess(data.quickAccess);

            this.renderRecentCredentials(
                data.recentCredentials
            );

            this.renderRecentRecognitions(
                data.recentRecognitions
            );

            this.renderNotifications(
                data.notifications
            );

        },

        /* ==================================================
           SUMMARY
        ================================================== */

        renderSummary(summary) {

            if (!summary) {
                return;
            }

            const userName =
                document.getElementById("sidebarUserName");

            const membership =
                document.getElementById("sidebarMembership");

            const portfolio =
                document.getElementById("sidebarCredentialCount");

            if (userName) {
                userName.textContent =
                    summary.user.name;
            }

            if (membership) {
                membership.textContent =
                    summary.user.membership;
            }

            if (portfolio) {
                portfolio.textContent =
                    summary.portfolio.credentials;
            }

        },

        /* ==================================================
           KPI
        ================================================== */

        renderKpiCards(kpi) {

            if (!kpi) {
                return;
            }

            // Sprint 2B
            // KPI widget rendering placeholder

        },

        /* ==================================================
           QUICK ACCESS
        ================================================== */

        renderQuickAccess(items) {

            if (!Array.isArray(items)) {
                return;
            }

            // Existing HTML remains.
            // Future versions may build this dynamically.

        },

        /* ==================================================
           RECENT CREDENTIALS
        ================================================== */

        renderRecentCredentials(credentials) {

            if (!Array.isArray(credentials)) {
                return;
            }

            // Sprint 2C

        },

        /* ==================================================
           RECOGNITIONS
        ================================================== */

        renderRecentRecognitions(recognitions) {

            if (!Array.isArray(recognitions)) {
                return;
            }

            // Sprint 2C

        },

        /* ==================================================
           NOTIFICATIONS
        ================================================== */

        renderNotifications(notifications) {

            if (!Array.isArray(notifications)) {
                return;
            }

            // Future Sprint

        }

    };

    Object.freeze(DashboardWidgets);

    window.DashboardWidgets =
        DashboardWidgets;

})(window, document);