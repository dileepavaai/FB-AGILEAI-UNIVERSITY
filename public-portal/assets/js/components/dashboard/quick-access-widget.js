/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : quick-access-widget.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Dashboard Value Hardening

   Purpose
   ----------------------------------------------------------
   Renders the governed Quick Access section of the
   Student & Executive Dashboard.

   Responsibilities
   ----------------------------------------------------------
   ✓ Render resolved Quick Access cards
   ✓ Delegate card rendering to QuickAccessCard
   ✓ Populate the Dashboard Quick Access container
   ✓ Remove failed or empty card output
   ✓ Hide the complete section when no cards render
   ✓ Reveal the section when actionable cards render
   ✓ Publish rendering lifecycle diagnostics
   ✓ Recover safely when optional dependencies are unavailable

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement resolution
   ✗ Capability availability decisions
   ✗ Firestore access
   ✗ API calls
   ✗ Business logic
   ✗ Route construction
   ✗ Dashboard orchestration
   ✗ Individual card HTML generation

   Architectural Position
   ----------------------------------------------------------
   Dashboard Capability Resolver
        ↓
   Resolved Quick Access Items
        ↓
   QuickAccessWidget
        ↓
   QuickAccessCard
        ↓
   Dashboard Quick Access Section

   Governance
   ----------------------------------------------------------
   • QuickAccessWidget is a presentation-layer component.

   • The widget must receive capabilities that have already
     been resolved for availability, entitlement and
     visibility.

   • The widget must not independently decide whether a
     learner is entitled to a capability.

   • QuickAccessCard remains the authoritative renderer for
     individual Quick Access cards.

   • A card that cannot produce valid rendered output must
     not leave an empty or broken dashboard element.

   • When no cards render successfully, the complete Quick
     Access section must be hidden.

   • The safe presentation default is hidden.

   Required Contracts
   ----------------------------------------------------------
   Container:

       #dashboardQuickAccess

   Preferred section:

       #dashboardQuickAccessSection

   Compatibility fallback:

       Closest ancestor matching .dashboard-section

   Dashboard helper methods:

       getElement()
       setHtml()
       clearElement()

   Change History
   ----------------------------------------------------------
   v1.1.0

   • Added complete empty-section hiding
   • Added successful-render filtering
   • Added safe dependency validation
   • Added preferred section ID support
   • Added closest-section compatibility fallback
   • Added rendering lifecycle events
   • Added defensive error recovery
   • Preserved presentation-only architecture

   v1.0.0

   • Introduced Dashboard Quick Access Widget
   • Added Quick Access card delegation
   • Added empty container handling

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
        "QuickAccessWidget";

    const MODULE_VERSION =
        "1.1.0";


    /* ======================================================
       VALUE HELPERS
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
       EVENT PUBLISHING
    ====================================================== */

    function publishEvent(
        eventName,
        detail = {}
    ) {

        try {

            document.dispatchEvent(

                new CustomEvent(
                    eventName,
                    {
                        detail: {

                            source:
                                MODULE_NAME,

                            version:
                                MODULE_VERSION,

                            timestamp:
                                new Date()
                                    .toISOString(),

                            ...detail

                        }
                    }
                )

            );

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to publish ${eventName}.`,
                error
            );

        }

    }


    /* ======================================================
       DASHBOARD CONTRACT VALIDATION
    ====================================================== */

    function isValidDashboard(
        dashboard
    ) {

        return Boolean(

            dashboard &&

            typeof dashboard.getElement ===
                "function" &&

            typeof dashboard.setHtml ===
                "function" &&

            typeof dashboard.clearElement ===
                "function"

        );

    }


    /* ======================================================
       CARD RENDERER VALIDATION
    ====================================================== */

    function resolveCardRenderer() {

        if (
            !window.QuickAccessCard ||
            typeof window.QuickAccessCard.render !==
                "function"
        ) {

            return null;

        }

        return window.QuickAccessCard;

    }


    /* ======================================================
       SECTION RESOLUTION
    ====================================================== */

    function resolveSection(
        dashboard,
        container
    ) {

        const governedSection =
            dashboard.getElement(
                "dashboardQuickAccessSection"
            );

        if (
            governedSection
        ) {

            return governedSection;

        }

        try {

            return container.closest(
                ".dashboard-section"
            );

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to resolve the Quick Access section.`,
                error
            );

            return null;

        }

    }


    /* ======================================================
       SECTION VISIBILITY
    ====================================================== */

    function setSectionVisibility(
        section,
        visible
    ) {

        if (
            !section
        ) {

            return;

        }

        const isVisible =
            Boolean(
                visible
            );

        try {

            section.hidden =
                !isVisible;

            section.setAttribute(
                "aria-hidden",
                isVisible
                    ? "false"
                    : "true"
            );

            section.dataset.quickAccessState =
                isVisible
                    ? "available"
                    : "empty";

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to update section visibility.`,
                error
            );

        }

    }


    /* ======================================================
       EMPTY STATE

       Empty Quick Access does not render a placeholder card.

       The complete section is hidden because a visible empty
       navigation area provides no learner value.
    ====================================================== */

    function renderEmpty(
        dashboard,
        container,
        section,
        reason = "no-items"
    ) {

        try {

            dashboard.clearElement(
                container
            );

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to clear Quick Access content.`,
                error
            );

        }

        setSectionVisibility(
            section,
            false
        );

        publishEvent(
            "dashboard:quick-access-empty",
            {
                reason
            }
        );

        return Object.freeze({

            rendered:
                false,

            count:
                0,

            reason

        });

    }


    /* ======================================================
       INDIVIDUAL CARD RENDERING
    ====================================================== */

    function renderCard(
        cardRenderer,
        item,
        index
    ) {

        try {

            const html =
                cardRenderer.render(
                    item
                );

            const normalizedHtml =
                normalizeString(
                    html
                );

            if (
                !normalizedHtml
            ) {

                console.warn(
                    `[${MODULE_NAME}] Card ${index} produced no rendered output.`,
                    item
                );

                return "";

            }

            return normalizedHtml;

        } catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] Quick Access card ${index} failed to render.`,
                item,
                error
            );

            return "";

        }

    }


    /* ======================================================
       QUICK ACCESS RENDERING
    ====================================================== */

    function render(
        items,
        dashboard
    ) {

        if (
            !isValidDashboard(
                dashboard
            )
        ) {

            console.error(
                `[${MODULE_NAME}] Dashboard helper contract is unavailable.`
            );

            publishEvent(
                "dashboard:quick-access-failed",
                {
                    reason:
                        "dashboard-contract-unavailable"
                }
            );

            return Object.freeze({

                rendered:
                    false,

                count:
                    0,

                reason:
                    "dashboard-contract-unavailable"

            });

        }

        const container =
            dashboard.getElement(
                "dashboardQuickAccess"
            );

        if (
            !container
        ) {

            console.warn(
                `[${MODULE_NAME}] Quick Access container is unavailable.`
            );

            publishEvent(
                "dashboard:quick-access-failed",
                {
                    reason:
                        "container-unavailable"
                }
            );

            return Object.freeze({

                rendered:
                    false,

                count:
                    0,

                reason:
                    "container-unavailable"

            });

        }

        const section =
            resolveSection(
                dashboard,
                container
            );

        /*
         * Safe presentation default.
         *
         * The section becomes visible only after at least one
         * card produces valid rendered output.
         */

        setSectionVisibility(
            section,
            false
        );

        const normalizedItems =
            Array.isArray(
                items
            )
                ? items
                : [];

        if (
            normalizedItems.length ===
                0
        ) {

            return renderEmpty(
                dashboard,
                container,
                section,
                "no-items"
            );

        }

        const cardRenderer =
            resolveCardRenderer();

        if (
            !cardRenderer
        ) {

            console.error(
                `[${MODULE_NAME}] QuickAccessCard renderer is unavailable.`
            );

            return renderEmpty(
                dashboard,
                container,
                section,
                "card-renderer-unavailable"
            );

        }

        const renderedCards =
            normalizedItems
                .map(
                    function (
                        item,
                        index
                    ) {

                        return renderCard(
                            cardRenderer,
                            item,
                            index
                        );

                    }
                )
                .filter(
                    Boolean
                );

        if (
            renderedCards.length ===
                0
        ) {

            return renderEmpty(
                dashboard,
                container,
                section,
                "no-renderable-items"
            );

        }

        try {

            dashboard.setHtml(
                container,
                renderedCards.join("")
            );

            setSectionVisibility(
                section,
                true
            );

            publishEvent(
                "dashboard:quick-access-rendered",
                {
                    requestedCount:
                        normalizedItems.length,

                    renderedCount:
                        renderedCards.length
                }
            );

            return Object.freeze({

                rendered:
                    true,

                count:
                    renderedCards.length,

                reason:
                    "rendered"

            });

        } catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] Unable to populate Quick Access content.`,
                error
            );

            return renderEmpty(
                dashboard,
                container,
                section,
                "container-render-failed"
            );

        }

    }


    /* ======================================================
       PUBLIC API
    ====================================================== */

    window.QuickAccessWidget =
        Object.freeze({

            render,

            renderEmpty,

            getState() {

                return Object.freeze({

                    ready:
                        Boolean(
                            resolveCardRenderer()
                        ),

                    version:
                        MODULE_VERSION

                });

            }

        });


    console.info(
        `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
    );


})(window, document);