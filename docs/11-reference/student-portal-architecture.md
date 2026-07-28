# Student Portal Architecture

**Document ID:** ARCH-004  
**Title:** Student Portal Architecture  
**Version:** 1.0.0  
**Status:** ACTIVE  
**Owner:** Agile AI University  
**Architect:** Dileep Appupillai  
**Last Updated:** 27 July 2026

---

# 1. Purpose

This document defines the authoritative architecture of the Agile AI
University Student Portal.

The Student Portal is the learner-facing digital workspace through which
authenticated and authorized learners access their academic records,
credentials, licensed learning resources, programme journeys, and
future upgrade opportunities.

The portal is a governed consumption surface.

It does not own academic records, identity decisions, entitlement rules,
payment decisions, or learning-resource release logic.

---

# 2. Objectives

The Student Portal provides learners with:

- Secure authentication
- Identity-aware access
- Personalized dashboard
- Credential Portfolio
- Licensed Learning Resources
- Programme information
- Registration and upgrade journeys
- Secure preview and download actions
- Consistent navigation
- Reliable sign-out

The portal must remain:

- secure
- responsive
- accessible
- modular
- scalable
- service-driven
- easy to operate

---

# 3. Scope

This architecture governs:

- Student Portal application shell
- Authentication integration
- Authorization integration
- Entitlement-based feature rendering
- Dashboard orchestration
- Credential Portfolio presentation
- Learning Resource presentation
- Registration journey presentation
- Secure download and preview actions
- Navigation and session handling
- Error and empty-state handling

This architecture does not govern:

- Credential approval
- Credential generation
- Learning-resource publication
- Payment verification
- Identity reconciliation decisions
- Firestore administration
- Storage administration

Those responsibilities belong to their respective platforms.

---

# 4. Architectural Principles

The Student Portal follows these principles.

✓ Authentication before rendering

✓ Authorization before feature access

✓ Entitlement before business capability display

✓ Resolver before module rendering

✓ Service layer before UI

✓ No direct business-rule implementation in HTML

✓ No direct lifecycle decisions in UI

✓ No direct learner access to protected Storage paths

✓ One canonical learner identity

✓ Fail closed

---

# 5. Enterprise Platform Position

The Student Portal is the final presentation layer in the governed
platform chain.

```text
Authentication

↓

Identity Resolution

↓

Authorization

↓

Entitlement Resolution

↓

Business Services

↓

Dashboard Orchestration

↓

Feature Modules

↓

Student Portal UI
```

The portal must never bypass this sequence.

---

# 6. Layered Architecture

The Student Portal follows the locked architectural order below.

```text
Authentication

↓

Authorization

↓

Entitlement Resolution

↓

Dashboard Orchestration

↓

Feature Modules

↓

Credential Services

↓

Learning Resource Services

↓

Registration Services

↓

HTML Presentation
```

Each layer has a separate responsibility.

---

# 7. High-Level Architecture

```text
                         Learner
                            │
                            ▼
                   Student Portal Shell
                            │
                            ▼
                  Authentication Controller
                            │
                            ▼
                    Identity Resolver
                            │
                            ▼
                  Authorization Service
                            │
                            ▼
                   Entitlement Resolver
                            │
                            ▼
                 Dashboard Orchestrator
                  ┌─────────┼─────────┐
                  │         │         │
                  ▼         ▼         ▼
          Credential     Learning   Registration
           Module        Resource      Module
                          Module
                  │         │         │
                  └─────────┼─────────┘
                            ▼
                       UI Renderer
```

---

# 8. Student Portal Responsibilities

The Student Portal is responsible for:

- Establishing the learner-facing application shell
- Waiting for authentication resolution
- Requesting identity resolution
- Requesting authorization
- Requesting entitlement resolution
- Rendering only authorized capabilities
- Displaying learner-safe business information
- Initiating governed service actions
- Presenting success and error states
- Ending the learner session securely

The Student Portal is not responsible for:

- Creating entitlements
- Approving credentials
- Publishing resources
- Verifying payments
- Binding identities directly
- Constructing Storage paths
- Editing protected records

---

# 9. Application Shell

The application shell provides:

- Sidebar
- Top toolbar
- Main content area
- Mobile navigation
- Loading state
- Unauthorized state
- Error state
- Sign-out action

