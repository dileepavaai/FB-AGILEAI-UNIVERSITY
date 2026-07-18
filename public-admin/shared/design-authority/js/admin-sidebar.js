/* ==================================================
   ADMIN SIDEBAR
   Version: 1.1.0
   Status: ACTIVE

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

   Styling Authority
   ------------------------------------------
   /shared/design-authority/css/admin-sidebar.css

   Governance
   ------------------------------------------
   - Single navigation authority
   - Single sidebar renderer
   - Single active menu item
   - No hardcoded sidebar duplication
   - Consistent Admin UX across all surfaces
   - Centralized sidebar styling
   - Backward-safe repeated initialization

   Change History
   ------------------------------------------
   v1.1.0
   - Added centralized sidebar stylesheet loading
   - Prevented duplicate stylesheet injection
   - Added navigation accessibility attributes
   - Added aria-current to the active menu item
   - Preserved existing ADMIN_MENU contract
   - Preserved existing loadAdminSidebar() API

   v1.0.0
   - Established centralized Admin navigation renderer
================================================== */

import {
  ADMIN_MENU
} from "./admin-menu.js";


/* ==================================================
   CENTRALIZED STYLESHEET AUTHORITY
================================================== */

const ADMIN_SIDEBAR_STYLESHEET_ID =
  "admin-sidebar-authority-styles";

const ADMIN_SIDEBAR_STYLESHEET_HREF =
  "/shared/design-authority/css/admin-sidebar.css";


/* ==================================================
   ENSURE CENTRALIZED SIDEBAR STYLES
   ------------------------------------------
   The stylesheet is appended to <head> so it loads
   after page-specific stylesheets and can consistently
   govern the Admin sidebar presentation.
================================================== */

function ensureAdminSidebarStyles() {

  const existingStylesheet =
    document.getElementById(
      ADMIN_SIDEBAR_STYLESHEET_ID
    );

  if (existingStylesheet) {
    return existingStylesheet;
  }

  const stylesheet =
    document.createElement(
      "link"
    );

  stylesheet.id =
    ADMIN_SIDEBAR_STYLESHEET_ID;

  stylesheet.rel =
    "stylesheet";

  stylesheet.href =
    ADMIN_SIDEBAR_STYLESHEET_HREF;

  stylesheet.dataset.authority =
    "admin-sidebar";

  document.head.appendChild(
    stylesheet
  );

  return stylesheet;

}


/* ==================================================
   SIDEBAR RENDERER
================================================== */

export function loadAdminSidebar(
  activeId = ""
) {

  ensureAdminSidebarStyles();


  const container =
    document.getElementById(
      "adminSidebarContainer"
    );


  if (!container) {

    console.warn(
      "[AdminSidebar] Container not found:",
      "adminSidebarContainer"
    );

    return;

  }


  let html =
    `
    <nav
      class="sidebar"
      id="adminNav"
      aria-label="Admin navigation">

      <ul>
    `;


  ADMIN_MENU.forEach(
    (item) => {

      const isActive =
        activeId === item.id;


      html +=
        `
        <li>

          <a
            href="${item.href}"
            class="${
              isActive
                ? "active"
                : ""
            }"
            ${
              isActive
                ? 'aria-current="page"'
                : ""
            }>

            ${item.label}

          </a>

        </li>
        `;

    }
  );


  html +=
    `
      </ul>

    </nav>
    `;


  container.innerHTML =
    html;


  console.info(
    "[AdminSidebar] Navigation rendered:",
    {
      activeId:
        activeId || null,

      menuItems:
        ADMIN_MENU.length
    }
  );

}


/* ==================================================
   MODULE EXPORT
================================================== */

export const AdminSidebar = Object.freeze({

  version:
    "1.1.0",

  loadAdminSidebar

});