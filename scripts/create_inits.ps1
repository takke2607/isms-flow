$base = Join-Path $PSScriptRoot "..\apps\api\src"
$initFiles = @(
    '__init__.py',
    'core\__init__.py',
    'models\__init__.py',
    'schemas\__init__.py',
    'services\__init__.py',
    'db\__init__.py',
    'seed\__init__.py',
    'api\__init__.py'
)
foreach ($fileName in $initFiles) {
    $fullPath = Join-Path $base $fileName
    [System.IO.File]::WriteAllText($fullPath, '')
    Write-Host "Created: $fullPath"
}
Write-Host 'All __init__.py files created.'
