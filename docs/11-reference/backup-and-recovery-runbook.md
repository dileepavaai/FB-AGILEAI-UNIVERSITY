# Backup and Recovery Runbook

**Document ID:** RUNBOOK-007  
**Title:** Backup and Recovery Runbook  
**Version:** 1.0.0  
**Status:** ACTIVE  
**Owner:** Agile AI University  
**Architect:** Dileep Appupillai  
**Audience:** Platform Administrators

---

# 1. Purpose

This runbook defines the approved backup and recovery procedures for
Agile AI University.

The objectives are to:

- protect institutional data
- preserve learner records
- recover from accidental data loss
- restore production services safely
- maintain academic integrity
- minimize operational downtime

---

# 2. Scope

This runbook applies to all production services including:

- Firebase Authentication
- Firestore Database
- Firebase Storage
- Cloud Functions
- Firebase Hosting
- Credential Platform
- Learning Resource Platform
- Student Portal
- Admin Portal
- Payment Platform
- Verification Platform

---

# 3. Recovery Objectives

The platform recovery objectives are:

✓ Preserve learner identities

✓ Preserve academic records

✓ Preserve credential assets

✓ Preserve learning resources

✓ Restore platform functionality

✓ Maintain complete audit history

Recovery always prioritizes data integrity over recovery speed.

---

# 4. Backup Principles

Every backup must satisfy:

✓ Complete

✓ Consistent

✓ Recoverable

✓ Secure

✓ Auditable

✓ Verified

Backups must never modify production data.

---

# 5. Data Classification

The platform stores several categories of information.

## Critical Data

- Credentials
- learner_uid mappings
- Identity activation records
- Payments
- Registrations
- Credential Assets
- Learning Resource metadata

---

## Protected Content

- Certificate PDFs
- Digital Badges
- Licensed Course Materials
- Trainer Certificates

---

## Platform Configuration

- Firestore Rules
- Storage Rules
- Hosting Configuration
- Cloud Functions
- Environment Configuration

---

# 6. Backup Strategy

The platform protects:

```text
Application Code

↓

Configuration

↓

Database

↓

Protected Files

↓

Audit Records
```

Each category requires independent recovery capability.

---

# 7. Backup Frequency

Recommended schedule:

| Component | Frequency |
|-----------|-----------|
| Source Code | Every commit |
| Firestore | Daily |
| Firebase Storage | Daily |
| Security Rules | Every deployment |
| Hosting Configuration | Every deployment |
| Environment Configuration | On every approved change |

---

# 8. Firestore Backup

Protect all production collections including:

- credentials
- credential_assets
- learning_resources
- learner_resource_access
- credential_activation_tokens
- identity_reconciliation_events
- registrations
- payments
- invoices
- receipts

Backups must preserve document IDs and timestamps.

---

# 9. Storage Backup

Protect all production storage including:

- credential-assets/
- learning-resources/
- trainer-assets/
- system-assets/

Verify that every protected file is included.

---

# 10. Source Code Backup

Source code protection includes:

- Git repository
- Documentation
- Firebase configuration
- Cloud Functions
- Frontend applications

Every production deployment must correspond to a committed version.

---

# 11. Configuration Backup

Protect configuration files including:

- firebase.json
- firestore.rules
- storage.rules
- indexes
- Hosting configuration

Configuration should always be recoverable independently of application data.

---

# 12. Recovery Scenarios

This runbook covers:

- Accidental document deletion
- Storage object deletion
- Deployment failure
- Corrupted configuration
- Firestore corruption
- Storage corruption
- Authentication issues
- Complete environment recovery

---

# 13. Firestore Recovery

Recovery process:

```text
Assess Damage

↓

Identify Backup

↓

Restore Required Collections

↓

Validate Documents

↓

Validate Relationships

↓

Resume Operations
```

Partial restoration is preferred over restoring the entire database whenever possible.

---

# 14. Storage Recovery

Recovery process:

```text
Identify Missing Objects

↓

Locate Backup

↓

Restore Files

↓

Validate Storage Paths

↓

Verify Downloads
```

After restoration verify:

- Preview
- Download
- Metadata
- Access permissions

---

# 15. Credential Recovery

Verify:

✓ Credential exists

✓ Credential Asset exists

✓ Verification works

✓ Portfolio displays correctly

Never recreate credentials manually unless no recoverable backup exists.

---

# 16. Learning Resource Recovery

Verify:

- Resource metadata
- Storage object
- Publication status
- Version
- Learner access

Published resources remain immutable after recovery.

---

# 17. Identity Recovery

Verify:

- learner_uid
- Credential linkage
- Email
- Identity activation
- Entitlements

Identity bindings must never be recreated manually without governance approval.

---

# 18. Recovery Validation

After every recovery verify:

✓ Authentication

✓ Authorization

✓ Dashboard

✓ Credential Portfolio

✓ Learning Resources

✓ Downloads

✓ Verification Platform

✓ Audit history

---

# 19. Disaster Recovery Workflow

```text
Incident

↓

Assessment

↓

Recovery Decision

↓

Restore

↓

Validation

↓

Production Verification

↓

Close Recovery
```

---

# 20. Recovery Checklist

Before Recovery

✓ Incident confirmed

✓ Scope identified

✓ Backup verified

✓ Recovery approved

During Recovery

✓ Preserve evidence

✓ Restore only affected components

✓ Monitor errors

After Recovery

✓ Validate production

✓ Verify learner access

✓ Verify administrator functions

✓ Record recovery actions

---

# 21. Backup Verification

Backups are only useful if they can be restored.

Regularly verify:

- Backup completion
- File integrity
- Document counts
- Storage object counts
- Restore capability

---

# 22. Security Requirements

Backup data must:

- remain encrypted
- remain access controlled
- never be publicly accessible
- preserve audit information
- maintain confidentiality

Only authorized administrators may perform restoration.

---

# 23. Common Recovery Scenarios

| Scenario | Recovery Action |
|----------|-----------------|
| Firestore document deleted | Restore affected documents from backup |
| Storage file deleted | Restore affected storage object |
| Deployment failure | Roll back to previous stable deployment |
| Configuration corruption | Restore configuration from version control |
| Credential asset missing | Restore storage object and metadata |
| Learning resource unavailable | Restore resource metadata and verify publication |

---

# 24. Governance Rules

The following rules are mandatory.

✓ Production data is never modified directly without approval.

✓ Recovery actions are fully audited.

✓ Identity integrity must be preserved.

✓ Published resources remain immutable.

✓ Credential assets remain immutable.

✓ Every recovery is validated before completion.

---

# 25. Operational Metrics

Track:

- Recovery start time
- Recovery completion time
- Components restored
- Backup version used
- Validation completion
- Learner impact
- Data loss (if any)

These metrics should be reviewed after each recovery exercise.

---

# 26. Related Documents

- DOCUMENTATION-INDEX.md
- Production Deployment Runbook
- Incident Response Runbook
- Identity Activation Runbook
- Credential Publication Runbook
- Firestore Collections Reference
- Firestore Schema Reference
- Storage Layout Reference

---

# 27. Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 27-Jul-2026 | Initial Backup and Recovery Runbook |

---

# 28. Document Control

This runbook defines the approved backup and recovery procedures for
Agile AI University.

Changes to backup schedules, recovery workflows, restoration procedures,
or governance require:

1. Architecture approval
2. Operational review
3. Documentation updates
4. Successful recovery validation

All recovery operations must preserve platform integrity, learner trust,
and the University's academic records.

---

**End of Document**