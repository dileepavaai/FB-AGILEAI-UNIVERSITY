[CmdletBinding()]
param([switch]$Release)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
$project = 'fb-agileai-university'
$region = 'asia-south1'
$service = 'cloud-run-portal'
$branch = 'migration/laau-primary-domain'
$baseline = 'cloud-run-portal-00006-tjt'
$baseImage = 'asia-south1-docker.pkg.dev/fb-agileai-university/cloud-run-source-deploy/cloud-run-portal@sha256:83a36228c8773ae022a1aec12803bf0a387e033c1f4997ed7d0b13beb777a7fb'
$repairRelative = 'operations/cloud-run-portal-origin-fix'
$scriptName = 'Invoke-LAAU-Portal-Origin-Fix.ps1'
$utf8 = [System.Text.UTF8Encoding]::new($false)
$payload = Join-Path $PSScriptRoot 'payload'
if (-not (Test-Path -LiteralPath $payload -PathType Container)) { $payload = $PSScriptRoot }
$files = @('index.js', 'package.json', 'Dockerfile', 'smoke-test.mjs', '.gcloudignore', '.dockerignore', 'provenance.json', 'README.md')

function Run-Checked {
    param([string]$Command, [string[]]$Arguments)
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$Command failed (exit $LASTEXITCODE). Deployment stopped." }
}

function Read-Command {
    param([string]$Command, [string[]]$Arguments)
    $lines = @(& $Command @Arguments)
    if ($LASTEXITCODE -ne 0) { throw "$Command failed (exit $LASTEXITCODE). Deployment stopped." }
    return ($lines -join "`n")
}

function Read-Service {
    $raw = Read-Command 'gcloud' @('run', 'services', 'describe', $service, "--project=$project", "--region=$region", '--format=json')
    return ($raw | ConvertFrom-Json)
}

function Assert-Traffic {
    param($State, [string]$Revision)
    $active = @($State.status.traffic | Where-Object { $_.percent -gt 0 })
    if ($active.Count -ne 1 -or $active[0].revisionName -ne $Revision -or $active[0].percent -ne 100) {
        throw "Expected 100 percent traffic on $Revision. Service state changed; share the error before retrying."
    }
}

function Assert-Baseline {
    $state = Read-Service
    Assert-Traffic $state $baseline
    if ($state.status.latestReadyRevisionName -ne $baseline -or
        $state.status.latestCreatedRevisionName -ne $baseline -or
        @($state.spec.template.spec.containers).Count -ne 1 -or
        $state.spec.template.spec.containers[0].image -ne $baseImage) {
        throw 'The service no longer matches the reviewed baseline. Stop and share this error; a repair may already have been deployed.'
    }
    return $state
}

function Read-Revision {
    param([string]$Name)
    return ((Read-Command 'gcloud' @('run', 'revisions', 'describe', $Name, "--project=$project", "--region=$region", '--format=json')) | ConvertFrom-Json)
}

function Assert-Annotations {
    param($Original, $Current, [string[]]$Keys)
    foreach ($key in $Keys) {
        $old = $Original.metadata.annotations.$key
        $new = $Current.metadata.annotations.$key
        if (($old | ConvertTo-Json -Compress) -ne ($new | ConvertTo-Json -Compress)) {
            throw "Runtime/security annotation changed: $key. No values have been printed."
        }
    }
}

function Normalized-Hash {
    param([string]$Path)
    $text = [System.IO.File]::ReadAllText($Path).Replace("`r`n", "`n")
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash($utf8.GetBytes($text)))).Replace('-', '').ToLowerInvariant() }
    finally { $sha.Dispose() }
}

Get-Command git, node -ErrorAction Stop | Out-Null
$repository = (Read-Command 'git' @('rev-parse', '--show-toplevel')).Trim()
if ((Read-Command 'git' @('branch', '--show-current')).Trim() -ne $branch) {
    throw "Open the repository on branch $branch before running this script."
}
$origin = (Read-Command 'git' @('remote', 'get-url', 'origin')).Trim()
if ($origin -notmatch '(?i)^(https://github\.com/|git@github\.com:)dileepavaai/FB-AGILEAI-UNIVERSITY(?:\.git)?/?$') {
    throw 'The origin remote does not match the reviewed repository.'
}
Set-Location -LiteralPath $repository

