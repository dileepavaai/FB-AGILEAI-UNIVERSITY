# Agile AI University

# Learning Resource Platform Architecture

---

**Document Version:** 1.0.0

**Status:** ACTIVE

**Architecture Status:** LOCKED

**Classification:** Enterprise Architecture

**Domain:** Learning Resource Platform

**Platform:** Agile AI University

**Owner:** Enterprise Architecture

**Architecture Authority:** Agile AI University Enterprise Architecture

**Last Updated:** July 2026

---

# Purpose

This document defines the authoritative architecture for the Learning Resource Platform used throughout the Agile AI University ecosystem.

It establishes the enterprise standards governing how learning resources are created, stored, secured, published, delivered, consumed, versioned and governed.

This document is the single architectural authority for all learning resource capabilities.

No implementation may contradict the architectural decisions documented here without an approved Architecture Decision Record (ADR).

---

# Scope

This architecture governs all learning resources delivered by Agile AI University including, but not limited to:

- Licensed Course Materials
- Programme Handbooks
- Student Workbooks
- Supporting Handouts
- Templates
- Worksheets
- Reference Guides
- Reading Materials
- Checklists
- Presentation PDFs
- Assessment Resources
- Executive Learning Resources
- External Videos
- Learning Links
- Future Interactive Learning Assets

The platform is designed to support both reusable enterprise resources and learner-specific licensed resources.

---

# Audience

This document is intended for:

- Enterprise Architects
- Solution Architects
- Platform Engineers
- Backend Engineers
- Frontend Engineers
- Firebase Engineers
- AI Engineers
- Product Owners
- Administrators
- Governance Teams
- Technical Auditors

---

# Related Documents

## System Context

- Enterprise System Context
- Portal System Context
- Credential System Context
- Assessment System Context
- Recognition System Context

## Architecture

- Portal Architecture
- Platform Architecture
- Runtime Architecture
- Security Architecture

## Governance

- Portal Governance
- Credential Governance
- Verification Governance
- Enterprise Governance

## Enterprise Services

- LearningService
- CredentialService
- ProgramService
- RegistrationService
- VerificationService

## Architecture Decisions

- ADR-015 Identity Authority
- ADR-017 Credential Claim
- ADR-018 Activation Token Strategy
- ADR-019 Learning Resource Delivery Architecture

---

# Executive Summary

The Learning Resource Platform is the authoritative enterprise platform responsible for governing every learning asset delivered to learners throughout their journey with Agile AI University.

Unlike traditional Learning Management Systems that treat documents as downloadable files, Agile AI University treats learning resources as governed enterprise assets.

Every learning resource is managed through a controlled lifecycle consisting of creation, validation, publication, entitlement resolution and governed delivery.

The platform supports both:

- Shared enterprise learning resources
- Learner-specific licensed learning resources

The platform also supports multiple delivery mechanisms including:

- Protected downloadable documents
- Embedded external video
- External references
- Future interactive learning experiences

Learning resources are considered digital assets belonging to the learner experience and are therefore governed with the same level of architectural rigor applied to credentials, assessments and identity.

---

# Vision

The Learning Resource Platform exists to provide every learner with a governed digital learning library that evolves throughout their learning journey.

Every learner should have access to a single trusted location containing all authorised learning resources relevant to their programmes, credentials and executive learning experiences.

The platform is designed around the following principles:

```
Learning

↓

Programme Registration

↓

Identity

↓

Entitlement Resolution

↓

Learning Resource Resolution

↓

Secure Delivery

↓

Learning Experience

↓

Credential Achievement

↓

Continuous Professional Development
```

Learning resources are therefore an integral part of the learner lifecycle rather than isolated downloadable files.

---

# Enterprise Vision

The long-term vision is to establish the Learning Resource Platform as the authoritative enterprise repository for every governed educational asset produced by Agile AI University.

The platform will ultimately support:

- lifelong learner libraries
- programme-specific resource collections
- personalised licensed course materials
- continuous resource delivery
- executive learning libraries
- AI-assisted recommendations
- intelligent content progression
- learning analytics
- capability-based resource recommendations
- future digital ownership experiences

The Learning Resource Platform is therefore positioned as a strategic enterprise platform alongside:

- Identity Platform
- Credential Platform
- Assessment Platform
- Verification Platform
- Registration Platform
- Payment Platform

---

# Enterprise Principles

The Learning Resource Platform follows the enterprise principles adopted throughout Agile AI University.

## Governance Before Convenience

Every learning resource must follow an approved governance lifecycle before becoming visible to learners.

No resource bypasses publication governance.

---

## Identity Before Delivery

No learning resource shall be delivered before learner identity has been established.

Authentication is mandatory.

---

## Entitlement Before Access

Learners receive only resources they are entitled to access.

The user interface never decides entitlement.

---

## Resolver Before Rendering

Business decisions are resolved before any user interface rendering begins.

The frontend consumes resolved ViewModels only.

---

## Admin Authority

The Admin Portal is the sole authoritative publisher of learning resources.

The Student Portal never publishes, modifies or deletes learning resources.

---

## Immutable Learning Assets

Published learning assets are immutable.

Corrections produce new governed versions rather than modifying existing published assets.

---

## Enterprise Auditability

Every publication event must be traceable.

Enterprise auditing applies throughout the lifecycle.

---

## Security By Default

Every learning resource is protected unless explicitly governed otherwise.

Access is denied by default.

---

## Architecture Before Implementation

Implementation follows architecture.

Architecture never follows implementation.

---

## Scalability By Design

Every architectural decision must support future enterprise growth.

Solutions optimised solely for today's requirements are discouraged.

---

# Learning Resource Philosophy

Agile AI University does not consider learning resources to be ordinary downloadable files.

Instead, every resource represents one of the university's educational assets.

Educational assets possess:

- academic value
- intellectual property
- licensing requirements
- governance requirements
- publication lifecycle
- ownership history
- audit history
- learner relevance

Accordingly, every learning resource is governed as an enterprise asset.

---

# Architecture Goals

The Learning Resource Platform has been designed to achieve the following strategic objectives.

## Goal 1

Provide a single enterprise platform responsible for managing every learning resource throughout its lifecycle.

---

## Goal 2

Separate enterprise governance from presentation concerns.

Business decisions remain independent of user interface implementation.

---

## Goal 3

Support multiple learning resource types without architectural changes.

Examples include:

- PDF
- Office documents
- Images
- External video
- External references
- Interactive learning
- Future AI learning experiences

---

## Goal 4

Support both:

- shared enterprise resources

and

- learner-specific licensed resources

using a common architectural model.

---

## Goal 5

Support continuous learning resource publication throughout programme delivery.

Resources should become available without requiring application deployments.

---

## Goal 6

Enable secure delivery through identity-aware entitlement resolution.

Learners receive only authorised resources.

---

## Goal 7

Protect university intellectual property through governed publication and controlled delivery.

---

## Goal 8

Provide enterprise scalability capable of supporting:

- thousands of learners
- thousands of resources
- multiple programmes
- multiple cohorts
- personalised resource generation
- future enterprise expansion

---

## Goal 9

Maintain complete separation between:

- master educational assets
- learner deliveries
- presentation
- storage
- governance

---

## Goal 10

Provide an architecture capable of supporting future automation including:

- AI-assisted publication
- automatic personalised PDF generation
- scheduled resource release
- intelligent learner recommendations
- learning analytics
- adaptive learning pathways
- executive insight integration

---

# End of Part 1

The next section begins with:

**Part 2 – Domain Model through Learning Resource Delivery Architecture**

# Domain Model

## Overview

The Learning Resource Platform is built around a domain-driven architecture that separates educational content from delivery, learner identity, storage and presentation.

The platform distinguishes between:

- Educational Resources
- Master Educational Assets
- Learner Deliveries
- External Learning Resources
- Learning Resource Resolution
- Learning Resource Consumption

Each domain has a clearly defined responsibility.

---

# Domain Architecture

```
                        Learning Resource Platform

                                     │

        ┌────────────────────────────┼────────────────────────────┐

        │                            │                            │

Resource Catalog              Master Assets              Delivery Engine

        │                            │                            │

        └────────────────────────────┼────────────────────────────┘

                                     │

                          Learning Resource Resolver

                                     │

                           Entitlement Resolution

                                     │

                             Student Portal

                                     │

                             Learning Experience
```

Every component has a single responsibility.

---

# Core Domain Objects

The Learning Resource Platform consists of six primary enterprise domain objects.

## 1. Learning Resource

Represents the logical educational resource.

Examples

- AOP Course Materials
- AI Prompt Guide
- Systems Thinking Workbook
- Module 5 Video
- Assessment Preparation Guide

A Learning Resource is independent of:

- learner
- storage
- file
- publication
- delivery

It represents educational intent.

---

## 2. Master Resource

Represents the authoritative source owned by Agile AI University.

Examples

- PowerPoint source
- Word source
- InDesign source
- Illustrator source
- Original PDF

Master Resources are never delivered directly to learners.

Only administrators interact with master resources.

---

## 3. Learning Resource Delivery

Represents a governed delivery of a learning resource.

Examples

Shared PDF

↓

Published

↓

100 learners receive it

or

Master PPT

↓

Generate personalised PDFs

↓

100 learner-specific deliveries

Every learner delivery is independently governed.

---

## 4. Learning Resource Resolver

Responsible for determining which resources are visible.

Responsibilities include:

- entitlement validation
- programme validation
- learner validation
- publication validation
- lifecycle validation
- resource filtering
- version resolution

The resolver never renders user interface.

---

## 5. Learning Resource Consumer

The Student Portal consumes resolved learning resources.

The consumer:

- displays
- previews
- downloads
- embeds

The consumer never performs business decisions.

---

## 6. External Learning Resource

Represents educational resources hosted outside Agile AI University.

Examples

- YouTube
- Vimeo
- Official Documentation
- Research Papers
- External Articles

Only approved providers are supported.

---

# Resource Classification

The platform supports multiple resource categories.

## Licensed Course Materials

Characteristics

- learner-specific
- personalised
- downloadable
- watermark required
- protected storage

Typical examples

- AOP Course Pack
- Licensed Workbook

---

## Supporting Learning Materials

Characteristics

- reusable
- downloadable
- shared
- protected storage

Examples

- Handouts
- Worksheets
- Reading Material
- Templates

---

## External Videos

Characteristics

- embedded
- streamed
- not downloadable by the platform
- externally hosted

Examples

- YouTube
- Vimeo

---

## External References

Characteristics

- hyperlinks
- external websites
- official documentation
- research publications

---

## Interactive Resources (Future)

Examples

- AI Tutor
- Interactive Labs
- Simulations
- Learning Exercises
- Capability Assessments

---

# Resource Delivery Types

Every learning resource declares its delivery strategy.

## Protected Storage

Used for

- PDFs
- Office Documents
- Images
- Licensed Course Materials

Characteristics

- preview
- download
- entitlement protected

---

## External Video

Used for

- YouTube
- Vimeo

Characteristics

- embedded playback
- governed URL
- platform controlled visibility

---

## External Link

Used for

- websites
- documentation
- articles

Characteristics

- browser navigation
- no binary storage

---

## Future Interactive Delivery

Examples

- AI Experiences
- Adaptive Learning
- Interactive Content

---

# Personalisation Model

The platform supports two fundamentally different resource models.

## Shared Resources

One governed resource

↓

Many learners

Examples

- Reference Guide
- Supporting Handout
- Reading Material

Uploaded once.

Delivered many times.

---

## Learner-Specific Resources

One governed master

↓

Personalisation

↓

One learner

Examples

- Licensed Course Materials
- Personal Workbook
- Personal Coaching Report
- Individual Assessment Feedback

Every learner receives a unique governed asset.

---

# Master Resource Architecture

Master resources represent the university's intellectual property.

Examples

```
Master PPT

↓

Master PDF

↓

Original Artwork

↓

Source Images
```

Characteristics

- Admin only
- never learner visible
- immutable after publication
- version controlled
- enterprise governed

Master resources remain inside the protected administrative environment.

---

# Personalised Learning Asset Architecture

The platform supports enterprise personalisation.

Typical workflow

```
Master PowerPoint

↓

Learner

↓

Credential ID

↓

Licence ID

↓

Watermark

↓

Generate PDF

↓

Protected Upload

↓

Governed Publication
```

Each generated PDF becomes an independent enterprise asset.

The generated asset:

- belongs to one learner
- contains one licence identifier
- references one master resource
- references one source version

---

# Learning Resource Delivery Architecture

Learning resources are delivered through governed delivery records rather than exposing storage directly.

```
Learning Resource

↓

Published

↓

Delivery Created

↓

Learner Identity

↓

Entitlement

↓

Resolver

↓

Portal

↓

Preview / Download / Watch
```

The delivery record becomes the authoritative relationship between:

- learner
- learning resource
- version
- publication
- delivery

---

# Delivery Model

The Learning Resource Platform supports two delivery models.

