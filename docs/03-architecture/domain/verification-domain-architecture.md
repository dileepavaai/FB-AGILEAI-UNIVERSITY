# Agile AI University

# Verification Domain Architecture

---

# Document Information

| Attribute | Value |
|---|---|
| **Document** | Verification Domain Architecture |
| **File** | `verification-domain-architecture.md` |
| **Version** | **1.0.0** |
| **Status** | **ACTIVE** |
| **Architecture Status** | **LOCKED** |
| **Classification** | Enterprise Domain Architecture |
| **Owner** | Agile AI University |
| **Authority** | Enterprise Verification Domain |
| **Parent Architecture** | Agile AI University Enterprise Architecture & System Context |
| **Last Updated** | July 2026 |

---

# Document Governance

## Status

**LOCKED**

This document defines the Enterprise Verification Domain Architecture for the Agile AI University Enterprise Platform.

The Verification Domain governs verification rules, validation outcomes, verification responses, public disclosure rules, verification history, and trust-related analytics.

The Verification Domain owns enterprise verification behaviour.

It does not own credentials, credential assets, recognitions, or learner identity records.

---

# 1. Domain Overview

## Introduction

The Verification Domain provides the governed trust capability of the Agile AI University Enterprise Platform.

It enables enterprise records—including credentials, certificates, digital badges, and institutional recognitions—to be independently validated against authoritative enterprise information.

Verification confirms whether an enterprise record:

- Exists
- Was officially issued
- Is currently valid
- Is approved for public verification
- Has not been revoked, suspended, superseded, or invalidated
- Is associated with the appropriate institutional record

The Verification Domain is read-oriented.

It validates enterprise truth without becoming the source of that truth.

---

# 2. Purpose

The Verification Domain exists to provide secure, consistent, auditable, and publicly trustworthy validation of enterprise achievements.

Its responsibilities include:

- Credential verification
- Credential asset verification
- Recognition verification
- Verification rule execution
- Verification outcome generation
- Public disclosure control
- Verification history
- Verification analytics
- Fraud detection support
- Future verification APIs

Verification establishes public trust.

It does not create or modify academic records.

---

# 3. Enterprise Position

```text
Credential Domain
        │
        ▼
Credential Asset Domain
        │
        ▼
Recognition Domain
        │
        ▼
Verification Domain
        │
        ▼
Verification Platform
        │
        ▼
Public Trust
```

The Verification Domain operates after authoritative enterprise records have been issued and, where applicable, published.

---

# 4. Enterprise Authority

The Verification Domain owns:

- Verification rules
- Verification request processing
- Verification outcomes
- Verification response models
- Public disclosure rules
- Verification status
- Verification history
- Verification analytics
- Verification audit metadata

The Verification Domain does not own the underlying record being verified.

---

# 5. Business Responsibilities

## Credential Verification

Validates an institutional credential against the Credential Registry.

Verification may confirm:

- Credential ID
- Credential existence
- Credential type
- Programme association
- Approval status
- Issued status
- Current lifecycle status
- Revocation or suspension state

Only governed public fields may be disclosed.

---

## Credential Asset Verification

Validates digital representations of credentials against the Asset Registry and related Credential record.

Supported asset types may include:

- University Certificate
- Trainer Certificate
- Digital Badge
- Recognition Asset
- Future wallet representation
- Future verifiable credential representation

Asset verification confirms the relationship between the digital asset and its authoritative source record.

---

## Recognition Verification

Validates institutional recognitions against the Recognition Registry.

Recognition verification may confirm:

- Recognition ID
- Recognition type
- Recipient
- Approval status
- Issued status
- Award date
- Current validity

Recognition remains independent from academic credentials unless explicitly linked.

---

## Verification Rule Execution

Applies governed validation rules.

Examples include:

- Record exists
- Required approval status is satisfied
- Required issuance status is satisfied
- Record is not revoked
- Record is not suspended
- Asset is published
- Asset version is current
- Public disclosure is permitted

Presentation platforms shall not implement these rules.

---

## Verification Outcome

Generates an authoritative outcome.

Typical outcomes include:

