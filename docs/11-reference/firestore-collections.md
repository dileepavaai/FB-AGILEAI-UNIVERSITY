# Firestore Collections Reference

**Document ID:** REF-001  
**Title:** Firestore Collections Reference  
**Version:** 1.0.0  
**Status:** ACTIVE  
**Owner:** Agile AI University  
**Architect:** Dileep Appupillai

---

# Purpose

This document is the authoritative reference for every Cloud Firestore
collection used by the Agile AI University platform.

It defines:

- collection ownership
- business purpose
- primary identifiers
- relationships
- lifecycle
- governance
- security expectations
- architectural responsibilities

This document serves as the enterprise data dictionary for the platform.

---

# Scope

This document covers all platform domains including:

- Identity
- Authentication
- Credentials
- Learning Resources
- Assignments
- Registration
- Payments
- Entitlements
- Administration
- Audit

---

# Design Principles

Every Firestore collection follows the following principles.

✓ Single Responsibility

✓ Clearly defined ownership

✓ Stable document identifiers

✓ Immutable historical records

✓ Business logic outside UI

✓ Security enforced through Firestore Rules

✓ Storage governed through Storage Rules

✓ Enterprise scalability

---

# Collection Classification

Collections are grouped into functional domains.

| Domain | Purpose |
|---------|----------|
| Identity | Learner identity and activation |
| Credentials | Academic records and credential assets |
| Learning Resources | Licensed learning material |
| Registration | Programme registrations |
| Payments | Financial transactions |
| Entitlement | Platform access |
| Administration | Operational management |
| Audit | Historical tracking |

---

# Collection Catalogue

| Collection | Owner Service | Primary Identifier | Status |
|------------|---------------|-------------------|--------|
| credentials | Credential Service | credential_id | Active |
| credential_assets | Credential Service | credential_id + asset_type | Active |
| learning_resources | Learning Resource Service | resource_id | Active |
| learner_resource_assignments | Assignment Service | assignment_id | Active |
| learner_resource_access | Access Service | access_id | Planned |
| credential_activation_tokens | Identity Service | token | Active |
| identity_reconciliation_events | Identity Service | event_id | Active |
| registrations | Registration Service | registration_id | Planned |
| payments | Payment Service | payment_id | Planned |
| invoices | Finance Service | invoice_id | Planned |
| receipts | Finance Service | receipt_id | Planned |
| entitlement_records | Entitlement Service | entitlement_id | Planned |

---

# Collection Standards

Every collection shall define:

- Purpose
- Owner
- Primary Identifier
- Document Lifecycle
- Mutable Fields
- Immutable Fields
- Security Model
- Related Collections

---

# Global Naming Standards

Collection names:

- lowercase
- plural
- underscore separated

Examples

credentials

credential_assets

learning_resources

learner_resource_assignments

identity_reconciliation_events

---

Document IDs shall be:

- stable
- unique
- immutable
- never reused

---

# Identity Domain

Identity collections establish the permanent digital identity of every
learner.

These collections become the foundation for all future platform services.

---

## credentials

### Purpose

Master academic credential registry.

This collection represents the authoritative academic record issued by
Agile AI University.

---

### Owner

Credential Service

---

### Primary Identifier

credential_id

Example

AAU-8F4KQ9PL

---

### Lifecycle

Pending

↓

Approved

↓

Finalized

↓

Published

---

### Immutable Fields

credential_id

programme_code

issue_history

issued_certificate

issued_badge

---

### Mutable Fields

learner_uid (before first activation)

contact information

administrative notes

approval workflow

---

### Related Collections

credential_assets

learning_resources

learner_resource_assignments

identity_reconciliation_events

---

## credential_assets

### Purpose

Stores every official digital asset generated from a credential.

Examples

University Certificate

Digital Badge

Trainer Certificate

Future Academic Assets

---

### Owner

Credential Service

---

### Primary Identifier

credential_id + asset_type

---

### Lifecycle

Generated

↓

Published

↓

Archived

---

### Immutable

Published assets

Asset URLs

Publication history

---

# Identity Activation

## credential_activation_tokens

Purpose

Secure first-time learner activation.

---

Responsible Service

Identity Service

---

Token Characteristics

Single use

Time limited

Secure

Revocable

---

Lifecycle

Created

↓

Sent

↓

Used

↓

Expired

---

## identity_reconciliation_events

Purpose

Permanent audit history for identity reconciliation.

