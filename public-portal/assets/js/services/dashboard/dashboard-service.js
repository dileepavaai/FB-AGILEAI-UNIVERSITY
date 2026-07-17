/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : dashboard-service.js
   Version   : 1.3.0
   Status    : ACTIVE
   Phase     : Dashboard Value Hardening

   Purpose
   ----------------------------------------------------------
   Creates the governed dashboard ViewModel consumed by the
   Student & Executive Portal presentation layer.

   Responsibilities
   ----------------------------------------------------------
   ✓ Create dashboard summary data
   ✓ Create KPI data
   ✓ Supply implemented Quick Access capabilities
   ✓ Enrich recent credentials through ProgramService
   ✓ Supply upgrade recommendations through EligibilityService
   ✓ Consume resolver-approved portal credentials

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Authentication decisions
   ✗ Authorization decisions
   ✗ Entitlement resolution
   ✗ Direct Firestore access
   ✗ Direct Storage access
   ✗ HTML rendering
   ✗ DOM manipulation
   ✗ Credential visibility decisions

   Governance
   ----------------------------------------------------------
   • DashboardService supplies ViewModels only.

   • Only implemented, valuable and actionable capabilities
     may enter the Quick Access ViewModel.

   • Certificate and badge actions remain inside the governed
     Credential Workspace and are not duplicated here.

   • The Assessment Platform opens through its canonical
     production URL in a new tab.

   • Placeholder URLs and future capabilities must not enter
     the learner-facing dashboard model.

   Change History
   ----------------------------------------------------------
   v1.3.0

   • Removed non-working /certificates/ Quick Access route
   • Removed duplicate standalone Digital Badges shortcut
   • Preserved My Credentials as the credential entry point
   • Corrected Assessment Platform canonical URL
   • Added explicit capability presentation flags
   • Removed credential payload debug logging
   • Preserved dashboard and upgrade ViewModel contracts

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

                Object.freeze({

                    id:
                        "credentials",

                    title:
                        "My Credentials",

                    url:
                        "/credentials/my-credentials.html",

                    icon:
                        "🎓",

                    available:
                        true,

                    entitled:
                        true,

                    visible:
                        true,

                    actionable:
                        true,

                    openMode:
                        "same-tab"

                }),

                Object.freeze({

                    id:
                        "assessment",

                    title:
                        "Assessment Platform",

                    url:
                        "https://assessment.agileai.university/assessment.html",

                    icon:
                        "📝",

                    available:
                        true,

                    entitled:
                        true,

                    visible:
                        true,

                    actionable:
                        true,

                    openMode:
                        "new-tab"

                })

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

                    try {

                        let program = null;

                        if (
                            window.ProgramService &&
                            typeof window.ProgramService.get === "function"
                        ) {

                            program =
                                await window.ProgramService.get(
                                    credential.program_code
                                );

                        }

                        return Object.freeze({

    ...credential,

    /*
     * Program ViewModel
     * ---------------------------------
     * ProgramService is the single
     * authority for program metadata.
     */

    program,

    programName:
        program?.programName ??
        credential.program_code,

    programCode:
        program?.programCode ??
        credential.program_code,

    available_assets:
        program?.availableAssets ??
        credential.available_assets ??
        {}

});

                    }
                    catch (error) {

                        console.error(
                            "[DashboardService] Program lookup failed.",
                            credential.program_code,
                            error
                        );

                        return Object.freeze({

    ...credential,

    programName:
        credential.program_code,

    programCode:
        credential.program_code,

    available_assets:
        credential.available_assets ??
        {}

});

                    }

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

                return null;

            }

            if (
                !window.CredentialService ||
                typeof window.CredentialService.getCredentials !== "function"
            ) {

                console.warn(
                    "[DashboardService] CredentialService unavailable for upgrade model."
                );

                return null;

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