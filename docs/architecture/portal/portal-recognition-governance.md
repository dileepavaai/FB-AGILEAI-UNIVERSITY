# Portal Recognition Governance

Version: 2.0.0
Status: LOCKED
Module: Student & Executive Portal
Governance Area: Recognition Architecture
Effective Date: June 2026

---

# Purpose

This document establishes the governance model for recognition assets within the Agile AI University Student & Executive Portal.

Recognition assets represent academic and professional artifacts issued as a result of credential achievement.

Examples include:

* University Certificates
* Trainer Certificates
* Digital Badges
* Future Recognition Assets

This governance supersedes the original user-scoped recognition model.

---

# Governance Decision

## Recognition Assets Are Credential-Scoped

Recognition assets belong to a credential.

Recognition assets do not belong directly to a user.

A user may possess multiple credentials.

Each credential may expose one or more recognition assets.

Therefore recognition visibility must be resolved from credential ownership rather than user ownership.

---

# Architectural Principle

Recognition assets are derived through the following hierarchy:

Authentication

↓

Authorization

↓

Entitlements

↓

Portal Resolver

↓

Visible Credentials

↓

Credential Registry

↓

Recognition Applicability

↓

Recognition Service

↓

Recognition Registry

↓

Recognition Renderer

Recognition assets must never be derived directly from entitlements.

Recognition assets must never be derived directly from user identity.

---

# Recognition Ownership Model

## Incorrect Model (Retired)

User

↓

University Certificate

Trainer Certificate

University Badge

Under this model a user would receive a single certificate, trainer certificate and badge regardless of the number of credentials owned.

This model does not reflect Agile AI University credential operations.

Status: RETIRED

---

## Correct Model (LOCKED)

User

↓

Credentials

↓

Recognition Assets

Example:

User

↓

AIPA

AAIA

↓

AIPA University Certificate

AIPA Trainer Certificate

AIPA University Badge

AAIA University Certificate

AAIA Trainer Certificate

AAIA University Badge

Status: LOCKED

---

# Recognition Identity Governance

Recognition Asset Identity

credential_code

*

recognition_type

Examples:

AIPA + UNIVERSITY_CERTIFICATE

AAIA + UNIVERSITY_CERTIFICATE

These represent separate recognition assets.

They must not be treated as duplicates.

---

# Deduplication Governance

## Prohibited

Deduplicating by recognition type alone.

Example:

UNIVERSITY_CERTIFICATE

This approach incorrectly collapses credential-specific assets into a single asset.

Status: PROHIBITED

---

## Approved

Deduplication may only occur when:

credential_code matches

AND

recognition_type matches

Example:

AIPA + UNIVERSITY_CERTIFICATE

AIPA + UNIVERSITY_CERTIFICATE

Duplicate → Allowed to collapse

Example:

AIPA + UNIVERSITY_CERTIFICATE

AAIA + UNIVERSITY_CERTIFICATE

Not a duplicate

Must remain separate assets

Status: APPROVED

---

# Credential Registry Governance

Credential definitions determine recognition applicability.

Example:

AIPA

recognitions:

* UNIVERSITY_CERTIFICATE
* TRAINER_CERTIFICATE
* UNIVERSITY_BADGE

AAIA

recognitions:

* UNIVERSITY_CERTIFICATE
* TRAINER_CERTIFICATE
* UNIVERSITY_BADGE

Future credentials may define alternative recognition models.

Example:

SELF_PACED_AI

recognitions:

* UNIVERSITY_CERTIFICATE

Recognition applicability remains owned by credential definitions.

Status: LOCKED

---

# Recognition Registry Governance

Recognition Registry owns:

* Recognition metadata
* Recognition titles
* Recognition descriptions
* Recognition display configuration
* Recognition visual properties

Recognition Registry does not determine eligibility.

Status: LOCKED

---

# Recognition Service Governance

Recognition Service is responsible for:

* Consuming resolver-approved credentials
* Resolving credential definitions
* Resolving applicable recognition assets
* Building recognition models
* Invoking the renderer

Recognition Service must not:

* Query APIs
* Query Firestore
* Perform authorization
* Resolve entitlements
* Infer eligibility
* Render UI

Status: LOCKED

---

# Portal User Experience Governance

A credential and its recognition assets are distinct concepts.

The portal shall display:

1. Credentials
2. Recognition Assets

as separate experiences.

Example:

My Credentials

* AIPA
* AAIA

My Recognition Assets

* AIPA University Certificate
* AIPA Trainer Certificate
* AIPA University Badge
* AAIA University Certificate
* AAIA Trainer Certificate
* AAIA University Badge

Status: LOCKED

---

# Future Compatibility

This governance supports:

* Instructor-led credentials
* Self-paced credentials
* Executive credentials
* Accredited Trainer credentials
* Licensed Training Organization credentials
* University partnerships
* Digital wallet integrations
* Verification services
* Future recognition asset types

without requiring architectural redesign.

Status: LOCKED

---

# Governance Status

This governance is considered LOCKED.

Future recognition implementations must comply with the credential-scoped recognition model.

Any deviation from this model requires a formal governance revision.

Status: LOCKED

---

# Change History

## Version 2.0.0

* Retired user-scoped recognition model
* Established credential-scoped recognition model
* Established recognition identity governance
* Established recognition ownership governance
* Established recognition deduplication governance
* Aligned portal architecture with Agile AI University credential issuance model

END OF GOVERNANCE
