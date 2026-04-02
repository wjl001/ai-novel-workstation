import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import AssetsView from '../src/views/AIShortDrama/AssetsView.vue';
import ElementPlus from 'element-plus';
import { nextTick } from 'vue';

// Mock Router
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/ai-short-drama-creator/episodes', component: { template: '<div>Episodes</div>' } }]
});

describe('AssetsView Navigation', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    router.push('/');
    await router.isReady();
  });

  it('renders "Next Step" button', () => {
    const wrapper = mount(AssetsView, {
      global: { 
        plugins: [ElementPlus, router],
        stubs: { 'el-dialog': true }
      }
    });
    expect(wrapper.text()).toContain('下一步：分集生成');
  });

  it('disables button when assets are incomplete', async () => {
    const wrapper = mount(AssetsView, {
      global: { 
        plugins: [ElementPlus, router],
        stubs: { 'el-dialog': true }
      }
    });
    
    const vm = wrapper.vm as any;
    // Mock empty assets
    vm.characters = [];
    await nextTick();
    
    // Find the "Next Step" button specifically
    const nextBtn = wrapper.findAll('.theme-primary-btn').find(b => b.text().includes('下一步'));
    expect(nextBtn?.element.disabled).toBe(true);
  });

  it('shows confirmation dialog when there are unsaved changes', async () => {
    const wrapper = mount(AssetsView, {
      global: { 
        plugins: [ElementPlus, router],
        stubs: { 'el-dialog': true }
      }
    });
    
    const vm = wrapper.vm as any;
    vm.hasUnsavedChanges = true;
    await nextTick();
    
    const nextBtn = wrapper.findAll('.theme-primary-btn').find(b => b.text().includes('下一步'));
    await nextBtn?.trigger('click');
    
    expect(vm.confirmVisible).toBe(true);
  });

  it('navigates to episodes page when confirmed', async () => {
    const pushSpy = vi.spyOn(router, 'push');
    const wrapper = mount(AssetsView, {
      global: { 
        plugins: [ElementPlus, router],
        stubs: { 'el-dialog': true }
      }
    });
    
    const vm = wrapper.vm as any;
    vm.hasUnsavedChanges = false;
    await nextTick();
    
    const nextBtn = wrapper.findAll('.theme-primary-btn').find(b => b.text().includes('下一步'));
    await nextBtn?.trigger('click');
    
    expect(pushSpy).toHaveBeenCalledWith('/ai-short-drama-creator/episodes');
  });
});
