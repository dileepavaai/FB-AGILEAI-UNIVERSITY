/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : upgrade-card.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Revenue Sprint

   Purpose
   ----------------------------------------------------------
   Dashboard Upgrade Card Component

   Responsibilities

   ✓ Render upgrade recommendation
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

                title = "Continue Your Learning",

                description =
                    "Explore your next Agile AI learning opportunity.",

                currentProgram = null,

                nextProgram = null,

                programName = null,

                price = null,

                currency = "INR",

                buttonText = "Learn More",

                url = "/upgrade/upgrade.html",

                reasons = []

            } = model;

            const reasonHtml =
                reasons.length > 0
                    ? `
                        <ul class="upgrade-card__reasons">
                            ${reasons
                                .map(function (reason) {
                                    return `<li>${reason}</li>`;
                                })
                                .join("")}
                        </ul>
                    `
                    : "";

            const priceHtml =
                price !== null
                    ? `
                        <div class="upgrade-card__price">

                            <strong>

                                ${currency} ${Number(price).toLocaleString()}

                            </strong>

                        </div>
                    `
                    : "";

            const journeyHtml =
                currentProgram && nextProgram
                    ? `
                        <div class="upgrade-card__journey">

                            <strong>

                                ${currentProgram.code}
                                →
                                ${nextProgram}

                            </strong>

                        </div>
                    `
                    : "";

            return `

                <section class="dashboard-card upgrade-card">

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

                        ${programName ? `
                            <p>

                                <strong>

                                    Next Program:

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
                            class="btn ${eligible ? "btn-primary" : "btn-secondary"}">

                            ${buttonText}

                        </a>

                    </div>

                </section>

            `;

        }

    };

    Object.freeze(UpgradeCard);

    window.UpgradeCard =
        UpgradeCard;

})(window);