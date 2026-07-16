/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : login.js
   Version   : 1.0.0
   Status    : ACTIVE

   Purpose
   ----------------------------------------------------------
   Login Page Controller

   Responsibilities

   ✓ Initialize Login Page
   ✓ Validate Email Input
   ✓ Wire Login Actions
   ✓ Delegate Authentication
   ✓ Handle Login UI State
   ✓ Redirect Authenticated Users

   Non Responsibilities

   ✗ Firebase Authentication
   ✗ Session Management
   ✗ Authorization
   ✗ Entitlement Resolution
   ✗ Firestore
   ✗ Business Logic

   Governance

   • Login Page Controller
   • UI Orchestration Only
   • Delegates Authentication
   • Enterprise Portal Standard

========================================================== */

(function (window, document) {

    "use strict";

    const LoginController = {

        initialize() {

            console.info(
                "[Login] Initializing Login Controller"
            );

            this.cacheElements();

            this.bindEvents();

            this.redirectIfAuthenticated();

        },

        cacheElements() {

            this.emailInput =
                document.getElementById(
                    "emailInput"
                );

            this.emailButton =
                document.getElementById(
                    "emailSignInButton"
                );

            this.googleButton =
                document.getElementById(
                    "googleSignInButton"
                );

            this.status =
                document.getElementById(
                    "loginStatus"
                );

        },

        bindEvents() {

            this.emailButton?.addEventListener(

                "click",

                () => this.signInWithEmail()

            );

            this.googleButton?.addEventListener(

                "click",

                () => this.signInWithGoogle()

            );

            this.emailInput?.addEventListener(

                "keydown",

                (event) => {

                    if (event.key === "Enter") {

                        event.preventDefault();

                        this.signInWithEmail();

                    }

                }

            );

        },

        redirectIfAuthenticated() {

            if (

                window.PortalAuth &&

                typeof window.PortalAuth.getCurrentUser === "function"

            ) {

                const user =
                    window.PortalAuth.getCurrentUser();

                if (user) {

                    window.location.replace(
                        "/index.html"
                    );

                }

            }

        },

        signInWithGoogle() {

            if (

                !window.PortalAuth ||

                typeof window.PortalAuth.signInWithGoogle !== "function"

            ) {

                this.showError(

                    "Authentication service unavailable."

                );

                return;

            }

            this.setBusy(true);

            Promise.resolve(

                window.PortalAuth.signInWithGoogle()

            )

            .catch(

                error => {

                    console.error(error);

                    this.showError(

                        error?.message ||

                        "Google sign-in failed."

                    );

                }

            )

            .finally(

                () => this.setBusy(false)

            );

        },

        signInWithEmail() {

            const email =
                this.emailInput?.value
                    ?.trim();

            if (!email) {

                this.showError(

                    "Please enter your email address."

                );

                return;

            }

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (

                !emailPattern.test(email)

            ) {

                this.showError(

                    "Please enter a valid email address."

                );

                return;

            }

            if (

                !window.PortalAuth ||

                typeof window.PortalAuth.sendEmailLink !== "function"

            ) {

                this.showError(

                    "Authentication service unavailable."

                );

                return;

            }

            this.setBusy(true);

            Promise.resolve(

                window.PortalAuth.sendEmailLink(

                    email

                )

            )

            .then(

                () => {

                    this.showMessage(

                        "A secure sign-in link has been sent to your email."

                    );

                }

            )

            .catch(

                error => {

                    console.error(error);

                    this.showError(

                        error?.message ||

                        "Unable to send sign-in link."

                    );

                }

            )

            .finally(

                () => this.setBusy(false)

            );

        },

        setBusy(isBusy) {

            if (this.emailButton) {

                this.emailButton.disabled =
                    isBusy;

            }

            if (this.googleButton) {

                this.googleButton.disabled =
                    isBusy;

            }

        },

        showMessage(message) {

            if (!this.status) {

                return;

            }

            this.status.textContent =
                message;

            this.status.className =
                "login-status success";

        },

        showError(message) {

            if (!this.status) {

                return;

            }

            this.status.textContent =
                message;

            this.status.className =
                "login-status error";

        }

    };

    Object.freeze(
        LoginController
    );

    document.addEventListener(

        "DOMContentLoaded",

        () => LoginController.initialize()

    );

    window.LoginController =
        LoginController;

})(window, document);