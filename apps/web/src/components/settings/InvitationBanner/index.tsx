import { useSearchParams } from 'react-router-dom';
import { IconUserPlus } from '@tabler/icons-react';
import { useAcceptInvitation } from '../../../hooks/useFamily';
import { useToast } from '../../../hooks/useToast';

/**
 * Shown when the page is opened from an invitation link
 * (`/app/settings?invite=<token>`). The token is only consumed on demand, so a
 * user who is still signed in as somebody else is not silently joined.
 */
const InvitationBanner = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const acceptInvitation = useAcceptInvitation();
  const toast = useToast();

  const token = searchParams.get('invite');
  if (!token) return null;

  const clearToken = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('invite');
    setSearchParams(next, { replace: true });
  };

  const accept = async () => {
    try {
      await acceptInvitation.mutateAsync(token);
      clearToken();
      toast.success('הצטרפתם למשפחה');
    } catch {
      // The error message is rendered below; keep the token so it can be retried.
    }
  };

  return (
    <div className="card border-forest/40 bg-sage-light">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-forest">
          <IconUserPlus className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">קיבלתם הזמנה להצטרף למשפחה</p>
          <p className="text-xs text-ink-secondary">
            אישור ההזמנה יצרף אתכם למשפחה ויעביר את החשבון לצפות בנתונים שלה.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={accept}
            disabled={acceptInvitation.isPending}
          >
            {acceptInvitation.isPending ? 'מאשר…' : 'אישור ההזמנה'}
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={clearToken}>
            לא עכשיו
          </button>
        </div>
      </div>

      {acceptInvitation.isError && (
        <p className="mt-2 text-xs text-error" role="alert">
          {acceptInvitation.error instanceof Error
            ? acceptInvitation.error.message
            : 'אישור ההזמנה נכשל'}
        </p>
      )}
    </div>
  );
};

export default InvitationBanner;
