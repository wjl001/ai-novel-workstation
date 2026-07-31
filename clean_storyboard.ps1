$path = "d:\phpstudy_pro\WWW\ai-novel-workstation2.9\src\views\AIShortDrama\StoryboardView.vue"
$content = Get-Content $path -Raw

# Remove AI assistant dialog block if present
$aiStart = $content.IndexOf('<!-- AI Assistant Dialog - Modern C-end Premium Design -->')
if ($aiStart -ge 0) {
    $templateEnd = $content.IndexOf('</template>', $aiStart)
    if ($templateEnd -gt $aiStart) {
        $newContent = $content.Substring(0, $aiStart) + $content.Substring($templateEnd)
        $content = $newContent
    }
}

# Also remove floating button for AI Assistant
$floatBtn = $content.IndexOf('Floating Action Button for AI Assistant')
if ($floatBtn -ge 0) {
    $templateEnd = $content.IndexOf('</template>', $floatBtn)
    if ($templateEnd -gt $floatBtn) {
        $newContent = $content.Substring(0, $floatBtn) + $content.Substring($templateEnd)
        $content = $newContent
    }
}

# Fix truncated el-icon tags (unlikely but just in case)
$content = $content -replace '</el-i\s*>', '</el-icon>'

# Replace known corrupted Chinese mojibake
$corruptedMap = @{
    '鍒嗛暅瑙勫垯' = '分镜规划'
    '缂╁皬鏃堕棿杞' = '缩小时间轴'
    '澶уぇ鏃堕棿杞' = '放大时间轴'
    '鑷€閫傚簲鏃堕棿杞' = '适应时间轴'
    '閫€鍥' = '返回'
}
foreach ($key in $corruptedMap.Keys) {
    $pos = $content.IndexOf($key, [String]::OrdinalComparison)
    if ($pos -ge 0) {
        $content = $content.Remove($pos, $key.Length).Insert($pos, $corruptedMap[$key])
    }
}

# Write back
Set-Content $path -Value $content -Encoding UTF8
Write-Host "Cleanup completed."