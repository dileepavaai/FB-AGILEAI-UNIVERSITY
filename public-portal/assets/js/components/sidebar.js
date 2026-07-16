/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : sidebar.js
   Version   : 1.2.0
   Status    : ACTIVE
   Phase     : Portal Identity Experience

   Purpose
   ----------------------------------------------------------
   Renders the shared Student & Executive Portal sidebar.

   Responsibilities
   ----------------------------------------------------------
   ✓ Render navigation
   ✓ Highlight active page
   ✓ Render university branding
   ✓ Render learner identity
   ✓ Generate learner avatar initials
   ✓ Render learner membership
   ✓ Render credential summary placeholder
   ✓ Consume shared portal identity state
   ✓ Support identity update events

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Authentication decisions
   ✗ Authorization
   ✗ Entitlement resolution
   ✗ Firestore queries
   ✗ API calls
   ✗ Business logic
   ✗ Membership decisions
   ✗ Credential counting
   ✗ Profile persistence

   Architectural Position
   ----------------------------------------------------------
   Authentication / Portal State
        ↓
   Resolved Learner Identity
        ↓
   Sidebar Presentation

   Governance
   ----------------------------------------------------------
   • Shared Navigation Component

   • Single Responsibility

   • UI Only

   • Enterprise Portal Standard

   • Sidebar consumes available identity state only.

   • Sidebar must not determine portal access.

   • Learner name is the primary profile label.

   • Membership is secondary supporting information.

   • Avatar must contain learner initials only.

   • Toolbar and sidebar should consume the same
     identity model wherever available.

   Identity Resolution Order
   ----------------------------------------------------------
   1. Explicit identity supplied through updateIdentity()
   2. PortalToolbar shared identity
   3. Shared portal profile state
   4. Resolver-approved credential full name
   5. Firebase authenticated user display name
   6. Authenticated email prefix
   7. Student

   Change History
   ----------------------------------------------------------
   v1.2.0

   • Replaced hardcoded Student avatar
   • Replaced hardcoded Student profile name
   • Added learner full-name presentation
   • Added generated learner initials
   • Added shared toolbar identity compatibility
   • Added identity fallback resolution
   • Added public updateIdentity API
   • Added portal identity event support
   • Added safe dynamic HTML rendering
   • Preserved existing navigation architecture
   • Preserved credential summary integration

   v1.1.0

   • Updated university branding
   • Corrected emblem asset
   • Added lazy image loading
   • Prepared sidebar for executive dashboard

   v1.0.0

   • Initial shared sidebar
   • Added navigation
   • Added active-page highlighting
   • Added profile and credential summary placeholders

========================================================== */

