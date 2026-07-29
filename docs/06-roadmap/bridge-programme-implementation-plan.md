# Bridge Programme Implementation Plan

**Document Version:** 1.0.0  
**Status:** ACTIVE  
**Phase:** Revenue Sprint  
**Owner:** Agile AI University  
**Document Classification:** Implementation Governance  
**Architecture Domain:** Programme Progression, Registration, Payment and Enrolment  
**Related Architecture:** Bridge Programme Architecture  
**Related Decision:** ADR-026 – Bridge Programme Architecture

---

# 1. Purpose

This document is the authoritative implementation roadmap for the Agile AI University Bridge Programme capability.

It translates the approved Bridge Programme Architecture into executable engineering work and provides complete implementation traceability from design through production deployment.

Unlike the domain architecture, which defines principles, boundaries, governance and responsibilities, this document focuses on implementation.

It defines:

- implementation workstreams
- execution sequence
- engineering responsibilities
- implementation dependencies
- production readiness
- validation strategy
- deployment readiness
- remaining effort
- implementation governance
- future scalability

This document serves as the operational implementation guide for the Revenue Sprint and must remain synchronized with the production implementation.

It complements:

- Bridge Programme Domain Architecture
- ADR-026 – Bridge Programme Architecture

---

# 2. Business Objective

The objective of the Revenue Sprint is to enable existing Agile AI University learners and alumni to progress into approved higher-level programmes through a governed Bridge Programme.

The initial supported progression pathways are:

```text
AOP  →  AIPA

AAIA →  AIPA
```

The implementation must enable an eligible learner to:

1. Authenticate through the Student Portal.
2. Resolve credential ownership.
3. Validate academic eligibility.
4. Validate commercial eligibility.
5. Register for the Bridge Programme.
6. Complete secure payment.
7. Receive confirmed enrolment.
8. Gain access to the learning experience.
9. Continue future credential progression.

The implementation must remain aligned with the Agile AI University architectural principles:

- Identity before eligibility
- Eligibility before registration
- Registration before payment
- Payment before enrolment
- Enrolment before learning access
- Business rules outside the UI
- Trusted backend authority for commercial operations
- Cost-conscious MVP implementation

---

# 3. Success Criteria

The Revenue Sprint is considered complete when an eligible learner can successfully complete the following end-to-end lifecycle.

```text
Authentication
        ↓
Identity Resolution
        ↓
Credential Ownership
        ↓
Academic Eligibility
        ↓
Commercial Eligibility
        ↓
Bridge Programme Registration
        ↓
Secure Payment
        ↓
Verified Payment
        ↓
Programme Enrolment
        ↓
Learning Access
        ↓
My Enrolments
        ↓
Future Credential Progression
```

The implementation is considered successful only when every stage of the lifecycle operates correctly under governed production conditions.

---

# 4. Progress Dashboard

| Workstream | Status | Progress | Priority |
|------------|--------|---------:|----------|
| Bridge Programme Domain | ✅ Complete | 100% | High |
| Identity | ✅ Complete | 100% | High |
| Credential Ownership | ✅ Complete | 100% | High |
| Programme Relationships | ✅ Complete | 100% | High |
| Academic Eligibility | ✅ Complete | 100% | High |
| Commercial Eligibility | ✅ Complete | 100% | High |
| Registration | 🟡 In Progress | 30% | Critical |
| Payment | ⏳ Pending | 0% | Critical |
| Enrolment | ⏳ Pending | 0% | Critical |
| Learning Access | ⏳ Pending | 0% | High |
| Student Portal | 🟡 In Progress | 75% | High |
| Firestore | 🟡 In Progress | 60% | High |
| Backend Services | 🟡 In Progress | 40% | Critical |
| Security | 🟡 In Progress | 70% | Critical |
| Testing | ⏳ Pending | 0% | Critical |
| Production Release | ⏳ Pending | 0% | Critical |

---

# 5. Current Implementation Status

## Completed

The following implementation components have been completed.

### Student Portal

- Programme navigation
- Bridge Programme Registration page foundation
- Bridge Programme Registration stylesheet
- Bridge Programme Registration controller foundation

### Browser Services

- ProgramService foundation
- EligibilityService v1.5.0
- BridgeProgramService v1.1.0

### Architecture

- Bridge Programme Domain Architecture
- ADR-026 – Bridge Programme Architecture

---

## Implemented but Not Yet Activated

The following components have been implemented but intentionally remain inactive until the remaining commercial workflow is completed.

- Registration acknowledgement UI
- Registration action controls
- Registration page lifecycle states

These capabilities remain non-operational until:

- BridgeRegistrationService is implemented.
- Firestore security rules are completed.
- Registration workflow is activated.

---

## In Progress

Current engineering work:

- BridgeRegistrationService
- Registration document contract
- Registration workflow
- Deterministic registration ID strategy

---

## Pending

The following implementation work remains.

### Registration

- Registration service completion
- Registration validation
- Duplicate prevention
- Registration status lifecycle

### Firestore

- bridge_programme_registrations collection
- Security rules
- Validation rules
- Required indexes

### Payment

- Payment-order creation
- Gateway integration
- Trusted payment verification
- Commercial reconciliation

### Enrolment

- Enrolment creation
- Programme allocation
- Registration transition
- Enrolment lifecycle

### Learning

- Learning-access activation
- Learning-resource entitlement
- My Enrolments integration

### Production

- End-to-end validation
- Security verification
- Smoke testing
- Production deployment

---

# 6. Implementation Principles

