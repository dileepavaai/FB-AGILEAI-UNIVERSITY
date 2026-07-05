# Agile AI University

# Firebase Hosting Architecture

**Version:** 2.0

**Status:** ACTIVE

**Architecture Status:** LOCKED

**Last Updated:** July 2026

---

# Purpose

This document defines the Firebase Hosting architecture used across the Agile AI University ecosystem.

It documents:

- Hosting topology
- Multi-site hosting
- Deployment strategy
- Domain architecture
- Routing strategy
- Environment separation
- Governance standards

This document is the authoritative reference for all Firebase Hosting decisions.

---

# Executive Summary

Agile AI University uses a Firebase Multi-Site Hosting Architecture.

Every major platform capability is deployed as an independent hosting target while remaining within a single Firebase project.

This architecture provides

- Independent deployments
- Independent release cycles
- Clear domain ownership
- Improved scalability
- Lower deployment risk

The architecture supports the long-term evolution of the Agile AI University ecosystem.

---

# Architecture Principles

The hosting architecture follows the following principles.

- Multi-Site Hosting
- Independent Deployments
- Capability Isolation
- Single Firebase Project
- Shared Authentication
- Shared Firestore
- Shared Storage
- Shared Cloud Functions
- Independent UI Delivery

These principles are mandatory.

---

# Hosting Architecture

```
                    Firebase Project

                           │

 ┌─────────────────────────┼─────────────────────────┐

 │                         │                         │

 Public Website      Student Portal          Admin Portal

 │                         │                         │

 public-site        public-portal          public-admin

 │                         │                         │

 Independent         Independent           Independent

 Deployment          Deployment            Deployment

```

---

# Hosting Targets

The platform currently contains the following hosting targets.

| Hosting Target | Purpose |
|----------------|---------|
| public-site | Public website |
| public-portal | Student & Executive Portal |
| public-admin | Administration Portal |
| public-assessment | Assessment Platform |
| public-certs | Certificate Platform |
| public-lab | Agile AI Leadership Lab |
| public-learn | Learning Platform |
| public-edu | Education Platform |

Additional hosting targets may be introduced in the future without impacting existing deployments.

---

# Domain Architecture

Each hosting target owns an independent domain.

Examples

| Domain | Purpose |
|---------|---------|
| agileai.university | Public Website |
| portal.agileai.university | Student Portal |
| admin.agileai.university | Administration Portal |
| assessment.agileai.university | Assessment Platform |
| certs.agileai.university | Certificate Services |
| learn.agileai.university | Learning Platform |
| lab.agileai.university | Leadership Lab |

---

# Shared Platform Services

Although hosting is independent, platform services remain shared.

Shared Services

- Firebase Authentication
- Cloud Firestore
- Cloud Storage
- Cloud Functions
- Cloud Run
- Security Rules

Hosting separation never duplicates backend services.

---

# Deployment Strategy

Each hosting target is deployed independently.

Example

```
firebase deploy --only hosting:public-site

firebase deploy --only hosting:public-portal

firebase deploy --only hosting:public-admin
```

Deployments are isolated.

Deploying one hosting target must never affect another.

---

# Routing Strategy

Each hosting target owns its own routing configuration.

Responsibilities include

- Landing Pages
- Experience Routing
- Authentication Redirects
- Error Pages
- Static Assets

Routing is isolated within the hosting target.

---

# Authentication Strategy

Authentication is shared across all hosting targets.

Authentication responsibilities

- Google Sign-In
- Email Magic Link
- Session Persistence
- Session Restoration

Authentication state may be reused across hosting targets where permitted.

---

# Shared Resources

The following resources are shared.

- Firestore Database
- Cloud Storage
- Authentication
- Cloud Functions
- Cloud Run
- Registries
- Resolver Services

No duplicate infrastructure is created for individual hosting targets.

---

# Architecture Benefits

The hosting architecture provides

- Independent releases
- Lower deployment risk
- Easier rollback
- Better maintainability
- Improved scalability
- Clear ownership
- Modular growth

---

# Governance Rules

Always

✓ Deploy hosting targets independently

✓ Keep backend services shared

✓ Maintain consistent routing standards

✓ Use hosting aliases

✓ Isolate UI deployment

Never

✗ Duplicate Firestore

✗ Duplicate Authentication

✗ Duplicate Cloud Functions

✗ Couple deployments together

✗ Share static assets across unrelated hosting targets

---

# Relationship to Portal Architecture

Firebase Hosting provides the delivery infrastructure.

Portal Architecture defines how the Student Portal is implemented.

Experience Architecture defines how learner experiences are organised.

Relationship

```
Firebase Hosting

↓

Portal Architecture

↓

Experience Architecture

↓

Credential Experience

↓

Learning Journey

↓

Assessment

```

---

# Future Growth

The hosting architecture is designed to support future platform expansion.

Examples include

- Executive Portal
- AI Coach
- Research Portal
- Wallet Services
- Marketplace
- API Portal
- Developer Portal

Each future capability may become an independent hosting target.

---

# Long-Term Vision

The Agile AI University ecosystem is designed as a collection of independently deployable web applications that share a common backend platform.

This architecture enables rapid delivery while maintaining a consistent user experience across the ecosystem.

---

# Related Architecture Documents

Portal Architecture

```
portal-architecture.md
```

Experience Architecture

```
portal/experience-architecture.md
```

Credential Architecture

```
credential-architecture.md
```

---

# Status

**Architecture Version:** 2.0

**Status:** ACTIVE

**Governance:** LOCKED

**Owner:** Agile AI University