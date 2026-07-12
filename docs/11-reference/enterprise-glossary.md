# Agile AI University

# Enterprise Glossary

**Version:** 1.0.0

**Status:** ACTIVE

**Classification:** Enterprise Reference

**Last Updated:** July 2026

---

# Purpose

The Enterprise Glossary defines the official business, architectural, governance, operational, and technical terminology used throughout the Agile AI University ecosystem.

It establishes a common vocabulary across documentation, architecture, development, governance, enterprise services, APIs, platforms, and operational procedures.

Every document within the Agile AI University repository should use the terminology defined in this glossary.

---

# Objectives

The Enterprise Glossary exists to:

- Standardize enterprise terminology
- Reduce ambiguity
- Promote consistent communication
- Support architecture governance
- Improve documentation quality
- Accelerate onboarding
- Preserve institutional knowledge
- Maintain long-term consistency

---

# Usage

This glossary is the authoritative source for enterprise terminology.

When introducing new terminology:

- Verify whether an existing definition already exists.
- Reuse existing terminology whenever possible.
- Introduce new terms only when necessary.
- Update this glossary before using the new term across the ecosystem.

---

# Enterprise Terms

---

## Agile AI

The discipline that integrates Agile ways of working with Artificial Intelligence to create adaptive, responsible, scalable, and value-driven systems.

---

## Agile AI University

The enterprise responsible for developing, delivering, governing, assessing, and credentialing Agile AI capabilities.

---

## Enterprise

The complete Agile AI University ecosystem including all platforms, services, domains, governance, architecture, infrastructure, and operational capabilities.

---

## Enterprise Platform

A user-facing or system-facing platform providing one or more enterprise capabilities.

Examples include:

- Public Website
- Student & Executive Portal
- Admin Portal
- Assessment Platform
- Verification Platform

---

## Enterprise Service

A governed business capability that exposes a Domain through a stable business contract.

Enterprise Services contain business logic.

Examples include:

- ProgramService
- RegistrationService
- PaymentService
- LearningService
- CredentialService

---

## Enterprise Domain

A business capability boundary that owns a specific area of enterprise responsibility.

Examples include:

- Programme Domain
- Registration Domain
- Payment Domain
- Learning Domain
- Credential Domain

---

## Enterprise Registry

The authoritative institutional source of truth for a business capability.

Registries store governed enterprise information.

Presentation platforms shall not access registries directly.

---

## Enterprise API

The implementation interface exposing an Enterprise Service.

Enterprise APIs expose services.

They do not own business logic.

---

## Enterprise Runtime

The execution layer responsible for orchestrating enterprise services during request processing.

---

## Enterprise Architecture

The overall structural design governing the Agile AI University ecosystem.

It defines platforms, domains, services, governance, runtime, integrations, and enterprise evolution.

---

# Academic Terms

---

## Programme

An approved academic offering delivered by Agile AI University.

Programmes may include learning, assessments, credentials, and recognitions.

Examples include:

- AIPA
- AAIP
- AIAL
- AISD

---

## Learner

An individual participating in one or more Agile AI University programmes.

---

## Registration

The governed process through which a learner enrols in a programme.

Registration represents learner intent.

It is not a payment.

---

## Learning

The educational experience delivered through programmes, learning resources, coaching, mentoring, or guided practice.

---

## Assessment

The governed evaluation of learner capability.

Assessments measure competence rather than attendance.

---

## Credential

The authoritative digital representation of validated achievement.

A credential may be represented through:

- Certificate
- Digital Badge
- Verification Record
- Future Digital Wallet

---

## Certificate

A formal representation of a credential.

A certificate is not the credential itself.

---

## Digital Badge

A digital representation of a credential designed for online sharing and verification.

---

## Recognition

A governed acknowledgement of achievement that may or may not be associated with a formal credential.

---

## Verification

The process of validating the authenticity of a credential or recognition.

---

# Financial Terms

---

## Payment

A governed financial transaction associated with registration or enterprise services.

---

## Payment Order

The enterprise representation of a financial transaction before completion.

---

## Gateway

