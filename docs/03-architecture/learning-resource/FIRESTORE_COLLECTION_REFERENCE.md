# Agile AI University

# Enterprise Firestore Collection Reference

# Learning Resource Platform

> **The authoritative Firestore schema reference for learning-resource registration, publication, ownership, delivery and learner access within Agile AI University.**

---

# Document Information

| Attribute | Value |
|---|---|
| **Document** | FIRESTORE_COLLECTION_REFERENCE.md |
| **Version** | 1.0.0 |
| **Status** | ACTIVE |
| **Architecture Status** | LOCKED |
| **Domain** | Learning Resource Platform |
| **Database** | Cloud Firestore |
| **Owning Platform** | Agile AI University |
| **Related ADR** | ADR-019 — Learning Resource Delivery Architecture |
| **Last Updated** | July 2026 |

---

# Purpose

This document defines the authoritative Firestore schema for the Learning Resource Platform.

It governs:

- collection names;
- document identities;
- field names;
- field types;
- required and optional fields;
- enumerations;
- lifecycle states;
- ownership relationships;
- publication state;
- version relationships;
- delivery permissions;
- availability windows;
- audit metadata;
- resolver queries;
- index requirements;
- validation expectations.

All implementations must conform to this reference.

---

# Scope

This document governs the following collections:

```text
learning_resources

learning_resource_deliveries
```

It also identifies recommended future supporting collections, but those are not part of the initial locked MVP contract unless explicitly activated.

---

# Core Architecture

```text
learning_resources

↓

Defines the governed educational resource and version

↓

learning_resource_deliveries

↓

Defines learner ownership, eligibility and delivery policy

↓

Learning Resource Resolver

↓

LearningService

↓

Student Portal
```

---

# Collection Ownership

| Collection | Authoritative Writer | Learner Access | Purpose |
|---|---|---|---|
| `learning_resources` | Authorized Admin or trusted service | Read only through governed resolution | Resource registry |
| `learning_resource_deliveries` | Authorized Admin or trusted service | Read only through governed resolution | Learner delivery registry |

The Student Portal must not write to either collection.

---

# Shared Schema Conventions

## Field Naming

Firestore fields use:

```text
lower_snake_case
```

Examples:

```text
resource_id
program_code
created_at
download_allowed
```

JavaScript ViewModels may use:

```text
lowerCamelCase
```

Example:

```javascript
resourceId
programCode
createdAt
downloadAllowed
```

The persistence schema and ViewModel schema are intentionally distinct.

---

# Timestamp Type

All lifecycle timestamps must use Firestore Timestamp values.

Do not store timestamps as display strings.

Valid:

```javascript
published_at:
    Timestamp
```

Invalid:

```javascript
published_at:
    "19 July 2026"
```

---

# Null Handling

Optional values may be:

- absent; or
- explicitly `null` where the contract requires stable keys.

Empty strings should not be used as substitutes for missing values.

Invalid:

```javascript
external_url:
    ""
```

Preferred:

```javascript
external_url:
    null
```

or omit the field.

---

# Boolean Handling

Permission and lifecycle flags must use Boolean values.

Valid:

```javascript
download_allowed:
    true
```

Invalid:

```javascript
download_allowed:
    "yes"
```

---

# Identifier Handling

Identifiers must be stored as strings.

Examples:

```javascript
resource_id:
    "AOP-CORE-COURSE-MATERIALS"

delivery_id:
    "AAU-MAT-K7P4X9Q2"

credential_id:
    "AAU-AB12CD34"
```

---

# Collection: learning_resources

## Purpose

The `learning_resources` collection is the authoritative registry of logical educational resources and their immutable versions.

Each document represents exactly one version of one logical resource.

---

# Document Identity

Recommended document ID:

```text
{RESOURCE_ID}_v{VERSION}
```

Example:

```text
AOP-CORE-COURSE-MATERIALS_v1
```

Example:

```text
AOP-CORE-COURSE-MATERIALS_v3
```

The document ID must remain deterministic and immutable.

---

# Logical Resource Identity

The logical resource identity is:

```text
resource_id
```

Example:

```text
AOP-CORE-COURSE-MATERIALS
```

The Resource ID remains stable across versions.

---

# Resource Document Example

```javascript
{
    resource_id:
        "AOP-CORE-COURSE-MATERIALS",

    resource_document_id:
        "AOP-CORE-COURSE-MATERIALS_v3",

    program_code:
        "AOP",

    title:
        "AOP — Core Course Materials",

    short_title:
        "Core Course Materials",

    description:
        "Licensed course materials for the complete AOP programme.",

    content_type:
        "licensed_course_material",

    resource_category:
        "licensed_course_materials",

    module_code:
        null,

    module_title:
        "Complete Programme",

    version:
        3,

    version_label:
        "2026 Edition",

    delivery_type:
        "protected_storage",

    personalisation_type:
        "learner_specific",

    storage_domain:
        "master_learning_resources",

    storage_path:
        "master-learning-resources/AOP/AOP-CORE-COURSE-MATERIALS/v3/AOP-CORE-COURSE-MATERIALS-Master-v3.pptx",

    source_file_name:
        "AOP-CORE-COURSE-MATERIALS-Master-v3.pptx",

    mime_type:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    file_size_bytes:
        18472960,

    sha256:
        "SHA256_HASH_VALUE",

    preview_allowed:
        false,

    download_allowed:
        false,

    embed_allowed:
        false,

    status:
        "published",

    is_active:
        true,

    is_latest:
        true,

    published_at:
        Timestamp,

    published_by_uid:
        "ADMIN_UID",

    created_at:
        Timestamp,

    created_by_uid:
        "ADMIN_UID",

    updated_at:
        Timestamp,

    updated_by_uid:
        "ADMIN_UID"
}
```

