import { defineStore } from 'pinia'

export const useDramaStore = defineStore('drama', {
  state: () => ({
    currentDramaId: null as string | null,
    outlineData: null as any,
    isScriptGenerated: false
  }),
  actions: {
    setCurrentDramaId(id: string) {
      this.currentDramaId = id
    },
    setOutlineData(data: any) {
      this.outlineData = data
    },
    setScriptGenerated(status: boolean) {
      this.isScriptGenerated = status
    }
  }
})