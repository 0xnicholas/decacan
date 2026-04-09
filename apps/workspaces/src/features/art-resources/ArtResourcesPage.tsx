import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../shared/ui/PageHeader';
import { useTerminology } from '../../app/providers/index';

/**
 * Art Resources Page (美术资源页面)
 * For short-drama industry: Art asset management
 */
export function ArtResourcesPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const terms = useTerminology();
  
  const categories = [
    { name: '角色设计', count: 12, color: 'bg-blue-100 text-blue-700' },
    { name: '场景概念', count: 8, color: 'bg-green-100 text-green-700' },
    { name: '道具参考', count: 24, color: 'bg-amber-100 text-amber-700' },
    { name: '服装设计', count: 16, color: 'bg-purple-100 text-purple-700' },
    { name: '特效参考', count: 6, color: 'bg-pink-100 text-pink-700' },
  ];
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="美术资源库"
        subtitle={`${terms.workspace}: ${workspaceId}`}
      />
      
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm">
          全部
        </button>
        {categories.map((cat) => (
          <button key={cat.name} className="px-4 py-2 border rounded-full text-sm hover:bg-accent/50">
            {cat.name}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content: Asset gallery */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">资源列表</h2>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="搜索资源..."
                className="px-3 py-1.5 border rounded text-sm"
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                上传资源
              </button>
            </div>
          </div>
          
          {/* Asset grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => {
              const category = categories[i % categories.length];
              return (
                <div key={i} className="aspect-square rounded-lg border bg-card overflow-hidden group cursor-pointer">
                  <div className="h-3/4 bg-muted flex items-center justify-center relative">
                    <span className="text-muted-foreground text-sm">资源预览 {i + 1}</span>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 bg-white rounded shadow">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="h-1/4 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">资源 {i + 1}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${category.color}`}>
                        {category.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Sidebar: Stats and info */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">资源统计</h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{cat.name}</span>
                  <span className="font-medium">{cat.count}</span>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">总计</span>
                  <span className="font-semibold">
                    {categories.reduce((sum, cat) => sum + cat.count, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">最近上传</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded" />
                <div>
                  <div className="font-medium">主角设计稿</div>
                  <div className="text-xs text-muted-foreground">2小时前</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded" />
                <div>
                  <div className="font-medium">场景概念图</div>
                  <div className="text-xs text-muted-foreground">5小时前</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtResourcesPage;