---

# Resource Field Reference

## Identity Fields

| Field | Type | Required | Immutable | Description |
|---|---|---:|---:|---|
| `resource_id` | string | Yes | Yes | Stable logical resource identity |
| `resource_document_id` | string | Yes | Yes | Resource ID plus explicit version |
| `program_code` | string | Yes | Yes after publication | Authoritative programme code |
| `version` | number | Yes | Yes | Integer resource version |
| `version_label` | string | No | No before publication | Learner-facing edition or release label |

---

## Learner-Facing Metadata

| Field | Type | Required | Description |
|---|---|---:|---|
| `title` | string | Yes | Full learner-facing title |
| `short_title` | string | No | Compact learner-facing name |
| `description` | string | No | Learner-facing description |
| `module_code` | string or null | No | Stable programme module code |
| `module_title` | string or null | No | Learner-facing module name |
| `display_order` | number | No | Resource ordering within category |
| `module_order` | number | No | Module ordering |
| `language_code` | string | No | ISO-style language code |
| `duration_seconds` | number | No | External-video duration |
| `captions_available` | boolean | No | Whether captions are available |
| `transcript_available` | boolean | No | Whether a transcript is available |

---

## Classification Fields

### `content_type`

Required enumeration:

```text
licensed_course_material
supporting_workbook
handout
reference_guide
template
checklist
programme_handbook
case_study
assessment_guide
external_video
external_link
other_document
```

### `resource_category`

Recommended enumeration:

```text
licensed_course_materials
supporting_materials
videos
references
assessments
templates
other
```

### `delivery_type`

Required enumeration:

```text
protected_storage
external_video
external_link
future_interactive
```

### `personalisation_type`

Required enumeration:

```text
shared
learner_specific
none
```

Guidance:

- `shared` — one binary is reusable across learners;
- `learner_specific` — each learner receives a unique binary;
- `none` — external resources without personalized binaries.

---

# Storage Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `storage_domain` | string | Conditional | Logical Storage area |
| `storage_path` | string | Conditional | Governed Storage object path |
| `source_file_name` | string | Conditional | Administrative source filename |
| `mime_type` | string | Conditional | MIME type |
| `file_size_bytes` | number | Conditional | Exact byte size |
| `sha256` | string | Recommended | Cryptographic file hash |

### `storage_domain` Enumeration

```text
learning_resources
learner_learning_assets
master_learning_resources
external
```

For external resources:

```javascript
storage_domain:
    "external"
```

and:

```javascript
storage_path:
    null
```

---

# External Resource Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `external_provider` | string | For external video | Normalized provider |
| `external_url` | string | For external resource | Canonical HTTPS URL |
| `external_video_id` | string | For external video | Normalized provider video ID |
| `external_host` | string | Recommended | Validated hostname |

### `external_provider` Enumeration

```text
youtube
vimeo
official_web
other_approved
```

The initial video providers are:

```text
youtube
vimeo
```

---

# Permission Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `preview_allowed` | boolean | Yes | Whether preview may be issued |
| `download_allowed` | boolean | Yes | Whether download may be issued |
| `embed_allowed` | boolean | Yes | Whether embedded rendering is permitted |

Recommended combinations:

### Protected PDF

```javascript
preview_allowed:
    true

download_allowed:
    true

embed_allowed:
    false
```

### External Video

```javascript
preview_allowed:
    true

download_allowed:
    false

embed_allowed:
    true
```

### External Link

```javascript
preview_allowed:
    false

download_allowed:
    false

embed_allowed:
    false
```

### Master Resource

```javascript
preview_allowed:
    false

download_allowed:
    false

embed_allowed:
    false
```

---

# Resource Lifecycle Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `status` | string | Yes | Current lifecycle state |
| `is_active` | boolean | Yes | Active operational state |
| `is_latest` | boolean | Yes | Latest version marker |
| `available_from` | Timestamp or null | No | Earliest availability |
| `available_until` | Timestamp or null | No | Final availability |

### Resource Status Enumeration

```text
draft
uploaded
published
withdrawn
archived
```

---

# Resource Lifecycle Rules

## Draft

```javascript
status:
    "draft"

is_active:
    false

is_latest:
    false
```

Learner access:

```text
Denied
```

---

## Uploaded

```javascript
status:
    "uploaded"

is_active:
    false

is_latest:
    false
```

Meaning:

