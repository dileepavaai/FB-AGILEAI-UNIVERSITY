# Agile AI University

# Typography

---

| Attribute      | Value               |
| -------------- | ------------------- |
| Document       | Typography          |
| Version        | 1.0                 |
| Status         | LOCKED              |
| Classification | Governance          |
| Owner          | Agile AI University |
| Applies To     | Entire Platform     |
| Last Updated   | July 2026           |

---

# Purpose

This document establishes the official typography standards for Agile AI University.

Typography is the primary mechanism for creating hierarchy, readability and institutional identity across all digital products.

Every interface shall follow this specification.

---

# Scope

This specification governs typography for:

* Public Website
* Student & Executive Portal
* Administration Portal
* Credential Operations Suite
* Certificate Generator
* Badge Generator
* Credential Registry
* Recognition Services
* Future Products

---

# Typography Philosophy

Typography communicates hierarchy before color.

Interfaces should feel:

* professional
* calm
* academic
* modern
* trustworthy

Typography should resemble respected academic institutions and executive platforms rather than marketing websites.

---

# Typography Principles

## Readability First

Text exists to be read.

Decorative typography is discouraged.

---

## Hierarchy

Visual hierarchy is created using:

* size
* weight
* spacing

Color is secondary.

---

## Consistency

The same typography always represents the same level of information.

---

## Simplicity

Limit the number of font sizes and weights.

A smaller, consistent type scale is preferred.

---

# Font Families

## Primary Font

```text
Inter
```

Fallback stack:

```text
Inter,
Segoe UI,
Roboto,
Helvetica,
Arial,
sans-serif
```

---

## Monospace Font

Used for:

* Credential IDs
* Verification Codes
* API Examples
* Code Samples

```text
Consolas,
Menlo,
Monaco,
monospace
```

---

# Font Weights

| Weight | Usage     |
| ------ | --------- |
| 300    | Rare      |
| 400    | Body Text |
| 500    | Labels    |
| 600    | Buttons   |
| 700    | Headings  |

Additional weights should be avoided.

---

# Heading Hierarchy

## H1

Purpose

Primary page title.

Example

```text
My Credentials
```

Style

* 2.75rem
* 700
* Tight spacing

---

## H2

Major page sections.

Example

```text
Credential Portfolio
```

Style

* 2rem
* 700

---

## H3

Subsections.

Style

* 1.5rem
* 700

---

## H4

Cards

Panels

Dialogs

Style

* 1.25rem
* 600

---

## H5

Supporting titles.

Style

* 1.125rem

---

## H6

Minor headings.

Style

* 1rem

---

# Body Text

Default body text.

Style

* 1rem
* 400
* 1.6 line height

---

# Small Text

Used for:

* helper text
* metadata
* captions

Style

* .875rem

---

# Caption

Used for:

* image captions
* notes
* timestamps

Style

* .75rem

---

# Labels

Used for:

* forms
* metadata
* field names

Style

* .875rem
* 600

---

# Buttons

Buttons use:

* 600 weight
* 1rem size

Button text should never be uppercase.

---

# Navigation

Navigation uses:

* 500 weight

Navigation should remain concise.

---

# Tables

Table Headers

* 600

Table Body

* 400

Numeric values should align consistently.

---

# Lists

Ordered

Use only when sequence matters.

Unordered

Use for grouped information.

Nested lists should remain shallow.

---

# Links

Links should:

* be identifiable
* remain accessible
* avoid excessive decoration

Hover state should indicate interaction.

---

# Paragraphs

Maximum reading width:

Approximately 70–80 characters.

Long paragraphs should be separated.

---

# Spacing

Typography uses consistent vertical rhythm.

Recommended spacing:

Heading → Paragraph

24px

Paragraph → Paragraph

16px

Section → Section

32–48px

---

# Alignment

Default alignment:

Left

Center alignment should be reserved for:

* Hero sections
* Empty states
* Success pages

Right alignment is used primarily for numeric values.

---

# Text Colors

Typography shall consume Design Tokens.

Never hardcode colors.

Examples:

```css
color: var(--text-primary);

color: var(--text-secondary);

color: var(--text-muted);
```

---

# Accessibility

Typography shall support:

* WCAG AA contrast
* Responsive scaling
* Zoom up to 200%
* Screen readers

Avoid:

* long uppercase paragraphs
* low contrast text
* decorative fonts

---

# Responsive Typography

Typography scales gracefully.

Desktop

Largest hierarchy.

Tablet

Moderate scaling.

Mobile

Reduced heading sizes while preserving hierarchy.

Body text remains 1rem whenever practical.

---

# Typography Scale

| Element | Size     | Weight |
| ------- | -------- | ------ |
| H1      | 2.75rem  | 700    |
| H2      | 2rem     | 700    |
| H3      | 1.5rem   | 700    |
| H4      | 1.25rem  | 600    |
| H5      | 1.125rem | 600    |
| H6      | 1rem     | 600    |
| Body    | 1rem     | 400    |
| Small   | 0.875rem | 400    |
| Caption | 0.75rem  | 400    |

---

# Typography Usage

| Component      | Typography  |
| -------------- | ----------- |
| Hero           | H1          |
| Page Header    | H1          |
| Section Header | H2          |
| Card Header    | H4          |
| Modal Title    | H4          |
| Button         | Body / 600  |
| Form Label     | Small / 600 |
| Metadata       | Small       |
| Footer         | Small       |
| Navigation     | Body / 500  |

---

# Governance Rules

1. Typography shall use approved font families only.

2. Font sizes shall follow the approved type scale.

3. Components shall consume typography design tokens.

4. Typography shall never be hardcoded.

5. Decorative fonts are prohibited.

6. Text shall remain readable at all supported viewport sizes.

7. Typography shall preserve accessibility requirements.

8. New typography styles require governance approval.

---

# Related Documents

* UI Design System
* Design Tokens
* Component Library
* Layout System
* Responsive Design
* Accessibility

---

# Governance Status

This document is the authoritative typography specification for Agile AI University.

All platform interfaces shall comply with this standard.

Any deviation requires formal governance approval.
