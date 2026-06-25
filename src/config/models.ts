export interface AIModel {
  id: string;
  name: string;
  description: string;
  tags: string[];
  provider: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'midjourney' | 'stability' | 'flux' | 'kling' | 'runway' | 'luma' | 'pika' | 'sora' | 'doubao' | 'kimi' | 'nano_banana' | 'seedance';
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
    id: 'doubao_seedream',
    name: 'Doubao-Seedream',
    logo: '',
    models: [
      { id: 'doubao-seedream-5-0-lite', name: 'Doubao-Seedream 5.0 lite', description: '极速生成高清短视频，画面动感极佳', provider: 'doubao', tags: ['极速', '动感'], cost: 30 },
      { id: 'doubao-seedream-4-5', name: 'Doubao-Seedream 4.5', description: '经典版本，画面稳定性与连贯性的平衡点', provider: 'doubao', tags: ['稳定', '经典'], cost: 40 },
      { id: 'doubao-seedream-4-0', name: 'Doubao-Seedream 4.0', description: '基础版本，适合快速预览视频效果', provider: 'doubao', tags: ['基础', '预览'], cost: 20 },
    ]
  },
  {
    id: 'seedance',
    name: 'Seedance',
    logo: '',
    models: [
      { id: 'seedance-2-0', name: 'Seedance 2.0', description: '好莱坞级视觉质感，物理模拟真实', provider: 'seedance', tags: ['电影级', '真实'], cost: 60 },
      { id: 'seedance-1-5', name: 'Seedance 1.5', description: '高效率视频生成，适合批量创作', provider: 'seedance', tags: ['高效', '批量'], cost: 45 },
    ]
  },
  {
    id: 'kling_happy_horse',
    name: '可灵 Kling',
    logo: '',
    models: [
      { id: 'kling-happy-horse-1-1', name: '可灵Happy Horse 1.1', description: '极致灵动，擅长捕捉自然运动瞬间', provider: 'kling', tags: ['灵动', '自然'], cost: 50 },
    ]
  }
];