## Shared Delivery

```
Learning Resource

↓

Published

↓

Programme Assignment

↓

Many Learners
```

Typical examples

- Reading Material
- Reference Guides
- Handouts

---

## Personalised Delivery

```
Master Resource

↓

Generate

↓

Learner Specific PDF

↓

Publish

↓

One Learner
```

Typical examples

- Licensed Course Materials
- Individual Workbook
- Personal Coaching Reports

---

# Delivery Lifecycle

Every delivery follows the governed lifecycle.

```
Draft

↓

Upload

↓

Validation

↓

Publication

↓

Resolver

↓

Learner Access

↓

Preview

↓

Download

↓

Audit
```

No delivery bypasses publication.

---

# Continuous Learning Resource Delivery

The platform supports continuous publication throughout programme delivery.

```
Programme Running

↓

Administrator Creates New Resource

↓

Publish

↓

Resolver Refresh

↓

Learners Receive New Material
```

No application deployment is required.

Resources become available through governed publication.

---

# Enterprise Separation of Concerns

The architecture intentionally separates responsibilities.

| Component | Responsibility |
|------------|----------------|
| Learning Resource | Educational definition |
| Master Resource | Intellectual property |
| Delivery | Learner-specific distribution |
| Storage | Binary persistence |
| Resolver | Business decisions |
| Student Portal | Presentation |
| Admin Portal | Publication |

This separation enables future scalability while preserving governance.

---

# Locked Architectural Decisions

The following architectural decisions are locked.

## Decision 1

Learning Resources represent educational intent.

They do not represent learner deliveries.

---

## Decision 2

Master educational assets remain Admin-only.

Learners never access master resources.

---

## Decision 3

Learner-specific licensed course materials are generated independently for every learner.

Even if the educational content is identical, each personalised PDF is treated as a unique enterprise asset.

---

## Decision 4

Shared learning resources are uploaded once and reused through governed delivery.

---

## Decision 5

Every learning resource reaches learners only through the Learning Resource Resolver.

No direct Storage access is permitted.

---

## Decision 6

The Student Portal is a consumer only.

It never publishes, modifies or governs learning resources.

---

## Decision 7

Preview, download and embedded playback are controlled by the delivery policy associated with each resource.

---

## Decision 8

The Learning Resource Platform is recognised as a first-class enterprise platform within Agile AI University alongside the Identity, Credential, Assessment, Verification and Payment platforms.

---

# End of Part 2

The next section begins with:

**Part 3 – Firestore Architecture through Resource Resolver Architecture**

# Firestore Architecture

## Overview

Cloud Firestore is the authoritative registry for Learning Resource Platform metadata, lifecycle state, ownership relationships and delivery governance.

Firestore stores:

- resource definitions;
- publication state;
- version metadata;
- delivery relationships;
- learner ownership;
- licence references;
- external-resource metadata;
- audit information.

Firestore does not store learning-resource binary content.

Binary files remain in protected Cloud Storage.

---

# Firestore Architectural Principles

The Firestore architecture follows these principles:

```text
Registry before delivery

Metadata before presentation

Ownership before access

Published state before visibility

Explicit relationships before inference
```

Firestore is treated as the authoritative source of truth for determining what a learning resource represents, who may access it and how it may be delivered.

---

# Authoritative Collections

The initial architecture uses two principal collections:

```text
learning_resources
learning_resource_deliveries
```

These collections have separate responsibilities.

---

# `learning_resources`

## Purpose

The `learning_resources` collection represents the governed Learning Resource Catalog.

Each document describes one version of a logical learning resource.

Examples:

- AOP Core Course Materials;
- AOP Systems Thinking Workbook;
- AOP Prompt Engineering Reference Guide;
- AOP Ethics Session Video;
- AOP Supporting Handout.

The collection describes the resource itself, not the learner-specific delivery.

---

## Recommended document identity

A canonical Firestore document ID should combine the stable Resource ID and version:

```text
{resource_id}_v{version}
```

Example:

```text
AOP-CORE-COURSE-MATERIALS_v1
AOP-M03-SYSTEMS-THINKING-WORKBOOK_v2
AOP-M05-ETHICS-SESSION-VIDEO_v1
```

The logical Resource ID remains stable across versions.

The Firestore document ID identifies a specific immutable version.

---

## Example protected-file resource

```javascript
{
    resource_id: "AOP-M03-SYSTEMS-THINKING-WORKBOOK",
    resource_document_id:
        "AOP-M03-SYSTEMS-THINKING-WORKBOOK_v1",

    program_code: "AOP",

    title: "AOP — Systems Thinking Workbook",
    description:
        "Supporting workbook for the Systems Thinking module.",

    content_type:
        "supporting_workbook",

    content_type_label:
        "Supporting Workbook",

    module_code:
        "M03",

    module_label:
        "Module 3",

    topic_label:
        "Systems Thinking",

    release_label:
        "Release 1",

    delivery_type:
        "protected_storage",

    personalisation_type:
        "shared",

    version: 1,

    file_name:
        "AOP-M03-Systems-Thinking-Workbook-v1.pdf",

    file_extension:
        "pdf",

    mime_type:
        "application/pdf",

    file_size:
        8421376,

    storage_path:
        "learning-resources/AOP/AOP-M03-SYSTEMS-THINKING-WORKBOOK/v1/AOP-M03-Systems-Thinking-Workbook-v1.pdf",

    preview_allowed:
        true,

    download_allowed:
        true,

    embed_allowed:
        false,

    status:
        "published",

    is_active:
        true,

    is_latest:
        true,

    source:
        "admin_portal",

    created_by_uid:
        "ADMIN_UID",

    created_by_email:
        "admin@agileai.university",

    created_at:
        timestamp,

    published_by_uid:
        "ADMIN_UID",

    published_at:
        timestamp,

    updated_at:
        timestamp
}
```

---

## Example external-video resource

```javascript
{
    resource_id:
        "AOP-M05-ETHICS-SESSION-VIDEO",

    resource_document_id:
        "AOP-M05-ETHICS-SESSION-VIDEO_v1",

    program_code:
        "AOP",

    title:
        "AOP — Agile AI Ethics Session",

    description:
        "Supporting video for the Agile AI Ethics module.",

    content_type:
        "external_video",

    content_type_label:
        "Video",

    module_code:
        "M05",

    module_label:
        "Module 5",

    topic_label:
        "Agile AI Ethics",

    release_label:
        "Session Recording",

    delivery_type:
        "external_video",

    personalisation_type:
        "shared",

    version:
        1,

    external_provider:
        "youtube",

    external_url:
        "https://www.youtube.com/watch?v=VIDEO_ID",

    external_video_id:
        "VIDEO_ID",

    preview_allowed:
        true,

    download_allowed:
        false,

    embed_allowed:
        true,

    status:
        "published",

    is_active:
        true,

    is_latest:
        true,

    source:
        "admin_portal",

    created_by_uid:
        "ADMIN_UID",

    created_at:
        timestamp,

    published_at:
        timestamp
}
```

---

# `learning_resource_deliveries`

## Purpose

The `learning_resource_deliveries` collection represents the governed relationship between a learner and a resource made available to that learner.

A delivery record answers:

- Which learner received the resource?
- Which resource version was delivered?
- Is the resource shared or personalized?
- Which Credential ID or licence reference applies?
- Which protected file belongs to the learner?
- Is preview permitted?
- Is download permitted?
- When was the delivery published?
- Is the delivery currently active?

For personalized licensed resources, the delivery record also represents ownership of the uniquely generated learner PDF.

---

## Delivery document identity

Delivery IDs must be unique, stable and non-meaningful from a security perspective.

Recommended format:

```text
AAU-MAT-{RANDOM_UPPERCASE_ALPHANUMERIC}
```

Example:

```text
AAU-MAT-K7P4X9Q2
```

The delivery ID must not be derived solely from:

- learner email;
- learner name;
- Credential ID;
- predictable sequence.

The Firestore document ID may use the delivery ID directly.

---

## Example personalized delivery

```javascript
{
    delivery_id:
        "AAU-MAT-K7P4X9Q2",

    learner_uid:
        "LEARNER_UID",

    learner_email:
        "learner@example.com",

    credential_id:
        "AAU-AB12CD34",

    licence_id:
        "AAU-AB12CD34",

    program_code:
        "AOP",

    cohort_id:
        "AOP-2026-MARCH",

    resource_id:
        "AOP-CORE-COURSE-MATERIALS",

    resource_document_id:
        "AOP-CORE-COURSE-MATERIALS_v3",

    resource_version:
        3,

    title:
        "AOP — Core Course Materials",

    content_type:
        "licensed_course_material",

    content_type_label:
        "Licensed Course Pack",

    delivery_type:
        "protected_storage",

    personalisation_type:
        "learner_specific",

    learner_file_name:
        "AOP-Core-Course-Materials-AAU-AB12CD34.pdf",

    storage_path:
        "learner-learning-assets/LEARNER_UID/AOP/AOP-CORE-COURSE-MATERIALS/v3/AAU-AB12CD34/AOP-Core-Course-Materials-AAU-AB12CD34.pdf",

    mime_type:
        "application/pdf",

    file_size:
        48234112,

    watermark_applied:
        true,

    watermark_type:
        "credential_id",

    watermark_value:
        "AAU-AB12CD34",

    preview_allowed:
        true,

    download_allowed:
        true,

    embed_allowed:
        false,

    status:
        "published",

    is_active:
        true,

    available_from:
        timestamp,

    available_until:
        null,

    generated_by_uid:
        "ADMIN_UID",

    generated_at:
        timestamp,

    published_by_uid:
        "ADMIN_UID",

    published_at:
        timestamp,

    source:
        "admin_portal",

    created_at:
        timestamp,

    updated_at:
        timestamp
}
```

---

## Example shared delivery

A shared delivery references the common protected file held by the resource record.

```javascript
{
    delivery_id:
        "AAU-MAT-P2R8N4W6",

    learner_uid:
        "LEARNER_UID",

    program_code:
        "AOP",

    cohort_id:
        "AOP-2026-MARCH",

    resource_id:
        "AOP-M03-SYSTEMS-THINKING-WORKBOOK",

    resource_document_id:
        "AOP-M03-SYSTEMS-THINKING-WORKBOOK_v1",

    resource_version:
        1,

    delivery_type:
        "protected_storage",

    personalisation_type:
        "shared",

    preview_allowed:
        true,

    download_allowed:
        true,

    embed_allowed:
        false,

    status:
        "published",

    is_active:
        true,

    available_from:
        timestamp,

    available_until:
        null,

    published_at:
        timestamp,

    source:
        "admin_portal"
}
```

The same resource file may be referenced by multiple delivery records without duplicating the binary.

---

# Delivery Scope

The initial implementation may use one delivery record per learner for both shared and personalized resources.

This creates a simple and authoritative learner-resource relationship.

Future optimization may support higher-level delivery scopes:

```text
programme
cohort
individual
```

However, resolver output must always be reduced to the authenticated learner’s approved resource catalogue before reaching the Student Portal.

---

# Firestore Lifecycle States

## Resource states

Recommended resource lifecycle:

```text
draft
uploaded
published
withdrawn
archived
```

### `draft`

Metadata exists, but the resource is incomplete and unavailable to learners.

### `uploaded`

A protected file has been attached and validated, but the resource has not yet been published.

### `published`

The resource is approved and eligible for delivery resolution.

### `withdrawn`

The resource must no longer be delivered to learners.

Historical metadata and audit information remain available to administrators.

### `archived`

The resource is retained for historical or operational purposes and is excluded from normal active workflows.

---

## Delivery states

Recommended delivery lifecycle:

```text
draft
generated
published
suspended
withdrawn
archived
```

### `draft`

The delivery relationship has been prepared but is not available.

### `generated`

A personalized asset has been generated and validated but not yet published.

### `published`

The learner may access the delivery if all entitlement and availability checks pass.

### `suspended`

Access is temporarily unavailable without destroying the record.

### `withdrawn`

The delivery has been formally withdrawn.

### `archived`

The delivery is retained for audit and history but excluded from normal learner resolution.

---

# Firestore Immutability

Published resource versions must not be materially rewritten.

Corrections require a new version.

For example:

```text
AOP-CORE-COURSE-MATERIALS_v1
AOP-CORE-COURSE-MATERIALS_v2
AOP-CORE-COURSE-MATERIALS_v3
```

The following fields must be treated as immutable after publication:

- `resource_id`;
- `resource_document_id`;
- `program_code`;
- `version`;
- `delivery_type`;
- `personalisation_type`;
- `storage_path`;
- `mime_type`;
- `file_size`;
- publication audit fields.

Lifecycle fields such as `status`, `is_active` and withdrawal metadata may change through governed administrative operations.

---

# Latest-Version Governance

Each logical resource may have multiple versions, but no more than one active published document should be marked:

```javascript
is_latest: true
```

When publishing a new latest version:

```text
Previous version
is_latest = false

New version
is_latest = true
```

The operation should be completed through an authoritative administrative service.

The Student Portal must not infer the latest version by sorting untrusted client-side data.

---

# Firestore Indexing

The platform will require indexes for common resolver queries.

Typical query dimensions include:

```text
learner_uid
status
is_active
program_code
cohort_id
resource_id
resource_version
available_from
available_until
```

Example resolver query:

```text
learning_resource_deliveries
where learner_uid == authenticated UID
where status == published
where is_active == true
```

Additional filtering and lifecycle validation may be performed in the trusted service layer.

Composite indexes must be documented in the enterprise Firestore index specification.

---

# Storage Architecture

## Overview

Cloud Storage stores the binary learning assets.

Firestore stores the governed metadata and access relationships.

The separation is:

```text
Firestore
→ authority, metadata and ownership

Cloud Storage
→ protected binary persistence
```

Cloud Storage must never become the business source of truth.

A file existing in Storage does not mean it is published or accessible.

---

# Storage Domains

The Learning Resource Platform uses separate Storage domains for different asset classes.

```text
learning-resources/
learner-learning-assets/
master-learning-resources/
```

Each domain has a distinct purpose and security policy.

---

# Shared Learning Resources

Shared protected materials use:

```text
learning-resources/
```

Recommended canonical path:

```text
learning-resources/
{PROGRAM_CODE}/
{RESOURCE_ID}/
v{VERSION}/
{SAFE_FILE_NAME}
```

Example:

```text
learning-resources/
AOP/
AOP-M03-SYSTEMS-THINKING-WORKBOOK/
v1/
AOP-M03-Systems-Thinking-Workbook-v1.pdf
```

These assets may be delivered to multiple learners through separate delivery records.

---

# Learner-Specific Learning Assets

Personalized files use:

```text
learner-learning-assets/
```

Recommended canonical path:

```text
learner-learning-assets/
{LEARNER_UID}/
{PROGRAM_CODE}/
{RESOURCE_ID}/
v{VERSION}/
{LICENCE_OR_CREDENTIAL_ID}/
{LEARNER_FILE_NAME}
```

Example:

```text
learner-learning-assets/
LEARNER_UID/
AOP/
AOP-CORE-COURSE-MATERIALS/
v3/
AAU-AB12CD34/
AOP-Core-Course-Materials-AAU-AB12CD34.pdf
```

Each learner-specific asset belongs to exactly one authenticated learner.

---

# Master Learning Resources

Administrative source assets use:

```text
master-learning-resources/
```

Recommended path:

```text
master-learning-resources/
{PROGRAM_CODE}/
{RESOURCE_ID}/
v{VERSION}/
{SOURCE_FILE_NAME}
```

Example:

```text
master-learning-resources/
AOP/
AOP-CORE-COURSE-MATERIALS/
v3/
AOP-Core-Course-Materials-Master-v3.pptx
```

Master assets are:

- Admin-only;
- never learner-visible;
- never directly delivered;
- protected from public access;
- governed separately from generated learner outputs.

---

# Storage File-Size Governance

The maximum protected learning-resource upload size is locked at:

```text
50 MiB
```

Equivalent byte value:

```text
52,428,800 bytes
```

Implementation constant:

```javascript
50 * 1024 * 1024
```

This limit must remain synchronized across:

- Learning Resource Contract;
- Learning Resource Storage Service;
- Storage Security Rules;
- future backend upload validation.

The limit applies per uploaded protected file.

---

# Storage Immutability

Published Storage objects are immutable.

The architecture prohibits:

- overwriting published objects;
- replacing an existing version in place;
- learner-side deletion;
- learner-side upload;
- silent binary substitution.

A corrected or revised asset must use a new versioned path.

---

# Governed Storage Metadata

Uploaded objects should include trusted metadata such as:

```javascript
{
    program_code:
        "AOP",

    resource_id:
        "AOP-M03-SYSTEMS-THINKING-WORKBOOK",

    resource_version:
        "1",

    delivery_type:
        "protected_storage",

    personalisation_type:
        "shared",

    uploaded_by_uid:
        "ADMIN_UID",

    source:
        "admin_portal",

    governance_status:
        "protected"
}
```

Learner-specific assets should additionally include non-public ownership metadata where appropriate:

```javascript
{
    learner_uid:
        "LEARNER_UID",

    credential_id:
        "AAU-AB12CD34",

    licence_id:
        "AAU-AB12CD34"
}
```

Storage metadata supports validation and diagnostics but does not replace Firestore authority.

---

# Cache-Control Governance

Protected learning resources must not be configured as publicly cacheable immutable web assets.

Recommended metadata:

```text
Cache-Control: private, no-store
```

This reduces unintended caching of learner-specific or licensed materials.

Public website caching policies must never be reused for protected learning resources.

---

# Storage URL Governance

Permanent public download URLs must not be used for protected learning resources.

The platform must not store or expose unrestricted URLs such as:

```text
Public Firebase token URL
```

For protected assets, Firestore stores:

```text
storage_path
```

Access is granted only after trusted validation.

---

# Security Architecture

## Overview

The Learning Resource Platform applies layered security.

```text
Authentication

↓

Authorization

↓

Entitlement

↓

Ownership

↓

Publication State

↓

Availability Window

↓

Delivery Policy

↓

Protected Access
```

No single check is sufficient on its own.

---

# Authentication

Every protected learning-resource action requires an authenticated Firebase user.

Unauthenticated users must not:

- query learner deliveries;
- preview protected resources;
- download protected files;
- retrieve learner-specific metadata.

Public external resources may exist in the wider ecosystem, but they remain outside the protected learner-delivery path unless explicitly classified otherwise.

---

# Administrative Authorization

Only authorized administrators may:

- create resource drafts;
- upload protected assets;
- create versions;
- attach Storage assets;
- publish resources;
- generate personalized assets;
- create learner deliveries;
- withdraw resources;
- suspend deliveries;
- access master learning resources.

Administrative authorization must be determined through the established Agile AI University RBAC architecture.

Client-provided role values must never be trusted.

---

# Learner Authorization

A learner may access only deliveries for which:

```text
delivery.learner_uid == request.auth.uid
```

Ownership is mandatory for personalized learner assets.

A learner must never be able to:

- substitute another UID;
- retrieve another learner’s delivery;
- enumerate learner asset paths;
- infer another learner’s Credential ID;
- access another learner’s personalized PDF.

---

# Entitlement Validation

Ownership alone does not guarantee access.

The trusted resolver must also validate the applicable programme or platform entitlement.

Example:

```text
Authenticated learner
+
Delivery belongs to learner
+
AOP entitlement is active
+
Resource is published
+
Delivery is published
=
Access approved
```

The Student Portal does not evaluate entitlement independently.

---

# Publication Validation

Only published and active resources may be resolved.

Minimum resource conditions:

```javascript
status === "published"
is_active === true
```

Minimum delivery conditions:

```javascript
status === "published"
is_active === true
```

A delivery referencing a withdrawn or inactive resource must not be exposed.

---

# Availability Windows

Deliveries may include:

```javascript
available_from
available_until
```

Resolver behavior:

```text
Before available_from
→ hidden

Within availability window
→ eligible

After available_until
→ hidden or expired according to policy
```

A null `available_until` means no scheduled expiry unless another governance rule removes access.

Server-trusted time must be used for final access decisions.

---

# Preview and Download Authorization

Each delivery carries explicit delivery permissions:

```javascript
preview_allowed
download_allowed
embed_allowed
```

These fields control permitted actions.

Examples:

### Personalized PDF

```javascript
preview_allowed: true
download_allowed: true
embed_allowed: false
```

### Shared handout

```javascript
preview_allowed: true
download_allowed: true
embed_allowed: false
```

### YouTube video

```javascript
preview_allowed: true
download_allowed: false
embed_allowed: true
```

The Student Portal must not invent permissions from file type alone.

---

# Download Security

Downloadable does not mean publicly accessible.

The approved download architecture is:

```text
Learner selects Download

↓

Student Portal sends authenticated request

↓

Trusted backend validates identity

↓

Backend validates ownership

↓

Backend validates entitlement

↓

Backend validates resource and delivery lifecycle

↓

Backend validates download_allowed

↓

Backend issues short-lived access

↓

Learner downloads the governed file
```

The delivered PDF remains available for legitimate offline learner use after download.

The learner-specific Credential ID or licence watermark remains embedded in personalized materials.

---

# Signed Access

The preferred delivery mechanism is a short-lived signed URL or equivalent protected backend response.

Signed access must be:

- time limited;
- scoped to one Storage object;
- generated only after successful authorization;
- unsuitable for long-term public sharing.

The exact expiry period is an operational configuration and may differ between preview and download actions.

---

# Firestore Security Rules

Firestore Rules provide defensive access control but do not replace the trusted resolver.

Recommended learner read principle:

```text
A learner may read only their own published delivery metadata.
```

Administrative writes must be restricted to authorized administrative identities.

Learners must have no write access to:

```text
learning_resources
learning_resource_deliveries
```

A learner-facing client must never be allowed to publish, modify, assign, suspend or withdraw a resource.

---

# Storage Security Rules

Storage Rules must enforce:

- authenticated administrative upload;
- approved path structure;
- approved file types;
- maximum size of 50 MiB;
- metadata/path consistency;
- create-only immutability where applicable;
- no learner writes;
- no unrestricted public reads.

Learner download access should be brokered through the trusted backend rather than broad direct Storage reads.

---

# External Resource Security

External URLs must be validated before publication.

Approved video providers may initially include:

```text
youtube.com
www.youtube.com
youtu.be
youtube-nocookie.com
www.youtube-nocookie.com
vimeo.com
www.vimeo.com
player.vimeo.com
```

Only HTTPS URLs are permitted.

The platform must not store administrator-supplied iframe HTML.

Instead:

```text
Validated external URL
↓

Provider identified

↓

Video ID extracted

↓

Safe embed URL generated by renderer
```

This prevents arbitrary HTML and script injection.

---

# YouTube Privacy Model

The initial YouTube delivery model supports:

```text
Public videos
Unlisted videos
```

Public videos may be used for open or promotional learning content.

Unlisted videos may be used where moderate link privacy is acceptable.

An unlisted YouTube URL is not a high-security content-protection mechanism.

Highly confidential paid video content must eventually use a managed-video platform supporting capabilities such as:

- signed playback;
- domain restriction;
- expiring authorization;
- secure streaming;
- detailed playback analytics.

---

# Resource Resolver Architecture

## Purpose

The Learning Resource Resolver is the trusted business authority responsible for determining the learner’s visible resource catalogue and permitted actions.

It sits between the authoritative registries and the Student Portal.

The resolver prevents business logic from leaking into UI components.

---

# Resolver Position

```text
Firebase Authentication

↓

Portal Authentication Service

↓

Authorization

↓

Entitlement Resolver

↓

Learning Resource Resolver

↓

Learning Resource Service

↓

Student Portal ViewModel

↓

Renderer
```

The Learning Resource Resolver must not execute before authentication, authorization and entitlement readiness.

---

# Resolver Responsibilities

The resolver is responsible for:

- validating authenticated identity;
- resolving learner UID;
- validating programme entitlements;
- retrieving applicable delivery records;
- validating ownership;
- validating publication state;
- validating active state;
- checking release windows;
- resolving referenced resource versions;
- excluding malformed records;
- deduplicating applicable resources;
- enforcing preview, download and embed policies;
- creating immutable learner-facing ViewModels.

---

# Resolver Non-Responsibilities

The resolver does not:

- render HTML;
- manipulate page layout;
- upload files;
- create resource drafts;
- publish resources;
- generate personalized PDFs;
- modify delivery records;
- expose raw Storage paths to the UI;
- return administrative metadata unnecessarily.

---

# Resolver Input

Typical resolver input:

```javascript
{
    learner_uid:
        "LEARNER_UID",

    authenticated_user:
        firebaseUser,

    entitlements:
        resolvedEntitlements,

    program_codes:
        ["AOP"]
}
```

Identity and entitlement inputs must come from trusted platform services.

---

# Resolver Processing Flow

```text
1. Confirm authentication readiness.

2. Confirm authorization readiness.

3. Confirm entitlement readiness.

4. Resolve learner UID.

5. Query active published learner deliveries.

6. Validate each delivery belongs to the learner.

7. Retrieve the referenced resource version.

8. Validate the resource is published and active.

9. Validate programme entitlement.

10. Check available_from and available_until.

11. Validate delivery type and permissions.

12. Exclude malformed or inconsistent records.

13. Deduplicate equivalent results.

14. Sort learner resources.

15. Return learner-facing ViewModels.
```

---

# Resolver Consistency Validation

The resolver must reject records where delivery and resource metadata conflict.

Examples:

```text
delivery.resource_id
does not match
resource.resource_id
```

```text
delivery.resource_version
does not match
resource.version
```

