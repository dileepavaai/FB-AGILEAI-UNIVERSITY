# CSV Issuance Files — Agile AI University

This folder contains **CSV files used for credential issuance** via the
Agile AI University admin import pipeline.

These files are **operational artifacts**, not runtime assets.

They are intentionally kept **outside production code paths** and
should be treated as **institutional records of issuance events**.

---

## 📁 Folder Purpose

`scripts/csv/` is used for:

- Test credential issuance
- Controlled batch imports
- Reproducible admin operations
- Audit and verification support

It must **never** be bundled into:
- Firebase Functions
- Public hosting folders
- Client-side builds

---

## 🧾 CSV FORMAT (LOCKED)

All CSV files must follow the locked contract:

Rules:
- Do NOT add extra columns
- Do NOT include `credential_id`
- Do NOT include `validity`
- Do NOT change header names
- One row = one credential issuance

Credential semantics (title, validity, meaning) are governed by the
**Credential Registry**, not by CSV files.

---

## 🏷️ NAMING CONVENTIONS (MANDATORY)

### File naming format


Examples:
- `aaia-issuance-test.csv`
- `aipa-issuance-test.csv`
- `aipa-issuance-batch-jan-2026.csv`

Rules:
- Use lowercase
- Use hyphens (`-`)
- One credential type per file
- One issuance purpose per file

---

## ⚠️ DO NOT RE-RUN — TEST CSVs

Files containing `-test-` in the name are **ONE-TIME USE ONLY**.

Re-running these files will:
- Attempt duplicate issuance
- Create conflicting records
- Violate institutional integrity

Examples of **DO NOT RE-RUN** files:
- `aaia-issuance-test.csv`
- `aipa-issuance-test.csv`

If re-testing is required:
- Create a **new CSV file**
- Use a **new test email**
- Never reuse the same test CSV

---

## 🔒 GOVERNANCE NOTES

- CSV files represent **issuance intent**, not credential meaning
- The Credential Registry is the single source of truth
- Firestore records created from CSVs are authoritative
- Manual Firestore edits should be avoided except for corrections

This structure is intentional and future-safe.


Examples:
- `aaia-issuance-test.csv`
- `aipa-issuance-test.csv`
- `aipa-issuance-batch-jan-2026.csv`

Rules:
- Use lowercase
- Use hyphens (`-`)
- One credential type per file
- One issuance purpose per file

---

## ⚠️ DO NOT RE-RUN — TEST CSVs

Files containing `-test-` in the name are **ONE-TIME USE ONLY**.

Re-running these files will:
- Attempt duplicate issuance
- Create conflicting records
- Violate institutional integrity

Examples of **DO NOT RE-RUN** files:
- `aaia-issuance-test.csv`
- `aipa-issuance-test.csv`

If re-testing is required:
- Create a **new CSV file**
- Use a **new test email**
- Never reuse the same test CSV

---

## 🔒 GOVERNANCE NOTES

- CSV files represent **issuance intent**, not credential meaning
- The Credential Registry is the single source of truth
- Firestore records created from CSVs are authoritative
- Manual Firestore edits should be avoided except for corrections

This structure is intentional and future-safe.
