/*
==================================================
TRAINER SIDEBAR
Version: 1.0.0
Status: LOCKED
==================================================
*/

import { TRAINER_MENU }
  from "./trainer-menu.js";

export function loadTrainerSidebar(activeId = "") {

  const container =
    document.getElementById(
      "trainerSidebarContainer"
    );

  if (!container) return;

  let html =
    `
    <nav
      class="sidebar"
      id="adminNav"
      style="display:block;">

      <ul>
    `;

  TRAINER_MENU.forEach(item => {

    if (item.children) {

      html += `
        <li>
          <span class="sidebar-group">
            ${item.label}
          </span>

          <ul>
      `;

      item.children.forEach(child => {

        html += `
          <li>

            <a
              href="${child.href}"
              class="${
                activeId === child.id
                  ? "active"
                  : ""
              }">

              ${child.label}

            </a>

          </li>
        `;

      });

      html += `
          </ul>
        </li>
      `;

    } else {

      html += `
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

    }

  });

  html += `
      </ul>
    </nav>
  `;

  container.innerHTML = html;

}