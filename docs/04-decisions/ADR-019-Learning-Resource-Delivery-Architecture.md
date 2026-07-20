# Agile AI University

# Architecture Decision Record

# ADR-019 — Learning Resource Delivery Architecture

---

# Document Information

| Attribute | Value |
|---|---|
| **ADR Number** | ADR-019 |
| **Title** | Learning Resource Delivery Architecture |
| **Version** | 1.0.0 |
| **Status** | ACCEPTED |
| **Decision Status** | LOCKED |
| **Decision Type** | Enterprise Architecture |
| **Domain** | Learning Resource Platform |
| **Owning Platform** | Agile AI University |
| **Decision Authority** | Founder and Enterprise Architect |
| **Date** | July 2026 |
| **Supersedes** | None |
| **Superseded By** | None |

---

# Decision Summary

Agile AI University will implement learning resources as a first-class enterprise platform based on a registry-driven, resolver-first and entitlement-aware delivery architecture.

The architecture separates:

```text
Learning Resource

from

Learning Resource Delivery
```

The authoritative resource catalogue will use:

```text
learning_resources
```

Learner access, ownership and delivery relationships will use:

```text
learning_resource_deliveries
```

The Admin Portal will remain the authoritative publisher.

The Student Portal will remain a read-only consumer of resolved learner-facing ViewModels.

Published resources and binaries will be immutable and versioned.

Protected resources will be delivered only after authentication, authorization, entitlement, ownership, lifecycle and delivery-policy validation.

---

# Context

Agile AI University delivers multiple types of educational resources throughout the learner lifecycle.

These include:

- licensed course materials;
- learner-specific personalized PDFs;
- supporting workbooks;
- handouts;
- reference guides;
- templates;
- external videos;
- external articles;
- official documentation;
- future interactive resources.

The platform must support continuous publication during active programmes without requiring application deployment for every new learning resource.

The platform must also support lifelong access where permitted, while protecting:

- university intellectual property;
- learner-specific licensed materials;
- programme entitlements;
- learner identity;
- publication integrity;
- delivery history;
- auditability.

A simple model based on public file links or page-specific download buttons would not provide sufficient governance, security or scalability.

A formal enterprise delivery architecture is therefore required.

---

# Problem Statement

The platform requires a consistent method to answer the following questions:

```text
What is the educational resource?

Which version is authoritative?

Where is its binary stored?

Is it shared or learner-specific?

Who is entitled to receive it?

Which learner owns a personalized delivery?

May it be previewed?

May it be downloaded?

May it be embedded?

Is it currently published?

Is it currently available?

Which Credential ID or licence reference applies?

How is access audited?
```

Without a governed architecture, these concerns may become mixed across:

- Firestore;
- Storage;
- Admin UI;
- Student UI;
- filenames;
- public URLs;
- programme logic;
- credential logic.

This would create security, maintenance and scalability risks.

---

# Decision Drivers

The decision is driven by the following requirements:

- governance before convenience;
- identity before delivery;
- entitlement before access;
- resolver before rendering;
- Admin Portal authority;
- Student Portal read-only consumption;
- immutable publication;
- intellectual-property protection;
- learner ownership;
- continuous resource release;
- production-safe operation;
- future enterprise scalability;
- future AI-assisted learning;
- future personalized material generation;
- future learning analytics;
- future enterprise and partner delivery.

---

# Decision

## Decision 1 — Learning Resource Platform

Learning resources will be implemented as a dedicated enterprise platform within Agile AI University.

The platform is not a collection of static download links.

It will have its own:

- domain model;
- registry;
- delivery model;
- resolver;
- services;
- security architecture;
- naming standard;
- versioning standard;
- operational governance.

---

## Decision 2 — Resource and Delivery Separation

The platform will separate the logical educational resource from its delivery to a learner.

```text
Learning Resource
→ defines educational intent and governed content

Learning Resource Delivery
→ defines learner access, ownership and delivery policy
```

A resource does not inherently belong to one learner.

A delivery establishes the governed relationship between a resource and a learner.

---

