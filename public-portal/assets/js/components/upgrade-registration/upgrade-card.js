/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : upgrade-card.js
   Version   : 1.3.0
   Status    : ACTIVE
   Phase     : Revenue Sprint

   Purpose
   ----------------------------------------------------------
   Dashboard Upgrade Card Component

   Responsibilities

   ✓ Render actionable upgrade recommendation
   ✓ Render commercial offer summary
   ✓ Render governed CTA
   ✓ Escape presentation content
   ✓ Reject unsafe or incomplete render models
   ✓ UI rendering only

   Non Responsibilities

   ✗ Eligibility Resolution
   ✗ Firestore
   ✗ Payments
   ✗ Routing Logic
   ✗ Commercial Business Rules
   ✗ Dashboard Section Visibility

   Governance

   • Presentation Component
   • Consumes Governed Upgrade ViewModel
   • Stateless
   • Fail Closed
   • Enterprise Portal Standard

   Change History
   ----------------------------------------------------------

   v1.3.0

   • Added fail-closed actionable-model validation
   • Prevented rendering of ineligible recommendations
   • Added HTML escaping for ViewModel content
   • Added safe internal and HTTPS URL validation
   • Rejected placeholder and unsafe CTA URLs
   • Added defensive currency formatting
   • Added accessible CTA labelling
   • Preserved external-link security attributes

   v1.2.0

   • Added safe reasons fallback
   • Added CTA target handling
   • Improved rendering defensiveness

   v1.1.0

   • Added bridge programme pricing display
   • Added campaign display
   • Added GST and offer validity messaging

========================================================== */

