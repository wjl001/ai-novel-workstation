$path = "d:\phpstudy_pro\WWW\ai-novel-workstation2.9\src\views\AIShortDrama\StoryboardView.vue"
$lines = Get-Content $path
if ($lines.Count -gt 13) {
    $line14 = $lines[13]
    Write-Host ("Line 14 (index 13): '$line14'")
    if ($line14.Length -ge 15) {
        $sub = $line14.Substring(10, 6)
        Write-Host ("Chars 10-15: '$sub'")
    }
} else {
    Write-Host ("File has fewer than 14 lines")
}