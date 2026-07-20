# Agile AI University

# Architecture Decision Record (ADR)

# ADR-020

# Governed Learning Resource Release Architecture

---

| Attribute | Value |
|------------|-------|
| ADR | ADR-020 |
| Title | Governed Learning Resource Release Architecture |
| Status | ACCEPTED |
| Date | July 2026 |
| Owner | Enterprise Architecture |
| Applies To | Learning Resource Platform, Student Portal, Admin Portal, Identity Platform, Revenue Platform |
| Supersedes | None |

---

# Executive Summary

This Architecture Decision Record establishes the enterprise governance for releasing learning resources throughout the Agile AI University ecosystem.

The platform supports multiple learner journeys, including:

- New learners
- Alumni
- Enterprise learners
- Future subscription learners
- Future self-paced learners

A single release strategy cannot satisfy all learner journeys.

Therefore, learning resources shall be governed through enterprise release policies resolved by the platform rather than through UI logic.

This decision preserves learner engagement while providing alumni and entitled learners with appropriate access to their learning assets.

---

# Background

Initially, the Learning Resource Platform was designed to provide learners access to licensed course materials after authentication and entitlement verification.

During architecture review, it became clear that releasing all learning materials immediately after enrolment introduces educational, operational and business challenges.

Examples include:

- Reduced attendance in instructor-led programmes.
- Learners assuming PDFs replace instructor-led learning.
- Learners studying future topics before the corresponding instructor-led sessions.
- Reduced classroom interaction.
- Increased confusion due to premature exposure to advanced concepts.
- Reduced perceived value of live instruction.

Conversely, alumni who have already completed their learning journey should immediately receive access to all entitled learning resources.

These competing requirements require governed release policies rather than a single implementation approach.

---

# Decision

The Agile AI University platform shall adopt a Governed Learning Resource Release Architecture.

Learning resources shall not become visible simply because a learner is authenticated.

Instead, visibility shall be determined using enterprise business rules resolved by the Learning Resource Resolver.

The UI shall never determine learning resource availability.

---

# Architecture

```
Identity

↓

Authentication

↓

Authorization

↓

Entitlement Resolver

↓

Learning Resource Resolver

↓

Learning Resource Service

↓

Student Portal
```

Business decisions remain completely outside UI components.

---

# Learning Resource Categories

Learning resources shall be classified into governed categories.

Examples include:

- Welcome Guide
- Programme Guide
- Joining Instructions
- Pre-reading Material
- Module Notes
- Session Notes
- Reference Guides
- Assignments
- Exercises
- Templates
- Sample Solutions
- Final Reference Manual
- Licensed Course Materials
- Supplemental Resources

Additional categories may be introduced without architectural changes.

---

# Release Policies

Every learning resource shall have an enterprise release policy.

Supported policies include:

| Policy | Description |
|----------|-------------|
| ON_ENROLLMENT | Available immediately after successful enrolment. |
| PRE_MODULE | Released shortly before the corresponding learning module begins. |
| POST_MODULE | Released after successful completion of a learning module. |
| POST_SESSION | Released after completion of an instructor-led session. |
| POST_ASSESSMENT | Released after successful assessment completion. |
| ON_COMPLETION | Released after successful programme completion. |
| ALUMNI_ONLY | Visible only to alumni. |
| MANUAL_RELEASE | Released manually by an administrator. |

Additional policies may be introduced without architectural redesign.

---

# Typical Learning Resource Release Timeline

The following table illustrates the recommended release timing for instructor-led programmes.

| Resource Type | Recommended Release Timing |
|---------------|----------------------------|
| Welcome Guide | Immediately after enrolment |
| Programme Guide | Immediately after enrolment |
| Joining Instructions | Immediately after enrolment |
| Pre-reading Material | Several days before programme commencement |
| Module 1 Notes | Shortly before the Module 1 session begins |
| Module 2 Notes | Shortly before the Module 2 session begins |
| Module 3 Notes | Shortly before the Module 3 session begins |
| Module N Notes | Shortly before the corresponding module session begins |
| Templates | When introduced during the programme |
| Exercises | During the corresponding learning session |
| Assignments | At the end of the corresponding module or session |
| Sample Solutions | After assignment submission or instructor discussion |
| Final Reference Manual | After successful programme completion |
| Licensed Course Materials | After successful programme completion unless an alternative enterprise release policy has been configured |
| Certificate | After successful completion of all programme requirements |
| Digital Badge | After successful completion of all programme requirements |

---

# Release Philosophy

