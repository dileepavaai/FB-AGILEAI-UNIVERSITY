# Agile AI University

# Assessment Domain Architecture

---

# Document Information

| Attribute | Value |
|------------|-------|
| **Document** | Assessment Domain Architecture |
| **File** | `assessment-domain-architecture.md` |
| **Version** | **1.0.0** |
| **Status** | **ACTIVE** |
| **Architecture Status** | **LOCKED** |
| **Classification** | Enterprise Domain Architecture |
| **Owner** | Agile AI University |
| **Authority** | Enterprise Assessment Domain |
| **Parent Architecture** | Agile AI University Enterprise Architecture & System Context |
| **Last Updated** | July 2026 |

---

# Document Governance

## Status

**LOCKED**

This document defines the Enterprise Assessment Domain Architecture.

The Assessment Domain governs academic evaluation, assessment delivery, scoring, competency validation, assessment results, and academic completion decisions.

The Assessment Domain owns academic evaluation.

It does not own programme definitions, learning delivery, financial processing, or credential production.

---

# 1. Domain Overview

## Introduction

The Assessment Domain evaluates learner competency throughout the Agile AI University Enterprise Platform.

It provides governed assessment experiences that determine whether learners have successfully demonstrated the knowledge, skills, and competencies required by an academic programme.

The Assessment Domain establishes academic achievement.

Credential issuance remains the responsibility of the Credential Domain.

---

# 2. Purpose

The Assessment Domain exists to provide governed academic evaluation.

Responsibilities include:

- Assessment definition
- Assessment delivery
- Question management
- Competency evaluation
- Scoring
- Result management
- Pass and fail determination
- Assessment analytics
- Assessment audit

Assessment focuses on academic evaluation.

---

# 3. Enterprise Position

```text
Programme

↓

Registration

↓

Payment

↓

Learning

↓

Assessment

↓

Credential
```

Assessment follows successful learning participation and precedes credential issuance.

---

# 4. Enterprise Authority

The Assessment Domain owns:

- Assessment Registry
- Assessment definitions
- Question banks
- Assessment attempts
- Assessment scores
- Competency results
- Pass/fail outcomes
- Assessment metadata

---

# 5. Business Responsibilities

## Assessment Definition

Defines:

- Assessment type
- Passing criteria
- Competency model
- Question structure
- Duration
- Attempt policy

Assessment criteria shall align with Programme requirements.

---

## Assessment Delivery

Supports:

- Online assessments
- Timed assessments
- Practical assessments
- Executive assessments
- Future AI-assisted assessments

Assessment delivery shall preserve academic integrity.

---

## Question Management

Manages:

- Question banks
- Assessment versions
- Randomisation
- Difficulty levels
- Competency mapping

Question ownership belongs to the Assessment Domain.

---

## Competency Evaluation

Evaluates learner capability against defined outcomes.

Examples include:

- Knowledge
- Practical application
- Systems thinking
- Leadership capability
- AI competency

Competency frameworks are governed academic artefacts.

---

## Assessment Results

Determines:

- Score
- Pass
- Fail
- Completion
- Assessment eligibility for credential issuance

The Assessment Domain determines academic outcome.

---

## Assessment Lifecycle

```text
Assessment Created

↓

Assessment Published

↓

Assessment Started

↓

Assessment Submitted

↓

Evaluation

↓

Result Published

↓

Credential Eligible

↓

Archived
```

All transitions shall remain auditable.

---

# 6. Non-Responsibilities

The Assessment Domain shall not:

- Define programmes
- Register learners
- Process payments
- Deliver learning
- Issue credentials
- Generate certificates
- Generate badges
- Publish assets
- Verify credentials

---

# 7. Enterprise Information

The Assessment Domain owns:

- Assessment Registry
- Question Banks
- Assessment Attempts
- Scores
- Competency Results
- Pass/Fail Status
- Assessment Metadata

