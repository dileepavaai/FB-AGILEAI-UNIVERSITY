# Agile AI University

# Responsive Design

---

| Attribute      | Value               |
| -------------- | ------------------- |
| Document       | Responsive Design   |
| Version        | 1.0                 |
| Status         | LOCKED              |
| Classification | Governance          |
| Owner          | Agile AI University |
| Applies To     | Entire Platform     |
| Last Updated   | July 2026           |

---

# Purpose

This document establishes the official responsive design standards for Agile AI University.

Responsive design ensures every product delivers a consistent, accessible and high-quality experience across desktop, tablet and mobile devices while preserving the platform's institutional identity.

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
* Recognition Services
* Verification Services
* Future Products

---

# Responsive Philosophy

Responsive design adapts presentation, not functionality.

Users should experience the same capabilities regardless of device.

Layouts may change.

Interaction models should remain consistent.

---

# Responsive Principles

## Desktop First

The primary experience is designed for desktop.

Tablet and mobile progressively adapt from the desktop experience.

---

## Content Preservation

Content is never removed solely because the device is smaller.

Presentation may change.

Information should remain available.

---

## Progressive Adaptation

The interface should gracefully adapt as available screen space decreases.

Avoid abrupt layout changes.

---

## Touch Friendly

Interactive controls must be usable with touch input.

Buttons, links and form controls shall provide sufficient touch targets.

---

# Supported Devices

| Device       |      Width |
| ------------ | ---------: |
| Mobile       |     <768px |
| Tablet       | 768–1023px |
| Desktop      |    ≥1024px |
| Wide Desktop |    ≥1440px |

---

# Breakpoints

Official breakpoints:

```text
Mobile
0–767px

Tablet
768–1023px

Desktop
1024–1439px

Wide Desktop
1440px+
```

Additional breakpoints require governance approval.

---

# Grid Adaptation

Desktop

* 12-column grid

Tablet

* 8-column grid

Mobile

* 4-column grid

Grid spacing shall remain consistent using Design Tokens.

---

# Containers

Containers remain centered.

Recommended maximum widths:

| Container       |  Width |
| --------------- | -----: |
| Reading Content |  960px |
| Standard Page   | 1280px |
| Dashboard       | 1440px |

Containers shall provide consistent horizontal padding across breakpoints.

---

# Navigation

Desktop

* Horizontal navigation

Tablet

* Collapsible navigation where appropriate

Mobile

* Hamburger menu or equivalent governed pattern

Navigation shall remain keyboard accessible.

---

# Typography

Typography scales proportionally.

Body text should remain approximately 1rem whenever practical.

Heading sizes may reduce on smaller devices while preserving hierarchy.

---

# Cards

Desktop

Multiple cards per row.

Tablet

Two-column layout where practical.

Mobile

Single-column layout.

Cards should never become unreadable.

---

# Tables

Tables shall support responsive behavior.

Acceptable approaches include:

* Horizontal scrolling
* Responsive stacking
* Priority column hiding (non-critical columns only)

Critical information must remain visible.

---

# Forms

Forms should prefer a single-column layout on mobile devices.

Labels remain above inputs.

Input controls should span the available width.

---

# Images

Images shall:

* scale proportionally
* avoid distortion
* maintain aspect ratio

Decorative images may be hidden on smaller devices if they do not affect usability.

---

# Sticky Elements

Sticky components should remain functional across devices.

Examples include:

* Site Header
* Portal Navigation
* Action Toolbars

Sticky elements must not obscure page content.

---

# Dialogs

Dialogs should resize appropriately.

On mobile devices, dialogs may occupy most of the viewport while maintaining adequate margins.

---

# Spacing

Spacing should scale consistently using Design Tokens.

Do not introduce arbitrary spacing values for specific breakpoints.

---

# Orientation

Portrait and landscape orientations shall both be supported.

Layouts should adapt without losing functionality.

---

# Accessibility

Responsive layouts shall support:

* keyboard navigation
* zoom up to 200%
* screen readers
* sufficient touch target sizes

---

# Performance

Responsive behavior shall prioritize performance.

Avoid loading device-specific assets unless necessary.

---

# Governance Rules

1. Desktop remains the primary design target.

2. Mobile experiences shall preserve functionality.

3. Components shall adapt without redesign.

4. Responsive behavior shall consume Design Tokens.

5. Breakpoints shall follow this specification.

6. Navigation shall remain accessible across devices.

7. Content shall not be removed solely due to screen size.

8. Responsive behavior shall be tested on all supported breakpoints.

9. New responsive patterns require governance approval.

10. Every platform product shall comply with this specification.

---

# Related Documents

* UI Design System
* Design Tokens
* Typography
* Layout System
* Component Library
* Accessibility

---

# Governance Status

This document is the authoritative responsive design specification for Agile AI University.

All products shall implement responsive behavior in accordance with this governance document.

Any deviation requires formal governance approval.
