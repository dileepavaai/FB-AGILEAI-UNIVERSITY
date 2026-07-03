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

    const PROGRAM_HIERARCHY = Object.freeze({

        AOP: 1,

        AAIA: 2,

        AIPA: 3,

        AAIP: 4,

        AIAL: 5

    });

    const PROGRAM_NAMES = Object.freeze({

        AIPA:
            "Artificial Intelligence Professional Agilist",

        AAIP:
            "Agentic AI Professional",

        AIAL:
            "Agile AI Leadership"

    });

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
                    eligibility
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

            let highestCredential = null;

            let highestRank = 0;

            credentials.forEach((credential) => {

                if (!credential) {
                    return;
                }

                const programCode =
                    String(
                        credential.program_code ||
                        credential.programCode ||
                        credential.code ||
                        ""
                    ).toUpperCase();

                const rank =
                    PROGRAM_HIERARCHY[programCode] || 0;

                if (rank > highestRank) {

                    highestRank = rank;

                    highestCredential = credential;

                }

            });

            if (!highestCredential) {

                return null;

            }

            return {

                code:
                    highestCredential.program_code ||
                    highestCredential.programCode ||
                    highestCredential.code ||
                    null,

                name:
                    highestCredential.program_name ||
                    highestCredential.programName ||
                    highestCredential.name ||
                    highestCredential.credential_type ||
                    null

            };

        },

        /* ==================================================
        ELIGIBILITY
        ================================================== */

        evaluateEligibility(program) {

            if (!program) {

                return {

                    eligible: false,

                    nextProgram: null,

                    reason:
                        "No qualifying program found."

                };

            }

            /*
            * Revenue Sprint v1
            * ---------------------------------------------
            * Current commercial offering:
            *
            * • AOP  → AIPA
            * • AAIA → AIPA
            *
            * Future versions will evaluate:
            *
            * • Membership
            * • Campaign rules
            * • Learning prerequisites
            * • Regional availability
            */

            switch (program.code) {

                case "AOP":

                case "AAIA":

                    return {

                        eligible: true,

                        nextProgram: "AIPA",

                        reason: null

                    };

                case "AIPA":

                    return {

                        eligible: true,

                        nextProgram: "AAIP",

                        reason: null

                    };

                case "AAIP":

                    return {

                        eligible: true,

                        nextProgram: "AIAL",

                        reason: null

                    };

                case "AIAL":

                    return {

                        eligible: false,

                        nextProgram: null,

                        reason:
                            "Highest program already achieved."

                    };

                default:

                    return {

                        eligible: false,

                        nextProgram: null,

                        reason:
                            "No upgrade currently available."

                    };

            }

        },

        /* ==================================================
        PRICING
        ================================================== */

        resolvePricing(eligibility) {

            if (
                !eligibility ||
                !eligibility.eligible
            ) {

                return {

                    price: null,

                    currency: "INR"

                };

            }

            /*
            * Revenue Sprint v1
            * ---------------------------------------------
            * Commercial pricing.
            *
            * Future versions will support:
            *
            * • Campaign pricing
            * • Regional pricing
            * • Membership discounts
            * • Coupons
            * • Promotional offers
            */

            switch (eligibility.nextProgram) {

                case "AIPA":

                    return {

                        price: 8850,

                        currency: "INR"

                    };

                default:

                    return {

                        price: null,

                        currency: "INR"

                    };

            }

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

                eligible:
                    eligibility.eligible,

                currentProgram:
                    program,

                nextProgram:
                    eligibility.nextProgram,

                reason:
                    eligibility.reason,

                programCode:
                    eligibility.nextProgram,

                programName:
                    eligibility.nextProgram
                        ? PROGRAM_NAMES[
                            eligibility.nextProgram
                        ] || null
                        : null,

                title:
                    "Upgrade Your Agile AI Capability",

                description:
                    "Continue your Agile AI University learning journey by upgrading your Agile AI capability.",

                buttonText:
                    eligibility.eligible
                        ? "Upgrade Now"
                        : "View Learning Journey",

                price:
                    pricing.price,

                currency:
                    pricing.currency,

                url:
                    "/upgrade/upgrade.html",

                currentCredentials:
                    Array.isArray(credentials)
                        ? credentials.length
                        : 0,

                reasons:
                    eligibility.reason
                        ? [eligibility.reason]
                        : []

            };

        }

    };

    Object.freeze(
        EligibilityService
    );

    window.EligibilityService =
        EligibilityService;

})(window);