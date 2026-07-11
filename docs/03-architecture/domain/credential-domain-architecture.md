# Agile AI University

# Credential Domain Architecture

---

# Document Information

| Attribute | Value |
|------------|-------|
| **Document** | Credential Domain Architecture |
| **File** | `credential-domain-architecture.md` |
| **Version** | **2.0.0** |
| **Status** | **ACTIVE** |
| **Architecture Status** | **LOCKED** |
| **Classification** | Enterprise Domain Architecture |
| **Owner** | Agile AI University |
| **Authority** | Enterprise Credential Domain |
| **Parent Architecture** | Agile AI University Enterprise Architecture & System Context |
| **Last Updated** | July 2026 |

---

# Document Governance

## Status

**LOCKED**

This document defines the Enterprise Credential Domain Architecture.

The Credential Domain governs academic credential issuance, credential lifecycle management, institutional academic recognition, credential approval, credential governance, and the Credential Registry.

The Credential Domain owns academic achievement.

The Credential Domain does not own certificates, digital badges, credential assets, or public verification.

---

# 1. Domain Overview

## Introduction

The Credential Domain is the authoritative academic recognition domain of the Agile AI University Enterprise Platform.

It represents the successful completion of institutional academic requirements and records the University's official academic decision to award a credential.

The Credential Domain is the institutional source of truth for all credentials.

Every downstream capability derives from the Credential Domain.

---

# 2. Purpose

The Credential Domain exists to provide governed institutional recognition.

Responsibilities include:

- Credential issuance
- Credential approval
- Credential lifecycle
- Credential Registry
- Credential metadata
- Credential governance
- Credential identifiers
- Academic recognition
- Credential history

The Credential Domain owns academic credentials.

---

# 3. Enterprise Position

```text
Programme

↓

Registration

↓

Payment

↓

Learning

↓

Assessment

↓

Credential

↓

Credential Assets

↓

Recognition

↓

Verification
```

Credential issuance follows successful academic evaluation.

---

# 4. Enterprise Authority

The Credential Domain owns:

- Credential Registry
- Credential IDs
- Credential lifecycle
- Credential status
- Credential metadata
- Credential approval
- Credential issue approval
- Academic recognition records

---

# 5. Business Responsibilities

## Credential Issuance

Issues official institutional credentials after successful academic completion.

Each credential represents an academic achievement recognised by Agile AI University.

---

## Credential Approval

Credentials progress through governed approval states before becoming final.

Typical states include:

- Draft
- Pending Review
- Approved
- Finalised
- Revoked
- Archived

Academic governance controls every transition.

---

## Credential Identity

Every credential receives a permanent institutional identifier.

Example:

```
AAU-KO9JK02Z
```

Credential identifiers are immutable.

---

## Credential Metadata

The Credential Domain governs metadata including:

- Credential ID
- Learner
- Programme
- Programme Code
- Credential Type
- Approval Status
- Issued Status
- Academic Completion
- Award Date
- Governance Metadata

Metadata describes the credential.

It does not describe generated assets.

---

## Credential Lifecycle

```text
Assessment Passed

↓

Credential Created

↓

Academic Review

↓

Approved

↓

Finalised

↓

Asset Eligible

↓

Recognition Eligible

↓

Verification Eligible

↓

Archive
```

Only finalised credentials become eligible for downstream domains.

---

# 6. Non-Responsibilities

The Credential Domain shall not:

- Generate certificates
- Generate digital badges
- Publish assets
- Manage storage
- Produce PDFs
- Produce images
- Verify credentials publicly
- Deliver learner experiences

---

# 7. Enterprise Information

The Credential Domain owns:

- Credential Registry
- Credential Records
- Credential Metadata
- Credential Lifecycle
- Credential Status
- Credential Governance

The Credential Registry represents institutional academic truth.

---

# 8. Enterprise Services

The Credential Domain exposes:

## CredentialService

Responsibilities include:

