# Identity Reconciliation Runbook

**Status:** ACTIVE  
**Owner:** Agile AI University  
**Operational Domain:** Identity, Credential Ownership and Learner Reconciliation  
**Related Decision:** `docs/04-decisions/ADR-027-Automatic-Learner-Identity-Reconciliation.md`  
**Related Architecture:** `docs/03-architecture/security/identity-reconciliation-architecture.md`

---

## 1. Purpose

This runbook defines the operational procedure for learner identity reconciliation within Agile AI University.

Automatic identity reconciliation connects an authenticated Firebase learner identity with eligible historical or current credential records.

The normal production workflow is:

```text
Learner Authentication
    ↓
Firebase Identity Verification
    ↓
Verified UID + Email
    ↓
Credential Matching
    ↓
Credential Eligibility
    ↓
Ownership Validation
    ↓
Automatic learner_uid Binding
    ↓
Entitlement Resolution
    ↓
Student Portal