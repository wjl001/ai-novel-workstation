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

  // 1. Replace objects with \n
  const objRegex = /\{\s*text:\s*(['"`])((?:(?!\1)[^\\]|\\.)*?)\1,\s*image:\s*([^\s}]+)\s*\}/g;
  content = content.replace(objRegex, (match, quote, inner, image) => {
    if (!inner.includes('\\n')) return match;
    
    let parts = inner.split(/\\n\s*(?:-\s*)?/);
    parts = parts.map(p => p.trim()).filter(p => p.length > 0);
    
    let first = parts[0];
    let rest = parts.slice(1);
    
    let res = `{\n            text: ${quote}${first}${quote},\n            image: ${image}\n          }`;
    if (rest.length > 0) {
      res += ',\n          ' + rest.map(p => `${quote}${p}${quote}`).join(',\n          ');
    }
    return res;
  });

  // 2. Replace simple string literals with \n
  const strRegex = /'((?:[^'\\]|\\.)*?)'/g;
  content = content.replace(strRegex, (match, inner) => {
    // Check if it has \n and looks like we should split it
    if (inner.includes('\\n')) {
      let parts = inner.split(/\\n\s*(?:-\s*)?/);
      parts = parts.map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length > 1) {
        return parts.map(p => `'${p}'`).join(',\n          ');
      }
    }
    return match;
  });
  
  // also handle double quoted strings just in case
  const doubleStrRegex = /"((?:[^"\\]|\\.)*?)"/g;
  content = content.replace(doubleStrRegex, (match, inner) => {
    if (inner.includes('\\n') && !match.includes('{') && !match.includes('}')) {
      let parts = inner.split(/\\n\s*(?:-\s*)?/);
      parts = parts.map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length > 1) {
        return parts.map(p => `"${p}"`).join(',\n          ');
      }
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});