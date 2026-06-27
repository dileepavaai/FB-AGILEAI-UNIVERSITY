/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : widgets.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Sprint 2C

   Purpose
   ----------------------------------------------------------
   Dashboard Widget Renderer

   Changes
   ----------------------------------------------------------

   • Prepared KPI rendering
   • Added progressive DOM rendering
   • Prepared credential widget rendering
   • Prepared recognition widget rendering
   • Prepared notification widget rendering

   Responsibilities

   ✓ Render dashboard widgets
   ✓ Render KPI summary
   ✓ Render Quick Access
   ✓ Render dashboard placeholders
   ✓ Update dashboard UI

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Business Logic
   ✗ Firestore
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

            this.renderSummary(data.summary);

            this.renderKpiCards(data.kpi);

            this.renderQuickAccess(data.quickAccess);

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
           SUMMARY
        ================================================== */

        renderSummary(summary) {

            if (!summary) {
                return;
            }

            const userName =
                document.getElementById("sidebarUserName");

            const membership =
                document.getElementById("sidebarMembership");

            const portfolio =
                document.getElementById("sidebarCredentialCount");

            if (userName) {
                userName.textContent =
                    summary.user.name;
            }

            if (membership) {
                membership.textContent =
                    summary.user.membership;
            }

            if (portfolio) {
                portfolio.textContent =
                    summary.portfolio.credentials;
            }

        },

        /* ==================================================
           KPI
        ================================================== */

        renderKpiCards(kpi) {

            if (!kpi) {
                return;
            }

            const credentials =
                document.getElementById("kpiCredentials");

            const certificates =
                document.getElementById("kpiCertificates");

            const badges =
                document.getElementById("kpiBadges");

            const recognitions =
                document.getElementById("kpiRecognitions");

            if (credentials) {
                credentials.textContent =
                    kpi.credentials;
            }

            if (certificates) {
                certificates.textContent =
                    kpi.certificates;
            }

            if (badges) {
                badges.textContent =
                    kpi.badges;
            }

            if (recognitions) {
                recognitions.textContent =
                    kpi.recognitions;
            }

        },

        /* ==================================================
           QUICK ACCESS
        ================================================== */

        renderQuickAccess(items) {

            if (!Array.isArray(items)) {
                return;
            }

            /*
             * Existing HTML remains.
             * Future versions may build
             * this section dynamically.
             */

        },

        /* ==================================================
           RECENT CREDENTIALS
        ================================================== */

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

                    <div class="portal-empty-state">

                        <p>

                            No credentials available yet.

                        </p>

                        <p>

                            Your earned Agile AI University
                            credentials will appear here.

                        </p>

                    </div>

                `;

                return;

            }

            container.innerHTML = credentials.map(

                credential => `

                    <article class="portal-card">

                        <h3>

                            ${credential.title}

                        </h3>

                        <p>

                            <strong>Credential ID:</strong>

                            ${credential.id}

                        </p>

                        <p>

                            <strong>Status:</strong>

                            ${credential.status}

                        </p>

                        <div class="portal-actions">

                            <a
                                href="#"
                                class="btn">

                                View Credential

                            </a>

                            ${credential.certificate ? `

                                <a
                                    href="#"
                                    class="btn">

                                    Certificate

                                </a>

                            ` : ""}

                            ${credential.badge ? `

                                <a
                                    href="#"
                                    class="btn">

                                    Badge

                                </a>

                            ` : ""}

                        </div>

                    </article>

                `

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

            container.innerHTML = "";

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

            container.innerHTML = "";

        }

    };

    Object.freeze(DashboardWidgets);

    window.DashboardWidgets = DashboardWidgets;

})(window, document);