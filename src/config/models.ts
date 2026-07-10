export interface AIModel {
  id: string;
  name: string;
  description: string;
  tags: string[];
  provider: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'midjourney' | 'stability' | 'flux' | 'kling' | 'runway' | 'luma' | 'pika' | 'sora' | 'doubao' | 'kimi' | 'nano_banana' | 'seedance' | 'wan' | 'happyhorse';
  cost: number; // 消耗算力豆数量
}

export interface ModelVendor {
  id: string;
  name: string;
  logo: string;
  models: AIModel[];
}

export const TEXT_MODELS: ModelVendor[] = [
  {
    id: 'doubao',
    name: '豆包 (Doubao)',
    logo: '',
    models: [
      { id: 'doubao-seed-2.1-pro', name: 'doubao-seed-2.1-pro', description: '豆包旗舰模型，逻辑与创意双重巅峰', provider: 'doubao', tags: ['旗舰', '推荐'], cost: 10 },
      { id: 'doubao-seed-2.0-pro', name: 'doubao-seed-2.0-pro', description: '高性能创作模型，擅长复杂剧情构建', provider: 'doubao', tags: ['高性能', '专业'], cost: 8 },
      { id: 'doubao-seed-2.0-mini', name: 'doubao-seed-2.0-mini', description: '极速响应，适合灵感捕捉与快速迭代', provider: 'doubao', tags: ['极速', '高效'], cost: 2 },
      { id: 'doubao-seed-1.8', name: 'doubao-seed-1.8', description: '经典稳定版本，文学创作表现卓越', provider: 'doubao', tags: ['稳定', '经典'], cost: 5 },
      { id: 'doubao-1.5-pro-32k', name: 'doubao-1.5-pro-32k', description: '长文本专业版，完美掌控长篇剧本', provider: 'doubao', tags: ['长文本', '角色扮演'], cost: 12 },
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: 'https://www.deepseek.com/logo.png',
    models: [
      { id: 'DeepSeek-V4', name: 'DeepSeek-V4', description: '国产自研顶尖模型，文笔细腻，逻辑严密', provider: 'deepseek', tags: ['旗舰', '文学之光'], cost: 10 },
    ]
  }
];

export const IMAGE_MODELS: ModelVendor[] = [
  {
    id: 'openai',
    name: 'ChatGPT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    models: [
      { id: 'ChatGPT-Images-2.0', name: 'ChatGPT Images 2.0', description: 'OpenAI 顶级绘图模型，画质精美，构图精准', provider: 'openai', tags: ['顶尖', '全能'], cost: 20 },
    ]
  },
  {
    id: 'google',
    name: 'Google Gemini',
    logo: '',
    models: [
      { id: 'gemini-3.1-flash-lite-image', name: 'gemini-3.1-flash-lite-image', description: '谷歌最新多模态影像模型，极速生成', provider: 'google', tags: ['极速', '多模态'], cost: 15 },
    ]
  },
  {
    id: 'doubao',
    name: '豆包 (Doubao)',
    logo: '',
    models: [
      { id: 'doubao-seedream-5.0-lite', name: 'doubao-seedream-5.0-lite', description: '豆包专业级生图模型，细节表现惊人', provider: 'doubao', tags: ['专业', '写实'], cost: 18 },
    ]
  }
];

export const VIDEO_MODELS: ModelVendor[] = [
  {
    id: 'doubao_seedance',
    name: '豆包 Seedance',
    logo: '',
    models: [
      { id: 'doubao-seedance-2.5', name: 'doubao-seedance-2.5', description: '新一代视频生成模型，画面质感与动感大幅提升', provider: 'doubao', tags: ['新一代', '高质感'], cost: 60 },
      { id: 'doubao-seedance-2.0', name: 'doubao-seedance-2.0', description: '经典视频模型，生成效果稳定出色', provider: 'doubao', tags: ['稳定', '经典'], cost: 50 },
    ]
  },
  {
    id: 'kling',
    name: '可灵 (Kling)',
    logo: '',
    models: [
      { id: 'kling-3.0-omni', name: '可灵3.0 Omni', description: '顶级视频生成模型，物理模拟与动态表现巅峰', provider: 'kling', tags: ['旗舰', '物理模拟'], cost: 80 },
    ]
  },
  {
    id: 'happyhorse',
    name: 'Happy Horse',
    logo: '',
    models: [
      { id: 'happyhorse-1.1', name: 'HappyHorse 1.1', description: '高效视频生成模型，快速迭代预览效果', provider: 'happyhorse', tags: ['高效', '快速'], cost: 60 },
    ]
  }
];
