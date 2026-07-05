# Agile AI University

# Student & Executive Portal

# Portal Architecture

**Version:** 5.0

**Status:** ACTIVE

**Architecture Status:** LOCKED

**Last Updated:** July 2026

---

# Executive Summary

The Student & Executive Portal is the unified digital experience platform for learners, executives, trainers, assessors and future AI-enabled services within the Agile AI University ecosystem.

The portal has evolved from a traditional dashboard-centric application into a modular Experience-Driven Platform designed for long-term scalability, maintainability and independent evolution of learner capabilities.

The portal serves as the primary authenticated entry point into the Agile AI University ecosystem.

---

# Architectural Vision

The architecture is built around independent architectural layers.

```
Authentication

↓

Authorization

↓

Entitlement Resolution

↓

Resolver

↓

Services

↓

Experience Layer

↓

Shared UI Framework

↓

Portal UI
```

Each layer owns a single responsibility.

No architectural layer bypasses another.

---

# Architectural Principles (LOCKED)

The portal follows the following principles.

- Resolver First
- Service First
- Registry Driven
- Experience Driven
- Component Driven
- Overlay Driven
- Single Responsibility
- Separation of Concerns
- Modular Architecture
- Shared UI Framework
- Future AI Ready

These principles are mandatory across the entire Student & Executive Portal.

---

# Layered Architecture

## Authentication Layer

Responsibilities

- User Authentication
- Session Management
- Google Sign-In
- Email Magic Link
- Authentication State

Never

- Render UI
- Resolve Entitlements
- Query Credentials

Reference

```
portal-authentication-layer.md
```

---

## Authorization Layer

Responsibilities

- Portal Access
- Role Validation
- Executive Access
- Student Access

Never

- Render Dashboard
- Query Credentials
- Render Experiences

Reference

```
portal-authorization-layer.md
```

---

## Entitlement Layer

Responsibilities

- Resolve learner capabilities
- Resolve executive capabilities
- Resolve upgrade eligibility
- Resolve dashboard visibility

Reference

```
portal-entitlement-layer.md
```

---

## Dashboard Architecture

The Dashboard is the landing experience after successful authentication.

Responsibilities

- Dashboard orchestration
- Widget composition
- Dashboard layout

Architecture

```
Dashboard

↓

Widgets

↓

Cards
```

Reference

```
dashboard-gating-layer.md
```

---

# Experience Architecture

The Portal adopts an Experience-Driven Architecture.

Every learner capability is implemented as an independent Experience.

Examples

- Credential Detail
- Recognition Detail
- Learning Journey
- Assessment Summary
- Upgrade Registration
- Executive Insights

Each experience owns its presentation while consuming shared services.

Reference

```
experience-architecture.md
```

---

# Shared UI Framework

The portal uses reusable presentation frameworks.

Shared Frameworks

- buttons.css
- cards.css
- overlay.css
- design-tokens.css

Experience-specific presentation remains isolated.

Example

```
credential-detail/

    credential-detail-overlay.css
```

---

# Service Architecture

Business logic resides exclusively within Services.

Services

- Dashboard Service
- Credential Service
- Recognition Service
- Eligibility Service
- Assessment Service

Services

- Consume Registries
- Consume Firestore
- Aggregate Business Logic

Services never render HTML.

---

# Registry Architecture

The portal is Registry Driven.

Examples

- Credential Registry
- Recognition Registry
- Program Registry
- Entitlement Registry

No presentation component may hardcode registry data.

---

# Component Architecture

Presentation components never implement business logic.

Presentation hierarchy

```
Experience

↓

Overlay

↓

Header

↓

Information

↓

Recognition

↓

Verification

↓

Assets

↓

Actions
```

Every component owns exactly one responsibility.

---

# Shared Governance

Mandatory Rules

Always

- Resolver First
- Service First
- Registry Driven
- Experience Driven
- Overlay Driven
- Single Responsibility

Never

- Query Firestore from UI
- Duplicate business logic
- Resolve authorization in UI
- Mix services with presentation
- Hardcode registry information

---

# Ecosystem Integration

The Student & Executive Portal is one subsystem within the Agile AI University platform.

```
Agile AI University

├── Public Website

├── Student Portal

├── Executive Portal

├── Assessment Platform

├── Credential Registry

├── Certificate Generator

├── Badge Generator

├── Recognition Framework

├── Verification Platform

├── Learning Journey

├── Revenue Platform

├── Trainer Portal

├── Administration Portal

├── AI Services

└── Research Platform
```

---

# Long-Term Vision

The Portal will evolve into the single authenticated experience for every learner.

Target Experience

```
Dashboard

↓

Credential Detail

↓

Recognition

↓

Learning Journey

↓

Assessment

↓

Upgrade Registration

↓

Payment

↓

Credential Issuance

↓

Executive Insights

↓

Future AI Experiences
```

The architecture is designed to support long-term modular growth while remaining maintainable for a solo development model.

---

# Supporting Architecture Documents

Authentication Layer

```
portal-authentication-layer.md
```

Authorization Layer

```
portal-authorization-layer.md
```

Entitlement Layer

```
portal-entitlement-layer.md
```

Dashboard Gating

```
dashboard-gating-layer.md
```

Experience Architecture

```
experience-architecture.md
```

Credential Architecture

```
../credential-architecture.md
```

---

# Status

**Architecture Version:** 5.0

**Status:** ACTIVE

**Governance:** LOCKED

**Architecture Owner:** Agile AI University

This document is the authoritative architectural reference for the Student & Executive Portal.