/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : widgets.js
   Version   : 2.0.0
   Status    : ACTIVE
   Phase     : Sprint 2C

   Purpose
   ----------------------------------------------------------
   Dashboard Widget Renderer

   Responsibilities

   ✓ Render Dashboard
   ✓ Render Sidebar Summary
   ✓ Render KPI Cards
   ✓ Render Quick Access
   ✓ Render Credential Widgets
   ✓ Render Recognition Widgets
   ✓ Render Notifications

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ API Calls

   Governance

   • Dashboard Rendering Authority
   • UI Layer
   • Single Responsibility
   • Enterprise Portal Standard

========================================================== */

(function (window, document) {

    "use strict";

    const DashboardWidgets = {

        /* ==================================================
           ROOT RENDER
        ================================================== */

        render(data) {

            if (!data) {
                return;
            }

            this.renderSummary(
                data.summary
            );

            this.renderKpiCards(
                data.kpi
            );

            this.renderQuickAccess(
                data.quickAccess
            );

            this.renderRecentCredentials(
                data.recentCredentials
            );

            this.renderRecentRecognitions(
                data.recentRecognitions
            );

            this.renderNotifications(
                data.notifications
            );

        },

        /* ==================================================
           SIDEBAR SUMMARY
        ================================================== */

        renderSummary(summary) {

            if (!summary) {
                return;
            }

            const userName =
                document.getElementById(
                    "sidebarUserName"
                );

            const membership =
                document.getElementById(
                    "sidebarMembership"
                );

            const credentialCount =
                document.getElementById(
                    "sidebarCredentialCount"
                );

            if (userName) {

                userName.textContent =
                    summary.user?.name || "Student";

            }

            if (membership) {

                membership.textContent =
                    summary.user?.membership || "";

            }

            if (credentialCount) {

                credentialCount.textContent =
                    summary.portfolio?.credentials || 0;

            }

        },

        /* ==================================================
           KPI CARDS
        ================================================== */

        renderKpiCards(kpi) {

            if (!kpi) {
                return;
            }

            const credentials =
                document.getElementById(
                    "kpiCredentials"
                );

            const certificates =
                document.getElementById(
                    "kpiCertificates"
                );

            const trainerCertificates =
                document.getElementById(
                    "kpiTrainerCertificates"
                );

            const badges =
                document.getElementById(
                    "kpiBadges"
                );

            const recognitions =
                document.getElementById(
                    "kpiRecognitions"
                );

            /*
             * Dashboard Gating is the
             * authoritative renderer.
             *
             * If values already exist,
             * never overwrite them.
             */

            if (

                credentials &&
                credentials.textContent.trim() !== "" &&
                credentials.textContent.trim() !== "—"

            ) {

                return;

            }

            if (credentials) {

                credentials.textContent =
                    kpi.credentials ?? 0;

            }

            if (certificates) {

                certificates.textContent =
                    kpi.certificates ?? 0;

            }

            /*
             * Reserved for future
             * Trainer Certificate Service.
             */

            if (

                trainerCertificates &&
                kpi.trainerCertificates !== undefined

            ) {

                trainerCertificates.textContent =
                    kpi.trainerCertificates;

            }

            if (badges) {

                badges.textContent =
                    kpi.badges ?? 0;

            }

            if (recognitions) {

                recognitions.textContent =
                    kpi.recognitions ?? 0;

            }

        },

                /* ==================================================
           QUICK ACCESS
        ================================================== */

        renderQuickAccess(items) {

            if (!Array.isArray(items)) {
                return;
            }

            const container =
                document.getElementById(
                    "dashboardQuickAccess"
                );

            if (!container) {
                return;
            }

            container.innerHTML = items.map(

                item => `

                    <a
                        href="${item.url}"
                        class="btn btn-secondary">

                        ${item.icon || ""}

                        ${item.title}

                    </a>

                `

            ).join("");

        },

        /* ==================================================
           RECENT CREDENTIALS
        ================================================== */

        renderRecentCredentials(credentials) {

            if (!Array.isArray(credentials)) {
                return;
            }

            const container =
                document.getElementById(
                    "recentCredentials"
                );

            if (!container) {
                return;
            }

            if (credentials.length === 0) {

                container.innerHTML = `

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

                return;

            }

            container.innerHTML = credentials.map(

                credential => {

                    const assets =
                        credential.available_assets || {};

                    return `

                        <article class="dashboard-card">

                            <div class="dashboard-card-header">

                                <div>

                                    <h3 class="dashboard-card-title">

                                        ${credential.program_code || "Credential"}

                                    </h3>

                                    <div class="dashboard-card-subtitle">

                                        ${credential.credential_type || "-"}

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

                                    ${assets.universityCertificate ? `

                                        <a
                                            href="#"
                                            class="btn btn-secondary">

                                            University Certificate

                                        </a>

                                    ` : ""}

                                    ${assets.trainerCertificate ? `

                                        <a
                                            href="#"
                                            class="btn btn-secondary">

                                            Trainer Certificate

                                        </a>

                                    ` : ""}

                                    ${assets.digitalBadge ? `

                                        <a
                                            href="#"
                                            class="btn btn-secondary">

                                            Digital Badge

                                        </a>

                                    ` : ""}

                                    ${assets.recognitionAsset ? `

                                        <a
                                            href="#"
                                            class="btn btn-secondary">

                                            Recognition Asset

                                        </a>

                                    ` : ""}

                                </div>

                            </div>

                        </article>

                    `;

                }

            ).join("");

        },

                /* ==================================================
           RECENT RECOGNITIONS
        ================================================== */

        renderRecentRecognitions(recognitions) {

            if (!Array.isArray(recognitions)) {
                return;
            }

            const container =
                document.getElementById(
                    "recentRecognitions"
                );

            if (!container) {
                return;
            }

            if (recognitions.length === 0) {

                container.innerHTML = "";

                return;

            }

            container.innerHTML = recognitions.map(

                recognition => `

                    <article class="dashboard-card">

                        <div class="dashboard-card-header">

                            <h3 class="dashboard-card-title">

                                ${recognition.title || "Recognition"}

                            </h3>

                        </div>

                        <div class="dashboard-card-body">

                            <p>

                                ${recognition.description || ""}

                            </p>

                        </div>

                    </article>

                `

            ).join("");

        },

        /* ==================================================
           NOTIFICATIONS
        ================================================== */

        renderNotifications(notifications) {

            if (!Array.isArray(notifications)) {
                return;
            }

            const container =
                document.getElementById(
                    "dashboardNotifications"
                );

            if (!container) {
                return;
            }

            if (notifications.length === 0) {

                container.innerHTML = "";

                return;

            }

            container.innerHTML = notifications.map(

                notification => `

                    <article class="dashboard-card">

                        <div class="dashboard-card-body">

                            ${notification.message || ""}

                        </div>

                    </article>

                `

            ).join("");

        }

    };

    Object.freeze(
        DashboardWidgets
    );

    window.DashboardWidgets =
        DashboardWidgets;

})(window, document);