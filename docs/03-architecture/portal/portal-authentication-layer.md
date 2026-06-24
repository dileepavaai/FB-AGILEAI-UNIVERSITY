# Portal Authentication Layer

Version: 1.0.0
Status: ACTIVE
Governance: LOCKED
Owner: Agile AI University

---

# 1. Purpose

The Authentication Layer is responsible for establishing user identity within the Agile AI University Portal.

Authentication answers one question:

```text
Who is the user?
```

Authentication does not answer:

```text
What can the user access?
```

Authorization is a separate architectural layer.

---

# 2. Architectural Position

```text
User
  ↓

Firebase Authentication

  ↓

firebase-init.js

  ↓

portal-auth.js

  ↓

Authenticated Session

  ↓

Entitlement Layer
```

Authentication must complete before any entitlement or authorization processing begins.

---

# 3. Authentication Components

The Authentication Layer consists of two primary components.

---

## Component 1

firebase-init.js

Responsibilities:

* Firebase initialization
* Authentication provider configuration
* Google Sign-In foundation
* Email Magic Link foundation
* Authentication readiness contract
* Session restoration

Ownership:

```text
Authentication Infrastructure
```

---

## Component 2

portal-auth.js

Responsibilities:

* Login UI
* Logout UI
* Session display
* User profile display
* Authentication state presentation

Ownership:

```text
Authentication User Experience
```

---

# 4. Governance Boundary

Authentication owns:

* Identity verification
* Session establishment
* Session restoration
* Session termination

Authentication does not own:

* Entitlements
* Credentials
* Executive access
* Authorization decisions
* Dashboard visibility
* Portal permissions

---

# 5. Authentication Methods

The Agile AI University Portal currently supports:

---

## Method 1

Google Sign-In

Provider:

```text
Google Identity Provider
```

Flow:

```text
User
 ↓
Google Authentication
 ↓
Firebase Authentication
 ↓
Portal Session
```

---

## Method 2

Email Magic Link

Provider:

```text
Firebase Email Link Authentication
```

Flow:

```text
User enters email
 ↓
Login link generated
 ↓
Email delivered
 ↓
User clicks link
 ↓
Firebase validates link
 ↓
Portal Session created
```

---

# 6. Session Lifecycle

Authentication follows four stages.

---

## Stage 1

Anonymous

Condition:

```javascript
firebase.auth().currentUser === null
```

Portal State:

```text
Signed Out
```

Visible:

* Login Screen
* Google Sign-In
* Email Login Link

Hidden:

* Portal Dashboard
* Credentials
* Assessments

---

## Stage 2

Authentication In Progress

Condition:

```text
Google popup active
```

or

```text
Email link validation active
```

Portal waits for completion.

---

## Stage 3

Authenticated

Condition:

```javascript
firebase.auth().currentUser !== null
```

Result:

```text
User Identity Established
```

Authentication completes.

Authorization has not yet begun.

---

## Stage 4

Signed Out

Condition:

```javascript
firebase.auth().signOut()
```

Result:

```text
Session Destroyed
```

Portal returns to login experience.

---

# 7. Authentication Readiness Contract

One of the most important architectural decisions in the portal.

Authentication exposes:

```javascript
window.__AAIU_AUTH_READY__
```

This contract guarantees:

```text
Authentication has completed.
```

Downstream layers must wait for this signal.

---

# 8. Why Auth Ready Exists

Historical Issue

Earlier implementations attempted:

```text
Authorization before Authentication
```

or

```text
Entitlement Resolution before Authentication
```

This caused:

* Race conditions
* Missing credentials
* Unauthorized redirects
* Invisible portal buttons
* Session timing failures

The Auth Ready contract eliminated these issues.

---

# 9. Session Restoration

Firebase automatically restores sessions.

Example:

```text
User logs in today
 ↓
Browser closes
 ↓
User returns tomorrow
 ↓
Firebase restores session
 ↓
Portal resumes authenticated state
```

User does not need to sign in again.

---

# 10. Email Link Authentication Flow

Step 1

User enters email.

---

Step 2

portal-auth.js invokes:

```javascript
AAIUAuth.sendEmailLink()
```

---

Step 3

Firebase sends authentication email.

---

Step 4

User clicks email link.

---

Step 5

firebase-init.js executes:

```javascript
completeEmailLinkSignIn()
```

---

Step 6

Firebase validates token.

---

Step 7

Authenticated session created.

---

Step 8

Auth Ready contract resolves.

---

# 11. Google Authentication Flow

Step 1

User clicks:

```text
Sign In With Google
```

---

Step 2

portal-auth.js invokes:

```javascript
AAIUAuth.signInWithGoogle()
```

---

Step 3

Firebase opens Google provider.

---

Step 4

User authenticates.

---

Step 5

Firebase returns authenticated user.

---

Step 6

Auth Ready contract resolves.

---

# 12. User Information Display

portal-auth.js displays:

```javascript
user.displayName
```

and

```javascript
user.email
```

Example:

```text
John Smith
john@example.com
```

Fallback:

```text
Agile AI University User
```

used when display name is unavailable.

---

# 13. Authentication Events

The authentication layer publishes:

```javascript
firebase.auth().onAuthStateChanged()
```

Consumers include:

* portal-auth.js
* dashboard-gating.js
* entitlement.js

---

# 14. Security Principles

Authentication must never:

* Grant permissions
* Grant access
* Grant credentials
* Grant executive privileges
* Grant portal visibility

Authentication only establishes identity.

---

# 15. Authentication vs Authorization

Authentication

```text
Who are you?
```

Example:

```text
test.trial.289@gmail.com
```

Authorization

```text
What are you allowed to access?
```

Example:

```text
My Credentials
Assessment Platform
Executive Insights
```

These concerns must remain separated.

---

# 16. Historical Lessons Learned

The portal experienced multiple authentication-related defects during implementation.

Examples:

* Email link completion timing failures
* Session restoration race conditions
* Duplicate auth events
* Missing Auth Ready state
* UI rendering before authentication completion

The Auth Ready architecture resolved these issues.

---

# 17. Future Extension Points

The Authentication Layer may later support:

* Microsoft Authentication
* LinkedIn Authentication
* Enterprise SSO
* University Partner SSO
* Multi-Factor Authentication (MFA)

without modifying entitlement or authorization layers.

---

# 18. Governance Rules

Rule 1

Authentication establishes identity only.

---

Rule 2

Authentication never grants access.

---

Rule 3

Authorization must never execute before authentication completes.

---

Rule 4

All downstream layers must respect:

```javascript
window.__AAIU_AUTH_READY__
```

---

Rule 5

Authentication and authorization must remain separate architectural concerns.

---

# 19. Related Documents

See:

```text
portal-login-authentication-authorization-architecture-v1.0.md
```

```text
portal-entitlement-layer.md
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
