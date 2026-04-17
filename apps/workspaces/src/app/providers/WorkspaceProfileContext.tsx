import React, { createContext, useContext, useEffect, useState } from 'react';

interface WorkspaceProfile {
  workspace_profile_id: string | null;
}

interface WorkspaceProfileContextValue {
  profile: WorkspaceProfile | null;
  isLoading: boolean;
  error: Error | null;
}

const WorkspaceProfileContext = createContext<WorkspaceProfileContextValue | undefined>(undefined);

interface WorkspaceProfileProviderProps {
  children: React.ReactNode;
  workspaceId: string;
}

export function WorkspaceProfileProvider({ children, workspaceId }: WorkspaceProfileProviderProps) {
  const [profile, setProfile] = useState<WorkspaceProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function loadProfile() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/profile`);
        if (!res.ok) throw new Error(`Failed to load profile: ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setProfile(data.profile ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setProfile({ workspace_profile_id: null });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadProfile();
    return () => { cancelled = true; };
  }, [workspaceId]);

  return (
    <WorkspaceProfileContext.Provider value={{ profile, isLoading, error }}>
      {children}
    </WorkspaceProfileContext.Provider>
  );
}

export function useWorkspaceProfile(): WorkspaceProfileContextValue {
  const context = useContext(WorkspaceProfileContext);
  if (context === undefined) {
    throw new Error('useWorkspaceProfile must be used within WorkspaceProfileProvider');
  }
  return context;
}

export function useWorkspaceProfileId(): string | null {
  const context = useContext(WorkspaceProfileContext);
  return context?.profile?.workspace_profile_id ?? null;
}