# Agile AI University

# Batch Governance Rules

Version: 1.0

Status: LOCKED

Date Locked: 2026-06-05

---

# Purpose

This document defines the governance framework for batch creation, batch management, and batch-based credential issuance within the Agile AI University credential ecosystem.

The purpose of batch governance is to ensure:

* Issuance integrity
* Program integrity
* Credential traceability
* Operational safety
* Audit readiness

across all credential operations.

This governance applies to:

* Credential Registry
* Batch Management
* CSV Import
* Credential Issuance
* Certificate Generator
* Badge Generator
* Verification Publisher
* Future Credential Operations modules

---

# Foundational Principle

A batch represents an institutional issuance container.

A batch is not a credential.

A batch groups credential records that share a common issuance event.

Credential

↓

Batch

↓

Program

↓

Issuance Event

Batches exist to provide administrative control, traceability, and governance.

---

# Batch Authority Rule

Status: LOCKED

Batch Management is the only authorized mechanism for creating issuance batches.

No downstream system may create batches independently.

---

# Batch Identity Rule

Status: LOCKED

Each batch must possess a unique Batch ID.

Examples:

AIPA-2026-B001

AAIA-2026-B003

AAIL-2026-B001

Batch IDs must be:

* Unique
* Immutable
* Traceable

Batch IDs must never be reused.

---

# Program Binding Rule

Status: LOCKED

Every batch must be permanently associated with a Program Code.

Example:

Batch:

AIPA-2026-B001

Program Code:

AIPA

Once created, program binding is irreversible.

Program association must never be modified after batch creation.

---

# Program Code Selection Rule

Status: LOCKED

Program Code must never be auto-selected.

Default state:

Select Program Code

No implicit defaults are permitted.

Examples of prohibited behavior:

* Automatically selecting AIPA
* Remembering previous selections
* Pre-populating program values

Program selection must be intentional.

---

# Mandatory Program Selection Rule

Status: LOCKED

Program Code selection is required before batch creation.

Batch creation must be blocked if no Program Code has been selected.

Validation messaging must be displayed to the administrator.

---

# Confirmation Governance Rule

Status: LOCKED

Batch creation requires explicit administrator confirmation.

Before creation, the system must display:

* Batch Name
* Program Code
* Program Name

The administrator must confirm the operation before proceeding.

---

# Irreversible Binding Warning Rule

Status: LOCKED

The confirmation process must explicitly state:

This batch will be permanently associated with the selected Program Code.

This association cannot be changed after creation.

This warning is mandatory.

---

# Batch Naming Governance

Status: LOCKED

Batch names must be meaningful and traceable.

Examples:

AIPA Cohort January 2026

AAIA Cohort March 2026

Executive Leadership Pilot 2026

Batch names should clearly identify the issuance event.

---

# Credential Association Rule

Status: LOCKED

Every credential must belong to exactly one batch.

A credential may not be assigned to multiple batches.

Batch membership is permanent after issuance.

---

# CSV Import Governance

Status: LOCKED

CSV imports must occur within the context of a selected batch.

Workflow:

Select Batch

↓

Import CSV

↓

Validate Records

↓

Issue Credentials

CSV imports must never create credentials outside a batch context.

---

# Issuance Governance

Status: LOCKED

Credential issuance must occur only through authorized batch workflows.

Issuance operations must be traceable to:

* Batch ID
* Program Code
* Issuance Event
* Administrator Action

---

# Batch Status Governance

Status: LOCKED

Allowed batch statuses:

* Draft
* Active
* Completed
* Archived

Status definitions:

Draft

Batch exists but issuance has not occurred.

Active

Batch is actively being processed.

Completed

Issuance activities have concluded.

Archived

Batch retained for historical purposes.

---

# Batch Modification Governance

Status: LOCKED

Permitted modifications:

* Batch Description
* Administrative Notes

Prohibited modifications:

* Batch ID
* Program Binding
* Issuance History

Core batch identity is immutable.

---

# Audit Governance

Status: LOCKED

Future audit systems shall capture:

* Batch Created
* Batch Updated
* CSV Imported
* Credential Issued
* Batch Completed

Audit implementation may be deferred, but governance requirements are locked.

---

# Registry Authority Rule

Status: LOCKED

The Credential Registry remains the sole system of record for credential records.

Batch Management governs issuance operations.

Batch Management does not become an alternative credential authority.

---

# Certificate Generator Governance

Status: LOCKED

The Certificate Generator may consume batch information for display purposes.

The Certificate Generator must never:

* Create batches
* Modify batches
* Reassign credentials between batches

Certificate generation remains read-only.

---

# Program Independence Rule

Status: LOCKED

Batch systems must not contain hardcoded assumptions regarding:

* AOP
* AIPA
* AAIA
* AAIP
* AAIL

or any future credential program.

All batch governance must remain program-agnostic.

---

# Solopreneur Operational Safety Rule

Status: LOCKED

The Agile AI University credential ecosystem is operated using a controlled, low-risk administrative model.

Therefore:

* Destructive actions must require confirmation.
* Program binding must be explicit.
* Silent defaults are prohibited.
* Irreversible actions must provide warning messages.

Operational safety takes precedence over administrative convenience.

---

# Enterprise Design Authority Statement

Batches provide governance, traceability, and operational control for credential issuance.

Credentials are the institutional record.

Batches are the administrative container through which credentials are issued.

Program integrity, issuance integrity, and auditability must be preserved at all times.

This document is governance-locked and applies across the entire Agile AI University Credential Operations ecosystem.
