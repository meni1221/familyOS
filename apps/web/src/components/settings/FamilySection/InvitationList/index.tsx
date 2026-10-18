import { IconTrash } from '@tabler/icons-react';
import Badge from '../../../ui/Badge';
import { useRevokeInvitation } from '../../../../hooks/useFamily';
import { useToast } from '../../../../hooks/useToast';
import { useConfirm } from '../../../../hooks/useConfirm';
import { errorMessage } from '../../../../lib/errorMessage';
import { formatDate } from '../../../../lib/format';
import type { FamilyInvitation } from '../../../../lib/types';
import { invitationLabels, invitationVariant } from '../labels';

interface InvitationListProps {
  invitations: FamilyInvitation[];
  /** Only the family owner may revoke a pending invitation. */
  canInvite: boolean;
}

/** The invitations sent so far, with their state and expiry. */
export default function InvitationList({ invitations, canInvite }: InvitationListProps) {
  const revokeInvitation = useRevokeInvitation();
  const toast = useToast();
  const confirm = useConfirm();

  const revoke = async (id: string, email: string) => {
    const confirmed = await confirm({
      title: 'ביטול הזמנה',
      description: `לבטל את ההזמנה שנשלחה אל ${email}? הקישור שכבר נשלח יפסיק לעבוד.`,
      confirmLabel: 'ביטול ההזמנה',
      cancelLabel: 'סגירה',
      tone: 'danger',
    });

    if (!confirmed) return;

    revokeInvitation.mutate(id, {
      onSuccess: () => toast.success('ההזמנה בוטלה', email),
      onError: (error) => toast.error('ביטול ההזמנה נכשל', errorMessage(error)),
    });
  };

  return (
    <ul className="space-y-2">
      {invitations.map((invitation) => (
        <li
          key={invitation.id}
          className="flex flex-wrap items-center gap-2 rounded-4 border border-border px-3 py-2"
        >
          <span className="min-w-0 flex-1 truncate text-sm text-ink" dir="ltr">
            {invitation.email}
          </span>
          <Badge variant={invitationVariant[invitation.status]}>
            {invitationLabels[invitation.status]}
          </Badge>
          <span className="text-xs text-ink-secondary">עד {formatDate(invitation.expiresAt)}</span>
          {canInvite && invitation.status === 'PENDING' && (
            <button
              type="button"
              className="btn-ghost btn-sm text-error"
              onClick={() => revoke(invitation.id, invitation.email)}
              disabled={revokeInvitation.isPending}
              aria-label={`ביטול ההזמנה ${invitation.email}`}
            >
              <IconTrash className="h-4 w-4" />
              ביטול
            </button>
          )}
        </li>
      ))}
      {invitations.length === 0 && (
        <li className="text-sm text-ink-secondary">אין הזמנות ממתינות</li>
      )}
    </ul>
  );
}
