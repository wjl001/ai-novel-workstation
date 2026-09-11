$path = "d:\phpstudy_pro\WWW\ai-novel-workstation2.9\src\views\AIShortDrama\StoryboardView.vue"
$content = Get-Content $path -Raw
# Remove leading BOM if present
if ($content.StartsWith([char]0xFEFF)) {
    $content = $content.Substring(1)
}
Set-Content $path -Value $content -Encoding UTF8
Write-Host "File cleaned (BOM removed if present)"