// 验证 3 个页面: 哪个真正渲染了"🎬 短剧线"
const { chromium } = require('playwright');
const EXE = '/root/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';

async function check(base, path, label) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], executablePath: EXE });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 80)));
  try {
    await page.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3500);
    // 点"智能体"tab(如果存在)
    const agentTab = page.locator('button[tabindex][data-tab="tab-agents"], .tab[data-tab="tab-agents"], button:has-text("智能体")').first();
    if (await agentTab.count()) { try { await agentTab.click({ timeout: 3000 }); await page.waitForTimeout(2000); } catch (e) {} }
    const body = await page.innerText('body');
    const hasDrama = body.includes('视觉总监') || body.includes('短剧线');
    const hasDirector = body.includes('导演');
    console.log(`\n=== ${label} ===`);
    console.log('  URL:', base + path);
    console.log('  标题:', await page.title());
    console.log('  含"视觉总监/短剧线":', hasDrama ? '✅ 有' : '❌ 无');
    console.log('  含"导演":', hasDirector ? '✅ 有' : '❌ 无');
    console.log('  含"🎬":', body.includes('🎬') ? '✅ 有' : '❌ 无');
    if (errs.length) console.log('  页面报错:', errs[0]);
    // 统计 agent 块标题(各职能线)
    const lines = await page.$$eval('.agents-title', (ns) => ns.map((n) => n.innerText.trim()));
    if (lines.length) console.log('  职能线分组:', lines.join(' / '));
  } catch (e) {
    console.log(`\n=== ${label} === ❌ 打不开: ${String(e).slice(0, 80)}`);
  }
  await browser.close();
}

(async () => {
  await check('https://ai-team.52swy.cn', '/', '指挥中心(ai-team域名)');
  await check('https://122.51.209.229', '/', '进化实验室(主域名)');
  await check('https://122.51.209.229', '/evolution.html', '进化档案');
})();
