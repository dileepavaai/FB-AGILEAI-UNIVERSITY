# Identity Activation Runbook

**Document ID:** RUNBOOK-002  
**Title:** Identity Activation Runbook  
**Version:** 1.0.0  
**Status:** ACTIVE  
**Owner:** Agile AI University  
**Architect:** Dileep Appupillai  
**Audience:** Platform Administrators

---

# 1. Purpose

This runbook defines the standard operating procedure for activating
existing learners within the Agile AI University platform.

Identity Activation securely links an authenticated learner account to
existing academic records while preserving institutional integrity.

The process ensures that learners receive access to:

- Credentials
- Digital Badges
- Licensed Learning Resources
- Future Programme Registrations
- Executive Services

without creating duplicate identities.

---

# 2. Scope

This runbook applies to:

- Historical alumni
- Bridge programme participants
- Existing credential holders
- Manual identity reconciliation
- Identity reactivation (approved cases only)

This runbook does not apply to:

- Brand new learners with no existing records
- Administrative users
- Internal service accounts

---

# 3. Objectives

Identity Activation ensures:

✓ One learner has one permanent identity

✓ Existing credentials remain authoritative

✓ Historical records are preserved

✓ Future registrations use the same learner identity

✓ Duplicate learner identities are prevented

---

# 4. Identity Principles

The platform follows these principles.

- Credential records are the academic source of truth.
- Authentication establishes technical identity.
- Identity activation links both.
- The first successful activation creates the permanent learner identity.
- The learner UID becomes the canonical identifier for all future activity.

---

# 5. Activation Workflow

```text
Administrator Issues Activation

↓

Activation Token Created

↓

Learner Opens Activation Link

↓

Authentication

↓

Identity Validation

↓

UID Binding

↓

Asset Verification

↓

Entitlement Resolution

↓

Dashboard Access
```

---

# 6. Prerequisites

Before issuing an activation:

✓ Credential exists

✓ Credential is approved

✓ Learner email verified

✓ Credential has not already been activated

✓ Administrator authenticated

---

# 7. Step 1 – Verify Credential

Confirm:

- Credential ID
- Learner name
- Email address
- Programme
- Approval status

Activation must never proceed using unverified information.

---

# 8. Step 2 – Generate Activation Token

Create a new activation token.

Record:

- Credential ID
- Email
- Expiration
- Created By
- Created At

Any previously active token for the same learner must be revoked.

---

# 9. Step 3 – Send Activation Link

Provide the learner with the official activation URL.

The activation link must:

- expire automatically
- be single use
- be associated with one credential
- be associated with one verified email

---

# 10. Step 4 – Learner Authentication

The learner authenticates using the verified email address.

Authentication establishes the Firebase account.

Authentication alone does not complete activation.

---

# 11. Step 5 – Identity Validation

Validate:

✓ Activation token

✓ Email address

✓ Credential

✓ Approval status

✓ Token expiry

✓ Token usage

Activation stops immediately if validation fails.

---

# 12. Step 6 – Identity Binding

On successful validation:

- create or retrieve the Firebase UID
- bind the UID to the credential
- bind the UID to learner records
- record audit information

This binding is permanent.

---

# 13. Step 7 – Asset Verification

Verify that the learner has access to:

- Certificate
- Digital Badge
- Licensed Learning Resources

Missing assets should be investigated before learner support is contacted.

---

# 14. Step 8 – Entitlement Resolution

Resolve platform entitlements.

Typical examples:

- Credential Portfolio
- Learning Resources
- Bridge Programme
- Executive Insight (if purchased)

---

# 15. Step 9 – Dashboard Verification

Confirm that the learner dashboard displays:

✓ Welcome information

✓ Credentials

✓ Learning Resources

✓ Available programmes

✓ Downloads

---

# 16. Failure Scenarios

Common failures include:

- Expired activation token
- Invalid token
- Email mismatch
- Credential not approved
- Duplicate activation attempt
- Authentication failure

---

# 17. Recovery Procedures

If activation fails:

1. Review audit logs.
2. Verify credential data.
3. Confirm learner email.
4. Reissue a new activation token if appropriate.
5. Repeat activation.

Never manually edit learner identity records to bypass validation.

---

# 18. Duplicate Identity Prevention

The platform must reject:

- Multiple learner UIDs for one credential
- Multiple credentials bound to different identities without reconciliation
- Reuse of activation tokens

---

# 19. Audit Requirements

Every activation records:

- Credential ID
- Learner UID
- Administrator
- Timestamp
- Activation status
- Token ID
- Source IP (if available)

Audit records are immutable.

---

# 20. Security Requirements

Identity activation requires:

- Authentication
- Authorization
- Secure token validation
- Firestore Rules enforcement
- Service-layer validation
- Audit logging

---

# 21. Administrative Checklist

Before Activation

✓ Credential verified

✓ Email verified

✓ Token generated

✓ Token not expired

After Activation

✓ Learner UID bound

✓ Dashboard verified

✓ Credentials visible

✓ Learning Resources visible

✓ Audit recorded

---

# 22. Troubleshooting Matrix

| Issue | Possible Cause | Resolution |
|--------|----------------|------------|
| Invalid token | Token expired or revoked | Generate a new activation token |
| Email mismatch | Learner authenticated with different email | Authenticate using the verified email |
| Credentials not visible | Entitlement resolution failed | Review entitlement service and learner binding |
| Learning resources missing | Resource publication or assignment issue | Verify publication and learner eligibility |
| Duplicate activation attempt | Token already used | Reissue a new activation token after verification |

---

# 23. Governance Rules

The following rules are mandatory.

✓ One learner has one permanent learner UID.

✓ Activation tokens are single use.

✓ Previous active tokens are revoked when a new token is issued.

✓ Identity binding is permanent.

✓ Identity activation cannot bypass service-layer validation.

✓ Audit history is permanent.

---

# 24. Related Documents

- DOCUMENTATION-INDEX.md
- Learning Resource Lifecycle
- Firestore Schema Reference
- Firestore Collections Reference
- ADR-019 – Learning Resource Delivery Architecture
- ADR-020 – Governed Learning Resource Release Architecture
- ADR-023 – Learning Resource Registration Strategy

---

# 25. Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 27-Jul-2026 | Initial Identity Activation Runbook |

---

# 26. Document Control

This runbook defines the approved operational procedure for identity
activation within Agile AI University.

Any changes to the activation workflow require:

1. Architectural approval
2. Updates to the activation services
3. Updates to related documentation
4. Production validation

Identity activation is a governed process and must not be bypassed.

---

**End of Document**