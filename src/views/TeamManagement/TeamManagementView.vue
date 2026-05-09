<template>
  <div class="team-management-layout p-6 bg-slate-50 h-full relative overflow-hidden flex flex-col">
    <!-- Decorative background elements -->
    <div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-100/50 to-transparent pointer-events-none"></div>
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-32 -left-24 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto w-full relative z-10 flex flex-col flex-1 min-h-0">
      <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <el-icon class="text-white text-xl"><Connection /></el-icon>
            </div>
            团队协作与管理
          </h2>
          <p class="text-sm text-slate-500 mt-2 ml-13 font-medium">灵活管控团队分组、子账号成员及权限积分</p>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- 视图角色切换器 - 增强视觉冲击力 -->
          <el-dropdown trigger="click" @command="handleRoleCommand">
            <div class="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl cursor-pointer hover:shadow-lg hover:shadow-indigo-500/40 transition-all group relative overflow-hidden">
              <!-- 背景装饰光效 -->
              <div class="absolute -right-2 -top-2 w-12 h-12 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner text-white group-hover:rotate-12 transition-transform duration-300">
                <el-icon class="text-xl"><Grid /></el-icon>
              </div>
              <div class="flex flex-col relative z-10">
                <span class="text-[10px] text-indigo-100 font-bold uppercase tracking-widest leading-none mb-1.5 opacity-80">视图角色切换</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-black text-white leading-none tracking-wide">{{ currentRoleLabel }}</span>
                  <el-icon class="text-indigo-200 text-xs group-hover:translate-y-0.5 transition-transform"><ArrowDown /></el-icon>
                </div>
              </div>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="custom-role-dropdown">
                <el-dropdown-item command="admin" :class="{'is-active': currentUserRole === 'admin'}">
                  <div class="flex items-center gap-3 py-1.5 px-1">
                    <div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <el-icon><Monitor /></el-icon>
                    </div>
                    <span class="font-bold text-slate-700">超级管理员</span>
                    <el-tag size="small" type="danger" effect="dark" class="ml-auto !rounded-md !border-none">全局</el-tag>
                  </div>
                </el-dropdown-item>
                <el-dropdown-divider />
                <div class="px-4 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                  <div class="w-1 h-3 bg-indigo-400 rounded-full"></div>
                  指派的分组管理员
                </div>
                <el-dropdown-item 
                  v-for="group in allGroups.filter(g => g.admin)" 
                  :key="group.id" 
                  :command="`group_admin_${group.name.toLowerCase()}`"
                  :class="{'is-active': currentUserRole === `group_admin_${group.name.toLowerCase()}`}"
                >
                  <div class="flex items-center gap-3 py-1.5 px-1">
                    <div class="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                      <el-icon><FolderOpened /></el-icon>
                    </div>
                    <span class="font-bold text-slate-700">{{ group.name }}管理员</span>
                    <el-icon v-if="currentUserRole === `group_admin_${group.name.toLowerCase()}`" class="ml-auto text-indigo-500"><Select /></el-icon>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 用户信息卡片 -->
          <div class="flex items-center gap-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/50">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                <el-icon class="text-white text-sm"><UserFilled /></el-icon>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">当前登录</span>
                <span class="font-bold text-slate-700 text-sm leading-tight mt-1">
                  {{ currentUserRole === 'admin' ? 'Admin_Owner' : allMembers.find(m => m.username === allGroups.find(g => `group_admin_${g.name.toLowerCase()}` === currentUserRole)?.admin)?.username || 'Group_Admin' }}
                </span>
              </div>
            </div>
            <div class="w-px h-6 bg-slate-100"></div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                <el-icon class="text-orange-500"><Coin /></el-icon>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">积分余额</span>
                <span class="font-black text-orange-500 text-base leading-none mt-1">10,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-2 flex-1 flex flex-col min-h-0 overflow-hidden">
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
  </div>
</template>

<script setup lang="ts">
import { ref, provide, computed } from 'vue'
import { Connection, UserFilled, Coin, User, Lock, FolderOpened, Grid, ArrowDown, Monitor, Select } from '@element-plus/icons-vue'
import MemberManagement from './components/MemberManagement.vue'
import RolePermissionTable from './components/RolePermissionTable.vue'
import GroupManagement from './components/GroupManagement.vue'

const activeTab = ref('members')
const currentUserRole = ref('admin')

const currentRoleLabel = computed(() => {
  if (currentUserRole.value === 'admin') return '超级管理员'
  const groupName = allGroups.value.find(g => `group_admin_${g.name.toLowerCase()}` === currentUserRole.value)?.name
  return groupName ? `${groupName}管理员` : '未知角色'
})

const handleRoleCommand = (command: string) => {
  currentUserRole.value = command
}

// 统一管理数据源，实现多组件实时同步
const allMembers = ref([
  { id: 10001, username: 'sub_director_01', group: 'A组', role: '导演', points: 500, createTime: '2023-10-01 10:00:00' },
  { id: 10002, username: 'sub_animator_02', group: 'A组', role: '动画师', points: 200, createTime: '2023-10-02 11:30:00' },
  { id: 10003, username: 'sub_admin_01', group: '默认分组', role: '管理员', points: 1000, createTime: '2023-09-15 09:00:00' }
])

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
.team-management-layout {
  :deep(.team-tabs) {
    .el-tabs__content {
      flex: 1;
      min-height: 0;
    }
    .el-tabs__nav-wrap::after {
      height: 1px;
      background-color: #f1f5f9;
    }
    .el-tabs__item {
      font-size: 15px;
      color: #64748b;
      transition: all 0.3s;
      &.is-active {
        color: #4f46e5;
      }
      &:hover {
        color: #6366f1;
      }
    }
    .el-tabs__active-bar {
      height: 4px;
      border-radius: 4px 4px 0 0;
      background: linear-gradient(to right, #6366f1, #8b5cf6);
    }
    .el-tabs__header {
      margin-bottom: 20px;
    }
  }
}

:deep(.custom-role-dropdown) {
  padding: 8px;
  border-radius: 16px;
  border: none;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  .el-dropdown-menu__item {
    border-radius: 8px;
    margin-bottom: 2px;
    color: #64748b;
    font-size: 13px;
    &:last-child {
      margin-bottom: 0;
    }
    &:hover {
      background-color: #f1f5f9;
      color: #4f46e5;
    }
    &.is-active {
      background-color: #eef2ff;
      color: #4f46e5;
    }
  }
}
</style>