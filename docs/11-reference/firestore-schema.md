# Firestore Schema Reference

**Document ID:** REF-003  
**Title:** Firestore Schema Reference  
**Version:** 1.0.0  
**Status:** ACTIVE  
**Owner:** Agile AI University  
**Architect:** Dileep Appupillai  
**Last Updated:** 27 July 2026

---

# 1. Purpose

This document defines the canonical Cloud Firestore schema for the
Agile AI University platform.

It documents:

- collection names
- document ID strategies
- field names
- Firestore data types
- required and optional fields
- default values
- lifecycle states
- immutable fields
- ownership rules
- validation expectations
- relationships between collections
- active, planned, and deferred schemas

This document is the field-level companion to:

```text
docs/11-reference/firestore-collections.md
```

The collections reference explains the purpose and ownership of each
collection.

This schema reference defines the actual document structure.

---

# 2. Authority and Precedence

When implementation and documentation differ, the following precedence
must be used:

```text
Accepted Architecture Decision Record
        ↓
Production Firestore Security Rules
        ↓
Production Service-Layer Validation
        ↓
This Schema Reference
        ↓
UI Implementation
```

The UI is never the authority for the data model.

Any intentional production schema change must update:

1. the relevant ADR
2. Firestore Security Rules
3. service-layer validation
4. this document
5. operational runbooks
6. affected UI surfaces

---

# 3. Implementation Status Classification

Every collection is classified using one of these statuses.

| Status | Meaning |
|---|---|
| `ACTIVE` | Implemented and approved for production use |
| `ACTIVE-PARTIAL` | Implemented, but not every planned capability is complete |
| `PLANNED` | Approved conceptually but not yet implemented |
| `DEFERRED` | Intentionally excluded from the current MVP |
| `PROPOSED` | Requires an architectural decision before implementation |
| `LEGACY` | Existing historical structure retained for compatibility |

A developer must not create a `PLANNED`, `DEFERRED`, or `PROPOSED`
collection merely because it appears in this document.

---

# 4. Current Collection Status

| Collection | Domain | Status |
|---|---|---|
| `credentials` | Credential | ACTIVE |
| `credential_assets` | Credential | ACTIVE |
| `learning_resources` | Learning Resource | ACTIVE |
| `credential_activation_tokens` | Identity | ACTIVE |
| `identity_reconciliation_events` | Identity | ACTIVE |
| `learner_resource_access` | Learning Resource Access | PLANNED / MVP decision pending |
| `learner_resource_assignments` | Learning Resource Assignment | DEFERRED |
| `registrations` | Registration | PLANNED |
| `payments` | Revenue | PLANNED |
| `orders` | Revenue | PROPOSED |
| `invoices` | Finance | PLANNED |
| `receipts` | Finance | PLANNED |
| `entitlement_records` | Entitlement | PROPOSED |

---

# 5. Global Firestore Standards

## 5.1 Collection Naming

Collection names must be:

- lowercase
- plural where appropriate
- underscore-separated
- stable after release

Examples:

```text
credentials
credential_assets
learning_resources
credential_activation_tokens
identity_reconciliation_events
```

---

## 5.2 Field Naming

Field names must use:

```text
lower_snake_case
```

Examples:

```text
credential_id
learner_uid
programme_code
published_at
created_by_email
```

Do not introduce:

```text
camelCase
PascalCase
hyphenated-field-names
```

inside Firestore documents.

---

## 5.3 Timestamp Standard

All stored timestamps must use the Firestore `Timestamp` type.

Approved examples:

```text
created_at
updated_at
published_at
withdrawn_at
assigned_at
activated_at
expires_at
```

Do not store authoritative timestamps as formatted strings.

Incorrect:

```json
{
  "created_at": "27-07-2026"
}
```

Correct conceptual representation:

```json
{
  "created_at": "Firestore Timestamp"
}
```

Server-generated timestamps should be used wherever possible.

---

## 5.4 Identity Standard

After first authenticated identity activation:

```text
learner_uid
```

is the canonical cross-platform identity anchor.

It connects:

- credentials
- registrations
- enrolments
- payments
- learning resources
- assignments
- communications
- entitlements
- portal activity

The following remain supporting business identifiers:

```text
credential_id
verified_email
registration_id
programme_code
```

Email must never replace `learner_uid` after identity activation.

---

## 5.5 Null and Missing Fields

For pre-authentication records where a learner UID does not yet exist,
the approved representation is:

```text
learner_uid = null
```

Do not use:

```text
""
"pending"
"unknown"
"not-created"
```

for an unavailable UID.

A field that is part of a governed workflow should normally exist with
an explicit `null` value rather than being represented by inconsistent
placeholder strings.

---

## 5.6 Boolean Standards

Boolean fields must use actual Firestore booleans:

```text
true
false
```

Never use:

```text
"true"
"false"
1
0
yes
no
```

---

## 5.7 Programme Codes

Programme codes must use approved uppercase machine-friendly codes.

Current examples include:

```text
AOP
AIPA
AAIA
AAIP
AIAL
AISD
AAIM
AAICC
AISL
AIOL
AIPL
```

Do not store programme display titles in `programme_code`.

---

## 5.8 Audit Fields

Where applicable, operational documents should include:

```text
created_at
created_by_uid
created_by_email
updated_at
updated_by_uid
updated_by_email
```

Lifecycle actions should have dedicated audit fields.

Examples:

