import { defineStore } from 'pinia';

interface ProductDesignImage {
  url: string;
  caption: string;
}

interface InteractionItem {
  text: string;
  image?: string;
}

interface ProductDesignContent {
  id: string;
  title: string;
  location: string;
  layout: string[];
  interactions: (string | InteractionItem)[];
  images?: ProductDesignImage[];
  image?: string;
  version: string;
  updatedAt?: number;
}

export const useProductDesignStore = defineStore('productDesign', {
  state: () => ({
    designs: {} as Record<string, ProductDesignContent>,
  }),
  actions: {
    getDesign(id: string, defaultContent?: ProductDesignContent) {
      if (!this.designs[id] && defaultContent) {
        this.designs[id] = { ...defaultContent };
      }
      return this.designs[id];
    },
    updateDesign(id: string, content: Partial<ProductDesignContent>) {
      if (this.designs[id]) {
        this.designs[id] = { ...this.designs[id], ...content, updatedAt: Date.now() };
      } else {
        this.designs[id] = { ...(content as ProductDesignContent), updatedAt: Date.now() };
      }
      this.saveToLocalStorage();
      void this.syncDesignToServer(id);
    },
    saveToLocalStorage() {
      localStorage.setItem('product_designs', JSON.stringify(this.designs));
    },
    loadFromLocalStorage() {
      const saved = localStorage.getItem('product_designs');
      if (saved) {
        try {
          const loadedDesigns = JSON.parse(saved);
          // Migration: convert old image field to images array
          for (const id in loadedDesigns) {
            if (loadedDesigns[id].image && !loadedDesigns[id].images) {
              loadedDesigns[id].images = [{ url: loadedDesigns[id].image, caption: '原型截图' }];
              delete loadedDesigns[id].image;
            }
            if (!loadedDesigns[id].updatedAt) loadedDesigns[id].updatedAt = Date.now();
          }
          this.designs = loadedDesigns;
        } catch (e) {
          console.error('Failed to load product designs', e);
        }
      }
    },
    async loadFromServer() {
      try {
        const res = await fetch('/api/product-designs', { method: 'GET' });
        if (!res.ok) return;
        const remote = (await res.json()) as Record<string, ProductDesignContent>;
        if (!remote || typeof remote !== 'object') return;

        const ids = new Set([...Object.keys(this.designs), ...Object.keys(remote)]);
        for (const id of ids) {
          const local = this.designs[id];
          const server = remote[id];
          if (!local && server) {
            this.designs[id] = server;
            continue;
          }
          if (local && !server) {
            void this.syncDesignToServer(id);
            continue;
          }
          if (local && server) {
            const localAt = typeof local.updatedAt === 'number' ? local.updatedAt : 0;
            const serverAt = typeof server.updatedAt === 'number' ? server.updatedAt : 0;
            if (serverAt > localAt) {
              this.designs[id] = server;
            } else if (localAt > serverAt) {
              void this.syncDesignToServer(id);
            }
          }
        }
        this.saveToLocalStorage();
      } catch {
        return;
      }
    },
    async syncDesignToServer(id: string) {
      const data = this.designs[id];
      if (!data) return;
      try {
        await fetch(`/api/product-designs/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch {
        return;
      }
    }
  }
});
