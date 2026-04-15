import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useTerminology } from '../../../app/providers/index';

export function StoryboardPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const terms = useTerminology();
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="镜头规划"
        subtitle={`${terms.workspace}: ${workspaceId}`}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">镜头列表</h3>
            <div className="space-y-2">
              {['开场镜头', '产品展示', '口播镜头', '结尾引导'].map((scene, i) => (
                <div key={i} className="p-2 rounded hover:bg-accent/50 cursor-pointer text-sm">
                  {scene}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">镜头脚本预览</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-lg border bg-card p-4 flex flex-col">
                <div className="flex-1 bg-muted rounded flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">镜头 {i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryboardPage;