The shell may initialize before learner data is loaded, but protected
feature content must not render before authentication, authorization,
and entitlement resolution complete.

---

# 10. Authentication Architecture

The portal integrates with Firebase Authentication.

Authentication responsibilities include:

- Detecting signed-in state
- Detecting signed-out state
- Restoring authenticated sessions
- Obtaining the Firebase UID
- Initiating identity resolution
- Supporting sign-out

Authentication does not determine:

- programme eligibility
- credential ownership
- resource access
- payment status
- upgrade eligibility

---

# 11. Authorization Architecture

Authorization determines whether an authenticated identity may access
the Student Portal.

Authorization evaluates:

- authenticated identity
- learner role
- account status
- platform access status
- identity activation status where applicable

Unauthorized users must not receive protected dashboard content.

---

# 12. Canonical Learner Identity

After first successful authentication and identity activation, the
canonical identity anchor is:

```text
learner_uid
```

The `learner_uid` is used across:

- credentials
- credential assets
- registrations
- enrollments
- payments
- learning resources
- entitlements
- communications
- future programme activity

Supporting identifiers include:

- verified email
- Credential ID

These identifiers support business matching but do not replace the
canonical learner identity.

---

# 13. First-Login Identity Activation

Historical alumni may not have a `learner_uid` before first
authentication.

The first-login flow must therefore support:

```text
Learner Opens Activation Link

↓

Authentication Completes

↓

Firebase UID Available

↓

Activation Token Validated

↓

Credential and Email Verified

↓

Historical Records Bound to learner_uid

↓

Pre-staged Assets and Resources Bound

↓

Entitlements Resolved

↓

Dashboard Rendered
```

The learner must receive access within the same authenticated session.

The portal must never require the `learner_uid` to exist before the
learner's first authentication.

---

# 14. Entitlement Architecture

Entitlements determine which capabilities the learner may consume.

Examples include:

- Credential Portfolio
- Licensed Learning Resources
- Bridge Programme Registration
- Executive Insight
- Active Programme Workspace
- Future Upgrade Journey

The portal receives resolved entitlement results.

It does not independently calculate entitlement eligibility.

---

# 15. Entitlement Response Model

A resolved entitlement response may include:

```json
{
  "learner_uid": "firebase-uid",
  "portal_access": true,
  "features": {
    "credential_portfolio": true,
    "learning_resources": true,
    "bridge_registration": true,
    "executive_insight": false
  }
}
```

This is an illustrative contract.

The service implementation remains authoritative.

---

# 16. Dashboard Orchestration

The dashboard orchestrator coordinates learner-facing modules after:

- authentication
- identity resolution
- authorization
- entitlement resolution

The orchestrator decides:

- which modules to initialize
- which services to call
- which loading states to display
- which module failures are isolated
- when dashboard rendering is complete

It must not embed business eligibility rules.

---

# 17. Dashboard Structure

The learner dashboard may contain:

- Welcome section
- Key learner information
- Recent Credentials
- Credential Portfolio access
- Licensed Learning Resources
- Active Programme
- Recommended Upgrade
- Registration actions
- Important learner notices

Modules are rendered only when authorized and entitled.

---

# 18. Credential Portfolio Module

The Credential Portfolio is the learner's Digital Ownership Center.

It may display:

- University Certificate
- Digital Badge
- Trainer Certificate
- Verification action
- Download action
- LinkedIn sharing action
- Future upgrade journey
- Licensed Learning Resources entry point

The portfolio is a consumption interface.

It never modifies credential registry data.

---

# 19. Credential Portfolio Navigation

The approved design uses a single-page portfolio experience.

Credential details may be shown through:

- expandable cards
- modal overlays
- governed preview overlays

A separate credential-details page is not required for the current
architecture.

The design should avoid unnecessary learner navigation.

---

# 20. Learning Resource Module

The Learning Resource module displays resources resolved for the learner.

It receives only learner-safe data such as:

- resource title
- programme name
- description
- content type
- version
- release status
- preview availability
- download availability

It must never expose:

- Firestore document IDs
- protected Storage paths
- internal resource routing details
- administrator audit fields

---

# 21. Learning Resource Access Flow

