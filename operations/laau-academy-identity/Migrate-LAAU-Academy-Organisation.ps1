#Requires -Version 5.1
[CmdletBinding()]
param([switch]$Apply)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
Set-StrictMode -Version Latest
$project = 'fb-agileai-university'
$version = '20260922-academy-brand-2'
$oldId = 'ORG-AAU-X7K4P2MN'
$newId = 'ORG-LAAU-X7K4P2MN'
$documentsRoot = "projects/$project/databases/(default)/documents"
$apiRoot = "https://firestore.googleapis.com/v1/$documentsRoot"
$oldName = "$documentsRoot/trainingOrganizations/$oldId"
$newName = "$documentsRoot/trainingOrganizations/$newId"
$trainerName = "$documentsRoot/trainerRegistry/rQpJj2UXbfepcsD6Skmo"
$newEmblem = 'https://admin.laau.university/credential-operations/credential-generator/assets/images/organizations/LAAU-Academy-Logo.png?v=20260922-academy-brand-2'
$utf8 = [Text.UTF8Encoding]::new($false, $true)
$headers = @{}
$transaction = $null
$reportDirectory = $null
$commitAttempted = $false
$commitConfirmed = $false

function Get-Property($Object, [string]$Name) {
    if ($null -eq $Object) { return $null }
    if ($Object -is [Collections.IDictionary]) { return $Object[$Name] }
    $property = $Object.PSObject.Properties[$Name]
    if ($null -ne $property) { return $property.get_Value() }
    return $null
}

function Convert-JsonToken($Token) {
    if ($null -eq $Token) { return $null }
    switch ($Token.get_Type().ToString()) {
        'Object' {
            $map = [ordered]@{}
            foreach ($property in $Token.Properties()) {
                if ($map.Contains($property.get_Name())) { throw 'Case-colliding JSON fields cannot be copied safely.' }
                $map[$property.get_Name()] = Convert-JsonToken $property.get_Value()
            }
            return [pscustomobject]$map
        }
        'Array' {
            $items = @($Token.Children() | ForEach-Object { Convert-JsonToken $_ })
            return ,$items
        }
        'Null' { return $null }
        default { return ,$Token.get_Value() }
    }
}

function Read-Json([string]$Text) {
    # Read HTTP JSON as text. Firestore values and metadata timestamps must not
    # be coerced into DateTime or truncated during a full document copy.
    if ((Get-Command ConvertFrom-Json).Parameters.ContainsKey('DateKind')) {
        return ConvertFrom-Json -InputObject $Text -DateKind String -ErrorAction Stop
    }
    if ($PSVersionTable.PSVersion.Major -le 5) {
        # Windows PowerShell uses a different JSON serializer. Verify preservation
        # before trusting it, and fail closed on an unsupported implementation.
        $probe = ConvertFrom-Json -InputObject '{"s":"2026-06-18T07:35:15.256404Z"}'
        if ($probe.s -isnot [string]) { throw 'This PowerShell JSON parser changes timestamp strings. Run this script in PowerShell 7.' }
        return ConvertFrom-Json -InputObject $Text -ErrorAction Stop
    }
    $reader = [Newtonsoft.Json.JsonTextReader]::new([IO.StringReader]::new($Text))
    try {
        $reader.DateParseHandling = [Newtonsoft.Json.DateParseHandling]::None
        $token = [Newtonsoft.Json.Linq.JToken]::ReadFrom($reader)
        return Convert-JsonToken $token
    }
    finally { $reader.Close() }
}

function Get-StringField($Document, [string]$Field, [switch]$Optional) {
    $value = Get-Property (Get-Property $Document 'fields') $Field
    if ($null -eq $value -and $Optional) { return $null }
    $text = Get-Property $value 'stringValue'
    if ($text -isnot [string] -or [string]::IsNullOrWhiteSpace($text)) {
        throw "Missing or malformed string field $Field in a reviewed record."
    }
    return $text
}

