import { useIndustryConfig, useTerminology } from '../../app/providers/index';

interface ProgressItem {
  label: string;
  percentage: number;
  color: string;
}

const DRAMA_PROGRESS: ProgressItem[] = [
  { label: '剧本', percentage: 80, color: 'bg-blue-500' },
  { label: '分镜', percentage: 60, color: 'bg-purple-500' },
  { label: '美术', percentage: 40, color: 'bg-amber-500' },
];

const VIDEO_PROGRESS: ProgressItem[] = [
  { label: '选题', percentage: 90, color: 'bg-pink-500' },
  { label: '脚本', percentage: 70, color: 'bg-purple-500' },
  { label: '剪辑', percentage: 30, color: 'bg-orange-500' },
];

interface WorkspaceInfoPanelProps {
  workspaceId: string;
}

export function WorkspaceInfoPanel(_props: WorkspaceInfoPanelProps) {
  const config = useIndustryConfig();
  const terms = useTerminology();

  const isDrama = config.id === 'short-drama';
  const progressItems = isDrama ? DRAMA_PROGRESS : VIDEO_PROGRESS;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Progress/Analytics Card */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-semibold mb-3">
          {isDrama ? '制作进度' : '数据概览'}
        </h3>
        <div className="space-y-3">
          {progressItems.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={item.color.replace('bg-', 'text-')}>{item.percentage}%</span>
              </div>
              <div className="h-2 bg-muted rounded">
                <div 
                  className={`h-2 ${item.color} rounded`} 
                  style={{ width: `${item.percentage}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
        {!isDrama && (
          <div className="mt-4 pt-4 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">总播放</span>
              <span className="font-medium">2.4M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">互动率</span>
              <span className="font-medium">8.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">涨粉</span>
              <span className="font-medium text-green-600">+1.2K</span>
            </div>
          </div>
        )}
      </div>

      {/* Assets/Materials Card */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-semibold mb-3">
          {isDrama ? '素材库' : '发布排期'}
        </h3>
        <div className="space-y-2">
          {isDrama ? (
            <>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-accent/50 cursor-pointer">
                <div className="w-8 h-8 bg-blue-100 rounded" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">主角设计稿.v2</div>
                  <div className="text-xs text-muted-foreground">2小时前</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-accent/50 cursor-pointer">
                <div className="w-8 h-8 bg-purple-100 rounded" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">场景概念图</div>
                  <div className="text-xs text-muted-foreground">5小时前</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 rounded hover:bg-accent/50 cursor-pointer">
                <div className="text-sm font-medium">今天 12:00</div>
                <div className="text-xs text-muted-foreground">职场干货 · 抖音</div>
              </div>
              <div className="p-2 rounded hover:bg-accent/50 cursor-pointer">
                <div className="text-sm font-medium">今天 18:00</div>
                <div className="text-xs text-muted-foreground">省钱攻略 · 快手</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Members Card */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-semibold mb-3">{terms.members}</h3>
        <div className="flex flex-wrap gap-2">
          {['张导', '李编', '王美', '赵摄'].map((name, i) => (
            <div key={name} className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: `hsl(${(i * 90) % 360}, 60%, 50%)` }}
              >
                {name[0]}
              </div>
              <span className="text-sm">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkspaceInfoPanel;
