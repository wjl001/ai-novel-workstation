<template>
  <div class="role-permission-container" :class="{ 'is-dark': themeStore.isDark }">
    <div class="flex items-start gap-4 mb-8 bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-indigo-50 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30">
      <div class="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0">
        <el-icon class="text-2xl text-blue-500 dark:text-blue-400"><WarningFilled /></el-icon>
      </div>
      <div>
        <h3 class="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">角色权限说明</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          子账号的所有操作均严格受其"角色权限"控制。为确保各司其职并保障资产安全，创建子账号时需为其设定角色。<br/>
          <span class="text-indigo-600 dark:text-indigo-400 font-medium">注：同一子账号在所有项目中的权限保持一致，由其角色决定。</span>
        </p>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
      <el-table 
        :data="roleData" 
        style="width: 100%" 
        :header-cell-style="tableHeaderStyle"
        class="custom-table"
      >
        <el-table-column prop="category" label="角色类别" width="140">
          <template #default="{ row }">
            <span class="font-bold" :class="row.category === '管理类角色' ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'">
              {{ row.category }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="roleName" label="角色名称" width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                <el-icon :class="getRoleIconColor(row.roleName)"><component :is="getRoleIcon(row.roleName)" /></el-icon>
              </div>
              <span class="font-bold text-slate-800 dark:text-slate-100">{{ row.roleName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="responsibility" label="主要职责" width="160">
          <template #default="{ row }">
            <el-tag size="small" type="info" class="!border-slate-200 dark:!border-slate-700 !text-slate-600 dark:!text-slate-400 !bg-slate-50 dark:!bg-slate-800">
              {{ row.responsibility }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="managementScope" label="管理范围" width="180">
          <template #default="{ row }">
            <span class="text-slate-600 dark:text-slate-300 font-medium">{{ row.managementScope }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="assetPermissions" label="资产及创作权限">
          <template #default="{ row }">
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{{ row.assetPermissions }}</p>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
        <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors">
          <el-icon class="text-2xl text-indigo-500 dark:text-indigo-400 group-hover:text-white transition-colors"><Connection /></el-icon>
        </div>
        <h4 class="font-bold text-slate-800 dark:text-slate-100 mb-2 text-lg">账号关系</h4>
        <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          注册账号即为"主账号"（团队拥有者）。主账号开通团队后，可创建并管理多个"子账号"。
        </p>
      </div>

      <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
        <div class="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
          <el-icon class="text-2xl text-purple-500 dark:text-purple-400 group-hover:text-white transition-colors"><FolderChecked /></el-icon>
        </div>
        <h4 class="font-bold text-slate-800 dark:text-slate-100 mb-2 text-lg">资产归属</h4>
        <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          子账号无独立资产空间，其在项目中产生的所有资产均统一归团队（主账号）所有，确保资产安全。
        </p>
      </div>

      <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
        <div class="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
          <el-icon class="text-2xl text-orange-500 dark:text-orange-400 group-hover:text-white transition-colors"><Coin /></el-icon>
        </div>
        <h4 class="font-bold text-slate-800 dark:text-slate-100 mb-2 text-lg">积分流转</h4>
        <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          主账号负责统一购买积分。管理员或组管理员可将主账号积分灵活下发给子账号使用。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { WarningFilled, Setting, UserFilled, VideoCamera, MagicStick, EditPen, Scissor, Connection, FolderChecked, Coin } from '@element-plus/icons-vue'
import { useThemeStore } from '@/store/theme'

const themeStore = useThemeStore()

const tableHeaderStyle = computed(() => {
  return {
    background: themeStore.isDark ? '#1e293b' : '#f8fafc',
    color: themeStore.isDark ? '#94a3b8' : '#475569',
    fontWeight: 'bold',
    borderBottom: themeStore.isDark ? '1px solid #334155' : '1px solid #f1f5f9'
  }
})

const roleData = ref([
  {
    category: '管理类角色',
    roleName: '管理员',
    responsibility: '全局（团队）管理',
    managementScope: '跨组管理所有子账号',
    assetPermissions: '可创作并管理所有项目的全部资产。支持下发积分。'
  },
  {
    category: '管理类角色',
    roleName: '组管理员',
    responsibility: '局部（成员组）管理',
    managementScope: '管理组内子账号',
    assetPermissions: '可创作并管理"本成员组"项目的全部资产。支持下发积分。'
  },
  {
    category: '生产类角色',
    roleName: '导演',
    responsibility: '全流程创作',
    managementScope: '仅参与分配的项目',
    assetPermissions: '可改编小说为剧本，可添加/编辑/下载/删除分配项目中的全部资产。'
  },
  {
    category: '生产类角色',
    roleName: '动画师',
    responsibility: '剧集创作',
    managementScope: '仅参与分配的项目',
    assetPermissions: '可添加/编辑/下载/删除分配项目中的剧集资产，其余资产仅可查看。'
  },
  {
    category: '生产类角色',
    roleName: '编剧',
    responsibility: '剧本创作',
    managementScope: '仅参与分配的项目',
    assetPermissions: '可改编小说，添加分配项目中的剧本资产，其他资产仅可查看。'
  },
  {
    category: '生产类角色',
    roleName: '剪辑师',
    responsibility: '剧集剪辑',
    managementScope: '仅参与分配的项目',
    assetPermissions: '可下载分配项目中的剧集资产。'
  }
])

const getRoleIcon = (roleName: string) => {
  if (roleName.includes('管理员')) return Setting
  if (roleName.includes('组管理员')) return UserFilled
  if (roleName.includes('导演')) return VideoCamera
  if (roleName.includes('动画师')) return MagicStick
  if (roleName.includes('编剧')) return EditPen
  return Scissor
}

const getRoleIconColor = (roleName: string) => {
  if (roleName.includes('管理')) return 'text-rose-500'
  if (roleName.includes('导演')) return 'text-blue-500'
  if (roleName.includes('动画师')) return 'text-emerald-500'
  if (roleName.includes('编剧')) return 'text-amber-500'
  return 'text-purple-500'
}
</script>

<style lang="scss" scoped>
.role-permission-container {
  :deep(.custom-table) {
    --el-table-border-color: #f1f5f9;
    --el-table-header-bg-color: #f8fafc;
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    
    background-color: transparent;

    .el-table__inner-wrapper::before {
      display: none;
    }
    .el-table__row {
      transition: background-color 0.2s;
      &:hover > td.el-table__cell {
        background-color: #f8fafc;
      }
    }
    td.el-table__cell {
      border-bottom: 1px solid #f1f5f9;
      padding: 16px 0;
    }
  }

  &.is-dark {
    :deep(.custom-table) {
      --el-bg-color: #0f172a !important;
      --el-bg-color-overlay: #0f172a !important;
      --el-fill-color-blank: #0f172a !important;
      --el-fill-color-lighter: #111c33 !important;
      --el-fill-color-light: #1e293b !important;
      --el-table-bg-color: #0f172a !important;
      --el-table-tr-bg-color: #0f172a !important;
      --el-table-border-color: #334155 !important;
      --el-table-header-bg-color: #1e293b !important;
      --el-table-text-color: #f1f5f9 !important;
      --el-table-row-hover-bg-color: #1e293b !important;
      --el-table-current-row-bg-color: #1e293b !important;
      background-color: #0f172a !important;

      .el-table__cell {
        color: #f1f5f9 !important;
        background-color: #0f172a !important;
        border-bottom: 1px solid #334155 !important;
      }

      tbody tr:hover > td.el-table__cell,
      tbody tr.hover-row > td.el-table__cell,
      tbody tr.current-row > td.el-table__cell,
      .el-table__row:hover > td.el-table__cell,
      .el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell,
      .el-table__body tr.hover-row > td.el-table__cell,
      .el-table__body tr.current-row > td.el-table__cell,
      tr:hover > td.el-table__cell {
        background-color: #1e293b !important;
      }

      .text-slate-800 { color: #f1f5f9 !important; }
      .text-slate-700 { color: #e2e8f0 !important; }
      .text-slate-600 { color: #cbd5e1 !important; }
      .text-slate-500 { color: #94a3b8 !important; }
    }
  }
}
</style>