Every implementation activity within the Revenue Sprint must follow the following principles.

## Identity First

Every workflow begins with authenticated learner identity.

The canonical learner identity is:

```text
learner_uid
```

---

## Credential Before Eligibility

Academic eligibility must always be determined from verified credential ownership.

The UI must never independently determine credential ownership.

---

## Eligibility Before Registration

Bridge Programme registration is permitted only after:

- academic eligibility
- commercial eligibility

have both been validated.

---

## Registration Before Payment

A registration represents the learner's governed commercial intent.

Payment must never exist without a valid registration.

---

## Payment Before Enrolment

Programme enrolment must occur only after trusted payment verification.

Browser confirmation alone is never sufficient.

---

## Enrolment Before Learning Access

Learning resources, programme materials and future learner services are activated only after confirmed enrolment.

---

## Separation of Responsibilities

Each service has one clearly defined responsibility.

Examples:

| Service | Responsibility |
|----------|----------------|
| ProgramService | Programme metadata |
| EligibilityService | Commercial eligibility |
| BridgeProgramService | Academic progression |
| BridgeRegistrationService | Registration |
| Payment Service | Commercial payment |
| Enrolment Service | Programme enrolment |

No service should absorb responsibilities belonging to another domain.

---

## Business Rules Outside the UI

The browser UI is responsible only for presentation and user interaction.

Business rules must remain inside governed services.

---

## Trusted Commercial Authority

Commercial operations including:

- payment
- pricing
- registration confirmation
- enrolment

must ultimately be validated by trusted backend services.

---

## Idempotent Operations

Registration operations must safely tolerate:

- repeated clicks
- browser refresh
- retries
- duplicate requests
- network failures

Deterministic registration IDs are the primary idempotency mechanism.

---

## Cost-Conscious MVP

Implementation decisions must prioritise:

- reuse of existing platform services
- minimal infrastructure expansion
- deterministic Firestore access
- operational simplicity
- rapid production delivery

Features not required for immediate revenue generation are deferred to future implementation phases.

# 7. Workstream Catalogue

The Bridge Programme implementation is organised into sixteen governed workstreams.

Each workstream represents a logical implementation boundary with clearly defined responsibilities, dependencies, validation criteria and completion requirements.

---

# Workstream 01 – Bridge Programme Domain

## Purpose

Establish the Bridge Programme as a governed academic and commercial progression capability within the Agile AI University ecosystem.

This workstream defines the overall business capability, architectural boundaries, lifecycle, governance rules and implementation roadmap.

It acts as the parent domain that coordinates identity, eligibility, registration, payment, enrolment and learning access without assuming ownership of those domains.

---

## Business Responsibilities

The Bridge Programme domain is responsible for:

- programme progression governance
- Bridge Programme lifecycle
- implementation governance
- domain boundaries
- service coordination
- implementation sequencing
- documentation
- production rollout guidance

It is **not** responsible for:

- learner authentication
- payment verification
- enrolment creation
- credential issuance
- learning resource entitlement

Those responsibilities remain within their respective domains.

---

## Deliverables

Completed deliverables include:

- Bridge Programme Domain Architecture
- ADR-026 – Bridge Programme Architecture
- Implementation Plan
- Domain lifecycle
- Domain boundaries
- Service responsibilities
- Governance rules
- Revenue Sprint implementation roadmap

---

## Dependencies

None.

This is the parent implementation workstream.

---

## Validation Criteria

This workstream is complete when:

- domain architecture is approved
- implementation roadmap is documented
- responsibilities are clearly defined
- lifecycle is locked
- governance rules are documented
- service boundaries are approved

---

## Current Status

**Status:** ✅ Complete

**Implementation Progress:** **100%**

---

## Remaining Effort

No implementation effort remains.

Future updates will occur only if the Bridge Programme architecture changes.

---

# Workstream 02 – Identity

## Purpose

Provide trusted learner identity for all Bridge Programme operations.

Identity is the first authority within the implementation chain.

No Bridge Programme operation may proceed until learner identity has been established.

---

## Responsibilities

Identity is responsible for:

- Firebase Authentication
- authenticated learner session
- learner profile resolution
- learner UID resolution
- identity activation
- learner ownership validation

The canonical learner identity is:

```text
learner_uid
```

Supporting identifiers include:

- learner email
- Credential ID

After first authentication, these become supporting business identifiers.

They never replace:

```text
learner_uid
```

---

## Current Implementation

Completed capabilities include:

- Firebase Authentication
- identity activation
- learner profile loading
- authenticated portal session
- portal identity events
- learner dashboard access

Identity resolution already exists within the Student Portal foundation.

---

## Files

Primary implementation includes:

```text
public-portal/index.html

public-portal/assets/js/auth/

public-portal/assets/js/services/

public-portal/assets/js/core/
```

Identity services are shared across the Student Portal.

---

## Firestore Collections

Consumes:

```text
learner_profiles

credentials
```

Does not own commercial registration data.

---

## Dependencies

None.

Identity is the root dependency for all subsequent workstreams.

---

## Validation Criteria

Identity validation requires:

- authenticated learner
- valid learner UID
- resolved learner profile
- authorised portal access
- active authenticated session

---

## Security

The authenticated learner must satisfy:

```text
request.auth.uid == learner_uid
```

Identity validation must always occur before:

- eligibility
- registration
- payment
- enrolment

---

## Current Status

**Status:** ✅ Complete

**Implementation Progress:** **100%**

---

## Remaining Effort

None.

Identity foundation is complete and reused by the Bridge Programme.