## Decision 3 — Authoritative Firestore Collections

The initial authoritative collections will be:

```text
learning_resources
learning_resource_deliveries
```

### `learning_resources`

Responsible for:

- resource identity;
- programme association;
- title and description;
- content classification;
- delivery type;
- personalization type;
- version;
- Storage path or external URL;
- publication state;
- audit metadata.

### `learning_resource_deliveries`

Responsible for:

- learner ownership;
- learner UID;
- programme and cohort relationship;
- resource-version reference;
- Credential ID or licence reference;
- personalized Storage path;
- preview permission;
- download permission;
- embed permission;
- availability window;
- delivery lifecycle;
- delivery audit metadata.

---

## Decision 4 — No Generic Assignment Collection

The platform will not use a generic `learning_resource_assignments` collection as its primary learner-access model.

The term `delivery` is selected because it represents:

- governed publication;
- learner ownership;
- delivery policy;
- lifecycle;
- version relationship;
- personalized asset identity;
- auditability.

---

## Decision 5 — Shared and Personalized Delivery

The platform will support two primary personalization modes:

```text
shared
learner_specific
```

### Shared

One governed binary may be delivered to many learners.

Examples:

- workbooks;
- handouts;
- reference guides;
- templates.

### Learner-Specific

One unique generated binary belongs to one learner.

Examples:

- licensed course packs;
- personalized workbooks;
- individual coaching reports;
- learner-specific assessment feedback.

Each learner-specific PDF is treated as an independent enterprise asset.

---

## Decision 6 — Admin Portal Authority

The Admin Portal is the authoritative operational publisher for learning resources.

Authorized administrators may:

- create drafts;
- upload files;
- register external resources;
- create versions;
- publish resources;
- generate personalized assets;
- create deliveries;
- withdraw resources;
- archive resources.

The Admin Portal UI does not replace backend authorization.

All authoritative operations must be validated by trusted services and security rules.

---

## Decision 7 — Student Portal Consumer Model

The Student Portal is a read-only consumer.

It may:

- display;
- preview;
- download;
- embed;
- open approved external resources.

It must not:

- upload;
- publish;
- assign;
- modify;
- withdraw;
- create signed access independently;
- determine ownership;
- determine entitlement;
- infer publication;
- select versions independently.

---

## Decision 8 — Resolver-First Architecture

All learner-visible resources must pass through the Learning Resource Resolver.

The resolver will validate:

```text
Authentication
Authorization
Entitlement
Learner ownership
Resource publication
Delivery publication
Active state
Availability window
Delivery permission
Resource consistency
```

The Student Portal will receive safe learner-facing ViewModels only.

No UI component may become the business authority.

---

## Decision 9 — Identity Before Delivery

Protected resources require an authenticated learner identity.

For learner-specific resources:

```text
delivery.learner_uid
must equal
authenticated user UID
```

Learner email, learner name or client-provided identity fields are not sufficient access authorities.

---

## Decision 10 — Entitlement Before Access

Resource ownership alone does not guarantee access.

The learner must also hold the required programme or platform entitlement where applicable.

The trusted entitlement resolver remains authoritative.

The Student Portal must not reproduce entitlement logic independently.

---

## Decision 11 — Credential ID as Licence Reference

The Credential ID may be used as the learner-visible licence reference for personalized materials.

It may appear in:

- PDF watermarks;
- learner-facing filenames;
- licensed-to labels;
- delivery metadata;
- audit records.

Example:

```text
AAU-AB12CD34
```

The Credential ID does not replace:

- Resource ID;
- Resource Version ID;
- Delivery ID.

---

## Decision 12 — Separate Identity Types

The architecture will maintain distinct identifiers.

```text
Resource ID
→ logical educational resource

Resource Version ID
→ immutable resource version

Delivery ID
→ learner delivery

Credential ID
→ visible learner licence or credential reference
```

These identities must not be merged.

---

## Decision 13 — Storage Domain Separation

The approved Storage domains are:

```text
learning-resources/
learner-learning-assets/
master-learning-resources/
```

