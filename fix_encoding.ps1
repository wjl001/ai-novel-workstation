$path = "d:\phpstudy_pro\WWW\ai-novel-workstation2.9\src\views\AIShortDrama\StoryboardView.vue"
$content = Get-Content $path -Raw
# Remove leading BOM if present (U+FEFF)
if ($content.StartsWith([char]0xFEFF)) {
    $content = $content.Substring(1)
}
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8NoBom)
Write-Host "Encoding fixed."