import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useTerminology } from '../../../app/providers/index';

export function SchedulePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const terms = useTerminology();
  
  const phases = [
    { name: '前期筹备', items: ['剧本定稿', '演员签约', '场景勘景'] },
    { name: '拍摄制作', items: ['室内拍摄', '外景拍摄', '补拍'] },
    { name: '后期制作', items: ['剪辑', '调色', '音效'] },
    { name: '上线发布', items: ['平台审核', '定档', '首播'] },
  ];
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="制作排期"
        subtitle={`${terms.workspace}: ${workspaceId}`}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {phases.map((phase) => (
          <div key={phase.name} className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">{phase.name}</h3>
            <div className="space-y-2">
              {phase.items.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SchedulePage;
