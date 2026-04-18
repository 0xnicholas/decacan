import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useTerminology, useWorkflowMode } from '../../../app/providers/index';

/**
 * Art Resources Page - workflow-aware component
 * Shows different categories based on workflow mode:
 * - 'content' (short-video): 视觉素材库 - templates, subtitles, filters, stickers
 * - 'production' (short-drama): 美术资源库 - character designs, scenes, props, costumes
 */
export function ArtResourcesPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const terms = useTerminology();
  const workflowMode = useWorkflowMode();

  const isContentMode = workflowMode === 'content';

  const categories = isContentMode
    ? [
        { name: '封面模板', count: 24 },
        { name: '字幕样式', count: 16 },
        { name: '滤镜预设', count: 32 },
        { name: '贴纸素材', count: 48 },
      ]
    : [
        { name: '角色设计', count: 18 },
        { name: '场景概念', count: 12 },
        { name: '道具参考', count: 36 },
        { name: '服装设计', count: 24 },
        { name: '特效参考', count: 15 },
      ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isContentMode ? '视觉素材库' : '美术资源库'}
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
        <p className="text-muted-foreground">
          {isContentMode
            ? '封面、字幕、滤镜等视觉素材管理'
            : '角色设计、场景概念、道具参考等美术资源管理'}
        </p>
      </div>
    </div>
  );
}

export default ArtResourcesPage;
