import { ApprovalPanel } from "./ApprovalPanel";
import { ArtifactPanel } from "./ArtifactPanel";
import { PlanProgressPanel } from "./PlanProgressPanel";
import { TaskHeader } from "./TaskHeader";
import { TimelinePanel } from "./TimelinePanel";
import { useTaskDetail } from "./useTaskDetail";

interface TaskPageProps {
  taskId: string;
}

export function TaskPage({ taskId }: TaskPageProps) {
  const taskDetail = useTaskDetail(taskId);

  if (!taskDetail) {
    return (
      <main className="task-route-placeholder">
        <p className="eyebrow">Decacan</p>
        <h1>Loading task</h1>
      </main>
    );
  }

  return (
    <main className="task-page">
      <p className="eyebrow">Decacan</p>
      <TaskHeader task={taskDetail.task} />
      <div className="task-grid">
        <PlanProgressPanel plan={taskDetail.plan} />
        <ApprovalPanel approvals={taskDetail.approvals} />
        <ArtifactPanel artifacts={taskDetail.artifacts} />
        <TimelinePanel timeline={taskDetail.timeline} />
      </div>
    </main>
  );
}
