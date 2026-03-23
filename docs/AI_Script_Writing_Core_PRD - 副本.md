# AI剧本创作核心模块深度功能需求文档 (Core PRD) v4.0

> **文档状态**：Release Candidate  
> **版本号**：v4.0  
> **最后更新**：2026-02-28  
> **撰写人**：资深产品专家（20年影视/文学/AI跨界经验）  
> **适用范围**：`src/views/AIScriptWriting` 目录下的所有模块  
> **排除模块**：创意风暴 (Creative Storm)、剧本转化 (Script Conversion)

---

## 0. 设计综述 (Executive Summary)

本PRD聚焦于 **AI Script Writing** 核心模块，旨在打造一个符合专业编剧工业标准的智能化创作工作流。
系统将剧本创作拆解为四个严谨的工序：**项目管理** -> **创意孵化** -> **结构搭建** -> **沉浸撰写**。
通过AI技术（LLM + RAG），在保持人类创作者核心创意主导权的前提下，指数级提升剧本生产效率，实现从“灵感”到“拍摄蓝图”的无缝转化。

---

## 1. 模块一：项目管理中心 (Project Hub)

**页面定位**：创作者的“个人工作室”。管理所有剧本项目的入口，提供快速的新建、封面生成和状态预览功能。
**对应页面**：`src/views/AIScriptWriting/Projects.vue`

### 1.1 项目列表视图 (Project Grid/List)
*   **功能定义**：展示用户所有已创建的剧本项。
*   **交互逻辑**：
    1.  **卡片展示**：每个项目以卡片形式展示，包含封面、标题、字数、更新时间。
    2.  **悬浮操作**：鼠标悬停在卡片上时，显示“编辑”和“生成封面”按钮。
    3.  **进入项目**：点击卡片非按钮区域，跳转至 `Editor` 页面（需携带 `project_id`）。
    4.  **新建项目**：点击右上角“新建项目”按钮，初始化一个空项目并跳转至 `AIWriteNovel` 页面。

#### 1.1.1 页面元素与字段 (UI Elements & Fields)
| 元素名称 | 类型 | 交互/逻辑 | 数据字段映射 |
| :--- | :--- | :--- | :--- |
| **新建项目按钮** | Button (Primary) | 点击 -> 创建 `new Project()` -> 插入列表首位 -> 跳转 `editor/:id` | - |
| **项目卡片容器** | Card | 悬浮 -> 显示遮罩层(Overlay) | `project_id` |
| **项目封面** | Image | 若 `cover_url` 为空，显示默认占位符图标 | `cover_url` |
| **项目标题** | Text (H3) | 单行截断，鼠标悬停显示完整标题 | `title` |
| **字数统计** | Text (Label) | 实时统计项目总字数 | `total_word_count` |
| **更新时间** | Text (Label) | 显示相对时间（如：2小时前） | `updated_at` |
| **编辑按钮** | Button (Icon) | 悬浮显示 -> 点击跳转编辑器 | - |
| **魔法棒按钮** | Button (Icon) | 悬浮显示 -> 点击打开“封面生成弹窗” | - |

### 1.2 AI 封面生成器 (AI Cover Generator)
*   **功能定义**：基于剧本标题和描述，调用文生图模型生成项目封面。
*   **交互逻辑**：
    1.  **弹窗激活**：点击项目卡片上的“魔法棒”按钮触发。
    2.  **提示词输入**：默认填入 `title` + "电影感封面"，用户可修改。
    3.  **生成流**：点击“生成变体” -> 按钮Loading -> 轮播图显示生成结果（支持多张预览）。
    4.  **确认应用**：点击“选择此封面” -> 更新项目数据 -> 关闭弹窗。

#### 1.2.1 弹窗字段详情
| 字段/控件 | 类型 | 默认值/逻辑 |
| :--- | :--- | :--- |
| `active_project_id` | Hidden | 当前操作的项目ID |
| `prompt_input` | Textarea | `"${title}" 的电影感封面，高细节，8k分辨率` |
| `generated_images` | Array | 存储生成的图片URL列表 |
| `is_generating` | Boolean | 控制生成按钮的 Loading 状态 |
| `selected_image_index` | Integer | 当前轮播图选中的索引 |

---

## 2. 模块二：创意孵化台 (Concept Incubator)

**页面定位**：剧本的“灵魂”诞生之地。定义世界观、角色、题材和核心冲突。
**对应页面**：`src/views/AIScriptWriting/AIWriteNovel.vue`

### 2.1 基础设定表单 (Core Settings Form)
*   **功能定义**：确立剧本的工业规格和题材基调。
*   **交互逻辑**：
    *   **步骤导航**：顶部 `StepIndicator` 显示当前为“基础设定”阶段。
    *   **实时保存**：表单修改即时写入 Store。

