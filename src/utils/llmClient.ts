// 模拟不同类型的 AI 响应内容
const MOCK_RESPONSES: Record<string, string[]> = {
  default: [
    "这是一个模拟的 AI 响应。由于我们处于演示模式，我无法连接到真实的大模型。",
    "但我可以展示流式输出的效果。",
    "你看，这些文字正在逐字逐句地出现，就像真实的 AI 在思考一样。",
    "在这个模式下，你可以体验整个应用的功能流程，而不需要消耗 API Token。"
  ],
  outline: [
    "### 第一章：深渊的呼唤",
    "主角艾伦在一次深海探险中，意外发现了一座沉没的古城。",
    "古城中心散发着幽蓝的光芒，似乎在引导他前往。",
    "潜水器突然失灵，艾伦被迫弃船，独自游向光源。",
    "\n",
    "### 第二章：失落的文明",
    "艾伦发现古城并非废墟，而是一个仍在运作的机械生态系统。",
    "他遇到了一位自称“守门人”的机械少女，得知了亚特兰蒂斯并未毁灭，而是进化成了机械文明。",
    "守门人警告他，地表人类的贪婪正在唤醒沉睡的深海巨兽。",
    "\n",
    "### 第三章：抉择",
    "深海巨兽苏醒，引发了巨大的海啸，威胁着沿海城市。",
    "艾伦必须做出选择：是帮助机械文明彻底封印巨兽，还是带着古城的能源核心回到地表，拯救即将枯竭的能源危机但可能引发更大的灾难。"
  ],
  polish: [
    "（AI 润色版本）\n",
    "那是一个暴风雨肆虐的夜晚，狂风如野兽般怒吼，暴雨像无数条鞭子狠狠抽打着窗户。",
    "艾伦紧紧攥着那枚泛黄的硬币，指节因用力而发白。",
    "他的眼神中交织着恐惧与决绝，仿佛这一刻，他已等待了千年。",
    "门外传来了沉重的脚步声，每一步都像是踩在他的心跳上，咚，咚，咚..."
  ],
  expand: [
    "（AI 扩写版本）\n",
    "原本简单的场景被赋予了更多的细节和情感。",
    "雨水顺着屋檐滴落，汇聚成细流，在坑洼的地面上形成一个个小水洼，倒映着昏暗的路灯。",
    "远处传来警笛的嘶鸣声，划破了夜的寂静，也让艾伦的心瞬间提到了嗓子眼。",
    "他能感觉到空气中弥漫着潮湿的泥土味，以及那一丝若有若无的铁锈气息——那是危险的味道。",
    "墙上的时钟滴答作响，仿佛在倒数着命运的终结。"
  ],
  continue: [
    "（AI 续写内容）\n",
    "就在这时，一道刺眼的白光穿透了黑暗，将整个房间照得如同白昼。",
    "艾伦下意识地抬手遮住眼睛，耳边传来了奇异的嗡鸣声。",
    "待光芒散去，他惊讶地发现，原本紧闭的房门竟然凭空消失了，取而代之的是一个旋转着的蓝色漩涡。",
    "漩涡中心传来了一个熟悉的声音：“艾伦，快进来，时间不多了！”",
    "那是他失踪多年的父亲的声音。"
  ],
  script: [ 
    // 此字段已不再直接使用，保留作为 fallback
    "场景：赛博朋克风格的街道，雨夜。",
    "角色：艾伦（身穿黑色风衣，眼神坚毅）。",
    "动作：艾伦在雨中狂奔，时不时回头张望。",
    "旁白：在这个被霓虹灯吞噬的城市里，没有人能逃过‘公司’的眼睛。",
    "特写：艾伦手中的芯片闪烁着红光。"
  ],
  characters: [
    "[",
    "  {",
    "    \"name\": \"林萧\",",
    "    \"role\": \"男主角\",",
    "    \"persona\": \"性格坚毅，身怀绝技的特种兵，因一次意外退役，隐姓埋名在都市中生活。表面上是一个普通的快递员，实则是暗网上传奇的赏金猎人。\",",
    "    \"visual_traits\": {",
    "      \"gender\": \"男\",",
    "      \"hair\": \"黑色短发，利落干练\",",
    "      \"eyes\": \"深邃的棕色眼睛，眼神锐利\",",
    "      \"clothing\": \"常穿深色工装裤和黑色冲锋衣，戴着一顶鸭舌帽\" ",
    "    }",
    "  },",
    "  {",
    "    \"name\": \"苏婉儿\",",
    "    \"role\": \"女主角\",",
    "    \"persona\": \"温柔善良的医院护士，实际上是古老医术世家的传人。在一次救治中意外发现了林萧的秘密，从此被卷入了一场巨大的阴谋。\",",
    "    \"visual_traits\": {",
    "      \"gender\": \"女\",",
    "      \"hair\": \"栗色长发，微卷\",",
    "      \"eyes\": \"明亮的大眼睛，充满灵气\",",
    "      \"clothing\": \"工作时穿护士服，平时喜欢穿素雅的连衣裙\"",
    "    }",
    "  },",
    "  {",
    "    \"name\": \"赵天霸\",",
    "    \"role\": \"反派BOSS\",",
    "    \"persona\": \"心狠手辣的商业大亨，控制着城市的地下势力。为了得到传说中的秘宝，不惜一切代价，视人命如草芥。\",",
    "    \"visual_traits\": {",
    "      \"gender\": \"男\",",
    "      \"hair\": \"光头，头顶有刀疤\",",
    "      \"eyes\": \"细长的眼睛，透着阴冷的光\",",
    "      \"clothing\": \"名贵西装，手指上戴着巨大的金戒指\"",
    "    }",
    "  }",
    "]"
  ],
  chapter_content: [
    "清晨的阳光透过稀疏的树叶，斑驳地洒在古老的石板路上。",
    "李云天深吸了一口气，感受着空气中那一丝不同寻常的灵气波动。",
    "作为天玄宗的一名外门弟子，他本不该在这个时候出现在后山禁地。",
    "但手中的那块黑色玉佩，正散发着温热的气息，指引着他向更深处走去。",
    "“如果传说都是真的……”李云天喃喃自语，眼中闪过一丝坚定，“那这就是我改变命运的唯一机会。”",
    "突然，前方的灌木丛传来一阵窸窣声，一只通体雪白的灵狐钻了出来，警惕地盯着他。",
    "李云天停下脚步，尽量让自己的呼吸变得平缓，生怕惊扰了这只灵物。",
    "就在这时，玉佩的光芒大盛，灵狐似乎感应到了什么，竟然没有逃跑，反而向他点了点头，转身向一处隐蔽的山洞跑去。",
    "李云天不再犹豫，快步跟了上去。山洞入口被藤蔓遮掩，若不是有灵狐带路，常人根本无法发现。",
    "走进山洞，一股古老而沧桑的气息扑面而来，洞壁上刻满了晦涩难懂的符文，隐隐闪烁着金光。",
    "而在山洞的中央，悬浮着一柄断剑，剑身虽残，却散发着令人心悸的剑意。",
    "“终于找到了……”李云天的声音因为激动而微微颤抖。"
  ],
  // 1. 口语化重写引擎
  colloquial: [
    "（口语化重写版本）\n",
    "哎，家人们谁懂啊！那天晚上下着暴雨，风那个吹啊，窗户都快被拍碎了。",
    "艾伦手里死死攥着个旧硬币，手都捏白了。你猜怎么着？他吓坏了！",
    "他那眼神，又怕又狠，好像这辈子就等这一刻似的。",
    "突然！门口传来咚咚咚的脚步声，好家伙，每一下都像踩在他心尖儿上！"
  ],
  // 2. 听觉节奏控制器
  rhythm: [
    "（听觉节奏优化版本）\n",
    "[语速中等][压抑] 暴雨夜。狂风怒号。[停顿0.5s]",
    "[语速加快][紧张] 艾伦死死攥着硬币。指节发白。",
    "[停顿1s][深吸气] 他在等。",
    "[音量提高][惊悚] 咚。咚。咚。[停顿0.5s] 脚步声来了！",
    "[语速急促] 是谁？是人是鬼？他猛地回头——"
  ],
  // 3. 剧情连贯性记忆链
  consistency: [
    "（连贯性修复版本）\n",
    "书接上回，就在艾伦以为摆脱了追踪者的时候，这暴雨夜里又出了岔子。",
    "他低头看了看左臂——伤口还在渗血，那是上一章在废弃工厂留下的。",
    "“老李说过，这硬币能救命。”艾伦想起那个神秘的杂货店老板，心里稍微定了定。",
    "但他不知道的是，早在三分钟前，屋顶上就已经趴着那个红眼杀手了。"
  ],
  // 4. 爽点/钩子强化器
  hooks: [
    "（爽点/钩子强化版本）\n",
    "（黄金3秒）你绝对想不到，这枚普通的硬币，下一秒会引发一场时空坍塌！",
    "暴雨夜，艾伦被逼到了绝路。他没时间废话，直接掏出了那枚硬币。",
    "门外的脚步声越来越近，咚、咚、咚！每一步都像是死神的倒计时。",
    "没退路了！他猛地将硬币抛向空中——",
    "就在硬币落下的瞬间，整个世界突然按下了暂停键！门被撞开，进来的竟然是……"
  ],
  // 5. 影视化对接 (Video Bridge)
  visual_prompts: [
    "**Scene 1: Cyberpunk Street**",
    "Prompts: cyberpunk street, night, heavy rain, neon lights, wet ground reflection, cinematic lighting, 8k, detailed atmosphere --ar 16:9",
    "\n",
    "**Scene 2: Alan's Close-up**",
    "Prompts: close-up of a man's hand holding a golden coin, intense expression, rain drops on face, dramatic lighting, depth of field, photorealistic --ar 16:9",
    "\n",
    "**Scene 3: Doorway**",
    "Prompts: dark doorway, silhouette of a person, mysterious atmosphere, backlight, suspenseful mood, high contrast --ar 16:9"
  ],
  script_format: [
    "| 镜号 | 画面 (Visual) | 旁白/台词 (Audio) | 预估时长 |",
    "| :--- | :--- | :--- | :--- |",
    "| 1 | 全景：暴雨夜，狂风怒号，窗户被拍打。色调冷蓝。 | (音效：雷声，风声) | 3s |",
    "| 2 | 特写：艾伦的手紧紧攥着一枚泛黄的硬币，指节发白。 | 艾伦(混响)：最后一次了。 | 2s |",
    "| 3 | 中景：艾伦的脸，眼神恐惧又决绝。 | (音效：心跳声放大) | 2s |",
    "| 4 | 特写：门把手。门外传来沉重的脚步声。 | (音效：咚、咚、咚) | 3s |"
  ]
};

