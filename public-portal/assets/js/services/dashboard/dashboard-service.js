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

            /* ==================================================
                DASHBOARD VIEW MODEL
               ================================================== */

            const user =
                summary?.user ?? {};

            const profile =
                user;

            const membership =
                user.membership ?? "University Member";

            /* ==================================================
            UPGRADE VIEW MODEL
            ================================================== */

            const upgrade =
                await this.loadUpgradeModel();

            return {

                /*
                * Existing Dashboard Model
                * ---------------------------------------------
                * Backward compatible.
                */

                summary,

                kpi,

                quickAccess,

                recentCredentials,

                recentRecognitions,

                notifications,

                /*
                * Dashboard ViewModel v1.2
                * ---------------------------------------------
                * New consumers should gradually migrate
                * to these properties.
                */

                profile,

                membership,

                upgrade

            };

        },

        /* ==================================================
           DASHBOARD SUMMARY
        ================================================== */

        async loadDashboardSummary() {

            try {

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

            }
            catch (error) {

                console.error(
                    "[DashboardService] Failed to load dashboard summary.",
                    error
                );

                return this.createSummaryModel(0);

            }

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

            const credentials =
                this.getPortalCredentials();

            if (!Array.isArray(credentials)) {

                return [];

            }

            return await Promise.all(

                credentials.map(async (credential) => {

                    const program =
                        await window.ProgramService.get(
                            credential.program_code
                        );

                    return Object.freeze({

                        ...credential,

                        /*
                        * Academic ViewModel
                        * ------------------------------
                        * ProgramService is the single
                        * authority for program metadata.
                        */

                        programName:
                            program.programName,

                        programCode:
                            program.programCode,

                        available_assets:
                            program.availableAssets

                    });

                })

            );

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
        UPGRADE MODEL
        ================================================== */

        async loadUpgradeModel() {

            if (
                !window.EligibilityService ||
                typeof window.EligibilityService.getUpgradeModel !== "function"
            ) {

                /*
                * Revenue Sprint v1
                * ---------------------------------------------
                * Fallback Upgrade Model.
                *
                * Used until EligibilityService
                * becomes available.
                */

                return {

                    eligible: true,

                    programCode:
                        "AIPA",

                    programName:
                        "Artificial Intelligence Professional Agilist",

                    title:
                        "Upgrade Your Agile AI Capability",

                    description:
                        "Continue your Agile AI University learning journey by upgrading to the Artificial Intelligence Professional Agilist (AIPA) credential.",

                    buttonText:
                        "Upgrade Now",

                    price:
                        null,

                    currency:
                        "INR",

                    url:
                        "/upgrade/upgrade.html"

                };

            }

            return await window.EligibilityService.getUpgradeModel();

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