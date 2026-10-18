import Badge from '../../../ui/Badge';
import type { FamilyMember } from '../../../../lib/types';
import { roleLabels } from '../labels';

interface MemberListProps {
  members: FamilyMember[];
}

/** Who belongs to the family, with their role. */
const MemberList = ({ members }: MemberListProps) => {
  return (
    <ul className="space-y-2">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center gap-3 rounded-4 border border-border px-3 py-2"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-light text-sm font-semibold text-forest">
            {member.displayName.charAt(0) || '?'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-ink">
              {member.displayName}
              {member.isYou && <span className="text-ink-secondary"> (את/ה)</span>}
            </span>
            <span className="block truncate text-xs text-ink-secondary">{member.email}</span>
          </span>
          <Badge variant={member.role === 'OWNER' ? 'success' : 'neutral'}>
            {roleLabels[member.role] ?? member.role}
          </Badge>
        </li>
      ))}
      {members.length === 0 && <li className="text-sm text-ink-secondary">אין חברים להצגה</li>}
    </ul>
  );
};

export default MemberList;
