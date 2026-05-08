<template>
  <div class="member-management-container">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <el-icon class="text-blue-500 text-xl"><Avatar /></el-icon>
        </div>
        <div>
          <h3 class="text-lg font-black text-slate-800">成员列表</h3>
          <p class="text-xs text-slate-400 mt-0.5">管理团队下的所有子账号及权限</p>
        </div>
      </div>
      <div>
        <el-button type="primary" size="large" class="!rounded-xl !bg-gradient-to-r !from-indigo-500 !to-purple-600 !border-none hover:shadow-lg hover:shadow-indigo-500/30 transition-all" @click="openAddDialog">
          <el-icon class="mr-1"><Plus /></el-icon>
          创建子账号
        </el-button>
      </div>
    </div>

    <div class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
      <el-table 
        :data="members" 
        style="width: 100%" 
        v-loading="loading"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 'bold' }"
        class="custom-table"
      >
        <el-table-column label="子账号信息" min-width="220">
          <template #default="{ row }">
            <div class="flex items-center gap-3 py-1">
              <el-avatar :size="36" class="!bg-gradient-to-br !from-indigo-100 !to-purple-100 !text-indigo-600 font-bold">
                {{ row.username.substring(0, 2).toUpperCase() }}
              </el-avatar>
              <div class="flex flex-col">
                <span class="font-bold text-slate-700">{{ row.username }}</span>
                <span class="text-xs text-slate-400">ID: {{ row.id }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="group" label="所属分组" width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full" :class="row.group === '默认分组' ? 'bg-slate-300' : 'bg-blue-400'"></div>
              <span class="text-slate-600 font-medium">{{ row.group }}</span>
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
        <el-table-column prop="points" label="可用积分" width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-1.5">
              <el-icon class="text-orange-400 text-lg"><Coin /></el-icon>
              <span class="font-black text-slate-700 text-base">{{ row.points }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            <span class="text-slate-500 text-sm">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-button size="small" class="!rounded-lg hover:!text-orange-500 hover:!bg-orange-50 hover:!border-orange-200 transition-colors" @click="openPointsDialog(row)">
                下发积分
              </el-button>
              <el-button size="small" class="!rounded-lg hover:!text-blue-500 hover:!bg-blue-50 hover:!border-blue-200 transition-colors" @click="openEditDialog(row)">
                编辑
              </el-button>
              <el-popconfirm title="确定要删除该子账号吗？" confirm-button-text="删除" cancel-button-text="取消" confirm-button-type="danger" @confirm="deleteMember(row.id)">
                <template #reference>
                  <el-button size="small" type="danger" plain class="!rounded-lg">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑子账号弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑子账号' : '创建子账号'" width="480px" class="custom-dialog" :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <div class="flex justify-between items-center pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <el-icon class="text-indigo-500"><UserFilled /></el-icon>
            </div>
            <h4 :id="titleId" :class="titleClass" class="!text-lg !font-bold !text-slate-800 !m-0">{{ isEdit ? '编辑子账号' : '创建子账号' }}</h4>
          </div>
          <el-button circle text @click="close">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="pt-4">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="custom-form">
          <el-form-item label="账号名称" prop="username">
            <el-input v-model="form.username" placeholder="请输入子账号名称" size="large" class="!rounded-xl" />
          </el-form-item>
          <el-form-item label="登录密码" prop="password" v-if="!isEdit">
            <el-input v-model="form.password" type="password" placeholder="请输入初始密码" show-password size="large" class="!rounded-xl" />
          </el-form-item>
          <div class="flex gap-4">
            <el-form-item label="所属分组" prop="group" class="flex-1">
              <el-select v-model="form.group" placeholder="请选择分组" size="large" class="w-full !rounded-xl">
                <el-option label="默认分组" value="默认分组" />
                <el-option label="A组" value="A组" />
                <el-option label="B组" value="B组" />
              </el-select>
            </el-form-item>
            <el-form-item label="角色权限" prop="role" class="flex-1">
              <el-select v-model="form.role" placeholder="请选择角色" size="large" class="w-full !rounded-xl">
                <el-option-group label="管理类角色">
                  <el-option label="管理员" value="管理员" />
                  <el-option label="组管理员" value="组管理员" />
                </el-option-group>
                <el-option-group label="生产类角色">
                  <el-option label="导演" value="导演" />
                  <el-option label="导演（可下载删除）" value="导演（可下载删除）" />
                  <el-option label="动画师" value="动画师" />
                  <el-option label="动画师（可下载删除）" value="动画师（可下载删除）" />
                  <el-option label="编剧" value="编剧" />
                  <el-option label="剪辑师" value="剪辑师" />
                </el-option-group>
              </el-select>
            </el-form-item>
          </div>
          <el-form-item label="初始分配积分" prop="points" v-if="!isEdit">
            <div class="w-full relative">
              <el-input-number v-model="form.points" :min="0" :max="10000" size="large" class="w-full !rounded-xl custom-input-number" />
              <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 pointer-events-none">
                <el-icon><Coin /></el-icon>
                <span class="text-xs">团队剩余: 10,000</span>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="pt-4 flex justify-end gap-3">
          <el-button size="large" class="!rounded-xl px-6" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" size="large" class="!rounded-xl px-6 !bg-indigo-600 !border-indigo-600 hover:!bg-indigo-700" @click="saveMember">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 积分下发弹窗 -->
    <el-dialog v-model="pointsDialogVisible" width="420px" class="custom-dialog" :show-close="false">
      <template #header="{ close }">
        <div class="flex justify-between items-center pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <el-icon class="text-orange-500"><Coin /></el-icon>
            </div>
            <h4 class="text-lg font-bold text-slate-800 m-0">下发积分</h4>
          </div>
          <el-button circle text @click="close">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="pt-4 flex flex-col gap-6">
        <div class="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20">
          <div class="text-white/80 text-sm font-medium mb-1">团队主账号剩余积分</div>
          <div class="text-3xl font-black flex items-center gap-2">
            <el-icon><Coin /></el-icon> 10,000
          </div>
        </div>

        <el-form :model="pointsForm" label-position="top" class="custom-form">
          <el-form-item label="接收账号">
            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 w-full">
              <el-avatar :size="32" class="!bg-indigo-100 !text-indigo-600 font-bold text-sm">
                {{ pointsForm.username.substring(0, 2).toUpperCase() }}
              </el-avatar>
              <span class="font-bold text-slate-700">{{ pointsForm.username }}</span>
            </div>
          </el-form-item>
          <el-form-item label="下发数量">
            <el-input-number v-model="pointsForm.amount" :min="1" :max="10000" size="large" class="w-full !rounded-xl custom-input-number" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="pt-2 flex justify-end gap-3">
          <el-button size="large" class="!rounded-xl px-6" @click="pointsDialogVisible = false">取消</el-button>
          <el-button type="primary" size="large" class="!rounded-xl px-6 !bg-orange-500 !border-orange-500 hover:!bg-orange-600" @click="distributePoints">
            确认下发
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, Avatar, Coin, UserFilled, Close, Setting, VideoCamera, MagicStick, EditPen, Scissor } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 模拟数据
const loading = ref(false)
const members = ref([
  { id: 10001, username: 'sub_director_01', group: 'A组', role: '导演', points: 500, createTime: '2023-10-01 10:00:00' },
  { id: 10002, username: 'sub_animator_02', group: 'A组', role: '动画师', points: 200, createTime: '2023-10-02 11:30:00' },
  { id: 10003, username: 'sub_admin_01', group: '默认分组', role: '管理员', points: 1000, createTime: '2023-09-15 09:00:00' }
])

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
  points: 0
})

