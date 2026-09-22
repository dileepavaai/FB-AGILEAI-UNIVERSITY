#Requires -Version 5.1
[CmdletBinding()]
param([switch]$Apply)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
Set-StrictMode -Version Latest
$project = 'fb-agileai-university'
$version = '20260922-trainer-identity-1'
$oldId = 'TRN-AAU-X7K4'
$newId = 'TRN-LAAU-X7K4'
$documentsRoot = "projects/$project/databases/(default)/documents"
$apiRoot = "https://firestore.googleapis.com/v1/$documentsRoot"
$trainerName = "$documentsRoot/trainerRegistry/rQpJj2UXbfepcsD6Skmo"
$credentialName = "$documentsRoot/credentials/OHhS6Dd74UqEZFL7xUkW"
$oldDirectName = "$documentsRoot/trainerRegistry/$oldId"
$newDirectName = "$documentsRoot/trainerRegistry/$newId"
$batchSpecs = @(
    @{ id = 'AOP_V1_2025'; status = 'locked'; program = 'AOP'; code = 'AOP_V1_2025' },
    @{ id = 'J8SMWdyGrMXlUgndQKTQ'; status = 'draft'; program = 'AIPA'; code = $null },
    @{ id = 'UVTnmWvqnnzHnIv4Codt'; status = 'draft'; program = 'AOP'; code = $null },
    @{ id = 'zJepvF0hpqbIo6kzIKje'; status = 'draft'; program = 'AOP'; code = $null }
)
$batchNames = @($batchSpecs | ForEach-Object { "$documentsRoot/batches/$($_.id)" })
$requiredNames = @($trainerName, $credentialName) + $batchNames
$readNames = $requiredNames + @($oldDirectName, $newDirectName)
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
    if ($actual -cne $Expected) { throw "Unexpected $Field in a reviewed record." }
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