---

# Workstream 03 – Credential Ownership

## Purpose

Determine whether the authenticated learner owns the prerequisite credential required for an approved Bridge Programme.

Credential ownership is the academic authority for programme progression.

---

## Responsibilities

Credential Ownership is responsible for:

- credential resolution
- programme ownership
- credential validation
- programme completion verification
- credential status
- programme code resolution

It is not responsible for:

- pricing
- registration
- payment
- enrolment

---

## Current Implementation

Completed implementation includes:

- learner credential resolution
- credential ownership lookup
- programme code extraction
- credential display
- credential authority

The implementation already supports determining whether a learner owns:

```text
AOP

AAIA

AIPA
```

This information is consumed by BridgeProgramService.

---

## Firestore Collections

Consumes:

```text
credentials

credential_assets
```

No Bridge Programme data is stored here.

---

## Business Rules

Required rules include:

- learner must own source credential
- credential must be valid
- credential must belong to authenticated learner
- target credential must not already exist

---

## Dependencies

Depends on:

- Identity

Provides input to:

- Academic Eligibility

---

## Validation Criteria

Validation requires:

- learner authenticated
- credential found
- credential belongs to learner
- source programme recognised
- credential status valid

---

## Current Status

**Status:** ✅ Complete

**Implementation Progress:** **100%**

---

## Remaining Effort

None.

Future work is limited to supporting additional programme relationships.

---

# Workstream 04 – Programme Relationships

## Purpose

Define and govern approved progression pathways between Agile AI University programmes.

This workstream provides the academic progression map used by BridgeProgramService.

---

## Responsibilities

Programme Relationships determine:

- source programme
- target programme
- progression eligibility
- relationship code
- relationship type
- active relationship status

---

## Approved Relationships

Current Revenue Sprint relationships:

```text
AOP  →  AIPA

AAIA →  AIPA
```

Relationship codes:

```text
AOP_TO_AIPA

AAIA_TO_AIPA
```

Relationship type:

```text
CAPABILITY_UPGRADE
```

---

## Current Implementation

Implemented through:

```text
BridgeProgramService
```

The service validates:

- source programme completion
- target programme non-completion
- relationship activity

---

## Future Relationships

Future implementation will support:

```text
AIPA → AAIP

AAIP → AIAL

AIPA → AISD

AIPA → AAIM

AIPA → AAICC

AIPA → AISL

AIPA → AIOL

AIPA → AIPL
```

The current implementation intentionally supports only the Revenue Sprint pathways.

---

## Dependencies

Consumes:

- Identity
- Credential Ownership

Provides input to:

- Academic Eligibility

---

## Validation Criteria

A valid Bridge Programme relationship requires:

- source programme exists
- target programme exists
- relationship active
- source and target different
- learner completed source
- learner has not completed target

---

## Current Status

**Status:** ✅ Complete

**Implementation Progress:** **100%**

---

## Remaining Effort

Future enhancement only.

Programme relationships should eventually become configuration-driven rather than remaining statically defined within the browser service.

The current implementation is appropriate for the Revenue Sprint MVP.

# Workstream 05 – Academic Eligibility

## Purpose

Determine whether an authenticated learner satisfies the academic requirements for an approved Bridge Programme.

Academic eligibility validates programme progression independently of commercial eligibility.

A learner must first qualify academically before any commercial offer is presented.

---

## Responsibilities

Academic Eligibility is responsible for:

- validating prerequisite programme completion
- confirming source credential ownership
- preventing progression without prerequisites
- preventing duplicate progression
- validating approved programme relationships
- producing an academic eligibility decision

Academic Eligibility is **not** responsible for:

- pricing
- taxation
- registration
- payment
- enrolment
- learning access

---

## Current Implementation

Academic eligibility is implemented through:

```text
BridgeProgramService
```

Current validation includes:

- authenticated learner
- source credential ownership
- source programme completion
- target programme non-completion
- approved relationship validation

Current supported pathways:

```text
AOP  →  AIPA

AAIA →  AIPA
```

---

## Dependencies

Consumes:

- Identity
- Credential Ownership
- Programme Relationships

Provides input to:

- Commercial Eligibility

---

## Validation Rules

The learner must satisfy all of the following.

✓ Authenticated

✓ Valid learner UID

✓ Source credential exists

✓ Source credential belongs to learner

✓ Source programme completed

✓ Target programme not already completed

✓ Relationship active

Failure of any rule results in:

```text
ACADEMICALLY_INELIGIBLE
```

---

## Files

Primary service:

```text
public-portal/assets/js/services/programs/bridge-program-service.js
```

Supporting services:

```text
EligibilityService

ProgramService
```

---

## Current Status

**Status:** ✅ Complete

**Implementation Progress:** **100%**

---

## Remaining Effort

Future enhancement only.

Future programme relationships should eventually be configuration-driven rather than statically defined.

---

# Workstream 06 – Commercial Eligibility

## Purpose

Determine whether an academically eligible learner may currently purchase the Bridge Programme.

Commercial eligibility is independent of academic eligibility.

An academically eligible learner may still be commercially ineligible.

---

## Responsibilities

Commercial Eligibility determines:

- offer availability
- campaign validity
- bridge pricing
- GST
- total payable
- offer expiry
- registration URL
- commercial messaging

Commercial Eligibility does **not**:

- create registrations
- create payment orders
- create enrolments
- activate learning access

---

## Current Implementation

Commercial eligibility is implemented through:

```text
EligibilityService
```

Current implementation includes:

- programme resolution
- target programme resolution
- pricing
- GST calculation
- total payable
- offer expiry
- registration destination
- upgrade ViewModel generation

---

## Approved Commercial Offer

Revenue Sprint commercial offer:

```text
Base Fee          ₹7,500
GST               18%
GST Amount        ₹1,350
Total Payable     ₹8,850
Offer Expiry      5 August 2026
```

Standard Bridge Programme pricing after expiry:

```text
₹15,000 + applicable GST
```

---

## Dependencies

Consumes:

- Identity
- Academic Eligibility

Provides input to:

- Registration

---

## Validation Rules

Commercial validation includes:

- learner academically eligible
- offer active
- campaign active
- learner not already registered
- learner not already enrolled
- pricing available

---

## Files

Primary implementation:

```text
public-portal/assets/js/services/programs/eligibility-service.js
```

---

## Current Status

**Status:** ✅ Complete

**Implementation Progress:** **100%**

---

## Remaining Effort

Minor future enhancements:

- promotional campaigns
- scholarship support
- coupon framework
- multiple commercial offers

None are required for the Revenue Sprint MVP.

---

# Workstream 07 – Registration

## Purpose

Create a governed Bridge Programme registration that records the learner's commercial intent before payment.

Registration is the authoritative commercial entry point into the Bridge Programme lifecycle.

Registration is **not** enrolment.

---

## Responsibilities

Registration is responsible for:

- validating learner identity
- validating eligibility
- generating deterministic registration IDs
- preventing duplicates
- creating registration intent
- maintaining registration lifecycle
- supporting safe retries

Registration does **not**:

- verify payment
- create enrolment
- activate learning access

---

## Current Implementation

Completed:

- Registration architecture
- Registration lifecycle
- Registration document contract
- Deterministic ID strategy
- Idempotency strategy
- UI foundation

Currently being implemented:

```text
BridgeRegistrationService
```

---

## Canonical Collection

```text
bridge_programme_registrations
```

---

## Canonical Document ID

```text
{learner_uid}_{source_program_code}_{target_program_code}
```

Example:

```text
firebaseUid123_AOP_AIPA
```

---

## Initial Registration State

```text
registration_status = PAYMENT_PENDING

payment_status = NOT_INITIATED

enrolment_status = NOT_CREATED
```

---

## Dependencies

Consumes:

- Identity
- Academic Eligibility
- Commercial Eligibility

Provides input to:

- Payment

---

## Registration Lifecycle

```text
ELIGIBLE
      ↓
PAYMENT_PENDING
      ↓
PAYMENT_IN_PROGRESS
      ↓
PAYMENT_CONFIRMED
      ↓
REGISTERED
      ↓
ENROLMENT_PENDING
      ↓
ENROLLED
```

Alternative terminal states:

```text
FAILED

EXPIRED

CANCELLED
```

---

## Idempotency

Registration must safely tolerate:

- repeated clicks
- browser refresh
- duplicate requests
- network retry
- payment retry

Duplicate registrations are prevented through:

1. deterministic document ID

2. existence check

3. Firestore create-only operation

---

## Files

Primary implementation:

```text
public-portal/assets/js/services/programs/bridge-registration-service.js
```

Related:

```text
bridge-programme-registration.js

bridge-programme-registration.html
```

---

## Validation Criteria

Registration is complete when:

✓ Registration created

✓ Duplicate prevented

✓ Existing registration returned

✓ Initial statuses validated

✓ Firestore contract satisfied

---

## Current Status

**Status:** 🟡 In Progress

**Implementation Progress:** **30%**

---

## Remaining Effort

Remaining implementation includes:

- service implementation
- Firestore writes
- duplicate detection
- registration activation
- rule validation
- production testing

---

# Workstream 08 – Payment

## Purpose

Provide secure commercial payment for approved Bridge Programme registrations.

Payment begins only after a valid registration exists.

---

## Responsibilities

Payment is responsible for:

- payment-order creation
- gateway integration
- payment verification
- signature validation
- payment reconciliation
- payment lifecycle
- refund lifecycle

Payment does **not**:

- determine eligibility
- create registrations
- create enrolments
- grant learning access

---

## Current Architecture

The payment workflow is:

```text
Registration
      ↓
Payment Order
      ↓
Gateway Checkout
      ↓
Gateway Response
      ↓
Trusted Verification
      ↓
Payment Confirmation
      ↓
Registration Update
```

---

## Commercial Authority

The browser is **not** the payment authority.

Only trusted backend services may:

- verify payment
- update payment status
- reconcile payment
- confirm settlement

---

## Payment Status Lifecycle

```text
NOT_INITIATED
      ↓
ORDER_CREATED
      ↓
PENDING
      ↓
AUTHORIZED
      ↓
PAID
```

Failure states:

```text
FAILED

CANCELLED

REFUNDED

PARTIALLY_REFUNDED
```

---

## Dependencies

Consumes:

- Registration

Provides input to:

- Enrolment

---

## Backend Responsibilities

Trusted backend services must:

- validate registration
- validate pricing
- validate GST
- validate offer expiry
- create payment order
- verify payment signature
- update commercial state

---

## Planned APIs

```text
POST /bridge-programmes/payment-order

POST /bridge-programmes/payment-verify
```

---

## Validation Criteria

Payment is complete when:

✓ Payment order created

✓ Gateway completed

✓ Signature verified

✓ Payment confirmed

✓ Registration updated

---

## Current Status

**Status:** ⏳ Pending

**Implementation Progress:** **0%**

---

## Remaining Effort

