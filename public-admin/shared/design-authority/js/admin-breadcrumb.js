/* =========================================================
   Agile AI University
   Admin Breadcrumb Service

   File:
   public-admin/shared/design-authority/js/admin-breadcrumb.js

   Version:
   1.0.0

   Status:
   ACTIVE

   Purpose:
   Centralized breadcrumb rendering service for the
   Public Admin platform.

   Governance:
   - Breadcrumb rendering authority
   - Read-only UI service
   - No routing ownership
   - No authentication ownership
   - No navigation ownership

   Scope:
   public-admin/*

   Supported Modules:
   - Credential Operations
   - Trainer Management
   - Governance
   - Audit Logs
   - Reconciliation
   - Future Admin Modules

   Page Contract:

   Pages must provide:

   window.adminBreadcrumb = [
     {
       label: "Admin",
       href: "/index.html"
     },
     {
       label: "Credential Operations",
       href: "/credential-operations/index.html"
     },
     {
       label: "Batch Management"
     }
   ];

   Pages must contain:

   <div id="adminBreadcrumbContainer"></div>

   Ownership:
   Shared Design Authority

   ========================================================= */

export function renderAdminBreadcrumb() {

  const container =
    document.getElementById(
      "adminBreadcrumbContainer"
    );

  if (!container) {
    return;
  }

  const items =
    window.adminBreadcrumb || [];

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    container.innerHTML = "";
    return;
  }

  const html = items
    .map((item, index) => {

      const isLast =
        index === items.length - 1;

      const label =
        item?.label || "";

      if (isLast) {
        return `
          <span
            class="admin-breadcrumb-current"
            aria-current="page"
          >
            ${label}
          </span>
        `;
      }

      return `
        <a
          href="${item?.href || "#"}"
          class="admin-breadcrumb-link"
        >
          ${label}
        </a>
      `;
    })
    .join(`
      <span
        class="admin-breadcrumb-separator"
        aria-hidden="true"
      >
        /
      </span>
    `);

  container.innerHTML = `
    <nav
      class="admin-breadcrumb"
      aria-label="Breadcrumb"
    >
      ${html}
    </nav>
  `;
}