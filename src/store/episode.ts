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
  description?: string;
}

export const useEpisodeStore = defineStore('episode', {
  state: () => ({
    episodes: [] as Episode[],
    subjects: [] as Subject[],
    subjectId: null as string | null,
    isGeneratingBatch: false,
    batchProgress: 0,
    currentDramaTitle: '未命名剧本',
    generationStatus: {
      isGenerating: false,
      type: '' as 'storyboard' | 'synthesis' | '',
      progress: 0,
      currentIndex: -1,
      totalCount: 0
    }
  }),
  actions: {
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
    saveToLocalStorage() {
      const stateToSave = {
        episodes: this.episodes,
        subjects: this.subjects,
        subjectId: this.subjectId,
        isGeneratingBatch: this.isGeneratingBatch,
        batchProgress: this.batchProgress,
        currentDramaTitle: this.currentDramaTitle,
        generationStatus: this.generationStatus
      };
      localStorage.setItem('episode_store', JSON.stringify(stateToSave));
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
          this.generationStatus = parsed.generationStatus || this.generationStatus;
        } catch (e) {
          console.error('Failed to parse episode_store from localStorage', e);
        }
      }
    }
  }
});
