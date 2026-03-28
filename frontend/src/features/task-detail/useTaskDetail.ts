import { useEffect, useState } from "react";

import type { TaskDetail } from "../../entities/task/types";
import { getJson } from "../../shared/api/client";

export function useTaskDetail(taskId: string) {
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadTask() {
      const response = await getJson<TaskDetail>(`/api/tasks/${taskId}`);

      if (active) {
        setTaskDetail(response);
      }
    }

    void loadTask();

    return () => {
      active = false;
    };
  }, [taskId, revision]);

  return {
    taskDetail,
    reload() {
      setRevision((current) => current + 1);
    },
  };
}
