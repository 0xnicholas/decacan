import { useEffect, useState } from "react";

import { getJson } from "../../shared/api/client";
import {
  ExecutionOverviewPanel,
  type ActivityItem,
  type TaskHealth,
} from "./ExecutionOverviewPanel";
import { NeedsAttentionPanel, type AttentionItem } from "./NeedsAttentionPanel";
import {
  TeamSnapshotPanel,
  type TeamMember,
} from "./TeamSnapshotPanel";
import {
  WorkspaceDeliverablesPanel,
  type DeliverableItem,
} from "./WorkspaceDeliverablesPanel";

interface WorkspaceHomeData {
  attention: AttentionItem[];
  task_health: TaskHealth;
  activity: ActivityItem[];
  deliverables: DeliverableItem[];
  team_snapshot: TeamMember[];
}

interface WorkspaceHomePageProps {
  workspaceId: string;
}

export function WorkspaceHomePage({ workspaceId }: WorkspaceHomePageProps) {
  const [homeData, setHomeData] = useState<WorkspaceHomeData | null>(null);

  useEffect(() => {
    async function loadWorkspaceHome() {
      const data = await getJson<WorkspaceHomeData>(`/api/workspaces/${workspaceId}/home`);
      setHomeData(data);
    }

    void loadWorkspaceHome();
  }, [workspaceId]);

  if (!homeData) {
    return <p>Loading workspace control center…</p>;
  }

  return (
    <div>
      <p className="eyebrow">Workspace Home</p>
      <NeedsAttentionPanel items={homeData.attention} />
      <ExecutionOverviewPanel taskHealth={homeData.task_health} activity={homeData.activity} />
      <WorkspaceDeliverablesPanel deliverables={homeData.deliverables} />
      <TeamSnapshotPanel team={homeData.team_snapshot} />
    </div>
  );
}
