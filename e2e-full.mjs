import { chromium } from 'playwright';
const BASE = 'https://122.51.209.229/ai-short-drama-creator/ai-short-drama-creator/assets';
const LOCAL_IMG = '/ai-short-drama-creator/images/design/gen-1789385876999-419c60cce55c.png';
const AGNES = (p) => { const d = 'https://'; return d + 'platform-out.agnes-ai.com' + p; };
const browser = await chromium.launch({ headless: true, executablePath: '/root/.agent-browser/browsers/chrome-151.0.7922.34/chrome', args: ['--no-sandbox','--disable-gpu'] });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
await ctx.addInitScript((seed) => {
  localStorage.clear();
  localStorage.setItem('episode_store', JSON.stringify(seed));
  localStorage.setItem('token', 'e2e-test-token');
}, {
  subjects: [
    { id: 'sub-a1', name: '角色甲', type: 'character', description: '测试角色甲', image: AGNES('/asset-img/sub-a1.webp?token=dead1'), imageHistory: [] },
    { id: 'sub-b2', name: '角色乙', type: 'character', description: '测试角色乙', image: LOCAL_IMG, imageHistory: [] },
  ],
  episodes: [], currentEpisode: null,
});
const page = await ctx.newPage();
const logs = [];
page.on('console', m => { const t = m.text(); if (t.includes('[迁移]')) logs.push(t); });
try { await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 }); } catch (e) { console.log('goto:', e.message.slice(0,100)); }
await page.waitForTimeout(10000); // 迁移+修复完成
console.log('迁移日志:', logs.join(' | ') || '(none)');

// 点击角色甲的"生成图片"按钮
const cardGen = () => {
  const cards = Array.from(document.querySelectorAll('[class*="card"]'));
  for (const c of cards) {
    if (c.textContent.includes('角色甲')) {
      const btns = Array.from(c.querySelectorAll('button'));
      for (const b of btns) { if (b.textContent.replace(/\s/g,'').includes('生成图片') || b.textContent.replace(/\s/g,'').includes('重新生成')) return b; }
    }
  }
  return null;
};
const clicked = await page.evaluate(() => { const b = (() => { const cards = Array.from(document.querySelectorAll('[class*="card"]')); for (const c of cards) { if (c.textContent.includes('角色甲')) { const btns = Array.from(c.querySelectorAll('button')); for (const b of btns) { const t = b.textContent.replace(/\s/g,''); if (t.includes('生成图片') || t.includes('重新生成')) return b; } } } return null; })(); if (b) { b.click(); return 'clicked:' + b.textContent.trim(); } return 'NO-BTN'; });
console.log('点击结果:', clicked);

// 等待生成完成(含重试, 最多 120s)
const t0 = Date.now();
while (Date.now() - t0 < 120000) {
  await page.waitForTimeout(4000);
  const s = await page.evaluate(() => { const r = JSON.parse(localStorage.getItem('episode_store')||'{}'); return (r.subjects||[]).map(x => ({ name: x.name, img: x.image ? (x.image.startsWith('data:') ? 'svg占位' : x.image.startsWith('http') ? '远程' : '本地:'+x.image) : '(空)' })); });
  const a = s.find(x => x.name === '角色甲');
  if (a && a.img.startsWith('本地:')) { console.log('\n✅ 角色甲 生成成功, 新本地URL:', a.img); break; }
}
const finalState = await page.evaluate(() => { const r = JSON.parse(localStorage.getItem('episode_store')||'{}'); return (r.subjects||[]).map(x => ({ name: x.name, img: x.image ? (x.image.startsWith('data:') ? 'svg占位' : x.image.startsWith('http') ? '远程' : '本地:'+x.image) : '(空)' })); });
console.log('\n=== 最终各主体 image ===');
finalState.forEach(s => console.log('  ' + s.name + ' -> ' + s.img));
await browser.close();
