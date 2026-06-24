# Portal Coding Standards

**Agile AI University**

---

## Document Information

| Attribute  | Value                        |
| ---------- | ---------------------------- |
| Document   | Portal Coding Standards      |
| File       | `portal-coding-standards.md` |
| Version    | 1.0.0                        |
| Status     | **LOCKED**                   |
| Governance | Portal Governance v1.0       |
| Owner      | Agile AI University          |

---

# Purpose

This document defines the coding standards for all source code developed within the Agile AI University Portal ecosystem.

The objective is to ensure that every HTML, CSS, and JavaScript file is consistent, self-documenting, maintainable, and understandable regardless of when it was created or who maintains it.

Code should remain readable and understandable after six months, one year, or longer without requiring external explanation.

---

# Guiding Principles

Every source file should:

* Have a single responsibility.
* Be self-documenting.
* Follow a consistent structure.
* Be version controlled.
* Clearly express architectural intent.
* Separate presentation from business logic.
* Follow governed ownership boundaries.

Code should be written for future maintainers rather than only for current implementation.

---

# File Header Standard

Every production file must begin with a governance header.

The header shall include:

* Module
* Component or Page
* File
* Version
* Status
* Governance
* Purpose
* Responsibilities
* Must Never
* Dependencies
* Change History

No production file should omit this header.

---

# Version Management

Every production source file shall maintain its own version history.

Version progression:

```text
1.0.0

1.1.0

1.2.0

2.0.0
```

The change history should explain architectural evolution rather than implementation details.

---

# Single Responsibility Principle

Each file must own exactly one responsibility.

Examples:

| File                         | Responsibility            |
| ---------------------------- | ------------------------- |
| credential-renderer.js       | Render credential data    |
| credential-service.js        | Prepare credential data   |
| credential-detail.js         | Render credential details |
| credential-detail-actions.js | Handle user interactions  |

Rendering, interaction, services, and governance should remain independent.

---

# HTML Standards

HTML is responsible for:

* Structure
* Accessibility
* Semantic markup
* Experience composition

HTML must never:

* Query APIs
* Perform authorization
* Resolve entitlements
* Execute business logic

---

# HTML Layout Standard

Portal pages shall follow this order:

```text
Governance Header

↓

Document Head

↓

Portal Header

↓

Page Hero

↓

Primary Experience

↓

Supporting Experience

↓

Professional Actions

↓

Portal Footer

↓

JavaScript Layer
```

---

# HTML Comment Standard

Major sections shall begin with a banner.

Example:

```text
=====================================================
Credential Hero
=====================================================
```

Subsections should follow the same pattern.

---

# CSS Standards

CSS is responsible for:

* Layout
* Typography
* Colors
* Responsive behavior
* Animation

CSS must never encode business logic or application state.

Class names should describe presentation rather than implementation.

Example:

```css
.detail-card
.asset-grid
.page-header
```

Avoid names such as:

```css
.box1
.left
.card2
```

---

# JavaScript Standards

JavaScript files shall be organized into clearly defined sections.

Recommended order:

```text
Governance Header

↓

Initialization

↓

Constants

↓

Configuration

↓

Public Functions

↓

Private Functions

↓

Lifecycle

↓

Bootstrap
```

---

# Comment Standards

Every major section should include a banner comment.

Example:

```text
=====================================================
Navigation
=====================================================
```

Comments should explain architectural intent rather than restate code.

Preferred:

```text
Navigation is credential-centric.

Only the Credential ID is propagated
between Portal experiences.
```

Avoid:

```text
Navigate to URL.
```

---

# Logging Standards

Every controller should define:

```javascript
const LOG_PREFIX =
"[Credential Detail]";
```

Use:

```javascript
console.info()
console.warn()
console.error()
```

Avoid excessive use of `console.log()` in production.

Logs should be descriptive and searchable.

---

# Configuration Standards

Configuration should be centralized and immutable.

Example:

```javascript
const ROUTES = Object.freeze({

    VERIFY:

    UNIVERSITY_CERTIFICATE:

    TRAINER_CERTIFICATE:

    UNIVERSITY_BADGE:

});
```

Avoid scattering route strings throughout the code.

---

# Naming Standards

Variables should express business meaning.

Preferred:

```javascript
credentialId
credentialHolder
portalAccess
visibleCredentials
```

Avoid:

```javascript
data
obj
item
tmp
```

---

# Function Standards

Functions should perform one task.

Preferred:

```javascript
populateCredential()

bindEvents()

navigate()

showEmptyState()
```

Avoid large multifunction procedures.

---

# Event Standards

Portal events follow:

```text
domain:event
```

Examples:

```text
credentials:rendered

recognitions:rendered

entitlements:ready

dashboard:loaded
```

---

# DOM Standards

IDs represent business data.

Classes represent presentation.

Example:

```html
id="credential-title"

class="detail-card"
```

---

# Error Handling

Every component should fail safely.

Errors should:

* Be logged.
* Avoid breaking page rendering.
* Display governed user-friendly messages where appropriate.

---

# Defensive Programming

Every component should validate:

* Required DOM elements.
* Required data.
* Required configuration.

Missing components should fail gracefully.

---

# Separation of Concerns

The following responsibilities shall remain isolated:

| Layer                  | Responsibility   |
| ---------------------- | ---------------- |
| Authentication         | Identity         |
| Authorization          | Portal Entry     |
| Entitlement Resolution | Visibility       |
| Service                | Data Preparation |
| Renderer               | Presentation     |
| Action Controller      | Interaction      |

Responsibilities must never overlap.

---

# Accessibility Standards

Portal pages should:

* Use semantic HTML.
* Maintain heading hierarchy.
* Include image alternative text.
* Support keyboard navigation.
* Preserve readable color contrast.
* Avoid interaction based solely on color.

---

# Performance Standards

Portal code should:

* Avoid unnecessary DOM updates.
* Avoid duplicate event registration.
* Minimize global state.
* Reuse governed services.
* Keep rendering idempotent where practical.

---

# Governance Rules

Portal code must never:

* Duplicate entitlement logic.
* Duplicate authorization logic.
* Query Firestore from presentation.
* Mix rendering and interaction.
* Modify resolver output.
* Hard-code business rules in UI components.

---

# Code Review Checklist

Every production change should verify:

* Governance header updated.
* Version incremented.
* Change history maintained.
* Single responsibility preserved.
* Naming standards followed.
* Comments explain architectural intent.
* Logging is consistent.
* Error handling present.
* Defensive validation implemented.
* Separation of concerns maintained.

---

# Future Evolution

These standards are intended to evolve as the Portal grows.

Future revisions may introduce:

* Component libraries.
* Shared design system.
* Automated linting rules.
* Accessibility audits.
* Coding templates.
* Architecture Decision Records (ADRs).
* Static analysis and governance tooling.

Future enhancements should extend these standards without breaking the established architectural principles.

---

# Governance Status

This document is the authoritative coding standard for all Agile AI University Portal source code.

All Portal HTML, CSS, and JavaScript implementations shall conform to these standards unless superseded by an approved governance revision.

---

**Status:** **LOCKED**

**Version:** **1.0.0**
