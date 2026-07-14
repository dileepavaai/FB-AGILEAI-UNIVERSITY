# Agile AI University

# Enterprise Service Specification

# CredentialActivationService

> **The authoritative Enterprise Service responsible for learner activation, credential ownership reconciliation, activation-token validation, secure credential claiming, and identity reconciliation audit.**

---

# Document Information

| Attribute | Value |
|---|---|
| **Service** | CredentialActivationService |
| **Owning Domain** | Identity & Credential Domain |
| **Service Type** | Enterprise Application Service |
| **Version** | 1.0.0 |
| **Status** | ACTIVE |
| **Implementation Status** | IN PROGRESS |
| **Architecture Status** | LOCKED FOR IMPLEMENTATION |
| **Environment** | Production-only |
| **Owner** | Agile AI University |
| **Founder / Architect** | Dileep Appupillai |
| **Last Updated** | July 2026 |

---

# Executive Summary

CredentialActivationService is the authoritative Enterprise Service responsible for securely linking historical learner credentials to authenticated learner identities.

The service provides a governed activation process that enables existing learners to claim previously issued credentials without compromising identity integrity, credential ownership, security, or auditability.

The service separates authentication from credential ownership.

Firebase Authentication remains the authoritative identity provider while the Credential Registry remains the authoritative credential repository.

CredentialActivationService is the only Enterprise Service permitted to convert an unclaimed credential into a learner-owned credential through a governed server-side reconciliation process.

This service forms the foundation of the Agile AI University Alumni Activation Programme and enables historical learners to securely access the Student & Executive Portal, retrieve their credentials, and continue their learning journey.

---

# 1. Purpose

CredentialActivationService provides the governed mechanism through which a historical or pre-existing credential becomes securely linked to an authenticated learner identity.

The service is responsible for converting:

```text
credential.learner_uid = null
```

into

```text
credential.learner_uid = authenticated Firebase UID
```

This conversion may occur only after all governance rules have been satisfied.

The service exists because many Agile AI University credentials were issued before the Student & Executive Portal and Firebase Authentication platform were introduced.

Historical credentials therefore legitimately exist without an associated authenticated learner account.

CredentialActivationService enables these learners to securely activate their accounts without compromising identity ownership, credential integrity or platform security.

---

# 2. Business Context

Agile AI University maintains historical credentials issued through earlier programme deliveries.

Many of these credentials predate the current learner authentication platform.

Consequently, a credential may legitimately exist before a learner account exists.

Example lifecycle:

```text
Programme Completed
        ↓
Credential Issued
        ↓
Credential Imported
        ↓
learner_uid = null
        ↓
Learner Activation
        ↓
Firebase Authentication
        ↓
Credential Claim
        ↓
Student Portal Access
```

The current implementation primarily supports the Agile Outcome Practitioner (AOP) alumni activation initiative.

Current production state:

| Item | Status |
|---|---:|
| Eligible AOP Credentials | 45 |
| Already Linked | 1 |
| Activation Required | 44 |
| Identity Conflicts | 0 |
| Manual Review | 0 |

The architecture is intentionally designed to support future credential programmes without modification.

---

# 3. Business Objectives

CredentialActivationService has the following business objectives.

## Primary Objectives

- Securely activate historical learners.
- Preserve historical credential ownership.
- Prevent identity fraud.
- Support alumni onboarding.
- Enable Student Portal access.
- Enable certificate and badge access.
- Enable learner self-service.
- Enable bridge programme registration.
- Maintain complete auditability.

## Secondary Objectives

- Reduce manual administrative work.
- Eliminate credential ownership ambiguity.
- Preserve historical programme integrity.
- Support future learner migration.
- Minimise operational cost.
- Reduce implementation complexity.
- Avoid unnecessary cloud services.
- Support production-only deployment.

---

# 4. Service Scope

CredentialActivationService governs only the learner activation process.

The service owns:

- Activation token generation
- Activation validation
- Credential claim
- Identity reconciliation
- Ownership linking
- Activation auditing
- Controlled activation lifecycle

