/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : quick-access-card.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Dashboard Value Hardening

   Purpose
   ----------------------------------------------------------
   Renders an individual governed Quick Access action for the
   Student & Executive Portal dashboard.

   Responsibilities
   ----------------------------------------------------------
   ✓ Render actionable Quick Access links
   ✓ Reject empty and placeholder URLs
   ✓ Reject unsafe URL protocols
   ✓ Respect resolved capability visibility
   ✓ Escape all learner-facing HTML content
   ✓ Apply safe external-link behaviour
   ✓ Support same-tab and new-tab actions
   ✓ Provide accessible action labels
   ✓ Return empty output for invalid capabilities

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Dashboard rendering
   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement resolution
   ✗ Capability availability decisions
   ✗ Firestore access
   ✗ Business logic
   ✗ DOM manipulation
   ✗ Route discovery
   ✗ Feature implementation

   Architectural Position
   ----------------------------------------------------------
   Capability Resolver
        ↓
   Resolved Quick Access Item
        ↓
   QuickAccessWidget
        ↓
   QuickAccessCard
        ↓
   Actionable Dashboard Link

   Governance
   ----------------------------------------------------------
   • QuickAccessCard is a shared presentation component.

   • Capability availability, entitlement and visibility must
     be resolved before the item reaches this component.

   • This component must still fail safely when an invalid or
     placeholder item is supplied.

   • The component must never render:

       href="#"
       javascript:
       data:
       vbscript:
       empty URLs
       unavailable capabilities
       explicitly hidden capabilities
       explicitly non-actionable capabilities

   • Relative portal routes are allowed.

   • Secure external HTTPS routes are allowed.

   • External web links open in a new tab by default.

   • New-tab links must use:

       rel="noopener noreferrer"

   • All dynamic content must be escaped before insertion
     into HTML.

   Supported Item Contract
   ----------------------------------------------------------
   {
       id: "credentials",
       title: "My Credentials",
       icon: "🎓",
       url: "/credentials/my-credentials.html",

       available: true,
       entitled: true,
       visible: true,
       actionable: true,

       openMode: "same-tab"
   }

   Supported openMode values:

       same-tab
       new-tab

   Compatibility fields:

       target: "_blank"
       newTab: true

   Change History
   ----------------------------------------------------------
   v1.1.0

   • Removed href="#" fallback
   • Added placeholder URL rejection
   • Added unsafe protocol rejection
   • Added resolved-state compatibility
   • Added HTML and attribute escaping
   • Added secure external-link handling
   • Added accessible labels
   • Added same-tab and new-tab support
   • Added defensive diagnostics

   v1.0.0

   • Introduced Quick Access Card
   • Added basic Quick Access link rendering

========================================================== */

