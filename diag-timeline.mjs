import { chromium } from 'playwright';
const BASE = 'https://122.51.209.229/ai-short-drama-creator/ai-short-drama-creator/assets';
const LOCAL_IMG = '/ai-short-drama-creator/images/design/gen-1789385876999-419c60cce55c.png';
const DEAD_AGNES_URL = 'https://' + 'platform-out.' + 'agnes-ai' + '.com/dead/expired-link-12345.png';

const browser = await chromium.launch({ headless: true, executablePath: '/root/.agent-browser/browsers/chrome-151.0.7922.34/chrome', args: ['--no-sandbox','--disable-gpu'] });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
await ctx.addInitScript(() => localStorage.setItem('token', 'test-token-repro'));
const page = await ctx.newPage();
const allLogs = [];
page.on('console', m => { allLogs.push(m.text()); });
page.on('pageerror', e => allLogs.push('[pageerror] ' + e.message));

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(1000);

// 种子: 死Agnes链接主体 + 本地图主体
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

// reload, 逐 500ms 采样 subjects 状态, 记录首次被改写的时刻
const timeline = [];
page.evaluate(() => {
  window.__tl = [];
  window.__poll = setInterval(() => {
    try {
      const v = localStorage.getItem('episode_store');
      const subj = v ? (JSON.parse(v).subjects || []).map(s => s.name).join(',') : '(key missing)';
      window.__tl.push({ t: Date.now(), len: v ? v.length : 0, subj });
    } catch {}
  }, 500);
});
await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(15000);
const tl = await page.evaluate(() => { const x = window.__tl || []; clearInterval(window.__poll); return x; });
console.log('=== localStorage episode_store 时间线 (subj 列) ===');
let last = '';
for (const e of tl) {
  const marker = e.subj !== last ? '  <<CHANGED>>' : '';
  if (e.subj !== last || marker) console.log(`  t=${e.t} len=${e.len} subj=[${e.subj}]${marker}`);
  last = e.subj;
}

const raw = await page.evaluate(() => (localStorage.getItem('episode_store')||'').slice(0, 300));
console.log('\n=== 最终 episode_store 头部 ===');
console.log(raw);
console.log('\n=== 相关 console 日志 (前40条, 过滤噪音) ===');
allLogs.filter(t => /迁移|主体|episode|subjects|localStorage|error|Error/i.test(t)).slice(0, 40).forEach(t => console.log('  ' + t.slice(0, 150)));
console.log('\n=== URL ===', page.url());
await page.screenshot({ path: '/tmp/timeline.png' });
await browser.close();
console.log('diag done');
