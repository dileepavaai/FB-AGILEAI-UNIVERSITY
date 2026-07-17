/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : widgets.js
   Version   : 3.1.0
   Status    : ACTIVE
   Phase     : Dashboard Value Hardening

   Purpose
   ----------------------------------------------------------
   Coordinates governed dashboard widget rendering and
   provides shared DOM helper functions used by individual
   dashboard widgets.

   Responsibilities
   ----------------------------------------------------------
   ✓ Coordinate dashboard widget rendering
   ✓ Delegate rendering to individual widgets
   ✓ Contain individual widget failures
   ✓ Validate optional widget dependencies
   ✓ Provide shared DOM helper functions
   ✓ Publish dashboard composition lifecycle events
   ✓ Avoid logging learner or credential ViewModels
   ✓ Return a stable composition result

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Individual widget rendering
   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement resolution
   ✗ Capability visibility decisions
   ✗ Firestore access
   ✗ Storage access
   ✗ Business logic
   ✗ API calls
   ✗ Widget HTML generation
   ✗ Dashboard data mutation

   Architectural Position
   ----------------------------------------------------------
   DashboardRenderer
        ↓
   DashboardWidgets
        ├── ProfileWidget
        ├── KPIWidget
        ├── QuickAccessWidget
        ├── UpgradeWidget
        ├── CredentialWidget
        ├── RecognitionWidget
        └── NotificationWidget

   Governance
   ----------------------------------------------------------
   • DashboardWidgets is the dashboard composition root.

   • Individual widgets remain responsible for their own
     presentation and empty states.

   • Failure in one optional widget must not prevent other
     dashboard widgets from rendering.

   • Complete dashboard, learner, entitlement, credential or
     upgrade ViewModels must not be written to the production
     console.

   • Shared DOM helper functions remain centralized here.

   • DashboardWidgets must not decide business availability
     or learner entitlement.

   Dependencies
   ----------------------------------------------------------
   Optional widget components:

   • ProfileWidget
   • KPIWidget
   • QuickAccessWidget
   • UpgradeWidget
   • CredentialWidget
   • RecognitionWidget
   • NotificationWidget

   Change History
   ----------------------------------------------------------
   v3.1.0

   • Removed complete dashboard ViewModel console logging
   • Added safe widget dependency validation
   • Added isolated widget failure handling
   • Added stable composition result
   • Added dashboard composition lifecycle events
   • Added defensive data normalization
   • Preserved shared DOM helper authority
   • Preserved individual widget ownership

   v3.0.0

   • Introduced Dashboard Widget Orchestrator
   • Extracted dedicated dashboard widgets
   • Centralized Dashboard Composition
   • Retained shared DOM helper authority

   v2.0.0

   • Dashboard Widget Renderer

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
        "DashboardWidgets";

    const MODULE_VERSION =
        "3.1.0";


    /* ======================================================
       VALUE HELPERS
    ====================================================== */

    function normalizeObject(
        value
    ) {

        if (
            value &&
            typeof value ===
                "object" &&
            !Array.isArray(
                value
            )
        ) {

            return value;

        }

        return {};

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
       WIDGET RESOLUTION
    ====================================================== */

    function resolveWidget(
        widgetName
    ) {

        const widget =
            window[
                widgetName
            ];

        if (
            !widget ||
            typeof widget.render !==
                "function"
        ) {

            return null;

        }

        return widget;

    }


    /* ======================================================
       SAFE WIDGET DELEGATION
    ====================================================== */

    function renderWidget(
        widgetName,
        renderArguments
    ) {

        const widget =
            resolveWidget(
                widgetName
            );

        if (
            !widget
        ) {

            console.warn(
                `[${MODULE_NAME}] ${widgetName} is unavailable.`
            );

            return Object.freeze({

                widget:
                    widgetName,

                rendered:
                    false,

                reason:
                    "widget-unavailable"

            });

        }

        try {

            const result =
                widget.render(
                    ...renderArguments
                );

            return Object.freeze({

                widget:
                    widgetName,

                rendered:
                    true,

                reason:
                    "delegated",

                result:
                    result ?? null

            });

        } catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] ${widgetName} rendering failed.`,
                error
            );

            return Object.freeze({

                widget:
                    widgetName,

                rendered:
                    false,

                reason:
                    "widget-render-failed"

            });

        }

    }


    /* ======================================================
       DASHBOARD COMPOSITION
    ====================================================== */

    function render(
        data = {}
    ) {

        const dashboard =
            normalizeObject(
                data
            );

        publishEvent(
            "dashboard:widgets-render-started"
        );

        const results = [

            renderWidget(
                "ProfileWidget",
                [
                    dashboard.profile,
                    dashboard.membership,
                    dashboard.summary,
                    DashboardWidgets
                ]
            ),

            renderWidget(
                "KPIWidget",
                [
                    dashboard.kpi,
                    DashboardWidgets
                ]
            ),

            renderWidget(
                "QuickAccessWidget",
                [
                    dashboard.quickAccess,
                    DashboardWidgets
                ]
            ),

            renderWidget(
                "UpgradeWidget",
                [
                    dashboard.upgrade,
                    DashboardWidgets
                ]
            ),

            renderWidget(
                "CredentialWidget",
                [
                    dashboard.recentCredentials,
                    DashboardWidgets
                ]
            ),

            renderWidget(
                "RecognitionWidget",
                [
                    dashboard.recentRecognitions,
                    DashboardWidgets
                ]
            ),

            renderWidget(
                "NotificationWidget",
                [
                    dashboard.notifications,
                    DashboardWidgets
                ]
            )

        ];

        const renderedCount =
            results.filter(
                result =>
                    result.rendered
            )
                .length;

        const failedCount =
            results.length -
            renderedCount;

        console.info(
            `[${MODULE_NAME}] Dashboard composition completed.`,
            {
                delegated:
                    renderedCount,

                unavailableOrFailed:
                    failedCount
            }
        );

        publishEvent(
            "dashboard:widgets-render-completed",
            {
                delegatedCount:
                    renderedCount,

                unavailableOrFailedCount:
                    failedCount
            }
        );

        return Object.freeze({

            rendered:
                failedCount === 0,

            delegatedCount:
                renderedCount,

            unavailableOrFailedCount:
                failedCount,

            results:
                Object.freeze(
                    results
                )

        });

    }


    /* ======================================================
       DOM HELPERS
    ====================================================== */

    function getElement(
        id
    ) {

        if (
            typeof id !==
                "string" ||
            !id.trim()
        ) {

            return null;

        }

        return document.getElementById(
            id
        );

    }


    function setText(
        element,
        value
    ) {

        if (
            !element
        ) {

            return false;

        }

        element.textContent =
            value ?? "";

        return true;

    }


    function setHtml(
        element,
        html
    ) {

        if (
            !element
        ) {

            return false;

        }

        element.innerHTML =
            html ?? "";

        return true;

    }


    function clearElement(
        element
    ) {

        return setHtml(
            element,
            ""
        );

    }


    /* ======================================================
       PUBLIC API
    ====================================================== */

    const DashboardWidgets = {

        render,

        getElement,

        setText,

        setHtml,

        clearElement,

        getState() {

            return Object.freeze({

                ready:
                    true,

                version:
                    MODULE_VERSION

            });

        }

    };


    Object.freeze(
        DashboardWidgets
    );


    window.DashboardWidgets =
        DashboardWidgets;


    console.info(
        `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
    );


})(window, document);