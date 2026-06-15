# ADMIN NAVIGATION AUTHORITY

Version: 1.0.0
Status: PILOT DEPLOYED
Date: 2026-06-15

---

## Purpose

Establish a centralized navigation authority for all Admin surfaces.

This architecture eliminates duplicated sidebar definitions, reduces maintenance effort, prevents active-state inconsistencies, and provides a single source of truth for Admin navigation.

---

## Architecture

ADMIN_MENU
↓
loadAdminSidebar()
↓
adminSidebarContainer
↓
Rendered Admin Navigation

---

## Components

### Navigation Authority

File:

shared/design-authority/js/admin-menu.js

Responsibilities:

* Defines all Admin navigation items
* Maintains navigation order
* Acts as the single source of truth

---

### Sidebar Renderer

File:

shared/design-authority/js/admin-sidebar.js

Responsibilities:

* Renders navigation dynamically
* Supports single active menu state
* Provides consistent Admin UX

---

### Legacy Compatibility

File:

assets/js/admin-app.js

Compatibility Rule:

Legacy pages that still contain hardcoded sidebars continue to use the existing highlightActiveSidebar() mechanism.

Pages using adminSidebarContainer are exempt from legacy highlighting.

This allows gradual migration without breaking existing surfaces.

---

## Pilot Surface

Credential Operations

File:

credential-operations/index.html

Status:

First Admin surface migrated to centralized navigation authority.

---

## Governance Rules

1. ADMIN_MENU is the authoritative source for Admin navigation.

2. New Admin menu items must be added only through ADMIN_MENU.

3. New Admin surfaces should use:

loadAdminSidebar(activeId)

instead of hardcoded sidebar markup.

4. Only one navigation item may be active at any time.

5. Legacy surfaces may remain unchanged until formally migrated.

6. Migration is incremental and non-breaking.

---

## Benefits

* Introduced centralized admin menu authority.
* Introduced centralized admin sidebar renderer.
* Credential Operations adopted as pilot surface.
* Legacy pages remain compatible.
* Active-state conflicts eliminated.
* Future menu additions can be managed from a single navigation authority file.

---

## Future Rollout Candidates

* Dashboard
* Lead Intelligence
* Reconciliation
* Audit Logs

Migration is optional and may occur incrementally.
