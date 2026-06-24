# Portal Authorization Layer

Version: 1.0.0
Status: ACTIVE
Governance: LOCKED
Owner: Agile AI University

---

# 1. Purpose

The Authorization Layer is responsible for determining whether an authenticated user may access protected Agile AI University Portal services.

Authorization answers one question:

```text
Is this authenticated user allowed to access the portal?
```

Authorization does not determine:

```text
Who the user is
```

Authentication owns identity.

Authorization does not determine:

```text
What credentials exist
```

Entitlement Resolution owns entitlement discovery.

---

# 2. Architectural Position

```text
User
 ↓

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

 ↓

Portal Experience
```

Authorization executes only after:

* Authentication completed
* Entitlements loaded
* Resolver executed

---

# 3. Authorization Ownership

Owned By

```text
portal-authorization.js
```

Responsibilities:

* Grant portal access
* Deny portal access
* Evaluate resolver output
* Produce authorization decision

---

# 4. Non-Responsibilities

Authorization must never:

* Sign users in
* Sign users out
* Query Firebase
* Query Firestore
* Call APIs
* Fetch credentials
* Resolve entitlements
* Render UI
* Redirect users

These concerns belong to other layers.

---

# 5. Authorization Input

Authorization receives only:

```javascript
resolvedState
```

Produced by:

```javascript
resolvePortalEntitlements()
```

Example:

```javascript
{
  studentPortalAccess: true,
  executiveInsight: {
    hasAccess: false
  },
  visibleCredentials: [...]
}
```

Authorization trusts the resolver.

Authorization never rebuilds business logic.

---

# 6. Architectural Rule

Authorization is a consumer.

It is not a source of truth.

Source of Truth:

```javascript
resolvePortalEntitlements()
```

Authorization consumes resolver output and makes a simple access decision.

---

# 7. Authorization Decision Model

Authorization produces:

```javascript
true
```

or

```javascript
false
```

Nothing else.

Example:

```javascript
const authorized =
authorizePortalAccess(state);
```

---

# 8. Authorization Flow

```text
Resolver Output
      ↓
portal-authorization.js
      ↓
Grant / Deny
      ↓
dashboard-gating.js
      ↓
Portal Experience
```

---

# 9. Grant Scenario

Example:

User has:

* Student entitlement
* Credentials
* Assessment access

Resolver Output:

```javascript
{
  studentPortalAccess: true
}
```

Authorization:

```javascript
return true;
```

Result:

```text
Portal Access Granted
```

---

# 10. Executive Scenario

Example:

User has:

* Executive entitlement
* No credentials

Resolver Output:

```javascript
{
  executiveInsight: {
    hasAccess: true
  }
}
```

Authorization:

```javascript
return true;
```

Result:

```text
Portal Access Granted
```

Executive users remain authorized.

---

# 11. No Services Scenario

Example:

User is authenticated.

Resolver Output:

```javascript
{
  studentPortalAccess: false,
  executiveInsight: {
    hasAccess: false
  },
  visibleCredentials: []
}
```

Authorization:

```javascript
return true;
```

Result:

```text
Authenticated
Authorized
No Active Services
```

Portal displays:

```text
No Active Services
```

This is not an authorization failure.

---

# 12. Authorization Failure Scenario

Example:

Resolver determines:

```javascript
{
  accessDenied: true
}
```

Authorization:

```javascript
return false;
```

Result:

```text
Access Denied
```

Dashboard Gating may redirect:

```text
/unauthorized.html
```

---

# 13. Governance Principle

Authentication Success does not imply Authorization Success.

Example:

```text
Authenticated = TRUE
Authorized = FALSE
```

Possible.

---

# 14. Governance Principle

Authorization Success does not imply Services Exist.

Example:

```text
Authenticated = TRUE
Authorized = TRUE
Credentials = NONE
Executive Access = NONE
```

Possible.

Portal should display:

```text
No Active Services
```

---

# 15. Current Portal Policy

Current Agile AI University Portal Policy:

---

Authenticated User

↓

Authorization Granted

↓

Portal Loads

↓

Resolver Determines Available Services

↓

Dashboard Displays

* Credentials
* Assessments
* Executive Access
* No Active Services

as appropriate

---

Unauthorized Users

↓

Authorization Denied

↓

unauthorized.html

---

# 16. Why This Design Exists

Historical issues occurred when:

* Authorization executed too early
* Entitlement logic duplicated
* Dashboard logic performed authorization
* Authentication attempted authorization

This produced:

* Missing buttons
* Incorrect redirects
* Invisible credentials
* Entitlement mismatches

The resolver-led architecture eliminated these issues.

---

# 17. Separation of Concerns

Authentication

```text
Who are you?
```

Owned By:

```text
firebase-init.js
portal-auth.js
```

---

Entitlements

```text
What services exist?
```

Owned By:

```text
entitlement.js
```

---

Resolver

```text
What should be visible?
```

Owned By:

```text
resolvePortalEntitlements.js
```

---

Authorization

```text
Can the user access the portal?
```

Owned By:

```text
portal-authorization.js
```

---

Dashboard Gating

```text
Render experience
```

Owned By:

```text
dashboard-gating.js
```

---

# 18. Security Principles

Authorization must never trust:

* UI state
* Hidden buttons
* CSS visibility
* Browser variables

Authorization trusts only:

```javascript
resolvedState
```

generated by:

```javascript
resolvePortalEntitlements()
```

---

# 19. Future Extension Points

Authorization may later support:

* Trainer Portal
* Licensed Training Organization Portal
* Academy Portal
* Faculty Portal
* Admin Portal
* Multi-Tenant Access

without modifying Authentication.

---

# 20. Governance Rules

Rule 1

Authorization executes only after authentication completes.

---

Rule 2

Authorization consumes resolver output only.

---

Rule 3

Authorization must never query APIs.

---

Rule 4

Authorization must never resolve entitlements.

---

Rule 5

Authorization returns only:

```javascript
true
```

or

```javascript
false
```

---

Rule 6

Authorization must remain independent from UI rendering.

---

Rule 7

Dashboard Gating consumes authorization decisions.

Authorization never renders the UI.

---

# 21. Related Documents

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
dashboard-gating-layer.md
```

```text
login-authentication-authorization-flow-v1.0.png
```

---

END OF DOCUMENT
