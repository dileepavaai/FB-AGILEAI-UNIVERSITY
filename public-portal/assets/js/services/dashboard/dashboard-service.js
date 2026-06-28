/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : dashboard-service.js
   Version   : 1.3.0
   Status    : ACTIVE
   Phase     : Sprint 2D

   Purpose
   ----------------------------------------------------------
   Dashboard Data Service

   Changes
   ----------------------------------------------------------

   • Adopted Shared Portal State architecture
   • Consumes governed portal credential state
   • Eliminated hardcoded dashboard credentials
   • Prepared dashboard for live portal data
   • Zero additional API requests
   • Zero additional Firestore reads

   Responsibilities

   ✓ Dashboard summary
   ✓ KPI aggregation
   ✓ Widget data
   ✓ Dashboard View Model
   ✓ Dashboard data abstraction

   Non Responsibilities

   ✗ UI Rendering
   ✗ DOM Manipulation
   ✗ Authentication
   ✗ Authorization
   ✗ Event Handling
   ✗ Firestore Queries
   ✗ Cloud Run API Calls

   Governance

   • Single Responsibility
   • Dashboard Data Authority
   • Shared Portal State Consumer
   • Enterprise Portal Standard

========================================================== */

(function (window) {

    "use strict";

    const DashboardService = {

        /* ==================================================
           DASHBOARD
        ================================================== */

        async loadDashboard() {

            const summary =
                await this.loadDashboardSummary();

            return {

                summary,

                kpi:
                    await this.loadKpiData(summary),

                quickAccess:
                    await this.loadQuickAccess(),

                recentCredentials:
                    await this.loadRecentCredentials(),

                recentRecognitions:
                    await this.loadRecentRecognitions(),

                notifications:
                    await this.loadNotifications()

            };

        },

        /* ==================================================
           DASHBOARD SUMMARY
        ================================================== */

        async loadDashboardSummary() {

            return this.createSummaryModel();

        },

        createSummaryModel() {

            const credentials =
                window.portalCredentials || [];

            const finalizedCredentials =
                credentials.filter(function (credential) {

                    return (
                        credential.issued_status === "finalized"
                    );

                });

            return {

                user: {

                    name:
                        window.authState?.user?.displayName ||
                        "Student",

                    membership:
                        "University Member"

                },

                portfolio: {

                    credentials:
                        finalizedCredentials.length,

                    /*
                    * Agile AI University issues
                    * one certificate and one badge
                    * for every finalized credential.
                    *
                    * These values will later be
                    * driven by explicit asset metadata
                    * once the Certificate Registry
                    * and Badge Registry are introduced.
                    */

                    certificates:
                        finalizedCredentials.length,

                    badges:
                        finalizedCredentials.length,

                    recognitions: 0

                }

            };

        },

        /* ==================================================
           KPI DATA
        ================================================== */

        async loadKpiData(summary) {

            return this.createKpiModel(summary);

        },

        createKpiModel(summary) {

            const portfolio =
                summary?.portfolio || {};

            return {

                credentials:
                    portfolio.credentials || 0,

                certificates:
                    portfolio.certificates || 0,

                badges:
                    portfolio.badges || 0,

                recognitions:
                    portfolio.recognitions || 0

            };

        },

        /* ==================================================
           QUICK ACCESS
        ================================================== */

        async loadQuickAccess() {

            return [

                {
                    title: "My Credentials",
                    url: "/credentials/my-credentials.html",
                    icon: "🎓"
                },

                {
                    title: "Certificates",
                    url: "/certificates/",
                    icon: "📄"
                },

                {
                    title: "Digital Badges",
                    url: "/badges/",
                    icon: "🛡️"
                },

                {
                    title: "Assessment Platform",
                    url: "/assessment.html",
                    icon: "📝"
                }

            ];

        },

        /* ==================================================
        RECENT CREDENTIALS
        ================================================== */

        async loadRecentCredentials() {

            return window.portalCredentials || [];

        },

        /* ==================================================
           RECENT RECOGNITIONS
        ================================================== */

        async loadRecentRecognitions() {

            return [];

        },

        /* ==================================================
           NOTIFICATIONS
        ================================================== */

        async loadNotifications() {

            return [];

        },

        /* ==================================================
           SHARED PORTAL STATE
        ================================================== */

        getPortalCredentials() {

            if (
                !Array.isArray(
                    window.portalCredentials
                )
            ) {

                return [];

            }

            return window.portalCredentials;

        }

        /* ==================================================
           FUTURE SERVICES

           Reserved For

           ✓ Executive Insights
           ✓ Learning Progress
           ✓ AI Recommendations
           ✓ Activity Timeline
           ✓ Analytics

        ================================================== */

    };

    Object.freeze(DashboardService);

    window.DashboardService = DashboardService;

})(window);