# SYSTEM CONTEXT LOCK — Agile AI University

**Status:** FINAL · LOCKED · GOVERNANCE RECORD  
**Date:** 8 Feb 2026  
**Applies to:** Entire Agile AI University Platform (single system, single project)

---

## 1. PURPOSE OF THIS DOCUMENT

This document formally **locks the system context, architectural decisions, operational rules, and governance constraints** for Agile AI University as of the current state.  

It exists to:
- Prevent accidental regressions
- Avoid scope drift
- Enable fast execution toward **cash-flow critical paths**
- Allow clean handover across chats, contributors, or time gaps

From this point onward, **all work must comply with this document unless explicitly unlocked via a new governance decision**.

---

## 2. CANONICAL SYSTEM DEFINITION

Agile AI University operates as **one unified system**, not multiple experiments.

### 2.1 Core Characteristics
- Independent academic & professional body
- Advisory, interpretive, non-certifying (except defined credentials)
- No hiring evaluation claims
- No enterprise governance simulation claims

### 2.2 Deployment Model
- **Frontend:** Static sites (Firebase Hosting)
- **Backend:** Google Cloud Run (Node.js / Express)
- **Auth:** Firebase Authentication
- **Data:** Firestore
- **Payments:** Razorpay (existing integration)

---

## 3. BACKEND (CLOUD RUN) — LOCKED

### 3.1 Canonical Backend File
- **File:** `cloudrun-portal/index.js`
- **Status:** CANONICAL · DROP-IN ONLY
- No partial edits allowed
- Full-file replacement only

### 3.2 Health & Readiness Endpoints

| Endpoint | Purpose | Monitoring | Status |
|--------|--------|------------|-------|
| `/` | Canonical health | YES | LOCKED |
| `/health` | Compatibility alias | YES | LOCKED |
| `/ready` | Container readiness | NO | LOCKED |
| `/_meta` | Backend metadata | NO | LOCKED |
| `/_health/firestore` | Firestore safety | NO | LOCKED |

**Rule:**
- Only `/` and `/health` are monitored
- `/ready` is intentionally NOT monitored

---

## 4. MONITORING & ALERTING — LOCKED

### 4.1 Uptime Monitoring
- Google Cloud Monitoring Uptime Check
- Target: `/health`
- Protocol: HTTPS
- Frequency: Default (Google-managed)

### 4.2 Alerting Policy
- **Name:** AAIU Cloud Run Backend – Health Check Failure
- Trigger: Uptime failure
- Retest window: 1 minute

### 4.3 Notification Channels
- **Email ONLY**
- No WhatsApp, SMS, Slack, or PagerDuty
- Email alerts have **zero incremental cost**

**Decision:** WhatsApp intentionally skipped due to:
- Cost
- Operational noise
- Non-criticality at current scale

---

## 5. DASHBOARDS — LOCKED

### 5.1 Custom Dashboard
- **Name:** Cloud Run Backend – Health Status
- Type: Custom

### 5.2 Widgets

**Widget 1: Uptime Status**
- Metric: `Uptime Check URL → Check passed`
- Filter: `check_id = aaiu-cloudrun-backend-health-<id>`
- Aggregation: Fraction true
- Display: Scorecard (percentage)

Purpose:
- One-glance operational confidence
- No alert fatigue

---

## 6. SECURITY & GOVERNANCE — LOCKED

### 6.1 Public Endpoints
- Rate limited
- reCAPTCHA protected
- Country allowlist supported

### 6.2 Admin Endpoints
- Firebase Auth required
- IP allowlist enforced

### 6.3 CORS
- Strictly limited to:
  - `https://assessment.agileai.university`

---

## 7. PHASE‑2 EXECUTIVE INSIGHT — LOCKED (RECONFIRMED)

- Free report = Orientation only
- Paid report = Decision-support advisory
- No scoring or question changes
- Session-based access only
- No direct URL access

This lock remains unchanged.

---

## 8. CURRENT SYSTEM STATE (FACTUAL)

- Monitoring: Active
- Alerts: Email only
- Dashboard: Live
- Backend: Stable
- Revenue: **₹0 since Nov 2025** (CRITICAL)

---

## 9. NEXT EXECUTION PRIORITY — CASH FLOW CRITICAL PATH

From this point onward, **ALL work prioritizes revenue enablement**.

### 9.1 Execution Order (LOCKED)

1. Student Portal completion
2. Executive Portal completion
3. Paid Executive Insight Report flow
4. Course enrollment
5. Certificate generation

---

## 10. DELIVERY ESTIMATES (REALISTIC)

Assuming focused execution (2–4 hrs/day):

| Component | Effort |
|---------|-------|
| Student dashboard (view + access) | 6–8 hrs |
| Executive dashboard (paid gating) | 6–8 hrs |
| Executive Insight report polish | 4–6 hrs |
| Course enrollment flow | 6–10 hrs |
| Certificate generation & lookup | 6–8 hrs |

**Total:** ~28–40 hours

This is achievable in **7–10 focused days**.

---

## 11. NON‑NEGOTIABLE RULES GOING FORWARD

- No architectural rewrites
- No new tech stacks
- No speculative features
- No unpaid scope expansion
- Everything ties back to revenue or trust

---

## 12. FINAL GOVERNANCE STATEMENT

This system is now **STABLE, OBSERVABLE, and READY FOR REVENUE EXECUTION**.

Any future change must:
1. Reference this document
2. State what is being unlocked
3. State why it impacts revenue

---

**LOCK CONFIRMED — END OF DOCUMENT**

