# Agile AI University

# Credential Asset Domain Architecture

---

# Document Information

| Attribute | Value |
|------------|-------|
| **Document** | Credential Asset Domain Architecture |
| **File** | `credential-asset-domain-architecture.md` |
| **Version** | **1.0.0** |
| **Status** | **ACTIVE** |
| **Architecture Status** | **LOCKED** |
| **Classification** | Enterprise Domain Architecture |
| **Owner** | Agile AI University |
| **Authority** | Enterprise Credential Asset Domain |
| **Parent Architecture** | Agile AI University Enterprise Architecture & System Context |
| **Last Updated** | July 2026 |

---

# Document Governance

## Status

**LOCKED**

This document defines the Enterprise Credential Asset Domain Architecture.

The Credential Asset Domain governs the creation, publication, lifecycle, storage, and consumption of digital representations of institutional credentials.

The Credential Asset Domain owns digital credential assets.

It does not own academic achievement.

---

# 1. Domain Overview

## Introduction

The Credential Asset Domain manages every digital asset representing an officially issued institutional credential.

These assets include certificates, digital badges, trainer certificates, recognition assets, and future digital credential representations.

The Credential Asset Domain exists only after a credential has been approved and finalised.

---

# 2. Purpose

The Credential Asset Domain provides governed digital publishing.

Responsibilities include:

- Certificate generation
- Trainer certificate generation
- Digital badge generation
- Recognition asset generation
- Asset publication
- Asset versioning
- Asset storage
- Asset lifecycle
- Asset Registry
- Asset availability

The Credential Asset Domain owns digital assets.

---

# 3. Enterprise Position

```text
Assessment

↓

Credential

↓

Credential Asset

↓

Student Portal

↓

Verification Platform

↓

External Sharing
```

Credential Assets extend institutional credentials into digital experiences.

---

# 4. Enterprise Authority

The Credential Asset Domain owns:

- Asset Registry
- Asset metadata
- Asset publication
- Asset versions
- Storage references
- Publication status
- Asset lifecycle
- Asset availability

The Credential Asset Domain never owns academic decisions.

---

# 5. Business Responsibilities

## Asset Generation

Supports:

- University Certificate
- Trainer Certificate
- Digital Badge
- Recognition Asset

Generation occurs exclusively through the Admin Portal.

---

## Asset Publication

Publishes generated assets.

Publication includes:

- Storage upload
- Download URL
- Registry publication
- Publication timestamp
- Administrative attribution
- Version tracking

Publication is separate from generation.

---

## Asset Storage

Stores published assets within enterprise storage.

Storage references remain independent from the Credential Registry.

---

## Asset Registry

Maintains metadata including:

- Asset ID
- Credential ID
- Asset Type
- Publication Status
- Storage Path
- Download URL
- Version
- Publication Date
- Source

The Asset Registry is the authoritative source for digital asset metadata.

---

## Asset Lifecycle

```text
Generated

↓

Validated

↓

Published

↓

Available

↓

Consumed

↓

Replaced (if required)

↓

Archived
```

Publication does not alter the Credential Registry.

---

# 6. Non-Responsibilities

The Credential Asset Domain shall not:

- Issue credentials
- Determine academic eligibility
- Approve credentials
- Conduct assessments
- Deliver learning
- Process payments
- Register learners

---

# 7. Enterprise Information

The Credential Asset Domain owns:

- Asset Registry
- Asset Metadata
- Storage References
- Publication Metadata
- Version Metadata

The Credential Registry remains the source of academic truth.

---

# 8. Enterprise Services

The Credential Asset Domain exposes:

## CredentialAssetService

Responsibilities include:

- Asset lookup
- Asset publication
- Asset metadata
- Asset lifecycle
- Asset availability
- Asset version lookup
- Asset consumption

CredentialAssetService is the authoritative implementation of digital asset behaviour.

---

# 9. Enterprise Consumers

Credential Assets are consumed by:

