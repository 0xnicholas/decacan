import React from 'react';
import { useIndustryConfig, useTerminology } from '../../../app/providers';
import { PageHeader } from '../../../shared/ui/PageHeader';

interface WorkspaceHomePageProps {
  workspaceId: string;
}

/**
 * Short Drama industry-specific workspace home page
 * Features: 剧本 (Script), 分镜 (Storyboard), 美术 (Art), 制作进度 (Production Progress)
 */
export function WorkspaceHomePage({ workspaceId }: WorkspaceHomePageProps) {
  const config = useIndustryConfig();
  const terms = useTerminology();
  
  return (
    <div className="space-y-6">
      {/* Project header with drama-specific info */}
      <PageHeader
        title={`${terms.workspace}: ${workspaceId}`}
        subtitle={`${terms.workspace}概览 - 短剧制作`}
      />
      
      {/* Drama-specific layout: Focus on script, storyboard, art, progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content: Production tasks grouped by category */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                制作任务
              </h2>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">剧本</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">分镜</span>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-sm">美术</span>
              </div>
            </div>
            <p className="text-muted-foreground">
              按类别分组的制作任务：剧本创作、分镜绘制、美术设计
            </p>
            {/* TODO: Implement ProductionTaskList with grouping */}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4 text-blue-600">
                剧本编辑器
              </h2>
              <p className="text-muted-foreground">
                管理和编辑剧本内容，支持版本控制
              </p>
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4 text-purple-600">
                分镜板
              </h2>
              <p className="text-muted-foreground">
                可视化分镜管理，支持拖拽排序
              </p>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4 text-amber-600">
              美术资源库
            </h2>
            <p className="text-muted-foreground">
              角色设计、场景概念、道具参考等美术资源
            </p>
          </div>
        </div>
        
        {/* Sidebar: Progress and assets */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6 border-l-4 border-l-blue-500">
            <h2 className="text-lg font-semibold mb-4">
              制作进度
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>剧本</span>
                  <span className="text-blue-600">80%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-blue-500 rounded" style={{ width: '80%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>分镜</span>
                  <span className="text-purple-600">60%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-purple-500 rounded" style={{ width: '60%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>美术</span>
                  <span className="text-amber-600">40%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-amber-500 rounded" style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              素材库
            </h2>
            <p className="text-muted-foreground">
              最近上传的素材文件
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              {terms.members}
            </h2>
            <p className="text-muted-foreground">
              项目组成员及分工
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              {terms.assistant}
            </h2>
            <p className="text-muted-foreground">
              AI辅助剧本分析、分镜建议
            </p>
          </div>
        </div>
      </div>
      
      {/* Debug info */}
      <div className="mt-8 p-4 rounded bg-muted text-sm">
        <p className="font-semibold">调试信息：</p>
        <p>行业: {config.id}</p>
        <p>主题主色: {config.theme.primary}</p>
        <p>项目组ID: {workspaceId}</p>
      </div>
    </div>
  );
}

export default WorkspaceHomePage;