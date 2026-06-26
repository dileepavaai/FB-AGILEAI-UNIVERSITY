# Agile AI University

# Iconography

---

| Attribute      | Value               |
| -------------- | ------------------- |
| Document       | Iconography         |
| Version        | 1.0                 |
| Status         | LOCKED              |
| Classification | Governance          |
| Owner          | Agile AI University |
| Applies To     | Entire Platform     |
| Last Updated   | July 2026           |

---

# Purpose

This document establishes the official iconography standards for Agile AI University.

Icons improve comprehension, navigation and recognition while maintaining a consistent visual language across every platform product.

Icons supplement communication.

They never replace meaningful text.

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
* Documentation
* Future Products

---

# Icon Philosophy

Icons exist to improve recognition and reduce cognitive effort.

Icons shall be:

* simple
* consistent
* recognizable
* accessible
* minimal

The interface shall never depend solely upon icons to communicate meaning.

---

# Approved Icon Library

The platform shall standardize on a single icon library.

Approved characteristics:

* Outline style
* Modern appearance
* Consistent stroke width
* SVG based
* Scalable
* Accessible

Mixing icon libraries within the same product is prohibited.

---

# Icon Style

The official icon style is:

* Outline
* Rounded corners where appropriate
* Consistent visual weight
* Minimal visual complexity

Filled icons may be used only when approved by governance.

---

# Icon Sizes

Approved icon sizes:

| Size | Usage                               |
| ---- | ----------------------------------- |
| 16px | Inline metadata                     |
| 20px | Buttons and form controls           |
| 24px | Navigation and cards                |
| 32px | Feature panels                      |
| 48px | Hero illustrations and empty states |

Intermediate sizes should be avoided unless required.

---

# Stroke Width

Icons shall maintain a consistent stroke weight throughout the platform.

Custom stroke widths are discouraged.

---

# Color

Icons shall consume Design Tokens.

Examples:

```css
color: var(--icon-primary);

color: var(--icon-secondary);

color: var(--icon-muted);
```

Hardcoded colors are prohibited.

---

# Navigation Icons

Navigation icons shall:

* reinforce navigation
* remain visually balanced
* align consistently
* appear before labels where appropriate

Navigation shall remain understandable without icons.

---

# Button Icons

Buttons may include icons.

Rules:

* icon complements text
* text remains visible
* icon spacing remains consistent

Icon-only buttons require accessible labels.

---

# Form Icons

Permitted uses include:

* search
* password visibility
* calendar
* upload
* validation

Icons shall never replace field labels.

---

# Dashboard Icons

Dashboard icons should represent:

* analytics
* reports
* credentials
* users
* learning
* recognition
* administration

Dashboard icons should remain visually restrained.

---

# Credential Icons

Official credential concepts include:

| Concept      | Icon Purpose   |
| ------------ | -------------- |
| Credential   | Certificate    |
| Badge        | Digital Badge  |
| Verification | Shield / Check |
| Recognition  | Award          |
| Learning     | Graduation Cap |
| Assessment   | Clipboard      |
| Student      | User           |
| Trainer      | Presentation   |
| Organization | Building       |
| Portfolio    | Folder         |

These icons should remain consistent throughout the platform.

---

# Status Icons

Supported status categories:

* Success
* Warning
* Error
* Information
* Pending
* Active
* Archived
* Draft

Status icons supplement text.

They never replace status labels.

---

# File Type Icons

Approved file representations include:

* PDF
* Image
* Spreadsheet
* Document
* Presentation
* Archive

File icons should remain immediately recognizable.

---

# Empty State Icons

Empty state illustrations should be:

* simple
* calm
* non-distracting

They should reinforce the message without dominating the interface.

---

# Accessibility

Icons shall support accessibility.

Requirements:

* meaningful icons include accessible labels where necessary
* decorative icons use `aria-hidden="true"`
* icon-only controls include descriptive accessible names

Icons shall never be the only method of conveying information.

---

# Spacing

Icons shall maintain consistent spacing relative to surrounding text.

Recommended spacing:

* 8px between icon and label
* consistent vertical alignment
* centered within controls

---

# Alignment

Icons should align with the text baseline whenever practical.

Navigation icons should align consistently across menus.

---

# Motion

Icons may animate subtly for:

* loading
* expansion
* collapse
* progress

Animations should remain brief and unobtrusive.

---

# Dark Theme

Icons shall adapt automatically through Design Tokens.

Component-level dark theme overrides are prohibited.

---

# Performance

Icons should be delivered as scalable SVG assets whenever practical.

Raster images should be avoided for interface icons.

---

# Governance Rules

1. The platform shall use a single approved icon library.

2. Outline icons are the default style.

3. Icons shall consume Design Tokens.

4. Hardcoded icon colors are prohibited.

5. Icons supplement text and shall not replace meaningful labels.

6. Decorative icons shall be hidden from assistive technologies.

7. Icon-only controls require accessible names.

8. New icons shall align with the established visual language.

9. Product-specific icon styles require governance approval.

10. Every product shall follow this Iconography specification.

---

# Related Documents

* Branding
* UI Design System
* Design Tokens
* Typography
* Component Library
* Accessibility
* Dark Theme

---

# Governance Status

This document is the authoritative iconography specification for Agile AI University.

All current and future products shall implement icons in accordance with this governance to ensure a consistent, accessible and institutionally aligned visual language across the Agile AI University ecosystem.
