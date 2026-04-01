import { create } from 'zustand';
import { PlaybookStore, Playbook } from '../types/playbook.types';

export const usePlaybookStore = create<PlaybookStore>((set, get) => ({
  playbooks: [],
  selectedPlaybook: null,
  isLoading: false,
  error: null,

  fetchPlaybooks: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/playbooks');
      // const data = await response.json();
      // set({ playbooks: data, isLoading: false });
      
      // Mock data for now
      set({ 
        playbooks: [],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch playbooks',
        isLoading: false 
      });
    }
  },

  fetchPlaybookById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/playbooks/${id}`);
      // const data = await response.json();
      // set({ selectedPlaybook: data, isLoading: false });
      // return data;
      
      // Mock data for now
      const mockPlaybook: Playbook = {
        id,
        name: 'Sample Playbook',
        description: 'A sample playbook for testing',
        version: '1.0.0',
        status: 'draft',
        workflow: {
          steps: [
            {
              id: 'step-1',
              name: 'Initial Step',
              type: 'routine',
              config: { capability: 'scan_files' },
              nextSteps: ['step-2']
            },
            {
              id: 'step-2',
              name: 'Process Results',
              type: 'routine',
              config: { capability: 'generate_summary' },
              nextSteps: []
            }
          ]
        }
      };
      set({ selectedPlaybook: mockPlaybook, isLoading: false });
      return mockPlaybook;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch playbook',
        isLoading: false 
      });
      return null;
    }
  },

  createPlaybook: async (data: Partial<Playbook>) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/playbooks', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const newPlaybook = await response.json();
      
      // Mock data for now
      const newPlaybook: Playbook = {
        id: `playbook-${Date.now()}`,
        name: data.name || 'New Playbook',
        description: data.description || '',
        version: '0.1.0',
        status: 'draft',
        ...data
      };
      
      set(state => ({ 
        playbooks: [...state.playbooks, newPlaybook],
        isLoading: false 
      }));
      return newPlaybook;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create playbook',
        isLoading: false 
      });
      throw error;
    }
  },

  updatePlaybook: async (id: string, data: Partial<Playbook>) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/playbooks/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const updatedPlaybook = await response.json();
      
      // Mock update for now
      const updatedPlaybook: Playbook = {
        ...get().selectedPlaybook,
        id,
        ...data
      } as Playbook;
      
      set(state => ({ 
        playbooks: state.playbooks.map(p => p.id === id ? updatedPlaybook : p),
        selectedPlaybook: updatedPlaybook,
        isLoading: false 
      }));
      return updatedPlaybook;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update playbook',
        isLoading: false 
      });
      throw error;
    }
  },

  deletePlaybook: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/playbooks/${id}`, { method: 'DELETE' });
      
      set(state => ({ 
        playbooks: state.playbooks.filter(p => p.id !== id),
        selectedPlaybook: state.selectedPlaybook?.id === id ? null : state.selectedPlaybook,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete playbook',
        isLoading: false 
      });
      throw error;
    }
  },

  selectPlaybook: (playbook: Playbook | null) => {
    set({ selectedPlaybook: playbook });
  }
}));
