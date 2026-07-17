/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : footer.js
   Version   : 2.0.0
   Status    : ACTIVE
   Date      : July 2026

   Purpose
   ----------------------------------------------------------
   Authenticated Portal Institutional Footer

   Responsibilities

   ✓ Render institutional identity
   ✓ Render verified institutional destinations
   ✓ Render governance destinations
   ✓ Render learner support contact
   ✓ Render copyright information
   ✓ Open external destinations safely
   ✓ Remain idempotent

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement Resolution
   ✗ Business Rules
   ✗ Firestore
   ✗ Navigation Decisions
   ✗ Inline Styling

   Governance

   • Portal Footer Presentation Authority
   • Static Institutional Content
   • No Learner Identity
   • No Session Information
   • No Business Decisions
   • Enterprise Portal Standard

   Change History
   ----------------------------------------------------------

   v2.0.0

   • Introduced authenticated portal footer
   • Replaced portal-relative governance links
     with absolute institutional destinations
   • Added learner support contact
   • Added safe external-link attributes
   • Removed inline presentation styles
   • Added idempotent rendering lifecycle
   • Added accessible footer navigation labels

========================================================== */

(function (window, document) {

    "use strict";

    const PortalFooter = {

        /* ==================================================
           CONFIGURATION
        ================================================== */

        version: "2.0.0",

        mountId: "site-footer",


        /* ==================================================
           INITIALIZATION
        ================================================== */

        init() {

            const mount =
                document.getElementById(
                    this.mountId
                );

            if (!mount) {

                return false;

            }

            /*
             * Prevent duplicate footer rendering if the
             * component is initialized more than once.
             */

            if (
                mount.dataset &&
                mount.dataset.footerInitialized === "true"
            ) {

                return true;

            }

            this.render(
                mount
            );

            if (mount.dataset) {

                mount.dataset.footerInitialized =
                    "true";

                mount.dataset.footerVersion =
                    this.version;

            }

            this.dispatchReadyEvent();

            return true;

        },


        /* ==================================================
           RENDER
        ================================================== */

        render(mount) {

            if (!mount) {

                return;

            }

            const year =
                new Date().getFullYear();

            mount.innerHTML = `
                <footer
                    class="portal-footer"
                    role="contentinfo"
                    aria-label="Agile AI University portal footer">

                    <div class="portal-footer__container">

                        <section
                            class="portal-footer__identity"
                            aria-label="Institutional information">

                            <p class="portal-footer__institution">

                                <strong>
                                    Agile AI University
                                </strong>

                            </p>

                            <p class="portal-footer__description">

                                Student &amp; Executive Portal for
                                credentials, licensed learning resources,
                                assessments and institutional services.

                            </p>

                        </section>

                        <nav
                            class="portal-footer__navigation"
                            aria-label="Institutional links">

                            <a
                                href="https://agileai.university/"
                                target="_blank"
                                rel="noopener noreferrer">

                                Official Website

                            </a>

                            <a
                                href="https://verify.agileai.university/"
                                target="_blank"
                                rel="noopener noreferrer">

                                Credential Verification

                            </a>

                            <a href="mailto:support@agileai.university">

                                Support

                            </a>

                        </nav>

                        <nav
                            class="portal-footer__governance"
                            aria-label="Governance and legal links">

                            <a
                                href="https://agileai.university/governance/terms-and-conditions.html"
                                target="_blank"
                                rel="noopener noreferrer">

                                Terms &amp; Conditions

                            </a>

                            <a
                                href="https://agileai.university/governance/privacy-policy.html"
                                target="_blank"
                                rel="noopener noreferrer">

                                Privacy Policy

                            </a>

                            <a
                                href="https://agileai.university/governance/refund-policy.html"
                                target="_blank"
                                rel="noopener noreferrer">

                                Refund Policy

                            </a>

                        </nav>

                        <div class="portal-footer__assurance">

                            <p>

                                Secure authenticated access governed by
                                Agile AI University identity and
                                entitlement controls.

                            </p>

                        </div>

                        <div class="portal-footer__copyright">

                            <p>

                                &copy; ${year} Agile AI University.
                                All rights reserved.

                            </p>

                        </div>

                    </div>

                </footer>
            `;

        },


        /* ==================================================
           GOVERNANCE EVENT
        ================================================== */

        dispatchReadyEvent() {

            if (
                typeof window.dispatchEvent !== "function" ||
                typeof window.CustomEvent !== "function"
            ) {

                return;

            }

            window.dispatchEvent(
                new window.CustomEvent(
                    "aaiu:portal-footer-ready",
                    {
                        detail: {
                            version: this.version
                        }
                    }
                )
            );

        }

    };

    Object.freeze(
        PortalFooter
    );

    window.PortalFooter =
        PortalFooter;


    /* ======================================================
       BOOTSTRAP
    ====================================================== */

    function initializeFooter() {

        PortalFooter.init();

    }

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeFooter,
            {
                once: true
            }
        );

    }
    else {

        initializeFooter();

    }

})(window, document);