import { create } from 'zustand';
import { playbookApi } from '../api/playbookApi';
import type { Playbook, PlaybookFilter, PlaybookStore } from '../types/playbook.types';

function updatePlaybookCollection(playbooks: Playbook[], next: Playbook): Playbook[] {
  const existing = playbooks.find((playbook) => playbook.id === next.id);

  if (!existing) {
    return [next, ...playbooks];
  }

  return playbooks.map((playbook) => (playbook.id === next.id ? next : playbook));
}

export const usePlaybookStore = create<PlaybookStore>((set, get) => ({
  playbooks: [],
  selectedPlaybook: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchPlaybooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const playbooks = await playbookApi.listPlaybooks(get().filters);
      set({ playbooks, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch playbooks',
        isLoading: false,
      });
    }
  },

  fetchPlaybookById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const playbook = await playbookApi.getPlaybook(id);
      set((state) => ({
        playbooks: updatePlaybookCollection(state.playbooks, playbook),
        selectedPlaybook: playbook,
        isLoading: false,
      }));
      return playbook;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch playbook',
        isLoading: false,
      });
      return null;
    }
  },

  createPlaybook: async (data: Partial<Playbook>) => {
    set({ isLoading: true, error: null });
    try {
      const newPlaybook = await playbookApi.createPlaybook(data);
      set((state) => ({
        playbooks: updatePlaybookCollection(state.playbooks, newPlaybook),
        selectedPlaybook: newPlaybook,
        isLoading: false,
      }));
      return newPlaybook;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create playbook',
        isLoading: false,
      });
      throw error;
    }
  },

  updatePlaybook: async (id: string, data: Partial<Playbook>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPlaybook = await playbookApi.updatePlaybook(id, data);
      set((state) => ({
        playbooks: updatePlaybookCollection(state.playbooks, updatedPlaybook),
        selectedPlaybook: updatedPlaybook,
        isLoading: false,
      }));
      return updatedPlaybook;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update playbook',
        isLoading: false,
      });
      throw error;
    }
  },

  savePlaybookDraft: async (id: string, specDocument: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPlaybook = await playbookApi.savePlaybookDraft(id, specDocument);
      set((state) => ({
        playbooks: updatePlaybookCollection(state.playbooks, updatedPlaybook),
        selectedPlaybook: updatedPlaybook,
        isLoading: false,
      }));
      return updatedPlaybook;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save playbook draft',
        isLoading: false,
      });
      throw error;
    }
  },

  publishPlaybook: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const publishedPlaybook = await playbookApi.publishPlaybook(id);
      set((state) => ({
        playbooks: updatePlaybookCollection(state.playbooks, publishedPlaybook),
        selectedPlaybook: state.selectedPlaybook?.id === id ? publishedPlaybook : state.selectedPlaybook,
        isLoading: false,
      }));
      return publishedPlaybook;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to publish playbook',
        isLoading: false,
      });
      throw error;
    }
  },

  deletePlaybook: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await playbookApi.deletePlaybook(id);
      set((state) => ({
        playbooks: state.playbooks.filter((playbook) => playbook.id !== id),
        selectedPlaybook: state.selectedPlaybook?.id === id ? null : state.selectedPlaybook,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete playbook',
        isLoading: false,
      });
      throw error;
    }
  },

  selectPlaybook: (playbook: Playbook | null) => {
    set({ selectedPlaybook: playbook });
  },

  setFilters: (filters: Partial<PlaybookFilter>) => {
    const nextFilters = { ...get().filters, ...filters };
    set({ filters: nextFilters });
    void get().fetchPlaybooks();
  },
}));
