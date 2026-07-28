# Identity Platform Architecture

**Document ID:** ARCH-001
**Title:** Identity Platform Architecture
**Version:** 1.0.0
**Status:** ACTIVE
**Owner:** Agile AI University
**Architect:** Dileep Appupillai

---

# 1. Purpose

This document defines the enterprise architecture of the Agile AI
University Identity Platform.

The Identity Platform establishes the authoritative digital identity
used throughout the University's ecosystem.

Every learner, administrator, trainer and future enterprise customer
interacts with the platform through this architecture.

---

# 2. Objectives

The Identity Platform provides:

- Secure authentication
- Identity resolution
- Authorization
- Permanent learner identity
- Entitlement foundation
- Auditability
- Platform-wide identity consistency

---

# 3. Scope

The Identity Platform governs:

- Firebase Authentication
- Learner Identity
- Administrator Identity
- Identity Activation
- Identity Reconciliation
- Authorization
- Identity Resolution

It does not govern:

- Payments
- Learning Resources
- Credentials
- Assessment Results

These platforms consume identity services.

---

# 4. Architectural Principles

The Identity Platform follows these principles.

✓ Identity First

✓ Authentication Before Authorization

✓ Authorization Before Entitlement

✓ One Learner → One Permanent Identity

✓ Service Layer Controlled

✓ Zero Business Logic in UI

✓ Immutable Identity Binding

---

# 5. Platform Position

The Identity Platform is the foundation of every business capability.

```text
Internet

↓

Authentication

↓

Identity Platform

↓

Authorization

↓

Entitlement Platform

↓

Business Services

↓

UI
```

No application bypasses this sequence.

---

# 6. Identity Types

Supported identities:

- Learner
- Administrator
- Trainer
- Internal Service Account

Future:

- Enterprise Learner
- Enterprise Administrator
- API Client

---

# 7. Identity Lifecycle

```text
Registration

↓

Authentication

↓

Identity Resolution

↓

Authorization

↓

Entitlement

↓

Platform Access
```

Historical alumni additionally follow:

```text
Credential Verification

↓

Activation Token

↓

Authentication

↓

Permanent learner_uid Binding
```

---

# 8. Canonical Identity

The permanent identity is:

```text
learner_uid
```

Once created:

- Never changes
- Never reused
- Never manually reassigned

All future platform records reference this identifier.

Supporting identifiers include:

- Credential ID
- Email Address

These remain business identifiers rather than identity anchors.

---

# 9. Authentication Architecture

Authentication responsibilities:

- Verify credentials
- Establish Firebase session
- Issue authenticated identity
- Support secure sign-in and sign-out

Authentication alone does not grant platform access.

---

# 10. Authorization Architecture

Authorization determines:

- Administrator access
- Learner access
- Trainer access
- Feature visibility
- Service eligibility

Authorization occurs before any business service is executed.

---

# 11. Identity Resolution

Identity Resolution links:

- Firebase user
- learner_uid
- Credential ID
- Verified email
- Existing academic records

This process produces the authoritative platform identity.

---

# 12. Identity Activation

Historical learners require identity activation.

Activation includes:

- Token validation
- Email verification
- UID binding
- Audit recording
- Entitlement initialization

Activation is a one-time governed process.

---

# 13. Identity Reconciliation

Identity reconciliation resolves:

- Legacy records
- Historical credentials
- Multiple identifiers
- Identity corrections

The goal is a single canonical learner identity.

---

# 14. Security Architecture

Security includes:

- Firebase Authentication
- Firestore Rules
- Storage Rules
- Service-layer validation
- Audit logging

No client-side code is trusted for identity decisions.

---

# 15. Integration Points

The Identity Platform provides services to:

- Student Portal
- Admin Portal
- Credential Platform
- Learning Resource Platform
- Payment Platform
- Executive Insight Platform
- Verification Platform

---

# 16. Governance Rules

The following rules are permanently enforced.

✓ One learner has one permanent learner_uid.

✓ Identity binding is immutable.

✓ Business rules remain in services.

✓ Identity decisions never occur in the UI.

✓ Authentication precedes authorization.

✓ Authorization precedes entitlement resolution.

---

# 17. Future Scalability

The architecture supports:

- Enterprise SSO
- Multi-tenant organizations
- OAuth providers
- API identities
- Mobile applications
- Federated authentication

These enhancements must preserve the canonical learner identity model.

---

# 18. Related Documents

- Identity Activation Runbook
- Firestore Schema Reference
- Firestore Collections Reference
- DOCUMENTATION-INDEX.md

---

# 19. Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 27-Jul-2026 | Initial Identity Platform Architecture |

---

# 20. Document Control

This document defines the authoritative architecture for identity
management within Agile AI University.

Changes require:

1. Architecture approval
2. Service-layer updates
3. Documentation updates
4. Production validation

---

**End of Document**