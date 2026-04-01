import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Playbook } from '../types/playbook.types';
import { GitBranch, Play, CheckCircle, AlertCircle } from 'lucide-react';

interface VisualPreviewProps {
  playbook: Playbook | null;
}

export function VisualPreview({ playbook }: VisualPreviewProps) {
  if (!playbook) {
    return (
      <Card className="p-6 flex items-center justify-center h-[600px]">
        <p className="text-muted-foreground">
          Select a playbook to see visual preview
        </p>
      </Card>
    );
  }

  // Basic workflow visualization
  // TODO: Implement ReactFlow integration for complex workflows
  return (
    <Card className="p-6 h-[600px] overflow-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">{playbook.name}</h3>
          <p className="text-muted-foreground">{playbook.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={playbook.status === 'published' ? 'default' : 'secondary'}>
            {playbook.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Version:</span>
          <span className="font-mono">{playbook.version}</span>
        </div>

        {playbook.workflow && (
          <div className="mt-6">
            <h4 className="font-medium mb-4">Workflow Steps</h4>
            <div className="space-y-3">
              {playbook.workflow.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{step.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Type: {step.type}
                    </div>
                  </div>
                  <div>
                    {getStepIcon(step.type)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!playbook.workflow && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground">
              No workflow defined yet. Edit the playbook YAML to add workflow steps.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function getStepIcon(type: string) {
  switch (type) {
    case 'routine':
      return <Play className="w-5 h-5 text-blue-500" />;
    case 'approval':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case 'parallel_role_group':
      return <GitBranch className="w-5 h-5 text-purple-500" />;
    case 'merge':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    default:
      return <Play className="w-5 h-5 text-gray-500" />;
  }
}