(function (
    window
) {

    "use strict";


    /* ======================================================
       MODULE IDENTITY
    ====================================================== */

    const MODULE_NAME =
        "QuickAccessCard";

    const MODULE_VERSION =
        "1.1.0";


    /* ======================================================
       VALUE NORMALIZATION
    ====================================================== */

    function normalizeString(
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
            .trim();

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
       OBJECT VALIDATION
    ====================================================== */

    function isObject(
        value
    ) {

        return Boolean(

            value &&

            typeof value ===
                "object" &&

            !Array.isArray(
                value
            )

        );

    }


    /* ======================================================
       RESOLVED CAPABILITY STATE

       Missing flags remain compatible with legacy items.

       An explicit false always prevents rendering.
    ====================================================== */

    function isResolvedAsVisible(
        item
    ) {

        if (
            item.available === false ||
            item.entitled === false ||
            item.visible === false ||
            item.actionable === false ||
            item.enabled === false
        ) {

            return false;

        }

        return true;

    }


    /* ======================================================
       PLACEHOLDER URL CHECK
    ====================================================== */

    function isPlaceholderUrl(
        value
    ) {

        const normalized =
            normalizeString(
                value
            )
                .toLowerCase();

        return (

            !normalized ||

            normalized ===
                "#" ||

            normalized ===
                "/" ||

            normalized ===
                "javascript:void(0)" ||

            normalized ===
                "javascript:void(0);" ||

            normalized ===
                "about:blank"

        );

    }


    /* ======================================================
       URL RESOLUTION
    ====================================================== */

    function resolveUrl(
        value
    ) {

        const originalUrl =
            normalizeString(
                value
            );

        if (
            isPlaceholderUrl(
                originalUrl
            )
        ) {

            return null;

        }

        const loweredUrl =
            originalUrl.toLowerCase();

        if (
            loweredUrl.startsWith(
                "javascript:"
            ) ||
            loweredUrl.startsWith(
                "data:"
            ) ||
            loweredUrl.startsWith(
                "vbscript:"
            ) ||
            loweredUrl.startsWith(
                "file:"
            )
        ) {

            return null;

        }

        /*
         * Allow secure support email actions.
         */

        if (
            loweredUrl.startsWith(
                "mailto:"
            )
        ) {

            return {

                href:
                    originalUrl,

                protocol:
                    "mailto:",

                external:
                    false

            };

        }

        try {

            const resolvedUrl =
                new URL(
                    originalUrl,
                    window.location.origin
                );

            const permittedProtocol =
                resolvedUrl.protocol ===
                    "https:" ||
                resolvedUrl.protocol ===
                    "http:";

            if (
                !permittedProtocol
            ) {

                return null;

            }

            /*
             * When the portal is served through HTTPS,
             * external HTTP destinations are rejected.
             */

            if (
                window.location.protocol ===
                    "https:" &&
                resolvedUrl.protocol ===
                    "http:" &&
                resolvedUrl.origin !==
                    window.location.origin
            ) {

                return null;

            }

            const external =
                resolvedUrl.origin !==
                window.location.origin;

            /*
             * Preserve governed relative portal URLs in the
             * generated markup instead of converting them to
             * absolute URLs.
             */

            const href =
                originalUrl.startsWith(
                    "/"
                )
                    ? originalUrl
                    : resolvedUrl.href;

            return {

                href,

                protocol:
                    resolvedUrl.protocol,

                external

            };

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Invalid Quick Access URL rejected:`,
                originalUrl,
                error
            );

            return null;

        }

    }


    /* ======================================================
       NEW-TAB RESOLUTION
    ====================================================== */

    function shouldOpenInNewTab(
        item,
        resolvedUrl
    ) {

        const openMode =
            normalizeString(
                item.openMode ||
                item.open_mode
            )
                .toLowerCase();

        if (
            openMode ===
                "new-tab"
        ) {

            return true;

        }

        if (
            openMode ===
                "same-tab"
        ) {

            return false;

        }

        if (
            item.newTab === true ||
            item.new_tab === true ||
            normalizeString(
                item.target
            ) === "_blank"
        ) {

            return true;

        }

        /*
         * Secure external web destinations open in a new tab
         * by default so the learner does not lose the portal.
         */

        return Boolean(
            resolvedUrl.external
        );

    }


    /* ======================================================
       CAPABILITY ID
    ====================================================== */

    function resolveCapabilityId(
        item
    ) {

        return normalizeString(

            item.id ||

            item.capabilityId ||

            item.capability_id ||

            item.code

        );

    }


    /* ======================================================
       CARD RENDERING
    ====================================================== */

    function render(
        item
    ) {

        if (
            !isObject(
                item
            )
        ) {

            return "";

        }

        if (
            !isResolvedAsVisible(
                item
            )
        ) {

            return "";

        }

        const title =
            normalizeString(
                item.title ||
                item.label ||
                item.name
            );

        if (
            !title
        ) {

            console.warn(
                `[${MODULE_NAME}] Quick Access item without a title was rejected.`,
                item
            );

            return "";

        }

        const resolvedUrl =
            resolveUrl(
                item.url ||
                item.href ||
                item.route
            );

        if (
            !resolvedUrl
        ) {

            console.warn(
                `[${MODULE_NAME}] Non-actionable Quick Access item was rejected:`,
                title
            );

            return "";

        }

        const icon =
            normalizeString(
                item.icon
            );

        const capabilityId =
            resolveCapabilityId(
                item
            );

        const ariaLabel =
            normalizeString(
                item.ariaLabel ||
                item.aria_label
            ) ||
            title;

        const openInNewTab =
            shouldOpenInNewTab(
                item,
                resolvedUrl
            );

        const targetMarkup =
            openInNewTab

                ? `
                    target="_blank"
                    rel="noopener noreferrer"
                `

                : "";

        const capabilityMarkup =
            capabilityId

                ? `
                    data-capability-id="${escapeAttribute(
                        capabilityId
                    )}"
                `

                : "";

        const externalMarkup =
            resolvedUrl.external

                ? `
                    data-external-link="true"
                `

                : "";

        const iconMarkup =
            icon

                ? `
                    <span
                        class="quick-access-card-icon"
                        aria-hidden="true">

                        ${escapeHtml(
                            icon
                        )}

                    </span>
                `

                : "";

        return `

            <a
                href="${escapeAttribute(
                    resolvedUrl.href
                )}"
                class="quick-access-card btn btn-secondary"
                aria-label="${escapeAttribute(
                    ariaLabel
                )}"
                ${capabilityMarkup}
                ${externalMarkup}
                ${targetMarkup}>

                ${iconMarkup}

                <span
                    class="quick-access-card-title">

                    ${escapeHtml(
                        title
                    )}

                </span>

            </a>

        `;

    }


    /* ======================================================
       PUBLIC API
    ====================================================== */

    window.QuickAccessCard =
        Object.freeze({

            render,

            canRender(
                item
            ) {

                if (
                    !isObject(
                        item
                    ) ||
                    !isResolvedAsVisible(
                        item
                    )
                ) {

                    return false;

                }

                const title =
                    normalizeString(
                        item.title ||
                        item.label ||
                        item.name
                    );

                const resolvedUrl =
                    resolveUrl(
                        item.url ||
                        item.href ||
                        item.route
                    );

                return Boolean(
                    title &&
                    resolvedUrl
                );

            },

            getState() {

                return Object.freeze({

                    ready:
                        true,

                    version:
                        MODULE_VERSION

                });

            }

        });


    console.info(
        `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
    );


})(window);