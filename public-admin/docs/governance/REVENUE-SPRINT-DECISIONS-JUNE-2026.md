# AGILE AI UNIVERSITY

# REVENUE SPRINT DECISIONS

## JUNE 2026

Status: ACTIVE

Priority: HIGH

Owner: Platform Governance

---

# Strategic Decision

The platform will prioritize revenue-enabling capabilities over platform completeness.

The objective is not to complete Trainer Management.

The objective is to create the shortest operational path for:

AOP Holder
→ AIPA Capability Upgrade
→ Payment Collection
→ Credential Issuance
→ Credential Visibility

---

# Current Platform State

Completed:

* Credential Operations Gateway
* University Certificate Generator
* Trainer Certificate Generator
* University Badge Generator
* Credential Registry
* Centralized Breadcrumb Framework
* Admin Navigation Authority

Operational:

* PDF Generation
* PNG Generation
* Verification Workflow Foundation

---

# Revenue Objective

Primary target:

Existing AOP Holders

Offer:

AIPA Capability Upgrade

Upgrade Fee:

INR 8,850

Target Outcome:

Revenue generation through alumni upgrade campaigns.

---

# Governance Decision

The platform will not pursue feature completeness before revenue activation.

Revenue-generating workflows take priority over administrative enhancements.

---

# Trainer Management Scope Reduction

The previously planned Trainer Management roadmap is reduced.

Deferred:

* Trainer Analytics
* Trainer Reports
* Trainer KPIs
* Batch Performance Analytics
* Monthly Metrics
* Accreditation Insights
* Governance Enhancements
* Dashboard Enhancements

These capabilities do not directly contribute to upgrade conversion.

---

# Immediate Build Objective

Replace hardcoded trainer identities with governed trainer records.

---

# Trainer Registry

Status:

APPROVED

Priority:

CRITICAL

Purpose:

Authoritative source of trainer information for credential generation.

Minimum Schema:

trainerId
trainerName
email
status

No additional fields required for Revenue Sprint.

---

# Trainer Certificate Governance

Status:

APPROVED

Current State:

Trainer names are hardcoded.

Target State:

trainerId
→ Trainer Registry
→ trainerName

Requirements:

* No hardcoded trainer names
* Trainer name resolved dynamically
* Trainer Certificate remains template-driven

---

# University Certificate Governance

Status:

LOCKED

University Certificate must NOT display trainer names.

University Certificate remains institution-centric.

No trainer attribution required.

---

# University Badge Governance

Status:

LOCKED

University Badge must NOT display trainer names.

Badge remains a recognition artifact.

No trainer attribution required.

---

# Student Portal Visibility

Status:

APPROVED

Purpose:

Increase perceived value of credentials and support upgrade conversion.

Learner Portal must expose:

My Credentials

* University Certificate
* Professional Recognition Badge
* Trainer Certificate (when applicable)
* Recognition Status
* Verification Links

---

# Revenue Activation Workflow

Approved Workflow:

Existing AOP Holder
→ Outreach Campaign
→ Upgrade Offer
→ Payment Collection
→ Credential Issuance
→ Portal Visibility

The portal becomes the authoritative post-purchase experience.

---

# 16-Hour Build Priority

Priority 1

Trainer Registry

Priority 2

Trainer Certificate Integration

Priority 3

Credential Testing

* PDF Generation
* PNG Generation

Priority 4

Student Portal Credential Visibility

Priority 5

Alumni Upgrade Campaign

---

# Explicit Non-Priorities

The following are deferred until revenue workflows are operational:

* Trainer Analytics
* Trainer Reports
* Trainer Activity Tracking
* Accreditation Insights
* Governance Reporting
* Batch Performance Reporting
* Monthly Metrics
* Advanced Dashboard Features

---

# Canonical Revenue Path

Trainer Registry
↓
Trainer Certificate Integration
↓
Student Portal Credential Visibility
↓
AOP Upgrade Campaign
↓
AIPA Upgrade Revenue

---

# Governance Lock

For the current sprint:

Every development decision must answer:

"Does this help an alumni upgrade, receive credentials, or view credentials?"

If the answer is No, the work should be deferred.

---

END OF DOCUMENT
