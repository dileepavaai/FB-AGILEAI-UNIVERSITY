# Dashboard Orchestration Layer

**Version:** 3.0.0  
**Status:** ACTIVE  
**Governance:** LOCKED  
**Owner:** Agile AI University

---

# 1. Purpose

The Dashboard Orchestration Layer is the Presentation Coordination Layer of the Agile AI University Student & Executive Portal.

Its responsibility is to orchestrate the complete learner dashboard after Authentication, Authorization, Entitlement Resolution and Resolver execution have completed.

The layer coordinates:

- Authentication State
- Authorization Result
- Entitlement Availability
- Resolver Output
- Dashboard Service
- Dashboard Renderer
- Dashboard Widgets
- Card Components
- Experience Launch

The Dashboard Orchestration Layer consumes upstream decisions and orchestrates presentation. It never creates business decisions.

---

# 2. Architectural Position

```text
User
 ↓
Authentication Layer
 ↓
Authorization Layer
 ↓
Entitlement Layer
 ↓
Resolver
 ↓
Dashboard Service
 ↓
Dashboard Orchestration Layer
 ↓
Dashboard Renderer
 ↓
Dashboard Widgets
 ↓
Card Components
 ↓
Experience Components
 ↓
Portal Experiences
```

The Dashboard Orchestration Layer is the final presentation orchestrator.

---

# 3. Responsibilities

- Consume authentication state
- Consume authorization result
- Consume resolver output
- Consume dashboard service data
- Coordinate dashboard rendering
- Coordinate widget rendering
- Coordinate card rendering
- Launch credential experiences
- Launch future learner experiences
- Coordinate presentation state
- Maintain dashboard visibility

---

# 4. Non-Responsibilities

The Dashboard Orchestration Layer must never:

- Authenticate users
- Sign users in or out
- Query Firestore
- Query Cloud Run
- Query Registries
- Resolve Entitlements
- Apply Business Rules
- Determine Authorization
- Render business HTML
- Render Credential Cards
- Render Widgets
- Render Overlays
- Duplicate Rendering Logic

---

# 5. Governance Principle

The layer is a Presentation Consumer.

It consumes:

- Authentication State
- Entitlement Data
- Resolver Output
- Authorization Decision
- Dashboard Service Output

It never produces these artifacts.

---

# 6. Authentication Boundary

Owned by:

- firebase-init.js
- portal-auth.js

The orchestration layer only consumes authenticated session state.

---

# 7. Entitlement Boundary

Owned by:

- entitlement.js

The orchestration layer consumes entitlement output and never queries Firestore or registries.

---

# 8. Resolver Boundary

Owned by:

- resolvePortalEntitlements.js

Resolver output is authoritative.

---

# 9. Authorization Boundary

Owned by:

- portal-authorization.js

Authorization decisions are consumed and never overridden.

---

# 10. Dashboard Rendering Model

```text
Dashboard Service
        ↓
Dashboard Renderer
        ↓
Dashboard Widgets
        ↓
Card Components
        ↓
Experience Components
```

Rendering is delegated through presentation layers.

---

# 11. Experience Orchestration

Current Experience

- Credential Detail

Future Experiences

- Recognition Detail
- Learning Journey
- Assessment Summary
- Upgrade Registration
- Executive Insights
- Wallet
- Student Services

Experiences open as overlays while the learner remains on the dashboard.

---

# 12. User Experiences

Supported experiences include:

- Anonymous User
- Authorized User
- Authenticated User with No Active Services
- Restricted User (future)

---

# 13. Credential Rendering

```text
Dashboard
 ↓
Credential Widget
 ↓
Credential Card
 ↓
Credential Detail Overlay
 ↓
Sections
```

The orchestration layer launches the experience and delegates rendering.

---

# 14. Executive Insight Rendering

Executive insight visibility is based entirely on resolver and authorization output.

---

# 15. Event Model

Typical orchestration events:

- DOMContentLoaded
- __AAIU_AUTH_READY__
- entitlements:ready
- credentials:ready

Each event invokes the orchestration pipeline.

---

# 16. Component Hierarchy

```text
Dashboard
 ↓
Widget
 ↓
Card
 ↓
Overlay
 ↓
Section
 ↓
Shared UI
```

Every level owns exactly one responsibility.

---

# 17. Design Patterns

- Observer Pattern
- Consumer Pattern
- Orchestrator Pattern
- Single Responsibility Principle

---

# 18. Historical Lessons Learned

Architecture revisions eliminated:

- Authentication race conditions
- Authorization race conditions
- Resolver timing issues
- Duplicate rendering
- Hidden UI defects
- Unauthorized redirect loops

---

# 19. Future Extension Points

- Recognition Detail
- Certificate Viewer
- Badge Viewer
- Learning Journey
- Assessment Summary
- Upgrade Registration
- Executive Insights
- AI Learning Assistant
- Digital Wallet
- Multi-Organisation Experiences

---

# 20. Governance Rules

1. Consume decisions; never create them.
2. Resolver output is authoritative.
3. Authorization output is authoritative.
4. Authentication completes before authorization.
5. Entitlements complete before resolver execution.
6. Business logic belongs in Services.
7. UI contains no business logic.
8. Presentation hierarchy shall be:

```text
Dashboard
 ↓
Widget
 ↓
Card
 ↓
Overlay
 ↓
Section
 ↓
Shared UI
```

9. Experiences remain overlay-based and dashboard-centric.

---

# 21. Related Documents

- portal-architecture.md
- experience-architecture.md
- portal-authentication-layer.md
- portal-authorization-layer.md
- portal-entitlement-layer.md
- ../credential-architecture.md
- ../firebase-hosting.md

---

# Status

Architecture Version: 3.0.0

Status: ACTIVE

Governance: LOCKED

This document is the authoritative reference for the Dashboard Orchestration Layer.
