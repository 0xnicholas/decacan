import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useTerminology } from '../../../app/providers/index';

export function AnalyticsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const terms = useTerminology();
  
  const metrics = [
    { label: '总播放量', value: '12.5M' },
    { label: '完播率', value: '45%' },
    { label: '集均播放', value: '520K' },
    { label: '充值转化', value: '3.2%' },
  ];
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="数据分析"
        subtitle={`${terms.workspace}: ${workspaceId}`}
      />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">{metric.label}</div>
            <div className="text-2xl font-bold mt-1">{metric.value}</div>
          </div>
        ))}
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">短剧播放量、完播率、充值转化等数据分析</p>
      </div>
    </div>
  );
}

export default AnalyticsPage;