```text
published_at
published_by_uid
published_by_email

withdrawn_at
withdrawn_by_uid
withdrawn_by_email
```

Generic update fields do not replace lifecycle-specific audit fields.

---

# 6. Credential Domain

---

# 6.1 Collection: `credentials`

## Status

```text
ACTIVE
```

## Purpose

The authoritative academic credential registry.

Each document represents an Agile AI University credential issued or
prepared for a learner.

The credential record is the academic source of truth.

---

## Document ID Strategy

The existing production document ID strategy must be preserved.

The business identifier is:

```text
credential_id
```

Example:

```text
AAU-8F4KQ9PL
```

The credential ID format is:

```regex
^AAU-[A-Z0-9]{8}$
```

A credential ID must never be reused.

---

## Canonical Schema

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `credential_id` | string | Yes | No | Permanent AAU credential identifier |
| `full_name` | string | Yes | Limited | Learner name displayed on the credential |
| `email` | string | Yes | Limited | Verified or registered learner email |
| `learner_uid` | string or null | Yes | Bind once | Firebase UID after first identity activation |
| `credential_type` | string | Yes | No after finalization | Credential classification |
| `programme_code` | string | Yes | No after finalization | Approved programme code |
| `programme_name` | string | Recommended | Limited | Learner-facing programme name |
| `issued_status` | string | Yes | Governed | Credential issuance state |
| `approval_status` | string | Yes | Governed | Academic or administrative approval state |
| `issue_date` | timestamp, string, or null according to existing implementation | Conditional | Limited | Official issue date where applicable |
| `created_at` | timestamp | Yes | No | Record creation time |
| `updated_at` | timestamp | Recommended | Yes | Last permitted update |
| `created_by_uid` | string | Recommended | No | Creating administrator UID |
| `created_by_email` | string | Recommended | No | Creating administrator email |
| `updated_by_uid` | string | Optional | Yes | Last updating administrator UID |
| `updated_by_email` | string | Optional | Yes | Last updating administrator email |

---

## Required Production Values

For a finalized credential:

```text
issued_status = finalized
approval_status = approved
```

These values are required by the governed credential publication and
verification workflow.

---

## `learner_uid` Lifecycle

Before first authentication:

```text
learner_uid = null
```

During first authenticated identity activation:

1. learner email is verified
2. activation eligibility is validated
3. Firebase UID is obtained
4. credential record is atomically bound
5. identity reconciliation event is written
6. entitlement resolution begins
7. dashboard rendering begins

After successful binding:

```text
learner_uid = authenticated Firebase UID
```

The bound UID must not be replaced through a normal client operation.

---

## Example

```json
{
  "credential_id": "AAU-8F4KQ9PL",
  "full_name": "Example Learner",
  "email": "learner@example.com",
  "learner_uid": null,
  "credential_type": "university_certificate",
  "programme_code": "AOP",
  "programme_name": "Agile Outcome Practitioner (AOP)",
  "issued_status": "finalized",
  "approval_status": "approved",
  "issue_date": null,
  "created_at": "Firestore Timestamp",
  "updated_at": "Firestore Timestamp",
  "created_by_uid": "ADMIN_FIREBASE_UID",
  "created_by_email": "dileep@agileai.university"
}
```

---

## Immutable or Bind-Once Fields

The following are immutable after academic finalization, except through
an explicitly governed correction process:

```text
credential_id
credential_type
programme_code
```

The following is bind-once:

```text
learner_uid
```

---

## Security Expectations

- Administrators may create and govern credential records.
- Learners may read only credentials owned by their authenticated UID.
- Public verification must use the governed verification service.
- Learners must not update academic credential fields.
- Identity binding must occur through the authorized identity service.

---

# 6.2 Collection: `credential_assets`

## Status

```text
ACTIVE
```

## Purpose

Stores the registry metadata for official digital assets generated from
an approved credential.

Supported asset examples:

```text
university_certificate
trainer_certificate
digital_badge
```

---

## Document ID Strategy

Locked strategy:

```text
{credentialId}_{assetType}
```

Example:

```text
AAU-8F4KQ9PL_university_certificate
```

---

## Canonical Schema

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `credential_id` | string | Yes | No | Associated credential |
| `learner_uid` | string or null | Yes | Bind once | Credential owner's Firebase UID |
| `asset_type` | string | Yes | No | Type of credential asset |
| `programme_code` | string | Yes | No | Associated programme |
| `version` | number or string | Yes | No after publication | Asset version |
| `status` | string | Yes | Governed | Publication state |
| `is_latest` | boolean | Yes | Governed | Indicates current published asset |
| `source` | string | Yes | No | Asset generation source |
| `urls` | map | Yes for published assets | Restricted | Governed asset locations |
| `published_at` | timestamp | Required when published | No | Publication timestamp |
| `published_by` | string | Recommended | No | Publishing identity |
| `published_by_uid` | string | Recommended | No | Publishing admin UID |
| `published_by_email` | string | Recommended | No | Publishing admin email |
| `created_at` | timestamp | Recommended | No | Registry creation time |
| `updated_at` | timestamp | Optional | Yes before publication | Last update |

---

## Locked Published State

Published credential assets must use:

```text
status = published
is_latest = true
source = admin
```

---

## `urls` Map

The exact keys depend on the asset type.

Conceptual example:

```json
{
  "urls": {
    "download_url": "governed-location",
    "preview_url": "governed-location"
  }
}
```

Raw Storage paths must not be displayed to learners.

---

