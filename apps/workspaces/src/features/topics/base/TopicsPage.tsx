import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useTerminology } from '../../../app/providers/index';

export function TopicsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const terms = useTerminology();
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Topics"
        subtitle={`${terms.workspace}: ${workspaceId}`}
      />
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Topics management is not available for this industry.
        </p>
      </div>
    </div>
  );
}

export default TopicsPage;