Complete payment implementation including:

- payment-order endpoint
- gateway integration
- backend verification
- payment reconciliation
- production validation

# Workstream 09 – Enrolment

## Purpose

Create the official programme enrolment after successful payment verification.

Enrolment represents the learner's formal admission into the Bridge Programme and serves as the academic authority for programme participation.

Enrolment is distinct from registration.

Registration represents commercial intent.

Enrolment represents confirmed academic participation.

---

## Responsibilities

The Enrolment workstream is responsible for:

- creating programme enrolment
- assigning learner to programme
- assigning learner to cohort or batch (where applicable)
- maintaining enrolment lifecycle
- activating programme participation
- triggering learning-access provisioning

The Enrolment workstream is **not** responsible for:

- payment verification
- credential issuance
- assessment
- programme completion
- certificate generation

---

## Current Architecture

The enrolment lifecycle is:

```text
Verified Payment
        ↓
Registration Confirmed
        ↓
Enrolment Created
        ↓
Programme Allocation
        ↓
Learning Access Provisioned
```

---

## Initial Enrolment State

```text
NOT_CREATED
```

Possible lifecycle:

```text
NOT_CREATED
        ↓
PENDING
        ↓
ACTIVE
        ↓
COMPLETED
```

Alternative states:

```text
FAILED

CANCELLED

WITHDRAWN
```

---

## Canonical Collection

```text
enrolments
```

---

## Responsibilities of the Enrolment Service

The service will:

- validate registration
- validate payment confirmation
- validate learner identity
- create enrolment
- prevent duplicate enrolments
- return existing enrolment when appropriate

---

## Dependencies

Consumes:

- Registration
- Payment

Provides input to:

- Learning Access

---

## Validation Criteria

Enrolment is considered complete when:

✓ Verified payment exists

✓ Registration confirmed

✓ Enrolment created

✓ Duplicate enrolments prevented

✓ Learner visible in My Enrolments

---

## Files

Planned implementation:

```text
public-portal/assets/js/services/programs/enrolment-service.js
```

---

## Current Status

**Status:** ⏳ Pending

**Implementation Progress:** **0%**

---

## Remaining Effort

- enrolment service
- Firestore contract
- duplicate validation
- lifecycle implementation
- My Enrolments integration
- production validation

---

# Workstream 10 – Learning Access

## Purpose

Provision programme learning resources after confirmed enrolment.

Learning access represents the learner's entitlement to consume programme-specific academic content.

Learning access is **never** granted directly from registration or payment.

---

## Responsibilities

Learning Access is responsible for:

- entitlement activation
- programme resource visibility
- licensed learning material access
- learner resource assignment
- future programme version governance

Learning Access is **not** responsible for:

- registration
- payment
- enrolment
- credential ownership

---

## Current Architecture

Learning activation sequence:

```text
Enrolment
      ↓
Entitlement Resolution
      ↓
Learning Resources
      ↓
Student Portal
```

---

## Existing Foundation

The Agile AI University Learning Resource Platform already provides:

- licensed resource management
- learner assignments
- entitlement resolution
- protected downloads
- learner resource governance

The Bridge Programme implementation will consume this existing platform.

No duplicate learning platform will be created.

---

## Firestore Collections

Consumes:

```text
learning_resources

learner_resource_access
```

---

## Dependencies

Consumes:

- Enrolment

Provides input to:

- Student Portal

---

## Validation Criteria

Learning Access is complete when:

✓ Enrolment active

✓ Entitlements resolved

✓ Resources visible

✓ Downloads authorised

✓ Portal correctly reflects access

---

## Files

Existing platform:

```text
learning-resource-service.js

learning-resource-section.js
```

Future Bridge Programme integration:

```text
bridge-learning-access-service.js
```

(if required)

---

## Current Status

**Status:** ⏳ Pending

**Implementation Progress:** **0%**

---

## Remaining Effort

- enrolment integration
- entitlement activation
- validation
- production verification

---

# Workstream 11 – Student Portal

## Purpose

Provide the learner-facing experience for the complete Bridge Programme lifecycle.

The Student Portal orchestrates presentation while delegating business rules to governed services.

---

## Responsibilities

The Student Portal is responsible for:

- programme discovery
- eligibility display
- Bridge Programme registration
- payment redirection
- registration status
- My Enrolments
- Learning History
- learner navigation

The Student Portal must **not**:

- determine eligibility
- calculate pricing
- verify payment
- create enrolments

---

## Current Implementation

Completed:

- Programme navigation
- Bridge Programme Registration page
- Registration UI foundation
- Page controller
- Styling
- Sidebar integration

Implemented but inactive:

- registration acknowledgement
- registration action controls
- lifecycle rendering

---

## Portal Pages

Current pages:

```text
bridge-programme-registration.html

my-enrolments.html

learning-history.html
```

---

## Dependencies

Consumes:

- Eligibility
- Registration
- Learning Access

---

## Validation Criteria

Portal implementation is complete when:

✓ Eligible learner sees programme

✓ Registration available

✓ Registration status visible

✓ My Enrolments updated

✓ Learning History updated

---

## Files

```text
bridge-programme-registration.html

bridge-programme-registration.js

bridge-programme-registration.css

my-enrolments.html

learning-history.html
```

---

## Current Status

**Status:** 🟡 In Progress

**Implementation Progress:** **75%**

---

## Remaining Effort

- activate registration workflow
- integrate My Enrolments
- integrate learning history
- production validation

---

# Workstream 12 – Firestore

## Purpose