The service does not own:

- Credential generation
- Programme completion
- Payment processing
- Registration
- Learning delivery
- Badge generation
- Certificate generation
- Credential publication
- Public verification

---

# 5. Service Vision

The long-term vision is to provide a single enterprise activation mechanism for every historical learner.

Every learner journey follows the same governed identity lifecycle.

```text
Invitation
        ↓
Authentication
        ↓
Identity Verification
        ↓
Credential Claim
        ↓
Portal Access
        ↓
Learning Journey
```

No alternative credential ownership mechanism shall exist.

---

# 6. Enterprise Principles

CredentialActivationService follows the Enterprise Principles adopted across Agile AI University.

## Identity before Access

Authentication establishes identity before any credential can be claimed.

---

## Governance before Automation

Every activation process must comply with enterprise governance before automation is introduced.

---

## Security before Convenience

Ease of activation must never compromise credential ownership.

---

## Authority before Integration

CredentialActivationService remains the sole authority responsible for credential claiming.

Other services may integrate with it but may not replace or bypass it.

---

## Cost before Complexity

The service must minimise operational cost.

Existing infrastructure shall always be reused before introducing additional cloud services or third-party products.

---

## Audit before Trust

Every credential ownership change must be permanently auditable.

---

# 7. Enterprise Authorities

CredentialActivationService operates alongside several enterprise authorities.

## Identity Authority

Firebase Authentication.

Responsible for:

- Authentication
- Identity verification
- Firebase UID
- Email verification

---

## Credential Authority

Firestore Credential Registry.

Responsible for:

- Credential existence
- Credential ownership
- Credential lifecycle
- Programme association
- Approval state

---

## Activation Authority

CredentialActivationService.

Responsible for:

- Activation lifecycle
- Credential claim
- Ownership reconciliation

---

## Audit Authority

Identity Reconciliation Events.

Responsible for:

- Activation history
- Ownership history
- Security audit
- Operational traceability

---

# 8. Authoritative Systems

The following systems are authoritative.

| Capability | Authority |
|---|---|
| Learner Identity | Firebase Authentication |
| Credential Ownership | Firestore Credentials |
| Activation Tokens | CredentialActivationService |
| Activation Audit | Identity Reconciliation Events |
| Student Experience | Student Portal |
| Credential Publication | Admin Portal |
| Binary Assets | Firebase Storage |

No duplicated authorities shall exist.

---

# 9. Service Responsibilities

CredentialActivationService is responsible for:

- Issuing activation invitations
- Creating activation tokens
- Hashing activation tokens
- Validating activation tokens
- Validating token expiry
- Validating learner identity
- Validating email ownership
- Validating credential eligibility
- Linking learner ownership
- Recording audit events
- Supporting idempotent operations
- Preventing duplicate claims
- Preventing credential hijacking
- Supporting controlled rollout
- Returning governed activation outcomes

---

# 10. Non-Responsibilities

CredentialActivationService shall never:

- Generate credentials
- Approve credentials
- Publish certificates
- Publish badges
- Process payments
- Create registrations
- Deliver learning
- Change programme completion
- Issue AIPA credentials
- Manage learner passwords
- Bulk-create Firebase Authentication users
- Replace Firebase Authentication
- Modify credential approval
- Modify credential issue status
- Modify programme history
- Rename historical credentials

---

# 11. Enterprise Service Relationships

CredentialActivationService collaborates with the following enterprise services.

| Service | Relationship |
|---|---|
| CredentialService | Reads credential state |
| RegistrationService | Starts learner registration after activation |
| PaymentService | Processes bridge payments |
| VerificationService | Independent verification platform |
| Student Portal | Activation user experience |
| Admin Portal | Invitation administration |

CredentialActivationService remains the activation authority.

---

# 12. Success Criteria

The service is considered successful when:

- Historical learners can securely activate accounts.
- Credential ownership is correctly established.
- Existing ownership is preserved.
- Duplicate ownership is prevented.
- Every activation is auditable.
- The Student Portal immediately displays learner-owned credentials.
- AOP credentials remain represented as AOP.
- Bridge eligibility becomes available after activation.
- Operational cost remains minimal.
- No unnecessary cloud infrastructure is introduced.
- The implementation remains production-safe.
- Future learner programmes can reuse the same activation architecture without redesign.

# 13. Identity Model

CredentialActivationService follows a strict enterprise identity model.

Identity ownership and credential ownership are separate concepts.

Authentication establishes who the learner is.

Credential ownership establishes which credentials belong to that learner.

These responsibilities must never be merged.

---

## 13.1 Identity Authority

Firebase Authentication is the authoritative identity provider.

Only Firebase Authentication may create or assign:

- Firebase UID
- Authentication state
- Verified email identity

Firestore must never generate its own learner identity.

---

## 13.2 Credential Authority

The Firestore collection:

```text
credentials
```

is the authoritative source for:

- Credential existence
- Credential ownership
- Credential lifecycle
- Programme identity
- Approval status
- Issuance status

CredentialActivationService does not create credentials.

It only reconciles ownership.

---

## 13.3 Ownership Link

Credential ownership is represented exclusively by:

```text
learner_uid
```

No alternative ownership mechanism is permitted.

---

## 13.4 Valid Ownership States

Only two ownership states are valid.

### Unclaimed

```text
learner_uid = null
```

### Claimed

```text
learner_uid = <Firebase Authentication UID>
```

The following values are prohibited:

```text
""
"pending"
"unknown"
"N/A"
credential ID
email address
temporary UID
random UID
```

---

# 14. Identity Reconciliation Rules

CredentialActivationService performs identity reconciliation using governed rules.

---

## Rule 1

Authentication is authoritative.

---

## Rule 2

Credentials may exist before learner accounts.

---

## Rule 3

Email is a discovery attribute.

It is not the ownership key.

---

## Rule 4

Ownership is determined only by:

```text
credential.learner_uid
```

---

## Rule 5

Existing ownership must never be overwritten automatically.

---

## Rule 6

Ownership changes require authenticated server-side processing.

---

## Rule 7

Every reconciliation must be auditable.

---

## Rule 8

Operations must be idempotent.

Repeated requests must always produce the same final ownership state.

---

# 15. Activation Lifecycle

The governed learner activation lifecycle is:

```text
Historical Credential
        ↓
Invitation Issued
        ↓
Activation Token Created
        ↓
Learner Opens Invitation
        ↓
Token Validation
        ↓
Firebase Authentication
        ↓
Verified Email
        ↓
Credential Claim
        ↓
Ownership Linked
        ↓
Audit Recorded
        ↓
Portal Access
```

No alternative activation path is permitted.

---

# 16. Activation Token Lifecycle

CredentialActivationService manages secure activation tokens.

Supported states are:

```text
issued
consumed
expired
revoked
blocked
```

State transitions:

```text
issued
    ↓
consumed

issued
    ↓
expired

issued
    ↓
revoked

issued
    ↓
blocked
```

Reverse transitions are prohibited.

For example:

```text
consumed
        ↓
issued
```

is never permitted.

A new activation always requires a new token.

---

# 17. Firestore Collections

CredentialActivationService introduces two enterprise collections.

---

## 17.1 credential_activation_tokens

Purpose:

Store governed activation invitations.

Collection:

```text
credential_activation_tokens
```

Primary responsibilities:

- Token management
- Expiry
- Consumption
- Retry protection
- Invitation tracking

---

## 17.2 identity_reconciliation_events

Purpose:

Provide permanent enterprise audit history.

Collection:

```text
identity_reconciliation_events
```

Primary responsibilities:

- Audit
- Traceability
- Compliance
- Diagnostics
- Security investigation

---

# 18. Data Model

## credential_activation_tokens

Recommended fields.

