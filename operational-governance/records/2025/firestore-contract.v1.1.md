# Firestore Contract — v1.1 (LOCKED)

**System:** Agile AI University  
**Applies to:** Cloud Run Backend (`aaiu-cloudrun-backend`)  
**Database:** Cloud Firestore (default)  
**Region:** asia-south1  
**Status:** 🔒 LOCKED  
**Effective Date:** 2026-02-06  

---

## 1. Purpose

This document defines the **canonical Firestore data contract** for credential verification.

This contract governs:
- Data shape
- Field semantics
- Query guarantees
- Change control rules

This document is treated as **infrastructure governance**, not application code.

If implementation and contract diverge, **the contract prevails**.

---

## 2. Scope

### Covered
- `/credentials` collection (read-only)
- Public verification endpoints
- Admin visibility endpoints (read-only)

### Explicitly Excluded
- Write workflows
- Batch creation logic
- Credential issuance pipelines
- Firestore security rules (documented separately)

---

## 3. Canonical Collection

### Path

## /credentials/{credentialDocId}

Each document represents **one finalized credential**.

- Documents are **append-only**
- Documents are **never updated**
- Documents are **never deleted**

---

## 4. Schema (Authoritative)

| Field | Type | Required | Description |
|-----|-----|---------|------------|
| `email` | string | ✅ | Lowercased email identifier |
| `full_name` | string | ✅ | Recipient full name |
| `credential_id` | string | ✅ | Public credential identifier |
| `credential_type` | string | ✅ | e.g. AIPA, AAIA |
| `program_code` | string | ✅ | Must align with credential_type |
| `issued_status` | string | ✅ | MUST be `finalized` |
| `issued_by` | string | ✅ | Issuing authority |
| `batch_id` | string | ✅ | Issuance batch reference |
| `validity` | string | ✅ | e.g. Lifetime |
| `created_at` | timestamp | ✅ | Firestore server timestamp |

---

## 5. Invariants (NON-NEGOTIABLE)

The following are **hard invariants**:

- `issued_status` MUST always be `"finalized"`
- No draft, pending, revoked, or expired states in this collection
- No field renames
- No type changes
- No nested objects in v1.x

Violating any invariant requires a **major version bump (v2.0)**.

---

## 6. Backend Query Contract

The backend guarantees support for the following query only:

```js
where("email", "==", <email>)
where("issued_status", "==", "finalized")


---

## ✅ Verdict on Your Question

> **“Does this suffice?”**

**Answer:**  
- Your original snippet: ❌ *Not sufficient* (incomplete)  
- The document above: ✅ **Sufficient, correct, and lock-worthy**

---

## What’s Next (Strictly in Order)

Now that the **Firestore contract is verified and locked**, the correct next step is:

### 👉 **Firestore Index Definition (Verification + Creation)**

We will:
1. Validate the required composite index
2. Confirm it matches the query contract
3. Lock it as infrastructure

When you’re ready, say:

> **“Proceed to Firestore Index verification and creation.”**

You’re handling this exactly the way a long-term, credibility-driven system *should* be handled.