```text
delivery.program_code
does not match
resource.program_code
```

```text
delivery.delivery_type
conflicts with
resource.delivery_type
```

Malformed or inconsistent records must be excluded and logged for administrative diagnosis.

---

# Personalized-Asset Validation

For learner-specific licensed materials, the resolver must additionally validate:

```text
personalisation_type == learner_specific

delivery.learner_uid == authenticated UID

storage_path is learner-scoped

credential_id or licence_id exists

watermark_applied == true

download_allowed == true
```

The resolver does not inspect the PDF binary on every request, but it trusts only delivery records created by the governed generation and publication workflow.

---

# Shared-Resource Validation

For shared protected resources, the resolver validates:

```text
personalisation_type == shared

delivery references a published resource

resource contains approved storage_path

delivery belongs to learner or approved scope

download policy permits the requested action
```

The same protected binary may be returned through many distinct learner deliveries.

---

# External-Video Validation

For external video resources, the resolver validates:

```text
delivery_type == external_video

external provider is approved

external URL is HTTPS

embed_allowed == true

download_allowed == false
```

The resolver should return a normalized provider and video identifier rather than unsafe embed HTML.

---

# Learner-Facing ViewModel

The resolver returns a safe ViewModel such as:

```javascript
{
    deliveryId:
        "AAU-MAT-K7P4X9Q2",

    resourceId:
        "AOP-CORE-COURSE-MATERIALS",

    programCode:
        "AOP",

    title:
        "AOP — Core Course Materials",

    description:
        "Licensed course materials for the complete AOP programme.",

    contentType:
        "licensed_course_material",

    contentTypeLabel:
        "Licensed Course Pack",

    moduleLabel:
        "Complete Programme",

    releaseLabel:
        "2026 Edition",

    version:
        3,

    learnerFileName:
        "AOP-Core-Course-Materials-AAU-AB12CD34.pdf",

    credentialId:
        "AAU-AB12CD34",

    previewAllowed:
        true,

    downloadAllowed:
        true,

    embedAllowed:
        false,

    deliveryType:
        "protected_storage",

    actions: [
        "preview",
        "download"
    ]
}
```

The ViewModel must not expose:

- raw administrative audit fields;
- master-resource paths;
- another learner’s identity;
- unrestricted Storage URLs;
- internal RBAC information;
- cryptic Firestore implementation details.

---

# Resolver Failure Behavior

Resolver failure must be safe.

If authentication, authorization or entitlement resolution fails:

```text
Return no protected resources
```

If an individual record is malformed:

```text
Exclude the record
Log the diagnostic event
Continue resolving valid resources
```

If the referenced resource does not exist:

```text
Exclude the delivery
Record a registry consistency warning
```

The platform must fail closed rather than exposing uncertain content.

---

# Resolver Readiness Signal

The Learning Resource Service should publish a readiness signal only after resolution is complete.

Example:

```javascript
document.dispatchEvent(
    new CustomEvent(
        "learning-resources:ready",
        {
            detail: {
                resources: resolvedResources
            }
        }
    )
);
```

Rendering must begin only after the service has produced a resolved learner-facing catalogue.

The exact event name may vary by implementation, but the resolver-first principle is mandatory.

---

# Security Audit Events

The platform should record meaningful security and delivery events, including:

- unauthorized access attempt;
- ownership mismatch;
- entitlement failure;
- withdrawn-resource request;
- expired-delivery request;
- malformed delivery record;
- missing resource reference;
- signed-download generation;
- personalized asset publication;
- resource withdrawal.

Audit events must avoid storing unnecessary sensitive content.

---

# Locked Firestore, Storage, Security and Resolver Decisions

## Decision 1

Firestore is the authoritative metadata and relationship registry.

Cloud Storage is the binary persistence layer.

---

## Decision 2

The authoritative initial collections are:

```text
learning_resources
learning_resource_deliveries
```

---

## Decision 3

The Resource Catalog and learner delivery relationship remain separate.

A resource describes educational content.

A delivery describes learner access and ownership.

---

## Decision 4

Shared protected resources use:

```text
learning-resources/
```

Personalized learner assets use:

```text
learner-learning-assets/
```

Master source assets use:

```text
master-learning-resources/
```

---

## Decision 5

The maximum protected-file upload size is locked at:

```text
50 MiB
```

---

## Decision 6

Published files and published resource versions are immutable.

Corrections create new versions.

---

## Decision 7

Permanent public download URLs are prohibited for protected resources.

Protected access is authenticated, authorized and time limited.

---

## Decision 8

Personalized PDF delivery requires matching learner ownership, programme entitlement and published delivery status.

---

## Decision 9

The Credential ID may serve as the visible licence and watermark identifier, but it does not replace the Resource ID or Delivery ID.

---

## Decision 10

External video URLs are validated and normalized.

Iframe HTML is generated by the trusted renderer and is never stored as administrator-provided content.

---

## Decision 11

The Student Portal receives resolved ViewModels only.

It does not independently decide ownership, entitlement, lifecycle or delivery permissions.

---

## Decision 12

Security failures must fail closed.

Uncertain, malformed or inconsistent resources are excluded from learner delivery.

---

# End of Part 3

The next section begins with:

**Part 4 – Student Portal, Admin Portal, Naming and Versioning**

# Student Portal Responsibilities

## Overview

The Student & Executive Portal is the learner-facing consumption surface for the Learning Resource Platform.

Its responsibility is to present only those learning resources that have already been resolved, authorized and transformed into safe learner-facing ViewModels.

The Student Portal is not an authority for:

- resource ownership;
- programme entitlement;
- publication status;
- version selection;
- access-policy decisions;
- learner assignment;
- file publication;
- Storage governance.

The Student Portal consumes trusted decisions made by the platform services.

---

# Student Portal Position

```text
Firebase Authentication

↓

Portal Authentication Service

↓

Authorization

↓

Entitlement Resolver

↓

Learning Resource Resolver

↓

Learning Resource Service

↓

Student Portal Renderer

↓

Learner Experience
```

No protected learning-resource interface may be rendered before authentication, authorization and entitlement resolution are complete.

---

# Student Portal Core Responsibilities

The Student Portal is responsible for:

- waiting for identity readiness;
- waiting for entitlement readiness;
- invoking the Learning Resource Service;
- consuming resolved resource ViewModels;
- rendering resource collections;
- presenting learner-friendly titles;
- displaying resource metadata;
- displaying permitted learner actions;
- opening governed previews;
- requesting authorized downloads;
- embedding approved external video;
- opening approved external references;
- presenting empty and error states safely;
- publishing presentation-level readiness events.

---

# Student Portal Non-Responsibilities

The Student Portal must never:

- write to `learning_resources`;
- write to `learning_resource_deliveries`;
- upload protected files;
- publish learning resources;
- withdraw learning resources;
- create personalized assets;
- create learner assignments;
- generate signed URLs independently;
- expose raw Storage paths;
- evaluate administrative roles;
- decide whether a learner owns a resource;
- decide whether an entitlement is valid;
- infer publication state from UI data;
- determine the latest version by sorting client-side records;
- render administrator-supplied HTML.

These rules are mandatory.

---

# Learning Resource Workspace

The Student Portal should expose a dedicated learner-facing workspace for governed learning resources.

Recommended learner-facing name:

```text
Learning Resources
```

Alternative contextual labels may include:

```text
My Learning Resources
Programme Resources
Licensed Course Materials
Learning Library
```

The workspace should clearly distinguish between:

- licensed course materials;
- supporting resources;
- videos;
- external references;
- future interactive learning assets.

---

# Resource Presentation Model

Every resource card or list item should present meaningful learner-facing information.

Recommended presentation fields:

```text
Programme
Resource title
Content type
Module or topic
Release or version label
Availability
Permitted actions
```

Example:

```text
AOP — Core Course Materials

Licensed Course Pack
Complete Programme
2026 Edition

[Preview] [Download]
```

Example:

```text
AOP — Agile AI Ethics Session

Video
Module 5
Session Recording

[Watch]
```

Example:

```text
AOP — Systems Thinking Workbook

Supporting Workbook
Module 3
Version 1

[Preview] [Download]
```

---

# Resource Grouping

The Student Portal may group resources using learner-friendly sections.

Recommended grouping:

```text
Licensed Course Materials

Supporting Materials

Videos

References

Recently Added
```

Programme-aware grouping may also be used:

```text
AOP Resources

AIPA Resources

AAIP Resources
```

The grouping model is a presentation concern.

The resolver remains responsible for deciding which resources are eligible for display.

---

# Resource Ordering

Recommended default ordering:

```text
1. Programme order
2. Resource category order
3. Module or sequence order
4. Release date
5. Learner-facing title
```

The renderer may consume explicit ordering fields such as:

```javascript
display_order
module_order
release_order
```

The renderer must not use cryptic Firestore document IDs as a learner-facing ordering strategy.

---

# Empty-State Behaviour

Where the learner has no currently available resources, the Student Portal should display a reassuring and accurate message.

Recommended message:

```text
Your learning resources will appear here as they are released for your programme.
```

The portal must not display:

- raw resolver errors;
- Firestore collection names;
- Storage paths;
- technical authorization details;
- misleading statements that imply the learner has no entitlement unless that has been authoritatively determined.

---

# Loading Behaviour

The Learning Resource Workspace must remain in a controlled loading state while the resolver operates.

Recommended states:

```text
initializing
loading
ready
empty
error
```

No partial unverified resource list should be rendered during entitlement resolution.

---

# Error Behaviour

For general service failure, the portal should display a safe message such as:

```text
We could not load your learning resources right now. Please try again shortly.
```

Security-sensitive details must remain in internal diagnostics.

The portal must not expose whether:

- another learner’s delivery exists;
- a specific protected object exists;
- a Storage path was rejected;
- an entitlement rule failed internally.

---

# Preview Responsibility

The Student Portal may open a governed preview when:

```javascript
previewAllowed === true
```

The preview component must:

- request authorized access;
- display only the approved asset;
- avoid exposing permanent public URLs;
- provide a close action;
- preserve the learner-facing filename;
- fail safely if authorization expires.

For protected PDFs, preview may use:

- a short-lived signed URL;
- a trusted proxy response;
- a secure document viewer.

---

# Download Responsibility

The Student Portal may display a Download action only when:

```javascript
downloadAllowed === true
```

The action flow is:

```text
Learner selects Download

↓

Portal submits authenticated request

↓

Trusted delivery service validates request

↓

Short-lived file access is returned

↓

Browser download begins
```

The Student Portal must use the learner-facing filename supplied by the resolved ViewModel.

---

# Video Responsibility

The Student Portal may display a Watch action only when:

```javascript
embedAllowed === true
```

The renderer should create a provider-approved embed URL using the normalized provider and video ID.

For YouTube, the preferred embed host is:

```text
youtube-nocookie.com
```

The Student Portal must not render arbitrary iframe HTML retrieved from Firestore.

---

# External Reference Responsibility

For approved external references, the Student Portal may display actions such as:

```text
Open Resource
Read Article
View Documentation
```

External links should:

- use HTTPS;
- open safely;
- use `noopener` and `noreferrer` where appropriate;
- clearly indicate that the learner is leaving the Agile AI University platform when necessary.

---

# Learner Ownership Experience

Personalized licensed materials should visibly communicate that the resource is assigned to the learner.

Recommended metadata:

```text
Licensed to: Credential ID AAU-AB12CD34
```

The learner’s full internal UID must never be shown.

Displaying the Credential ID is permitted because it acts as the visible licence and ownership reference.

---

# Download History Presentation

The initial Student Portal does not need to display detailed download analytics.

Future versions may display:

```text
First made available
Last downloaded
Number of downloads
Latest version available
```

Any analytics presented to learners must come from trusted delivery metadata rather than browser-local tracking alone.

---

# Student Portal Accessibility

Learning-resource components must follow accessible interface practices.

Requirements include:

- semantic headings;
- keyboard-accessible actions;
- meaningful button labels;
- visible focus states;
- accessible modal or overlay behavior;
- descriptive alternative text for images;
- captions or transcripts where available for video;
- sufficient contrast;
- no action conveyed by colour alone.

---

# Student Portal Security Rules

The following presentation rules are locked:

1. No resource renders before platform readiness.
2. No action renders unless explicitly permitted.
3. No raw Storage path reaches the learner interface.
4. No permanent protected URL is placed in HTML.
5. No client-side ownership decision is authoritative.
6. No arbitrary HTML is rendered from resource metadata.
7. No learner-facing component writes to resource registries.
8. A failed or uncertain resource is hidden rather than exposed.

---

# Admin Portal Responsibilities

## Overview

The Admin Portal is the authoritative operational surface for creating, managing and publishing learning resources.

It acts as the controlled publisher for the Learning Resource Platform.

The Admin Portal is responsible for initiating governed changes, but the underlying business rules should remain inside authoritative contracts and services rather than page-specific UI code.

---

# Admin Portal Position

