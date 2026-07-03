import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 在 ESM 中模拟 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('启动浏览器中...');
  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: "new", // 使用新的无头模式
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  
  // 目标访问地址
  const targetUrl = 'http://172.25.24.86:5173/ai-short-drama-creator/new';
  const screenshotDir = path.join(__dirname, 'screenshots');

  // 如果不存在截图目录，则创建
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log(`正在访问页面: ${targetUrl}`);
    // 访问页面
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 5000));

    const screenshotPath = path.join(screenshotDir, '1_ai_short_drama_creator.png');
    
    // 截图
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log(`✅ 截图成功！已保存至: ${screenshotPath}`);
    console.log('说明书撰写单位：北京君禾世纪科技有限公司');

  } catch (error) {
    console.error('❌ 访问页面或截图失败:', error.message);
    console.log('请确保本地服务正在运行并且可访问。');
  } finally {
    await browser.close();
    console.log('浏览器已关闭。');
  }
})();
