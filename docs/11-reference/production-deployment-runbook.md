# Production Deployment Runbook

**Document ID:** RUNBOOK-005
**Title:** Production Deployment Runbook
**Version:** 1.0.0
**Status:** ACTIVE
**Owner:** Agile AI University
**Architect:** Dileep Appupillai
**Audience:** Platform Administrators

---

# 1. Purpose

This runbook defines the approved production deployment procedure for
Agile AI University.

The objective is to ensure every production deployment is:

- repeatable
- auditable
- low risk
- reversible
- validated
- fully governed

This document applies to every production release.

---

# 2. Scope

This runbook covers:

- Firebase Hosting deployments
- Cloud Functions deployments
- Firestore configuration changes
- Firebase Storage Rule deployments
- Firestore Rule deployments
- Portal releases
- Admin Portal releases
- Backend releases

---

# 3. Deployment Principles

Every deployment follows these principles.

✓ Small deployments

✓ One logical change at a time

✓ Validate immediately

✓ Audit every deployment

✓ Roll back when necessary

✓ Never deploy unrelated changes together

---

# 4. Deployment Workflow

```text
Implementation

↓

Review

↓

Commit

↓

Deploy

↓

Production Validation

↓

Monitoring

↓

Close Deployment
```

No deployment skips validation.

---

# 5. Pre-Deployment Checklist

Before deployment verify:

✓ Change reviewed

✓ Documentation updated

✓ Firestore schema unchanged or approved

✓ Security Rules validated

✓ Storage Rules validated

✓ Version number updated (if applicable)

✓ Commit message prepared

---

# 6. Step 1 – Review Changes

Confirm:

- Business requirement satisfied
- No unrelated changes included
- Architecture principles maintained
- Documentation updated

---

# 7. Step 2 – Commit Changes

Create a descriptive commit.

Examples:

```text
feat: add governed learning resource publication workflow
```

```text
fix: resolve credential portfolio sidebar rendering
```

```text
refactor: simplify entitlement resolver
```

Every commit should represent one logical unit of work.

---

# 8. Step 3 – Deploy

Deploy only the affected components.

Examples:

Hosting

```text
firebase deploy --only hosting
```

Functions

```text
firebase deploy --only functions
```

Rules

```text
firebase deploy --only firestore:rules
```

Storage

```text
firebase deploy --only storage
```

Avoid deploying unaffected services.

---

# 9. Step 4 – Production Validation

Immediately after deployment verify:

✓ Application loads

✓ Authentication

✓ Authorization

✓ Dashboard

✓ Navigation

✓ Firestore access

✓ Storage access

✓ Downloads

✓ Error logs

---

# 10. Platform Validation Checklist

Validate:

## Student Portal

- Login
- Dashboard
- Credentials
- Learning Resources
- Downloads
- Sign Out

---

## Admin Portal

- Login
- Navigation
- Learning Resource Management
- Credential Management
- Upload
- Publish
- Reports

---

## Backend Services

- Authentication
- Identity Resolution
- Entitlement Resolution
- Learning Resource Resolver
- Credential Services

---

# 11. Security Validation

Confirm:

✓ Firestore Rules active

✓ Storage Rules active

✓ Unauthorized access blocked

✓ Admin operations protected

✓ Learner isolation maintained

---

# 12. Data Validation

Verify:

- Firestore documents
- Storage objects
- Published resources
- Credential assets
- Audit records

No unexpected data changes should occur.

---

# 13. Monitoring

Monitor immediately after deployment.

Check:

- Browser Console
- Cloud Function Logs
- Firebase Console
- Firestore
- Storage
- Authentication

Investigate every unexpected error.

---

# 14. Rollback Strategy

Rollback should be considered when:

- Authentication fails
- Authorization fails
- Dashboard unavailable
- Learning Resources unavailable
- Credential publication broken
- Critical production errors

Rollback should restore the previous stable deployment.

---

# 15. Emergency Response

If a deployment introduces a critical issue:

1. Stop further deployments.
2. Assess the impact.
3. Roll back to the previous stable version if necessary.
4. Verify platform functionality.
5. Document the incident.
6. Plan and test the corrective change before redeployment.

---

# 16. Deployment Checklist

Before Deployment

✓ Code reviewed

✓ Documentation updated

✓ Commit created

✓ Deployment target confirmed

After Deployment

✓ Student Portal validated

✓ Admin Portal validated

✓ Backend validated

✓ Security verified

✓ Downloads verified

✓ Audit completed

---

# 17. Troubleshooting Matrix

| Issue | Possible Cause | Resolution |
|--------|----------------|------------|
| Hosting not updated | Cached assets | Hard refresh and verify deployment target |
| Login failure | Authentication configuration | Verify Firebase Authentication settings |
| Firestore access denied | Firestore Rules | Review and redeploy rules |
| Storage download failure | Storage Rules | Verify Storage Rules and object paths |
| Missing dashboard data | Backend service issue | Check Cloud Function logs and Firestore |

---

# 18. Governance Rules

The following rules are mandatory.

✓ Deploy one logical change at a time.

✓ Validate immediately after deployment.

✓ Never bypass security validation.

✓ Never deploy directly without a reviewed commit.

✓ Every deployment must be documented.

✓ Production issues take priority over new features.

---

# 19. Operational Metrics

Track:

- Deployment date
- Deployment duration
- Number of files changed
- Validation completion time
- Rollback required (Yes/No)
- Critical defects
- Post-deployment incidents

These metrics support continuous improvement.

---

# 20. Related Documents

- DOCUMENTATION-INDEX.md
- Identity Activation Runbook
- Bridge Programme Registration Runbook
- Credential Publication Runbook
- Learning Resource Lifecycle
- Firestore Schema Reference
- Storage Layout Reference

---

# 21. Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 27-Jul-2026 | Initial Production Deployment Runbook |

---

# 22. Document Control

This runbook defines the approved deployment procedure for Agile AI
University production environments.

Any changes to the deployment process require:

1. Architectural approval
2. Documentation updates
3. Operational review
4. Validation in production

No production deployment may bypass the governed process defined in this
runbook.

---

**End of Document**