- file or URL exists;
- publication validation is incomplete;
- resource remains Admin-only.

---

## Published

```javascript
status:
    "published"

is_active:
    true
```

`is_latest` may be:

```javascript
true
```

or:

```javascript
false
```

depending on version position.

---

## Withdrawn

```javascript
status:
    "withdrawn"

is_active:
    false

is_latest:
    false
```

Learner resolution must exclude it.

---

## Archived

```javascript
status:
    "archived"

is_active:
    false

is_latest:
    false
```

Used for retained historical records.

---

# Version Relationship Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `supersedes_resource_document_id` | string or null | No | Previous version |
| `superseded_by_resource_document_id` | string or null | No | Newer replacement |
| `master_resource_id` | string or null | No | Source master identity |
| `master_version` | number or null | No | Source master version |
| `watermark_template_version` | number or null | No | Watermark-template version |

---

# Resource Audit Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `created_at` | Timestamp | Yes | Creation timestamp |
| `created_by_uid` | string | Yes | Creating administrator |
| `updated_at` | Timestamp | Yes | Last governed update |
| `updated_by_uid` | string | Yes | Last updating administrator |
| `uploaded_at` | Timestamp | Conditional | Upload timestamp |
| `uploaded_by_uid` | string | Conditional | Uploading administrator |
| `published_at` | Timestamp | Conditional | Publication timestamp |
| `published_by_uid` | string | Conditional | Publishing administrator |
| `withdrawn_at` | Timestamp | Conditional | Withdrawal timestamp |
| `withdrawn_by_uid` | string | Conditional | Withdrawing administrator |
| `withdrawal_reason` | string | Conditional | Reason for withdrawal |
| `archived_at` | Timestamp | Conditional | Archive timestamp |
| `archived_by_uid` | string | Conditional | Archiving administrator |

---

# Resource Validation Rules

A resource cannot be published unless:

```text
resource_id is valid

resource_document_id matches resource_id and version

program_code is valid

title is present

content_type is supported

resource_category is supported

delivery_type is supported

personalisation_type is supported

permission fields are Boolean

required Storage or external fields are present

file size is at or below 52,428,800 bytes

MIME type is supported

published audit fields are present
```

---

# Protected Storage Resource Validation

Where:

```javascript
delivery_type:
    "protected_storage"
```

Required:

```text
storage_domain
storage_path
mime_type
file_size_bytes
```

Also required:

```text
file_size_bytes <= 52,428,800
```

---

# External Video Validation

Where:

```javascript
delivery_type:
    "external_video"
```

Required:

```text
external_provider
external_url
external_video_id
```

Required permission model:

```javascript
embed_allowed:
    true

download_allowed:
    false
```

The URL must use HTTPS and an approved hostname.

---

# External Link Validation

Where:

```javascript
delivery_type:
    "external_link"
```

Required:

```text
external_url
external_host
```

The URL must use HTTPS.

---

# Latest-Version Rule

For each logical `resource_id`, only one active published document may have:

```javascript
is_latest:
    true
```

Example:

```text
AOP-CORE-COURSE-MATERIALS_v1
is_latest = false

AOP-CORE-COURSE-MATERIALS_v2
is_latest = false

AOP-CORE-COURSE-MATERIALS_v3
is_latest = true
```

---

# Resource Example — Shared Workbook

```javascript
{
    resource_id:
        "AOP-M03-SYSTEMS-THINKING-WORKBOOK",

    resource_document_id:
        "AOP-M03-SYSTEMS-THINKING-WORKBOOK_v1",

    program_code:
        "AOP",

    title:
        "AOP — Systems Thinking Workbook",

    short_title:
        "Systems Thinking Workbook",

    description:
        "Supporting workbook for Module 3.",

    content_type:
        "supporting_workbook",

    resource_category:
        "supporting_materials",

    module_code:
        "M03",

    module_title:
        "Systems Thinking",

    module_order:
        3,

    display_order:
        10,

    version:
        1,

    delivery_type:
        "protected_storage",

    personalisation_type:
        "shared",

    storage_domain:
        "learning_resources",

    storage_path:
        "learning-resources/AOP/AOP-M03-SYSTEMS-THINKING-WORKBOOK/v1/AOP-Systems-Thinking-Workbook-v1.pdf",

    source_file_name:
        "AOP-Systems-Thinking-Workbook-v1.pdf",

    mime_type:
        "application/pdf",

    file_size_bytes:
        8273920,

    sha256:
        "SHA256_HASH_VALUE",

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

    created_at:
        Timestamp,

    created_by_uid:
        "ADMIN_UID",

    updated_at:
        Timestamp,

    updated_by_uid:
        "ADMIN_UID",

    uploaded_at:
        Timestamp,

    uploaded_by_uid:
        "ADMIN_UID",

    published_at:
        Timestamp,

    published_by_uid:
        "ADMIN_UID"
}
```

---

# Resource Example — YouTube Video