- Credential lookup
- Credential creation
- Credential approval
- Credential lifecycle
- Credential metadata
- Credential search
- Credential eligibility
- Credential history

CredentialService is the authoritative implementation of credential behaviour.

---

# 9. Enterprise Consumers

Credential information is consumed by:

- Student & Executive Portal
- Admin Portal
- Credential Asset Domain
- Recognition Domain
- Verification Domain
- Executive Services

Every consumer shall use CredentialService.

---

# 10. Credential Registry

The Credential Registry stores:

- Credential ID
- Learner ID
- Programme Code
- Credential Type
- Credential Status
- Approval Status
- Issued Status
- Award Date
- Governance Metadata
- Audit Metadata

The Credential Registry is the authoritative institutional record.

---

# 11. Business Lifecycle

```text
Assessment Success

↓

Credential Created

↓

Review

↓

Approval

↓

Finalisation

↓

Asset Generation Eligible

↓

Recognition Eligible

↓

Verification Eligible

↓

Archive
```

---

# 12. Integration Architecture

The Credential Domain integrates with:

- Assessment Domain
- Credential Asset Domain
- Recognition Domain
- Verification Domain
- Student & Executive Portal
- Admin Portal
- Executive Services

Integration occurs through CredentialService.

---

# 13. Security Considerations

Credential operations require:

- Authentication
- Administrative authorization
- Academic approval workflow
- Audit logging
- Immutable identifiers
- Governance validation

Credential records represent institutional academic authority.

---

# 14. Governance Rules

## Rule 1

The Credential Domain is the authoritative source for institutional credentials.

---

## Rule 2

Credential IDs are permanent and immutable.

---

## Rule 3

Only approved and finalised credentials are eligible for downstream processing.

---

## Rule 4

Credential Assets belong exclusively to the Credential Asset Domain.

---

## Rule 5

Recognition consumes Credential information.

---

## Rule 6

Verification consumes Credential information.

---

## Rule 7

The Credential Registry remains the institutional source of truth.

---

## Rule 8

Future credential models shall inherit this architecture.

---

# 15. Current Implementation Position

## Implemented

- Credential Registry
- Credential IDs
- Credential lifecycle
- Credential metadata
- CredentialService
- Student Portal integration
- Admin Portal integration
- Credential governance

## In Progress

- Registry optimisation
- Administrative workflows
- Credential analytics

## Planned

- Credential versioning
- Academic transcript support
- Lifelong learning records
- Skills mapping
- Credential portability

---

# 16. Future Evolution

The Credential Domain is designed to support:

- Stackable credentials
- Skills credentials
- Digital transcripts
- Learning passports
- W3C Verifiable Credentials
- Blockchain anchoring
- International credential interoperability
- Lifelong achievement records

Future capabilities shall extend the Credential Domain while preserving institutional academic authority.

---

# 17. Related Architecture Decisions

This domain follows Architecture Decision Records governing:

- Credential as Academic Authority
- Separation of Credential and Credential Assets
- Assessment Before Credential
- Enterprise Governance

The ADR repository remains authoritative.

---

# 18. Related Documentation

- Assessment Domain Architecture
- Credential Asset Domain Architecture
- Recognition Domain Architecture
- Verification Domain Architecture
- Enterprise Integration Architecture
- Enterprise Security Architecture

---

# 19. Domain Summary

The Credential Domain is the authoritative academic recognition domain of the Agile AI University Enterprise Platform.

It governs credential issuance, approval, lifecycle management, and the Credential Registry while remaining independent of certificate generation, digital badge production, asset publication, and public verification.

By separating academic authority from digital asset production and public trust, the Credential Domain establishes a scalable, governed, and future-ready foundation for institutional recognition across the Agile AI University ecosystem.

---

# Status

**ACTIVE**

# Architecture Status

**LOCKED**

# Domain Pattern

**Academic Authority First**

---

**End of Credential Domain Architecture**