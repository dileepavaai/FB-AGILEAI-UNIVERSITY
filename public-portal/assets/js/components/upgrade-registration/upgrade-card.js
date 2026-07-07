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
   • No Learner Navigation

========================================================== */

(function (window) {

    "use strict";

    const UpgradeCard = {

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
                reasons = []
            } = model;

            const safeReasons =
                Array.isArray(reasons)
                    ? reasons
                    : [];

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
                                    <strong>${bridgeProgram}</strong>
                                </div>
                            ` : ""}

                            <div class="upgrade-card__price">
                                <strong>
                                    ₹ ${Number(baseFee).toLocaleString("en-IN")}
                                </strong>
                            </div>

                            ${standardFee ? `
                                <div class="upgrade-card__standard-price">
                                    Regular Bridge Fee:
                                    ₹ ${Number(standardFee).toLocaleString("en-IN")}
                                </div>
                            ` : ""}

                            ${fullProgrammeFee ? `
                                <div class="upgrade-card__full-price">
                                    Full Programme Fee:
                                    ₹ ${Number(fullProgrammeFee).toLocaleString("en-IN")}
                                </div>
                            ` : ""}

                            ${gstApplicable ? `
                                <div class="upgrade-card__gst">
                                    Applicable GST will be added during secure payment checkout.
                                </div>
                            ` : ""}

                            ${offerEndsOn ? `
                                <div class="upgrade-card__offer">
                                    Offer valid until ${offerEndsOn}
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
                                ${currentProgram.code || currentProgram || "Current"}
                                →
                                ${nextProgram.code || nextProgram}
                            </strong>
                        </div>
                    `
                    : "";

            return `

                <section class="upgrade-card">

                    <div class="upgrade-card__header">

                        <h3>${title}</h3>

                    </div>

                    <div class="upgrade-card__body">

                        <p>${description}</p>

                        ${journeyHtml}

                        ${bridgeProgram ? `
                            <p>
                                <strong>Bridge Programme:</strong>
                                ${bridgeProgram}
                            </p>
                        ` : ""}

                        ${programName ? `
                            <p>
                                <strong>Upgrade To:</strong>
                                ${programName}
                            </p>
                        ` : ""}

                        ${priceHtml}

                        ${reasonHtml}

                    </div>

                    <div class="upgrade-card__footer">

                        <button
                            type="button"
                            class="btn ${eligible ? "btn-primary" : "btn-secondary"} js-open-upgrade-registration"
                            ${eligible ? "" : "disabled"}>

                            ${buttonText}

                        </button>

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