```text
Authorized Administrator

↓

Admin Authentication

↓

RBAC Resolution

↓

Learning Resource Management

↓

Resource Contract

↓

Storage Service

↓

Publication Service

↓

Firestore Registry

↓

Learning Resource Resolver

↓

Student Portal
```

---

# Admin Portal Core Responsibilities

The Admin Portal is responsible for:

- creating resource drafts;
- assigning stable Resource IDs;
- capturing learner-facing metadata;
- selecting programme and content type;
- selecting delivery type;
- selecting personalisation type;
- uploading protected shared files;
- validating file type and size;
- registering external-video URLs;
- validating approved external providers;
- publishing resources;
- creating new resource versions;
- withdrawing or archiving resources;
- generating personalized learner assets;
- creating learner delivery records;
- assigning Credential IDs or licence references;
- previewing resources before publication;
- reviewing publication state;
- displaying learner deliveries;
- recording administrator audit metadata.

---

# Admin Portal Non-Responsibilities

The Admin Portal page layer must not:

- bypass the Learning Resource Contract;
- write malformed documents directly;
- overwrite published files;
- issue unrestricted public URLs;
- trust manually entered administrator UID values;
- accept arbitrary iframe HTML;
- allow learner access before publication;
- change immutable resource versions in place;
- infer security from hidden UI controls alone.

UI visibility is not authorization.

All authoritative operations require service and rule enforcement.

---

# Resource Creation Workflow

The standard shared-resource workflow is:

```text
Create Draft

↓

Enter Resource Metadata

↓

Select Programme

↓

Select Resource Type

↓

Select Delivery Policy

↓

Upload File or Register External URL

↓

Validate

↓

Administrative Preview

↓

Publish

↓

Create Deliveries

↓

Learner Resolution
```

---

# Personalized Resource Workflow

The personalized licensed-resource workflow is:

```text
Select Master Resource

↓

Select Learner

↓

Resolve Learner Credential

↓

Resolve Licence Identifier

↓

Generate Personalized PDF

↓

Apply Watermark

↓

Validate Generated Asset

↓

Upload to Learner-Specific Path

↓

Create Delivery Record

↓

Publish Delivery

↓

Learner Resolution
```

No personalized file should become visible merely because generation succeeded.

The delivery must be published separately.

---

# Continuous Publication Workflow

During an active programme, administrators may release resources incrementally.

```text
Programme Session Completed

↓

Administrator Creates or Selects Resource

↓

Resource Validated

↓

Resource Published

↓

Learner Deliveries Created

↓

Student Portal Refreshes

↓

Resource Becomes Available
```

No application deployment is required.

---

# Draft Governance

A draft resource may be edited freely before publication.

Drafts may contain incomplete metadata.

Draft resources:

- are Admin-only;
- are not resolvable;
- are not learner-visible;
- must not generate learner actions;
- may be deleted according to operational policy.

A protected file attached to a draft remains unpublished until the publication operation succeeds.

---

# Publication Governance

Publication is a deliberate administrative action.

The publication service must validate:

- administrator authorization;
- required metadata;
- supported programme;
- valid Resource ID;
- valid version;
- approved delivery type;
- approved content type;
- file presence where required;
- file size;
- file MIME type;
- external URL safety where applicable;
- delivery-policy consistency;
- immutable Storage path;
- audit metadata.

Only after validation may status become:

```javascript
status: "published"
```

---

# Withdrawal Governance

Withdrawal removes a resource or delivery from active learner resolution without destroying its audit history.

A withdrawal operation should record:

```javascript
{
    status:
        "withdrawn",

    is_active:
        false,

    withdrawn_by_uid:
        "ADMIN_UID",

    withdrawn_at:
        timestamp,

    withdrawal_reason:
        "Reason"
}
```

Withdrawal is preferred over destructive deletion for published records.

---

# Archive Governance

Archiving retains historical records outside normal operational views.

Archived resources may be used for:

- audit;
- historical reporting;
- superseded-version review;
- regulatory evidence;
- future restoration analysis.

Archiving does not automatically restore learner access.

---

# Administrative Preview

Before publication, administrators should be able to preview:

- protected documents;
- personalized learner PDFs;
- generated filenames;
- watermark placement;
- external-video embed;
- learner-facing title and metadata.

Administrative preview does not equal publication.

---

# Administrative Search and Filtering

The Learning Resource Management interface should support filters such as:

```text
Programme
Status
Content type
Delivery type
Personalisation type
Version
Resource ID
Learner
Credential ID
Publication date
```

Search and filtering support operations but do not change the underlying domain model.

---

# Administrative Audit Display

The Admin Portal should make important audit information visible.

Recommended fields:

```text
Created by
Created at
Uploaded by
Uploaded at
Generated by
Generated at
Published by
Published at
Withdrawn by
Withdrawn at
Current status
Version
```

Sensitive internal identifiers should be shown only where operationally useful.

---

# Admin Portal Security Rules

The following rules are locked:

1. Only authorized administrators may publish.
2. Uploaded files must pass the central contract.
3. Published files cannot be overwritten.
4. New content requires a new governed version.
5. Learners never receive master source files.
6. Personalized PDFs require learner ownership metadata.
7. External URLs require provider validation.
8. Publication and delivery are separate governed actions.
9. Every publication records authoritative audit metadata.
10. UI restrictions never replace backend authorization.

---

# Responsibility Matrix

| Capability | Admin Portal | Trusted Service | Student Portal |
|---|---:|---:|---:|
| Create resource draft | Initiates | Validates and persists | No |
| Upload shared file | Initiates | Validates and stores | No |
| Register external video | Initiates | Validates and normalizes | No |
| Publish resource | Initiates | Authorizes and publishes | No |
| Generate personalized PDF | Initiates | Generates or validates | No |
| Create learner delivery | Initiates | Authorizes and persists | No |
| Resolve learner access | No | Yes | Consumes |
| Decide entitlement | No | Yes | No |
| Preview protected resource | Administrative preview | Authorizes | Learner preview |
| Download protected resource | Administrative download | Authorizes | Learner download |
| Modify published binary | No | No | No |
| Withdraw resource | Initiates | Authorizes and records | No |
| Render resource interface | Admin view | Produces data | Learner view |

---

# Naming Architecture

## Overview

Learning-resource naming must serve three different audiences:

```text
Platform
Administrators
Learners
```

A single name must not be forced to serve every purpose.

The architecture therefore distinguishes between:

- Resource ID;
- Resource Version ID;
- Delivery ID;
- learner-facing title;
- source filename;
- learner download filename;
- Storage path.

---

# Resource ID

## Purpose

The Resource ID is the stable internal identity of a logical learning resource.

It remains constant across versions.

Example:

```text
AOP-CORE-COURSE-MATERIALS
```

Versions may change:

```text
v1
v2
v3
```

The Resource ID does not change.

---

## Resource ID Format

Recommended format:

```text
{PROGRAM_CODE}-{RESOURCE_DESCRIPTOR}
```

Module-specific format:

```text
{PROGRAM_CODE}-{MODULE_CODE}-{RESOURCE_DESCRIPTOR}
```

Examples:

```text
AOP-CORE-COURSE-MATERIALS
AOP-PROGRAMME-HANDBOOK
AOP-M03-SYSTEMS-THINKING-WORKBOOK
AOP-M05-ETHICS-SESSION-VIDEO
AIPA-M02-PROMPT-ENGINEERING-GUIDE
AAIP-M04-AGENT-ORCHESTRATION-WORKBOOK
```

---

## Resource ID Rules

Resource IDs must:

- use uppercase English letters;
- use digits where meaningful;
- use hyphens as separators;
- begin with a valid programme code;
- remain stable across versions;
- describe the educational resource;
- avoid learner names;
- avoid email addresses;
- avoid dates unless the date is part of the logical identity;
- avoid Storage-specific information;
- avoid file extensions.

Resource IDs must not use:

```text
spaces
underscores
slashes
special punctuation
random filenames
```

---

# Programme Code

The Resource ID must use the authoritative Agile AI University programme code.

Examples:

```text
AOP
AIPA
AAIA
AAIP
AIAL
AISD
```

Programme codes must come from the authoritative Programme Registry.

They must not be entered as arbitrary free text where a governed selection is available.

---

# Module Code

Where the resource belongs to a specific module, the recommended module format is:

```text
M01
M02
M03
```

Examples:

```text
AOP-M01-AGILE-AI-FOUNDATIONS-GUIDE
AOP-M03-SYSTEMS-THINKING-WORKBOOK
```

Module codes should remain stable even if the learner-facing module title changes slightly.

---

# Resource Descriptor

The descriptor should communicate the resource’s educational purpose.

Preferred terms include:

```text
COURSE-MATERIALS
PROGRAMME-HANDBOOK
WORKBOOK
REFERENCE-GUIDE
HANDOUT
CHECKLIST
TEMPLATE
SESSION-VIDEO
ASSESSMENT-GUIDE
CASE-STUDY
READING-LIST
```

Avoid vague identifiers such as:

```text
FILE-1
DOCUMENT
MATERIAL
NEW-PDF
FINAL-FILE
UPDATED-COPY
```

---

# Resource Version ID

The Resource Version ID identifies one immutable version of a Resource ID.

Recommended format:

```text
{RESOURCE_ID}_v{VERSION}
```

Examples:

```text
AOP-CORE-COURSE-MATERIALS_v1
AOP-CORE-COURSE-MATERIALS_v2
AOP-M03-SYSTEMS-THINKING-WORKBOOK_v1
```

The lowercase `v` prefix is retained as a readable version delimiter.

---

# Delivery ID

The Delivery ID identifies a governed learner delivery.

Recommended format:

```text
AAU-MAT-{RANDOM_UPPERCASE_ALPHANUMERIC}
```

Example:

```text
AAU-MAT-K7P4X9Q2
```

The Delivery ID:

- is unique;
- is not the Resource ID;
- is not the Credential ID;
- is not the learner UID;
- must not expose personal information;
- may be used as the Firestore delivery document ID.

---

# Credential ID and Licence ID

The Credential ID may serve as the learner-visible licence identifier for personalized course materials.

Example:

```text
AAU-AB12CD34
```

It may be used for:

- PDF watermarking;
- licensed-to labels;
- learner-facing filenames;
- delivery ownership references;
- audit traceability.

It must not replace:

- Resource ID;
- Resource Version ID;
- Delivery ID.

The relationship is:

```text
Resource ID
→ identifies the educational resource

Resource Version ID
→ identifies the resource version

Delivery ID
→ identifies the learner delivery

Credential ID
→ identifies the visible learner licence
```

---

# Learner-Facing Title

The learner-facing title should be clear, professional and human-readable.

Recommended format:

```text
{PROGRAMME_CODE} — {RESOURCE_NAME}
```

Examples:

```text
AOP — Core Course Materials
AOP — Systems Thinking Workbook
AOP — Agile AI Ethics Session
AIPA — Prompt Engineering Reference Guide
AAIP — Agent Orchestration Workbook
```

The em dash separates programme identity from the resource name.

---

# Learner-Facing Subtitle

Optional subtitle information may communicate:

- content type;
- module;
- edition;
- session;
- release.

Example:

```text
Licensed Course Pack · Complete Programme · 2026 Edition
```

Example:

```text
Supporting Workbook · Module 3 · Version 1
```

Example:

```text
Video · Module 5 · Session Recording
```

---

# Source Filename

Master or administrative source files should use meaningful governed filenames.

Recommended format:

```text
{RESOURCE-ID}-Master-v{VERSION}.{extension}
```

Examples:

```text
AOP-CORE-COURSE-MATERIALS-Master-v3.pptx
AOP-M03-SYSTEMS-THINKING-WORKBOOK-Master-v1.docx
```

Source filenames are Admin-only and should not be exposed to learners.

---

# Shared Download Filename

Shared downloadable resources should use readable filenames.

Recommended format:

```text
{PROGRAMME}-{RESOURCE-NAME}-v{VERSION}.{extension}
```

Examples:

```text
AOP-Systems-Thinking-Workbook-v1.pdf
AOP-Prompt-Engineering-Reference-Guide-v2.pdf
AIPA-Assessment-Preparation-Guide-v1.pdf
```

The filename should remain understandable outside the Student Portal.

---

# Personalized Download Filename

Personalized learner files must include the learner’s visible licence identifier.

Recommended format:

```text
{PROGRAMME}-{RESOURCE-NAME}-{CREDENTIAL-ID}.{extension}
```

Example:

```text
AOP-Core-Course-Materials-AAU-AB12CD34.pdf
```

Where explicit version visibility is operationally useful:

```text
{PROGRAMME}-{RESOURCE-NAME}-v{VERSION}-{CREDENTIAL-ID}.{extension}
```

Example:

```text
AOP-Core-Course-Materials-v3-AAU-AB12CD34.pdf
```

The chosen pattern should remain consistent across a resource family.

---

# Safe Filename Rules

Download filenames must:

- use readable title case or controlled hyphenation;
- avoid spaces where cross-platform compatibility is a concern;
- avoid learner names unless expressly governed;
- avoid email addresses;
- avoid learner UIDs;
- avoid query strings;
- avoid Storage tokens;
- use the correct extension;
- remain within practical filesystem-length limits.

---

# Storage Naming

Storage paths use internal governed identifiers rather than learner-facing titles.

Example:

```text
learning-resources/
AOP/
AOP-M03-SYSTEMS-THINKING-WORKBOOK/
v1/
AOP-M03-Systems-Thinking-Workbook-v1.pdf
```

Example:

```text
learner-learning-assets/
LEARNER_UID/
AOP/
AOP-CORE-COURSE-MATERIALS/
v3/
AAU-AB12CD34/
AOP-Core-Course-Materials-v3-AAU-AB12CD34.pdf
```

The Student Portal must never display the Storage path.

---

# Naming Authority

Naming must be produced or validated by a centralized Learning Resource Contract.

The contract should provide operations such as:

```javascript
normalizeProgramCode()
normalizeResourceId()
validateResourceId()
buildResourceDocumentId()
buildSharedFileName()
buildPersonalizedFileName()
buildSharedStoragePath()
buildPersonalizedStoragePath()
```

Page-specific implementations must not independently invent naming rules.

---

# Naming Governance Examples

## Valid

```text
AOP-CORE-COURSE-MATERIALS
AOP-M03-SYSTEMS-THINKING-WORKBOOK
AIPA-M02-PROMPT-ENGINEERING-GUIDE
```

## Invalid

```text
aop_material
AOP Core Course
course-final-final
Dileep-AOP-PDF
learner@example.com-material
AOP/file/1
```

---

# Versioning Architecture

## Overview

Versioning protects publication history, learner trust and enterprise auditability.

The Learning Resource Platform uses immutable versioning.

A published version is never silently replaced.

---

# Version Number

The initial resource version field is an integer:

```javascript
version: 1
```

Subsequent versions use:

```javascript
version: 2
version: 3
```

The canonical display form is:

```text
v1
v2
v3
```

---

# Versioning Principle

```text
Change to published content

↓

Create new version

↓

Upload new binary

↓

Validate

↓

Publish new resource version

↓

Update applicable deliveries

↓

Preserve previous version
```

---

# When a New Version Is Required

A new version is required when published content changes materially.

Examples:

- educational content correction;
- new module content;
- significant layout revision;
- updated diagrams;
- revised programme terminology;
- added exercises;
- changed licensing statement;
- changed watermark template;
- replaced video;
- changed downloadable file;
- changed source master.

---

# Changes That May Not Require a New Resource Version

Some non-material administrative metadata may be updated through governed correction where policy permits.

Examples may include:

- administrative note;
- internal operational tag;
- non-learner-facing diagnostic field;
- corrected internal audit reference.

Learner-facing content, binary identity and access-policy changes should normally create a new governed version or a new delivery policy record.

---

# Version Immutability

After publication, the following must not be changed in place:

```text
resource_id
version
storage_path
file hash
file size
MIME type
published binary
source version relationship
```

A changed binary must never remain labelled as the same published version.

---

# Version Status Model

Each resource version has its own lifecycle.

Example:

```text
v1 — archived
v2 — published, not latest
v3 — published, latest
```

Recommended fields:

```javascript
{
    status:
        "published",

    is_active:
        true,

    is_latest:
        true,

    supersedes_resource_document_id:
        "AOP-CORE-COURSE-MATERIALS_v2",

    superseded_by_resource_document_id:
        null
}
```

---

# Latest-Version Rule

Only one active published version of a logical resource should be marked:

```javascript
is_latest: true
```

A new version does not require immediate destruction or withdrawal of every earlier learner delivery.

The delivery migration policy depends on the educational and licensing requirement.

---

# Delivery Versioning

A learner delivery references an explicit resource version.

```javascript
{
    resource_id:
        "AOP-CORE-COURSE-MATERIALS",

    resource_document_id:
        "AOP-CORE-COURSE-MATERIALS_v3",

    resource_version:
        3
}
```

The resolver must not silently replace the referenced version unless a governed delivery update has occurred.

---

# Shared-Resource Upgrade Strategy

When a shared resource receives a new version, the administrator may choose one of the following governed strategies.

## Strategy A — New Learners Only

Existing learner deliveries retain the previous version.

New deliveries reference the latest version.

Use when historical consistency is required.

---

## Strategy B — Replace Active Delivery Reference

Existing active deliveries are migrated to the new resource version.

Use when all learners should receive the corrected or enhanced resource.

The migration must be audited.

---

## Strategy C — Add Both Versions

The previous and new versions remain available.

Use when learners benefit from historical comparison or edition continuity.

Learner-facing titles must clearly distinguish the versions.

---

# Personalized-Resource Versioning

Personalized materials require regeneration when a new binary version must be delivered.

Workflow:

```text
New Master Version

↓

Generate New Learner-Specific PDF

↓

Apply Learner Credential ID

↓

Upload to New Versioned Path

↓

Create or Update Governed Delivery

↓

Publish New Delivery

↓

Retain Previous Asset for Audit
```

A shared master update does not automatically change already generated learner PDFs.

---

# Watermark Versioning

Where watermark layout or licence text changes, the generated personalized asset should record:

```javascript
watermark_template_version:
    2
```

This helps distinguish:

- educational content version;
- source master version;
- watermark-template version;
- delivery version.

---

# Master Resource Versioning

Master source files must follow the same immutable version principle.

Example:

```text
AOP-Core-Course-Materials-Master-v1.pptx
AOP-Core-Course-Materials-Master-v2.pptx
AOP-Core-Course-Materials-Master-v3.pptx
```

A generated learner PDF must retain a reference to the source master version used.

Example:

```javascript
{
    master_resource_id:
        "AOP-CORE-COURSE-MATERIALS",

    master_version:
        3,

    watermark_template_version:
        2
}
```

---

# External-Video Versioning

A change to the linked video should create a new resource version when:

- the video ID changes;
- the provider changes;
- the educational content changes;
- a new session recording replaces the old recording.

The old external URL remains associated with the historical version.

---

# External-Link Versioning

A new version should be created when:

- the target resource materially changes;
- the URL points to a different publication;
- the linked edition changes;
- learner-facing context changes materially.

A minor provider redirect may be handled operationally if it points to the same governed content, subject to validation.

---

# Semantic Versioning Relationship

The internal document architecture uses semantic document versions such as:

```text
1.0.0
```

Learning-resource asset versions initially use simple integer versions:

```text
v1
v2
v3
```

These are separate concepts.

```text
Architecture document version
→ 1.0.0

Learning resource binary version
→ v3
```

They must not be confused.

---

# Hash Governance

Every uploaded protected binary should ideally record a cryptographic file hash.

Recommended field:

```javascript
sha256:
    "HASH_VALUE"
```

The hash supports:

- binary integrity;
- duplicate detection;
- audit validation;
- accidental overwrite diagnosis;
- future verification.

Two files with different hashes must not be treated as the same immutable published binary.

---

# Version Publication Audit

Each published version should record:

```javascript
{
    created_by_uid:
        "ADMIN_UID",

    created_at:
        timestamp,

    uploaded_by_uid:
        "ADMIN_UID",

    uploaded_at:
        timestamp,

    published_by_uid:
        "ADMIN_UID",

    published_at:
        timestamp
}
```

Where a version supersedes another version, that relationship should also be recorded.

---

# Version Rollback

Rollback does not overwrite the current version.

A rollback is implemented by:

- reactivating a previously published version; or
- publishing a new version based on previous content.

Every rollback action must be audited.

---

# Version Withdrawal

A defective version may be withdrawn.

```javascript
{
    status:
        "withdrawn",

    is_active:
        false,

    is_latest:
        false,

    withdrawal_reason:
        "Incorrect licensed PDF content",

    withdrawn_at:
        timestamp,

    withdrawn_by_uid:
        "ADMIN_UID"
}
```

The resolver must immediately exclude withdrawn versions and dependent deliveries according to policy.

---

# Naming and Versioning Decision Summary

The following decisions are locked.

## Decision 1

A stable Resource ID identifies the logical educational resource.

---

## Decision 2

The Resource ID remains unchanged across versions.

---

## Decision 3

A Resource Version ID identifies one immutable version.

Recommended format:

```text
{RESOURCE_ID}_v{VERSION}
```

---

## Decision 4

The Delivery ID remains separate from the Resource ID and Credential ID.

---

## Decision 5

The Credential ID may appear in personalized filenames and watermarks as the visible learner licence identifier.

---

## Decision 6

Learner-facing titles must be readable and meaningful.

Internal document IDs and Storage paths must never be presented as titles.

---

## Decision 7

Shared download filenames must identify programme, resource and version.

---

## Decision 8

Personalized download filenames must identify the resource and learner Credential ID.

---

## Decision 9

Published resource versions and binaries are immutable.

Material changes create new versions.

---

## Decision 10

A learner delivery always references an explicit resource version.

The Student Portal must not silently substitute another version.

---

## Decision 11

Personalized resources must be regenerated when a new learner-specific binary version is required.

---

## Decision 12

Naming and version construction must be centralized in the Learning Resource Contract.

Page-specific naming logic is prohibited.

---

# End of Part 4

The next section begins with:

**Part 5 – External Video, Download Governance, Operational Governance, Future Roadmap and Architectural Decisions Summary**

# External Video Architecture

## Overview

The Learning Resource Platform supports external video as a governed learning-resource type.

External video is not treated as an ordinary hyperlink.

It is treated as an educational resource with:

- programme context;
- learner relevance;
- publication state;
- delivery policy;
- approved provider;
- normalized video identity;
- lifecycle governance;
- learner-facing presentation.

The initial implementation supports YouTube and Vimeo.

---

# External Video Principles

The external-video architecture follows these principles:

```text
Validate before publish

Normalize before store

Resolve before render

Embed without exposing arbitrary HTML

Stream externally

Do not store protected video binaries in the document-resource bucket
```

---

# Supported Providers

The initial approved providers are:

```text
YouTube
Vimeo
```

Approved hostnames may include:

```text
youtube.com
www.youtube.com
youtu.be
youtube-nocookie.com
www.youtube-nocookie.com

vimeo.com
www.vimeo.com
player.vimeo.com
```

Only HTTPS URLs are permitted.

Additional providers require:

- architectural review;
- security validation;
- provider-specific normalization;
- approved embed behavior;
- updated governance documentation.

---

# External Video Resource Model

An external-video resource should contain normalized metadata rather than arbitrary iframe HTML.

Recommended fields:

```javascript
{
    delivery_type:
        "external_video",

    content_type:
        "external_video",

    external_provider:
        "youtube",

    external_video_id:
        "VIDEO_ID",

    external_url:
        "https://www.youtube.com/watch?v=VIDEO_ID",

    embed_allowed:
        true,

    preview_allowed:
        true,

    download_allowed:
        false
}
```

The normalized video ID is the authoritative provider-specific reference used by the renderer.

---

# URL Normalization

The Admin Portal may accept supported URL forms such as:

```text
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/embed/VIDEO_ID
```

The platform must normalize these into:

```text
provider = youtube
video_id = VIDEO_ID
canonical_url = https://www.youtube.com/watch?v=VIDEO_ID
```

For Vimeo:

```text
https://vimeo.com/123456789
https://player.vimeo.com/video/123456789
```

Normalize to:

```text
provider = vimeo
video_id = 123456789
canonical_url = https://vimeo.com/123456789
```

---

# Prohibited Video Input

The Admin Portal must reject:

- non-HTTPS URLs;
- unsupported hosts;
- malformed video IDs;
- arbitrary iframe HTML;
- script tags;
- shortened URLs from unknown providers;
- embedded tracking code supplied as HTML;
- direct executable content;
- URLs containing unsafe protocols.

The platform must never store raw administrator-provided iframe markup.

---

# Safe Embed Generation

The Student Portal renderer constructs safe provider-specific embed URLs.

For YouTube, the preferred privacy-enhanced host is:

```text
https://www.youtube-nocookie.com/embed/{VIDEO_ID}
```

For Vimeo:

```text
https://player.vimeo.com/video/{VIDEO_ID}
```

Embed parameters must be generated by trusted application code.

The renderer must apply restrictive iframe attributes where appropriate, including:

```html
loading="lazy"
allowfullscreen
referrerpolicy="strict-origin-when-cross-origin"
```

The `allow` policy should contain only required capabilities.

---

# Video Publication Workflow

```text
Administrator Selects External Video

↓

Enter Learner-Facing Metadata

↓

Enter Supported Video URL

↓

Provider Validation

↓

Video ID Extraction

↓

Canonical URL Generation

↓

Administrative Preview

↓

Publication

↓

Delivery Creation

↓

Learner Resolution

↓

Embedded Playback
```

Administrative preview does not equal publication.

