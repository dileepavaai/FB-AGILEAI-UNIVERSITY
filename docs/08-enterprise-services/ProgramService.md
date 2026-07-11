# Agile AI University

# Enterprise Service Specification

# ProgramService

> **The authoritative Enterprise Service responsible for programme definitions, hierarchy, progression, eligibility metadata, and programme lifecycle management.**

---

# Document Information

| Attribute | Value |
|------------|-------|
| **Service** | ProgramService |
| **Owning Domain** | Programme Domain |
| **Version** | **1.0.0** |
| **Status** | **ACTIVE** |
| **Classification** | Enterprise Service Specification |
| **Owner** | Agile AI University |
| **Last Updated** | July 2026 |

---

# Purpose

ProgramService is the authoritative Enterprise Service responsible for exposing programme information throughout the Agile AI University ecosystem.

It provides governed access to programme definitions, progression, eligibility metadata, pricing references, and programme hierarchy while preserving the Programme Domain as the single business authority.

---

# Enterprise Position

```text
Enterprise Platform

↓

ProgramService

↓

Programme Domain

↓

Programme Registry
```

ProgramService is the only supported interface between Enterprise Platforms and Programme information.

---

# Domain Ownership

ProgramService belongs exclusively to the Programme Domain.

The Programme Domain owns:

- Programme definitions
- Programme hierarchy
- Programme prerequisites
- Programme progression
- Programme metadata
- Programme lifecycle
- Programme status
- Programme pricing references
- Programme governance

No other service shall redefine Programme information.

---

# Responsibilities

ProgramService is responsible for:

- Exposing programme catalogue
- Resolving programme hierarchy
- Returning programme metadata
- Resolving prerequisite relationships
- Resolving upgrade paths
- Returning programme availability
- Returning programme status
- Returning pricing references
- Returning display information
- Supporting Enterprise Platforms

---

# Non-Responsibilities

ProgramService shall not:

- Register learners
- Process payments
- Deliver learning
- Conduct assessments
- Issue credentials
- Publish credential assets
- Verify credentials
- Generate executive analytics

Those responsibilities belong to other Enterprise Services.

---

# Primary Consumers

ProgramService is consumed by:

- Public Website
- Student & Executive Portal
- Admin Portal
- Assessment Platform
- Verification Platform
- Executive Services

Future platforms shall also consume ProgramService.

---

# Enterprise Registry

ProgramService uses:

```text
Programme Registry
```

The Programme Registry is the institutional source of truth.

Platforms shall never access the registry directly.

---

# Primary Operations

The service provides operations such as:

## Catalogue

- Get Programme Catalogue
- Get Active Programmes
- Get Featured Programmes

---

## Programme Lookup

- Get Programme
- Get Programme by Code
- Get Programme Metadata

---

## Progression

- Get Next Programme
- Get Previous Programme
- Get Upgrade Path
- Resolve Programme Hierarchy

---

## Eligibility

- Resolve Prerequisites
- Resolve Upgrade Eligibility
- Validate Programme Availability

---

## Metadata

- Get Duration
- Get Fees
- Get Learning Hours
- Get Credential Information

---

# Inputs

Typical inputs include:

- Programme Code
- Programme Identifier
- Learner Identifier
- Membership Type
- Current Credentials
- Entitlement Context

Inputs shall be validated before processing.

---

# Outputs

Typical outputs include:

- Programme Details
- Programme Status
- Programme Hierarchy
- Upgrade Recommendation
- Eligibility Result
- Pricing Reference
- Display Metadata

Presentation platforms consume these outputs directly.

---

# Dependencies

ProgramService depends on:

- Programme Registry
- Governance Rules
- Enterprise Configuration

ProgramService should avoid unnecessary dependencies on other Enterprise Services.

---

# Security

ProgramService inherits the Enterprise Security Architecture.

Security includes:

- Authentication where required
- Authorization for protected operations
- Input validation
- Output validation
- Audit logging
- Registry protection

Public catalogue operations may allow anonymous access.

Administrative operations require authorization.

---

# Error Model

Common service outcomes include:

- Programme Not Found
- Programme Inactive
- Invalid Programme Code
- Prerequisite Not Satisfied
- Upgrade Not Available
- Unauthorized Operation
- Validation Failure

Errors shall use governed enterprise response models.

---

# Audit Requirements

Material operations should record:

- Requestor
- Operation
- Programme
- Timestamp
- Outcome
- Source Platform

Audit supports governance and operational analysis.

---

# Versioning

ProgramService shall evolve through governed versioning.

Breaking changes require:

- Architecture review
- Updated documentation
- Consumer impact assessment
- ADR where appropriate

---

# Current Implementation

Current implementation supports:

- Programme lookup
- Programme hierarchy
- Upgrade recommendations
- Eligibility resolution
- Portal integration
- Dashboard rendering
- Credential display support

Future implementation will expand administrative capabilities.

---

# Future Evolution

Planned enhancements include:

- Multi-language catalogue
- Corporate programme catalogues
- Regional programme availability
- Dynamic pricing references
- AI-powered programme recommendations
- Programme comparison services

---

# Related Services

- RegistrationService
- PaymentService
- LearningService
- AssessmentService
- CredentialService

---

# Related Documentation

- Programme Domain Architecture
- Enterprise Service Catalogue
- Enterprise Architecture
- Runtime Architecture
- Integration Architecture
- Security Architecture

---

# Summary

ProgramService is the authoritative Enterprise Service responsible for exposing governed programme information throughout the Agile AI University ecosystem.

It provides a stable contract between Enterprise Platforms and the Programme Domain while preserving the Programme Registry as the institutional source of truth.

---

**Status:** ACTIVE

**Version:** 1.0.0

---

*"Programmes define the academic journey. ProgramService makes that journey consistently available across every platform."*