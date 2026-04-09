import { WorkspaceMainContent } from '../../main-content/WorkspaceMainContent';
import { WorkspaceInfoPanel } from '../../info/WorkspaceInfoPanel';

interface WorkspaceHomePageProps {
  workspaceId: string;
}

/**
 * Short Drama industry-specific workspace home page
 * Vertical layout: Main content on top, Info panel below
 */
export function WorkspaceHomePage({ workspaceId }: WorkspaceHomePageProps) {
  return (
    <div className="space-y-6">
      {/* Main content area */}
      <section>
        <WorkspaceMainContent workspaceId={workspaceId} />
      </section>

      {/* Info panel area */}
      <section className="pt-6 border-t">
        <h2 className="text-lg font-semibold mb-4">工作区概览</h2>
        <WorkspaceInfoPanel workspaceId={workspaceId} />
      </section>
    </div>
  );
}

export default WorkspaceHomePage;