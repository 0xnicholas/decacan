import type { Member } from "../../entities/member/types";
import { getRoleColor } from "../../shared/api/members";

interface MemberCardProps {
  member: Member;
  onRemove?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return "just now";
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return "1d ago";
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ago`;
  } else {
    return then.toLocaleDateString();
  }
}

export function MemberCard({ member, onRemove }: MemberCardProps) {
  const roleColor = getRoleColor(member.role);

  return (
    <article className="member-card" aria-label={`${member.name} member card`}>
      <div className="member-card-header">
        <div className="member-avatar" aria-label={`${member.name} avatar`}>
          {member.avatarUrl ? (
            <img alt={member.name} src={member.avatarUrl} />
          ) : (
            <span className="member-initials">{getInitials(member.name)}</span>
          )}
        </div>
        <div className="member-info">
          <h3 className="member-name">{member.name}</h3>
          <p className="member-email">{member.email}</p>
          <span 
            className="member-role-badge" 
            style={{ 
              backgroundColor: `${roleColor}15`,
              color: roleColor,
              borderColor: `${roleColor}30`,
            }}
          >
            {member.role}
          </span>
        </div>
        {onRemove && (
          <button 
            className="btn btn-icon btn-danger"
            onClick={onRemove}
            aria-label={`Remove ${member.name}`}
            title="Remove member"
          >
            ×
          </button>
        )}
      </div>
      
      {member.workload && (
        <div className="member-workload">
          <div className="workload-item">
            <span className="workload-value">{member.workload.activeTasks}</span>
            <span className="workload-label">active tasks</span>
          </div>
          <div className="workload-item">
            <span className="workload-value">{member.workload.pendingApprovals}</span>
            <span className="workload-label">pending approvals</span>
          </div>
        </div>
      )}
      
      {member.recentActivity && (
        <div className="member-activity">
          <p className="activity-label">Recent activity</p>
          <p className="activity-description">{member.recentActivity.description}</p>
          <time className="activity-time" dateTime={member.recentActivity.timestamp}>
            {formatRelativeTime(member.recentActivity.timestamp)}
          </time>
        </div>
      )}
    </article>
  );
}
