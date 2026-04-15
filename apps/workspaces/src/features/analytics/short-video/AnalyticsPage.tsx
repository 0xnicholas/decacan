import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useTerminology } from '../../../app/providers';

/**
 * Analytics Page (数据分析页面)
 * For short-video industry: Performance analytics and insights
 */
export function AnalyticsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const terms = useTerminology();
  
  const metrics = [
    { label: '总播放量', value: '2.4M', change: '+12%', positive: true },
    { label: '点赞数', value: '156K', change: '+8%', positive: true },
    { label: '评论数', value: '24K', change: '-3%', positive: false },
    { label: '分享数', value: '18K', change: '+15%', positive: true },
  ];
  
  const topContent = [
    { title: '爆款视频：职场沟通技巧', views: '500K', engagement: '8.5%' },
    { title: '热门：省钱小妙招合集', views: '320K', engagement: '7.2%' },
    { title: '推荐：美食探店Vlog', views: '280K', engagement: '6.8%' },
    { title: '分享：情感故事', views: '190K', engagement: '5.9%' },
  ];
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="数据分析"
        subtitle={`${terms.workspace}: ${workspaceId}`}
      />
      
      {/* Metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">{metric.label}</div>
            <div className="text-2xl font-bold mt-1">{metric.value}</div>
            <div className={`text-sm mt-1 ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
              {metric.change} vs 上周
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content: Charts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">播放量趋势</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm border rounded hover:bg-accent/50">7天</button>
                <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded">30天</button>
                <button className="px-3 py-1 text-sm border rounded hover:bg-accent/50">90天</button>
              </div>
            </div>
            {/* Chart placeholder */}
            <div className="h-64 bg-muted rounded flex items-center justify-center">
              <span className="text-muted-foreground">播放量趋势图表</span>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">受众分析</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-48 bg-muted rounded flex items-center justify-center">
                <span className="text-muted-foreground">年龄分布</span>
              </div>
              <div className="h-48 bg-muted rounded flex items-center justify-center">
                <span className="text-muted-foreground">地域分布</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">热门内容</h3>
            <div className="space-y-3">
              {topContent.map((content, i) => (
                <div key={i} className="p-3 rounded hover:bg-accent/50">
                  <div className="font-medium text-sm">{content.title}</div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>播放: {content.views}</span>
                    <span>互动: {content.engagement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">发布时段分析</h3>
            <div className="h-32 bg-muted rounded flex items-center justify-center">
              <span className="text-muted-foreground">最佳发布时段</span>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              建议发布时段: 12:00-13:00, 18:00-20:00
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">数据导出</h3>
            <button className="w-full px-4 py-2 border rounded hover:bg-accent/50 text-sm">
              导出报告
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