## Example

```json
{
  "credential_id": "AAU-8F4KQ9PL",
  "learner_uid": "FIREBASE_LEARNER_UID",
  "asset_type": "university_certificate",
  "programme_code": "AOP",
  "version": 1,
  "status": "published",
  "is_latest": true,
  "source": "admin",
  "urls": {
    "download_url": "governed-download-reference",
    "preview_url": "governed-preview-reference"
  },
  "published_at": "Firestore Timestamp",
  "published_by_uid": "ADMIN_FIREBASE_UID",
  "published_by_email": "dileep@agileai.university",
  "created_at": "Firestore Timestamp"
}
```

---

## Security Expectations

Learner reads are permitted only when:

```text
request.auth.uid == resource.data.learner_uid
```

and the asset is:

```text
status == published
is_latest == true
```

An authorized administrator retains governed override access.

Learners cannot write credential asset records.

---

# 7. Identity Activation Domain

---

# 7.1 Collection: `credential_activation_tokens`

## Status

```text
ACTIVE
```

## Purpose

Supports secure first-time activation of historical or pre-registered
learner credentials.

The token connects a pre-authentication business identity to the first
authenticated Firebase identity.

---

## Document ID Strategy

Use a secure generated token identifier or a securely derived token
reference according to the active backend implementation.

Plain predictable tokens are prohibited.

---

## Canonical Schema

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `token` or `token_hash` | string | Yes | No | Secure activation token representation |
| `credential_id` | string | Yes | No | Credential being activated |
| `email` | string | Yes | No | Email authorized for activation |
| `status` | string | Yes | Governed | Token lifecycle state |
| `created_at` | timestamp | Yes | No | Creation time |
| `expires_at` | timestamp | Yes | No | Expiration time |
| `created_by_uid` | string | Recommended | No | Issuing administrator |
| `created_by_email` | string | Recommended | No | Issuing administrator email |
| `used_at` | timestamp or null | Yes | Set once | Successful use time |
| `used_by_uid` | string or null | Yes | Set once | UID bound through activation |
| `revoked_at` | timestamp or null | Optional | Set once | Revocation time |
| `revoked_by_uid` | string or null | Optional | Set once | Revoking administrator |
| `revocation_reason` | string or null | Optional | Set once | Reason for revocation |

---

## Token Policy

An activation token is:

- personal
- email-bound
- credential-bound
- valid for seven days
- single-use
- revocable
- replaced when reissued

Issuing a new token for the same activation should revoke the earlier
active token.

---

## Approved Status Values

```text
active
used
expired
revoked
```

---

## Example

```json
{
  "token_hash": "SECURE_TOKEN_HASH",
  "credential_id": "AAU-8F4KQ9PL",
  "email": "learner@example.com",
  "status": "active",
  "created_at": "Firestore Timestamp",
  "expires_at": "Firestore Timestamp",
  "created_by_uid": "ADMIN_FIREBASE_UID",
  "created_by_email": "dileep@agileai.university",
  "used_at": null,
  "used_by_uid": null,
  "revoked_at": null,
  "revoked_by_uid": null,
  "revocation_reason": null
}
```

---

## Security Expectations

- Token creation is restricted to authorized administrators or backend
  services.
- Tokens must not be listed publicly.
- Raw secure token values must not be logged.
- Token consumption must occur through an authorized backend transaction.
- Client code must not independently bind credentials to UIDs.

---

# 7.2 Collection: `identity_reconciliation_events`

## Status

```text
ACTIVE
```

## Purpose

Stores the permanent audit history of identity activation and
reconciliation operations.

This collection records what identity was connected, why it was
connected, and how the decision was made.

---

## Document ID Strategy

Use an immutable generated event ID.

Example conceptual format:

```text
IRE_{generated-id}
```

The exact implementation may use Firestore-generated IDs.

---

## Canonical Schema

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `event_id` | string | Recommended | No | Stable event identifier |
| `event_type` | string | Yes | No | Reconciliation event type |
| `credential_id` | string | Yes | No | Credential involved |
| `learner_uid` | string | Yes | No | Authenticated learner identity |
| `email` | string | Yes | No | Verified email used |
| `activation_token_id` | string or null | Conditional | No | Associated activation token |
| `status` | string | Yes | No | Result of reconciliation |
| `reason` | string or null | Optional | No | Human-readable reason |
| `source` | string | Yes | No | Triggering source |
| `occurred_at` | timestamp | Yes | No | Event occurrence time |
| `performed_by_uid` | string | Conditional | No | Performing identity |
| `metadata` | map | Optional | No | Additional non-sensitive context |

---

## Example

```json
{
  "event_id": "IRE_EXAMPLE123",
  "event_type": "first_login_identity_binding",
  "credential_id": "AAU-8F4KQ9PL",
  "learner_uid": "FIREBASE_LEARNER_UID",
  "email": "learner@example.com",
  "activation_token_id": "ACTIVATION_TOKEN_REFERENCE",
  "status": "completed",
  "reason": null,
  "source": "identity_activation_service",
  "occurred_at": "Firestore Timestamp",
  "performed_by_uid": "FIREBASE_LEARNER_UID",
  "metadata": {
    "programme_code": "AOP"
  }
}
```

---

## Immutability

Identity reconciliation events are append-only.

They must never be:

- edited
- reassigned
- overwritten
- reused
- deleted through the client

Corrections require a new compensating event.

---

# 8. Learning Resource Domain

---

