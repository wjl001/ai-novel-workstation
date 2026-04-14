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
    currentDramaTitle: '未命名剧本'
  }),
  actions: {
    setEpisodes(episodes: Episode[]) {
      this.episodes = episodes;
    },
    updateEpisode(id: string, updates: Partial<Episode>) {
      const index = this.episodes.findIndex(e => e.id === id);
      if (index > -1) {
        this.episodes[index] = { ...this.episodes[index], ...updates };
      }
    },
    setSubjects(subjects: Subject[]) {
      this.subjects = subjects;
    },
    addSubject(subject: Subject) {
      this.subjects.push(subject);
    },
    updateSubject(id: string, updates: Partial<Subject>) {
      const index = this.subjects.findIndex(s => s.id === id);
      if (index > -1) {
        this.subjects[index] = { ...this.subjects[index], ...updates };
      }
    },
    deleteSubject(id: string) {
      const index = this.subjects.findIndex(s => s.id === id);
      if (index > -1) {
        this.subjects.splice(index, 1);
      }
    },
    setSubjectId(id: string) {
      this.subjectId = id;
    },
    setBatchGenerating(status: boolean) {
      this.isGeneratingBatch = status;
    },
    setBatchProgress(progress: number) {
      this.batchProgress = progress;
    }
  }
});
