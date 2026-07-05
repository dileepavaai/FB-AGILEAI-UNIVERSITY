/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : eligibility-service.js
   Version   : 1.2.0
   Status    : ACTIVE
   Phase     : Revenue Sprint

   Purpose
   ----------------------------------------------------------
   Determines learner upgrade eligibility.

   Responsibilities

   ✓ Evaluate upgrade eligibility
   ✓ Build Upgrade ViewModel
   ✓ Consume resolved credential cache
   ✓ Business rules only

   Non Responsibilities

   ✗ HTML Rendering
   ✗ DOM Manipulation
   ✗ Dashboard Rendering
   ✗ Firestore Access
   ✗ Navigation
   ✗ Entitlement Resolution

   Governance

   • Business Service
   • Credential Service Consumer
   • Single Responsibility
   • Dashboard consumes ViewModel only

   Dependencies

   • CredentialService

   Change History

   v1.2.0

   • Consumes CredentialService credential cache
   • Removed direct entitlement dependency
   • Aligned eligibility with resolved credential model

   v1.1.0

   • Added commercial pricing model
   • Added bridge upgrade eligibility
   • Added upgrade ViewModel

========================================================== */

(function (window) {

    "use strict";

    console.log(
        "[EligibilityService] Loaded v1.2.0"
    );

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

    /* ==================================================
       COMMERCIAL CONSTANTS
    ================================================== */

    const BRIDGE_OFFER_END_DATE =
        "2026-06-10";

    /*
     * Future Commercial Constants
     * ------------------------------------------------
     * Keep all commercial values centralized here.
     *
     * Example:
     *
     * const BRIDGE_PROGRAMME =
     *     "AIPA Capability Upgrade";
     *
     * const BRIDGE_FEE = 7500;
     *
     * const STANDARD_BRIDGE_FEE = 15000;
     *
     * const FULL_PROGRAMME_FEE = 30000;
     */

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
                    currentProgram,
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

            /*
             * Primary Source
             * -----------------------------
             * Credential Service
             */

            if (

                window.CredentialService &&

                typeof window.CredentialService.getCredentials ===
                    "function"

            ) {

                const credentials =
                    window.CredentialService.getCredentials();

                if (
                    Array.isArray(credentials) &&
                    credentials.length > 0
                ) {

                    return credentials;

                }

            }

            /*
             * Secondary Source
             * -----------------------------
             * Portal cache
             */

            if (

                Array.isArray(window.portalCredentials) &&

                window.portalCredentials.length > 0

            ) {

                return window.portalCredentials;

            }

            /*
             * Final Fallback
             * -----------------------------
             * Published entitlement state
             */

            const entitlements =
                window.__AAIU_ENTITLEMENTS__;

            if (

                entitlements &&

                Array.isArray(
                    entitlements.visibleCredentials
                )

            ) {

                return entitlements.visibleCredentials;

            }

            console.warn(
                "[EligibilityService] No credential source available."
            );

            return [];

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
                        credential.program?.code ||
                        credential.program?.programCode ||
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
                    highestCredential.program?.code ||
                    highestCredential.program?.programCode ||
                    null,

                name:

                    highestCredential.program_name ||
                    highestCredential.programName ||
                    highestCredential.name ||
                    highestCredential.program?.name ||
                    highestCredential.program?.programName ||
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

        resolvePricing(
            currentProgram,
            eligibility
        ) {

            if (
                !eligibility ||
                !eligibility.eligible
            ) {

                return {

                    campaignName: null,

                    bridgeProgram: null,

                    offerTitle: null,

                    offerDescription: null,

                    baseFee: null,

                    standardFee: null,

                    fullProgrammeFee: null,

                    currency: "INR",

                    gstApplicable: false,

                    offerEndsOn: null,

                    ctaText: "View Learning Journey"

                };

            }

            /*
            * Revenue Sprint v1
            * ------------------------------------------------
            * Commercial Pricing Rules
            *
            * Current Campaign
            *
            * • Existing AOP Holders
            * • Existing AAIA Holders
            *
            * Bridge Programme
            *
            * • AIPA Capability Upgrade
            *
            * Pricing
            *
            * • Limited-Time Bridge Fee
            *      INR 7,500
            *
            * • Standard Bridge Fee
            *      INR 15,000
            *
            * • Full Programme Fee
            *      INR 30,000
            *
            * GST
            *
            * • GST is NOT calculated here.
            * • GST is automatically calculated
            *   by the payment gateway during checkout.
            *
            * Future
            *
            * • Campaign Pricing
            * • Coupons
            * • Membership Discounts
            * • Corporate Pricing
            * • Regional Pricing
            */

            if (
                currentProgram &&
                (
                    currentProgram.code === "AOP" ||
                    currentProgram.code === "AAIA"
                ) &&
                eligibility.nextProgram === "AIPA"
            ) {

                return {

                    campaignName:
                        "AOP Bridge Upgrade",

                    bridgeProgram:
                        "AIPA Capability Upgrade",

                    offerTitle:
                        "Exclusive Upgrade Offer",

                    offerDescription:
                        "Upgrade from your existing Agile certification to AIPA through the limited-time Bridge Programme.",

                    baseFee: 7500,

                    standardFee: 15000,

                    fullProgrammeFee: 30000,

                    currency: "INR",

                    gstApplicable: true,

                    offerEndsOn: BRIDGE_OFFER_END_DATE,

                    ctaText:
                        "Register for AIPA Bridge"

                };

            }

            /*
            * Default Pricing
            */

            return {

                campaignName: null,

                bridgeProgram: null,

                offerTitle: null,

                offerDescription: null,

                baseFee: null,

                standardFee: null,

                fullProgrammeFee: null,

                currency: "INR",

                gstApplicable: false,

                offerEndsOn: null,

                ctaText: "Upgrade Now"

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

                /* ------------------------------------------
                   Eligibility
                ------------------------------------------ */

                eligible:
                    eligibility.eligible,

                reason:
                    eligibility.reason,

                /* ------------------------------------------
                   Current & Next Programme
                ------------------------------------------ */

                currentProgram:
                    program,

                nextProgram:
                    eligibility.nextProgram,

                programCode:
                    eligibility.nextProgram,

                programName:
                    eligibility.nextProgram
                        ? PROGRAM_NAMES[
                            eligibility.nextProgram
                        ] || null
                        : null,

                /* ------------------------------------------
                   Upgrade Experience
                ------------------------------------------ */

                title:
                    pricing.offerTitle ||
                    "Upgrade Your Agile AI Capability",

                description:
                    pricing.offerDescription ||
                    "Continue your Agile AI University learning journey by upgrading your Agile AI capability.",

                buttonText:
                    eligibility.eligible
                        ? (
                            pricing.ctaText ||
                            "Upgrade Now"
                        )
                        : "View Learning Journey",

                url:
                    "/upgrade/upgrade.html",

                /* ------------------------------------------
                   Commercial Information
                ------------------------------------------ */

                campaignName:
                    pricing.campaignName,

                bridgeProgram:
                    pricing.bridgeProgram,

                baseFee:
                    pricing.baseFee,

                standardFee:
                    pricing.standardFee,

                fullProgrammeFee:
                    pricing.fullProgrammeFee,

                currency:
                    pricing.currency,

                gstApplicable:
                    pricing.gstApplicable,

                offerEndsOn:
                    pricing.offerEndsOn,

                /* ------------------------------------------
                   Dashboard Information
                ------------------------------------------ */

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