# 8.1 Collection: `learning_resources`

## Status

```text
ACTIVE
```

## Purpose

Stores the authoritative metadata for governed learning resources.

This collection supports:

- shared academic resources
- participant-specific licensed materials
- protected downloadable files
- governed external videos
- programme-based release
- future enterprise and subscription delivery

---

## Document ID Strategy

The Firestore document ID should be the normalized stable resource
identifier used by the current implementation.

Example:

```text
aop-personal-reference-guide_v1
```

The business field:

```text
resource_id
```

must remain uppercase, unique, stable, and machine-friendly.

Example:

```text
AOP-PERSONAL-REFERENCE-GUIDE
```

Where the current implementation includes version information in the
document ID, that convention must not be changed without a migration ADR.

---

## Canonical Schema

### Core Identity Fields

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `resource_id` | string | Yes | No | Stable business resource identifier |
| `programme_code` | string | Yes | No after publication | Owning programme |
| `title` | string | Yes | Draft only | Learner-facing title |
| `description` | string | Recommended | Draft only | Resource description |
| `resource_type` | string | Yes | No after publication | Resource classification |
| `version` | number or string | Yes | No | Resource version |
| `status` | string | Yes | Governed | Lifecycle state |
| `is_active` | boolean | Yes | Governed | Active delivery state |
| `is_latest` | boolean | Yes | Governed | Latest-version marker |

### File and Storage Fields

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `file_name` | string or null | Required after upload | Draft only | Human-readable uploaded filename |
| `storage_path` | string or null | Required after upload | Restricted | Protected Storage object path |
| `content_type` | string or null | Recommended | Restricted | MIME type |
| `file_size_bytes` | number or null | Recommended | Restricted | Uploaded file size |
| `uploaded_at` | timestamp or null | Yes | Set on upload | Protected upload timestamp |
| `uploaded_by_uid` | string or null | Yes | Set on upload | Uploading admin UID |
| `uploaded_by_email` | string or null | Yes | Set on upload | Uploading admin email |

### Creation and Update Audit Fields

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `created_at` | timestamp | Yes | No | Resource creation time |
| `created_by_uid` | string | Yes | No | Creating administrator UID |
| `created_by_email` | string | Yes | No | Creating administrator email |
| `updated_at` | timestamp | Recommended | Draft only | Last draft update |
| `updated_by_uid` | string or null | Optional | Draft only | Last updating administrator |
| `updated_by_email` | string or null | Optional | Draft only | Last updating administrator email |

### Publication Audit Fields

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `published_at` | timestamp or null | Yes | Set once | Publication time |
| `published_by_uid` | string or null | Yes | Set once | Publishing administrator UID |
| `published_by_email` | string or null | Yes | Set once | Publishing administrator email |
| `withdrawn_at` | timestamp or null | Optional | Set once | Withdrawal time |
| `withdrawn_by_uid` | string or null | Optional | Set once | Withdrawing administrator UID |
| `withdrawn_by_email` | string or null | Optional | Set once | Withdrawing administrator email |
| `withdrawal_reason` | string or null | Optional | Set once | Governed withdrawal explanation |

### Delivery and Release Fields

The exact active fields must remain aligned with the production service
and Firestore Rules.

Recommended governed fields include:

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `delivery_type` | string | Recommended | Draft only | Protected file or external resource |
| `release_mode` | string | Recommended | Draft only | Immediate or governed release |
| `release_at` | timestamp or null | Conditional | Draft only | Scheduled release time |
| `external_url` | string or null | Conditional | Draft only | Governed external resource URL |
| `audience_type` | string | Recommended | Draft only | Shared, learner-specific, cohort, enterprise |
| `credential_id` | string or null | Conditional | Draft only | Intended credential association |
| `learner_email` | string or null | Conditional | Draft only | Verified pre-login learner identity |
| `learner_uid` | string or null | Conditional | Bind once where used | Authenticated learner identity |

Fields not present in production must not be added merely because they
are documented as recommended.

---

## Lifecycle State Model

The only approved learning-resource lifecycle is:

```text
draft
   ↓
published
   ↓
withdrawn
```

There is no `uploaded` lifecycle state.

Uploading a protected file enriches the draft.

After upload:

```text
status = draft
is_active = false
is_latest = false
```

---

## Draft State

Required state consistency:

```text
status = draft
is_active = false
is_latest = false
```

Publication fields should remain `null` or absent according to the
existing implementation.

A draft may be edited and may receive a protected file upload.

---

## Published State

Required state consistency:

```text
status = published
is_active = true
is_latest = true
```

A published protected-file resource must have:

```text
storage_path
file_name
uploaded_at
published_at
published_by_uid or equivalent publisher identity
```

Published resources are immutable except for narrowly governed
withdrawal metadata.

---

## Withdrawn State

Required state consistency:

```text
status = withdrawn
is_active = false
is_latest = false
```

Withdrawal does not delete:

- the Firestore record
- the protected file
- publication history
- prior learner ownership
- audit history

---

## Example: Uploaded Draft