```javascript
{
    resource_id:
        "AOP-M05-AGILE-AI-ETHICS-SESSION",

    resource_document_id:
        "AOP-M05-AGILE-AI-ETHICS-SESSION_v1",

    program_code:
        "AOP",

    title:
        "AOP — Agile AI Ethics Session",

    short_title:
        "Agile AI Ethics Session",

    description:
        "Programme session covering ethics, trust and responsible Agile AI delivery.",

    content_type:
        "external_video",

    resource_category:
        "videos",

    module_code:
        "M05",

    module_title:
        "Ethics and Trust",

    module_order:
        5,

    display_order:
        10,

    version:
        1,

    delivery_type:
        "external_video",

    personalisation_type:
        "none",

    storage_domain:
        "external",

    storage_path:
        null,

    external_provider:
        "youtube",

    external_video_id:
        "VIDEO_ID",

    external_url:
        "https://www.youtube.com/watch?v=VIDEO_ID",

    external_host:
        "www.youtube.com",

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

    created_at:
        Timestamp,

    created_by_uid:
        "ADMIN_UID",

    updated_at:
        Timestamp,

    updated_by_uid:
        "ADMIN_UID",

    published_at:
        Timestamp,

    published_by_uid:
        "ADMIN_UID"
}
```

---

# Collection: learning_resource_deliveries

## Purpose

The `learning_resource_deliveries` collection is the authoritative learner-delivery registry.

Each document defines one governed relationship between:

```text
Learner

Resource Version

Programme or Cohort Context

Ownership or Entitlement

Delivery Policy
```

---

# Delivery Document Identity

Recommended Delivery ID:

```text
AAU-MAT-{RANDOM_UPPERCASE_ALPHANUMERIC}
```

Example:

```text
AAU-MAT-K7P4X9Q2
```

The Firestore document ID should equal:

```text
delivery_id
```

---

# Delivery Identity Rules

The Delivery ID must:

- be globally unique;
- contain no personal information;
- contain no email address;
- contain no learner name;
- remain stable;
- never be reused;
- remain separate from Resource ID and Credential ID.

---

# Personalized Delivery Example

```javascript
{
    delivery_id:
        "AAU-MAT-K7P4X9Q2",

    learner_uid:
        "LEARNER_UID",

    program_code:
        "AOP",

    cohort_id:
        "AOP-2026-FOUNDING",

    credential_id:
        "AAU-AB12CD34",

    licence_id:
        "AAU-AB12CD34",

    resource_id:
        "AOP-CORE-COURSE-MATERIALS",

    resource_document_id:
        "AOP-CORE-COURSE-MATERIALS_v3",

    resource_version:
        3,

    delivery_scope:
        "individual",

    delivery_type:
        "protected_storage",

    personalisation_type:
        "learner_specific",

    learner_file_name:
        "AOP-Core-Course-Materials-v3-AAU-AB12CD34.pdf",

    storage_domain:
        "learner_learning_assets",

    storage_path:
        "learner-learning-assets/LEARNER_UID/AOP/AOP-CORE-COURSE-MATERIALS/v3/AAU-AB12CD34/AOP-Core-Course-Materials-v3-AAU-AB12CD34.pdf",

    mime_type:
        "application/pdf",

    file_size_bytes:
        48203492,

    sha256:
        "SHA256_HASH_VALUE",

    watermark_applied:
        true,

    watermark_credential_id:
        "AAU-AB12CD34",

    watermark_template_version:
        2,

    preview_allowed:
        true,

    download_allowed:
        true,

    embed_allowed:
        false,

    available_from:
        Timestamp,

    available_until:
        null,

    status:
        "published",

    is_active:
        true,

    generated_at:
        Timestamp,

    generated_by_uid:
        "ADMIN_UID",

    published_at:
        Timestamp,

    published_by_uid:
        "ADMIN_UID",

    created_at:
        Timestamp,

    created_by_uid:
        "ADMIN_UID",

    updated_at:
        Timestamp,

    updated_by_uid:
        "ADMIN_UID"
}
```

---

# Shared Delivery Example

```javascript
{
    delivery_id:
        "AAU-MAT-R4J8W2N6",

    learner_uid:
        "LEARNER_UID",

    program_code:
        "AOP",

    cohort_id:
        "AOP-2026-FOUNDING",

    credential_id:
        "AAU-AB12CD34",

    licence_id:
        null,

    resource_id:
        "AOP-M03-SYSTEMS-THINKING-WORKBOOK",

    resource_document_id:
        "AOP-M03-SYSTEMS-THINKING-WORKBOOK_v1",

    resource_version:
        1,

    delivery_scope:
        "individual",

    delivery_type:
        "protected_storage",

    personalisation_type:
        "shared",

    learner_file_name:
        "AOP-Systems-Thinking-Workbook-v1.pdf",

    storage_domain:
        "learning_resources",

    storage_path:
        null,

    preview_allowed:
        true,

    download_allowed:
        true,

    embed_allowed:
        false,

    available_from:
        Timestamp,

    available_until:
        null,

    status:
        "published",

    is_active:
        true,

    published_at:
        Timestamp,

    published_by_uid:
        "ADMIN_UID",

    created_at:
        Timestamp,

    created_by_uid:
        "ADMIN_UID",

    updated_at:
        Timestamp,

    updated_by_uid:
        "ADMIN_UID"
}
```