### `learning-resources/`

Used for shared protected learner resources.

### `learner-learning-assets/`

Used for personalized learner-specific assets.

### `master-learning-resources/`

Used for Admin-only source assets.

Master assets must never be delivered directly to learners.

---

## Decision 14 — Canonical Storage Paths

Shared protected resources will use:

```text
learning-resources/
{PROGRAM_CODE}/
{RESOURCE_ID}/
v{VERSION}/
{SAFE_FILE_NAME}
```

Learner-specific resources will use:

```text
learner-learning-assets/
{LEARNER_UID}/
{PROGRAM_CODE}/
{RESOURCE_ID}/
v{VERSION}/
{LICENCE_OR_CREDENTIAL_ID}/
{LEARNER_FILE_NAME}
```

Master resources will use:

```text
master-learning-resources/
{PROGRAM_CODE}/
{RESOURCE_ID}/
v{VERSION}/
{SOURCE_FILE_NAME}
```

---

## Decision 15 — Protected File-Size Limit

The maximum protected learning-resource upload size is locked at:

```text
50 MiB
```

Equivalent to:

```text
52,428,800 bytes
```

The limit must remain synchronized across:

- resource contract;
- upload service;
- Storage Rules;
- backend validation;
- documentation.

---

## Decision 16 — Immutable Publication

Published resources and published binaries are immutable.

A published object must not be overwritten.

A material correction requires:

```text
New version

↓

New Storage path

↓

New validation

↓

New publication
```

Historical versions remain available for audit and governed delivery policy.

---

## Decision 17 — Versioning Model

Learning-resource versions will initially use integer versioning:

```text
v1
v2
v3
```

A stable Resource ID remains unchanged across versions.

A resource-version document ID should use:

```text
{RESOURCE_ID}_v{VERSION}
```

Example:

```text
AOP-CORE-COURSE-MATERIALS_v3
```

---

## Decision 18 — Explicit Version Reference

Every learner delivery must reference an explicit resource version.

The resolver must not silently substitute the latest version.

Version migration must be an intentional, governed and auditable operation.

---

## Decision 19 — No Permanent Public URLs

Protected learning resources must not use permanent unrestricted public URLs as the delivery model.

Firestore will store:

```text
storage_path
```

Protected access will be granted through:

- short-lived signed URLs;
- authenticated backend streaming;
- an equivalent protected mechanism.

---

## Decision 20 — Download Governance

Download permission is explicit.

The presence of a file does not imply download permission.

Delivery policy fields include:

```javascript
preview_allowed
download_allowed
embed_allowed
```

The trusted delivery service must validate every protected request.

---

## Decision 21 — Offline Learner Use

Approved personalized PDFs and supporting resources may be downloaded for legitimate offline use.

The platform will not attempt to remotely revoke a file already downloaded to a learner device.

Protection will rely on:

- identity-aware issuance;
- entitlement validation;
- personalized watermarking;
- licence reference;
- audit logging;
- intellectual-property terms.

---

## Decision 22 — External Video Governance

YouTube and Vimeo may be supported as governed external-video providers.

External videos will be stored as:

- approved provider;
- validated HTTPS URL;
- normalized video ID;
- canonical URL;
- delivery policy.

Administrator-provided iframe HTML will not be stored.

---

## Decision 23 — YouTube Privacy-Enhanced Embedding

YouTube playback should use the privacy-enhanced host where possible:

```text
youtube-nocookie.com
```

The trusted renderer will construct the embed URL.

The platform will not offer external-video downloads.

---

## Decision 24 — Public and Unlisted Video Model

The initial video model supports:

```text
Public
Unlisted
```

Unlisted video is recognized as moderate link privacy, not strong digital-rights protection.

Highly confidential video will require a future managed-media platform.

---

## Decision 25 — No Video Upload Shortcut

Large video files must not be uploaded into the protected learning-document bucket as an implementation shortcut.

Secure commercial video belongs to a future Managed Media Delivery capability.

---

## Decision 26 — Naming Separation

The architecture distinguishes:

