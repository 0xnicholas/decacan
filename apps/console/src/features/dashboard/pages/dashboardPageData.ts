import { useEffect, useState } from 'react';
import { accountHubApi } from '@/features/account-hub/api/accountHubApi';
import type { AccountHome, AccountTaskSummary } from '@/features/account-hub/types/accountHub.types';

const ACTIVE_TASK_STATUSES = new Set([
  'created',
  'planning',
  'accepted',
  'running',
  'paused',
  'pending',
  'waiting_approval',
]);
const FINISHED_TASK_STATUSES = new Set(['completed', 'succeeded', 'failed', 'cancelled']);
const ATTENTION_TASK_STATUSES = new Set(['blocked', 'failed', 'pending', 'waiting_approval']);

export function useDashboardAccountHome() {
  const [accountHome, setAccountHome] = useState<AccountHome | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadAccountHome = async () => {
      try {
        const response = await accountHubApi.getHome(controller.signal);
        setAccountHome(response);
        setErrorMessage('');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load console.');
      }
    };

    void loadAccountHome();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    accountHome,
    errorMessage,
  };
}

export function getRunningWorkCount(tasks: AccountTaskSummary[]) {
  return tasks.filter((task) => ACTIVE_TASK_STATUSES.has(task.status)).length;
}

export function getFinishedWorkCount(tasks: AccountTaskSummary[]) {
  return tasks.filter((task) => FINISHED_TASK_STATUSES.has(task.status)).length;
}

export function getAttentionTaskCount(tasks: AccountTaskSummary[]) {
  return tasks.filter((task) => ATTENTION_TASK_STATUSES.has(task.status)).length;
}

export function getAttentionWorkspaceIds(accountHome: AccountHome) {
  const workspaceIds = new Set(accountHome.waiting_on_me.map((item) => item.workspace_id));

  accountHome.recent_tasks
    .filter((task) => ATTENTION_TASK_STATUSES.has(task.status))
    .forEach((task) => workspaceIds.add(task.workspace_id));

  return workspaceIds;
}
