# Agile AI University

# Governance Index

Version: 1.0

Status: LOCKED

Date Locked: 2026-06-05

---

# Purpose

This document serves as the master governance index for the Agile AI University Credential Operations ecosystem.

It provides a structured overview of all governance artifacts and defines their relationship within the governance hierarchy.

The Governance Index is intended to:

* Provide governance navigation
* Clarify document ownership
* Establish governance hierarchy
* Identify authoritative sources
* Reduce governance ambiguity

This document does not introduce new governance rules.

It serves as a governance map.

---

# Governance Hierarchy

The Credential Operations ecosystem follows the hierarchy below:

Institutional Governance

↓

Credential Operations Governance

↓

Module Governance

↓

Implementation Governance

↓

Implementation

Implementation must always comply with higher-level governance.

No implementation may override governance.

---

# Governance Repository Structure

```text id="v9w2n1"
public-admin/
└── shared/
    └── governance/
        │
        ├── README.md
        ├── governance-index.md
        │
        ├── credential-domain-model.md
        ├── credential-lifecycle-governance.md
        ├── credential-operations-suite-architecture.md
        ├── batch-governance-rules.md
        └── certificate-template-governance.md
```

This structure is considered canonical.

---

# Governance Domains

The Credential Operations ecosystem is governed through five primary domains.

1. Domain Governance

2. Lifecycle Governance

3. Architecture Governance

4. Operational Governance

5. Template Governance

---

# Governance Document Catalogue

---

## README.md

Purpose:

Repository entry point.

Defines:

* Repository purpose
* Governance philosophy
* Governance hierarchy
* Repository structure

Audience:

* Administrators
* Architects
* Developers
* Governance Reviewers

Authority Level:

Foundational

---

## governance-index.md

Purpose:

Governance navigation map.

Defines:

* Governance relationships
* Governance hierarchy
* Document ownership

Audience:

All ecosystem participants.

Authority Level:

Reference

---

## credential-domain-model.md

Purpose:

Defines the canonical credential domain model.

Defines:

* Credential Record
* Lifecycle Metadata
* Recognition Metadata
* Template Resolution Model

Audience:

* Registry Services
* Certificate Services
* Badge Services
* Verification Services

Authority Level:

High

Dependencies:

All credential services depend upon this document.

---

## credential-lifecycle-governance.md

Purpose:

Defines credential evolution governance.

Defines:

* Retirement
* Successor Programs
* Bridge Pathways
* Recognition Evolution
* Version Governance

Audience:

* Credential Registry
* Verification Services
* Governance Teams

Authority Level:

High

Dependencies:

Must align with the Credential Domain Model.

---

## credential-operations-suite-architecture.md

Purpose:

Defines system architecture.

Defines:

* Module boundaries
* Module responsibilities
* Folder structures
* Integration patterns
* Architectural principles

Audience:

* Architects
* Developers
* Administrators

Authority Level:

High

Dependencies:

Must comply with domain governance and lifecycle governance.

---

## batch-governance-rules.md

Purpose:

Defines issuance and batch governance.

Defines:

* Batch creation
* Program binding
* Batch lifecycle
* Operational safety
* Issuance controls

Audience:

* Registry Administrators
* Credential Operations Teams

Authority Level:

Operational

Dependencies:

Must comply with architecture governance.

---

## certificate-template-governance.md

Purpose:

Defines certificate template governance.

Defines:

* Template ownership
* Template lifecycle
* Rendering rules
* Branding controls
* Historical rendering requirements

Audience:

* Certificate Generator
* Design Authority
* Governance Teams

Authority Level:

Operational

Dependencies:

Must comply with domain governance and lifecycle governance.

---

# Governance Dependency Model

The ecosystem follows the dependency hierarchy below:

README

↓

Governance Index

↓

Credential Domain Model

↓

Lifecycle Governance

↓

Architecture Governance

↓

Operational Governance

↓

Implementation

Implementation must never bypass governance layers.

---

# Governance Change Control

Status: LOCKED

Governance documents may evolve.

Governance changes must:

* Preserve institutional integrity
* Preserve credential integrity
* Preserve architectural consistency
* Preserve historical records

Changes should be documented through version-controlled updates.

---

# Design Authority Principle

Status: LOCKED

Governance documents are authoritative.

Operational modules consume governance.

Operational modules do not define governance.

Governance ownership remains external to implementation systems.

---

# Governance Review Sequence

Recommended review order:

1. README.md

2. governance-index.md

3. credential-domain-model.md

4. credential-lifecycle-governance.md

5. credential-operations-suite-architecture.md

6. batch-governance-rules.md

7. certificate-template-governance.md

This sequence establishes governance understanding before implementation review.

---

# Enterprise Design Authority Statement

The Agile AI University Credential Operations ecosystem is governed through explicit, version-controlled governance artifacts.

Governance defines institutional intent.

Architecture implements governance.

Technology serves architecture.

Operational systems consume governance authority but do not replace it.

The Governance Repository exists to preserve institutional consistency, credential integrity, and long-term ecosystem stability.

This Governance Index serves as the navigation and reference authority for all Credential Operations governance artifacts.