For shared resources, the authoritative binary path remains on the referenced resource document.

The delivery does not need to duplicate the shared Storage path.

---

# External Video Delivery Example

```javascript
{
    delivery_id:
        "AAU-MAT-Y8H2P5C7",

    learner_uid:
        "LEARNER_UID",

    program_code:
        "AOP",

    cohort_id:
        "AOP-2026-FOUNDING",

    credential_id:
        "AAU-AB12CD34",

    licence_id:
        null,

    resource_id:
        "AOP-M05-AGILE-AI-ETHICS-SESSION",

    resource_document_id:
        "AOP-M05-AGILE-AI-ETHICS-SESSION_v1",

    resource_version:
        1,

    delivery_scope:
        "individual",

    delivery_type:
        "external_video",

    personalisation_type:
        "none",

    learner_file_name:
        null,

    storage_domain:
        "external",

    storage_path:
        null,

    preview_allowed:
        true,

    download_allowed:
        false,

    embed_allowed:
        true,

    available_from:
        Timestamp,

    available_until:
        null,

    status:
        "published",

    is_active:
        true,

    published_at:
        Timestamp,

    published_by_uid:
        "ADMIN_UID",

    created_at:
        Timestamp,

    created_by_uid:
        "ADMIN_UID",

    updated_at:
        Timestamp,

    updated_by_uid:
        "ADMIN_UID"
}
```

---

# Delivery Field Reference

## Delivery Identity Fields

| Field | Type | Required | Immutable | Description |
|---|---|---:|---:|---|
| `delivery_id` | string | Yes | Yes | Unique delivery identity |
| `learner_uid` | string | Yes | Yes after publication | Authenticated learner owner |
| `program_code` | string | Yes | Yes after publication | Programme context |
| `cohort_id` | string or null | No | No before publication | Cohort context |
| `credential_id` | string or null | Conditional | Yes after publication | Learner-visible credential reference |
| `licence_id` | string or null | Conditional | Yes after publication | Visible licence identity |

---

# Resource Reference Fields

| Field | Type | Required | Immutable | Description |
|---|---|---:|---:|---|
| `resource_id` | string | Yes | Yes | Logical resource identity |
| `resource_document_id` | string | Yes | Yes | Explicit version document |
| `resource_version` | number | Yes | Yes | Explicit resource version |

The following must remain consistent:

```text
resource_document_id
=
resource_id + "_v" + resource_version
```

---

# Delivery Classification Fields

### `delivery_scope`

Initial required value:

```text
individual
```

Future supported values:

```text
individual
cohort
programme
organization
```

The MVP resolver operates on individual learner deliveries.

### `delivery_type`

Must match the referenced resource.

Enumeration:

```text
protected_storage
external_video
external_link
future_interactive
```

### `personalisation_type`

Must match the referenced resource.

Enumeration:

```text
shared
learner_specific
none
```

---

# Learner Asset Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `learner_file_name` | string or null | Conditional | Approved learner-facing filename |
| `storage_domain` | string | Yes | Asset domain |
| `storage_path` | string or null | Conditional | Personalized Storage path |
| `mime_type` | string or null | Conditional | Personalized MIME type |
| `file_size_bytes` | number or null | Conditional | Exact asset size |
| `sha256` | string or null | Recommended | Generated file hash |

For shared delivery:

```javascript
storage_path:
    null
```

The resource document supplies the path.

For learner-specific delivery:

```javascript
storage_path:
    "learner-learning-assets/..."
```

is required.

---

# Watermark Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `watermark_applied` | boolean | For learner-specific protected PDF | Whether watermarking succeeded |
| `watermark_credential_id` | string or null | Conditional | Visible watermark identity |
| `watermark_template_version` | number or null | Conditional | Watermark design version |

A learner-specific licensed PDF must not be published unless:

```javascript
watermark_applied:
    true
```

where watermarking is mandated by resource policy.

---

# Delivery Permission Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `preview_allowed` | boolean | Yes | Learner preview permission |
| `download_allowed` | boolean | Yes | Learner download permission |
| `embed_allowed` | boolean | Yes | Learner embed permission |

The delivery policy may restrict permissions further than the resource policy.

The effective permission must be the intersection of resource and delivery policy.

Example:

```text
Resource allows download
but
Delivery denies download

↓

Effective download permission = denied
```

A delivery must never expand access beyond the resource policy.

---

# Availability Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `available_from` | Timestamp or null | No | Access start |
| `available_until` | Timestamp or null | No | Access end |

Resolution rules:

```text
If available_from exists:
current time must be at or after available_from

If available_until exists:
current time must be before available_until
```

---

# Delivery Lifecycle Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `status` | string | Yes | Delivery lifecycle |
| `is_active` | boolean | Yes | Operational access state |

### Delivery Status Enumeration

```text
draft
generated
published
suspended
withdrawn
archived
```

---

# Delivery Lifecycle Rules

## Draft

```javascript
status:
    "draft"

is_active:
    false
```

No learner access.

---

## Generated