- internal Resource ID;
- Resource Version ID;
- Delivery ID;
- learner-facing title;
- source filename;
- shared download filename;
- personalized download filename;
- Storage path.

Internal identifiers and paths must not be presented as learner-facing titles.

---

## Decision 27 — Centralized Naming Contract

Naming and path construction must be centralized in a Learning Resource Contract.

Individual pages or components must not invent naming patterns independently.

The contract should govern:

- Resource ID validation;
- version document IDs;
- shared filenames;
- personalized filenames;
- shared paths;
- learner-specific paths;
- master paths.

---

## Decision 28 — Publication and Delivery Separation

Publishing a resource does not automatically create learner access.

The architecture separates:

```text
Resource Publication
from
Learner Delivery Publication
```

This supports:

- programme-specific delivery;
- cohort-specific delivery;
- learner-specific delivery;
- delayed release;
- personalized generation;
- withdrawal.

---

## Decision 29 — Fail-Closed Security

Where a record is missing, malformed, inconsistent or uncertain, the platform must deny access.

Resolver failures must not expose protected content.

Examples:

```text
Missing resource
→ exclude delivery

Ownership mismatch
→ deny access

Entitlement failure
→ deny access

Withdrawn version
→ deny access

Invalid external URL
→ exclude resource
```

---

## Decision 30 — Auditability

Meaningful lifecycle and access events should be auditable.

Examples:

- resource created;
- asset uploaded;
- resource published;
- personalized PDF generated;
- delivery published;
- resource previewed;
- resource downloaded;
- video opened;
- resource withdrawn;
- unauthorized access attempted.

Audit logging must avoid unnecessary personal or content duplication.

---

# Considered Alternatives

## Alternative 1 — Public Firebase Download URLs

### Description

Store downloadable Firebase URLs directly in Firestore and display them in the Student Portal.

### Rejected Because

- links may remain usable outside authenticated sessions;
- learner ownership cannot be reliably revalidated;
- entitlement changes cannot be enforced;
- personalized resources may be redistributed easily;
- URL leakage becomes difficult to control;
- auditability is weakened.

---

## Alternative 2 — Store All Resources Directly in Student Portal Code

### Description

Hard-code resource links and metadata into HTML or JavaScript.

### Rejected Because

- each release requires application deployment;
- publication cannot be independently governed;
- resource history becomes difficult to audit;
- content and UI concerns become coupled;
- programme scalability is reduced;
- Admin operations are bypassed.

---

## Alternative 3 — One Collection for Resources and Learner Assignments

### Description

Store both logical resources and learner ownership in one Firestore collection.

### Rejected Because

- resource identity becomes duplicated;
- shared files become inefficient;
- learner-specific and shared models become confused;
- versioning becomes difficult;
- publication and delivery lifecycles become mixed;
- future cohort delivery becomes harder.

---

## Alternative 4 — Use Credential Records as Learning Resource Records

### Description

Attach all learning-resource metadata directly to credentials.

### Rejected Because

- credentials and educational resources are separate domains;
- one credential may relate to many resources;
- one resource may serve many credential holders;
- resource versions have independent lifecycle;
- Credential ID cannot replace Resource ID;
- credential governance would become overloaded.

---

## Alternative 5 — Upload One Personalized File and Share It

### Description

Generate one licensed PDF and distribute the same file to multiple learners.

### Rejected Because

- learner ownership is lost;
- licence traceability is lost;
- personalized watermarking is impossible;
- unauthorized redistribution cannot be traced;
- intellectual-property controls are weakened.

---

## Alternative 6 — Store Raw iframe HTML

### Description

Allow administrators to paste full iframe code into Firestore.

### Rejected Because

- arbitrary HTML may introduce security risks;
- script or tracking content may be inserted;
- provider restrictions become inconsistent;
- rendering becomes difficult to govern;
- sanitization requirements increase significantly.

---

## Alternative 7 — Upload Videos into Cloud Storage

### Description

Treat video as a large downloadable learning file.

### Rejected Because

