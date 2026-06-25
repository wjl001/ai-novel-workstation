import { defineStore } from 'pinia';
import { TEXT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from '@/config/models';

export const useModelStore = defineStore('models', {
  state: () => ({
    selectedTextModel: localStorage.getItem('selectedTextModel') || TEXT_MODELS[0].models[0].id,
    selectedImageModel: localStorage.getItem('selectedImageModel') || IMAGE_MODELS[0].models[0].id,
    selectedVideoModel: localStorage.getItem('selectedVideoModel') || VIDEO_MODELS[0].models[0].id,
  }),
  actions: {
    setTextModel(id: string) {
      this.selectedTextModel = id;
      localStorage.setItem('selectedTextModel', id);
    },
    setImageModel(id: string) {
      this.selectedImageModel = id;
      localStorage.setItem('selectedImageModel', id);
    },
    setVideoModel(id: string) {
      this.selectedVideoModel = id;
      localStorage.setItem('selectedVideoModel', id);
    }
  }
});
