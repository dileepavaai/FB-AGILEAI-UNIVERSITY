# Design Authority Replication Protocol v1.0

**Organization:** Agile AI University\
**Status:** LOCKED\
**Effective Date:** 24 Feb 2026\
**Applies To:** All Public Hosting Surfaces\
**Authority Level:** Governance --- Architectural

------------------------------------------------------------------------

## 1. Purpose

This protocol defines how the Institutional Design Authority layer is
maintained, replicated, and governed across Firebase multi-hosting
surfaces.

It ensures: - Architectural stability\
- Deterministic UI behavior\
- Institutional consistency\
- Controlled propagation of design changes\
- Protection against cross-surface drift

------------------------------------------------------------------------

## 2. Architectural Context

Due to Firebase multi-hosting isolation: - Each hosting target
(public-site, public-certs, public-portal, etc.) must be fully
self-contained. - A hosting surface cannot reference files outside its
own public root.

Therefore: - Root-level `shared/design-authority/` is NOT
runtime-authoritative. - Each surface must contain its own runtime copy
of the design authority layer.

------------------------------------------------------------------------

## 3. Authority Model

### 3.1 Development Authority (MASTER)

`/shared/design-authority/`

All structural, styling, and navigation updates must originate here.

### 3.2 Runtime Authority (Surface Copies)

Each public surface must contain: `/public-*/shared/design-authority/`

These copies are runtime-authoritative for their hosting target.

------------------------------------------------------------------------

## 4. Replication Protocol

Step 1 --- Modify Master\
Step 2 --- Intentional Replication\
Step 3 --- Commit Discipline\
Step 4 --- Surface-Specific Deployment

------------------------------------------------------------------------

## 5. Drift Prevention Rule

Editing a surface-level copy directly is prohibited.\
Master must always be updated first.

------------------------------------------------------------------------

## 6. Structural Protection Rules

Protected: - Header DOM structure\
- Navigation logic\
- Data-surface architecture\
- Data-path active-state detection\
- Theme toggle structure\
- Mobile navigation behavior

------------------------------------------------------------------------

## 7. Versioning Discipline

Each design-authority file must include: - Governance Baseline\
- Current Version\
- Status\
- Scope

------------------------------------------------------------------------

## 8. Current Active Model

/shared/design-authority (MASTER)\
/public-site/shared/design-authority\
/public-certs/shared/design-authority

------------------------------------------------------------------------

## 9. Governance Status

ACTIVE · LOCKED · Architecturally Binding

------------------------------------------------------------------------

**End of Document**
