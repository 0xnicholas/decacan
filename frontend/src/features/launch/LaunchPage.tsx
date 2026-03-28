import { useEffect, useState } from "react";

import type { PlaybookCard, Workspace } from "../../entities/playbook/types";
import { fetchPlaybooks, fetchWorkspaces } from "../../shared/api/catalog";
import {
  createTask,
  createTaskPreview,
  type TaskPreview,
} from "../../shared/api/tasks";
import { PlaybookCards } from "./PlaybookCards";
import { TaskDraftForm } from "./TaskDraftForm";
import { TaskPreviewPanel } from "./TaskPreviewPanel";

export function LaunchPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [playbooks, setPlaybooks] = useState<PlaybookCard[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookCard | null>(null);
  const [goal, setGoal] = useState("");
  const [preview, setPreview] = useState<TaskPreview | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      const [workspaceResponse, playbookResponse] = await Promise.all([
        fetchWorkspaces(),
        fetchPlaybooks(),
      ]);

      setWorkspaces(workspaceResponse);
      setSelectedWorkspaceId(workspaceResponse[0]?.id ?? null);
      setPlaybooks(playbookResponse);
    }

    void loadCatalog();
  }, []);

  async function handlePreview() {
    if (!selectedWorkspaceId || !selectedPlaybook || !goal.trim()) {
      return;
    }

    const nextPreview = await createTaskPreview({
      workspace_id: selectedWorkspaceId,
      playbook_key: selectedPlaybook.key,
      input: goal.trim(),
    });

    setPreview(nextPreview);
  }

  async function handleStart() {
    if (!selectedWorkspaceId || !selectedPlaybook || !goal.trim() || !preview) {
      return;
    }

    setIsStarting(true);

    try {
      const response = await createTask({
        workspace_id: selectedWorkspaceId,
        playbook_key: selectedPlaybook.key,
        input: goal.trim(),
      });

      window.history.pushState({}, "", `/tasks/${response.task.id}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } finally {
      setIsStarting(false);
    }
  }

  const selectedWorkspace =
    workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? null;

  return (
    <div className="workspace-shell">
      <aside className="sidebar">
        <p className="sidebar-label">Workspace</p>
        <h2 className="sidebar-title">{selectedWorkspace?.title ?? "Loading workspace..."}</h2>
        <p className="sidebar-path">{selectedWorkspace?.root_path ?? "/workspace"}</p>
        <div className="sidebar-section">
          <p className="sidebar-label">Current playbook</p>
          <p className="sidebar-value">{selectedPlaybook?.title ?? "Choose one"}</p>
        </div>
      </aside>
      <main className="main-panel">
        <p className="eyebrow">Decacan</p>
        <PlaybookCards
          playbooks={playbooks}
          selectedKey={selectedPlaybook?.key ?? null}
          onSelect={(playbook) => {
            setSelectedPlaybook(playbook);
            setPreview(null);
          }}
        />
        <div className="launch-grid">
          <TaskDraftForm
            goal={goal}
            selectedTitle={selectedPlaybook?.title ?? null}
            disabled={!selectedPlaybook || !goal.trim()}
            onGoalChange={(value) => {
              setGoal(value);
              setPreview(null);
            }}
            onPreview={() => {
              void handlePreview();
            }}
          />
          <TaskPreviewPanel
            workspace={selectedWorkspace}
            playbook={selectedPlaybook}
            preview={preview}
            canStart={Boolean(preview)}
            isStarting={isStarting}
            onStart={() => {
              void handleStart();
            }}
          />
        </div>
      </main>
    </div>
  );
}
