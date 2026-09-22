# LAAU Academy organisation identity migration

This operation moves the Academy organisation from `trainingOrganizations/ORG-AAU-X7K4P2MN` to `trainingOrganizations/ORG-LAAU-X7K4P2MN`, uses the new logical ID and LAAU Academy name, and updates the confirmed linked trainer reference. It preserves all other organisation metadata and retains the old ID in `legacy_organization_id` for supported historical lookups.

Run `Migrate-LAAU-Academy-Organisation.ps1` without switches for a read-only plan. `-Apply` first verifies the deployed Admin compatibility files against the sibling manifest, then backs up and migrates the records together using Firestore transaction protections. Use the complete version 2 release package to deploy compatibility before applying the database migration.

The script is scoped to project `fb-agileai-university` and trainer document `rQpJj2UXbfepcsD6Skmo`. It refuses unexpected trainers, duplicate identities, conflicting destination data and detected subcollections. It uses the existing gcloud identity and writes backup/report files only to a unique local temporary folder. Credentials, access tokens and runtime backup records must not be committed here.

On retry, an already migrated state is verified without rewriting it. If an error or uncertain commit result occurs, retain the reported backup folder and inspect the actual state before recovery. Do not deploy old code as an automatic rollback after a database migration.

The new document receives new server-managed creation/update timestamps; original metadata is backed up. Subcollection enumeration is not transactional. Both organisation paths are checked before commit, and descendants are never recursively deleted. Avoid concurrent organisation or subcollection edits while the operation runs.

The live compatibility check uses the trainer-certificate directory URL for its index page and verifies the original index.html content hash. This avoids a query-only index.html redirect in PowerShell; the branding version and database write plan are unchanged.
