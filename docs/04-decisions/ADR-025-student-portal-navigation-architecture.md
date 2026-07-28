# ADR-025 – Student Portal Navigation Architecture

| Attribute | Value |
|------------|-------|
| ADR Number | ADR-025 |
| Title | Student Portal Navigation Architecture |
| Status | Accepted |
| Decision Date | 2026-07-28 |
| Owners | Agile AI University Architecture Board |
| Decision Authority | Founder & Chief Architect |
| Version | 1.0 |
| Priority | High |
| Related ADRs | ADR-019, ADR-020, ADR-021, ADR-022, ADR-023, ADR-024 |

---

# 1. Executive Summary

This Architecture Decision Record establishes the official navigation architecture for the Agile AI University Student & Executive Portal.

The Student Portal serves as the primary digital academic workspace for every learner and executive participant.

Its navigation must remain:

- simple
- scalable
- academically organised
- governance driven
- future-proof

The sidebar navigation is therefore treated as an architectural component rather than a purely visual interface element.

---

# 2. Purpose

The navigation architecture shall provide a consistent institutional structure that enables learners to locate academic resources, programme services, institutional services, and personal account functions without ambiguity.

Navigation shall reflect the University's operating model rather than implementation details.

---

# 3. Guiding Principles

The navigation architecture follows these principles.

## Academic First

Learning-related activities take precedence within the navigation hierarchy.

---

## Institutional Structure

Menu organisation reflects the University's academic and administrative structure.

---

## Single Responsibility

Every menu item represents one primary destination.

Duplicate navigation paths are prohibited.

---

## Scalability

New functionality shall be added within existing navigation groups whenever possible.

Creation of additional groups requires architectural review.

---

## Consistency

Navigation terminology shall remain stable across all student-facing systems.

---

# 4. Navigation Architecture

The official Student Portal sidebar is organised into four sections.

```
ACADEMICS

• Dashboard
• My Credentials
• Learning Resources
• Agile AI Learning Specification
• Assessment Platform


PROGRAMMES

• Bridge Programme Registration
• My Enrolments
• Learning History


UNIVERSITY SERVICES

• Verify Credential


ACCOUNT

• Profile
• Support
• Sign Out
```

This hierarchy is the authoritative navigation model for the MVP.

---

# 5. Section Definitions

## ACADEMICS

Purpose:

Provides access to academic activities, learning assets, credentials, specifications, and assessments.

Examples:

- Dashboard
- My Credentials
- Learning Resources
- Agile AI Learning Specification
- Assessment Platform

Future additions:

- AI Tutor
- Study Planner
- Learning Calendar
- Knowledge Explorer
- Competency Dashboard

---

## PROGRAMMES

Purpose:

Supports programme participation throughout the learner lifecycle.

Examples:

- Bridge Programme Registration
- My Enrolments
- Learning History

Future additions:

- Programme Catalogue
- Upgrade Journey
- Continuing Professional Development (CPD)
- Event Registrations
- Workshop Enrolments

---

## UNIVERSITY SERVICES

Purpose:

Provides institution-wide services available independently of any single programme.

Examples:

- Verify Credential

Future additions:

- Alumni Services
- Membership Services
- Academic Requests
- Certificate Reissue
- Transcript Requests

---

## ACCOUNT

Purpose:

Personal account management.

Examples:

- Profile
- Support
- Sign Out

Future additions:

- Preferences
- Security
- Notifications
- Connected Accounts

---

# 6. Navigation Governance Rules

The following rules are permanently adopted.

## Rule 1

Every menu item belongs to exactly one section.

---

## Rule 2

Duplicate navigation destinations are prohibited.

Example:

"My Credentials" already contains:

- Certificates
- Digital Badges
- Trainer Certificates
- Recognition Assets

Separate menu entries for those assets shall not be created.

---

## Rule 3

Navigation labels must use learner-centric terminology.

Internal implementation names shall never appear.

---

## Rule 4

Menu ordering shall follow the learner journey.

Learning before administration.

Academic activities before institutional services.

---

## Rule 5

Navigation changes require architectural approval.

The sidebar is considered part of the institutional architecture.

---

# 7. Relationship to the Agile AI Ecosystem

The Student Portal functions as the unified entry point into multiple governed platforms.

```
Student Portal

│

├── Credential Platform

├── Learning Resource Platform

├── Agile AI Learning Specification Platform

├── Assessment Platform

├── Verification Platform

└── Future Academic Services
```

Each platform remains independently governed while presenting a unified learner experience.

---

# 8. Agile AI Learning Specification

The menu item "Agile AI Learning Specification" provides access to the University's official specification platform.

The platform contains:

- academic standards
- learning specifications
- capability models
- governance
- architecture
- registries
- publications
- institutional references

This menu item represents the University's authoritative academic reference system.

---

# 9. Future Growth

The navigation architecture is designed to accommodate future services without restructuring the existing hierarchy.

Examples include:

- Payments
- AI Mentor
- Learning Analytics
- Digital Transcript
- Membership Benefits
- Alumni Portal
- Career Services
- CPD Tracking

These services shall be incorporated into the appropriate section according to the governance rules defined in this ADR.

---

# 10. Benefits

The architecture provides:

- consistent learner experience
- scalable navigation
- reduced duplication
- clearer academic organisation
- governance alignment
- simplified onboarding
- easier maintenance
- future extensibility

---

# 11. Architectural Decision

The Agile AI University Architecture Board formally adopts this navigation architecture as the official sidebar structure for the Student & Executive Portal.

Future navigation changes shall preserve the established information architecture unless superseded by a subsequent Architecture Decision Record.

---

# 12. Status

**Status:** ACCEPTED

**Version:** 1.0

**Effective:** Immediate

**Production Scope:** Student & Executive Portal

**Governance Classification:** Core Platform Architecture

**Breaking Change:** No