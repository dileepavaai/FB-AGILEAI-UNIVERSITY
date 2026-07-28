# ADR-023 – Learning Resource Registration Strategy

**ADR ID:** ADR-023  
**Title:** Learning Resource Registration Strategy  
**Status:** ACCEPTED  
**Version:** 1.0.0  
**Date:** 27 July 2026  
**Owner:** Agile AI University  
**Architect:** Dileep Appupillai

---

# Purpose

This Architecture Decision Record defines how learning resources are
registered, versioned, published, and assigned within the Agile AI
University Learning Resource Platform.

This ADR establishes the distinction between shared academic resources
and individualized licensed course materials, ensuring permanent learner
ownership, immutable licensing, complete auditability, and long-term
platform scalability.

---

# Background

Initially, the platform considered assigning an existing published
resource to multiple learners.

During implementation it became evident that this approach conflicts with
the university's licensing model because licensed course materials are
not identical across learners.

A learner's licensed resource may contain:

- learner-specific licensing information
- credential ID
- personalized watermark
- learner name
- batch-specific content
- trainer-specific additions
- programme-version differences
- legal ownership information

Therefore two learners attending the same programme may receive different
licensed materials.

The PDF itself becomes part of the learner's permanent academic record.

---

# Problem Statement

Reusing one published resource for multiple learners creates several
problems.

It prevents:

- individualized licensing
- learner-specific watermarking
- batch customization
- permanent ownership tracking
- complete audit history

It also introduces operational risks because replacing a published file
would silently change historical learning material for previously
licensed learners.

This is unacceptable for an academic institution.

---

# Decision

Every independently licensed learning resource shall be registered as a
separate Learning Resource.

Each resource shall have:

- its own Resource ID
- its own Firestore document
- its own Storage object
- its own publication history
- its own audit trail
- its own assignment records

The learning resource becomes the permanent academic representation of
that licensed material.

---

# Resource Categories

The platform recognizes two broad categories of learning resources.

## Shared Academic Resources

Shared resources may be assigned to many learners without modification.

Examples:

- reference guides
- templates
- public handouts
- reading material
- policy documents

These resources are academically identical.

---

## Individually Licensed Course Materials

Individually licensed resources are unique.

Examples include:

- personalized course manuals
- learner-specific reference guides
- licensed participant workbooks
- batch-customized editions
- watermarked PDFs

Every licensed edition is treated as a separate learning resource.

---

# Registration Strategy

Each personalized licensed resource is registered independently.

Example

```
Master Academic Material

↓

Ajay Pisal Edition

↓

Parag Somkuwar Edition

↓

Future Learner Editions
```

Each registration creates a completely independent resource record.

---

# Resource Identity

Every resource must have a unique Resource ID.

Example

```
AOP-LICENSED-MATERIAL-AAU-GSH3F2KL
```

or

```
AOP-LICENSED-MATERIAL-AAU-246LEMT9
```

The Resource ID represents the licensed edition, not merely the academic
content.

---

# Versioning Strategy

Version numbers describe revisions of the same licensed resource.

They do not identify different learners.

Examples

```
Ajay Pisal Resource

Version 1
↓

Version 2
↓

Version 3
```

Different learners receive different resources.

They do not share versions.

---

# Publication Strategy

Publication follows the governed lifecycle.

```
Draft

↓

Published

↓

Withdrawn
```

A protected file upload does not create an additional lifecycle state.

Uploading enriches the draft with protected storage metadata while the
resource remains in Draft status until publication.

---

# Assignment Strategy

Assignments reference published learning resources.

Assignments establish permanent learner ownership.

Assignments do not create learning resources.

Assignments do not modify learning resources.

Assignments simply establish ownership between an existing published
resource and an eligible learner.

---

# Ownership Model

Ownership is permanent.

Once assigned, the learner permanently owns that licensed version.

Future programme updates do not replace the learner's licensed material.

Newer editions require a new programme registration according to the
University's upgrade policy.

---

# Immutable Principles

The following are immutable.

- Published resources
- Protected files
- Assignment records
- Licensing history
- Audit history

Corrections are performed by creating new resources rather than modifying
existing published resources.

---

# Prohibited Operations

The following operations are prohibited.

❌ Replace a published learner PDF

❌ Reuse another learner's personalized resource

❌ Modify licensing information after publication

❌ Replace historical course material

❌ Silently change learner ownership

❌ Reassign one personalized resource to another learner

---

# Required Administrative Workflow

```
Create Draft

↓

Upload Protected File

↓

Validate Metadata

↓

Publish Resource

↓

Assign Licensed Material

↓

Learner Access
```

This workflow is mandatory.

---

# Storage Strategy

Each licensed resource stores its own protected file.

Example

```
learning-resources/

AOP/

AOP-LICENSED-MATERIAL-AAU-GSH3F2KL/

v1/

licensed-course-material.pdf
```

Storage objects are never shared between independently licensed
resources.

---

# Audit Requirements

Every resource must permanently record:

- created by
- created date
- published by
- publication date
- version
- learner association
- licensing metadata
- storage metadata

Historical records must never be deleted.

---

# Benefits

This strategy provides:

- permanent learner ownership
- individualized licensing
- complete auditability
- immutable academic records
- simplified legal governance
- scalable architecture
- future extensibility
- clear version control
- secure content delivery

---

# Consequences

This decision intentionally increases the number of learning resource
records stored in Firestore.

This is an accepted architectural trade-off.

The additional storage cost is negligible compared to the governance,
licensing, auditability, and academic integrity gained.

Scalability remains well within Firebase Firestore and Storage
capabilities.

---

# Related ADRs

- ADR-019 – Learning Resource Delivery Architecture
- ADR-020 – Governed Learning Resource Release Architecture
- ADR-021 – Licensed Course Material Ownership Strategy
- ADR-022 – Immutable Learner Assignment Strategy

---

# Implementation Status

Status: ACTIVE

This decision is implemented within the Learning Resource Management
Platform and governs all future licensed learning resource registration,
publication, and assignment workflows.

---

# Future Considerations

Future enhancements may include:

- automated learner-specific PDF generation
- dynamic watermarking
- digital signature embedding
- cryptographic licence verification
- AI-assisted resource personalization

These enhancements must comply with the principles established by this
ADR and must not violate resource immutability or permanent learner
ownership.

---

**End of ADR-023**