```json
{
  "resource_id": "AOP-PERSONAL-REFERENCE-GUIDE",
  "programme_code": "AOP",
  "title": "Agile Outcome Practitioner (AOP) – Licensed Course Material – Example Learner",
  "description": "Participant-specific licensed course material.",
  "resource_type": "licensed_course_material",
  "version": 1,
  "status": "draft",
  "is_active": false,
  "is_latest": false,
  "file_name": "AOP-Licensed-Course-Material-Example-Learner.pdf",
  "storage_path": "learning-resources/AOP/AOP-PERSONAL-REFERENCE-GUIDE/v1/AOP-Licensed-Course-Material-Example-Learner.pdf",
  "content_type": "application/pdf",
  "file_size_bytes": 47185920,
  "uploaded_at": "Firestore Timestamp",
  "uploaded_by_uid": "ADMIN_FIREBASE_UID",
  "uploaded_by_email": "dileep@agileai.university",
  "created_at": "Firestore Timestamp",
  "created_by_uid": "ADMIN_FIREBASE_UID",
  "created_by_email": "dileep@agileai.university",
  "published_at": null,
  "published_by_uid": null,
  "published_by_email": null
}
```

---

## Example: Published Resource

```json
{
  "resource_id": "AOP-PERSONAL-REFERENCE-GUIDE",
  "programme_code": "AOP",
  "title": "Agile Outcome Practitioner (AOP) – Licensed Course Material – Example Learner",
  "description": "Participant-specific licensed course material.",
  "resource_type": "licensed_course_material",
  "version": 1,
  "status": "published",
  "is_active": true,
  "is_latest": true,
  "file_name": "AOP-Licensed-Course-Material-Example-Learner.pdf",
  "storage_path": "learning-resources/AOP/AOP-PERSONAL-REFERENCE-GUIDE/v1/AOP-Licensed-Course-Material-Example-Learner.pdf",
  "content_type": "application/pdf",
  "file_size_bytes": 47185920,
  "uploaded_at": "Firestore Timestamp",
  "uploaded_by_uid": "ADMIN_FIREBASE_UID",
  "uploaded_by_email": "dileep@agileai.university",
  "created_at": "Firestore Timestamp",
  "created_by_uid": "ADMIN_FIREBASE_UID",
  "created_by_email": "dileep@agileai.university",
  "published_at": "Firestore Timestamp",
  "published_by_uid": "ADMIN_FIREBASE_UID",
  "published_by_email": "dileep@agileai.university"
}
```

---

## File Size Validation

Protected learning-resource uploads must not exceed:

```text
50 MiB
```

Exact byte limit:

```text
50 × 1024 × 1024
= 52,428,800 bytes
```

Large video files must use the governed external-video delivery
architecture.

---

## Personalized Resource Rule

Where a PDF contains learner-specific:

- watermarking
- licence details
- name
- credential ID
- batch content
- academic customizations

it must be registered as an independent learning resource.

It must not share the resource identity or protected object of another
learner's licensed material.

---

# 8.2 Collection: `learner_resource_access`

## Status

```text
PLANNED / MVP DECISION PENDING
```

## Important Implementation Rule

Do not create this collection until its role is confirmed against the
current assignment and entitlement implementation.

This collection must not duplicate:

- assignments
- entitlements
- release rules
- credential ownership
- learning-resource metadata

---

## Intended Purpose

Provide a learner-centric access-resolution record for a governed
learning resource.

Potential uses include:

- pre-staging learner access before first login
- binding access to a UID during identity activation
- recording release eligibility
- optimizing learner resource queries

---

## Proposed Document ID

A deterministic ID may be used:

```text
{credential_id}_{resource_id}_{version}
```

or:

```text
{learner_uid}_{resource_id}_{version}
```

The final strategy requires a locked ADR before implementation.

---

## Proposed Schema

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `access_id` | string | Yes | No | Stable access identifier |
| `resource_id` | string | Yes | No | Associated learning resource |
| `resource_document_id` | string | Recommended | No | Firestore resource reference |
| `credential_id` | string | Yes before first login | No | Business identity anchor |
| `verified_email` | string | Yes before first login | Limited | Verified learner email |
| `learner_uid` | string or null | Yes | Bind once | Canonical identity after activation |
| `programme_code` | string | Yes | No | Programme association |
| `version` | number or string | Yes | No | Licensed version |
| `status` | string | Yes | Governed | Access record state |
| `release_status` | string | Recommended | Governed | Release eligibility |
| `available_from` | timestamp or null | Optional | Governed | Earliest access time |
| `created_at` | timestamp | Yes | No | Creation time |
| `created_by_uid` | string | Yes | No | Creating admin or service |
| `created_by_email` | string | Recommended | No | Creating admin email |
| `bound_at` | timestamp or null | Yes | Set once | UID binding time |
| `activated_at` | timestamp or null | Optional | Set once | Access activation time |

---

## Proposed Status Values

```text
pre_staged
active
revoked
```

These values are not approved for production until the collection is
formally implemented.

---

## First-Login Binding Requirement

Where access is pre-staged using:

```text
credential_id
verified_email
```

the identity activation transaction must:

1. authenticate the learner
2. validate the credential and email
3. bind the permanent learner UID
4. bind pre-staged resource access
5. resolve entitlement
6. render the dashboard

The learner must receive access within the same first authenticated
session.

---

# 8.3 Collection: `learner_resource_assignments`

## Status

```text
DEFERRED
```

## MVP Decision

This collection is intentionally not required for immediate creation
unless the active implementation explicitly depends on it.

Do not create it solely for future completeness.

Revenue-related MVP work takes precedence.

---

## Intended Purpose

Create a permanent ownership relationship between:

```text
learner
+
published learning resource
```

---

## Proposed Document ID

```text
{learner_uid}_{resource_id}_{version}
```

