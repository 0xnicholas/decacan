import { useState, useRef, useEffect } from 'react';
import { useIndustryConfig, useTerminology } from '../../app/providers/index';

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

export function AIAssistantPanel({ workspaceId }: AIAssistantPanelProps) {
  const config = useIndustryConfig();
  const terms = useTerminology();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: config.id === 'short-drama' 
      ? '您好！我是您的短剧制作助手。我可以帮您分析剧本、提供分镜建议或讨论角色发展。有什么可以帮您的吗？' 
      : '您好！我是您的内容创作助手。我可以帮您推荐选题、优化脚本或分析趋势。有什么可以帮您的吗？' 
    }
  ]);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const features = config.id === 'short-drama' ? DRAMA_FEATURES : VIDEO_FEATURES;

  const handleSend = () => {
    if (!message.trim()) return;
    
    const userMessage = message;
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: '这是一个很好的问题！让我为您分析一下...' 
      }]);
    }, 500);
  };

  const handleFeatureClick = (feature: AssistantFeature) => {
    setChatHistory(prev => [...prev, { 
      role: 'user', 
      content: `我想了解关于"${feature.label}"的建议` 
    }]);
    
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `关于${feature.label}，我有以下建议：\n\n1. 首先分析当前状态\n2. 识别关键问题\n3. 提供优化方案\n\n您希望我详细解释哪一点？` 
      }]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="font-semibold text-sm">{terms.assistant}</h3>
            <p className="text-xs text-muted-foreground">在线</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          aria-label={isMinimized ? 'Expand' : 'Minimize'}
        >
          {isMinimized ? '□' : '−'}
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* Quick features */}
          <div className="p-3 border-b shrink-0">
            <div className="flex flex-wrap gap-2">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureClick(feature)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent/50 hover:bg-accent rounded-full transition-colors"
                >
                  <span>{feature.icon}</span>
                  <span>{feature.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat history - scrollable */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-sm' 
                    : 'bg-muted rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="p-3 border-t shrink-0 bg-background">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="输入您的问题..."
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                发送
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              按 Enter 发送，Shift + Enter 换行
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default AIAssistantPanel;