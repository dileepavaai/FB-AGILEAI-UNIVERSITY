# ADR-027 – Automatic Learner Identity Reconciliation

**Status:** ACCEPTED  
**Decision Date:** 23 August 2026  
**Owner:** LAAU  
**Decision Domain:** Identity, Credential Ownership and Learner Reconciliation  
**Related Architecture:** `docs/03-architecture/security/identity-reconciliation-architecture.md`

---

## 1. Decision Summary

LAAU will automatically reconcile authenticated learner identities with eligible credential records during the governed Student Portal authentication lifecycle.

The reconciliation model will connect:

```text
Firebase Authentication
    ↓
Verified learner identity
    ↓
Verified email
    ↓
Credential identity resolution
    ↓
Credential lifecycle eligibility
    ↓
Existing ownership validation
    ↓
Automatic learner_uid binding
    ↓
Entitlement resolution
    ↓
Student Portal access