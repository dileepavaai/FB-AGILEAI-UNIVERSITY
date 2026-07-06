/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-widget.js
   Version   : 2.1.0
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
   ✓ Delegate Credential Asset Actions

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

        handleClick: null,

        bindEvents(container) {

            if (!container) {
                return;
            }

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

                if (
                    !window.CredentialDetailActions
                ) {
                    console.warn(
                        "[CredentialWidget] CredentialDetailActions unavailable."
                    );

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

                    if (
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
                 * Resolve Credential for Asset Actions
                 */

                const credential =
                    window.CredentialService &&
                    typeof window.CredentialService.getCredentialById ===
                        "function"
                        ? window.CredentialService.getCredentialById(
                            credentialId
                        )
                        : null;

                if (!credential) {

                    console.warn(
                        "[CredentialWidget] Credential not found:",
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

                    if (
                        typeof window.CredentialDetailActions
                            .openUniversityCertificate === "function"
                    ) {

                        window.CredentialDetailActions
                            .openUniversityCertificate(
                                credential
                            );

                    }

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

                    if (
                        typeof window.CredentialDetailActions
                            .openTrainerCertificate === "function"
                    ) {

                        window.CredentialDetailActions
                            .openTrainerCertificate(
                                credential
                            );

                    }

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

                    if (
                        typeof window.CredentialDetailActions
                            .openDigitalBadge === "function"
                    ) {

                        window.CredentialDetailActions
                            .openDigitalBadge(
                                credential
                            );

                    }

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

                    if (
                        typeof window.CredentialDetailActions
                            .openRecognition === "function"
                    ) {

                        window.CredentialDetailActions
                            .openRecognition(
                                credential
                            );

                    }

                    return;

                }

            };

            container.addEventListener(
                "click",
                this.handleClick
            );

        },

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

                this.bindEvents(container);

                return;

            }

            dashboard.setHtml(
                container,
                credentials
                    .map(function (credential) {
                        return window.CredentialCard.render(
                            credential
                        );
                    })
                    .join("")
            );

            this.bindEvents(container);

        }

    };

    window.CredentialWidget =
        CredentialWidget;

})(window);