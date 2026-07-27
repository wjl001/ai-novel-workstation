import { defineStore } from 'pinia';

export interface Episode {
  id: string;
  index: number;
  title: string;
  duration: string;
  poster: string;
  gif: string;
  scriptStatus: 'pending' | 'success';
  assetsStatus: 'pending' | 'success';
  storyboardStatus: 'pending' | 'generating' | 'success' | 'failed';
  synthesisStatus: 'pending' | 'synthesizing' | 'success' | 'failed';
  storyboardGenerated: boolean;
  status: 'pending' | 'generating' | 'success' | 'failed';
  errorReason?: string;
  script?: string;
  roleCount?: number;
  sceneCount?: number;
  propCount?: number;
  storyboardCount?: number;
  synthesisProgress?: number;
  synthesisVideo?: string;
  storyboardScenes?: any[];
}

export interface Subject {
  id: string;
  name: string;
  type: 'character' | 'scene' | 'prop';
  image?: string;
  prompt?: string;
  reference_image?: string;
  description?: string;
  voice_description?: string;
  voice_audio?: string;
  selectedImageId?: string;
  imageHistory?: {
    id: string;
    url: string;
    isSelected: boolean;
    createdAt: number;
    name?: string;
    description?: string;
    reference_image?: string;
    voice_description?: string;
    voice_audio?: string;
  }[];
  appeared_episodes?: number[];
}

