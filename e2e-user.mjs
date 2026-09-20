import { chromium } from 'playwright';
const BASE = 'https://122.51.209.229/ai-short-drama-creator/ai-short-drama-creator/assets';
const LOCAL_IMG = '/ai-short-drama-creator/images/design/gen-1789385876999-419c60cce55c.png';
const DEAD_AGNES_URL = 'https://' + 'platform-out.' + 'agnes-ai' + '.com/dead/expired-link-12345.png';
// 模拟用户真实存量: 3个死Agnes链接主体 + 1个本地图主体
const seedSubjects = [
  { id: 'char-1', name: '角色甲', type: 'character', image: DEAD_AGNES_URL, description: '28岁女角', prompt: '一个女孩，28岁，短发' },
  { id: 'char-2', name: '角色乙', type: 'character', image: LOCAL_IMG, description: '30岁男角', prompt: '一个男孩，30岁，休闲装' },
  { id: 'scene-1', name: '公司会议室', type: 'scene', image: DEAD_AGNES_URL, description: '现代会议室', prompt: '会议室，落地窗' }
];

const browser = await chromium.launch({ headless: true, executablePath: '/root/.agent-browser/browsers/chrome-151.0.7922.34/chrome', args: ['--no-sandbox','--disable-gpu'] });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
// 关键: addInitScript 在页面任何脚本执行前种数据 = 用户浏览器本来就有存量数据
await ctx.addInitScript((args) => {
  localStorage.setItem('token', 'test-token-repro');
  localStorage.setItem('episode_store', JSON.stringify({
    episodes: [{ id: 'ep1', index: 1, title: '第一集', duration: '2min', poster: '', gif: '',
      scriptStatus: 'success', assetsStatus: 'success', storyboardStatus: 'pending', synthesisStatus: 'pending',
      storyboardGenerated: false, status: 'success' }],
    subjectId: null, isGeneratingBatch: false, batchProgress: 0, currentDramaTitle: '用户存量剧本',
    lastUsedSubjectIds: [], generationStatus: { isGenerating: false, type: '', progress: 0, currentIndex: -1, totalCount: 0 },
    subjects: args
  }));
}, seedSubjects);

const page = await ctx.newPage();
const migLogs = [];
page.on('console', m => { const t = m.text(); if (t.includes('[迁移]')) migLogs.push(t); });
page.on('pageerror', e => migLogs.push('[pageerror] ' + e.message.slice(0, 150)));

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(12000);

console.log('=== 页面状态 ===');
console.log('URL:', page.url());
const subs = await page.evaluate(() => {
  const raw = localStorage.getItem('episode_store') || '';
  const parsed = raw ? JSON.parse(raw) : {};
  return {
    len: raw.length,
    dramaTitle: parsed.currentDramaTitle,
    subjects: (parsed.subjects || []).map(s => ({ name: s.name, img: (s.image || '').slice(0, 70) }))
  };
});
console.log('localStorage episode_store 长度:', subs.len, '| dramaTitle:', subs.dramaTitle);
console.log('subjects:');
subs.subjects.forEach(s => console.log('  ' + s.name + ': ' + (s.img || '(空)')));

console.log('\n=== 迁移日志 ===');
migLogs.forEach(l => console.log('  ' + l.slice(0, 140)));

const cards = await page.evaluate(() => ({
  text: document.body.innerText.includes('主体库目前是空的') ? '空状态页' : '有资产页',
  imgs: [...document.querySelectorAll('img')].filter(i => i.src.includes('/images/design/')).map(i => ({ src: i.src.slice(0, 80), ok: i.complete && i.naturalWidth > 0 }))
}));
console.log('\n=== 页面渲染 ===', cards.text);
cards.imgs.forEach(c => console.log('  ' + (c.ok ? 'OK  ' : 'FAIL') + ' ' + c.src));

await page.screenshot({ path: '/tmp/user-scenario.png' });
await browser.close();

const a = subs.subjects.find(s => s.name === '角色甲');
const b = subs.subjects.find(s => s.name === '角色乙');
const c = subs.subjects.find(s => s.name === '公司会议室');
const isDeadAgnes = (u) => /agnes-ai\.com/i.test(u || '');
const isLocalDesign = (u) => (u || '').includes('/images/design/');
console.log('\n=== 最终断言 ===');
console.log('死Agnes链接主体(角色甲): ' + (a ? (!isDeadAgnes(a.img) ? (a.img ? '已脱离死链(占位/本地) [PASS]' : '已清空待重生成 [PASS]') : '仍是死链 [FAIL]') : '主体丢失 [FAIL]'));
console.log('本地图主体(角色乙): ' + (b ? (isLocalDesign(b.img) && b.img.includes('gen-1789385876999') ? '保持不变 [PASS]' : '被动了 [FAIL] ' + b.img) : '主体丢失 [FAIL]'));
console.log('场景死链(公司会议室): ' + (c ? (!isDeadAgnes(c.img) ? '已脱离死链 [PASS]' : '仍是死链 [FAIL]') : '主体丢失 [FAIL]'));
console.log('\n场景测试 done');
