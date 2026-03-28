import { useEffect, useState } from "react";

import {
  getWorkspaceSectionMeta,
  parseWorkspaceRoute,
  type WorkspaceSection,
} from "../entities/workspace/routeModel";
import { LaunchPage } from "../features/launch/LaunchPage";
import { TaskPage } from "../features/task-detail/TaskPage";
import { WorkspaceHomePage } from "../features/workspace-home/WorkspaceHomePage";
import { WorkspaceShell } from "../shared/layout/WorkspaceShell";

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  return pathname;
}

function WorkspaceSectionPlaceholder({ section }: { section: WorkspaceSection }) {
  return (
    <section className="workspace-route-placeholder">
      <p className="eyebrow">Workspace</p>
      <h1>{getWorkspaceSectionMeta(section).placeholderTitle}</h1>
      <p className="subcopy">Content for this route will be implemented in later tasks.</p>
    </section>
  );
}

export function AppRouter() {
  const pathname = usePathname();
  const workspaceRoute = parseWorkspaceRoute(pathname);

  if (pathname.startsWith("/tasks/")) {
    const taskId = pathname.split("/").at(-1);

    if (!taskId) {
      return null;
    }

    return <TaskPage taskId={taskId} />;
  }

  if (workspaceRoute) {
    const workspaceSectionContent =
      workspaceRoute.section === "home" ? (
        <WorkspaceHomePage workspaceId={workspaceRoute.workspaceId} />
      ) : (
        <WorkspaceSectionPlaceholder section={workspaceRoute.section} />
      );

    return (
      <WorkspaceShell
        currentSection={workspaceRoute.section}
        workspaceId={workspaceRoute.workspaceId}
      >
        {workspaceSectionContent}
      </WorkspaceShell>
    );
  }

  return <LaunchPage />;
}
