(function (window) {

    "use strict";

    const DashboardService = {

        /* ==================================================
           DASHBOARD
        ================================================== */

        async loadDashboard() {

            const summary =
                await this.loadDashboardSummary();

            const [

                kpi,

                quickAccess,

                recentCredentials,

                recentRecognitions,

                notifications

            ] = await Promise.all([

                this.loadKpiData(summary),

                this.loadQuickAccess(),

                this.loadRecentCredentials(),

                this.loadRecentRecognitions(),

                this.loadNotifications()

            ]);

            return {

                summary,

                kpi,

                quickAccess,

                recentCredentials,

                recentRecognitions,

                notifications

            };

        },

        /* ==================================================
           DASHBOARD SUMMARY
        ================================================== */

        async loadDashboardSummary() {

            const recognitionCount =

                (
                    window.RecognitionService &&
                    typeof window.RecognitionService.count === "function"
                )

                    ? await window.RecognitionService.count()

                    : 0;

            return this.createSummaryModel(

                recognitionCount

            );

        },

        createSummaryModel(recognitionCount) {

            const finalizedCredentials =
                this.getFinalizedCredentials();

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
                     * Agile AI University currently
                     * issues one Certificate and one
                     * Digital Badge for every finalized
                     * credential.
                     *
                     * Future versions will derive these
                     * values from dedicated Certificate
                     * and Badge Registry services.
                     */

                    certificates:
                        finalizedCredentials.length,

                    badges:
                        finalizedCredentials.length,

                    recognitions:
                        recognitionCount

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

            return this.getPortalCredentials();

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

            const entitlements =
                window.__AAIU_ENTITLEMENTS__;

            if (
                !entitlements ||
                !Array.isArray(
                    entitlements.visibleCredentials
                )
            ) {

                return [];

            }

            return entitlements.visibleCredentials;

        },

        /* ==================================================
            FINALIZED CREDENTIALS
        ================================================== */

        getFinalizedCredentials() {

            return this
                .getPortalCredentials()
                .filter(function (credential) {

                    return (

                        credential &&

                        (

                            credential.issued_status ===
                                "finalized" ||

                            credential.issued_status ===
                                "issued" ||

                            /*
                            * Resolver-normalized credentials
                            * intentionally omit issued_status.
                            *
                            * Presence of a canonical
                            * credential_id indicates a
                            * resolver-approved visible
                            * credential.
                            */

                            credential.credential_id

                        )

                    );

                });

        }

    };

    Object.freeze(DashboardService);

    window.DashboardService = DashboardService;

})(window);