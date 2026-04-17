import { defineStore } from 'pinia'

export const useDramaStore = defineStore('drama', {
  state: () => ({
    currentDramaId: null as string | null,
    outlineData: null as any,
    isScriptGenerated: false,
    isAssetsGenerated: false,
    expandedPrompt: '' as string,
    generationStatus: {
      isGenerating: false,
      type: '' as 'outline' | 'script' | 'storyboard' | '',
      progress: 0,
      currentIndex: -1,
      totalCount: 0
    }
  }),
  actions: {
    setCurrentDramaId(id: string) {
      this.currentDramaId = id
      this.saveToLocalStorage()
    },
    setOutlineData(data: any) {
      this.outlineData = data
      this.saveToLocalStorage()
    },
    setScriptGenerated(status: boolean) {
      this.isScriptGenerated = status
      this.saveToLocalStorage()
    },
    setAssetsGenerated(status: boolean) {
      this.isAssetsGenerated = status
      this.saveToLocalStorage()
    },
    setExpandedPrompt(prompt: string) {
      this.expandedPrompt = prompt
      this.saveToLocalStorage()
    },
    setGenerationStatus(status: Partial<typeof useDramaStore.prototype.generationStatus>) {
      this.generationStatus = { ...this.generationStatus, ...status }
      this.saveToLocalStorage()
    },
    saveToLocalStorage() {
      const stateToSave = {
        currentDramaId: this.currentDramaId,
        outlineData: this.outlineData,
        isScriptGenerated: this.isScriptGenerated,
        isAssetsGenerated: this.isAssetsGenerated,
        expandedPrompt: this.expandedPrompt,
        generationStatus: this.generationStatus
      }
      localStorage.setItem('drama_store', JSON.stringify(stateToSave))
    },
    loadFromLocalStorage() {
      const savedState = localStorage.getItem('drama_store')
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState)
          this.currentDramaId = parsed.currentDramaId
          this.outlineData = parsed.outlineData
          this.isScriptGenerated = parsed.isScriptGenerated
          this.isAssetsGenerated = parsed.isAssetsGenerated || false
          this.expandedPrompt = parsed.expandedPrompt
          this.generationStatus = parsed.generationStatus || this.generationStatus
        } catch (e) {
          console.error('Failed to parse drama_store from localStorage', e)
        }
      }
    }
  }
})