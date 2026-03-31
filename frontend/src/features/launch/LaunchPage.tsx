import { useEffect, useState } from "react";

import type { PlaybookCard, Workspace } from "../../entities/playbook/types";
import {
  fetchPlaybookStore,
  fetchWorkspaces,
  forkPlaybook,
  publishPlaybook,
  savePlaybookDraft,
} from "../../shared/api/catalog";
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
        fetchPlaybookStore(),
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
      // 1. Fork playbook from store
      const forkResponse = await forkPlaybook({
        store_entry_id: selectedPlaybook.store_entry_id,
      });

      const handleId = forkResponse.handle.playbook_handle_id;

      // 2. Save draft with proper configuration
      const specDocument = `metadata:
  title: ${selectedPlaybook.title}
capability_refs:
  routines:
    - builtin.scan_markdown_files
  tools:
    - builtin.workspace.read
    - builtin.artifact.write
  validators:
    - builtin.output_contract.summary
execution_profile: single
`;

      await savePlaybookDraft(handleId, { spec_document: specDocument });

      // 3. Publish playbook to get version
      const publishResponse = await publishPlaybook(handleId);

      if (!publishResponse.version) {
        throw new Error("Failed to publish playbook");
      }

      const versionId = publishResponse.version.playbook_version_id;

      // 4. Create task with handle_id and version_id
      const response = await createTask({
        workspace_id: selectedWorkspaceId,
        playbook_handle_id: handleId,
        playbook_version_id: versionId,
        input_payload: goal.trim(),
      });

      window.history.pushState({}, "", `/tasks/${response.task.id}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (error) {
      console.error("Failed to start task:", error);
      alert("Failed to start task. Please try again.");
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
        <select
          aria-label="Select workspace"
          className="workspace-select"
          value={selectedWorkspaceId ?? ""}
          onChange={(event) => {
            setSelectedWorkspaceId(event.target.value || null);
            setPreview(null);
          }}
        >
          <option value="" disabled={selectedWorkspaceId !== null}>
            Select a workspace...
          </option>
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.title}
            </option>
          ))}
        </select>
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
