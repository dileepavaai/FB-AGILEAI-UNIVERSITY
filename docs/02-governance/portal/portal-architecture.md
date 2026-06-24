# Portal Architecture

**Agile AI University**

---

## Document Information

| Attribute  | Value                    |
| ---------- | ------------------------ |
| Document   | Portal Architecture      |
| File       | `portal-architecture.md` |
| Version    | 1.0.0                    |
| Status     | **LOCKED**               |
| Governance | Portal Governance v1.0   |
| Owner      | Agile AI University      |

---

# Purpose

This document defines the logical, architectural, and operational design of the Agile AI University Portal ecosystem.

It establishes how authentication, authorization, entitlement resolution, portal experiences, credential services, recognition services, and user interface components interact while maintaining a strict separation of responsibilities.

This document is the architectural authority for all current and future Portal modules.

---

# Architectural Vision

The Agile AI University Portal is designed as a governed, service-oriented presentation platform.

Its primary objective is to provide authenticated users with secure access to credentials, recognitions, assessments, executive insight, and future learning experiences while ensuring that business logic remains isolated from presentation.

The Portal follows a layered architecture where each layer owns a single responsibility and communicates only with adjacent layers.

---

# Architectural Principles

The Portal architecture is governed by the following principles:

* Authentication precedes every secured experience.
* Authorization is independent from authentication.
* Entitlement Resolution is the single source of truth for access decisions.
* Business logic is isolated from the User Interface.
* Rendering and interaction are separate concerns.
* Every component has one clearly defined responsibility.
* Governance takes precedence over convenience.

---

# High-Level Architecture

```text
Public Internet
        │
        ▼
Firebase Hosting
        │
        ▼
Portal UI
        │
        ▼
Authentication Layer
        │
        ▼
Authorization Layer
        │
        ▼
Entitlement Resolution Layer
        │
        ▼
Feature Services
        │
        ├──────── Credentials
        ├──────── Recognitions
        ├──────── Executive Insight
        ├──────── Assessments
        └──────── Future Modules
```

---

# Layered Architecture

## Layer 1 – Presentation Layer

Responsible for:

* HTML
* CSS
* User Experience
* Accessibility
* Responsive Layout

Must Never:

* Query Firestore
* Perform Authorization
* Resolve Entitlements
* Execute Business Logic

---

## Layer 2 – Interaction Layer

Responsible for:

* Event handling
* Navigation
* User actions
* Workflow initiation

Examples:

* `credential-detail-actions.js`
* `dashboard-actions.js`

Must Never:

* Render business data
* Modify entitlement state
* Query databases

---

## Layer 3 – Rendering Layer

Responsible for:

* Rendering governed data
* Displaying metadata
* Empty state presentation
* Error state presentation

Examples:

* `credential-renderer.js`
* `recognition-renderer.js`
* `credential-detail.js`

Must Never:

* Perform authorization
* Resolve entitlements
* Call APIs

---

## Layer 4 – Service Layer

Responsible for:

* Consuming resolver output
* Preparing data for rendering
* Invoking renderers

Examples:

* `credential-service.js`
* `recognition-service.js`

Must Never:

* Render UI
* Query Firestore
* Resolve entitlements

---

## Layer 5 – Entitlement Layer

Responsible for:

* Publishing entitlement state
* Credential retrieval
* Executive entitlement retrieval
* User entitlement retrieval

Primary Component:

* `entitlement.js`

Must Never:

* Render UI
* Perform authorization
* Filter presentation

---

## Layer 6 – Resolver Layer

Responsible for:

* Portal access decisions
* Credential visibility
* Executive precedence
* Normalization

Primary Component:

* `resolvePortalEntitlements.js`

Must Never:

* Query Firestore
* Render UI
* Call APIs

---

## Layer 7 – Authentication Layer

Responsible for:

* Identity verification
* Session establishment
* Firebase Authentication

Must Never:

* Determine portal permissions
* Render business experiences

---

# Request Flow

```text
User

↓

Authentication

↓

Authorization

↓

Entitlement Resolution

↓

Credential Service

↓

Credential Renderer

↓

Credential Portfolio

↓

Credential Detail

↓

Recognition Assets
```

---

# Credential Experience

```text
Credential Registry

↓

Credential Service

↓

Credential Renderer

↓

Credential Portfolio

↓

Credential Detail

↓

Recognition Assets

↓

Professional Actions
```

---

# Recognition Experience

Recognition assets are independent entities associated with credentials.

Examples:

* University Certificate
* Trainer Certificate
* University Badge
* Future Wallet Export
* Future Digital Credentials

Recognition assets are presentation experiences and must not perform entitlement resolution.

---

# User Interface Architecture

Every page follows the same architectural composition.

```text
Portal Header

↓

Page Hero

↓

Primary Experience

↓

Supporting Experience

↓

Professional Actions

↓

Portal Footer
```

---

# Data Ownership

| Component         | Owns                  |
| ----------------- | --------------------- |
| Authentication    | Identity              |
| Authorization     | Access Validation     |
| Entitlement Layer | Entitlement Data      |
| Resolver          | Visibility Decisions  |
| Service           | Rendering Preparation |
| Renderer          | Presentation          |
| Action Controller | Navigation            |

Ownership must never overlap.

---

# Component Relationships

```text
credential-service.js
        │
        ▼
credential-renderer.js
        │
        ▼
credential-detail.js
        │
        ▼
credential-detail-actions.js
```

Each component consumes only the output of the previous layer.

---

# Routing Architecture

Navigation is credential-centric.

Example:

```text
My Credentials

↓

Credential Details

↓

University Certificate

↓

Trainer Certificate

↓

University Badge
```

Credential identifiers are passed using query parameters.

Example:

```text
?credentialId=AAU-XXXXXXXX
```

---

# Governance Rules

The Portal must never:

* Duplicate entitlement logic.
* Duplicate authorization logic.
* Query Firestore from UI components.
* Mix rendering with interaction.
* Infer business meaning from UI state.
* Mutate resolver output.
* Perform credential filtering in the presentation layer.

---

# Future Architecture

The architecture is designed to support additional governed experiences without changing the existing layers.

Planned modules include:

* Learning Experience
* Assessment Experience
* Executive Insight Experience
* Recognition Experience
* Wallet Experience
* Digital Credential Experience
* Professional Sharing Experience
* Continuing Education Experience

Each future module must integrate with the existing layered architecture and must not bypass governance.

---

# Architectural Compliance Checklist

Every Portal component should satisfy the following:

* Single responsibility.
* Clearly documented ownership.
* No direct Firestore access from UI.
* No authorization logic in presentation.
* No entitlement resolution outside the resolver.
* Rendering separated from interaction.
* Versioned implementation.
* Governance header present.
* Change history maintained.

---

# Governance Status

This document is the authoritative architectural reference for the Agile AI University Portal.

All Portal components shall conform to this layered architecture unless superseded by an approved governance revision.

---

**Status:** **LOCKED**

**Version:** **1.0.0**