(function (window) {

    "use strict";

    /* ======================================================
       PRIVATE PRESENTATION HELPERS
    ====================================================== */

    function escapeHtml(value) {

        return String(
            value ?? ""
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    }

    function normalizeText(value) {

        if (
            typeof value !== "string" &&
            typeof value !== "number"
        ) {

            return "";

        }

        return String(value).trim();

    }

    function getSafeUrl(value) {

        const url =
            normalizeText(value);

        if (
            !url ||
            url === "#" ||
            /^javascript:/i.test(url) ||
            /^data:/i.test(url) ||
            /^vbscript:/i.test(url) ||
            /^\/\//.test(url)
        ) {

            return null;

        }

        /*
         * Governed internal portal route.
         */

        if (
            url.startsWith("/") &&
            !url.startsWith("//")
        ) {

            return url;

        }

        /*
         * Governed external destination.
         * Only HTTPS destinations are accepted.
         */

        try {

            const parsedUrl =
                new URL(url);

            if (
                parsedUrl.protocol !== "https:"
            ) {

                return null;

            }

            return parsedUrl.href;

        }
        catch (error) {

            return null;

        }

    }

    function isExternalUrl(url) {

        return (
            typeof url === "string" &&
            /^https:\/\//i.test(url)
        );

    }

    function formatCurrency(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return null;

        }

        const amount =
            Number(value);

        if (
            !Number.isFinite(amount) ||
            amount < 0
        ) {

            return null;

        }

        return amount.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );

    }

    function getProgramCode(currentProgram) {

        if (
            currentProgram &&
            typeof currentProgram === "object"
        ) {

            return normalizeText(
                currentProgram.code
            );

        }

        return normalizeText(
            currentProgram
        );

    }

    function getSafeReasons(reasons) {

        if (!Array.isArray(reasons)) {

            return [];

        }

        return reasons

            .map(function (reason) {

                return normalizeText(
                    reason
                );

            })

            .filter(function (reason) {

                return Boolean(reason);

            });

    }


    const UpgradeCard = {

        /* ==================================================
           RENDERABILITY CONTRACT

           Eligibility remains owned by the resolver.

           This method performs presentation validation only.
           It does not calculate or infer eligibility.
        ================================================== */

        isRenderable(model = {}) {

            if (
                !model ||
                typeof model !== "object"
            ) {

                return false;

            }

            const eligible =
                model.eligible === true;

            const safeUrl =
                getSafeUrl(
                    model.url
                );

            const buttonText =
                normalizeText(
                    model.buttonText ||
                    "View Upgrade Path"
                );

            return Boolean(
                eligible &&
                safeUrl &&
                buttonText
            );

        },


        /* ==================================================
           RENDER
        ================================================== */

        render(model = {}) {

            if (
                !this.isRenderable(model)
            ) {

                return "";

            }

            const title =
                normalizeText(
                    model.title
                ) ||
                "Your Next Agile AI Capability";

            const description =
                normalizeText(
                    model.description
                ) ||
                "Based on your current credentials, you are ready to advance to the next Agile AI capability.";

            const currentProgramCode =
                getProgramCode(
                    model.currentProgram
                );

            const nextProgram =
                normalizeText(
                    model.nextProgram
                );

            const programName =
                normalizeText(
                    model.programName
                );

            const campaignName =
                normalizeText(
                    model.campaignName
                );

            const bridgeProgram =
                normalizeText(
                    model.bridgeProgram
                );

            const offerEndsOn =
                normalizeText(
                    model.offerEndsOn
                );

            const buttonText =
                normalizeText(
                    model.buttonText
                ) ||
                "View Upgrade Path";

            const safeUrl =
                getSafeUrl(
                    model.url
                );

            const safeReasons =
                getSafeReasons(
                    model.reasons
                );

            const baseFee =
                formatCurrency(
                    model.baseFee
                );

            const standardFee =
                formatCurrency(
                    model.standardFee
                );

            const fullProgrammeFee =
                formatCurrency(
                    model.fullProgrammeFee
                );

            const gstApplicable =
                model.gstApplicable === true;

            const external =
                isExternalUrl(
                    safeUrl
                );

            const targetAttributes =
                external
                    ? 'target="_blank" rel="noopener noreferrer"'
                    : "";

            const reasonHtml =
                safeReasons.length > 0
                    ? `
                        <ul class="upgrade-card__reasons">

                            ${safeReasons
                                .map(function (reason) {

                                    return `
                                        <li>
                                            ${escapeHtml(reason)}
                                        </li>
                                    `;

                                })
                                .join("")}

                        </ul>
                    `
                    : "";

            const priceHtml =
                baseFee !== null
                    ? `
                        <div class="upgrade-card__pricing">

                            ${campaignName
                                ? `
                                    <div class="upgrade-card__campaign">
                                        ${escapeHtml(campaignName)}
                                    </div>
                                `
                                : ""}

                            ${bridgeProgram
                                ? `
                                    <div class="upgrade-card__bridge">

                                        <strong>
                                            ${escapeHtml(bridgeProgram)}
                                        </strong>

                                    </div>
                                `
                                : ""}

                            <div class="upgrade-card__price">

                                <strong>
                                    ₹ ${escapeHtml(baseFee)}
                                </strong>

                            </div>

                            ${standardFee !== null
                                ? `
                                    <div class="upgrade-card__standard-price">

                                        Regular Bridge Fee:
                                        ₹ ${escapeHtml(standardFee)}

                                    </div>
                                `
                                : ""}

                            ${fullProgrammeFee !== null
                                ? `
                                    <div class="upgrade-card__full-price">

                                        Full Programme Fee:
                                        ₹ ${escapeHtml(fullProgrammeFee)}

                                    </div>
                                `
                                : ""}

                            ${gstApplicable
                                ? `
                                    <div class="upgrade-card__gst">

                                        Applicable GST will be added
                                        during secure payment checkout.

                                    </div>
                                `
                                : ""}

                            ${offerEndsOn
                                ? `
                                    <div class="upgrade-card__offer">

                                        Offer valid until
                                        ${escapeHtml(offerEndsOn)}

                                    </div>
                                `
                                : ""}

                        </div>
                    `
                    : "";

            const journeyHtml =
                currentProgramCode &&
                nextProgram
                    ? `
                        <div class="upgrade-card__journey">

                            <strong>

                                ${escapeHtml(currentProgramCode)}
                                →
                                ${escapeHtml(nextProgram)}

                            </strong>

                        </div>
                    `
                    : "";

            return `
                <section class="upgrade-card">

                    <div class="upgrade-card__header">

                        <h3>
                            ${escapeHtml(title)}
                        </h3>

                    </div>

                    <div class="upgrade-card__body">

                        <p>
                            ${escapeHtml(description)}
                        </p>

                        ${journeyHtml}

                        ${bridgeProgram
                            ? `
                                <p>

                                    <strong>
                                        Bridge Programme:
                                    </strong>

                                    ${escapeHtml(bridgeProgram)}

                                </p>
                            `
                            : ""}

                        ${programName
                            ? `
                                <p>

                                    <strong>
                                        Upgrade To:
                                    </strong>

                                    ${escapeHtml(programName)}

                                </p>
                            `
                            : ""}

                        ${priceHtml}

                        ${reasonHtml}

                    </div>

                    <div class="upgrade-card__footer">

                        <a
                            href="${escapeHtml(safeUrl)}"
                            class="btn btn-primary"
                            aria-label="${escapeHtml(buttonText)}"
                            ${targetAttributes}>

                            ${escapeHtml(buttonText)}

                        </a>

                    </div>

                </section>
            `;

        }

    };

    Object.freeze(
        UpgradeCard
    );

    window.UpgradeCard =
        UpgradeCard;

})(window);