#### 2.1.1 剧本规格配置 (Script Specs)
| 字段名称 | 类型 | 必填 | 逻辑/限制 |
| :--- | :--- | :--- | :--- |
| `episode_count` | Number | 是 | 范围 1-100。短剧通常 1-100，长剧 30-40。影响后续节拍规划。 |
| `episode_duration` | Number | 是 | 单位：秒。范围 30-120。影响单集目标字数（1min ≈ 300字）。 |
| `target_audience` | Enum | 是 | 选项：`female_romance` (女频), `male_warrior` (男频), `suspense` (悬疑)。影响AI文风。 |

#### 2.1.2 题材与风格 (Genre & Style)
| 字段名称 | 类型 | 交互描述 |
| :--- | :--- | :--- |
| `genre` | String | 点击触发 `GenreDialog`。支持二级选择（如：玄幻 -> 东方玄幻）。 |
| `styles` | Array<String> | 点击触发 `StyleDialog`。多选标签（如：爽文、甜宠、虐心）。支持移除。 |
| `tags` | Array<String> | 点击触发 `TagDialog`。细分元素标签（如：系统、重生、真假千金）。 |

#### 2.1.3 深度记忆引擎开关 (Deep Memory Switch)
*   **字段**：`enable_long_memory` (Boolean)
*   **逻辑**：开启后，AI在生成后续章节时，会强制检索前文构建的向量数据库（RAG），以保持剧情连贯性。

### 2.2 创意输入区 (Creative Input)
*   **功能定义**：用户输入核心灵感，AI辅助扩充。
*   **字段**：
    *   `core_idea` (Textarea): “一句话梗概”。
    *   `world_view` (Textarea): “世界观设定”。
    *   `golden_finger` (Textarea): “金手指/核心设定”。

### 2.3 弹窗组件逻辑
1.  **题材选择弹窗 (`GenreDialog`)**：
    *   左侧一级分类导航（玄幻/都市/言情...）。
    *   右侧二级分类网格。
    *   支持“自定义题材”输入。
2.  **风格/标签选择弹窗 (`StyleDialog` / `TagDialog`)**：
    *   包含“热门推荐”和“搜索过滤”。
    *   点击标签即选中，再次点击取消。

---

## 3. 模块三：结构工程台 (Structure Architect)

**页面定位**：剧本的“骨架”搭建。从大纲生成到分集管理。
**对应页面**：`src/views/AIScriptWriting/NovelGenerator.vue`

### 3.1 智能大纲生成器 (AI Outline Generator)
*   **状态**：`step === 'outline'`
*   **交互逻辑**：
    1.  **加载态**：进入页面自动触发 `generateOutline()`，显示 Loading 遮罩。
    2.  **流式输出**：模拟打字机效果，逐行显示生成的章节标题和梗概。
    3.  **人工干预**：
        *   **修改**：用户可直接编辑生成的 `title` 和 `summary`。
        *   **重生成 (Regenerate)**：点击单行后的“刷新”图标，仅重写该章大纲。
        *   **删除/新增**：支持对章节进行增删操作。
    4.  **确认大纲**：点击“确认大纲”按钮，数据固化，进入 `chapters` 状态。

#### 3.1.1 大纲数据模型 (Outline Item Model)
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `chapter_index` | Integer | 章节序号 (1-based) |
| `title` | String | 章节标题（如：第1章 烽火初燃 血洗村庄） |
| `summary` | Text | 章节剧情简述（200字以内） |
| `beat_tags` | Array | [可选] 节拍标签（如：激励事件、高潮） |

### 3.2 章节管理看板 (Chapter Management)
*   **状态**：`step === 'chapters'`
*   **交互逻辑**：
    1.  **统计卡片**：顶部展示 `总章节数`、`已完成数`、`最近更新时间`。
    2.  **列表视图**：展示所有章节的状态（未开始/进行中/已完成）。
    3.  **核心操作**：
        *   **AI 撰写**：跳转 `Editor` 并携带 `autoStart=true` 参数，自动开始正文生成。
        *   **手写**：跳转 `Editor`，用户手动输入。
        *   **对接短剧**：触发“单集剧本导出”弹窗。
    4.  **批量操作**：顶部新增“批量短剧”卡片，点击触发全剧本导出。

### 3.3 短剧剧本导出系统 (Script Export System)
*   **功能定义**：将文学大纲/正文转化为标准的分镜脚本格式。
*   **弹窗交互 (`ScriptDialog`)**：
    1.  **预览区**：左侧显示生成的脚本预览（只读）。
    2.  **项目选择**：底部下拉框 `selectedDownstreamProject`，选择下游视频制作项目。
    3.  **推送草稿**：点击“推送草稿”，模拟调用 API 将脚本发送至下游系统。
    4.  **复制/导出**：支持一键复制到剪贴板。

#### 3.3.1 剧本格式化逻辑 (Script Formatting Logic)
AI 将自动把小说格式转化为以下结构：
```text
【SCENE 01】
场景：[地点] - [时间]
人物：[角色A], [角色B]

【ACTION】
(镜头推进) [动作描写]

[角色A]
(情绪/神态)
[对白内容]

【CUT】
```