- Valid
- Invalid
- Not Found
- Revoked
- Suspended
- Superseded
- Unpublished
- Restricted
- Temporarily Unavailable

The Verification Domain determines the outcome.

The Verification Platform renders it.

---

## Public Disclosure Control

Determines which fields may be shown publicly.

Public verification may expose:

- Recipient name
- Credential or recognition title
- Programme
- Credential ID
- Issue or award status
- Verification result
- Issuing authority

Protected or unnecessary learner information shall not be disclosed.

---

## Verification History

Records verification activity for:

- Audit
- Analytics
- Fraud monitoring
- Operational analysis
- Institutional reporting

Verification history shall not alter the authoritative record being verified.

---

## Verification Analytics

Supports governed analysis of:

- Verification volume
- Verification success rates
- Invalid identifier attempts
- Geographic or channel trends where legally and operationally appropriate
- Asset verification activity
- Employer or institutional verification usage

Analytics remain derived information.

---

# 6. Non-Responsibilities

The Verification Domain shall not:

- Issue credentials
- Approve credentials
- Generate certificates
- Generate digital badges
- Publish credential assets
- Issue institutional recognitions
- Modify credential records
- Modify asset records
- Modify recognition records
- Deliver learner portfolio experiences
- Perform administrative credential operations
- Become an independent duplicate registry

---

# 7. Enterprise Information

## Information Owned

The Verification Domain owns:

- Verification request records
- Verification outcome records
- Verification response metadata
- Verification rule metadata
- Verification audit records
- Verification analytics
- Public disclosure configuration

## Information Consumed

The Verification Domain consumes:

- Credential records
- Credential lifecycle status
- Credential asset metadata
- Asset publication status
- Asset version information
- Recognition records
- Recognition lifecycle status
- Programme display metadata where required

Consumed information remains owned by its originating domain.

---

# 8. Enterprise Services

The Verification Domain exposes the following Enterprise Service.

## VerificationService

### Purpose

Provides the authoritative implementation of enterprise verification behaviour.

### Responsibilities

- Accept verification requests
- Validate identifiers
- Resolve verification type
- Retrieve authoritative records through governed services
- Apply verification rules
- Enforce public disclosure policy
- Generate verification outcomes
- Record verification history
- Expose verification response models
- Support verification analytics
- Support future API verification

### Non-Responsibilities

VerificationService shall not:

- Create authoritative credentials
- Publish assets
- Issue recognitions
- Render platform UI
- Alter source registries
- Replace CredentialService, CredentialAssetService, or RecognitionService

---

# 9. Supporting Enterprise Services

The Verification Domain consumes:

| Enterprise Service | Purpose |
|---|---|
| CredentialService | Credential lookup and lifecycle validation |
| CredentialAssetService | Asset lookup, publication, and version validation |
| RecognitionService | Recognition lookup and lifecycle validation |
| ProgramService | Approved programme display metadata |
| Audit Service | Verification audit recording |
| Analytics Service | Future verification analytics |
| Security Services | Protected administrative and API operations |

The Verification Domain shall consume authoritative services rather than maintaining duplicate source records.

---

# 10. Verification Registry

Where verification activity requires persistent storage, the Verification Registry may store:

- Verification Request ID
- Verification Type
- Requested Identifier
- Correlation ID
- Verification Outcome
- Outcome Reason
- Public Response Classification
- Request Source
- Timestamp
- Processing Duration
- Audit Metadata

The Verification Registry stores verification activity.

It does not replace the Credential, Asset, or Recognition Registries.

---

# 11. Business Lifecycle

```text
Verification Request Received

↓

Identifier Validated

↓

Verification Type Resolved

↓

Authoritative Record Retrieved

↓

Lifecycle and Publication Rules Applied

↓

Public Disclosure Rules Applied

↓

Verification Outcome Generated

↓

Verification History Recorded

↓

Response Published

↓

Analytics Updated
```

Verification processing shall remain deterministic and reproducible.

---

# 12. Verification States and Outcomes