Provide the authoritative persistence layer for Bridge Programme operations.

Firestore stores governed academic and commercial records.

The browser is never the ultimate authority.

---

## Responsibilities

Firestore is responsible for:

- registration persistence
- enrolment persistence
- learner ownership
- security rules
- lifecycle tracking
- audit support

---

## Canonical Collections

Bridge Programme implementation uses:

```text
credentials

learner_profiles

bridge_programme_registrations

payments

enrolments

learning_resources

learner_resource_access
```

---

## New Collection

```text
bridge_programme_registrations
```

Document ID:

```text
{learner_uid}_{source_program_code}_{target_program_code}
```

Example:

```text
firebaseUid123_AOP_AIPA
```

---

## Security Responsibilities

Rules must validate:

- authenticated learner
- learner ownership
- deterministic document ID
- create-only registration
- fixed initial statuses
- duplicate prevention

Learners must not:

- change payment status
- change enrolment status
- delete registrations

---

## Required Indexes

Indexes should be introduced only when required by implemented queries.

Avoid unnecessary index creation during the MVP.

---

## Dependencies

Consumes:

- Identity

Supports:

- Registration
- Payment
- Enrolment
- Learning Access

---

## Validation Criteria

Firestore implementation is complete when:

✓ Collections created

✓ Rules deployed

✓ Security validated

✓ Duplicate prevention validated

✓ Read/write permissions verified

---

## Current Status

**Status:** 🟡 In Progress

**Implementation Progress:** **60%**

---

## Remaining Effort

- registration collection
- registration rules
- rule validation
- production deployment
- production verification

# Workstream 13 – Backend Services

## Purpose

Provide trusted server-side authority for all commercial operations that cannot be safely executed within the browser.

The backend protects the commercial integrity of the Bridge Programme lifecycle by validating registrations, creating payment orders, verifying payment gateway responses, updating commercial state and initiating downstream academic workflows.

---

## Responsibilities

Backend Services are responsible for:

- payment-order creation
- payment verification
- signature verification
- commercial validation
- registration state transitions
- enrolment initiation
- audit logging
- operational diagnostics
- future webhook processing

Backend Services are **not** responsible for:

- rendering UI
- learner navigation
- browser session management
- academic eligibility calculation

---

## Current Architecture

The backend sits after Registration and before Enrolment.

```text
Registration
      ↓
Backend Validation
      ↓
Payment Order
      ↓
Payment Verification
      ↓
Registration Update
      ↓
Enrolment
```

---

## Existing Foundation

Existing backend platform:

- Cloud Run
- Firebase Admin SDK
- Firestore access
- Shared authentication
- Shared configuration

The Bridge Programme will extend the existing backend rather than introducing a separate commercial service.

---

## Planned APIs

Initial APIs include:

```text
POST /bridge-programmes/payment-order

POST /bridge-programmes/payment-verify
```

Future APIs may include:

```text
GET  /bridge-programmes/registration

GET  /bridge-programmes/status

POST /bridge-programmes/refund
```

---

## Dependencies

Consumes:

- Registration
- Firestore
- Authentication

Provides services to:

- Payment
- Enrolment

---

## Validation Criteria

Backend implementation is complete when:

✓ Payment order created

✓ Registration validated

✓ Signature verified

✓ Payment confirmed

✓ Registration updated

✓ Audit event recorded

---

## Current Status

**Status:** 🟡 In Progress

**Implementation Progress:** **40%**

---

## Remaining Effort

- payment-order endpoint
- payment verification endpoint
- gateway integration
- audit logging
- operational diagnostics
- production validation

---

# Workstream 14 – Security

## Purpose

Protect the academic, commercial and operational integrity of the Bridge Programme.

Security applies across identity, browser, backend, Firestore and payment infrastructure.

---

## Responsibilities

Security governs:

- authentication
- authorization
- Firestore Rules
- backend validation
- payment verification
- ownership validation
- audit integrity

---

## Security Principles

The implementation follows these principles:

- Identity First
- Least Privilege
- Trusted Backend Authority
- Browser Is Not Trusted
- Deterministic Ownership
- Create-Only Registration
- Auditability
- Defence in Depth

---

## Identity Security

Canonical learner identity:

```text
learner_uid
```

Required rule:

```text
request.auth.uid == learner_uid
```

---

## Firestore Security

Learners may:

- create their own registration
- read their own registration

Learners may not:

- alter pricing
- alter payment status
- alter enrolment status
- delete registration
- impersonate another learner

---

## Backend Security

The backend validates:

- registration ownership
- registration state
- pricing
- GST
- offer expiry
- payment signature
- payment ownership

---

## Payment Security

Payment confirmation requires trusted verification.

The browser must never directly set:

```text
AUTHORIZED

PAID

REFUNDED
```

---

## Dependencies

Security spans all workstreams.

---

## Validation Criteria

Security implementation is complete when:

✓ Firestore rules deployed

✓ Backend validation complete

✓ Identity ownership verified

✓ Commercial operations protected

✓ Audit trail verified

---

## Current Status

**Status:** 🟡 In Progress

**Implementation Progress:** **70%**

---

## Remaining Effort

- registration rules
- payment validation
- production security review
- penetration testing
- operational validation

---

# Workstream 15 – Testing

## Purpose

Validate that the Bridge Programme functions correctly under production conditions.

Testing verifies academic correctness, commercial integrity and operational reliability.

---

## Responsibilities

Testing includes:

- unit testing
- integration testing
- Firestore validation
- payment validation
- security validation
- regression testing
- production smoke testing
- UAT

