# Resource ID Naming Standard

**Document ID:** REF-004  
**Title:** Resource ID Naming Standard  
**Version:** 1.0.0  
**Status:** ACTIVE  
**Owner:** Agile AI University  
**Architect:** Dileep Appupillai

---

# 1. Purpose

This document defines the official naming standards for Learning
Resource identifiers used throughout the Agile AI University platform.

It standardizes:

- Resource IDs
- Firestore document IDs
- Storage paths
- Downloaded filenames
- Internal identifiers
- Version identifiers

The objective is to ensure that resource identifiers remain stable,
unique, human-readable where appropriate, and scalable across the
platform.

---

# 2. Design Principles

Every Resource ID must be:

- Unique
- Stable
- Immutable
- Machine-friendly
- Predictable
- Globally unique within the platform

Resource IDs are permanent identifiers and must never be reused.

---

# 3. Identifier Types

The platform uses several distinct identifiers.

| Identifier | Audience | Mutable |
|------------|----------|---------|
| Resource ID | Internal & Services | No |
| Firestore Document ID | Internal | No |
| Storage Path | Internal | No |
| Learner-facing Title | Learner | Yes (Draft only) |
| Download Filename | Learner | Yes (Generated) |

---

# 4. Resource ID Format

General format:

```text
<PROGRAM>-<RESOURCE-TYPE>-<SHORT-NAME>
```

Example:

```text
AOP-LICENSED-MATERIAL
```

or

```text
AIPA-MODULE-01-NOTES
```

Rules:

- Uppercase
- Hyphen separated
- ASCII characters only
- No spaces
- No special symbols
- No timestamps
- No learner names

---

# 5. Firestore Document ID

The Firestore document ID may include version information.

Example:

```text
aop-personal-reference-guide_v1
```

Rules:

- Lowercase
- Hyphen separated
- Version suffix
- Stable
- Never reused

---

# 6. Storage Path Convention

Learning Resources:

```text
learning-resources/

PROGRAM_CODE/

RESOURCE_ID/

v1/

file.pdf
```

Example:

```text
learning-resources/

AOP/

AOP-LICENSED-MATERIAL/

v1/

licensed-course-material.pdf
```

Storage paths are immutable after publication.

---

# 7. Download Filename Standard

Learners should receive descriptive filenames.

Example:

```text
Agile Outcome Practitioner (AOP)
Licensed Course Material
AAU-8F4KQ9PL.pdf
```

Rules:

- Human readable
- Include programme
- Include document purpose
- Include Credential ID where applicable
- Never expose internal Storage paths
- Never expose Firestore document IDs

---

# 8. Version Standard

Version numbers apply to the resource, not the learner.

Examples:

```text
v1
v2
v3
```

Rules:

- Sequential
- No gaps where practical
- Never overwrite an existing version
- Published versions are immutable

---

# 9. Learner-Specific Resources

When a resource contains:

- learner name
- Credential ID
- personalized watermark
- participant-specific content

it remains an independent learning resource.

The Resource ID identifies the licensed edition.

It must not be reused for another learner.

---

# 10. Prohibited Practices

The following are prohibited:

- Reusing Resource IDs
- Changing Resource IDs after publication
- Using learner names inside Resource IDs
- Using timestamps as identifiers
- Using spaces or special characters
- Encoding Storage paths into Firestore IDs
- Exposing internal IDs to learners

---

# 11. Validation Rules

Every Resource ID must satisfy:

- Unique within the platform
- Uppercase
- Hyphen-separated
- Stable
- Immutable
- Valid programme prefix

Validation belongs in the service layer and Firestore Rules.

---

# 12. Examples

## Shared Resource

```text
AIPA-MODULE-01-NOTES
```

## Licensed Material

```text
AOP-LICENSED-MATERIAL
```

## Video Metadata

```text
AAIP-MODULE-03-VIDEO
```

## Assessment Guide

```text
AISD-ASSESSMENT-GUIDE
```

---

# 13. Related Documents

- DOCUMENTATION-INDEX.md
- Firestore Schema Reference
- Storage Layout Reference
- ADR-023 – Learning Resource Registration Strategy

---

# Revision History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 27-Jul-2026 | Initial naming standard |

---

**End of Document**