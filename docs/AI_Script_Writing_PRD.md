# AI剧本创作核心模块深度功能需求文档 (Core PRD) v3.0

> **文档状态**：Release Candidate  
> **版本号**：v3.0  
> **最后更新**：2026-02-28  
> **撰写人**：资深产品专家（20年影视/文学/AI跨界经验）  
> **适用范围**：AI Novel Workstation - AI Script Module (Core Writing Only)  
> **排除模块**：创意风暴 (Creative Storm)、剧本转化 (Script Conversion)

---

## 0. 设计综述 (Executive Summary)

本PRD聚焦于剧本生产链路中**最硬核**的环节——从**结构搭建**到**正文撰写**。
我们不仅要解决“写得快”的问题，更要解决“写得对”的问题。基于20年影视工业经验，我们将剧本创作拆解为**“骨相”（结构）**与**“皮相”（正文）**两个维度，通过AI技术实现**结构化叙事**与**沉浸式写作**的完美融合。

---

## 1. 模块一：故事架构与分集工程台 (Story Architecture & Episode Workbench)

**页面定位**：剧本的“施工图纸”。在此阶段，编剧不写一句对白，只处理事件、节奏和冲突。
**对应页面**：`NovelGenerator.vue` (架构模式)

### 1.1 节拍控制中心 (Beat Sheet Control)
*   **功能定义**：基于好莱坞经典叙事模型，自动规划全剧节奏点。
*   **交互逻辑**：
    1.  **模板选择器**：下拉选择（《救猫咪》、《英雄之旅》、《哈蒙圆环》、《短剧三集黄金法则》）。
    2.  **集数映射**：输入总集数（如100集），系统自动计算关键节拍落点。
    3.  **拖拽调整**：用户可拖动“激励事件”从第3集移动到第5集，后续节拍自动顺延。

#### 1.1.1 字段定义 (Data Fields) - 50+
*   `beat_id`: UUID
*   `beat_name`: 节拍名称（如：灵魂黑夜）
*   `beat_description`: 节拍定义（如：主角失去一切希望）
*   `target_episode_range`: 建议集数范围（如：Ep.75-80）
*   `actual_episode_range`: 实际集数范围
*   `emotional_value_target`: 目标情感值 (-10 to 10)
*   `pacing_speed`: 节奏速率 (Fast/Slow)
*   `key_event_summary`: 关键事件一句话描述
*   `conflict_type`: 冲突类型 (Inner/Personal/Extra-personal)
*   `character_arc_stage`: 角色弧光阶段（如：拒绝召唤）

### 1.2 分集大纲看板 (Episode Outline Board)
*   **功能定义**：全剧集的鸟瞰视图，支持看板(Kanban)和列表(List)模式。
*   **交互逻辑**：
    1.  **卡片操作**：双击卡片进入编辑；拖拽卡片调整集数顺序。
    2.  **批量生成**：点击“AI 填充空缺”，AI基于节拍表自动生成未写的大纲。
    3.  **连贯性检查**：点击“逻辑自检”，AI扫描全剧，高亮显示逻辑断裂处（如：道具A在第5集损毁，第10集又被使用）。

#### 1.2.1 单集卡片详情 (Episode Card) - 80+ 字段
*   **基础信息**：
    *   `episode_no`: 集数
    *   `working_title`: 工作标题
    *   `time_of_day`: 时间 (D/N)
    *   `location_slug`: 场景地点 (INT. OFFICE)
    *   `weather`: 天气 (RAIN/SUNNY)
*   **叙事核心**：
    *   `logline`: 一句话梗概 (Who does what and why?)
    *   `main_action`: 核心动作
    *   `story_goal`: 本集叙事目标
    *   `obstacle`: 阻碍/反派力量
    *   `stakes`: 风险/代价 (What happens if they fail?)
    *   `outcome`: 结果 (+/-)
*   **情感与节奏**：
    *   `emotional_start`: 开场情感值
    *   `emotional_end`: 结尾情感值
    *   `tension_level`: 紧张度 (1-5)
    *   `hook_in`: 开场钩子
    *   `hook_out`: 结尾悬念 (Cliffhanger)
*   **角色调度**：
    *   `cast_list`: 出场角色ID列表
    *   `protagonist_agenda`: 主角潜台词/目的
    *   `antagonist_agenda`: 反派潜台词/目的
*   **视觉与伏笔**：
    *   `key_visual`: 核心视觉奇观
    *   `setup_payoff_ref`: 关联的伏笔/揭晓ID

---

## 2. 模块二：沉浸式剧本编剧台 (Immersive Script Workbench)

**页面定位**：文字生产车间。强调“流式心流”体验，所见即所得。
**对应页面**：`Editor.vue`

### 2.1 专业剧本编辑器 (The Screenplay Editor)
*   **功能定义**：严格遵循 Fountain / Final Draft 格式标准的富文本编辑器。
*   **交互逻辑**：
    1.  **智能格式化 (Smart Format)**：
        *   按下 `Enter` 键时，根据上一行类型自动推断下一行类型（如：`角色名` 后自动接 `对白`；`对白` 后自动接 `角色名` 或 `动作`）。
        *   按下 `Tab` 键轮转切换行类型：`场景标题` -> `动作` -> `角色名` -> `对白` -> `括号` -> `转场`。
    2.  **场景导航**：左侧大纲树与右侧正文双向同步，点击左侧节点，编辑器平滑滚动至对应位置。

