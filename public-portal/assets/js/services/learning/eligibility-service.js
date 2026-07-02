/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : eligibility-service.js
   Version   : 1.1.0
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

            const currentProgram =
                this.getCurrentProgram(
                    credentials
                );

            const eligibility =
                this.evaluateEligibility(
                    currentProgram
                );

            const pricing =
                this.resolvePricing(
                    currentProgram
                );

            return this.buildUpgradeModel(
                eligibility,
                currentProgram,
                pricing,
                credentials
            );

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

        },

        /* ==================================================
           CURRENT PROGRAM
        ================================================== */

        getCurrentProgram(credentials) {

            if (
                !Array.isArray(credentials) ||
                credentials.length === 0
            ) {

                return null;

            }

            /*
             * Revenue Sprint v1
             *
             * Current implementation:
             * Uses the latest visible credential.
             *
             * Future:
             * Highest credential
             * Learning hierarchy
             * Bridge rules
             */

            const latestCredential =
                credentials[0];

            return {

                code:
                    latestCredential.programCode ||
                    latestCredential.code ||
                    null,

                name:
                    latestCredential.programName ||
                    latestCredential.name ||
                    null

            };

        },

        /* ==================================================
           ELIGIBILITY
        ================================================== */

        evaluateEligibility(program) {

            if (!program) {

                return false;

            }

            /*
             * Revenue Sprint v1
             *
             * Future versions will evaluate:
             * • Membership
             * • Upgrade paths
             * • Campaign rules
             */

            return true;

        },

        /* ==================================================
           PRICING
        ================================================== */

        resolvePricing(program) {

            if (!program) {

                return {

                    price: null,

                    currency: "INR"

                };

            }

            /*
             * Revenue Sprint v1
             *
             * Future:
             * Campaign pricing
             * Regional pricing
             * Coupons
             */

            return {

                price: null,

                currency: "INR"

            };

        },

        /* ==================================================
           UPGRADE VIEW MODEL
        ================================================== */

        buildUpgradeModel(
            eligibility,
            program,
            pricing,
            credentials
        ) {

            return {

                eligible,

                currentProgram:
                    program,

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
                    pricing.price,

                currency:
                    pricing.currency,

                url:
                    "/upgrade/upgrade.html",

                currentCredentials:
                    credentials.length,

                reasons: []

            };

        }

    };

    Object.freeze(
        EligibilityService
    );

    window.EligibilityService =
        EligibilityService;

})(window);