<template>
  <div class="group-management-container" :class="{ 'is-dark': themeStore.isDark }">
    <div class="flex items-start gap-4 mb-8 bg-gradient-to-r from-emerald-50 dark:from-emerald-900/20 to-teal-50 dark:to-teal-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
      <div class="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0">
        <el-icon class="text-2xl text-emerald-500 dark:text-emerald-400"><FolderOpened /></el-icon>
      </div>
      <div>
        <h3 class="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">分组管理说明</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          分组管理功能旨在帮助团队<span class="font-bold text-emerald-600 dark:text-emerald-400">更高效地组织人员和隔离项目资产</span>。<br/>
          通过将子账号划分到不同的分组，并指派"组管理员"，您可以实现<span class="font-bold text-emerald-600 dark:text-emerald-400">局部自治</span>，使得每个小组只能访问和管理属于本组的项目资源，避免团队内部的资产混乱与误操作，极大地提升了大型团队的协同效率和数据安全性。
        </p>
      </div>
    </div>

    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
          <el-icon class="text-emerald-500 dark:text-emerald-400 text-xl"><Grid /></el-icon>
        </div>
        <div>
          <h3 class="text-lg font-black text-slate-800 dark:text-slate-100">团队分组列表</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">管理和维护您的团队分组架构</p>
        </div>
      </div>
      <div v-if="currentUserRole === 'admin'">
        <el-button type="primary" size="large" class="!rounded-xl !bg-gradient-to-r !from-emerald-600 !to-teal-600 !border-none hover:shadow-lg hover:shadow-emerald-500/40 transition-all !text-white font-bold" @click="openAddDialog">
          <el-icon class="mr-1"><Plus /></el-icon>
          创建新分组
        </el-button>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
      <el-table 
        :data="groups" 
        style="width: 100%" 
        :header-cell-style="tableHeaderStyle"
        class="custom-table"
      >
        <el-table-column label="分组名称" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-3 py-1">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold" :class="row.isDefault ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'">
                <el-icon><Folder /></el-icon>
              </div>
              <span class="font-bold text-slate-700 dark:text-slate-200">{{ row.name }}</span>
              <el-tag v-if="row.isDefault" size="small" type="info" class="ml-2 !rounded-md dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-400">系统默认</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="成员数量" width="120">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-icon class="text-slate-400 dark:text-slate-500"><User /></el-icon>
              <span class="font-bold text-slate-600 dark:text-slate-300">{{ row.memberCount }} 人</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="组管理员" width="150">
          <template #default="{ row }">
            <div v-if="row.admin" class="flex items-center gap-2">
              <el-avatar :size="24" class="!bg-indigo-100 dark:!bg-indigo-900/50 !text-indigo-600 dark:!text-indigo-400 font-bold text-[10px]">
                {{ row.admin.substring(0, 2).toUpperCase() }}
              </el-avatar>
              <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">{{ row.admin }}</span>
            </div>
            <span v-else class="text-xs text-slate-400 dark:text-slate-500 italic">尚未指派</span>
          </template>
        </el-table-column>
        <el-table-column label="指派作品" min-width="180">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <el-tag v-for="work in row.works" :key="work" size="small" effect="plain" class="!rounded-md dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-300">
                {{ work }}
              </el-tag>
              <span v-if="!row.works || row.works.length === 0" class="text-xs text-slate-400 dark:text-slate-500">未关联作品</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="分组描述" min-width="180">
          <template #default="{ row }">
            <span class="text-slate-500 dark:text-slate-400 text-sm">{{ row.description || '暂无描述' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            <span class="text-slate-500 dark:text-slate-400 text-sm">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <el-button size="small" class="!rounded-lg dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-300 hover:!text-emerald-500 hover:!bg-emerald-50 dark:hover:!bg-emerald-900/20 hover:!border-emerald-200 transition-colors" @click="openEditDialog(row)" :disabled="row.isDefault">
                编辑
              </el-button>
              <el-popconfirm title="确定要删除该分组吗？组内成员将被移至默认分组" confirm-button-text="删除" cancel-button-text="取消" confirm-button-type="danger" @confirm="deleteGroup(row.id)">
                <template #reference>
                  <el-button size="small" type="danger" plain class="!rounded-lg dark:!bg-rose-950/30" :disabled="row.isDefault">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑分组弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分组' : '创建新分组'" width="480px" class="custom-dialog dark-dialog" :show-close="false" align-center>
      <template #header="{ close, titleId, titleClass }">
        <div class="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <el-icon class="text-emerald-500 dark:text-emerald-400"><FolderAdd /></el-icon>
            </div>
            <h4 :id="titleId" :class="titleClass" class="!text-lg !font-bold !text-slate-800 dark:!text-slate-100 !m-0">{{ isEdit ? '编辑分组' : '创建新分组' }}</h4>
          </div>
          <el-button circle text @click="close" class="dark:!text-slate-400">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="pt-2">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="custom-form dark-form">
          <el-form-item label="分组名称" prop="name" class="!mb-4">
            <el-input v-model="form.name" placeholder="请输入分组名称" size="default" class="!rounded-xl" maxlength="20" show-word-limit />
          </el-form-item>

          <div class="grid grid-cols-2 gap-x-4">
            <el-form-item v-if="availableAdmins.length > 0" label="指派组管理员" prop="admin" class="!mb-4">
              <el-select v-model="form.admin" placeholder="请选择管理员" size="default" class="w-full !rounded-xl" clearable>
                <el-option v-for="member in availableAdmins" :key="member.id" :label="member.username" :value="member.username">
                  <div class="flex items-center gap-2">
                    <el-avatar :size="20" class="!bg-indigo-50 dark:!bg-indigo-900/30 !text-indigo-500 dark:!text-indigo-400 font-bold text-[10px]">
                      {{ member.username.substring(0, 2).toUpperCase() }}
                    </el-avatar>
                    <span>{{ member.username }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="指派作品" prop="works" class="!mb-4" :class="{'col-span-2': availableAdmins.length === 0}">
              <el-select 
                v-model="form.works" 
                multiple 
                collapse-tags 
                collapse-tags-indicator
                placeholder="请选择指派的作品" 
                size="default" 
                class="w-full !rounded-xl"
              >
                <el-option v-for="work in allWorksList" :key="work" :label="work" :value="work" />
              </el-select>
            </el-form-item>
          </div>

          <el-form-item label="分组描述" prop="description" class="!mb-2">
            <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入职责或描述（选填）" class="!rounded-xl" maxlength="100" show-word-limit />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="pt-4 flex justify-end gap-3 border-t dark:border-slate-700">
          <el-button size="large" class="!rounded-xl px-6 dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-300" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" size="large" class="!rounded-xl px-6 !bg-emerald-500 !border-emerald-500 hover:!bg-emerald-600" @click="saveGroup">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject } from 'vue'
import { FolderOpened, Grid, Plus, Folder, User, Close, FolderAdd, UserFilled, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useThemeStore } from '@/store/theme'

const themeStore = useThemeStore()

// 注入当前角色，用于模拟“局部自治”
const currentUserRole = inject('currentUserRole', ref('admin'))
const allMembers = inject('allMembers', ref([] as any[]))
const allGroups = inject('allGroups', ref([] as any[]))

const tableHeaderStyle = computed(() => {
  return {
    background: themeStore.isDark ? '#1e293b' : '#f8fafc',
    color: themeStore.isDark ? '#94a3b8' : '#475569',
    fontWeight: 'bold',
    borderBottom: themeStore.isDark ? '1px solid #334155' : '1px solid #f1f5f9'
  }
})

// 根据角色过滤分组列表（局部自治逻辑）
const groups = computed(() => {
  if (currentUserRole.value === 'admin') {
    return allGroups.value
  } else if (currentUserRole.value.startsWith('group_admin_')) {
    // 提取分组名称
    const groupName = allGroups.value.find(g => `group_admin_${g.name.toLowerCase()}` === currentUserRole.value)?.name
    return allGroups.value.filter(g => g.name === groupName)
  }
  return []
})

// 模拟所有可选作品
const allWorksList = ['作品A', '作品B', '悬疑剧集01', '甜宠短剧02', '科幻大片03', '都市生活04']

const availableAdmins = computed(() => {
  if (!form.name) return []
  return allMembers.value.filter(m => m.group === form.name)
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: 0,
  name: '',
  description: '',
  admin: '',
  works: [] as string[]
})

const rules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }]
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, { id: 0, name: '', description: '', admin: '', works: [] })
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
        const index = allGroups.value.findIndex(g => g.id === form.id)
        if (index > -1) {
          const oldAdmin = allGroups.value[index].admin
          allGroups.value[index] = { ...allGroups.value[index], ...form }
          
          // 同步成员角色：如果指派了新管理员，更新其角色
          if (form.admin && form.admin !== oldAdmin) {
            const member = allMembers.value.find(m => m.username === form.admin)
            if (member) member.role = '组管理员'
            
            // 如果原来的管理员不再是管理员，可以考虑重置其角色，但这里逻辑视业务而定
            // 简单起见，我们只更新新指派的
          }
        }
        ElMessage.success('修改分组成功')
      } else {
        allGroups.value.push({
          id: Date.now(),
          name: form.name,
          description: form.description,
          admin: form.admin,
          works: [...form.works],
          memberCount: 0,
          isDefault: false,
          createTime: new Date().toLocaleString()
        })
        
        // 如果创建时就指派了管理员
        if (form.admin) {
          const member = allMembers.value.find(m => m.username === form.admin)
          if (member) member.role = '组管理员'
        }
        
        ElMessage.success('创建分组成功')
      }
      dialogVisible.value = false
    }
  })
}

