# LAAU Portal Storage CORS

Version: `20260922-storage-cors-1`

Adds the Portal origins needed for browser downloads from bucket `fb-agileai-university.firebasestorage.app`, project `fb-agileai-university` (`458881040066`). The browser error showed that the Storage response lacked the Portal's CORS permission.

The operation reads the live bucket configuration and preserves every existing CORS rule, origin, method, header and other property. It adds `https://admin.laau.university` with the existing legacy Admin rule's permissions, retaining the legacy Admin origin. It adds a separate rule for `https://portal.laau.university` and `https://portal-agileai-university.web.app`, allowing only `GET` and `HEAD`, exposing `Content-Type`, `Content-Length` and `Content-Disposition`, with a 3600-second cache period. It introduces no wildcard origins.

Only the bucket's CORS metadata is patched. The operation does not change IAM, Firebase Security Rules, object contents or Hosting deployments. CORS is a browser access policy; it does not grant permission to private files.

## Run

Extract this package outside the repository. Git and the Google Cloud CLI must be available, with an existing authenticated account allowed to read and update this bucket's metadata.

Keep PowerShell in `C:\Users\DILEEP\FB-AgileAI-University` on `migration/laau-primary-domain`. Adjust the extracted script path in these examples:

```powershell
Set-Location 'C:\Users\DILEEP\FB-AgileAI-University'
& 'C:\Users\DILEEP\Downloads\LAAU-Portal-Storage-CORS\Apply-LAAU-Portal-Storage-CORS.ps1'
```

The default is a read-only preview. It obtains an existing gcloud access token, reads fresh bucket metadata, checks the bucket name and project number, and saves the live configuration, repository originals and proposed CORS file in a backup folder outside Git. No repository or Storage changes are made.

To commit, push and apply the update:

```powershell
& 'C:\Users\DILEEP\Downloads\LAAU-Portal-Storage-CORS\Apply-LAAU-Portal-Storage-CORS.ps1' -Release
```

Release reads the live configuration again and commits only `cors.json` plus the operation script and README under `operations/laau-portal-storage-cors`. Other staged work remains staged. Local or staged edits to those three files stop the operation. Unrecognized committed CORS content also stops it; the installed script records a SHA-256 receipt of its candidate so a previous run can be recognized safely.

The script pushes the established branch before applying the bucket change. It rereads metadata and sends a JSON API `PATCH` containing only `cors`, conditional on the bucket's metageneration. A concurrent bucket change stops the write. Requests have a 45-second timeout, and writes are never blindly retried. The access token is not saved in Git or the backup report.

## Verify and retry

Success means the live CORS metadata matches the committed candidate. It does not prove that a browser download has completed.

Open a private browser window, sign in to the Portal, open a published badge and select **Download**. Alternatively, enable **Disable cache** in browser developer tools while they remain open, reload the page, and retry. CORS changes and cached preflight responses may take time to become effective. Confirm that the correct PNG is saved. **Open published file** remains the fallback.

Keep the printed backup folder until verified. After a failed push, a concurrent metadata change, or a timeout, rerun the same command: it reads the live rules afresh and recognizes an already-applied candidate. A timed-out PATCH may have succeeded, so do not restore an old CORS snapshot blindly. If a local Git step left changes in the three operation files, review and commit or restore those specific files from the backup before rerunning; the installer will not discard them.

References: [Cloud Storage CORS configuration](https://docs.cloud.google.com/storage/docs/using-cors) and [conditional bucket PATCH](https://docs.cloud.google.com/storage/docs/json_api/v1/buckets/patch).

## Validation

PowerShell parsing, independent code review and six isolated execution scenarios passed. Real Git was used to verify the three-file commit scope and preservation of unrelated staged and working files. Mocked cloud responses verified preservation of existing rules, the narrow Portal rule, bucket/project checks, a CORS-only conditional PATCH, safe concurrent-change and push failures, and repeat runs without another PATCH or empty commit. No production configuration was changed during package preparation. The browser Download check remains necessary after applying the update.
