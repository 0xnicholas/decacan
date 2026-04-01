import { accountHubUrl } from "../config/accountHub";
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
    <header className="flex justify-between items-center gap-4 px-7 py-4 border-b border-foreground/10 bg-surface glass">
      <label className="grid gap-1.5 text-sm">
        Workspace
        <select
          aria-label="Workspace switcher"
          value={selectedWorkspaceId}
          onChange={(event) => {
            onWorkspaceChange(event.target.value);
          }}
          className="min-w-56 px-3 py-2 border border-foreground/14 rounded-xl bg-surface-elevated font-inherit"
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
      <div className="flex items-center gap-2.5">
        <a
          className="w-fit px-3.5 py-2 border border-foreground/14 rounded-full bg-surface text-inherit no-underline"
          href={accountHubUrl}
        >
          Console
        </a>
        <div className="px-3 py-1.5 border border-foreground/14 rounded-full bg-surface">
          Workspace User
        </div>
        <button 
          className="px-4.5 py-3 border-0 rounded-full bg-foreground text-primary-foreground font-inherit cursor-pointer" 
          type="button" 
          onClick={onNewTask}
        >
          New Task
        </button>
      </div>
    </header>
  );
}
