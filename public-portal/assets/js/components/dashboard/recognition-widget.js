/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : recognition-widget.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2D

   Purpose
   ----------------------------------------------------------
   Dashboard Recognition Widget

   Renders the Recent Recognitions section of the
   Student & Executive Dashboard.

   Responsibilities

   ✓ Render Recognition Cards
   ✓ Render Empty Recognition State
   ✓ Delegate Recognition Card Rendering
   ✓ Populate Dashboard Recognition Section

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ API Calls
   ✗ Dashboard Orchestration
   ✗ HTML Generation Outside Widget Scope

   Governance

   • Dashboard Recognition Widget Authority
   • Presentation Layer
   • Stateless Renderer
   • Single Responsibility
   • Enterprise Portal Standard

   Dependencies

   • DashboardWidgets DOM Helpers
   • RecognitionCard

   Notes

   DashboardWidgets owns all shared DOM helper
   methods including:

   • getElement()
   • setText()
   • setHtml()
   • clearElement()

   RecognitionCard is the authoritative renderer
   for individual recognition cards.

========================================================== */

(function (window) {

    "use strict";

    const RecognitionWidget = {

        /* ==================================================
           RECENT RECOGNITIONS
        ================================================== */

        render(
            recognitions,
            dashboard
        ) {

            if (
                !dashboard ||
                !Array.isArray(recognitions)
            ) {
                return;
            }

            const container =
                dashboard.getElement(
                    "recentRecognitions"
                );

            if (!container) {
                return;
            }

            /*
             * Recognition Card Component
             * is the authoritative renderer.
             */

            if (

                !window.RecognitionCard ||

                typeof window.RecognitionCard.render !==
                    "function"

            ) {

                return;

            }

            if (recognitions.length === 0) {

                dashboard.clearElement(
                    container
                );

                return;

            }

            dashboard.setHtml(

                container,

                recognitions

                    .map(function (recognition) {

                        return window
                            .RecognitionCard
                            .render(
                                recognition
                            );

                    })

                    .join("")

            );

        }

    };

    Object.freeze(
        RecognitionWidget
    );

    window.RecognitionWidget =
        RecognitionWidget;

})(window);