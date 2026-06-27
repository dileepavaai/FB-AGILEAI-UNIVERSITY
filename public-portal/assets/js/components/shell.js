/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : shell.js
   Version   : 1.0.0
   Status    : ACTIVE

   Purpose
   ----------------------------------------------------------
   Builds the shared Executive Portal layout.

   Responsibilities

   ✓ Creates portal shell
   ✓ Creates sidebar placeholder
   ✓ Creates toolbar placeholder
   ✓ Creates main content wrapper

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Entitlements
   ✗ Navigation Logic
   ✗ Business Logic

   Governance

   Single Responsibility Principle

========================================================== */

(function () {

    "use strict";

    /**
     * Builds the Executive Portal Shell
     */
    function initializePortalShell() {

        const portalMain = document.querySelector(".portal-home");

        if (!portalMain) {
            return;
        }

        /* Avoid duplicate initialization */

        if (portalMain.parentElement.classList.contains("portal-shell")) {
            return;
        }

        /*
        ------------------------------------------------------
        Portal Shell

        portal-shell
        ├── sidebar
        └── content
                ├── toolbar
                └── page
        ------------------------------------------------------
        */

        const shell = document.createElement("div");
        shell.className = "portal-shell";

        const sidebar = document.createElement("aside");
        sidebar.id = "portal-sidebar";
        sidebar.className = "portal-sidebar";

        const content = document.createElement("section");
        content.className = "portal-content-shell";

        const toolbar = document.createElement("div");
        toolbar.id = "portal-toolbar";
        toolbar.className = "portal-toolbar";

        /* Move existing page */

        portalMain.parentNode.insertBefore(shell, portalMain);

        shell.appendChild(sidebar);
        shell.appendChild(content);

        content.appendChild(toolbar);
        content.appendChild(portalMain);

    }

    /*
    ----------------------------------------------------------
    DOM Ready
    ----------------------------------------------------------
    */

    document.addEventListener(
        "DOMContentLoaded",
        initializePortalShell
    );

})();