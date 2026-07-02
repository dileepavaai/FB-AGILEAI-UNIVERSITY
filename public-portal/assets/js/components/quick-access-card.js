/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : quick-access-card.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2D

   Purpose
   ----------------------------------------------------------
   Quick Access Card Component

   Responsibilities

   ✓ Render Quick Access Button

   Non Responsibilities

   ✗ Dashboard Rendering
   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ DOM Manipulation

   Governance

   • Quick Access Card Authority
   • Shared UI Component
   • Single Responsibility
   • Enterprise Portal Standard

========================================================== */

(function (window) {

    "use strict";

    const QuickAccessCard = {

        /* ==================================================
           QUICK ACCESS BUTTON
        ================================================== */

        render(item) {

            if (!item) {

                return "";

            }

            return `

                <a
                    href="${item.url || "#"}"
                    class="btn btn-secondary"
                    aria-label="${item.title || ""}">

                    ${item.icon || ""}

                    ${item.title || ""}

                </a>

            `;

        }

    };

    Object.freeze(
        QuickAccessCard
    );

    window.QuickAccessCard =
        QuickAccessCard;

})(window);