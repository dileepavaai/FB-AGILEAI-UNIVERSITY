/*
==================================================
TRAINER MANAGEMENT NAVIGATION
Version: 1.0.0
Status: LOCKED
==================================================
*/

export const TRAINER_MENU = [

  {
    id: "dashboard",
    label: "Dashboard",
    href: "/trainer-management/dashboard/index.html"
  },

  {
    id: "registry",
    label: "Trainer Registry",
    href: "/trainer-management/registry/index.html"
  },

  {
    id: "batch-operations",
    label: "Batch Operations",
    children: [

      {
        id: "batch-issuance",
        label: "Batch Issuance",
        href: "/trainer-management/batch-operations/issuance/index.html"
      },

      {
        id: "batch-view",
        label: "Batch View",
        href: "/trainer-management/batch-operations/view/index.html"
      }

    ]
  },

  {
    id: "governance",
    label: "Governance",
    children: [

      {
        id: "accreditation",
        label: "Accreditation",
        href: "/trainer-management/governance/accreditation/index.html"
      },

      {
        id: "approvals",
        label: "Approvals",
        href: "/trainer-management/governance/approvals/index.html"
      },

      {
        id: "audit-logs",
        label: "Audit Logs",
        href: "/trainer-management/governance/audit-logs/index.html"
      }

    ]
  },

  {
    id: "trainer-analytics",
    label: "Trainer Analytics",
    href: "/trainer-management/trainer-analytics-dashboard/index.html"
  },

  {
    id: "reports",
    label: "Reports",
    href: "/trainer-management/reports/index.html"
  },

  {
    id: "settings",
    label: "Settings",
    href: "/trainer-management/settings/index.html"
  }

];