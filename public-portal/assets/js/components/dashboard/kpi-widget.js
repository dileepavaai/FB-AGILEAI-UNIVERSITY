/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : kpi-widget.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2D

   Purpose
   ----------------------------------------------------------
   Dashboard KPI Widget

   Renders the dashboard Key Performance Indicator (KPI)
   cards using the Dashboard ViewModel.

   Responsibilities

   ✓ Render Credential Count
   ✓ Render University Certificate Count
   ✓ Render Trainer Certificate Count
   ✓ Render Digital Badge Count
   ✓ Render Recognition Count

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ API Calls
   ✗ Dashboard Orchestration
   ✗ KPI Calculation

   Governance

   • Dashboard KPI Widget Authority
   • Presentation Layer
   • Stateless Renderer
   • Single Responsibility
   • Enterprise Portal Standard

   Dependencies

   • DashboardWidgets DOM Helpers

   Notes

   Dashboard Gating is the authoritative
   renderer for dashboard values.

   If KPI values have already been rendered
   by Dashboard Gating, this widget will not
   overwrite them.

========================================================== */

(function (window) {

    "use strict";

    const KPIWidget = {

        /* ==================================================
           KPI CARDS
        ================================================== */

        render(
            kpi,
            dashboard
        ) {

            if (
                !dashboard ||
                !kpi
            ) {
                return;
            }

            const credentials =
                dashboard.getElement(
                    "kpiCredentials"
                );

            const certificates =
                dashboard.getElement(
                    "kpiCertificates"
                );

            const trainerCertificates =
                dashboard.getElement(
                    "kpiTrainerCertificates"
                );

            const badges =
                dashboard.getElement(
                    "kpiBadges"
                );

            const recognitions =
                dashboard.getElement(
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

                dashboard.setText(

                    credentials,

                    kpi.credentials ?? 0

                );

            }

            if (certificates) {

                dashboard.setText(

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

                dashboard.setText(

                    trainerCertificates,

                    kpi.trainerCertificates

                );

            }

            if (badges) {

                dashboard.setText(

                    badges,

                    kpi.badges ?? 0

                );

            }

            if (recognitions) {

                dashboard.setText(

                    recognitions,

                    kpi.recognitions ?? 0

                );

            }

        }

    };

    Object.freeze(
        KPIWidget
    );

    window.KPIWidget =
        KPIWidget;

})(window);