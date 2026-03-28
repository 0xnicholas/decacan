import type { Workspace } from "../../entities/playbook/types";

interface TopBarProps {
  onNewTask: () => void;
  onWorkspaceChange: (workspaceId: string) => void;
  selectedWorkspaceId: string;
  workspaces: Workspace[];
}

export function TopBar({
  onNewTask,
  onWorkspaceChange,
  selectedWorkspaceId,
  workspaces,
}: TopBarProps) {
  const hasSelectedWorkspace = workspaces.some(
    (workspace) => workspace.id === selectedWorkspaceId,
  );

  return (
    <header className="workspace-topbar">
      <label className="workspace-switcher">
        Workspace
        <select
          aria-label="Workspace switcher"
          value={selectedWorkspaceId}
          onChange={(event) => {
            onWorkspaceChange(event.target.value);
          }}
        >
          {hasSelectedWorkspace ? null : (
            <option value={selectedWorkspaceId}>{selectedWorkspaceId}</option>
          )}
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.title}
            </option>
          ))}
        </select>
      </label>
      <div className="workspace-topbar-actions">
        <button className="secondary-button" type="button">
          Inbox
        </button>
        <div className="workspace-user-chip">User</div>
        <button className="primary-button" type="button" onClick={onNewTask}>
          New Task
        </button>
      </div>
    </header>
  );
}
