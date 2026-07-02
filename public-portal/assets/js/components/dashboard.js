/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : dashboard.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Sprint 2C

   Purpose
   ----------------------------------------------------------
   Dashboard Controller

   Changes
   ----------------------------------------------------------

   • Uses dashboard aggregation service
   • Simplified controller orchestration
   • Prepared for live KPI rendering
   • Added centralized initialization error handler

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
       STATE
    ====================================================== */

    let initialized = false;

    let initializing = false;

    /* ======================================================
       INITIALIZATION
    ====================================================== */

    async function initializeDashboard() {

        if (initialized || initializing) {
            return;
        }

        initializing = true;

        showLoading();

        try {

            if (
                !window.DashboardService ||
                typeof window.DashboardService.loadDashboard !== "function"
            ) {
                throw new Error(
                    "DashboardService is unavailable."
                );
            }

            const dashboard =
                await window.DashboardService.loadDashboard();

            renderDashboard(dashboard);

            initialized = true;

        }
        catch (error) {

            initialized = false;

            showInitializationError(error);

        }
        finally {

            initializing = false;

            hideLoading();

        }

    }

    /* ======================================================
       RENDER DASHBOARD
    ====================================================== */

    function renderDashboard(dashboard) {

        if (
            !window.DashboardWidgets ||
            typeof window.DashboardWidgets.render !== "function"
        ) {
            return;
        }

        window.DashboardWidgets.render(dashboard);

    }

    /* ======================================================
       INITIALIZATION ERROR
    ====================================================== */

    function showInitializationError(error) {

        console.error(
            "Dashboard initialization failed.",
            error
        );

        /*
         * Reserved for future enhancements:
         *
         * • Toast notification
         * • Dashboard error card
         * • Retry mechanism
         * • Telemetry / logging
         */

    }

    /* ======================================================
       STARTUP
    ====================================================== */

    document.addEventListener(

    "entitlements:ready",

    initializeDashboard

    );

})(window, document);