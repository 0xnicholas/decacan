import {
  workspaceSectionMeta,
  type WorkspaceSection,
} from "../../entities/workspace/routeModel";

interface WorkspaceNavProps {
  currentSection: WorkspaceSection;
  onNavigate: (section: WorkspaceSection) => void;
}

export function WorkspaceNav({ currentSection, onNavigate }: WorkspaceNavProps) {
  return (
    <nav className="grid content-start gap-1.5 px-4 py-6 border-r border-foreground/10 bg-surface/50" aria-label="Workspace navigation">
      {workspaceSectionMeta.map((item) => (
        <button
          key={item.key}
          className={`border-0 rounded-xl px-3 py-2.5 text-left bg-transparent text-inherit font-inherit cursor-pointer transition-colors ${
            item.key === currentSection
              ? "bg-foreground/10 font-bold"
              : "hover:bg-foreground/5"
          }`}
          type="button"
          onClick={() => {
            onNavigate(item.key);
          }}
        >
          {item.navLabel}
        </button>
      ))}
    </nav>
  );
}
