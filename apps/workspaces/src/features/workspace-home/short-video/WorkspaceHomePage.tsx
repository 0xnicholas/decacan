import React from 'react';
import { ThreeColumnLayout } from '../../../../shared/layout/ThreeColumnLayout';
import { WorkspaceMainContent } from '../../../main-content/WorkspaceMainContent';
import { WorkspaceInfoPanel } from '../../../info/WorkspaceInfoPanel';
import { AIAssistantPanel } from '../../../assistant/AIAssistantPanel';

interface WorkspaceHomePageProps {
  workspaceId: string;
}

/**
 * Short Video industry-specific workspace home page
 * Uses 3-column layout: Main Content | Info Panel | AI Assistant
 */
export function WorkspaceHomePage({ workspaceId }: WorkspaceHomePageProps) {
  return (
    <ThreeColumnLayout
      main={<WorkspaceMainContent workspaceId={workspaceId} />}
      info={<WorkspaceInfoPanel workspaceId={workspaceId} />}
      assistant={<AIAssistantPanel workspaceId={workspaceId} />}
    />
  );
}

export default WorkspaceHomePage;
