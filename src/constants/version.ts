/** 当前发布版本 */
export const APP_VERSION = 'v1.0.1'

/** 版本历史 — 倒序排列（最新在前） */
export type ChangelogEntry = {
  version: string
  date: string
  highlights: string[]
}

export const changelogHistory: ChangelogEntry[] = [
  {
    version: 'v1.0.1',
    date: '2026-07-27',
    highlights: [
      '平台正式发布，支持 AI 短剧创作全流程',
      'AI 剧本生成：智能分集大纲与场景分镜',
      '素材管理：支持人物/场景/道具分类与素材库',
      '分镜合成：拖拽式时间轴编排与批量视频生成',
      '会员中心与算力消耗明细查询',
      '团队协作：角色权限与成员管理',
      '主题切换：支持浅色/深色双模式',
    ]
  }
]