| Outcome | Meaning |
|---|---|
| `valid` | The authoritative record exists and satisfies verification rules |
| `invalid` | The record fails one or more authenticity or integrity checks |
| `not_found` | No authoritative matching record exists |
| `revoked` | The authoritative record has been formally revoked |
| `suspended` | The record is temporarily not in good standing |
| `superseded` | A newer governed record or asset version has replaced it |
| `unpublished` | The source record exists but the asset is not publicly published |
| `restricted` | The record exists but public disclosure is not permitted |
| `unavailable` | Verification could not be completed because of a temporary service failure |

Outcome labels and response behaviour shall remain governed and stable.

---

# 13. Integration Architecture

The Verification Domain integrates with:

- Credential Domain
- Credential Asset Domain
- Recognition Domain
- Programme Domain
- Verification Platform
- Student & Executive Portal
- Admin Portal
- Executive Services
- Future Employer APIs
- Future University APIs
- Future Wallet and Verifiable Credential ecosystems

Preferred interaction model:

```text
Verification Consumer

↓

Verification Platform or Governed API

↓

VerificationService

↓

Authoritative Enterprise Services

↓

Authoritative Registries

↓

Verification Outcome

↓

Governed Response
```

Direct public access to enterprise registries is prohibited.

---

# 14. Verification Platform Relationship

The Verification Domain and Verification Platform have distinct responsibilities.

## Verification Domain

Owns:

- Verification rules
- Verification outcomes
- Disclosure policy
- Verification history
- Trust decisions

## Verification Platform

Owns:

- Public verification experience
- Search and QR entry
- Result presentation
- Accessibility
- Responsive behaviour
- Public error presentation

```text
Verification Domain

↓

VerificationService

↓

Verification ViewModel

↓

Verification Platform

↓

Public User
```

The platform shall not infer verification validity independently.

---

# 15. Security Considerations

The Verification Domain inherits the Enterprise Security Architecture.

## Public Access

Public verification may be anonymous where approved.

Anonymous access shall still enforce:

- Input validation
- Output control
- Rate limiting
- Abuse protection
- Privacy protection
- Safe error handling

---

## Administrative Access

Administrative verification capabilities require:

- Authentication
- Authorization
- Capability validation
- Audit logging

---

## Registry Protection

Authoritative registries shall remain protected behind governed Enterprise Services.

---

## Privacy

Verification shall expose only information required to establish authenticity.

Sensitive learner information shall remain confidential.

---

## Anti-Abuse Controls

The architecture should support:

- Rate limiting
- Request throttling
- Invalid identifier monitoring
- Automated abuse detection
- Suspicious verification pattern analysis
- Future fraud detection

---

# 16. Runtime Architecture

```text
Verification Request

↓

Request Validation

↓

Type Resolution

↓

VerificationService

↓

CredentialService
or
CredentialAssetService
or
RecognitionService

↓

Authoritative Registry Validation

↓

Verification Rule Evaluation

↓

Disclosure Filtering

↓

Outcome Generation

↓

Audit and Analytics

↓

Verification Response
```

Runtime execution remains read-only with respect to authoritative enterprise records.

---

# 17. Error Handling

The Verification Domain shall provide governed handling for:

- Missing identifier
- Invalid identifier format
- Unsupported verification type
- Record not found
- Revoked record
- Suspended record
- Unpublished asset
- Restricted disclosure
- Authoritative service failure
- Registry unavailability
- Timeout
- Rate-limit violation
- Unexpected processing error

Error responses shall:

- Remain safe
- Avoid exposing internal implementation details
- Preserve privacy
- Include a correlation reference where appropriate
- Remain distinguishable from a valid verification result

---

# 18. Audit Requirements

The following verification events should be auditable:

- Verification request
- Verification type
- Identifier submitted
- Outcome produced
- Outcome reason
- Public disclosure decision
- Administrative verification action
- Repeated invalid attempts
- Service failure
- Security-related rejection

Audit information should preserve:

- Timestamp
- Correlation ID
- Source classification
- Outcome
- Processing service
- Actor where authenticated
- Failure reason where applicable

---

# 19. Performance and Availability

Verification is a public trust capability and should support:

- Low response latency
- High availability
- Stateless request processing where practical
- Efficient authoritative lookups
- Horizontal scalability
- Safe degradation
- Operational monitoring
- Clear temporary-unavailability responses

Caching may be introduced only where it does not create stale or misleading verification outcomes.

Revocation and lifecycle status must remain current.

---

# 20. Governance Rules

## Rule 1 — Verification Authority

The Verification Domain is the sole authority for enterprise verification behaviour and outcomes.

---

## Rule 2 — Source Authority

Credentials, assets, and recognitions remain owned by their respective Enterprise Domains.

---

## Rule 3 — Read-Only Verification

Verification shall never modify authoritative enterprise records.

---

## Rule 4 — Service-Based Access

Verification shall consume authoritative information through governed Enterprise Services.

---

## Rule 5 — Public Disclosure

Only explicitly approved enterprise information may be disclosed publicly.

---

## Rule 6 — Current State

Verification outcomes shall reflect the current authoritative lifecycle state, including revocation, suspension, replacement, and publication status.

---

## Rule 7 — No Independent Copies

The Verification Domain shall not create an independent duplicate credential, asset, or recognition registry.

---

## Rule 8 — Platform Separation

The Verification Platform renders outcomes but does not determine them.

---

## Rule 9 — Auditability

Material verification events shall remain traceable and auditable.

---

## Rule 10 — Future Verification

Future verification methods shall inherit this architecture.

---

# 21. Current Implementation Position

## Implemented

- Public Verification Platform foundation
- Credential ID architecture
- Credential lookup foundation
- Public verification URL structure
- Credential verification experience
- Verification domain principles
- Credential Registry integration foundation

## In Progress

- VerificationService formalisation
- Credential lifecycle-aware outcomes
- Credential asset verification
- Recognition verification
- QR verification enhancements
- Public disclosure refinement
- Verification audit model

## Planned

- Verification Registry
- Verification analytics
- Employer verification APIs
- University verification APIs
- Bulk verification
- Open Badges validation
- W3C Verifiable Credential validation
- International verification interoperability
- AI-assisted fraud detection

---

# 22. Future Evolution

The Verification Domain is designed to support:

- QR-based verification
- Employer verification APIs
- University and institutional APIs
- Bulk credential validation
- Open Badges verification
- W3C Verifiable Credentials
- Digital wallet validation
- International credential exchange
- Fraud analytics
- AI-assisted anomaly detection
- Privacy-preserving verification
- Cryptographic proofs
- Future blockchain anchoring where institutionally justified

Future capabilities shall extend the Verification Domain without changing its read-only trust authority.

---

# 23. Related Architecture Decisions

This domain follows Architecture Decision Records governing:

- Separation of Academic Authority and Public Trust
- Separation of Credentials and Credential Assets
- Enterprise Integration Architecture
- Registry-First Architecture
- Service-Oriented Architecture
- Public Disclosure Governance
- Enterprise Security

The ADR repository remains authoritative for decision context, alternatives, and consequences.

---

# 24. Related Documentation

- Agile AI University Enterprise Architecture & System Context
- Credential Domain Architecture
- Credential Asset Domain Architecture
- Recognition Domain Architecture
- Verification Platform Architecture
- Enterprise Integration Architecture
- Enterprise Runtime Architecture
- Enterprise Security Architecture
- Credential Governance
- Verification Governance

---

# 25. Domain Summary

The Verification Domain is the authoritative public trust domain of the Agile AI University Enterprise Platform.

It governs verification rules, validation outcomes, public disclosure, verification history, and trust analytics while consuming authoritative information from the Credential, Credential Asset, Recognition, and Programme Domains.

By separating verification behaviour from source-record ownership and public presentation, the Verification Domain preserves institutional integrity, learner privacy, current lifecycle accuracy, and independent public trust.

It provides the governed foundation for present and future verification experiences, APIs, QR validation, digital wallets, Open Badges, Verifiable Credentials, and international credential interoperability.

---

# Status

**ACTIVE**

# Architecture Status

**LOCKED**

# Domain Pattern

**Validate Enterprise Truth Without Owning It**

---

**End of Verification Domain Architecture**