```text
Learner Opens Learning Resources

↓

Module Requests Resolved Resources

↓

Service Confirms Identity

↓

Service Confirms Entitlement

↓

Service Confirms Publication

↓

Service Confirms Release Conditions

↓

Learner-Safe Resource List Returned

↓

Portal Renders Resources
```

Preview and download requests must repeat required authorization checks.

---

# 22. Licensed Resource Delivery

Participant-specific licensed materials may be personalized using:

- learner name
- Credential ID
- unique licence watermark
- participant-specific content

The portal must ensure that:

- the resource belongs to the authenticated learner
- the resource is published
- release conditions are satisfied
- another learner's licensed edition is never displayed
- internal file paths are not exposed

---

# 23. Registration Module

The registration module supports learner upgrade journeys.

Examples include:

- AOP to AIPA Bridge
- Future programme upgrades
- Approved alumni offers
- New programme registrations

The module may display:

- programme
- eligibility status
- duration
- fee
- GST
- offer deadline
- registration status
- payment action

Eligibility and pricing decisions must come from governed services.

---

# 24. Payment Integration Boundary

The Student Portal may initiate payment, but it does not determine
payment success.

The payment flow is:

```text
Registration Created

↓

Payment Order Created by Backend

↓

Learner Completes Gateway Payment

↓

Gateway Verification

↓

Payment Record Updated

↓

Enrollment Created

↓

Entitlement Updated

↓

Portal Refreshes Learner State
```

Client-side payment confirmation is never sufficient for enrollment.

---

# 25. Secure Preview and Download

The portal must not construct direct protected Storage URLs.

A governed download flow should follow:

```text
Learner Requests Download

↓

Authenticated Request

↓

Ownership and Entitlement Validation

↓

Publication and Release Validation

↓

Secure Delivery Response

↓

Download Begins
```

The learner-facing downloaded filename should be human-readable.

For personalized licensed materials, the filename should include the
learner's Credential ID where appropriate.

---

# 26. Navigation Architecture

Primary learner navigation may include:

- Dashboard
- My Credentials
- Learning Resources
- Programme Registration
- Profile
- Sign Out

Navigation visibility must follow entitlement and authorization results.

Hiding a menu item is not a security control.

The underlying route or service must still enforce access.

---

# 27. Sign-Out Architecture

Sign-out must:

1. End the Firebase authenticated session.
2. Clear learner-specific state.
3. Clear cached entitlement data.
4. Clear module state.
5. Redirect to the approved public or sign-in page.
6. Prevent protected content from remaining visible.

Browser refresh or back navigation must not restore protected learner
data after sign-out.

---

# 28. State Management

The portal should maintain a controlled learner session state.

Typical state includes:

```text
authentication state
identity state
authorization state
entitlement state
dashboard state
module state
error state
```

State must be reset when:

- the learner signs out
- identity changes
- authentication expires
- access is revoked
- a fatal authorization error occurs

---

# 29. Loading Strategy

The portal should use staged loading.

```text
Application Loading

↓

Authentication Loading

↓

Identity Loading

↓

Authorization Loading

↓

Entitlement Loading

↓

Dashboard Loading

↓

Module Ready
```

Protected modules must not flash before access decisions complete.

---

# 30. Error Isolation

A failure in one learner module should not unnecessarily destroy the
entire dashboard.

Examples:

- Credential module failure should not automatically block sign-out.
- Learning Resource failure should not hide valid credentials.
- Upgrade recommendation failure should not block core learner access.

Authentication, authorization, and identity failures are platform-level
failures and must stop protected rendering.

---

# 31. Error States

The portal should provide controlled states for:

- Not authenticated
- Not authorized
- Identity activation required
- Identity resolution failed
- Entitlement resolution failed
- No credentials
- No learning resources
- Resource not yet released
- Download failed
- Service temporarily unavailable

Error messages must avoid exposing internal implementation details.

---

# 32. Empty States

Empty states should be meaningful.

Examples:

## No Credentials

```text
No published credentials are currently available in your portfolio.
```

## No Learning Resources

```text
No learning resources are currently available for your account.
```

## Scheduled Release

```text
This resource will become available according to your programme release schedule.
```

