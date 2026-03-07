// 模拟不同类型的 AI 响应内容
const MOCK_RESPONSES: Record<string, string[]> = {
  default: [
    "这是一个模拟的 AI 响应。由于我们处于演示模式，我无法连接到真实的大模型。",
    "但我可以展示流式输出的效果。",
    "你看，这些文字正在逐字逐句地出现，就像真实的 AI 在思考一样。",
    "在这个模式下，你可以体验整个应用的功能流程，而不需要消耗 API Token。"
  ],
  outline: [
    "### 第一集：烽火初燃 血洗村庄",
    "边境村庄突遭敌军铁骑践踏，烈火吞噬了家园。",
    "主角赵铁牛目睹亲人惨死，在废墟中立誓复仇，从此踏上了一条不归路。",
    "\n",
    "### 第二集：牢狱结义 共谋越狱",
    "赵铁牛刺杀敌将失败被捕，被打入死牢。",
    "在狱中，他结识了豪杰王二狗与神秘书生，三人意气相投，决定联手越狱。",
    "\n",
    "### 第三集：越狱风云 暗道逃生",
    "趁着夜色与暴雨，三人利用书生推演出的巡逻漏洞，潜入废弃的地下暗道。",
    "后有追兵，前有机关，一场惊心动魄的逃亡在地下展开。",
    "\n",
    "### 第四集：揭竿而起 聚民为军",
    "逃出生天后，赵铁牛意识到单打独斗无法撼动暴政。",
    "他回到流民聚集的黑风岭，竖起义旗，号召天下受苦百姓加入义军。",
    "\n",
    "### 第五集：初战告捷 反抗伊始",
    "义军初成，便遭到县令派兵围剿。",
    "赵铁牛利用地形优势设伏，大破官兵，斩杀领队。这一战威震四方，各地豪杰纷纷来投。"
  ],
  polish: [
    "（AI 润色版本）\n",
    "那是一个战火纷飞的夜晚，烽烟如恶龙般吞噬了村庄，哭喊声撕裂了夜空。",
    "赵铁牛紧紧攥着那把沾血的铁锤，指节因用力而发白。",
    "他的眼神中交织着仇恨与决绝，仿佛这一刻，他已化身为复仇的修罗。",
    "远处传来了沉重的马蹄声，每一声都像是踩在他的心跳上，咚，咚，咚..."
  ],
  expand: [
    "（AI 扩写版本）\n",
    "原本简单的场景被赋予了更多的细节和情感。",
    "鲜血顺着刀锋滴落，汇聚成细流，在焦黑的土地上形成一个个暗红的水洼，倒映着燃烧的房屋。",
    "远处传来号角的嘶鸣声，划破了夜的寂静，也让赵铁牛的心瞬间提到了嗓子眼。",
    "他能感觉到空气中弥漫着刺鼻的焦糊味，以及那一丝若有若无的血腥气息——那是死亡的味道。",
    "手中的铁锤仿佛有千斤重，却也是他此刻唯一的依靠。"
  ],
  continue: [
    "（AI 续写内容）\n",
    "就在这时，一道凌厉的箭矢穿透了烟雾，钉在了赵铁牛身旁的木柱上。",
    "赵铁牛下意识地侧身闪避，耳边传来了弓弦震颤的嗡鸣声。",
    "待烟尘散去，他惊讶地发现，原本空无一人的巷口竟然多了一队全副武装的官兵。",
    "领头的那人发出了一声冷笑：“赵铁牛，你跑不掉了！”",
    "那是他死敌耶律齐的声音。"
  ],
  script: [ 
    // 此字段已不再直接使用，保留作为 fallback
    "场景：被焚毁的村庄，夜晚，火光冲天。",
    "角色：赵铁牛（身穿粗布麻衣，手持铁锤，满脸悲愤）。",
    "动作：赵铁牛在废墟中狂奔，试图寻找生还者。",
    "旁白：在这乱世之中，命如草芥，唯有手中的兵刃能讨回公道。",
    "特写：赵铁牛紧握铁锤的手，青筋暴起。"
  ],
  characters: [
    "[",
    "  {",
    "    \"name\": \"赵铁牛\",",
    "    \"role\": \"男主角\",",
    "    \"persona\": \"淮西铁匠，义军领袖。性格暴烈如火却粗中有细，父母被杀后觉醒反抗意识。力大无穷，善使一把玄铁重锤。\",",
    "    \"visual_traits\": {",
    "      \"gender\": \"男\",",
    "      \"hair\": \"乱发，系着草绳\",",
    "      \"eyes\": \"充满怒火的铜铃大眼\",",
    "      \"clothing\": \"常穿浸透汗渍的粗布短打，右臂有铁锤图腾纹身\" ",
    "    }",
    "  },",
    "  {",
    "    \"name\": \"柳三娘\",",
    "    \"role\": \"女主角\",",
    "    \"persona\": \"游方医女，义军军医。外表柔弱但内心坚韧，擅长金针刺穴。暗中倾慕赵铁牛，多次在危难中救他性命。\",",
    "    \"visual_traits\": {",
    "      \"gender\": \"女\",",
    "      \"hair\": \"乌黑长发，盘成发髻\",",
    "      \"eyes\": \"温柔而坚定\",",
    "      \"clothing\": \"淡青色布裙，背着药箱\"",
    "    }",
    "  },",
    "  {",
    "    \"name\": \"耶律齐\",",
    "    \"role\": \"反派BOSS\",",
    "    \"persona\": \"元军百户长，残忍狡诈的猎手。擅长心理战，视汉人如草芥。与赵铁牛有灭门之仇。\",",
    "    \"visual_traits\": {",
    "      \"gender\": \"男\",",
    "      \"hair\": \"扎着金钱鼠尾辫\",",
    "      \"eyes\": \"阴鸷，左脸有蜈蚣状疤痕\",",
    "      \"clothing\": \"猩红披风，精良铠甲\"",
    "    }",
    "  }",
    "]"
  ],
  chapter_content: [
    "残阳如血，洒在焦黑的断壁残垣上。",
    "赵铁牛深吸了一口气，肺部充满了烟尘和血腥味。",
    "作为一个普通的铁匠，他本不该卷入这场战争。",
    "但脚下那具冰冷的尸体，正是他相依为命的老父。",
    "“这世道……不让人活啊！”赵铁牛低声咆哮，眼中闪过一丝疯狂，“那我就砸碎这世道！”",
    "突然，前方的废墟中传来一阵呻吟声，一个浑身是血的村民爬了出来。",
    "赵铁牛冲上前去，扶起村民。村民颤抖着指向村口：“官兵……还在……”",
    "就在这时，一阵马蹄声传来，一队元军骑兵去而复返。",
    "赵铁牛不再犹豫，抓起地上的打铁锤，大步向村口走去。",
    "他的背影在夕阳下拉得很长，仿佛一座巍峨的山峰。",
    "面对呼啸而来的铁骑，他高高举起了手中的铁锤。",
    "“偿命来！！！”赵铁牛的怒吼声响彻云霄。"
  ],
  script_scene_format: [
    "【角色清单】",
    "",
    "【男主】赵铁牛",
    "年龄：26岁",
    "身份：淮西铁匠/义军领袖",
    "性格特质：暴烈如火却粗中有细，幼年随父打铁锤炼出惊人臂力，父母被杀后形成“以命换命”的搏杀风格，习惯用草绳缠柄增强武器握持力",
    "背景故事：元至正十二年，元军强征铁器时父母反抗被杀，目睹惨状后觉醒反抗意识，成为方圆百里第一个敢正面硬刚元军的硬汉",
    "外在表现：身高九尺满脸虬髯，常穿浸透汗渍的粗布短打，右臂纹着家传的玄铁锤图腾",
    "音色：低沉粗犷，带火气与压抑感，咬字重，爆发力强",
    "关系网络：与王二狗形成“猛虎配狡狐”组合，暗中倾慕医女柳三娘却不敢言明",
    "成长弧光：从孤胆莽夫蜕变为懂得凝聚人心的领袖，学会用智谋代替蛮力",
    "----------------------------------------",
    "【反派】耶律齐",
    "年龄：35岁",
    "身份：元军百户长",
    "性格特质：残忍狡诈的猎手，擅长用心理战瓦解对手，随身携带记录抗元义军弱点的羊皮卷，每杀一人便在刀柄系红绳",
    "背景故事：曾是金国贵族，家族被元军灭门后反投鞑子，掌握着三套针对不同地形作战的秘传战法",
    "外在表现：左脸有道蜈蚣状疤痕，总穿猩红披风，马鞍上挂着九个鞑靼风格的人皮鼓",
    "音色：冷静阴沉，语速平稳但带讥讽尾音，低笑令人不寒而栗",
    "关系网络：与王二狗有灭门之仇，视赵铁牛为值得尊重的对手，暗中策反义军中的逃兵",
    "关键事件：初战中故意留出破绽诱敌深入，其训练的狼牙箭手造成义军重大伤亡",
    "----------------------------------------",
    "【道具清单】",
    "粗麻绳（捆绑俘虏）",
    "----------------------------------------",
    "【场景信息】",
    "地点：淮西村庄外荒野官道",
    "时间：白天",
    "天气：阴天 / 风沙",
    "氛围：压迫、残酷、悲愤",
    "背景环境：被焚毁的村庄在远处冒着黑烟，田地被战马践踏，尸体散落。",
    "----------------------------------------",
    "【分镜 01】",
    "",
    "镜头：远景 → 缓慢推镜",
    "画面：一支元军押送俘虏的队伍缓慢行进在荒凉的土路上",
    "人物：赵铁牛、耶律齐、元军士兵",
    "动作：赵铁牛被五花大绑，衣衫破碎，身上血迹斑斑。",
    "",
    "镜头：中景（赵铁牛）",
    "画面：赵铁牛抬头死死盯着耶律齐，眼中充满仇恨。",
    "人物：赵铁牛",
    "动作：咬牙低吼",
    "对白：耶律齐！你这个卖国求荣的狗贼！",
    "",
    "镜头：特写（耶律齐）",
    "画面：耶律齐微微低头，露出讥讽笑容。",
    "人物：耶律齐",
    "动作：冷笑回应",
    "对白：呵……就凭你？"
  ],
  // 1. 口语化重写引擎
  colloquial: [
    "（口语化重写版本）\n",
    "哎，这世道乱得没法看了！那天晚上火光冲天，官兵那个杀啊，村子都快被烧没了。",
    "赵铁牛手里死死攥着把破铁锤，手都捏白了。你猜怎么着？他气炸了！",
    "他那眼神，又恨又狠，好像这辈子就等这一刻报仇似的。",
    "突然！巷口传来咚咚咚的马蹄声，好家伙，每一下都像踩在他心尖儿上！"
  ],
  // 2. 听觉节奏控制器
  rhythm: [
    "（听觉节奏优化版本）\n",
    "[语速中等][压抑] 战火夜。烽烟四起。[停顿0.5s]",
    "[语速加快][紧张] 赵铁牛死死攥着铁锤。指节发白。",
    "[停顿1s][深吸气] 他在等。",
    "[音量提高][惊悚] 咚。咚。咚。[停顿0.5s] 马蹄声来了！",
    "[语速急促] 是谁？是官兵还是义军？他猛地回头——"
  ],
  // 3. 剧情连贯性记忆链
  consistency: [
    "（连贯性修复版本）\n",
    "书接上回，就在赵铁牛以为摆脱了追兵的时候，这乱葬岗里又出了岔子。",
    "他低头看了看左臂——伤口还在渗血，那是上一章在突围时留下的。",
    "“三娘说过，这药草能止血。”赵铁牛想起那个温柔的医女，心里稍微定了定。",
    "但他不知道的是，早在三分钟前，树梢上就已经趴着那个神箭手了。"
  ],
  // 4. 爽点/钩子强化器
  hooks: [
    "（爽点/钩子强化版本）\n",
    "（黄金3秒）你绝对想不到，这把普通的铁锤，下一秒会砸碎一个王朝的脊梁！",
    "战火夜，赵铁牛被逼到了绝路。他没时间废话，直接抡起了那把铁锤。",
    "巷口的马蹄声越来越近，咚、咚、咚！每一步都像是死神的倒计时。",
    "没退路了！他猛地将铁锤砸向地面——",
    "就在大地开裂的瞬间，整个战场突然安静了！烟尘散去，走出来的竟然是……"
  ],
  // 5. 影视化对接 (Video Bridge)
  visual_prompts: [
    "**Scene 1: Burning Village**",
    "Prompts: ancient chinese village on fire, night, war chaos, historical drama style, cinematic lighting, 8k, detailed atmosphere --ar 16:9",
    "\n",
    "**Scene 2: Zhao Tieniu's Close-up**",
    "Prompts: close-up of a rugged man holding an iron hammer, angry expression, sweat and soot on face, dramatic lighting, depth of field, photorealistic --ar 16:9",
    "\n",
    "**Scene 3: Confrontation**",
    "Prompts: two warriors facing each other in ruins, silhouette, mysterious atmosphere, backlight, suspenseful mood, high contrast --ar 16:9"
  ],
  script_format: [
    "| 镜号 | 画面 (Visual) | 旁白/台词 (Audio) | 预估时长 |",
    "| :--- | :--- | :--- | :--- |",
    "| 1 | 全景：战火纷飞，村庄燃烧。色调暖红。 | (音效：哭喊声，燃烧声) | 3s |",
    "| 2 | 特写：赵铁牛的手紧紧攥着铁锤，指节发白。 | 赵铁牛(混响)：血债血偿。 | 2s |",
    "| 3 | 中景：赵铁牛的脸，眼神仇恨又决绝。 | (音效：心跳声放大) | 2s |",
    "| 4 | 特写：巷口。远处传来沉重的马蹄声。 | (音效：咚、咚、咚) | 3s |"
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
  
  if (lowerPrompt.includes('【角色清单】') || lowerPrompt.includes('角色清单') && lowerPrompt.includes('分镜')) {
    responseKey = 'script_scene_format';
  } else if (lowerPrompt.includes('生成') && lowerPrompt.includes('角色') && lowerPrompt.includes('json')) {
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
