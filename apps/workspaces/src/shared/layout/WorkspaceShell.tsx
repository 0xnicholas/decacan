import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";

import { buildWorkspacePath, type WorkspaceSection } from "../../entities/workspace/routeModel";
import type { Workspace } from "../../entities/playbook/types";
import { fetchWorkspaces } from "../api/catalog";
import { TopBar } from "./TopBar";
import { WorkspaceNav } from "./WorkspaceNav";

function getSectionFromPath(pathname: string): WorkspaceSection {
  const parts = pathname.split('/').filter(Boolean);
  const section = parts[2]; // /workspaces/:id/section
  
  switch (section) {
    case 'tasks': return 'tasks';
    case 'deliverables': return 'deliverables';
    case 'approvals': return 'approvals';
    case 'activity': return 'activity';
    case 'members': return 'members';
    default: return 'home';
  }
}

export function WorkspaceShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId } = useParams();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  
  const currentSection = getSectionFromPath(location.pathname);

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        setWorkspaces(await fetchWorkspaces());
      } catch {
        setWorkspaces([]);
      }
    }

    void loadWorkspaces();
  }, []);

  function navigateTo(workspace: string, section: WorkspaceSection) {
    const path = buildWorkspacePath(workspace, section);
    navigate(path);
  }

  if (!workspaceId) {
    return null;
  }

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <TopBar
        onNewTask={() => {
          navigate(`/workspaces/${workspaceId}/new-task`);
        }}
        onWorkspaceChange={(nextWorkspaceId) => {
          navigateTo(nextWorkspaceId, currentSection);
        }}
        selectedWorkspaceId={workspaceId}
        workspaces={workspaces}
      />
      <div className="grid grid-cols-[220px_1fr] min-h-0">
        <WorkspaceNav
          currentSection={currentSection}
          onNavigate={(nextSection) => {
            navigateTo(workspaceId, nextSection);
          }}
        />
        <main className="p-9 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
