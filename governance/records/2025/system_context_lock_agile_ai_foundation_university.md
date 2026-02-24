# SYSTEM CONTEXT LOCK — AgileAI Foundation & Agile AI University

**Status:** FINAL · GOVERNANCE LOCK

**Purpose of this Document**
This document formally captures the *canonical system context*, architectural decisions, governance rules, brand posture, and operating principles agreed so far. It is designed so that **any future conversation, implementation, or contributor (including a new AI chat)** can proceed without loss of intent, reversals, or ambiguity.

This is written from the combined lenses of:
- CEO & Institutional Steward
- System Architect
- Entrepreneur / Operator
- Governance-first builder of public digital infrastructure

This context is considered **binding unless explicitly superseded by a new System Context Lock**.

---

## 1. ORGANIZATIONAL POSITIONING (LOCKED)

### 1.1 Entity Structure
- **AgileAI Foundation**
  - Public-facing, non-commercial, institutional body
  - Owns governance, principles, research positioning, and public trust

- **Agile AI University**
  - Academic & professional institution under the Foundation umbrella
  - Focused on capability development, assessment, credentials, and insight

> The Foundation exists to protect *credibility, ethics, and long-term legitimacy*. The University exists to deliver *structured capability and insight*.

---

## 2. BRAND & ETHOS (LOCKED)

### 2.1 Brand Characteristics
- Serious, calm, institutional
- Non-hype, non-marketing
- Authority through clarity, not promotion
- Global, neutral, professional

### 2.2 Explicit Non-Claims
The following are **explicitly excluded**:
- No training sales language
- No coaching promises
- No certification-for-sale framing
- No hiring, ranking, or evaluative guarantees
- No surveillance or growth-hacking analytics

> Trust > reach. Governance > growth. Signal > noise.

---

## 3. ARCHITECTURAL PHILOSOPHY (LOCKED)

### 3.1 Core Principle
**Separation of concerns is non-negotiable.**

Each surface has a single purpose:
- Public site → legitimacy, orientation, trust
- Assessment → capability signal, not marketing
- Executive insight → paid decision support, not reports
- Admin → internal, protected, explicit

No surface is allowed to "do everything".

---

## 4. TECHNICAL ARCHITECTURE (LOCKED)

### 4.1 Repository & Hosting Structure
- Firebase project: `FB-AgileAI-University`
- Hosting targets are separated and intentional:
  - `public-site/` → Foundation & University public presence
  - `public-assessment/` → Assessment system (logic frozen)
  - `public-portal/` → Student / Executive portal
  - `public-certs/` → Credential verification
  - `public-admin/` → Admin UI (restricted)

### 4.2 Deployment Rules
- Hosting is managed **only via Firebase CLI**
- No auto-hosting via web app flows
- Full-file replacement only for locked files

---

## 5. GOVERNANCE RULES (LOCKED)

### 5.1 Change Control
- Locked phases may not be partially edited
- All changes must be:
  - Explicit
  - Full-file replacements
  - Context-aware

### 5.2 UX Safety (Admin)
**Batch Creation UX Safety Rule — FINAL**
- Program Code must never auto-select
- Program Code selection is mandatory
- Confirmation modal is mandatory
- Irreversible bindings must be warned clearly

This rule applies globally and permanently.

---

## 6. ASSESSMENT & INSIGHT SYSTEM (LOCKED)

### 6.1 Assessment
- Question set is frozen
- Scoring logic frozen
- Free report = Orientation only

### 6.2 Executive Insight (Paid)
- Advisory & interpretive only
- Non-certifying
- Non-hiring evaluative
- Session-based access is intentional
- `execInsightUnlocked === true` is mandatory

Mobile vs desktop behavior differences are intentional.

---

## 7. PRIVACY, ANALYTICS & ETHICS (LOCKED)

### 7.1 Analytics Posture
- **Privacy-first by default**
- No cookies
- No client-side tracking
- No behavioral profiling

### 7.2 Cloudflare
- Cloudflare is used for:
  - DNS
  - SSL
  - Security
  - Edge-level analytics

- Cloudflare RUM / Web Analytics JS:
  - **Explicitly not enabled**
  - Token-based beacons intentionally excluded

Edge analytics alone are considered sufficient.

### 7.3 AI Crawl Control
- Cloudflare AI Crawl Control enabled
- Robots.txt managed via Cloudflare
- Default stance: block AI training bots

---

## 8. SEO & DISCOVERABILITY (LOCKED)

### 8.1 SEO Philosophy
- Canonical, clean, semantic HTML
- No keyword stuffing
- No growth marketing
- No backlink manipulation

SEO is treated as **discoverability**, not acquisition.

---

## 9. LEADERSHIP INTENT & IMPACT

This system is designed to:
- Outlast trends
- Withstand scrutiny
- Earn trust slowly
- Scale without moral debt

It prioritizes:
- Institutional legitimacy
- Cognitive clarity
- Ethical AI practice
- Global neutrality

> This is not a startup pretending to be an institution.
> This is an institution built with startup-grade execution discipline.

---

## 10. EXECUTION MODE (LOCKED)

- Slow, deliberate, correct
- No shortcuts
- No silent assumptions
- No irreversible decisions without confirmation

Every phase ends with a **clean closure** before the next begins.

---

## 11. CURRENT STATE SUMMARY

- Cloudflare: Active, verified
- Analytics: Edge-only, verified
- Governance pages: Canonical
- SEO baseline: Clean
- Next execution phase: **Learning Portal Hardening**

---

**END OF SYSTEM CONTEXT LOCK**

Any future work must explicitly reference this context or intentionally replace it with a newer locked version.

