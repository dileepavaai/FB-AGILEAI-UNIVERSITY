# Experience Architecture

| Attribute | Value |
|-----------|-------|
| Document | Experience Architecture |
| Version | 2.0 |
| Status | LOCKED |
| Owner | LAAU |
| Classification | Portal Architecture |
| Last Updated | 2026-07-07 |

---

# Purpose

Defines the architectural standard governing every learner and executive
experience inside the LAAU Portal.

The platform is experience-driven rather than page-driven.

This document establishes the Experience Architecture that every future
experience must follow.

---

# Vision

The Portal is no longer organised around pages.

The Portal is organised around governed Experiences.

Each Experience owns its presentation while consuming shared platform
services.

Examples

• Credential Workspace

• Recognition Detail

• Learning Journey

• Assessment Summary

• Upgrade Registration

• Executive Insights

• AI Coach

---

# Architectural Evolution

Portal V1

Portal

↓

Pages

↓

Independent Screens

---

Portal V2

Dashboard

↓

Widgets

↓

Cards

↓

Navigation

---

Portal V3

Portal

↓

Experience

↓

Overlay

↓

Sections

↓

Shared Components

↓

Shared Services

---

Portal V4 (Current)

Portal

↓

Experience Workspace

↓

Section Navigation

↓

Asset Preview

↓

Download

↓

Sharing

↓

Future Wallet

---

# Experience Principles

Every experience shall

✓ Present information

✓ Consume Services

✓ Consume Registries

✓ Consume Published Assets

✓ Remain Stateless

✓ Follow Shared UI Standards

Experiences shall never

✗ Query Firestore

✗ Execute Business Rules

✗ Resolve Authorization

✗ Duplicate Services

✗ Regenerate Credential Assets

---

# Credential Workspace Architecture

The Credential Workspace is the reference implementation for all future
portal experiences.

Structure

Credential Workspace

↓

Header

↓

Information

↓

Recognition

↓

Verification

↓

Credential Assets

↓

Asset Preview

↓

Download

↓

Sharing

↓

Close

The Credential Workspace remains a single governed experience.

Nested overlays are prohibited.

---

# Experience Lifecycle

Dashboard

↓

Widget

↓

Credential Card

↓

Credential Workspace

↓

Asset Selection

↓

Asset Preview

↓

Download

↓

Share

↓

Return to Workspace

↓

Close Workspace

---

# Asset Consumption Architecture

Credential assets are generated exclusively by Credential Operations.

The Student Portal consumes governed assets.

Lifecycle

Credential Registry

↓

Credential Generator

↓

University Certificate

↓

University Badge

↓

Trainer Certificate

↓

Published Asset

↓

Credential Workspace

↓

Preview

↓

Download

↓

Share

The Student Portal never regenerates these assets.

---

# JavaScript Standard

assets/js/components/

credential-detail/

    credential-detail-overlay.js

    credential-detail-header.js

    credential-information-section.js

    credential-recognition-section.js

    credential-verification-section.js

    credential-assets-section.js

asset-preview/

    credential-asset-preview.js

    renderers/

        certificate-preview.js

        badge-preview.js

        trainer-certificate-preview.js

---

# CSS Standard

assets/css/components/

overlay.css

buttons.css

cards.css

credential-detail/

    credential-detail-overlay.css

asset-preview/

    credential-asset-preview.css

---

# Shared Platform Frameworks

Design Tokens

Overlay Framework

Button Framework

Card Framework

Program Registry

Credential Registry

Eligibility Service

Recognition Service

Dashboard Service

---

# Navigation Standard

Experiences shall remain inside a single workspace.

Allowed

Dashboard

↓

Experience

↓

Asset Preview

↓

Back

↓

Experience

↓

Close

Not Allowed

Dashboard

↓

Overlay

↓

Overlay

↓

Overlay

↓

Overlay

Nested modal experiences are prohibited.

---

# Governance Rules

Every Experience

✓ Owns Presentation

✓ Consumes Services

✓ Consumes Registries

✓ Uses Shared Components

✓ Uses Shared Styles

✓ Uses Shared Governance

Never

✗ Access Firestore

✗ Perform Authentication

✗ Perform Authorization

✗ Implement Business Logic

✗ Duplicate Rendering

✗ Duplicate Credential Generation

---

# Rendering Pattern

Experience

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

Preview

↓

Actions

↓

Close

---

# Future Experience Roadmap

Credential Workspace

Recognition Workspace

Learning Journey

Assessment Summary

Upgrade Registration

Executive Insights

AI Coach

Career Journey

Digital Wallet

Recognition Timeline

Professional Portfolio

---

# Architectural Decisions

The following decisions are LOCKED.

• Experience-first architecture.

• Page-centric navigation retired.

• Credential Workspace is the canonical learner experience.

• Nested overlays prohibited.

• Student Portal consumes official credential assets.

• Credential Operations is the single producer of certificates and badges.

• Shared frameworks are mandatory.

• Dashboard cards are entry points only.

---

# Status

LOCKED

This document is governed by LAAU Architecture Governance.

Any architectural deviation requires a formal Architecture Decision Record
(ADR).