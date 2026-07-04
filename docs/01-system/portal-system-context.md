# Agile AI University
# Student & Executive Portal

Version
--------
2.0

Status
------
ACTIVE

Last Updated
------------
July 2026

---

# Executive Summary

The Student & Executive Portal is the authenticated experience
for learners, credential holders, trainers and executives.

The portal provides a single entry point for consuming
credentials, certificates, badges, recognitions, learning
resources and executive services.

The portal follows a resolver-first architecture where all
business decisions are resolved before UI rendering begins.

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

Dashboard Foundation
✓ Complete

Credential Experience
✓ Complete

Program Resolution
✓ Complete

Recognition Foundation
✓ In Progress

Learning Experience
Planned

Executive Experience
Planned

---

# Architecture Layers

Layer 1
Authentication

Responsible For

• User Sign In
• Session Management
• Firebase Authentication

Authority

portal-auth.js

---

Layer 2
Authorization

Responsible For

• Route Protection
• Access Validation
• User Authorization

Authority

portal-authorization.js

---

Layer 3
Entitlement Resolution

Responsible For

• Executive Entitlements
• Student Entitlements
• Credential Resolution
• Program Bootstrap

Authority

resolve-user-entitlements.js

Cloud Run

---

Layer 4
Program Resolution

Responsible For

• Program Metadata
• Available Assets
• Upgrade Recommendations
• Future Programs

Authority

ProgramService

Program definitions are loaded once during entitlement
resolution and cached for the entire portal session.

UI components never query Firestore directly.

---

Layer 5
Dashboard Aggregation

Responsible For

• Dashboard ViewModel
• KPI Calculation
• Recent Credentials
• Recognition Summary
• Quick Access

Authority

DashboardService

---

Layer 6
Presentation

Responsible For

• Dashboard Widgets
• Credential Cards
• Recognition Cards
• Notification Cards
• Upgrade Cards

Presentation components contain no business logic.

---

# Program Bootstrap Architecture

Status

LOCKED

Cloud Run returns the complete Program Definition collection
during entitlement resolution.

Returned payload

• Credentials
• Executive Entitlement
• User Entitlements
• Programs

The Programs collection is bootstrapped into

window.__AAIU_PROGRAMS__

ProgramService becomes the single authority for resolving
Program ViewModels.

No UI component performs Firestore lookups.

This eliminates duplicate requests and guarantees a
consistent Program ViewModel throughout the portal.

---

# Credential Presentation Standard

Status

LOCKED

Credential Header

Line 1

Program Code

Example

AOP

Line 2

Program Name

Example

Agile Outcome Practitioner

This presentation standard applies consistently across

• Dashboard
• Credential Details
• Certificates
• Recognition Assets
• Verification
• Future Portal Modules

---

# Governance Principles

Resolver First

Business decisions are completed before rendering.

Single Source of Truth

Program metadata originates only from the Programs
collection.

Single Responsibility

Each service owns one responsibility.

Read-only ViewModels

Presentation consumes immutable ViewModels only.

No Firestore Access

Presentation components never access Firestore.

Cloud Run Authority

Business aggregation belongs to Cloud Run.

ProgramService Authority

Program metadata belongs to ProgramService.

---

# Future Extensions

The architecture supports

• Additional Programs
• New Credential Types
• Badge Expansion
• Recognition Expansion
• Learning Journey
• Executive Insights
• Recommendations Engine

without architectural changes.

---

Status

Governance Locked
Architecture Stable
Production Ready