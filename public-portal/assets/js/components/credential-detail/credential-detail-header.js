/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-detail-header.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Sprint 2E

   Purpose
   ----------------------------------------------------------
   Credential Detail Header Component

   Responsibilities

   ✓ Render Credential Header
   ✓ Render Program Information
   ✓ Render Credential Status
   ✓ Render Credential Metadata
   ✓ Presentation Only

========================================================== */

(function (window) {

    "use strict";

    const CredentialDetailHeader = {

        render(credential) {

            if (!credential) {
                return "";
            }

            const program =
                credential.program || {};

            const programCode =
                program.programCode ||
                credential.programCode ||
                credential.program_code ||
                credential.credential_type ||
                "-";

            const programName =
                program.programName ||
                credential.programName ||
                credential.program_name ||
                "Credential";

            const status =
                credential.status ||
                "Active";

            const credentialId =
                credential.credential_id ||
                "-";

            const issuedBy =
                credential.issued_by ||
                "Agile AI University";

            const issueDate =
                credential.issue_date ||
                credential.issued_on ||
                "";

            const validity =
                credential.validity ||
                "Lifetime";

            const issueDateHtml =
                issueDate
                    ? `
                        <div class="credential-detail-issue-date">
                            <strong>Issue Date:</strong>
                            ${issueDate}
                        </div>
                    `
                    : "";

            return `

                <div class="credential-detail-header">

                    <div class="credential-detail-header-main">

                        <div class="credential-detail-program-code">
                            ${programCode}
                        </div>

                        <h2 class="credential-detail-program-name">
                            ${programName}
                        </h2>

                    </div>

                    <div class="credential-detail-header-meta">

                        <div class="credential-detail-status">
                            <strong>Status:</strong>
                            ${status}
                        </div>

                        <div class="credential-detail-id">
                            <strong>Credential ID:</strong>
                            ${credentialId}
                        </div>

                        <div class="credential-detail-issued-by">
                            <strong>Issued By:</strong>
                            ${issuedBy}
                        </div>

                        ${issueDateHtml}

                        <div class="credential-detail-validity">
                            <strong>Validity:</strong>
                            ${validity}
                        </div>

                    </div>

                </div>

            `;

        }

    };

    Object.freeze(
        CredentialDetailHeader
    );

    window.CredentialDetailHeader =
        CredentialDetailHeader;

})(window);