| Field | Purpose |
|---|---|
| credential_id | Credential identifier |
| email_normalized | Normalized learner email |
| token_hash | SHA-256 token hash |
| status | Token state |
| expires_at | Expiration timestamp |
| created_at | Creation timestamp |
| created_by | Issuing actor |
| updated_at | Last update |
| consumed_at | Consumption timestamp |
| consumed_by_uid | Firebase UID |
| attempt_count | Failed attempt counter |
| last_attempt_at | Last validation |
| source | Invitation source |
| campaign_id | Campaign identifier |
| correlation_id | Request correlation |
| version | Schema version |

---

## identity_reconciliation_events

Recommended fields.

| Field | Purpose |
|---|---|
| event_type | Event classification |
| credential_id | Credential reference |
| learner_uid | Firebase UID |
| email_normalized | Learner email |
| actor_type | learner/admin/service |
| actor_id | Actor identifier |
| source | Event source |
| result | Outcome |
| reason | Failure or success reason |
| created_at | Timestamp |
| correlation_id | Correlation identifier |
| metadata | Additional diagnostics |
| version | Schema version |

---

# 19. Security Requirements

CredentialActivationService must implement:

- Server-side validation
- Firebase ID token verification
- Secure token hashing
- Token expiration
- Single-use tokens
- Firestore transactions
- Audit logging
- Correlation identifiers
- Replay protection
- Rate limiting
- Secret-safe logging

The following must never be logged:

- Plain activation token
- Firebase ID token
- Service account private key
- Access token
- Password
- Complete email address where unnecessary

---

# 20. API Contract

Base path:

```text
/api/v1/credential-activations
```

Version:

```text
v1
```

Initial endpoints:

```http
POST /api/v1/credential-activations/validate

POST /api/v1/credential-activations/claim
```

Administrative endpoints may be introduced later.

---

# 21. Validate Endpoint

Endpoint:

```http
POST /api/v1/credential-activations/validate
```

Purpose:

Validate an activation token before learner authentication.

The endpoint:

- validates token existence
- validates expiry
- validates status
- returns only minimal learner information
- never exposes internal identifiers

Authentication is not required.

Rate limiting is mandatory.

---

# 22. Claim Endpoint

Endpoint:

```http
POST /api/v1/credential-activations/claim
```

Authentication:

Required.

The backend must verify the Firebase ID Token using Firebase Admin SDK.

The service derives:

- authenticated UID
- authenticated email
- email verification status

The browser must never provide authoritative ownership information.

---

# 23. Atomic Claim Transaction

Credential claiming must execute inside a Firestore transaction.

The transaction performs:

1. Load activation record.
2. Validate token.
3. Validate expiry.
4. Load credential.
5. Validate approval.
6. Validate issued status.
7. Validate normalized email.
8. Validate learner_uid.
9. Write learner_uid.
10. Consume activation token.
11. Update timestamps.
12. Commit.

The transaction must either succeed completely or fail completely.

Partial ownership changes are prohibited.

---

# 24. Idempotency

CredentialActivationService must be fully idempotent.

Repeated requests must never:

- duplicate ownership
- overwrite ownership
- duplicate credentials
- recreate activation
- consume multiple tokens

Expected behaviour:

| Situation | Result |
|---|---|
| First successful claim | Credential linked |
| Same learner retries | Already completed |
| Different learner retries | Ownership conflict |
| Expired token | Rejected |
| Revoked token | Rejected |
| Consumed token | Already completed or rejected according to ownership |

Idempotency is a mandatory enterprise governance requirement and applies to every activation request regardless of client behaviour.

# 25. Invitation Issuance

CredentialActivationService supports a governed learner invitation process.

The service generates secure activation information but remains independent from any specific email provider.

Invitation delivery is an operational activity.

---

## 25.1 Invitation Preconditions

An activation invitation may be issued only when all of the following conditions are satisfied.

The credential:

- exists
- is approved
- is finalized
- belongs to an approved activation campaign
- has a valid learner email
- remains unclaimed

The following condition must also be true:

```text
credential.learner_uid = null
```

unless the learner already owns the credential.

---

## 25.2 Invitation Generation

CredentialActivationService generates:

