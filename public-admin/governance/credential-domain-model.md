# Agile AI University

# Credential Domain Model

Version: 1.0

Status: LOCKED

Date Locked: 2026-06-05

---

# Purpose

This document defines the canonical credential domain model used throughout the Agile AI University credential ecosystem.

The domain model serves as the authoritative contract between:

* Credential Registry
* Certificate Generator
* Badge Generator
* Verification Publisher
* Wallet Export
* Metadata Builder
* Credential Intelligence Services
* Future Credential Operations modules

The purpose of this model is to ensure that all credential services operate using a consistent, future-proof, governance-aligned structure.

---

# Foundational Principle

The Agile AI University ecosystem recognizes three distinct concepts:

1. Credential

Represents:

"What was awarded?"

2. Lifecycle

Represents:

"How has the credential evolved over time?"

3. Recognition

Represents:

"What is the holder currently recognized as?"

These concepts are separate and must never be conflated.

---

# Domain Architecture

All credential services shall operate according to the following model:

Credential Record

↓

Lifecycle Metadata

↓

Recognition Metadata

↓

Template Resolution

↓

Rendering / Publishing

No credential service may bypass this model.

---

# Credential Record

## Definition

The Credential Record represents the original institutional award.

A Credential Record is immutable once issued.

---

## Required Fields

### Credential ID

Unique credential identifier.

Examples:

AIPA-2026-000001

AAIA-2026-000145

AAIL-2026-000021

Characteristics:

* Globally unique
* Immutable
* Primary lookup key

---

### Credential Type

Represents the category of credential.

Examples:

* Professional Credential
* Academic Credential
* Executive Credential
* Micro Credential
* Institutional Recognition

---

### Credential Family

Represents the broader credential grouping.

Examples:

Professional Agilist

Agentic AI

Leadership

Executive

Governance Rule:

Credential Families provide long-term stability while programs may evolve.

---

### Program Code

Stable institutional identifier.

Examples:

AOP

AIPA

AAIA

AAIP

AAIL

Governance Rules:

* Program Code is immutable.
* Program Code is unique.
* Program Code is never reused.

---

### Program Name

Human-readable credential title.

Examples:

Agile Outcome Practitioner

Artificial Intelligence Professional Agilist

Agentic AI Agilist

Governance Rules:

* May evolve over time.
* Does not affect historical records.

---

### Learner Information

Required:

* Full Name
* Email Address

Optional:

* Organization
* Country

---

### Issue Date

Original award date.

Governance Rule:

Issue Date is immutable.

---

### Credential Status

Allowed values:

* Issued
* Suspended
* Revoked
* Archived

Governance Rule:

Status changes do not alter historical issuance information.

---

# Lifecycle Metadata

## Definition

Lifecycle Metadata describes the evolution of a credential after issuance.

Lifecycle Metadata supplements a credential.

Lifecycle Metadata does not replace a credential.

---

## Lifecycle State

Allowed values:

* Active
* Retired
* Superseded
* Bridged
* Versioned

Examples:

AOP → Retired

AIPA → Active

AAIA-V1 → Superseded

AAIA-V2 → Active

---

## Successor Program Code

Optional.

Examples:

AOP → AIPA

AAIA-V1 → AAIA-V2

Governance Rule:

Successor mappings originate exclusively from the Credential Registry.

---

## Bridge Required

Allowed values:

* Yes
* No

Purpose:

Indicates whether additional requirements must be completed before recognition can transition.

---

## Bridge Completion Status

Allowed values:

* Not Applicable
* Pending
* Completed

---

## Lifecycle Effective Date

Date lifecycle change became effective.

---

## Lifecycle Notes

Optional institutional explanation.

Purpose:

Provide contextual information for administrators and verification services.

---

# Recognition Metadata

## Definition

Recognition Metadata represents current institutional recognition.

Recognition may evolve over time.

Recognition does not alter historical credentials.

---

## Current Recognition

Examples:

AIPA

AAIA

AAIL

Executive Agilist

Governance Rule:

Recognition may differ from the originally issued credential.

---

## Recognition Status

Allowed values:

* Active
* Pending Bridge Completion
* Suspended
* Expired

---

## Recognition Effective Date

Date current recognition became effective.

---

## Recognition Notes

Optional institutional information.

---

# Template Resolution Model

## Purpose

Determine certificate rendering behavior without introducing program-specific logic.

---

## Canonical Model

Credential Record

↓

Program Code

↓

Template Key

↓

Template Resolution

↓

Certificate Rendering

---

## Governance Rules

Certificate systems must never use:

Program Name

↓

Template

Instead they must use:

Program Code

↓

Template Key

↓

Template

This ensures future program renaming does not affect rendering logic.

---

# Credential Registry Authority

The Credential Registry is the sole system of record for:

* Credential Records
* Lifecycle Metadata
* Recognition Metadata
* Successor Relationships
* Bridge Requirements
* Recognition Status

No downstream service may redefine or override registry data.

---

# Certificate Generator Consumption Model

The Certificate Generator shall:

Load Credential Record

↓

Read Lifecycle Metadata

↓

Read Recognition Metadata

↓

Resolve Template

↓

Render Certificate

The Certificate Generator shall never:

* Create Credentials
* Modify Credentials
* Revoke Credentials
* Define Upgrade Paths
* Define Successor Programs
* Define Recognition Status

All such information must originate from the Credential Registry.

---

# Badge Generator Consumption Model

The Badge Generator shall follow the same domain model.

No credential-specific assumptions are permitted.

Badge generation must remain metadata-driven.

---

# Verification Publisher Consumption Model

Verification systems must preserve:

Historical Credential

and

Current Recognition

as separate information domains.

Historical records must never be overwritten by recognition updates.

---

# Future Evolution Governance

The Agile AI University ecosystem assumes that any credential may eventually become:

* Retired
* Superseded
* Bridged
* Replaced
* Merged
* Reclassified
* Versioned

All credential services must therefore remain:

Program-Agnostic

and

Lifecycle-Aware

at all times.

---

# Enterprise Design Authority Statement

Agile AI University recognizes that credential frameworks evolve over time.

Therefore:

Credentials are historical records.

Lifecycle metadata describes evolution.

Recognition reflects current institutional standing.

The Credential Domain Model exists to preserve the integrity of all three.

This document is governance-locked and applies across the entire Agile AI University credential ecosystem.
