import type { TaskPlan } from "../../entities/task/types";

interface PlanProgressPanelProps {
  plan: TaskPlan;
}

export function PlanProgressPanel({ plan }: PlanProgressPanelProps) {
  return (
    <section className="task-panel">
      <div className="section-header">
        <p className="section-kicker">Execution</p>
        <h2>Plan</h2>
      </div>
      <ol className="plan-steps">
        {plan.steps.map((step, index) => (
          <li key={step} className={index === plan.current_step_index ? "current-step" : ""}>
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}