- activation token
- token hash
- activation expiry
- activation URL
- correlation identifier
- audit event

The service persists only the cryptographic token hash.

The plain activation token exists only temporarily during invitation generation.

---

## 25.3 Invitation Payload

The generated invitation payload contains:

- learner name
- learner email
- credential identifier
- programme name
- activation URL
- expiry information

The payload must never include:

- Firebase UID
- Firestore document ID
- service account information
- internal database identifiers
- plain credential ownership information

---

## 25.4 Invitation Delivery

CredentialActivationService prepares the invitation.

The operational process delivers the invitation.

This separation ensures that business logic remains independent from communication mechanisms.

---

# 26. Cost Governance and Invitation Delivery

Agile AI University follows a Cost-First Enterprise Architecture.

The objective is to maximise business value while minimising recurring infrastructure and operational costs.

The activation platform must reuse existing infrastructure wherever possible.

Introducing additional paid cloud services requires explicit architectural justification and founder approval.

---

## 26.1 Cost-First Principles

The activation platform shall always prefer:

1. Existing Firebase infrastructure
2. Existing Cloud Run services
3. Existing Firestore database
4. Existing Google Workspace
5. Existing Admin Portal
6. Existing Student Portal

before introducing:

- third-party SaaS
- paid email providers
- additional databases
- additional runtime services
- unnecessary automation

---

## 26.2 Approved Invitation Delivery Model

For the initial AOP Alumni Activation Programme, invitation delivery shall use the official Agile AI University Google Workspace account.

The governed process is:

```text
CredentialActivationService
        ↓
Generate Activation Token
        ↓
Generate Activation URL
        ↓
Persist Token Hash
        ↓
Write Audit Event
        ↓
Return Invitation Payload
        ↓
Administrator Reviews Invitation
        ↓
Google Workspace Email
        ↓
Learner Activation
```

Google Workspace is considered the approved delivery mechanism for the current alumni activation programme.

No paid email delivery provider is required.

---

## 26.3 Manual Delivery Governance

Each learner receives an individual activation invitation.

The administrator reviews:

- learner identity
- credential
- activation URL
- programme information

before sending.

This controlled process significantly reduces the risk of:

- incorrect recipient
- incorrect activation URL
- accidental credential disclosure
- mass mailing errors

---

## 26.4 Bulk Email Governance

The following approaches are prohibited.

```text
One email addressed to multiple learners

Multiple learners in TO

Multiple learners in CC

Multiple learners in BCC

Shared activation links

Shared activation tokens
```

Each learner must receive:

```text
One Learner

↓

One Activation Token

↓

One Activation URL

↓

One Invitation Email
```

---

## 26.5 Current Rollout Strategy

The approved rollout sequence is:

```text
Pilot

↓

1 Test Learner

↓

2–3 Trusted Alumni

↓

5 Alumni

↓

Remaining Eligible Alumni
```

The purpose of staged rollout is operational validation.

It is not intended to work around Google Workspace limitations.

---

## 26.6 Cost Controls

CredentialActivationService must minimise operational cost.

The following controls are mandatory.

### Infrastructure

- Reuse the existing Firestore database.
- Do not create additional Firestore databases.
- Reuse the existing Cloud Run backend.
- Reuse Firebase Authentication.
- Reuse Firebase Hosting.

---

### Runtime

Cloud Run shall:

- use minimum instances = 0
- use request-based execution
- explicitly limit maximum instances
- avoid unnecessary background execution

---

### Firestore

The service shall:

- perform indexed lookups
- use limit(1) where appropriate
- avoid collection scans
- avoid unnecessary polling
- minimise document reads
- minimise document writes

---

### Data

Activation and audit documents shall remain compact.

Large payloads shall not be duplicated.

Credential snapshots shall not be stored.

---

### Automation

The MVP shall not introduce:

- Pub/Sub
- Cloud Tasks
- Cloud Scheduler
- Firebase Email Extensions
- Third-party email providers
- Additional notification platforms

unless explicitly approved.

---

### Billing

