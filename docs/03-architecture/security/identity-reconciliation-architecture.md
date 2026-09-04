# Identity Reconciliation Architecture

**Version:** 1.0.0  
**Status:** ACTIVE  
**Last Updated:** 23 August 2026  
**Owner:** LAAU  
**Architecture Domain:** Security, Identity and Credential Ownership  
**Related Decision:** `docs/04-decisions/ADR-027-Automatic-Learner-Identity-Reconciliation.md`  
**Related Runbook:** `docs/10-runbooks/IDENTITY_RECONCILIATION_RUNBOOK.md`

---

## 1. Purpose

This document defines the production architecture for learner identity reconciliation within LAAU.

Identity reconciliation establishes and validates the canonical relationship between an authenticated Firebase identity and eligible LAAU credential records.

The architecture connects:

```text
Firebase Authentication
    ↓
Verified learner identity
    ↓
Verified email
    ↓
Credential identity resolution
    ↓
Credential lifecycle validation
    ↓
Existing ownership validation
    ↓
Canonical learner_uid
    ↓
Entitlement resolution
    ↓
Authorization
    ↓
Student Portal services