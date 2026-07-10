import { defineStore } from 'pinia';
import { TEXT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from '@/config/models';

export const useModelStore = defineStore('models', {
  state: () => ({
    selectedTextModel: localStorage.getItem('selectedTextModel') || TEXT_MODELS[0].models[0].id,
    selectedImageModel: localStorage.getItem('selectedImageModel') || IMAGE_MODELS[0].models[0].id,
    selectedVideoModel: localStorage.getItem('selectedVideoModel') || VIDEO_MODELS[0].models[0].id,
    // 锁定模型映射: { moduleId: { type: 'text'|'image'|'video', modelId: string } }
    lockedModels: JSON.parse(localStorage.getItem('lockedModels') || '{}') as Record<string, { type: string, modelId: string }>,
    // 权限列表 (模拟 - 默认赋予所有权限或大部分权限)
    userPermissions: [] as string[],
    // 生成中的模块列表
    generatingModules: {} as Record<string, boolean>,
  }),
  getters: {
    getModelForModule: (state) => (moduleId: string, type: 'text' | 'image' | 'video') => {
      if (state.lockedModels[moduleId]) {
        return state.lockedModels[moduleId].modelId;
      }
      if (type === 'text') return state.selectedTextModel;
      if (type === 'image') return state.selectedImageModel;
      return state.selectedVideoModel;
    },
    isLocked: (state) => (moduleId: string) => !!state.lockedModels[moduleId],
    hasPermission: (state) => (modelId: string) => {
      // 默认允许所有模型
      return true;
    },
    isGenerating: (state) => (moduleId: string) => {
      if (!moduleId) return false;
      return !!state.generatingModules[moduleId];
    },
  },
  actions: {
    setTextModel(id: string) {
      if (!id) return;
      this.selectedTextModel = id;
      localStorage.setItem('selectedTextModel', id);
    },
    setImageModel(id: string) {
      if (!id) return;
      this.selectedImageModel = id;
      localStorage.setItem('selectedImageModel', id);
    },
    setVideoModel(id: string) {
      if (!id) return;
      this.selectedVideoModel = id;
      localStorage.setItem('selectedVideoModel', id);
    },
    lockModel(moduleId: string, type: string, modelId: string) {
      if (!moduleId || !modelId) return;
      this.lockedModels[moduleId] = { type, modelId };
      localStorage.setItem('lockedModels', JSON.stringify(this.lockedModels));
    },
    unlockModel(moduleId: string) {
      if (!moduleId) return;
      delete this.lockedModels[moduleId];
      localStorage.setItem('lockedModels', JSON.stringify(this.lockedModels));
    },
    setGenerating(moduleId: string, isGenerating: boolean) {
      if (!moduleId) return;
      this.generatingModules[moduleId] = isGenerating;
    }
  }
});
