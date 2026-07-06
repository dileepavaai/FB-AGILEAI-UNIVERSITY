/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : badge-preview.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2E.1

   Purpose
   ----------------------------------------------------------
   Digital Badge Preview Renderer

========================================================== */

(function (window) {

    "use strict";

    const BadgePreview = {

        render(credential) {

            return `
                <div class="asset-preview-badge">
                    <div class="asset-preview-badge-mark">
                        ${this.escape(credential.programCode || "AAU")}
                    </div>

                    <h2>${this.escape(credential.programName || credential.credentialName || "Agile AI Credential")}</h2>

                    <p>Digital Badge</p>

                    <p class="asset-preview-id">
                        Credential ID: ${this.escape(credential.credentialId || credential.id || "")}
                    </p>
                </div>
            `;

        },

        escape(value) {

            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        }

    };

    window.BadgePreview = BadgePreview;

})(window);