Empty states must not imply system failure when no entitlement exists.

---

# 33. Security Architecture

The Student Portal follows defence in depth.

```text
Firebase Authentication

↓

Identity Resolution

↓

Authorization Service

↓

Entitlement Service

↓

Firestore Security Rules

↓

Storage Security Rules

↓

Governed Delivery Service
```

The client is treated as untrusted.

---

# 34. Firestore Access

The portal should use the minimum Firestore access required.

Where direct client reads are permitted, Firestore Rules must enforce:

- authenticated access
- ownership
- publication status
- current-version status where applicable
- learner isolation

Sensitive business decisions should remain in backend services.

---

# 35. Storage Access

Protected content must remain governed.

Storage Rules should enforce:

- authenticated access
- allowed paths
- published content requirements
- administrative publishing authority
- learner consumption boundaries
- denial of client-side deletion

Large video content should not be stored in the protected learning
resource domain.

It should use the governed external-video delivery architecture.

---

# 36. Privacy Principles

The Student Portal must display only data required for the authenticated
learner experience.

The portal must not expose:

- another learner's name
- another learner's email
- another learner's Credential ID
- another learner's resources
- internal administrator information
- internal Storage paths
- internal audit metadata

---

# 37. Accessibility

The portal should support:

- Keyboard navigation
- Semantic HTML
- Clear focus indicators
- Screen-reader-friendly labels
- Meaningful button text
- Responsive layouts
- Sufficient text contrast
- Accessible dialogs and overlays

Accessibility is part of platform quality, not an optional enhancement.

---

# 38. Responsive Design

The Student Portal must support:

- Desktop
- Tablet
- Mobile

The architecture should maintain:

- stable navigation
- readable cards
- usable download actions
- accessible overlays
- non-overlapping content
- consistent module order

---

# 39. Performance Architecture

Performance should be improved through:

- selective service calls
- module-level loading
- minimal duplicate reads
- controlled caching
- lazy initialization
- cache invalidation after identity or entitlement changes
- avoiding unnecessary Firestore listeners

Performance optimization must not weaken authorization.

---

# 40. Caching Rules

Caching may be used for:

- static programme labels
- non-sensitive UI configuration
- resolved learner-safe module data for the active session

Caching must not be used to bypass:

- fresh authorization
- entitlement changes
- resource withdrawal
- sign-out
- identity changes

Protected cached data must be cleared on sign-out.

---

# 41. Service Boundaries

Recommended service domains include:

```text
authentication-service
identity-service
authorization-service
entitlement-service
dashboard-service
credential-service
learning-resource-service
registration-service
payment-service
```

UI components should depend on service interfaces rather than direct
database implementation details.

---

# 42. Component Boundaries

Recommended UI components include:

```text
portal-shell
sidebar
toolbar
dashboard-controller
credential-section
credential-portfolio-overlay
learning-resource-section
registration-section
loading-state
error-state
empty-state
```

Components should focus on presentation and user interaction.

---

# 43. Audit Events

Relevant learner-facing events may include:

- learner signed in
- identity activation completed
- credential viewed
- credential downloaded
- badge downloaded
- learning resource viewed
- learning resource downloaded
- registration started
- payment initiated
- registration completed
- learner signed out

Audit design must balance traceability and privacy.

---

# 44. Integration Points

The Student Portal integrates with:

- Identity Platform
- Authorization Platform
- Entitlement Platform
- Credential Platform
- Learning Resource Platform
- Registration Platform
- Payment Platform
- Verification Platform
- Executive Insight Platform

All integrations must use governed interfaces.

---

# 45. Failure Handling Principles

The portal must:

- fail closed for protected access
- preserve sign-out capability
- avoid exposing stack traces
- provide meaningful learner messages
- log technical details through approved mechanisms
- allow retry where safe
- prevent duplicate payment or registration actions

---

# 46. Production-First Operating Model

Agile AI University currently follows a focused production-first
operating model:

```text
Focused Change

↓

Review

↓

Commit

↓

Deploy Affected Target

↓

Validate Live

↓

Monitor
```

Student Portal changes should therefore be:

- small
- isolated
- reversible
- documented
- immediately validated

Unrelated changes must not be bundled into the same release.

---

# 47. Production Validation Checklist

