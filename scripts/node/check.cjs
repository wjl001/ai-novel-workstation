const fs = require('fs');
const c = fs.readFileSync('src/views/FreeCanvas/index.vue', 'utf8');
console.log('len', c.length);
console.log('hasAudioNode', c.includes("import AudioNode"));
console.log('NodeDialog/comment lines:');
const lines = c.split(/\r?\n/);
lines.forEach((l, i) => {
  if (l.includes('NodeDialog') || (l.includes('对话') && l.includes('节点'))) {
    console.log((i+1), l);
  }
});
console.log('openNodeDialog idx', c.indexOf('const openNodeDialog'));
console.log('has scene3d', c.includes('scene3d'));