Billing alerts shall be configured before production rollout.

Recommended alert thresholds:

```text
₹100

₹250

₹500

₹1000
```

Unexpected cost increases must be investigated immediately.

---

## 26.7 Founder Approval Rule

Any new recurring cost requires explicit founder approval.

Examples include:

- new Google Cloud services
- third-party SaaS
- paid APIs
- managed messaging platforms
- email delivery providers
- monitoring subscriptions

This rule applies even when estimated monthly cost is low.

---

## 26.8 Future Automation

Automated invitation delivery may be considered only when:

- learner volume becomes operationally difficult
- manual delivery becomes a bottleneck
- business value exceeds implementation effort
- recurring cost is justified
- founder approval has been obtained

Until then, Google Workspace remains the approved operational delivery mechanism.

---

# 27. Activation URL

Preferred activation route:

```text
https://portal.agileai.university/activate
```

Example:

```text
https://portal.agileai.university/activate?token=<activation-token>
```

The activation URL shall:

- contain only the activation token
- never expose Firestore IDs
- never expose Firebase UID
- never expose internal document identifiers
- support secure server-side validation

---

## 27.1 Browser Requirements

After loading the activation page:

- token validation begins
- authentication is requested
- credential claim occurs only after authentication
- successful activation redirects to the Student Portal

---

# 28. Portal Integration

After successful activation:

```text
credential.learner_uid

↓

Authenticated Firebase UID
```

The Student Portal retrieves learner credentials using:

```text
credential.learner_uid == authenticatedUser.uid
```

The learner immediately gains access to:

- historical credentials
- certificates
- badges
- recognitions
- bridge eligibility

CredentialActivationService does not determine bridge eligibility.

That responsibility remains with EligibilityService.

---

# 29. Enterprise Service Integration

CredentialActivationService integrates with:

| Service | Responsibility |
|---|---|
| Firebase Authentication | Identity |
| CredentialService | Credential retrieval |
| EligibilityService | Bridge eligibility |
| RegistrationService | Programme registration |
| PaymentService | Payment processing |
| Student Portal | Learner experience |
| Admin Portal | Invitation management |

CredentialActivationService remains the sole authority for credential ownership reconciliation.

---

# 30. Events

CredentialActivationService publishes or records the following enterprise events.

```text
ActivationTokenIssued

ActivationStarted

ActivationValidated

ActivationRejected

CredentialClaimStarted

CredentialClaimCompleted

CredentialOwnershipConflict

ActivationCompleted

ActivationFailed
```

Each event includes:

- correlation identifier
- timestamp
- credential identifier
- actor
- result
- version

Sensitive values shall never be included in event payloads.

---

# 31. Observability

The service records operational metrics including:

- invitations issued
- successful activations
- failed activations
- expired tokens
- revoked tokens
- ownership conflicts
- average activation duration
- activation completion rate

Operational metrics shall never expose confidential learner information.

---

# 32. Production-Only Operating Model

CredentialActivationService follows Agile AI University's production-only operating model.

Every production change follows:

```text
Review

↓

Small Change

↓

Commit

↓

Deploy

↓

Immediate Validation
```

Large combined deployments are discouraged.

Each production deployment should introduce a single focused capability wherever practical.

---

# 33. Pilot Rollout

The activation platform shall be validated using:

```text
Controlled Test Learner

↓

Trusted Alumni

↓

Small Pilot

↓

Full Alumni Rollout
```

Every rollout stage must complete successfully before proceeding.

---

# 34. Rollback Strategy

Credential ownership is an enterprise identity operation.

Rollback shall occur only when:

- ownership was incorrectly assigned
- security review approves correction
- audit history is preserved

Rollback must never delete historical audit events.

---

# 35. Failure Handling

The service shall safely handle:

- invalid token
- expired token
- revoked token
- duplicate activation
- ownership conflict
- authentication failure
- transaction failure
- temporary infrastructure failure

Every failure shall produce a governed outcome.

Silent failures are prohibited.

---

# 36. Administrative Capabilities