- Cloud Storage document delivery is not a secure streaming platform;
- bandwidth costs may increase;
- playback controls are limited;
- signed streaming and media analytics are absent;
- content protection is inadequate;
- file-size governance would be weakened.

---

## Alternative 8 — Client-Side Entitlement Decisions

### Description

Allow the Student Portal to decide which resources to show using locally available data.

### Rejected Because

- UI logic is not a trustworthy security boundary;
- entitlement rules may diverge;
- business logic becomes duplicated;
- authorization failures may leak content;
- platform governance is weakened.

---

# Consequences

## Positive Consequences

The decision provides:

- clear domain ownership;
- scalable resource publication;
- protected learner delivery;
- support for shared and personalized resources;
- reliable versioning;
- continuous programme release;
- secure preview and download;
- future cohort delivery;
- future learning analytics;
- future AI-driven recommendations;
- future enterprise libraries;
- improved intellectual-property protection;
- stronger auditability;
- reduced page-level business logic.

---

## Negative Consequences

The architecture introduces additional implementation components:

- a delivery registry;
- resolver logic;
- protected access service;
- version-management workflow;
- personalized generation workflow;
- audit logging;
- operational runbooks.

This is accepted because the governance, security and scalability benefits outweigh the added implementation effort.

---

## Operational Consequences

Administrators must follow governed publication processes.

Published files cannot be casually replaced.

Corrections require new versions.

Learner access issues must be diagnosed through:

- resource registry;
- delivery registry;
- entitlement resolution;
- resolver diagnostics;
- Storage existence;
- lifecycle status.

---

# Security Consequences

The architecture reduces risk by:

- denying unauthenticated access;
- preventing learner writes;
- separating master assets;
- avoiding permanent public links;
- requiring ownership validation;
- requiring entitlement validation;
- normalizing external providers;
- rejecting arbitrary iframe HTML;
- failing closed.

The architecture does not claim to prevent a learner from redistributing a legitimately downloaded offline file.

Personalized watermarking and licence references provide governance and traceability rather than absolute digital-rights control.

---

# Implementation Principles

Implementation must preserve the following layer order:

```text
Authentication

↓

Authorization

↓

Entitlement Resolution

↓

Learning Resource Resolver

↓

Learning Resource Service

↓

Student Portal Renderer
```

No protected learner UI may appear before readiness.

---

# Initial Implementation Components

The platform should include:

```text
learning-resource-contract.js
learning-resource-storage.js
learning-resource-service.js
learning-resource-delivery-service.js
learning-resource-resolver.js
learning-resource-renderer.js
learning-resource-management.css
```

Exact filenames may vary where repository conventions require, but responsibilities must remain separated.

---

# Firestore Implementation

The initial collections are:

```text
learning_resources
learning_resource_deliveries
```

Learners receive no write access.

Authorized administrative writes must be governed through RBAC and trusted validation.

Published records must preserve lifecycle audit metadata.

---

# Storage Implementation

The approved Storage domains are:

```text
learning-resources/
learner-learning-assets/
master-learning-resources/
```

Storage Rules must enforce:

- authentication;
- administrative write authority;
- file-size restrictions;
- approved path structures;
- no learner writes;
- no public unrestricted reads;
- immutability where applicable.

---

# Resolver Implementation

The resolver must:

- accept trusted identity and entitlement context;
- retrieve applicable deliveries;
- resolve resource references;
- validate lifecycle;
- validate ownership;
- validate policy;
- filter inconsistent records;
- return safe ViewModels;
- fail closed.

It must not render HTML.

---

# Student Portal Implementation

The Student Portal must:

- wait for platform readiness;
- consume resolved ViewModels;
- show permitted actions only;
- use controlled preview;
- request authorized download;
- render safe external-video embeds;
- provide safe loading, empty and error states.

---

# Admin Portal Implementation

The Admin Portal must support:

- draft creation;
- upload;
- external URL registration;
- validation;
- preview;
- publication;
- delivery creation;
- learner-specific generation;
- withdrawal;
- versioning;
- audit review.

The Admin Portal remains the publisher.

---

# Migration Considerations

