# Credential Publication Runbook

**Document ID:** RUNBOOK-004
**Title:** Credential Publication Runbook
**Version:** 1.0.0
**Status:** ACTIVE
**Owner:** Agile AI University
**Architect:** Dileep Appupillai
**Audience:** Platform Administrators

---

# 1. Purpose

This runbook defines the standard operating procedure for publishing
official Agile AI University credential assets.

The workflow governs:

- Certificate publication
- Digital Badge publication
- Trainer Certificate publication
- Credential Portfolio updates
- Learner access verification

Every credential published by the University must follow this governed
workflow.

---

# 2. Scope

This runbook applies to:

- University Certificates
- Digital Badges
- Trainer Certificates
- Credential Portfolio assets

This runbook does not apply to:

- Learning Resources
- Assessment Reports
- Executive Insight Reports

---

# 3. Publication Principles

Every credential publication follows these principles.

✓ Approved Before Publication

✓ Immutable After Publication

✓ One Latest Published Version

✓ Permanent Audit Trail

✓ Service-Layer Controlled

✓ Secure Storage

---

# 4. Publication Workflow

```text
Credential Approved

↓

Generate Credential Asset

↓

Upload Protected Asset

↓

Validate

↓

Publish

↓

Update Credential Portfolio

↓

Learner Verification

↓

Download Available
```

---

# 5. Prerequisites

Before publication ensure:

✓ Credential approved

✓ Learner identity available

✓ Credential ID assigned

✓ Asset generated successfully

✓ Administrator authenticated

---

# 6. Step 1 – Verify Credential

Confirm:

- Credential ID
- Learner Name
- Programme
- Approval Status
- Credential Type

Only approved credentials may be published.

---

# 7. Step 2 – Generate Asset

Generate the required asset.

Examples:

- University Certificate PDF
- Digital Badge PNG
- Trainer Certificate PDF

Verify branding and formatting before continuing.

---

# 8. Step 3 – Upload Protected Asset

Upload the generated asset to protected storage.

Verify:

- Correct storage path
- File integrity
- Correct content type
- Successful upload

---

# 9. Step 4 – Validate Publication

Before publishing verify:

✓ Credential exists

✓ Learner exists

✓ Storage object exists

✓ Version correct

✓ Asset type correct

✓ Required metadata complete

---

# 10. Step 5 – Publish

Publishing performs:

- Firestore update
- Credential asset registration
- Publication audit
- Portfolio synchronization

Expected values:

```text
status = published

is_latest = true
```

---

# 11. Step 6 – Update Credential Portfolio

After publication the learner's Credential Portfolio should display:

- Certificate
- Badge
- Trainer Certificate (if applicable)
- Verification Link
- Download Action

---

# 12. Step 7 – Verify Learner Access

Using an entitled learner account verify:

✓ Asset visible

✓ Download available

✓ Preview available

✓ Verification works

---

# 13. Version Management

Published assets are immutable.

When changes are required:

```text
Generate New Version

↓

Publish New Version

↓

Mark Previous Version
is_latest = false
```

Never overwrite an existing published asset.

---

# 14. Publication Rules

Only one asset may have:

```text
is_latest = true
```

for a given:

- Credential ID
- Asset Type

Previous versions remain available for audit purposes.

---

# 15. Supported Asset Types

Current supported asset types:

- University Certificate
- Digital Badge
- Trainer Certificate

Future asset types may include:

- Transcript
- Micro-Credential
- Continuing Education Certificate

---

# 16. Administrative Checklist

Before Publication

✓ Credential approved

✓ Asset generated

✓ Metadata complete

✓ Storage verified

✓ Validation successful

After Publication

✓ Portfolio updated

✓ Download verified

✓ Verification page operational

✓ Audit recorded

---

# 17. Error Recovery

## Asset Generation Failure

- Regenerate asset
- Verify template
- Retry publication

---

## Upload Failure

Verify:

- Authentication
- Storage Rules
- File size
- Storage path

Retry upload.

---

## Publication Failure

Review:

- Firestore permissions
- Required metadata
- Publication logs

Never manually edit publication records.

---

# 18. Audit Requirements

Every publication records:

- Credential ID
- Asset Type
- Version
- Published By
- Published At

Audit history is immutable.

---

# 19. Security Requirements

Credential publication requires:

- Authentication
- Authorization
- Service-layer validation
- Firestore Rules
- Storage Rules

Credential assets must never be publicly writable.

---

# 20. Governance Rules

The following rules are permanently enforced.

✓ Published assets are immutable.

✓ Credential assets require approved credentials.

✓ One latest published version per asset type.

✓ Publication occurs only through platform services.

✓ Audit history is permanent.

✓ Business rules remain outside the UI.

---

# 21. Troubleshooting Matrix

| Issue | Possible Cause | Resolution |
|--------|----------------|------------|
| Asset not visible | Publication incomplete | Verify publication status |
| Download fails | Storage issue | Check Storage Rules and object |
| Wrong version displayed | Previous version still latest | Update latest version flag |
| Verification unavailable | Registry mismatch | Verify credential registry |

---

# 22. Related Documents

- DOCUMENTATION-INDEX.md
- Identity Activation Runbook
- Learning Resource Lifecycle
- Firestore Schema Reference
- Firestore Collections Reference
- Storage Layout Reference

---

# 23. Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 27-Jul-2026 | Initial Credential Publication Runbook |

---

# 24. Document Control

This runbook defines the approved operational procedure for publishing
official Agile AI University credential assets.

Any changes to this workflow require:

1. Architecture approval
2. Service-layer updates
3. Documentation updates
4. Production validation

Published credential assets must always remain consistent with the
University's governance and academic integrity standards.

---

**End of Document**