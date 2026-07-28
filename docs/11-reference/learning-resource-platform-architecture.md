# Learning Resource Platform Architecture

**Document ID:** ARCH-003  
**Title:** Learning Resource Platform Architecture  
**Version:** 1.0.0  
**Status:** ACTIVE  
**Owner:** Agile AI University  
**Architect:** Dileep Appupillai

---

# 1. Purpose

This document defines the enterprise architecture of the Agile AI
University Learning Resource Platform.

The Learning Resource Platform provides a governed, secure and scalable
system for publishing, managing and delivering licensed learning
resources throughout the learner lifecycle.

The platform supports:

- Shared learning resources
- Learner-specific licensed materials
- Progressive course delivery
- Secure document distribution
- Future subscription-based learning
- Enterprise programme delivery

---

# 2. Objectives

The Learning Resource Platform provides:

- Secure learning resource management
- Governed publication workflow
- Protected storage
- Learner-specific licensed materials
- Progressive resource release
- Version management
- Enterprise auditability
- Long-term scalability

---

# 3. Scope

The platform governs:

- Learning Resource Registry
- Learning Resource Publication
- Protected File Storage
- Learning Resource Delivery
- Learning Resource Versioning
- Learner Resource Access
- Resource Release Governance

The platform does not govern:

- Authentication
- Credential Publication
- Payments
- Programme Scheduling

Those capabilities integrate through platform services.

---

# 4. Architectural Principles

The platform follows these principles.

✓ Identity First

✓ Entitlement Before Delivery

✓ Publication Before Consumption

✓ Immutable Published Resources

✓ Protected Storage

✓ Service Layer Controlled

✓ Zero Business Logic in UI

✓ Complete Audit Trail

---

# 5. Platform Position

```text
Identity Platform

↓

Authorization

↓

Entitlement Platform

↓

Learning Resource Platform

↓

Student Portal

↓

Learner
```

Every resource request must follow this sequence.

---

# 6. Platform Components

The Learning Resource Platform consists of:

- Learning Resource Registry
- Publication Service
- Version Manager
- Resource Resolver
- Secure Delivery Service
- Download Service
- Preview Service
- Audit Service

Each component owns a single responsibility.

---

# 7. High-Level Architecture

```text
                Admin Portal
                     │
                     ▼
        Learning Resource Service
                     │
                     ▼
          Publication & Validation
                     │
                     ▼
      Firestore Learning Resource Registry
                     │
                     ▼
         Firebase Storage (Protected)
                     │
                     ▼
      Resource Resolver & Entitlement Service
                     │
                     ▼
              Student Portal
                     │
                     ▼
                  Learner
```

---

# 8. Learning Resource Lifecycle

Every learning resource follows the governed lifecycle.

```text
Create Draft

↓

Upload Protected File

↓

Validate

↓

Publish

↓

Release

↓

Learner Access

↓

Withdraw (Exceptional)
```

Only three lifecycle states exist.

```text
draft

↓

published

↓

withdrawn
```

---

# 9. Learning Resource Types

The platform supports:

- Licensed Course Material
- Module Notes
- Reference Guide
- Workbook
- Handbook
- Assignment Guide
- Supporting Documents
- External Video Metadata

Future resource types may be added through governed platform updates.

---

# 10. Shared Learning Resources

Shared resources are academically identical for multiple learners.

Examples:

- Reading material
- Templates
- Reference documents
- Policies
- Module notes

A single published resource may be delivered to many eligible learners.

---

# 11. Learner-Specific Licensed Resources

Learner-specific licensed resources are independent learning resources.

Examples include:

- Personalized Course Manual
- Credential ID Watermark
- Learner Name
- Participant-specific Notes

Each licensed edition:

- has its own Resource ID
- has its own Firestore document
- has its own Storage object
- has its own publication history
- has its own audit trail

One learner's licensed material is never reused for another learner.

---

# 12. Publication Architecture

Publication follows the workflow below.

```text
Create Draft

↓

Complete Metadata

↓

Upload Protected File

↓

Validation

↓

Publish

↓

Release
```

Publication occurs only through governed platform services.

---

# 13. Resource Release Architecture

Publication and release are separate concepts.

Publication makes a resource eligible for delivery.

Release determines when an entitled learner may access the resource.

Release strategies include:

- Immediate
- Scheduled
- Cohort-based
- Module milestone
- Learner-specific

