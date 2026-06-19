# Agile AI University

# Student Portal

# Credentials Module Governance

Version: 1.0
Status: LOCKED
Date: 2026-06-19

---

# 1. PURPOSE

The Credentials Module provides authenticated learners with self-service access to their university recognitions and supporting credential artifacts.

The module acts as a learner consumption experience.

The module does not issue, modify, revoke, or govern credentials.

Credential authority remains external to this module.

---

# 2. POSITIONING

The Credentials Module is part of the Agile AI University Student Portal.

Its purpose is to provide authenticated access to:

* University Recognitions
* University Certificates
* Trainer Certificates
* Credential Verification Links

The module is not an administrative system.

The module is not a credential issuance system.

The module is not a credential management system.

---

# 3. AUTHORITATIVE SOURCES

## Credential Authority

Authoritative Source:

Credential Registry

The Credential Registry remains the single source of truth for:

* Credential ID
* Learner Information
* Credential Status
* Program Information
* Recognition Information

The Credentials Module must never maintain independent credential records.

---

## Access Authority

Authoritative Source:

User Entitlements

User Entitlements determine whether an authenticated learner is permitted to access credential information.

---

# 4. AUTHENTICATION GOVERNANCE

Supported Authentication Methods:

* Email Magic Link
* Google Sign-In

Authentication method does not affect credential access.

Authorization decisions must be based on authenticated user identity and entitlement resolution.

---

# 5. AUTHORIZATION GOVERNANCE

Access requires:

```text
student_portal = true
credentials_view = true
```

Both conditions must be satisfied.

Learners without required entitlements must not access credential information.

---

# 6. CREDENTIAL DISPLAY GOVERNANCE

The Credentials Module displays credential summaries.

Required Display Elements:

* Credential Title
* Credential ID
* Credential Status

Optional Display Elements:

* Program Name
* Recognition Type
* Recognition Date

The module must not display internal administrative metadata.

---

# 7. CERTIFICATE ACCESS GOVERNANCE

The module provides access to:

## University Certificate

Represents institutional recognition issued by Agile AI University.

University Certificate access is read-only.

The module must not modify certificate content.

---

## Trainer Certificate

Represents training delivery context supporting university recognition.

Trainer Certificate access is read-only.

The module must not modify certificate content.

---

# 8. VERIFICATION GOVERNANCE

Each credential may expose a verification action.

Verification actions must direct users to:

verify.agileai.university

Verification authority remains external to the Student Portal.

---

# 9. DATA OWNERSHIP

The Credentials Module owns:

* Credential presentation
* Learner experience
* Navigation
* Rendering logic

The Credentials Module does not own:

* Credential records
* Trainer records
* Organization records
* Verification records
* Recognition lifecycle records

---

# 10. ARCHITECTURE GOVERNANCE

Module Structure

```text
credentials/

├── assets/
│   ├── css/
│   └── js/
│
├── my-credentials.html
│
└── GOVERNANCE.md
```

---

## Asset Ownership

Credential-specific assets must remain within the Credentials Module.

Examples:

* credentials.css
* load-credentials.js
* render-credentials.js

Shared assets must remain under:

```text
shared/design-authority/
```

Examples:

* site.css
* header.js
* footer.js
* theme.js

---

# 11. FUTURE CAPABILITIES

Potential future enhancements include:

* Recognition History
* Digital Badge Access
* Wallet Export
* Credential Sharing
* Learner Profile Integration

Future enhancements must not violate existing credential governance.

---

# 12. OUT OF SCOPE

The following capabilities are explicitly excluded:

* Credential Issuance
* Credential Editing
* Credential Revocation
* Credential Approval
* Trainer Administration
* Organization Administration
* Batch Administration

These capabilities belong to administrative systems.

---

# 13. SUCCESS CRITERIA

A learner must be able to:

1. Authenticate.
2. Access the Student Portal.
3. View entitled credentials.
4. View University Certificates.
5. Download University Certificates.
6. View Trainer Certificates.
7. Download Trainer Certificates.
8. Verify Credentials.

Completion of these capabilities constitutes Student Portal Credentials Module MVP readiness.

---

# Governance Status

Credentials Module Governance v1.0

Status: LOCKED

Future modifications require explicit governance approval.
