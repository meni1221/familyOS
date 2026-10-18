import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconCopy, IconTrash, IconUserPlus, IconUsers } from '@tabler/icons-react';
import SectionCard from './SectionCard';
import Badge from '../ui/Badge';
import {
  useCreateInvitation,
  useCurrentFamily,
  useFamilyInvitations,
  useFamilyMembers,
  useRevokeInvitation,
} from '../../hooks/useFamily';
import { formatDate } from '../../lib/format';
import type { FamilyInvitation } from '../../lib/types';

const inviteSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  role: z.enum(['OWNER', 'MEMBER']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

const roleLabels: Record<string, string> = {
  OWNER: 'בעל/ת המשפחה',
  MEMBER: 'חבר/ה',
};

const invitationVariant: Record<FamilyInvitation['status'], 'success' | 'warning' | 'neutral'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  EXPIRED: 'neutral',
};

const invitationLabels: Record<FamilyInvitation['status'], string> = {
  PENDING: 'ממתינה',
  ACCEPTED: 'אושרה',
  EXPIRED: 'פגה תוקף',
};

export default function FamilySection() {
  const { data: family, isLoading: familyLoading } = useCurrentFamily();
  const { data: members } = useFamilyMembers();
  const { data: invitations } = useFamilyInvitations();

  const createInvitation = useCreateInvitation();
  const revokeInvitation = useRevokeInvitation();

  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'MEMBER' },
  });

  const onSubmit = async (values: InviteFormData) => {
    setCopied(false);
    const response = await createInvitation.mutateAsync(values);
    setInviteUrl(response.data.inviteUrl);
    reset({ email: '', role: 'MEMBER' });
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const myRole = members?.find((member) => member.isYou)?.role;
  const canInvite = myRole === 'OWNER';

  return (
    <SectionCard
      title="המשפחה"
      description="חברים והזמנות להצטרפות"
      icon={IconUsers}
    >
      <div className="space-y-5">
        <div className="rounded-4 bg-cream px-3 py-2">
          <p className="text-sm font-medium text-ink">
            {familyLoading ? 'טוען…' : (family?.name ?? '—')}
          </p>
          <p className="text-xs text-ink-secondary">
            {family?.memberCount ?? 0} חברים · מטבע ברירת מחדל: {family?.defaultCurrency ?? 'ILS'}
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink">חברי המשפחה</h3>
          <ul className="space-y-2">
            {(members ?? []).map((member) => (
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
                  <span className="block truncate text-xs text-ink-secondary">
                    {member.email}
                  </span>
                </span>
                <Badge variant={member.role === 'OWNER' ? 'success' : 'neutral'}>
                  {roleLabels[member.role] ?? member.role}
                </Badge>
              </li>
            ))}
            {(!members || members.length === 0) && (
              <li className="text-sm text-ink-secondary">אין חברים להצגה</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink">הזמנות</h3>

          {canInvite ? (
            <form onSubmit={handleSubmit(onSubmit)} className="mb-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <label htmlFor="invite-email" className="label">
                    כתובת אימייל להזמנה
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    dir="ltr"
                    className={`input ${errors.email ? 'input-error' : ''}`}
                    placeholder="name@example.com"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-error">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="invite-role" className="label">
                    הרשאה
                  </label>
                  <select id="invite-role" className="input" {...register('role')}>
                    <option value="MEMBER">חבר/ה</option>
                    <option value="OWNER">בעל/ת המשפחה</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary btn-sm"
                disabled={isSubmitting || createInvitation.isPending}
              >
                <IconUserPlus className="h-4 w-4" />
                {createInvitation.isPending ? 'יוצר הזמנה…' : 'יצירת הזמנה'}
              </button>

              {createInvitation.isError && (
                <p className="text-xs text-error" role="alert">
                  {createInvitation.error instanceof Error
                    ? createInvitation.error.message
                    : 'יצירת ההזמנה נכשלה'}
                </p>
              )}
            </form>
          ) : (
            <p className="mb-3 text-xs text-ink-secondary">
              רק בעל/ת המשפחה יכולים להזמין חברים חדשים.
            </p>
          )}

          {inviteUrl && (
            <div className="mb-3 rounded-4 border border-forest/30 bg-sage-light px-3 py-2">
              <p className="text-xs font-medium text-forest">קישור ההזמנה נוצר</p>
              <p className="mb-2 text-xs text-ink-secondary">
                שליחת אימייל אינה מוגדרת בשרת — העבירו את הקישור ידנית למוזמן/ת.
              </p>
              <div className="flex items-center gap-2">
                <input
                  dir="ltr"
                  className="input text-xs"
                  value={inviteUrl}
                  readOnly
                  onFocus={(event) => event.target.select()}
                  aria-label="קישור הזמנה"
                />
                <button type="button" className="btn-secondary btn-sm shrink-0" onClick={copyInvite}>
                  <IconCopy className="h-4 w-4" />
                  {copied ? 'הועתק' : 'העתקה'}
                </button>
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {(invitations ?? []).map((invitation) => (
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
                <span className="text-xs text-ink-secondary">
                  עד {formatDate(invitation.expiresAt)}
                </span>
                {canInvite && invitation.status === 'PENDING' && (
                  <button
                    type="button"
                    className="btn-ghost btn-sm text-error"
                    onClick={() => revokeInvitation.mutate(invitation.id)}
                    disabled={revokeInvitation.isPending}
                    aria-label={`ביטול ההזמנה ${invitation.email}`}
                  >
                    <IconTrash className="h-4 w-4" />
                    ביטול
                  </button>
                )}
              </li>
            ))}
            {(!invitations || invitations.length === 0) && (
              <li className="text-sm text-ink-secondary">אין הזמנות ממתינות</li>
            )}
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}
