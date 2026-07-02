/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : upgrade-card.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Revenue Sprint

   Purpose
   ----------------------------------------------------------
   Dashboard Upgrade Card Component

   Responsibilities

   ✓ Render upgrade recommendation
   ✓ Render CTA
   ✓ UI only

   Non Responsibilities

   ✗ Eligibility
   ✗ Firestore
   ✗ Payments
   ✗ Routing Logic
   ✗ Business Rules

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

                buttonText = "Learn More",

                url = "/upgrade/upgrade.html"

            } = model;

            return `

                <section class="dashboard-card upgrade-card">

                    <div class="upgrade-card__header">

                        <h3>${title}</h3>

                    </div>

                    <div class="upgrade-card__body">

                        <p>

                            ${description}

                        </p>

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

    window.UpgradeCard = UpgradeCard;

})(window);