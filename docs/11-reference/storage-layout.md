# Storage Layout Reference

**Document ID:** REF-002  
**Title:** Storage Layout Reference  
**Version:** 1.0.0  
**Status:** ACTIVE  
**Owner:** Agile AI University  
**Architect:** Dileep Appupillai

---

# Purpose

This document defines the official Cloud Storage architecture for the
Agile AI University platform.

It establishes:

- Storage hierarchy
- Folder conventions
- File naming standards
- Versioning strategy
- Protected content governance
- Security expectations
- Scalability guidelines

This document is the authoritative reference for all Cloud Storage
design decisions.

---

# Scope

This document applies to every file stored within the Agile AI
University ecosystem, including:

- Licensed learning resources
- Credential assets
- Certificates
- Digital badges
- Trainer certificates
- Supporting documents
- Administrative uploads

---

# Design Principles

The storage architecture follows these principles.

✓ Predictable

✓ Scalable

✓ Secure

✓ Immutable

✓ Human readable

✓ Machine friendly

✓ Version controlled

✓ Enterprise ready

---

# Storage Domains

The platform separates storage into logical domains.

```
learning-resources/

credential-assets/

trainer-assets/

system-assets/

temporary/

exports/
```

Each domain has a dedicated purpose.

---

# Learning Resources

Purpose

Stores protected licensed learning resources.

Root

```
learning-resources/
```

Example

```
learning-resources/

AOP/

AOP-LICENSED-MATERIAL-AAU-GSH3F2KL/

v1/

licensed-course-material.pdf
```

---

# Folder Hierarchy

```
learning-resources/

PROGRAM_CODE/

RESOURCE_ID/

VERSION/

FILE
```

Example

```
learning-resources/

AIPA/

AIPA-LICENSED-MATERIAL-AAU-72HJDK91/

v2/

course-material.pdf
```

---

# Programme Folder

Each programme receives its own root.

Examples

```
AOP/

AIPA/

AAIA/

AAIP/

AIAL/

AISD/
```

Future programmes follow the same convention.

---

# Resource Folder

Every independently licensed learning resource receives its own folder.

Example

```
AOP-LICENSED-MATERIAL-AAU-GSH3F2KL/
```

Resource folders are never shared.

---

# Version Folder

Every published revision receives a version folder.

Examples

```
v1/

v2/

v3/
```

Older versions remain available for audit purposes.

---

# File Naming Standards

Downloaded filenames must be human readable.

Examples

```
Agile Outcome Practitioner
Licensed Course Material
Ajay Pisal
Version 1.pdf
```

Internal filenames may be simplified where appropriate, but cryptic
Storage paths must never be exposed to learners.

---

# Credential Assets

Purpose

Stores generated academic assets.

Root

```
credential-assets/
```

Example

```
credential-assets/

AAU-8F4KQ9PL/

certificate.pdf

badge.png

trainer-certificate.pdf
```

---

# Trainer Assets

Purpose

Stores trainer-specific assets.

Root

```
trainer-assets/
```

---

# System Assets

Purpose

Stores reusable platform assets.

Examples

- logos
- icons
- templates
- branding
- default images

Root

```
system-assets/
```

---

# Temporary Storage

Purpose

Stores short-lived files generated during processing.

Examples

- PDF generation
- image conversion
- temporary exports

Root

```
temporary/
```

Temporary objects must be deleted automatically after processing.

---

# Export Storage

Purpose

Stores generated administrative exports.

Examples

- CSV reports
- Excel exports
- audit reports

Root

```
exports/
```

---

# Versioning Strategy

Every published revision receives its own version directory.

Example

```
learning-resources/

AOP/

AOP-LICENSED-MATERIAL-AAU-GSH3F2KL/

v1/

licensed-course-material.pdf

↓

v2/

licensed-course-material.pdf
```

Existing versions are never overwritten.

---

# Immutable Principles

The following are immutable.

- Published files
- Storage paths
- Version folders
- Resource identifiers

Corrections are performed by creating new versions.

---

# Maximum File Size

Maximum upload size

```
50 MiB
```

This limit is permanently enforced.

Large video content must not be stored within the protected learning
resource storage domain.

---

# Video Delivery

Large video content shall be delivered through the governed external
video architecture.

Cloud Storage shall contain only protected downloadable assets.

---

# Security Model

Storage access is governed by Firebase Storage Security Rules.

Principles

✓ Authentication required

✓ Public access prohibited

✓ Administrative uploads only

✓ Learner read access through entitlement

✓ Direct deletion prohibited

---

# Administrative Workflow

```
Create Draft

↓

Upload Protected File

↓

Validate

↓

Publish

↓

Assign

↓

Learner Access
```

No file may bypass this workflow.

---

# Storage Governance

Every stored file must have:

- owning resource
- owning programme
- version
- publication state
- audit history

Orphaned files are not permitted.

---

# Scalability

The storage architecture supports:

- millions of files
- unlimited programme growth
- unlimited learner growth
- future academic products
- enterprise customers
- regional expansion

No structural redesign is expected.

---

# Related Documents

- DOCUMENTATION-INDEX.md
- Firestore Collections Reference
- ADR-019 – Learning Resource Delivery Architecture
- ADR-020 – Governed Learning Resource Release Architecture
- ADR-023 – Learning Resource Registration Strategy
- Firebase Storage Security Rules

---

# Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 27-Jul-2026 | Initial Storage Layout Reference |

---

**End of Document**