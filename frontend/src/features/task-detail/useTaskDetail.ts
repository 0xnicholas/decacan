import { useEffect, useState } from "react";

import type {
  TaskAgentMessage,
  TaskConnectionState,
  TaskDetail,
  TaskEventEnvelope,
  TaskInstructionAction,
  TaskListItem,
} from "../../entities/task/types";
import { getJson } from "../../shared/api/client";
import { listTasks } from "../../shared/api/tasks";

export function useTaskDetail(taskId: string, workspaceId?: string) {
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  const [latestEvent, setLatestEvent] = useState<TaskEventEnvelope | null>(null);
  const [recentTasks, setRecentTasks] = useState<TaskListItem[]>([]);
  const [connectionState, setConnectionState] = useState<TaskConnectionState>("offline");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadTask() {
      const [response, tasks] = await Promise.all([
        getJson<TaskDetail>(`/api/tasks/${taskId}`),
        listTasks(),
      ]);
      const normalizedTask = normalizeTaskDetail(response);

      if (active) {
        setTaskDetail(normalizedTask);
        setLatestEvent(normalizedTask.timeline.at(-1) ?? null);
        setRecentTasks(filterRecentTasks(tasks, taskId, workspaceId ?? normalizedTask.task.workspace_id));
      }
    }

    void loadTask();

    return () => {
      active = false;
    };
  }, [taskId, revision, workspaceId]);

  useEffect(() => {
    if (typeof EventSource === "undefined") {
      setConnectionState("offline");
      return;
    }

    const stream = new EventSource(`/api/tasks/${taskId}/events/stream`);
    setConnectionState("live");

    stream.onmessage = (event) => {
      const nextEvent = JSON.parse(event.data) as TaskEventEnvelope;
      setLatestEvent(nextEvent);
      setConnectionState("live");
      setRevision((current) => current + 1);
    };

    stream.onerror = () => {
      setConnectionState("reconnecting");
    };

    return () => {
      stream.close();
    };
  }, [taskId]);

  return {
    connectionState,
    latestEvent,
    recentTasks,
    taskDetail,
    reload() {
      setRevision((current) => current + 1);
    },
  };
}

function filterRecentTasks(tasks: TaskListItem[], currentTaskId: string, workspaceId: string) {
  return tasks
    .filter((task) => task.id !== currentTaskId && task.workspace_id === workspaceId)
    .slice(0, 3);
}

function normalizeTaskDetail(taskDetail: TaskDetail): TaskDetail {
  const collaboration = taskDetail.collaboration;
  const defaultMessage: TaskAgentMessage = {
    id: `agent-${taskDetail.task.id}`,
    task_id: taskDetail.task.id,
    role: "agent",
    summary: "Current task status",
    detail: taskDetail.task.status_summary,
  };
  const defaultActions: TaskInstructionAction[] = [
    {
      key: "status-brief",
      label: "Status brief",
      instruction: "Provide a concise status update for this task.",
    },
    {
      key: "risk-check",
      label: "Risk check",
      instruction: "List blockers or risks that could delay completion.",
    },
    {
      key: "next-step-options",
      label: "Next-step options",
      instruction: "Suggest the next structured actions for this task.",
    },
  ];

  return {
    ...taskDetail,
    collaboration: {
      agent_messages: collaboration?.agent_messages?.length
        ? collaboration.agent_messages
        : [defaultMessage],
      instruction_actions: collaboration?.instruction_actions?.length
        ? collaboration.instruction_actions
        : defaultActions,
    },
  };
}
