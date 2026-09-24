#requires -Version 5.1
<#
.SYNOPSIS
Plans, grants or revokes one existing user's explicit course access.
.DESCRIPTION
Uses the signed-in gcloud operator's IAM permissions. Default mode is read-only
for cloud resources; -Apply performs one preconditioned, masked Firestore write.
Does not create accounts, infer enrolment, alter credentials or deploy code.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Email,
    [Parameter(Mandatory = $true)][string]$CourseId,
    [ValidateSet('learner', 'trainer', 'lto_admin')][string]$Role = 'learner',
    [string]$OrganizationId,
    [string]$ExpiresAt,
    [switch]$Revoke,
    [switch]$Apply
)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
$project = 'fb-agileai-university'
$headers = @{}
$tokenLines = $null
$reportFolder = $null
$commitAttempted = $false
$verified = $false
$report = $null
$utf8 = [System.Text.UTF8Encoding]::new($false)

function Get-PropertyValue($Object, [string]$Name) {
    if ($null -eq $Object) { return $null }
    $property = $Object.PSObject.Properties[$Name]
    if ($null -ne $property) { return $property.Value }
    return $null
}

function Get-StringField($Document, [string]$Name) {
    $field = Get-PropertyValue (Get-PropertyValue $Document 'fields') $Name
    if ($null -eq $field) { return $null }
    $value = Get-PropertyValue $field 'stringValue'
    if ($value -isnot [string]) { throw "Unexpected stored type for $Name. No replacement is allowed." }
    return $value
}

function ConvertTo-CanonicalJson($Value) {
    if ($null -eq $Value) { return 'null' }
    if ($Value -is [System.Collections.IDictionary]) {
        $pairs = @(foreach ($key in @($Value.Keys | Sort-Object -CaseSensitive)) {
            ($key | ConvertTo-Json -Compress) + ':' + (ConvertTo-CanonicalJson $Value[$key])
        })
        return '{' + ($pairs -join ',') + '}'
    }
    if ($Value -is [System.Management.Automation.PSCustomObject]) {
        $pairs = @(foreach ($property in @($Value.PSObject.Properties | Sort-Object Name -CaseSensitive)) {
            ($property.Name | ConvertTo-Json -Compress) + ':' + (ConvertTo-CanonicalJson $property.Value)
        })
        return '{' + ($pairs -join ',') + '}'
    }
    if ($Value -is [System.Collections.IEnumerable] -and $Value -isnot [string]) {
        return '[' + (@($Value | ForEach-Object { ConvertTo-CanonicalJson $_ }) -join ',') + ']'
    }
    return ($Value | ConvertTo-Json -Compress)
}

function ConvertFrom-DelJson([string]$Json) {
    # Older PowerShell versions turn ISO strings into DateTime, losing Firestore
    # nanoseconds. Temporarily prefix JSON string tokens (both keys and values)
    # so ConvertFrom-Json preserves every string exactly, then remove the prefix.
    $marker = 'DELJSON' + [guid]::NewGuid().ToString('N') + '_'
    $marked = [regex]::Replace($Json, '"(?:\\.|[^"\\])*"', [System.Text.RegularExpressions.MatchEvaluator]{
        param($match)
        return '"' + $marker + $match.Value.Substring(1)
    })
    function Restore-DelJson($Value) {
        if ($null -eq $Value) { return $null }
        if ($Value -is [string]) {
            if (-not $Value.StartsWith($marker, [StringComparison]::Ordinal)) { throw 'Unexpected JSON string conversion.' }
            return $Value.Substring($marker.Length)
        }
        if ($Value -is [System.Management.Automation.PSCustomObject]) {
            $restored = [ordered]@{}
            foreach ($property in $Value.PSObject.Properties) {
                if (-not $property.Name.StartsWith($marker, [StringComparison]::Ordinal)) { throw 'Unexpected JSON property conversion.' }
                $restored.Add($property.Name.Substring($marker.Length), (Restore-DelJson $property.Value))
            }
            return [pscustomobject]$restored
        }
        if ($Value -is [System.Collections.IList]) {
            $restored = [System.Collections.Generic.List[object]]::new()
            foreach ($item in $Value) { $restored.Add((Restore-DelJson $item)) }
            return ,($restored.ToArray())
        }
        return $Value
    }
    return Restore-DelJson ($marked | ConvertFrom-Json)
}

function Save-Report {
    if ($null -ne $reportFolder -and $null -ne $report) {
        [System.IO.File]::WriteAllText(
            (Join-Path $reportFolder 'report.json'),
            ($report | ConvertTo-Json -Depth 30), $utf8
        )
    }
}

