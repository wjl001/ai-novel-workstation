import { chromium } from 'playwright';
const BASE = 'https://122.51.209.229/ai-short-drama-creator/ai-short-drama-creator/assets';
const LOCAL_IMG = '/ai-short-drama-creator/images/design/gen-1789385876999-419c60cce55c.png';
// 拼接避免完整域名字面量被写坏: 死 Agnes 临时 CDN 链接
const DEAD_AGNES_URL = 'https://' + 'platform-out.' + 'agnes-ai' + '.com/dead/expired-link-12345.png';

const browser = await chromium.launch({ headless: true, executablePath: '/root/.agent-browser/browsers/chrome-151.0.7922.34/chrome', args: ['--no-sandbox','--disable-gpu'] });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
await ctx.addInitScript(() => localStorage.setItem('token', 'test-token-repro'));
const page = await ctx.newPage();

// 先导航建立 origin
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });

// 在页面里写存量数据(模拟用户): 死Agnes链接主体 + 本地图主体
await page.evaluate((dead, local) => {
  localStorage.setItem('episode_store', JSON.stringify({
    episodes: [{ id:'ep1', index:1, title:'第一集', duration:'2min', poster:'', gif:'',
      scriptStatus:'success', assetsStatus:'success', storyboardStatus:'pending', synthesisStatus:'pending',
      storyboardGenerated:false, status:'success' }],
    subjectId:null, isGeneratingBatch:false, batchProgress:0, currentDramaTitle:'迁移测试剧本',
    lastUsedSubjectIds:[], generationStatus:{ isGenerating:false, type:'', progress:0, currentIndex:-1, totalCount:0 },
    subjects: [
      { id:'char-1', name:'角色甲', type:'character', image: dead, description:'28岁女角', prompt:'一个女孩，28岁，短发' },
      { id:'char-2', name:'角色乙', type:'character', image: local, description:'30岁男角', prompt:'一个男孩，30岁，休闲装' }
    ]
  }));
}, [DEAD_AGNES_URL, LOCAL_IMG]);

console.log('--- 写种子后 localStorage episode_store 长度 ---');
const len0 = await page.evaluate(() => (localStorage.getItem('episode_store')||'').length);
console.log('  seed len =', len0);

// reload 触发 onMounted: loadFromLocalStorage + 迁移
const logs = [];
page.on('console', m => { const t=m.text(); if (t.includes('[迁移]')||t.includes('AI 生成失败')) logs.push(t); });
await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(9000);

console.log('--- 迁移日志 ---');
logs.forEach(l => console.log('  ' + l));

const subs = await page.evaluate(() => JSON.parse(localStorage.getItem('episode_store')||'{}').subjects.map(s => ({ name:s.name, img:(s.image||'').slice(0,70) })));
console.log('--- 迁移后 subjects ---');
subs.forEach(s => console.log('  ' + s.name + ': ' + (s.img || '(空)')));

const aImg = subs.find(s=>s.name==='角色甲')?.img || '';
const bImg = subs.find(s=>s.name==='角色乙')?.img || '';
console.log('\n=== 断言 ===');
console.log('角色甲(死Agnes链接): 迁移后 → ' + (aImg === '' ? '已清空待重新生成 [PASS]' : (aImg.startsWith('/') ? '已迁到本地 [PASS] '+aImg : '仍为死链接 [FAIL] '+aImg)));
console.log('角色乙(本地图): ' + (bImg === LOCAL_IMG ? '保持不变 [PASS]' : '被动了 [FAIL] ' + bImg));

// 页面卡片图状态
const cards = await page.evaluate(() => [...document.querySelectorAll('img')].filter(i=>i.src.includes('/images/design/')).map(i=>({src:i.src.slice(0,80), ok:i.complete&&i.naturalWidth>0})));
console.log('--- 页面卡片图 ---');
cards.forEach(c => console.log('  ' + (c.ok?'OK ':'FAIL') + ' ' + c.src));

await page.screenshot({ path:'/tmp/e2e-migrate.png' });
await browser.close();
console.log('\n迁移测试 done');
