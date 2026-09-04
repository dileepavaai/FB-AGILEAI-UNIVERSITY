# LAAU — Operational Scripts

This directory contains operational, governance, integrity, registry, and migration scripts
used to support the institutional credential system and related infrastructure.

These scripts are NOT part of public hosting.
They are executed manually or via controlled internal processes.

---

## 🔐 Architectural Principle

The `/scripts` directory is separated from all `/public-*` surfaces.

This ensures:

- No operational logic is exposed to public hosting
- No accidental script deployment
- Clean separation between governance layer and presentation layer
- Institutional-grade operational safety

---

# 📁 Directory Structure

scripts/
│
├── integrity/
│   Runtime validation and self-check mechanisms
│
├── migration/
│   One-time or controlled data migrations
│
├── governance/
│   Governance logic, rule enforcement, and institutional controls
│
├── registry/
│   Registry operations and credential indexing
│
├── shared/
│   Shared configuration and cross-script utilities
│
└── csv/
    Structured data imports (controlled use only)

---

# 📂 Folder Responsibilities

## 1️⃣ integrity/

Contains runtime validation logic.

Examples:
- runtime-check-registry.js
- runtime-self-check.js
- runtime-self-check-runner.js

Purpose:
- Ensure registry consistency
- Detect credential mismatches
- Validate integrity before institutional release

These scripts protect institutional credibility.

---

## 2️⃣ migration/

Contains one-time or rare migration scripts.

Example:
- backfillCredentialIds.js

Purpose:
- Upgrade legacy data
- Apply structural changes safely
- Run controlled transformations

Migration scripts must NOT be used casually.
Each migration should be documented before execution.

---

## 3️⃣ governance/

Reserved for:
- Governance enforcement logic
- Institutional rules
- Structural authority checks

This folder supports institutional discipline.

---

## 4️⃣ registry/

Reserved for:
- Registry generation
- Credential indexing
- Public verification data preparation

Registry logic must remain deterministic and auditable.

---

## 5️⃣ shared/

Shared utilities and configuration.

Example:
- institutional-config.js

Purpose:
- Centralized configuration
- Shared constants
- Environment-safe parameters

No script should hardcode institutional parameters.

---

## 6️⃣ csv/

Structured import data used for controlled operations.

CSV files should:
- Follow locked schema
- Be archived after processing
- Never contain credential IDs if governance forbids it

---

# ⚠ Execution Policy

All scripts must:

- Be run from project root
- Use service account credentials where required
- Log execution context
- Be version-controlled
- Never run automatically unless explicitly institutionalized

---

# 🔒 Institutional Safety Rules

1. No script may modify credential registry without logging.
2. No migration may run without pre-review.
3. No governance rule may be bypassed via manual edits.
4. Scripts must remain environment-aware (dev vs prod).
5. Public hosting must never depend on `/scripts`.

---

# 🧠 Philosophy

Operational scripts represent institutional authority.

They are not developer utilities.
They are governance tools.

Their structure reflects the maturity and independence
of LAAU as an academic and professional body.
