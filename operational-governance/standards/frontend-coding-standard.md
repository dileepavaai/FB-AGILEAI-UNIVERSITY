# Agile AI University Front-End Coding Standard

**Document Type:** Standard
**Version:** 1.0.0
**Status:** LOCKED
**Effective Date:** 2026-06-16
**Authority:** Agile AI University Platform Governance

---

# Purpose

This standard defines the canonical structure, formatting conventions, documentation requirements, and governance expectations for all Agile AI University administrative user interfaces.

The objective is to ensure:

* Consistent source code structure
* Predictable maintenance practices
* Faster onboarding
* Governance transparency
* Architectural stability
* Uniform user experience across all administrative surfaces

---

# Scope

This standard applies to all administrative interfaces including current and future modules.

Current scope includes:

* Credential Operations
* Credential Registry
* Certificate Generator
* Trainer Management
* Trainer Registry
* Batch Management
* Lead Intelligence
* Reconciliation
* Audit Logs

Future administrative modules must comply with this standard unless superseded by a formally approved governance decision.

---

# Governance Status

This standard is considered a platform-level governance artifact.

All new administrative HTML pages must comply.

Existing pages should be aligned during future enhancement cycles.

---

# Mandatory Governance Header

Every production HTML file must begin with a governance header.

Example:

html
<!-- ==========================================
Module Name
Version: x.x.x
Status: ACTIVE

Purpose
------------------------------------------
Module purpose.

Architecture
------------------------------------------
Flow hierarchy.

Governance
------------------------------------------
Locked decisions.
========================================== -->

---

# HTML Formatting Standard

## Rule 1 — Expanded Formatting

Use expanded attribute formatting.

Approved:

html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1" />

Not Approved:

html
<meta name="viewport" content="width=device-width, initial-scale=1" />

---

## Rule 2 — One Major Attribute Per Line

Approved:

html
<button
  id="loginBtn"
  class="btn btn-primary">

  Sign In

</button>

---

## Rule 3 — Expanded Tag Structure

Approved:

html
<section
  id="appView"
  class="hidden">

Compressed structures should be avoided.

---

# Section Separator Standard

Major sections must use large governance separators.

Example:

html
<!-- ==================================================
     PAGE HEADER
================================================== -->

Examples:

html
<!-- ==================================================
     SEARCH
================================================== -->

html
<!-- ==================================================
     RESULTS
================================================== -->

html
<!-- ==================================================
     GOVERNANCE NOTICE
================================================== -->

---

# Required Section Markers

The following markers are mandatory and canonical.

## Core System

html
<!-- 🔒 CORE SYSTEM -->

---

## Design Authority

html
<!-- 🎨 DESIGN AUTHORITY -->

---

## Common Surfaces

html
<!-- 🧩 COMMON SURFACES -->

---

## Domain Surface

html
<!-- 🎯 DOMAIN SURFACE -->

---

## Header

html
<!-- 🔷 HEADER -->

---

## Footer

html
<!-- 🔷 FOOTER -->

---

## Login View

html
<!-- 🔐 LOGIN VIEW -->

---

## Application View

html
<!-- 🔷 APPLICATION VIEW -->

---

## Bootstrap

html
<!-- 🔥 APP BOOTSTRAP -->

---

# Architecture Documentation Requirement

Every production page must document its architectural position.

Example:

javascript
/*
==================================================
TRAINER REGISTRY

Architecture

Admin
  ↓
Trainer Management
  ↓
Trainer Registry
==================================================
*/

---

# Governance Documentation Requirement

Every production page must document governance decisions relevant to that page.

Example:

javascript
/*
Governance

- Trainer IDs immutable
- Registry is authoritative source
- No certificate rendering
- No credential ownership logic
*/

---

# Script Organization Standard

Recommended structure:

javascript
import { initAdminApp }
  from "../../assets/js/admin-app.js";

import { loadAdminSidebar }
  from "../../shared/design-authority/js/admin-sidebar.js";

/*
==================================================
MODULE NAME
==================================================
*/

loadAdminSidebar(
  "module-name"
);

initAdminApp();

---

# Inline Logic Policy

## Allowed

Simple navigation helpers.

Example:

javascript
function openBatch(batchId) {

  window.location.href =
    `batch-view.html?batch_id=${batchId}`;

}

---

## Not Allowed

Business logic inside HTML.

Examples:

* Firestore writes
* Firestore reads
* Data transformations
* Workflow orchestration
* Credential generation logic
* Batch processing logic

These must reside in dedicated JavaScript controllers.

---

# Production Metadata Requirement

Every production HTML page must contain:

* Module Name
* Version
* Status
* Purpose
* Architecture
* Governance

---

# CSS Formatting Standard

All production CSS files should begin with:

css
/* ==================================================
   MODULE NAME
   Version: x.x.x
   Status: ACTIVE
================================================== */

Recommended section organization:

css
/* ==================================================
   LAYOUT
================================================== */

css
/* ==================================================
   FORMS
================================================== */

css
/* ==================================================
   TABLES
================================================== */

css
/* ==================================================
   ACTIONS
================================================== */

css
/* ==================================================
   RESPONSIVE
================================================== */

---

# JavaScript Formatting Standard

All production JavaScript files should begin with:

javascript
/* =====================================================
   MODULE NAME
   Version: x.x.x
   Status: ACTIVE
===================================================== */

Recommended organization:

javascript
/* =====================================================
   STATE
===================================================== */

javascript
/* =====================================================
   HELPERS
===================================================== */

javascript
/* =====================================================
   FIRESTORE
===================================================== */

javascript
/* =====================================================
   RENDERING
===================================================== */

javascript
/* =====================================================
   EVENTS
===================================================== */

javascript
/* =====================================================
   INIT
===================================================== */

---

# Documentation Philosophy

Agile AI University prioritizes:

* Readability over brevity
* Governance visibility over minimalism
* Long-term maintainability over short-term convenience
* Explicit architecture over implicit assumptions

Source code is treated as both executable implementation and operational documentation.

---

# Architecture Alignment

The following modules are currently aligned to this standard:

* Credential Operations
* Credential Registry
* Certificate Generator
* Trainer Management
* Trainer Registry
* Batch Management
* Lead Intelligence
* Reconciliation
* Audit Logs

Future administrative modules must align to this standard.

---

# Governance Decision

**Decision ID:** AAU-FE-STD-001

**Decision:**

The Agile AI University Front-End Coding Standard is adopted as the canonical formatting, documentation, and governance standard for all administrative user interface development.

**Status:** LOCKED

**Date Locked:** 2026-06-16

**Change Control:**

Any modification to this standard requires a formal governance decision and version increment.
