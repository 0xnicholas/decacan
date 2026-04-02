export const workspacesAppUrl =
  import.meta.env.VITE_WORKSPACES_APP_URL ?? "http://localhost:5173";

export function buildWorkspaceAppUrl(workspaceId: string) {
  return `${workspacesAppUrl}/workspaces/${workspaceId}`;
}
