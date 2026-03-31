import { useState } from 'react';
import { useMembersApi } from '../../shared/api/members';
import type { MemberRole } from '../../entities/member/types';

interface InviteMemberModalProps {
  workspaceId: string;
  onClose: () => void;
  onInvite: () => void;
}

const ROLES: { value: MemberRole; label: string }[] = [
  { value: 'admin', label: 'Admin - Full control except delete workspace' },
  { value: 'editor', label: 'Editor - Can create and edit playbooks/tasks' },
  { value: 'viewer', label: 'Viewer - Read-only access' },
];

export function InviteMemberModal({ workspaceId, onClose, onInvite }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('editor');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { inviteMember } = useMembersApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await inviteMember(workspaceId, email, role);
      onInvite();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Invite Member</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            {ROLES.map(({ value, label }) => (
              <label key={value} className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={(e) => setRole(e.target.value as MemberRole)}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