An approved payment provider responsible for secure financial processing.

Examples include Razorpay and future enterprise payment providers.

---

## GST

Goods and Services Tax applied where legally required.

PaymentService calculates and records applicable GST.

---

## Receipt

An official financial record generated after successful payment verification.

---

## Refund

The governed reversal of an approved financial transaction.

---

# Architectural Terms

---

## Resolver

A runtime component responsible for resolving business state before presentation.

Resolvers coordinate services.

They do not own business logic.

---

## View Model

A presentation-ready representation of resolved business information.

View Models are produced by Enterprise Services or Resolvers.

---

## Orchestration

The coordination of multiple Enterprise Services to complete a business workflow.

---

## Service Contract

The formal specification defining the behaviour, responsibilities, inputs, outputs, and governance of an Enterprise Service.

---

## API Contract

The implementation specification describing how consumers interact with an Enterprise API.

---

## Domain Ownership

The principle that every business capability belongs to one Enterprise Domain.

---

## Separation of Concerns

The architectural principle that responsibilities remain isolated within appropriate architectural layers.

---

## Registry Protection

The architectural principle that Enterprise Registries are accessed only through Enterprise Services.

---

# Governance Terms

---

## Architecture Decision Record (ADR)

A permanent record documenting an approved architectural decision, its rationale, and consequences.

---

## Governance

The policies, standards, principles, and rules governing enterprise evolution.

---

## Standard

A mandatory enterprise practice that must be consistently applied.

---

## Guideline

A recommended practice that supports consistency while allowing justified exceptions.

---

## Principle

A fundamental architectural belief guiding enterprise decisions.

---

# Operational Terms

---

## Deployment

The controlled release of software into an operational environment.

---

## Monitoring

Continuous observation of enterprise health, performance, availability, and operational status.

---

## Runbook

A documented operational procedure for performing repeatable operational tasks.

---

## Incident

An unplanned event affecting service quality, availability, security, or operations.

---

## Recovery

The process of restoring enterprise services following disruption.

---

# Security Terms

---

## Authentication

The process of verifying identity.

---

## Authorization

The process of determining permitted actions for an authenticated identity.

---

## Entitlement

A governed permission granting access to enterprise capabilities.

---

## Least Privilege

The principle that identities receive only the permissions necessary to perform approved responsibilities.

---

## Zero Trust

The security principle that every request is verified regardless of origin.

---

# Artificial Intelligence Terms

---

## AI Tutor

An AI capability supporting guided learning.

---

## AI Mentor

An AI capability supporting long-term learner development.

---

## AI Recommendation

An AI capability providing governed recommendations based on enterprise context.

---

## Executive Insight

Enterprise analytics and intelligence supporting strategic decision making.

---

# Abbreviations

| Abbreviation | Meaning |
|--------------|---------|
| AAU | Agile AI University |
| ADR | Architecture Decision Record |
| API | Application Programming Interface |
| AI | Artificial Intelligence |
| GST | Goods and Services Tax |
| KPI | Key Performance Indicator |
| UI | User Interface |
| UX | User Experience |
| RBAC | Role-Based Access Control |
| SSO | Single Sign-On |
| MFA | Multi-Factor Authentication |

---

# Governance

This glossary is authoritative.

New terminology shall be reviewed before being adopted across the enterprise.

Existing definitions should not be redefined without appropriate governance approval.

Where conflicts exist, this glossary takes precedence over individual project documentation.

---

# Related Documentation

- Enterprise Terminology
- Architectural Principles
- Enterprise Patterns
- Architecture Decision Records
- Enterprise Architecture
- Enterprise Services

---

# Summary

The Enterprise Glossary establishes the official vocabulary of the Agile AI University ecosystem.

By defining a common language for architecture, governance, platforms, services, operations, and enterprise capabilities, it improves communication, consistency, documentation quality, and long-term maintainability across the enterprise.

---

**Status:** ACTIVE

**Reference Status:** AUTHORITATIVE

**Classification:** Enterprise Glossary

---

*"Shared terminology creates shared understanding. Shared understanding enables enterprise scale."*