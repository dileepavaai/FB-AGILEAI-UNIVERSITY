# Agile AI University

# Certificate Template Governance

Version: 1.0

Status: LOCKED

Date Locked: 2026-06-05

---

# Purpose

This document defines the governance framework for certificate templates used throughout the Agile AI University credential ecosystem.

The purpose of this governance is to ensure:

* Institutional consistency
* Brand integrity
* Certificate authenticity
* Rendering consistency
* Long-term maintainability
* Template traceability

across all current and future credential programs.

This governance applies to:

* Credential Registry
* Certificate Generator
* Badge Generator (where applicable)
* Verification Publisher
* Credential Wallet Services
* Future Credential Operations modules

---

# Foundational Principle

Certificates are institutional documents.

A certificate is not a marketing asset.

A certificate is not a course completion graphic.

A certificate is an official representation of an institutional credential.

Certificate templates must therefore be governed as institutional assets.

---

# Template Authority Rule

Status: LOCKED

Only Agile AI University approved certificate templates may be used within the credential ecosystem.

No unofficial templates are permitted.

No administrator-created templates are permitted.

No learner-created templates are permitted.

---

# Template Ownership Rule

Status: LOCKED

Certificate templates are owned by Agile AI University.

Template ownership resides with the institutional design authority.

Operational systems may consume templates.

Operational systems do not own templates.

---

# Template Repository Rule

Status: LOCKED

Approved certificate templates shall be maintained in a controlled template repository.

Recommended structure:

```text
certificate/
│
├── template/
│   ├── professional-template-v1.html
│   ├── executive-template-v1.html
│   ├── leadership-template-v1.html
│   └── template-manifest.json
```

Only approved templates may exist within the production repository.

---

# Program Independence Rule

Status: LOCKED

Certificate rendering must not rely directly on Program Names.

Incorrect:

Program Name

↓

Template

Correct:

Program Code

↓

Template Key

↓

Template

This ensures future program renaming does not affect rendering logic.

---

# Template Resolution Rule

Status: LOCKED

Certificate generation shall follow:

Credential Record

↓

Program Code

↓

Template Key

↓

Template Resolution

↓

Certificate Rendering

All template selection must be metadata-driven.

Hardcoded template selection logic is prohibited.

---

# Certificate Generator Rule

Status: LOCKED

The Certificate Generator shall:

Load Credential

↓

Resolve Template

↓

Render Certificate

The Certificate Generator shall not:

* Edit Templates
* Create Templates
* Modify Templates
* Approve Templates

Template governance is external to the generator.

---

# Template Editing Rule

Status: LOCKED

Template editing is not permitted inside operational systems.

Examples:

* Certificate Generator
* Credential Registry
* Verification Publisher

must not contain template editing capabilities.

Template modification must occur through governance-controlled processes.

---

# Template Version Governance

Status: LOCKED

Templates may evolve through version-controlled releases.

Examples:

Professional Template v1

↓

Professional Template v2

↓

Professional Template v3

Each template version must remain traceable.

---

# Historical Rendering Rule

Status: LOCKED

Historical certificates should remain reproducible.

Where practical, the ecosystem should preserve access to template versions used at the time of issuance.

Example:

Credential Issued:

2026

Template Used:

professional-template-v1

Future template changes must not invalidate historical certificate rendering.

---

# Branding Governance Rule

Status: LOCKED

Certificate templates must conform to approved institutional branding.

This includes:

* Logo usage
* Typography
* Naming conventions
* Institutional statements
* Credential presentation standards

Template modifications that affect institutional branding require governance approval.

---

# Institutional Language Rule

Status: LOCKED

Certificate wording must be institutionally approved.

Operational systems may populate variable data.

Examples:

* Learner Name
* Credential Name
* Credential ID
* Issue Date

Operational systems must not modify institutional certificate language.

---

# Dynamic Data Governance

Status: LOCKED

Certificates may dynamically populate:

* Credential ID
* Learner Name
* Program Name
* Program Code
* Issue Date
* Recognition Information
* Verification Information

Dynamic content must originate from the Credential Registry.

No certificate data may be manually overridden during generation.

---

# Recognition Display Governance

Status: LOCKED

The certificate must preserve the historical credential awarded.

Recognition information may be displayed separately when governance permits.

Historical credentials must never be rewritten to reflect later recognition changes.

Example:

Original Credential:

Agile Outcome Practitioner (AOP)

must remain:

Agile Outcome Practitioner (AOP)

even if current recognition later becomes:

Artificial Intelligence Professional Agilist (AIPA)

---

# Verification Governance

Status: LOCKED

Certificate templates should support future verification capabilities.

Examples:

* Credential ID
* Verification URL
* Verification QR Code

Implementation may be phased.

Governance support is mandatory.

---

# Security Governance

Status: LOCKED

Certificate templates must not permit:

* Arbitrary HTML injection
* User-defined scripting
* External template loading
* Runtime template uploads

Only approved templates may be rendered.

---

# Audit Governance

Status: LOCKED

Future audit systems should capture:

* Template Version Used
* Certificate Generated
* Certificate Downloaded
* Certificate Regenerated

Audit implementation may be deferred.

Governance requirements are locked.

---

# Future Evolution Rule

Status: LOCKED

The template architecture must support:

* New credential families
* New credential programs
* New recognition frameworks
* New certificate designs

without requiring redesign of the Certificate Generator.

Template evolution must occur through template governance rather than application redesign.

---

# Enterprise Design Authority Statement

Certificate templates are institutional assets.

Templates communicate credential authenticity, institutional credibility, and professional recognition.

Template governance exists to preserve consistency, trust, and long-term integrity across the Agile AI University credential ecosystem.

Operational systems render certificates.

Governance defines certificates.

This document is governance-locked and applies across the entire Agile AI University credential ecosystem.
