import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import StoryboardView from '../src/views/AIShortDrama/StoryboardView.vue';
import ElementPlus from 'element-plus';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { nextTick } from 'vue';

// Mock Router
const router = createRouter({
  history: createWebHistory(),
  routes: [{ 
    path: '/storyboard/:id', 
    name: 'storyboard',
    component: { template: '<div>Storyboard</div>' } 
  }]
});

describe('StoryboardView Logic Tests', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    router.push('/storyboard/1');
    await router.isReady();
  });

  it('filters subjects based on search query', async () => {
    const wrapper = mount(StoryboardView, {
      global: { 
        plugins: [ElementPlus, router],
        stubs: {
          'el-dialog': true,
          'el-overlay': true
        }
      }
    });
    
    const vm = wrapper.vm as any;
    
    // Initial state: 3 characters in mock data
    expect(vm.filteredCharacters.length).toBe(3);
    
    vm.searchQuery = '王二狗';
    await nextTick();
    expect(vm.filteredCharacters.length).toBe(1);
    expect(vm.filteredCharacters[0].name).toContain('王二狗');
    
    vm.searchQuery = '不存在的主体';
    await nextTick();
    expect(vm.filteredCharacters.length).toBe(0);
  });

  it('simulates storyboard generation workflow', async () => {
    const wrapper = mount(StoryboardView, {
      global: { 
        plugins: [ElementPlus, router],
        stubs: {
          'el-dialog': true,
          'el-overlay': true
        }
      }
    });
    
    const vm = wrapper.vm as any;
    vm.handleGenerateSingleScene(1);
    
    expect(vm.timelineScenes[1].status).toBe('generating');
    
    // Fast forward intervals
    vi.runAllTimers(); // Run all pending timers
    await nextTick();
    
    // After all timers have run, it should have finished
    expect(vm.timelineScenes[1].status).toBe('success');
  });

  it('manages timeline scenes correctly', async () => {
    const wrapper = mount(StoryboardView, {
      global: { 
        plugins: [ElementPlus, router],
        stubs: {
          'el-dialog': true,
          'el-overlay': true
        }
      }
    });
    
    const vm = wrapper.vm as any;
    const initialCount = vm.timelineScenes.length;
    
    vm.addTimelineScene();
    expect(vm.timelineScenes.length).toBe(initialCount + 1);
    
    // currentSceneIdx should point to the new scene
    expect(vm.currentSceneIdx).toBe(initialCount);
    
    vm.deleteCurrentScene();
    expect(vm.timelineScenes.length).toBe(initialCount);
  });

  it('handles video synthesis workflow state', async () => {
    const wrapper = mount(StoryboardView, {
      global: { 
        plugins: [ElementPlus, router],
        stubs: {
          'el-dialog': true,
          'el-overlay': true
        }
      }
    });
    
    const vm = wrapper.vm as any;
    vm.startSynthesis();
    
    expect(vm.isSynthesizing).toBe(true);
    expect(vm.synthesisProgress).toBe(0);
    
    // 100ms intervals, incrementing by 1
    vi.advanceTimersByTime(5000);
    await nextTick();
    
    // After 5s, progress should be around 50
    expect(vm.synthesisProgress).toBeGreaterThan(0);
    
    vi.advanceTimersByTime(6000);
    await nextTick();
    
    // Total 11s, should be finished
    expect(vm.isSynthesizing).toBe(false);
  });
});