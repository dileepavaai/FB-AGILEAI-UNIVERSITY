Write-Host "=== AgileAI Design Authority Sync ==="

$ErrorActionPreference = "Stop"

# Header Sync
Copy-Item `
  -Path "shared/design-authority/js/header.js" `
  -Destination "public-certs/assets/js/header.js" `
  -Force

# CSS Sync
Copy-Item `
  -Path "shared/design-authority/css/site.css" `
  -Destination "public-certs/shared/design-authority/css/site.css" `
  -Force

Write-Host "=== Sync Complete ==="