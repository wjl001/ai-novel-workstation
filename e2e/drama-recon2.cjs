// 增强侦察: 进"完整流程", 找触发图片/视频生成的按钮
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox'],
    executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome',
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const agnesReqs = [];
  page.on('request', (r) => {
    const u = r.url();
    if (u.includes('apihub.agnes-ai.com') || u.includes('platform-outputs.agnes-ai.space')) {
      agnesReqs.push({ m: r.method(), url: u.slice(0, 90) });
    }
  });

  await page.goto('http://localhost:5174/auth/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    localStorage.setItem('token', 'e2e_test_token');
    localStorage.setItem('userInfo', JSON.stringify({ name: 'e2e', username: 'e2e' }));
    localStorage.setItem('user_balance', '1000000');
  });

  await page.goto('http://localhost:5174/ai-short-drama-creator/new', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // 点"完整流程"
  try {
    await page.getByRole('button', { name: '完整流程', exact: false }).click({ timeout: 4000 });
  } catch (e) {
    try { await page.locator('text=完整流程').first().click({ timeout: 3000 }); } catch (e2) { console.log('完整流程点不了:', e2.message.split('\n')[0]); }
  }
  await page.waitForTimeout(2500);

  // 选一个热门题材(玄幻重生)
  try { await page.locator('text=玄幻重生').first().click({ timeout: 3000 }); await page.waitForTimeout(1500); } catch (e) { console.log('题材:', e.message.split('\n')[0]); }

  const btns = await page.$$eval('button, [role=button]', (bs) =>
    bs.map((b) => ({ t: (b.innerText || '').trim().slice(0, 25), d: b.disabled || b.getAttribute('disabled') != null }))
      .filter((b) => b.t)
  );
  console.log('=== 当前URL ===', page.url());
  console.log('=== 按钮 ===');
  btns.slice(0, 40).forEach((b) => console.log(`  [${b.d ? '禁用' : '可点'}] "${b.t}"`));
  console.log('=== 页面文本片段 ===');
  console.log((await page.innerText('body')).split('\n').filter((l) => l.trim()).slice(0, 40).join(' | '));
  await page.screenshot({ path: '/root/workspace/e2e_step2.png', fullPage: false });
  console.log('截图: e2e_step2.png');

  await browser.close();
})();