export const useEpisodeStore = defineStore('episode', {
  state: () => ({
    episodes: [] as Episode[],
    subjects: [] as Subject[],
    subjectId: null as string | null,
    isGeneratingBatch: false,
    batchProgress: 0,
    currentDramaTitle: '未命名剧本',
    lastUsedSubjectIds: [] as string[],
    generationStatus: {
      isGenerating: false,
      type: '' as 'storyboard' | 'synthesis' | '',
      progress: 0,
      currentIndex: -1,
      totalCount: 0
    },
    tasks: [] as any[]
  }),
  actions: {
    setTasks(tasks: any[]) {
      // 移除 execute 函数（不可序列化），再从已有 tasks 中恢复
      const serialized = tasks.map((t: any) => {
        const { execute, ...rest } = t
        return rest
      })
      this.tasks = serialized
      this.saveToLocalStorage()
    },
    setEpisodes(episodes: Episode[]) {
      this.episodes = episodes;
      this.saveToLocalStorage();
    },
    updateEpisode(id: string, updates: Partial<Episode>) {
      const index = this.episodes.findIndex(e => e.id === id);
      if (index > -1) {
        this.episodes[index] = { ...this.episodes[index], ...updates };
        this.saveToLocalStorage();
      }
    },
    setSubjects(subjects: Subject[]) {
      this.subjects = subjects;
      this.saveToLocalStorage();
    },
    addSubject(subject: Subject) {
      this.subjects.push(subject);
      this.saveToLocalStorage();
    },
    updateSubject(id: string, updates: Partial<Subject>) {
      const index = this.subjects.findIndex(s => s.id === id);
      if (index > -1) {
        this.subjects[index] = { ...this.subjects[index], ...updates };
        this.saveToLocalStorage();
      }
    },
    deleteSubject(id: string) {
      const index = this.subjects.findIndex(s => s.id === id);
      if (index > -1) {
        this.subjects.splice(index, 1);
        this.saveToLocalStorage();
      }
    },
    setSubjectId(id: string) {
      this.subjectId = id;
      this.saveToLocalStorage();
    },
    setBatchGenerating(status: boolean) {
      this.isGeneratingBatch = status;
      this.generationStatus.isGenerating = status;
      this.saveToLocalStorage();
    },
    setBatchProgress(progress: number) {
      this.batchProgress = progress;
      this.generationStatus.progress = progress;
      this.saveToLocalStorage();
    },
    setGenerationStatus(status: Partial<typeof useEpisodeStore.prototype.generationStatus>) {
      this.generationStatus = { ...this.generationStatus, ...status };
      this.saveToLocalStorage();
    },
    setLastUsedSubjectIds(ids: string[]) {
      this.lastUsedSubjectIds = ids;
      this.saveToLocalStorage();
    },
    autoAssociateSubjects(targetEpisodeIndex?: number) {
      const allIndices = Array.from({ length: this.episodes.length }, (_, i) => i + 1);
      
      let sourceSubjectIds = [...this.lastUsedSubjectIds];

      if (targetEpisodeIndex) {
        // 单集关联
        if (sourceSubjectIds.length === 0) {
          // 如果没有记录“最新使用”，查找最近一个有主体的集数
          for (let i = targetEpisodeIndex - 1; i >= 1; i--) {
            const subs = this.subjects.filter(s => s.appeared_episodes?.includes(i));
            if (subs.length > 0) {
              sourceSubjectIds = subs.map(s => s.id);
              break;
            }
          }
        }
        
        // 如果还是没找到，则使用全部主体
        if (sourceSubjectIds.length === 0) {
          sourceSubjectIds = this.subjects.map(s => s.id);
        }
        
        // 更新主体关联
        this.subjects.forEach(s => {
          let appeared = [...(s.appeared_episodes || [])];
          if (sourceSubjectIds.includes(s.id)) {
            if (!appeared.includes(targetEpisodeIndex)) {
              appeared.push(targetEpisodeIndex);
            }
          } else {
            appeared = appeared.filter(idx => idx !== targetEpisodeIndex);
          }
          s.appeared_episodes = appeared;
        });

        // 更新“最新使用”记录
        this.lastUsedSubjectIds = [...sourceSubjectIds];
      } else {
        // 全局关联
        if (sourceSubjectIds.length === 0) {
          sourceSubjectIds = this.subjects.map(s => s.id);
        }

        this.subjects.forEach(s => {
          if (sourceSubjectIds.includes(s.id)) {
            s.appeared_episodes = [...allIndices];
          } else {
            s.appeared_episodes = [];
          }
        });

        this.lastUsedSubjectIds = [...sourceSubjectIds];
      }
      
      this.saveToLocalStorage();
    },
    saveToLocalStorage() {
      const stateToSave = {
        episodes: this.episodes,
        subjects: this.subjects,
        subjectId: this.subjectId,
        isGeneratingBatch: this.isGeneratingBatch,
        batchProgress: this.batchProgress,
        currentDramaTitle: this.currentDramaTitle,
        lastUsedSubjectIds: this.lastUsedSubjectIds,
        generationStatus: this.generationStatus
      };
      localStorage.setItem('episode_store', JSON.stringify(stateToSave));
      // 单独保存 tasks（已移除 execute 函数）
      localStorage.setItem('episode_tasks', JSON.stringify(this.tasks));
    },
    loadFromLocalStorage() {
      const savedState = localStorage.getItem('episode_store');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          this.episodes = parsed.episodes || [];
          this.subjects = parsed.subjects || [];
          this.subjectId = parsed.subjectId;
          this.isGeneratingBatch = parsed.isGeneratingBatch || false;
          this.batchProgress = parsed.batchProgress || 0;
          this.currentDramaTitle = parsed.currentDramaTitle || '未命名剧本';
          this.lastUsedSubjectIds = parsed.lastUsedSubjectIds || [];
          this.generationStatus = parsed.generationStatus || this.generationStatus;
        } catch (e) {
          console.error('Failed to parse episode_store from localStorage', e);
        }
      }
      // 单独加载 tasks
      const savedTasks = localStorage.getItem('episode_tasks');
      if (savedTasks) {
        try {
          this.tasks = JSON.parse(savedTasks) || [];
        } catch (e) {
          console.error('Failed to parse episode_tasks from localStorage', e);
        }
      }
    }
  }
});
