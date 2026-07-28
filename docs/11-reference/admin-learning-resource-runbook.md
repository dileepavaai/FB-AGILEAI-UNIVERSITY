# Admin Learning Resource Runbook

**Document ID:** RUNBOOK-001  
**Title:** Admin Learning Resource Runbook  
**Version:** 1.0.0  
**Status:** ACTIVE  
**Owner:** Agile AI University  
**Architect:** Dileep Appupillai  
**Audience:** Platform Administrators

---

# 1. Purpose

This runbook defines the standard operating procedure (SOP) for
managing learning resources within the Agile AI University Admin Portal.

It provides a step-by-step operational guide for administrators to:

- create learning resources
- upload protected files
- validate metadata
- publish resources
- withdraw resources
- verify learner delivery
- troubleshoot common issues

This document complements the platform architecture and should be used
for day-to-day operations.

---

# 2. Scope

This runbook applies to:

- Licensed Course Materials
- Shared Learning Resources
- Reference Guides
- Handbooks
- Module Notes
- Supporting Documents
- Protected PDF Resources

This runbook does not cover:

- Credential generation
- Payment processing
- Identity activation
- Student Portal operations

---

# 3. Roles and Responsibilities

## Platform Administrator

Responsible for:

- Creating learning resources
- Uploading protected files
- Publishing resources
- Withdrawing resources
- Verifying publication
- Maintaining metadata accuracy

---

## Platform Services

Responsible for:

- Validation
- Authorization
- Publication
- Storage
- Firestore updates
- Audit logging

---

## Student Portal

Responsible only for:

- Displaying entitled resources
- Downloading resources
- Previewing resources

The Student Portal never creates or modifies learning resources.

---

# 4. Prerequisites

Before creating a learning resource ensure:

✓ Administrator is authenticated

✓ Administrator has required permissions

✓ Programme exists

✓ Resource content is approved

✓ Final PDF is available

✓ Version number is confirmed

✓ Metadata is complete

---

# 5. Learning Resource Workflow

Every learning resource follows the workflow below.

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

Verify

↓

Learner Delivery
```

No steps may be skipped.

---

# 6. Step 1 – Create Draft

Navigate to:

```text
Admin Portal

↓

Learning Resource Management

↓

Create Resource
```

Enter:

- Programme
- Resource Title
- Resource Type
- Version
- Description

Click:

```text
Create Draft
```

---

## Expected Result

A Firestore document is created.

Values:

```text
status = draft

is_active = false

is_latest = false
```

---

# 7. Step 2 – Review Draft

Verify:

✓ Resource ID

✓ Programme

✓ Version

✓ Description

✓ Resource Type

Confirm:

No duplicate resource exists.

---

# 8. Step 3 – Upload Protected File

Open the draft.

Select:

```text
Upload Protected File
```

Choose the approved PDF.

The upload process:

1. validates file
2. uploads to Storage
3. records upload metadata
4. keeps resource in Draft

---

## Expected Firestore Changes

The following fields are populated:

- storage_path
- file_name
- content_type
- file_size_bytes
- uploaded_at
- uploaded_by_uid
- uploaded_by_email

The lifecycle state does not change.

---

# 9. Step 4 – Validate Resource

Review:

✓ Title

✓ Description

✓ Programme

✓ Version

✓ Storage Path

✓ Uploaded File

✓ Resource Type

✓ Metadata

Validation must succeed before publication.

---

# 10. Step 5 – Publish Resource

Select:

```text
Publish
```

Publication performs:

- metadata validation
- lifecycle validation
- Firestore update
- audit update

---

## Expected Firestore Values

```text
status = published

is_active = true

is_latest = true
```

Publication metadata:

- published_at
- published_by_uid
- published_by_email

---

# 11. Step 6 – Verify Publication

Confirm:

✓ Resource appears in Published list

✓ Status is Published

✓ Storage object exists

✓ Firestore updated

✓ Audit fields populated

---

# 12. Step 7 – Verify Learner Delivery

Using a test learner or an entitled learner:

Verify:

- Resource appears
- Preview works
- Download works
- File opens successfully

---

# 13. Shared Resource Workflow

Shared academic resources follow:

```text
Create

↓

Upload

↓

Publish

↓

Available to Eligible Learners
```

One published resource may serve multiple learners.

---

# 14. Licensed Resource Workflow

Participant-specific licensed resources follow:

```text
Generate Personalized PDF

↓

Create Draft

↓

Upload

