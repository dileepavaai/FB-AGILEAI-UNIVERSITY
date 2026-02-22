Write-Host "=== AgileAI Rollback ==="

$version = Read-Host "Enter version to rollback to"

if (-not (git tag -l $version)) {
    Write-Host "Tag not found"
    exit 1
}

git checkout $version
git checkout -b rollback-$version
git push -u origin rollback-$version

Write-Host "Rollback branch created: rollback-$version"