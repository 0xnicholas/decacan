import React, { createContext, useContext, useEffect, useState } from 'react';
import type { IndustryConfig } from '../../config';
import { loadIndustryConfig, getIndustryId } from '../../config';

interface IndustryContextValue {
  config: IndustryConfig;
  isLoading: boolean;
  error: Error | null;
  reloadConfig: () => Promise<void>;
}

const IndustryContext = createContext<IndustryContextValue | undefined>(undefined);

interface IndustryProviderProps {
  children: React.ReactNode;
  industryId?: string; // Optional override
}

export function IndustryProvider({ children, industryId }: IndustryProviderProps) {
  const [config, setConfig] = useState<IndustryConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadConfig = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const targetIndustry = industryId || getIndustryId();
      const loadedConfig = await loadIndustryConfig(targetIndustry);
      setConfig(loadedConfig);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load config'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadConfig();
  }, [industryId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6">
          <h1 className="text-xl font-semibold mb-2">Failed to Load Workspace</h1>
          <p className="text-muted-foreground mb-4">
            {error?.message || 'Unknown error occurred'}
          </p>
          <button
            onClick={loadConfig}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <IndustryContext.Provider
      value={{
        config,
        isLoading,
        error,
        reloadConfig: loadConfig,
      }}
    >
      {children}
    </IndustryContext.Provider>
  );
}

/**
 * Hook to access industry configuration
 * Must be used within IndustryProvider
 */
export function useIndustry(): IndustryContextValue {
  const context = useContext(IndustryContext);
  
  if (context === undefined) {
    throw new Error('useIndustry must be used within an IndustryProvider');
  }
  
  return context;
}

/**
 * Hook to access just the config (convenience)
 */
export function useIndustryConfig(): IndustryConfig {
  const { config } = useIndustry();
  return config;
}

/**
 * Hook to access terminology (convenience)
 */
export function useTerminology(): IndustryConfig['terminology'] {
  const { config } = useIndustry();
  return config.terminology;
}

/**
 * Workflow mode type
 * - 'content': topic → script → shoot → edit (短视频风格)
 * - 'production': script → storyboard → art → production (短剧风格)
 */
export type WorkflowMode = 'content' | 'production';

interface WorkflowModeConfig {
  default: WorkflowMode;
  modes?: {
    content?: {
      groupBy?: string[];
      taskLabel?: string;
      deliverableLabel?: string;
      workspaceLabel?: string;
      memberLabel?: string;
    };
    production?: {
      groupBy?: string[];
      taskLabel?: string;
      deliverableLabel?: string;
      workspaceLabel?: string;
      memberLabel?: string;
    };
  };
}

/**
 * Hook to get current workflow mode
 * Returns 'content' by default if not configured
 */
export function useWorkflowMode(): WorkflowMode {
  const { config } = useIndustry();
  const workflowModeConfig = config.features?.workflowMode?.config as WorkflowModeConfig | undefined;
  return workflowModeConfig?.default ?? 'content';
}

/**
 * Hook to get workflow mode configuration
 * Returns full config for the current mode
 */
export function useWorkflowModeConfig(): { groupBy?: string[]; taskLabel?: string; deliverableLabel?: string; workspaceLabel?: string; memberLabel?: string } | undefined {
  const { config } = useIndustry();
  const workflowMode = useWorkflowMode();
  const workflowModeConfig = config.features?.workflowMode?.config as WorkflowModeConfig | undefined;
  const modes = workflowModeConfig?.modes;
  if (!modes) return undefined;
  return modes[workflowMode];
}