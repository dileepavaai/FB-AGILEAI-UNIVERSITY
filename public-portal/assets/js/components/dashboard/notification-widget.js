/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : notification-widget.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2D

   Purpose
   ----------------------------------------------------------
   Dashboard Notification Widget

   Renders the Notification section of the
   Student & Executive Dashboard.

   Responsibilities

   ✓ Render Notification Cards
   ✓ Render Empty Notification State
   ✓ Delegate Notification Card Rendering
   ✓ Populate Dashboard Notification Section

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ API Calls
   ✗ Dashboard Orchestration
   ✗ HTML Generation Outside Widget Scope

   Governance

   • Dashboard Notification Widget Authority
   • Presentation Layer
   • Stateless Renderer
   • Single Responsibility
   • Enterprise Portal Standard

   Dependencies

   • DashboardWidgets DOM Helpers
   • NotificationCard

   Notes

   DashboardWidgets owns all shared DOM helper
   methods including:

   • getElement()
   • setText()
   • setHtml()
   • clearElement()

   NotificationCard is the authoritative renderer
   for individual notification cards.

========================================================== */

(function (window) {

    "use strict";

    const NotificationWidget = {

        /* ==================================================
           NOTIFICATIONS
        ================================================== */

        render(
            notifications,
            dashboard
        ) {

            if (
                !dashboard ||
                !Array.isArray(notifications)
            ) {
                return;
            }

            const container =
                dashboard.getElement(
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

                dashboard.clearElement(
                    container
                );

                return;

            }

            dashboard.setHtml(

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
        NotificationWidget
    );

    window.NotificationWidget =
        NotificationWidget;

})(window);