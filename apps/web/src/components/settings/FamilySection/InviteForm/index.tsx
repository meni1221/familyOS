import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCopy, IconUserPlus } from '@tabler/icons-react';
import { useCreateInvitation } from '../../../../hooks/useFamily';
import { inviteSchema, type InviteFormData } from '../schemas';

interface InviteFormProps {
  /** Only the family owner may invite new people. */
  canInvite: boolean;
}

/**
 * Invites someone by email and shows the resulting link, since the server does
 * not send mail yet.
 */
export default function InviteForm({ canInvite }: InviteFormProps) {
  const createInvitation = useCreateInvitation();
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

  if (!canInvite) {
    return (
      <p className="mb-3 text-xs text-ink-secondary">
        רק בעל/ת המשפחה יכולים להזמין חברים חדשים.
      </p>
    );
  }

  return (
    <>
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
            {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
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
    </>
  );
}
