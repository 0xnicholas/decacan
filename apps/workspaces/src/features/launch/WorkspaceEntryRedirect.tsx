import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { fetchWorkspaces } from "../../shared/api/catalog";
import { ErrorState, LoadingState } from "../../shared/ui";

export function WorkspaceEntryRedirect() {
  const [defaultWorkspaceId, setDefaultWorkspaceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadDefaultWorkspace() {
      try {
        const workspaces = await fetchWorkspaces();

        if (!isActive) {
          return;
        }

        const nextWorkspaceId = workspaces[0]?.id;

        if (!nextWorkspaceId) {
          setErrorMessage("No workspace is available for this account.");
          return;
        }

        setDefaultWorkspaceId(nextWorkspaceId);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load your default workspace.",
        );
      }
    }

    void loadDefaultWorkspace();

    return () => {
      isActive = false;
    };
  }, []);

  if (defaultWorkspaceId) {
    return <Navigate to={`/workspaces/${defaultWorkspaceId}`} replace />;
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />;
  }

  return <LoadingState message="Loading your default workspace…" />;
}
