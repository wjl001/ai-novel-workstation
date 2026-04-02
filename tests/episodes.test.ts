import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import EpisodesView from '../src/views/AIShortDrama/EpisodesView.vue';
import ElementPlus from 'element-plus';
import { createPinia, setActivePinia } from 'pinia';
import { useEpisodeStore } from '../src/store/episode';
import { nextTick } from 'vue';

// Mock Router
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/storyboard/:id', name: 'storyboard', component: { template: '<div>Storyboard</div>' } }]
});

describe('EpisodesView Navigation Tests', () => {
  let episodeStore: ReturnType<typeof useEpisodeStore>;

  beforeEach(() => {
    vi.clearAllMocks(); // Clear all mocks before each test
    setActivePinia(createPinia());
    episodeStore = useEpisodeStore();
    episodeStore.setEpisodes([
      {
        id: '1',
        index: 1,
        title: '第 1 集：命运抉择系统自毁',
        poster: 'https://picsum.photos/seed/1/200/300',
        roleCount: 7,
        sceneCount: 2,
        status: 'success', // Set to success for edit button to appear
        storyboardGenerated: true,
        duration: '10:45',
        gif: ''
      },
      {
        id: '2',
        index: 2,
        title: '第 2 集：重生归来',
        poster: 'https://picsum.photos/seed/2/200/300',
        roleCount: 5,
        sceneCount: 3,
        status: 'pending',
        storyboardGenerated: false,
        duration: '08:20',
        gif: ''
      }
    ]);
    vi.spyOn(router, 'push');
    vi.useFakeTimers(); // Ensure fake timers are used here
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers after each test
  });

  it('should navigate to storyboard detail page when edit button is clicked for a successful episode', async () => {
    const wrapper = mount(EpisodesView, {
      global: {
        plugins: [ElementPlus, router],
        stubs: {
          EpisodesEditDrawer: true, // Stub the drawer component
          ProgressModal: true, // Stub the modal component
        }
      }
    });

    // Find the edit button for the first episode (which has status 'success')
    const editButton = wrapper.findAll('.el-button').filter(b => b.text().includes('编辑'))[0];
    expect(editButton.exists()).toBe(true);

    await editButton.trigger('click');
    await nextTick();

    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith({
      path: '/storyboard/1',
      query: { subjectId: null } // subjectId is null by default in store mock
    });
  });

  it('should call handleGenerate and update episode status when generate button is clicked for a pending episode', async () => {
    const wrapper = mount(EpisodesView, {
      global: {
        plugins: [ElementPlus, router],
        stubs: {
          EpisodesEditDrawer: true,
          ProgressModal: true,
        }
      }
    });

    // Find the generate button for the second episode (which has status 'pending')
    const generateButton = wrapper.findAll('.el-button').filter(b => b.text().includes('生成'))[0];
    expect(generateButton.exists()).toBe(true);

    // Spy on the updateEpisode action to check status changes
    const updateEpisodeSpy = vi.spyOn(episodeStore, 'updateEpisode');

    await generateButton.trigger('click');
    await nextTick();

    // Expect status to change to 'generating'
    expect(updateEpisodeSpy).toHaveBeenCalledWith('2', { status: 'generating' });

    vi.runAllTimers(); // Use runAllTimers to ensure all async operations complete
    await nextTick();

    // Expect status to change to 'success' and storyboardGenerated to true
    expect(updateEpisodeSpy).toHaveBeenCalledWith('2', { status: 'success', storyboardGenerated: true });
    
    // Expect router.push to have been called
    expect(router.push).toHaveBeenCalledWith({
      path: '/storyboard/2',
      query: { subjectId: null }
    });
  });
});
