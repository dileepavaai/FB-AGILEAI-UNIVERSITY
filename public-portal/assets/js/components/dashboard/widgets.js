/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : widgets.js
   Version   : 3.0.0
   Status    : ACTIVE
   Phase     : Sprint 2D

   Purpose
   ----------------------------------------------------------
   Dashboard Widget Orchestrator

   Coordinates dashboard widget rendering and
   provides shared DOM helper functions used by
   all dashboard widgets.

   Responsibilities

   ✓ Coordinate Dashboard Widget Rendering
   ✓ Delegate Rendering to Dashboard Widgets
   ✓ Provide Shared DOM Helper Functions
   ✓ Dashboard Composition

   Non Responsibilities

   ✗ Widget Rendering
   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ API Calls
   ✗ HTML Generation

   Governance

   • Dashboard Widget Orchestration Authority
   • Dashboard Composition Layer
   • Shared DOM Helper Authority
   • Presentation Layer
   • Single Responsibility
   • Enterprise Portal Standard

   Dependencies

   • ProfileWidget
   • KPIWidget
   • QuickAccessWidget
   • UpgradeWidget
   • CredentialWidget
   • RecognitionWidget
   • NotificationWidget

   Notes

   DashboardWidgets is the composition root for
   the Student & Executive Dashboard.

   Individual dashboard sections are rendered by
   dedicated widget components.

   Shared DOM helper functions are centralized
   within this module to avoid duplication across
   widget implementations.

   Change History
    ----------------------------------------------------------

    v3.0.0

    • Introduced Dashboard Widget Orchestrator
    • Extracted Profile Widget
    • Extracted KPI Widget
    • Extracted Quick Access Widget
    • Extracted Upgrade Widget
    • Extracted Credential Widget
    • Extracted Recognition Widget
    • Extracted Notification Widget
    • Centralized Dashboard Composition
    • Retained Shared DOM Helper Authority

    v2.0.0

    • Dashboard Widget Renderer

========================================================== */

(function (window, document) {

    "use strict";

    const DashboardWidgets = {

        /* ==================================================
           ROOT RENDER
        ================================================== */

        render(data) {

            if (!data) {

                console.warn(
                    "[DashboardWidgets] No dashboard data supplied."
                );

                return;

            }

            console.info(
                "[DashboardWidgets] Rendering dashboard",
                data
            );

            window.ProfileWidget.render(
                data.profile,
                data.membership,
                data.summary,
                this
            );

            window.KPIWidget.render(
                data.kpi,
                this
            );

            window.QuickAccessWidget.render(
                data.quickAccess,
                this
            );

            window.UpgradeWidget.render(
                data.upgrade,
                this
            );

            window.CredentialWidget.render(
                data.recentCredentials,
                this
            );

            window.RecognitionWidget.render(
                data.recentRecognitions,
                this
            );

            window.NotificationWidget.render(
                data.notifications,
                this
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

        }

};

Object.freeze(
    DashboardWidgets
);

window.DashboardWidgets =
    DashboardWidgets;

})(window, document);