---

## Test Categories

### Functional

- eligibility
- registration
- payment
- enrolment
- learning access

---

### Security

- ownership validation
- unauthorized access
- Firestore Rules
- payment protection

---

### Commercial

- pricing
- GST
- offer expiry
- duplicate registration

---

### Failure Scenarios

- duplicate clicks
- refresh
- payment failure
- abandoned payment
- network retry
- registration retry

---

### Production Validation

- end-to-end registration
- payment confirmation
- enrolment
- learner visibility
- learning access

---

## Dependencies

Testing depends on all implementation workstreams.

---

## Validation Criteria

Testing is complete when:

✓ All critical paths pass

✓ Security verified

✓ No duplicate registrations

✓ Payment reconciliation verified

✓ Production validation complete

---

## Current Status

**Status:** ⏳ Pending

**Implementation Progress:** **0%**

---

## Remaining Effort

Complete after implementation.

---

# Workstream 16 – Production Release

## Purpose

Deploy the Bridge Programme capability safely into production.

This workstream governs release sequencing, deployment validation, rollback readiness and operational monitoring.

---

## Responsibilities

Production Release includes:

- deployment
- smoke testing
- operational validation
- monitoring
- rollback readiness
- production sign-off

---

## Deployment Sequence

```text
Browser Services
      ↓
Backend
      ↓
Firestore Rules
      ↓
Portal
      ↓
Validation
      ↓
Go Live
```

---

## Post-Deployment Validation

Verify:

✓ Registration

✓ Payment

✓ Enrolment

✓ Learning Access

✓ My Enrolments

✓ Audit Logs

✓ Monitoring

---

## Rollback Strategy

If a critical issue occurs:

1. Disable registration.
2. Preserve registration records.
3. Restore previous deployment.
4. Investigate.
5. Redeploy corrected implementation.

Commercial records must never be deleted during rollback.

---

## Current Status

**Status:** ⏳ Pending

**Implementation Progress:** **0%**

---

## Remaining Effort

Dependent upon completion of all implementation workstreams.

---

# 8. File Inventory

Every implementation file should be documented using the following template.

```text
File Name

Purpose

Version

Status

Owner

Dependencies

Related Services

Validation Status

Next Planned Change
```

This inventory should include all browser files, backend services, Firestore Rules, configuration files and documentation associated with the Bridge Programme.

---

# 9. Firestore Collection Inventory

Every collection must be documented using the following structure.

```text
Collection Name

Purpose

Owner

Document ID Strategy

Primary Key

Read Authority

Write Authority

Lifecycle

Indexes

Dependencies
```

Current collections include:

```text
credentials

learner_profiles

bridge_programme_registrations

payments

enrolments

learning_resources

learner_resource_access
```

---

# 10. Service Inventory

Document every browser and backend service using the following template.

```text
Service

Purpose

Authority

Inputs

Outputs

Dependencies

Current Version

Status

Future Enhancements
```

Current services include:

- ProgramService
- EligibilityService
- BridgeProgramService
- BridgeRegistrationService
- Payment Service
- Enrolment Service
- Learning Resource Service

---

# 11. API Inventory

Every backend endpoint must be documented using the following structure.

```text
Endpoint

HTTP Method

Authentication

Purpose

Request

Response

Validation

Error Codes

Idempotency

Dependencies
```

Initial Bridge Programme APIs include:

```text
POST /bridge-programmes/payment-order

POST /bridge-programmes/payment-verify
```

Future APIs will be added as the platform evolves.

# 12. Security Checklist

The following security validations must be completed before the Bridge Programme capability is released to production.

## Identity

- Authenticated learner required
- Firebase Authentication validated
- learner_uid resolved correctly
- Session validation completed
- Identity ownership verified

---

## Authorization

- Learner can access only their own Bridge Programme registration
- Administrative access verified
- Unauthorized access denied
- Role-based access validated

---

## Firestore Rules

Validate:

- Create permissions
- Read permissions
- Update restrictions
- Delete restrictions
- Ownership validation
- Deterministic document ID validation
- Duplicate prevention
- Initial registration status validation

---

## Backend Security

Validate:

- Authentication
- Registration ownership
- Commercial validation
- Payment verification
- Signature validation
- Error handling
- Audit logging

---

## Payment Security

Validate:

- Payment order creation
- Payment signature verification
- Duplicate payment prevention
- Replay attack protection
- Registration ownership
- Pricing validation
- GST validation

---

## Audit Validation

Verify that all commercial operations generate appropriate audit records.

Audit includes:

- Registration
- Payment
- Enrolment
- Learning access
- Administrative actions
- Operational exceptions

---

# 13. Production Readiness Checklist

The following checklist must be completed before enabling learner registration.

## Documentation

✓ Bridge Programme Architecture

✓ ADR-026

✓ Implementation Plan

---

## Browser

✓ Registration page

✓ Controller

✓ CSS

✓ Navigation

✓ Eligibility display

---

## Services

✓ ProgramService

✓ EligibilityService

✓ BridgeProgramService

□ BridgeRegistrationService

□ Enrolment Service

---

## Firestore

□ Registration collection

□ Security rules

□ Validation

□ Production deployment

---

## Backend

□ Payment-order endpoint

□ Payment verification

□ Error handling

□ Audit logging

---

## Production Validation

□ Registration

□ Payment

□ Enrolment

□ Learning access

□ My Enrolments

□ Learning History

□ Audit

---

# 14. MVP Scope

## Included

The Revenue Sprint MVP includes:

