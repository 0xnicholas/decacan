import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useTerminology } from '../../../app/providers/index';

export function ArtResourcesPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const terms = useTerminology();
  
  const categories = [
    { name: '封面模板', count: 24 },
    { name: '字幕样式', count: 16 },
    { name: '滤镜预设', count: 32 },
    { name: '贴纸素材', count: 48 },
  ];
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="视觉素材库"
        subtitle={`${terms.workspace}: ${workspaceId}`}
      />
      
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button key={cat.name} className="px-4 py-2 border rounded-full text-sm hover:bg-accent/50">
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">封面、字幕、滤镜等视觉素材管理</p>
      </div>
    </div>
  );
}

export default ArtResourcesPage;