(function (
    window,
    document
) {

    "use strict";


    /* ======================================================
       MODULE IDENTITY
    ====================================================== */

    const MODULE_NAME =
        "Sidebar";

    const MODULE_VERSION =
        "1.2.0";


    /* ======================================================
       NAVIGATION
    ====================================================== */

    const NAVIGATION = [

        {
            id:
                "dashboard",

            title:
                "Dashboard",

            icon:
                "🏠",

            url:
                "/index.html"
        },

        {
            id:
                "credentials",

            title:
                "My Credentials",

            icon:
                "🎓",

            url:
                "/credentials/my-credentials.html"
        },

        {
            id:
                "recognition",

            title:
                "Recognition Assets",

            icon:
                "🏅",

            url:
                "/recognition/"
        },

        {
            id:
                "certificates",

            title:
                "Certificates",

            icon:
                "📄",

            url:
                "/certificates/"
        },

        {
            id:
                "badges",

            title:
                "Digital Badges",

            icon:
                "🛡️",

            url:
                "/badges/"
        },

        {
            id:
                "verification",

            title:
                "Verification",

            icon:
                "✔️",

            url:
                "/verification/"
        },

        {
            id:
                "assessment",

            title:
                "Assessment Platform",

            icon:
                "📝",

            url:
                "/assessment.html"
        },

        {
            id:
                "learning",

            title:
                "Learning Journey",

            icon:
                "📈",

            url:
                "#"
        },

        {
            id:
                "executive",

            title:
                "Executive Insights",

            icon:
                "📊",

            url:
                "#"
        },

        {
            id:
                "settings",

            title:
                "Settings",

            icon:
                "⚙️",

            url:
                "#"
        }

    ];


    /* ======================================================
       STATE
    ====================================================== */

    let activeIdentity = {

        displayName:
            "Student",

        email:
            "",

        roleLabel:
            "Student",

        membershipLabel:
            "University Member",

        initials:
            "ST"

    };


    /* ======================================================
       VALUE HELPERS
    ====================================================== */

    function firstValue(
        values
    ) {

        if (!Array.isArray(values)) {

            return "";

        }

        for (
            const value of values
        ) {

            if (
                value === null ||
                value === undefined
            ) {

                continue;

            }

            const normalized =
                String(
                    value
                ).trim();

            if (normalized) {

                return normalized;

            }

        }

        return "";

    }


    function escapeHtml(
        value
    ) {

        return String(
            value === null ||
            value === undefined

                ? ""

                : value
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    function escapeAttribute(
        value
    ) {

        return escapeHtml(
            value
        );

    }


    /* ======================================================
       EMAIL FALLBACK
    ====================================================== */

    function buildNameFromEmail(
        email
    ) {

        const normalizedEmail =
            String(
                email || ""
            )
                .trim()
                .toLowerCase();

        if (
            !normalizedEmail ||
            !normalizedEmail.includes("@")
        ) {

            return "";

        }

        const localPart =
            normalizedEmail
                .split("@")[0];

        return localPart
            .split(
                /[._+\-]+/
            )
            .filter(
                Boolean
            )
            .map(
                part =>
                    part.charAt(0)
                        .toUpperCase() +
                    part.slice(1)
            )
            .join(
                " "
            );

    }


    /* ======================================================
       INITIALS
    ====================================================== */

    function buildInitials(
        displayName
    ) {

        const normalizedName =
            String(
                displayName || ""
            )
                .trim()
                .replace(
                    /\s+/g,
                    " "
                );

        if (!normalizedName) {

            return "ST";

        }

        const words =
            normalizedName
                .split(" ")
                .filter(
                    Boolean
                );

        if (words.length === 1) {

            return words[0]
                .slice(
                    0,
                    2
                )
                .toUpperCase();

        }

        return (
            words[0].charAt(0) +
            words[words.length - 1].charAt(0)
        ).toUpperCase();

    }


    /* ======================================================
       IDENTITY NORMALIZATION
    ====================================================== */

    function normalizeIdentity(
        identity = {}
    ) {

        const email =
            firstValue([

                identity.email,

                identity.userEmail,

                identity.user_email

            ]);


        const displayName =
            firstValue([

                identity.displayName,

                identity.display_name,

                identity.fullName,

                identity.full_name,

                identity.name,

                buildNameFromEmail(
                    email
                ),

                "Student"

            ]);


        const roleLabel =
            firstValue([

                identity.roleLabel,

                identity.role_label,

                identity.role,

                identity.userRole,

                identity.user_role,

                "Student"

            ]);


        const membershipLabel =
            firstValue([

                identity.membershipLabel,

                identity.membership_label,

                identity.membership,

                identity.membershipType,

                identity.membership_type,

                "University Member"

            ]);


        const initials =
            firstValue([

                identity.initials,

                buildInitials(
                    displayName
                )

            ]);


        return {

            displayName,

            email,

            roleLabel,

            membershipLabel,

            initials

        };

    }


    /* ======================================================
       CURRENT PATH
    ====================================================== */

    function getCurrentPath() {

        return String(
            window.location.pathname ||
            ""
        )
            .toLowerCase();

    }


    /* ======================================================
       ACTIVE NAVIGATION
    ====================================================== */

    function isActive(
        item
    ) {

        if (
            !item ||
            item.url === "#"
        ) {

            return false;

        }

        const currentPath =
            getCurrentPath();

        const itemPath =
            String(
                item.url
            )
                .toLowerCase();


        if (
            item.id === "dashboard"
        ) {

            return (

                currentPath === "/" ||
                currentPath === "/index.html" ||
                currentPath.endsWith(
                    "/index.html"
                )

            );

        }


        if (
            itemPath.endsWith("/")
        ) {

            return currentPath.startsWith(
                itemPath
            );

        }


        return currentPath.endsWith(
            itemPath
        );

    }


    /* ======================================================
       NAVIGATION RENDERING
    ====================================================== */

    function buildNavigation() {

        return NAVIGATION
            .map(
                item => {

                    const active =
                        isActive(
                            item
                        );

                    const unavailable =
                        item.url === "#";


                    return `

                        <a
                            href="${escapeAttribute(
                                item.url
                            )}"
                            class="portal-nav-item${active
                                ? " active"
                                : ""
                            }${unavailable
                                ? " portal-nav-item--unavailable"
                                : ""
                            }"
                            data-navigation-id="${escapeAttribute(
                                item.id
                            )}"
                            ${active
                                ? 'aria-current="page"'
                                : ""
                            }
                            ${unavailable
                                ? 'aria-disabled="true"'
                                : ""
                            }>

                            <span
                                class="portal-nav-icon"
                                aria-hidden="true">

                                ${escapeHtml(
                                    item.icon
                                )}

                            </span>

                            <span
                                class="portal-nav-title">

                                ${escapeHtml(
                                    item.title
                                )}

                            </span>

                        </a>

                    `;

                }
            )
            .join(
                ""
            );

    }


    /* ======================================================
       SHARED TOOLBAR IDENTITY
    ====================================================== */

    function resolveToolbarIdentity() {

        try {

            if (
                window.PortalToolbar &&
                typeof window.PortalToolbar
                    .getIdentity ===
                    "function"
            ) {

                return window.PortalToolbar
                    .getIdentity() ||
                    {};

            }

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to read PortalToolbar identity.`,
                error
            );

        }

        return {};

    }


    /* ======================================================
       FIREBASE USER
    ====================================================== */

    function resolveFirebaseUser() {

        try {

            if (
                window.firebase &&
                typeof window.firebase.auth ===
                    "function"
            ) {

                return window.firebase
                    .auth()
                    .currentUser;

            }

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to read Firebase user.`,
                error
            );

        }

        return null;

    }


    /* ======================================================
       SHARED IDENTITY RESOLUTION
    ====================================================== */

    function resolveSharedIdentity() {

        const toolbarIdentity =
            resolveToolbarIdentity();


        const portalState =
            window.__AAIU_PORTAL_STATE__ ||
            window.__AAIU_SHARED_PORTAL_STATE__ ||
            window.__AAIU_ENTITLEMENTS__ ||
            window.__PORTAL_ENTITLEMENTS__ ||
            {};


        const profile =
            portalState.profile ||
            portalState.userProfile ||
            portalState.user_profile ||
            portalState.user ||
            {};


        const credentials =
            Array.isArray(
                portalState.credentials
            )

                ? portalState.credentials

                : [];


        const firstCredential =
            credentials[0] ||
            {};


        const firebaseUser =
            resolveFirebaseUser();


        return normalizeIdentity({

            displayName:
                firstValue([

                    toolbarIdentity.displayName,

                    toolbarIdentity.display_name,

                    profile.displayName,

                    profile.display_name,

                    profile.fullName,

                    profile.full_name,

                    firstCredential.full_name,

                    firstCredential.fullName,

                    firebaseUser?.displayName

                ]),

            email:
                firstValue([

                    toolbarIdentity.email,

                    profile.email,

                    firstCredential.email,

                    firebaseUser?.email

                ]),

            roleLabel:
                firstValue([

                    toolbarIdentity.roleLabel,

                    toolbarIdentity.role_label,

                    profile.roleLabel,

                    profile.role_label,

                    profile.role,

                    portalState.roleLabel,

                    portalState.role,

                    "Student"

                ]),

            membershipLabel:
                firstValue([

                    toolbarIdentity.membershipLabel,

                    toolbarIdentity.membership_label,

                    profile.membershipLabel,

                    profile.membership_label,

                    profile.membership,

                    portalState.membershipLabel,

                    portalState.membership,

                    "University Member"

                ])

        });

    }


    /* ======================================================
       APPLY IDENTITY
    ====================================================== */

    function applyIdentity(
        identity
    ) {

        activeIdentity =
            normalizeIdentity(
                identity
            );


        const avatar =
            document.getElementById(
                "sidebarAvatar"
            );

        const userName =
            document.getElementById(
                "sidebarUserName"
            );

        const membership =
            document.getElementById(
                "sidebarMembership"
            );

        const profile =
            document.querySelector(
                ".portal-sidebar-profile"
            );


        if (avatar) {

            avatar.textContent =
                activeIdentity.initials;

            avatar.title =
                activeIdentity.displayName;

        }


        if (userName) {

            userName.textContent =
                activeIdentity.displayName;

            userName.title =
                activeIdentity.displayName;

        }


        if (membership) {

            membership.textContent =
                activeIdentity.membershipLabel;

            membership.title =
                activeIdentity.membershipLabel;

        }


        if (profile) {

            profile.setAttribute(

                "aria-label",

                `${activeIdentity.displayName}, ${activeIdentity.membershipLabel}`

            );

            if (
                activeIdentity.email
            ) {

                profile.dataset.userEmail =
                    activeIdentity.email;

            }

        }

    }


    /* ======================================================
       SIDEBAR RENDERING
    ====================================================== */

    function renderSidebar() {

        const container =
            document.getElementById(
                "portal-sidebar"
            );

        if (!container) {

            return;

        }


        const identity =
            normalizeIdentity(
                activeIdentity
            );


        container.innerHTML = `

            <div
                class="portal-sidebar-inner">

                <div
                    class="portal-sidebar-brand">

                    <img
                        src="/assets/images/aau-emblem.png"
                        alt="Agile AI University"
                        class="portal-sidebar-logo"
                        loading="lazy">

                    <div
                        class="portal-sidebar-brand-copy">

                        <div
                            class="portal-sidebar-title">

                            Agile AI University

                        </div>

                        <div
                            class="portal-sidebar-subtitle">

                            Student &amp; Executive Portal

                        </div>

                    </div>

                </div>

                <nav
                    class="portal-navigation"
                    aria-label="Portal navigation">

                    ${buildNavigation()}

                </nav>

                <div
                    class="portal-sidebar-profile"
                    aria-label="${escapeAttribute(
                        `${identity.displayName}, ${identity.membershipLabel}`
                    )}">

                    <div
                        class="profile-avatar"
                        id="sidebarAvatar"
                        title="${escapeAttribute(
                            identity.displayName
                        )}"
                        aria-hidden="true">

                        ${escapeHtml(
                            identity.initials
                        )}

                    </div>

                    <div
                        class="sidebar-profile-copy">

                        <div
                            id="sidebarUserName"
                            title="${escapeAttribute(
                                identity.displayName
                            )}">

                            ${escapeHtml(
                                identity.displayName
                            )}

                        </div>

                        <div
                            id="sidebarMembership"
                            title="${escapeAttribute(
                                identity.membershipLabel
                            )}">

                            ${escapeHtml(
                                identity.membershipLabel
                            )}

                        </div>

                    </div>

                </div>

                <div
                    class="portal-sidebar-summary">

                    <div
                        class="summary-title">

                        Credential Portfolio

                    </div>

                    <div
                        id="sidebarCredentialCount"
                        class="summary-count">

                        —

                    </div>

                    <div
                        class="summary-subtitle">

                        Lifetime Credentials

                    </div>

                </div>

            </div>

        `;


        applyIdentity(
            resolveSharedIdentity()
        );


        bindUnavailableNavigation(
            container
        );

    }


    /* ======================================================
       UNAVAILABLE NAVIGATION

       Placeholder links remain visible but must not move
       the user to the top of the current page.
    ====================================================== */

    function bindUnavailableNavigation(
        container
    ) {

        const unavailableItems =
            container.querySelectorAll(
                '.portal-nav-item[aria-disabled="true"]'
            );


        unavailableItems.forEach(

            item => {

                item.addEventListener(

                    "click",

                    function (
                        event
                    ) {

                        event.preventDefault();

                    }

                );

            }

        );

    }


    /* ======================================================
       PUBLIC IDENTITY UPDATE
    ====================================================== */

    function updateIdentity(
        identity
    ) {

        applyIdentity(
            identity
        );

        console.info(
            `[${MODULE_NAME}] Learner identity updated.`,
            activeIdentity
        );

    }


    /* ======================================================
       CREDENTIAL COUNT UPDATE
    ====================================================== */

    function updateCredentialCount(
        count
    ) {

        const countElement =
            document.getElementById(
                "sidebarCredentialCount"
            );

        if (!countElement) {

            return;

        }


        const normalizedCount =
            Number(
                count
            );


        countElement.textContent =
            Number.isFinite(
                normalizedCount
            ) &&
            normalizedCount >= 0

                ? String(
                    normalizedCount
                )

                : "—";

    }


    /* ======================================================
       IDENTITY EVENTS
    ====================================================== */

    function bindIdentityEvents() {

        document.addEventListener(

            "portal:identity-ready",

            function (
                event
            ) {

                updateIdentity(
                    event?.detail ||
                    {}
                );

            }

        );


        document.addEventListener(

            "profile:ready",

            function (
                event
            ) {

                updateIdentity(
                    event?.detail ||
                    {}
                );

            }

        );


        document.addEventListener(

            "entitlements:ready",

            function () {

                applyIdentity(
                    resolveSharedIdentity()
                );

            }

        );


        document.addEventListener(

            "credentials:resolved",

            function (
                event
            ) {

                const credentials =
                    event?.detail?.credentials;

                if (
                    Array.isArray(
                        credentials
                    )
                ) {

                    updateCredentialCount(
                        credentials.length
                    );

                }

            }

        );

    }


    /* ======================================================
       INITIALIZATION
    ====================================================== */

    function initialize() {

        bindIdentityEvents();

        activeIdentity =
            resolveSharedIdentity();

        renderSidebar();

        console.info(
            `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
        );

    }


    /* ======================================================
       PUBLIC REGISTRATION
    ====================================================== */

    window.PortalSidebar =
        Object.freeze({

            render:
                renderSidebar,

            updateIdentity,

            updateCredentialCount,

            getIdentity() {

                return Object.freeze({
                    ...activeIdentity
                });

            }

        });


    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );


})(window, document);