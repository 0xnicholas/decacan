import type { WorkspaceSection } from "./WorkspaceShell";

interface WorkspaceNavProps {
  currentSection: WorkspaceSection;
  onNavigate: (section: WorkspaceSection) => void;
}

const navItems: Array<{ label: string; section: WorkspaceSection }> = [
  { label: "Home", section: "home" },
  { label: "Tasks", section: "tasks" },
  { label: "Deliverables", section: "deliverables" },
  { label: "Approvals", section: "approvals" },
  { label: "Activity", section: "activity" },
  { label: "Members", section: "members" },
];

export function WorkspaceNav({ currentSection, onNavigate }: WorkspaceNavProps) {
  return (
    <nav className="workspace-nav" aria-label="Workspace navigation">
      {navItems.map((item) => (
        <button
          key={item.section}
          className={`workspace-nav-link${item.section === currentSection ? " is-active" : ""}`}
          type="button"
          onClick={() => {
            onNavigate(item.section);
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
