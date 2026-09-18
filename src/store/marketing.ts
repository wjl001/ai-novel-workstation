import { defineStore } from 'pinia';
import { HOOK_LIBRARY, type HookItem } from '../views/MarketingAgent/data/hooks';
import { MARKETING_TEMPLATES, type MarketingTemplate } from '../views/MarketingAgent/data/templates';
import { PLATFORM_CONFIGS, type PlatformConfig } from '../views/MarketingAgent/data/platforms';
import { SCRIPT_STYLES, type ScriptStyle } from '../views/MarketingAgent/data/styles';

// ===== 类型定义 =====
export interface ProductInfo {
  name: string;
  category: string;
  sellingPoints: string[];
  targetAudience: string;
  price: string;
  originalPrice: string;
  brand: string;
  description: string;
  referenceImages: string[];
  referenceVideoUrl: string;
}

export interface StoryboardShot {
  id: number;
  duration: string;
  scene: string;
  visual: string;
  audio: string;
  textOverlay: string;
  camera: string;
  bgm: string;
}

export interface MarketingScript {
  id: string;
  styleId: string;
  styleName: string;
  styleEmoji: string;
  styleColor: string;
  title: string;
  hook: string;
  body: string[];
  cta: string;
  hashtags: string[];
  caption: string;
  storyboard: StoryboardShot[];
  estimatedDuration: number;
  createdAt: number;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  selected: boolean;
}

export interface MarketingProject {
  id: string;
  name: string;
  product: ProductInfo;
  templateId: string;
  platformIds: string[];
  styleIds: string[];
  selectedHookId: string;
  scripts: MarketingScript[];
  createdAt: number;
  updatedAt: number;
}

// ===== 对话式数据结构 =====
export interface ProductCard {
  id: string;
  type: 'product' | 'character';
  name: string;
  description: string;
  image?: string;
}

export interface ResourceFile {
  id: string;
  name: string;
  type: 'doc' | 'image' | 'video';
  ext: string;
  size?: string;
  time: string;
  url?: string;
}

export interface Deliverable {
  id: string;
  name: string;
  type: 'md' | 'video' | 'image' | 'prompt';
  path: string;
  status: 'ready' | 'generating';
}

export interface ConfirmOption {
  id: string;
  label: string;
  desc: string;
  selected: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  deliverables?: Deliverable[];
  confirmOptions?: ConfirmOption[];
  confirmPage?: number;
  confirmTotal?: number;
  status?: 'thinking' | 'streaming' | 'done';
}

const STORAGE_KEY = 'marketing_agent_projects';
const CURRENT_KEY = 'marketing_agent_current';

