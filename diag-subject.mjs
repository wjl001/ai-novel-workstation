import { chromium } from 'playwright';
const BASE = 'https://122.51.209.229/ai-short-drama-creator/ai-short-drama-creator/assets';
const LOCAL_IMG = '/ai-short-drama-creator/images/design/gen-1789385876999-419c60cce55c.png';
// 模拟真实用户数据: 过期的 Agnes 临时 CDN 链接(真实域名 platform-out.agnes-ai.com, 已 404)
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
    { id: 'scene-c3', name: '公司会议室', type: 'scene', description: '测试场景', image: AGNES('/asset-img/scene-c3.webp?token=dead2'), imageHistory: [] },
  ],
  episodes: [], currentEpisode: null,
});
const page = await ctx.newPage();
const logs = [];
page.on('console', m => { const t = m.text(); if (t.includes('[迁移]')) logs.push(t); });
try { await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 }); } catch (e) { console.log('goto:', e.message.slice(0,100)); }
console.log('URL:', page.url());
await page.waitForTimeout(12000); // 等迁移+repair 跑完
console.log('=== 迁移日志 ===');
if (logs.length) logs.forEach(l => console.log('  ' + l)); else console.log('  (无 [迁移] 日志)');
const subs = await page.evaluate(() => { const r = JSON.parse(localStorage.getItem('episode_store') || '{}'); return (r.subjects||[]).map(s => ({ name: s.name, imageType: s.image ? (s.image.startsWith('data:') ? 'data-svg占位图' : s.image.startsWith('http') ? '远程:'+s.image.slice(0,60) : '本地:'+s.image) : '(空→待生成)' })); });
console.log('\n=== 迁移后各主体 image ===');
subs.forEach(s => console.log('  ' + s.name + ' -> ' + s.imageType));
await browser.close();
