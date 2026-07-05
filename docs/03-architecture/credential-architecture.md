# Agile AI University

# Credential Architecture

**Version:** 3.0

**Status:** ACTIVE

**Architecture Status:** LOCKED

**Last Updated:** July 2026

---

# Purpose

This document defines the Credential Platform Architecture used throughout the Agile AI University ecosystem.

It documents

- Credential lifecycle
- Credential Registry
- Credential Experience
- Certificate Architecture
- Badge Architecture
- Recognition Framework
- Verification
- Learning Integration
- Revenue Integration
- Future Wallet Architecture

This document is the authoritative reference for all credential-related architecture.

---

# Executive Summary

Credentials are the central digital asset within the Agile AI University ecosystem.

Every learner journey ultimately results in one or more credentials.

The platform is designed around a Registry-Driven Credential Architecture where credentials become the source for every learner experience.

---

# Vision

```
Learning

↓

Assessment

↓

Credential

↓

Certificate

↓

Badge

↓

Recognition

↓

Verification

↓

Sharing

↓

Wallet

↓

Executive Insights
```

The credential is the centre of the learner ecosystem.

---

# Credential Lifecycle

```
Programme

↓

Registration

↓

Payment

↓

Enrollment

↓

Learning

↓

Assessment

↓

Credential Issuance

↓

Recognition

↓

Verification

↓

Digital Assets

↓

Lifetime Portfolio
```

---

# Architecture Principles

The Credential Platform follows

- Registry Driven
- Resolver First
- Service First
- Experience Driven
- Single Responsibility
- Shared Services
- Independent Presentation
- Modular Components

These principles are mandatory.

---

# Credential Registry

The Credential Registry is the authoritative source for every credential.

Responsibilities

- Credential metadata
- Programme association
- Candidate information
- Verification information
- Available assets
- Recognition references

Nothing bypasses the Credential Registry.

---

# Credential Experience

Credentials are consumed through the Experience Architecture.

```
Dashboard

↓

Credential Card

↓

Credential Detail Experience

↓

Assets
```

Reference

```
portal/
experience-architecture.md
```

---

# Credential Detail Experience

The learner interacts with credentials through an overlay experience.

Architecture

```
Overlay

↓

Header

↓

Credential Information

↓

Recognition

↓

Verification

↓

Available Assets

↓

Actions
```

Each section owns one responsibility.

---

# Credential Assets

A credential may expose

- University Certificate
- Trainer Certificate
- Digital Badge
- Recognition Assets
- Verification
- Sharing
- Wallet Export

Assets are registry driven.

No asset is hardcoded.

---

# Certificate Architecture

Certificates are generated independently.

Supported

- University Certificate
- Trainer Certificate

Certificates are presentation assets.

Certificates never own credential data.

They consume credential information.

---

# Badge Architecture

Digital badges are generated independently.

Badges

- Consume Credential Registry
- Consume Recognition Registry

Badges never duplicate credential information.

---

# Recognition Architecture

Recognition is independent of credential presentation.

Recognition

- References Credential
- References Programme
- References Registry

Recognition becomes another experience.

---

# Verification Architecture

Verification consumes

- Credential Registry
- Recognition Registry

Verification never depends upon UI.

Verification remains platform independent.

---

# Service Architecture

Credential business logic resides inside services.

Examples

- Credential Service
- Credential Registry Service
- Verification Service
- Recognition Service

Services

✓ Query Firestore

✓ Aggregate data

✓ Resolve business rules

Never

✗ Render UI

✗ Build HTML

✗ Manipulate DOM

---

# Experience Relationship

```
Credential

↓

Credential Card

↓

Credential Detail

↓

Certificates

↓

Badge

↓

Recognition

↓

Verification
```

The Experience Layer consumes credential services.

---

# Portal Integration

Credential Experience integrates with

- Student Dashboard
- Learning Journey
- Assessment Platform
- Executive Portal
- Revenue Platform

The credential becomes the shared digital asset.

---

# Future Expansion

Future capabilities include

- Wallet Export
- Open Badges
- Blockchain Verification
- Executive Credential Analytics
- Career Portfolio
- AI Credential Advisor
- Public Credential Sharing
- API Access

The architecture is designed to support future expansion without architectural change.

---

# Governance

Always

✓ Registry Driven

✓ Service First

✓ Resolver First

✓ Experience Driven

✓ Shared Assets

✓ Shared Registries

Never

✗ Duplicate credential data

✗ Duplicate certificate data

✗ Duplicate badge data

✗ Implement business logic inside UI

✗ Query Firestore from presentation

---

# Relationship to Other Architecture Documents

Portal Architecture

```
portal-architecture.md
```

Experience Architecture

```
portal/
experience-architecture.md
```

Firebase Hosting

```
firebase-hosting.md
```

---

# Long-Term Vision

The Credential Platform is the digital foundation of the Agile AI University ecosystem.

Every learner journey, executive insight, recognition programme and future AI capability ultimately consumes credential information through shared registries, services and experiences.

The architecture is designed for long-term modular growth while maintaining strict governance and a solo-developer friendly implementation model.

---

# Status

**Architecture Version:** 3.0

**Status:** ACTIVE

**Governance:** LOCKED

**Owner:** Agile AI University