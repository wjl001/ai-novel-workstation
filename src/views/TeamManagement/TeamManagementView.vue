<template>
  <div class="team-management-page w-full h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 relative" :class="{ 'is-dark': currentUserRole === 'admin' }">
    <!-- 背景装饰光效 - 增强C端视觉冲击力 -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>
    
    <!-- 顶部导航栏 -->
    <div class="flex-none p-6 md:p-8 pb-4 relative z-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <el-icon class="text-white text-2xl"><Connection /></el-icon>
            </div>
            <h2 class="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
              团队协作与管理
              <button 
                @click="showDesignDialog = true"
                class="h-7 px-3 flex items-center gap-2 rounded-full font-bold text-[10px] shadow-sm border transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500/50"
              >
                <el-icon :size="12"><InfoFilled /></el-icon>
                <span>产品设计说明</span>
              </button>
            </h2>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 font-medium ml-16">灵活管控团队分组、子账号成员及权限算力豆，构建高效创作矩阵</p>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- 视图角色切换器 - 增强视觉冲击力 -->
          <el-dropdown trigger="click" @command="handleRoleCommand">
            <div class="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl cursor-pointer hover:shadow-xl hover:shadow-indigo-500/40 transition-all group relative overflow-hidden">
              <div class="absolute -right-2 -top-2 w-12 h-12 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner text-white group-hover:rotate-12 transition-transform duration-300">
                <el-icon :size="18"><Grid /></el-icon>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] text-white/70 font-bold uppercase tracking-widest leading-none">切换视图视角</span>
                <span class="font-bold text-white text-sm mt-1 flex items-center gap-1">
                  {{ currentRoleLabel }}
                  <el-icon class="group-hover:translate-y-0.5 transition-transform"><ArrowDown /></el-icon>
                </span>
              </div>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="custom-role-dropdown">
                <el-dropdown-item command="admin">
                  <div class="flex items-center gap-2">
                    <el-icon><Monitor /></el-icon> 超级管理员 (全局)
                  </div>
                </el-dropdown-item>
                <el-dropdown-item v-for="group in allGroups" :key="group.id" :command="`group_admin_${group.name.toLowerCase()}`">
                  <div class="flex items-center gap-2">
                    <el-icon><Select /></el-icon> {{ group.name }}管理员
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 用户信息卡片 -->
          <div class="flex items-center gap-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/50 dark:border-slate-700">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                <el-icon class="text-white text-sm"><UserFilled /></el-icon>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider leading-none">当前登录</span>
                <span class="font-bold text-slate-700 dark:text-slate-200 text-sm leading-tight mt-1">
                  {{ currentUserRole === 'admin' ? 'Admin_Owner' : allMembers.find((m: any) => m.username === allGroups.find(g => `group_admin_${g.name.toLowerCase()}` === currentUserRole)?.admin)?.username || 'Group_Admin' }}
                </span>
              </div>
            </div>
            <div class="w-px h-6 bg-slate-100 dark:bg-slate-700"></div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <el-icon class="text-orange-500"><Coin /></el-icon>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider leading-none">算力豆余额</span>
                <span class="font-black text-orange-500 text-base leading-none mt-1">10,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm rounded-t-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 p-2 flex-1 flex flex-col min-h-0 overflow-hidden mx-4 md:mx-6 mb-0">
        <el-tabs v-model="activeTab" class="team-tabs flex-1 flex flex-col min-h-0">
          <el-tab-pane name="members" class="h-full overflow-y-auto">
            <template #label>
              <div class="flex items-center gap-2 px-4 py-2">
                <el-icon class="text-lg"><User /></el-icon>
                <span class="font-bold">成员管理</span>
              </div>
            </template>
            <div class="p-2 md:p-4 h-full">
              <MemberManagement />
            </div>
          </el-tab-pane>
          
          <el-tab-pane name="groups" class="h-full overflow-y-auto">
            <template #label>
              <div class="flex items-center gap-2 px-4 py-2">
                <el-icon class="text-lg"><FolderOpened /></el-icon>
                <span class="font-bold">分组管理</span>
              </div>
            </template>
            <div class="p-2 md:p-4 h-full">
              <GroupManagement />
            </div>
          </el-tab-pane>

          <el-tab-pane name="roles" class="h-full overflow-y-auto">
            <template #label>
              <div class="flex items-center gap-2 px-4 py-2">
                <el-icon class="text-lg"><Lock /></el-icon>
                <span class="font-bold">角色权限</span>
              </div>
            </template>
            <div class="p-2 md:p-4">
              <RolePermissionTable />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 产品设计说明弹窗 -->
    <ProductDesignDialog 
      v-model="showDesignDialog" 
      id="team-management"
      :default-content="teamManagementDesign"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, computed } from 'vue'
