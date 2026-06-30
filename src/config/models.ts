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
      { id: 'doubao-2-0-mini', name: '豆包 2.0 mini', description: '极速响应，适合灵感瞬间捕捉与日常对话', provider: 'doubao', tags: ['极速', '推荐'], cost: 1 },
      { id: 'doubao-1-8-deepthink', name: '豆包 1.8 深度思考', description: '强化逻辑推理，擅长处理复杂剧本架构', provider: 'doubao', tags: ['深度推理', '逻辑控'], cost: 5 },
      { id: 'doubao-1-5-pro-rp', name: '豆包 1.5 Pro·角色扮演 (250715)', description: '专业级角色扮演优化，情感表达细腻真实', provider: 'doubao', tags: ['角色扮演', '情感细腻'], cost: 8 },
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: 'https://www.deepseek.com/logo.png',
    models: [
      { id: 'deepseek-v4-pro', name: 'DeepSeek V4-Pro', description: '国产旗舰级创作模型，文学素养与文笔巅峰', provider: 'deepseek', tags: ['旗舰', '文学之光'], cost: 10 },
    ]
  },
  {
    id: 'kimi',
    name: 'Kimi',
    logo: '',
    models: [
      { id: 'kimi-k2-6', name: 'Kimi K2.6', description: '超长上下文理解，完美掌控长篇剧本逻辑', provider: 'kimi', tags: ['长上下文', '逻辑严密'], cost: 12 },
    ]
  },
  {
    id: 'google',
    name: 'Google Gemini',
    logo: '',
    models: [
      { id: 'gemini-3-0-pro', name: 'Gemini 3.0 Pro（稳定版）', description: '全能旗舰，多模态理解与创作能力出色', provider: 'google', tags: ['多模态', '稳定'], cost: 15 },
    ]
  },
  {
    id: 'openai',
    name: 'ChatGPT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    models: [
      { id: 'gpt-5-4-mini', name: 'GPT-5.4 mini', description: 'OpenAI 最新轻量级模型，智能度与速度的完美平衡', provider: 'openai', tags: ['智能', '高效'], cost: 10 },
    ]
  }
];

export const IMAGE_MODELS: ModelVendor[] = [
  {
    id: 'nano_banana',
    name: 'Nano Banana',
    logo: '',
    models: [
      { id: 'nano-banana-pro', name: 'Nano Banana Pro', description: '专业级写实生图，细节表现惊人', provider: 'nano_banana', tags: ['写实', '专业'], cost: 15 },
      { id: 'nano-banana-2', name: 'Nano Banana 2', description: '极具艺术感的二代模型，风格多变', provider: 'nano_banana', tags: ['艺术', '新锐'], cost: 12 },
    ]
  },
  {
    id: 'gpt_image',
    name: 'GPT Image',
    logo: '',
    models: [
      { id: 'gpt-image-2-v2', name: 'GPT Image 2 V2.0', description: '精准指令遵循，构图逻辑完美', provider: 'openai', tags: ['精准', '全能'], cost: 18 },
    ]
  }
];

export const VIDEO_MODELS: ModelVendor[] = [
  {
    id: 'doubao_seedance',
    name: '豆包 Seedance',
    logo: '',
    models: [
      { id: 'doubao-seedance-2-0', name: 'Doubao-Seedance 2.0', description: '新一代视频生成模型，画面质感与动感大幅提升', provider: 'doubao', tags: ['新一代', '高质感'], cost: 50 },
      { id: 'doubao-seedance-2-0-fast', name: 'Doubao-Seedance 2.0 Fast', description: '极速生成，保持高水准画面的同时大幅缩短等待时间', provider: 'doubao', tags: ['极速', '高效'], cost: 35 },
    ]
  },
  {
    id: 'happyhorse',
    name: 'Happy Horse',
    logo: '',
    models: [
      { id: 'happyhorse-1.0-i2v', name: 'HappyHorse 1.0 I2V', description: '专业图生视频模型，完美还原图片细节与意境', provider: 'happyhorse', tags: ['图生视频', '高还原'], cost: 45 },
      { id: 'happyhorse-1.0-r2v', name: 'HappyHorse 1.0 R2V', description: '实时视频生成，适合快速迭代预览效果', provider: 'happyhorse', tags: ['实时', '流畅'], cost: 40 },
      { id: 'happyhorse-1.0-t2v', name: 'HappyHorse 1.0 T2V', description: '强大的文生视频能力，精准理解剧本意图', provider: 'happyhorse', tags: ['文生视频', '精准'], cost: 45 },
    ]
  },
  {
    id: 'wan',
    name: 'Wan',
    logo: '',
    models: [
      { id: 'wan2.7-r2v', name: 'Wan 2.7 R2V', description: '旗舰级视频生成，极致的物理模拟与动态表现', provider: 'wan', tags: ['旗舰', '物理模拟'], cost: 60 },
      { id: 'wan2.7-t2v', name: 'Wan 2.7 T2V', description: '文生视频领域的巅峰之作，构图与叙事感极佳', provider: 'wan', tags: ['巅峰', '叙事感'], cost: 60 },
    ]
  }
];
