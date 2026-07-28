# ADR-024 – Learning Resource Publication vs Assignment Architecture (Deferred to Post-MVP)

| Attribute | Value |
|------------|-------|
| ADR Number | ADR-024 |
| Title | Learning Resource Publication vs Assignment Architecture |
| Status | Accepted (Deferred to Post-MVP) |
| Decision Date | 2026-07-28 |
| Owners | Agile AI University Architecture Board |
| Decision Authority | Founder & Chief Architect |
| Priority | Post-MVP Architectural Improvement |
| Related ADRs | ADR-019, ADR-020, ADR-021, ADR-022, ADR-023 |

---

# 1. Executive Summary

This Architecture Decision Record documents a deliberate decision to defer optimization of the Learning Resource publication model until after the MVP release.

The current implementation satisfies all governance, licensing, entitlement, ownership, audit, and security requirements while enabling the fastest possible production release and revenue generation.

Although the publication architecture can be further optimized for long-term scalability, implementing that redesign before MVP would delay business objectives without delivering additional value to learners.

Accordingly, the architectural improvement is officially deferred.

---

# 2. Background

The Agile AI University Learning Resource Platform delivers licensed programme materials to authenticated learners.

Each licensed learning resource is:

- protected
- governed
- permanently licensed
- identity-aware
- entitlement-controlled
- audit tracked

The current implementation allows learner-specific protected PDFs to be published and subsequently assigned.

This architecture is functionally correct and fully governed.

However, analysis identified an opportunity to further separate:

- academic publication
- learner ownership

into independent architectural layers.

---

# 3. Current MVP Architecture

Current model:

```
Published Resource
        │
        ▼
Personalized Protected PDF
        │
        ▼
Learner Assignment
        │
        ▼
Learning Resource Resolver
        │
        ▼
Learner Portal
```

Characteristics:

- learner-specific protected file
- fully governed
- immutable
- auditable
- production ready

This implementation satisfies all current business requirements.

---

# 4. Proposed Post-MVP Architecture

Future architecture:

```
Published Resource
(Academic Definition)
        │
        ▼
Version Metadata
        │
        ▼
Learner Assignment
        │
        ├───────────────► Learner A PDF
        │
        ├───────────────► Learner B PDF
        │
        ├───────────────► Learner C PDF
        │
        ▼
Learning Resource Resolver
        │
        ▼
Learner Portal
```

The published resource becomes the authoritative academic definition.

The learner assignment becomes the authoritative ownership record.

---

# 5. Decision

The MVP SHALL continue using the current architecture.

No publication model redesign will occur before production release.

The existing implementation is officially accepted as production-ready for the MVP.

---

# 6. Reason for Deferral

The optimization would primarily improve:

- administrative simplicity
- scalability
- metadata reuse

It does **not** improve:

- learner experience
- entitlement security
- ownership governance
- licensing
- authentication
- authorization
- revenue generation
- audit capability

Accordingly, the work is intentionally deferred.

---

# 7. Business Justification

Current organisational priorities are:

1. Revenue generation
2. Bridge Programme launch
3. Learning Resource production release
4. Learner onboarding
5. Alumni activation

The publication architecture optimization does not materially contribute to these objectives.

Therefore implementation before MVP would constitute unnecessary scope expansion.

---

# 8. Governance Principles

The following governance principles remain unchanged.

## Academic Authority

The University remains the authoritative publisher of all learning resources.

---

## Identity First

Every licensed resource remains identity bound.

---

## Permanent Ownership

Licensed Course Material remains permanently owned for the programme version attended.

Future programme versions require re-enrolment in accordance with University policy.

---

## Immutable Publication

Published resource versions remain immutable.

Corrections require publication of a new version.

---

## Immutable Assignment

Learner assignments remain permanent audit records.

Assignments are never silently modified.

---

## Resolver Authority

Learner visibility continues to be determined exclusively by:

Identity

↓

Authorization

↓

Entitlement

↓

Learning Resource Resolver

The Admin Portal never directly determines learner visibility.

---

# 9. Future Target Architecture

After MVP:

One governed publication.

Multiple learner assignments.

Example:

```
Published Resource

AOP Licensed Course Material
Version 1

        │

        ▼

Assignments

├── AAU-J3W5YQVN
├── AAU-8D4A91PF
├── AAU-KL92XF83
├── AAU-MP23KD61
└── ...
```

This minimizes duplicate publication metadata while preserving individualized licensed materials.

---

# 10. Benefits

Future implementation will provide:

- reduced administrative duplication
- simpler publication workflow
- improved scalability
- cleaner metadata management
- simplified version management
- improved reporting
- easier maintenance

without changing learner behaviour.

---

# 11. MVP Impact

No impact.

No migration required.

No data loss.

No learner disruption.

No governance change.

No licensing change.

No entitlement change.

No production risk.

---

# 12. Implementation Trigger

This ADR becomes active only after:

- MVP released
- Bridge Programme operational
- Revenue generation stabilised
- Learning Resource Platform operational

---

# 13. Estimated Effort

Estimated implementation effort:

**6–8 engineering hours**

The implementation is expected to consist primarily of:

- publication model refactoring
- assignment storage optimisation
- administrative workflow simplification

No learner-facing behavioural changes are expected.

---

# 14. Architectural Decision

The Agile AI University Architecture Board formally accepts the current Learning Resource publication model for MVP.

Publication-versus-assignment optimisation is intentionally deferred until after production release.

This decision preserves implementation velocity while maintaining full governance, security, ownership, licensing, auditability, and platform integrity.

This ADR supersedes any informal discussions regarding immediate redesign of the publication architecture.

---

# 15. Status

**Status:** ACCEPTED

**Implementation:** Deferred to Post-MVP

**Priority:** Medium

**Production Blocking:** No

**Revenue Blocking:** No

**Governance Impact:** None

**Architecture Classification:** Planned Evolution