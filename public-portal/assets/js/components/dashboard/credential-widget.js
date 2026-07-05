/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-widget.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Sprint 2D

   Purpose
   ----------------------------------------------------------
   Dashboard Credential Widget

   Responsibilities

   ✓ Render Recent Credentials
   ✓ Render Empty Credential State
   ✓ Delegate Credential Card Rendering
   ✓ Populate Dashboard Credential Section
   ✓ Delegate User Interactions

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ API Calls
   ✗ Dashboard Orchestration
   ✗ Credential Experience Rendering

========================================================== */

(function (window) {

    "use strict";

    const CredentialWidget = {

        /* ==================================================
           EVENT HANDLER
        ================================================== */

        handleClick: null,

        /* ==================================================
           EVENT BINDING
        ================================================== */

        bindEvents(
            dashboard,
            container
        ) {

            if (
                !dashboard ||
                !container
            ) {
                return;
            }

            /*
             * Prevent duplicate listeners when
             * the dashboard is re-rendered.
             */

            if (this.handleClick) {

                container.removeEventListener(
                    "click",
                    this.handleClick
                );

            }

            this.handleClick = function (event) {

                const action =
                    event.target.closest(
                        "a"
                    );

                if (!action) {
                    return;
                }

                const credentialId =
                    action.dataset.credentialId;

                if (!credentialId) {
                    return;
                }

                /*
                 * View Credential
                 */

                if (
                    action.classList.contains(
                        "js-view-credential"
                    )
                ) {

                    event.preventDefault();

                    /*
                     * TODO
                     * Delegate to
                     * CredentialExperience.open()
                     */

                    console.log(
                        "View Credential:",
                        credentialId
                    );

                    return;

                }

                /*
                 * University Certificate
                 */

                if (
                    action.classList.contains(
                        "js-open-university-certificate"
                    )
                ) {

                    event.preventDefault();

                    console.log(
                        "University Certificate:",
                        credentialId
                    );

                    return;

                }

                /*
                 * Trainer Certificate
                 */

                if (
                    action.classList.contains(
                        "js-open-trainer-certificate"
                    )
                ) {

                    event.preventDefault();

                    console.log(
                        "Trainer Certificate:",
                        credentialId
                    );

                    return;

                }

                /*
                 * Digital Badge
                 */

                if (
                    action.classList.contains(
                        "js-open-digital-badge"
                    )
                ) {

                    event.preventDefault();

                    console.log(
                        "Digital Badge:",
                        credentialId
                    );

                    return;

                }

                /*
                 * Recognition Asset
                 */

                if (
                    action.classList.contains(
                        "js-open-recognition"
                    )
                ) {

                    event.preventDefault();

                    console.log(
                        "Recognition Asset:",
                        credentialId
                    );

                }

            };

            container.addEventListener(
                "click",
                this.handleClick
            );

        },

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

            this.bindEvents(
                dashboard,
                container
            );

        }

    };

    Object.freeze(
        CredentialWidget
    );

    window.CredentialWidget =
        CredentialWidget;

})(window);