# Agile AI Institutional Analytics Strategy v1.0

**Status:** LOCKED\
**Scope:** Entire Agile AI Ecosystem\
**Date Locked:** 2026-02-25

------------------------------------------------------------------------

## 1. Strategic Principle

Agile AI operates as a single institutional brand with multiple public
surfaces.

Analytics must reflect one institutional truth and must not be
fragmented into surface-level silos.

------------------------------------------------------------------------

## 2. Property Architecture (LOCKED)

One unified GA4 property for the entire ecosystem.

------------------------------------------------------------------------

## 3. Data Stream Structure (LOCKED)

Separate web data streams for:

-   agileai.foundation\
-   agileai.university\
-   verify.agileai.university\
-   portal.agileai.university\
-   learn.agileai.university

All streams roll up into the same institutional GA4 property.

------------------------------------------------------------------------

## 4. Surface Classification Model (LOCKED)

Every surface must define:

`<body data-surface="...">`

Approved values:

-   foundation\
-   site\
-   certs\
-   portal\
-   learn\
-   assessment\
-   unknown (fallback only)

------------------------------------------------------------------------

## 5. Custom Dimension (MANDATORY)

Custom Dimension Name: `surface`\
Scope: Event\
Source: `document.body.dataset.surface`

------------------------------------------------------------------------

## 6. Event Governance (LOCKED)

Standardized naming format:

`action_object`

Approved examples:

-   verify_attempt\
-   verify_success\
-   verify_failure\
-   portal_login\
-   assessment_start\
-   assessment_complete

No random event naming permitted.

------------------------------------------------------------------------

## 7. Implementation Layer (LOCKED)

GA4 must be injected only via:

`shared/design-authority/js/header.js`

No per-page analytics injection allowed.

------------------------------------------------------------------------

## 8. Search Console Integration (MANDATORY)

Link Search Console properties:

-   agileai.foundation\
-   agileai.university

Purpose:

-   Monitor brand growth\
-   Detect domain confusion\
-   Track keyword intent

------------------------------------------------------------------------

## 9. Governance Rules

1.  No independent analytics per surface.\
2.  No GA configuration overrides at surface level.\
3.  No unauthorized third-party trackers.\
4.  All measurement flows through shared design authority.

------------------------------------------------------------------------

## 10. Strategic Outcomes

This measurement model enables:

-   Institutional growth tracking\
-   Employer verification monitoring\
-   Cross-surface intelligence\
-   Geographic engagement analysis\
-   Brand legitimacy measurement\
-   Fraud pattern identification

------------------------------------------------------------------------

**Institutional Analytics Strategy v1.0 --- LOCKED**
