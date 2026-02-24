
# AgileAI Learn Surface + Public Surface
## System Context v1.0 (LOCKED)

### Strategic Positioning
- Independent academic & professional body
- Not a training marketplace
- Not a certification mill
- Learning Surface = Public intellectual layer
- Portal = Controlled access layer

---

## Architectural Model

### Hosting
- GitHub Pages
- Static architecture
- Root: /docs
- Domain: learn.agileai.university

### Injection Model
- header.js injects header
- footer.js injects footer
- Idempotent injection
- No hardcoded header/footer in pages

---

## Header System Rules
- Shrink threshold: 80px
- Hide threshold: 120px downward scroll
- Class based: .scrolled, .nav-hidden
- Motion tokens defined in CSS
- Accessibility preserved

---

## CSS System
- Single authoritative .site-header definition
- No duplicate transitions
- Deterministic layout
- No transform hacks

---

## Footer System
- Institutional tone
- No marketing CTA
- Governance aligned

---

## Theme System
- light / dark / system
- Uses data-theme on <html>
- LocalStorage persistence
- No layout reflow

---

## Compatibility Contract
JS and CSS class synchronization required:
- .scrolled
- .nav-hidden
- .dropdown
- .dropdown-arrow
- .open

---

## Governance Rules
- No trend chasing
- No animation experiments in production
- Full file replacements only for core files
- Accessibility cannot be removed

---

## Constraints
- Static only
- No frameworks
- No build tools
- Vanilla JS only

---

Status: Production Stable • Deterministic • Institutional Grade
