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
        this.designs[id] = { ...this.designs[id], ...content };
      } else {
        this.designs[id] = content as ProductDesignContent;
      }
      this.saveToLocalStorage();
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
          }
          this.designs = loadedDesigns;
        } catch (e) {
          console.error('Failed to load product designs', e);
        }
      }
    }
  }
});
