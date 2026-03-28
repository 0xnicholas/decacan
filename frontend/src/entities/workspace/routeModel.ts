export interface WorkspaceRoute {
  section: WorkspaceSection;
  workspaceId: string;
}

interface WorkspaceSectionMeta {
  key: WorkspaceSection;
  navLabel: string;
  pathSegment: string | null;
  placeholderTitle: string;
}

export const workspaceSectionMeta: WorkspaceSectionMeta[] = [
  {
    key: "home",
    navLabel: "Home",
    pathSegment: null,
    placeholderTitle: "Workspace Overview",
  },
  {
    key: "tasks",
    navLabel: "Tasks",
    pathSegment: "tasks",
    placeholderTitle: "Tasks",
  },
  {
    key: "deliverables",
    navLabel: "Deliverables",
    pathSegment: "deliverables",
    placeholderTitle: "Deliverables",
  },
  {
    key: "approvals",
    navLabel: "Approvals",
    pathSegment: "approvals",
    placeholderTitle: "Approvals",
  },
  {
    key: "activity",
    navLabel: "Activity",
    pathSegment: "activity",
    placeholderTitle: "Activity",
  },
  {
    key: "members",
    navLabel: "Members",
    pathSegment: "members",
    placeholderTitle: "Members",
  },
];

export type WorkspaceSection = (typeof workspaceSectionMeta)[number]["key"];

const workspaceSectionByKey = workspaceSectionMeta.reduce<Record<WorkspaceSection, WorkspaceSectionMeta>>(
  (accumulator, section) => {
    accumulator[section.key] = section;
    return accumulator;
  },
  {} as Record<WorkspaceSection, WorkspaceSectionMeta>,
);

const workspaceSectionByPathSegment = workspaceSectionMeta.reduce<Record<string, WorkspaceSection>>(
  (accumulator, section) => {
    if (section.pathSegment) {
      accumulator[section.pathSegment] = section.key;
    }
    return accumulator;
  },
  {},
);

export function buildWorkspacePath(workspaceId: string, section: WorkspaceSection): string {
  const pathSegment = workspaceSectionByKey[section].pathSegment;
  return pathSegment ? `/workspaces/${workspaceId}/${pathSegment}` : `/workspaces/${workspaceId}`;
}

export function getWorkspaceSectionMeta(section: WorkspaceSection): WorkspaceSectionMeta {
  return workspaceSectionByKey[section];
}

export function parseWorkspaceRoute(pathname: string): WorkspaceRoute | null {
  const match = pathname.match(/^\/workspaces\/([^/]+)(?:\/([^/]+))?\/?$/);

  if (!match) {
    return null;
  }

  const workspaceId = match[1];
  const rawSection = match[2];

  if (!rawSection) {
    return { workspaceId, section: "home" };
  }

  const section = workspaceSectionByPathSegment[rawSection];

  if (!section) {
    return null;
  }

  return {
    workspaceId,
    section,
  };
}