After Student Portal deployment, validate:

## Authentication

- Sign-in succeeds
- Existing session restores correctly
- Unauthorized users are blocked
- Sign-out succeeds

## Dashboard

- Shell renders correctly
- Sidebar is visible
- Toolbar is visible
- Learner name is correct
- Authorized modules load

## Credentials

- Credential cards display
- Portfolio overlay opens
- Preview works
- Download works
- Verification action works
- LinkedIn action works where enabled

## Learning Resources

- Resource section loads
- Entitled resources display
- Non-entitled resources remain hidden
- Preview works
- Download works
- Scheduled resources are handled correctly

## Registration

- Eligible programme displays
- Fee information is correct
- Registration action works
- Duplicate registration is prevented

## Security

- Another learner's data cannot be accessed
- Internal IDs are not visible
- Storage paths are not visible
- Console contains no critical errors

---

# 48. Scalability Strategy

The architecture supports future:

- Multiple programmes per learner
- Multiple credentials
- Multiple licensed resources
- Enterprise learners
- Subscription access
- Mobile applications
- Multi-language interfaces
- Regional deployments
- Progressive learning journeys
- AI-assisted learner guidance

Scalability must preserve:

- one canonical learner identity
- learner isolation
- service-layer governance
- entitlement-based delivery
- immutable academic records

---

# 49. MVP Boundaries

The current MVP prioritizes:

- Alumni activation
- Credential Portfolio access
- Licensed Learning Resource delivery
- Bridge Programme registration
- Payment completion
- Learner dashboard access
- Secure preview and download
- Reliable sign-out

The following may be deferred:

- Advanced personalization
- Historical version browsing
- Offline synchronization
- Native mobile application
- Complex notification centre
- Social learning features
- Advanced learner analytics

Deferred features must not block revenue generation or core learner
value delivery.

---

# 50. Governance Rules

The following rules are mandatory.

✓ No protected UI before authentication and authorization complete.

✓ `learner_uid` is the permanent identity anchor after first authentication.

✓ Entitlements are resolved outside the UI.

✓ Business rules remain in services.

✓ Learners consume but do not administer platform records.

✓ Internal Firestore IDs and Storage paths are never shown to learners.

✓ Secure downloads require fresh access validation.

✓ Learner-specific licensed resources are isolated by identity.

✓ Sign-out clears protected learner state.

✓ UI visibility is not a substitute for backend security.

✓ Revenue-critical learner journeys receive MVP priority.

---

# 51. Prohibited Practices

The following are prohibited:

- Rendering protected data before authorization
- Calculating programme eligibility in HTML
- Trusting client-provided learner UID values
- Directly editing Firestore from presentation components
- Constructing protected Storage paths in UI
- Exposing raw Firebase errors to learners
- Retaining learner data after sign-out
- Using email as the permanent identity anchor after activation
- Granting access solely because a navigation item is visible
- Completing enrollment from an unverified client payment response

---

# 52. Related Documents

- DOCUMENTATION-INDEX.md
- Identity Platform Architecture
- Credential Platform Architecture
- Learning Resource Platform Architecture
- Authorization and Entitlement Architecture
- Firestore Collections Reference
- Firestore Schema Reference
- Storage Layout Reference
- Identity Activation Runbook
- Bridge Programme Registration Runbook
- Credential Publication Runbook
- Production Deployment Runbook
- Incident Response Runbook
- Backup and Recovery Runbook
- ADR-019 – Learning Resource Delivery Architecture
- ADR-020 – Governed Learning Resource Release Architecture
- ADR-023 – Learning Resource Registration Strategy

---

# 53. Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | 27-Jul-2026 | Initial Student Portal Architecture |

---

# 54. Document Control

This document defines the authoritative architecture for the Agile AI
University Student Portal.

Changes to authentication flow, identity resolution, authorization,
entitlement handling, dashboard orchestration, credential presentation,
learning-resource delivery, registration, payment integration, or
learner navigation require:

1. Architecture approval
2. Service-layer impact review
3. Security review
4. Documentation updates
5. Focused production deployment
6. Live validation

The Student Portal must remain a secure, governed, learner-focused
consumption surface across the entire Agile AI University ecosystem.

---

**End of Document**