/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-widget.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2D

   Purpose
   ----------------------------------------------------------
   Dashboard Credential Widget

   Renders the Recent Credentials section of the
   Student & Executive Dashboard.

   Responsibilities

   ✓ Render Recent Credentials
   ✓ Render Empty Credential State
   ✓ Delegate Credential Card Rendering
   ✓ Populate Dashboard Credential Section

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ API Calls
   ✗ Dashboard Orchestration
   ✗ HTML Generation Outside Widget Scope

   Governance

   • Dashboard Credential Widget Authority
   • Presentation Layer
   • Stateless Renderer
   • Single Responsibility
   • Enterprise Portal Standard

   Dependencies

   • DashboardWidgets DOM Helpers
   • CredentialCard

   Notes

   DashboardWidgets owns all shared DOM helper
   methods including:

   • getElement()
   • setText()
   • setHtml()
   • clearElement()

   CredentialCard is the authoritative renderer
   for individual credential cards.

========================================================== */

(function (window) {

    "use strict";

    const CredentialWidget = {

        /* ==================================================
           RECENT CREDENTIALS
        ================================================== */

        render(
            credentials,
            dashboard
        ) {

            if (
                !dashboard ||
                !Array.isArray(credentials)
            ) {
                return;
            }

            const container =
                dashboard.getElement(
                    "recentCredentials"
                );

            if (!container) {
                return;
            }

            /*
             * Credential Card Component
             * is the authoritative renderer.
             */

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

                dashboard.setHtml(

                    container,

                    window.CredentialCard.renderEmpty()

                );

                return;

            }

            dashboard.setHtml(

                container,

                credentials

                    .map(function (credential) {

                        return window
                            .CredentialCard
                            .render(
                                credential
                            );

                    })

                    .join("")

            );

        }

    };

    Object.freeze(
        CredentialWidget
    );

    window.CredentialWidget =
        CredentialWidget;

})(window);