import { useEffect, useState } from "react";

import type {
  TaskConnectionState,
  TaskDetail,
  TaskEventEnvelope,
  TaskListItem,
} from "../../entities/task/types";
import { getTaskDetail, listTasks, taskEventsStreamPath } from "../../shared/api/tasks";

type TaskLoadState = "loading" | "ready" | "not_found";

export function useTaskDetail(taskId: string, workspaceId?: string) {
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  const [latestEvent, setLatestEvent] = useState<TaskEventEnvelope | null>(null);
  const [recentTasks, setRecentTasks] = useState<TaskListItem[]>([]);
  const [connectionState, setConnectionState] = useState<TaskConnectionState>("offline");
  const [loadState, setLoadState] = useState<TaskLoadState>("loading");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadTask() {
      try {
        const [response, tasks] = await Promise.all([
          getTaskDetail(taskId, workspaceId),
          listTasks(),
        ]);
        const normalizedTask = normalizeTaskDetail(response);

        if (active) {
          setTaskDetail(normalizedTask);
          setLoadState("ready");
          setLatestEvent(normalizedTask.timeline.at(-1) ?? null);
          setRecentTasks(
            filterRecentTasks(tasks, taskId, workspaceId ?? normalizedTask.task.workspace_id),
          );
        }
      } catch (error) {
        if (!active) {
          return;
        }

        const message = error instanceof Error ? error.message : "";
        if (message.includes(" 404")) {
          setTaskDetail(null);
          setLatestEvent(null);
          setRecentTasks([]);
          setLoadState("not_found");
          setConnectionState("offline");
          return;
        }

        setTaskDetail(null);
        setLoadState("loading");
      }
    }

    void loadTask();

    return () => {
      active = false;
    };
  }, [taskId, revision, workspaceId]);

  useEffect(() => {
    if (typeof EventSource === "undefined" || loadState !== "ready") {
      setConnectionState("offline");
      return;
    }

    const stream = new EventSource(taskEventsStreamPath(taskId, workspaceId));
    setConnectionState("live");

    const handleStreamEvent = (event: MessageEvent<string>) => {
      const nextEvent = JSON.parse(event.data) as TaskEventEnvelope;
      setLatestEvent(nextEvent);
      setConnectionState("live");
      setRevision((current) => current + 1);
    };

    stream.onmessage = handleStreamEvent;
    stream.addEventListener("task.event", handleStreamEvent);
    stream.addEventListener("task.collaboration", handleStreamEvent);

    stream.onerror = () => {
      setConnectionState("reconnecting");
    };

    return () => {
      stream.close();
    };
  }, [loadState, taskId, workspaceId]);

  return {
    connectionState,
    latestEvent,
    loadState,
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

  return {
    ...taskDetail,
    collaboration: {
      agent_messages: collaboration?.agent_messages ?? [],
      instruction_actions: collaboration?.instruction_actions ?? [],
    },
  };
}
