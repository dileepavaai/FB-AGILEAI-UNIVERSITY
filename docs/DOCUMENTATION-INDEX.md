# Agile AI University
# Documentation Index

**Version:** 1.0.0  
**Status:** ACTIVE  
**Owner:** Agile AI University  
**Architect:** Dileep Appupillai

---

# Purpose

This document is the master navigation index for the Agile AI University
documentation repository.

Every developer, architect, administrator, AI assistant, or contributor
must start here before making architectural, platform, or production
changes.

This repository is intentionally organized as an enterprise knowledge
base rather than a collection of unrelated documents.

---

# Documentation Philosophy

The documentation follows one principle:

```
Understand
↓

Architecture

↓

Decision

↓

Implementation

↓

Deployment

↓

Operations

↓

Maintenance
```

Never skip architectural understanding and start coding directly.

---

# Repository Structure

```
docs/

01-system/
02-governance/
03-architecture/
04-decisions/
05-estimates/
06-roadmap/
07-api/
08-enterprise-services/
09-operational/
10-runbooks/
11-reference/
```

Each folder has a specific responsibility.

Documents must always be placed in the correct section.

---

# Reading Order

Every new developer should read documents in the following order.

```
1.
01-system

↓

2.
02-governance

↓

3.
03-architecture

↓

4.
04-decisions (ADR)

↓

5.
07-api

↓

6.
08-enterprise-services

↓

7.
09-operational

↓

8.
10-runbooks

↓

9.
11-reference
```

This order minimizes misunderstanding and prevents architectural drift.

---

# Folder Responsibilities

---

## 01-system

Contains:

• Vision
• Mission
• Product strategy
• Product principles
• Intellectual foundation
• Terminology
• Product philosophy

Purpose

Defines WHY the platform exists.

---

## 02-governance

Contains

• Governance rules
• Security policies
• Business policies
• Ownership rules
• Compliance
• Licensing
• Academic governance

Purpose

Defines WHAT is permitted.

---

## 03-architecture

Contains

• Platform architecture
• Runtime architecture
• Portal architecture
• Learning Resource Architecture
• Security architecture
• Integration architecture
• Domain architecture

Purpose

Defines HOW the platform is designed.

---

## 04-decisions

Contains

Architecture Decision Records (ADR)

Every permanent architectural decision must be recorded here.

Examples

ADR-001

ADR-015

ADR-019

ADR-022

Purpose

Explains WHY important decisions were made.

---

## 05-estimates

Contains

• Project estimates

• Sprint estimates

• Remaining effort

• Capacity planning

Purpose

Tracks implementation effort.

---

## 06-roadmap

Contains

• MVP roadmap

• Release roadmap

• Future phases

• Planned capabilities

Purpose

Defines WHAT comes next.

---

## 07-api

Contains

• REST APIs

• Cloud Functions

• Backend contracts

• Authentication APIs

• Gateway documentation

Purpose

Documents integration contracts.

---

## 08-enterprise-services

Contains

Shared services

Authentication

Authorization

Credential Service

Learning Resource Service

Payment Service

Notification Service

Identity Service

Purpose

Documents reusable business services.

---

## 09-operational

Contains

Development

Deployment

Monitoring

Maintenance

Troubleshooting

Security Operations

Purpose

Explains how to operate the platform.

---

## 10-runbooks

Contains

Step-by-step operational procedures.

Examples

Publishing Learning Resources

Credential Generation

Assignment Workflow

Portal Deployment

Payment Deployment

Recovery Procedures

Purpose

Allows operations to be executed consistently.

---

## 11-reference

Contains

Static reference material.

Examples

Firestore Collections

Storage Layout

Naming Standards

Programme Codes

Status Codes

Glossary

File Naming

Purpose

Quick lookup information.

---

# Architecture Governance

The following rules are permanently enforced.

✓ Business rules never belong inside UI.

✓ UI must never perform authorization.

✓ Identity precedes Authorization.

✓ Authorization precedes Entitlement.

✓ Entitlement precedes Resource Resolution.

✓ Resource Resolution precedes UI Rendering.

✓ Firestore Rules enforce data integrity.

✓ Storage Rules enforce content protection.

✓ Learning Resources are permanent licensed assets.

✓ Published resources are immutable.

✓ Assignments are immutable.

✓ Every major architectural decision requires an ADR.

---

# Documentation Rules

Every document must answer:

• Purpose

• Scope

• Owner

• Status

• Version

• Dependencies

• Related Documents

---

Every major implementation must update documentation before release.

Documentation is considered part of the implementation.

A feature is not complete until its documentation is complete.

---

# ADR Policy

Every permanent architectural decision must be recorded as an ADR.

Examples include:

• Identity changes

• Firestore schema changes

• Storage architecture

• Learning Resource architecture

• Credential architecture

• Payment architecture

• Security architecture

---

# Development Workflow

```
Requirement

↓

Architecture

↓

ADR

↓

Implementation

↓

Testing

↓

Deployment

↓

Documentation Update

↓

Production
```

Documentation updates are mandatory before closing a work item.

---

# Production Principles

Agile AI University follows a production-first workflow.

```
Focused Change

↓

Commit

↓

Deploy

↓

Validate

↓

Document

↓

Continue
```

All deployments are traceable through Git history and documentation.

---

# Audience

This documentation is intended for:

• Platform Architects

• Developers

• AI Assistants

• Operations Engineers

• Future Team Members

• Administrators

• Auditors

---

# Repository Ownership

Owner

Agile AI University

Architect

Dileep Appupillai

Documentation Standard

Enterprise Architecture Documentation Standard

Status

ACTIVE

Version

1.0.0