import { Connection, UserFilled, Coin, User, Lock, FolderOpened, Grid, ArrowDown, Monitor, Select, InfoFilled } from '@element-plus/icons-vue'
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue'
import MemberManagement from './components/MemberManagement.vue'
import RolePermissionTable from './components/RolePermissionTable.vue'
import GroupManagement from './components/GroupManagement.vue'

const activeTab = ref('members')
const currentUserRole = ref('admin')

const showDesignDialog = ref(false)

const teamManagementDesign = {
  title: '团队协作与管理',
  location: '企业级/专业创作团队的核心管理中枢，支持多层级权限管控、成员分组及算力豆资源调度。',
  layout: [
    '**头部功能区**：包含“视图角色切换”下拉框，支持管理员在全局与特定分组视角间切换。同时展示当前登录身份及团队算力豆余额。',
    '**标签页导航**：集成“成员管理”、“分组管理”及“角色权限”三大核心模块。',
    '**列表视图**：各子模块采用现代化的表格与卡片结合布局，支持实时搜索、筛选及快速操作。'
  ],
  interactions: [
    '**角色切换交互**：通过顶部渐变背景的下拉触发器，管理员可以即时切换管理范围，页面数据将根据选定视角动态过滤。',
    '**成员与分组同步**：在分组管理中修改信息或指派管理员，会实时同步到成员管理列表，利用 Vue 的响应式系统确保数据一致性。',
    '**算力豆分配与回收**：支持针对特定分组或子账号进行精确的算力豆下发与回收操作。',
    '**多级菜单样式**：针对 Element Plus 下拉菜单进行了深度定制，在深色模式下提供半透明紫色悬停反馈，消除视觉割裂感。'
  ]
}

const currentRoleLabel = computed(() => {
  if (currentUserRole.value === 'admin') return '超级管理员'
  const groupName = allGroups.value.find(g => `group_admin_${g.name.toLowerCase()}` === currentUserRole.value)?.name
  return groupName ? `${groupName}管理员` : '未知角色'
})

const handleRoleCommand = (command: string) => {
  currentUserRole.value = command
}

// 统一管理数据源，实现多组件实时同步
const initialMembers = [
  { id: 10001, username: 'sub_director_01', group: 'A组', role: '导演', points: 500, status: 'active', createTime: '2023-10-01 10:00:00' },
  { id: 10002, username: 'sub_animator_02', group: 'A组', role: '动画师', points: 200, status: 'frozen', createTime: '2023-10-02 11:30:00' },
  { id: 10003, username: 'sub_admin_01', group: '默认分组', role: '管理员', points: 1000, status: 'active', createTime: '2023-09-15 09:00:00' }
]

const savedMembers = localStorage.getItem('team_members')
const allMembers = ref(savedMembers ? JSON.parse(savedMembers) : initialMembers)

// 监听成员数据变化并保存
import { watch } from 'vue'
watch(allMembers, (newVal) => {
  localStorage.setItem('team_members', JSON.stringify(newVal))
}, { deep: true })

