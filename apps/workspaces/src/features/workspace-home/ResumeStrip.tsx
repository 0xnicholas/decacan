import { Button, Card, CardContent, CardDescription, CardHeader } from "@decacan/ui";

import type { ResumeModel } from "../../entities/workbench/types";
import { EmptyState } from "../../shared/ui";

interface ResumeStripProps {
  resume: ResumeModel;
  onOpenPrimary: () => void;
}

const emptyResumeTitle = "Resume current work";

export function ResumeStrip({ resume, onOpenPrimary }: ResumeStripProps) {
  if (resume.title === emptyResumeTitle) {
    return (
      <section aria-label="Resume work">
        <h2 className="sr-only">{resume.primary_label}</h2>
        <EmptyState
          title="Start new work"
          message="There is no active work to resume in this workspace yet."
          action={{ label: "Launch task", onClick: onOpenPrimary }}
        />
      </section>
    );
  }

  return (
    <section aria-label="Resume work">
      <Card>
        <CardHeader className="gap-3">
          <h2 className="text-base font-semibold leading-none tracking-tight">{resume.primary_label}</h2>
          <CardDescription>{resume.detail}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold">{resume.title}</p>
            <p className="text-sm text-muted-foreground">
              Pick up the most relevant task or artifact for this workspace.
            </p>
          </div>
          <Button disabled={!resume.target_task_id} onClick={onOpenPrimary} type="button">
            {resume.primary_label}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
