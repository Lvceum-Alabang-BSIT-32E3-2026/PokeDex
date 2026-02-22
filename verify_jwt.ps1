$ErrorActionPreference = "Stop"

# Configuration
$baseUrl = "http://localhost:5268"
$registerUrl = "$baseUrl/api/auth/register"
$loginUrl = "$baseUrl/api/auth/login"
$projectPath = "IdentityServerApi/IdentityServerApi.csproj"

# Unique user for this run
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "testuser_$timestamp@example.com"
$password = "Test@123"
$username = "testuser_$timestamp"
$displayName = "Test User $timestamp"

Write-Host "Starting IdentityServerApi..."
$process = Start-Process dotnet -ArgumentList "run --project $projectPath" -PassThru -NoNewWindow
Start-Sleep -Seconds 10 # Wait for server to start

try {
    # 1. Register
    Write-Host "Registering user: $email"
    $registerBody = @{
        email = $email
        password = $password
        username = $username
        displayName = $displayName
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri $registerUrl -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "Registration successful: $($registerResponse.message)"

    # 2. Login
    Write-Host "Logging in..."
    $loginBody = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login successful. Token received."

    # 3. Decode Token (without verifying signature, just checking claims)
    $parts = $token.Split('.')
    if ($parts.Length -ne 3) { throw "Invalid JWT format" }
    
    # Pad base64 string
    $payload = $parts[1]
    switch ($payload.Length % 4) {
        2 { $payload += "==" }
        3 { $payload += "=" }
    }
    
    $decodedBytes = [System.Convert]::FromBase64String($payload)
    $decodedJson = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
    $claims = $decodedJson | ConvertFrom-Json

    Write-Host "`nToken Claims:"
    Write-Host $decodedJson

    # 4. Verify Claims
    Write-Host "`nVerifying Claims..."

    # Helper to get claim value regardless of casing or full URI
    function Get-Claim {
        param($obj, $shortName, $longName)
        if ($obj.PSObject.Properties[$shortName]) { return $obj.$shortName }
        if ($obj.PSObject.Properties[$longName]) { return $obj.$longName }
        return $null
    }

    $nameId = Get-Claim $claims "nameid" "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    $emailClaim = Get-Claim $claims "email" "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    $nameClaim = Get-Claim $claims "unique_name" "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
    # Fallback for name if unique_name isn't used by default mapper
    if (-not $nameClaim) { $nameClaim = Get-Claim $claims "name" "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name" }

    $displayNameClaim = $claims.displayName
    $roleClaim = Get-Claim $claims "role" "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"

    if (-not $nameId) { throw "Missing NameIdentifier claim" }
    if ($emailClaim -ne $email) { throw "Email claim mismatch. Expected: $email, Got: $emailClaim" }
    if ($nameClaim -ne $username) { throw "Name claim mismatch. Expected: $username, Got: $nameClaim" }
    if (-not $displayNameClaim) { throw "Missing displayName claim" }
    if (-not $roleClaim) { throw "Missing role claim" }

    Write-Host "SUCCESS: All required claims are present and correct."

}
catch {
    Write-Host "ERROR: $_"
    exit 1
}
finally {
    Write-Host "Stopping IdentityServerApi..."
    Stop-Process -Id $process.Id -Force
}
