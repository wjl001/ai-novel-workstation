const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // We are looking for something like:
  // '***功能说明 (2.2版本)：** \n - **编辑锁定：** 一旦完成“主体设置”且生成了“分镜视频”，剧本正文将自动锁定为只读状态。'
  
  // Regex to match a string wrapped in single quotes that contains '\n'
  // and splits it into multiple single-quoted strings separated by comma
  const regex = /'([^']*?\\n[^']*)'/g;
  
  content = content.replace(regex, (match, inner) => {
    // split by \n with optional hyphen
    let parts = inner.split(/\\n\s*(?:-\s*)?/);
    parts = parts.map(p => p.trim()).filter(p => p.length > 0);
    
    if (parts.length > 1) {
      // Create new multi-line string array
      return parts.map(p => `'${p}'`).join(',\n          ');
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    fs.appendFileSync('update_log.txt', `Updated: ${filePath}\n`);
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.vue')) {
      processFile(fullPath);
    }
  }
}

console.log('Starting replace...');
traverseDir(path.join(__dirname, 'src/views'));
console.log('Done!');
