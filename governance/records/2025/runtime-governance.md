# 🔒 Runtime & SDK Governance — Agile AI University

**STATUS:** FINAL · LOCKED · PRODUCTION  
**CHANGE AUTHORITY:** ❌ NONE (unless explicitly unlocked)  
**LAST REVIEWED:** 2026-01-XX  
**APPLIES TO:** Portal, Assessment, Cloud Functions, Entitlements, Payments

---

## 1️⃣ Purpose

This document defines the **canonical runtime, SDK, and tooling versions** used across the Agile AI University platform.

Its goals are to:

- Preserve **deterministic system behavior**
- Prevent **accidental runtime drift**
- Protect **entitlement, payment, and credential integrity**
- Ensure **long-term operational stability**

> Stability and governance take precedence over SDK currency.

---

## 2️⃣ Core Governance Principle

Agile AI University operates under a **frozen runtime contract**.

- No implicit upgrades
- No partial migrations
- No auto-updates
- No mixed SDK generations

Any deviation **must be explicitly unlocked and documented**.

---

## 3️⃣ Canonical Runtime Versions (Production)

### 🧠 Cloud Functions (Backend)

| Component | Version | Source of Truth | Governance |
|--------|--------|----------------|-----------|
| Node.js (runtime) | **20.x** | `functions/package.json → engines.node` | 🔒 Locked |
| firebase-functions | **4.4.1** | `functions/package.json` | 🔒 Locked |
| firebase-admin | **12.5.0** | `functions/package.json` | 🔒 Locked |
| Razorpay SDK | **2.9.6** | `functions/package.json` | ⚠️ Rare |
| nodemailer | **6.9.12** | `functions/package.json` | 🔒 Locked |
| @sendgrid/mail | **8.1.6** | `functions/package.json` | 🔒 Locked |

**Notes:**
- Firebase deploy uses **Node 20** in the cloud regardless of local Node version.
- Backend behavior is validated against these exact versions.

---

### 🛠 Developer Tooling (Local)

| Component | Version | Governance |
|--------|--------|-----------|
| Firebase CLI (`firebase-tools`) | ≥ **13.x** (current: 13.29.1) | ⚠️ Minimum only |
| Node.js (local) | ≥ **18.x** | ⚠️ Dev-only |
| npm | ≥ **9.x** | ⚠️ Dev-only |

**Important:**
- CLI and local Node versions **do not define production behavior**
- They must only meet minimum compatibility requirements

---

### 🌐 Frontend Firebase SDK (Portal & Assessment)

| Aspect | Value |
|-----|------|
| SDK generation | Firebase **v8 / v9-compat** |
| API style | Namespaced (`firebase.auth()`) |
| Import method | Script tags (`firebase-app.js`, etc.) |
| Module system | ❌ None (no ESM, no bundler) |
| Governance | 🔒 Explicitly frozen |

**Explicitly prohibited:**
- Modular v9 migration
- Mixed compat + modular usage
- Tree-shaken or ESM Firebase imports

---

## 4️⃣ Source of Truth Matrix

| Component | Source of Truth | Change Authority |
|--------|----------------|----------------|
| Node.js (Functions) | `functions/package.json` | ❌ Locked |
| firebase-functions | `functions/package.json` | ❌ Locked |
| firebase-admin | `functions/package.json` | ❌ Locked |
| Razorpay SDK | `functions/package.json` | ⚠️ Rare |
| Firebase CLI | Developer machine | ⚠️ Min only |
| Frontend Firebase SDK | HTML / bundled scripts | ❌ Locked |

---

## 5️⃣ Accepted Constraints (Intentional)

### ⚠️ Firebase Extensions Warning

The project may emit warnings such as:

> “firebase-functions SDK does not support newest Firebase Extensions features”

This is **intentional and accepted** because:

- Firebase Extensions are **not used**
- Upgrading SDKs risks:
  - Auth trigger behavior drift
  - Firestore event semantic changes
  - Entitlement bridge instability

> Determinism is prioritized over feature freshness.

---

## 6️⃣ Partial Upgrade Prohibition

The following are **explicitly forbidden**:

- Upgrading firebase-functions without reviewing auth + Firestore triggers
- Migrating frontend Firebase SDK independently
- Mixing Node runtime expectations
- Introducing new auth providers without governance approval

> Partial upgrades are the **primary source of production regressions**.

---

## 7️⃣ Change Control Policy

Any of the following **REQUIRES an explicit governance unlock**:

- Node runtime changes
- firebase-functions or firebase-admin upgrades
- Frontend Firebase SDK migration
- Auth provider model changes
- Entitlement resolution flow changes
- Payment or webhook SDK changes

Until unlocked:

> **All runtime and SDK versions are frozen.**

---

## 8️⃣ Governance Enforcement (Recommended)

- Reference this document in:
  - `functions/index.js`
  - `firebase-init.js`
- Add header comment:
```js
// 🔒 Runtime governed — see /governance/runtime-governance.md

import { runRuntimeSelfChecks } from "./runtime-self-check-runner.js";

const results = await runRuntimeSelfChecks();
console.log(JSON.stringify(results, null, 2));