For pre-login staging, a credential-based identifier may be necessary.

That decision must be reconciled with `learner_resource_access` before
implementation.

---

## Proposed Schema

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `assignment_id` | string | Yes | No | Stable assignment identifier |
| `learner_uid` | string or null | Yes | Bind once | Canonical learner identity |
| `credential_id` | string | Yes | No | Supporting academic identity |
| `verified_email` | string | Recommended | Limited | Pre-login identity support |
| `resource_id` | string | Yes | No | Assigned resource |
| `resource_version` | number or string | Yes | No | Assigned version |
| `programme_code` | string | Yes | No | Programme association |
| `status` | string | Yes | Governed | Assignment state |
| `assigned_at` | timestamp | Yes | No | Assignment time |
| `assigned_by_uid` | string | Yes | No | Assigning administrator or service |
| `assigned_by_email` | string | Recommended | No | Assigning administrator email |
| `assignment_source` | string | Yes | No | Admin, migration, registration, etc. |
| `revoked_at` | timestamp or null | Optional | Set once | Exceptional revocation time |
| `revoked_by_uid` | string or null | Optional | Set once | Revoking authority |
| `revocation_reason` | string or null | Optional | Set once | Required revocation reason |

---

## Proposed Status Values

```text
active
revoked
```

Assignment records should be immutable after creation except for a
governed exceptional revocation operation.

---

# 9. Registration Domain

---

# 9.1 Collection: `registrations`

## Status

```text
PLANNED
```

## Purpose

Represents a learner's registration for a programme, bridge programme,
cohort, or academic offering.

This schema must be finalized as part of the bridge registration and
payment implementation.

---

## Proposed Document ID

Use a generated stable registration ID.

Example:

```text
REG_{generated-id}
```

---

## Proposed Schema

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `registration_id` | string | Yes | No | Permanent registration identifier |
| `learner_uid` | string | Yes after authentication | No | Canonical learner identity |
| `credential_id` | string or null | Conditional | No | Existing credential supporting eligibility |
| `email` | string | Yes | Limited | Registration email |
| `full_name` | string | Yes | Limited | Learner name |
| `programme_code` | string | Yes | No | Programme being registered |
| `offering_id` | string | Recommended | No | Specific programme offering |
| `cohort_id` | string or null | Optional | Governed | Cohort assignment |
| `registration_type` | string | Yes | No | Standard, bridge, alumni, enterprise |
| `eligibility_status` | string | Yes | Governed | Eligibility decision |
| `registration_status` | string | Yes | Governed | Registration lifecycle |
| `amount` | number | Yes | No after order creation | Base amount |
| `currency` | string | Yes | No | Currency code |
| `tax_amount` | number | Recommended | No after order creation | Applicable tax |
| `total_amount` | number | Yes | No after order creation | Total payable |
| `payment_status` | string | Yes | Governed | Payment summary state |
| `created_at` | timestamp | Yes | No | Registration creation |
| `updated_at` | timestamp | Recommended | Yes | Last permitted update |
| `completed_at` | timestamp or null | Optional | Set once | Completion time |

---

## Proposed Registration Status Values

```text
initiated
pending_payment
confirmed
cancelled
expired
completed
```

These must be finalized with the Revenue Platform implementation.

---

## Bridge Registration Rule

For the AOP-to-AIPA bridge:

- eligibility must be resolved by the service layer
- the UI must not independently decide eligibility
- price must be obtained from governed offer configuration
- payment confirmation must come from trusted gateway verification
- registration confirmation must not rely solely on browser success
  redirects

---

# 10. Revenue and Payment Domain

---

# 10.1 Collection: `payments`

## Status

```text
PLANNED
```

## Purpose

Stores trusted payment transaction records.

The payment record must reflect verified gateway state rather than
client-side assumptions.

---

## Proposed Schema

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `payment_id` | string | Yes | No | Internal payment identifier |
| `registration_id` | string | Yes | No | Related registration |
| `learner_uid` | string | Yes | No | Paying learner |
| `gateway` | string | Yes | No | Payment gateway |
| `gateway_order_id` | string | Yes | No | Gateway order identifier |
| `gateway_payment_id` | string or null | Conditional | Set once | Gateway transaction identifier |
| `gateway_signature` | string or null | Conditional | Protected | Verification signature or reference |
| `amount` | number | Yes | No | Base payment amount |
| `tax_amount` | number | Recommended | No | Tax amount |
| `total_amount` | number | Yes | No | Total transaction amount |
| `currency` | string | Yes | No | Currency code |
| `status` | string | Yes | Governed | Verified payment state |
| `created_at` | timestamp | Yes | No | Payment initialization |
| `verified_at` | timestamp or null | Conditional | Set once | Backend verification time |
| `failed_at` | timestamp or null | Optional | Set once | Failure time |
| `failure_code` | string or null | Optional | Set once | Gateway or internal error code |
| `failure_reason` | string or null | Optional | Set once | Sanitized failure reason |
| `metadata` | map | Optional | Restricted | Non-sensitive gateway context |

---

## Proposed Payment Status Values

```text
created
pending
authorized
paid
failed
refunded
partially_refunded
cancelled
```

Only backend-verified transitions may set a payment to:

```text
paid
```

---

## Security Requirements

- Learners may read their own sanitized payment history.
- Gateway secrets must never be stored in learner-readable documents.
- Raw sensitive gateway payloads must not be exposed to clients.
- The client cannot declare a payment successful.
- Payment verification belongs to the backend.
- Financial records must be append-only or transition-controlled.

