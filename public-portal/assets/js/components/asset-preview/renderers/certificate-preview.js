/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : certificate-preview.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2E.1

   Purpose
   ----------------------------------------------------------
   University Certificate Preview Renderer

========================================================== */

(function (window) {

    "use strict";

    const CertificatePreview = {

        render(credential) {

            return `
                <div class="asset-preview-certificate">
                    <p class="asset-preview-kicker">Agile AI University</p>
                    <h2>Certificate of Achievement</h2>
                    <p>This certifies that</p>
                    <h3>${this.escape(credential.fullName || credential.learnerName || "Learner")}</h3>
                    <p>has successfully earned</p>
                    <h4>${this.escape(credential.programName || credential.credentialName || "Agile AI Credential")}</h4>
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

    window.CertificatePreview = CertificatePreview;

})(window);