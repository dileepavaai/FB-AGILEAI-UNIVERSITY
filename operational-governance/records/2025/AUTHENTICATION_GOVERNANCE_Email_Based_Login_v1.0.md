# 🔒 AUTHENTICATION GOVERNANCE RECORD  
## Transition to Email-Based Authentication (Removal of Gmail Dependency)

**STATUS:** PROPOSED · BOARD REVIEW  
**VERSION:** v1.0 (Board Edition)  
**APPLIES TO:** All Authenticated Portals  
(Student · Executive · Trainer · Admin)  
**PHASE DEPENDENCY:** Phase-C (Foundational)  
**CHANGE AUTHORITY:** Board / Governance Approval Required  
**EFFECTIVE DATE:** Upon approval

---

## 1️⃣ EXECUTIVE PURPOSE

This record governs the **removal of Gmail-only authentication dependency** and the adoption of a **provider-neutral, email-based authentication model** for Agile AI University.

The change is foundational and necessary to:

- Preserve **institutional neutrality and credibility**
- Support participants using **non-Gmail and corporate email identities**
- Enable **trainers, executives, and enterprise users**
- Remove perceived **vendor lock-in**
- Prepare the platform for **Phase-C artifacts and future subscriptions**

This is a **governance-driven decision**, not a technical refactor.

---

## 2️⃣ CURRENT STATE (RISK ACKNOWLEDGEMENT)

### Existing Model
- Authentication restricted to Google / Gmail accounts

### Identified Risks
- Credential holders use diverse, non-Gmail emails
- Participants are forced to create third-party accounts
- Institutional perception risk:
  > “A university requiring Gmail undermines neutrality”
- Trainer and enterprise onboarding is constrained
- Long-term scalability is impaired

The current state is **acceptable for early development**, but **not acceptable for institutional scale**.

---

## 3️⃣ TARGET STATE (BOARD-APPROVED DIRECTION)

### Core Authentication Principles (LOCKED)

- Authentication must be **email-based**, not provider-based
- Any valid email domain must be supported
- Authentication must be:
  - Passwordless
  - Secure
  - Auditable
  - Vendor-neutral
- Identity must be decoupled from:
  - Credential authority
  - Role assignment
  - Verification trust

### Explicit Non-Goals
- No custom password management
- No in-house identity provider
- No change to public verification systems

---

## 4️⃣ APPROVED AUTHENTICATION MODEL

### ✅ Firebase Email Link Authentication (Passwordless)

Users authenticate by receiving a **secure, time-bound email login link**.

This model is approved because it:

| Board Concern | Resolution |
|---|---|
Security | No passwords stored or transmitted |
Neutrality | Works with all email providers |
Scalability | Supports individuals and enterprises |
Auditability | Firebase-managed tokens and logs |
Operational Risk | Minimal change footprint |

Google authentication may be retained **temporarily** during transition but is **not the long-term model**.

---

## 5️⃣ ROLE & AUTHORITY SEPARATION (NON-NEGOTIABLE)

Authentication establishes **identity only**.

It does **not** confer:
- Credential ownership
- Trainer authority
- Subscription access
- Administrative rights

All authority remains governed by:
- Institutional registries
- Admin-controlled entitlements
- Program and subscription logic

This separation is **mandatory**.

---

## 6️⃣ TRANSITION STRATEGY (CONTROLLED & NON-DISRUPTIVE)

### Phase A — Parallel Enablement
- Email-based authentication enabled
- Existing Google users unaffected

### Phase B — Natural Adoption
- New users use email-based login
- Credential holders log in using their issued email identity

### Phase C — Dependency Removal
- Google-only dependency removed
- Email-based authentication becomes canonical
- Governance lock applied

No forced migrations.  
No credential re-issuance.

---

## 7️⃣ SECURITY & COMPLIANCE POSTURE

- No passwords handled by Agile AI University
- Authentication tokens managed by Firebase
- Email remains the canonical identity reference
- Audit logs preserved
- No increased breach surface introduced

This change **reduces**, not increases, long-term security risk.

---

## 8️⃣ IMPACT SUMMARY (BOARD VIEW)

### Positive Outcomes
- Restores institutional neutrality
- Improves participant trust
- Enables trainer and enterprise programs
- Aligns with universities and professional bodies
- Removes vendor lock-in perception

### Residual Risks
- Temporary user education required during transition  
  → Mitigated via clear portal messaging

---

## 9️⃣ GOVERNANCE CONSTRAINTS (ABSOLUTE)

The following actions are **prohibited** without further board approval:

- Reintroducing provider-locked authentication
- Introducing password-based login
- Binding credentials to authentication provider IDs
- Restricting access by email domain

---

## 🔟 BOARD DECLARATION (PENDING)

Upon approval, this record authorizes:

- Implementation of email-based authentication
- Controlled transition away from Gmail dependency
- Phase-C implementation to proceed without identity risk

This record becomes **binding governance** upon approval.

---

## 📁 RECORD LOCATION


Referenced from:


---

© Agile AI University  
Institutional Governance Record
