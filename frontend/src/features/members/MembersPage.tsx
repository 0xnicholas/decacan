import { useEffect, useState } from "react";

import type { Member } from "../../entities/member/types";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../shared/ui";
import { fetchWorkspaceMembers } from "../../shared/api/members";
import { MemberCard } from "./MemberCard";

interface MembersPageProps {
  workspaceId: string;
}

export function MembersPage({ workspaceId }: MembersPageProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWorkspaceMembers(workspaceId);
      setMembers(data);
    } catch (err) {
      setError("Failed to load members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers();
  }, [workspaceId]);

  return (
    <section aria-label="Members" className="members-page">
      <PageHeader title="Members" subtitle="Manage workspace members and their roles" />

      {isLoading && (
        <LoadingState message="Loading members..." />
      )}

      {error && (
        <ErrorState message={error} onRetry={loadMembers} />
      )}

      {!isLoading && !error && members.length === 0 && (
        <EmptyState
          title="No members found"
          message="This workspace doesn't have any members yet"
        />
      )}

      {!isLoading && !error && members.length > 0 && (
        <div className="members-grid" role="list" aria-label="Workspace members">
          {members.map((member) => (
            <div key={member.id} role="listitem">
              <MemberCard member={member} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