Learning resources are released progressively to maximise learner engagement and learning outcomes.

The objective is to provide learners with the right information at the right time while preserving the value of instructor-led learning.

For instructor-led programmes:

- Programme information is available immediately after enrolment.
- Module-specific learning materials are released shortly before the corresponding session begins.
- Practical exercises are released during the learning journey.
- Assignments are released as learners progress through the programme.
- Reference materials and licensed course materials are normally released after successful programme completion.
- Alumni receive immediate access to their entitled learning resources according to enterprise governance.

The Learning Resource Resolver determines resource availability.

The Student Portal only renders resolved resources.

---

# Learner Journey

For active learners, learning resources shall be released progressively.

Typical learner journey:

```
Registration

↓

Payment

↓

Identity Activation

↓

Programme Enrolment

↓

Progressive Learning Resource Release

↓

Instructor-led Learning

↓

Assessment

↓

Programme Completion

↓

Credential

↓

Certificate

↓

Digital Badge

↓

Completion Resources
```

The Learning Resource Resolver determines which resources become available at each stage.

---

# Alumni Journey

Alumni have already completed their learning journey.

Their experience differs from active learners.

Typical journey:

```
Authentication

↓

Authorization

↓

Entitlement Resolution

↓

Credential Workspace

↓

Certificates

↓

Digital Badges

↓

Learning Resources

↓

Verification

↓

Upgrade Opportunities
```

Learning resources available to alumni shall be resolved immediately following successful authentication and entitlement verification unless a resource is governed by an alternative enterprise policy.

---

# Resolver Responsibilities

The Learning Resource Resolver shall determine learning resource visibility using enterprise business rules.

Possible evaluation criteria include:

- Identity
- User role
- Programme
- Cohort
- Enrolment status
- Learning progress
- Module completion
- Session completion
- Assessment completion
- Credential ownership
- Alumni status
- Enterprise customer rules
- Subscription status
- Release policy
- Manual overrides

The UI shall never evaluate these business rules.

---

# Metadata Requirements

Each learning resource shall contain, at minimum:

- program_code
- resource_id
- version
- title
- resource_type
- category
- release_policy
- status
- display_order
- source
- created_by_uid
- created_by_email
- created_at

Optional metadata may include:

- module_number
- session_number
- cohort
- prerequisite_resource
- assessment_dependency
- release_date
- expiry_date

Additional metadata may be introduced without architectural redesign.

---

# Admin Responsibilities

The Admin Portal remains the enterprise authority.

Administrators are responsible for:

- Creating learning resources.
- Publishing learning resources.
- Managing versions.
- Assigning release policies.
- Maintaining metadata.
- Withdrawing resources where required.

The Student Portal shall never modify enterprise learning resources.

---

# Student Portal Responsibilities

The Student Portal shall:

- Authenticate learners.
- Resolve entitlements.
- Display resolved learning resources.
- Preview learning resources.
- Request protected downloads.

The Student Portal shall never:

- Publish learning resources.
- Upload learning resources.
- Modify enterprise learning resources.
- Evaluate release policies.

---

# Enterprise Principles

This decision reinforces the following enterprise principles:

- Resolver First
- Governance Before Automation
- Architecture Before Features
- Admin Owns Authority
- Student Portal Consumes Only
- Immutable Enterprise Assets
- Separation of Domains

---

# Future Extensibility

This architecture supports future capabilities without architectural redesign, including:

- Self-paced learning programmes
- Enterprise customer learning journeys
- Cohort-based releases
- Time-based releases
- Milestone-based releases
- Subscription learning
- Continuing Professional Development (CPD)
- AI-generated learning journeys
- AI tutors
- Learning recommendations
- Digital libraries
- Partner universities

---

# Consequences

## Positive

- Preserves learner engagement.
- Prevents premature exposure to future learning content.
- Protects the value of instructor-led learning.
- Supports progressive learning journeys.
- Supports immediate alumni access.
- Scales across multiple programme types.
- Keeps business rules outside the UI.
- Aligns with enterprise governance.

## Trade-offs

- Requires additional resolver logic.
- Requires richer learning resource metadata.
- Introduces release policy management within the Admin Portal.

These trade-offs are accepted in favour of long-term scalability, governance and learner experience.

---

# Architecture Status

**Status:** ACCEPTED

This Architecture Decision Record is **LOCKED**.

All future implementations of the Learning Resource Platform shall conform to this architecture unless superseded by a future Architecture Decision Record.

---

**End of ADR-020**