---

## 4. 模块四：沉浸撰写台 (Immersive Editor)

**页面定位**：文字生产车间。集成 AI 辅助、角色管理和实时优化的富文本编辑器。
**对应页面**：`src/views/AIScriptWriting/Editor.vue`

### 4.1 布局架构 (Layout Architecture)
*   **左侧栏 (Lore Hub)**：
    *   **章节导航**：树状目录，支持点击切换章节。
    *   **角色卡片**：展示当前剧本的角色列表，支持“AI 自动生成角色”和“手动添加”。
*   **中间栏 (Main Editor)**：
    *   **Tiptap 编辑器**：支持 Markdown 语法，自定义样式。
    *   **悬浮菜单 (Bubble Menu)**：选中文字后弹出 AI 指令菜单（润色、扩写、续写）。
*   **右侧栏 (AI Assistant)**：
    *   **Chat 模式**：与 AI 对话，询问剧情建议。
    *   **Script 模式**：短剧专项优化工具面板。

### 4.2 核心写作功能 (Core Writing Features)

#### 4.2.1 智能续写 (AI Continue)
*   **触发**：点击悬浮菜单的“续写”按钮或快捷键。
*   **逻辑**：
    1.  获取当前光标前的上下文（Context Window）。
    2.  结合 `loreStore` 中的角色设定和大纲。
    3.  流式生成后续 500-1000 字内容。
    4.  生成过程中编辑器显示“AI 正在撰写中...”状态标签。

#### 4.2.2 五感填充引擎 (Five Senses Engine)
*   **触发**：点击顶部工具栏或快捷指令。
*   **交互**：
    1.  弹出模态框，展示当前选中的“平淡文本”。
    2.  AI 自动生成 **视觉、听觉、嗅觉、味觉、触觉** 五个维度的描写建议。
    3.  用户可选择性地将这些描写插入正文，增强画面感。

#### 4.2.3 角色管理系统 (Character System)
*   **数据结构**：
    *   `name`: 姓名
    *   `role`: 角色定位（主角/反派/配角）
    *   `visual_traits`: { gender, hair, eyes, clothing } (用于后续生图)
*   **交互**：
    *   **自动生成**：点击“AI 自动生成”，分析大纲自动提取角色并建档。
    *   **视觉化**：集成 `DiceBear` API 生成随机头像。

### 4.3 辅助工具 (Auxiliary Tools)

#### 4.3.1 对比优化 (Diff View)
*   **场景**：当用户选择“润色”或“改写”时。
*   **交互**：弹出 `Comparison Dialog`。
    *   左侧：原文。
    *   右侧：AI 修改后的文本。
    *   底部操作：`替换原文` 或 `保留原文并追加`。

#### 4.3.2 实时字数与状态
*   **字数统计**：基于 `Tiptap CharacterCount` 扩展，实时显示。
*   **保存状态**：`onUpdate` 钩子触发 `loreStore.updateChapter()`，实现自动保存。

---

## 5. 数据流转与状态管理 (Data Flow & State Management)

### 5.1 全局 Store (`useLoreStore`)
所有模块通过 Pinia Store 共享状态，确保数据一致性。

#### 5.1.1 核心 State 结构
```typescript
interface NovelProject {
  id: string;
  title: string;
  genre: string; // 题材
  style: string[]; // 风格标签
  episodeCount: number; // 预计集数
  episodeDuration: number; // 单集时长
  targetAudience: string; // 受众
  worldView: string; // 世界观
  goldenFinger: string; // 金手指
  
  // 核心资产
  chapters: Chapter[]; // 章节列表
  characters: Character[]; // 角色列表
  
  // 状态标记
  currentStep: number; // 当前创作阶段
  lastModified: number; // 时间戳
}

interface Chapter {
  id: string;
  title: string;
  outline: string; // 大纲/梗概
  content: string; // 正文 (HTML)
  status: 'draft' | 'completed';
}
```

### 5.2 跨页面传参
*   **路由参数**：
    *   `editor/:id`: 通过 URL ID 锁定当前操作的项目。
    *   `query`: `autoStart=true` (从大纲页跳转来时，自动触发 AI 写作)。

---

## 6. 交互体验细节 (UX Guidelines)

1.  **暗色模式 (Dark Mode)**：全系统默认采用深色 UI (`slate-900`)，减少长时间写作的视觉疲劳。
2.  **流式反馈 (Streaming Feedback)**：所有 AI 生成操作必须有明确的 Loading 动画或流式打字机效果，避免用户产生“死机”错觉。
3.  **操作可逆**：AI 对文本的修改建议（润色、改写）必须通过弹窗确认或提供撤销功能，绝不直接覆盖用户原文。
4.  **无缝衔接**：顶部 `StepIndicator` 组件在三个核心页面保持位置和样式的一致性，强化“流程感”。

---

*文档生成时间：2026-02-28*
