# 🔒 Certificate & Trainer Authorization Storage and Access Controls (v1.0)

**Organization:** Agile AI University  
**System:** Credential Architecture, Sharing & Verification  
**Phase:** Phase-C — Extended Credential Artifacts  
**Artifact Types:**  
- University Certificate PDFs  
- Trainer / Facilitator Authorization PDFs  
**Status:** GOVERNED · AUTHORIZED  
**Governing Charter:** Phase-C Governance Charter (v1.0)

---

## 1️⃣ Purpose

This document defines **where**, **how**, and **under what conditions** Phase-C artifacts are:

- Stored
- Accessed
- Distributed
- Revoked or expired

Its purpose is to ensure that extended artifacts:
- Remain **representational only**
- Do not become public entitlements
- Do not undermine credential verification authority
- Remain institutionally controlled

---

## 2️⃣ Foundational Principles (NON-NEGOTIABLE)

1. **Credentials remain canonical**  
   Certificates and trainer authorizations are secondary representations.

2. **No public discoverability**  
   Phase-C artifacts must never be publicly indexed or browsable.

3. **User-initiated access only**  
   Artifacts are accessed deliberately, never pushed or auto-exposed.

4. **Independent revocability**  
   Trainer authorizations must be revocable without affecting credentials.

---

## 3️⃣ Storage Model (REQUIRED)

### A. Storage Location

Phase-C artifacts must be stored in **non-public, access-controlled storage**, separate from:

- Public websites
- Verification systems
- Credential registries

**Allowed examples:**
- Private object storage (e.g., private bucket)
- Secure document store with access rules
- Encrypted filesystem (server-side)

**Explicitly prohibited:**
- Public Firebase Hosting
- Public URLs without access context
- CDN-backed public assets
- Source control repositories

---

### B. Logical Separation

Storage must distinguish between:

| Artifact Type | Storage Namespace |
|--------------|------------------|
| Certificate PDFs | `/certificates/` |
| Trainer Authorizations | `/trainer-authorizations/` |

Artifacts must never share namespaces with:
- Credential records
- Verification endpoints
- Badges or social assets

---

## 4️⃣ Access Control Rules — Certificates

### A. Who May Access
- The credential holder
- Explicitly authorized institutional administrators

### B. Access Method
- User-initiated download from authenticated context
- Optional one-time email delivery (link-based or attachment)

### C. Prohibited Access
- Anonymous access
- Public URLs
- Search engine indexing
- Automated distribution

---

## 5️⃣ Access Control Rules — Trainer Authorizations

### A. Who May Access
- Authorized individual (trainer/facilitator)
- Designated institutional authorities

### B. Access Method
- Authenticated portal access
- Direct administrative delivery (controlled)

### C. Prohibited Access
- Public verification endpoints
- Credential pages
- Social sharing
- OpenGraph exposure

Trainer authorizations must **never** be accessible via:
- Credential ID
- Verification system
- Public lookup

---

## 6️⃣ Download & Distribution Controls

### Certificates
- Download is always user-initiated
- No auto-download on issuance
- No bulk export without administrative approval

### Trainer Authorizations
- Download permitted only while authorization is Active
- Downloads must be disabled if authorization is:
  - Suspended
  - Revoked
  - Expired

---

## 7️⃣ Revocation & Expiry Enforcement

### Certificates
- Certificates are not revoked independently
- If a credential is invalidated (rare), certificate access must be withdrawn
- Historical copies may exist externally, but institutional access must cease

### Trainer Authorizations
- Revocation or expiry must:
  - Immediately disable access
  - Prevent further downloads
  - Clearly mark authorization as inactive internally

No artifact may be silently altered after issuance.

---

## 8️⃣ Logging & Audit Requirements

The system must log:
- Artifact generation
- Access events (download / delivery)
- Revocation or expiry actions

Logs must include:
- Artifact ID
- Timestamp
- Action type
- Actor (user / admin / system)

Logs are **internal** and **non-public**.

---

## 9️⃣ Relationship to Verification System

- Certificates and trainer authorizations are **not verifiable artifacts**
- Verification remains exclusive to:
  - `verify.html`
  - Credential ID lookup
- No artifact may claim to replace verification

If conflict arises:
> **Verification system prevails.**

---

## 🔟 Explicit Prohibitions (ABSOLUTE)

Phase-C artifacts must NOT:
- Be crawlable or indexed
- Be linked from public pages
- Carry OpenGraph metadata
- Be accessible via guessable URLs
- Be bundled with credentials in public contexts

Any violation constitutes a **governance breach**.

---

## 🔒 Final Declaration

> These Storage and Access Controls (v1.0) define the **only permitted handling model** for Phase-C certificate and trainer authorization artifacts.

Any change requires:
- Explicit governance unlock
- Superseding version of this document

**Issued by:** Governance Authority  
**Date:** 21 Jan 2026
