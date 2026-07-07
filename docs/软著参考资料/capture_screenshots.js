import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 在 ESM 中模拟 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('🚀 启动浏览器中...');
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // 1. 访问登录页面
  const loginUrl = 'http://172.25.24.86:5174/auth/login';
  try {
    console.log(`🌐 正在访问登录页面: ${loginUrl}`);
    await page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 截取登录页面
    await page.screenshot({ path: path.join(screenshotDir, '01_login_page.png'), fullPage: true });
    console.log('✅ 登录页面截图成功');

    // 2. 模拟切换到密码登录 (如果默认是短信登录)
    // 根据 Login.vue, 密码登录 tab 的 name 是 'password'
    const passwordTabSelector = '.el-tabs__item#tab-password';
    if (await page.$(passwordTabSelector)) {
        await page.click(passwordTabSelector);
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('🔄 已切换到密码登录');
    }

    // 3. 填充账号密码 (这里仅作为示例，软著截图通常只需要空表单或填入模拟数据)
    // 实际操作中，如果需要进入后台截图，请填入有效的账号密码
    // await page.type('input[placeholder="账号 / 手机号"]', 'admin');
    // await page.type('input[placeholder="请输入密码"]', '123456');
    // await page.screenshot({ path: path.join(screenshotDir, '02_login_filled.png') });

    // 4. 访问核心功能页面 (假设登录后可访问)
    const views = [
      { name: '03_new_drama', url: 'http://172.25.24.86:5174/ai-short-drama-creator/new' },
      { name: '04_episodes_view', url: 'http://172.25.24.86:5174/ai-short-drama/episodes' },
      { name: '05_editor_view', url: 'http://172.25.24.86:5174/ai-script-writing/editor' }
    ];

    for (const view of views) {
      console.log(`📸 正在截取: ${view.name} -> ${view.url}`);
      try {
        await page.goto(view.url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 3000)); // 等待渲染
        await page.screenshot({ path: path.join(screenshotDir, `${view.name}.png`), fullPage: true });
      } catch (e) {
        console.warn(`⚠️ 无法访问或截取 ${view.url}: ${e.message}`);
      }
    }

    console.log(`\n🎉 所有截图已保存至: ${screenshotDir}`);
    console.log('说明书撰写单位：北京君禾世纪科技有限公司');

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  } finally {
    await browser.close();
  }
})();
