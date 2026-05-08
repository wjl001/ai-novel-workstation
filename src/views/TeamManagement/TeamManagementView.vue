<template>
  <div class="team-management-layout p-6 bg-slate-50 min-h-screen relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-100/50 to-transparent pointer-events-none"></div>
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-32 -left-24 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto relative z-10">
      <div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <el-icon class="text-white text-xl"><Connection /></el-icon>
            </div>
            团队协作与管理
          </h2>
          <p class="text-sm text-slate-500 mt-2 ml-13 font-medium">灵活管控团队分组、子账号成员及权限积分</p>
        </div>
        
        <div class="flex items-center gap-4 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-white/50 transition-transform hover:scale-[1.02]">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <el-icon class="text-indigo-600"><UserFilled /></el-icon>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">主账号</span>
              <span class="font-bold text-slate-700 text-sm leading-tight mt-1">Admin_Team_Owner</span>
            </div>
          </div>
          <div class="w-px h-8 bg-slate-200 mx-2"></div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <el-icon class="text-orange-500"><Coin /></el-icon>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">团队积分余额</span>
              <span class="font-black text-orange-500 text-lg leading-none tracking-tight mt-1">10,000</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-2">
        <el-tabs v-model="activeTab" class="team-tabs">
          <el-tab-pane name="members">
            <template #label>
              <div class="flex items-center gap-2 px-4 py-2">
                <el-icon class="text-lg"><User /></el-icon>
                <span class="font-bold">成员管理</span>
              </div>
            </template>
            <div class="p-2 md:p-4">
              <MemberManagement />
            </div>
          </el-tab-pane>
          
          <el-tab-pane name="roles">
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
          
          <el-tab-pane name="groups">
            <template #label>
              <div class="flex items-center gap-2 px-4 py-2">
                <el-icon class="text-lg"><FolderOpened /></el-icon>
                <span class="font-bold">分组管理</span>
              </div>
            </template>
            <div class="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div class="w-32 h-32 mb-6 flex items-center justify-center rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200">
                <el-icon class="text-6xl text-slate-300"><Grid /></el-icon>
              </div>
              <h3 class="text-xl font-bold text-slate-700 mb-2">分组管理功能开发中</h3>
              <p class="text-slate-500">即将为您带来更强大的团队分组与协同体验</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Connection, UserFilled, Coin, User, Lock, FolderOpened, Grid } from '@element-plus/icons-vue'
import MemberManagement from './components/MemberManagement.vue'
import RolePermissionTable from './components/RolePermissionTable.vue'

const activeTab = ref('members')
</script>

<style lang="scss" scoped>
.team-management-layout {
  :deep(.team-tabs) {
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
</style>