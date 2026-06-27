/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : sidebar.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Sprint 2A

   Purpose
   ----------------------------------------------------------
   Renders the shared Student & Executive Portal sidebar.

   Changes
   --------------------------------------------------

    • Updated university branding
    • Corrected emblem asset
    • Added lazy image loading
    • Prepared sidebar for executive dashboard

   Responsibilities

   ✓ Render navigation
   ✓ Highlight active page
   ✓ Render profile summary placeholder
   ✓ Render credential summary placeholder

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement Resolution
   ✗ API Calls
   ✗ Business Logic

   Governance

   • Shared Navigation Component
   • Single Responsibility
   • UI Only
   • Enterprise Portal Standard

========================================================== */

(function () {

    "use strict";

    const NAVIGATION = [

        {
            id: "dashboard",
            title: "Dashboard",
            icon: "🏠",
            url: "/index.html"
        },

        {
            id: "credentials",
            title: "My Credentials",
            icon: "🎓",
            url: "/credentials/my-credentials.html"
        },

        {
            id: "recognition",
            title: "Recognition Assets",
            icon: "🏅",
            url: "/recognition/"
        },

        {
            id: "certificates",
            title: "Certificates",
            icon: "📄",
            url: "/certificates/"
        },

        {
            id: "badges",
            title: "Digital Badges",
            icon: "🛡️",
            url: "/badges/"
        },

        {
            id: "verification",
            title: "Verification",
            icon: "✔️",
            url: "/verification/"
        },

        {
            id: "assessment",
            title: "Assessment Platform",
            icon: "📝",
            url: "/assessment.html"
        },

        {
            id: "learning",
            title: "Learning Journey",
            icon: "📈",
            url: "#"
        },

        {
            id: "executive",
            title: "Executive Insights",
            icon: "📊",
            url: "#"
        },

        {
            id: "settings",
            title: "Settings",
            icon: "⚙️",
            url: "#"
        }

    ];

    function getCurrentPath() {

        return window.location.pathname.toLowerCase();

    }

    function isActive(item) {

        const path = getCurrentPath();

        if (item.url === "#") {
            return false;
        }

        return path.endsWith(item.url.toLowerCase());

    }

    function buildNavigation() {

        return NAVIGATION.map(item => `

            <a
                href="${item.url}"
                class="portal-nav-item ${isActive(item) ? "active" : ""}"
            >

                <span class="portal-nav-icon">

                    ${item.icon}

                </span>

                <span class="portal-nav-title">

                    ${item.title}

                </span>

            </a>

        `).join("");

    }

    function renderSidebar() {

        const container =
            document.getElementById("portal-sidebar");

        if (!container) {
            return;
        }

        container.innerHTML = `

            <div class="portal-sidebar-inner">

                <div class="portal-sidebar-brand">

                    <img
                        src="/assets/images/aau-emblem.png"
                        alt="Agile AI University"
                        class="portal-sidebar-logo"
                        loading="lazy"
                    >

                    <div>

                        <div class="portal-sidebar-title">

                            Agile AI University

                        </div>

                        <div class="portal-sidebar-subtitle">

                            Student & Executive Portal

                        </div>

                    </div>

                </div>

                <nav class="portal-navigation">

                    ${buildNavigation()}

                </nav>

                <div class="portal-sidebar-profile">

                    <div class="profile-avatar">

                        Student

                    </div>

                    <div>

                        <div id="sidebarUserName">

                            Student

                        </div>

                        <div id="sidebarMembership">

                            University Member

                        </div>

                    </div>

                </div>

                <div class="portal-sidebar-summary">

                    <div class="summary-title">

                        Credential Portfolio

                    </div>

                    <div
                        id="sidebarCredentialCount"
                        class="summary-count"
                    >

                        —

                    </div>

                    <div class="summary-subtitle">

                        Lifetime Credentials

                    </div>

                </div>

            </div>

        `;

    }

    document.addEventListener(
        "DOMContentLoaded",
        renderSidebar
    );

})();