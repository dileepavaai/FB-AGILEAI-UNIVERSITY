# ADR-008

# Enterprise Payment Architecture

Version
-------

1.0

Status
------

LOCKED

Decision Date
-------------

July 2026

Decision Owner
--------------

Enterprise Architecture

Related Documents
-----------------

- Enterprise Architecture & System Context
- Programme Domain Architecture
- Registration Domain Architecture
- Payment Domain Architecture
- Learning Domain Architecture

---

# Executive Summary

This Architecture Decision Record establishes the Enterprise Payment Architecture for the Agile AI University ecosystem.

It defines:

- Enterprise ownership
- Payment responsibilities
- Financial boundaries
- Service interactions
- Runtime architecture
- Governance decisions

This ADR becomes the permanent authority for every payment capability implemented across the enterprise.

---

# Context

The learner lifecycle contains a governed payment stage.

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

Credential

↓

Credential Assets

↓

Recognition

↓

Verification

↓

Executive Services

Payment must remain independent while integrating with surrounding domains.

---

# Decision 1

## Payment Domain Authority

The Payment Domain is the authoritative owner of:

- Payment Orders
- Payment Processing
- Gateway Integration
- Verification
- Receipts
- Refunds
- Financial History
- Transaction Audit

LOCKED

---

# Decision 2

## Financial Separation of Concerns

Academic pricing and financial execution are permanently separated.

| Domain | Responsibility |
|---------|----------------|
| Programme | Programme definitions, fee metadata, pricing references |
| Registration | Registration lifecycle, enrollment intent |
| Payment | Payment execution, verification, receipts, refunds |
| Learning | Enrollment activation |

LOCKED

---

# Decision 3

## Payment Gateway Integration

Approved gateways integrate exclusively through PaymentService.

Presentation platforms shall never communicate directly with payment gateways.

LOCKED

---

# Decision 4

## Registration Dependency

Registration creates payment intent.

Payment confirms financial completion.

Registration never verifies payments independently.

LOCKED

---

# Decision 5

## Enrollment Dependency

Learning activation occurs only after:

- Verified payment
- Approved payment exemption
- Approved administrative override

The Payment Domain never activates learning.

LOCKED

---

# Decision 6

## Enterprise Runtime

Student Portal

↓

RegistrationService

↓

PaymentService

↓

Payment Gateway

↓

Verification

↓

Payment Registry

↓

Registration Confirmation

↓

Learning Service

LOCKED

---

# Decision 7

## Payment Registry

Payment Registry stores:

- Payment Orders
- Transactions
- Receipts
- Refunds
- Gateway References
- Audit History

The registry represents financial truth.

LOCKED

---

# Decision 8

## Enterprise Governance

The Payment Domain:

✓ Processes payments

✓ Verifies payments

✓ Generates receipts

✓ Processes refunds

✗ Defines programmes

✗ Owns registrations

✗ Activates learning

✗ Issues credentials

LOCKED

---

# Consequences

Positive

- Clear ownership
- Easier maintenance
- Better governance
- Easier gateway replacement
- Easier pricing changes
- Better auditability
- Supports subscriptions
- Supports scholarships
- Supports corporate billing

Trade-offs

- More service interactions
- More API contracts
- More orchestration

These trade-offs are acceptable because they preserve long-term enterprise architecture quality.

---

# Implementation Impact

This ADR affects:

- Programme Domain
- Registration Domain
- Payment Domain
- Learning Domain
- Student Portal
- Admin Portal
- Enterprise APIs
- Enterprise Runtime
- Enterprise Security

---

# Governance

This ADR is considered a permanent Enterprise Architecture Decision.

Future implementations shall comply with this decision unless superseded by a formally approved Architecture Decision Record.

---

# Status

LOCKED