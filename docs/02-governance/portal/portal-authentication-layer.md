# Portal Authentication Layer

**Agile AI University**

---

## Document Information

| Attribute  | Value                            |
| ---------- | -------------------------------- |
| Document   | Portal Authentication Layer      |
| File       | `portal-authentication-layer.md` |
| Version    | 1.0.0                            |
| Status     | **LOCKED**                       |
| Governance | Portal Governance v1.0           |
| Owner      | Agile AI University              |

---

# Purpose

This document defines the authentication architecture of the Agile AI University Portal.

It establishes the responsibilities, boundaries, governance rules, and lifecycle of user authentication within the Portal ecosystem.

Authentication is responsible solely for establishing user identity. It does not determine permissions, portal access, or feature availability.

---

# Scope

This document applies to:

* Student & Executive Portal
* Administrative Portal
* Future Partner Portal
* Future Trainer Portal
* Future Executive Experiences

---

# Architectural Position

```text
Public Internet
        │
        ▼
Firebase Hosting
        │
        ▼
Firebase Authentication
        │
        ▼
Authenticated Identity
        │
        ▼
Authorization Layer
        │
        ▼
Entitlement Resolution
        │
        ▼
Portal Experience
```

Authentication is the first governed layer of every secured portal experience.

---

# Authentication Objectives

The Authentication Layer provides:

* User identity verification
* Session establishment
* Secure authentication state
* Identity lifecycle management
* Authentication event publication

Authentication intentionally does not determine access rights.

---

# Responsibilities

The Authentication Layer shall:

* Authenticate users.
* Establish secure user sessions.
* Publish authentication state.
* Provide authenticated identity to downstream layers.
* Maintain session continuity.
* Support governed sign-in methods.
* Support secure sign-out.

---

# Must Never

The Authentication Layer must never:

* Perform authorization.
* Resolve entitlements.
* Filter credentials.
* Determine portal visibility.
* Query credential records.
* Query recognition records.
* Render UI.
* Perform business decisions.

---

# Supported Authentication Methods

Current production authentication methods:

* Email Magic Link
* Google Sign-In

Future authentication methods may include:

* Microsoft Entra ID
* Apple Sign-In
* SAML
* Enterprise Single Sign-On (SSO)

New authentication providers must integrate through the same authentication abstraction and must not alter downstream architecture.

---

# Authentication Lifecycle

```text
Portal Request

↓

Authentication Required

↓

Identity Verification

↓

Session Creation

↓

Authenticated User Published

↓

Authorization Layer
```

---

# Authentication State

The authenticated user represents identity only.

Typical identity attributes include:

* User Identifier (UID)
* Email Address
* Display Name
* Profile Photo (optional)

The authentication layer must not infer roles, permissions, or entitlements from these attributes.

---

# Authentication Events

The Authentication Layer publishes lifecycle events that downstream layers may consume.

Examples include:

* User Authenticated
* User Signed Out
* Authentication State Changed
* Session Restored

Authentication events must communicate identity changes only.

---

# Integration with Authorization

Authentication precedes authorization.

The Authorization Layer consumes authenticated identity to determine whether access to the Portal is permitted.

Authentication does not participate in authorization decisions.

```text
Authentication

↓

Authorization
```

---

# Integration with Entitlement Resolution

Once authorization has completed successfully, the Entitlement Layer retrieves the user's governed entitlement data.

Authentication provides the authenticated identity required for entitlement lookup.

```text
Authentication

↓

Authorization

↓

Entitlement Resolution
```

---

# Integration with Portal Services

Portal services consume authenticated identity indirectly through governed layers.

Services must never invoke Firebase Authentication directly when an authenticated identity has already been published by the authentication layer.

---

# Firebase Responsibilities

Firebase Authentication is responsible for:

* Identity verification
* Session persistence
* Token management
* Secure authentication lifecycle

Business responsibilities remain within the Portal architecture.

---

# Security Principles

Authentication must ensure:

* Secure session establishment
* Secure session persistence
* Identity verification before protected content
* Session termination on sign-out

Authentication must never expose sensitive implementation details to presentation components.

---

# Failure Handling

Authentication failures should result in:

* User-friendly error messaging
* No exposure of internal implementation details
* Safe termination of the authentication workflow
* No partial portal initialization

---

# UI Responsibilities

Authentication pages may:

* Display sign-in controls
* Display authentication status
* Display user-friendly validation messages

Authentication pages must never display authorization outcomes or entitlement information.

---

# Dependencies

Primary implementation components include:

* `firebase-init.js`
* `portal-auth.js`

These components collectively implement the governed authentication layer.

---

# Relationship to Other Layers

```text
Authentication
        │
        ▼
Authorization
        │
        ▼
Entitlement Resolution
        │
        ▼
Credential Services
        │
        ▼
Recognition Services
        │
        ▼
Portal User Interface
```

Each layer consumes only the output of the preceding layer.

---

# Future Evolution

The Authentication Layer is designed to support future capabilities without architectural redesign, including:

* Enterprise SSO
* Multi-factor authentication
* Additional identity providers
* Passwordless authentication enhancements
* Organization-based identity federation

Future enhancements must preserve the separation between authentication, authorization, and entitlement resolution.

---

# Architectural Compliance Checklist

Every authentication implementation should satisfy the following:

* Identity verification only.
* No authorization logic.
* No entitlement resolution.
* No business decisions.
* Secure session management.
* Authentication state publication.
* Clear separation from presentation.
* Version-controlled implementation.
* Governance-compliant lifecycle.

---

# Governance Status

This document is the authoritative governance reference for the Authentication Layer of the Agile AI University Portal.

All authentication implementations shall conform to this architecture unless superseded by an approved governance revision.

---

**Status:** **LOCKED**

**Version:** **1.0.0**
