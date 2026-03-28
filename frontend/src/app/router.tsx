import { useEffect, useState } from "react";

import { LaunchPage } from "../features/launch/LaunchPage";
import { TaskPage } from "../features/task-detail/TaskPage";
import {
  type WorkspaceSection,
  WorkspaceShell,
} from "../shared/layout/WorkspaceShell";

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

interface WorkspaceRoute {
  section: WorkspaceSection;
  workspaceId: string;
}

function parseWorkspaceRoute(pathname: string): WorkspaceRoute | null {
  const match = pathname.match(
    /^\/workspaces\/([^/]+)(?:\/(tasks|deliverables|approvals|activity|members))?\/?$/,
  );

  if (!match) {
    return null;
  }

  const workspaceId = match[1];
  const maybeSection = match[2] as WorkspaceSection | undefined;
  const section: WorkspaceSection = maybeSection ?? "home";

  return {
    section,
    workspaceId,
  };
}

function WorkspaceSectionPlaceholder({ section }: { section: WorkspaceSection }) {
  const titles: Record<WorkspaceSection, string> = {
    activity: "Activity",
    approvals: "Approvals",
    deliverables: "Deliverables",
    home: "Workspace Overview",
    members: "Members",
    tasks: "Tasks",
  };

  return (
    <section className="workspace-route-placeholder">
      <p className="eyebrow">Workspace</p>
      <h1>{titles[section]}</h1>
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
    return (
      <WorkspaceShell
        currentSection={workspaceRoute.section}
        workspaceId={workspaceRoute.workspaceId}
      >
        <WorkspaceSectionPlaceholder section={workspaceRoute.section} />
      </WorkspaceShell>
    );
  }

  return <LaunchPage />;
}
