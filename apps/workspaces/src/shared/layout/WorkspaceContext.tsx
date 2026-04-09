import { createContext, useContext, type ReactNode } from 'react';

interface WorkspaceContextValue {
  rightPanel?: ReactNode;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

interface WorkspaceProviderProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

export function WorkspaceProvider({ children, rightPanel }: WorkspaceProviderProps) {
  return (
    <WorkspaceContext.Provider value={{ rightPanel }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
