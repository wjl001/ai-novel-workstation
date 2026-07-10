
import os

files = [
    '用户操作说明书_Part1_Expanded.md',
    '用户操作说明书_Part2_Expanded.md',
    '用户操作说明书_Part3_Expanded.md'
]

full_content = ""
for f in files:
    path = os.path.join(r'd:\phpstudy_pro\WWW\ai-novel-workstation2.7', f)
    with open(path, 'r', encoding='utf-8') as file:
        full_content += file.read() + "\n\n"

# Calculate character count (Chinese characters + English words)
char_count = len(full_content)

print(f"Total Character Count: {char_count}")

# Save to a final md file
output_path = os.path.join(r'd:\phpstudy_pro\WWW\ai-novel-workstation2.7', 'AI短剧平台用户操作使用说明书_Final.md')
with open(output_path, 'w', encoding='utf-8') as out_file:
    out_file.write(full_content)

print(f"Merged file saved to: {output_path}")