foreach ($file in $files) {
    if (-not (Test-Path -LiteralPath (Join-Path $payload $file) -PathType Leaf)) {
        throw "Package is incomplete: $file"
    }
}
if ((Normalized-Hash (Join-Path $payload 'index.js')) -ne '92aa04e546d30f8c496170160aa49a7cd1e386ba1bca4ac606b1e911f1b30580') {
    throw 'Replacement index.js differs from the reviewed repair.'
}
Run-Checked 'node' @('--check', (Join-Path $payload 'index.js'))
Run-Checked 'node' @('--check', (Join-Path $payload 'smoke-test.mjs'))

if ($Release) {
    Get-Command gcloud -ErrorAction Stop | Out-Null
    $before = Assert-Baseline
    $baselineRevision = Read-Revision $baseline
}

$destination = Join-Path $repository $repairRelative
$allNames = @($files) + @($scriptName)
if (Test-Path -LiteralPath $destination) {
    $unexpected = @(Get-ChildItem -LiteralPath $destination -Force | Where-Object { $_.PSIsContainer -or $_.Name -notin $allNames })
    if ($unexpected.Count -gt 0) { throw 'The repair directory already contains other work. No files were overwritten.' }
}
foreach ($file in $allNames) {
    $from = if ($file -eq $scriptName) { $PSCommandPath } else { Join-Path $payload $file }
    $to = Join-Path $destination $file
    if ((Test-Path -LiteralPath $to -PathType Leaf) -and (Normalized-Hash $to) -ne (Normalized-Hash $from)) {
        throw "The existing repair file differs: $file. No files were overwritten."
    }
}
New-Item -ItemType Directory -Path $destination -Force | Out-Null
foreach ($file in $allNames) {
    $from = if ($file -eq $scriptName) { $PSCommandPath } else { Join-Path $payload $file }
    $to = Join-Path $destination $file
    if ([System.IO.Path]::GetFullPath($from) -ne [System.IO.Path]::GetFullPath($to)) {
        Copy-Item -LiteralPath $from -Destination $to -Force
    }
}
$paths = @($allNames | ForEach-Object { "$repairRelative/$_" })
Run-Checked 'git' (@('add', '--') + $paths)
Run-Checked 'git' (@('--no-pager', 'diff', '--cached', '--check', '--') + $paths)
Run-Checked 'git' (@('--no-pager', 'diff', '--cached', '--stat', '--') + $paths)

if (-not $Release) {
    Write-Host 'Prepared and staged the isolated repair. No commit, push, build or deployment was performed.'
    Write-Host 'To commit, push, build, test and deploy, run this same script with -Release.'
    return
}

& git --no-pager diff --quiet HEAD -- @paths
$diffExit = $LASTEXITCODE
if ($diffExit -eq 1) {
    Run-Checked 'git' (@('commit', '--only', '-m', 'fix: allow LAAU portal on deployed entitlement service', '--') + $paths)
} elseif ($diffExit -ne 0) { throw 'Unable to inspect repair changes.' }
Run-Checked 'git' @('push', 'origin', $branch)
$commit = (Read-Command 'git' @('rev-parse', 'HEAD')).Trim()

