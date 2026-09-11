from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn

doc = Document()

# 设置默认字体为微软雅黑
style = doc.styles['Normal']
font = style.font
font.name = '微软雅黑'
font.color.rgb = RGBColor(0, 0, 0)
font.size = Pt(10.5)
style.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

def set_font(run, size=10.5, bold=False):
    run.font.name = '微软雅黑'
    run.font.color.rgb = RGBColor(0, 0, 0)
    run.font.size = Pt(size)
    run.bold = bold
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

def add_bullet(doc, text):
    p = doc.add_paragraph(text, style='List Bullet')
    for run in p.runs:
        set_font(run)
    return p

def add_section(doc, title, desc, existing_items, new_items):
    h = doc.add_heading(title, level=1)
    for run in h.runs:
        set_font(run)
    
    p = doc.add_paragraph()
    r = p.add_run(desc)
    set_font(r)
    
    p = doc.add_paragraph()
    r = p.add_run('现有功能：')
    set_font(r, bold=True)
    
    for item in existing_items:
        add_bullet(doc, item)
    
    p = doc.add_paragraph()
    r = p.add_run('v2.8 新增需求：')
    set_font(r, bold=True)
    
    for item in new_items:
        add_bullet(doc, item)

# 标题
title = doc.add_heading('AI短剧创作平台 v2.8 版本需求说明文档', level=0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
for run in title.runs:
    set_font(run, size=22)

# 基本信息
info_para = doc.add_paragraph()
info_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
info_run = info_para.add_run('版本号：v2.8 ｜ 发布日期：2026年7月')
set_font(info_run)

doc.add_paragraph()

# 模块1：会员充值
add_section(
    doc,
    '一、会员充值',
    '需求描述：完善会员充值功能，覆盖用户端与模型端双维度的充值体系。',
    [
        '会员套餐体系：AI短剧会员与超级会员两种会员类型，超级会员享受7.5折算力豆优惠',
        '充值档位：基础版99元/月（9900算力豆，2并发）、专业版299元/月（29900算力豆，4并发）、工作室版999元/月（99900算力豆，8并发）',
        '算力豆充值包：100/500/1000/5000算力豆档位，1元=100算力豆',
        '邀请返利机制：邀请好友注册奖励20算力豆',
        '订单管理：支持按类型筛选（会员/充值）、搜索、查看详情',
        '开票申请：关联订单填写抬头、税号、邮箱，本地存储'
    ],
    [
        '用户端充值：完善前端充值流程，对接真实第三方支付接口，支持支付宝、微信支付等多种支付方式',
        '模型端充值：增加模型算力额度充值功能，支持按模型类型单独充值算力豆',
        '充值记录查询：增加充值记录查询入口，支持按时间范围、支付方式、充值档位进行筛选'
    ]
)

# 模块2：支付对接
add_section(
    doc,
    '二、支付对接',
    '需求描述：完成支付平台的正式对接，实现真实的支付能力。',
    [
        '支付弹窗：支持支付宝/微信支付选择（模拟二维码展示）',
        '订单生成：支付成功后生成 LocalOrder 对象并存入 memberState.orders',
        '余额更新：支付完成后调用 effect 回调更新用户算力豆余额'
    ],
    [
        '对接真实支付平台API（支付宝/微信支付），实现完整的支付流程',
        '支付回调处理：接收支付平台异步通知，更新订单状态和用户余额',
        '支付安全：增加签名验证、防重放攻击等安全机制',
        '支付结果页：优化支付成功/失败后的页面展示和用户体验'
    ]
)

# 模块3：分镜视频
add_section(
    doc,
    '三、分镜视频',
    '需求描述：增强分镜视频的并发处理能力和异常提示机制。',
    [
        '分镜时间线管理：timelineScenes 数组管理分镜序列，支持视频、图片、描述等多字段',
        '主体库关联：支持角色/场景/道具关联到分镜，数据存储在 episodeStore.subjects',
        '批量操作：批量生成分镜、批量生成视频、批量导入分镜功能',
        'AI 生成进度：使用 teleport 到 body 的浮动卡片展示非阻塞式生成进度，支持后台运行',
        '关键操作：关联主体、合成全集、批量下载、预览全集'
    ],
    [
        '多集并发处理能力：支持多集分镜视频同时生成，提升批量处理效率',
        '并发队列管理：实现分镜视频生成的并发控制队列，避免资源过载',
        '异常提示信息：在分镜生成过程中增加详细的异常提示，包括导入时重复集数的检测与提示',
        '进度可视化：优化多集并发的进度展示，支持按集数维度查看生成状态'
    ]
)

# 模块4：剧本创作
add_section(
    doc,
    '四、剧本创作',
    '需求描述：优化剧本创作流程，支持导入剧本并增加模型选择功能。',
    [
        '三步流程：剧本设定 -> 大纲生成 -> 剧本生成',
        '左侧设置面板：题材设定（逆袭神豪/古装言情/悬疑推理）、风格倾向、核心受众、剧本模板、标签、集数、单集时长',
        '右侧内容区：作品名称（支持随机生成）、世界观设定、核心金手指、作品简介、角色档案',
        '新建短剧：支持 AI 灵感生成和导入已有剧本两种方式'
    ],
    [
        '导入剧本功能：支持用户上传已有剧本文件（TXT/MD/DOCX格式），解析后导入系统',
        '模型选择：在剧本创作各环节（大纲生成、剧本生成）中增加AI模型选择器，用户可根据需求选择不同的文本模型',
        '导入后预览：剧本导入后提供预览编辑界面，支持用户确认和修改导入内容'
    ]
)

# 模块5：分镜编辑
add_section(
    doc,
    '五、分镜编辑',
    '需求描述：实现分镜脚本的实时保存功能，保障用户数据安全。',
    [
        '分镜配置面板：分辨率选择、字幕开关、去水印开关等配置项',
        '模型选择：顶部工具栏集成 AIModelSelector 组件，分别选择文本模型和视频模型',
        '主体库管理：角色/场景/道具的增删改查',
        '分镜时间线：以 timelineScenes 数组管理分镜序列'
    ],
    [
        '分镜脚本实时保存：在分镜编辑过程中，自动检测用户修改并实时保存到后端数据库',
        '保存策略：采用防抖自动保存机制，富文本编辑器（Tiptap）内容变化时触发 onUpdate 回调，1.5秒无操作后执行保存',
        '保存内容：包含分镜序列数据（timelineScenes，深拷贝）、分镜脚本HTML内容（currentScript）、分镜状态（generating/success/pending）',
        '数据持久化：通过 episodeStore.updateEpisode() 更新 Pinia store，数据最终写入 localStorage（key: episodes-v1），实现刷新不丢失',
        '保存状态提示：保存期间界面底部工具栏展示琥珀色"自动保存中..."状态指示器（带加载动画和脉冲效果），保存完成后自动隐藏',
        '组件卸载保护：组件销毁时清理自动保存定时器并触发一次最终保存，确保最后一份修改不丢失',
        '手动保存联动：用户手动保存脚本时（handleSaveScriptInline），同步触发 persistStoryboardForEpisode 确保数据一致性'
    ]
)

# 模块6：模型能力
add_section(
    doc,
    '六、模型能力',
    '需求描述：完善模型计费体系和模型列表获取机制。',
    [
        '文本模型：豆包（doubao-seed-2.1-pro等5款）、DeepSeek（DeepSeek-V4）',
        '图像模型：OpenAI（ChatGPT Images 2.0）、Google（gemini-3.1-flash-lite-image）、豆包（doubao-seedream-5.0-lite）',
        '视频模型：豆包Seedance（doubao-seedance-2.5/2.0）、可灵（kling-3.0-omni）、Happy Horse（happyhorse-1.1）',
        '模型Store：全局选中模型、模块级模型锁定、全局锁定、权限检查',
        'ModelSelector组件：按厂商分组展示模型卡片，显示标签和算力消耗'
    ],
    [
        '新接模型的计费问题：建立统一的模型计费标准，新增模型接入时需配置对应的算力豆消耗规则',
        '计费维度：支持按调用次数、Token用量、生成时长等多种计费维度',
        '模型列表从模型平台获取：废弃硬编码的模型配置，改为从模型管理平台API动态获取模型列表',
        '自动同步：定期从模型平台同步最新模型信息，包括模型名称、描述、标签、算力消耗等',
        '模型状态管理：支持模型上下线管理，下架模型在列表中隐藏但仍保留历史数据引用'
    ]
)

# 模块7：成本管理
add_section(
    doc,
    '七、成本管理',
    '需求描述：优化消耗明细页面的金额展示策略，根据客户需求灵活控制金额统计的可见性。',
    [
        '算力豆体系：用户余额初始值1,000,000，持久化到localStorage',
        '消耗明细数据结构：包含流水号、用户编号、模型大类、模型编码/名称、场景编码/名称、计费维度、计费基数、短剧/剧集名称、扣减算力豆、最终扣减、消耗金额、扣费前后余额',
        '多维度筛选：流水号、模型大类、模型名称、短剧名称、剧集名称、日期范围',
        '统计卡片：总可用算力豆、总计消耗算力豆、总计消耗金额',
        '消耗金额计算公式：deductPoints × 0.007'
    ],
    [
        '消耗明细页面金额可控展示：根据客户配置决定是否在消耗明细页面展示金额统计',
        '后台配置：增加客户级别的金额展示开关配置，支持按客户维度独立设置',
        '前端适配：开启金额展示时正常显示消耗金额列和统计卡片；关闭时隐藏金额相关数据，仅展示算力豆消耗',
        '数据兼容：后端接口增加金额字段的可控性，根据客户配置返回脱敏数据'
    ]
)

# 保存文件
doc.save('AI短剧创作平台_v2.8版本需求说明文档.docx')
print('Document updated successfully!')
