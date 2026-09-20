// Agnes 冒烟: [1] LLM终审(agnes-3.0-flash) + [2] 多参考图视频(2张ref, mode=reference)
// 与 src/utils/agnesChat.ts、imageGenerator.ts 的 payload 格式完全一致
import fs from 'fs';

const envText = fs.readFileSync('.env', 'utf8');
const key = (envText.match(/VITE_AGNES_API_KEY=(.+)/) || [])[1]?.trim() || '';
if (!key) { console.log('NO_KEY: .env 里没有 VITE_AGNES_API_KEY'); process.exit(2); }
const BASE = 'https://apihub.agnes-ai.com/v1';
const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };

// ===== [1/2] LLM 终审: 模拟 optimizePromptLLM 第9轮 / hermesAgent 第3/5轮 =====
console.log('=== [1/2] LLM终审: agnes-3.0-flash /chat/completions ===');
try {
  const r = await fetch(BASE + '/chat/completions', {
    method: 'POST',
    headers: H,
    body: JSON.stringify({
      model: 'agnes-3.0-flash',
      temperature: 0.4,
      max_tokens: 300,
      messages: [
        { role: 'system', content: '你是AI短剧视觉总监,负责图片提示词终审增强: 保持原意,补光影/材质/机位细节,不超过60字,直接输出增强后的提示词。' },
        { role: 'user', content: '一位白衣女子站在雨中,电影感,雨夜霓虹' },
      ],
    }),
  });
  console.log('HTTP', r.status);
  if (r.ok) {
    const d = await r.json();
    console.log('LLM输出:', JSON.stringify((d.choices?.[0]?.message?.content || '(空)').slice(0, 150)));
  } else {
    console.log('body:', (await r.text()).slice(0, 300));
  }
} catch (e) {
  console.log('LLM error:', e.message);
}

// ===== [2/2] 多参考图视频: 2张参考图(顺序=优先级), 与 imageGenerator.ts video分支同构 =====
console.log('\n=== [2/2] 多参考图视频: 2张ref, mode=reference, agnes-video-2.5-flash ===');
const refImages = [
  'https://picsum.photos/seed/agnesrefA/512/512',
  'https://picsum.photos/seed/agnesrefB/512/512',
];
const vpayload = {
  model: 'agnes-video-2.5-flash',
  prompt: '电影感: 一位白衣女子站在雨夜霓虹下, 参考提供的两张图片作为角色与场景参考',
  mode: 'reference',
  seconds: '5',
  size: '720P',
  aspect_ratio: '9:16',
};
vpayload.images = refImages; // 多图 → 验证 API 是否接受
let videoId = null;
try {
  const v = await fetch(BASE + '/videos', { method: 'POST', headers: H, body: JSON.stringify(vpayload) });
  console.log('submit HTTP', v.status);
  const vd = await v.json().catch(() => ({}));
  videoId = vd?.video_id || vd?.data?.video_id;
  console.log('video_id:', videoId || JSON.stringify(vd).slice(0, 300));
} catch (e) {
  console.log('submit error:', e.message);
}

if (videoId) {
  console.log('\n--- 轮询(5s/次, 最多24次≈2min) ---');
  for (let k = 0; k < 24; k++) {
    await new Promise(r => setTimeout(r, 5000));
    const q = await fetch(
      `https://apihub.agnes-ai.com/agnesapi?video_id=${encodeURIComponent(videoId)}&model_name=agnes-video-2.5-flash`,
      { headers: { Authorization: `Bearer ${key}` } }
    ).catch(() => null);
    if (!q) { console.log(`poll ${k + 1}: 网络错误`); continue; }
    if (q.status === 429) { console.log(`poll ${k + 1}: 429 退避`); await new Promise(r => setTimeout(r, 8000)); continue; }
    const qr = await q.json().catch(() => ({}));
    const d = qr?.data || qr;
    const st = String(d?.status || '').toLowerCase();
    if (st === 'completed') {
      console.log('COMPLETED url:', d?.metadata?.url || d?.url || d?.remixed_from_video_id);
      break;
    }
    if (st === 'failed') {
      console.log('FAILED:', JSON.stringify(d?.error || st).slice(0, 300));
      break;
    }
    if (k % 2 === 0) console.log(`poll ${k + 1}: 状态=${st || 'unknown'}`);
  }
}
console.log('\nDONE');
