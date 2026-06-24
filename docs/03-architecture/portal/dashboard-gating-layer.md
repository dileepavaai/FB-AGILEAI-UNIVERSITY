# Dashboard Gating Layer

Version: 1.0.0
Status: ACTIVE
Governance: LOCKED
Owner: Agile AI University

---

# 1. Purpose

Dashboard Gating is the Presentation Orchestration Layer of the Agile AI University Portal.

Its responsibility is to coordinate:

* Authentication State
* Entitlement State
* Resolver Execution
* Authorization Evaluation
* UI Visibility
* Dashboard Rendering

Dashboard Gating does not create business decisions.

Dashboard Gating consumes decisions created by upstream layers.

---

# 2. Architectural Position

```text
User
  ↓
Authentication Layer
(firebase-init.js)

  ↓

Authentication Controller
(portal-auth.js)

  ↓

Entitlement Acquisition
(entitlement.js)

  ↓

Entitlement Resolver
(resolvePortalEntitlements.js)

  ↓

Authorization Layer
(portal-authorization.js)

  ↓

Dashboard Gating
(dashboard-gating.js)

  ↓

Portal Experience
```

Dashboard Gating is the final decision consumer.

It is not a decision maker.

---

# 3. Responsibilities

Dashboard Gating is responsible for:

* Consuming authentication state
* Consuming entitlement data
* Executing resolver
* Executing authorization
* Showing authorized experiences
* Showing informational experiences
* Rendering credentials
* Rendering executive insight visibility
* Coordinating page state

---

# 4. Non-Responsibilities

Dashboard Gating must never:

* Authenticate users
* Sign users in
* Sign users out
* Call Firebase authentication APIs
* Call Firestore
* Call Cloud Run APIs
* Fetch credentials
* Resolve entitlements
* Apply business rules
* Apply authorization rules

These responsibilities belong to other layers.

---

# 5. Governance Principle

Dashboard Gating is a Consumer Layer.

It consumes:

```javascript
Auth State
```

```javascript
Portal Entitlement Data
```

```javascript
Resolver Output
```

```javascript
Authorization Decision
```

Dashboard Gating must never generate these artifacts.

---

# 6. Authentication Boundary

Authentication ownership belongs to:

```text
firebase-init.js
portal-auth.js
```

Dashboard Gating reads:

```javascript
firebase.auth().currentUser
```

for visibility purposes only.

Dashboard Gating must never:

```javascript
signIn()
```

```javascript
signOut()
```

```javascript
createUser()
```

```javascript
sendSignInLink()
```

---

# 7. Entitlement Boundary

Entitlement ownership belongs to:

```text
entitlement.js
```

Dashboard Gating consumes:

```javascript
window.portalEntitlementData
```

Expected structure:

```javascript
{
  checked: true,
  email: "",
  credentials: [],
  executiveEntitlement: {},
  userEntitlements: {}
}
```

Dashboard Gating must never:

* Fetch credentials
* Query registries
* Query APIs

---

# 8. Resolver Boundary

Resolver ownership belongs to:

```text
resolvePortalEntitlements.js
```

Dashboard Gating invokes:

```javascript
resolvePortalEntitlements()
```

The resolver returns:

```javascript
{
  hasStudentAccess,
  hasExecutiveAccess,
  visibleCredentials,
  executiveInsight
}
```

This resolver output is considered authoritative.

No downstream component may override it.

---

# 9. Authorization Boundary

Authorization ownership belongs to:

```text
portal-authorization.js
```

Dashboard Gating invokes:

```javascript
authorizePortalAccess()
```

Authorization returns:

```javascript
true
```

or

```javascript
false
```

Dashboard Gating consumes this result.

Dashboard Gating does not determine access.

---

# 10. Rendering Model

Dashboard Gating controls visibility only.

Examples:

```javascript
authorizedPortalUI
```

```javascript
student-dashboard-section
```

```javascript
exec-insight-section
```

```javascript
noServicesUI
```

Dashboard Gating may:

```javascript
show()
```

```javascript
hide()
```

```javascript
render()
```

Dashboard Gating may not:

```javascript
decide()
```

---

# 11. User Experiences

The layer currently supports three portal experiences.

---

## Experience A

Anonymous User

Condition:

```javascript
!currentUser
```

Result:

```text
Portal Login Screen
```

Dashboard Gating exits immediately.

No authorization evaluation occurs.

---

## Experience B

Authorized User

Condition:

```javascript
authorized === true
```

Result:

```text
Portal Dashboard
```

Visible:

* My Credentials
* Assessment Platform
* Future Services

---

## Experience C

Authenticated User With No Active Services

Condition:

```javascript
authorized === true
```

and

```javascript
visibleCredentials.length === 0
```

and

```javascript
hasExecutiveAccess === false
```

Result:

```text
No Active Services Card
```

This is not an authorization failure.

---

# 12. Restricted User Experience

Future Governance State

Condition:

```javascript
authorized === false
```

Potential Examples:

* Suspended User
* Revoked User
* Compliance Hold

Result:

```text
unauthorized.html
```

Current Production State:

Reserved for future use.

---

# 13. Credential Rendering

Credential rendering occurs only when:

```javascript
visibleCredentials.length > 0
```

and

```javascript
renderCredentials()
```

exists.

Dashboard Gating does not create credentials.

Dashboard Gating does not filter credentials.

Dashboard Gating renders credentials already approved by the resolver.

---

# 14. Executive Insight Rendering

Dashboard Gating controls visibility of:

```javascript
exec-insight-section
```

based on:

```javascript
state.executiveInsight.hasAccess
```

Dashboard Gating displays:

* Valid Until Date
* Days Remaining

Dashboard Gating does not determine executive eligibility.

---

# 15. Event Model

Dashboard Gating responds to:

```javascript
DOMContentLoaded
```

```javascript
entitlements:ready
```

```javascript
credentials:ready
```

```javascript
__AAIU_AUTH_READY__
```

These events trigger:

```javascript
evaluateAndRender()
```

---

# 16. Design Pattern

Dashboard Gating follows:

```text
Observer Pattern
```

and

```text
Consumer Pattern
```

It listens.

It reacts.

It does not decide.

---

# 17. Historical Lessons Learned

The portal authentication and authorization implementation required multiple architecture revisions.

Common defects encountered:

* Resolver executed before entitlement readiness
* Authorization evaluated before authentication
* Authorized users seeing no buttons
* Hidden UI remaining hidden
* Unauthorized redirect loops
* Duplicate rendering attempts
* Credential rendering race conditions

The current architecture eliminates these issues through strict layer separation.

---

# 18. Future Extension Points

Dashboard Gating is expected to support:

* Executive Insight Reports
* Digital Wallet
* Badge Viewer
* Recognition Records
* Assessment Results
* Student Services
* Multi-Organization Portal Experiences

without modifying authentication or authorization layers.

---

# 19. Governance Rules

Rule 1

Dashboard Gating consumes decisions.

It does not create decisions.

---

Rule 2

Resolver output is authoritative.

---

Rule 3

Authorization output is authoritative.

---

Rule 4

Authentication must complete before authorization evaluation.

---

Rule 5

Entitlements must load before resolver execution.

---

Rule 6

UI rendering must never contain business rules.

---

# 20. Related Documents

See:

```text
portal-login-authentication-authorization-architecture-v1.0.md
```

```text
portal-authentication-layer.md
```

```text
portal-entitlement-layer.md
```

```text
portal-authorization-layer.md
```

```text
login-authentication-authorization-flow-v1.0.png
```

END OF DOCUMENT
