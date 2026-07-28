# Learning Resource Lifecycle

**Document ID:** REF-005  
**Title:** Learning Resource Lifecycle  
**Version:** 1.0.0  
**Status:** ACTIVE  
**Owner:** Agile AI University  
**Architect:** Dileep Appupillai  
**Last Updated:** 27 July 2026

---

# 1. Purpose

This document defines the official lifecycle of learning resources within
the Agile AI University Learning Resource Platform.

It establishes:

- lifecycle states
- allowed transitions
- prohibited transitions
- publication workflow
- assignment workflow
- learner delivery workflow
- audit requirements
- governance rules

This document is the authoritative reference for every learning
resource managed by the platform.

---

# 2. Scope

This document applies to all learning resources including:

- licensed course materials
- participant-specific resources
- shared reference materials
- handbooks
- templates
- supporting documents
- external video references
- future digital learning assets

---

# 3. Lifecycle Principles

Every learning resource follows these principles.

✓ Identity First

✓ Governance First

✓ Draft Before Publication

✓ Publication Before Delivery

✓ Immutable After Publication

✓ Permanent Audit History

✓ Service-Layer Controlled

✓ Secure Storage

---

# 4. Lifecycle Overview

Every learning resource follows the lifecycle below.

```text
Create Draft
      │
      ▼
Upload Protected File
      │
      ▼
Validate Metadata
      │
      ▼
Publish
      │
      ▼
Assignment / Release
      │
      ▼
Learner Access
      │
      ▼
Withdraw (Exceptional)
```

---

# 5. Lifecycle States

The platform supports only three official lifecycle states.

```text
draft

↓

published

↓

withdrawn
```

No additional lifecycle states are permitted.

---

# 6. Draft State

## Purpose

The draft state is used while preparing a learning resource.

The resource is not visible to learners.

---

## Characteristics

- editable
- unpublished
- internal only
- protected
- incomplete

---

## Allowed Operations

✓ Edit metadata

✓ Upload protected file

✓ Replace uploaded file

✓ Delete draft

✓ Validate metadata

---

## Prohibited Operations

✗ Learner download

✗ Assignment

✗ Public visibility

---

## Required Values

```text
status = draft

is_active = false

is_latest = false
```

---

# 7. Protected File Upload

Uploading a protected file does **not** create a new lifecycle state.

It enriches the existing draft.

Example:

Before Upload

```text
Draft
```

After Upload

```text
Draft
```

Only additional metadata is recorded.

---

## Upload Metadata

Typical fields updated:

- storage_path
- file_name
- content_type
- file_size_bytes
- uploaded_at
- uploaded_by_uid
- uploaded_by_email

---

## Validation

Every upload must validate:

- file size
- file type
- storage path
- duplicate detection
- programme association

---

# 8. Metadata Validation

Before publication every draft must pass validation.

Validation includes:

✓ Required fields

✓ Programme

✓ Version

✓ Resource ID

✓ Storage path

✓ Upload metadata

✓ Governance rules

✓ Publication readiness

---

## Validation Failure

Publication must be rejected if validation fails.

No partial publication is permitted.

---

# 9. Published State

## Purpose

Represents an officially published learning resource.

Publication authorizes the resource for learner delivery.

---

## Characteristics

- immutable
- governed
- auditable
- secure
- learner eligible

---

## Required Values

```text
status = published

is_active = true

is_latest = true
```

---

## Publication Audit

Publication records:

- published_at
- published_by_uid
- published_by_email

These fields become immutable.

---

## Allowed Operations

✓ Read

✓ Assign

✓ Download

✓ Learner delivery

✓ Audit

---

## Prohibited Operations

✗ Replace protected file

✗ Edit metadata

✗ Change Resource ID

✗ Change Programme

✗ Change Version

---

# 10. Assignment and Release

Publication alone does not automatically provide learner access.

The resource must be released through the governed delivery mechanism.

Release may be:

- immediate
- scheduled
- programme milestone
- learner-specific
- cohort-specific

The service layer determines eligibility.

---

# 11. Learner Access

Learners never access resources directly.

Every request follows:

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

↓

Download / Preview
```

The UI never bypasses this sequence.

---

# 12. Withdrawn State

## Purpose

Withdrawn resources remain part of the academic record but are no longer
available for new delivery.

---

## Required Values

```text
status = withdrawn

is_active = false

