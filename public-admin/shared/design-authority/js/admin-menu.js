/* ==================================================
   ADMIN NAVIGATION AUTHORITY
   Version: 1.0.0
   Status: LOCKED

   Purpose
   ------------------------------------------
   Single source of truth for all Admin
   navigation surfaces.

   Architecture
   ------------------------------------------
   Dashboard
   Lead Intelligence
   Credential Operations
   Trainer Management
   Reconciliation
   Audit Logs

   Governance
   ------------------------------------------
   - One active menu only
   - No duplicated sidebar definitions
   - Centralized navigation control
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
    href: "/trainer-management/dashboard/index.html"
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