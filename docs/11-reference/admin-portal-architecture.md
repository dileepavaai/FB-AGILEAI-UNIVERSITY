# Admin Portal Architecture

**Document ID:** ARCH-005
**Title:** Admin Portal Architecture
**Version:** 1.0.0
**Status:** ACTIVE
**Owner:** Agile AI University
**Architect:** Dileep Appupillai
**Last Updated:** 27 July 2026

---

# 1. Purpose

This document defines the enterprise architecture of the Agile AI
University Admin Portal.

The Admin Portal is the operational control centre of the University.

It provides governed administrative capabilities for:

- Identity administration
- Credential administration
- Learning Resource administration
- Programme administration
- Registration administration
- Payment administration
- Platform governance
- Operational reporting

The Admin Portal is an administrative interface only.

It does not replace backend business services.

---

# 2. Objectives

The Admin Portal provides:

- Secure administration
- Centralized operational management
- Academic governance
- Publication workflows
- Administrative reporting
- Audit visibility
- Platform configuration
- Production-safe administration

---

# 3. Scope

The Admin Portal governs:

- Administrator authentication
- Administrative authorization
- Credential administration
- Learning Resource Management
- Publication workflows
- Identity Activation
- Programme management
- Registration oversight
- Payment oversight
- Audit visibility

It does not govern:

- Business rule execution
- Identity resolution
- Entitlement calculation
- Payment verification
- Secure file delivery

Those responsibilities belong to backend platform services.

---

# 4. Architectural Principles

The Admin Portal follows these principles.

✓ Administrator authentication first

✓ Role-based authorization

✓ Service-layer controlled operations

✓ Governance before automation

✓ Academic integrity first

✓ Complete auditability

✓ Production-safe operations

✓ No direct database manipulation

---

# 5. Platform Position

```text
Administrator

↓

Admin Portal

↓

Administrative Services

↓

Business Services

↓

Firestore

↓

Firebase Storage
```

Every administrative action flows through governed services.

---

# 6. Platform Components

The Admin Portal consists of:

- Portal Shell
- Authentication Controller
- Administrator Authorization
- Dashboard
- Identity Management
- Credential Management
- Learning Resource Management
- Registration Management
- Payment Management
- Audit Dashboard
- Reporting
- System Configuration

Each component has a clearly defined responsibility.

---

# 7. Administrative Workflow

```text
Administrator Login

↓

Authentication

↓

Authorization

↓

Dashboard

↓

Administrative Module

↓

Business Service

↓

Validation

↓

Persistence

↓

Audit Logging
```

---

# 8. Administrator Authentication

Administrators authenticate through Firebase Authentication.

Authentication responsibilities include:

- Session establishment
- Session restoration
- Secure sign-out
- Identity verification

Authentication alone does not grant administrative privileges.

---

# 9. Administrative Authorization

Authorization determines:

- Administrator role
- Allowed operations
- Module visibility
- Administrative permissions

Administrative permissions are resolved by backend services.

---

# 10. Dashboard Architecture

The dashboard provides access to:

- Identity Operations
- Credential Operations
- Learning Resource Management
- Registrations
- Payments
- Reporting
- Operational Metrics

The dashboard presents operational information only after authorization.

---

# 11. Identity Management

Identity Management supports:

- Identity activation
- Token generation
- Identity reconciliation
- Learner lookup
- Activation history

Identity binding remains a governed backend operation.

---

# 12. Credential Management

Credential Management supports:

- Credential review
- Credential publication
- Certificate generation
- Badge generation
- Trainer certificate generation
- Credential Portfolio synchronization

Credential approval workflows remain service-driven.

---

# 13. Learning Resource Management

Learning Resource Management supports:

- Draft creation
- Metadata editing
- Protected file upload
- Validation
- Publication
- Withdrawal
- Version management

Published resources remain immutable.

---

# 14. Registration Management

Registration Management provides:

- Registration review
- Eligibility monitoring
- Programme enrollment oversight
- Registration reporting

The Admin Portal does not bypass learner registration rules.

---

# 15. Payment Management

Payment Management provides visibility into:

- Payment status
- Transaction history
- Verification status
- Registration linkage

Gateway verification remains outside the UI.

---

# 16. Reporting Architecture

Administrative reports may include:

- Learner registrations
- Programme participation
- Credential publication
- Learning resource publication
- Payment summaries
- Identity activation
- Operational activity

Reports must respect authorization boundaries.

---

# 17. Administrative Navigation

Typical navigation includes:

- Dashboard
- Identity Management
- Credentials
- Learning Resources
- Registrations
- Payments
- Reports
- System Settings
- Sign Out

Navigation visibility follows administrator permissions.

---

# 18. Service Architecture

The Admin Portal interacts with:

- Identity Service
- Credential Service
- Learning Resource Service
- Registration Service
- Payment Service
- Reporting Service
- Audit Service

Services own all business logic.

---

# 19. Data Architecture

The Admin Portal consumes and updates:

- Firestore documents
- Firebase Storage
- Audit records

All persistence operations occur through governed services.

---

# 20. Security Architecture

Security includes:

- Firebase Authentication
- Administrator authorization
- Firestore Security Rules
- Storage Rules
- Backend validation
- Audit logging

Administrative operations are never trusted solely because they originate
from the Admin Portal.

---

# 21. Audit Architecture

Every administrative action records:

- Administrator UID
- Administrator Email
- Timestamp
- Operation
- Target Entity
- Result

Audit history is immutable.

---

# 22. Error Handling

Administrative errors should provide:

- Clear operational guidance
- Safe recovery options
- Retry capability where appropriate

Technical implementation details must not be exposed unnecessarily.

---

# 23. Production Safety

Administrative actions should:

- Validate before execution
- Prevent duplicate submissions
- Prevent accidental publication
- Prevent accidental deletion
- Support confirmation for destructive actions

---

# 24. Scalability

The architecture supports:

- Additional administrator roles
- Multi-campus operations
- Enterprise customers
- Delegated administration
- Advanced reporting
- Workflow automation

Scalability must preserve governance.

---

# 25. Governance Rules

The following rules are permanently enforced.

✓ Administrative actions require authentication.

✓ Administrative actions require authorization.

✓ Business rules remain in services.

✓ Published assets remain immutable.

✓ Administrative operations are fully audited.

✓ Firestore Rules and Storage Rules remain authoritative.

✓ Production data is never manipulated directly.

---

# 26. Related Documents

- DOCUMENTATION-INDEX.md
- Identity Platform Architecture
- Credential Platform Architecture
- Learning Resource Platform Architecture
- Student Portal Architecture
- Identity Activation Runbook
- Credential Publication Runbook
- Admin Learning Resource Runbook
- Production Deployment Runbook

---

# 27. Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 27-Jul-2026 | Initial Admin Portal Architecture |

---

# 28. Document Control

This document defines the authoritative architecture for the Agile AI
University Admin Portal.

Changes to administrative workflows, authorization, publication
processes, reporting, or operational governance require:

1. Architecture approval
2. Service-layer implementation updates
3. Documentation updates
4. Production validation

The Admin Portal must remain the governed operational control centre of
Agile AI University.

---

**End of Document**