is_latest = false
```

---

## Characteristics

- historical
- auditable
- immutable

---

## Allowed Operations

✓ Audit

✓ Historical reporting

---

## Prohibited Operations

✗ Republishing the same record

✗ Replacing content

✗ Deleting history

---

# 13. Learner-Specific Resources

Participant-specific licensed materials are treated as independent
learning resources.

Examples include:

- personalized PDFs
- Credential ID watermark
- learner name
- batch customization
- trainer annotations

Every licensed edition is published independently.

---

# 14. Shared Resources

Shared resources may be assigned to many learners.

Examples:

- reference guides
- reading material
- templates
- policies

These resources are academically identical.

---

# 15. Publication Workflow

```text
Create Draft

↓

Complete Metadata

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
```

Every publication follows this workflow.

---

# 16. Administrative Workflow

Administrator responsibilities include:

- create resource
- edit draft
- upload protected file
- validate
- publish
- withdraw when necessary

Administrators cannot bypass validation.

---

# 17. Learner Workflow

The learner experience follows:

```text
Login

↓

Authentication

↓

Identity Resolution

↓

Entitlement Resolution

↓

Dashboard

↓

Learning Resources

↓

Preview

↓

Download
```

Learners never interact directly with Storage.

---

# 18. State Transition Matrix

| Current State | Allowed Transition |
|---------------|-------------------|
| Draft | Draft |
| Draft | Published |
| Published | Withdrawn |

No other transitions are permitted.

---

# 19. Prohibited Transitions

The following transitions are prohibited.

```text
Published

↓

Draft
```

```text
Withdrawn

↓

Draft
```

```text
Withdrawn

↓

Published
```

Historical integrity must be preserved.

---

# 20. Version Management

A new version creates a new governed publication.

Existing published versions remain unchanged.

Version progression:

```text
v1

↓

v2

↓

v3
```

Versions are never overwritten.

---

# 21. Storage Lifecycle

Storage follows the learning resource lifecycle.

Draft

↓

Protected Upload

↓

Published

↓

Historical Retention

Protected files are never replaced after publication.

---

# 22. Audit Requirements

Every lifecycle event records:

- timestamp
- administrator
- action
- resource
- version

Audit history is permanent.

---

# 23. Error Handling

The platform must safely handle:

- upload failure
- validation failure
- duplicate Resource ID
- duplicate version
- storage failure
- publication failure
- assignment failure
- authorization failure

Failures never produce partially published resources.

---

# 24. Recovery Strategy

If publication fails:

- retain draft
- retain uploaded file
- record failure
- allow administrator correction

No learner impact is permitted.

---

# 25. Security Principles

Every operation requires:

Authentication

↓

Authorization

↓

Validation

↓

Firestore Rules

↓

Storage Rules

↓

Persistence

The UI is never trusted.

---

# 26. Governance Rules

The following rules are permanently enforced.

✓ Drafts are editable.

✓ Published resources are immutable.

✓ Withdrawn resources remain auditable.

✓ Uploading a file does not change lifecycle state.

✓ Learners never access Storage directly.

✓ Business rules belong in services.

✓ Firestore Rules enforce data integrity.

✓ Storage Rules protect licensed content.

✓ Audit history is permanent.

---

# 27. Architecture Alignment

The lifecycle supports:

- Identity Platform
- Credential Platform
- Learning Resource Platform
- Student Portal
- Admin Portal
- Revenue Platform
- Payment Platform

No platform may bypass this lifecycle.

---

# 28. Future Enhancements

The lifecycle supports future capabilities including:

- automated publication
- scheduled release
- AI-assisted validation
- digital signatures
- watermark verification
- enterprise distribution
- subscription delivery
- multilingual resources

These enhancements must preserve lifecycle integrity.

---

# 29. Related Documents

- DOCUMENTATION-INDEX.md
- Firestore Collections Reference
- Firestore Schema Reference
- Storage Layout Reference
- Resource ID Naming Standard
- ADR-019 – Learning Resource Delivery Architecture
- ADR-020 – Governed Learning Resource Release Architecture
- ADR-023 – Learning Resource Registration Strategy

---

# 30. Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 27-Jul-2026 | Initial Learning Resource Lifecycle specification |

---

# 31. Document Control

This document is authoritative for the lifecycle management of all
learning resources.

Changes to lifecycle states, transitions, publication rules, or
governance require:

1. An approved Architecture Decision Record (ADR)
2. Updates to service-layer implementation
3. Updates to Firestore Security Rules (if applicable)
4. Updates to Firebase Storage Security Rules (if applicable)
5. Updates to this document and related operational runbooks

No implementation may introduce additional lifecycle states or bypass
the governed lifecycle defined in this document.

---

**End of Document**