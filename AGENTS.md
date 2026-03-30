# Active Agents

| Agent | Role | Notes |
| --- | --- | --- |
| You | Primary controller; coordinates plan tasks, spawns subagents, and keeps the workspace synchronized. |
| Subagents | Execute individual plan tasks (lifecycle types, authoring, publish, APIs, tasks); report tests/results per plan step. |
| Frontend agent | Handles the UI/console worktree (already running); keep frontend merges separate until backend plan completes. |

Keep this doc updated if you onboard new agents or change responsibilities so anyone can quickly pick up the current workflow.
