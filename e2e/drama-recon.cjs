// E2E 侦察: 登录+进短剧页, 列出可点的按钮/文本
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox'],
  executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome',
});
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // 记录发往 Agnes 的真实请求
  const agnesReqs = [];
  page.on('request', (r) => {
    if (r.url().includes('apihub.agnes-ai.com') || r.url().includes('platform-outputs.agnes-ai.space')) {
      agnesReqs.push({ url: r.url(), method: r.method() });
    }
  });

  // 1. 先访问登录页写入 token
  await page.goto('http://localhost:5174/auth/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    localStorage.setItem('token', 'e2e_test_token');
    localStorage.setItem('userInfo', JSON.stringify({ name: 'e2e', username: 'e2e' }));
    localStorage.setItem('user_balance', '1000000');
  });

  // 2. 进短剧新建页
  await page.goto('http://localhost:5174/ai-short-drama-creator/new', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const currentUrl = page.url();
  const bodyText = (await page.innerText('body')).slice(0, 1200);
  const buttons = await page.$$eval('button', (bs) =>
    bs.map((b) => ({
      text: (b.innerText || '').trim().slice(0, 30),
      cls: b.className.slice(0, 40),
      disabled: b.disabled,
    })).filter((b) => b.text)
  );

  console.log('=== 当前URL ===', currentUrl);
  console.log('=== 页面文本(前1200) ===');
  console.log(bodyText);
  console.log('=== 按钮 ===');
  buttons.slice(0, 30).forEach((b) => console.log(`  [${b.disabled ? '禁用' : '可点'}] "${b.text}"`));
  console.log('=== Agnes请求 ===', agnesReqs.length ? JSON.stringify(agnesReqs, null, 1) : '(暂无)');

  await page.screenshot({ path: '/root/workspace/e2e_drama_new.png' });
  console.log('截图: /root/workspace/e2e_drama_new.png');

  await browser.close();
})();
