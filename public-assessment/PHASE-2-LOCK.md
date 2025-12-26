# PHASE-2 LOCK — Agile + AI Capability Assessment

Status: 🔒 LOCKED  
Effective Date: 23 December 2025

---

## 1. Purpose of This File

This document is the **canonical lock** for Phase-2 of the Agile + AI Capability Assessment system.

Its purpose is to:

- Preserve original intent
- Prevent scope drift
- Protect monetization logic
- Ensure governance consistency
- Enable safe future Phase-3 expansion

Any change that violates this lock **must be explicitly versioned as Phase-3**  
and must not be introduced silently.

---

## 2. Phase-2 Definition (What Phase-2 IS)

Phase-2 is defined as:

**A gated Executive Insight layer that provides decision-grade interpretation  
on top of the existing Agile + AI Capability Assessment.**

Phase-2 adds:

- Executive framing
- Leadership readiness interpretation
- Role & scope alignment signals
- Risk & constraint signals (at leadership / scale level)
- 90-day executive focus guidance
- Governance & usage framing

Phase-2 does **NOT** change:

- Assessment questions
- Number of questions
- Scoring logic
- Signal generation
- Capability dimensions
- Free Insight Report content
- PDF generation logic for the free report

---

## 3. Locked Architecture

Phase-2 consists of **exactly two user-visible layers**.

### A. Free Layer (Unlocked)

Files:
- `assessment.html`
- `assessment.js`
- `report.html`

Characteristics:
- Orientation-grade insights
- Capability snapshot
- Capability signals
- Overall reflection
- Free PDF download
- No gating
- No payment
- No entitlement required

This layer is the **primary and complete experience** for free users.

---

### B. Executive Layer (Gated)

Files:
- `executive-insight.html`

Characteristics:
- Decision-grade interpretation
- Leadership framing
- Role alignment & scope signals
- Risk & constraint interpretation
- 90-day executive focus
- Governance & usage notice
- Same underlying signals (no re-scoring)

There is **no third layer** in Phase-2.

---

## 4. Entitlement Model (LOCKED)

Phase-2 access is governed by:

- A **single boolean flag**
- Storage mechanism: `sessionStorage`
- Canonical key:

```js
executiveInsightEntitled = true | false