---

# YouTube Privacy and Protection Model

YouTube supports practical distribution but is not a high-security digital-rights-management platform.

The initial operating model supports:

```text
Public videos
Unlisted videos
```

## Public Videos

Suitable for:

- promotional learning content;
- general educational resources;
- public reference material;
- marketing-supported sessions.

## Unlisted Videos

Suitable for:

- moderate-privacy programme content;
- cohort recordings;
- content not intended for search discovery.

An unlisted URL can still be forwarded.

Therefore, unlisted YouTube must not be treated as strong access control.

The Agile AI University platform governs discoverability and entitlement inside the portal, but it cannot fully prevent redistribution of an external unlisted URL after it becomes known.

---

# Restricted Video Content

Highly protected commercial or confidential video should eventually use a managed-video platform supporting:

- signed playback tokens;
- expiring playback authorization;
- domain restrictions;
- viewer authentication;
- secure streaming;
- playback analytics;
- controlled geographic access;
- watermarking where supported.

This capability belongs to a future Managed Media Delivery domain.

It must not be implemented by increasing protected-document upload limits or storing large video files in the learning-resource document bucket.

---

# Video Download Governance

The Agile AI University platform must not present a Download action for externally streamed video.

External-video policy:

```javascript
preview_allowed: true
embed_allowed: true
download_allowed: false
```

The platform must not:

- download YouTube videos;
- mirror provider videos into Storage without rights and governance;
- offer browser extensions or workarounds;
- imply that streaming access grants file ownership.

---

# Video Accessibility

Where possible, video resources should provide:

- captions;
- subtitles;
- transcript references;
- meaningful titles;
- module context;
- duration;
- language;
- speaker or facilitator metadata.

Recommended metadata:

```javascript
{
    duration_seconds:
        3720,

    language_code:
        "en",

    captions_available:
        true,

    transcript_available:
        false
}
```

These fields support future learner experience and accessibility improvements.

---

# Video Availability Failure

An external provider may remove, restrict or block a video after publication.

When the Student Portal detects playback failure, it should display a safe message:

```text
This video is temporarily unavailable. Please check again later.
```

The failure should be reported for administrator review.

The portal must not automatically redirect learners to an unvalidated replacement URL.

---

# External Reference Architecture

External references follow the same governance principles as video resources.

Examples:

- official documentation;
- standards;
- research papers;
- articles;
- public datasets;
- professional references.

Recommended delivery policy:

```javascript
delivery_type:
    "external_link"

preview_allowed:
    false

download_allowed:
    false

embed_allowed:
    false
```

A learner action may be:

```text
Open Resource
Read Article
View Documentation
```

The URL must be validated and approved before publication.

---

# Download Governance

## Overview

Download governance defines how protected learning assets move from governed platform storage to an authorized learner.

Download permission is an explicit policy.

It is never inferred merely because a file exists.

---

# Downloadable Resource Types

The initial downloadable resource classes include:

- personalized licensed course materials;
- shared supporting handouts;
- workbooks;
- checklists;
- templates;
- programme guides;
- reference PDFs;
- other approved protected documents.

Typical policy:

```javascript
preview_allowed:
    true

download_allowed:
    true

embed_allowed:
    false
```

---

# Non-Downloadable Resource Types

Typical non-downloadable resources include:

- external video;
- external web references;
- future streamed interactive experiences;
- administrator-only master resources.

The Student Portal must not display a Download action where:

```javascript
download_allowed !== true
```

---

# Download Authorization Flow

```text
Authenticated Learner

↓

Selects Download

↓

Student Portal Sends Authenticated Request

↓

Trusted Delivery Service Resolves Delivery

↓

Learner Ownership Validation

↓

Programme Entitlement Validation

↓

Resource Lifecycle Validation

↓

Delivery Lifecycle Validation

↓

Availability Window Validation

↓

download_allowed Validation

↓

Short-Lived Access Issued

↓

Browser Downloads File
```

Every download request must be validated independently.

Previous successful access does not permanently authorize future requests.

---

# Short-Lived Download Access

Protected downloads should use one of the following:

- short-lived signed URL;
- authenticated backend streaming response;
- equivalent time-limited protected access mechanism.

The issued access must be:

- object-specific;
- time-limited;
- generated after authorization;
- unsuitable as a permanent public link.

The exact expiry is operational configuration.

Recommended examples:

```text
Preview access: shorter expiry
Download access: short but sufficient expiry
```

Expiry values must not be embedded as architectural constants unless formally approved.

---

# Download Filename Governance

The trusted delivery response should provide the approved learner-facing filename.

Shared example:

```text
AOP-Systems-Thinking-Workbook-v1.pdf
```

Personalized example:

```text
AOP-Core-Course-Materials-v3-AAU-AB12CD34.pdf
```

The browser must not receive a raw Storage object name where that object name is unsuitable for learners.

---

# Personalized Download Governance

Personalized licensed materials are downloadable by the learner to whom they belong.

Required conditions include:

```text
Authenticated UID matches delivery learner UID

Delivery is published and active

Resource is published and active

Applicable entitlement is valid

Personalized Storage path is learner-scoped

Credential ID or licence ID is present

Watermark was applied

download_allowed is true
```

The generated PDF remains a legitimate offline learner copy after download.

The learner-facing licence watermark remains embedded in the PDF.

---

# Shared Download Governance

A shared file may be reused across many learner deliveries.

The binary is stored once.

Access is still governed independently for each learner.

```text
One Shared File

↓

Many Published Deliveries

↓

Individual Learner Authorization
```

The existence of a shared file does not make it public.

---

# Download Limits and Abuse Protection

The initial architecture does not require strict learner download-count limits.

However, the delivery service should support future controls including:

- rate limiting;
- unusual download-pattern detection;
- temporary throttling;
- administrative review;
- delivery suspension;
- download-count analytics.

Controls must avoid disrupting normal legitimate learner use.

---

# Download Event Logging

A successful protected download should produce an auditable event.

Recommended event data:

```javascript
{
    event_type:
        "learning_resource_downloaded",

    delivery_id:
        "AAU-MAT-K7P4X9Q2",

    resource_id:
        "AOP-CORE-COURSE-MATERIALS",

    resource_version:
        3,

    learner_uid:
        "LEARNER_UID",

    occurred_at:
        timestamp,

    source:
        "student_portal"
}
```

Audit data should not duplicate the learning-resource binary or store unnecessary personal information.

---

# Preview Event Logging

Preview actions may also be recorded separately:

```javascript
event_type:
    "learning_resource_previewed"
```

This separation supports future analytics:

```text
Resource opened
Resource downloaded
Video started
Video completed
Reference opened
```

Detailed analytics are a future capability and should not delay MVP delivery.

---

# Download Failure Behaviour

Where authorization fails, the learner should receive a safe message:

```text
This resource is not currently available for download.
```

The portal must not reveal:

- whether another learner owns the file;
- the raw Storage path;
- internal entitlement failures;
- signed URL generation details;
- whether a guessed object exists.

The trusted service should record the internal failure reason.

---

# Offline Use

Downloadable learning resources may be used offline after successful download.

The architecture does not attempt to remotely revoke a file already stored on a learner’s personal device.

Protection is achieved through:

- identity-aware issuance;
- entitlement validation;
- personalized licensing;
- watermarking;
- auditability;
- clear intellectual-property terms.

Future digital-rights-management capabilities may be evaluated separately if justified.

---

# Intellectual Property Notice

Personalized and shared downloadable resources should contain appropriate intellectual-property and usage notices.

For personalized licensed resources, the notice may include:

- Agile AI University ownership;
- learner Credential ID;
- licence scope;
- prohibition on unauthorized redistribution;
- version or edition;
- support contact where appropriate.

The exact legal wording belongs to approved legal and governance content, not to page-specific implementation.

---

# Operational Governance

## Overview

Operational governance ensures the architecture remains reliable in daily production use.

The Agile AI University operating model is production-focused.

Changes must therefore be:

- focused;
- reversible where practical;
- documented;
- validated live;
- traceable through commits and publication records.

---

# Production-Only Operating Model

The current implementation workflow is:

```text
Focused Change

↓

Review

↓

Commit

↓

Deploy

↓

Validate in Production

↓

Record Outcome
```

Because no separate development or test environment is assumed, risk must be controlled through:

- small deployment scope;
- immutable versioning;
- safe full-file replacements;
- pre-publication validation;
- rollback awareness;
- live smoke tests;
- audit records.

---

# Change Governance

Every Learning Resource Platform change should be classified.

Recommended categories:

```text
Documentation only
UI presentation
Service logic
Firestore model
Storage path
Security rules
Publication lifecycle
Resolver behavior
Breaking migration
```

Security-rule, Storage-path and Firestore-contract changes require higher scrutiny than visual-only changes.

---

# Deployment Unit Governance

Changes should be deployed in focused units.

Example:

```text
1. Contract update
2. Storage-service update
3. Security-rule update
4. Admin UI update
5. Student resolver update
6. Student renderer update
```

Where components are tightly coupled, they should be deployed together to avoid contract mismatch.

---

# Contract Synchronization

The following must remain synchronized:

- Resource Contract;
- Admin Resource Service;
- Storage Service;
- Firestore document schema;
- Firestore Rules;
- Storage Rules;
- Resolver;
- Student ViewModel;
- enterprise documentation.

A change to a field name in one layer without corresponding updates in dependent layers is prohibited.

---

# Validation Checklist

Every production release affecting Learning Resources should validate at least:

```text
Admin authentication
Admin authorization
Draft creation
File-size validation
File-type validation
Upload
Publication
Firestore record
Storage path
Learner delivery creation
Learner authentication
Entitlement resolution
Resource resolution
Resource rendering
Preview
Download
Video embed where applicable
Unauthorized access denial
```

---

# Test Resource Governance

Production validation may use a controlled test resource.

The test resource should be clearly labelled, for example:

```text
AOP — Learning Resource Platform Validation
```

After validation, it should either:

- be withdrawn;
- be archived;
- remain as a documented internal validation record.

Test resources must never be misleadingly presented as actual learner course materials.

---

# File-Size Operations

The locked maximum file size is:

```text
50 MiB
```

Operational validation must check the exact byte value:

```text
52,428,800 bytes
```

Files typically between 45 MB and 48 MB are acceptable when their exact byte size remains within the 50 MiB limit.

The operating system’s rounded size display must not be the sole validation source.

---

# Content-Type Governance

Initial protected file types should be explicitly allowlisted.

Typical initial types may include:

```text
application/pdf
```

Additional file types must be added deliberately and consistently across:

- Admin file selector;
- validation contract;
- upload service;
- Storage Rules;
- learner rendering;
- download behavior.

Unsupported file types must fail before publication.

---

# Operational Failure Recovery

## Upload succeeds but Firestore registration fails

Required behavior:

- do not mark the resource published;
- retain diagnostic information;
- allow administrator recovery;
- remove or quarantine orphaned objects according to the runbook.

## Firestore record exists but Storage object is missing

Required behavior:

- resolver excludes the resource;
- diagnostic event is recorded;
- administrator sees a consistency warning.

## Delivery exists but resource reference is invalid

Required behavior:

- resolver excludes the delivery;
- no learner access is granted;
- integrity warning is recorded.

## Signed access generation fails

Required behavior:

- safe learner error;
- no fallback to a public URL;
- internal diagnostic logging.

---

# Orphaned Asset Governance

An orphaned asset is a Storage object without a valid governed registry relationship.

Orphaned assets must not become learner-visible.

A future operational job may identify:

- unpublished draft files;
- failed generation outputs;
- abandoned version uploads;
- missing Firestore references.

Deletion must follow approved retention and audit policy.

Learner-side deletion remains prohibited.

---

# Monitoring

The platform should progressively monitor:

- resource publication failures;
- Storage upload failures;
- resolver failures;
- missing resource references;
- unauthorized access attempts;
- signed URL failures;
- external-video availability failures;
- unusually high download activity.

Monitoring should identify meaningful operational problems without recording unnecessary learner content.

---

# Audit Retention

Published resource, delivery and security audit records should be retained according to enterprise retention policy.

At minimum, the platform should preserve:

- who created the record;
- who uploaded the asset;
- who published it;
- what version was published;
- who withdrew it;
- when lifecycle events occurred.

Published historical records should not be hard-deleted through routine UI operations.

---

# Operational Runbooks

The following runbooks should be created under the enterprise runbook structure:

```text
Learning Resource Publication Runbook

Personalized Material Generation Runbook

Learning Resource Withdrawal Runbook

Broken Resource Recovery Runbook

External Video Failure Runbook

Unauthorized Resource Access Runbook

Orphaned Storage Asset Runbook
```

These may be implemented incrementally after the MVP publication and delivery path is stable.

---

# Governance Roles

Recommended operational roles include:

## Learning Resource Administrator

Responsible for:

- draft creation;
- metadata entry;
- upload;
- administrative preview;
- routine publication.

