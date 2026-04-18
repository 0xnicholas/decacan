import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useTerminology, useWorkflowMode } from '../../../app/providers/index';

/**
 * Script Page - workflow-aware component
 * Shows different terminology based on workflow mode:
 * - 'content' (short-video): 口播稿管理, 口播稿列表
 * - 'production' (short-drama): 剧本管理, 剧本列表
 */
export function ScriptPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const terms = useTerminology();
  const workflowMode = useWorkflowMode();

  const isContentMode = workflowMode === 'content';
  const pageTitle = isContentMode ? '口播稿管理' : '剧本管理';
  const listTitle = isContentMode ? '口播稿列表' : '剧本列表';
  const createLabel = isContentMode ? '新建口播稿' : '新建剧本';
  const description = isContentMode
    ? '管理和编辑短视频口播稿，支持文案优化和时长预估'
    : '管理和编辑短剧剧本，支持分镜对接和制作流程';
  const statusLabel = isContentMode ? '待拍摄' : '待制作';

  const sampleScripts = isContentMode
    ? ['职场沟通技巧要点', '省钱小妙招文案', '美食探店开场白', '情感共鸣话题']
    : ['第一集剧本', '第二集剧本', '第三集剧本', '第四集剧本'];

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        subtitle={`${terms.workspace}: ${workspaceId}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content: Script list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{listTitle}</h2>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                {createLabel}
              </button>
            </div>
            <p className="text-muted-foreground">
              {description}
            </p>

            {/* Placeholder for script list */}
            <div className="mt-4 space-y-3">
              {sampleScripts.map((title, i) => (
                <div key={i} className="p-4 rounded-lg border hover:bg-accent/50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{title}</span>
                    <span className="text-sm text-muted-foreground">{statusLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">{isContentMode ? '口播稿统计' : '剧本统计'}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">总数量</span>
                <span className="font-medium">32个</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">已完成</span>
                <span className="font-medium">20个</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">审核中</span>
                <span className="font-medium">8个</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">待修改</span>
                <span className="font-medium">4个</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">AI 助手</h3>
            <p className="text-sm text-muted-foreground">
              {isContentMode
                ? '智能文案优化、标题建议、热点追踪'
                : '剧本分析、分镜建议、制作指导'}
            </p>
            <button className="mt-3 w-full px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90">
              获取建议
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScriptPage;
