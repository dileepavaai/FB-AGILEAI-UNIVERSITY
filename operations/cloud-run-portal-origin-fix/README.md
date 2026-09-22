# LAAU portal origin repair

This repair adds one allowed browser origin, `https://portal.laau.university`, to the deployed entitlement backend. All three original origins remain allowed. Firebase token validation, credential queries, credential eligibility and response data remain unchanged.

## Why this repair is needed

The new portal and old portal were serving identical relevant client files. The entitlement backend's preflight response allowed the old portal origin but omitted permission for the new one. The supplied deployed `index.js` confirms the missing origin. The portal's error handling can present an empty credential list when this request fails; the CORS evidence does not establish that learner records were deleted.

The repository's existing `cloudrun-portal/deploy.sh` targets `aaiu-cloudrun-backend`. The service that needs this repair is **cloud-run-portal**. This package uses explicit service, project and region arguments throughout.

## Deployment scope

- Project: `fb-agileai-university`
- Region: `asia-south1`
- Service: `cloud-run-portal`
- Reviewed baseline revision: `cloud-run-portal-00006-tjt`
- Baseline image digest: `sha256:83a36228c8773ae022a1aec12803bf0a387e033c1f4997ed7d0b13beb777a7fb`
- Build provenance and normalized source hashes: `provenance.json`

The Dockerfile starts from the exact deployed image, checks the original source hash, replaces `index.js`, and runs local HTTP checks in an intermediate build stage. The final image inherits the original image's runtime settings and installed dependencies and replaces only `/app/index.js`. It does not reinstall packages or use the original mutable Node base image.

## Run from Windows PowerShell

Extract the complete package outside the repository. Keep PowerShell in `C:\Users\DILEEP\FB-AgileAI-University` on `migration/laau-primary-domain`.

Run the extracted `Invoke-LAAU-Portal-Origin-Fix.ps1` with its full path. Without arguments, it prepares and stages the isolated repair directory only.

To complete commit, push, build, candidate checks and release, run the same script with **`-Release`**. This requests a Cloud Build and a Cloud Run deployment, using your existing authenticated gcloud account. It requires the existing permissions to read/deploy the service and build/push images; if access is denied, share the error rather than changing IAM blindly. Normal Cloud Build, Artifact Registry and Cloud Run usage billing applies.

The script:

1. Checks the repository, branch, supplied source hash and (for release) active service baseline.
2. Copies the repair into `operations/cloud-run-portal-origin-fix`, stages and commits only its files, then pushes the established branch. Other staged paths are not included in that commit. As with any branch push, earlier local commits on that branch are also pushed.
3. Builds from an exported committed snapshot. The upload includes only the Dockerfile, replacement index, smoke test and ignore files.
4. Verifies that the service still matches the baseline, then creates a uniquely named candidate with no normal traffic and a temporary test URL.
5. Compares effective revision runtime configuration, tests old/new portal origins and the missing-token response, then explicitly assigns 100% traffic to the tested candidate.
6. Repeats HTTP checks against the portal's configured backend URL and the service URL. A failure after promotion triggers a rollback attempt to the explicit baseline revision. A concurrent deployment prevents automatic overwrite of another revision's traffic.
7. Removes only its temporary test tag and writes a release report in a new `LAAU-Origin-Release-*` temporary directory. The report contains release identifiers, not authentication credentials.

No IAM, ingress, secret, environment, service-account or resource flags are supplied. Learner data is not read or changed by the smoke checks. No identity reconciliation POST is performed by this package.

If the baseline/configuration guard fails, stop and share the error. Do not bypass it or immediately rerun deployment: a prior attempt may already have created a candidate or completed the repair. The prepare-only action can be repeated when its files are unchanged.

## Confirm the learner result

After `DEPLOYED_AND_HTTP_CHECKED`, open:

https://portal.laau.university/credentials/my-credentials.html

Sign in with the existing `test.trial.01` Google account and refresh the page. Confirm that the existing AOP credential appears and opens. The automated checks establish origin permission and the unauthenticated token requirement; they cannot confirm the contents of an authenticated learner account.

If the credential is still missing, share the failed request's HTTP status and browser console error, with tokens removed. Do not recreate the credential.

## Traffic and rollback

The release intentionally pins normal traffic to the tested revision. Future deployments require an explicit traffic promotion. The temporary tag is removed after the attempt, and the baseline revision remains available.

To restore the reviewed baseline if a learner regression appears after release, use this from your authenticated PowerShell:

```powershell
gcloud run services update-traffic cloud-run-portal --to-revisions=cloud-run-portal-00006-tjt=100 --project=fb-agileai-university --region=asia-south1
```

Only use that rollback for this release while it is still the relevant baseline; do not overwrite a subsequent deployment. The repair image depends on the pinned base image and is a focused migration repair, not a replacement for maintaining the service's long-term source/build process.

## Validation and limitations

The patched JavaScript has passed syntax and local runtime checks using the supplied dependency lockfile: all four allowed origins pass; an unapproved origin receives no CORS permission; all four allowed origins retain HTTP 401 with `NO_TOKEN` when no token is supplied. An exact text comparison confirms one added origin is the entire application-source change.

PowerShell 7.4.6 parsed the release script successfully. Its prepare-only mode was executed in an isolated Linux test repository and preserved an unrelated staged file. Windows execution and the authenticated release path have not been executed in the preparation environment.

Docker and authenticated gcloud are unavailable in the preparation environment. The actual pinned-image build and live checks therefore run on your account when you execute `-Release`; nothing has been deployed by preparing this package. No credential-visibility success is claimed before the signed-in learner check.

CLI references:
- https://docs.cloud.google.com/sdk/gcloud/reference/builds/submit
- https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy
- https://docs.cloud.google.com/sdk/gcloud/reference/run/services/update-traffic
- https://docs.docker.com/reference/dockerfile/
