import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useIndustryConfig, useTerminology } from '../../../app/providers';

/**
 * Storyboard Page (分镜页面)
 * For short-drama industry: Storyboard management and visualization
 */
export function StoryboardPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  _config = useIndustryConfig();
  const terms = useTerminology();
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="分镜板"
        subtitle={`${terms.workspace}: ${workspaceId}`}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Scene list */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">场景列表</h3>
            <div className="space-y-2">
              {['场景1：开场', '场景2：对话', '场景3：动作', '场景4：转折', '场景5：结尾'].map((scene, i) => (
                <div key={i} className="p-2 rounded hover:bg-accent/50 cursor-pointer text-sm">
                  {scene}
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">过滤</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span>室内场景</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span>室外场景</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>特效场景</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Main content: Storyboard grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">分镜预览</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm border rounded hover:bg-accent/50">
                网格视图
              </button>
              <button className="px-3 py-1.5 text-sm border rounded hover:bg-accent/50">
                时间轴视图
              </button>
            </div>
          </div>
          
          {/* Storyboard grid placeholder */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-lg border bg-card p-4 flex flex-col">
                <div className="flex-1 bg-muted rounded flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">分镜 {i + 1}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  镜头类型: 特写
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick actions */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">快捷操作</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                上传分镜
              </button>
              <button className="px-4 py-2 border rounded hover:bg-accent/50">
                批量编辑
              </button>
              <button className="px-4 py-2 border rounded hover:bg-accent/50">
                导出PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryboardPage;
