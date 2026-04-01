import { Playbook, PlaybookFilter } from '../types/playbook.types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const API_BASE = '/api/v1';

// Mock data for development (remove when API is ready)
const mockPlaybooks: Playbook[] = [
  {
    id: '1',
    name: 'Code Review Assistant',
    description: 'Automated code review with AI suggestions',
    version: '1.0.0',
    status: 'published',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
    author: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    teamSpecId: 'research-team'
  },
  {
    id: '2',
    name: 'Documentation Generator',
    description: 'Generate API documentation from code',
    version: '0.5.0',
    status: 'draft',
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2024-03-10T09:00:00Z',
    author: {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com'
    }
  },
  {
    id: '3',
    name: 'Test Suite Runner',
    description: 'Run comprehensive test suites with reporting',
    version: '2.1.0',
    status: 'published',
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-03-15T16:45:00Z',
    author: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    teamSpecId: 'research-team'
  }
];

export const playbookApi = {
  async listPlaybooks(filters?: PlaybookFilter): Promise<Playbook[]> {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE}/playbooks?${new URLSearchParams(filters)}`);
    // return response.json();
    
    // Mock implementation
    let result = [...mockPlaybooks];
    
    if (filters?.status) {
      result = result.filter(p => p.status === filters.status);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }
    
    if (filters?.sortBy) {
      result.sort((a, b) => {
        const aVal = a[filters.sortBy!];
        const bVal = b[filters.sortBy!];
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        return aVal > bVal ? order : -order;
      });
    }
    
    return Promise.resolve(result);
  },

  async getPlaybook(id: string): Promise<Playbook> {
    // TODO: Replace with actual API call
    const playbook = mockPlaybooks.find(p => p.id === id);
    if (!playbook) throw new Error('Playbook not found');
    return Promise.resolve(playbook);
  },

  async createPlaybook(data: Partial<Playbook>): Promise<Playbook> {
    // TODO: Replace with actual API call
    const newPlaybook: Playbook = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'New Playbook',
      description: data.description || '',
      version: '0.1.0',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: 'current-user',
        name: 'Current User',
        email: 'user@example.com'
      }
    };
    mockPlaybooks.push(newPlaybook);
    return Promise.resolve(newPlaybook);
  },

  async updatePlaybook(id: string, data: Partial<Playbook>): Promise<Playbook> {
    // TODO: Replace with actual API call
    const index = mockPlaybooks.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Playbook not found');
    
    mockPlaybooks[index] = {
      ...mockPlaybooks[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return Promise.resolve(mockPlaybooks[index]);
  },

  async deletePlaybook(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const index = mockPlaybooks.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPlaybooks.splice(index, 1);
    }
    return Promise.resolve();
  },

  async publishPlaybook(id: string): Promise<Playbook> {
    return this.updatePlaybook(id, { status: 'published' });
  }
};