function Assert-StringField($Document, [string]$Field, [string]$Expected, [switch]$Optional) {
    $actual = Get-StringField $Document $Field -Optional:$Optional
    if ($Optional -and $null -eq $actual) { return }
    if ($actual -cne $Expected) { throw "Unexpected $Field in a reviewed record. No migration was submitted." }
}

function Invoke-Firestore([string]$Uri, $Body) {
    if (-not $Uri.StartsWith($apiRoot, [StringComparison]::Ordinal)) {
        throw 'Unexpected Firestore request destination.'
    }
    $json = ConvertTo-Json -InputObject $Body -Depth 100 -Compress
    $response = Invoke-WebRequest -UseBasicParsing -Method Post -Uri $Uri `
        -Headers $headers -ContentType 'application/json; charset=utf-8' `
        -Body $utf8.GetBytes($json) -TimeoutSec 60
    if ([int]$response.StatusCode -ne 200) { throw 'Unexpected Firestore HTTP status.' }
    $parsed = Read-Json ([string]$response.Content)
    return $parsed
}

function Get-BytesHash([byte[]]$Bytes, [bool]$Binary) {
    if (-not $Binary) {
        $text = $utf8.GetString($Bytes)
        if ($text.StartsWith([string][char]0xFEFF, [StringComparison]::Ordinal)) { $text = $text.Substring(1) }
        $Bytes = $utf8.GetBytes($text.Replace("`r`n", "`n"))
    }
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash($Bytes))).Replace('-', '').ToLowerInvariant() }
    finally { $sha.Dispose() }
}