Future administrative capabilities may include:

- issue invitation
- resend invitation
- revoke invitation
- block invitation
- search activation
- activation history
- campaign reporting
- operational dashboard

These capabilities remain outside the initial MVP.

# 37. Privacy and Data Protection

CredentialActivationService shall follow the principle of minimum data exposure.

The service shall expose only the information required to complete learner activation.

The following principles apply.

---

## 37.1 Data Minimisation

Only the minimum data required for activation shall be stored.

The service shall avoid duplicating learner information already maintained by other enterprise systems.

---

## 37.2 Protected Information

The following information shall never be exposed to the browser unless explicitly required.

- Firebase UID
- Firestore document ID
- Internal collection identifiers
- Service account information
- Private security metadata
- Internal audit identifiers
- Administrative notes

---

## 37.3 Activation Token Protection

Plain activation tokens shall never be:

- stored in Firestore
- written to logs
- included in audit records
- committed to Git
- stored in browser local storage
- transmitted to third-party analytics

Only the cryptographic hash shall be persisted.

---

## 37.4 Privacy Principle

Learner identity shall always remain private.

Credential ownership shall never be inferable by another learner.

---

# 38. Data Retention

CredentialActivationService follows enterprise operational data-retention principles.

---

## Activation Tokens

Consumed activation records may be retained for operational audit.

Expired records may be archived according to enterprise retention policy.

---

## Audit Events

Identity reconciliation events form part of the enterprise audit trail.

These records shall not be modified or deleted except through approved governance procedures.

---

## Temporary Data

Temporary activation data shall never persist longer than operationally required.

---

# 39. Security Controls

CredentialActivationService implements defence-in-depth.

Mandatory controls include:

- authenticated server-side processing
- Firebase ID Token verification
- Firestore transactions
- cryptographically secure token generation
- SHA-256 token hashing
- replay protection
- rate limiting
- audit logging
- correlation identifiers
- secret-safe logging

The service shall fail securely.

---

# 40. Error Handling

The service shall return governed outcomes for all failures.

Typical error conditions include:

- invalid token
- expired token
- revoked token
- blocked token
- authentication failure
- email mismatch
- credential already claimed
- ownership conflict
- transaction failure
- internal service failure

The service shall never reveal unnecessary implementation details.

---

# 41. Performance Objectives

CredentialActivationService should provide a responsive learner experience.

Objectives include:

- minimal Firestore reads
- indexed lookups
- compact payloads
- efficient transactions
- minimal network latency

The activation process should normally complete within a few seconds under expected operating conditions.

Performance optimisation shall never compromise governance or security.

---

# 42. Documentation Dependencies

CredentialActivationService depends upon the following enterprise documentation.

```text
API_CATALOG.md

IDENTITY_RECONCILIATION_STANDARD.md

MIGRATION_SCRIPT_STANDARD.md

AOP_ALUMNI_ACTIVATION_RUNBOOK.md

FIREBASE_AUTHORIZATION_MATRIX.md

SERVICE_ACCOUNT_OPERATIONS.md

LOCAL_ADMIN_SDK_SETUP.md

TROUBLESHOOTING_FIREBASE_ADMIN_SDK.md

SECRET_INCIDENT_RESPONSE.md
```

Changes affecting CredentialActivationService shall update the relevant documentation.

---

# 43. Enterprise Architecture Decisions

CredentialActivationService implements the following locked enterprise decisions.

1. Firebase Authentication is the identity authority.

2. Firestore Credentials is the credential authority.

3. learner_uid is the permanent ownership link.

4. Email is a discovery attribute.

5. Credential ownership requires authenticated server-side processing.

6. Placeholder ownership values are prohibited.

7. Existing ownership shall never be overwritten automatically.

8. Activation tokens are single-use.

9. Plain activation tokens shall never be stored.

10. Identity reconciliation is fully auditable.

11. Student Portal consumes credentials.

12. Admin Portal governs credential administration.

13. Production operates without separate development or staging environments.

14. Cost-first architecture is mandatory.

