# Agile AI University — Runtime & SDK Freeze

STATUS: LOCKED · PRODUCTION  
CHANGE AUTHORITY: NONE (unless explicitly unlocked)

## Backend (Firebase Functions)

- Node.js: 18
- firebase-functions: ^5.1.0
- firebase-admin: ^12.0.0
- Region: asia-south1

## Tooling

- Firebase CLI: >= 13.0.0
- npm: system-managed

## Frontend (Portal / Assessment)

- Firebase Web SDK: v8 / v9-compat
- Auth: Email-link only
- Firestore: Read-only
- No modular migration permitted

## Governance Rules

- No version upgrades without phase unlock
- No breaking SDK changes in production
- Runtime drift is considered a defect
