<template>
  <div class="group-management-container">
    <div class="flex items-start gap-4 mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
      <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
        <el-icon class="text-2xl text-emerald-500"><FolderOpened /></el-icon>
      </div>
      <div>
        <h3 class="text-lg font-black text-slate-800 mb-2">分组管理说明</h3>
        <p class="text-sm text-slate-600 leading-relaxed">
          分组管理功能旨在帮助团队<span class="font-bold text-emerald-600">更高效地组织人员和隔离项目资产</span>。<br/>
          通过将子账号划分到不同的分组，并指派"组管理员"，您可以实现<span class="font-bold text-emerald-600">局部自治</span>，使得每个小组只能访问和管理属于本组的项目资源，避免团队内部的资产混乱与误操作，极大地提升了大型团队的协同效率和数据安全性。
        </p>
      </div>
    </div>

    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <el-icon class="text-emerald-500 text-xl"><Grid /></el-icon>
        </div>
        <div>
          <h3 class="text-lg font-black text-slate-800">团队分组列表</h3>
          <p class="text-xs text-slate-400 mt-0.5">管理和维护您的团队分组架构</p>
        </div>
      </div>
      <div>
        <el-button type="primary" size="large" class="!rounded-xl !bg-gradient-to-r !from-emerald-500 !to-teal-500 !border-none hover:shadow-lg hover:shadow-emerald-500/30 transition-all" @click="openAddDialog">
          <el-icon class="mr-1"><Plus /></el-icon>
          创建新分组
        </el-button>
      </div>
    </div>

    <div class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
      <el-table 
        :data="groups" 
        style="width: 100%" 
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 'bold' }"
        class="custom-table"
      >
        <el-table-column label="分组名称" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-3 py-1">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold" :class="row.isDefault ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'">
                <el-icon><Folder /></el-icon>
              </div>
              <span class="font-bold text-slate-700">{{ row.name }}</span>
              <el-tag v-if="row.isDefault" size="small" type="info" class="ml-2 !rounded-md">系统默认</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="成员数量" width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-icon class="text-slate-400"><User /></el-icon>
              <span class="font-bold text-slate-600">{{ row.memberCount }} 人</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="分组描述" min-width="250">
          <template #default="{ row }">
            <span class="text-slate-500 text-sm">{{ row.description || '暂无描述' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            <span class="text-slate-500 text-sm">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-button size="small" class="!rounded-lg hover:!text-emerald-500 hover:!bg-emerald-50 hover:!border-emerald-200 transition-colors" @click="openEditDialog(row)" :disabled="row.isDefault">
                编辑
              </el-button>
              <el-popconfirm title="确定要删除该分组吗？组内成员将被移至默认分组" confirm-button-text="删除" cancel-button-text="取消" confirm-button-type="danger" @confirm="deleteGroup(row.id)">
                <template #reference>
                  <el-button size="small" type="danger" plain class="!rounded-lg" :disabled="row.isDefault">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑分组弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分组' : '创建新分组'" width="480px" class="custom-dialog" :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <div class="flex justify-between items-center pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <el-icon class="text-emerald-500"><FolderAdd /></el-icon>
            </div>
            <h4 :id="titleId" :class="titleClass" class="!text-lg !font-bold !text-slate-800 !m-0">{{ isEdit ? '编辑分组' : '创建新分组' }}</h4>
          </div>
          <el-button circle text @click="close">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="pt-4">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="custom-form">
          <el-form-item label="分组名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入分组名称，例如：后期A组" size="large" class="!rounded-xl" maxlength="20" show-word-limit />
          </el-form-item>
          <el-form-item label="分组描述" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入该分组的职责或描述（选填）" class="!rounded-xl" maxlength="100" show-word-limit />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="pt-4 flex justify-end gap-3">
          <el-button size="large" class="!rounded-xl px-6" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" size="large" class="!rounded-xl px-6 !bg-emerald-500 !border-emerald-500 hover:!bg-emerald-600" @click="saveGroup">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { FolderOpened, Grid, Plus, Folder, User, Close, FolderAdd } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const groups = ref([
  { id: 1, name: '默认分组', memberCount: 1, description: '系统默认创建的分组，不可删除', isDefault: true, createTime: '2023-01-01 00:00:00' },
  { id: 2, name: 'A组', memberCount: 2, description: '负责悬疑类短剧项目', isDefault: false, createTime: '2023-10-01 10:00:00' },
  { id: 3, name: 'B组', memberCount: 0, description: '负责甜宠类短剧项目', isDefault: false, createTime: '2023-10-02 11:30:00' }
])

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: 0,
  name: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }]
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, { id: 0, name: '', description: '' })
  dialogVisible.value = true
}

const openEditDialog = (row: any) => {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const saveGroup = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      if (isEdit.value) {
        const index = groups.value.findIndex(g => g.id === form.id)
        if (index > -1) {
          groups.value[index] = { ...groups.value[index], ...form }
        }
        ElMessage.success('修改分组成功')
      } else {
        groups.value.push({
          id: Date.now(),
          name: form.name,
          description: form.description,
          memberCount: 0,
          isDefault: false,
          createTime: new Date().toLocaleString()
        })
        ElMessage.success('创建分组成功')
      }
      dialogVisible.value = false
    }
  })
}

const deleteGroup = (id: number) => {
  const group = groups.value.find(g => g.id === id)
  if (group?.isDefault) {
    ElMessage.error('系统默认分组不可删除')
    return
  }
  
  // 模拟将成员移至默认分组的逻辑
  const defaultGroup = groups.value.find(g => g.isDefault)
  if (defaultGroup && group) {
    defaultGroup.memberCount += group.memberCount
  }
  
  groups.value = groups.value.filter(g => g.id !== id)
  ElMessage.success('删除成功，该组成员已移至默认分组')
}
</script>

<style lang="scss" scoped>
.group-management-container {
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
    .el-input__wrapper, .el-textarea__inner {
      border-radius: 12px;
      box-shadow: 0 0 0 1px #e2e8f0 inset;
      &:hover {
        box-shadow: 0 0 0 1px #cbd5e1 inset;
      }
      &.is-focus, &:focus {
        box-shadow: 0 0 0 2px #10b981 inset !important;
      }
    }
  }
}
</style>