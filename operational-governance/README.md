# Governance Records

This folder contains frozen governance records for Agile AI University systems.

Rules:
- Documents here are non-runtime and non-deployable
- Records are immutable once locked
- Any change requires an explicit governance unlock
- New decisions must be added as versioned records

These files govern system behavior but are not part of application execution.
# Governance Records

This directory contains **formal governance records** for Agile AI University systems.

These documents define:
- Locked architectural decisions
- Phase boundaries
- Scope constraints
- Institutional guarantees

They exist to preserve system integrity over time.

---

## Rules

- Files in this directory are **non-runtime** and **non-deployable**.
- Records are **immutable once locked**.
- Changes require an **explicit governance unlock**.
- New decisions must be recorded as **new, versioned documents**.
- Existing records must never be edited or replaced in place.

---

## Relationship to Code

- Governance records **inform** system behavior.
- They do **not execute**, configure, or override code.
- Application logic must comply with these records.
- If code and governance conflict, **governance prevails**.

---

## Structure


---

## Access & Visibility

- This directory is intentionally excluded from deployment targets.
- Contents may be reviewed internally or during audits.
- Public exposure requires separate, explicit approval.

---

## Change Control

Any modification to systems governed by these records must:
1. Declare the affected phase
2. Obtain an explicit governance unlock
3. Produce a new, versioned governance record

Silent changes are not permitted.

---

© Agile AI University  
Governance Authority
