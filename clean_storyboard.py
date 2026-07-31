import re
import sys

file_path = r'd:\phpstudy_pro\WWW\ai-novel-workstation2.9\src\views\AIShortDrama\StoryboardView.vue'

with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Remove AI assistant dialog block if present
# Start from comment about AI Assistant Dialog through before the root </template>
ai_start = content.find('<!-- AI Assistant Dialog - Modern C-end Premium Design -->')
if ai_start != -1:
    # Find the first </template> after this point (root closing)
    template_end = content.find('</template>', ai_start)
    if template_end != -1:
        # Keep everything up to but not including root </template>, then continue from after it
        new_content = content[:ai_start] + content[template_end:]
        content = new_content

# Also remove any stray floating button for AI assistant
float_button = content.find('Floating Action Button for AI Assistant')
if float_button != -1:
    # Try to find the next </template> or a safe end point
    end_pos = content.find('</template>', float_button)
    if end_pos != -1:
        # Remove from float button start to before </template>
        content = content[:float_button] + content[end_pos:]

# Fix any truncated el-icon closing tags like </el-i followed by stuff
content = re.sub(r'</el-i\s*>', '</el_icon>', content)  # This shouldn't happen but just in case

# Replace common corrupted UTF-8 sequences with proper Chinese (heuristic)
# These are typical mojibake patterns from mixing encodings
corrupted_map = {
    '鍒嗛暅瑙勫垯': '分镜规划',
    '缂╁皬鏃堕棿杞': '缩小时间轴',
    '澶уぇ鏃堕棿杞': '放大时间轴',
    '鑷€閫傚簲鏃堕棿杞': '适应时间轴',
    '閫€鍥': '返回',
    '灏嗗彂澹侀煶': '将发声音频',  # example
}
for bad, good in corrupted_map.items():
    content = content.replace(bad, good)

# Write back with proper encoding
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleanup complete.")
