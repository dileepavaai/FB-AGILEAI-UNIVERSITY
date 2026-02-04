# Agile AI University — Governance Index

This document is the **authoritative index** of all governance, architecture, and
institutional decision records for the Agile AI University platform.

It defines:
- Which governance phases exist
- Which phases are locked or active
- Where the authoritative records for each phase reside
- Which cross-cutting governance layers apply globally

This index is **informational but authoritative**.  
It does not replace individual governance records.

---

## 🔒 Core Governance Principles (Global)

These principles apply to **all phases**, **all systems**, and **all runtime behavior**:

- Governance precedes implementation
- Decisions are documented **before** execution
- Governance records are immutable once locked
- No silent changes to locked phases or records
- Versioned documents represent binding institutional intent
- If code conflicts with governance, **governance prevails**

Governance records take precedence over:
- Runtime code
- UI behavior
- Operational assumptions

---

## 🟦 Phase-A — Credential Issuance & Core Architecture

**Status:** FINAL · LOCKED  
**Change Authority:** ❌ None

### Scope
- Credential issuance model
- Credential ID structure
- Lifetime validity rules
- Separation of issuance, rendering, sharing, and verification

### Notes
- Credentials are *issued*, not earned via exams
- Validity term **“Lifetime”** is canonical
- Issuance records are immutable

### Records
- Internal / historical (no active modification permitted)

---

## 🟩 Phase-B — Sharing Controls & Public Credential Presentation

**Status:** FINAL · LOCKED · SHIPPED  
**Change Authority:** ❌ None

### Scope
- Credential sharing language
- OpenGraph (social preview) enforcement
- Separation of verification vs profile claiming
- Portal credential card behavior

### Locked Steps
- Step-1: Sharing language lock
- Step-2: OpenGraph enforcement
- Step-3: Sharing intent separation

### Authoritative Records
- `records/Agile_AI_University_Phase-B_Governance_Record_v1.0.pdf`
- `records/Agile_AI_University_Phase-B_to_Phase-C_Transition_Record_v1.0.pdf`

---

## 🟨 Phase-C — Extended Credential Artifacts

**Status:** ACTIVE · GOVERNED  
**Change Authority:** Phase-C Governance Charter only

### Authorized Scope
- University-issued certificate PDFs
- Trainer / facilitator authorization artifacts
- Controlled distribution of non-interactive artifacts

### Explicitly Out of Scope
- Credential issuance rules
- Eligibility or entitlement logic
- Assessment or scoring changes
- Public OpenGraph behavior

### Constraints
- Phase-B artifacts must not be modified
- All new artifacts must reference the canonical credential record
- Any new public-facing behavior requires a new governance phase

### Core Phase-C Records
- `records/Phase-C_Governance_Charter_v1.0.md`
- `records/Phase-C_Pre-Implementation_Governance_Review_v1.0.md`
- `records/Phase-C_Implementation_Checklist_v1.0.md`

---

## 🔐 Authentication Governance (Cross-Cutting · Phase-C Dependency)

**Applies To:** Portal, Assessment, Executive Insight  
**Change Authority:** Explicit governance approval only

### Records
- `records/AUTHENTICATION_GOVERNANCE_Email_Based_Login_v1.0.md`
- `records/AUTHENTICATION_GOVERNANCE_Email_Based_Login_v1.0.pdf`

### Governance Notes
- Authentication is provider-neutral and email-based
- Disposable email handling is governed (not ad-hoc)
- Authentication governance must be satisfied **before**
  Phase-C certificate or trainer artifacts are released

---

## 🧾 Runtime Governance (Global · Non-Phase-Specific)

**Applies To:** All environments and deployments  
**Change Authority:** Explicit governance unlock only

### Purpose
Defines the **frozen runtime contract** across:
- Node.js
- Firebase SDKs
- Firebase CLI expectations
- Frontend Firebase runtime model

### Authoritative Documents
- `runtime-governance.md`
- `runtime-freeze.md`
- `runtime-manifest.json`
- `upgrade-checklist.md`

### Governance Rule
Runtime drift without governance approval is **not permitted**.

---

## 🏛 Credential, Certificate & Trainer Governance (Phase-C)

### University Certificate PDF Schema
- `records/Phase-C_University_Certificate_PDF_Schema_v1.0.md`

### Certificate & Trainer Storage / Access Controls
- `records/Phase-C_Certificate_and_Trainer_Storage_Access_Controls_v1.0.md`

### Trainer Authorization Lifecycle & Revocation
- `records/Phase-C_Trainer_Authorization_Lifecycle_and_Revocation_v1.0.md`

---

## ❄️ Phase-C Freeze & Lock Records

### Freeze Template
- `records/Phase-C_Freeze_Record_TEMPLATE.md`

### Final Freeze Record
- `records/PHASE-C_FREEZE_RECORD_v1.0.md`

Once the final freeze record is issued:
- Phase-C becomes LOCKED
- No changes permitted without a new phase declaration

---

## 🔮 Future Phases

**Phase-D and beyond**
- Not defined
- Not authorized
- No assumptions permitted

Any future phase requires:
- Explicit phase declaration
- New governance charter
- Versioned governance record
- Updated Governance Index

---

## 📌 Usage & Change Rules

- Governance documents **must not** be served publicly
- Runtime systems **must comply** with locked governance records
- Any change to a locked record requires:
  - A new version
  - Explicit governance approval
  - Recorded rationale

---

## 🛑 Authority Statement

This Governance Index is **authoritative**.

If a conflict arises between:
- Code and governance → **governance prevails**
- UI behavior and governance → **governance prevails**
- Assumptions and governance → **governance prevails**

---

© Agile AI University  
Governance Framework — Institutional Record
