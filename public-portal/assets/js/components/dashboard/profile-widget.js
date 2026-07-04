/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : profile-widget.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2D

   Purpose
   ----------------------------------------------------------
   Dashboard Profile Widget

   Renders the authenticated user's profile summary
   displayed within the dashboard sidebar.

   Responsibilities

   ✓ Render Sidebar User Name
   ✓ Render Membership Information
   ✓ Render Credential Portfolio Summary

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ API Calls
   ✗ Dashboard Orchestration
   ✗ HTML Generation Outside Widget Scope

   Governance

   • Dashboard Widget Authority
   • Presentation Layer
   • Stateless Renderer
   • Single Responsibility
   • Enterprise Portal Standard

   Dependencies

   • DashboardWidgets DOM Helpers

   Notes

   DashboardWidgets owns all shared DOM helper
   functions including:

   • getElement()
   • setText()
   • setHtml()
   • clearElement()

   This widget consumes those helpers and renders
   only the Profile Summary section.

========================================================== */

(function (window) {

    "use strict";

    const ProfileWidget = {

        /* ==================================================
           PROFILE SUMMARY
        ================================================== */

        render(
            profile,
            membership,
            summary,
            dashboard
        ) {

            if (
                !dashboard ||
                !summary
            ) {
                return;
            }

            dashboard.setText(

                dashboard.getElement(
                    "sidebarUserName"
                ),

                profile?.name || "Student"

            );

            dashboard.setText(

                dashboard.getElement(
                    "sidebarMembership"
                ),

                membership || ""

            );

            dashboard.setText(

                dashboard.getElement(
                    "sidebarCredentialCount"
                ),

                summary.portfolio?.credentials || 0

            );

        }

    };

    Object.freeze(
        ProfileWidget
    );

    window.ProfileWidget =
        ProfileWidget;

})(window);