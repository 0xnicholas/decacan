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
    <nav className="workspace-nav" aria-label="Workspace navigation">
      {workspaceSectionMeta.map((item) => (
        <button
          key={item.key}
          className={`workspace-nav-link${item.key === currentSection ? " is-active" : ""}`}
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