- Student & Executive Portal
- Verification Platform
- Recognition Domain
- LinkedIn Sharing
- Future Digital Wallets
- Future Mobile Applications

All consumers access assets through CredentialAssetService.

---

# 10. Asset Registry

The Asset Registry stores:

- Asset ID
- Credential ID
- Asset Type
- Storage Path
- Download URL
- Publication Status
- Version
- Published By
- Published At
- Source
- Audit Metadata

The Asset Registry is the authoritative record of published digital assets.

---

# 11. Business Lifecycle

```text
Credential Finalised

↓

Asset Generated

↓

Asset Published

↓

Registry Updated

↓

Student Portal Available

↓

Verification Available

↓

External Sharing

↓

Archive
```

---

# 12. Integration Architecture

The Credential Asset Domain integrates with:

- Credential Domain
- Admin Portal
- Student & Executive Portal
- Verification Platform
- Recognition Domain
- Enterprise Storage

Integration occurs through CredentialAssetService.

---

# 13. Security Considerations

Asset publication requires:

- Administrative authentication
- Administrative authorization
- Publication audit
- Storage protection
- Immutable publication history
- Secure download access

Only published assets are available for consumption.

---

# 14. Governance Rules

## Rule 1

Academic authority belongs exclusively to the Credential Domain.

---

## Rule 2

Digital assets belong exclusively to the Credential Asset Domain.

---

## Rule 3

Only approved and finalised credentials are eligible for asset generation.

---

## Rule 4

Asset generation occurs exclusively through the Admin Portal.

---

## Rule 5

Student & Executive Portal is a consumption platform.

It shall never generate official credential assets.

---

## Rule 6

The Asset Registry is the authoritative source of asset metadata.

---

## Rule 7

Generation and publication are separate lifecycle stages.

---

## Rule 8

Future digital asset types shall inherit this architecture.

---

# 15. Current Implementation Position

## Implemented

- Credential Asset architecture
- University Certificate generation
- Trainer Certificate generation
- Digital Badge generation
- Asset publication
- Asset Registry
- Student Portal asset preview
- Download support
- LinkedIn sharing foundation
- Admin Portal production pipeline

## In Progress

- Recognition assets
- Asset version management
- Publication audit improvements

## Planned

- Digital wallets
- Open Badges
- W3C Verifiable Credentials
- Blockchain anchoring
- International credential exchange

---

# 16. Future Evolution

The Credential Asset Domain is designed to support:

- Open Badges
- Digital wallets
- W3C Verifiable Credentials
- Blockchain verification
- NFT-based achievements (if adopted)
- AI-generated credential summaries
- Portable learner portfolios

Future capabilities shall extend the Credential Asset Domain while preserving the separation between academic authority and digital publishing.

---

# 17. Related Architecture Decisions

This domain follows Architecture Decision Records governing:

- Separation of Credential and Credential Assets
- Admin Portal as Asset Publishing Authority
- Student Portal as Asset Consumption Platform
- Enterprise Integration
- Enterprise Governance

The ADR repository remains authoritative.

---

# 18. Related Documentation

- Credential Domain Architecture
- Admin Portal Architecture
- Student & Executive Portal Architecture
- Verification Platform Architecture
- Enterprise Integration Architecture
- Enterprise Security Architecture

---

# 19. Domain Summary

The Credential Asset Domain is the authoritative digital publishing domain of the Agile AI University Enterprise Platform.

It governs the generation, publication, storage, lifecycle, and distribution of digital representations of institutional credentials while remaining completely independent of academic decision-making.

By separating academic authority from digital asset management, the Credential Asset Domain establishes a scalable, governed, and future-ready foundation for certificates, digital badges, verification, external sharing, and emerging credential technologies.

---

# Status

**ACTIVE**

# Architecture Status

**LOCKED**

# Domain Pattern

**Digital Publishing After Academic Authority**

---

**End of Credential Asset Domain Architecture**