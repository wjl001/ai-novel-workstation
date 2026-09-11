const fs = require('fs');
let content = fs.readFileSync('src/views/AIShortDrama/AssetsView.vue', 'utf8');
const strRegex = /'((?:[^'\\]|\\.)*?)'/g;
let count = 0;
content.replace(strRegex, (match, inner) => {
  if (inner.includes('\\n')) {
    console.log(match);
    count++;
  }
});
console.log('Total matches:', count);
