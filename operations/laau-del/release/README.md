# DEL content integrity repair — 20260924-del-content-1

The first authenticated pilot request failed because the Windows build-source
archive contained CRLF text, while `del/manifest.json` describes the intended
LF bytes. For `pilot/index.html`, the uploaded SHA256 was
`03014db4014821efc7a13d16a99bd547475561b33fee6dc6cd06ca5f561e42fb`;
the manifest requires
`eb9deba6839ebe987d494353e0a6ba6d46b6df9ec268bb94d94f545815fa07c5`.
The downloaded immutable source generation confirmed that converting only its
six CRLF line endings to LF produces the expected hash.

## Corrected release

Use the separate `LAAU-DEL-Content-Integrity-Fix.zip` and its
`Apply-LAAU-DEL-Content-Fix.ps1` from the repository root. Default mode prepares
and stages the five reviewed operation files. `-Release` also commits those
paths, pushes the established migration branch, builds, tests a candidate with
no normal traffic, and promotes the tested revision. Rerun the same package to
resume an interrupted release; its state is separate from the original DEL
installation. Do not rerun the original protected-access installer over this
repair.

The release exports committed files using per-command Git settings:

```powershell
git -c core.autocrlf=false -c core.eol=lf archive --format=zip --output=SOURCE.zip COMMIT -- aau-backend/index.js aau-backend/del operations/laau-del/release
```

Those settings do not change the user's Git configuration. After extraction,
the release verifies every manifest-listed protected file against its raw
SHA256 before uploading. It also verifies exported source bytes against the
committed Git blobs. An attribute/filter that changes archive bytes causes a
stop instead of silent acceptance.

The Dockerfile requires `REVIEWED_BASE_IMAGE`. The repair tool supplies the
immutable prior DEL image, resolved from the reviewed successful Cloud Build
and checked against the current service. The build retains the existing
dependencies and buildpack launcher, verifies the inherited source, copies the
corrected export, then runs the same raw-byte verifier and existing router
tests inside the container. The verifier is a development tool, not a public
route and not an authentication bypass.

For an already exported build directory, its integrity can be checked with:

```powershell
node .\operations\laau-del\release\verify-private-content.cjs .\aau-backend\del
```

A normal Windows working tree may contain CRLF; that command deliberately
checks exact bytes and can fail there. Run it on the canonical build export.
Do not replace the manifest hashes with hashes of accidentally converted files,
remove the runtime integrity guard, or deploy private content with Hosting.

## Scope and validation

The repair does not modify the DEL router, content manifest, curriculum,
authentication settings, Firestore rules, IAM, Hosting configuration or learner
grants. It also saves the already tested operator-script quota-project header
and safe error reporting in Git. That script still requires `-Apply` to change
one access grant.

Public smoke checks verify unauthenticated denial and existing backend health.
They do not prove a learner can sign in or open an assigned course. After the
release, sign in to `https://lab.laau.university/` with the permitted test account,
open DEL-PILOT and a learning activity, then verify denial after sign-out. Test
an unassigned account and revoked access separately before declaring the pilot
access workflow fully validated.

If a live check fails, inspect the reported revision and saved release report.
The tool preserves the prior revision and pre-existing verification tags; it
does not delete revisions or automatically relax access checks.
