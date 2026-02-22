Write-Host ""
Write-Host "=== AgileAI University Release Manager v2.0 ==="
Write-Host ""

$ErrorActionPreference = "Stop"

# -------------------------------------------------
# Surface Mapping
# -------------------------------------------------

$surfaces = @{
    "certs"      = @{ target="agileai-certs";  dir="public-certs" }
    "site"       = @{ target="agileai-site";   dir="public-site" }
    "edu"        = @{ target="agileai-edu";    dir="public-edu" }
    "learn"      = @{ target="agileai-learn";  dir="public-learn" }
    "assessment" = @{ target="assessment";     dir="public-assessment" }
}

Write-Host "Available surfaces:"
$surfaces.Keys | ForEach-Object { Write-Host " - $_" }

$selected = Read-Host "`nSelect surface"

if (-not $surfaces.ContainsKey($selected)) {
    Write-Host "✖ Invalid surface"
    exit 1
}

$surfaceTarget = $surfaces[$selected].target
$publicDir = $surfaces[$selected].dir

Write-Host "✓ Selected: $selected"
Write-Host ""

# -------------------------------------------------
# Branch Check
# -------------------------------------------------

$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main") {
    Write-Host "✖ Must be on main branch"
    exit 1
}

Write-Host "✓ Branch verified"
Write-Host ""

# -------------------------------------------------
# Version Input
# -------------------------------------------------

$version = Read-Host "Enter version (example: v13.0)"

if ([string]::IsNullOrWhiteSpace($version)) {
    Write-Host "✖ Version required"
    exit 1
}

if (git tag -l $version) {
    Write-Host "✖ Tag already exists"
    exit 1
}

# -------------------------------------------------
# Release Notes Input
# -------------------------------------------------

Write-Host ""
Write-Host "Enter release notes (finish with empty line):"

$notes = ""
while ($true) {
    $line = Read-Host
    if ([string]::IsNullOrWhiteSpace($line)) { break }
    $notes += "$line`n"
}

# -------------------------------------------------
# Confirmation Gate
# -------------------------------------------------

$confirm = Read-Host "`nType RELEASE to continue"

if ($confirm -ne "RELEASE") {
    Write-Host "✖ Aborted"
    exit 1
}

# -------------------------------------------------
# Sync Design Authority (only for certs)
# -------------------------------------------------

if ($selected -eq "certs") {
    Copy-Item `
        -Path "shared/design-authority/js/header.js" `
        -Destination "$publicDir/assets/js/header.js" `
        -Force

    Copy-Item `
        -Path "shared/design-authority/css/site.css" `
        -Destination "$publicDir/shared/design-authority/css/site.css" `
        -Force
}

# -------------------------------------------------
# Commit
# -------------------------------------------------

git add $publicDir
git commit -m "Release $version — $selected"

git tag -a $version -m "$notes"

git push
git push origin $version

Write-Host "✓ Commit & tag pushed"
Write-Host ""

# -------------------------------------------------
# GitHub Release Creation
# -------------------------------------------------

$repo = "YOUR_GITHUB_USERNAME/YOUR_REPO"
$token = $env:GITHUB_TOKEN

if ($token) {
    $body = @{
        tag_name = $version
        name = $version
        body = $notes
        draft = $false
        prerelease = $false
    } | ConvertTo-Json

    Invoke-RestMethod `
        -Uri "https://api.github.com/repos/$repo/releases" `
        -Method Post `
        -Headers @{ Authorization = "token $token" } `
        -Body $body `
        -ContentType "application/json"

    Write-Host "✓ GitHub release created"
}

# -------------------------------------------------
# Slack Notification
# -------------------------------------------------

$slackWebhook = $env:SLACK_WEBHOOK_URL

if ($slackWebhook) {

    $payload = @{
        text = "🚀 Release $version deployed on $selected"
    } | ConvertTo-Json

    Invoke-RestMethod `
        -Uri $slackWebhook `
        -Method Post `
        -Body $payload `
        -ContentType "application/json"

    Write-Host "✓ Slack notified"
}

# -------------------------------------------------
# Firebase Deploy
# -------------------------------------------------

firebase deploy --only hosting:$surfaceTarget

Write-Host ""
Write-Host "=== RELEASE COMPLETE: $version ($selected) ==="
Write-Host ""