Existing learning-resource records should be reviewed and aligned with the new architecture.

Potential migration steps include:

```text
1. Identify existing resource records.

2. Normalize Resource IDs.

3. Normalize programme codes.

4. Separate learner-facing titles from filenames.

5. Confirm Storage paths.

6. Assign explicit versions.

7. Set publication lifecycle fields.

8. Create learner delivery records where required.

9. Remove permanent public-link dependence.

10. Validate Student Portal resolution.
```

Migration must avoid breaking currently valid learner access without a replacement delivery path.

---

# Rollout Strategy

The recommended rollout order is:

```text
1. Architecture and ADR approval

2. Resource contract

3. Firestore collection reference

4. Storage-path governance

5. Firestore and Storage Rules

6. Shared protected-resource publication

7. Learner delivery registry

8. Student resolver

9. Student renderer

10. Protected preview and download

11. External video

12. Personalized PDF generation

13. Audit and operational runbooks
```

---

# Production Validation

The minimum live validation flow is:

```text
Authorized administrator signs in

↓

Creates a resource draft

↓

Uploads a valid PDF

↓

Publishes the resource

↓

Creates a learner delivery

↓

Learner signs in

↓

Entitlement resolves

↓

Learning Resource Resolver runs

↓

Resource appears

↓

Preview succeeds

↓

Download succeeds

↓

Unauthorized learner access fails
```

External-video validation should additionally verify:

- supported URL acceptance;
- unsupported URL rejection;
- normalized provider;
- safe embed;
- no Download action.

---

# Compliance Rules

An implementation is compliant only when:

- Resource ID and Delivery ID remain separate;
- learners cannot write;
- protected URLs are not permanently public;
- resolver-first access is used;
- ownership and entitlement are validated;
- published assets are immutable;
- Storage domains are separated;
- personalized resources are learner-scoped;
- external HTML is not stored;
- the 50 MiB limit is enforced;
- the Admin Portal remains authoritative.

---

# Non-Compliance Conditions

The following are architectural violations:

- storing protected permanent public URLs;
- exposing raw Storage paths to learners;
- permitting learner uploads;
- overwriting a published binary;
- bypassing the delivery registry;
- rendering resources before entitlement readiness;
- using Credential ID as Resource ID;
- delivering master source files;
- allowing arbitrary iframe HTML;
- uploading protected commercial video as a document;
- relying on hidden buttons as authorization;
- using client-side checks as the sole security layer.

---

# Future Evolution

The architecture supports future capabilities including:

- cohort-level delivery;
- scheduled release;
- module unlocking;
- enterprise libraries;
- partner delivery;
- analytics;
- learning recommendations;
- adaptive learning;
- AI tutors;
- interactive labs;
- managed media streaming;
- learning-resource intelligence;
- capability mapping;
- credential-linked lifelong learning.

Future capabilities must preserve the existing identity, entitlement, Resource ID, Delivery ID and audit architecture.

---

# Decision Governance

This decision is:

```text
ACCEPTED
LOCKED
ACTIVE
```

Material changes require:

```text
Enterprise Architecture Review

and

A new or superseding Architecture Decision Record
```

Implementation refinements that preserve the decision may be documented through version updates to the architecture and service specifications.

---

# Related Documentation

The following documents are governed by or related to this ADR:

```text
docs/03-architecture/learning-resource/
learning-resource-architecture.md

docs/04-decisions/
ADR-019-Learning-Resource-Delivery-Architecture.md

LearningService.md

FIRESTORE_COLLECTION_REFERENCE.md

Storage Security Rules documentation

Learning Resource Publication Runbook

Personalized Material Generation Runbook
```

---

# Decision Outcome

Agile AI University will proceed with a governed Learning Resource Platform that:

- treats resources as enterprise assets;
- separates educational content from learner delivery;
- supports shared and personalized materials;
- preserves immutable versions;
- protects learner-specific assets;
- governs downloads;
- safely embeds external video;
- supports continuous publication;
- scales toward intelligent and lifelong learning.

---

# End of ADR-019