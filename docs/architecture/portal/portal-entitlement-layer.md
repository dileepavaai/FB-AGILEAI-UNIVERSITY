# Portal Entitlement Layer

Version: 1.0.0
Status: ACTIVE
Governance: LOCKED
Owner: Agile AI University

---

# 1. Purpose

The Entitlement Layer is responsible for discovering all services, credentials, recognitions, and executive privileges associated with an authenticated user.

The Entitlement Layer answers:

```text
What services belong to this user?
```

The Entitlement Layer does not answer:

```text
Who is the user?
```

Authentication owns identity.

The Entitlement Layer does not answer:

```text
Can the user access the portal?
```

Authorization owns access decisions.

---

# 2. Architectural Position

```text
Authentication Layer
(firebase-init.js)
(portal-auth.js)

          ↓

Entitlement Layer
(entitlement.js)

          ↓

Resolver Layer
(resolvePortalEntitlements.js)

          ↓

Authorization Layer
(portal-authorization.js)

          ↓

Dashboard Gating
(dashboard-gating.js)
```

The Entitlement Layer sits between:

* Authentication
* Resolver

---

# 3. Ownership

Owned By

```text
entitlement.js
```

Responsibilities:

* Retrieve portal entitlements
* Retrieve credentials
* Retrieve executive access
* Publish entitlement data
* Notify downstream layers

---

# 4. Non-Responsibilities

The Entitlement Layer must never:

* Authenticate users
* Sign users in
* Sign users out
* Render UI
* Show buttons
* Hide buttons
* Make authorization decisions
* Redirect users

These responsibilities belong elsewhere.

---

# 5. Why The Layer Exists

Without an entitlement layer, every page would need to:

* Query credentials
* Query executive access
* Query portal services

This creates:

* Duplicate logic
* Multiple API calls
* Inconsistent behavior
* Maintenance complexity

The Entitlement Layer centralizes all entitlement discovery.

---

# 6. Primary Data Sources

The Entitlement Layer retrieves information from:

---

## Credentials

Example:

```text
AIPA
AIDE
AAIA
AAIP
AIAL
```

Stored within:

```text
Credential Registry
```

---

## User Entitlements

Examples:

```text
student_portal
assessment_access
credential_access
```

Stored within:

```text
user_entitlements
```

---

## Executive Entitlements

Examples:

```text
Executive Insight Access
Executive Reports
Executive Dashboard
```

Stored within:

```text
executiveEntitlements
```

---

# 7. API Integration

The Entitlement Layer is API-driven.

Primary source:

```text
Cloud Run Portal API
```

Example:

```text
https://cloud-run-portal-xxxxxxxx.run.app
```

The browser never directly queries Firestore.

All entitlement retrieval is centralized through the API layer.

---

# 8. Entitlement Request Flow

```text
Authenticated User
         ↓
entitlement.js
         ↓
Cloud Run Portal API
         ↓
Credential Registry
User Entitlements
Executive Entitlements
         ↓
Response Returned
         ↓
portalEntitlementData
```

---

# 9. Published Data Contract

The Entitlement Layer publishes:

```javascript
window.portalEntitlementData
```

Example:

```javascript
{
  checked: true,

  email: "john@example.com",

  credentials: [...],

  userEntitlements: {...},

  executiveEntitlement: {...}
}
```

This becomes the authoritative portal entitlement payload.

---

# 10. Why Publish A Contract

Historical implementations attempted:

```text
Direct API access from multiple files
```

This caused:

* Duplicate requests
* Race conditions
* Inconsistent state
* Missing credentials

The portal now publishes a single entitlement contract.

---

# 11. Readiness Event

After entitlement retrieval completes:

```javascript
document.dispatchEvent(
  new CustomEvent(
    "entitlements:ready"
  )
);
```

This event signals:

```text
Entitlement discovery complete
```

Downstream layers may now continue.

---

# 12. Entitlement Lifecycle

Stage 1

Authenticated User

```text
Identity established
```

---

Stage 2

Entitlement Retrieval

```text
API request begins
```

---

Stage 3

Entitlement Resolution

```text
Credentials retrieved
User entitlements retrieved
Executive entitlements retrieved
```

---

Stage 4

Publication

```javascript
window.portalEntitlementData
```

published.

---

Stage 5

Notification

```text
entitlements:ready
```

event fired.

---

# 13. Example Response

Example student:

```javascript
{
  checked: true,

  email: "student@example.com",

  credentials: [
    {
      credential_id: "AAU-001"
    }
  ],

  userEntitlements: {
    entitlements: {
      student_portal: true
    }
  },

  executiveEntitlement: null
}
```

---

# 14. Example Executive Response

```javascript
{
  checked: true,

  email: "executive@example.com",

  credentials: [],

  userEntitlements: {},

  executiveEntitlement: {
    active: true,
    validUntil: "2026-12-31"
  }
}
```

---

# 15. Example No Services Response

```javascript
{
  checked: true,

  email: "newuser@example.com",

  credentials: [],

  userEntitlements: {},

  executiveEntitlement: null
}
```

This does not mean failure.

It means:

```text
Authenticated
No Services Found
```

---

# 16. Separation From Resolver

A common misunderstanding.

Entitlement Layer:

```text
Discovers Data
```

Resolver:

```text
Interprets Data
```

Example:

Entitlement Layer returns:

```javascript
{
  credentials: [...]
}
```

Resolver decides:

```text
Should My Credentials button appear?
```

---

# 17. Separation From Authorization

Entitlement Layer:

```text
What exists?
```

Authorization:

```text
Can access be granted?
```

Example:

The entitlement layer may return:

```javascript
credentials: []
```

Authorization may still grant access.

These are separate concerns.

---

# 18. Historical Problems Solved

During portal implementation several defects occurred:

* Missing credentials
* Empty dashboards
* Hidden buttons
* Authorization firing too early
* Resolver running before data loaded

Root cause:

```text
Entitlement data not ready
```

The entitlement publication contract resolved these issues.

---

# 19. Governance Rules

Rule 1

The Entitlement Layer discovers data only.

---

Rule 2

The Entitlement Layer never renders UI.

---

Rule 3

The Entitlement Layer never performs authorization.

---

Rule 4

The Entitlement Layer must publish:

```javascript
window.portalEntitlementData
```

---

Rule 5

The Entitlement Layer must emit:

```text
entitlements:ready
```

after successful completion.

---

Rule 6

The Entitlement Layer is the only portal component permitted to retrieve entitlement data.

---

Rule 7

Downstream layers must consume published data rather than make independent entitlement requests.

---

# 20. Future Extension Points

The Entitlement Layer may later support:

* Trainer Entitlements
* Faculty Entitlements
* Licensed Training Organization Entitlements
* Academy Entitlements
* Badge Entitlements
* Wallet Entitlements
* Assessment Entitlements

without changing Authentication or Authorization layers.

---

# 21. Relationship To Other Layers

Authentication

```text
Who are you?
```

---

Entitlements

```text
What belongs to you?
```

---

Resolver

```text
What should be visible?
```

---

Authorization

```text
Can you access the portal?
```

---

Dashboard Gating

```text
Render the portal experience
```

---

# 22. Related Documents

See:

```text
portal-login-authentication-authorization-architecture-v1.0.md
```

```text
portal-authentication-layer.md
```

```text
portal-authorization-layer.md
```

```text
dashboard-gating-layer.md
```

```text
login-authentication-authorization-flow-v1.0.png
```

---

END OF DOCUMENT
