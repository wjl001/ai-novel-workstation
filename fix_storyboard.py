import re

file_path = r'd:\phpstudy_pro\WWW\ai-novel-workstation2.9\src\views\AIShortDrama\StoryboardView.vue'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of the AI assistant block
start_marker = '<!-- AI Assistant Dialog - Modern C-end Premium Design -->'
end_marker = '</template>'

start_idx = content.find(start_marker)
if start_idx == -1:
    print("ERROR: Start marker not found!")
    exit(1)

# Find the closing </template> AFTER the start marker
template_end = content.find(end_marker, start_idx)
if template_end == -1:
    print("ERROR: </template> not found after start marker!")
    exit(1)

# Delete from start_marker up to (but not including) the </template>
new_content = content[:start_idx] + content[template_end:]

# Also fix the episodeNotFound template issue at line 98 if still present
# Ensure the v-if template has a closing tag before v-else
old_episode = '''<h1 class="text-[14px] font-black text-slate-700 dark:text-slate-200 truncate max-w-[300px] group-hover:text-indigo-600 transition-colors">
              <template v-if="episodeNotFound">
                视频不存在

              <template v-else>'''
new_episode = '''<h1 class="text-[14px] font-black text-slate-700 dark:text-slate-200 truncate max-w-[300px] group-hover:text-indigo-600 transition-colors">
              <template v-if="episodeNotFound">
                视频不存在
              </template>
              <template v-else>'''
new_content = new_content.replace(old_episode, new_episode)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("SUCCESS: AI assistant code removed, template balance fixed.")
print(f"Removed from char {start_idx} to {template_end}")