---

# 10.2 Collection: `orders`

## Status

```text
PROPOSED
```

An independent order collection should be created only if payment,
registration, invoice, and pricing workflows require a separate
commercial order aggregate.

Do not introduce this collection without a Revenue Platform ADR.

---

# 10.3 Collection: `invoices`

## Status

```text
PLANNED
```

## Proposed Schema

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `invoice_id` | string | Yes | No | Internal invoice identifier |
| `invoice_number` | string | Yes | No | Human-readable official number |
| `registration_id` | string | Yes | No | Related registration |
| `payment_id` | string or null | Conditional | No | Related payment |
| `learner_uid` | string | Yes | No | Invoice owner |
| `billing_name` | string | Yes | No after issue | Billing name |
| `billing_email` | string | Yes | No after issue | Billing email |
| `currency` | string | Yes | No | Currency |
| `subtotal` | number | Yes | No | Amount before tax |
| `tax_amount` | number | Yes | No | Tax amount |
| `total_amount` | number | Yes | No | Total invoice amount |
| `status` | string | Yes | Governed | Invoice state |
| `issued_at` | timestamp | Yes | No | Issue time |
| `document_url` | string or null | Optional | Restricted | Governed invoice location |

---

# 10.4 Collection: `receipts`

## Status

```text
PLANNED
```

## Proposed Schema

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `receipt_id` | string | Yes | No | Internal receipt identifier |
| `receipt_number` | string | Yes | No | Human-readable official number |
| `payment_id` | string | Yes | No | Verified payment |
| `registration_id` | string | Yes | No | Related registration |
| `learner_uid` | string | Yes | No | Receipt owner |
| `amount_received` | number | Yes | No | Received amount |
| `currency` | string | Yes | No | Currency |
| `issued_at` | timestamp | Yes | No | Issue time |
| `document_url` | string or null | Optional | Restricted | Governed receipt location |

---

# 11. Entitlement Domain

---

# 11.1 Collection: `entitlement_records`

## Status

```text
PROPOSED
```

## Architectural Caution

Do not create a generalized entitlement collection until the active
entitlement resolver requires persistent entitlement records.

Entitlements may currently be derived from authoritative domain data,
such as:

- credential ownership
- registration status
- payment confirmation
- programme eligibility
- learning-resource assignment
- executive insight purchase

Creating a persistent entitlement collection prematurely may duplicate
those sources of truth.

---

## Proposed Schema

| Field | Type | Required | Mutable | Description |
|---|---|---:|---:|---|
| `entitlement_id` | string | Yes | No | Stable entitlement identifier |
| `learner_uid` | string | Yes | No | Entitlement owner |
| `entitlement_code` | string | Yes | No | Governed entitlement type |
| `source_type` | string | Yes | No | Credential, registration, payment, admin |
| `source_id` | string | Yes | No | Authoritative source record |
| `status` | string | Yes | Governed | Entitlement state |
| `valid_from` | timestamp | Yes | No | Start time |
| `valid_until` | timestamp or null | Optional | Governed | Expiration time |
| `created_at` | timestamp | Yes | No | Creation time |
| `revoked_at` | timestamp or null | Optional | Set once | Revocation time |
| `revocation_reason` | string or null | Optional | Set once | Revocation reason |

---

## Known Entitlement Example

```text
EXEC_INSIGHT_V1
```

The current Executive Insight entitlement provides one year of portal
access according to its governing policy.

---

# 12. Cross-Collection Relationships

## 12.1 Credential Ownership

```text
credentials
    │
    ├── credential_id
    ├── learner_uid
    │
    ▼
credential_assets
```

---

## 12.2 First-Login Identity Activation

```text
credential_activation_tokens
          │
          ▼
credentials
          │
          ├── learner_uid binding
          │
          ▼
identity_reconciliation_events
```

---

## 12.3 Licensed Learning Resource Flow

```text
learning_resources
        │
        ├── published resource
        │
        ▼
learner_resource_access
or
learner_resource_assignments
        │
        ▼
learner_uid
        │
        ▼
Student Portal
```

The final relationship between access and assignment collections must be
locked before either collection is implemented.

---

## 12.4 Revenue Flow

```text
registrations
      │
      ▼
payments
      │
      ├── invoices
      └── receipts
```

---

# 13. Source-of-Truth Matrix

| Business Concept | Authoritative Collection |
|---|---|
| Academic credential | `credentials` |
| Credential download asset | `credential_assets` |
| Learning-resource metadata | `learning_resources` |
| Protected file content | Cloud Storage |
| First-login activation token | `credential_activation_tokens` |
| Identity-binding audit | `identity_reconciliation_events` |
| Programme registration | `registrations` when implemented |
| Verified payment | `payments` when implemented |
| Invoice | `invoices` when implemented |
| Receipt | `receipts` when implemented |
| Learner resource ownership | To be finalized |
| General entitlement | Resolver or `entitlement_records`, subject to ADR |

---

# 14. Immutability Matrix

| Collection | Immutable Elements |
|---|---|
| `credentials` | Credential ID and finalized academic identity |
| `credential_assets` | Published asset history |
| `learning_resources` | Published resource metadata and protected object |
| `credential_activation_tokens` | Historical token events after use/revocation |
| `identity_reconciliation_events` | Entire event |
| `learner_resource_assignments` | Learner-resource ownership relationship |
| `payments` | Verified transaction identity and amount |
| `invoices` | Issued invoice |
| `receipts` | Issued receipt |