const allGroups = ref([
  { id: 1, name: '默认分组', memberCount: 1, description: '系统默认创建的分组，不可删除', isDefault: true, admin: 'sub_admin_01', works: ['作品A', '作品B'], createTime: '2023-01-01 00:00:00' },
  { id: 2, name: 'A组', memberCount: 2, description: '负责悬疑类短剧项目', isDefault: false, admin: 'sub_director_01', works: ['悬疑剧集01'], createTime: '2023-10-01 10:00:00' },
  { id: 3, name: 'B组', memberCount: 0, description: '负责甜宠类短剧项目', isDefault: false, admin: '', works: [], createTime: '2023-10-02 11:30:00' }
])

// 提供共享数据和操作方法
provide('currentUserRole', currentUserRole)
provide('allMembers', allMembers)
provide('allGroups', allGroups)
</script>

<style lang="scss" scoped>
.team-management-page {
  .team-tabs-enhanced {
    display: flex;
    flex-direction: column;
    
    :deep(.el-tabs__header) {
      margin-bottom: 0;
      padding: 0 16px;
      border-bottom: 1px solid #f1f5f9;
      
      .is-dark & {
        border-color: #1e293b;
      }
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }
    
    :deep(.el-tabs__item) {
      font-size: 16px;
      color: #64748b;
      height: auto;
      padding: 0 !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      
      .is-dark & {
        color: #94a3b8;
      }
      
      &.is-active {
        color: #6366f1;
        .is-dark & {
          color: #818cf8;
        }
      }
      
      &:hover:not(.is-active) {
        color: #475569;
        .is-dark & {
          color: #cbd5e1;
        }
      }
    }
    
    :deep(.el-tabs__active-bar) {
      height: 3px;
      border-radius: 3px 3px 0 0;
      background: linear-gradient(to right, #6366f1, #a855f7);
    }

    :deep(.el-tabs__content) {
      flex: 1;
      min-height: 0;
      .el-tab-pane {
        height: 100%;
      }
    }
  }
}

:deep(.custom-role-dropdown) {
  padding: 8px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  .is-dark & {
    background-color: #1e293b;
    border-color: #334155;
  }
  
  .el-dropdown-menu__item {
    border-radius: 10px;
    margin: 4px 0;
    padding: 10px 16px;
    font-weight: 600;
    color: #475569;
    
    .is-dark & {
      color: #cbd5e1;
    }
    
    &:hover {
      background-color: #f8fafc;
      color: #6366f1;
      .is-dark & {
        background-color: #334155;
        color: #818cf8;
      }
    }
  }
}
</style>

<style lang="scss">
/* 全局样式，用于覆盖 teleported 的下拉框样式 */
.custom-role-dropdown {
  padding: 8px !important;
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
  
  .el-dropdown-menu__item {
    border-radius: 8px !important;
    margin-bottom: 2px !important;
    color: #64748b !important;
    font-size: 13px !important;
    transition: all 0.2s !important;
    
    &:last-child {
      margin-bottom: 0 !important;
    }
    
    &:hover, &:focus {
      background-color: #f1f5f9 !important;
      color: #4f46e5 !important;
    }
    
    &.is-active {
      background-color: #eef2ff !important;
      color: #4f46e5 !important;
    }
  }

  /* 深色模式适配 */
  .dark & {
    background-color: #1e293b !important; /* slate-800 */
    border-color: #334155 !important; /* slate-700 */
    
    .el-dropdown-menu__item {
      color: #94a3b8 !important;
      
      &:hover, &:focus {
        background-color: rgba(99, 102, 241, 0.15) !important; /* 移除白色背景，改用半透明紫色 */
        color: #818cf8 !important;
      }
      
      &.is-active {
        background-color: rgba(99, 102, 241, 0.25) !important;
        color: #818cf8 !important;
      }

      /* 额外强制覆盖 Element Plus 可能存在的默认背景色变量 */
      --el-dropdown-menuItem-hover-fill: rgba(99, 102, 241, 0.15);
      --el-dropdown-menuItem-hover-color: #818cf8;
    }
  }
}
</style>
