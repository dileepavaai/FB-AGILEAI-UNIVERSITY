/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : dashboard.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2B

   Purpose
   ----------------------------------------------------------
   Dashboard Controller

   Responsibilities

   ✓ Initialize dashboard
   ✓ Coordinate dashboard services
   ✓ Coordinate widget rendering
   ✓ Populate dashboard sections

   Non Responsibilities

   ✗ Business Logic
   ✗ Firestore
   ✗ Authentication
   ✗ Authorization
   ✗ HTML Generation
   ✗ Styling

   Governance

   • Dashboard Controller
   • UI Orchestration Layer
   • Single Responsibility
   • Enterprise Portal Standard

========================================================== */

(function (window, document) {

    "use strict";

    /* ======================================================
       INITIALIZATION
    ====================================================== */

    async function initializeDashboard() {

        try {

            const summary =
                await DashboardService.loadDashboardSummary();

            const kpi =
                await DashboardService.loadKpiData();

            const quickAccess =
                await DashboardService.loadQuickAccess();

            const recentCredentials =
                await DashboardService.loadRecentCredentials();

            const recentRecognitions =
                await DashboardService.loadRecentRecognitions();

            const notifications =
                await DashboardService.loadNotifications();

            renderDashboard({

                summary,

                kpi,

                quickAccess,

                recentCredentials,

                recentRecognitions,

                notifications

            });

        }
        catch (error) {

            console.error(

                "Dashboard initialization failed.",

                error

            );

        }

    }

    /* ======================================================
       RENDER DASHBOARD
    ====================================================== */

    function renderDashboard(data) {

        if (
            window.DashboardWidgets &&
            typeof window.DashboardWidgets.render === "function"
        ) {

            window.DashboardWidgets.render(data);

        }

    }

    /* ======================================================
       STARTUP
    ====================================================== */

    document.addEventListener(

        "DOMContentLoaded",

        initializeDashboard

    );

})(window, document);