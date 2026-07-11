# Agile AI University

# Student & Executive Portal

**Version:** 3.0

**Status:** ACTIVE

**Architecture Status:** LOCKED

**Last Updated:** July 2026

---

# Purpose

The Student & Executive Portal provides the authenticated digital experience for learners, credential holders, trainers and executives.

It is responsible for consuming university services while remaining independent of credential generation and business rule execution.

The portal follows a Resolver-First Architecture where authentication, authorization and entitlement resolution complete before any presentation layer is rendered.

---

# Executive Summary

The portal serves as the primary consumption experience for the Agile AI University ecosystem.

The portal provides access to

- Dashboard
- Credential Portfolio
- University Certificates
- Digital Badges
- Trainer Certificates
- Recognition Assets
- Learning Resources
- Upgrade Opportunities
- Executive Services

The portal consumes authoritative information published by backend services and never owns business rules.

---

# Current Completion

Portal Foundation

✓ Complete

Authentication

✓ Complete

Authorization

✓ Complete

Entitlement Resolution

✓ Complete

Program Bootstrap

✓ Complete

Dashboard

✓ Complete

Credential Portfolio

✓ Complete

Credential Detail Experience

✓ Complete

Credential Asset Preview

✓ Complete

Recognition Foundation

✓ Complete

Learning Experience

Planned

Executive Experience

Planned

Wallet Integration

Planned

---

# Portal Architecture

The portal consists of seven architectural layers.

```
Authentication

↓

Authorization

↓

Entitlement Resolution

↓

Program Resolution

↓

Dashboard Orchestration

↓

Feature Modules

↓

Presentation
```

---

# Layer 1

Authentication

Responsible For

- User Sign In
- Session Management
- Firebase Authentication

Authority

portal-auth.js

---

# Layer 2

Authorization

Responsible For

- Route Protection
- User Validation
- Role Resolution

Authority

portal-authorization.js

---

# Layer 3

Entitlement Resolution

Responsible For

- Student Entitlements
- Executive Entitlements
- Program Bootstrap
- Initial Credential Resolution

Authority

Cloud Run

resolve-user-entitlements.js

Presentation does not render until entitlement resolution completes.

---

# Layer 4

Program Resolution

Responsible For

- Program Metadata
- Program Names
- Program Codes
- Upgrade Relationships
- Available Assets

Authority

ProgramService

Program definitions are bootstrapped once and cached for the duration of the session.

UI components never query Firestore.

---

# Layer 5

Dashboard Orchestration

Responsible For

- Dashboard View Model
- KPI Resolution
- Recent Credentials
- Recognition Summary
- Upgrade Summary
- Quick Access

Authority

DashboardService

DashboardService aggregates presentation data.

Business rules remain outside the dashboard.

---

# Layer 6

Feature Modules

Responsible For

- Credential Services
- Recognition Services
- Learning Services
- Upgrade Services
- Executive Services

Each feature module owns its own presentation orchestration.

---

# Layer 7

Presentation

Responsible For

- Widgets
- Cards
- Overlays
- Asset Preview
- Rendering

Presentation components contain no business logic.

Presentation never queries Firestore.

Presentation consumes immutable View Models only.

---

# Program Bootstrap Architecture

**Status**

LOCKED

Cloud Run returns

- User
- Entitlements
- Credentials
- Executive Information
- Program Definitions

Program Definitions are cached as

window.__AAIU_PROGRAMS__

ProgramService becomes the single authority for

- Program Names
- Program Codes
- Available Assets
- Upgrade Metadata

No UI component performs Firestore lookups.

---

# Credential Architecture

The Student Portal is a credential consumption platform.

Responsibilities

✓ Display Credentials

✓ Display Certificates

✓ Display Badges

✓ Display Recognition

✓ Download Assets

✓ Share Assets

The portal never

✗ Generates Certificates

✗ Generates Badges

✗ Creates Credential Assets

✗ Updates Credential Registry

---

# Credential Asset Architecture

**Status**

LOCKED

Asset lifecycle

```
Admin Portal

↓

Generate Asset

↓

Upload Storage

↓

Publish Credential Asset Registry

↓

Student Portal

↓

Preview

↓

Download

↓

Share
```

The Student Portal only consumes published assets.

---

# Credential Detail Experience

**Status**

LOCKED

Credential Details are displayed inside the dashboard experience.

There is no separate credential details page.

Navigation is intentionally minimized.

Credential assets are previewed within the portal experience.

---

# Credential Presentation Standard

Program Header

Line 1

Program Code

Example

AOP

Line 2

Program Name

Example

Agile Outcome Practitioner

This presentation standard applies to

- Dashboard
- Credential Portfolio
- Certificates
- Digital Badges
- Recognition
- Verification
- Alumni Portal
- Future Wallet

---

# Governance Principles

Resolver First

All business decisions complete before presentation.

---

Single Source of Truth

Program metadata originates from ProgramService.

Credential data originates from the Credential Registry.

Published assets originate from the Credential Asset Registry.

---

Read Only Portal

The Student Portal never modifies credential data.

---

Presentation Separation

Presentation contains no business logic.

---

Cloud Run Authority

Business aggregation belongs to Cloud Run.

---

ProgramService Authority

Program metadata belongs to ProgramService.

---

Credential Registry Authority

Credential ownership belongs to the Credential Registry.

---

Credential Asset Registry Authority

Published assets belong to the Credential Asset Registry.

---

Student Portal Principle

The Student Portal is a consumption platform.

It never generates university assets.

---

# Governance References

Portal Governance

docs/02-governance/portal/portal-governance.md

Portal UI Governance

docs/02-governance/portal/portal-ui-governance.md

Credential Governance

docs/02-governance/credential/credential-governance.md

Founding Credential Architecture

docs/04-decisions/ADR-006-Founding-Credential-Architecture.md

---

# Future Evolution

The architecture supports

- Additional Programs
- Additional Credential Types
- Executive Services
- Wallet Integration
- Alumni Platform
- AI Recommendations
- Learning Journey
- Professional Recognition
- International Credentials

without architectural redesign.

---

# Status

**Architecture**

LOCKED

**Governance**

LOCKED

**Portal Pattern**

Consumption First

**Production Status**

ACTIVE

The Student & Executive Portal is the official consumption experience for the Agile AI University ecosystem and operates under the governance defined by the Credential Governance Standard and the Founding Credential Architecture decision.