# DEL release procedure

Run `Apply-LAAU-DEL-Access.ps1` from the root of the existing Windows repository on `migration/laau-primary-domain`. Use the complete extracted package, including its manifest and payload.

```powershell
& 'C:\path\to\extracted-package\Apply-LAAU-DEL-Access.ps1'
```

The default mode validates the reviewed source and package hashes, saves originals under `%TEMP%`, and stages only manifest paths. It does not commit, push, deploy, change DNS, grant learner access, or change Firestore rules.

After reviewing the staged diff, use the same script with `-Release`:

```powershell
& 'C:\path\to\extracted-package\Apply-LAAU-DEL-Access.ps1' -Release
```

## Release gates

- The existing branch, backend package/lock, Hosting target mappings, and reviewed content-tree hashes must match. Uncommitted content in either original Lab content tree stops preparation. Unexpected edits to any replaced file also stop preparation.
- The live Firestore rules must match the rules reviewed for this implementation. Reading them requires Firebase Rules read permission. The installer never publishes rules.
- Firebase Authentication must authorize `lab.laau.university`, `lab.agileai.university`, `agileai-lab.web.app`, and `agileai-lab.firebaseapp.com`. If a hostname is missing, add that hostname in Firebase Authentication → Settings → Authorized domains, then rerun. The installer does not change Authentication/OAuth configuration.
- Initially, `aau-credential-verify-00035-zaf` must serve 100% of normal traffic using the reviewed image. Any concurrent production change stops the release.
- The installer commits only approved paths, pushes the established branch, verifies the remote commit, and exports committed files. Other staged changes are not committed. Uncommitted deployment inputs stop release.
- Cloud Build extends the exact reviewed image. Its Dockerfile validates the inherited source and dependency metadata, overlays the DEL module and minimal backend integration, and runs the DEL test suite using the inherited dependencies. No `npm install`, runtime upgrade, new environment setting, or service-account change is performed.
- The candidate revision receives no normal traffic. Public smoke tests check DEL authentication, rejected cross-origin logout, and the existing health and learning-resource endpoints. Runtime configuration must remain unchanged. Only then is 100% traffic moved to the candidate; existing named revision tags are retained.
- Firebase deploys only `hosting:agileai-lab,hosting:agileai-education` from the committed export. The Lab uses its new entry directory and protected backend delivery. The old Education Lab paths redirect to the new Lab. Other Hosting targets are not deployed.

## Retry and reports

Original files and a redacted release report are written under `%TEMP%\LAAU-DEL-Release-*`. The report contains revision, build, image, commit and phase identifiers; it does not contain access tokens or environment-variable values. The resumable state is stored in the repository's actual Git directory as `laau-del-release-20260923-del-1.json`.

Rerun the same `-Release` command after a recoverable interruption. The installer verifies the saved commit and production state. An interrupted build is found by its unique Cloud Build tag and monitored; it is not submitted again. If the deployment response was lost, the exact named revision is checked before continuing. If Hosting deployment failed, the tested backend stays in place and the same committed Hosting export is deployed on retry. No automatic rollback restores the old public Lab.

If a build fails, a named candidate is missing after an ambiguous deployment, or production changed concurrently, stop and share the error plus the report's phase/build/revision identifiers. Do not manually delete state, edit individual traffic tags, or restore the public content directory to get past a release check.

## Completion checks

Public checks cover the default Lab hosts, old Lab custom host, and the default/new Education hosts. They establish the public access boundary, not a successful signed-in learner journey.

After public release checks pass, add the Firebase-provided A record for `lab.laau.university` and verify the domain's HTTPS status. Then test:

1. Signed-out access shows sign-in; direct protected lesson URLs do not expose course content.
2. An authenticated account without the selected course grant cannot open it.
3. A learner with an explicit active grant can open the assigned course, including its dependent assets.
4. That learner cannot open another course by changing the URL.
5. Sign-out removes access. Revoked/expired grants stop subsequent protected requests.
6. Existing verification and Portal learning-resource delivery still work.

Session-cookie creation also depends on the backend service account's existing Firebase Authentication permissions. Public HTTP checks cannot establish that permission or complete the Google sign-in flow; report any actual signed-in error before altering IAM. No learner access is automatically granted by this release, by sign-in, or by an existing credential.

The website changes cannot erase content previously downloaded or stored in someone's browser. Existing immutable browser caches may retain old static resources until they expire; new private responses use `no-store`.
