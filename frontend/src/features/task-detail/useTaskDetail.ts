import { useEffect, useState } from "react";

import type { TaskConnectionState, TaskDetail, TaskEventEnvelope } from "../../entities/task/types";
import { getJson } from "../../shared/api/client";

export function useTaskDetail(taskId: string) {
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  const [latestEvent, setLatestEvent] = useState<TaskEventEnvelope | null>(null);
  const [connectionState, setConnectionState] = useState<TaskConnectionState>("offline");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadTask() {
      const response = await getJson<TaskDetail>(`/api/tasks/${taskId}`);

      if (active) {
        setTaskDetail(response);
        setLatestEvent(response.timeline.at(-1) ?? null);
      }
    }

    void loadTask();

    return () => {
      active = false;
    };
  }, [taskId, revision]);

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
    taskDetail,
    reload() {
      setRevision((current) => current + 1);
    },
  };
}
