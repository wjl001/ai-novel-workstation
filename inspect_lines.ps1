$path = "d:\phpstudy_pro\WWW\ai-novel-workstation2.9\src\views\AIShortDrama\StoryboardView.vue"
$lines = Get-Content $path
Write-Host "Lines 9-15 (indices 8-14):"
for ($i = 8; $i -lt 15; $i++) {
    if ($i -lt $lines.Count) {
        Write-Host ("[{0}] {1}" -f $i, $lines[$i])
    } else {
        Write-Host "[{index out of range}]"
    }
}