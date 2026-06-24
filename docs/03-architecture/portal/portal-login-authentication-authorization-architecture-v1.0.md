# Agile AI University Portal

# Login, Authentication, Authorization & Access Architecture

Version: 1.0.0
Status: ACTIVE
Governance: LOCKED
Owner: Agile AI University

---

# 1. Purpose

This document defines the complete architecture governing:

* Portal Login
* Authentication
* Entitlement Acquisition
* Entitlement Resolution
* Authorization
* Dashboard Rendering
* Access Control

The objective is to ensure future developers can understand:

* Architectural boundaries
* Component responsibilities
* Event flow
* Data flow
* Governance constraints
* Extension points

without reverse engineering the source code.

---

# 2. Architectural Principles

## Principle 1 — Separation of Concerns

Authentication, entitlement resolution, authorization, and UI rendering are separate architectural layers.

No layer may assume ownership of another layer's responsibilities.

---

## Principle 2 — Resolver Is The Single Source Of Truth

All entitlement decisions originate from:

```text
resolvePortalEntitlements.js
```

No other component may independently determine portal access.

---

## Principle 3 — Authorization Consumes Resolver Output

Authorization never reads:

* Firebase
* Firestore
* APIs
* Credential Registry

Authorization evaluates only the resolver output.

---

## Principle 4 — UI Reflects Decisions

UI components do not determine access.

UI components only display the outcome of authorization.

---

## Principle 5 — Governance Before Convenience

Business rules belong only inside approved governance layers.

Shortcut implementations are prohibited.

---

# 3. User States

The portal recognizes four logical user states.

## State A — Anonymous

User has not authenticated.

Experience:

```text
Portal Login Screen
```

Visible:

* Google Sign-In
* Email Link Sign-In

Hidden:

* Assessments
* Credentials
* Executive Services

---

## State B — Authenticated + Authorized

User has:

* Credentials
* Entitlements
* Executive Access
* Portal Services

Experience:

```text
Full Portal Access
```

Visible:

* My Credentials
* Assessment Platform
* Executive Services
* Future Capabilities

---

## State C — Authenticated + No Active Services

User is authenticated.

User is known.

User has no:

* Credentials
* Executive Access
* Recognitions
* Assessments
* Active Portal Services

Experience:

```text
No Active Services Information Card
```

This is NOT an authorization failure.

---

## State D — Authenticated + Restricted

Future governance state.

Examples:

* Suspended Account
* Revoked Access
* Compliance Hold

Experience:

```text
unauthorized.html
```

---

# 4. Architectural Layers

## Layer 1 — Authentication Layer

Files:

```text
firebase-init.js
portal-auth.js
```

Responsibilities:

* Firebase Initialization
* Google Sign-In
* Email Link Sign-In
* Auth State Detection
* Session Management
* User Display

Must Never:

* Grant Access
* Resolve Entitlements
* Evaluate Credentials
* Perform Authorization

Output:

```javascript
__AAIU_AUTH_READY__
```

---

## Layer 2 — Entitlement Acquisition Layer

File:

```text
entitlement.js
```

Responsibilities:

* Call Entitlement API
* Fetch Credentials
* Fetch Executive Entitlements
* Normalize Response
* Publish Portal Data

Must Never:

* Grant Access
* Render UI
* Make Authorization Decisions

Output:

```javascript
window.portalEntitlementData
```

Events:

```javascript
entitlements:ready
credentials:ready
```

---

## Layer 3 — Entitlement Resolution Layer

File:

```text
resolvePortalEntitlements.js
```

Responsibilities:

* Business Rules
* Executive Precedence
* Credential Visibility
* Portal Capability Resolution

Produces:

```javascript
Resolved Portal State
```

Example:

```javascript
{
  hasStudentAccess,
  hasExecutiveAccess,
  visibleCredentials,
  executiveInsight
}
```

Governance:

Pure Function

No Side Effects

Single Source Of Truth

---

## Layer 4 — Authorization Layer

File:

```text
portal-authorization.js
```

Responsibilities:

* Consume Resolver Output
* Determine Access Decision

Produces:

```javascript
true
false
```

Must Never:

* Call APIs
* Read Firestore
* Read Firebase Auth
* Render UI

---

## Layer 5 — Presentation Layer

File:

```text
dashboard-gating.js
```

Responsibilities:

* Consume Auth State
* Consume Entitlement Data
* Invoke Resolver
* Invoke Authorization
* Render UI

Must Never:

* Sign Users In
* Sign Users Out
* Determine Business Rules
* Determine Authorization Rules

---

# 5. End-To-End Flow

## Step 1

User opens:

```text
portal.agileai.university
```

---

## Step 2

Firebase initializes.

File:

```text
firebase-init.js
```

---

## Step 3

Authentication state becomes available.

Output:

```javascript
__AAIU_AUTH_READY__
```

---

## Step 4

portal-auth.js updates login UI.

Possible outcomes:

```text
Signed Out
Signed In
```

---

## Step 5

entitlement.js retrieves:

* Credentials
* Executive Entitlements
* User Entitlements

---

## Step 6

Portal data published.

Output:

```javascript
window.portalEntitlementData
```

---

## Step 7

dashboard-gating.js invokes:

```javascript
resolvePortalEntitlements()
```

---

## Step 8

Resolver returns:

```javascript
Portal State
```

---

## Step 9

dashboard-gating.js invokes:

```javascript
authorizePortalAccess()
```

---

## Step 10

Authorization returns:

```javascript
true
```

or

```javascript
false
```

---

## Step 11

UI renders appropriate experience.

Possible outcomes:

```text
Authorized Portal
No Active Services
Unauthorized Page
```

---

# 6. Event Flow

Authentication:

```text
firebase-init.js
        ↓
__AAIU_AUTH_READY__
```

Entitlements:

```text
entitlement.js
        ↓
entitlements:ready
        ↓
credentials:ready
```

Presentation:

```text
dashboard-gating.js
        ↓
evaluateAndRender()
```

---

# 7. Governance Rules

Rule 1

Authentication is not Authorization.

---

Rule 2

Authorization is not Entitlement Resolution.

---

Rule 3

Resolver output is the only valid source of entitlement truth.

---

Rule 4

UI rendering must never contain business rules.

---

Rule 5

No component may bypass the resolver.

---

Rule 6

Dashboard Gating consumes decisions.

It does not create decisions.

---

# 8. Current Access Model

Current Production Behavior

Anonymous User

```text
Portal Login Page
```

Authorized User

```text
Portal Dashboard
```

Authenticated User Without Services

```text
No Active Services Card
```

Restricted User

```text
unauthorized.html
```

(Future Governance State)

---

# 9. Future Extension Points

Planned Capabilities

* Executive Insight Reports
* Digital Wallet
* Badge Management
* Assessment Results
* Recognition Records
* Student Services
* Multi-Organization Support

The existing layered architecture is designed to support these capabilities without changing authentication or authorization foundations.

---

# 10. Reference Diagram

See:

```text
login-authentication-authorization-flow-v1.0.png
```

This diagram is the authoritative visual representation of the architecture described in this document.

---

END OF DOCUMENT
