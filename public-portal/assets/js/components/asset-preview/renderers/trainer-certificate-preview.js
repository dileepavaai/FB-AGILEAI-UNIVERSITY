/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : trainer-certificate-preview.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2E.1

   Purpose
   ----------------------------------------------------------
   Trainer Certificate Preview Renderer

========================================================== */

(function (window) {

    "use strict";

    const TrainerCertificatePreview = {

        render(credential) {

            return `
                <div class="asset-preview-certificate trainer">
                    <p class="asset-preview-kicker">Agile AI University</p>
                    <h2>Trainer Certificate</h2>
                    <p>This certifies that</p>
                    <h3>${this.escape(credential.fullName || credential.learnerName || "Learner")}</h3>
                    <p>is recognized for trainer capability in</p>
                    <h4>${this.escape(credential.programName || credential.credentialName || "Agile AI")}</h4>
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

    window.TrainerCertificatePreview = TrainerCertificatePreview;

})(window);