# Agile AI Ecosystem — System Context

Status: CANONICAL · GOVERNANCE LOCKED  
Last Updated: 2026-03-29  
Scope: Agile AI Foundation + Agile AI University + Agile AI Academy Ecosystem

---

# 1. Purpose

This document defines the **canonical system context** for the Agile AI ecosystem.

It establishes:

- Institutional structure
- Roles of ecosystem entities
- Digital surface architecture
- Governance boundaries
- Design authority constraints

This document serves as the **baseline context for future development, design, and governance decisions.**

---

# 2. Ecosystem Overview

The Agile AI ecosystem consists of **three complementary institutional entities**.

| Entity | Role |
|------|------|
| Agile AI Foundation | Canonical standards authority |
| Agile AI University | Academic operationalization authority |
| Agile AI Academy | Capability enablement and learning layer |

The ecosystem follows a **standards → academic → capability enablement model.**

Agile AI Foundation  
  ↓ defines standards  

Agile AI University  
  ↓ operationalizes and evaluates  

Agile AI Academy  
  ↓ enables applied capability development  

---

# 3. Agile AI Foundation

Primary Domain:  
agileai.foundation

Purpose:

The Agile AI Foundation defines the **canonical intellectual architecture of the Agile AI domain.**

Responsibilities include:

- domain definitions
- conceptual frameworks
- governance principles
- architectural standards
- thought leadership

The Foundation **does NOT provide:**

- training
- certification
- credentials
- capability assessments

Those responsibilities are intentionally separated.

---

# 4. Agile AI University

Primary Domain:  
agileai.university

Agile AI University operationalizes the standards defined by the Foundation into **structured academic capability systems.**

The University provides:

- capability architectures
- academic knowledge surfaces
- capability assessments
- professional credentials
- institutional portals
- credential verification

The University **is not positioned as:**

- a training provider
- a course marketplace
- a certification vendor
- a consulting firm

Official positioning:

> Agile AI University defines structured academic frameworks, capability standards, and professional recognition models for the Agile AI domain. It operates as an independent academic and professional body and is not positioned as a commercial training provider.

---

# 5. Agile AI Academy

Primary Domain:  
agileaiacademy.com

Purpose:

Agile AI Academy enables structured learning and applied capability development aligned to Agile AI frameworks and real-world execution.

Responsibilities include:

- applied learning pathways
- scenario-based execution
- capability development
- real-world application models

The Academy **does NOT:**

- define standards
- issue institutional credentials
- perform official capability assessments

---

# 6. Ecosystem Boundary Rule (Locked)

- Foundation defines standards (WHAT)  
- University operationalizes and evaluates (STRUCTURE + VALIDATION)  
- Academy enables application (HOW / EXECUTION)  

No layer may override or redefine the responsibilities of another layer.

---

# 7. Multi-Surface Institutional Architecture

Agile AI University operates as a **multi-surface digital institution.**

Current surfaces include:

| Surface | Purpose |
|------|------|
| agileai.university | Institutional website |
| edu.agileai.university | Knowledge surface |
| learn.agileai.university | Redirect to knowledge surface |
| portal.agileai.university | Student / executive portal |
| certs.agileai.university | Credential system |
| verify.agileai.university | Credential verification |
| assessment surface | Capability assessment engine |

Each surface operates as an **independent hosting environment.**

---

# 8. Hosting Architecture

The ecosystem uses **Firebase multi-hosting**.

Each hosting target is self-contained.

Canonical rule:

Each surface must contain its own design authority layer.

Example:

public-site/shared/design-authority/  
public-portal/shared/design-authority/  
public-certs/shared/design-authority/  

Root-level shared folders are **not runtime authoritative.**

---

# 9. Design System Architecture

The ecosystem uses a **two-layer design system model.**

### Layer 1 — Canonical Design System

File:  
site.css

Responsibilities:

- layout grid
- container system
- base typography
- header system
- footer system
- responsive behavior
- theme engine

Status:  
LOCKED

---

### Layer 2 — Visual Refinement Layer

File:  
refinement.css

Purpose:

Controlled visual improvements without modifying the design system.

Properties:

- additive
- reversible
- governance controlled

---

# 10. Design Authority Governance Rules

The refinement layer must follow strict rules.

### Allowed

- visual polish
- spacing calibration
- typography readability
- link styling
- minor UI improvements

### Not Allowed

The refinement layer must never modify:

- layout grid
- container width
- structural positioning
- theme engine logic
- header injection logic
- footer injection logic
- JavaScript behavior

---

# 11. Version Governance

All refinement layer updates must follow:

1. Full file replacement  
2. Version increment  
3. Changelog update  
4. Visual verification  

This prevents cascade drift and rule conflicts.

---

# 12. Theme Engine Rule

Dark mode styles must always use:  
:root

Never use incorrect or global overrides that affect both themes simultaneously.

---

# 13. Footer Stability Architecture

The footer uses flex stabilization.

body {
min-height: 100vh;
display: flex;
flex-direction: column;
}

main {
flex: 1;
}

This ensures the footer remains at the bottom of the viewport.

Artificial `min-height` rules must not be introduced.

---

# 14. Typography Philosophy

Typography must remain:

- academic
- institutional
- readable
- minimal

Avoid marketing-style typography or excessive styling.

---

# 15. Navigation Philosophy

Navigation must remain:

- simple
- stable
- institutional

Allowed:

- spacing calibration
- minor typography refinement

Not allowed:

- animated navigation
- complex UI menus
- marketing-style navigation patterns

---

# 16. Future Change Policy

Future improvements should be limited to:

- typography readability
- spacing calibration
- accessibility improvements
- minor visual polish

Major structural changes require **design system revision.**

---

# 17. Stability Status

Current system status:

Stable  
Governance controlled  
Institutionally aligned  

This document acts as the **canonical reference for ecosystem architecture decisions.**