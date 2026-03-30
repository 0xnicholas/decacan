import { useEffect, useRef, useState } from "react";

import type { WorkspaceHomeData } from "../../entities/workspace-home/types";
import { fetchWorkspaceHome } from "../../shared/api/workspace-home";
import { LoadingState, PageHeader } from "../../shared/ui";
import { ExecutionOverviewPanel } from "./ExecutionOverviewPanel";
import { NeedsAttentionPanel } from "./NeedsAttentionPanel";
import { TeamSnapshotPanel } from "./TeamSnapshotPanel";
import { WorkspaceDeliverablesPanel } from "./WorkspaceDeliverablesPanel";

interface WorkspaceHomePageProps {
  workspaceId: string;
}

export function WorkspaceHomePage({ workspaceId }: WorkspaceHomePageProps) {
  const [homeData, setHomeData] = useState<WorkspaceHomeData | null>(null);
  const requestSequence = useRef(0);

  useEffect(() => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    setHomeData(null);

    async function loadWorkspaceHome() {
      try {
        const data = await fetchWorkspaceHome(workspaceId);
        if (requestSequence.current == requestId) {
          setHomeData(data);
        }
      } catch {
        if (requestSequence.current == requestId) {
          setHomeData({
            attention: [],
            task_health: {
              running: 0,
              waiting_approval: 0,
              blocked: 0,
              completed_today: 0,
            },
            activity: [],
            deliverables: [],
            team_snapshot: [],
          });
        }
      }
    }

    void loadWorkspaceHome();
  }, [workspaceId]);

  if (!homeData) {
    return <LoadingState message="Loading workspace control center…" />;
  }

  return (
    <div>
      <PageHeader title="Workspace Home" />
      <NeedsAttentionPanel items={homeData.attention} />
      <ExecutionOverviewPanel taskHealth={homeData.task_health} activity={homeData.activity} />
      <WorkspaceDeliverablesPanel deliverables={homeData.deliverables} />
      <TeamSnapshotPanel team={homeData.team_snapshot} />
    </div>
  );
}
