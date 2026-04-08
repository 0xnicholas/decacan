import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useIndustryConfig, useTerminology } from '../../../app/providers';

/**
 * Schedule Page (排期页面)
 * For short-video industry: Publishing schedule management
 */
export function SchedulePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  _config = useIndustryConfig();
  const terms = useTerminology();
  
  const scheduledItems = [
    { title: '职场干货：高效沟通', platform: '抖音', time: '今天 12:00', status: 'scheduled' },
    { title: '省钱攻略第一期', platform: '快手', time: '今天 18:00', status: 'scheduled' },
    { title: '美食探店Vlog', platform: 'B站', time: '明天 20:00', status: 'draft' },
    { title: '情感故事分享', platform: '抖音', time: '后天 19:00', status: 'draft' },
  ];
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="发布排期"
        subtitle={`${terms.workspace}: ${workspaceId}`}
      />
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">
            日视图
          </button>
          <button className="px-4 py-2 border rounded text-sm hover:bg-accent/50">
            周视图
          </button>
          <button className="px-4 py-2 border rounded text-sm hover:bg-accent/50">
            月视图
          </button>
        </div>
        <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90">
          新建排期
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content: Calendar/Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">本周排期</h2>
            <div className="space-y-3">
              {scheduledItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50">
                  <div className="w-16 h-16 bg-muted rounded flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      {item.time.split(' ')[0]}
                    </span>
                    <span className="text-lg font-bold">
                      {item.time.split(' ')[1]?.split(':')[0] || '--'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{item.platform}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        item.status === 'scheduled' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status === 'scheduled' ? '已排期' : '草稿'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-accent rounded">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">排期统计</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">本周已排</span>
                <span className="font-medium">8期</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">待发布</span>
                <span className="font-medium">4期</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">草稿</span>
                <span className="font-medium">6期</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">平台分布</h3>
            <div className="space-y-3">
              {[
                { name: '抖音', count: 12, color: 'bg-pink-500' },
                { name: '快手', count: 8, color: 'bg-purple-500' },
                { name: 'B站', count: 5, color: 'bg-blue-500' },
              ].map((platform) => (
                <div key={platform.name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{platform.name}</span>
                      <span className="font-medium">{platform.count}</span>
                    </div>
                    <div className="h-1 bg-muted rounded mt-1">
                      <div 
                        className={`h-1 ${platform.color} rounded`} 
                        style={{ width: `${(platform.count / 15) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">快捷操作</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 border rounded hover:bg-accent/50 text-sm text-left">
                批量排期
              </button>
              <button className="w-full px-4 py-2 border rounded hover:bg-accent/50 text-sm text-left">
                复制上周排期
              </button>
              <button className="w-full px-4 py-2 border rounded hover:bg-accent/50 text-sm text-left">
                导出排期表
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;
