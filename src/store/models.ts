import { defineStore } from 'pinia';
import { TEXT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from '@/config/models';

export const useModelStore = defineStore('models', {
  state: () => ({
    selectedTextModel: localStorage.getItem('selectedTextModel') || TEXT_MODELS[0].models[0].id,
    selectedImageModel: localStorage.getItem('selectedImageModel') || IMAGE_MODELS[0].models[0].id,
    selectedVideoModel: localStorage.getItem('selectedVideoModel') || VIDEO_MODELS[0].models[0].id,
    // 锁定模型映射: { moduleId: { type: 'text'|'image'|'video', modelId: string } }
    lockedModels: JSON.parse(localStorage.getItem('lockedModels') || '{}') as Record<string, { type: string, modelId: string }>,
    // 全局锁定状态: { text: boolean, image: boolean, video: boolean }
    globalLocks: JSON.parse(localStorage.getItem('globalLocks') || '{"text": false, "image": false, "video": false}') as Record<string, boolean>,
    // 水印与字幕配置
    isSubtitled: localStorage.getItem('isSubtitled') !== 'false', // 默认开启
    isWatermarkRemoved: localStorage.getItem('isWatermarkRemoved') === 'true', // 默认不去除
    // 权限列表 (模拟 - 默认赋予所有权限或大部分权限)
    userPermissions: [] as string[],
    // 生成中的模块列表
    generatingModules: {} as Record<string, boolean>,
  }),
  getters: {
    getModelForModule: (state) => (moduleId: string, type: 'text' | 'image' | 'video') => {
      // 优先检查全局锁定
      if (state.globalLocks[type]) {
        if (type === 'text') return state.selectedTextModel;
        if (type === 'image') return state.selectedImageModel;
        return state.selectedVideoModel;
      }
      
      if (state.lockedModels[moduleId]) {
        return state.lockedModels[moduleId].modelId;
      }
      if (type === 'text') return state.selectedTextModel;
      if (type === 'image') return state.selectedImageModel;
      return state.selectedVideoModel;
    },
    isLocked: (state) => (moduleId: string) => !!state.lockedModels[moduleId],
    isGlobalLocked: (state) => (type: 'text' | 'image' | 'video') => !!state.globalLocks[type],
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
    setGlobalLock(type: 'text' | 'image' | 'video', locked: boolean) {
      this.globalLocks[type] = locked;
      localStorage.setItem('globalLocks', JSON.stringify(this.globalLocks));
    },
    setGenerating(moduleId: string, isGenerating: boolean) {
      if (!moduleId) return;
      this.generatingModules[moduleId] = isGenerating;
    },
    setSubtitle(val: boolean) {
      this.isSubtitled = val;
      localStorage.setItem('isSubtitled', String(val));
    },
    setWatermarkRemoved(val: boolean) {
      this.isWatermarkRemoved = val;
      localStorage.setItem('isWatermarkRemoved', String(val));
    }
  }
});
