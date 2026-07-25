# ADR-022 — Immutable Learner Assignment

**Status:** ACCEPTED

**Version:** 1.0

**Date:** July 2026

**Owner:** Agile AI University Architecture Board

---

# 1. Context

The Learning Resource Platform delivers licensed academic material to authenticated learners.

Earlier architectural decisions established that:

- Licensed Course Material is permanently owned by the learner who attended the programme.
- Licensed material is version-specific.
- Future programme versions require commercial re-enrollment.
- Identity remains the authority for entitlement resolution.

During implementation another important architectural question emerged:

> Should learner assignments be editable after they are created?

Allowing administrators to edit existing assignments introduces significant complexity:

- Assignment mutation
- Version migration
- Entitlement ambiguity
- Audit uncertainty
- Legal ownership concerns
- Hidden data changes

Since licensed learning material represents commercial academic intellectual property, assignment history must remain trustworthy.

---

# 2. Decision

Learner resource assignments are immutable.

Once a licensed learning resource has been assigned to a learner, the assignment record shall never be modified to reference another learning resource or another version.

If an administrator makes an assignment error, the incorrect assignment shall be revoked (while preserving its audit history), and a new assignment shall be created.

The original assignment record remains permanently preserved.

---

# 3. Assignment Lifecycle

```text
Draft Resource
      │
      ▼
Published Resource
      │
      ▼
Learner Assignment
      │
      ▼
Identity Binding
      │
      ▼
Permanent Ownership
      │
      ▼
Student Portal Access
```

After assignment, the relationship becomes immutable.

No updates are performed.

---

# 4. Architectural Principles

## Principle 1 — Assignments are Permanent Records

Assignments are permanent business records.

They are not editable business objects.

---

## Principle 2 — Version Ownership Never Changes

The learner permanently owns the version that was assigned.

The system shall never silently replace or upgrade that version.

---

## Principle 3 — Corrections Create New Records

Assignment corrections shall always create a new assignment.

Existing assignment history shall never be overwritten.

---

## Principle 4 — Identity Remains Authoritative

Assignments continue to be resolved through the established identity authority:

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
Learning Resources
```

No component may bypass this identity sequence.

---

# 5. Administrative Behaviour

Administrators may:

- Create learner assignments
- Publish learning resources
- Upload personalized licensed PDFs
- Revoke incorrect assignments
- Create corrected assignments

Administrators shall never:

- Replace an assigned version
- Edit assignment ownership
- Modify assignment history
- Reassign an assignment to another learner
- Update an existing assignment to point to a different learning resource

---

# 6. Student Behaviour

The Student Portal shall always display the licensed learning material permanently assigned to the learner.

The Student Portal shall never expose concepts such as:

- Latest Version
- Replace Version
- Upgrade Resource
- Automatic Migration

The learner simply accesses the licensed material associated with their programme attendance.

---

# 7. Benefits

This decision provides:

- Complete auditability
- Legal traceability
- Academic integrity
- Commercial integrity
- Simpler entitlement resolution
- Simpler backend implementation
- Reduced operational risk
- Predictable learner experience
- Enterprise scalability
- Future compliance readiness

---

# 8. Consequences

Positive consequences include:

- Immutable audit history
- Cleaner Firestore data model
- No hidden mutations
- Easier production support
- Lower maintenance cost
- Simpler identity binding
- Deterministic entitlement resolution

Trade-offs include:

- Administrative corrections require creating a new assignment instead of editing an existing one.
- Revoked assignments remain permanently available for audit purposes.

These trade-offs are intentional because they preserve governance, legal traceability, and academic integrity.

---

# 9. Relationship to Other ADRs

This ADR extends and reinforces:

- ADR-015 — Identity Authority
- ADR-016 — Alumni Activation
- ADR-019 — Learning Resource Delivery Architecture
- ADR-020 — Governed Learning Resource Release Architecture
- ADR-021 — Licensed Course Material Entitlement Model

ADR-022 governs the lifecycle of learner assignments after they have been created and ensures that assignment history remains immutable throughout the Learning Resource Platform.

---

# 10. Implementation Impact

No new Firestore collections are introduced.

The existing architecture remains unchanged.

Existing collections continue to be used:

- `learning_resources`
- `learner_resource_access`

Assignment records should include a lifecycle status (for example, `assigned` or `revoked`) rather than being modified in place.

This preserves a complete audit trail while keeping entitlement resolution simple, deterministic, and scalable.

---

# 11. Status

**ACCEPTED**

This Architecture Decision Record is locked for the MVP and forms part of the Agile AI University Enterprise Architecture.

Future enhancements shall preserve the immutability of learner assignments unless superseded by a formally approved Architecture Decision Record.