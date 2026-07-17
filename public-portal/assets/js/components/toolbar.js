/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : toolbar.js
   Version   : 1.4.0
   Status    : ACTIVE
   Phase     : Portal Identity Stabilization

   Purpose
   ----------------------------------------------------------
   Renders the shared Student & Executive Portal toolbar.

   Responsibilities
   ----------------------------------------------------------
   ✓ Render page title
   ✓ Render breadcrumb
   ✓ Render resolved learner identity
   ✓ Generate learner avatar initials
   ✓ Render learner role
   ✓ Reject generic identity placeholders
   ✓ Consume shared portal identity state
   ✓ Support identity update events
   ✓ Reconcile identity after asynchronous readiness
   ✓ Expose governed identity presentation API
   ✓ Render accessible learner account menu
   ✓ Coordinate explicit sign-out through PortalSessionService
   ✓ Support keyboard, outside-click and Escape dismissal
   ✓ Present recoverable sign-out status

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Authentication decisions
   ✗ Authorization
   ✗ Entitlement resolution
   ✗ Firestore queries
   ✗ External API calls
   ✗ Business logic
   ✗ Identity persistence
   ✗ Profile persistence
   ✗ Membership decisions
   ✗ Credential filtering
   ✗ Credential retrieval
   ✗ Firebase sign-out orchestration
   ✗ Session, cache or storage cleanup

   Architectural Position
   ----------------------------------------------------------
   Authentication
        ↓
   Entitlement / Credential Resolution
        ↓
   Shared Portal Identity
        ↓
   Toolbar Presentation

   Governance
   ----------------------------------------------------------
   • Shared UI Component

   • Enterprise Dashboard Standard

   • Single Responsibility

   • Toolbar consumes available resolved identity only.

   • Toolbar must not determine portal access.

   • Toolbar must not query Firestore or external APIs.

   • Learner name is the primary identity label.

   • Role is secondary supporting information.

   • Avatar must contain compact learner initials only.

   • Generic identity placeholders must not override a
     resolved learner name.

   • Toolbar and sidebar must follow the same identity
     resolution and initials standard.

   • Identity resolution remains defensive because portal
     state may become available asynchronously.

   Identity Resolution Order
   ----------------------------------------------------------
   1. Explicit non-placeholder identity update
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

   Examples

   Test AOP Bridge Program User
   → TA

   Dileep Appupillai
   → DA

   Single-word name
   → First two characters

   Change History
   ----------------------------------------------------------
   v1.4.0

   • Removed non-functional portal search placeholder
   • Removed non-functional notification placeholder
   • Preserved learner identity and account menu
   • Preserved governed sign-out lifecycle

   v1.3.0

   • Added governed learner account menu
   • Added professional Sign out action
   • Integrated PortalSessionService as sole sign-out authority
   • Added accessible menu trigger and menu semantics
   • Added Escape, outside-click and keyboard handling
   • Added duplicate-handler and duplicate-action protection
   • Added sign-out progress, success and failure synchronization
   • Added safe initialization after DOMContentLoaded

   v1.2.0

   • Fixed Student placeholder overriding learner name
   • Added generic identity placeholder rejection
   • Prioritized profile and credential full names
   • Added broader portal-state compatibility
   • Added nested credential-state compatibility
   • Changed initials to first-two-word standard
   • Added identity-quality protection
   • Added Firebase authentication refresh
   • Added entitlement readiness refresh
   • Added credential resolution refresh
   • Added credential render completion refresh
   • Added delayed identity reconciliation
   • Added safe data-attribute cleanup
   • Preserved toolbar public API
   • Preserved presentation-only architecture

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
        "1.4.0";


    /* ======================================================
       GENERIC IDENTITY VALUES

       These values are valid role or fallback labels, but
       must not outrank a real learner name.
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

            "unknown",

            "guest"

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

    let accountMenuOpen =
        false;

    let signOutRequestActive =
        false;

    let accountEventsBound =
        false;


    /* ======================================================
       PAGE TITLE
    ====================================================== */

    function getPageTitle() {

        const page =
            document.body?.dataset?.page ||
            "";

        switch (
            page
        ) {

            case "dashboard":

                return "Dashboard";


            case "credentials":

                return "My Credentials";


            case "recognition":

                return "Recognition Assets";


            case "certificates":

                return "Certificates";


            case "badges":

                return "Digital Badges";


            case "verification":

                return "Credential Verification";


            case "assessment":

                return "Assessment Platform";


            case "learning":

                return "Learning Journey";


            case "executive":

                return "Executive Insights";


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
       NORMALIZE VALUE
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


    /* ======================================================
       FIRST NON-EMPTY VALUE
    ====================================================== */

    function firstValue(
        values
    ) {

        if (
            !Array.isArray(
                values
            )
        ) {

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
                normalized
            ) {

                return normalized;

            }

        }

        return "";

    }


    /* ======================================================
       GENERIC IDENTITY CHECK
    ====================================================== */

    function isGenericIdentityValue(
        value
    ) {

        const normalized =
            normalizeValue(
                value
            )
                .toLowerCase();

        if (
            !normalized
        ) {

            return true;

        }

        return GENERIC_IDENTITY_VALUES
            .has(
                normalized
            );

    }


    /* ======================================================
       FIRST MEANINGFUL NAME

       Generic values such as Student are ignored while
       searching for a genuine learner identity.
    ====================================================== */

    function firstMeaningfulName(
        values
    ) {

        if (
            !Array.isArray(
                values
            )
        ) {

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


    /* ======================================================
       HTML ESCAPING
    ====================================================== */

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
       EMAIL-DERIVED NAME
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
            !normalizedEmail.includes(
                "@"
            )
        ) {

            return "";

        }

        const localPart =
            normalizedEmail
                .split(
                    "@"
                )[0];


        return localPart
            .split(
                /[._+\-]+/
            )
            .filter(
                Boolean
            )
            .map(

                part =>

                    part
                        .charAt(
                            0
                        )
                        .toUpperCase() +

                    part.slice(
                        1
                    )

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

        if (
            !normalizedName
        ) {

            return "LE";

        }

        const words =
            normalizedName
                .split(
                    " "
                )
                .filter(
                    Boolean
                );


        if (
            words.length ===
            0
        ) {

            return "LE";

        }


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

            words[0]
                .charAt(
                    0
                ) +

            words[1]
                .charAt(
                    0
                )

        )
            .toUpperCase();

    }


    /* ======================================================
       IDENTITY NORMALIZATION
    ====================================================== */

    function normalizeIdentity(
        identity = {}
    ) {

        const source =
            asObject(
                identity
            );


        const email =
            firstValue([

                source.email,

                source.userEmail,

                source.user_email,

                source.learnerEmail,

                source.learner_email

            ]);


        const emailName =
            buildNameFromEmail(
                email
            );


        const displayName =
            firstMeaningfulName([

                source.displayName,

                source.display_name,

                source.fullName,

                source.full_name,

                source.learnerName,

                source.learner_name,

                source.credentialHolderName,

                source.credential_holder_name,

                source.holderName,

                source.holder_name,

                source.name,

                emailName

            ]) ||
            firstValue([

                source.displayName,

                source.fullName,

                source.learnerName,

                source.name,

                emailName,

                "Learner"

            ]);


        const roleLabel =
            firstValue([

                source.roleLabel,

                source.role_label,

                source.role,

                source.userRole,

                source.user_role,

                source.portalRole,

                source.portal_role,

                "Student"

            ]);


        const membershipLabel =
            firstValue([

                source.membershipLabel,

                source.membership_label,

                source.membership,

                source.membershipType,

                source.membership_type,

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
       PORTAL STATE RESOLUTION
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

            portalState.learner ||

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
       SIDEBAR IDENTITY

       The sidebar may already have resolved a better identity.
       Generic sidebar placeholders are ignored.
    ====================================================== */

    function resolveSidebarIdentity() {

        try {

            if (
                window.PortalSidebar &&
                typeof window.PortalSidebar
                    .getIdentity ===
                    "function"
            ) {

                return asObject(

                    window.PortalSidebar
                        .getIdentity()

                );

            }

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to read PortalSidebar identity.`,
                error
            );

        }

        return {};

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


        const sidebarIdentity =
            resolveSidebarIdentity();


        const firebaseUser =
            resolveFirebaseUser();


        const email =
            firstValue([

                profile.email,

                profile.userEmail,

                profile.user_email,

                profile.learnerEmail,

                profile.learner_email,

                firstCredential.email,

                firstCredential.user_email,

                firstCredential.learner_email,

                portalState.email,

                portalState.userEmail,

                portalState.user_email,

                sidebarIdentity.email,

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

                profile.credential_holder_name,

                profile.credentialHolderName,

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

                portalState.learner_name,

                portalState.learnerName,

                firebaseUser?.displayName,

                sidebarIdentity.full_name,

                sidebarIdentity.fullName,

                sidebarIdentity.display_name,

                sidebarIdentity.displayName,

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

                    profile.userRole,

                    profile.user_role,

                    portalState.roleLabel,

                    portalState.role_label,

                    portalState.role,

                    sidebarIdentity.roleLabel,

                    sidebarIdentity.role_label,

                    sidebarIdentity.role,

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

                    sidebarIdentity.membershipLabel,

                    sidebarIdentity.membership_label,

                    sidebarIdentity.membership,

                    "University Member"

                ])

        });

    }


    /* ======================================================
       IDENTITY QUALITY

       Quality 0
       Generic placeholder

       Quality 1
       Email-derived identity

       Quality 2
       Resolved profile / credential identity
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


        const emailDerivedName =
            buildNameFromEmail(
                normalized.email
            );


        if (
            normalized.email &&
            emailDerivedName &&
            normalized.displayName
                .toLowerCase() ===
                emailDerivedName.toLowerCase()
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


        const accountName =
            document.getElementById(
                "toolbarAccountName"
            );


        const accountEmail =
            document.getElementById(
                "toolbarAccountEmail"
            );


        if (
            avatar
        ) {

            avatar.textContent =
                activeIdentity.initials;

            avatar.title =
                activeIdentity.displayName;

            avatar.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        if (
            userName
        ) {

            userName.textContent =
                activeIdentity.displayName;

            userName.title =
                activeIdentity.displayName;

        }


        if (
            userRole
        ) {

            userRole.textContent =
                activeIdentity.roleLabel;

            userRole.title =
                activeIdentity.roleLabel;

        }


        if (
            userButton
        ) {

            userButton.setAttribute(

                "aria-label",

                `Signed in as ${activeIdentity.displayName}, ${activeIdentity.roleLabel}. Open account menu.`

            );


            if (
                activeIdentity.email
            ) {

                userButton.dataset.userEmail =
                    activeIdentity.email;

            } else {

                delete userButton.dataset.userEmail;

            }


            userButton.dataset.identityInitials =
                activeIdentity.initials;

        }


        if (
            accountName
        ) {

            accountName.textContent =
                activeIdentity.displayName;

            accountName.title =
                activeIdentity.displayName;

        }


        if (
            accountEmail
        ) {

            accountEmail.textContent =
                activeIdentity.email ||
                "Signed-in learner";

            accountEmail.title =
                activeIdentity.email ||
                "";

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
       TOOLBAR RENDERING
    ====================================================== */

    function renderToolbar() {

        accountMenuOpen =
            false;

        const toolbar =
            document.getElementById(
                "portal-toolbar"
            );


        if (
            !toolbar
        ) {

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
                    class="toolbar-account"
                    id="toolbarAccount">

                    <button
                        class="toolbar-user"
                        id="toolbarUser"
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded="false"
                        aria-controls="toolbarAccountMenu"
                        aria-label="${escapeAttribute(
                            `Signed in as ${identity.displayName}, ${identity.roleLabel}. Open account menu.`
                        )}">

                        <span
                            class="toolbar-avatar"
                            id="toolbarAvatar"
                            title="${escapeAttribute(
                                identity.displayName
                            )}"
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
                                title="${escapeAttribute(
                                    identity.displayName
                                )}">

                                ${escapeHtml(
                                    identity.displayName
                                )}

                            </span>

                            <span
                                class="toolbar-role"
                                id="toolbarUserRole"
                                title="${escapeAttribute(
                                    identity.roleLabel
                                )}">

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

                    <div
                        class="toolbar-account-menu"
                        id="toolbarAccountMenu"
                        role="menu"
                        aria-label="Learner account"
                        hidden>

                        <div
                            class="toolbar-account-summary"
                            role="presentation">

                            <span
                                class="toolbar-account-name"
                                id="toolbarAccountName">

                                ${escapeHtml(identity.displayName)}

                            </span>

                            <span
                                class="toolbar-account-email"
                                id="toolbarAccountEmail">

                                ${escapeHtml(
                                    identity.email ||
                                    "Signed-in learner"
                                )}

                            </span>

                        </div>

                        <hr
                            class="toolbar-account-separator"
                            role="separator">

                        <div
                            class="toolbar-account-actions"
                            role="presentation">

                            <button
                                class="toolbar-account-action"
                                id="toolbarAccountSignOut"
                                type="button"
                                role="menuitem">

                                <span
                                    class="toolbar-account-action-icon"
                                    aria-hidden="true">

                                    ↪

                                </span>

                                <span
                                    data-sign-out-label>

                                    Sign out

                                </span>

                            </button>

                        </div>

                        <p
                            class="toolbar-account-status"
                            id="toolbarAccountStatus"
                            role="status"
                            aria-live="polite"
                            hidden>
                        </p>

                    </div>

                </div>

            </div>

        `;


        reconcileIdentity({
            force:
                true
        });

    }


    /* ======================================================
       ACCOUNT MENU
    ====================================================== */

    function setAccountStatus(
        message = "",
        status = ""
    ) {

        const statusElement =
            document.getElementById(
                "toolbarAccountStatus"
            );

        if (
            !statusElement
        ) {

            return;

        }

        const normalizedMessage =
            normalizeValue(
                message
            );

        statusElement.textContent =
            normalizedMessage;

        statusElement.hidden =
            !normalizedMessage;

        if (
            status
        ) {

            statusElement.dataset.status =
                status;

        } else {

            delete statusElement.dataset.status;

        }

    }


    function setSignOutControlState(
        active
    ) {

        const control =
            document.getElementById(
                "toolbarAccountSignOut"
            );

        if (
            !control
        ) {

            return;

        }

        const label =
            control.querySelector(
                "[data-sign-out-label]"
            );

        control.disabled =
            Boolean(active);

        control.setAttribute(
            "aria-busy",
            active ? "true" : "false"
        );

        if (
            label
        ) {

            label.textContent =
                active
                    ? "Signing out…"
                    : "Sign out";

        }

    }


    function setAccountMenuOpen(
        open,
        options = {}
    ) {

        const trigger =
            document.getElementById(
                "toolbarUser"
            );

        const menu =
            document.getElementById(
                "toolbarAccountMenu"
            );

        if (
            !trigger ||
            !menu
        ) {

            accountMenuOpen =
                false;

            return;

        }

        const nextOpen =
            Boolean(open) &&
            !signOutRequestActive;

        accountMenuOpen =
            nextOpen;

        trigger.setAttribute(
            "aria-expanded",
            nextOpen ? "true" : "false"
        );

        menu.hidden =
            !nextOpen;

        if (
            nextOpen
        ) {

            setAccountStatus();

            if (
                options.focusFirst === true
            ) {

                document.getElementById(
                    "toolbarAccountSignOut"
                )?.focus();

            }

        } else if (
            options.restoreFocus === true
        ) {

            trigger.focus();

        }

    }


    function closeAccountMenu(
        options = {}
    ) {

        setAccountMenuOpen(
            false,
            options
        );

    }


    async function requestSignOut() {

        if (
            signOutRequestActive
        ) {

            return;

        }

        const sessionService =
            window.PortalSessionService;

        if (
            !sessionService ||
            typeof sessionService.signOut !==
                "function"
        ) {

            setAccountStatus(
                "Sign out is temporarily unavailable. Please refresh and try again.",
                "error"
            );

            console.error(
                `[${MODULE_NAME}] PortalSessionService is unavailable.`
            );

            return;

        }

        signOutRequestActive =
            true;

        setSignOutControlState(
            true
        );

        setAccountStatus(
            "Ending your secure portal session…"
        );

        try {

            await sessionService.signOut();

        } catch (
            error
        ) {

            signOutRequestActive =
                false;

            setSignOutControlState(
                false
            );

            setAccountStatus(
                "We couldn’t sign you out. Please check your connection and try again.",
                "error"
            );

            console.error(
                `[${MODULE_NAME}] Sign-out request failed.`,
                error
            );

        }

    }


    function bindAccountMenuEvents() {

        if (
            accountEventsBound
        ) {

            return;

        }

        accountEventsBound =
            true;

        document.addEventListener(
            "click",
            function (
                event
            ) {

                const trigger =
                    event.target.closest?.(
                        "#toolbarUser"
                    );

                if (
                    trigger
                ) {

                    setAccountMenuOpen(
                        !accountMenuOpen
                    );

                    return;

                }

                const signOutControl =
                    event.target.closest?.(
                        "#toolbarAccountSignOut"
                    );

                if (
                    signOutControl
                ) {

                    event.preventDefault();
                    requestSignOut();
                    return;

                }

                if (
                    accountMenuOpen &&
                    !event.target.closest?.(
                        "#toolbarAccount"
                    )
                ) {

                    closeAccountMenu();

                }

            }
        );

        document.addEventListener(
            "keydown",
            function (
                event
            ) {

                if (
                    event.key === "Escape" &&
                    accountMenuOpen
                ) {

                    event.preventDefault();

                    closeAccountMenu({
                        restoreFocus: true
                    });

                    return;

                }

                if (
                    (
                        event.key === "ArrowDown" ||
                        event.key === "Enter" ||
                        event.key === " "
                    ) &&
                    event.target?.id ===
                        "toolbarUser"
                ) {

                    event.preventDefault();

                    setAccountMenuOpen(
                        true,
                        {
                            focusFirst: true
                        }
                    );

                }

            }
        );

        document.addEventListener(
            "portal:signout-started",
            function () {

                signOutRequestActive =
                    true;

                setSignOutControlState(
                    true
                );

            }
        );

        document.addEventListener(
            "portal:signout-failed",
            function () {

                signOutRequestActive =
                    false;

                setSignOutControlState(
                    false
                );

            }
        );

        document.addEventListener(
            "portal:signout-completed",
            function () {

                applyIdentity(
                    {
                        displayName: "Learner",
                        email: "",
                        roleLabel: "Student",
                        membershipLabel: "University Member"
                    },
                    {
                        force: true
                    }
                );

                closeAccountMenu();

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
       CREDENTIAL EVENT IDENTITY
    ====================================================== */

    function applyCredentialEventIdentity(
        credentials
    ) {

        if (
            !Array.isArray(
                credentials
            ) ||
            credentials.length ===
                0
        ) {

            return;

        }


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
            !credentialName
        ) {

            return;

        }


        updateIdentity({

            displayName:
                credentialName,

            email:
                firstValue([

                    firstCredential.email,

                    firstCredential.user_email,

                    firstCredential.learner_email,

                    activeIdentity.email

                ]),

            roleLabel:
                activeIdentity.roleLabel ||
                "Student",

            membershipLabel:
                activeIdentity.membershipLabel ||
                "University Member"

        });

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

                scheduleIdentityReconciliation();

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

                scheduleIdentityReconciliation();

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


                applyCredentialEventIdentity(
                    credentials
                );


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

        bindAccountMenuEvents();


        activeIdentity =
            resolveSharedIdentity();


        renderToolbar();


        scheduleIdentityReconciliation();


        console.info(
            `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`,
            activeIdentity
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

            refreshIdentity:
                scheduleIdentityReconciliation,

            closeAccountMenu,

            isAccountMenuOpen() {

                return accountMenuOpen;

            },

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
                once: true
            }
        );

    } else {

        initialize();

    }


})(window, document);