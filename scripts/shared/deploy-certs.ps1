Write-Host ""
Write-Host "=== AgileAI Public-Certs Deployment Pipeline ==="
Write-Host ""

$ErrorActionPreference = "Stop"

# ------------------------------------------
# 1. Sync Design Authority Layer
# ------------------------------------------

Write-Host "→ Syncing Design Authority..."

Copy-Item `
  -Path "shared/design-authority/js/header.js" `
  -Destination "public-certs/assets/js/header.js" `
  -Force

Copy-Item `
  -Path "shared/design-authority/css/site.css" `
  -Destination "public-certs/shared/design-authority/css/site.css" `
  -Force

Write-Host "✓ Sync complete"
Write-Host ""

# ------------------------------------------
# 2. Stage Intended Files Only
# ------------------------------------------

Write-Host "→ Staging files..."

git add public-certs/assets/js/header.js
git add public-certs/shared/design-authority/css/site.css

# Include any changed certs files
git add public-certs

Write-Host "✓ Files staged"
Write-Host ""

# ------------------------------------------
# 3. Commit Discipline
# ------------------------------------------

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"

$commitMessage = "Public-Certs Deploy — $timestamp | Design Authority Sync + Surface Stabilization"

git commit -m "$commitMessage"

Write-Host "✓ Commit created"
Write-Host ""

# ------------------------------------------
# 4. Push
# ------------------------------------------

Write-Host "→ Pushing to origin/main..."
git push

Write-Host "✓ Push complete"
Write-Host ""

# ------------------------------------------
# 5. Firebase Deploy
# ------------------------------------------

Write-Host "→ Deploying to Firebase (agileai-certs)..."

firebase deploy --only hosting:agileai-certs

Write-Host ""
Write-Host "=== Deployment Complete ==="
Write-Host ""