$work = Join-Path $env:TEMP ('LAAU-Origin-Release-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $work | Out-Null
$archive = Join-Path $work 'committed-repair.zip'
Run-Checked 'git' @('archive', '--format=zip', "--output=$archive", $commit, "$repairRelative/")
$export = Join-Path $work 'committed-source'
Expand-Archive -LiteralPath $archive -DestinationPath $export
$buildSource = Join-Path $export $repairRelative
$suffix = 'laau-' + [DateTime]::UtcNow.ToString('yyyyMMddHHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 6)
$candidate = "$service-$suffix"
$tag = $suffix
$imageRepository = 'asia-south1-docker.pkg.dev/fb-agileai-university/cloud-run-source-deploy/cloud-run-portal'
$imageTag = "${imageRepository}:$suffix"
$record = [ordered]@{ service = $service; baseline = $baseline; candidate = $candidate; gitCommit = $commit; imageTag = $imageTag; outcome = 'BUILDING' }
$report = Join-Path $work 'release-result.json'
function Save-Record { [System.IO.File]::WriteAllText($report, ($record | ConvertTo-Json -Depth 10), $utf8) }
Save-Record
Write-Host "Release report: $report"
Write-Host 'Building and running local HTTP checks inside the existing backend runtime...'
$build = (Read-Command 'gcloud' @('builds', 'submit', $buildSource, "--tag=$imageTag", "--project=$project", "--region=$region", '--suppress-logs', '--format=json')) | ConvertFrom-Json
if ($build.status -ne 'SUCCESS') { throw 'Cloud Build did not succeed. No service deployment was requested.' }
$builtImages = @($build.results.images | Where-Object { $_.name -eq $imageTag })
if ($builtImages.Count -ne 1 -or $builtImages[0].digest -notmatch '^sha256:[a-f0-9]{64}$') {
    throw 'Build result did not supply the expected immutable image digest.'
}
$image = $imageRepository + '@' + $builtImages[0].digest
$record.buildId = $build.id
$record.image = $image
$record.outcome = 'BUILT'
Save-Record
# Recheck after the build, before changing the Cloud Run service.
$null = Assert-Baseline

Add-Type -AssemblyName System.Net.Http
$handler = [System.Net.Http.HttpClientHandler]::new()
$handler.AllowAutoRedirect = $false
$http = [System.Net.Http.HttpClient]::new($handler)
$http.Timeout = [TimeSpan]::FromSeconds(40)

function Request-Endpoint {
    param([string]$Url, [string]$Method, [string]$Origin)
    $request = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::new($Method), $Url)
    $response = $null
    try {
        $null = $request.Headers.TryAddWithoutValidation('Origin', $Origin)
        if ($Method -eq 'OPTIONS') {
            $null = $request.Headers.TryAddWithoutValidation('Access-Control-Request-Method', 'GET')
            $null = $request.Headers.TryAddWithoutValidation('Access-Control-Request-Headers', 'authorization')
        }
        $response = $http.SendAsync($request).GetAwaiter().GetResult()
        $headers = @{}
        foreach ($name in @('Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers')) {
            $headers[$name] = if ($response.Headers.Contains($name)) { [string]::Join(',', $response.Headers.GetValues($name)) } else { '' }
        }
        return [pscustomobject]@{ Status = [int]$response.StatusCode; Headers = $headers; Body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult() }
    } finally {
        if ($null -ne $response) { $response.Dispose() }
        $request.Dispose()
    }
}

function Test-Endpoint {
    param([string]$BaseUrl)
    $url = $BaseUrl.TrimEnd('/') + '/portal/resolve-entitlements'
    foreach ($origin in @('https://portal.laau.university', 'https://portal.agileai.university')) {
        $preflight = Request-Endpoint $url 'OPTIONS' $origin
        if ($preflight.Status -ne 204 -or $preflight.Headers['Access-Control-Allow-Origin'] -ne $origin -or
            $preflight.Headers['Access-Control-Allow-Methods'] -notmatch '\bGET\b' -or
            $preflight.Headers['Access-Control-Allow-Headers'] -notmatch '\bauthorization\b') {
            throw "CORS preflight check failed for $origin at $BaseUrl"
        }
        $get = Request-Endpoint $url 'GET' $origin
        if ($get.Status -ne 401 -or $get.Headers['Access-Control-Allow-Origin'] -ne $origin -or
            ($get.Body | ConvertFrom-Json).error -ne 'NO_TOKEN') {
            throw "Authentication/CORS check failed for $origin at $BaseUrl"
        }
    }
    $denied = Request-Endpoint $url 'OPTIONS' 'https://unapproved.invalid'
    if ($denied.Headers['Access-Control-Allow-Origin']) { throw 'An unapproved origin received CORS permission.' }
    Write-Host "PASS: origin and authentication checks at $BaseUrl"
}

$promotionAttempted = $false
$deployAttempted = $false
try {
    $deployAttempted = $true
    Run-Checked 'gcloud' @('run', 'deploy', $service, "--image=$image", "--project=$project", "--region=$region", "--revision-suffix=$suffix", '--no-traffic', "--tag=$tag", '--quiet')
    $state = Read-Service
    Assert-Traffic $state $baseline
    if ($state.status.latestReadyRevisionName -ne $candidate -or $state.status.latestCreatedRevisionName -ne $candidate) {
        throw 'The candidate is not the current ready revision. Stop before promotion.'
    }
    $candidateRevision = Read-Revision $candidate
    if ($candidateRevision.spec.containers[0].image -ne $image) {
        throw 'The candidate image differs from the successful build digest.'
    }
    # Compare effective runtime configuration without displaying environment values.
    $expectedSpec = $baselineRevision.spec | ConvertTo-Json -Depth 50 | ConvertFrom-Json
    $expectedSpec.containers[0].image = $candidateRevision.spec.containers[0].image
    if (($expectedSpec | ConvertTo-Json -Depth 50 -Compress) -ne ($candidateRevision.spec | ConvertTo-Json -Depth 50 -Compress)) {
        throw 'Effective runtime configuration changed beyond the image. Candidate remains off normal traffic.'
    }
    Assert-Annotations $baselineRevision $candidateRevision @(
        'autoscaling.knative.dev/minScale', 'autoscaling.knative.dev/maxScale',
        'run.googleapis.com/cpu-throttling', 'run.googleapis.com/startup-cpu-boost',
        'run.googleapis.com/execution-environment', 'run.googleapis.com/vpc-access-connector',
        'run.googleapis.com/vpc-access-egress', 'run.googleapis.com/network-interfaces',
        'run.googleapis.com/cloudsql-instances', 'run.googleapis.com/sessionAffinity',
        'run.googleapis.com/container-dependencies', 'run.googleapis.com/encryption-key'
    )
    Assert-Annotations $before $state @(
        'run.googleapis.com/ingress', 'run.googleapis.com/invoker-iam-disabled',
        'run.googleapis.com/default-url-disabled', 'run.googleapis.com/iap-enabled',
        'run.googleapis.com/custom-audiences', 'run.googleapis.com/minScale',
        'run.googleapis.com/maxScale'
    )
    $tagged = @($state.status.traffic | Where-Object { $_.tag -eq $tag -and $_.revisionName -eq $candidate })
    if ($tagged.Count -ne 1 -or -not $tagged[0].url) { throw 'Candidate test URL was not found.' }
    Test-Endpoint $tagged[0].url
    $state = Read-Service
    Assert-Traffic $state $baseline
    if ($state.status.latestCreatedRevisionName -ne $candidate -or $state.status.latestReadyRevisionName -ne $candidate) {
        throw 'Another revision appeared during testing. No promotion was requested.'
    }
    $promotionAttempted = $true
    Run-Checked 'gcloud' @('run', 'services', 'update-traffic', $service, "--to-revisions=${candidate}=100", "--project=$project", "--region=$region", '--quiet')
    $state = Read-Service
    Assert-Traffic $state $candidate
    Test-Endpoint 'https://cloud-run-portal-458881040066.asia-south1.run.app'
    Test-Endpoint $state.status.url
    $record.outcome = 'DEPLOYED_AND_HTTP_CHECKED'
    Save-Record
    Write-Host 'Backend repair deployed. Sign in as test.trial.01 and open My Credentials to confirm the AOP credential.'
    Write-Host 'Normal traffic is pinned to this tested revision. Future deployments require an explicit traffic update.'
} catch {
    $failure = $_
    $record.outcome = 'FAILED'
    if ($promotionAttempted) {
        try {
            $now = Read-Service
            $otherActive = @($now.status.traffic | Where-Object { $_.percent -gt 0 -and $_.revisionName -notin @($baseline, $candidate) })
            if ($otherActive.Count -gt 0) { throw 'Another revision is receiving traffic; automatic rollback stopped to avoid overwriting another deployment.' }
            Run-Checked 'gcloud' @('run', 'services', 'update-traffic', $service, "--to-revisions=${baseline}=100", "--project=$project", "--region=$region", '--quiet')
            Assert-Traffic (Read-Service) $baseline
            $record.outcome = 'FAILED_ROLLED_BACK'
            Write-Host "Traffic restored to $baseline."
        } catch {
            $record.outcome = 'FAILED_ROLLBACK_UNCONFIRMED'
            Write-Warning "Rollback could not be confirmed: $($_.Exception.Message)"
        }
    }
    Save-Record
    throw $failure
} finally {
    $http.Dispose()
    if ($deployAttempted) {
        try {
            Run-Checked 'gcloud' @('run', 'services', 'update-traffic', $service, "--remove-tags=$tag", "--project=$project", "--region=$region", '--quiet')
        } catch { Write-Warning "Temporary tag cleanup failed: $tag. Share the error; do not clear other tags." }
    }
    Write-Host "Release report: $report"
}
Run-Checked 'git' @('status', '--short', '--branch')
