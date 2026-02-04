# 🔒 PHASE-C FREEZE RECORD  
## Agile AI University — Certificate & Authorization Artifacts

**STATUS:** FINAL · FROZEN · GOVERNANCE  
**PHASE:** Phase-C — Formal Document Artifacts  
**VERSION:** v1.0  
**DATE FROZEN:** 2026-02-___  
**CHANGE AUTHORITY:** ❌ NONE (unless explicitly unlocked by governance)

---

## 1️⃣ PURPOSE OF PHASE-C (LOCKED)

Phase-C formalizes **institutional document artifacts** issued by Agile AI University.

These artifacts exist to:

- Provide **official documentation** for HR, compliance, and records
- Maintain **institutional authority**
- Preserve **legal and audit integrity**
- Remain **decoupled from social sharing and verification**

Phase-C explicitly does **NOT** exist for:
- Marketing
- Social sharing
- Gamification
- Public credential browsing

---

## 2️⃣ PHASE-C ARTIFACTS (LOCKED SCOPE)

Phase-C introduces exactly **two** document artifacts.

### A. University Certificate (PDF)

- Formal institutional document
- Issued per credential
- Validity: **Lifetime**
- Private access only
- Downloadable via authenticated portal
- Non-interactive, non-public

### B. Trainer Authorization Certificate (PDF)

- Role-based authority document
- Time-bound and revocable
- Private access only
- Used to authorize delivery of specific programs
- Separate from academic credentials

❌ No other document types are introduced in Phase-C.

---

## 3️⃣ ARCHITECTURE PRINCIPLES (LOCKED)

Phase-C operates under the following **non-negotiable principles**:

1. Documents are **not credentials**
2. Documents are **not verification surfaces**
3. Documents are **not public artifacts**
4. Verification occurs **only** via `verify.agileai.university`
5. Social sharing uses **Phase-B credential card images**, not PDFs

---

## 4️⃣ DATA & SCHEMA GOVERNANCE (LOCKED)

### Canonical Data Model

- Phase-C documents reuse the **CredentialSharePayload v1.0**
- Extended minimally for issuance metadata
- No document introduces new authority or entitlement data

### Prohibited Fields (ABSOLUTE)

The following must **never** appear in Phase-C documents:

- Email addresses
- Assessment scores
- Batch names
- Internal registry IDs
- Trainer evaluators
- Portal user IDs

Any violation is a **SYSTEM ERROR**, not a UI defect.

---

## 5️⃣ GENERATION MODEL (LOCKED)

### Generation Rules

- Documents generated **server-side only**
- Triggered by:
  - Credential issuance, OR
  - First authenticated download
- Deterministic output
- No silent regeneration

### Immutability

- PDFs are immutable once generated
- Format or layout changes require:
  - New schema version
  - Explicit governance record
  - No retroactive replacement of existing PDFs

---

## 6️⃣ STORAGE & ACCESS CONTROL (LOCKED)

### Storage Rules

- Private storage only
- ❌ Not Firebase Hosting
- ❌ Not `public-certs`
- ❌ Not publicly accessible URLs

### Access Control

| Role | Access |
|---|---|
Credential Holder | Own certificate only |
Trainer | Own authorization document only |
Admin | All documents |

### Revocation Rules

- Revoking a credential:
  - Does **not** delete PDFs
  - Blocks portal access
  - Verification reflects revoked status
- Revoking trainer authorization:
  - Blocks document access
  - Authorization status updated centrally

---

## 7️⃣ SEPARATION OF CONCERNS (LOCKED)

| Layer | Responsibility |
|---|---|
Portal | Authenticated document access |
Credential Registry | Authority of issuance |
PDF Renderer | Presentation only |
Verification System | Trust confirmation |
Social Sharing | Phase-B images only |

No layer may assume responsibilities belonging to another.

---

## 8️⃣ SECURITY & COMPLIANCE POSTURE (LOCKED)

- No public indexing
- No document enumeration
- No document-based verification
- No embedded trust assertions inside PDFs
- Documents are **supporting evidence**, not proof

---

## 9️⃣ CHANGE CONTROL (ABSOLUTE)

The following changes are **FORBIDDEN** without an explicit governance unlock:

- Making certificates public
- Embedding verification results or QR codes in PDFs
- Auto-sharing certificates to social platforms
- Allowing unauthenticated downloads
- Treating PDFs as authoritative verification

---

## 🔟 GOVERNANCE DECLARATION

Phase-C is hereby **FROZEN** with the above scope, architecture, and rules.

Any future work must:

- Respect this freeze
- Declare a new phase (Phase-D or beyond)
- Provide an explicit governance justification
- Include a new freeze record

---

## ✅ PHASE-C STATUS

✔ University Certificate PDF defined  
✔ Trainer Authorization PDF scoped  
✔ Storage & access controls locked  
✔ Verification separation preserved  
✔ Institutional credibility protected  

---

## 📁 RECOMMENDED REPO LOCATION

