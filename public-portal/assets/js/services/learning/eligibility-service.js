/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : eligibility-service.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Revenue Sprint

   Purpose
   ----------------------------------------------------------
   Determines learner upgrade eligibility.

   Responsibilities

   ✓ Evaluate upgrade eligibility
   ✓ Build Upgrade ViewModel
   ✓ Business rules only

   Non Responsibilities

   ✗ HTML Rendering
   ✗ DOM Manipulation
   ✗ Dashboard Rendering
   ✗ Firestore Access
   ✗ Navigation

   Governance

   • Business Service
   • Resolver First
   • Single Responsibility
   • Dashboard consumes ViewModel only

========================================================== */

(function (window) {

    "use strict";

    const EligibilityService = {

        /* ==================================================
           UPGRADE MODEL
        ================================================== */

        async getUpgradeModel() {

            const credentials =
                this.getVisibleCredentials();

            /*
             * Revenue Sprint v1
             * ---------------------------------------------
             * Placeholder implementation.
             *
             * Future versions will evaluate:
             *
             * • Completed Programs
             * • Membership
             * • Upgrade Paths
             * • Campaign Rules
             * • Pricing
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
                    "/upgrade/upgrade.html",

                currentCredentials:
                    credentials.length

            };

        },

        /* ==================================================
           VISIBLE CREDENTIALS
        ================================================== */

        getVisibleCredentials() {

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

        }

    };

    Object.freeze(EligibilityService);

    window.EligibilityService = EligibilityService;

})(window);