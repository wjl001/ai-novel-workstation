import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDramaStore } from '../src/store/drama';

describe('Drama Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with null dramaId and outlineData', () => {
    const store = useDramaStore();
    expect(store.currentDramaId).toBeNull();
    expect(store.outlineData).toBeNull();
  });

  it('should set currentDramaId correctly', () => {
    const store = useDramaStore();
    store.setCurrentDramaId('drama_123');
    expect(store.currentDramaId).toBe('drama_123');
  });

  it('should set outlineData correctly', () => {
    const store = useDramaStore();
    const mockData = { title: 'Test Drama', genre: 'Sci-Fi' };
    store.setOutlineData(mockData);
    expect(store.outlineData).toEqual(mockData);
  });
});
