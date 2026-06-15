/* ==================================================
   ADMIN SIDEBAR
   Version: 1.0.0
   Status: LOCKED

   Purpose
   ------------------------------------------
   Centralized Admin Navigation Renderer

   Architecture
   ------------------------------------------
   ADMIN_MENU
        ↓
   loadAdminSidebar()
        ↓
   adminSidebarContainer

   Governance
   ------------------------------------------
   - Single navigation authority
   - Single active menu
   - No hardcoded sidebar duplication
   - Consistent Admin UX
================================================== */

import { ADMIN_MENU }
  from "./admin-menu.js";

export function loadAdminSidebar(
  activeId = ""
) {

  const container =
    document.getElementById(
      "adminSidebarContainer"
    );

  if (!container) {
    return;
  }

  let html =
    `
    <nav
      class="sidebar"
      id="adminNav"
      style="display:block;">

      <ul>
    `;

  ADMIN_MENU.forEach(item => {

    html +=
      `
      <li>

        <a
          href="${item.href}"
          class="${
            activeId === item.id
              ? "active"
              : ""
          }">

          ${item.label}

        </a>

      </li>
    `;

  });

  html +=
    `
      </ul>

    </nav>
  `;

  container.innerHTML = html;

}