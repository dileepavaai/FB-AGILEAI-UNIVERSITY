# AgileAI Learn Surface

## Governance System Context --- Version 1.0

Status: Stable · Frozen · Production Baseline

------------------------------------------------------------------------

## 1. Purpose

The Learn Surface (learn.agileai.university) is a public academic
reference layer. It is not a marketing site, not a funnel, and not a
course marketplace.

Its purpose is to: - Establish intellectual authority - Deliver
structured clarity - Maintain institutional tone - Separate learning
from monetized assessment layers

------------------------------------------------------------------------

## 2. Architecture Decisions (Locked)

### Desktop Navigation

-   Hover-based dropdown
-   Pure CSS visibility control
-   No JS open state
-   Micro fade + lift animation
-   Backdrop blur enabled
-   Arrow rotation on hover
-   No dropdown gap
-   Infinite nesting supported

### Mobile Navigation

-   Dedicated hamburger architecture
-   Hamburger transforms to X
-   Scroll lock via body.nav-open
-   Accordion animation via .is-open
-   Outside-click close
-   ARIA attributes enabled
-   No hover logic on mobile

------------------------------------------------------------------------

## 3. Theme System (Critical Constraint)

Version: Theme Controller v7.5

Rules: - Dark mode uses data-theme="dark" - Light mode uses no
attribute - headerInjected event is mandatory - No polling or
MutationObserver - Deterministic initialization only

------------------------------------------------------------------------

## 4. Header Injection Model

-   Injected via header.js
-   Rendered into
    ```{=html}
    <div id="header">
    ```
-   Must dispatch: document.dispatchEvent(new Event("headerInjected"))

This is a non-negotiable dependency for theme stability.

------------------------------------------------------------------------

## 5. Accessibility Commitments

-   ARIA attributes maintained
-   aria-expanded managed via JS
-   Keyboard accessible navigation
-   Outside-click support
-   Focus safety enforced

------------------------------------------------------------------------

## 6. Design Philosophy

Typography: Georgia serif baseline Tone: Institutional, academic Color:
Neutral grayscale Motion: Subtle, performance-safe No marketing UI
allowed

------------------------------------------------------------------------

## 7. Hosting Constraints

Environment: GitHub Pages - Static hosting only - No build tools -
Vanilla JS only - No frameworks - No bundlers

------------------------------------------------------------------------

## 8. Forbidden Changes

Do NOT: - Merge desktop/mobile logic - Remove headerInjected event -
Replace hover with click on desktop - Add heavy JS state machines -
Introduce frameworks - Break ARIA compliance

------------------------------------------------------------------------

## 9. Classification

UI Infrastructure --- Tier 1 Production Baseline --- Frozen
