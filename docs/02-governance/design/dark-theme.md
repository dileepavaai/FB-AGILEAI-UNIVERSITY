# Agile AI University

# Dark Theme

---

| Attribute      | Value               |
| -------------- | ------------------- |
| Document       | Dark Theme          |
| Version        | 1.0                 |
| Status         | LOCKED              |
| Classification | Governance          |
| Owner          | Agile AI University |
| Applies To     | Entire Platform     |
| Last Updated   | July 2026           |

---

# Purpose

This document establishes the official Dark Theme governance for Agile AI University.

The Dark Theme provides an alternative visual presentation while preserving the University's institutional identity, accessibility standards and design consistency.

Dark Theme is a presentation layer only.

Business logic, functionality and information architecture remain unchanged.

---

# Scope

This specification applies to:

* Public Website
* Student & Executive Portal
* Administration Portal
* Credential Operations Suite
* Credential Registry
* Certificate Generator
* Badge Generator
* Credential Verification
* Recognition Services
* Future Products

---

# Design Philosophy

The Agile AI University Dark Theme is inspired by professional enterprise software and academic platforms.

The objective is to provide:

* reduced eye strain
* comfortable long-duration usage
* consistent institutional appearance
* accessibility
* visual clarity

The platform shall avoid gaming aesthetics or overly saturated colors.

---

# Theme Principles

## Functional Equivalence

Light and Dark themes shall provide identical functionality.

Changing themes shall never alter behavior.

---

## Token Driven

Dark Theme shall be implemented exclusively through Design Tokens.

Components shall never implement independent dark styling.

---

## Consistency

Every component shall behave consistently across themes.

---

## Accessibility

Dark Theme shall maintain WCAG AA contrast wherever practical.

---

# Theme Architecture

```text
Design Tokens

↓

Light Theme Tokens

↓

Dark Theme Tokens

↓

Components

↓

Pages
```

Components consume tokens.

Components never determine theme colors.

---

# Theme Switching

Supported modes:

* Light
* Dark
* System

The user's preference should be remembered where appropriate.

---

# Color Philosophy

Dark Theme favors:

* deep neutral backgrounds
* restrained accent colors
* high readability
* subtle elevation

Pure black (#000000) should generally be avoided.

---

# Surface Hierarchy

The interface consists of multiple surface levels:

| Level     | Purpose         |
| --------- | --------------- |
| Surface 0 | Page Background |
| Surface 1 | Cards           |
| Surface 2 | Elevated Panels |
| Surface 3 | Dialogs         |
| Surface 4 | Menus           |

Each level should remain visually distinguishable.

---

# Typography

Text hierarchy remains identical across themes.

Only color changes.

Typography scale shall never change between themes.

---

# Elevation

Elevation should rely on subtle contrast rather than heavy shadows.

Dark interfaces generally require softer shadow treatment.

---

# Interactive States

Every interactive element shall support:

* Default
* Hover
* Active
* Focus
* Disabled

Interaction feedback shall remain visible in both themes.

---

# Forms

Form controls shall provide:

* sufficient contrast
* visible focus
* readable placeholder text
* accessible validation

---

# Tables

Tables shall preserve:

* row separation
* readable headers
* hover states
* responsive behavior

---

# Navigation

Navigation shall maintain:

* consistent hierarchy
* clear active states
* readable menus
* accessible focus indicators

---

# Cards

Cards shall remain visually separated from page backgrounds using surface elevation rather than excessive borders.

---

# Images

Images shall not be artificially darkened.

Illustrations should remain visually accurate.

---

# Icons

Icons shall adapt through Design Tokens.

Icons shall preserve sufficient contrast.

---

# Status Colors

Status colors shall remain recognizable.

Supported statuses include:

* Success
* Warning
* Error
* Information
* Neutral

Status colors shall satisfy accessibility requirements.

---

# Motion

Theme switching should occur smoothly.

Animations should remain subtle.

Users preferring reduced motion should receive minimal transition effects.

---

# Accessibility

Dark Theme shall support:

* keyboard navigation
* screen readers
* high contrast
* browser zoom
* reduced motion preferences

Accessibility takes precedence over aesthetics.

---

# Performance

Theme switching should not require page reloads.

Only visual tokens should change.

---

# Governance Rules

1. Components shall never hardcode dark colors.

2. Components shall consume Design Tokens exclusively.

3. Theme changes shall not alter functionality.

4. Dark Theme shall preserve accessibility.

5. Surface hierarchy shall remain consistent.

6. Typography shall remain unchanged between themes.

7. New components shall support both themes before governance approval.

8. Theme behavior shall remain consistent across all products.

9. User preference should be respected where supported.

10. All future UI development shall be Dark Theme compatible.

---

# Related Documents

* UI Design System
* Design Tokens
* Component Library
* Typography
* Layout System
* Responsive Design
* Accessibility

---

# Governance Status

This document is the authoritative Dark Theme specification for Agile AI University.

All products shall implement Dark Theme using the governed Design Token architecture.

Direct component-level theme implementations are prohibited.
