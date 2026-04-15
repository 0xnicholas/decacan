import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useTerminology } from '../../../app/providers/index';

export function TopicsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const terms = useTerminology();
  
  const topics = [
    { title: '甜宠逆袭题材', status: 'approved', type: 'IP改编' },
    { title: '都市职场剧', status: 'pending', type: '原创剧本' },
    { title: '古装复仇爽剧', status: 'draft', type: 'IP改编' },
  ];
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="剧本选题"
        subtitle={`${terms.workspace}: ${workspaceId}`}
      />
      
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">IP选题库</h2>
        <div className="space-y-3">
          {topics.map((topic, i) => (
            <div key={i} className="p-4 rounded-lg border hover:bg-accent/50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{topic.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    类型: {topic.type} | 状态: {topic.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TopicsPage;