Tracks every first-login identity binding.

---

Owner

Identity Service

---

Immutable

Every event.

Historical events are never modified.

---

# Learning Resource Domain

Learning Resources are licensed academic materials.

They are governed independently of credentials.

---

## learning_resources

Purpose

Stores every governed learning resource.

Each learner-specific licensed course material is registered as an
independent learning resource.

---

Owner

Learning Resource Service

---

Primary Identifier

resource_id

Example

AOP-LICENSED-MATERIAL-AAU-GSH3F2KL

---

Lifecycle

Draft

↓

Published

↓

Withdrawn

---

No additional lifecycle exists.

Protected file upload enriches a Draft.

It does not change the resource status.

---

Immutable

Published resource

Publication history

Protected storage reference

---

Mutable

Draft metadata

Description

Tags

Administrative notes

---

Relationships

learner_resource_assignments

Storage

Programme

Credential

---

## learner_resource_assignments

Purpose

Creates permanent ownership between a learner and a published learning
resource.

Assignments never create learning resources.

Assignments never modify learning resources.

Assignments establish ownership only.

---

Owner

Assignment Service

---

Primary Identifier

assignment_id

---

Lifecycle

Created

↓

Active

↓

Revoked (exceptional administrative process only)

---

Immutable

Learner

Assigned resource

Assignment timestamp

---

Relationships

learning_resources

credentials

learner_uid

---

## learner_resource_access

Purpose

Stores resolved learner access records.

Supports entitlement resolution and future delivery optimization.

---

Status

Planned

---

# Registration Domain

## registrations

Purpose

Programme registration records.

Tracks learner enrolment.

---

Owner

Registration Service

---

Primary Identifier

registration_id

---

Relationships

payments

credentials

entitlements

---

# Payment Domain

## payments

Purpose

Financial transaction records.

---

Owner

Payment Service

---

Relationships

registrations

receipts

invoices

---

## invoices

Purpose

Official invoices.

---

## receipts

Purpose

Payment acknowledgements.

---

# Entitlement Domain

## entitlement_records

Purpose

Determines learner access across the platform.

Examples

Learning Resources

Executive Insight

Credential Downloads

Bridge Programmes

Future AI Services

---

Owner

Entitlement Service

---

# Collection Relationships

```
credentials
      │
      ▼
credential_assets

      │
      ▼
learning_resources

      │
      ▼
learner_resource_assignments

      │
      ▼
learner_uid

      │
      ▼
Student Portal
```

---

# Ownership Matrix

| Collection | Owner |
|------------|-------|
| credentials | Credential Service |
| credential_assets | Credential Service |
| learning_resources | Learning Resource Service |
| learner_resource_assignments | Assignment Service |
| learner_resource_access | Access Service |
| credential_activation_tokens | Identity Service |
| identity_reconciliation_events | Identity Service |
| registrations | Registration Service |
| payments | Payment Service |
| invoices | Finance Service |
| receipts | Finance Service |
| entitlement_records | Entitlement Service |

---

# Governance Rules

The following rules are permanently enforced.

✓ Collection ownership is exclusive.

✓ Document identifiers never change.

✓ Resource IDs never change.

✓ Credential IDs never change.

✓ Published learning resources are immutable.

✓ Assignment records are immutable.

✓ Identity reconciliation is permanently auditable.

✓ Firestore Rules enforce security.

✓ Storage Rules protect licensed content.

✓ Business logic belongs in services.

✓ UI never enforces business rules.

---

# Architecture Principles

The platform follows this execution order.

```
Identity

↓

Authorization

↓

Entitlement

↓

Resource Resolution

↓

Business Services

↓

UI Rendering
```

No UI component may bypass this sequence.

---

# Future Expansion

The data model supports future platform capabilities including:

- Enterprise learning
- Subscription programmes
- AI-assisted learning
- Continuing education
- Trainer ecosystem
- Academic transcripts
- Digital wallets
- Credential portability
- Advanced analytics
- Learning recommendations

No architectural changes are required to support these future
capabilities.

---

# Related Documents

- DOCUMENTATION-INDEX.md
- ADR-019 – Learning Resource Delivery Architecture
- ADR-020 – Governed Learning Resource Release Architecture
- ADR-023 – Learning Resource Registration Strategy
- Storage Layout Reference
- Firestore Security Rules
- Storage Security Rules

---

# Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 27-Jul-2026 | Initial enterprise Firestore collection reference |

---

**End of Document**