const rules = {
  username: [{ required: true, message: '请输入子账号名称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }],
  group: [{ required: true, message: '请选择所属分组', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色权限', trigger: 'change' }]
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, { id: 0, username: '', password: '', group: '', role: '', points: 0 })
  dialogVisible.value = true
}

const openEditDialog = (row: any) => {
  isEdit.value = true
  Object.assign(form, { ...row, password: '' })
  dialogVisible.value = true
}

const saveMember = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      if (isEdit.value) {
        const index = members.value.findIndex(m => m.id === form.id)
        if (index > -1) {
          members.value[index] = { ...members.value[index], ...form }
        }
        ElMessage.success('修改成功')
      } else {
        members.value.push({
          id: 10000 + Math.floor(Math.random() * 1000),
          username: form.username,
          group: form.group,
          role: form.role,
          points: form.points || 0,
          createTime: new Date().toLocaleString()
        })
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
    }
  })
}

const deleteMember = (id: number) => {
  members.value = members.value.filter(m => m.id !== id)
  ElMessage.success('删除成功')
}

// 积分下发弹窗逻辑
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
  const index = members.value.findIndex(m => m.id === pointsForm.id)
  if (index > -1) {
    members.value[index].points += pointsForm.amount
    ElMessage.success(`成功为 ${pointsForm.username} 下发 ${pointsForm.amount} 积分`)
  }
  pointsDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.member-management-container {
  :deep(.custom-table) {
    --el-table-border-color: #f1f5f9;
    --el-table-header-bg-color: #f8fafc;
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

  :deep(.custom-dialog) {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    .el-dialog__header {
      margin: 0;
      padding: 24px 24px 0;
    }
    .el-dialog__body {
      padding: 24px;
    }
    .el-dialog__footer {
      padding: 0 24px 24px;
      border-top: none;
    }
  }

  :deep(.custom-form) {
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
}
</style>