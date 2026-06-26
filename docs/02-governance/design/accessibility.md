# Agile AI University

# Accessibility

---

| Attribute      | Value               |
| -------------- | ------------------- |
| Document       | Accessibility       |
| Version        | 1.0                 |
| Status         | LOCKED              |
| Classification | Governance          |
| Owner          | Agile AI University |
| Applies To     | Entire Platform     |
| Last Updated   | July 2026           |

---

# Purpose

This document establishes the official accessibility standards for Agile AI University.

Accessibility is a foundational quality attribute of the platform.

Every product shall be designed, developed and tested to ensure users of all abilities can successfully access information and complete supported workflows.

Accessibility is not an enhancement—it is a platform requirement.

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

# Accessibility Philosophy

The Agile AI University platform is built upon the following principles.

## Inclusive by Design

Accessibility shall be considered from the beginning of every project.

It shall never be treated as a post-development activity.

---

## Equal Access

All supported users should be able to access information and complete tasks regardless of ability or assistive technology.

---

## Simplicity

Interfaces should minimize unnecessary complexity.

Simple interfaces improve usability for everyone.

---

## Consistency

Consistent layouts, navigation and interactions reduce cognitive effort.

---

## Standards Based

The platform shall align with the principles of WCAG 2.2 Level AA wherever practical.

---

# Accessibility Principles

Every interface shall satisfy four fundamental principles.

## Perceivable

Information must be presented in ways users can perceive.

---

## Operable

Every interaction must be usable without a mouse.

---

## Understandable

Interfaces should behave predictably.

Instructions must be clear.

---

## Robust

Interfaces shall support modern browsers and assistive technologies.

---

# Keyboard Navigation

Every interactive element shall support keyboard operation.

Supported keys include:

* Tab
* Shift + Tab
* Enter
* Space
* Escape
* Arrow Keys (where appropriate)

No interaction shall require a mouse.

---

# Focus Management

Visible focus indicators are mandatory.

Focus shall:

* remain visible
* follow logical order
* never become trapped unintentionally
* return appropriately after dialogs close

Focus styles shall never be removed.

---

# Navigation

Navigation shall support:

* keyboard interaction
* screen readers
* responsive layouts
* logical reading order

Every page should provide a consistent navigation experience.

---

# Skip Navigation

Long pages shall provide a "Skip to Main Content" link.

This link shall:

* receive keyboard focus
* become visible when focused
* move focus directly to the primary content region

---

# Semantic HTML

Semantic HTML elements shall be preferred over generic containers.

Examples include:

* header
* nav
* main
* section
* article
* aside
* footer
* button
* form
* table

Semantic markup improves accessibility and maintainability.

---

# Headings

Headings shall follow a logical hierarchy.

Rules:

* One H1 per page
* No skipped heading levels
* Headings describe content
* Headings are not used solely for styling

---

# Images

Every meaningful image shall include alternative text.

Decorative images shall use empty alt attributes.

Complex diagrams should provide accompanying explanations.

---

# Icons

Icons shall supplement text.

Icons alone shall never communicate meaning.

Interactive icons require accessible labels.

---

# Color

Color shall never be the sole method of communicating:

* status
* errors
* warnings
* selections
* success

Supporting icons or text are required.

---

# Contrast

The platform shall maintain sufficient contrast between:

* text and background
* controls and background
* focus indicators and surrounding elements

Low-contrast interfaces are prohibited.

---

# Typography

Typography shall:

* remain readable
* support browser zoom
* maintain adequate spacing
* avoid decorative fonts

Users should comfortably read content at 200% zoom.

---

# Forms

Every form control shall include:

* associated label
* accessible validation
* descriptive error message
* logical tab order

Placeholder text shall never replace labels.

---

# Buttons

Buttons shall:

* include descriptive labels
* expose accessible names
* maintain adequate touch targets
* communicate disabled state

Loading buttons shall indicate progress.

---

# Links

Link text shall describe the destination.

Examples:

Good

```text
View Credential
Download Certificate
Open Recognition Badge
```

Avoid

```text
Click Here
Read More
More
```

---

# Tables

Tables shall include:

* headers
* header scope
* captions where appropriate

Responsive layouts shall preserve access to all critical information.

---

# Dialogs

Dialogs shall:

* trap focus while open
* return focus when closed
* support Escape to close (where appropriate)
* expose accessible names

---

# Notifications

Notifications shall communicate:

* success
* warning
* error
* information

Notifications should be announced appropriately to assistive technologies.

---

# Error Messages

Errors should:

* identify the affected field
* explain the problem
* suggest corrective action

Error messages should appear adjacent to the relevant control whenever practical.

---

# Motion

Animations shall:

* remain subtle
* avoid excessive movement
* never interfere with interaction

Users who prefer reduced motion should receive a simplified experience.

---

# Responsive Accessibility

Responsive layouts shall preserve:

* functionality
* reading order
* keyboard navigation
* touch accessibility

Content shall not disappear solely because the viewport is smaller.

---

# Touch Targets

Interactive controls should provide comfortable touch areas.

Very small interactive controls are discouraged.

---

# Screen Readers

Interfaces shall support:

* ARIA landmarks where appropriate
* semantic HTML
* meaningful labels
* logical reading order

ARIA should enhance—not replace—semantic HTML.

---

# Document Language

Every HTML document shall declare the correct language.

Example:

```html
<html lang="en">
```

---

# Page Titles

Every page shall define a unique and meaningful title.

Example:

```text
My Credentials | Agile AI University
```

---

# Loading States

Loading indicators should communicate:

* loading
* progress
* completion

Users should understand the current system state.

---

# Empty States

Empty states should explain:

* why no content is available
* what the user can do next

---

# Authentication

Authentication workflows shall support:

* keyboard navigation
* password managers
* accessible error messages
* screen readers

Authentication shall not depend upon visual cues alone.

---

# Testing Requirements

Accessibility testing shall include:

* keyboard-only navigation
* browser zoom (200%)
* color contrast verification
* responsive validation
* screen reader validation
* focus order validation

Accessibility testing is mandatory before production deployment.

---

# Accessibility Checklist

Every release shall verify:

* Semantic HTML
* Keyboard navigation
* Visible focus
* Accessible forms
* Meaningful page titles
* Alternative text
* Logical headings
* Responsive accessibility
* Color contrast
* Accessible dialogs
* Accessible tables

---

# Governance Rules

1. Accessibility is mandatory.

2. Keyboard navigation shall be supported throughout the platform.

3. Focus indicators shall never be removed.

4. Semantic HTML shall be preferred.

5. Every form field requires an associated label.

6. Every meaningful image requires alternative text.

7. Color shall never be the sole means of conveying information.

8. Responsive layouts shall preserve accessibility.

9. Accessibility testing is required before production deployment.

10. New components shall comply with this Accessibility specification before governance approval.

---

# Related Documents

* UI Design System
* Design Tokens
* Typography
* Layout System
* Responsive Design
* Component Library

---

# Governance Status

This document is the authoritative accessibility specification for Agile AI University.

All current and future products within the Agile AI University ecosystem shall comply with these accessibility standards to ensure an inclusive, professional and institutionally governed user experience.
