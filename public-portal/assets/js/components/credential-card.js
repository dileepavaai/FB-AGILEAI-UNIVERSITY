/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-card.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2D

   Purpose
   ----------------------------------------------------------
   Credential Card Component

   Responsibilities

   ✓ Render Credential Card
   ✓ Render Credential Assets
   ✓ Render Empty Credential State

   Non Responsibilities

   ✗ Dashboard Rendering
   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ DOM Manipulation

   Governance

   • Credential Card Authority
   • Shared UI Component
   • Single Responsibility
   • Enterprise Portal Standard

========================================================== */

(function (window) {

    "use strict";

    const CredentialCard = {

        /* ==================================================
           EMPTY STATE
        ================================================== */

        renderEmpty() {

            return `

                <article class="dashboard-card">

                    <div class="dashboard-card-body">

                        <div class="dashboard-card-empty">

                            <div class="dashboard-card-empty-icon">

                                🎓

                            </div>

                            <div class="dashboard-card-empty-title">

                                No Credentials Yet

                            </div>

                            <div class="dashboard-card-empty-text">

                                Your Agile AI University
                                credentials will appear
                                here after successful
                                completion.

                            </div>

                        </div>

                    </div>

                </article>

            `;

        },

        /* ==================================================
           ASSET BUTTONS
        ================================================== */

        renderAssetButtons(
            credential,
            assets = {}
        ) {

            const credentialId =
                credential?.credential_id || "";

            return [

                assets.universityCertificate ? `

                    <a
                        href="#"
                        class="btn btn-secondary js-open-university-certificate"
                        data-credential-id="${credentialId}">

                        University Certificate

                    </a>

                ` : "",

                assets.trainerCertificate ? `

                    <a
                        href="#"
                        class="btn btn-secondary js-open-trainer-certificate"
                        data-credential-id="${credentialId}">

                        Trainer Certificate

                    </a>

                ` : "",

                assets.digitalBadge ? `

                    <a
                        href="#"
                        class="btn btn-secondary js-open-digital-badge"
                        data-credential-id="${credentialId}">

                        Digital Badge

                    </a>

                ` : "",

                assets.recognitionAsset ? `

                    <a
                        href="#"
                        class="btn btn-secondary js-open-recognition"
                        data-credential-id="${credentialId}">

                        Recognition Asset

                    </a>

                ` : ""

            ].join("");

        },

        /* ==================================================
           CREDENTIAL CARD
        ================================================== */

        render(credential) {

            if (!credential) {

                return "";

            }

            const program =
                credential.program || {};

            const programName =
                program.programName ||
                credential.programName ||
                credential.program_name ||
                credential.program_code ||
                credential.credential_type ||
                "Credential";

            const programCode =
                program.programCode ||
                credential.programCode ||
                credential.program_code ||
                credential.credential_code ||
                credential.credential_type ||
                "-";

            const assets =
                program.availableAssets ||
                credential.available_assets ||
                {};

            return `

                <article class="dashboard-card">

                    <div class="dashboard-card-header">

                        <div>

                            <h3 class="dashboard-card-title">

                                ${programCode}

                            </h3>

                            <div class="dashboard-card-subtitle">

                                ${programName}

                            </div>

                        </div>

                    </div>

                    <div class="dashboard-card-body">

                        <p>

                            <strong>Credential ID:</strong>

                            ${credential.credential_id || "-"}

                        </p>

                        <p>

                            <strong>Issued By:</strong>

                            ${credential.issued_by || "Agile AI University"}

                        </p>

                        <p>

                            <strong>Validity:</strong>

                            ${credential.validity || "Lifetime"}

                        </p>

                    </div>

                    <div class="dashboard-card-footer">

                        <div class="dashboard-card-actions">

                            <a
                                href="#"
                                class="btn btn-primary js-view-credential"
                                data-credential-id="${credential.credential_id || ""}">

                                View Credential

                            </a>

                        </div>

                    </div>

                </article>

            `;

        }

    };

    Object.freeze(
        CredentialCard
    );

    window.CredentialCard =
        CredentialCard;

})(window);