Corrections must normally create:

- a new version
- a replacement record
- a compensating event
- a governed withdrawal or revocation

They must not silently rewrite history.

---

# 15. Client Write Policy

The learner-facing portal must not directly write authoritative records
for:

```text
credentials
credential_assets
learning_resources
identity_reconciliation_events
payments
invoices
receipts
```

Sensitive business transitions must be performed through:

- an authorized backend
- governed administrative services
- trusted payment verification
- Firestore transactions
- Firestore Security Rules

---

# 16. UI Boundary

The UI may:

- collect user input
- display permitted records
- request an authorized operation
- display a service-layer result

The UI must not independently decide:

- whether a learner is authorized
- whether an entitlement exists
- whether a resource is released
- whether a payment succeeded
- whether a credential belongs to a user
- whether a published resource can be modified
- whether a learner is eligible for a bridge programme

---

# 17. Required Validation Layers

Every governed write must pass all applicable layers:

```text
Authentication
      ↓
Authorization
      ↓
Business Validation
      ↓
Schema Validation
      ↓
Lifecycle Validation
      ↓
Firestore Security Rules
      ↓
Persistence
```

Storage operations must additionally pass:

```text
File Type Validation
File Size Validation
Storage Path Validation
Storage Security Rules
```

---

# 18. Schema Change Governance

A schema change is considered significant when it:

- adds a new collection
- changes a document ID strategy
- adds a new lifecycle state
- changes an ownership relationship
- changes immutable fields
- changes learner identity resolution
- changes payment or financial records
- changes public or learner read access
- changes administrative write access
- creates denormalized source-of-truth data

Significant changes require an ADR.

---

# 19. Adding a Field

Before adding a field, confirm:

1. Which service owns it?
2. Is it required or optional?
3. What is its Firestore type?
4. What is its default value?
5. Is it mutable?
6. Who may write it?
7. Who may read it?
8. Is it sensitive?
9. Does it duplicate another source?
10. Does Firestore Rules validation need modification?
11. Does an index need modification?
12. Does existing production data require migration?

---

# 20. Removing a Field

Fields must not be removed from production merely because the current UI
does not use them.

Before removal:

- search all services
- search Firestore Rules
- search Storage Rules
- search Cloud Run services
- search Cloud Functions
- search Admin Portal code
- search Student Portal code
- inspect existing Firestore documents
- assess migration requirements
- document backward compatibility

---

# 21. Data Migration Rules

Production data migrations must be:

- focused
- idempotent where practical
- logged
- reversible where practical
- validated before and after execution
- limited to approved fields
- documented in a runbook

A browser UI must not be used for a large uncontrolled migration.

---

# 22. Prohibited Schema Practices

The following are prohibited:

- storing booleans as strings
- storing authoritative dates as display strings
- using email as the permanent identity after UID binding
- putting business rules in UI documents
- introducing undocumented lifecycle states
- overwriting published resource files
- reusing credential IDs
- reusing resource IDs
- storing gateway secrets in learner-readable documents
- exposing internal Storage paths to learners
- creating overlapping assignment and access sources of truth
- adding collections for speculative future use during the MVP
- deleting audit history
- silently correcting historical academic or financial records

---

# 23. MVP Governance

The immediate platform objective is revenue generation through:

```text
Learner Activation
        ↓
Portal Access
        ↓
Credential and Licensed Resource Access
        ↓
Bridge Registration
        ↓
Payment
        ↓
Programme Participation
```

The following must be deferred unless they directly block this flow:

- advanced resource lifecycle history
- archive browsing
- complex version lineage
- speculative entitlement collections
- duplicate access models
- advanced analytics schemas
- historical version browsing
- non-essential automation

---

# 24. Required Future Schema Decisions

The following decisions remain to be formally locked:

1. Whether `learner_resource_access` is required.
2. Whether `learner_resource_assignments` is required.
3. Whether both collections are required.
4. Which collection owns permanent resource licensing.
5. Which collection supports pre-login staging.
6. Whether entitlement records should be persisted or resolved.
7. The final registration schema.
8. The final payment gateway schema.
9. The invoice and receipt numbering strategy.
10. The order aggregate strategy.

These decisions must be resolved before production creation of the
affected collections.

---

# 25. Related Documents

- `DOCUMENTATION-INDEX.md`
- `docs/11-reference/firestore-collections.md`
- `docs/11-reference/storage-layout.md`
- `docs/04-decisions/ADR-019-Learning-Resource-Delivery-Architecture.md`
- `docs/04-decisions/ADR-020-Governed-Learning-Resource-Release-Architecture.md`
- `docs/04-decisions/ADR-023-Learning-Resource-Registration-Strategy.md`
- Firestore Security Rules
- Firebase Storage Security Rules
- Learning Resource Architecture
- Identity Activation Architecture
- Credential Platform Architecture
- Payment Architecture

---

# 26. Revision History

| Version | Date | Description |
|---|---|---|
| 1.0.0 | 27-Jul-2026 | Initial canonical Firestore schema reference |

---

# 27. Document Control

This document is active and authoritative for field-level Firestore
schema guidance.

It must be reviewed whenever:

- a collection is added
- a field is added or removed
- a lifecycle changes
- Firestore Rules change
- identity architecture changes
- resource ownership changes
- payment architecture changes
- a data migration is performed

---

**End of Document**