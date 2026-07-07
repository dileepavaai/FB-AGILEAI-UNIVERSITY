# ADR-005 — Credential Workspace and Asset Consumption Architecture

| Attribute | Value |
|-----------|-------|
| Status | Accepted |
| Date | 2026-07-07 |
| Owner | Agile AI University |
| Scope | Student Portal, Credential Operations, Credential Registry |
| Classification | Architecture Decision Record |

---

# Context

Agile AI University credentials are governed academic and professional assets.

During Sprint 2E, the Student Portal introduced a Credential Detail Overlay and Credential Asset Preview capability.

The first implementation used a nested overlay model:

```text
Dashboard
→ Credential Detail Overlay
→ Asset Preview Overlay