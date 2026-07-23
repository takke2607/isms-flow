$base = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$dirs = @(
    'apps\api\src\api\v1',
    'apps\api\src\core',
    'apps\api\src\models',
    'apps\api\src\schemas',
    'apps\api\src\services',
    'apps\api\src\db',
    'apps\api\src\seed',
    'apps\web\src\app',
    'apps\web\src\components\ui',
    'apps\web\src\components\layout',
    'apps\web\src\features\dashboard',
    'apps\web\src\features\controls',
    'apps\web\src\features\compliance',
    'apps\web\src\hooks',
    'apps\web\src\lib',
    'apps\web\src\types',
    'apps\web\public',
    'packages\shared',
    'database\seed',
    'database\migrations',
    'docs'
)

foreach ($d in $dirs) {
    $full = "$base\$d"
    if (-not (Test-Path $full)) {
        [System.IO.Directory]::CreateDirectory($full) | Out-Null
    }
    Write-Host "OK: $full"
}

Write-Host 'Done.'