const deleteGroup = (id: number) => {
  const group = allGroups.value.find(g => g.id === id)
  if (group?.isDefault) {
    ElMessage.error('系统默认分组不可删除')
    return
  }
  
  // 模拟将成员移至默认分组的逻辑
  const defaultGroup = allGroups.value.find(g => g.isDefault)
  if (defaultGroup && group) {
    defaultGroup.memberCount += group.memberCount
    
    // 同步更新这些成员的分组信息
    allMembers.value.forEach(m => {
      if (m.group === group.name) {
        m.group = defaultGroup.name
        // 如果该成员是组管理员，重置其角色
        if (m.role === '组管理员') m.role = '导演' // 默认设为导演或其他
      }
    })
  }
  
  allGroups.value = allGroups.value.filter(g => g.id !== id)
  ElMessage.success('删除成功，该组成员已移至默认分组')
}
</script>

<style lang="scss" scoped>
.group-management-container {
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
    }
  }

  :deep(.custom-dialog) {
    &.dark-dialog {
      .el-dialog {
        background-color: #1e293b;
        border: 1px solid #334155;
      }
    }
    border-radius: 20px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    margin-bottom: 50px;
    .el-dialog__header {
      margin: 0;
      padding: 24px 24px 0;
    }
    .el-dialog__body {
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }
    .el-dialog__footer {
      padding: 0 24px 24px;
      border-top: none;
    }
  }

  :deep(.custom-form) {
    &.dark-form {
      .el-form-item__label {
        color: #94a3b8;
      }
      .el-input__wrapper, .el-textarea__inner, .el-select__wrapper {
        background-color: #0f172a;
        box-shadow: 0 0 0 1px #334155 inset;
        color: #f1f5f9;
        .el-input__inner, .el-textarea__inner {
          color: #f1f5f9;
        }
        &:hover {
          box-shadow: 0 0 0 1px #475569 inset;
        }
        &.is-focus, &:focus {
          box-shadow: 0 0 0 2px #10b981 inset !important;
        }
      }
    }
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
