import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useTerminology } from '../../../app/providers/index';

/**
 * Script Page (剧本页面)
 * For short-drama industry: Script management and editing
 */
export function ScriptPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const terms = useTerminology();
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="剧本管理"
        subtitle={`${terms.workspace}: ${workspaceId}`}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content: Script list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">剧本列表</h2>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                新建剧本
              </button>
            </div>
            <p className="text-muted-foreground">
              管理和编辑短剧剧本，支持版本控制和协作编辑
            </p>
            
            {/* Placeholder for script list */}
            <div className="mt-4 space-y-3">
              {['第一集：开场', '第二集：冲突', '第三集：转折', '第四集：高潮'].map((title, i) => (
                <div key={i} className="p-4 rounded-lg border hover:bg-accent/50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{title}</span>
                    <span className="text-sm text-muted-foreground">待审核</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">剧本统计</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">总集数</span>
                <span className="font-medium">24集</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">已完成</span>
                <span className="font-medium">18集</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">审核中</span>
                <span className="font-medium">4集</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">待修改</span>
                <span className="font-medium">2集</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">AI 助手</h3>
            <p className="text-sm text-muted-foreground">
              智能剧本分析、情节建议、对白优化
            </p>
            <button className="mt-3 w-full px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90">
              开始分析
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScriptPage;
