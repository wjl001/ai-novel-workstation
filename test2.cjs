const fs = require('fs');

const files = [
  'src/views/AIShortDrama/EpisodesView.vue',
  'src/views/AIShortDrama/DramaWorks.vue',
  'src/views/AIShortDrama/StoryboardView.vue',
  'src/views/AIShortDrama/NewDrama.vue',
  'src/views/AIShortDrama/OutlineView.vue',
  'src/views/AIShortDrama/AssetsView.vue',
  'src/views/AIShortDrama/DramaCreatorLayout.vue',
  'src/views/AIShortDrama/ScriptView.vue',
  'src/views/AIShortDrama/SynthesisView.vue',
  'src/views/AIShortDrama/VideoView.vue',
  'src/views/AIScriptWriting/Editor.vue',
  'src/views/AIScriptWriting/AIWriteNovel.vue',
  'src/views/AIDrama/HomeView.vue',
  'src/views/AIScriptWriting/Projects.vue',
  'src/views/AIScriptWriting/NovelGenerator.vue'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // We only want to replace ` \n - ` or `\n - ` or ` \n ` or `\n ` inside single-quoted strings that are inside arrays.
  // Actually, we can just use a regex that matches the single quoted string containing \n.
  const singleQuoteRegex = /'([^'\\]*(?:\\.[^'\\]*)*)'/g;
  
  content = content.replace(singleQuoteRegex, (match, inner) => {
    if (inner.includes('\\n')) {
      let parts = inner.split(/\\n\s*(?:-\s*)?/);
      parts = parts.map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length > 1) {
        return parts.map(p => `'${p}'`).join(',\n          ');
      }
    }
    return match;
  });
  
  // Also we need to handle the objects like { text: '...', image: ... }
  // Since we already matched single quotes, if the single quote was inside an object, it was replaced.
  // E.g. { text: 'a', 'b', image: img } -> this is INVALID syntax!
  // Let's check if there are any `{ text: '... \n ...' }`
  // Actually, in NewDrama.vue, we had that.
  
});