function Invoke-DelRequest([string]$Method, [string]$Uri, $Body, [switch]$AllowNotFound) {
    $request = @{
        Method = $Method; Uri = $Uri; Headers = $headers
        ErrorAction = 'Stop'; TimeoutSec = 60; UseBasicParsing = $true
    }
    if ($null -ne $Body) {
        $request.ContentType = 'application/json; charset=utf-8'
        $request.Body = [System.Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 40 -Compress))
    }
    try {
        $response = Invoke-WebRequest @request
    }
    catch {
        $status = 0
        $response = Get-PropertyValue $_.Exception 'Response'
        if ($null -ne $response) {
            $code = Get-PropertyValue $response 'StatusCode'
            if ($null -ne $code) { $status = [int]$code }
        }
        if ($AllowNotFound -and $status -eq 404) { return $null }
        # Do not print the HTTP request, OAuth token, or arbitrary response body.
        if ($status -gt 0) {
            $details = @("HTTP $status", "API $(([uri]$Uri).DnsSafeHost)")
            try {
                $apiError = ($_.ErrorDetails.Message | ConvertFrom-Json).error
                $labels = @($apiError.status) + @($apiError.details | ForEach-Object { $_.reason })
                foreach ($label in $labels) {
                    if ($label -is [string] -and $label -cmatch '^[A-Z][A-Z0-9_]{0,79}$') {
                        $details += $label
                    }
                }
            } catch {}
            throw ('Google API request failed: ' + ($details -join '; ') + '.')
        }
        throw 'Google API request failed before a usable response was received.'
    }
    # Preserve Firestore nanosecond updateTime exactly for the write precondition.
    return ConvertFrom-DelJson $response.Content
}

function Resolve-DelUser {
    $result = Invoke-DelRequest 'Post' "https://identitytoolkit.googleapis.com/v1/projects/$project/accounts:lookup" @{ email = @($normalizedEmail) }
    $users = @(Get-PropertyValue $result 'users' | Where-Object { $null -ne $_ })
    if ($users.Count -ne 1) { throw 'Expected exactly one existing Firebase Authentication account for this email.' }
    $user = $users[0]
    $userEmail = Get-PropertyValue $user 'email'
    $userUid = Get-PropertyValue $user 'localId'
    if ($userEmail -isnot [string] -or $userEmail.Trim().ToLowerInvariant() -cne $normalizedEmail -or
        $userUid -isnot [string] -or [string]::IsNullOrWhiteSpace($userUid) -or $userUid.Length -gt 128 -or
        $userUid -cne $userUid.Trim() -or $userUid -match '[\x00-\x1f\x7f]') {
        throw 'Firebase account identity did not match the requested email.'
    }
    if (-not $Revoke) {
        $emailVerified = Get-PropertyValue $user 'emailVerified'
        if ($emailVerified -isnot [bool] -or -not $emailVerified) { throw 'The learner must verify the account email before an active grant can be assigned.' }
        if ((Get-PropertyValue $user 'disabled') -eq $true) { throw 'The account is disabled. Active access was not assigned.' }
    }
    return $userUid
}

function Assert-DelOrganization {
    if ($Revoke -or $Role -eq 'learner') { return }
    $org = Invoke-DelRequest 'Get' "$documentsRoot/trainingOrganizations/$OrganizationId" $null -AllowNotFound
    if ($null -eq $org -or (Get-PropertyValue $org 'name') -cne "$resourceRoot/trainingOrganizations/$OrganizationId" -or
        (Get-StringField $org 'organizationId') -cne $OrganizationId -or
        (Get-StringField $org 'status') -cne 'active') {
        throw 'The specified training organization is missing, inactive, or has conflicting identity metadata.'
    }
    $alias = Get-StringField $org 'organization_id'
    if ($null -ne $alias -and $alias -cne $OrganizationId) { throw 'The training organization has a conflicting identity alias.' }
}

function Assert-GrantIdentity($Document) {
    if ((Get-PropertyValue $Document 'name') -cne $documentName -or
        (Get-StringField $Document 'uid') -cne $uid -or
        (Get-StringField $Document 'courseId') -cne $CourseId) {
        throw 'Existing grant identity conflicts with the requested user/course. No replacement is allowed.'
    }
    $schemaField = Get-PropertyValue (Get-PropertyValue $Document 'fields') 'schema'
    $schemaValue = Get-PropertyValue $schemaField 'integerValue'
    if ($null -eq $schemaValue -or [string]$schemaValue -cne '1') {
        throw 'Existing grant has an unsupported schema. No replacement is allowed.'
    }
    $updateTime = Get-PropertyValue $Document 'updateTime'
    if ($updateTime -isnot [string] -or $updateTime -cnotmatch '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$') {
        throw 'Cannot preserve the exact Firestore updateTime precondition. Use PowerShell 7.5 or newer; no replacement is allowed.'
    }
}

