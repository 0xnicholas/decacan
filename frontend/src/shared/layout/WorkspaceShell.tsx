import { useEffect, useState, type ReactNode } from "react";

import type { Workspace } from "../../entities/workspace/types";
import { fetchWorkspaces } from "../api/workspaces";
import { TopBar } from "./TopBar";
import { WorkspaceNav } from "./WorkspaceNav";

export type WorkspaceSection =
  | "home"
  | "tasks"
  | "deliverables"
  | "approvals"
  | "activity"
  | "members";

interface WorkspaceShellProps {
  children: ReactNode;
  currentSection: WorkspaceSection;
  workspaceId: string;
}

function sectionToPath(section: WorkspaceSection): string {
  return section === "home" ? "" : `/${section}`;
}

export function WorkspaceShell({
  children,
  currentSection,
  workspaceId,
}: WorkspaceShellProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

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
    const path = `/workspaces/${workspace}${sectionToPath(section)}`;
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <div className="product-workspace-shell">
      <TopBar
        onNewTask={() => {
          window.history.pushState({}, "", "/");
          window.dispatchEvent(new PopStateEvent("popstate"));
        }}
        onWorkspaceChange={(nextWorkspaceId) => {
          navigateTo(nextWorkspaceId, currentSection);
        }}
        selectedWorkspaceId={workspaceId}
        workspaces={workspaces}
      />
      <div className="workspace-frame">
        <WorkspaceNav
          currentSection={currentSection}
          onNavigate={(nextSection) => {
            navigateTo(workspaceId, nextSection);
          }}
        />
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
