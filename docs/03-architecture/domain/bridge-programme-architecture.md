# Bridge Programme Domain Architecture

**Document Version:** 1.0.0  
**Status:** ACTIVE  
**Phase:** Revenue Sprint  
**Owner:** Agile AI University  
**Architecture Domain:** Programme Progression and Commercial Registration  
**Related Decision:** ADR-026 – Bridge Programme Architecture

---

## 1. Purpose

This document defines the authoritative architecture for Bridge Programmes within the Agile AI University ecosystem.

A Bridge Programme enables an eligible learner to progress from an existing Agile AI University credential or programme into an approved higher-level programme through a governed academic and commercial pathway.

The architecture covers:

- academic eligibility
- programme progression
- commercial eligibility
- registration
- payment
- enrolment
- learning access
- credential progression
- identity binding
- data ownership
- security boundaries
- service responsibilities
- MVP scope
- future scalability

This document is the primary architecture reference for all Bridge Programme implementation work.

---

## 2. Business Context

Agile AI University has existing learners and alumni who may already hold recognised credentials.

These learners must not be required to repeat the complete admission and learning journey when an approved progression pathway exists.

A Bridge Programme provides a controlled mechanism for:

- recognising prior learning
- validating source credentials
- identifying the next approved programme
- offering a reduced commercial fee
- registering the learner
- collecting payment
- creating enrolment
- granting learning access
- supporting future credential progression

The Bridge Programme is not merely a discount mechanism.

It is a governed academic progression capability.

---

## 3. Business Objective

The immediate Revenue Sprint objective is to enable eligible AOP and AAIA learners to register for the AIPA Bridge Programme.

The initial approved progression paths are:

```text
AOP → AIPA
AAIA → AIPA