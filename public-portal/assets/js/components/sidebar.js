/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : sidebar.js
   Version   : 1.6.2
   Status    : ACTIVE
   Phase     : Portal Identity Stabilization

   Purpose
   ----------------------------------------------------------
   Renders the shared Student & Executive Portal sidebar.

   Responsibilities
   ----------------------------------------------------------
   ✓ Render navigation
   ✓ Highlight active page
   ✓ Render university branding
   ✓ Render resolved learner identity
   ✓ Generate learner avatar initials
   ✓ Render learner membership
   ✓ Render credential summary navigation
   ✓ Consume shared portal identity state
   ✓ Support identity update events
   ✓ Reject generic identity placeholders when better
     learner identity data is available

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Authentication decisions
   ✗ Authorization
   ✗ Entitlement resolution
   ✗ Firestore queries
   ✗ API calls
   ✗ Business logic
   ✗ Membership decisions
   ✗ Credential counting decisions
   ✗ Profile persistence
   ✗ Identity persistence

   Architectural Position
   ----------------------------------------------------------
   Authentication
        ↓
   Entitlement / Credential Resolution
        ↓
   Shared Portal Identity
        ↓
   Sidebar Presentation

   Governance
   ----------------------------------------------------------
   • Shared Navigation Component

   • Single Responsibility

   • UI Only

   • Enterprise Portal Standard

   • Sidebar consumes resolved identity state only.

   • Sidebar must not determine portal access.

   • Learner name is the primary profile label.

   • Membership is secondary supporting information.

   • Avatar must contain learner initials only.

   • Generic placeholders must not override a resolved
     learner name.

   • Toolbar and sidebar should consume the same
     authoritative identity wherever available.

   • Credential Portfolio summary navigation must use the
     canonical My Credentials route.

   Identity Resolution Order
   ----------------------------------------------------------
   1. Explicit non-placeholder identity
   2. Shared profile full name
   3. Resolver-approved credential full name
   4. Shared portal user full name
   5. Firebase authenticated display name
   6. Authenticated email-derived name
   7. Learner fallback

   Initials Standard
   ----------------------------------------------------------
   • Use the first letters of the first two meaningful
     words in the resolved learner name.

   Examples:

   Test AOP Bridge Program User
   → TA

   Dileep Appupillai
   → DA

   Change History
   ----------------------------------------------------------
   v1.6.2

   • Corrected sidebar rendering order.

   • Moved Credential Portfolio summary above the learner
     profile card.

   • Preserved profile bottom alignment governed by
     margin-top: auto.

   • Prevented the Credential Portfolio summary from being
     pushed below the visible sidebar area.

   • Preserved all navigation, identity-resolution,
     credential-count and event behaviour.

   v1.6.1

   • Converted the Credential Portfolio summary into an
     accessible navigation link.

   • Added the canonical My Credentials destination:
     /credentials/my-credentials.html

   • Preserved the credential-count presentation region.

   • Preserved all shared identity-resolution behaviour.

   • Preserved all existing portal navigation destinations.

   • Preserved same-tab navigation for authenticated portal
     destinations.

   v1.6.0

   • Added Learning Resources as a first-class portal
     destination.

   • Added canonical /learning-resources.html navigation.

   • Preserved same-tab navigation for authenticated portal
     pages.

   • Preserved active-page highlighting.

   • Preserved centralized navigation ownership.

   v1.5.0

   • Removed placeholder and duplicate navigation entries.

   • Retained only confirmed working learner destinations.

   • Corrected Assessment Platform canonical URL.

   • Added secure external-link navigation support.

   • Preserved identity and credential summary behaviour.

   v1.4.0

   • Aligned sidebar identity with toolbar identity contract.

   • Added visibleCredentials collection compatibility.

   • Added credential-holder name field compatibility.

   • Prioritized resolved toolbar identity before Firebase
     fallback.

   • Added portal and dashboard readiness reconciliation.

   • Added safe idempotent initialization.

   v1.3.0

   • Fixed Student placeholder overriding learner name.

   • Prioritized resolved profile and credential identity.

   • Added placeholder-name rejection.

   • Added broader shared-state compatibility.

   • Added nested credential-state compatibility.

   • Changed initials to first-two-word standard.

   • Added Firebase auth-state refresh.

   • Added credential-render completion refresh.

   • Added delayed identity reconciliation.

   • Preserved navigation and summary architecture.

   v1.2.0

   • Replaced hardcoded Student avatar.

   • Replaced hardcoded Student profile name.

   • Added learner full-name presentation.

   • Added generated learner initials.

   • Added shared toolbar identity compatibility.

   • Added identity fallback resolution.

   • Added public updateIdentity API.

   • Added portal identity event support.

   • Added safe dynamic HTML rendering.

   • Preserved existing navigation architecture.

   • Preserved credential summary integration.

   v1.1.0

   • Updated university branding.

   • Corrected emblem asset.

   • Added lazy image loading.

   • Prepared sidebar for executive dashboard.

   v1.0.0

   • Initial shared sidebar.

   • Added navigation.

   • Added active-page highlighting.

   • Added profile and credential summary placeholders.

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
        "1.6.2";


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
                "learning-resources",

            title:
                "Learning Resources",

            icon:
                "📚",

            url:
                "/learning-resources.html"
        },

        {
            id:
                "assessment",

            title:
                "Assessment Platform",

            icon:
                "📝",

            url:
                "https://assessment.agileai.university/assessment.html",

            openMode:
                "new-tab"
        }

    ];


    /* ======================================================
       PLACEHOLDER VALUES
    ====================================================== */

    const GENERIC_IDENTITY_VALUES =
        new Set([

            "student",

            "learner",

            "user",

            "member",

            "university member",

            "agile ai university user",

            "portal user",

            "authenticated user",

            "unknown"

        ]);


    /* ======================================================
       STATE
    ====================================================== */

    let activeIdentity = {

        displayName:
            "Learner",

        email:
            "",

        roleLabel:
            "Student",

        membershipLabel:
            "University Member",

        initials:
            "LE"

    };


    let identityRefreshTimer =
        null;

    let initialized =
        false;


    /* ======================================================
       VALUE HELPERS
    ====================================================== */

    function normalizeValue(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }

        return String(
            value
        )
            .trim()
            .replace(
                /\s+/g,
                " "
            );

    }

    function firstValue(
        values
    ) {

        if (!Array.isArray(values)) {

            return "";

        }

        for (
            const value of values
        ) {

            const normalized =
                normalizeValue(
                    value
                );

            if (normalized) {

                return normalized;

            }

        }

        return "";

    }


    function isGenericIdentityValue(
        value
    ) {

        const normalized =
            normalizeValue(
                value
            )
                .toLowerCase();

        if (!normalized) {

            return true;

        }

        return GENERIC_IDENTITY_VALUES
            .has(
                normalized
            );

    }


    function firstMeaningfulName(
        values
    ) {

        if (!Array.isArray(values)) {

            return "";

        }

        for (
            const value of values
        ) {

            const normalized =
                normalizeValue(
                    value
                );

            if (
                normalized &&
                !isGenericIdentityValue(
                    normalized
                )
            ) {

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
            normalizeValue(
                email
            )
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

       Uses the first two meaningful words.

       Test AOP Bridge Program User
       → TA
    ====================================================== */

    function buildInitials(
        displayName
    ) {

        const normalizedName =
            normalizeValue(
                displayName
            );

        if (!normalizedName) {

            return "LE";

        }

        const words =
            normalizedName
                .split(" ")
                .filter(
                    Boolean
                );


        if (
            words.length ===
            1
        ) {

            return words[0]
                .slice(
                    0,
                    2
                )
                .toUpperCase();

        }


        return (

            words[0].charAt(0) +
            words[1].charAt(0)

        )
            .toUpperCase();

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


        const emailName =
            buildNameFromEmail(
                email
            );


        const displayName =
            firstMeaningfulName([

                identity.displayName,

                identity.display_name,

                identity.fullName,

                identity.full_name,

                identity.learnerName,

                identity.learner_name,

                identity.name,

                emailName

            ]) ||
            firstValue([

                identity.displayName,

                identity.fullName,

                identity.name,

                emailName,

                "Learner"

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
            item.id ===
            "dashboard"
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

            return currentPath
                .startsWith(
                    itemPath
                );

        }


        return currentPath
            .endsWith(
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


                    const openInNewTab =
                        item.openMode ===
                            "new-tab";


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
                            }
                            ${openInNewTab
                                ? 'target="_blank" rel="noopener noreferrer"'
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
       OBJECT HELPERS
    ====================================================== */

    function asObject(
        value
    ) {

        return (
            value &&
            typeof value ===
                "object" &&
            !Array.isArray(
                value
            )
        )
            ? value
            : {};

    }


    function asArray(
        value
    ) {

        return Array.isArray(
            value
        )
            ? value
            : [];

    }

        /* ======================================================
       PORTAL STATE
    ====================================================== */

    function resolvePortalState() {

        return asObject(

            window.__AAIU_PORTAL_STATE__ ||

            window.__AAIU_SHARED_PORTAL_STATE__ ||

            window.__AAIU_ENTITLEMENTS__ ||

            window.__PORTAL_ENTITLEMENTS__ ||

            window.__AAIU_RESOLVED_PORTAL_STATE__ ||

            window.__AAIU_PORTAL_ACCESS__ ||

            {}

        );

    }


    /* ======================================================
       PROFILE RESOLUTION
    ====================================================== */

    function resolveProfile(
        portalState
    ) {

        return asObject(

            portalState.profile ||

            portalState.userProfile ||

            portalState.user_profile ||

            portalState.identity ||

            portalState.user ||

            portalState.authUser ||

            portalState.auth_user ||

            {}

        );

    }


    /* ======================================================
       CREDENTIAL COLLECTION RESOLUTION
    ====================================================== */

    function resolveCredentials(
        portalState
    ) {

        const directCredentials =
            asArray(
                portalState.credentials
            );


        if (
            directCredentials.length >
            0
        ) {

            return directCredentials;

        }


        const resolvedCredentials =
            asArray(
                portalState.resolvedCredentials ||
                portalState.resolved_credentials
            );


        if (
            resolvedCredentials.length >
            0
        ) {

            return resolvedCredentials;

        }


        const visibleCredentials =
            asArray(

                portalState.visibleCredentials ||
                portalState.visible_credentials

            );


        if (
            visibleCredentials.length >
            0
        ) {

            return visibleCredentials;

        }


        const userEntitlements =
            asObject(

                portalState.userEntitlements ||
                portalState.user_entitlements

            );


        const entitlementCredentials =
            asArray(
                userEntitlements.credentials
            );


        if (
            entitlementCredentials.length >
            0
        ) {

            return entitlementCredentials;

        }


        const entitlementState =
            asObject(
                portalState.entitlements
            );


        const nestedCredentials =
            asArray(
                entitlementState.credentials
            );


        if (
            nestedCredentials.length >
            0
        ) {

            return nestedCredentials;

        }


        const singleCredential =
            asObject(

                portalState.credential ||

                portalState.resolvedCredential ||

                portalState.resolved_credential

            );


        if (
            Object.keys(
                singleCredential
            ).length >
            0
        ) {

            return [
                singleCredential
            ];

        }


        return [];

    }

        /* ======================================================
       TOOLBAR IDENTITY

       Generic toolbar placeholders are accepted only when
       no better profile, credential or authenticated-user
       identity exists.
    ====================================================== */

    function resolveToolbarIdentity() {

        try {

            if (
                window.PortalToolbar &&
                typeof window.PortalToolbar
                    .getIdentity ===
                    "function"
            ) {

                return asObject(

                    window.PortalToolbar
                        .getIdentity()

                );

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

        const portalState =
            resolvePortalState();


        const profile =
            resolveProfile(
                portalState
            );


        const credentials =
            resolveCredentials(
                portalState
            );


        const firstCredential =
            asObject(
                credentials[0]
            );


        const toolbarIdentity =
            resolveToolbarIdentity();


        const firebaseUser =
            resolveFirebaseUser();


        const email =
            firstValue([

                profile.email,

                profile.userEmail,

                profile.user_email,

                firstCredential.email,

                firstCredential.user_email,

                portalState.email,

                toolbarIdentity.email,

                firebaseUser?.email

            ]);


        const resolvedDisplayName =
            firstMeaningfulName([

                profile.full_name,

                profile.fullName,

                profile.display_name,

                profile.displayName,

                profile.learner_name,

                profile.learnerName,

                profile.name,

                firstCredential.full_name,

                firstCredential.fullName,

                firstCredential.learner_name,

                firstCredential.learnerName,

                firstCredential.display_name,

                firstCredential.displayName,

                firstCredential.credential_holder_name,

                firstCredential.credentialHolderName,

                firstCredential.holder_name,

                firstCredential.holderName,

                portalState.full_name,

                portalState.fullName,

                portalState.display_name,

                portalState.displayName,

                toolbarIdentity.full_name,

                toolbarIdentity.fullName,

                toolbarIdentity.display_name,

                toolbarIdentity.displayName,

                firebaseUser?.displayName,

                buildNameFromEmail(
                    email
                )

            ]);


        return normalizeIdentity({

            displayName:
                resolvedDisplayName ||
                "Learner",

            email,

            roleLabel:
                firstValue([

                    profile.roleLabel,

                    profile.role_label,

                    profile.role,

                    portalState.roleLabel,

                    portalState.role,

                    toolbarIdentity.roleLabel,

                    toolbarIdentity.role_label,

                    toolbarIdentity.role,

                    "Student"

                ]),

            membershipLabel:
                firstValue([

                    profile.membershipLabel,

                    profile.membership_label,

                    profile.membership,

                    profile.membershipType,

                    profile.membership_type,

                    portalState.membershipLabel,

                    portalState.membership_label,

                    portalState.membership,

                    toolbarIdentity.membershipLabel,

                    toolbarIdentity.membership_label,

                    toolbarIdentity.membership,

                    "University Member"

                ])

        });

    }
        /* ======================================================
       IDENTITY QUALITY
    ====================================================== */

    function identityQuality(
        identity
    ) {

        const normalized =
            normalizeIdentity(
                identity
            );


        if (
            !normalized.displayName ||
            isGenericIdentityValue(
                normalized.displayName
            )
        ) {

            return 0;

        }


        if (
            normalized.email &&
            normalized.displayName
                .toLowerCase() ===
            buildNameFromEmail(
                normalized.email
            )
                .toLowerCase()
        ) {

            return 1;

        }


        return 2;

    }


    /* ======================================================
       APPLY IDENTITY
    ====================================================== */

    function applyIdentity(
        identity,
        options = {}
    ) {

        const normalizedIdentity =
            normalizeIdentity(
                identity
            );


        const force =
            options.force ===
            true;


        if (
            !force &&
            identityQuality(
                normalizedIdentity
            ) <
            identityQuality(
                activeIdentity
            )
        ) {

            return;

        }


        activeIdentity =
            normalizedIdentity;


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

            } else {

                delete profile.dataset.userEmail;

            }

        }

    }


    /* ======================================================
       IDENTITY RECONCILIATION
    ====================================================== */

    function reconcileIdentity(
        options = {}
    ) {

        applyIdentity(

            resolveSharedIdentity(),

            options

        );

    }


    function scheduleIdentityReconciliation() {

        if (
            identityRefreshTimer
        ) {

            window.clearTimeout(
                identityRefreshTimer
            );

        }


        identityRefreshTimer =
            window.setTimeout(

                function () {

                    reconcileIdentity();

                },

                250

            );


        window.setTimeout(
            reconcileIdentity,
            1000
        );


        window.setTimeout(
            reconcileIdentity,
            2500
        );

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

                <a
                    href="/credentials/my-credentials.html"
                    class="portal-sidebar-summary"
                    aria-label="Open My Credentials">

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

                </a>

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

            </div>

        `;


        reconcileIdentity({
            force: true
        });


        bindUnavailableNavigation(
            container
        );

    }
        /* ======================================================
       UNAVAILABLE NAVIGATION
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
       FIREBASE AUTH REFRESH
    ====================================================== */

    function bindFirebaseAuthRefresh() {

        try {

            if (
                window.firebase &&
                typeof window.firebase.auth ===
                    "function"
            ) {

                window.firebase
                    .auth()
                    .onAuthStateChanged(

                        function () {

                            scheduleIdentityReconciliation();

                        }

                    );

            }

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Firebase auth refresh binding failed.`,
                error
            );

        }

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

            scheduleIdentityReconciliation

        );


        document.addEventListener(

            "credentials:rendered",

            scheduleIdentityReconciliation

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


                    const firstCredential =
                        asObject(
                            credentials[0]
                        );


                    const credentialName =
                        firstMeaningfulName([

                            firstCredential.full_name,

                            firstCredential.fullName,

                            firstCredential.learner_name,

                            firstCredential.learnerName,

                            firstCredential.display_name,

                            firstCredential.displayName,

                            firstCredential.credential_holder_name,

                            firstCredential.credentialHolderName,

                            firstCredential.holder_name,

                            firstCredential.holderName

                        ]);


                    if (
                        credentialName
                    ) {

                        updateIdentity({

                            displayName:
                                credentialName,

                            email:
                                firstCredential.email,

                            membershipLabel:
                                activeIdentity.membershipLabel,

                            roleLabel:
                                activeIdentity.roleLabel

                        });

                    }

                }


                scheduleIdentityReconciliation();

            }

        );
                document.addEventListener(

            "portal:ready",

            scheduleIdentityReconciliation

        );


        document.addEventListener(

            "dashboard:ready",

            scheduleIdentityReconciliation

        );


        document.addEventListener(

            "portal:signout-completed",

            function () {

                applyIdentity(
                    {
                        displayName:
                            "Learner",

                        email:
                            "",

                        roleLabel:
                            "Student",

                        membershipLabel:
                            "University Member"
                    },
                    {
                        force:
                            true
                    }
                );

            }

        );

    }
        /* ======================================================
       INITIALIZATION
    ====================================================== */

    function initialize() {

        if (
            initialized
        ) {

            return;

        }

        initialized =
            true;

        bindIdentityEvents();

        bindFirebaseAuthRefresh();

        activeIdentity =
            resolveSharedIdentity();

        renderSidebar();

        scheduleIdentityReconciliation();

        console.info(
            `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`,
            activeIdentity
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

            refreshIdentity:
                scheduleIdentityReconciliation,

            getIdentity() {

                return Object.freeze({
                    ...activeIdentity
                });

            }

        });
            if (
        document.readyState ===
            "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once:
                    true
            }
        );

    } else {

        initialize();

    }


})(window, document);