Business rules determine the release strategy.

---

# 14. Resource Resolution

Every learner request follows:

```text
Authentication

↓

Authorization

↓

Identity Resolution

↓

Entitlement Resolution

↓

Learning Resource Resolver

↓

Secure Delivery
```

The resolver determines:

- learner eligibility
- programme
- publication status
- release status
- version
- storage location

The UI never resolves learning resources.

---

# 15. Delivery Architecture

Resources are delivered through secured platform services.

Learners never access Firebase Storage directly.

Delivery supports:

- Preview
- Download
- Future streaming
- Future offline access

All delivery is entitlement driven.

---

# 16. Storage Architecture

Protected resources reside within governed Firebase Storage.

Typical hierarchy:

```text
learning-resources/

PROGRAM_CODE/

RESOURCE_ID/

VERSION/

resource-file.pdf
```

Published files remain immutable.

---

# 17. Version Management

Learning resources support governed versioning.

```text
v1

↓

v2

↓

v3
```

Version rules:

- New version creates a new publication.
- Published versions are never overwritten.
- Only one version may be marked as the latest published version.
- Previous versions remain available for audit.

---

# 18. Security Architecture

Security includes:

- Firebase Authentication
- Firestore Security Rules
- Firebase Storage Rules
- Service-layer validation
- Entitlement resolution
- Audit logging

The client is never trusted for authorization decisions.

---

# 19. Integration Points

The Learning Resource Platform integrates with:

- Identity Platform
- Authorization & Entitlement Platform
- Credential Platform
- Student Portal
- Admin Portal
- Payment Platform
- Executive Insight Platform

All integrations occur through governed services.

---

# 20. Administrative Workflow

Administrators perform:

- Create Draft
- Edit Draft
- Upload Protected File
- Validate
- Publish
- Withdraw
- Review Audit History

Administrators cannot bypass publication validation.

---

# 21. Learner Workflow

Learners experience:

```text
Login

↓

Dashboard

↓

Learning Resources

↓

Preview

↓

Download
```

Learners never interact directly with Storage or Firestore.

---

# 22. Audit Architecture

Every significant event records:

- Resource ID
- Programme
- Version
- Administrator
- Learner UID (where applicable)
- Timestamp
- Action

Audit history is immutable.

---

# 23. Scalability

The architecture supports:

- Millions of learners
- Thousands of programmes
- Millions of published resources
- Enterprise customers
- Subscription delivery
- Regional expansion
- Additional storage providers (future)

Scalability must preserve governance and security.

---

# 24. Governance Rules

The following rules are permanently enforced.

✓ Only published resources are delivered.

✓ Published resources are immutable.

✓ Uploading a file does not change lifecycle state.

✓ Learner-specific resources are independent resources.

✓ Publication and release are separate operations.

✓ Business rules belong in the service layer.

✓ Firestore Rules protect metadata.

✓ Storage Rules protect content.

✓ UI never performs entitlement decisions.

---

# 25. Future Enhancements

The architecture supports future capabilities including:

- AI-assisted content recommendations
- Adaptive learning paths
- Subscription-based resource libraries
- Multi-language resource delivery
- Video streaming platform integration
- Enterprise content catalogues
- Digital rights management (DRM)
- Offline resource synchronization

Future enhancements must preserve the governed publication and entitlement model.

---

# 26. Related Documents

- Identity Platform Architecture
- Credential Platform Architecture
- Learning Resource Lifecycle
- Admin Learning Resource Runbook
- Firestore Collections Reference
- Firestore Schema Reference
- Storage Layout Reference
- Resource ID Naming Standard
- ADR-019 – Learning Resource Delivery Architecture
- ADR-020 – Governed Learning Resource Release Architecture
- ADR-023 – Learning Resource Registration Strategy

---

# 27. Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 27-Jul-2026 | Initial Learning Resource Platform Architecture |

---

# 28. Document Control

This document defines the authoritative architecture for the Agile AI
University Learning Resource Platform.

Changes to publication workflows, delivery mechanisms, entitlement
resolution, storage architecture, lifecycle management, or governance
require:

1. Architecture approval
2. Service-layer implementation updates
3. Documentation updates
4. Production validation

All platform changes must preserve academic integrity, learner-specific
licensing, secure delivery, and long-term scalability.

---

**End of Document**