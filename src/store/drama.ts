import { defineStore } from 'pinia'

export const useDramaStore = defineStore('drama', {
  state: () => ({
    currentDramaId: null as string | null,
    outlineData: null as any,
    isScriptGenerated: false,
    isAssetsGenerated: false,
    expandedPrompt: '' as string,
    fullScriptContent: '' as string,
    episodesCount: 80 as number,
    // 创作模式：full=完整流程（剧本→主体→分镜），quick=快捷流程（主体→分镜，无需剧本）
    creationMode: 'full' as 'full' | 'quick',
    // 快捷模式下用户输入的创作灵感
    quickCreationPrompt: '' as string,
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
    setFullScriptContent(content: string) {
      this.fullScriptContent = content
      this.saveToLocalStorage()
    },
    setEpisodesCount(count: number) {
      this.episodesCount = count
      this.saveToLocalStorage()
    },
    setCreationMode(mode: 'full' | 'quick') {
      this.creationMode = mode
      // 快捷模式下，剧本生成状态自动设为 true（跳过剧本环节）
      if (mode === 'quick') {
        this.isScriptGenerated = true
      }
      this.saveToLocalStorage()
    },
    setQuickCreationPrompt(prompt: string) {
      this.quickCreationPrompt = prompt
      this.saveToLocalStorage()
    },
    setGenerationStatus(status: Partial<typeof useDramaStore.prototype.generationStatus>) {
      this.generationStatus = { ...this.generationStatus, ...status }
      this.saveToLocalStorage()
    },
    saveToLocalStorage() {
      try {
        const stateToSave = {
          currentDramaId: this.currentDramaId,
          outlineData: this.outlineData,
          isScriptGenerated: this.isScriptGenerated,
          isAssetsGenerated: this.isAssetsGenerated,
          expandedPrompt: this.expandedPrompt,
          fullScriptContent: this.fullScriptContent,
          episodesCount: this.episodesCount,
          creationMode: this.creationMode,
          quickCreationPrompt: this.quickCreationPrompt,
          generationStatus: this.generationStatus
        }
        localStorage.setItem('drama_store', JSON.stringify(stateToSave))
      } catch (e) {
        console.warn('Failed to save to localStorage (possibly quota exceeded)', e)
      }
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
          this.fullScriptContent = parsed.fullScriptContent || ''
          this.episodesCount = parsed.episodesCount || 80
          this.creationMode = parsed.creationMode || 'full'
          this.quickCreationPrompt = parsed.quickCreationPrompt || ''
          this.generationStatus = parsed.generationStatus || this.generationStatus
        } catch (e) {
          console.error('Failed to parse drama_store from localStorage', e)
        }
      }
    }
  }
})