```javascript
status:
    "generated"

is_active:
    false
```

Used where a personalized binary exists but has not yet been published.

---

## Published

```javascript
status:
    "published"

is_active:
    true
```

Eligible for resolver evaluation.

---

## Suspended

```javascript
status:
    "suspended"

is_active:
    false
```

Temporarily unavailable without destroying the delivery.

---

## Withdrawn

```javascript
status:
    "withdrawn"

is_active:
    false
```

Removed from learner access.

---

## Archived

```javascript
status:
    "archived"

is_active:
    false
```

Retained for audit.

---

# Delivery Audit Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `created_at` | Timestamp | Yes | Delivery creation |
| `created_by_uid` | string | Yes | Creating administrator |
| `updated_at` | Timestamp | Yes | Last update |
| `updated_by_uid` | string | Yes | Last updater |
| `generated_at` | Timestamp | Conditional | Asset generation |
| `generated_by_uid` | string | Conditional | Generator authority |
| `published_at` | Timestamp | Conditional | Delivery publication |
| `published_by_uid` | string | Conditional | Publishing authority |
| `suspended_at` | Timestamp | Conditional | Suspension timestamp |
| `suspended_by_uid` | string | Conditional | Suspension authority |
| `suspension_reason` | string | Conditional | Suspension reason |
| `withdrawn_at` | Timestamp | Conditional | Withdrawal timestamp |
| `withdrawn_by_uid` | string | Conditional | Withdrawal authority |
| `withdrawal_reason` | string | Conditional | Withdrawal reason |
| `archived_at` | Timestamp | Conditional | Archive timestamp |
| `archived_by_uid` | string | Conditional | Archive authority |

---

# Personalized Delivery Validation

A learner-specific protected delivery cannot be published unless:

```text
learner_uid is present

resource_id is present

resource_document_id is present

resource_version is present

credential_id or licence_id is present

learner_file_name is present

storage_domain = learner_learning_assets

storage_path is learner-scoped

mime_type is present

file_size_bytes is valid

watermark policy is satisfied

status publication audit fields are present
```

---

# Learner Storage Ownership Validation

The personalized Storage path must begin with:

```text
learner-learning-assets/{learner_uid}/
```

Example:

```text
learner-learning-assets/LEARNER_UID/AOP/...
```

A delivery whose path does not match its `learner_uid` is invalid and must be excluded.

---

# Shared Delivery Validation

A shared delivery must:

```text
reference a published resource

use personalisation_type = shared

not define a learner-specific Storage path

not override the shared resource binary

remain learner-specific at the delivery relationship level
```

---

# External Delivery Validation

An external-video delivery must:

```javascript
delivery_type:
    "external_video"

personalisation_type:
    "none"

download_allowed:
    false

embed_allowed:
    true
```

An external-link delivery must not provide a file path.

---

# Effective Permission Resolution

The resolver calculates effective permissions using both records.

Example:

```javascript
effectivePreviewAllowed =
    resource.preview_allowed === true &&
    delivery.preview_allowed === true;

effectiveDownloadAllowed =
    resource.download_allowed === true &&
    delivery.download_allowed === true;

effectiveEmbedAllowed =
    resource.embed_allowed === true &&
    delivery.embed_allowed === true;
```

For protected access, all relevant security conditions must also pass.

---

# Resource and Delivery Consistency Rules

The resolver must verify:

```text
delivery.resource_id
matches
resource.resource_id
```

```text
delivery.resource_document_id
matches
resource.resource_document_id
```

```text
delivery.resource_version
matches
resource.version
```

```text
delivery.program_code
matches
resource.program_code
```

```text
delivery.delivery_type
matches
resource.delivery_type
```

```text
delivery.personalisation_type
matches
resource.personalisation_type
```

Any mismatch causes fail-closed exclusion.

---

# Resolver Query Model

The primary learner delivery query is:

```javascript
where(
    "learner_uid",
    "==",
    authenticatedUid
)
```

combined with:

```javascript
where(
    "status",
    "==",
    "published"
)
```

and:

```javascript
where(
    "is_active",
    "==",
    true
)
```

The resolver then joins each delivery to its explicit resource-version document.

---

# Required Composite Indexes

## Delivery Index 1

```text
Collection:
learning_resource_deliveries

Fields:
learner_uid ASC
status ASC
is_active ASC
```

---

## Delivery Index 2

```text
Collection:
learning_resource_deliveries

Fields:
learner_uid ASC
program_code ASC
status ASC
is_active ASC
```

---

## Delivery Index 3

```text
Collection:
learning_resource_deliveries

Fields:
learner_uid ASC
available_from ASC
status ASC
```

Use only where availability querying is performed directly rather than filtered after retrieval.

---

## Resource Index 1

```text
Collection:
learning_resources

Fields:
resource_id ASC
status ASC
is_active ASC
is_latest DESC
```

---

## Resource Index 2

```text
Collection:
learning_resources

Fields:
program_code ASC
status ASC
is_active ASC
resource_category ASC
display_order ASC
```

Primarily useful for Admin Portal catalogue views.

---

