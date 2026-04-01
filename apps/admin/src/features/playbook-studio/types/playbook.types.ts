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
