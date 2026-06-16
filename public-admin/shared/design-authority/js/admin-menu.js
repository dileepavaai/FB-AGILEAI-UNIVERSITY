/* ==================================================
   ADMIN NAVIGATION AUTHORITY
   Version: 1.0.0
   Status: PILOT DEPLOYED

   Purpose
   ------------------------------------------
   Single source of truth for all Admin
   navigation surfaces.

   Governance
   ------------------------------------------
   - Introduced centralized admin menu authority
   - Introduced centralized admin sidebar renderer
   - Credential Operations adopted as pilot surface
   - Legacy pages remain compatible
   - Active-state conflicts eliminated
   - Future menu additions managed from a
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
   New admin navigation items must be added
   here first before being rendered across
   admin surfaces.
================================================== */

export const ADMIN_MENU = [

  {
    id: "dashboard",
    label: "Dashboard",
    href: "/index.html"
  },

  {
    id: "lead-intelligence",
    label: "Lead Intelligence",
    href: "/leads.html"
  },

  {
    id: "credential-operations",
    label: "Credential Operations",
    href: "/credential-operations/"
  },

  {
    id: "trainer-management",
    label: "Trainer Management",
    href: "/trainer-management/"
},
  
  {
    id: "reconciliation",
    label: "Reconciliation",
    href: "/reconciliation.html"
  },

  {
    id: "audit-logs",
    label: "Audit Logs",
    href: "/audit-logs.html"
  }

];