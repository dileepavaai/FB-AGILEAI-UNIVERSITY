/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : upgrade-card.js
   Version   : 1.2.0
   Status    : ACTIVE
   Phase     : Revenue Sprint

   Purpose
   ----------------------------------------------------------
   Dashboard Upgrade Card Component

   Responsibilities

   ✓ Render upgrade recommendation
   ✓ Render commercial offer summary
   ✓ Render CTA
   ✓ UI Rendering only

   Non Responsibilities

   ✗ Eligibility
   ✗ Firestore
   ✗ Payments
   ✗ Routing Logic
   ✗ Business Rules

   Governance

   • Presentation Component
   • Consumes Upgrade ViewModel
   • Stateless
   • Enterprise Portal Standard

   Change History
   ----------------------------------------------------------

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

    const UpgradeCard = {

        /* ==================================================
           RENDER
        ================================================== */

        render(model = {}) {

            const {

                eligible = false,

                title = "Your Next Agile AI Capability",

                description =
                    "Based on your current credentials, you're ready to advance to the next Agile AI capability.",

                currentProgram = null,

                nextProgram = null,

                programName = null,

                campaignName = null,

                bridgeProgram = null,

                baseFee = null,

                standardFee = null,

                fullProgrammeFee = null,

                gstApplicable = false,

                offerEndsOn = null,

                buttonText = "View Upgrade Path",

                url = "/upgrade/upgrade.html",

                reasons = []

            } = model;

            const safeReasons =
                Array.isArray(reasons)
                    ? reasons
                    : [];

            const isExternalUrl =
                typeof url === "string" &&
                /^https?:\/\//i.test(url);

            const targetAttributes =
                isExternalUrl
                    ? `target="_blank" rel="noopener noreferrer"`
                    : "";

            const reasonHtml =
                safeReasons.length > 0
                    ? `
                        <ul class="upgrade-card__reasons">
                            ${safeReasons
                                .map(function (reason) {
                                    return `<li>${reason}</li>`;
                                })
                                .join("")}
                        </ul>
                    `
                    : "";

            const priceHtml =
                baseFee !== null
                    ? `

                        <div class="upgrade-card__pricing">

                            ${campaignName ? `
                                <div class="upgrade-card__campaign">

                                    ${campaignName}

                                </div>
                            ` : ""}

                            ${bridgeProgram ? `
                                <div class="upgrade-card__bridge">

                                    <strong>

                                        ${bridgeProgram}

                                    </strong>

                                </div>
                            ` : ""}

                            <div class="upgrade-card__price">

                                <strong>

                                    ₹ ${Number(baseFee).toLocaleString()}

                                </strong>

                            </div>

                            ${standardFee ? `
                                <div class="upgrade-card__standard-price">

                                    Regular Bridge Fee:
                                    ₹ ${Number(standardFee).toLocaleString()}

                                </div>
                            ` : ""}

                            ${fullProgrammeFee ? `
                                <div class="upgrade-card__full-price">

                                    Full Programme Fee:
                                    ₹ ${Number(fullProgrammeFee).toLocaleString()}

                                </div>
                            ` : ""}

                            ${gstApplicable ? `
                                <div class="upgrade-card__gst">

                                    Applicable GST will be added during secure payment checkout.

                                </div>
                            ` : ""}

                            ${offerEndsOn ? `
                                <div class="upgrade-card__offer">

                                    Offer valid until
                                    ${offerEndsOn}

                                </div>
                            ` : ""}

                        </div>

                    `
                    : "";

            const journeyHtml =
                currentProgram && nextProgram
                    ? `
                        <div class="upgrade-card__journey">

                            <strong>

                                ${currentProgram.code || "Current"}
                                →
                                ${nextProgram}

                            </strong>

                        </div>
                    `
                    : "";

            return `

                <section class="upgrade-card">

                    <div class="upgrade-card__header">

                        <h3>

                            ${title}

                        </h3>

                    </div>

                    <div class="upgrade-card__body">

                        <p>

                            ${description}

                        </p>

                        ${journeyHtml}

                        ${bridgeProgram ? `
                            <p>

                                <strong>

                                    Bridge Programme:

                                </strong>

                                ${bridgeProgram}

                            </p>
                        ` : ""}

                        ${programName ? `
                            <p>

                                <strong>

                                    Upgrade To:

                                </strong>

                                ${programName}

                            </p>
                        ` : ""}

                        ${priceHtml}

                        ${reasonHtml}

                    </div>

                    <div class="upgrade-card__footer">

                        <a
                            href="${url}"
                            class="btn ${eligible ? "btn-primary" : "btn-secondary"}"
                            ${targetAttributes}>

                            ${buttonText}

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