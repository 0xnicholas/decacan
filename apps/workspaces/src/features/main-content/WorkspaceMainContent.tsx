import { useIndustryConfig, useTerminology } from '../../../app/providers/index';
import { PageHeader } from '../../../shared/ui/PageHeader';

interface WorkspaceMainContentProps {
  workspaceId: string;
}

export function WorkspaceMainContent({ workspaceId }: WorkspaceMainContentProps) {
  const config = useIndustryConfig();
  const terms = useTerminology();

  const isDrama = config.id === 'short-drama';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${terms.workspace}: ${workspaceId}`}
        subtitle={isDrama ? `${terms.workspace}概览 - 短剧制作` : `${terms.workspace}概览 - 内容创作`}
      />
      
      {/* Task section */}
      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {terms.tasks}
            </h2>
            <div className="flex gap-2">
              {isDrama ? (
                <>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">剧本</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">分镜</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-sm">美术</span>
                </>
              ) : (
                <>
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-sm">选题</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">脚本</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm">剪辑</span>
                </>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            {isDrama 
              ? '按类别分组的制作任务：剧本创作、分镜绘制、美术设计'
              : '按类别分组的创作任务：选题策划、脚本编写、视频剪辑'}
          </p>
        </div>
        
        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isDrama ? (
            <>
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
            </>
          ) : (
            <>
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4 text-pink-600">
                  选题库
                </h2>
                <p className="text-muted-foreground">
                  管理内容选题，支持热点追踪
                </p>
              </div>
              
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4 text-purple-600">
                  脚本编辑器
                </h2>
                <p className="text-muted-foreground">
                  在线编辑脚本，智能推荐优化
                </p>
              </div>
            </>
          )}
        </div>
        
        {isDrama && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4 text-amber-600">
              美术资源库
            </h2>
            <p className="text-muted-foreground">
              角色设计、场景概念、道具参考等美术资源
            </p>
          </div>
        )}
        
        {!isDrama && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4 text-orange-600">
              数据分析
            </h2>
            <p className="text-muted-foreground">
              播放量趋势、受众画像、热门内容分析
            </p>
          </div>
        )}
      </div>
      
      {/* Debug info */}
      <div className="mt-8 p-4 rounded bg-muted text-sm">
        <p className="font-semibold">调试信息：</p>
        <p>行业: {config.id}</p>
        <p>主题主色: {config.theme.primary}</p>
        <p>{terms.workspace}ID: {workspaceId}</p>
      </div>
    </div>
  );
}

export default WorkspaceMainContent;
