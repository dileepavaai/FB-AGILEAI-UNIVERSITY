/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-widget.js
   Version   : 2.0.0
   Status    : ACTIVE
   Phase     : Sprint 2E

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
            container
        ) {

            if (!container) {
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
                        "[data-credential-id]"
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

                    /************************************************
                     * Delegate to Credential Detail Actions
                     * (Experience Orchestration Layer)
                     ***********************************************/

                    if (

                        window.CredentialDetailActions &&

                        typeof window.CredentialDetailActions.open ===
                            "function"

                    ) {

                    window.CredentialDetailActions.open(
                            credentialId
                        );

                    }

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

                this.bindEvents(
                    container
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
                    container
                );

        }

    };

    window.CredentialWidget =
        CredentialWidget;

})(window);