# 📄 University Certificate PDF Schema (v1.0)

**Organization:** Agile AI University  
**Phase:** Phase-C — Extended Credential Artifacts  
**Artifact Type:** University Certificate (PDF)  
**Status:** GOVERNED · AUTHORIZED  
**Governing Charter:** Phase-C Governance Charter (v1.0)

---

## 1️⃣ Purpose of the Certificate PDF

The University Certificate PDF is a **formal institutional document** that:

- Represents an already-issued credential
- Provides HR- and compliance-grade documentation
- Does NOT confer, modify, or evaluate credentials

The certificate is **representational only**, not authoritative.

---

## 2️⃣ Document Characteristics (NON-NEGOTIABLE)

| Attribute | Requirement |
|---------|-------------|
| Format | PDF |
| Interactivity | ❌ None |
| Forms / Fields | ❌ Not allowed |
| Scripts / Links | ❌ Not allowed (except reference URLs) |
| Mutability | ❌ Immutable once generated |
| Distribution | User-initiated download only |
| Indexing | ❌ No public indexing |

---

## 3️⃣ Certificate Layout Structure

The certificate must follow this **logical structure** (visual design is flexible but hierarchy is fixed):

### A. Header Section (Institutional Identity)
- Agile AI University logo
- Full institutional name
- Document title: **“University Certificate”**

---

### B. Recipient Section (Issued Identity)
- **Full Name of Credential Holder**  
  *(Must exactly match issuance record)*

- Optional subtitle (allowed):
  > “This document records the issuance of the following credential”

---

### C. Credential Section (Canonical Reference)

Mandatory fields:

- **Credential Title**  
  *(As issued; no embellishment)*

- **Credential ID**  
  *(Canonical ID; exact match)*

- **Issued By**  
  > Agile AI University

- **Issued On**  
  *(Date as recorded in issuance system)*

- **Validity**  
  > Lifetime  
  *(Only if applicable; no expiry dates allowed)*

---

### D. Description Section (Controlled Narrative)

- Credential description (from registry)
- Must be:
  - Neutral
  - Descriptive
  - Non-evaluative
- Must NOT include:
  - Skill validation
  - Performance claims
  - “Expert”, “Certified”, “Qualified” language

---

### E. Verification & Reference Section (Trust Anchor)

Mandatory content:

- Text:
  > “This certificate represents an officially issued credential.  
  > Verification is available at the institutional verification system.”

- **Public Credential Record URL**
https://verify.agileai.university/credential.html?cid=XXXX

No QR codes unless explicitly approved later.

---

### F. Footer Section (Governance Statement)

Mandatory footer text:

> “This document is issued by Agile AI University as a formal record of credential issuance.  
> It does not represent an examination result, ranking, or skill evaluation.”

Optional additions:
- Governance framework reference
- Issue timestamp of the PDF (not credential issuance date)

---

## 4️⃣ Language & Tone Rules (MANDATORY)

Certificate language must be:

- Institutional
- Calm
- Precise
- Outcome-neutral

Explicitly prohibited language:
- “Achievement”
- “Earned”
- “Certified expert”
- “Passed”
- “Completed training”
- “Validated skills”

---

## 5️⃣ Data Integrity Rules

- All displayed fields must originate from:
- Credential issuance record, or
- Credential registry (display-only)
- No derived or inferred fields allowed
- No conditional logic beyond formatting

---

## 6️⃣ Relationship to Other Artifacts

| Artifact | Relationship |
|-------|--------------|
| Credential Record (`credential.html`) | Canonical reference |
| Verification Page (`verify.html`) | Authoritative validation |
| Portal Credential Card | UI representation |
| Certificate PDF | Formal documentation only |

If any conflict exists, the **credential record prevails**.

---

## 7️⃣ Explicit Non-Claims (REQUIRED)

The certificate must **not**:

- Assert skill proficiency
- Assert eligibility or entitlement
- Replace verification
- Function as a badge
- Be framed as an award

---

## 8️⃣ Compliance & Audit Notes

- Certificate PDFs are governed artifacts
- Changes require:
- New schema version
- Governance approval
- Schema violations invalidate the certificate artifact

---

## 🔒 Final Declaration

> This University Certificate PDF Schema (v1.0) defines the **only permitted structure and semantics** for Phase-C certificate artifacts.

**Issued by:** Governance Authority  
**Date:** 21 Jan 2026