# Firestore Security Principles

Learner access must be read-only and ownership-aware.

However, direct Firestore reads from the Student Portal should remain minimal and must not replace resolver logic.

The preferred model is:

```text
Student Portal

↓

Learning Resource Resolver

↓

Governed Firestore Access
```

---

# Learner Rule Expectations

At minimum, learner reads of delivery records require:

```text
request.auth != null

resource.data.learner_uid == request.auth.uid

resource.data.status == "published"

resource.data.is_active == true
```

Learners must not write.

---

# Resource Rule Expectations

A learner must not gain access to an unpublished resource through a valid-looking delivery.

Resource reads must require:

```text
status == published

is_active == true
```

and ownership or trusted resolver context where applicable.

---

# Admin Rule Expectations

Admin writes require authoritative RBAC.

A hidden Admin UI element is not sufficient authorization.

Admin write operations must validate:

- required fields;
- lifecycle transitions;
- ownership;
- version immutability;
- path governance;
- size governance.

---

# Immutability Rules

For a published resource, the following must not change:

```text
resource_id
resource_document_id
program_code
version
delivery_type
personalisation_type
storage_domain
storage_path
mime_type
file_size_bytes
sha256
external_provider
external_video_id
```

For a published delivery, the following must not change:

```text
delivery_id
learner_uid
resource_id
resource_document_id
resource_version
program_code
credential_id
licence_id
personalisation_type
storage_domain
storage_path
sha256
```

A corrected delivery should normally be withdrawn and replaced.

---

# Allowed Lifecycle Transitions

## Resource

```text
draft
→ uploaded
→ published
→ withdrawn
→ archived
```

Permitted simplified flow:

```text
draft
→ published
```

where validation and upload are completed atomically.

A withdrawn version may not silently return to published state without an audited reactivation policy.

---

## Delivery

```text
draft
→ generated
→ published
→ suspended
→ published
```

or:

```text
published
→ withdrawn
→ archived
```

Reactivation from suspended state must record audit details.

---

# Hard Deletion Policy

Published resources and deliveries should not be hard-deleted through normal Admin UI workflows.

Preferred operations:

```text
withdraw
archive
```

Hard deletion may be reserved for:

- invalid draft records;
- test data;
- legal deletion requirements;
- controlled platform repair.

Deletion requires elevated operational authority.

---

# File-Size Rule

The maximum protected binary size is:

```text
52,428,800 bytes
```

Equivalent to:

```text
50 MiB
```

Validation must use exact bytes.

---

# MIME-Type Governance

Initial supported learner protected type:

```text
application/pdf
```

Master resources may additionally use approved source types such as:

```text
application/vnd.openxmlformats-officedocument.presentationml.presentation

application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

Master source types remain Admin-only.

Additional learner-facing MIME types require an explicit contract and rules update.

---

# Learner ViewModel Mapping

The resolver maps Firestore fields into a learner-safe object.

Example:

```javascript
{
    deliveryId:
        delivery.delivery_id,

    resourceId:
        resource.resource_id,

    programCode:
        resource.program_code,

    title:
        resource.title,

    description:
        resource.description,

    contentType:
        resource.content_type,

    resourceCategory:
        resource.resource_category,

    moduleCode:
        resource.module_code,

    moduleTitle:
        resource.module_title,

    version:
        resource.version,

    versionLabel:
        resource.version_label,

    learnerFileName:
        delivery.learner_file_name ||
        resource.source_file_name,

    previewAllowed:
        effectivePreviewAllowed,

    downloadAllowed:
        effectiveDownloadAllowed,

    embedAllowed:
        effectiveEmbedAllowed,

    deliveryType:
        resource.delivery_type,

    externalProvider:
        safeExternalProvider,

    externalVideoId:
        safeExternalVideoId,

    actions:
        resolvedActions
}
```

The ViewModel must not expose:

```text
storage_path
learner_uid
created_by_uid
published_by_uid
sha256
RBAC information
raw audit metadata
```

---

# Fail-Closed Conditions

The resolver must exclude a record where:

- learner ownership does not match;
- delivery is unpublished;
- delivery is inactive;
- resource is unpublished;
- resource is inactive;
- resource reference is missing;
- version is inconsistent;
- programme code is inconsistent;
- delivery type is inconsistent;
- personalisation type is inconsistent;
- personalized Storage path is malformed;
- external provider is unapproved;
- URL is invalid;
- availability window fails;
- permissions are malformed;
- required identity is missing.

---

# Data Migration Guidance

Existing learning-resource records should be migrated in this order:

```text
1. Identify the logical educational resource.

2. Assign a stable Resource ID.

3. Assign an integer version.

4. Create the Resource Version ID.

5. Normalize programme code.

6. Normalize content type.

7. Normalize resource category.

8. Normalize delivery and personalization type.

9. Confirm Storage path or external URL.

10. Set lifecycle fields.

11. Add audit metadata.

12. Create learner deliveries.

13. Link Credential ID where appropriate.

14. Validate resolver output.