/**
 * 模拟流式输出
 */
export async function streamLLMResponse(
  prompt: string,
  onChunk: (text: string) => void,
  onComplete?: () => void,
  onError?: (error: any) => void
) {
  // 分析 Prompt 意图
  let responseKey = 'default';
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('生成') && lowerPrompt.includes('角色') && lowerPrompt.includes('json')) {
    responseKey = 'characters';
  } else if (lowerPrompt.includes('大纲') || lowerPrompt.includes('outline')) {
    responseKey = 'outline';
  } else if (lowerPrompt.includes('口语化') || lowerPrompt.includes('colloquial')) {
    responseKey = 'colloquial';
  } else if (lowerPrompt.includes('听觉节奏') || lowerPrompt.includes('rhythm')) {
    responseKey = 'rhythm';
  } else if (lowerPrompt.includes('连贯性') || lowerPrompt.includes('consistency')) {
    responseKey = 'consistency';
  } else if (lowerPrompt.includes('爽点') || lowerPrompt.includes('hooks')) {
    responseKey = 'hooks';
  } else if (lowerPrompt.includes('画面提示词') || lowerPrompt.includes('visual_prompts')) {
    responseKey = 'visual_prompts';
  } else if (lowerPrompt.includes('分镜脚本') || lowerPrompt.includes('script_format')) {
    responseKey = 'script_format';
  } else if (lowerPrompt.includes('润色') || lowerPrompt.includes('polish')) {
    responseKey = 'polish';
  } else if (lowerPrompt.includes('扩写') || lowerPrompt.includes('expand')) {
    responseKey = 'expand';
  } else if (lowerPrompt.includes('续写') || lowerPrompt.includes('continue')) {
    responseKey = 'continue';
  } else if (lowerPrompt.includes('剧本') || lowerPrompt.includes('script')) {
    responseKey = 'script';
  } else if (lowerPrompt.includes('generate content for chapter') || lowerPrompt.includes('生成正文')) {
    responseKey = 'chapter_content';
  }

  const contentLines = MOCK_RESPONSES[responseKey];
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    for (const line of contentLines) {
      // 模拟逐字输出
      const chars = line.split('');
      for (const char of chars) {
        await new Promise(resolve => setTimeout(resolve, 30)); // 打字机速度
        onChunk(char);
      }
      // 换行
      onChunk('\n');
      await new Promise(resolve => setTimeout(resolve, 200)); // 行间停顿
    }

    if (onComplete) onComplete();

  } catch (error) {
    console.error('Mock LLM Stream Error:', error);
    if (onError) onError(error);
  }
}
