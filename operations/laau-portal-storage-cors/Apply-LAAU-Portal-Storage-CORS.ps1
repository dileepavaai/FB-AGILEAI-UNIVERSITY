#Requires -Version 5.1
[CmdletBinding()]
param([switch]$Release)
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
Set-StrictMode -Version Latest
$version = '20260922-storage-cors-1'
$project = 'fb-agileai-university'
$projectNumber = '458881040066'
$bucketName = 'fb-agileai-university.firebasestorage.app'
$branchName = 'migration/laau-primary-domain'
$operation = 'operations/laau-portal-storage-cors'
$scriptName = 'Apply-LAAU-Portal-Storage-CORS.ps1'
$paths = @('cors.json', "$operation/$scriptName", "$operation/README.md")
$utf8 = [Text.UTF8Encoding]::new($false, $true)
$receiptPattern = '(?m)^# Installed-CORS-SHA256: ([0-9a-f]{64})\r?\n?'

function Property($Object, [string]$Name) {
    if ($null -eq $Object) { return $null }
    $p = $Object.PSObject.Properties[$Name]
    if ($null -ne $p) { return $p.Value }
}
function Json($Value) { return ConvertTo-Json -InputObject $Value -Depth 100 }
function Canonical($Value) {
    if ($null -eq $Value) { return 'null' }
    if ($Value -is [string] -or $Value -is [ValueType]) { return ConvertTo-Json -InputObject $Value -Compress }
    if ($Value -is [Array]) {
        $items = @($Value | ForEach-Object { Canonical $_ })
        return '[' + ($items -join ',') + ']'
    }
    $pairs = @()
    if ($Value -is [Collections.IDictionary]) {
        foreach ($key in @($Value.Keys | Sort-Object)) { $pairs += (Canonical ([string]$key)) + ':' + (Canonical $Value[$key]) }
    } else {
        foreach ($p in @($Value.PSObject.Properties | Sort-Object Name)) { $pairs += (Canonical $p.Name) + ':' + (Canonical $p.Value) }
    }
    return '{' + ($pairs -join ',') + '}'
}
function CorsHash($Value) {
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash($utf8.GetBytes((Canonical $Value))))).Replace('-', '').ToLowerInvariant() }
    finally { $sha.Dispose() }
}
function ReadText([string]$Path) {
    return [IO.File]::ReadAllText($Path, $utf8).TrimStart([char]0xFEFF).Replace("`r`n", "`n")
}
function ScriptBase([string]$Text) { return ([regex]::Replace($Text, $receiptPattern, '')).TrimEnd() + "`n" }
function NoLinks([string]$Root, [string]$Relative) {
    $path = $Root
    foreach ($part in $Relative.Split('/')) {
        $path = Join-Path $path $part
        if ((Test-Path -LiteralPath $path) -and ((Get-Item -LiteralPath $path -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) {
            throw "Linked paths are not supported: $path"
        }
    }
}
function AssertClean {
    $status = @(git status --porcelain --untracked-files=all -- @paths)
    if ($LASTEXITCODE -ne 0 -or $status.Count -gt 0) { throw 'cors.json or an operation file has local/staged changes. Review them before retrying; nothing will be overwritten.' }
}
function BucketRequest([string]$Method, [string]$Metageneration = '', $Cors = $null) {
    $query = '?fields=name,projectNumber,metageneration,cors'
    if ($Method -ceq 'Patch') { $query += '&ifMetagenerationMatch=' + $Metageneration }
    $request = @{ Uri = "https://storage.googleapis.com/storage/v1/b/$bucketName$query"; Method = $Method; Headers = @{ Authorization = "Bearer $token" }; TimeoutSec = 45 }
    if ($Method -ceq 'Patch') {
        $request.ContentType = 'application/json; charset=utf-8'
        $request.Body = $utf8.GetBytes((Json ([ordered]@{ cors = @($Cors) })))
    }
    try { return Invoke-RestMethod @request }
    catch {
        $status = Property (Property $_.Exception 'Response') 'StatusCode'
        throw "Storage $Method failed (HTTP $status). No automatic write retry was attempted. Rerun this script to read fresh metadata; a timed-out PATCH may already have succeeded."
    }
}
function AssertBucket($Value) {
    if ((Property $Value 'name') -cne $bucketName -or [string](Property $Value 'projectNumber') -cne $projectNumber -or
        [string](Property $Value 'metageneration') -cnotmatch '^[1-9][0-9]*$') { throw 'Unexpected bucket identity, project number or metageneration. Storage update stopped.' }
}
function CorsRules($Metadata) { return ,@(Property $Metadata 'cors' | Where-Object { $null -ne $_ }) }
function Candidate($Rules) {
    $result = @($Rules)
    $oldAdmin = 'https://admin.agileai.university'
    $newAdmin = 'https://admin.laau.university'
    $sources = @($Rules | Where-Object { @(Property $_ 'origin') -ccontains $oldAdmin })
    if ($sources.Count -eq 0 -and @($Rules | Where-Object { @(Property $_ 'origin') -ccontains $newAdmin }).Count -eq 0) {
        throw 'No existing Admin CORS rule was found to preserve. Review the live configuration before proceeding.'
    }
    foreach ($source in $sources) {
        $clone = (Json $source) | ConvertFrom-Json
        $clone.origin = @($newAdmin)
        $equivalent = @($result | Where-Object {
            if (@(Property $_ 'origin') -cnotcontains $newAdmin) { return $false }
            $comparison = (Json $_) | ConvertFrom-Json
            $comparison.origin = @($newAdmin)
            return (Canonical $comparison) -ceq (Canonical $clone)
        })
        if ($equivalent.Count -eq 0) { $result += $clone }
    }
    $portal = [ordered]@{
        origin = @('https://portal.laau.university', 'https://portal-agileai-university.web.app')
        method = @('GET', 'HEAD'); responseHeader = @('Content-Type', 'Content-Length', 'Content-Disposition'); maxAgeSeconds = 3600
    }
    if (@($result | Where-Object { (Canonical $_) -ceq (Canonical $portal) }).Count -eq 0) { $result += [pscustomobject]$portal }
    return ,$result
}

Get-Command git -CommandType Application -ErrorAction Stop | Out-Null
Get-Command gcloud -ErrorAction Stop | Out-Null
$rootResult = @(git rev-parse --show-toplevel)
if ($LASTEXITCODE -ne 0 -or $rootResult.Count -ne 1) { throw 'Run from the existing repository root.' }
$repoRoot = [IO.Path]::GetFullPath($rootResult[0]).TrimEnd([char[]]'\/')
if (-not [string]::Equals($repoRoot, [IO.Path]::GetFullPath((Get-Location).ProviderPath).TrimEnd([char[]]'\/'), [StringComparison]::OrdinalIgnoreCase)) { throw 'Keep PowerShell in the repository root.' }
$branch = git branch --show-current
if ($LASTEXITCODE -ne 0 -or $branch -cne $branchName) { throw "Expected branch $branchName." }
$remote = git remote get-url origin
if ($LASTEXITCODE -ne 0 -or $remote -notmatch '^(https://github\.com/|git@github\.com:|ssh://git@github\.com/)dileepavaai/FB-AGILEAI-UNIVERSITY(\.git)?$') { throw 'Unexpected origin repository.' }
$conflicts = @(git diff --name-only --diff-filter=U)
if ($LASTEXITCODE -ne 0 -or $conflicts.Count -gt 0) { throw 'Resolve existing merge conflicts first.' }
foreach ($path in $paths) { NoLinks $repoRoot $path }
AssertClean
git ls-files --error-unmatch -- cors.json | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Expected a committed cors.json.' }
NoLinks $PSScriptRoot $scriptName
NoLinks $PSScriptRoot 'README.md'
$sourceScript = ScriptBase (ReadText (Join-Path $PSScriptRoot $scriptName))
$sourceReadme = ReadText (Join-Path $PSScriptRoot 'README.md')
$repoCors = @(ConvertFrom-Json -InputObject (ReadText (Join-Path $repoRoot 'cors.json')))
$reviewedCors = @(@'
[{"origin":["https://admin.laau.university","https://admin-agileai-university.web.app"],"method":["GET","HEAD","POST","PUT","OPTIONS"],"responseHeader":["Content-Type","Authorization","x-goog-resumable"],"maxAgeSeconds":3600}]
'@ | ConvertFrom-Json)
$recognized = (Canonical $repoCors) -ceq (Canonical $reviewedCors)
$installedPath = Join-Path $repoRoot "$operation/$scriptName"
if (Test-Path -LiteralPath $installedPath) {
    $installed = ReadText $installedPath
    $receipts = [regex]::Matches($installed, $receiptPattern)
    if ((ScriptBase $installed) -cne $sourceScript -or $receipts.Count -ne 1) { throw 'The installed operation script is not a recognized copy of this package.' }
    if ($receipts[0].Groups[1].Value -ceq (CorsHash $repoCors)) { $recognized = $true }
}
$installedReadme = Join-Path $repoRoot "$operation/README.md"
if ((Test-Path -LiteralPath $installedReadme) -and (ReadText $installedReadme) -cne $sourceReadme) { throw 'The installed operation README has unreviewed content.' }
if (-not $recognized) { throw 'The committed cors.json is neither the reviewed Admin configuration nor this operation latest recorded candidate. Review it before proceeding.' }
$tokenOutput = @(gcloud auth print-access-token --project $project --quiet)
if ($LASTEXITCODE -ne 0 -or $tokenOutput.Count -ne 1 -or [string]::IsNullOrWhiteSpace($tokenOutput[0])) { throw 'Unable to obtain the existing gcloud access token.' }
$token = $tokenOutput[0].Trim()
if ($token -match '\s') { throw 'Unexpected access-token output.' }
$before = BucketRequest 'Get'
AssertBucket $before
$beforeRules = CorsRules $before
$candidate = Candidate $beforeRules
$candidateHash = CorsHash $candidate
$backup = Join-Path ([IO.Path]::GetTempPath()) ('LAAU-Portal-Storage-CORS-' + [guid]::NewGuid().ToString('N'))
[void][IO.Directory]::CreateDirectory($backup)
[IO.File]::WriteAllText((Join-Path $backup 'bucket.before.json'), (Json $before), $utf8)
[IO.File]::WriteAllText((Join-Path $backup 'cors.candidate.json'), ((Json $candidate) + "`n"), $utf8)
foreach ($path in $paths) {
    $source = Join-Path $repoRoot $path
    if (Test-Path -LiteralPath $source -PathType Leaf) {
        $destination = Join-Path (Join-Path $backup 'original') $path
        [void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($destination))
        Copy-Item -LiteralPath $source -Destination $destination
    }
}
$report = [ordered]@{ version = $version; bucket = $bucketName; projectNumber = $projectNumber; state = 'preview'; commit = $null; corsSha256 = $candidateHash; metadataVerified = $false }
try {
    Write-Host "Candidate CORS for $bucketName (all current live rules preserved):"
    Write-Host (Json $candidate)
    if (-not $Release) { Write-Host 'Preview only. No repository or Storage changes. Run this script with -Release to commit, push and apply.'; return }
    AssertClean
    [void][IO.Directory]::CreateDirectory((Join-Path $repoRoot $operation))
    [IO.File]::WriteAllText((Join-Path $repoRoot 'cors.json'), ((Json $candidate) + "`n"), $utf8)
    [IO.File]::WriteAllText($installedPath, ($sourceScript + '# Installed-CORS-SHA256: ' + $candidateHash + "`n"), $utf8)
    [IO.File]::WriteAllText($installedReadme, $sourceReadme, $utf8)
    git add -- @paths
    if ($LASTEXITCODE -ne 0) { throw 'Staging failed; Storage unchanged.' }
    git --no-pager diff --cached --check -- @paths
    if ($LASTEXITCODE -ne 0) { throw 'Staged diff check failed; Storage unchanged.' }
    git --no-pager diff --cached --stat -- @paths
    if ($LASTEXITCODE -ne 0) { throw 'Unable to inspect the scoped diff.' }
    git --no-pager diff --cached --quiet -- @paths
    $changed = $LASTEXITCODE
    if ($changed -eq 1) {
        git commit --only -m 'fix: allow Portal read access through Storage CORS' -- @paths
        if ($LASTEXITCODE -ne 0) { throw 'Commit failed; Storage unchanged.' }
    } elseif ($changed -ne 0) { throw 'Unable to inspect the commit scope.' }
    AssertClean
    if ((CorsHash @(ConvertFrom-Json -InputObject (ReadText (Join-Path $repoRoot 'cors.json')))) -cne $candidateHash) { throw 'Committed candidate changed; Storage unchanged.' }
    $report.commit = git rev-parse HEAD
    if ($LASTEXITCODE -ne 0) { throw 'Unable to record commit.' }
    git push origin $branchName
    if ($LASTEXITCODE -ne 0) { throw 'Push failed; Storage unchanged. Rerun after resolving the push error.' }
    $report.state = 'pushed'
    $fresh = BucketRequest 'Get'
    AssertBucket $fresh
    if ((CorsHash (CorsRules $fresh)) -cne $candidateHash) {
        if ([string]$fresh.metageneration -cne [string]$before.metageneration) { throw 'Bucket metadata changed during release. Rerun to merge the fresh live rules; no PATCH was sent.' }
        $report.state = 'patch-requested'
        $patched = BucketRequest 'Patch' ([string]$fresh.metageneration) $candidate
        AssertBucket $patched
    }
    $after = BucketRequest 'Get'
    AssertBucket $after
    [IO.File]::WriteAllText((Join-Path $backup 'bucket.after.json'), (Json $after), $utf8)
    if ((CorsHash (CorsRules $after)) -cne $candidateHash) { throw 'Live CORS readback differs from the committed candidate. Review the backup/report and rerun with fresh metadata.' }
    $report.metadataVerified = $true
    $report.state = 'verified'
    Write-Host 'Committed, pushed and verified the bucket CORS metadata. No Hosting deploy, IAM, Security Rules or object writes were performed.'
    Write-Host 'Now use a private browser window, sign in to the Portal and test Download. Browser CORS caches may need time to expire.'
} catch {
    $report.state = 'stopped'
    $report['error'] = $_.Exception.Message
    throw
} finally {
    $token = $null
    [IO.File]::WriteAllText((Join-Path $backup 'result.json'), (Json $report), $utf8)
    Write-Host "Backup, candidate and report: $backup"
}
# Installed-CORS-SHA256: 735c91c9fc9f97c08d7c8a245217ce758312a7a5eed8419c67289e4695759de7