These records represent the authoritative academic evaluation history.

---

# 8. Enterprise Services

The Assessment Domain exposes:

## AssessmentService

Responsibilities include:

- Assessment lookup
- Assessment delivery
- Attempt management
- Scoring
- Competency evaluation
- Result publication
- Assessment analytics

AssessmentService is the authoritative implementation of assessment behaviour.

---

# 9. Enterprise Consumers

Assessment information is consumed by:

- Student & Executive Portal
- Admin Portal
- Credential Domain
- Executive Services

Credential eligibility shall be consumed through AssessmentService.

---

# 10. Assessment Registry

The Assessment Registry stores:

- Assessment ID
- Learner ID
- Programme Code
- Assessment Version
- Attempt Number
- Score
- Pass/Fail Status
- Competency Result
- Completion Timestamp
- Audit Metadata

The Assessment Registry is the authoritative academic evaluation record.

---

# 11. Business Lifecycle

```text
Assessment Assigned

↓

Assessment Attempt

↓

Submission

↓

Evaluation

↓

Result

↓

Credential Eligibility

↓

Archive
```

---

# 12. Integration Architecture

The Assessment Domain integrates with:

- Programme Domain
- Learning Domain
- Credential Domain
- Student & Executive Portal
- Admin Portal
- Executive Services

Integration occurs through AssessmentService.

---

# 13. Security Considerations

Assessment operations require:

- Authentication
- Authorization
- Secure assessment delivery
- Attempt validation
- Anti-tampering controls
- Audit logging

Assessment integrity shall be preserved throughout the lifecycle.

---

# 14. Governance Rules

## Rule 1

The Assessment Domain is the authoritative source of academic evaluation.

---

## Rule 2

Assessment criteria shall align with Programme outcomes.

---

## Rule 3

Learning completion does not imply assessment success.

---

## Rule 4

Credential eligibility shall be determined from Assessment results.

---

## Rule 5

Assessment attempts and results shall remain auditable.

---

## Rule 6

Question Banks remain owned by the Assessment Domain.

---

## Rule 7

Future assessment models shall inherit this architecture.

---

# 15. Current Implementation Position

## Implemented

- Assessment architecture
- Executive assessment model
- Competency framework
- Assessment reporting foundation

## In Progress

- AssessmentService
- Assessment Registry
- Result publication
- Competency analytics

## Planned

- Adaptive assessments
- Practical assessments
- AI-assisted evaluation
- Remote proctoring
- Question bank management
- Assessment dashboards

---

# 16. Future Evolution

The Assessment Domain is designed to support:

- AI-assisted assessment
- Adaptive testing
- Practical simulations
- Skills-based assessment
- Executive capability assessments
- Corporate assessments
- Continuous evaluation
- Competency analytics

Future capabilities shall extend the Assessment Domain while preserving academic governance.

---

# 17. Related Architecture Decisions

This domain follows Architecture Decision Records governing:

- Learning Before Assessment
- Assessment Before Credential
- Programme–Assessment Alignment
- Enterprise Governance

The ADR repository remains authoritative.

---

# 18. Related Documentation

- Programme Domain Architecture
- Learning Domain Architecture
- Credential Domain Architecture
- Enterprise Runtime Architecture
- Enterprise Security Architecture
- Enterprise Integration Architecture

---

# 19. Domain Summary

The Assessment Domain governs academic evaluation throughout the Agile AI University Enterprise Platform.

It owns assessment delivery, competency evaluation, scoring, and academic outcomes while remaining independent of learning delivery, financial processing, and credential production.

By separating academic evaluation from learning participation and credential issuance, the Assessment Domain establishes a robust, auditable, and scalable foundation for institutional quality, academic integrity, and future assessment innovation.

---

# Status

**ACTIVE**

# Architecture Status

**LOCKED**

# Domain Pattern

**Assessment Before Credential**

---

**End of Assessment Domain Architecture**