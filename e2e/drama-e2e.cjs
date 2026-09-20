// E2E: 在真实浏览器里加载 Vite serve 的新 imageGenerator 模块, 调用 generateImageAPI 出图+出视频
// 拦截网络证明请求打的是 Agnes 真实 API (而非占位图)
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox'],
    executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome',
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // 拦截发往 Agnes 的真实请求
  const agnesLog = [];
  page.on('request', (r) => {
    const u = r.url();
    if (u.includes('apihub.agnes-ai.com') || u.includes('platform-outputs.agnes-ai.space')) {
      agnesLog.push(`→ ${r.method()} ${u.slice(0, 100)}`);
    }
  });
  page.on('console', (m) => {
    const t = m.text();
    if (t.includes('生成引擎') || t.includes('agnes')) console.log('[console]', t.slice(0, 150));
  });

  // 进平台(带token绕过登录), 然后动态 import Vite 编译后的真实模块
  await page.goto('http://localhost:5174/auth/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    localStorage.setItem('token', 'e2e_test_token');
    localStorage.setItem('userInfo', JSON.stringify({ name: 'e2e', username: 'e2e' }));
  });
  await page.goto('http://localhost:5174/ai-short-drama-creator/new', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // 在页面上下文里动态导入 Vite 编译的真实模块(带真实 key)
  const result = await page.evaluate(async () => {
    const mod = await import('/src/utils/imageGenerator.ts');
    const t0 = Date.now();
    // 1) 出图
    const imgUrl = await mod.generateImageAPI(
      '玄幻短剧女主，银白长发，白衣，侧脸特写，精致五官，柔光，电影级质感', 'image'
    );
    const imgMs = Date.now() - t0;
    // 2) 出视频(图生视频, 用刚出的图做参考)
    const tv0 = Date.now();
    let videoUrl = null, videoErr = null;
    try {
      videoUrl = await mod.generateImageAPI(
        '古装玄幻，银发白衣女主缓推镜头，长发随风轻扬，柔光电影质感', 'video', undefined, '', imgUrl
      );
    } catch (e) { videoErr = String(e); }
    return { imgUrl, imgMs, videoUrl, videoErr, videoMs: Date.now() - tv0 };
  }, null, { timeout: 420000 }); // 视频轮询最长 ~20min

  const realImage = result.imgUrl && !result.imgUrl.includes('picsum') && !result.imgUrl.includes('gstatic');
  const realVideo = result.videoUrl && !result.videoUrl.includes('BigBuckBunny');

  console.log('=== 结果 ===');
  console.log('图片URL:', (result.imgUrl || 'null').slice(0, 110));
  console.log('图片耗时:', (result.imgMs / 1000).toFixed(1) + 's', realImage ? '✅ 真实Agnes图' : '⚠️ 占位回退');
  console.log('视频URL:', (result.videoUrl || 'null').slice(0, 110));
  console.log('视频耗时:', (result.videoMs / 1000).toFixed(0) + 's', realVideo ? '✅ 真实视频' : (result.videoErr ? '❌ ' + result.videoErr.slice(0, 80) : '⚠️ 占位回退(下载502兜底)'));
  console.log('Agnes真实请求数:', agnesLog.length);
  agnesLog.slice(0, 12).forEach((l) => console.log('  ' + l));

  // 保存产物
  const fs = require('fs');
  fs.writeFileSync('/root/workspace/e2e_result.json', JSON.stringify({ ...result, agnesLog }, null, 2));
  await browser.close();
})();
