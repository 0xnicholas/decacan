import { useState } from 'react';
import { useIndustryConfig, useTerminology } from '../../../app/providers/index';

interface AssistantFeature {
  id: string;
  label: string;
  icon: string;
}

const DRAMA_FEATURES: AssistantFeature[] = [
  { id: 'script-analysis', label: '剧本分析', icon: '📝' },
  { id: 'storyboard-suggestions', label: '分镜建议', icon: '🎬' },
  { id: 'character-development', label: '角色发展', icon: '👤' },
];

const VIDEO_FEATURES: AssistantFeature[] = [
  { id: 'topic-suggestions', label: '选题推荐', icon: '💡' },
  { id: 'script-optimization', label: '脚本优化', icon: '✏️' },
  { id: 'trend-analysis', label: '趋势分析', icon: '📈' },
];

interface AIAssistantPanelProps {
  workspaceId: string;
}

export function AIAssistantPanel(_props: AIAssistantPanelProps) {
  const config = useIndustryConfig();
  const terms = useTerminology();
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const features = config.id === 'short-drama' ? DRAMA_FEATURES : VIDEO_FEATURES;

  const handleSend = () => {
    if (!message.trim()) return;
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <h3 className="font-semibold">{terms.assistant}</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-accent rounded"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Quick features */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-2">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent/50 hover:bg-accent rounded-full transition-colors"
                >
                  <span>{feature.icon}</span>
                  <span>{feature.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area placeholder */}
          <div className="flex-1 p-4 min-h-[200px]">
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-sm">有什么可以帮您的？</p>
              <p className="text-xs mt-1">
                {config.id === 'short-drama' 
                  ? '剧本分析、分镜建议、角色发展...' 
                  : '选题推荐、脚本优化、趋势分析...'}
              </p>
            </div>
          </div>

          {/* Input area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入您的问题..."
                className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIAssistantPanel;
