import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Character {
  id: string;
  name: string;
  role: string;
  age?: string;
  gender?: string;
  personality: string; // was persona
  backstory?: string;
  visual_traits: {
    hair: string;
    eyes: string;
    clothing: string;
    accessories?: string;
  };
}

export interface Prop {
  id: string;
  name: string;
  description: string;
  type: string;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  atmosphere: string;
}

export interface Chapter {
  id: string;
  title: string;
  outline: string;
  content: string;
}

export interface Novel {
  id: string;
  title: string;
  premise: string; // 核心梗/简介
  genre: string;   // 类型
  episodeCount?: number;
  episodeDuration?: number;
  targetAudience?: string;
  model?: string; // Add model
  worldView?: string;
  goldenFinger?: string;
  mainPlot?: string;
  synopsis?: string;
  characterInfo?: string;
  tags?: string[];
  style?: string;
  perspective?: string;
  chapters: Chapter[];
  longMemory?: boolean; // Add longMemory
}

export const useLoreStore = defineStore('lore', () => {
  const characters = ref<Character[]>([])
  const props = ref<Prop[]>([])
  const scenes = ref<Scene[]>([])
  
  // 当前正在编辑的小说
  const currentNovel = ref<Novel>({
    id: '1',
    title: '未命名作品',
    premise: '',
    genre: '玄幻',
    episodeCount: 12,
    episodeDuration: 30,
    targetAudience: 'general',
    model: 'gpt-4-turbo',
    chapters: []
  })

  const addCharacter = (character: Character) => {
    characters.value.push(character)
  }

  const removeCharacter = (id: string) => {
    characters.value = characters.value.filter(c => c.id !== id)
  }

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    const index = characters.value.findIndex(c => c.id === id)
    if (index !== -1) {
      characters.value[index] = { ...characters.value[index], ...updates }
    }
  }

  const addProp = (prop: Prop) => {
    props.value.push(prop)
  }

  const removeProp = (id: string) => {
    props.value = props.value.filter(p => p.id !== id)
  }

  const updateProp = (id: string, updates: Partial<Prop>) => {
    const index = props.value.findIndex(p => p.id === id)
    if (index !== -1) {
      props.value[index] = { ...props.value[index], ...updates }
    }
  }

  const addScene = (scene: Scene) => {
    scenes.value.push(scene)
  }

  const removeScene = (id: string) => {
    scenes.value = scenes.value.filter(s => s.id !== id)
  }

  const updateScene = (id: string, updates: Partial<Scene>) => {
    const index = scenes.value.findIndex(s => s.id === id)
    if (index !== -1) {
      scenes.value[index] = { ...scenes.value[index], ...updates }
    }
  }

  // 小说相关操作
  const updateNovelInfo = (info: Partial<Omit<Novel, 'chapters'>>) => {
    currentNovel.value = { ...currentNovel.value, ...info }
  }

  const addChapter = (chapter: Chapter) => {
    currentNovel.value.chapters.push(chapter)
  }

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    const index = currentNovel.value.chapters.findIndex(c => c.id === id)
    if (index !== -1) {
      currentNovel.value.chapters[index] = { ...currentNovel.value.chapters[index], ...updates }
    }
  }

  return {
    characters,
    currentNovel,
    addCharacter,
    removeCharacter,
    updateCharacter,
    updateNovelInfo,
    addChapter,
    updateChapter,
    props,
    scenes,
    addProp,
    removeProp,
    updateProp,
    addScene,
    removeScene,
    updateScene
  }
})