function Set-StringValue($Fields, [string]$Field, [string]$Value) {
    $Fields | Add-Member -MemberType NoteProperty -Name $Field -Value ([pscustomobject]@{ stringValue = $Value }) -Force
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

function Read-Documents([string]$TransactionId) {
    $body = @{ documents = $readNames }
    if ($TransactionId) { $body['transaction'] = $TransactionId }
    $responses = @(Invoke-Firestore ($apiRoot + ':batchGet') $body)
    $documents = @{}
    foreach ($response in $responses) {
        $found = Get-Property $response 'found'
        $missing = Get-Property $response 'missing'
        $name = if ($null -ne $found) { Get-Property $found 'name' } else { $missing }
        if ($name -cnotin $readNames -or $documents.ContainsKey($name)) {
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
    if ($documents.Count -ne $readNames.Count) { throw 'Firestore did not return every reviewed document state.' }
    return $documents
}

function Assert-MigrationState($Documents) {
    foreach ($name in $requiredNames) {
        if ($null -eq $Documents[$name]) { throw 'A reviewed trainer, batch or credential document is missing.' }
    }
    foreach ($name in @($oldDirectName, $newDirectName)) {
        if ($null -ne $Documents[$name]) { throw 'A trainer document exists at a reserved old or new trainer-ID path. Review the direct-ID collision.' }
    }
    $trainer = $Documents[$trainerName]
    Assert-StringField $trainer 'trainerName' 'Dileep Appupillai'
    Assert-StringField $trainer 'trainer_name' 'Dileep Appupillai' -Optional
    Assert-StringField $trainer 'organizationId' 'ORG-LAAU-X7K4P2MN'
    Assert-StringField $trainer 'organization_id' 'ORG-LAAU-X7K4P2MN' -Optional
    Assert-StringField $trainer 'status' 'active'
    $actualId = Get-StringField $trainer 'trainerId'
    if ($actualId -cnotin @($oldId, $newId)) { throw 'The trainer has an unexpected trainerId.' }
    Assert-StringField $trainer 'trainer_id' $actualId -Optional
    Assert-StringField $trainer 'legacy_trainer_id' $oldId -Optional:($actualId -ceq $oldId)
    Assert-StringField $trainer 'legacyTrainerId' $oldId -Optional

    foreach ($spec in $batchSpecs) {
        $batch = $Documents["$documentsRoot/batches/$($spec.id)"]
        Assert-StringField $batch 'trainerId' $actualId
        Assert-StringField $batch 'trainer_id' $actualId -Optional
        Assert-StringField $batch 'status' $spec.status
        Assert-StringField $batch 'program_code' $spec.program
        Assert-StringField $batch 'programCode' $spec.program -Optional
        if ($null -ne $spec.code) { Assert-StringField $batch 'batch_code' $spec.code }
    }
    # This credential establishes the reviewed batch binding; it is never written.
    $credential = $Documents[$credentialName]
    Assert-StringField $credential 'credential_id' 'LAAU-KO9JK02Z'
    Assert-StringField $credential 'credentialId' 'LAAU-KO9JK02Z' -Optional
    Assert-StringField $credential 'batch_id' 'UVTnmWvqnnzHnIv4Codt'
    Assert-StringField $credential 'batchId' 'UVTnmWvqnnzHnIv4Codt' -Optional
    Assert-StringField $credential 'program_code' 'AOP'
    Assert-StringField $credential 'programCode' 'AOP' -Optional
    foreach ($field in @('trainerId', 'trainer_id')) {
        if ($null -ne (Get-Property (Get-Property $credential 'fields') $field)) {
            throw 'The reviewed credential has a direct trainer reference. Review it before this batch-only migration.'
        }
    }
    if ($actualId -ceq $oldId) { return 'ready' }
    return 'already-migrated'
}

function Assert-ReferenceScope([string]$TransactionId) {
    foreach ($collection in @('trainerRegistry', 'batches', 'credentials')) {
        $fields = if ($collection -ceq 'trainerRegistry') {
            @('trainerId', 'trainer_id', 'legacy_trainer_id', 'legacyTrainerId')
        } else { @('trainerId', 'trainer_id') }
        $expectedNames = @(if ($collection -ceq 'trainerRegistry') { $trainerName }
            elseif ($collection -ceq 'batches') { $batchNames })
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
            $foundNames = @()
            foreach ($document in $found) {
                $name = Get-Property $document 'name'
                if ($name -cnotin $expectedNames -or $name -cin $foundNames) {
                    throw 'An additional trainer alias, batch or direct credential trainer reference exists. Review the new reference before migrating.'
                }
                $foundNames += $name
            }
            if ($field -ceq 'trainerId' -and $foundNames.Count -ne $expectedNames.Count) {
                throw 'Primary trainer reference query does not match the reviewed document set.'
            }
        }
    }
}

function New-Writes($Documents) {
    $writes = @()
    foreach ($name in (@($trainerName) + $batchNames)) {
        $document = $Documents[$name]
        $fields = [ordered]@{ trainerId = @{ stringValue = $newId } }
        $mask = @('trainerId')
        if ($name -ceq $trainerName) {
            $fields['legacy_trainer_id'] = @{ stringValue = $oldId }
            $mask += 'legacy_trainer_id'
        }
        if ($null -ne (Get-Property (Get-Property $document 'fields') 'trainer_id')) {
            $fields['trainer_id'] = @{ stringValue = $newId }
            $mask += 'trainer_id'
        }
        $writes += @{
            update = @{ name = $name; fields = $fields }
            updateMask = @{ fieldPaths = $mask }
            currentDocument = @{ updateTime = (Get-Property $document 'updateTime') }
        }
    }
    return $writes
}

function Write-Report([string]$State, [string]$Detail) {
    if ($null -eq $reportDirectory) { return }
    Save-Json (Join-Path $reportDirectory 'migration-result.json') ([ordered]@{
        version = $version; project = $project; database = '(default)'; state = $State
        utc = [DateTime]::UtcNow.ToString('o'); oldTrainerId = $oldId; newTrainerId = $newId
        trainerDocumentId = 'rQpJj2UXbfepcsD6Skmo'; batchDocumentIds = @($batchSpecs | ForEach-Object { $_.id })
        credentialDocumentId = 'OHhS6Dd74UqEZFL7xUkW'; credentialWritten = $false
        commitAttempted = $commitAttempted; commitConfirmed = $commitConfirmed; detail = $Detail
    })
}

try {
    Get-Command gcloud -ErrorAction Stop | Out-Null
    $tokenLines = @(gcloud auth print-access-token --project=$project)
    if ($LASTEXITCODE -ne 0 -or $tokenLines.Count -ne 1 -or [string]::IsNullOrWhiteSpace($tokenLines[0])) {
        throw 'Unable to use the existing gcloud sign-in.'
    }
    $headers['Authorization'] = 'Bearer ' + $tokenLines[0].Trim()
    $tokenLines = $null
    $options = if ($Apply) { @{ readWrite = @{} } } else { @{ readOnly = @{} } }
    $start = Invoke-Firestore ($apiRoot + ':beginTransaction') @{ options = $options }
    $transaction = Get-Property $start 'transaction'
    if ($transaction -isnot [string] -or [string]::IsNullOrEmpty($transaction)) { throw 'Firestore did not return a transaction.' }
    $documents = Read-Documents $transaction
    $state = Assert-MigrationState $documents
    Assert-ReferenceScope $transaction
    $reportDirectory = Join-Path ([IO.Path]::GetTempPath()) ('LAAU-Trainer-Migration-' + [guid]::NewGuid().ToString('N'))
    [void][IO.Directory]::CreateDirectory($reportDirectory)
    Write-Report $state 'Fresh reviewed trainer, four batches, credential binding and all trainer aliases checked.'
    if ($state -ceq 'already-migrated') {
        Write-Host 'Trainer identity and all four batch links are already migrated; no data writes are needed.'
    } elseif (-not $Apply) {
        $state = 'planned'
        Write-Report $state 'Read-only preflight passed. No records changed.'
        Write-Host "Plan: $oldId -> $newId; update trainer identity and four batch trainer references atomically."
        Write-Host 'Read-only preflight complete. The locked batch remains locked; credential records are not edited.'
    } else {
        $writes = @(New-Writes $documents)
        Save-Json (Join-Path $reportDirectory 'original-records.json') ([ordered]@{
            version = $version; project = $project; capturedAtUtc = [DateTime]::UtcNow.ToString('o')
            records = @($requiredNames | ForEach-Object { $documents[$_] })
            absentTrainerDocumentPaths = @($oldDirectName, $newDirectName)
        })
        Save-Json (Join-Path $reportDirectory 'planned-writes.json') @{ writes = $writes }
        Write-Report 'prepared' 'Full originals backed up. Ready for one atomic five-write commit.'
        $commitAttempted = $true
        Write-Report 'commit-submitted' 'If interrupted, rerun to inspect actual server state. No automatic reversal is attempted.'
        $result = Invoke-Firestore ($apiRoot + ':commit') @{ transaction = $transaction; writes = $writes }
        if (@(Get-Property $result 'writeResults').Count -ne 5 -or -not (Get-Property $result 'commitTime')) {
            throw 'The commit response was incomplete. Rerun to inspect the actual server state.'
        }
        $commitConfirmed = $true
        $transaction = $null
        $verified = Read-Documents ''
        if ((Assert-MigrationState $verified) -cne 'already-migrated') { throw 'Post-commit trainer identity check failed.' }
        foreach ($write in $writes) {
            $name = $write.update.name
            $expectedFields = Read-Json (ConvertTo-Json -InputObject (Get-Property $documents[$name] 'fields') -Depth 100 -Compress)
            foreach ($field in $write.updateMask.fieldPaths) { Set-StringValue $expectedFields $field $write.update.fields[$field].stringValue }
            Assert-EqualFields (Get-Property $verified[$name] 'fields') $expectedFields 'trainer or batch'
            if ((Get-Property $verified[$name] 'createTime') -cne (Get-Property $documents[$name] 'createTime')) {
                throw 'A reviewed trainer or batch creation timestamp changed unexpectedly.'
            }
        }
        Assert-EqualFields $verified[$credentialName] $documents[$credentialName] 'read-only credential'
        Assert-ReferenceScope ''
        Write-Report 'migrated' 'Atomic trainer identity and four batch link updates confirmed; full fields and unchanged credential read back.'
        Write-Host "Migrated trainer ID to $newId and updated all four existing batch links."
        Write-Host 'Physical document IDs and batch statuses are unchanged. The locked batch remains locked; no credential was edited.'
        $state = 'migrated'
    }
    Write-Host "Migration report: $reportDirectory"
    [pscustomobject]@{ state = $state; reportDirectory = $reportDirectory }
}
catch {
    $state = if ($commitConfirmed) { 'committed-verification-incomplete' } elseif ($commitAttempted) { 'commit-outcome-unconfirmed' } else { 'stopped-before-write' }
    $detail = if ($commitAttempted) {
        'Check the saved originals and retry this script to inspect server state. The atomic commit may already have succeeded; do not manually edit individual trainer or batch references.'
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
