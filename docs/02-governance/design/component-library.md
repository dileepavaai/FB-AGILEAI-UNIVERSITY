# Agile AI University

# Component Library

---

| Attribute      | Value               |
| -------------- | ------------------- |
| Document       | Component Library   |
| Version        | 1.0                 |
| Status         | LOCKED              |
| Classification | Governance          |
| Owner          | Agile AI University |
| Applies To     | Entire Platform     |
| Last Updated   | July 2026           |

---

# Purpose

This document defines the official reusable UI component library for Agile AI University.

The objective is to ensure every product within the Agile AI University ecosystem presents a consistent, maintainable and governed user experience.

Every user interface must be assembled from approved components rather than creating page-specific visual elements.

---

# Scope

This specification applies to:

* Public Website
* Student & Executive Portal
* Administration Portal
* Credential Operations Suite
* Certificate Generator
* Badge Generator
* Credential Registry
* Credential Verification
* Recognition Services
* Future Products

---

# Component Philosophy

Components are reusable building blocks.

A component is developed once and reused throughout the platform.

Every component shall:

* solve one responsibility
* be reusable
* be accessible
* be responsive
* consume design tokens
* support light and dark themes
* maintain consistent behavior

---

# Component Architecture

```
Design System

↓

Design Tokens

↓

Component Library

↓

Layouts

↓

Pages

↓

Products
```

Pages must never create new visual patterns when an approved component already exists.

---

# Component Categories

The official component library is organized into the following categories.

## Navigation

* Site Header
* Portal Header
* Sidebar Navigation
* Mobile Navigation
* Mega Menu
* Breadcrumb
* Footer
* Pagination
* Tabs

---

## Buttons

Supported button types:

* Primary
* Secondary
* Ghost
* Outline
* Text
* Danger
* Success
* Disabled
* Icon Button

Rules

* One Primary Button per action group
* Secondary Buttons support primary actions
* Ghost Buttons are used for low-emphasis actions
* Text Buttons are used for inline actions

---

## Cards

Supported card types:

* Information Card
* Dashboard Card
* Credential Card
* Recognition Card
* Statistics Card
* Summary Card
* Profile Card
* Empty State Card

Cards define layout only.

Cards never own business logic.

---

## Forms

Supported components:

* Text Field
* Text Area
* Password
* Email
* Search
* Number
* Date
* Time
* Dropdown
* Checkbox
* Radio Button
* Toggle
* File Upload

Validation messages follow the platform validation standard.

---

## Tables

Supported features:

* Sort
* Filter
* Search
* Pagination
* Responsive Layout
* Sticky Header
* Row Actions

Tables remain typography-first.

Heavy borders are discouraged.

---

## Status Components

Supported status indicators:

* Success
* Pending
* Active
* Draft
* Archived
* Warning
* Failed
* Disabled

Status is communicated through:

* icon
* label
* color

Color alone shall never communicate status.

---

## Alerts

Supported alert types:

* Information
* Success
* Warning
* Error

Alerts communicate system messages only.

Alerts never replace validation.

---

## Notifications

Supported notification types:

* Toast
* Banner
* Inline Notification

Notifications should be temporary unless requiring user action.

---

## Badges

Supported badge types:

* Credential Badge
* Status Badge
* Category Badge
* Feature Badge
* Version Badge

Badges communicate metadata.

Badges are not buttons.

---

## Chips

Supported chips:

* Filter Chip
* Tag Chip
* Selection Chip

Chips represent metadata or filtering.

---

## Avatars

Supported avatars:

* User Avatar
* Trainer Avatar
* Organization Avatar

Fallback initials are mandatory.

---

## Icons

Icons supplement text.

Icons never replace labels.

Icons must originate from the approved icon library.

---

## Dropdowns

Supported dropdowns:

* Navigation
* Selection
* Action Menu

Dropdowns must support keyboard navigation.

---

## Accordions

Accordions organize long-form content.

Only one accordion group should be expanded by default unless business requirements specify otherwise.

---

## Dialogs

Supported dialogs:

* Confirmation
* Warning
* Information
* Form Dialog

Dialogs should interrupt workflow only when necessary.

---

## Tooltips

Tooltips provide supplementary information.

Critical instructions must never rely solely on tooltips.

---

## Loading Components

Supported loading experiences:

* Spinner
* Skeleton Screen
* Progress Bar

