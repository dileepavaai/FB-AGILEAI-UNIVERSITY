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

    /*
     * Quick Access Card Component
     * is the authoritative renderer.
     */

    if (

        !window.QuickAccessCard ||

        typeof window.QuickAccessCard.render !==
            "function"

    ) {

        return;

    }

    this.setHtml(

        container,

        items
            .map(function (item) {

                return window
                    .QuickAccessCard
                    .render(item);

            })
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
            RECENT CREDENTIALS
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

    if (

    !window.CredentialCard ||

    typeof window.CredentialCard.render !==
        "function" ||

    typeof window.CredentialCard.renderEmpty !==
        "function"

) {

    return;

}

    if (credentials.length === 0) {

        this.setHtml(

            container,

            window.CredentialCard.renderEmpty()

        );

        return;

    }

        this.setHtml(

        container,

        credentials
            .map(

                credential =>

                    window.CredentialCard.render(
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

    /*
     * Recognition Card Component
     * is the authoritative renderer.
     */

    if (

        !window.RecognitionCard ||

        typeof window.RecognitionCard.render !==
            "function"

    ) {

        return;

    }

    if (recognitions.length === 0) {

        this.clearElement(
            container
        );

        return;

    }

    this.setHtml(

        container,

        recognitions
            .map(function (recognition) {

                return window
                    .RecognitionCard
                    .render(
                        recognition
                    );

            })
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

    /*
     * Notification Card Component
     * is the authoritative renderer.
     */

    if (

        !window.NotificationCard ||

        typeof window.NotificationCard.render !==
            "function"

    ) {

        return;

    }

    if (notifications.length === 0) {

        this.clearElement(
            container
        );

        return;

    }

    this.setHtml(

        container,

        notifications
            .map(function (notification) {

                return window
                    .NotificationCard
                    .render(
                        notification
                    );

            })
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