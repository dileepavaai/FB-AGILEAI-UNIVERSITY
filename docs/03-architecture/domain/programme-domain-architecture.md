# Agile AI University

# Programme Domain Architecture

---

# Document Information

| Attribute | Value |
|------------|-------|
| **Document** | Programme Domain Architecture |
| **File** | `programme-domain-architecture.md` |
| **Version** | **1.0.0** |
| **Status** | **ACTIVE** |
| **Architecture Status** | **LOCKED** |
| **Classification** | Enterprise Domain Architecture |
| **Owner** | Agile AI University |
| **Authority** | Enterprise Programme Domain |
| **Parent Architecture** | Agile AI University Enterprise Architecture & System Context |
| **Last Updated** | July 2026 |

---

# Document Governance

## Status

**LOCKED**

This document defines the Enterprise Programme Domain Architecture for the Agile AI University Enterprise Platform.

The Programme Domain defines the academic offerings of the University and acts as the authoritative source for programme definitions, programme hierarchy, programme lifecycle, eligibility metadata, academic pricing references, learning pathways, and prerequisite relationships.

Every Enterprise Platform and Enterprise Domain shall consume Programme information from this domain.

---

# 1. Domain Overview

## Introduction

The Programme Domain represents the master academic domain of the Agile AI University Enterprise Platform.

It governs the complete lifecycle of academic programmes and defines the structure from which registration, payment, learning, assessment, credentialing, recognition, and executive analytics derive their business context.

The Programme Domain is the institutional authority for programme definitions.

No other Enterprise Domain may redefine programme information.

---

# 2. Purpose

The Programme Domain exists to provide a governed academic catalogue for the University.

Its responsibilities include:

- Programme definitions
- Programme hierarchy
- Programme lifecycle
- Programme metadata
- Programme versions
- Academic prerequisites
- Learning pathways
- Pricing references
- Eligibility metadata
- Programme governance

The Programme Domain defines academic offerings.

It does not deliver learning or issue credentials.

---

# 3. Enterprise Position

```
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

↓

Executive Services
```

Every downstream business domain consumes Programme information.

---

# 4. Enterprise Authority

The Programme Domain owns:

- Programme Definitions
- Programme Codes
- Programme Metadata
- Programme Hierarchy
- Programme Lifecycle
- Programme Versions
- Learning Pathways
- Academic Prerequisites
- Fee References
- Eligibility Metadata

Programme information represents institutional academic truth.

---

# 5. Business Responsibilities

## Programme Definition

Defines every academic programme offered by the University.

Each programme includes:

- Programme Code
- Programme Name
- Programme Category
- Programme Description
- Academic Level
- Learning Outcomes
- Programme Status

---

## Programme Hierarchy

Maintains relationships between programmes.

Examples include:

- Foundation Programmes
- Professional Programmes
- Master Programmes
- Leadership Programmes
- Future Specialist Programmes

Programme hierarchy enables governed academic progression.

---

## Programme Lifecycle

The Programme Domain manages programme states.

Typical lifecycle:

```
Draft

↓

Review

↓

Approved

↓

Published

↓

Active

↓

Retired

↓

Archived
```

Programme history shall remain auditable.

---

## Academic Prerequisites

Defines prerequisite relationships.

Examples:

- AIPA required before AAIP
- AAIP required before AIAL

Prerequisites are governed academic rules.

---

## Learning Pathways

Defines recommended learner progression.

Examples:

```
Foundations

↓

Professional

↓

Master

↓

Leadership
```

Alternative pathways may exist where approved by academic governance.

---

## Pricing References

The Programme Domain defines:

- Standard fee reference
- Promotional fee reference
- GST applicability
- Currency

The Programme Domain does **not** process payments.

Payment execution belongs to the Payment Domain.

---

## Eligibility Metadata

Defines metadata supporting:

- Upgrade eligibility
- Registration validation
- Learning requirements
- Assessment requirements
- Credential requirements

Eligibility decisions consume this metadata.

---

# 6. Non-Responsibilities

The Programme Domain shall not:

- Register learners
- Process payments
- Deliver learning
- Conduct assessments
- Issue credentials
- Generate certificates
- Generate badges
- Verify credentials
- Present learner experiences

---

# 7. Enterprise Information

The Programme Domain owns:

- Programme Catalogue
- Programme Registry
- Programme Hierarchy
- Programme Versions
- Programme Metadata
- Academic Prerequisites
- Pricing References
- Eligibility Metadata

These records represent institutional academic information.

---

# 8. Enterprise Services

The Programme Domain exposes:

## ProgramService

Responsibilities include:

- Programme lookup
- Programme catalogue
- Programme metadata
- Hierarchy lookup
- Prerequisite lookup
- Pricing reference lookup
- Eligibility metadata
- Programme lifecycle

ProgramService is the authoritative implementation of Programme behaviour.

---

# 9. Enterprise Consumers

Programme information is consumed by:

- Public Website
- Student & Executive Portal
- Admin Portal
- Registration Domain
- Payment Domain
- Learning Domain
- Assessment Domain
- Credential Domain
- Executive Services

Every consumer shall use ProgramService.

---

# 10. Programme Registry

The Programme Registry stores:

- Programme Code
- Programme Name
- Programme Status
- Programme Category
- Programme Version
- Academic Metadata
- Learning Metadata
- Pricing Metadata
- Governance Metadata

The Programme Registry represents institutional academic truth.

---

# 11. Business Lifecycle

```
Programme Created

↓

Academic Review

↓

Approval

↓

Publication

↓

Registration Available

↓

Learning Available

↓

Assessment Available

↓

Credential Available

↓

Retirement

↓

Archive
```

---

# 12. Integration Architecture

The Programme Domain integrates with:

- Registration Domain
- Payment Domain
- Learning Domain
- Assessment Domain
- Credential Domain
- Executive Services

Integration occurs exclusively through ProgramService.

---

# 13. Security Considerations

Programme administration requires:

- Authentication
- Administrative authorization
- Audit logging
- Version control
- Governance approval

Published programme information may be publicly accessible.

---

# 14. Governance Rules

## Rule 1

The Programme Domain is the authoritative source for programme information.

---

## Rule 2

Programme definitions shall not be duplicated.

---

## Rule 3

Programme pricing references belong to the Programme Domain.

Financial processing belongs to the Payment Domain.

---

## Rule 4

Academic prerequisites belong exclusively to the Programme Domain.

---

## Rule 5

Programme lifecycle changes shall remain auditable.

---

## Rule 6

Every Enterprise Domain shall consume Programme information through ProgramService.

---

## Rule 7

Future academic programmes shall inherit this architecture.

---

# 15. Current Implementation Position

## Implemented

- ProgramService
- Programme hierarchy
- Programme recommendations
- Eligibility metadata
- Upgrade metadata
- Student Portal integration
- Admin Portal foundation

## In Progress

- Programme Registry refinement
- Programme versioning
- Administrative programme management

## Planned

- Academic catalogue management
- Programme comparison
- Curriculum mapping
- Corporate programme catalogues

---

# 16. Future Evolution

The Programme Domain is designed to support:

- Stackable Programmes
- Micro Programmes
- Corporate Learning Pathways
- International Qualifications
- Skills Frameworks
- AI-generated Learning Pathways
- Academic Portfolio Analytics
- Programme Accreditation

Future capabilities shall extend the Programme Domain while preserving enterprise governance.

---

# 17. Related Architecture Decisions

The Programme Domain follows Architecture Decision Records governing:

- Programme as Enterprise Master Domain
- Registration Architecture
- Payment Architecture
- Enterprise Integration
- Enterprise Governance

The ADR repository remains authoritative for architectural rationale.

---

# 18. Related Documentation

- Enterprise Architecture & System Context
- Registration Domain Architecture
- Payment Domain Architecture
- Learning Domain Architecture
- Assessment Domain Architecture
- Credential Domain Architecture
- Executive Services Domain Architecture

---

# 19. Domain Summary

The Programme Domain is the master academic domain of the Agile AI University Enterprise Platform.

It governs programme definitions, hierarchy, lifecycle, prerequisites, pricing references, and academic metadata while providing the authoritative business context for every downstream Enterprise Domain.

By separating programme governance from registration, payment, learning, assessment, and credentialing, the Programme Domain establishes a scalable academic foundation capable of supporting future institutional growth, international expansion, and lifelong learning.

---

# Status

**ACTIVE**

# Architecture Status

**LOCKED**

# Domain Pattern

**Programme First**

---

**End of Programme Domain Architecture**