try {
    $normalizedEmail = $Email.Trim().ToLowerInvariant()
    try { $mail = [System.Net.Mail.MailAddress]::new($normalizedEmail) }
    catch { throw 'Supply a single valid account email address.' }
    if ($mail.Address -cne $normalizedEmail -or $normalizedEmail.Length -ge 256) {
        throw 'Supply the account email only, without a display name.'
    }
    if ($CourseId -cnotmatch '^[A-Z][A-Z0-9-]{0,39}$') { throw 'CourseId must be an exact uppercase course ID from the local published catalog.' }
    if ($Revoke -and ($PSBoundParameters.ContainsKey('Role') -or $PSBoundParameters.ContainsKey('OrganizationId') -or $PSBoundParameters.ContainsKey('ExpiresAt'))) {
        throw 'Use -Revoke with Email and CourseId only; revocation preserves the existing role, organization and expiry.'
    }
    if (-not $Revoke) {
        if ($ExpiresAt -cnotmatch '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?Z$') {
            throw 'Supply an explicit future UTC expiry, for example 2026-10-01T18:30:00Z. No default lifetime is applied.'
        }
        $expiry = [DateTimeOffset]::MinValue
        if (-not [DateTimeOffset]::TryParse($ExpiresAt, [Globalization.CultureInfo]::InvariantCulture,
            [Globalization.DateTimeStyles]::AssumeUniversal, [ref]$expiry) -or $expiry -le [DateTimeOffset]::UtcNow) {
            throw 'ExpiresAt must be a valid date/time in the future.'
        }
        $expiryText = $expiry.UtcDateTime.ToString("yyyy-MM-ddTHH:mm:ss.fffffff'Z'", [Globalization.CultureInfo]::InvariantCulture)
        if ($Role -ne 'learner' -and $OrganizationId -cnotmatch '^[A-Za-z0-9_-]{1,100}$') {
            throw 'Trainer and LTO administrator access requires an explicit training organization ID.'
        }
        if ($Role -eq 'learner' -and -not [string]::IsNullOrWhiteSpace($OrganizationId)) {
            throw 'Learner grants do not require OrganizationId. Omit it; this tool does not enroll an organization.'
        }
    }

    $repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $catalogPath = Join-Path $repoRoot 'aau-backend/del/catalog.json'
    if (-not (Test-Path -LiteralPath $catalogPath -PathType Leaf)) { throw 'Run the installed tool from operations/laau-del after applying the DEL package; catalog.json was not found.' }
    $catalog = [System.IO.File]::ReadAllText($catalogPath) | ConvertFrom-Json
    if ((Get-PropertyValue $catalog 'schema') -ne 1) { throw 'Unsupported DEL catalog schema.' }
    $matchingCourses = @(Get-PropertyValue $catalog 'courses' | Where-Object { (Get-PropertyValue $_ 'id') -ceq $CourseId })
    if (-not $Revoke) {
        if ($matchingCourses.Count -ne 1) { throw 'Active access requires exactly one published course with this ID in the local catalog.' }
        $published = Get-PropertyValue $matchingCourses[0] 'published'
        if ($published -isnot [bool] -or -not $published) { throw 'Active access requires exactly one published course with this ID in the local catalog.' }
    }
    # Revocation is permitted even when a course has since been unpublished or removed.

    $accountLines = @(& gcloud auth list '--filter=status:ACTIVE' '--format=value(account)' --project=$project)
    if ($LASTEXITCODE -ne 0 -or $accountLines.Count -ne 1 -or [string]::IsNullOrWhiteSpace([string]$accountLines[0])) {
        throw 'Expected one active gcloud operator account. Sign in using the existing approved operator account.'
    }
    $operatorAccount = ([string]$accountLines[0]).Trim()
    # Avoid recording a different principal from the one that actually signs the request.
    $impersonation = @(& gcloud config get-value auth/impersonate_service_account --quiet 2>$null)
    if ($LASTEXITCODE -ne 0) { throw 'Unable to inspect gcloud impersonation configuration.' }
    if (@($impersonation | Where-Object { $_ -and ([string]$_).Trim() -ne '(unset)' }).Count -gt 0) {
        throw 'This tool expects direct gcloud operator credentials. An impersonated account is configured; no request was made.'
    }
    $tokenLines = @(& gcloud auth print-access-token --account=$operatorAccount --project=$project)
    if ($LASTEXITCODE -ne 0 -or $tokenLines.Count -ne 1 -or [string]::IsNullOrWhiteSpace([string]$tokenLines[0])) {
        throw 'Unable to use the existing gcloud sign-in.'
    }
    $headers.Authorization = 'Bearer ' + ([string]$tokenLines[0]).Trim()
    $headers['x-goog-user-project'] = $project
    $tokenLines = $null
    $resourceRoot = "projects/$project/databases/(default)/documents"
    $documentsRoot = "https://firestore.googleapis.com/v1/$resourceRoot"
    $uid = Resolve-DelUser
    Assert-DelOrganization

    $hasher = [System.Security.Cryptography.SHA256]::Create()
    try { $idBytes = $hasher.ComputeHash([Text.Encoding]::UTF8.GetBytes($uid + [char]0 + $CourseId)) }
    finally { $hasher.Dispose() }
    $documentId = ([BitConverter]::ToString($idBytes)).Replace('-', '').ToLowerInvariant()
    $documentName = "$resourceRoot/del_access/$documentId"
    $documentUri = "$documentsRoot/del_access/$documentId"
    $existing = Invoke-DelRequest 'Get' $documentUri $null -AllowNotFound
    if ($null -ne $existing) { Assert-GrantIdentity $existing }

    $reportFolder = Join-Path ([System.IO.Path]::GetTempPath()) ('LAAU-DEL-Access-' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $reportFolder | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $reportFolder 'original-grant.json'), ($existing | ConvertTo-Json -Depth 50), $utf8)
    $report = [ordered]@{
        schema = 1; project = $project; document = $documentName; email = $normalizedEmail
        uid = $uid; courseId = $CourseId; operator = $operatorAccount
        action = $(if ($Revoke) { 'revoke' } else { 'assign' })
        requestedAt = [DateTime]::UtcNow.ToString('o'); result = 'PLANNED'
        existingUpdateTime = $(if ($null -ne $existing) { Get-PropertyValue $existing 'updateTime' } else { $null })
    }
    if (-not $Revoke) {
        $report.role = $Role; $report.organizationId = $OrganizationId; $report.expiresAt = $expiryText
    }
    if ($Revoke -and $null -eq $existing) {
        $report.result = 'ALREADY_ABSENT'; Save-Report
        Write-Host "No grant exists for $normalizedEmail and $CourseId. Nothing changed."
        Write-Host "Report: $reportFolder"
        return
    }
    if ($Revoke -and (Get-StringField $existing 'status') -ceq 'revoked') {
        $report.result = 'ALREADY_REVOKED'; Save-Report
        Write-Host "The grant is already revoked. Nothing changed. Report: $reportFolder"
        return
    }

    $fields = [ordered]@{
        status = @{ stringValue = $(if ($Revoke) { 'revoked' } else { 'active' }) }
        assignedBy = @{ stringValue = $operatorAccount }
    }
    $mask = @('status', 'assignedBy')
    if (-not $Revoke) {
        $fields.schema = @{ integerValue = '1' }
        $fields.uid = @{ stringValue = $uid }
        $fields.courseId = @{ stringValue = $CourseId }
        $fields.role = @{ stringValue = $Role }
        $fields.expiresAt = @{ timestampValue = $expiryText }
        $mask += @('schema', 'uid', 'courseId', 'role', 'expiresAt', 'organizationId')
        if ($Role -ne 'learner') { $fields.organizationId = @{ stringValue = $OrganizationId } }
        # organizationId in the mask, but absent from a learner write, removes old staff binding.
    }
    $transforms = @(@{ fieldPath = 'updatedAt'; setToServerValue = 'REQUEST_TIME' })
    if ($null -eq $existing) { $transforms += @{ fieldPath = 'createdAt'; setToServerValue = 'REQUEST_TIME' } }
    $write = [ordered]@{
        update = @{ name = $documentName; fields = $fields }
        updateMask = @{ fieldPaths = $mask }
        updateTransforms = $transforms
        currentDocument = $(if ($null -eq $existing) { @{ exists = $false } } else { @{ updateTime = (Get-PropertyValue $existing 'updateTime') } })
    }
    $report.plannedWrite = $write
    Save-Report
    Write-Host "Project: $project"
    Write-Host "Account: $normalizedEmail (UID $uid)"
    Write-Host "Course: $CourseId"
    Write-Host "Action: $($report.action)"
    if (-not $Revoke) {
        Write-Host "Role: $Role; expires (UTC): $expiryText"
        if ($Role -ne 'learner') { Write-Host "Organization: $OrganizationId" }
    }
    Write-Host "Grant: del_access/$documentId"
    if (-not $Apply) {
        Write-Host "Read-only plan complete. Review $reportFolder/report.json; rerun the same command with -Apply to perform this one grant change."
        return
    }

    if ((Resolve-DelUser) -cne $uid) { throw 'Firebase account identity changed during review. No write was attempted.' }
    Assert-DelOrganization
    if (-not $Revoke -and $expiry -le [DateTimeOffset]::UtcNow) { throw 'The requested expiry elapsed during review. No write was attempted.' }
    $report.result = 'COMMIT_ATTEMPTED'; Save-Report
    $commitAttempted = $true
    $commit = Invoke-DelRequest 'Post' "${documentsRoot}:commit" @{ writes = @($write) }
    if (@(Get-PropertyValue $commit 'writeResults').Count -ne 1) { throw 'The grant write returned an unexpected result; inspect the saved report and server state.' }
    $after = Invoke-DelRequest 'Get' $documentUri $null
    Assert-GrantIdentity $after
    foreach ($fieldName in @($fields.Keys)) {
        $actual = Get-PropertyValue (Get-PropertyValue $after 'fields') $fieldName
        $expected = $fields[$fieldName]
        if ($fieldName -eq 'expiresAt') {
            $storedExpiry = Get-PropertyValue $actual 'timestampValue'
            $parsedExpiry = [DateTimeOffset]::MinValue
            if (-not [DateTimeOffset]::TryParse([string]$storedExpiry, [ref]$parsedExpiry) -or $parsedExpiry.UtcDateTime.Ticks -ne $expiry.UtcDateTime.Ticks) {
                throw 'Post-write verification failed for expiresAt.'
            }
        }
        else {
            $valueType = @($expected.Keys)[0]
            if ([string](Get-PropertyValue $actual $valueType) -cne [string]$expected[$valueType]) { throw "Post-write verification failed for $fieldName." }
        }
    }
    if (-not $Revoke -and $Role -eq 'learner' -and $null -ne (Get-PropertyValue (Get-PropertyValue $after 'fields') 'organizationId')) {
        throw 'Post-write verification found an unexpected organization binding on the learner grant.'
    }
    $updated = Get-PropertyValue (Get-PropertyValue (Get-PropertyValue $after 'fields') 'updatedAt') 'timestampValue'
    if ($null -eq $updated) { throw 'Post-write verification did not find the server update timestamp.' }
    if ($null -eq $existing) {
        if ($null -eq (Get-PropertyValue (Get-PropertyValue (Get-PropertyValue $after 'fields') 'createdAt') 'timestampValue')) {
            throw 'Post-write verification did not find the server creation timestamp.'
        }
    }
    else {
        foreach ($property in (Get-PropertyValue $existing 'fields').PSObject.Properties) {
            if ($mask -ccontains $property.Name -or $property.Name -ceq 'updatedAt') { continue }
            $afterValue = Get-PropertyValue (Get-PropertyValue $after 'fields') $property.Name
            if ((ConvertTo-CanonicalJson $afterValue) -cne (ConvertTo-CanonicalJson $property.Value)) {
                throw "Post-write verification found changed metadata outside the requested mask: $($property.Name)."
            }
        }
    }
    [System.IO.File]::WriteAllText((Join-Path $reportFolder 'verified-grant.json'), ($after | ConvertTo-Json -Depth 50), $utf8)
    $verified = $true
    $report.result = 'VERIFIED'; $report.verifiedUpdateTime = Get-PropertyValue $after 'updateTime'; Save-Report
    Write-Host "Verified: $($report.action) for $CourseId. No credentials, enrolments, payments, accounts or other grants were changed."
    Write-Host "Original grant and report: $reportFolder"
}
catch {
    if ($null -ne $report) {
        $report.result = $(if ($commitAttempted) { 'COMMIT_OUTCOME_REQUIRES_REVIEW' } else { 'STOPPED_BEFORE_WRITE' })
        try { Save-Report } catch { Write-Warning 'Could not update the local report.' }
    }
    if ($commitAttempted -and -not $verified) {
        Write-Warning 'The commit may have succeeded. Do not assume rollback or run blind retries. Run the same command without -Apply and compare the current grant with the saved report.'
    }
    if ($null -ne $reportFolder) { Write-Host "Review files: $reportFolder" }
    throw
}
finally {
    $headers.Clear()
    $tokenLines = $null
}
