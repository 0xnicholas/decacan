import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useTerminology, useWorkflowMode } from '../../../app/providers/index';

/**
 * Topics Page - workflow-aware component
 * Shows different content based on workflow mode:
 * - 'content' (short-video): Content topic management with trending
 * - 'production' (short-drama): IP/script topic management
 */
export function TopicsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const terms = useTerminology();
  const workflowMode = useWorkflowMode();

  const isContentMode = workflowMode === 'content';

  const topics = isContentMode
    ? [
        { title: '职场干货：如何高效沟通', status: 'approved', views: '10W+', trend: 'up' },
        { title: '生活技巧：省钱小妙招', status: 'pending', views: '-', trend: 'neutral' },
        { title: '美食探店：隐藏版餐厅', status: 'filming', views: '-', trend: 'up' },
        { title: '情感分享：异地恋经历', status: 'draft', views: '-', trend: 'up' },
      ]
    : [
        { title: 'IP改编：热门小说选题', status: 'approved', views: '-', trend: 'up' },
        { title: '原创剧本：都市情感', status: 'pending', views: '-', trend: 'neutral' },
        { title: 'IP改编：悬疑推理剧本', status: 'scripting', views: '-', trend: 'up' },
        { title: '原创剧本：古装历史', status: 'draft', views: '-', trend: 'up' },
      ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isContentMode ? '选题库' : '剧本选题'}
        subtitle={`${terms.workspace}: ${workspaceId}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content: Topic list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">
                全部选题
              </button>
              <button className="px-4 py-2 border rounded text-sm hover:bg-accent/50">
                待审核
              </button>
              <button className="px-4 py-2 border rounded text-sm hover:bg-accent/50">
                已通过
              </button>
              {isContentMode && (
                <button className="px-4 py-2 border rounded text-sm hover:bg-accent/50">
                  拍摄中
                </button>
              )}
              {!isContentMode && (
                <button className="px-4 py-2 border rounded text-sm hover:bg-accent/50">
                  剧本中
                </button>
              )}
            </div>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90">
              新建选题
            </button>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">选题列表</h2>
            <div className="space-y-3">
              {topics.map((topic, i) => (
                <div key={i} className="p-4 rounded-lg border hover:bg-accent/50 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{topic.title}</div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>状态: {topic.status}</span>
                        {isContentMode && <span>预估播放: {topic.views}</span>}
                        <span>趋势: {topic.trend === 'up' ? '↑' : topic.trend === 'down' ? '↓' : '→'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-accent rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">选题统计</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">总选题</span>
                <span className="font-medium">48</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">本月新增</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">待审核</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">转化率</span>
                <span className="font-medium">68%</span>
              </div>
            </div>
          </div>

          {isContentMode && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-3">热点追踪</h3>
              <div className="space-y-2">
                {['#职场干货', '#省钱攻略', '#美食探店', '#情感共鸣'].map((tag, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{tag}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">热门</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isContentMode && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-3">IP 改编</h3>
              <div className="space-y-2">
                {['小说改编', '漫画改编', '原创剧本'].map((type, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{type}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">可用</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">AI 助手</h3>
            <p className="text-sm text-muted-foreground">
              {isContentMode
                ? '智能选题推荐、热点分析、标题优化'
                : '剧本分析、改编建议、剧情设计'}
            </p>
            <button className="mt-3 w-full px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90">
              获取推荐
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicsPage;