15. Google Workspace is the approved invitation delivery mechanism for the current alumni activation programme.

---

# 44. Implementation Components

Recommended backend components.

```text
CredentialActivationController

CredentialActivationService

ActivationTokenService

CredentialClaimService

IdentityVerificationService

ActivationAuditService

ActivationRepository

CredentialRepository

AuditRepository
```

Recommended Student Portal components.

```text
activate.html

activation.js

activation-service.js

activation-auth.js

activation-status.js

activation.css
```

Recommended administrative capability.

```text
Activation Invitation Generator
```

The Invitation Generator prepares invitation payloads for administrator review and controlled delivery through Google Workspace.

---

# 45. Initial MVP Scope

The first implementation shall include:

- credential_activation_tokens collection
- identity_reconciliation_events collection
- activation token generation
- SHA-256 hashing
- validate endpoint
- claim endpoint
- Firestore transaction
- audit events
- activation page
- Firebase Authentication integration
- controlled invitation generation
- manual Google Workspace delivery
- controlled pilot validation

The following are intentionally excluded from the MVP:

- paid email providers
- bulk email automation
- marketing automation
- reminder campaigns
- scheduled background jobs
- Cloud Tasks
- Pub/Sub
- Firebase Email Extensions
- campaign analytics
- operational dashboards

These capabilities may be considered in future releases if justified.

---

# 46. Acceptance Criteria

CredentialActivationService Version 1.0 is complete when:

- activation tokens are generated securely
- only token hashes are stored
- activation tokens validate correctly
- expired tokens are rejected
- revoked tokens are rejected
- duplicate activation is prevented
- Firebase Authentication is verified server-side
- verified learner identity is required
- credential ownership is linked correctly
- Firestore transactions succeed atomically
- audit events are written
- AOP credentials appear immediately after activation
- AOP remains displayed as AOP
- EligibilityService resolves bridge eligibility
- Google Workspace invitations function correctly
- pilot rollout succeeds
- operational cost remains within planned startup limits
- production validation completes successfully

---

# 47. Estimated Implementation Effort

| Work Item | Estimate |
|---|---:|
| Firestore Collections | 1 hour |
| Token Generation | 2 hours |
| Token Hashing | 1 hour |
| Validate Endpoint | 2 hours |
| Claim Endpoint | 3 hours |
| Firestore Transaction | 2 hours |
| Audit Events | 2 hours |
| Activation Page | 4 hours |
| Firebase Authentication Integration | 3 hours |
| Google Workspace Invitation Generator | 2 hours |
| Controlled Pilot Validation | 4 hours |
| Documentation & Runbooks | 4 hours |

Estimated total effort:

```text
Approximately 24–28 hours
```

This estimate excludes:

- Payment Gateway
- Bridge Registration
- Marketing Automation
- Alumni Campaign Management

---

# 48. Service Boundary

CredentialActivationService owns:

```text
Activation Invitation

↓

Activation Token

↓

Token Validation

↓

Identity Verification

↓

Credential Claim

↓

Ownership Reconciliation

↓

Audit

↓

Portal Activation
```

CredentialActivationService does not own:

```text
Credential Generation

Certificate Generation

Badge Generation

Registration

Payment

Programme Delivery

Programme Completion

Credential Publication

Public Verification

Marketing

Mass Email Campaigns
```

This service boundary is locked.

No other enterprise service may directly assign credential ownership.

CredentialActivationService is the sole enterprise authority responsible for converting:

```text
learner_uid = null
```

into:

```text
learner_uid = authenticated Firebase UID
```

through a secure, governed, auditable and production-safe identity reconciliation process.

---

# Document Status

| Attribute | Value |
|---|---|
| **Document Version** | 1.0.0 |
| **Status** | ACTIVE |
| **Architecture Status** | LOCKED |
| **Governance Status** | APPROVED |
| **Implementation Status** | READY FOR MVP IMPLEMENTATION |
| **Next Document** | AOP_ALUMNI_ACTIVATION_RUNBOOK.md |