export const useMarketingStore = defineStore('marketing', {
  state: () => ({
    // 当前商品信息
    product: {
      name: '',
      category: '',
      sellingPoints: [] as string[],
      targetAudience: '',
      price: '',
      originalPrice: '',
      brand: '',
      description: '',
      referenceImages: [] as string[],
      referenceVideoUrl: ''
    } as ProductInfo,

    // 当前选中配置
    selectedTemplateId: 'tpl-promo',
    selectedPlatformIds: ['douyin'] as string[],
    selectedStyleIds: ['style-suspense', 'style-review', 'style-emotion'] as string[],
    selectedHookId: '',
    customHook: '',

    // 生成的脚本
    scripts: [] as MarketingScript[],
    isGenerating: false,
    generationProgress: 0,

    // 历史项目
    projects: [] as MarketingProject[],
    currentProjectId: '',

    // UI状态
    activeTab: 'input' as 'input' | 'hooks' | 'templates' | 'result' | 'history',
    showStoryboardFor: '' as string,

    // ===== 对话式状态 =====
    chatMessages: [] as ChatMessage[],
    chatInput: '',
    isChatMode: false,
    isSending: false,
    productCards: [] as ProductCard[],
    resources: [] as ResourceFile[],
    showResourcePanel: true,
    activeChatTab: 'files' as 'chat' | 'files',
    selectedTemplateCategory: '全部'
  }),

  getters: {
    selectedTemplate: (state): MarketingTemplate | undefined =>
      MARKETING_TEMPLATES.find(t => t.id === state.selectedTemplateId),

    selectedPlatforms: (state): PlatformConfig[] =>
      PLATFORM_CONFIGS.filter(p => state.selectedPlatformIds.includes(p.id)),

    selectedStyles: (state): ScriptStyle[] =>
      SCRIPT_STYLES.filter(s => state.selectedStyleIds.includes(s.id)),

    selectedHook: (state): HookItem | undefined =>
      HOOK_LIBRARY.find(h => h.id === state.selectedHookId),

    completedScripts: (state): MarketingScript[] =>
      state.scripts.filter(s => s.status === 'completed'),

    selectedScripts: (state): MarketingScript[] =>
      state.scripts.filter(s => s.selected),

    isProductReady: (state): boolean =>
      !!state.product.name && state.product.sellingPoints.length > 0
  },

  actions: {
    // ===== 商品信息 =====
    updateProduct(field: keyof ProductInfo, value: any) {
      (this.product as any)[field] = value;
    },

    addSellingPoint(point: string) {
      if (point.trim() && !this.product.sellingPoints.includes(point.trim())) {
        this.product.sellingPoints.push(point.trim());
      }
    },

    removeSellingPoint(index: number) {
      this.product.sellingPoints.splice(index, 1);
    },

    // ===== 配置选择 =====
    setTemplate(id: string) {
      this.selectedTemplateId = id;
    },

    togglePlatform(id: string) {
      const idx = this.selectedPlatformIds.indexOf(id);
      if (idx > -1) {
        if (this.selectedPlatformIds.length > 1) {
          this.selectedPlatformIds.splice(idx, 1);
        }
      } else {
        this.selectedPlatformIds.push(id);
      }
    },

    toggleStyle(id: string) {
      const idx = this.selectedStyleIds.indexOf(id);
      if (idx > -1) {
        if (this.selectedStyleIds.length > 1) {
          this.selectedStyleIds.splice(idx, 1);
        }
      } else {
        this.selectedStyleIds.push(id);
      }
    },

    setHook(id: string) {
      this.selectedHookId = id;
    },

    setCustomHook(text: string) {
      this.customHook = text;
      if (text.trim()) this.selectedHookId = '';
    },

    // ===== 脚本管理 =====
    setScripts(scripts: MarketingScript[]) {
      this.scripts = scripts;
    },

    updateScript(id: string, patch: Partial<MarketingScript>) {
      const idx = this.scripts.findIndex(s => s.id === id);
      if (idx > -1) {
        this.scripts[idx] = { ...this.scripts[idx], ...patch };
      }
    },

    toggleScriptSelect(id: string) {
      const script = this.scripts.find(s => s.id === id);
      if (script) script.selected = !script.selected;
    },

    selectAllScripts() {
      this.scripts.forEach(s => { s.selected = true; });
    },

    deselectAllScripts() {
      this.scripts.forEach(s => { s.selected = false; });
    },

    deleteScript(id: string) {
      const idx = this.scripts.findIndex(s => s.id === id);
      if (idx > -1) this.scripts.splice(idx, 1);
    },

    setGenerating(val: boolean) {
      this.isGenerating = val;
      this.generationProgress = val ? 0 : 100;
    },

    setProgress(val: number) {
      this.generationProgress = Math.min(100, Math.max(0, val));
    },

    setShowStoryboard(id: string) {
      this.showStoryboardFor = this.showStoryboardFor === id ? '' : id;
    },

    // ===== 项目管理 =====
    saveCurrentProject() {
      const project: MarketingProject = {
        id: this.currentProjectId || `proj_${Date.now()}`,
        name: this.product.name || '未命名营销项目',
        product: { ...this.product, sellingPoints: [...this.product.sellingPoints] },
        templateId: this.selectedTemplateId,
        platformIds: [...this.selectedPlatformIds],
        styleIds: [...this.selectedStyleIds],
        selectedHookId: this.selectedHookId,
        scripts: JSON.parse(JSON.stringify(this.scripts)),
        createdAt: this.currentProjectId ? this.projects.find(p => p.id === this.currentProjectId)?.createdAt || Date.now() : Date.now(),
        updatedAt: Date.now()
      };

      const idx = this.projects.findIndex(p => p.id === project.id);
      if (idx > -1) {
        this.projects[idx] = project;
      } else {
        this.projects.unshift(project);
      }
      this.currentProjectId = project.id;
      this.persist();
    },

    loadProject(id: string) {
      const project = this.projects.find(p => p.id === id);
      if (!project) return;

      this.product = { ...project.product, sellingPoints: [...project.product.sellingPoints] };
      this.selectedTemplateId = project.templateId;
      this.selectedPlatformIds = [...project.platformIds];
      this.selectedStyleIds = [...project.styleIds];
      this.selectedHookId = project.selectedHookId;
      this.scripts = JSON.parse(JSON.stringify(project.scripts));
      this.currentProjectId = project.id;
      this.activeTab = 'result';
    },

    deleteProject(id: string) {
      const idx = this.projects.findIndex(p => p.id === id);
      if (idx > -1) {
        this.projects.splice(idx, 1);
        if (this.currentProjectId === id) this.currentProjectId = '';
        this.persist();
      }
    },

    newProject() {
      this.product = {
        name: '', category: '', sellingPoints: [], targetAudience: '',
        price: '', originalPrice: '', brand: '', description: '',
        referenceImages: [], referenceVideoUrl: ''
      };
      this.selectedTemplateId = 'tpl-promo';
      this.selectedPlatformIds = ['douyin'];
      this.selectedStyleIds = ['style-suspense', 'style-review', 'style-emotion'];
      this.selectedHookId = '';
      this.customHook = '';
      this.scripts = [];
      this.currentProjectId = '';
      this.activeTab = 'input';
      this.chatMessages = [];
      this.productCards = [];
      this.resources = [];
      this.isChatMode = false;
      this.chatInput = '';
    },

    // ===== 对话式方法 =====
    addMessage(msg: ChatMessage) {
      this.chatMessages.push(msg);
    },

    updateMessage(id: string, patch: Partial<ChatMessage>) {
      const idx = this.chatMessages.findIndex(m => m.id === id);
      if (idx > -1) {
        this.chatMessages[idx] = { ...this.chatMessages[idx], ...patch };
      }
    },

    setChatInput(val: string) {
      this.chatInput = val;
    },

    setChatMode(val: boolean) {
      this.isChatMode = val;
    },

    setSending(val: boolean) {
      this.isSending = val;
    },

    addProductCard(card: ProductCard) {
      this.productCards.push(card);
    },

    removeProductCard(id: string) {
      const idx = this.productCards.findIndex(c => c.id === id);
      if (idx > -1) this.productCards.splice(idx, 1);
    },

    addResource(file: ResourceFile) {
      this.resources.push(file);
    },

    toggleResourcePanel() {
      this.showResourcePanel = !this.showResourcePanel;
    },

    setChatTab(tab: 'chat' | 'files') {
      this.activeChatTab = tab;
    },

    setTemplateCategory(cat: string) {
      this.selectedTemplateCategory = cat;
    },

    selectConfirmOption(messageId: string, optionId: string) {
      const msg = this.chatMessages.find(m => m.id === messageId);
      if (msg && msg.confirmOptions) {
        msg.confirmOptions.forEach(o => { o.selected = o.id === optionId; });
      }
    },

    // ===== 持久化 =====
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.projects));
      localStorage.setItem(CURRENT_KEY, this.currentProjectId);
    },

    restore() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) this.projects = JSON.parse(saved);
        const current = localStorage.getItem(CURRENT_KEY);
        if (current) this.currentProjectId = current;
      } catch (e) {
        console.error('Failed to restore marketing projects:', e);
      }
    },

    setActiveTab(tab: 'input' | 'hooks' | 'templates' | 'result' | 'history') {
      this.activeTab = tab;
    }
  }
});
