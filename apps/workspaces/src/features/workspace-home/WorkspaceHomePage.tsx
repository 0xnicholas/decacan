import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { defaultAssistantDock } from "../../entities/workbench/defaultTemplate";
import { normalizeWorkspaceHome } from "../../entities/workbench/normalizeWorkspaceHome";
import type { WorkspaceWorkbenchModel } from "../../entities/workbench/types";
import type { WorkspaceHomeData } from "../../entities/workspace-home/types";
import { fetchWorkspaceHome } from "../../shared/api/workspace-home";
import { LoadingState, PageHeader } from "../../shared/ui";
import { WorkbenchLayout } from "./WorkbenchLayout";
import { WorkspaceAssistantDock } from "./WorkspaceAssistantDock";

interface WorkspaceHomePageProps {
  workspaceId: string;
}

const fallbackWorkspaceHomeData: WorkspaceHomeData = {
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
  discussion: [],
  // Keep the fallback payload raw so normalization stays explicit in the feature seam.
  assistant: {
    summary: "",
    suggested_actions: [],
  },
};

export function WorkspaceHomePage({ workspaceId }: WorkspaceHomePageProps) {
  const navigate = useNavigate();
  const [workbench, setWorkbench] = useState<WorkspaceWorkbenchModel | null>(null);
  const requestSequence = useRef(0);
  const assistant = workbench?.assistant ?? defaultAssistantDock;

  useEffect(() => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    setWorkbench(null);

    async function loadWorkspaceHome() {
      try {
        const data = await fetchWorkspaceHome(workspaceId);
        if (requestSequence.current == requestId) {
          setWorkbench(normalizeWorkspaceHome(workspaceId, data));
        }
      } catch {
        if (requestSequence.current == requestId) {
          setWorkbench(normalizeWorkspaceHome(workspaceId, fallbackWorkspaceHomeData));
        }
      }
    }

    void loadWorkspaceHome();
  }, [workspaceId]);

  if (!workbench) {
    return <LoadingState message="Loading workspace workbench…" />;
  }

  return (
    <div>
      <PageHeader title="Workspace Home" />
      <WorkbenchLayout
        model={workbench}
        onOpenPrimary={() => {
          navigate(`/workspaces/${workspaceId}/new-task`);
        }}
        assistantDock={
          <WorkspaceAssistantDock
            assistant={assistant}
            onOpenTask={(taskId, context) => {
              navigate(`/workspaces/${workspaceId}/tasks/${taskId}`, {
                state: { assistantContext: context },
              });
            }}
          />
        }
      />
    </div>
  );
}