## Programme Authority

Responsible for:

- educational correctness;
- programme alignment;
- release approval;
- version approval.

## Platform Administrator

Responsible for:

- security;
- access control;
- Storage;
- operational recovery;
- system diagnostics.

During the solopreneur stage, one authorized person may perform multiple roles.

The architecture keeps the responsibilities conceptually separate so that governance can scale later.

---

# Publication Approval Model

The initial implementation may use a single-authorized-administrator publication model.

Future enterprise operation may introduce:

```text
Creator

↓

Reviewer

↓

Approver

↓

Publisher
```

The initial schema should not prevent future multi-stage approval.

Potential future fields include:

```javascript
review_status
reviewed_by_uid
reviewed_at
approval_status
approved_by_uid
approved_at
```

These fields are not mandatory for MVP unless currently required by governance.

---

# Documentation Governance

The following documentation must remain authoritative and synchronized:

```text
learning-resource-architecture.md

ADR-019-Learning-Resource-Delivery-Architecture.md

LearningService.md

FIRESTORE_COLLECTION_REFERENCE.md

Storage Security Rules documentation

Operational runbooks
```

Major architectural changes require an ADR.

Minor implementation detail changes may update the architecture document and version history without a new ADR, where the governing decision remains unchanged.

---

# Architecture Compliance

An implementation is non-compliant if it:

- exposes permanent protected URLs;
- allows learner writes;
- uploads video into the protected-document bucket as a shortcut;
- overwrites a published asset;
- bypasses the resolver;
- combines Resource ID and Credential ID into one identity;
- stores personalized binaries as shared resources;
- allows arbitrary external HTML;
- exceeds the locked file-size policy without approval;
- renders a resource before entitlement readiness.

Non-compliant implementation must be corrected before being treated as production architecture.

---

# Future Roadmap

## Overview

The Learning Resource Platform roadmap evolves from governed document delivery into a lifelong intelligent learning library.

The roadmap must preserve existing identifiers, ownership and audit history.

---

# Phase 1 — Governed Resource Management

Status:

```text
Current Implementation
```

Capabilities:

- Admin resource creation;
- protected PDF upload;
- 50 MiB validation;
- immutable publication;
- shared resources;
- resource catalogue;
- learner resource rendering;
- preview and download;
- centralized Admin navigation.

---

# Phase 2 — Learner Delivery Registry

Capabilities:

- `learning_resource_deliveries`;
- learner-specific ownership;
- delivery lifecycle;
- Credential ID linkage;
- learner-scoped resolution;
- shared delivery assignment;
- delivery audit history.

---

# Phase 3 — Personalized Material Generation

Capabilities:

- master PowerPoint registration;
- learner selection;
- Credential ID resolution;
- automated watermark insertion;
- PDF generation;
- learner-specific Storage path;
- personalized filename generation;
- governed publication;
- regeneration workflow.

---

# Phase 4 — External Video and Reference Delivery

Capabilities:

- YouTube URL validation;
- Vimeo URL validation;
- provider normalization;
- privacy-enhanced embed;
- external reference resources;
- video metadata;
- learner Watch actions;
- provider failure diagnostics.

---

# Phase 5 — Learning Library Experience

Capabilities:

- programme grouping;
- resource search;
- filters;
- recently added resources;
- module progression;
- favourites or bookmarks;
- learner download history;
- lifelong resource library;
- credential-linked learning journeys.

---

# Phase 6 — Learning Analytics

Capabilities:

- preview analytics;
- download analytics;
- video-start events;
- video-completion events where available;
- resource engagement;
- programme resource utilization;
- learner engagement indicators;
- executive reporting.

Analytics must not become an access-control authority.

---

# Phase 7 — Intelligent Recommendations

Capabilities:

- entitlement-aware recommendations;
- capability-gap recommendations;
- assessment-informed resources;
- credential-informed resources;
- programme progression;
- AI-assisted learning pathways;
- next-best-resource suggestions.

Recommendations must remain governed and explainable.

---

# Phase 8 — Scheduled and Cohort Release

Capabilities:

- cohort-level resource publication;
- scheduled release;
- module-based unlock;
- facilitator-triggered release;
- expiry windows;
- event-based availability;
- programme-calendar integration.

The resolver remains the final access authority.

---

# Phase 9 — Managed Media Delivery

Capabilities:

- signed video playback;
- secure streaming;
- domain restrictions;
- expiring playback authorization;
- media analytics;
- protected commercial content;
- optional viewer watermarking.

This becomes a dedicated media capability rather than an extension of document upload.

---

# Phase 10 — Interactive Learning Assets

Capabilities:

- interactive laboratories;
- guided simulations;
- scenario exercises;
- AI tutors;
- agentic practice environments;
- adaptive content;
- experiential assessments;
- embedded feedback.

Interactive assets must use the same learner identity, entitlement and delivery governance principles.

---

# Phase 11 — Learning Resource Intelligence

Capabilities:

- content relationship graph;
- resource-to-capability mapping;
- resource-to-assessment mapping;
- resource-to-credential mapping;
- impact analysis;
- duplicate detection;
- lifecycle recommendations;
- automated governance diagnostics.

---

# Phase 12 — Enterprise and Partner Delivery

Capabilities:

- enterprise-specific libraries;
- organization-scoped resources;
- licensed partner distribution;
- trainer resource libraries;
- controlled co-branded materials;
- customer-specific delivery;
- multi-tenant resource governance.

Tenant boundaries must be explicit and enforced.

---

# Scalability Roadmap

The architecture is designed to grow from:

```text
Dozens of learners

↓

Hundreds of learners

↓

Thousands of learners

↓

Multiple programmes

↓

Enterprise customers

↓

Partner ecosystems
```

Scaling must preserve:

- stable Resource IDs;
- immutable versions;
- learner delivery ownership;
- protected Storage paths;
- resolver authority;
- audit history.

---

# Deferred Capabilities

The following are deliberately deferred unless needed:

- full Learning Management System replacement;
- complex SCORM delivery;
- public content marketplace;
- unrestricted user uploads;
- browser-based editing of master materials;
- custom video hosting;
- digital-rights-management software;
- multi-stage approval workflow;
- real-time collaborative content authoring.

Deferral prevents unnecessary complexity while preserving architectural extensibility.

---

# Architectural Decisions Summary

## ADR Alignment

The governing Architecture Decision Record is:

```text
ADR-019-Learning-Resource-Delivery-Architecture.md
```

This document provides the complete architecture implementing that decision.

---

# Decision 1 — First-Class Platform

The Learning Resource Platform is a first-class enterprise platform within Agile AI University.

It is not a collection of page-level download links.

---

# Decision 2 — Resource and Delivery Separation

The architecture separates:

```text
Learning Resource
from
Learning Resource Delivery
```

The resource defines educational intent.

The delivery defines learner access and ownership.

---

# Decision 3 — Authoritative Collections

The initial authoritative Firestore collections are:

```text
learning_resources
learning_resource_deliveries
```

---

# Decision 4 — Admin Authority

The Admin Portal is the sole authoritative operational publisher.

The Student Portal is a read-only consumer.

---

# Decision 5 — Resolver First

The Learning Resource Resolver determines visibility and actions before rendering.

The Student Portal does not independently decide entitlement, ownership or lifecycle.

---

# Decision 6 — Shared and Personalized Resources

The platform supports:

- shared resources;
- learner-specific personalized resources.

Both models coexist under one governed architecture.

---

# Decision 7 — Personalized Asset Identity

Every personalized licensed PDF is a unique learner asset.

It references:

- one learner;
- one Resource ID;
- one resource version;
- one Credential ID or licence identifier;
- one generated Storage object.

---

# Decision 8 — Credential ID Usage

The Credential ID may be used as:

- visible licence identifier;
- PDF watermark;
- learner-facing ownership reference;
- personalized filename component.

It does not replace the Resource ID or Delivery ID.

---

# Decision 9 — Naming Separation

The architecture distinguishes:

- Resource ID;
- Resource Version ID;
- Delivery ID;
- learner-facing title;
- download filename;
- Storage path.

Internal identifiers and Storage paths are never shown as learner-facing names.

---

# Decision 10 — Immutable Publication

Published resource versions and published binaries are immutable.

Corrections create new governed versions.

---

# Decision 11 — Protected Storage Domains

The approved Storage domains are:

```text
learning-resources/
learner-learning-assets/
master-learning-resources/
```

Each domain has a distinct ownership and access policy.

---

# Decision 12 — File-Size Limit

The maximum protected learning-resource file size is locked at:

```text
50 MiB
```

Equivalent to:

```text
52,428,800 bytes
```

---

# Decision 13 — Download Rights

Personalized licensed PDFs and approved supporting resources may be downloadable.

Download access remains authenticated, entitlement-aware and time-limited at issuance.

---

# Decision 14 — External Video

YouTube and Vimeo are governed external-video resource providers.

The platform stores normalized URLs and provider identifiers, not arbitrary iframe HTML.

---

# Decision 15 — Video Streaming

External video is streamed through the provider.

It is not uploaded into the protected document Storage domain and is not offered for download by the platform.

---

# Decision 16 — Security by Default

Protected learning resources require:

```text
Authentication
Authorization
Entitlement
Ownership
Publication
Availability
Delivery permission
```

Failure at any required layer denies access.

---

# Decision 17 — No Permanent Protected URLs

Permanent public URLs are prohibited for protected learning resources.

Access is brokered through short-lived or authenticated delivery mechanisms.

---

# Decision 18 — Production Governance

Changes follow a focused production workflow:

```text
Change
Commit
Deploy
Validate Live
Document Outcome
```

Architecture, contracts, rules and services must remain synchronized.

---

# Decision 19 — Future Media Domain

Highly protected video belongs to a future Managed Media Delivery capability.

It must not be implemented by weakening document-resource controls.

---

# Decision 20 — Future Intelligence

Future analytics, recommendations, adaptive learning and AI-assisted experiences must build on the existing Resource ID, Delivery ID, entitlement and ownership architecture.

They must not bypass it.

---

# Architecture Completion Statement

This architecture establishes a governed enterprise foundation for delivering learning resources throughout the Agile AI University learner lifecycle.

It supports the current operational requirements of:

- continuously released materials;
- personalized learner-licensed PDFs;
- downloadable supporting handouts;
- streamed YouTube and Vimeo videos;
- secure learner access;
- production-only implementation;
- future platform scalability.

The architecture preserves a clear separation between:

```text
Educational Intent

Master Intellectual Property

Published Resource Version

Learner Delivery

Protected Binary

Entitlement Decision

Learner Presentation
```

This separation enables Agile AI University to scale its learning experience without sacrificing governance, security, intellectual-property protection or learner trust.

---

# Document Governance

## Document Status

```text
ACTIVE
```

## Architecture Status

```text
LOCKED
```
---

# Related Architecture Decisions

The following Architecture Decision Records define authoritative governance for the Learning Resource Platform.

| ADR | Title | Status |
|------|-------|--------|
| ADR-019 | Learning Resource Delivery Architecture | ACCEPTED |
| ADR-020 | Governed Learning Resource Release Architecture | ACCEPTED |

## ADR-019

Defines the enterprise delivery architecture for protected learning resources, including:

- Admin Portal publication authority
- Protected Storage
- Firestore resource registry
- Immutable and versioned resource assets
- Backend-brokered preview and download delivery
- Student Portal consumption
- Storage security governance
- Prevention of direct learner access to protected Storage objects

## ADR-020

Defines the enterprise governance for learning resource availability throughout the learner lifecycle, including:

- Progressive release for active learners
- Immediate access for eligible alumni
- Session-aligned release of module-specific materials
- Module notes released shortly before the corresponding session begins
- Enterprise release policies
- Learning Resource Resolver responsibilities
- Separation of business rules from the UI
- Programme, cohort, module, session and completion-aware visibility
- Future extensibility for enterprise, subscription and self-paced learning

ADR-019 governs **how protected learning resources are delivered**.

ADR-020 governs **when and to whom learning resources become available**.

These Architecture Decision Records are authoritative and supplement this architecture specification.

---

## Change Authority

Material changes to this architecture require:

```text
Enterprise Architecture Review

and

Approved Architecture Decision Record
```

Implementation changes shall remain compliant with ADR-019 and ADR-020.

Changes to delivery security, protected download architecture, release policies, learner visibility rules or alumni access rules require architecture review before implementation.

---

## Next Required Documentation

The following documents should be completed or updated after this architecture specification:

```text
LearningService.md

FIRESTORE_COLLECTION_REFERENCE.md

Learning Resource Publication Runbook

Learning Resource Release and Scheduling Runbook

Protected Learning Resource Download Runbook

Personalized Material Generation Runbook
```

The following Architecture Decision Records are complete and authoritative:

```text
ADR-019-Learning-Resource-Delivery-Architecture.md

ADR-020-Governed-Learning-Resource-Release-Architecture.md
```

---

# End of Document