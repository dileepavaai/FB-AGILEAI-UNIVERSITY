# Agile AI University

# Architecture Documentation

**Version:** 1.0

**Status:** ACTIVE

**Last Updated:** July 2026

---

# Purpose

This directory contains the official architecture documentation for the Agile AI University ecosystem.

The documentation is organised into independent architectural domains so that each architectural concern can evolve independently while remaining governed by common platform principles.

This README serves as the master navigation document for all architecture references.

---

# Architecture Principles

The Agile AI University platform follows a governed architecture based on:

- Layered Architecture
- Resolver First
- Service First
- Registry Driven
- Experience Driven
- Component Driven
- Overlay Driven
- Shared UI Framework
- Single Responsibility
- Separation of Concerns

These principles are mandatory across the entire platform.

---

# Architecture Documents

## Portal Architecture

```
portal-architecture.md
```

Defines the overall architecture of the Student & Executive Portal including architectural layers, governance, services and long-term vision.

---

## Experience Architecture

```
portal/
experience-architecture.md
```

Defines the Experience-Driven Architecture used throughout the portal.

Includes

- Experience lifecycle
- Overlay architecture
- Component standards
- CSS standards
- JavaScript standards
- Governance rules
- Future experience model

---

## Dashboard Gating Layer

```
portal/
dashboard-gating-layer.md
```

Defines dashboard orchestration, routing and access gating.

---

## Authentication Layer

```
portal/
portal-authentication-layer.md
```

Defines

- Authentication
- Session management
- Login architecture
- Identity providers

---

## Authorization Layer

```
portal/
portal-authorization-layer.md
```

Defines

- Portal authorization
- Role validation
- Access control
- Permission model

---

## Entitlement Layer

```
portal/
portal-entitlement-layer.md
```

Defines

- Capability resolution
- Learner entitlements
- Executive entitlements
- Upgrade eligibility

---

## Recognition Governance

```
portal/
portal-recognition-governance.md
```

Defines recognition architecture and governance standards.

---

## Login Architecture

```
portal/
portal-login-authentication-authorization-architecture.md
```

Defines the complete authentication, authorization and login sequence.

Includes the associated architecture diagram.

---

## Credential Architecture

```
credential-architecture.md
```

Defines the Credential Platform architecture including

- Credential Registry
- Certificate Architecture
- Badge Architecture
- Recognition Assets
- Verification Architecture

---

## Firebase Hosting

```
firebase-hosting.md
```

Defines

- Multi-hosting architecture
- Deployment model
- Hosting targets
- Routing strategy

---

# Architecture Relationships

The platform architecture is organised into independent but related layers.

```
Portal Architecture

│

├── Authentication

├── Authorization

├── Entitlements

├── Dashboard

├── Experience Architecture

│      │

│      ├── Credential Detail

│      ├── Recognition Detail

│      ├── Learning Journey

│      ├── Assessment Summary

│      ├── Upgrade Registration

│      └── Executive Insights

│

├── Services

├── Registries

├── Shared UI Framework

└── Platform Governance
```

---

# Shared UI Framework

The portal uses common UI frameworks shared across all experiences.

```
buttons.css

cards.css

overlay.css

design-tokens.css
```

Experience-specific styling remains isolated inside the corresponding experience.

Example

```
credential-detail/

    credential-detail-overlay.css
```

---

# Experience Model

Every learner capability is implemented as an Experience.

Standard experience structure

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

Business logic remains inside Services.

Presentation remains inside Experiences.

---

# Governance

Mandatory

✓ Resolver First

✓ Service First

✓ Registry Driven

✓ Experience Driven

✓ Overlay Driven

✓ Single Responsibility

✓ Modular Components

Never

✗ Firestore inside UI

✗ Authorization inside UI

✗ Duplicate business logic

✗ Duplicate rendering

✗ Hardcode registry data

---

# Long-Term Vision

The Student & Executive Portal is evolving into the unified digital experience platform for Agile AI University.

Future experiences include

- Credential Detail
- Recognition Detail
- Learning Journey
- Assessment Summary
- Upgrade Registration
- Executive Insights
- AI Learning Assistant
- Career Journey
- Wallet Integration

Every future capability must conform to the architectural standards documented within this directory.

---

# Document Ownership

Owner

Agile AI University

Architecture Governance Board

Status

ACTIVE

Architecture Governance

LOCKED