- AOP → AIPA Bridge Programme
- AAIA → AIPA Bridge Programme
- Academic eligibility
- Commercial eligibility
- Registration
- Payment
- Enrolment
- Learning access
- My Enrolments
- Student Portal integration
- Firestore security
- Backend payment validation
- Production deployment

---

## Deferred

The following capabilities are intentionally deferred beyond the MVP.

- Coupon engine
- Scholarship engine
- Instalment payments
- Seat inventory management
- Waitlists
- Promotional campaigns
- Refund automation
- Multiple commercial offers
- Automated notifications
- Advanced operational dashboards

---

## Future Roadmap

Future enhancements include:

- Configuration-driven Bridge Programme registry
- Multiple concurrent Bridge Programmes
- AI-assisted progression recommendations
- Learning analytics
- Executive dashboards
- Advanced reporting
- Operational automation
- Workflow orchestration
- Event-driven architecture

---

# 15. Remaining Estimate

| Workstream | Progress | Remaining Effort | Priority |
|------------|---------:|-----------------:|----------|
| Registration | 30% | Medium | Critical |
| Payment | 0% | High | Critical |
| Enrolment | 0% | Medium | Critical |
| Learning Access | 0% | Low | High |
| Student Portal | 75% | Low | High |
| Firestore | 60% | Low | High |
| Backend | 40% | Medium | Critical |
| Security | 70% | Low | Critical |
| Testing | 0% | Medium | Critical |
| Production Release | 0% | Low | Critical |

---

## Overall Implementation Status

Estimated overall Bridge Programme completion:

```text
Approximately 65%
```

Remaining implementation is primarily concentrated within:

- Registration
- Payment
- Enrolment
- Production validation

These represent the final commercial workflow before release.

---

# 16. Risks

## Technical Risks

- Registration duplication
- Firestore rule misconfiguration
- Payment verification failure
- Enrolment synchronization issues
- Entitlement activation delay

---

## Business Risks

- Commercial pricing inconsistency
- Expired offer configuration
- Incorrect learner eligibility
- Programme progression errors

---

## Operational Risks

- Deployment failure
- Monitoring gaps
- Audit inconsistencies
- Rollback complexity

---

## Security Risks

- Unauthorized access
- Ownership validation failures
- Client-side manipulation
- Payment spoofing
- Firestore privilege escalation

---

## Revenue Risks

- Registration failures
- Payment abandonment
- Enrolment failures
- Learning-access failures

---

# 17. Deferred Features

The following capabilities are intentionally outside the Revenue Sprint.

## Commercial

- Coupon engine
- Scholarship engine
- Promotional campaigns
- Multi-currency
- Dynamic pricing
- Corporate pricing

---

## Academic

- Cross-institution progression
- Credit transfer
- AI progression recommendations
- Automated pathway suggestions

---

## Operational

- Seat management
- Capacity planning
- Workflow engine
- Event-driven processing
- Operational analytics

---

# 18. Locked Decisions

The following implementation decisions are considered binding.

1. Identity is the first authority.
2. learner_uid is the canonical learner identity.
3. Academic eligibility precedes commercial eligibility.
4. Registration precedes payment.
5. Registration is not enrolment.
6. Enrolment requires verified payment.
7. Learning access requires confirmed enrolment.
8. Registration IDs are deterministic.
9. Registration creation is idempotent.
10. Browser code is not trusted authority.
11. Payment verification requires trusted backend.
12. Firestore Rules enforce ownership.
13. Commercial values are centrally governed.
14. Audit records are mandatory.
15. Revenue Sprint remains the implementation priority.
16. Features unrelated to immediate revenue generation remain deferred until after MVP.

---

# 19. Document Maintenance

This document is the operational source of truth for Bridge Programme implementation.

It must be updated whenever:

- implementation progress changes
- a workstream changes status
- a new implementation file is added
- an architectural decision changes
- Firestore collections change
- backend APIs change
- production deployment completes
- implementation estimates are revised
- Revenue Sprint scope changes

This document must remain synchronized with:

- Bridge Programme Architecture
- ADR-026
- Source code
- Firestore Rules
- Backend implementation
- Production deployment

---

# 20. References

Architecture Documents

- Bridge Programme Architecture
- Programme Domain Architecture
- Registration Domain Architecture
- Payment Domain Architecture
- Learning Domain Architecture
- Credential Domain Architecture

Architecture Decisions

- ADR-026 – Bridge Programme Architecture

Implementation

- Bridge Programme Registration
- BridgeRegistrationService
- EligibilityService
- BridgeProgramService

Operational

- Firestore Rules
- Backend Services
- Student Portal
- Revenue Sprint Documentation

---

# 21. Final Implementation Statement

The Bridge Programme implementation establishes the commercial progression capability of the Agile AI University ecosystem.

Its implementation lifecycle is:

```text
Identity
      ↓
Credential Ownership
      ↓
Academic Eligibility
      ↓
Commercial Eligibility
      ↓
Registration
      ↓
Payment
      ↓
Verified Payment
      ↓
Enrolment
      ↓
Learning Access
      ↓
Programme Completion
      ↓
Future Credential Progression
```

Every implementation activity, production deployment, and future enhancement must preserve this lifecycle.

No implementation may bypass identity, eligibility, registration, payment, enrolment or learning-access governance.

---

# Document Status

```text
Version : 1.0.0

Status  : ACTIVE

Classification : Implementation Governance

Phase : Revenue Sprint

Owner : Agile AI University

Implementation State : IN PROGRESS
```