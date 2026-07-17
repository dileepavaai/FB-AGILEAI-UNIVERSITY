/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : dashboard-renderer.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Dashboard Value Hardening

   Purpose
   ----------------------------------------------------------
   Coordinates presentation-layer rendering of the governed
   Student & Executive Portal dashboard ViewModel.

   Responsibilities
   ----------------------------------------------------------
   ✓ Accept the resolved dashboard ViewModel
   ✓ Delegate rendering to DashboardWidgets
   ✓ Publish dashboard rendering lifecycle events
   ✓ Recover safely when widget rendering is unavailable
   ✓ Avoid logging learner or credential payloads
   ✓ Return a stable rendering result

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Business logic
   ✗ Authentication
   ✗ Authorization
   ✗ Entitlement resolution
   ✗ Eligibility decisions
   ✗ Capability visibility decisions
   ✗ Firestore access
   ✗ Storage access
   ✗ HTML generation
   ✗ Individual widget rendering
   ✗ Dashboard data mutation

   Architectural Position
   ----------------------------------------------------------
   DashboardService
        ↓
   Governed Dashboard ViewModel
        ↓
   DashboardRenderer
        ↓
   DashboardWidgets
        ↓
   Individual Widgets

   Governance
   ----------------------------------------------------------
   • DashboardRenderer is a stateless presentation
     coordinator.

   • DashboardWidgets remains the authoritative widget
     orchestration layer.

   • DashboardRenderer must never inspect or modify business
     meaning inside the ViewModel.

   • Complete dashboard, learner, entitlement or credential
     objects must not be written to the production console.

   • A widget rendering failure must be contained and
     reported without exposing learner data.

   Change History
   ----------------------------------------------------------
   v1.1.0

   • Removed complete dashboard ViewModel console logging
   • Added defensive ViewModel normalization
   • Added widget dependency validation
   • Added rendering lifecycle events
   • Added contained rendering failure handling
   • Added stable rendering result
   • Preserved presentation-only architecture

   v1.0.0

   • Introduced Dashboard Rendering Layer
   • Added DashboardWidgets delegation

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
        "DashboardRenderer";

    const MODULE_VERSION =
        "1.1.0";


    /* ======================================================
       OBJECT NORMALIZATION
    ====================================================== */

    function normalizeDashboard(
        dashboard
    ) {

        if (
            dashboard &&
            typeof dashboard ===
                "object" &&
            !Array.isArray(
                dashboard
            )
        ) {

            return dashboard;

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
       WIDGET LAYER RESOLUTION
    ====================================================== */

    function resolveWidgetLayer() {

        if (
            !window.DashboardWidgets ||
            typeof window.DashboardWidgets.render !==
                "function"
        ) {

            return null;

        }

        return window.DashboardWidgets;

    }


    /* ======================================================
       WIDGET RENDERING
    ====================================================== */

    function renderWidgets(
        dashboard
    ) {

        const widgetLayer =
            resolveWidgetLayer();

        if (
            !widgetLayer
        ) {

            console.error(
                `[${MODULE_NAME}] DashboardWidgets is unavailable.`
            );

            return Object.freeze({

                rendered:
                    false,

                reason:
                    "widget-layer-unavailable"

            });

        }

        try {

            widgetLayer.render(
                dashboard
            );

            return Object.freeze({

                rendered:
                    true,

                reason:
                    "rendered"

            });

        } catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] Widget rendering failed.`,
                error
            );

            return Object.freeze({

                rendered:
                    false,

                reason:
                    "widget-render-failed"

            });

        }

    }


    /* ======================================================
       COMPLETE DASHBOARD RENDER
    ====================================================== */

    function render(
        dashboard = {}
    ) {

        const normalizedDashboard =
            normalizeDashboard(
                dashboard
            );

        publishEvent(
            "dashboard:render-started"
        );

        const result =
            renderWidgets(
                normalizedDashboard
            );

        if (
            result.rendered
        ) {

            console.info(
                `[${MODULE_NAME}] Dashboard rendering completed.`
            );

            publishEvent(
                "dashboard:render-completed"
            );

        } else {

            publishEvent(
                "dashboard:render-failed",
                {
                    reason:
                        result.reason
                }
            );

        }

        return result;

    }


    /* ======================================================
       PUBLIC API
    ====================================================== */

    window.DashboardRenderer =
        Object.freeze({

            render,

            renderWidgets,

            getState() {

                return Object.freeze({

                    ready:
                        Boolean(
                            resolveWidgetLayer()
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