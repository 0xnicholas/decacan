import { useEffect, useState } from "react";

import { Button } from "@decacan/ui";
import type { Member } from "../../entities/member/types";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../shared/ui";
import { useMembersApi } from "../../shared/api/members";
import { MemberCard } from "./MemberCard";
import { InviteMemberModal } from "./InviteMemberModal";

interface MembersPageProps {
  workspaceId: string;
}

export function MembersPage({ workspaceId }: MembersPageProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const { fetchWorkspaceMembers, removeMember } = useMembersApi();

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWorkspaceMembers(workspaceId);
      setMembers(data);
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await removeMember(workspaceId, memberId);
      await loadMembers();
    } catch (_err) {
      setError('Failed to remove member');
    }
  };

  const handleInviteSuccess = () => {
    void loadMembers();
  };

  useEffect(() => {
    void loadMembers();
  }, [workspaceId]);

  return (
    <section aria-label="Members" className="members-page">
      <PageHeader 
        title="Members" 
        subtitle="Manage workspace members and their roles"
        actions={
          <Button 
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite Member
          </Button>
        }
      />

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
              <MemberCard 
                member={member} 
                onRemove={() => handleRemoveMember(member.id)}
              />
            </div>
          ))}
        </div>
      )}

      {isInviteModalOpen && (
        <InviteMemberModal
          workspaceId={workspaceId}
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={handleInviteSuccess}
        />
      )}
    </section>
  );
}