Skeleton screens are preferred for page loading.

---

## Empty States

Empty states communicate:

* no data
* no search results
* no credentials
* no notifications
* no reports

Every empty state should include:

* title
* explanation
* recommended action

---

## Search Components

Supported search experiences:

* Search Bar
* Instant Search
* Search Results
* Search Filters

Search should support keyboard interaction.

---

## Dashboard Components

Supported dashboard widgets:

* KPI Card
* Statistic Tile
* Activity Timeline
* Recent Items
* Quick Actions
* Charts
* Summary Panels

Dashboard widgets remain modular.

---

## Credential Components

Official credential components include:

* Credential Card
* Credential Preview
* Recognition Assets
* Certificate Viewer
* Badge Viewer
* Credential Metadata
* Credential Actions

These components are governed separately by Credential Governance.

---

## Recognition Components

Supported components:

* Certificate Preview
* Digital Badge
* Verification Panel
* Recognition Timeline

Recognition components must follow Recognition Governance.

---

# Component Naming

Every reusable component uses PascalCase.

Examples:

```
PrimaryButton

SecondaryButton

CredentialCard

DashboardCard

SearchBar

Breadcrumb

StatusBadge

InformationPanel
```

---

# Component Ownership

Components own presentation only.

Business logic belongs to services.

Example:

```
CredentialCard

✓ Layout

✓ Typography

✓ Buttons

✓ Icons

✗ Authentication

✗ Authorization

✗ API Calls

✗ Entitlement Resolution
```

---

# Design Token Usage

Components shall consume:

* colors
* typography
* spacing
* elevation
* shadows
* border radius

from:

design-tokens.css

Hardcoded visual values are prohibited.

---

# Accessibility Requirements

Every component shall support:

* keyboard navigation
* visible focus
* screen readers
* sufficient contrast
* semantic HTML
* ARIA where appropriate

---

# Responsive Requirements

Every component shall support:

* Desktop
* Tablet
* Mobile

Components should adapt layout without changing interaction patterns.

---

# Dark Theme Support

Dark mode shall be implemented exclusively through design token overrides.

Components shall not implement their own dark theme styling.

---

# Component Lifecycle

Every new component progresses through the following lifecycle:

```
Proposal

↓

Review

↓

Approval

↓

Development

↓

Accessibility Review

↓

Design Review

↓

Documentation

↓

Production

↓

Maintenance
```

---

# Component Governance Rules

1. Components must consume design tokens.

2. Components must never hardcode colors.

3. Components must never hardcode typography.

4. Components must never hardcode spacing.

5. Components must remain reusable.

6. Components must remain framework independent where practical.

7. Components must not contain business logic.

8. Components must support accessibility.

9. Components must support responsive layouts.

10. Components must support future dark theme compatibility.

11. New components require governance approval before platform adoption.

---

# Approved Component Inventory

| Category    | Component          | Status   |
| ----------- | ------------------ | -------- |
| Navigation  | Site Header        | Approved |
| Navigation  | Footer             | Approved |
| Navigation  | Breadcrumb         | Approved |
| Button      | Primary Button     | Approved |
| Button      | Secondary Button   | Approved |
| Button      | Ghost Button       | Approved |
| Card        | Credential Card    | Approved |
| Card        | Information Card   | Approved |
| Card        | Dashboard Card     | Approved |
| Form        | Input Field        | Approved |
| Form        | Dropdown           | Approved |
| Form        | Checkbox           | Approved |
| Alert       | Information Alert  | Approved |
| Alert       | Warning Alert      | Approved |
| Alert       | Error Alert        | Approved |
| Badge       | Status Badge       | Approved |
| Badge       | Credential Badge   | Approved |
| Dialog      | Modal Dialog       | Approved |
| Dashboard   | KPI Card           | Approved |
| Credential  | Credential Preview | Approved |
| Recognition | Certificate Viewer | Approved |

---

# Future Components

The library is expected to expand to include:

* Calendar Components
* Timeline Components
* AI Assistant Components
* Analytics Components
* Workflow Components
* Knowledge Components
* Executive Dashboard Components
* Reporting Components

Expansion shall preserve the principles defined by the UI Design System.

---

# Governance Status

This document is the authoritative component specification for Agile AI University.

Every platform product shall consume approved components from this library.

Product-specific UI components should be minimized.

Platform consistency takes precedence over individual module preferences.