#### 2.1.1 文本行属性字段 (Line Attributes) - 40+ 字段
*   `line_id`: UUID
*   `line_type`: 行类型 (Scene/Action/Character/Dialogue/Parenthetical/Transition/Shot)
*   `content_raw`: 原始内容
*   `content_formatted`: 格式化内容 (HTML)
*   `scene_id`: 所属场景ID
*   `character_ref`: 关联角色ID (仅Dialogue/Character类型)
*   `dialogue_type`: 对白类型 (V.O./O.S./CONT'D)
*   `revision_color`: 修改标记颜色
*   `comment_threads`: 批注/审阅意见
*   `ai_generated_flag`: 是否AI生成 (Boolean)
*   `confidence_score`: AI生成置信度

### 2.2 AI 编剧助理 (AI Co-Writer Copilot)
*   **功能定义**：悬浮于光标侧畔的智能助手，提供续写、润色、纠错服务。
*   **交互逻辑**：
    1.  **幽灵续写 (Ghost Write)**：光标静止2秒后，灰色文字预显后续内容，按 `Tab` 键采纳。
    2.  **指令交互 (Slash Command)**：输入 `/` 唤起指令菜单。
        *   `/scene [keywords]`: 生成完整场景。
        *   `/dialogue [emotion]`: 生成特定情绪对白。
        *   `/twist`: 生成反转情节。
    3.  **划词优化 (Selection Actions)**：
        *   选中一段对白 -> 悬浮菜单 -> 点击“潜台词化 (Subtext)”。
        *   *实现*：AI将直白的“我恨你”重写为“（递过一杯水）喝吧，别烫着。”（动作掩盖情绪）。

#### 2.2.2 辅助功能字段 (Copilot Fields) - 60+ 字段
*   **上下文参数**：
    *   `context_window_size`: 上下文窗口大小 (Token数)
    *   `current_style_vector`: 当前文风向量
    *   `active_character_mood`: 当前角色情绪状态
*   **生成控制**：
    *   `creativity_temperature`: 创意温度 (0-1)
    *   `dialogue_verbosity`: 对白啰嗦程度
    *   `action_density`: 动作描写密度
*   **优化指令集**：
    *   `instruction_type`: 指令类型 (Expand/Shorten/Tone Change)
    *   `target_tone`: 目标语调 (Sarcastic/Serious/Funny)
    *   `visual_enhancement_level`: 视觉增强等级 (1-5)

### 2.3 角色状态监控 (Character State Monitor) - 右侧栏
*   **功能定义**：实时监控当前场景中角色的状态，防止“人设崩塌”。
*   **交互逻辑**：
    *   当光标位于某角色对白行时，右侧栏自动高亮该角色卡片。
    *   **OOC 警告**：如果对白不符合角色 `MBTI` 或 `语言风格`，显示红色波浪线，并提示“OOC警告：该角色通常不会使用这种句式”。

#### 2.3.1 动态角色字段 (Dynamic Character Fields) - 50+
*   `current_scene_goal`: 当前场景目的
*   `current_scene_emotion`: 当前场景情绪
*   `knowledge_state`: 角色当前已知信息（防止全知视角bug）
*   `relationship_status_snapshot`: 当前时刻与其他角色的关系值
*   `hidden_agenda`: 隐藏动机
*   `physical_state`: 身体状态 (受伤/疲惫/亢奋)
*   `inventory`: 当前携带物品

---

## 3. 模块三：世界观与知识库引擎 (World & Lore Engine)

**页面定位**：剧本的“后台数据库”。在写作过程中随时调取，确保逻辑自洽。
**对应页面**：`Editor.vue` (侧边栏/浮窗)

### 3.1 设定一致性检查器 (Consistency Checker)
*   **功能定义**：防止吃书（Retcon）。
*   **交互逻辑**：
    *   当用户输入“主角拔出了激光剑”时，AI检索世界观设定。若设定为“古代武侠”，则提示“逻辑冲突：当前世界观不存在科技武器”。
    *   **快捷录入**：写作时选中“青龙偃月刀” -> 右键 -> “添加至物品库”。

#### 3.1.1 知识图谱字段 (Knowledge Graph Fields) - 60+
*   `entity_id`: 实体ID
*   `entity_type`: 实体类型 (Location/Item/Rule/History)
*   `name`: 名称
*   `aliases`: 别名列表
*   `description`: 描述
*   `rules`: 关联规则（如：只能在夜间使用）
*   `first_appearance_ref`: 首次出现章节ID
*   `status`: 状态 (Active/Destroyed/Lost)
*   `owner_id`: 当前持有者ID (针对Item)
*   `location_id`: 当前所在地ID (针对Item/Character)

---

## 4. 交互细节与体验设计 (UX Micro-interactions)

1.  **打字机模式 (Typewriter Mode)**：
    *   光标始终保持在屏幕垂直居中位置，减少眼球上下移动。
    *   当前行高亮，非当前行50%透明度。

2.  **专注模式 (Zen Mode)**：
    *   `F11` 一键隐藏所有侧边栏、顶部菜单，仅保留编辑器和极简状态栏（字数/时间）。
    *   背景切换为纯黑或深灰，文字对比度调整为舒适阅读级。

3.  **版本时光机 (Version Time Machine)**：
    *   每5分钟自动创建快照。
    *   支持“分支管理”：用户可在第10场创建一个分支A（主角死了）和分支B（主角活了），并行写作，最后合并。

4.  **情绪热力图 (Emotional Heatmap)**：
    *   在滚动条右侧显示细长的彩条。
    *   红色代表高冲突/动作戏，蓝色代表情感/文戏，灰色代表说明性文字。
    *   编剧可一目了然整集的节奏分布。

---

*文档生成时间：2026-02-28*
