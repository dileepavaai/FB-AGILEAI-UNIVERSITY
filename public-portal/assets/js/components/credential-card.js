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

        renderAssetButtons(assets = {}) {

            return [

                assets.universityCertificate ? `

                    <a
                        href="#"
                        class="btn btn-secondary">

                        University Certificate

                    </a>

                ` : "",

                assets.trainerCertificate ? `

                    <a
                        href="#"
                        class="btn btn-secondary">

                        Trainer Certificate

                    </a>

                ` : "",

                assets.digitalBadge ? `

                    <a
                        href="#"
                        class="btn btn-secondary">

                        Digital Badge

                    </a>

                ` : "",

                assets.recognitionAsset ? `

                    <a
                        href="#"
                        class="btn btn-secondary">

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
                credential.program_code ||
                credential.credential_type ||
                "Credential";

            const programCode =
                program.programCode ||
                credential.programCode ||
                credential.program_code ||
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

                                ${programName}

                            </h3>

                            <div class="dashboard-card-subtitle">

                                ${programCode}

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
                                class="btn btn-primary">

                                View Credential

                            </a>

                            ${this.renderAssetButtons(assets)}

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