↓

Publish

↓

Assign / Release

↓

Learner Access
```

Each licensed edition is independent.

---

# 15. Updating a Draft

Drafts may be updated.

Allowed:

✓ Title

✓ Description

✓ File

✓ Version (before publication)

✓ Metadata

---

# 16. Updating a Published Resource

Published resources are immutable.

The following are prohibited:

✗ Replace file

✗ Edit metadata

✗ Change programme

✗ Change Resource ID

✗ Change publication history

---

# 17. New Version Workflow

When content changes:

```text
Create New Draft

↓

Increment Version

↓

Upload New File

↓

Publish

↓

Release
```

Never overwrite an existing published version.

---

# 18. Withdrawal Workflow

Only exceptional administrative situations justify withdrawal.

Examples:

- Incorrect publication
- Compliance issue
- Legal requirement

Withdrawal:

```text
Published

↓

Withdrawn
```

Audit history remains intact.

---

# 19. Error Recovery

## Upload Failure

Check:

- Internet connection
- File size
- Storage Rules
- Authentication

Retry upload.

---

## Validation Failure

Review:

- Required fields
- Duplicate Resource ID
- Programme
- Version

Correct and validate again.

---

## Publication Failure

Confirm:

- Firestore permissions
- Storage object
- Required metadata

Do not attempt manual Firestore edits.

---

## Duplicate Resource

If duplicate exists:

Do not overwrite.

Create a new governed version or a new resource.

---

# 20. Administrative Checklist

Before Publication

✓ Metadata complete

✓ File uploaded

✓ Version correct

✓ Resource ID correct

✓ Description reviewed

✓ Programme verified

✓ Storage verified

✓ Validation successful

---

After Publication

✓ Published successfully

✓ Audit recorded

✓ Learner access verified

✓ Preview verified

✓ Download verified

---

# 21. Audit Requirements

Every operation records:

- Administrator UID
- Administrator Email
- Timestamp
- Action
- Resource
- Version

Audit records are permanent.

---

# 22. Security Rules

Administrators:

May

✓ Create

✓ Upload

✓ Publish

✓ Withdraw

Must Not

✗ Modify Firestore directly

✗ Modify Storage directly

✗ Bypass service validation

---

# 23. Governance Rules

The following rules are permanently enforced.

✓ Drafts are editable

✓ Published resources are immutable

✓ Upload does not change lifecycle

✓ Every publication is audited

✓ Every learner-specific resource is independent

✓ Firestore Rules enforce integrity

✓ Storage Rules enforce protection

✓ Service layer controls business rules

✓ UI never controls lifecycle

---

# 24. Troubleshooting Matrix

| Issue | Likely Cause | Resolution |
|---------|-------------|------------|
| Upload button disabled | Authentication/permissions | Re-authenticate and verify admin role |
| Upload fails | File exceeds limit | Reduce file size (maximum 50 MiB) |
| Validation fails | Missing metadata | Complete required fields |
| Publish fails | Firestore or Storage validation | Review logs and correct validation errors |
| Resource not visible to learner | Not published or release conditions not met | Verify publication status and learner eligibility |
| Download fails | Storage access issue | Check Storage Rules and file existence |

---

# 25. Operational Metrics

Administrators should periodically review:

- Draft resources awaiting publication
- Published resources by programme
- Withdrawn resources
- Failed upload attempts
- Failed publication attempts
- Storage usage
- Resource versions

---

# 26. Escalation

Escalate issues that involve:

- Firestore Rules failures
- Storage Rules failures
- Identity binding failures
- Data corruption
- Unauthorized access attempts
- Production deployment issues

---

# 27. Related Documents

- DOCUMENTATION-INDEX.md
- Learning Resource Lifecycle
- Firestore Collections Reference
- Firestore Schema Reference
- Storage Layout Reference
- Resource ID Naming Standard
- ADR-019 – Learning Resource Delivery Architecture
- ADR-020 – Governed Learning Resource Release Architecture
- ADR-023 – Learning Resource Registration Strategy

---

# 28. Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 27-Jul-2026 | Initial Admin Learning Resource Runbook |

---

# 29. Document Control

This runbook defines the approved operational procedure for managing
learning resources in the Agile AI University Admin Portal.

Changes to this workflow require:

1. Approval of the platform architect
2. Updates to service-layer implementation (if applicable)
3. Updates to related documentation
4. Validation in the production environment

No administrator should bypass the governed workflow documented here.

---

**End of Document**