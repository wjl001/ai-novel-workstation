$path = "d:\phpstudy_pro\WWW\ai-novel-workstation2.9\src\views\AIShortDrama\StoryboardView.vue"
$content = Get-Content $path -Raw
if ($content.StartsWith([char]0xFEFF)) { $content = $content.Substring(1) }
# Use UTF8 without BOM via the static property
$enc = [System.Text.Encoding]::UTF8
# Ensure no BOM by creating a new instance with noBOM flag
$noBom = New-Object System.Text.UTF8Encoding $false, $false
[System.IO.File]::WriteAllText($path, $content, $noBom)
Write-Host "Fixed: encoding applied."