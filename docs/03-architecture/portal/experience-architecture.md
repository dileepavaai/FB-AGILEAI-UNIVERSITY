# Experience Architecture
Version: 1.0
Status: LOCKED

## Purpose

Defines the architectural standard for all learner and executive
experiences within the Agile AI University Portal.

---

## Vision

The portal is no longer organised around pages.

The platform is organised around Experiences.

Examples

• Credential Detail
• Recognition Detail
• Learning Journey
• Assessment Summary
• Upgrade Registration
• Executive Insights

---

## Evolution

Portal V1

Dashboard

↓

Pages

Portal V2

Dashboard

↓

Widgets

↓

Cards

Portal V3

Portal

↓

Experiences

↓

Overlay

↓

Sections

↓

Shared Frameworks

---

## Experience Standard

Every experience owns

• Overlay
• Header
• Information
• Recognition
• Verification
• Assets
• Actions

---

## Experience Lifecycle

Dashboard

↓

User Action

↓

Overlay

↓

Header

↓

Information

↓

Actions

↓

Close

---

## JavaScript Standard

assets/js/components/

credential-detail/

    credential-detail-overlay.js

    credential-detail-header.js

    credential-information-section.js

    credential-recognition-section.js

    credential-verification-section.js

    credential-assets-section.js

---

## CSS Standard

assets/css/components/

overlay.css

buttons.css

cards.css

credential-detail/

    credential-detail-overlay.css

---

## Shared Frameworks

overlay.css

buttons.css

cards.css

Design Tokens

---

## Governance Rules

Every experience

✓ Owns presentation

✓ Uses Services

✓ Uses Registries

✓ Uses Resolver

Never

✗ Queries Firestore

✗ Implements Business Logic

✗ Resolves Authorization

✗ Duplicates Rendering

---

## Experience Rendering Pattern

Experience

↓

Overlay

↓

Header

↓

Information

↓

Recognition

↓

Verification

↓

Assets

↓

Actions

---

## Future Experiences

Recognition Detail

Learning Journey

Assessment Summary

Upgrade Registration

Executive Insights

AI Coach

Career Journey

---

## Status

LOCKED