import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Play, Eye, AlertCircle } from 'lucide-react';
import { YamlEditor } from './YamlEditor';
import { VisualPreview } from './VisualPreview';
import { Playbook } from '../types/playbook.types';
import { usePlaybookStore } from '../stores/playbookStore';

interface PlaybookEditorProps {
  playbookId?: string;
  isCreating?: boolean;
}

export function PlaybookEditor({ playbookId, isCreating }: PlaybookEditorProps) {
  const { selectedPlaybook, fetchPlaybooks, updatePlaybook, createPlaybook } = usePlaybookStore();
  const [yamlContent, setYamlContent] = useState('');
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (playbookId) {
      fetchPlaybooks();
    } else if (isCreating) {
      // Initialize with template for new playbook
      setYamlContent(getPlaybookTemplate());
    }
  }, [playbookId, isCreating, fetchPlaybooks]);

  useEffect(() => {
    if (selectedPlaybook && !isCreating) {
      // Convert playbook to YAML format
      setYamlContent(playbookToYaml(selectedPlaybook));
    }
  }, [selectedPlaybook, isCreating]);

  const handleValidate = useCallback((errors: any[]) => {
    setValidationErrors(errors);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Parse YAML and save
      // For now, just save as string content
      if (isCreating) {
        await createPlaybook({
          name: 'New Playbook',
          description: 'Created from editor'
        });
      } else if (playbookId) {
        await updatePlaybook(playbookId, {
          // Parse YAML and update fields
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const hasErrors = validationErrors.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">
            {isCreating ? 'Create Playbook' : 'Edit Playbook'}
          </h2>
          {hasErrors && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {validationErrors.length} errors
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || hasErrors}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="yaml" className="w-full">
        <TabsList>
          <TabsTrigger value="yaml" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            YAML Editor
            {hasErrors && <span className="ml-1 text-red-500">●</span>}
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Visual Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="yaml" className="mt-4">
          <YamlEditor
            value={yamlContent}
            onChange={setYamlContent}
            onValidate={handleValidate}
            height="600px"
          />
        </TabsContent>

        <TabsContent value="visual" className="mt-4">
          <VisualPreview playbook={selectedPlaybook} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getPlaybookTemplate(): string {
  return `# Playbook Configuration
name: New Playbook
description: Describe your playbook here
version: 0.1.0

# Workflow definition
workflow:
  steps:
    - id: step-1
      name: Initial Step
      type: routine
      config:
        capability: scan_files
      nextSteps:
        - step-2
    
    - id: step-2
      name: Process Results
      type: routine
      config:
        capability: generate_summary
      nextSteps: []

# Team configuration (optional)
teamSpecId: research-team

# Variables
variables:
  input_path: ./docs
  output_format: markdown
`;
}

function playbookToYaml(playbook: Playbook): string {
  // Simple conversion - in production, use a proper YAML library
  return `# Playbook: ${playbook.name}
# Version: ${playbook.version}
# Status: ${playbook.status}

name: ${playbook.name}
description: ${playbook.description}
version: ${playbook.version}

${playbook.workflow ? 'workflow:\n  steps:\n' + playbook.workflow.steps.map(s => `    - id: ${s.id}\n      name: ${s.name}\n      type: ${s.type}`).join('\n') : '# No workflow defined'}

${playbook.teamSpecId ? `teamSpecId: ${playbook.teamSpecId}` : '# teamSpecId: ~'}
`;
}
