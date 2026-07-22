<template>
  <div class="member-management-container" :class="{ 'is-dark': themeStore.isDark }">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
          <el-icon class="text-blue-500 dark:text-blue-400 text-xl"><Avatar /></el-icon>
        </div>
        <div>
          <h3 class="text-lg font-black text-slate-800 dark:text-slate-100">成员列表</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">管理团队下的所有子账号及权限</p>
        </div>
      </div>
      <div>
        <el-button type="primary" size="large" class="!rounded-xl !bg-gradient-to-r !from-indigo-500 !to-purple-600 !border-none hover:shadow-lg hover:shadow-indigo-500/30 transition-all" @click="openAddDialog">
          <el-icon class="mr-1"><Plus /></el-icon>
          创建子账号
        </el-button>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
      <el-table 
        :data="members" 
        style="width: 100%" 
        v-loading="loading"
        :header-cell-style="tableHeaderStyle"
        class="custom-table"
      >
        <el-table-column label="子账号信息" min-width="220">
          <template #default="{ row }">
            <div class="flex items-center gap-3 py-1">
              <el-avatar :size="36" class="!bg-gradient-to-br !from-indigo-100 dark:!from-indigo-900/50 !to-purple-100 dark:!to-purple-900/50 !text-indigo-600 dark:!text-indigo-400 font-bold">
                {{ row.username.substring(0, 2).toUpperCase() }}
              </el-avatar>
              <div class="flex flex-col">
                <span class="font-bold text-slate-700 dark:text-slate-200">{{ row.username }}</span>
                <span class="text-xs text-slate-400 dark:text-slate-500">ID: {{ row.id }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="group" label="所属分组" width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full" :class="row.group === '默认分组' ? 'bg-slate-300 dark:bg-slate-600' : 'bg-blue-400'"></div>
              <span class="text-slate-600 dark:text-slate-300 font-medium">{{ row.group }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色权限" width="200">
          <template #default="{ row }">
            <div class="role-tag" :class="getRoleStyle(row.role)">
              <el-icon class="mr-1"><component :is="getRoleIcon(row.role)" /></el-icon>
              {{ row.role }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="可用算力豆" width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-1.5">
              <el-icon class="text-orange-400 text-lg"><Coin /></el-icon>
              <span class="font-black text-slate-700 dark:text-slate-200 text-base">{{ row.points }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            <span class="text-slate-500 dark:text-slate-400 text-sm">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small" class="!rounded-full">
              {{ row.status === 'active' ? '正常' : '已冻结' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="320">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <el-button size="small" class="!rounded-lg dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-300 hover:!text-orange-500 hover:!bg-orange-50 dark:hover:!bg-orange-900/20 hover:!border-orange-200 transition-colors" @click="openPointsDialog(row)">
                下发算力豆
              </el-button>
              
              <el-popconfirm 
                :title="row.status === 'active' ? '确定要冻结该子账号吗？冻结后该账号将无法登录。' : '确定要解冻该子账号吗？'" 
                :confirm-button-text="row.status === 'active' ? '确定冻结' : '确定解冻'"
                cancel-button-text="取消" 
                :confirm-button-type="row.status === 'active' ? 'warning' : 'success'" 
                @confirm="toggleMemberStatus(row)"
              >
                <template #reference>
                  <el-button size="small" :type="row.status === 'active' ? 'warning' : 'success'" plain class="!rounded-lg">
                    {{ row.status === 'active' ? '冻结' : '解冻' }}
                  </el-button>
                </template>
              </el-popconfirm>

              <el-button size="small" class="!rounded-lg dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-300 hover:!text-blue-500 hover:!bg-blue-50 dark:hover:!bg-blue-900/20 hover:!border-blue-200 transition-colors" @click="openEditDialog(row)">
                编辑
              </el-button>
              <el-popconfirm title="确定要删除该子账号吗？" confirm-button-text="删除" cancel-button-text="取消" confirm-button-type="danger" @confirm="deleteMember(row.id)">
                <template #reference>
                  <el-button size="small" type="danger" plain class="!rounded-lg dark:!bg-rose-950/30">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑子账号弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑子账号' : '创建子账号'" 
      width="520px" 
      class="custom-dialog-enhanced" 
      :show-close="false" 
      align-center
      append-to-body
      :modal="false"
    >
      <template #header="{ close, titleId, titleClass }">
        <div class="flex justify-between items-center px-8 py-6 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <el-icon class="text-indigo-600 dark:text-indigo-400 text-xl"><UserFilled /></el-icon>
            </div>
            <div>
              <h4 :id="titleId" :class="titleClass" class="!text-xl !font-black !text-slate-800 dark:!text-slate-100 !m-0">{{ isEdit ? '编辑子账号' : '创建子账号' }}</h4>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{{ isEdit ? 'Update member information' : 'Create new team member' }}</p>
            </div>
          </div>
          <el-button circle class="!bg-slate-50 dark:!bg-slate-800 !border-none hover:!bg-slate-100 dark:hover:!bg-slate-700 transition-colors" @click="close">
            <el-icon class="text-slate-500 dark:text-slate-400"><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="px-8 py-6">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="custom-form-enhanced">
          <div class="grid grid-cols-2 gap-x-6">
            <el-form-item label="账号名称" prop="username" class="!mb-6">
              <el-input v-model="form.username" placeholder="请输入名称" size="large" class="enhanced-input" />
            </el-form-item>
            <el-form-item label="登录密码" prop="password" v-if="!isEdit" class="!mb-6">
              <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password size="large" class="enhanced-input" />
            </el-form-item>
          </div>
          <div class="grid grid-cols-2 gap-x-6">
            <el-form-item label="所属分组" prop="group" class="!mb-6">
              <el-select v-model="form.group" placeholder="请选择分组" size="large" class="w-full enhanced-select">
                <el-option v-for="g in allGroups" :key="g.id" :label="g.name" :value="g.name" />
              </el-select>
            </el-form-item>
            <el-form-item label="角色权限" prop="role" class="!mb-6">
              <el-select v-model="form.role" placeholder="请选择角色" size="large" class="w-full enhanced-select">
                <el-option-group label="管理类角色">
                  <el-option label="管理员" value="管理员" />
                  <el-option label="组管理员" value="组管理员" />
                </el-option-group>
                <el-option-group label="生产类角色">
                  <el-option label="导演" value="导演" />
                  <el-option label="动画师" value="动画师" />
                  <el-option label="编剧" value="编剧" />
                  <el-option label="剪辑师" value="剪辑师" />
                </el-option-group>
              </el-select>
            </el-form-item>
          </div>
          <el-form-item prop="points" v-if="!isEdit" class="!mb-2">
            <template #label>
              <div class="flex justify-between items-center w-full mb-2">
                <span class="font-bold text-slate-700 dark:text-slate-200">初始分配算力豆</span>
                <div class="flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-500/10 rounded-full border border-orange-100 dark:border-orange-500/20">
                  <el-icon class="text-orange-500"><Coin /></el-icon>
                  <span class="text-[11px] font-black text-orange-600 dark:text-orange-400">剩余: 10,000</span>
                </div>
              </div>
            </template>
            <el-input-number v-model="form.points" :min="0" :max="10000" size="large" class="w-full enhanced-input-number" />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="px-8 pb-8 flex justify-end gap-4">
          <el-button size="large" class="!rounded-2xl px-8 !bg-slate-50 dark:!bg-slate-800 !border-none font-bold text-slate-600 dark:text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-700 transition-all" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" size="large" class="!rounded-2xl px-8 !bg-gradient-to-r !from-indigo-600 !to-purple-600 !border-none font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all" @click="saveMember">
            确认创建
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 算力豆下发弹窗 -->
    <el-dialog 
      v-model="pointsDialogVisible" 
      width="460px" 
      class="custom-dialog-enhanced" 
      :show-close="false" 
      align-center
      append-to-body
      :modal="false"
    >
      <template #header="{ close }">
        <div class="flex justify-between items-center px-8 py-6 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
              <el-icon class="text-orange-500 dark:text-orange-400 text-xl"><Coin /></el-icon>
            </div>
            <div>
              <h4 class="text-xl font-black text-slate-800 dark:text-slate-100 m-0">下发算力豆</h4>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Distribute compute points</p>
            </div>
          </div>
          <el-button circle class="!bg-slate-50 dark:!bg-slate-800 !border-none hover:!bg-slate-100 dark:hover:!bg-slate-700 transition-colors" @click="close">
            <el-icon class="text-slate-500 dark:text-slate-400"><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="px-8 py-6 flex flex-col gap-8">
        <div class="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
          <!-- 背景装饰 -->
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div class="absolute right-6 top-6 opacity-20"><el-icon size="60"><Coin /></el-icon></div>
          
          <div class="relative z-10">
            <div class="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">团队主账号余额</div>
            <div class="text-4xl font-black flex items-center gap-3 tracking-tight">
              10,000
              <span class="text-sm font-medium bg-white/20 px-2 py-0.5 rounded-lg backdrop-blur-md">算力豆</span>
            </div>
          </div>
        </div>

        <el-form :model="pointsForm" label-position="top" class="custom-form-enhanced">
          <el-form-item label="接收账号" class="!mb-6">
            <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 w-full transition-all hover:border-indigo-200 dark:hover:border-indigo-900">
              <el-avatar :size="40" class="!bg-gradient-to-br !from-indigo-100 dark:!from-indigo-900/50 !to-purple-100 dark:!to-purple-900/50 !text-indigo-600 dark:!text-indigo-400 font-black text-base shadow-sm">
                {{ pointsForm.username.substring(0, 2).toUpperCase() }}
              </el-avatar>
              <div class="flex flex-col">
                <span class="font-black text-slate-700 dark:text-slate-100">{{ pointsForm.username }}</span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Member Account</span>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="下发数量" class="!mb-0">
            <el-input-number v-model="pointsForm.amount" :min="1" :max="10000" size="large" class="w-full enhanced-input-number" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="px-8 pb-8 flex justify-end gap-4">
          <el-button size="large" class="!rounded-2xl px-8 !bg-slate-50 dark:!bg-slate-800 !border-none font-bold text-slate-600 dark:text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-700 transition-all" @click="pointsDialogVisible = false">取消</el-button>
          <el-button type="primary" size="large" class="!rounded-2xl px-8 !bg-gradient-to-r !from-orange-500 !to-amber-500 !border-none font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all" @click="distributePoints">
            确认下发
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, inject, computed } from 'vue'
import { Plus, Avatar, Coin, UserFilled, Close, Setting, VideoCamera, MagicStick, EditPen, Scissor } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useThemeStore } from '@/store/theme'

const themeStore = useThemeStore()

// 注入当前角色，用于模拟“局部自治”
const currentUserRole = inject('currentUserRole', ref('admin'))
const allMembers = inject('allMembers', ref([] as any[]))
const allGroups = inject('allGroups', ref([] as any[]))

// 模拟数据
const loading = ref(false)

const tableHeaderStyle = computed(() => {
  return {
    background: themeStore.isDark ? '#1e293b' : '#f8fafc',
    color: themeStore.isDark ? '#94a3b8' : '#475569',
    fontWeight: 'bold',
    borderBottom: themeStore.isDark ? '1px solid #334155' : '1px solid #f1f5f9'
  }
})

// 根据角色过滤成员列表（局部自治逻辑）
const members = computed(() => {
  if (currentUserRole.value === 'admin') {
    return allMembers.value
  } else if (currentUserRole.value.startsWith('group_admin_')) {
    // 提取分组名称（例如从 group_admin_a 提取 A组）
    const groupName = allGroups.value.find(g => `group_admin_${g.name.toLowerCase()}` === currentUserRole.value)?.name
    return allMembers.value.filter(m => m.group === groupName)
  }
  return []
})

const getRoleStyle = (role: string) => {
  if (role.includes('管理')) return 'role-admin'
  if (role.includes('导演')) return 'role-director'
  if (role.includes('动画师')) return 'role-animator'
  if (role.includes('编剧')) return 'role-writer'
  return 'role-editor'
}

const getRoleIcon = (role: string) => {
  if (role.includes('管理')) return Setting
  if (role.includes('导演')) return VideoCamera
  if (role.includes('动画师')) return MagicStick
  if (role.includes('编剧')) return EditPen
  return Scissor
}

// 添加/编辑弹窗逻辑
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: 0,
  username: '',
  password: '',
  group: '',
  role: '',
  points: 0,
  status: 'active'
})

const rules = {
  username: [{ required: true, message: '请输入子账号名称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }],
  group: [{ required: true, message: '请选择所属分组', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色权限', trigger: 'change' }]
}

const openAddDialog = () => {
  isEdit.value = false
  
  let defaultGroup = ''
  if (currentUserRole.value.startsWith('group_admin_')) {
    defaultGroup = allGroups.value.find(g => `group_admin_${g.name.toLowerCase()}` === currentUserRole.value)?.name || ''
  }

  Object.assign(form, { 
    id: 0, 
    username: '', 
    password: '', 
    group: defaultGroup, 
    role: '', 
    points: 0,
    status: 'active'
  })
  dialogVisible.value = true
}

const openEditDialog = (row: any) => {
  isEdit.value = true
  Object.assign(form, { ...row, password: '' })
  dialogVisible.value = true
  // 清除上次可能的校验残留
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const saveMember = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      if (isEdit.value) {
        const index = allMembers.value.findIndex(m => m.id === form.id)
        if (index > -1) {
          const oldUsername = allMembers.value[index].username
          const oldRole = allMembers.value[index].role
          const oldGroup = allMembers.value[index].group
          
          allMembers.value[index] = { ...allMembers.value[index], ...form }
          
          // 如果角色改为组管理员，同步更新分组信息
          if (form.role === '组管理员' && (oldRole !== '组管理员' || oldGroup !== form.group)) {
            const group = allGroups.value.find(g => g.name === form.group)
            if (group) group.admin = form.username
          }
          
          // 如果角色从组管理员改为其他，同步清除分组的管理员信息
          if (oldRole === '组管理员' && form.role !== '组管理员') {
            const group = allGroups.value.find(g => g.name === oldGroup)
            if (group && group.admin === oldUsername) group.admin = ''
          }
        }
        ElMessage.success('修改成功')
      } else {
        allMembers.value.push({
          id: 10000 + Math.floor(Math.random() * 1000),
          username: form.username,
          group: form.group,
          role: form.role,
          points: form.points || 0,
          status: 'active',
          createTime: new Date().toLocaleString()
        })
        
        // 如果创建时就是组管理员
        if (form.role === '组管理员') {
          const group = allGroups.value.find(g => g.name === form.group)
          if (group) group.admin = form.username
        }
        
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
    }
  })
}

const toggleMemberStatus = (row: any) => {
  const index = allMembers.value.findIndex(m => m.id === row.id)
  if (index > -1) {
    const newStatus = allMembers.value[index].status === 'active' ? 'frozen' : 'active'
    allMembers.value[index].status = newStatus
    ElMessage.success(`子账号 ${row.username} 已${newStatus === 'active' ? '解冻' : '冻结'}`)
  }
}

const deleteMember = (id: number) => {
  const member = allMembers.value.find(m => m.id === id)
  if (member && member.role === '组管理员') {
    // 如果删除的是组管理员，同步清除分组信息
    const group = allGroups.value.find(g => g.name === member.group)
    if (group && group.admin === member.username) group.admin = ''
  }
  
  allMembers.value = allMembers.value.filter(m => m.id !== id)
  ElMessage.success('删除成功')
}

// 算力豆下发弹窗逻辑
const pointsDialogVisible = ref(false)
const pointsForm = reactive({
  id: 0,
  username: '',
  amount: 100
})

const openPointsDialog = (row: any) => {
  pointsForm.id = row.id
  pointsForm.username = row.username
  pointsForm.amount = 100
  pointsDialogVisible.value = true
}

const distributePoints = () => {
  const index = allMembers.value.findIndex(m => m.id === pointsForm.id)
  if (index > -1) {
    allMembers.value[index].points += pointsForm.amount
    ElMessage.success(`成功为 ${pointsForm.username} 下发 ${pointsForm.amount} 算力豆`)
  }
  pointsDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.member-management-container {
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
      padding: 12px 0;
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

      .el-avatar {
        background: linear-gradient(135deg, #312e81 0%, #4c1d95 100%) !important;
        color: #e2e8f0 !important;
        border: 1px solid #4338ca !important;
      }

      .text-slate-700 { color: #f1f5f9 !important; }
      .text-slate-600 { color: #cbd5e1 !important; }
      .text-slate-500 { color: #94a3b8 !important; }
      .text-slate-400 { color: #64748b !important; }

      .role-tag {
        border-width: 1px !important;
      }
    }
  }

  .role-tag {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    
    &.role-admin {
      background-color: #fef2f2;
      color: #ef4444;
      border: 1px solid #fee2e2;
    }
    &.role-director {
      background-color: #eff6ff;
      color: #3b82f6;
      border: 1px solid #dbeafe;
    }
    &.role-animator {
      background-color: #f0fdf4;
      color: #10b981;
      border: 1px solid #d1fae5;
    }
    &.role-writer {
      background-color: #fffbeb;
      color: #f59e0b;
      border: 1px solid #fef3c7;
    }
    &.role-editor {
      background-color: #f5f3ff;
      color: #8b5cf6;
      border: 1px solid #ede9fe;
    }
  }

  &.is-dark {
    .role-tag {
      &.role-admin {
        background-color: #451a1a;
        color: #f87171;
        border-color: #7f1d1d;
      }
      &.role-director {
        background-color: #172554;
        color: #60a5fa;
        border-color: #1e3a8a;
      }
      &.role-animator {
        background-color: #064e3b;
        color: #34d399;
        border-color: #065f46;
      }
      &.role-writer {
        background-color: #451a03;
        color: #fbbf24;
        border-color: #78350f;
      }
      &.role-editor {
        background-color: #2e1065;
        color: #a78bfa;
        border-color: #4c1d95;
      }
    }
  }

  :deep(.custom-dialog-enhanced) {
    background: transparent !important;
    box-shadow: none !important;
    
    .el-dialog {
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #f1f5f9;
      
      .is-dark & {
        background-color: #111827; // 更深色调匹配截图
        border-color: #1f2937;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      }
    }
    
    .el-dialog__header, .el-dialog__body, .el-dialog__footer {
      padding: 0;
    }

    .custom-form-enhanced {
      .el-form-item__label {
        color: #4b5563;
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 8px;
        
        .is-dark & {
          color: #9ca3af;
        }
      }

      .enhanced-input, .enhanced-select, .enhanced-input-number {
        .el-input__wrapper, .el-select__wrapper {
          background-color: #f9fafb !important;
          box-shadow: 0 0 0 1px #d1d5db inset !important;
          border-radius: 12px !important;
          padding: 6px 14px !important;
          
          .is-dark & {
            background-color: #1f2937 !important;
            box-shadow: 0 0 0 1px #374151 inset !important;
          }
          
          &.is-focus {
            box-shadow: 0 0 0 2px #6366f1 inset !important;
          }
        }
      }
    }
  }

  // 表格样式增强 - 统一风格并移除阴影
  :deep(.custom-table) {
    --el-table-border-color: #f1f5f9;
    --el-table-header-bg-color: #f8fafc;
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    
    background-color: transparent !important;

    .el-table__inner-wrapper::before {
      display: none;
    }
    
    .el-table__row {
      transition: background-color 0.2s;
      
      td.el-table__cell {
        padding: 16px 0;
        border-bottom: 1px solid #f1f5f9;
      }
      
      &:hover > td.el-table__cell {
        background-color: #f8fafc !important;
        box-shadow: none !important; // 移除阴影
      }
    }
    
    .el-table__header {
      th.el-table__cell {
        padding: 20px 0;
        background-color: #f8fafc !important;
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 0.1em;
        font-weight: bold;
        color: #475569;
      }
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

      .el-table__header {
        th.el-table__cell {
          background-color: #1e293b !important;
          color: #94a3b8 !important;
        }
      }

      tbody tr:hover > td.el-table__cell,
      .el-table__row:hover > td.el-table__cell {
        background-color: #1e293b !important;
        box-shadow: none !important;
      }
    }
  }

  :deep(.custom-form) {
    &.dark-form {
      .el-form-item__label {
        color: #94a3b8;
      }
      .el-input__wrapper, .el-select__wrapper {
        background-color: #0f172a;
        box-shadow: 0 0 0 1px #334155 inset;
        .el-input__inner {
          color: #f1f5f9;
        }
        &:hover {
          box-shadow: 0 0 0 1px #475569 inset;
        }
        &.is-focus, &.is-focused {
          box-shadow: 0 0 0 2px #6366f1 inset !important;
        }
      }
    }
    .el-form-item__label {
      font-weight: 600;
      color: #475569;
      padding-bottom: 8px;
    }
    .el-input__wrapper, .el-select__wrapper {
      border-radius: 12px;
      box-shadow: 0 0 0 1px #e2e8f0 inset;
      &:hover {
        box-shadow: 0 0 0 1px #cbd5e1 inset;
      }
      &.is-focus, &.is-focused {
        box-shadow: 0 0 0 2px #6366f1 inset !important;
      }
    }
  }

  :deep(.custom-input-number) {
    .el-input-number__decrease, .el-input-number__increase {
      background-color: #f8fafc;
      border-color: #e2e8f0;
      &:hover {
        color: #f97316;
      }
    }
  }

  &.is-dark {
    :deep(.custom-input-number) {
      .el-input-number__decrease, .el-input-number__increase {
        background-color: #1e293b;
        border-color: #334155;
        color: #94a3b8;
        &:hover {
          color: #f97316;
        }
      }
      .el-input__inner {
        color: #f1f5f9;
      }
    }
  }
}
</style>