15. Remove obsolete public-link dependencies.
```

---

# Future Supporting Collections

The following collections may be introduced later.

They are not part of the initial required implementation.

---

## `learning_resource_events`

Purpose:

- preview events;
- downloads;
- video opens;
- completion events;
- access denials.

Example event types:

```text
learning_resource_previewed
learning_resource_downloaded
learning_resource_video_opened
learning_resource_external_link_opened
learning_resource_access_denied
```

---

## `learning_resource_generation_jobs`

Purpose:

- personalized generation queue;
- source master reference;
- learner generation status;
- error recovery;
- retry history.

Potential statuses:

```text
queued
processing
completed
failed
cancelled
```

---

## `learning_resource_publication_events`

Purpose:

- formal publication audit;
- version publication;
- withdrawal;
- reactivation;
- administrative reason.

---

## `learning_resource_approval_requests`

Purpose:

Future multi-stage approval.

Potential fields:

```text
review_status
approval_status
reviewed_by_uid
approved_by_uid
```

---

## `learning_resource_bookmarks`

Purpose:

Future learner favourites or bookmarks.

This collection must not become an entitlement or ownership authority.

---

# Schema Change Governance

Schema changes are classified as:

## Non-Breaking

Examples:

- adding optional field;
- adding future metadata;
- adding optional display labels.

## Potentially Breaking

Examples:

- renaming a field;
- changing field type;
- changing document ID format;
- changing collection names;
- changing lifecycle values;
- changing path governance;
- changing permission semantics.

Potentially breaking changes require:

```text
Architecture review

Migration plan

Rules update

Resolver update

Documentation update
```

---

# Collection Naming Decisions

The following names are locked:

```text
learning_resources

learning_resource_deliveries
```

The following names must not replace them without a superseding ADR:

```text
learning_materials
course_files
resource_assignments
learner_files
learning_downloads
```

---

# Field Naming Decisions

The following core field names are locked:

```text
resource_id
resource_document_id
delivery_id
learner_uid
program_code
credential_id
licence_id
resource_version
delivery_type
personalisation_type
preview_allowed
download_allowed
embed_allowed
status
is_active
is_latest
storage_path
```

---

# Architecture Compliance Checklist

An implementation complies with this reference when:

- both authoritative collections use the defined names;
- Resource ID and Delivery ID remain separate;
- each resource document represents one immutable version;
- each delivery references an explicit resource version;
- personalized delivery is learner-scoped;
- shared delivery does not duplicate shared binaries;
- learner writes are denied;
- status and active state are explicit;
- permissions are Boolean;
- file-size validation uses exact bytes;
- protected paths are not exposed to learners;
- resolver consistency validation is implemented;
- published records preserve audit metadata.

---

# Non-Compliance Examples

The following are non-compliant:

```javascript
{
    fileUrl:
        "https://permanent-public-url"
}
```

```javascript
{
    learner_email:
        "used as access authority"
}
```

```javascript
{
    resource_id:
        "AAU-AB12CD34"
}
```

where the Credential ID is incorrectly used as Resource ID.

```javascript
{
    status:
        "live"
}
```

where an unsupported lifecycle value is used.

```javascript
{
    download_allowed:
        "true"
}
```

where a string is used instead of Boolean.

```javascript
{
    storage_path:
        "learner-learning-assets/OTHER_UID/..."
}
```

where delivery ownership and Storage scope do not match.

---

# Implementation Order

The recommended implementation order following this schema is:

```text
1. learning-resource-contract.js

2. Firestore Rules update

3. Storage Rules update

4. learning-resource-storage.js

5. learning-resource-delivery-service.js

6. learning-resource-resolver.js

7. LearningService integration

8. Student Portal renderer

9. Admin delivery-management workflow

10. Production validation
```

---

# Locked Decisions Summary

1. `learning_resources` is the authoritative resource registry.
2. `learning_resource_deliveries` is the authoritative learner-delivery registry.
3. Each resource document represents one immutable version.
4. Resource ID remains stable across versions.
5. Delivery ID is distinct from Resource ID and Credential ID.
6. Every delivery references an explicit resource version.
7. Student Portal writes are prohibited.
8. Personalized Storage paths are learner-scoped.
9. Shared deliveries reuse the registered shared resource.
10. Effective permissions are the intersection of resource and delivery policy.
11. Published records are immutable except for governed lifecycle fields.
12. Firestore Timestamp is required for lifecycle times.
13. The maximum protected binary size is 52,428,800 bytes.
14. External video stores provider, canonical URL and video ID, not iframe HTML.
15. Resolver failures fail closed.
16. Published historical records should be withdrawn or archived, not routinely deleted.

---

# Related Documentation

```text
learning-resource-architecture.md

ADR-019-Learning-Resource-Delivery-Architecture.md

LearningService.md

Storage Security Rules documentation

Learning Resource Publication Runbook

Personalized Material Generation Runbook
```

---

# Document Status

```text
ACTIVE
LOCKED
AUTHORITATIVE
```

Material schema changes require:

```text
Enterprise Architecture Review

and

Approved documentation and migration updates
```

---

# End of FIRESTORE_COLLECTION_REFERENCE.md