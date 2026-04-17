import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { defaultAssistantDock } from "../../../entities/workbench/defaultTemplate";
import { normalizeWorkspaceHome } from "../../../entities/workbench/normalizeWorkspaceHome";
import type { WorkspaceWorkbenchModel } from "../../../entities/workbench/types";
import type { WorkspaceHomeData } from "../../../entities/workspace-home/types";
import { createAssistantSession } from "../../../shared/api/assistant";
import { fetchWorkspaceHome } from "../../../shared/api/workspace-home";
import { LoadingState, PageHeader } from "../../../shared/ui";
import { WorkbenchLayout } from "./WorkbenchLayout";
import { WorkspaceAssistantDock } from "./WorkspaceAssistantDock";
import { useWorkspaceProfileId } from "../../../app/providers/WorkspaceProfileContext";

const profileTitles: Record<string, string> = {
  'short-drama-v1': '短剧工作区',
};

function getProfileTitle(profileId: string | null): string {
  if (!profileId) return 'Workspace Home';
  return profileTitles[profileId] ?? 'Workspace Home';
}

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
  const [isDelegating, setIsDelegating] = useState(false);
  const [delegationStatus, setDelegationStatus] = useState<string | null>(null);
  const requestSequence = useRef(0);
  const assistant = workbench?.assistant ?? defaultAssistantDock;
  const profileId = useWorkspaceProfileId();
  const profileTitle = getProfileTitle(profileId);

  useEffect(() => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    setWorkbench(null);
    setDelegationStatus(null);

    async function loadWorkspaceHome() {
      try {
        const data = await fetchWorkspaceHome(workspaceId);
        if (requestSequence.current == requestId) {
          setWorkbench(normalizeWorkspaceHome(workspaceId, data));
          const restoredTeamSessionId = data.assistant_session?.active_team_session_id;
          if (restoredTeamSessionId) {
            setDelegationStatus(
              `Delegation active: ${restoredTeamSessionId} (${data.assistant_session?.state ?? "active"})`,
            );
          }
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

  const handleOpenPrimary = () => {
    if (workbench.resume.target_task_id) {
      navigate(`/workspaces/${workspaceId}/tasks/${workbench.resume.target_task_id}`);
      return;
    }

    if (workbench.resume.has_current_work) {
      navigate(`/workspaces/${workspaceId}/tasks`);
      return;
    }

    navigate(`/workspaces/${workspaceId}/new-task`);
  };

  return (
    <div>
      <PageHeader title={profileTitle} subtitle={workbench.template.title} />
      <WorkbenchLayout
        model={workbench}
        onOpenPrimary={handleOpenPrimary}
        assistantDock={
          <WorkspaceAssistantDock
            assistant={assistant}
            onOpenTask={(taskId, context) => {
              navigate(`/workspaces/${workspaceId}/tasks/${taskId}`, {
                state: { assistantContext: context },
              });
            }}
            onDelegate={() => {
              const objectiveTitle = assistant.suggested_actions[0]?.label ?? "Run workspace assistant plan";
              const objectiveGoal =
                assistant.summary.trim() || "Delegate workspace objective to agent team";
              setIsDelegating(true);
              setDelegationStatus(null);
              void createAssistantSession({
                workspace_id: workspaceId,
                objective: {
                  title: objectiveTitle,
                  user_goal: objectiveGoal,
                },
                execution_mode: "interactive",
              })
                .then((response) => {
                  setDelegationStatus(
                    `Delegation started: ${response.delegation.team_session_id} (${response.team_session.status})`,
                  );
                  navigate(`/workspaces/${workspaceId}/tasks/${response.delegation.task_id}`, {
                    state: {
                      assistantContext: {
                        source: "workspace-assistant-dock",
                        summary: response.objective.user_goal,
                        actionLabel: response.objective.title,
                        targetKind: "task",
                        targetId: response.delegation.task_id,
                      },
                    },
                  });
                })
                .catch(() => {
                  setDelegationStatus("Delegation failed. Please retry.");
                })
                .finally(() => {
                  setIsDelegating(false);
                });
            }}
            isDelegating={isDelegating}
            delegationStatus={delegationStatus}
          />
        }
      />
    </div>
  );
}
