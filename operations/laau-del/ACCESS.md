# Explicit DEL access

The access tool runs through the signed-in Google Cloud operator's IAM permissions. It never uses a user's profile role to authorize changes and never grants access because a credential, payment or learning-resource assignment exists. The operator needs Firebase Authentication user lookup and Firestore read/write permissions in `fb-agileai-university`. Do not broaden learner Firestore rules to run this tool.

Choose an existing Firebase account, a published course ID from `aau-backend/del/catalog.json`, and the precise UTC expiry you intend. The account must be enabled with a verified email before an active grant can be assigned. No new Firebase account is created. No learner is granted access by installing this package.

Run from your repository in PowerShell. Replace both placeholder values first:

```powershell
$learnerEmail = 'REPLACE_WITH_EXISTING_ACCOUNT_EMAIL'
$accessExpiresUtc = 'REPLACE_WITH_UTC_EXPIRY'

& '.\operations\laau-del\Set-LAAU-DEL-Access.ps1' -Email $learnerEmail -CourseId 'DEL-PILOT' -ExpiresAt $accessExpiresUtc
```

Use an expiry such as `2026-10-01T18:30:00Z` only if that is the actual intended access end time; the tool supplies no default lifetime. The command above makes a read-only cloud plan. It prints the exact user UID and course, and saves a report plus the original grant in your temporary directory. Review the output, then run the same command with `-Apply`:

```powershell
& '.\operations\laau-del\Set-LAAU-DEL-Access.ps1' -Email $learnerEmail -CourseId 'DEL-PILOT' -ExpiresAt $accessExpiresUtc -Apply
```

`DEL-PILOT` is the initial private review workspace. It is not automatically assigned to AOP, AIPA or another programme. Granting this workspace does not enrol the user in any programme or award a credential. Only publish further course IDs after their content and access scope have been reviewed.

For a trainer or LTO representative, add `-Role trainer` or `-Role lto_admin` and the existing active organization's `-OrganizationId`. These remain grants to one named account for one course. They provide access to course content; neither role provides organization-wide access, learner administration, cohort membership or authority to grant access to others. The tool validates the active organization record, but it does not create or change that record.

To revoke one course, inspect the plan and then append `-Apply`:

```powershell
& '.\operations\laau-del\Set-LAAU-DEL-Access.ps1' -Email $learnerEmail -CourseId 'DEL-PILOT' -Revoke
& '.\operations\laau-del\Set-LAAU-DEL-Access.ps1' -Email $learnerEmail -CourseId 'DEL-PILOT' -Revoke -Apply
```

Revocation preserves the stored role, organization, expiry and unrelated metadata. It is permitted after the course is removed from the catalog and for a disabled or unverified existing account. An absent or already revoked grant produces no write.

Each change affects only the deterministic `del_access` document for the user's Firebase UID and course. Creation requires that the document is still absent; updates require the exact preflight `updateTime`. A concurrent edit stops the operation. One masked commit preserves unrelated fields; server timestamps record creation/update. The tool records the gcloud operator in `assignedBy`, then reads back and verifies the change. It does not deploy code or change credentials, payments, enrolments, user accounts, other grants or security rules.

If the commit or subsequent verification fails, the report will say that the outcome requires review. A lost response may mean the commit already succeeded. Run the same command **without `-Apply`** to inspect the current grant, compare it to the saved report, and resolve the discrepancy before attempting another change. Do not assume a failed response rolled back the grant. Treat the local report as account metadata; it contains no OAuth token.

Use direct signed-in operator credentials. The tool refuses configured service-account impersonation so the recorded operator matches the selected account. It never prints an access token. It supports PowerShell 5.1 syntax; offline behavior tests run on PowerShell 7.4. JSON parsing preserves Firestore timestamp precision instead of converting preconditions to local dates. Windows execution and live IAM permissions still require validation in your environment.

After a verified grant, sign in as that account and check that the assigned course opens. Check a different authenticated account without a grant cannot open the course or its direct lesson URLs. Revocation and expiry must deny subsequent protected requests. A logged-in account alone must not receive DEL content.