function Assert-LiveCompatibility {
    $manifest = Read-Json ([IO.File]::ReadAllText((Join-Path $PSScriptRoot 'manifest.json'), $utf8))
    if ((Get-Property $manifest 'version') -cne $version) { throw 'Unexpected migration manifest version.' }
    $prefix = 'public-admin/credential-operations/credential-generator/'
    $required = @(
        'shared/training-provider-branding.js',
        'trainer-certificate/generator/trainer-certificate-generator.js',
        'trainer-certificate/generator/trainer-certificate-pdf.js',
        'trainer-certificate/index.html',
        'trainer-certificate/template/trainer-certificate-template.html',
        'assets/images/organizations/LAAU-Academy-Logo.png'
    )
    $folder = Join-Path ([IO.Path]::GetTempPath()) ('LAAU-Migration-Live-' + [guid]::NewGuid().ToString('N'))
    [void][IO.Directory]::CreateDirectory($folder)
    try {
        foreach ($relative in $required) {
            $path = $prefix + $relative
            $entries = @(Get-Property $manifest 'files' | Where-Object { (Get-Property $_ 'path') -ceq $path })
            if ($entries.Count -ne 1) { throw "Required compatibility manifest entry missing: $path" }
            $expected = Get-Property $entries[0] 'afterSha256'
            $binary = Get-Property $entries[0] 'binary'
            if ($expected -isnot [string] -or $expected -cnotmatch '^[0-9a-f]{64}$' -or
                $binary -isnot [bool] -or $binary -ne $path.EndsWith('.png')) {
                throw "Invalid compatibility manifest entry: $path"
            }
            # Firebase serves directory index files at the directory URL. Request
            # that canonical path directly to avoid query-only index redirects.
            $urlPath = '/' + $path.Substring('public-admin/'.Length)
            if ($urlPath.EndsWith('/index.html', [StringComparison]::Ordinal)) {
                $urlPath = $urlPath.Substring(0, $urlPath.Length - 'index.html'.Length)
            }
            $url = 'https://admin.laau.university' + $urlPath + '?v=' + $version
            $file = Join-Path $folder ([guid]::NewGuid().ToString('N') + '.asset')
            Invoke-WebRequest -UseBasicParsing -Uri $url -Headers @{ 'Cache-Control' = 'no-cache' } `
                -OutFile $file -TimeoutSec 60 | Out-Null
            if ((Get-BytesHash ([IO.File]::ReadAllBytes($file)) $binary) -cne $expected) {
                throw "Live compatibility content differs: $path. Deploy the reviewed package before migration."
            }
        }
    }
    finally { if ([IO.Directory]::Exists($folder)) { [IO.Directory]::Delete($folder, $true) } }
    Write-Host 'Live organisation lookup compatibility and Academy logo verified.'
}

function Assert-NoSubcollections {
    # listCollectionIds has no transaction option. Check both physical paths,
    # including an absent destination that might have orphaned descendants.
    foreach ($name in @($oldName, $newName)) {
        $response = Invoke-Firestore ('https://firestore.googleapis.com/v1/' + $name + ':listCollectionIds') @{ pageSize = 1 }
        $collections = @(Get-Property $response 'collectionIds' | Where-Object { $null -ne $_ })
        if ($collections.Count -gt 0 -or -not [string]::IsNullOrEmpty([string](Get-Property $response 'nextPageToken'))) {
            throw 'An organisation path has subcollections. This migration will not move or delete descendants.'
        }
    }
}

function Read-Documents([string]$TransactionId) {
    $body = @{ documents = @($oldName, $newName, $trainerName) }
    if ($TransactionId) { $body['transaction'] = $TransactionId }
    $responses = @(Invoke-Firestore ($apiRoot + ':batchGet') $body)
    $documents = @{}
    foreach ($response in $responses) {
        $found = Get-Property $response 'found'
        $missing = Get-Property $response 'missing'
        $name = if ($null -ne $found) { Get-Property $found 'name' } else { $missing }
        if ($name -cnotin @($oldName, $newName, $trainerName) -or $documents.ContainsKey($name)) {
            throw 'Unexpected or duplicate document in the Firestore response.'
        }
        if ($null -ne $found) {
            $timestamp = Get-Property $found 'updateTime'
            if ($timestamp -isnot [string] -or $timestamp -cnotmatch '^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,9})?Z$') {
                throw 'Missing or malformed Firestore update timestamp.'
            }
        }
        $documents[$name] = $found
    }
    if ($documents.Count -ne 3) { throw 'Firestore did not return all three reviewed document states.' }
    return $documents
}

function Assert-ReferenceScope([string]$TransactionId, [string]$ExpectedOrganisation) {
    foreach ($collection in @('trainingOrganizations', 'trainerRegistry')) {
        $fields = if ($collection -ceq 'trainingOrganizations') {
            @('organizationId', 'organization_id', 'legacy_organization_id', 'legacyOrganizationId')
        } else { @('organizationId', 'organization_id') }
        $expectedName = if ($collection -ceq 'trainingOrganizations') { $ExpectedOrganisation } else { $trainerName }
        foreach ($field in $fields) {
            $body = @{
                structuredQuery = @{
                    from = @(@{ collectionId = $collection })
                    select = @{ fields = @(@{ fieldPath = '__name__' }) }
                    where = @{ fieldFilter = @{
                        field = @{ fieldPath = $field }; op = 'IN'
                        value = @{ arrayValue = @{ values = @(@{ stringValue = $oldId }, @{ stringValue = $newId }) } }
                    } }
                    limit = 101
                }
            }
            if ($TransactionId) { $body['transaction'] = $TransactionId }
            $rows = @(Invoke-Firestore ($apiRoot + ':runQuery') $body)
            $found = @($rows | ForEach-Object { Get-Property $_ 'document' } | Where-Object { $null -ne $_ })
            if ($found.Count -ge 101) { throw 'Reference query exceeded the reviewed bound.' }
            foreach ($document in $found) {
                if ((Get-Property $document 'name') -cne $expectedName) {
                    throw 'An additional organisation alias or linked trainer exists. Review the new reference before migrating.'
                }
            }
        }
    }
}

function Assert-MigrationState($Documents) {
    $old = $Documents[$oldName]
    $new = $Documents[$newName]
    $trainer = $Documents[$trainerName]
    if ($null -eq $trainer) { throw 'The reviewed trainer document is missing.' }
    Assert-StringField $trainer 'status' 'active'
    if ($null -ne $old -and $null -ne $new) { throw 'Both organisation documents exist. Refusing a conflicting or partial migration.' }
    if ($null -eq $old -and $null -eq $new) { throw 'Neither reviewed organisation document exists.' }
    if ($null -ne $old) {
        Assert-StringField $old 'organizationId' $oldId
        Assert-StringField $old 'organizationName' 'Agile AI Academy'
        Assert-StringField $old 'organization_id' $oldId -Optional
        Assert-StringField $old 'organization_name' 'Agile AI Academy' -Optional
        Assert-StringField $old 'legacy_organization_id' $oldId -Optional
        Assert-StringField $old 'legacyOrganizationId' $oldId -Optional
        Assert-StringField $old 'status' 'active'
        [void](Get-StringField $old 'emblemUrl')
        Assert-StringField $trainer 'organizationId' $oldId
        Assert-StringField $trainer 'organization_id' $oldId -Optional
        return 'ready'
    }
    Assert-StringField $new 'organizationId' $newId
    Assert-StringField $new 'organization_id' $newId -Optional
    Assert-StringField $new 'organizationName' 'LAAU Academy'
    Assert-StringField $new 'organization_name' 'LAAU Academy' -Optional
    Assert-StringField $new 'legacy_organization_id' $oldId
    Assert-StringField $new 'legacyOrganizationId' $oldId -Optional
    Assert-StringField $new 'emblemUrl' $newEmblem
    Assert-StringField $new 'status' 'active'
    Assert-StringField $trainer 'organizationId' $newId
    Assert-StringField $trainer 'organization_id' $newId -Optional
    return 'already-migrated'
}

function Set-StringValue($Fields, [string]$Field, [string]$Value) {
    $Fields | Add-Member -MemberType NoteProperty -Name $Field -Value ([pscustomobject]@{ stringValue = $Value }) -Force
}

function New-Writes($Documents) {
    $old = $Documents[$oldName]
    $trainer = $Documents[$trainerName]
    $fields = Read-Json (ConvertTo-Json -InputObject (Get-Property $old 'fields') -Depth 100 -Compress)
    Set-StringValue $fields 'organizationId' $newId
    Set-StringValue $fields 'organizationName' 'LAAU Academy'
    Set-StringValue $fields 'legacy_organization_id' $oldId
    Set-StringValue $fields 'emblemUrl' $newEmblem
    if ($null -ne (Get-Property $fields 'organization_id')) { Set-StringValue $fields 'organization_id' $newId }
    if ($null -ne (Get-Property $fields 'organization_name')) { Set-StringValue $fields 'organization_name' 'LAAU Academy' }
    $trainerFields = [ordered]@{ organizationId = @{ stringValue = $newId } }
    $mask = @('organizationId')
    if ($null -ne (Get-Property (Get-Property $trainer 'fields') 'organization_id')) {
        $trainerFields['organization_id'] = @{ stringValue = $newId }
        $mask += 'organization_id'
    }
    return @(
        @{ update = @{ name = $newName; fields = $fields }; currentDocument = @{ exists = $false } },
        @{ update = @{ name = $trainerName; fields = $trainerFields }; updateMask = @{ fieldPaths = $mask }; currentDocument = @{ updateTime = (Get-Property $trainer 'updateTime') } },
        @{ delete = $oldName; currentDocument = @{ updateTime = (Get-Property $old 'updateTime') } }
    )
}

function Convert-SortedValue($Value) {
    if ($null -eq $Value) { return $null }
    if ($Value -is [Collections.IDictionary] -or $Value -is [pscustomobject]) {
        [string[]]$keys = if ($Value -is [Collections.IDictionary]) { @($Value.Keys) } else { @($Value.PSObject.Properties.Name) }
        [Array]::Sort($keys, [StringComparer]::Ordinal)
        $map = [ordered]@{}
        foreach ($key in $keys) { $map[$key] = Convert-SortedValue (Get-Property $Value $key) }
        return $map
    }
    if ($Value -is [Array]) {
        $items = [Collections.Generic.List[object]]::new()
        foreach ($item in $Value) { $items.Add((Convert-SortedValue $item)) }
        return ,$items.ToArray()
    }
    return ,$Value
}

function Assert-EqualFields($Actual, $Expected, [string]$Label) {
    $left = ConvertTo-Json -InputObject (Convert-SortedValue $Actual) -Depth 100 -Compress
    $right = ConvertTo-Json -InputObject (Convert-SortedValue $Expected) -Depth 100 -Compress
    if ($left -cne $right) { throw "Post-commit $Label field comparison differs. Review the saved originals; no automatic reversal was attempted." }
}

function Save-Json([string]$File, $Value) {
    $json = ConvertTo-Json -InputObject $Value -Depth 100
    [IO.File]::WriteAllText($File, $json, $utf8)
    if ([IO.File]::ReadAllText($File, $utf8) -cne $json) { throw 'Could not verify the local migration backup or report.' }
}

function Write-Report([string]$State, [string]$Detail) {
    if ($null -eq $reportDirectory) { return }
    Save-Json (Join-Path $reportDirectory 'migration-result.json') ([ordered]@{
        version = $version; project = $project; database = '(default)'; state = $State
        utc = [DateTime]::UtcNow.ToString('o'); oldOrganisationId = $oldId; newOrganisationId = $newId
        organisationName = 'LAAU Academy'; trainerDocumentId = 'rQpJj2UXbfepcsD6Skmo'
        commitAttempted = $commitAttempted; commitConfirmed = $commitConfirmed; detail = $Detail
    })
}

try {
    # -Apply cannot skip the live prerequisite even when launched independently.
    if ($Apply) { Assert-LiveCompatibility }
    Get-Command gcloud -ErrorAction Stop | Out-Null
    $tokenLines = @(gcloud auth print-access-token --project=$project)
    if ($LASTEXITCODE -ne 0 -or $tokenLines.Count -ne 1 -or [string]::IsNullOrWhiteSpace($tokenLines[0])) {
        throw 'Unable to use the existing gcloud sign-in.'
    }
    $headers['Authorization'] = 'Bearer ' + $tokenLines[0].Trim()
    $tokenLines = $null
    Assert-NoSubcollections
    $options = if ($Apply) { @{ readWrite = @{} } } else { @{ readOnly = @{} } }
    $start = Invoke-Firestore ($apiRoot + ':beginTransaction') @{ options = $options }
    $transaction = Get-Property $start 'transaction'
    if ($transaction -isnot [string] -or [string]::IsNullOrEmpty($transaction)) { throw 'Firestore did not return a transaction.' }
    $documents = Read-Documents $transaction
    $state = Assert-MigrationState $documents
    $expectedOrganisation = if ($state -ceq 'ready') { $oldName } else { $newName }
    Assert-ReferenceScope $transaction $expectedOrganisation
    $reportDirectory = Join-Path ([IO.Path]::GetTempPath()) ('LAAU-Organisation-Migration-' + [guid]::NewGuid().ToString('N'))
    [void][IO.Directory]::CreateDirectory($reportDirectory)
    Write-Report $state 'Fresh reviewed document states and organisation aliases checked.'
    if ($state -ceq 'already-migrated') {
        Write-Host 'Organisation identity is already migrated; no data writes are needed.'
    } elseif (-not $Apply) {
        Write-Host "Plan: $oldId -> $newId; name -> LAAU Academy; update one trainer organisation link."
        Write-Host 'Read-only preflight complete. No records changed.'
        $state = 'planned'
        Write-Report $state 'Read-only preflight passed. No records changed.'
    } else {
        $writes = @(New-Writes $documents)
        # Full original fields and Firestore metadata stay in the local backup.
        # The transaction identifier and Authorization header are never saved.
        Save-Json (Join-Path $reportDirectory 'original-records.json') ([ordered]@{
            version = $version; project = $project; capturedAtUtc = [DateTime]::UtcNow.ToString('o')
            sourceOrganisation = $documents[$oldName]; destinationOrganisation = $documents[$newName]
            trainer = $documents[$trainerName]
        })
        Save-Json (Join-Path $reportDirectory 'planned-writes.json') @{ writes = $writes }
        Assert-NoSubcollections
        Write-Report 'prepared' 'Full originals backed up. Ready for one atomic three-write commit.'
        $commitAttempted = $true
        Write-Report 'commit-submitted' 'If interrupted, rerun to inspect actual server state. No automatic reversal is attempted.'
        $result = Invoke-Firestore ($apiRoot + ':commit') @{ transaction = $transaction; writes = $writes }
        if (@(Get-Property $result 'writeResults').Count -ne 3 -or -not (Get-Property $result 'commitTime')) {
            throw 'The commit response was incomplete. Rerun to inspect the actual server state.'
        }
        $commitConfirmed = $true
        $transaction = $null
        # Verify server state after commit using fresh reads. Never retry a write blindly.
        $verified = Read-Documents ''
        if ((Assert-MigrationState $verified) -cne 'already-migrated') { throw 'Post-commit identity check failed.' }
        Assert-EqualFields (Get-Property $verified[$newName] 'fields') $writes[0].update.fields 'organisation'
        $expectedTrainerFields = Read-Json (ConvertTo-Json -InputObject (Get-Property $documents[$trainerName] 'fields') -Depth 100 -Compress)
        foreach ($field in $writes[1].updateMask.fieldPaths) { Set-StringValue $expectedTrainerFields $field $newId }
        Assert-EqualFields (Get-Property $verified[$trainerName] 'fields') $expectedTrainerFields 'trainer'
        Assert-ReferenceScope '' $newName
        Assert-NoSubcollections
        Write-Report 'migrated' 'Atomic creation, trainer foreign-key update and old-document removal confirmed; live identity read back.'
        Write-Host "Migrated organisation document and ID to $newId; name is LAAU Academy."
        Write-Host 'Updated the existing trainer organisation link. Learner and credential records were not edited.'
        $state = 'migrated'
    }
    Write-Host "Migration report: $reportDirectory"
    [pscustomobject]@{ state = $state; reportDirectory = $reportDirectory }
}
catch {
    $state = if ($commitConfirmed) { 'committed-verification-incomplete' } elseif ($commitAttempted) { 'commit-outcome-unconfirmed' } else { 'stopped-before-write' }
    $detail = if ($commitAttempted) {
        'Check the saved originals and retry this script to inspect server state. The commit may already have succeeded; do not manually recreate or delete either record.'
    } else { 'Validation failed before any migration write was submitted.' }
    if ($reportDirectory) {
        try { Write-Report $state $detail } catch { Write-Warning 'Could not update the local migration report.' }
        Write-Host "Migration report: $reportDirectory"
    }
    if ($commitAttempted) { Write-Warning $detail }
    throw
}
finally {
    if ($transaction -and $headers.ContainsKey('Authorization')) {
        try { Invoke-Firestore ($apiRoot + ':rollback') @{ transaction = $transaction } | Out-Null }
        catch { Write-Warning 'The read transaction could not be closed; it will expire automatically.' }
    }
    $transaction = $null
    $headers.Clear()
    $tokenLines = $null
}
