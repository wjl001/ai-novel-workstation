import { defineStore } from 'pinia'

export const useDramaStore = defineStore('drama', {
  state: () => ({
    currentDramaId: null as string | null,
    outlineData: null as any
  }),
  actions: {
    setCurrentDramaId(id: string) {
      this.currentDramaId = id
    },
    setOutlineData(data: any) {
      this.outlineData = data
    }
  }
})