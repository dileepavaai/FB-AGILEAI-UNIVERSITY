/* ==================================================
   ADMIN NAVIGATION AUTHORITY
   Version: 1.1.0
   Status: PILOT DEPLOYED

   Purpose
   ------------------------------------------
   Single source of truth for all Admin
   navigation surfaces.

   Governance
   ------------------------------------------
   - Introduced centralized Admin menu authority
   - Introduced centralized Admin sidebar renderer
   - Credential Operations adopted as a pilot surface
   - Learning Resource Management registered as an
     authoritative Admin publication surface
   - Legacy Admin pages remain compatible
   - Active-state conflicts are eliminated
   - Future menu additions are managed through this
     single navigation authority file

   Architecture
   ------------------------------------------
   ADMIN_MENU
        ↓
   loadAdminSidebar()
        ↓
   Admin Surfaces

   Change Policy
   ------------------------------------------
   New Admin navigation items must be registered
   here before being rendered across Admin surfaces.

   Existing IDs and URLs must not be changed without
   reviewing all dependent Admin surfaces.

   Change History
   ------------------------------------------
   v1.1.0
   - Added Learning Resource Management
   - Preserved all existing navigation IDs
   - Preserved all existing navigation URLs

   v1.0.0
   - Established centralized Admin navigation
================================================== */

export const ADMIN_MENU = Object.freeze([

  Object.freeze({
    id: "dashboard",
    label: "Dashboard",
    href: "/index.html"
  }),

  Object.freeze({
    id: "lead-intelligence",
    label: "Lead Intelligence",
    href: "/leads.html"
  }),

  Object.freeze({
    id: "credential-operations",
    label: "Credential Operations",
    href: "/credential-operations/"
  }),

  Object.freeze({
    id: "learning-resource-management",
    label: "Learning Resource Management",
    href: "/learning-resource-management/"
  }),

  Object.freeze({
    id: "trainer-management",
    label: "Trainer Management",
    href: "/trainer-management/"
  }),

  Object.freeze({
    id: "reconciliation",
    label: "Reconciliation",
    href: "/reconciliation.html"
  }),

  Object.freeze({
    id: "audit-logs",
    label: "Audit Logs",
    href: "/audit-logs.html"
  })

]);