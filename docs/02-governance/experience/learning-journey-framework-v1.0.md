Agile AI University
Student & Executive Portal
Learning Journey Framework v1.0

Status: GOVERNANCE LOCKED
Version: 3.1
Date: June 2026

Executive Summary

The Learning Journey Framework extends the Student & Executive Portal beyond credential consumption into a personalized academic progression experience.

The framework introduces a graph-based academic relationship model that enables the portal to present individualized learning opportunities, bridge programs, recommended capabilities, and future learning pathways.

The framework does not change the Credential Registry model, Authentication model, Authorization model, or Resolver-first architecture. Instead, it enriches the resolver output by computing a learner's academic journey from the university's program definitions and the learner's earned credentials.

Purpose

The Learning Journey Framework exists to answer a simple question for every authenticated learner:

"Based on everything I have already achieved, what should I do next?"

The framework enables the portal to present contextual recommendations without embedding business rules in the UI.

Architectural Position

The Learning Journey Framework is positioned after credential resolution and before dashboard composition.

Authentication
        │
        ▼
Authorization
        │
        ▼
Entitlement Resolution
        │
        ▼
Credential Resolution
        │
        ▼
Learning Journey Service
        │
        ▼
Dashboard Composition
        │
        ▼
Feature Modules

The Dashboard never computes academic progression.

The Dashboard consumes only the resolved Learning Journey model.

Architectural Principles
1. Graph-Based Academic Model

Academic progression is represented as a graph.

Programs are connected through academic relationships.

The university does not assume that all learners follow a single sequential pathway.

Multiple pathways may:

diverge
converge
operate in parallel

The architecture must support all three.

2. Programs are Independent

Every academic program remains an independent university offering.

Examples include:

Agile Outcome Practitioner (AOP)
Artificial Intelligence Professional Agilist (AIPA)
Agentic AI Agilist (AAIA)
Artificial Intelligence Delegator & Enabler (AIDE)
Executive AI Leadership programs

Programs are never treated as versions of one another.

3. Credentials Remain Immutable

Credentials represent academic achievements.

They never change.

The Learning Journey never modifies credentials.

The Credential Registry remains the authoritative source of academic achievements.

4. Learning Journey is Computed

Learning Journey information is derived.

It is never manually entered.

It is never permanently stored.

The Learning Journey Service computes the journey dynamically using:

learner credentials
program metadata
academic relationships
5. Resolver Owns Journey Resolution

The resolver owns all academic resolution.

The Dashboard never determines:

eligibility
recommendations
bridge opportunities
next programs
capability progression

These are resolver responsibilities.

Academic Relationship Model

Programs define academic relationships.

Relationships are directional.

Examples include:

Bridge Programs
Recommended Programs
Parallel Learning Opportunities
Executive Progression
Continuing Education
Future Specializations

Relationships are descriptive.

They never imply mandatory progression.

Learning Journey Principles

The Student Portal shall provide personalized academic guidance.

The portal shall never function as:

a marketing site
a sales portal
a promotional landing page

Recommendations must always be contextual.

Recommendations must be based on learner achievements.

Bridge Program Governance

Bridge Programs represent academic transition pathways.

Bridge Programs do not invalidate previously earned credentials.

Example

AOP Credential

↓

Bridge Course

↓

AIPA Credential

The learner permanently retains both achievements.

Bridge Programs provide additional capability recognition rather than replacing historical achievements.

Multiple Learning Path Governance

The framework explicitly supports multiple academic pathways.

Example

Learner A

AOP

↓

Bridge

↓

AIPA

Learner B

AOP

↓

AIPA

Learner C

AIPA

All three learners may legitimately hold the AIPA credential.

The Learning Journey Framework shall never assume how a capability was obtained.

Only earned credentials determine the learner's portfolio.

Learning Journey Service

A dedicated Learning Journey Service shall be introduced.

Responsibilities include:

Reading learner credentials
Reading program metadata
Resolving academic relationships
Building personalized learning journeys
Returning recommendations
Returning bridge opportunities
Returning future learning pathways

The service shall remain independent of:

Authentication
Authorization
Dashboard Rendering
UI Components
Dashboard Governance

The Dashboard consumes the resolved Learning Journey model.

The Dashboard may present:

Recommended Programs
Bridge Opportunities
Learning Path Visualizations
Continuing Education Recommendations
Executive Learning Recommendations

The Dashboard shall never compute these values.

Credential Governance

Credential Cards remain read-only.

Credential Cards continue to display earned university achievements.

Learning Journey recommendations may reference credentials but shall never modify credential data.

Academic Recommendation Governance

Recommendations are personalized.

Recommendations shall consider:

completed programs
earned credentials
academic relationships
university governance

Recommendations shall never be hardcoded within UI components.

Component Governance

Learning Journey components shall follow the existing Portal Component Architecture.

Future reusable components include:

Learning Journey Card
Capability Journey Card
Bridge Opportunity Card
Recommended Learning Card
Executive Progression Card

Each component shall remain independently reusable.

CSS Governance

Learning Journey styling shall follow existing Portal CSS Architecture.

No page-specific styling shall duplicate shared component behaviour.

Future CSS ownership includes:

dashboard-learning-journey.css

dashboard-capability.css

dashboard-recommendations.css

Each stylesheet shall own only its assigned responsibility.

JavaScript Governance

JavaScript owns:

journey rendering
state management
resolver integration
event handling

JavaScript shall never own academic rules.

Academic rules belong to:

Program Metadata
Learning Journey Service
Resolver
Future Extensibility

The Learning Journey Framework is intentionally extensible.

Future capabilities include:

AI Learning Recommendations
Continuing Education Credits
Executive Learning Paths
Specialization Recommendations
Learning Milestones
Career Path Suggestions
Competency Maps
Digital Wallet Recommendations
Certification Renewal Guidance

These capabilities shall integrate through the Learning Journey Service without requiring Dashboard redesign.

Non-Goals

The Learning Journey Framework shall not become:

a Learning Management System (LMS)
a Course Registration System
a Curriculum Authoring Tool
a Reporting Engine
a Marketing Platform

Operational systems remain separate.

The Student Portal remains a learner experience platform.

Governance Status
Area	Status
Learning Journey Framework	✅ LOCKED
Graph-Based Academic Model	✅ LOCKED
Academic Relationship Model	✅ LOCKED
Bridge Program Governance	✅ LOCKED
Multiple Learning Path Governance	✅ LOCKED
Resolver-Owned Journey Resolution	✅ LOCKED
Dashboard Consumption Model	✅ LOCKED
Credential Integrity	✅ LOCKED
Component Architecture Compliance	✅ LOCKED
CSS Architecture Compliance	✅ LOCKED
JavaScript Responsibility Model	✅ LOCKED
Overall Platform Position

The Learning Journey Framework establishes the Student & Executive Portal as a personalized academic progression platform rather than a static credential viewer. It preserves the integrity of the existing resolver-first architecture while introducing a flexible graph-based model capable of supporting bridge programs, parallel learning paths, executive education, specializations, and future AI-driven recommendations. This governance ensures that future growth of the Agile AI University ecosystem can occur through metadata and services without requiring changes to the core portal architecture.