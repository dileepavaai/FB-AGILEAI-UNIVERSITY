# Agile AI University

# Enterprise Architecture Patterns

**Version:** 1.0.0

**Status:** ACTIVE

**Classification:** Enterprise Architecture Standard

**Last Updated:** July 2026

---

# Purpose

The Enterprise Architecture Patterns define the standard architectural solutions used throughout the Agile AI University ecosystem.

Patterns provide proven, reusable approaches for solving recurring architectural problems while ensuring consistency across platforms, enterprise services, domains, APIs, and runtime components.

These patterns complement the Enterprise Architectural Principles by describing how those principles are implemented in practice.

---

# Objectives

This document exists to:

- Standardize enterprise architecture
- Promote solution reuse
- Reduce implementation complexity
- Improve maintainability
- Support scalability
- Preserve architectural consistency
- Accelerate development
- Reduce design duplication

---

# Pattern Selection Principles

An Enterprise Pattern shall:

- Solve a recurring architectural problem
- Be reusable across multiple platforms
- Be implementation independent
- Support enterprise scalability
- Align with Enterprise Architectural Principles
- Preserve governance
- Minimize coupling
- Maximize maintainability

---

# Pattern 1

# Resolver Pattern

## Purpose

Resolve business state before presentation.

## Architecture

```
Authentication

↓

Authorization

↓

Entitlements

↓

Resolver

↓

Enterprise Services

↓

View Model

↓

Presentation
```

## Benefits

- Thin presentation layer
- Consistent runtime behaviour
- Simplified UI
- Improved testability
- Reusable business orchestration

---

# Pattern 2

# Enterprise Service Pattern

## Purpose

Expose business capabilities through Enterprise Services.

```
Platform

↓

Enterprise Service

↓

Enterprise Domain

↓

Enterprise Registry
```

## Benefits

- Platform independence
- Business reuse
- Stable contracts
- Clear ownership

---

# Pattern 3

# Registry Pattern

## Purpose

Protect institutional truth.

```
Platform

↓

Enterprise Service

↓

Registry
```

Presentation platforms shall never access Enterprise Registries directly.

## Benefits

- Data integrity
- Governance
- Security
- Consistency

---

# Pattern 4

# Domain Ownership Pattern

Every business capability has one owner.

Example:

| Capability | Owner |
|------------|-------|
| Programme | Programme Domain |
| Registration | Registration Domain |
| Payment | Payment Domain |
| Learning | Learning Domain |
| Credential | Credential Domain |
| Recognition | Recognition Domain |
| Verification | Verification Domain |

---

# Pattern 5

# View Model Pattern

Enterprise Services return View Models rather than database entities.

```
Registry

↓

Domain

↓

Enterprise Service

↓

View Model

↓

Presentation
```

Benefits:

- Presentation independence
- Stable UI contracts
- Better separation of concerns

---

# Pattern 6

# Orchestration Pattern

Complex workflows are coordinated through orchestration.

Example:

```
RegistrationService

↓

PaymentService

↓

LearningService

↓

AssessmentService

↓

CredentialService
```

Each service owns its own business behaviour.

---

# Pattern 7

# Gateway Adapter Pattern

External providers are isolated behind adapters.

```
Enterprise Service

↓

Gateway Adapter

↓

External Provider
```

Examples:

- Payment Gateway
- Email Provider
- SMS Provider
- Cloud Storage
- AI Provider

Benefits:

- Vendor independence
- Easier migration
- Cleaner architecture

---

# Pattern 8

# Overlay Pattern

Enterprise platforms prefer overlays instead of unnecessary page navigation.

```
Dashboard

↓

Overlay

↓

Resolved Information
```

Current examples include:

- Credential Details
- Credential Preview
- Asset Preview
- Upgrade Experience

Benefits:

- Better user experience
- Reduced navigation
- Faster interactions

---

# Pattern 9

# Event Pattern

Enterprise Services publish business events.

Examples:

- Registration Created
- Payment Verified
- Learning Activated
- Assessment Completed
- Credential Issued
- Recognition Granted

Events communicate business outcomes rather than implementation details.

---

# Pattern 10

# Repository Pattern

Enterprise Services interact with Enterprise Registries through repositories or equivalent abstraction layers.

```
Enterprise Service

↓

Repository

↓

Registry
```

Benefits:

- Decoupling
- Testability
- Maintainability

---

# Pattern 11

# Strategy Pattern

Different business strategies are selected without changing consumers.

Examples:

- Pricing Strategy
- Upgrade Strategy
- Assessment Strategy
- Recognition Strategy
- Notification Strategy

Benefits:

- Extensibility
- Open/Closed Principle
- Business flexibility

---

# Pattern 12

# Factory Pattern

Factories create governed enterprise objects.

Examples:

- Credential Factory
- Certificate Factory
- Badge Factory
- Recognition Factory
- Assessment Factory

Benefits:

- Consistency
- Centralized creation
- Governance

---

# Pattern 13

# Builder Pattern

Builders construct complex enterprise objects.

Examples:

- Executive Insight
- Credential Package
- Learner Dashboard
- Assessment Report

Benefits:

- Readability
- Maintainability
- Flexible composition

---

# Pattern 14

# State Pattern

Enterprise entities transition through governed states.

Examples:

- Registration
- Payment
- Learning
- Assessment
- Credential
- Recognition

State transitions are governed by Enterprise Services.

---

# Pattern 15

# Policy Pattern

Business policies remain configurable rather than embedded in implementation.

Examples:

- Eligibility Policy
- Pricing Policy
- Refund Policy
- Credential Policy
- Recognition Policy

Benefits:

- Easier governance
- Reduced code changes
- Business flexibility

---

# Relationship with Other Documentation

These patterns implement the Enterprise Architectural Principles.

Related documents include:

- Enterprise Architecture
- Enterprise Architectural Principles
- Enterprise Services
- Enterprise APIs
- Architecture Decision Records

---

# Governance

Enterprise Patterns are reusable architectural assets.

New patterns should only be introduced when an existing pattern cannot reasonably solve the architectural problem.

Duplicate patterns should be avoided.

Pattern evolution shall remain governed.

---

# Summary

Enterprise Architecture Patterns provide the reusable building blocks used throughout the Agile AI University ecosystem.

By consistently applying these patterns, every platform, Enterprise Service, API, and runtime component benefits from a common architectural language, reduced complexity, improved maintainability, and long-term scalability.

---

**Status:** ACTIVE

**Classification:** Enterprise Architecture Standard

---

*"Principles define what we believe. Patterns define how we consistently build."*