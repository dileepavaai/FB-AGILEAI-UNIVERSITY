/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : toolbar.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Portal Identity Experience

   Purpose
   ----------------------------------------------------------
   Renders the shared Student & Executive Portal toolbar.

   Responsibilities
   ----------------------------------------------------------
   ✓ Page title
   ✓ Breadcrumb
   ✓ Search placeholder
   ✓ Notification placeholder
   ✓ Learner identity presentation
   ✓ Learner initials generation
   ✓ Identity fallback handling
   ✓ Identity update API

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Authentication decisions
   ✗ Authorization
   ✗ Entitlement resolution
   ✗ Firestore queries
   ✗ API calls
   ✗ Business logic
   ✗ Profile persistence

   Architectural Position
   ----------------------------------------------------------
   Authentication / Portal State
        ↓
   Resolved Learner Identity
        ↓
   Toolbar Presentation

   Governance
   ----------------------------------------------------------
   • Shared UI Component

   • Enterprise Dashboard Standard

   • Single Responsibility

   • Toolbar consumes available identity state only.

   • Toolbar must not determine portal access.

   • Toolbar must not query Firestore or external APIs.

   • Full learner name is preferred over generic role labels.

   • Initials are derived from the resolved learner name.

   • Role remains secondary supporting information.

   Identity Resolution Order
   ----------------------------------------------------------
   1. Explicit identity supplied through updateIdentity()
   2. Shared portal profile state
   3. Shared entitlement credential full name
   4. Firebase authenticated user display name
   5. Authenticated email prefix
   6. Student

   Change History
   ----------------------------------------------------------
   v1.1.0

   • Replaced hardcoded AA avatar
   • Replaced hardcoded Student primary label
   • Added learner full-name presentation
   • Added generated learner initials
   • Added role as secondary identity metadata
   • Added safe identity fallback resolution
   • Added public updateIdentity API
   • Added support for portal identity events
   • Preserved presentation-only architecture

   v1.0.0

   • Initial shared toolbar
   • Added page title and breadcrumb
   • Added search and notification placeholders
   • Added placeholder user control

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
        "Toolbar";

    const MODULE_VERSION =
        "1.1.0";


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
            ""

    };


    /* ======================================================
       PAGE TITLE
    ====================================================== */

    function getPageTitle() {

        const page =
            document.body?.dataset?.page ||
            "";

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


    /* ======================================================
       BREADCRUMB
    ====================================================== */

    function getBreadcrumb() {

        return `

            <span
                class="breadcrumb-home">

                Home

            </span>

            <span
                class="breadcrumb-separator"
                aria-hidden="true">

                /

            </span>

            <span
                class="breadcrumb-current"
                aria-current="page">

                ${escapeHtml(
                    getPageTitle()
                )}

            </span>

        `;

    }


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


    /* ======================================================
       EMAIL DISPLAY FALLBACK
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
            normalizedEmail.split("@")[0];

        return localPart
            .split(
                /[._+\-]+/
            )
            .filter(
                Boolean
            )
            .map(
                part =>
                    part.charAt(0).toUpperCase() +
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

                identity.membership_type

            ]);


        return {

            displayName,

            email,

            roleLabel,

            membershipLabel,

            initials:
                buildInitials(
                    displayName
                )

        };

    }


    /* ======================================================
       SHARED STATE RESOLUTION
    ====================================================== */

    function resolveSharedIdentity() {

        const portalState =
            window.__AAIU_PORTAL_STATE__ ||
            window.__AAIU_SHARED_PORTAL_STATE__ ||
            window.__AAIU_ENTITLEMENTS__ ||
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


        let firebaseUser =
            null;


        try {

            firebaseUser =
                window.firebase &&
                typeof window.firebase.auth ===
                    "function"

                    ? window.firebase.auth()
                        .currentUser

                    : null;

        } catch {

            firebaseUser =
                null;

        }


        return normalizeIdentity({

            displayName:
                firstValue([

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

                    profile.email,

                    firstCredential.email,

                    firebaseUser?.email

                ]),

            roleLabel:
                firstValue([

                    profile.roleLabel,

                    profile.role_label,

                    profile.role,

                    portalState.roleLabel,

                    portalState.role,

                    "Student"

                ]),

            membershipLabel:
                firstValue([

                    profile.membershipLabel,

                    profile.membership_label,

                    profile.membership,

                    portalState.membershipLabel,

                    portalState.membership

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
                "toolbarAvatar"
            );

        const userName =
            document.getElementById(
                "toolbarUserName"
            );

        const userRole =
            document.getElementById(
                "toolbarUserRole"
            );

        const userButton =
            document.getElementById(
                "toolbarUser"
            );


        if (avatar) {

            avatar.textContent =
                activeIdentity.initials;

            avatar.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        if (userName) {

            userName.textContent =
                activeIdentity.displayName;

            userName.title =
                activeIdentity.displayName;

        }


        if (userRole) {

            userRole.textContent =
                activeIdentity.roleLabel;

        }


        if (userButton) {

            userButton.setAttribute(

                "aria-label",

                `Signed in as ${activeIdentity.displayName}, ${activeIdentity.roleLabel}`

            );

            if (activeIdentity.email) {

                userButton.dataset.userEmail =
                    activeIdentity.email;

            }

        }

    }


    /* ======================================================
       TOOLBAR RENDERING
    ====================================================== */

    function renderToolbar() {

        const toolbar =
            document.getElementById(
                "portal-toolbar"
            );

        if (!toolbar) {

            return;

        }


        const identity =
            normalizeIdentity(
                activeIdentity
            );


        toolbar.innerHTML = `

            <div
                class="portal-toolbar-left">

                <div
                    class="portal-breadcrumb">

                    ${getBreadcrumb()}

                </div>

                <h1
                    class="portal-page-title">

                    ${escapeHtml(
                        getPageTitle()
                    )}

                </h1>

            </div>

            <div
                class="portal-toolbar-right">

                <div
                    class="portal-search">

                    <input
                        type="search"
                        placeholder="Search portal..."
                        aria-label="Search portal">

                </div>

                <button
                    class="toolbar-button"
                    id="notificationButton"
                    aria-label="Notifications"
                    type="button">

                    <span
                        aria-hidden="true">

                        🔔

                    </span>

                </button>

                <button
                    class="toolbar-user"
                    id="toolbarUser"
                    type="button"
                    aria-label="Signed in user">

                    <span
                        class="toolbar-avatar"
                        id="toolbarAvatar"
                        aria-hidden="true">

                        ${escapeHtml(
                            identity.initials
                        )}

                    </span>

                    <span
                        class="toolbar-user-copy">

                        <span
                            class="toolbar-name"
                            id="toolbarUserName"
                            title="${escapeHtml(
                                identity.displayName
                            )}">

                            ${escapeHtml(
                                identity.displayName
                            )}

                        </span>

                        <span
                            class="toolbar-role"
                            id="toolbarUserRole">

                            ${escapeHtml(
                                identity.roleLabel
                            )}

                        </span>

                    </span>

                    <span
                        class="toolbar-arrow"
                        aria-hidden="true">

                        ▼

                    </span>

                </button>

            </div>

        `;


        applyIdentity(
            resolveSharedIdentity()
        );

    }


    /* ======================================================
       PUBLIC UPDATE API
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

    }


    /* ======================================================
       INITIALIZATION
    ====================================================== */

    function initialize() {

        bindIdentityEvents();

        activeIdentity =
            resolveSharedIdentity();

        renderToolbar();

        console.info(
            `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
        );

    }


    /* ======================================================
       PUBLIC REGISTRATION
    ====================================================== */

    window.PortalToolbar =
        Object.freeze({

            render:
                renderToolbar,

            updateIdentity,

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