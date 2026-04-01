export interface Playbook {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  specDocument: string;
  publishable?: boolean;
  teamSpecId?: string;
  workflow?: WorkflowDefinition;
}

export interface WorkflowDefinition {
  steps: WorkflowStep[];
  variables: Record<string, unknown>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'routine' | 'tool' | 'approval' | 'parallel_role_group' | 'merge';
  config: Record<string, unknown>;
  nextSteps: string[];
}

export interface PlaybookFilter {
  status?: Playbook['status'];
  search?: string;
  sortBy?: 'name' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PlaybookStore {
  playbooks: Playbook[];
  selectedPlaybook: Playbook | null;
  filters: PlaybookFilter;
  isLoading: boolean;
  error: string | null;
  fetchPlaybooks: () => Promise<void>;
  fetchPlaybookById: (id: string) => Promise<Playbook | null>;
  createPlaybook: (data: Partial<Playbook>) => Promise<Playbook>;
  updatePlaybook: (id: string, data: Partial<Playbook>) => Promise<Playbook>;
  savePlaybookDraft: (id: string, specDocument: string) => Promise<Playbook>;
  publishPlaybook: (id: string) => Promise<Playbook>;
  deletePlaybook: (id: string) => Promise<void>;
  selectPlaybook: (playbook: Playbook | null) => void;
  setFilters: (filters: Partial<PlaybookFilter>) => void;
}
