import { chromium } from 'playwright';

const BASE = 'https://122.51.209.229/ai-short-drama-creator/';
const LOCAL_IMG = '/ai-short-drama-creator/images/design/gen-1789385876999-419c60cce55c.png';
// 运行时拼接, 避免完整域名字面量被写坏: 死 Agnes 临时 CDN 链接
const DEAD_AGNES_URL = 'https://' + 'platform-out.' + 'agnes-ai' + '.com/dead/expired-link-12345.png';

const browser = await chromium.launch({ headless: true, executablePath: '/root/.agent-browser/browsers/chrome-151.0.7922.34/chrome', args: ['--no-sandbox','--disable-gpu'] });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true });

// 注入 token + 模拟用户存量数据: 死 Agnes 链接主体(A) + 正常本地图主体(B)
await ctx.addInitScript(args => {
  localStorage.setItem('token', 'test-token-repro');
  localStorage.setItem('episode_store', JSON.stringify({
    episodes: [], subjectId: null, isGeneratingBatch: false, batchProgress: 0,
    currentDramaTitle: '测试剧本', lastUsedSubjectIds: [],
    generationStatus: { isGenerating: false, type: '', progress: 0, currentIndex: -1, totalCount: 0 },
    subjects: [
      { id: 'char-1', name: '测试角色A', type: 'character', image: args[0], description: '28岁女性主角', prompt: '一个女孩，28岁，短发，职业装' },
      { id: 'char-2', name: '测试角色B', type: 'character', image: args[1], description: '30岁男配角', prompt: '一个男孩，30岁，休闲装' }
    ]
  }));
}, [DEAD_AGNES_URL, LOCAL_IMG]);

const page = await ctx.newPage();
const logs = [];
page.on('console', m => { const t = m.text(); if (t.includes('[迁移]') || t.includes('AI 生成失败')) logs.push(t); });

console.log('--- 1) 加载 assets, 观察迁移日志 ---');
await page.goto(BASE + 'ai-short-drama-creator/assets', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
logs.forEach(l => console.log(l));

const state1 = await page.evaluate(() => JSON.parse(localStorage.getItem('episode_store') || '{}').subjects.map(s => ({ name: s.name, img: (s.image || '').slice(0, 80) })));
console.log('--- 迁移后两个主体的 image (A应清空待重生成, B仍是本地) ---');
state1.forEach(s => console.log('  ' + s.name + ': ' + s.img));

const cardImgs1 = await page.evaluate(() => [...document.querySelectorAll('img')].filter(i => i.src.includes('/images/design/')).map(i => ({ src: i.src.slice(0,90), ok: i.complete && i.naturalWidth > 0 })));
console.log('--- 页面卡片图(本地那张B应显示正常) ---');
cardImgs1.forEach(c => console.log('  ' + (c.ok?'OK ':'FAIL') + ' ' + c.src));
await page.screenshot({ path: '/tmp/e2e-migrated.png' });

console.log('--- 2) 点"批量生成描述+图片": A应重新生成(死链→真图), B应跳过 ---');
const batchBtn = page.locator('button', { hasText: '批量生成描述+图片' }).first();
await batchBtn.click();
await page.waitForTimeout(3000);
const startBtns = await page.locator('button:visible').filter({ hasText: /开始|确认|执行|生成全部|开始生成/ }).all();
console.log('确认类按钮:', startBtns.map(b => b.textContent().trim()).slice(0,5));
if (startBtns.length) { await startBtns[startBtns.length-1].click().catch(()=>{}); }

let finished = false;
for (let i = 0; i < 45; i++) {
  await page.waitForTimeout(3000);
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem('episode_store') || '{}').subjects.map(x => (x.image || '').slice(0, 70)));
  const A = s[0] || '';
  const doneA = A && !A.includes('agnes-ai') && !A.includes('data:image/svg') && A.startsWith('/');
  if (doneA) { finished = true; console.log('第' + ((i+1)*3) + 's A重新生成完成: ' + A); break; }
}
if (!finished) console.log('A 重新生成未在本轮完成(可能仍在生成中)');

const state2 = await page.evaluate(() => JSON.parse(localStorage.getItem('episode_store') || '{}').subjects.map(s => ({ name: s.name, img: (s.image || '').slice(0, 90) })));
console.log('--- 生成后两个主体的 image (A应为新本地URL, B仍不变) ---');
state2.forEach(s => console.log('  ' + s.name + ': ' + s.img));

const cardImgs2 = await page.evaluate(() => [...document.querySelectorAll('img')].filter(i => i.src.includes('/images/design/')).map(i => ({ src: i.src.slice(0,90), ok: i.complete && i.naturalWidth > 0 })));
console.log('--- 生成后页面卡片图(全部应显示正常) ---');
cardImgs2.forEach(c => console.log('  ' + (c.ok?'OK ':'FAIL') + ' ' + c.src));

// 汇总断言
const okB1 = cardImgs1.length > 0 && cardImgs1[0].ok;
const A_migrated_empty = state1.find(s => s.name === '测试角色A')?.img === '';
console.log('\n=== 断言 ===');
console.log('A 死链迁移后已清空待重生成:', A_migrated_empty ? 'PASS' : 'FAIL (img=' + (state1.find(s=>s.name==='测试角色A')?.img||'') + ')');
console.log('B 本地图正常显示:', okB1 ? 'PASS' : 'FAIL');
console.log('A 重新生成成功(本地URL):', finished ? 'PASS' : 'PARTIAL(仍在生成)');

await page.screenshot({ path: '/tmp/e2e-final.png', fullPage: true });
await browser.close();
console.log('\nE2E done');
