# Portal Entitlement Layer

**Agile AI University**

---

## Document Information

| Attribute  | Value                         |
| ---------- | ----------------------------- |
| Document   | Portal Entitlement Layer      |
| File       | `portal-entitlement-layer.md` |
| Version    | 1.0.0                         |
| Status     | **LOCKED**                    |
| Governance | Portal Governance v1.0        |
| Owner      | Agile AI University           |

---

# Purpose

This document defines the Entitlement Layer architecture of the Agile AI University Portal.

The Entitlement Layer is responsible for retrieving, publishing, and resolving governed entitlement information that determines a user's Portal experiences.

It represents the single source of truth for all Portal capability decisions after successful authentication and authorization.

---

# Scope

This document applies to:

* Student Portal
* Executive Portal
* Administrative Portal
* Future Trainer Portal
* Future Partner Portal
* Future Executive Experiences

---

# Architectural Position

```text
Authentication
        │
        ▼
Authorization
        │
        ▼
Entitlement Retrieval
        │
        ▼
Entitlement Resolution
        │
        ▼
Portal Services
        │
        ▼
Portal User Interface
```

The Entitlement Layer begins only after successful authentication and authorization.

---

# Architectural Principle

Authentication establishes identity.

Authorization grants Portal entry.

Entitlement determines **what the authenticated and authorized user may experience**.

These three responsibilities remain permanently separated.

---

# Layer Responsibilities

The Entitlement Layer consists of two governed sub-layers.

## 1. Entitlement Retrieval Layer

Implemented by:

```text
entitlement.js
```

Responsibilities:

* Retrieve user credentials
* Retrieve executive entitlements
* Retrieve user entitlements
* Publish entitlement payload
* Dispatch entitlement lifecycle events

Must Never:

* Render UI
* Perform authorization
* Determine Portal visibility
* Filter credentials
* Make business decisions

---

## 2. Entitlement Resolution Layer

Implemented by:

```text
resolvePortalEntitlements.js
```

Responsibilities:

* Resolve Portal access type
* Resolve visible credentials
* Resolve executive precedence
* Normalize governed data
* Publish resolved Portal state

Must Never:

* Query Firestore
* Call APIs
* Render UI
* Perform authentication
* Perform authorization

---

# Entitlement Sources

The Entitlement Layer consumes governed data from multiple sources.

Current production sources include:

* User Credentials
* User Entitlements
* Executive Entitlements

Future sources may include:

* Memberships
* Course Enrollments
* Learning Pathways
* Assessments
* Organization Licenses
* Subscription Plans

The architecture is intentionally extensible.

---

# Entitlement Lifecycle

```text
Authentication

↓

Authorization

↓

Retrieve Credentials

↓

Retrieve User Entitlements

↓

Retrieve Executive Entitlements

↓

Publish Entitlement Payload

↓

Resolve Portal Entitlements

↓

Resolved Portal State

↓

Portal Services
```

---

# Resolver Inputs

The resolver consumes only governed input.

Typical inputs include:

* Authenticated user
* Credential collection
* User entitlement collection
* Executive entitlement collection

No UI components participate in the resolution process.

---

# Resolver Outputs

The resolver publishes a governed Portal state.

Typical outputs include:

* Portal access
* Executive Insight access
* Visible credentials
* UI state
* Future capability flags

The resolved output becomes the canonical source for downstream Portal services.

---

# Executive Precedence

Executive Insight is governed with absolute precedence.

If Executive Insight is available:

* Executive access is granted.
* Portal access is established.
* Executive UI experiences are enabled.

This precedence rule is implemented exclusively within the resolver.

---

# Credential Visibility

Credential visibility is determined solely by the Entitlement Resolver.

Rules include:

* Identity ownership validation
* Issued status validation
* Program eligibility
* Normalization

Presentation components must never perform credential filtering.

---

# Portal Access Resolution

Portal access may originate from:

* Executive entitlement
* Student Portal entitlement
* Credential ownership (Alumni)
* Future membership models

The Portal UI consumes only the final resolved access decision.

---

# Normalization

The resolver normalizes governed data before publication.

Examples include:

* Program code normalization
* Credential metadata normalization
* Issuer normalization
* Validity normalization

Normalization occurs exactly once.

---

# Entitlement Publication

The Retrieval Layer publishes raw entitlement payloads.

The Resolver publishes resolved Portal state.

Both publications are read-only for downstream consumers.

Consumers must never mutate entitlement state.

---

# Event Lifecycle

The Entitlement Layer publishes lifecycle events.

Current production event:

```text
entitlements:ready
```

Future events may include:

* entitlements:updated
* entitlements:expired
* executive:changed

Events communicate state changes only.

---

# Relationship to Services

Portal Services consume only resolved entitlement state.

Examples:

* credential-service.js
* recognition-service.js
* future assessment-service.js

Services must never duplicate resolver logic.

---

# Relationship to Renderers

Renderers consume service output only.

Renderers never consume entitlement collections directly.

This preserves separation between business logic and presentation.

---

# Governance Rules

The Entitlement Layer is the exclusive authority for:

* Portal access type
* Executive precedence
* Credential visibility
* Recognition eligibility
* Future capability enablement

No other Portal component may duplicate these decisions.

---

# Security Principles

The Entitlement Layer ensures:

* Identity-based entitlement resolution
* Single source of truth
* Deterministic outcomes
* Immutable downstream consumption
* Separation from presentation

---

# Failure Handling

If entitlement retrieval fails:

* Resolver execution must not proceed.
* Services must not initialize.
* Renderers must not render protected experiences.
* User-friendly error states should be displayed.

---

# Future Evolution

The Entitlement Layer is designed to support future governed capabilities, including:

* Assessment access
* Learning pathways
* Continuing education
* Membership programs
* Digital wallet eligibility
* Professional sharing permissions
* Organization-scoped entitlements
* Subscription-based capabilities

Future enhancements must integrate through the existing Retrieval and Resolution layers.

---

# Architectural Compliance Checklist

Every entitlement implementation should satisfy the following:

* Retrieval separated from resolution.
* Resolver remains pure and deterministic.
* No Firestore access in resolver.
* No UI rendering.
* No authorization logic.
* No presentation logic.
* Normalization performed once.
* Resolved state published as the canonical source.
* Services consume resolver output only.
* Renderers consume service output only.

---

# Governance Status

This document is the authoritative governance reference for the Entitlement Layer of the Agile AI University Portal.

The Entitlement Retrieval Layer and the Entitlement Resolution Layer collectively form the single source of truth for Portal capability decisions.

All Portal implementations shall conform to this architecture unless superseded by an approved governance revision.

---

**Status:** **LOCKED**

**Version:** **1.0.0**
