import type { ReactNode } from "react";

import type { WorkspaceWorkbenchModel } from "../../entities/workbench/types";
import { CurrentWorkPanel } from "./CurrentWorkPanel";
import { DiscussionPanel } from "./DiscussionPanel";
import { MyQueuePanel } from "./MyQueuePanel";
import { ResumeStrip } from "./ResumeStrip";
import { TeamActivityPanel } from "./TeamActivityPanel";

interface WorkbenchLayoutProps {
  model: WorkspaceWorkbenchModel;
  onOpenPrimary: () => void;
  assistantDock?: ReactNode;
}

export function WorkbenchLayout({ model, onOpenPrimary, assistantDock }: WorkbenchLayoutProps) {
  return (
    <div className="grid gap-6">
      <ResumeStrip onOpenPrimary={onOpenPrimary} resume={model.resume} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
            <CurrentWorkPanel currentWork={model.current_work} template={model.template} />
            <MyQueuePanel queue={model.queue} templateLabels={model.template.labels} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <TeamActivityPanel items={model.activity} team={model.team_snapshot} />
            <DiscussionPanel items={model.discussion} />
          </div>
        </div>
        {assistantDock}
      </div>
    </div>
  );
}
