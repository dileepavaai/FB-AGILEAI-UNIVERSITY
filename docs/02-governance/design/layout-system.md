# Agile AI University

# Layout System

---

| Attribute      | Value               |
| -------------- | ------------------- |
| Document       | Layout System       |
| Version        | 1.0                 |
| Status         | LOCKED              |
| Classification | Governance          |
| Owner          | Agile AI University |
| Applies To     | Entire Platform     |
| Last Updated   | July 2026           |

---

# Purpose

This document establishes the official layout system for Agile AI University.

The Layout System defines how pages, sections and reusable components are arranged to produce a consistent, readable and scalable user experience.

Layouts provide structure.

Components provide presentation.

Business logic provides behavior.

---

# Scope

This specification governs layout across:

* Public Website
* Student & Executive Portal
* Administration Portal
* Credential Operations Suite
* Credential Registry
* Certificate Generator
* Badge Generator
* Recognition Services
* Verification Services
* Future Products

---

# Layout Philosophy

The Agile AI University layout system is founded on five principles.

## Content First

Content determines layout.

Layouts exist to improve readability.

---

## Consistency

Every page follows recognizable structural patterns.

Users should immediately understand where information is located.

---

## Simplicity

Layouts should avoid unnecessary nesting.

Whitespace is preferred over visual separators.

---

## Flexibility

Layouts adapt to different content while maintaining a consistent visual rhythm.

---

## Scalability

Layouts must support future modules without redesign.

---

# Layout Hierarchy

```text
Application

↓

Page

↓

Section

↓

Container

↓

Grid

↓

Component

↓

Content
```

Each level has a single responsibility.

---

# Standard Page Structure

Every page should follow this general structure:

```text
Header

↓

Hero (optional)

↓

Page Introduction

↓

Primary Content

↓

Supporting Content

↓

Actions

↓

Footer
```

---

# Containers

Containers define horizontal boundaries.

| Container       | Maximum Width |
| --------------- | ------------- |
| Standard        | 1280px        |
| Reading Content | 960px         |
| Forms           | 720px         |
| Dialogs         | 640px         |
| Wide Dashboard  | 1440px        |

Containers remain centered.

---

# Page Width

Maximum page width:

```text
1280px
```

Reading width:

```text
70–80 characters
```

Long-form content should never span the full viewport.

---

# Grid System

The platform uses a responsive grid.

Desktop

* 12 columns

Tablet

* 8 columns

Mobile

* 4 columns

Components align to the grid whenever practical.

---

# Section Spacing

Standard vertical rhythm:

| Between               | Space |
| --------------------- | ----: |
| Heading → Paragraph   |  24px |
| Paragraph → Paragraph |  16px |
| Section → Section     |  48px |
| Card → Card           |  24px |
| Component → Component |  16px |

Spacing should consume Design Tokens.

---

# Dashboard Layout

Dashboards prioritize clarity.

Recommended structure:

```text
Hero

↓

KPIs

↓

Primary Widgets

↓

Secondary Widgets

↓

Recent Activity
```

Dashboard widgets should align to a consistent grid.

---

# Card Layout

Cards contain related information.

A card should include:

* Title
* Optional description
* Content
* Optional actions

Cards should not become miniature pages.

---

# Form Layout

Forms should follow a single-column layout unless comparison or efficiency clearly benefits from multiple columns.

Guidelines:

* Labels above inputs
* Consistent spacing
* Inline validation
* Logical grouping

---

# Hero Layout

Hero sections include:

* Title
* Supporting text
* Primary action
* Optional secondary action

Hero sections should avoid excessive imagery.

---

# Split Layout

Used for dashboards and portals.

Example:

```text
Sidebar

↓

Main Content
```

or

```text
Primary Panel

↓

Secondary Panel
```

---

# Sidebar

Recommended width:

```text
280px
```

Sidebars should remain fixed in width while main content expands.

---

# Alignment

Default alignment:

* Left

Center alignment:

* Empty states
* Success pages
* Hero sections

Right alignment:

* Numeric values
* Financial data
* Metrics

---

# Whitespace

Whitespace is intentional.

It improves:

* readability
* focus
* hierarchy

Whitespace should not be replaced with decorative elements.

---

# Responsive Layout

Layouts adapt progressively.

Desktop

* Multi-column

Tablet

* Reduced columns

Mobile

* Single-column where practical

Content order should remain logical.

---

# Breakpoints

| Device       | Breakpoint |
| ------------ | ---------: |
| Mobile       |     <768px |
| Tablet       | 768–1023px |
| Desktop      |    ≥1024px |
| Wide Desktop |    ≥1440px |

---

# Sticky Regions

The following elements may use sticky positioning when it improves usability:

* Primary Header
* Secondary Navigation
* Dashboard Filters
* Table Headers
* Action Toolbars

Sticky elements must not obscure page content.

---

# Page Templates

Approved page templates include:

* Landing Page
* Dashboard
* Detail Page
* List Page
* Form Page
* Settings Page
* Authentication Page
* Error Page
* Empty State
* Search Results

New templates require governance approval.

---

# Component Placement

Components should occupy predictable locations.

Examples:

| Component    | Placement                 |
| ------------ | ------------------------- |
| Breadcrumb   | Top of page               |
| Hero         | Top section               |
| Page Actions | Upper right or below hero |
| Filters      | Above data                |
| Pagination   | Bottom of lists           |
| Footer       | End of page               |

---

# Layout Tokens

Layouts shall consume Design Tokens for:

* spacing
* width
* borders
* shadows
* radius

Hardcoded layout values should be avoided whenever equivalent tokens exist.

---

# Accessibility

Layouts must support:

* keyboard navigation
* logical reading order
* responsive zoom
* screen readers

Visual order must match DOM order whenever possible.

---

# Governance Rules

1. Layouts shall use approved containers.

2. Layouts shall consume Design Tokens.

3. Layouts shall maintain consistent spacing.

4. Layouts shall follow the approved grid.

5. Excessive nesting is discouraged.

6. Layouts shall support responsive behavior.

7. Sticky elements shall improve usability and never obstruct content.

8. Layout decisions shall prioritize readability over visual density.

9. New layout patterns require governance approval.

10. Every product shall inherit this Layout System.

---

# Related Documents

* UI Design System
* Design Tokens
* Component Library
* Typography
* Responsive Design
* Accessibility

---

# Governance Status

This document is the authoritative layout specification for Agile AI University.

All products within the Agile AI University ecosystem shall adopt this Layout System to ensure a consistent, maintainable and institutionally aligned user experience.

Changes to the Layout System require formal governance review and approval.
