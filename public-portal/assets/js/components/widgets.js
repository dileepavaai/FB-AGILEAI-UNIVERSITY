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

            this.renderProfile(
                data.profile,
                data.membership,
                data.summary
            );

            this.renderKpiCards(
                data.kpi
            );

            this.renderQuickAccess(
                data.quickAccess
            );

            this.renderUpgradeCard(
                data.upgrade
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
           DOM HELPERS
        ================================================== */

        getElement(id) {

            return document.getElementById(id);

        },

        setText(element, value) {

            if (!element) {
                return;
            }

            element.textContent =
                value ?? "";

        },

        setHtml(element, html) {

            if (!element) {
                return;
            }

            element.innerHTML =
                html ?? "";

        },

        clearElement(element) {

            this.setHtml(
                element,
                ""
            );

        },

        /* ==================================================
        QUICK ACCESS BUTTON
        ================================================== */

        createQuickAccessButton(item) {

            return `

                <a
                    href="${item.url}"
                    class="btn btn-secondary"
                    aria-label="${item.title}">

                    ${item.icon || ""}

                    ${item.title}

                </a>

            `;

        },

        /* ==================================================
        CREDENTIAL EMPTY STATE
        ================================================== */

        createCredentialEmptyState() {

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
        CREDENTIAL ASSET BUTTONS
        ================================================== */

        createAssetButtons(assets = {}) {

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

        createCredentialCard(credential) {

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

                            ${this.createAssetButtons(assets)}

                        </div>

                    </div>

                </article>

            `;

        },

        /* ==================================================
   RECOGNITION CARD
================================================== */

createRecognitionCard(recognition) {

    return `

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

    `;

},

        /* ==================================================
   NOTIFICATION CARD
================================================== */

createNotificationCard(notification) {

    return `

        <article class="dashboard-card">

            <div class="dashboard-card-body">

                ${notification.message || ""}

            </div>

        </article>

    `;

},

        /* ==================================================
        SIDEBAR SUMMARY
        ================================================== */

        renderProfile(
                        profile,
                        membership,
                        summary
                    ) {

            if (!summary) {
                return;
            }

            this.setText(

                this.getElement(
                    "sidebarUserName"
                ),

                profile?.name || "Student"

            );

            this.setText(

                this.getElement(
                    "sidebarMembership"
                ),

                membership || ""

            );

            this.setText(

                this.getElement(
                    "sidebarCredentialCount"
                ),

                summary.portfolio?.credentials || 0

            );

        },

        /* ==================================================
           KPI CARDS
        ================================================== */

        renderKpiCards(kpi) {

            if (!kpi) {
                return;
            }

            const credentials =
                this.getElement(
                    "kpiCredentials"
                );

            const certificates =
                this.getElement(
                    "kpiCertificates"
                );

            const trainerCertificates =
                this.getElement(
                    "kpiTrainerCertificates"
                );

            const badges =
                this.getElement(
                    "kpiBadges"
                );

            const recognitions =
                this.getElement(
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

                this.setText(

                    credentials,

                    kpi.credentials ?? 0

                );

            }

            if (certificates) {

                this.setText(

                    certificates,

                    kpi.certificates ?? 0

                );

            }

            /*
             * Reserved for future
             * Trainer Certificate Service.
             */

            if (

                trainerCertificates &&
                kpi.trainerCertificates !== undefined

            ) {

                this.setText(

                    trainerCertificates,

                    kpi.trainerCertificates

                );

            }

            if (badges) {

                this.setText(

                    badges,

                    kpi.badges ?? 0

                );

            }

            if (recognitions) {

                this.setText(

                    recognitions,

                    kpi.recognitions ?? 0

                );

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
                this.getElement(
                    "dashboardQuickAccess"
                );

            if (!container) {
                return;
            }

            this.setHtml(

                container,

                items
                    .map(item =>
                        this.createQuickAccessButton(item)
                    )
                    .join("")

            );

        },

        /* ==================================================
   UPGRADE CARD
================================================== */

renderUpgradeCard(upgrade) {

    const container =
        this.getElement(
            "dashboardUpgrade"
        );

    if (!container) {
        return;
    }

    if (!upgrade) {

        this.clearElement(
            container
        );

        return;

    }

    if (
        !window.UpgradeCard ||
        typeof window.UpgradeCard.render !== "function"
    ) {

        return;

    }

    this.setHtml(

        container,

        window.UpgradeCard.render(
            upgrade
        )

    );

},  

        /* ==================================================
   RECENT RECENT CREDENTIALS
================================================== */

renderRecentCredentials(credentials) {

    if (!Array.isArray(credentials)) {
        return;
    }

    const container =
        this.getElement(
            "recentCredentials"
        );

    if (!container) {
        return;
    }

    if (credentials.length === 0) {

        this.setHtml(

            container,

            this.createCredentialEmptyState()

        );

        return;

    }

        this.setHtml(

        container,

        credentials
            .map(

                credential =>

                    this.createCredentialCard(
                        credential
                    )

            )
            .join("")

    );

},
                /* ==================================================
           RECENT RECOGNITIONS
        ================================================== */

        renderRecentRecognitions(recognitions) {

            if (!Array.isArray(recognitions)) {
                return;
            }

            const container =
                this.getElement(
                    "recentRecognitions"
                );

            if (!container) {
                return;
            }

            if (recognitions.length === 0) {

                this.clearElement(container);

                return;

            }

            this.setHtml(

    container,

    recognitions
        .map(

            recognition =>

                this.createRecognitionCard(
                    recognition
                )

        )
        .join("")

);

        },

        /* ==================================================
           NOTIFICATIONS
        ================================================== */

        renderNotifications(notifications) {

            if (!Array.isArray(notifications)) {
                return;
            }

            const container =
                this.getElement(
                    "dashboardNotifications"
                );

            if (!container) {
                return;
            }

            if (notifications.length === 0) {

                this.clearElement(container);

                return;

            }

            this.setHtml(

    container,

    notifications
        .map(

            notification =>

                this.createNotificationCard(
                    notification
                )

        )
        .join("")

);

        }

    };

    Object.freeze(
        DashboardWidgets
    );

    window.DashboardWidgets =
        DashboardWidgets;

})(window, document);