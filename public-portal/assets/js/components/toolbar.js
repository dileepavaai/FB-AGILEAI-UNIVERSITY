/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : toolbar.js
   Version   : 1.0.0
   Status    : ACTIVE

   Purpose
   ----------------------------------------------------------
   Renders the shared Executive Portal toolbar.

   Responsibilities

   ✓ Page title
   ✓ Breadcrumb
   ✓ Search placeholder
   ✓ Notification placeholder
   ✓ User menu placeholder

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Entitlements
   ✗ API Calls
   ✗ Business Logic

   Governance

   • Shared UI Component
   • Enterprise Dashboard Standard
   • Single Responsibility

========================================================== */

(function () {

    "use strict";

    function getPageTitle() {

        const page = document.body.dataset.page;

        switch (page) {

            case "dashboard":
                return "Dashboard";

            case "credentials":
                return "My Credentials";

            case "recognition":
                return "Recognition Assets";

            case "verification":
                return "Credential Verification";

            case "assessment":
                return "Assessment Platform";

            case "profile":
                return "My Profile";

            case "settings":
                return "Settings";

            default:
                return "Student & Executive Portal";
        }

    }

    function getBreadcrumb() {

        return `
            <span class="breadcrumb-home">
                Home
            </span>

            <span class="breadcrumb-separator">
                /
            </span>

            <span class="breadcrumb-current">
                ${getPageTitle()}
            </span>
        `;

    }

    function renderToolbar() {

        const toolbar =
            document.getElementById("portal-toolbar");

        if (!toolbar) {
            return;
        }

        toolbar.innerHTML = `

            <div class="portal-toolbar-left">

                <div class="portal-breadcrumb">

                    ${getBreadcrumb()}

                </div>

                <h1 class="portal-page-title">

                    ${getPageTitle()}

                </h1>

            </div>

            <div class="portal-toolbar-right">

                <div class="portal-search">

                    <input
                        type="search"
                        placeholder="Search portal..."
                        aria-label="Search"
                    >

                </div>

                <button
                    class="toolbar-button"
                    id="notificationButton"
                    aria-label="Notifications"
                    type="button"
                >

                    🔔

                </button>

                <button
                    class="toolbar-user"
                    id="toolbarUser"
                    type="button"
                >

                    <span
                        class="toolbar-avatar"
                        id="toolbarAvatar"
                    >
                        AA
                    </span>

                    <span
                        class="toolbar-name"
                        id="toolbarUserName"
                    >
                        Student
                    </span>

                    <span
                        class="toolbar-arrow"
                    >
                        ▼
                    </span>

                </button>

            </div>

        `;

    }

    document.addEventListener(
        "DOMContentLoaded",
        renderToolbar
    );

})();