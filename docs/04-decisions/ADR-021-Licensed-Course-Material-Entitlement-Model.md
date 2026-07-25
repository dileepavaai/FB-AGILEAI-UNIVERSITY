# ADR-021 — Licensed Course Material Entitlement Model

**Status:** ACCEPTED

**Version:** 1.0

**Date:** July 2026

**Owner:** Agile AI University Architecture Board

---

# 1. Context

The Agile AI University Learning Resource Platform delivers licensed academic intellectual property to authenticated learners.

During the architectural design of the Learning Resource Platform, an important distinction emerged between:

- Licensed Course Material
- Reference Material

Traditional Learning Management Systems often treat learning content as subscription-based or continuously updated. That model does not align with Agile AI University's academic and commercial governance.

Licensed Course Material is not subscription content.

It is an academic asset provided as part of a specific programme attendance and forms part of the learner's permanent academic ownership.

This decision establishes the entitlement model for licensed course materials and separates it from future commercial offerings and evolving reference materials.

---

# 2. Decision

Licensed Course Material shall be permanently associated with the programme attendance through which it was acquired.

Each learner receives the licensed course material corresponding to the programme version they attended.

That entitlement is permanent.

The platform shall never automatically replace, upgrade, or migrate licensed course material to a newer version.

Future programme versions shall be delivered only through an approved commercial journey such as:

- Refresh Programme
- Bridge Programme
- Re-attendance Programme

This decision applies to all current and future Agile AI University programmes.

---

# 3. Business Principles

## Principle 1 — One Programme Attendance

One programme attendance results in one licensed course material version.

```text
Programme Attendance
        │
        ▼
Licensed Course Material
        │
        ▼
Permanent Ownership
```

---

## Principle 2 — Permanent Ownership

Licensed Course Material permanently belongs to the learner.

Ownership does not expire.

Ownership is independent of future programme revisions.

---

## Principle 3 — Immutable Entitlement

Once assigned, licensed course material shall never be automatically:

- Replaced
- Upgraded
- Migrated
- Overwritten

The learner continues to access the version associated with their original programme attendance.

---

## Principle 4 — Commercial Separation

Future programme versions represent new academic offerings.

Access to those versions requires commercial re-enrollment through approved university pathways.

Examples include:

- Refresh Programme
- Bridge Programme
- Re-attendance Programme

This ensures a clear distinction between academic ownership and future commercial offerings.

---

# 4. Licensed Course Material vs Reference Material

## Licensed Course Material

Characteristics:

- Programme-specific
- Version-specific
- Protected intellectual property
- Permanently owned
- Commercially licensed
- Immutable after assignment

Examples:

- Licensed participant manuals
- Personalized PDFs
- Programme workbooks
- Official course notes
- Licensed templates supplied during the programme

---

## Reference Material

Characteristics:

- Supplementary
- Evolves over time
- May be updated
- Not permanently version-bound
- Governed independently

Examples:

- Reading lists
- Whitepapers
- AI implementation guides
- Bonus templates
- Research articles
- Best practice documents
- AI news references

Reference Material follows a separate lifecycle and is outside the scope of this entitlement model.

---

# 5. Commercial Model

Future programme versions become commercial offerings.

Example:

```text
AIPA Version 3
        │
        ▼
Learner Ownership
        │
        ▼
AIPA Version 4 Released
        │
        ▼
Refresh Programme
        │
        ▼
Commercial Registration
        │
        ▼
Version 4 Entitlement
```

The Learning Resource Platform does not determine commercial eligibility.

Commercial decisions belong to the Revenue Platform.

---

# 6. Platform Responsibilities

## Learning Resource Platform

Responsible for:

- Licensed material delivery
- Entitlement validation
- Protected downloads
- Permanent ownership enforcement
- Version-specific delivery

---

## Revenue Platform

Responsible for:

- Refresh Programmes
- Bridge Programmes
- Re-attendance Programmes
- Commercial registrations
- Programme upgrade offers

---

## Identity Platform

Responsible for:

- Identity verification
- Authentication
- learner_uid creation
- Entitlement resolution

Each platform remains independently governed.

---

# 7. Benefits

This decision provides:

- Clear academic ownership
- Strong commercial governance
- Predictable learner experience
- Simpler entitlement resolution
- Reduced backend complexity
- Strong intellectual property protection
- Scalable enterprise architecture
- Sustainable recurring revenue model

---

# 8. Consequences

Positive consequences include:

- Permanent learner ownership
- No entitlement migration
- Cleaner platform responsibilities
- Reduced implementation complexity
- Better academic integrity
- Better commercial clarity
- Simpler operational support

Trade-offs include:

- Learners do not automatically receive newer programme versions.
- New programme versions require commercial re-enrollment.
- Multiple programme versions may coexist indefinitely.

These trade-offs are intentional because they preserve licensing integrity and establish a sustainable commercial model.

---

# 9. Relationship to Other ADRs

This ADR extends and reinforces:

- ADR-015 — Identity Authority
- ADR-016 — Alumni Activation
- ADR-019 — Learning Resource Delivery Architecture
- ADR-020 — Governed Learning Resource Release Architecture

This ADR is further extended by:

- ADR-022 — Immutable Learner Assignment

Together these ADRs define:

- Identity authority
- Learning resource delivery
- Release governance
- Licensed material ownership
- Assignment immutability

---

# 10. Implementation Impact

No changes are required to the existing Firestore collections.

The existing architecture remains valid:

- `learning_resources`
- `learner_resource_access`

Entitlements continue to resolve through:

```text
Credential
      │
      ▼
Verified Email
      │
      ▼
Firebase Authentication
      │
      ▼
learner_uid
      │
      ▼
Entitlements
      │
      ▼
Licensed Learning Resources
```

No additional collections or entitlement migration mechanisms are required for the MVP.

---

# 11. Status

**ACCEPTED**

This Architecture Decision Record is locked for the MVP and establishes the official Licensed Course Material Entitlement Model for Agile AI University.

Future programme versions shall be treated as new commercial offerings rather than automatic entitlement upgrades.

This decision forms a core part of the Agile AI University Enterprise Architecture and shall remain the governing policy for licensed learning resource ownership unless superseded by a formally approved Architecture Decision Record.