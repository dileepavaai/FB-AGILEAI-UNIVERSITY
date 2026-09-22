# LAAU trainer identity maintenance

Version: `20260922-trainer-identity-1`.

This user-authorized maintenance operation changes the existing trainer's logical ID from `TRN-AAU-X7K4` to `TRN-LAAU-X7K4` and corrects the same person's identifier references in four existing batches. It preserves each batch's actual trainer assignment, physical ID, status, programme binding and issuance history. It is not an unlock or a reassignment.

| Record | Permitted change |
| --- | --- |
| `trainerRegistry/rQpJj2UXbfepcsD6Skmo` | `trainerId` becomes `TRN-LAAU-X7K4`; `legacy_trainer_id` records the old ID |
| `batches/AOP_V1_2025` | Trainer ID reference; remains `locked` |
| `batches/J8SMWdyGrMXlUgndQKTQ` | Trainer ID reference; remains `draft` |
| `batches/UVTnmWvqnnzHnIv4Codt` | Trainer ID reference; remains `draft` |
| `batches/zJepvF0hpqbIo6kzIKje` | Trainer ID reference; remains `draft` |

Matching `trainer_id` aliases are updated only if already present and consistent. Conflicting aliases or additional linked records stop the operation. The credential `credentials/OHhS6Dd74UqEZFL7xUkW` (`LAAU-KO9JK02Z`) is read to verify its existing AOP batch binding and is never written.

Run `Migrate-LAAU-Trainer-Identity.ps1` without switches for a read-only check. `-Apply` uses the existing authorized gcloud account for project `fb-agileai-university`, reads the records in one transaction, saves full originals outside the repository, then submits exactly five masked updates with fresh update-time preconditions. It verifies all retained fields, creation timestamps and the unchanged credential afterward. It never modifies IAM, Firestore rules or trainer accreditation.

An already completed migration returns `already-migrated` without data writes. If a commit reply is lost, the result is reported as uncertain; retry inspects current state first. Full backups and reports belong in the printed local temporary folder, not Git or Hosting. No token is included in them. No automatic reverse migration is performed.

The old ID alias records historical identity; it does not add a general alias resolver to application code. Current batches move to the new ID in the same atomic commit. Close other trainer/batch edit screens while running the operation, then refresh Admin before making further changes. The package does not rewrite published certificates: preview and republish the affected trainer certificate afterward.
