import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IconDownload, IconTrash, IconUserCircle } from '@tabler/icons-react';
import SectionCard from '../SectionCard';
import Modal from '../../ui/Modal';
import { useConfirm } from '../../../hooks/useConfirm';
import { useToast } from '../../../hooks/useToast';
import { api } from '../../../lib/api';
import { errorMessage } from '../../../lib/errorMessage';

/**
 * Taking your data with you, and closing the account.
 *
 * The export is a plain download — no email, no waiting. The deletion asks
 * twice, because it cannot be undone: once as a question, then for the password
 * that proves the person asking is the account owner.
 */
const AccountSection = () => {
  const confirm = useConfirm();
  const toast = useToast();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [password, setPassword] = useState('');

  const download = useMutation({
    mutationFn: () => api.download('/api/v1/settings/export'),
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('הקובץ הורד');
    },
    onError: (error) => toast.error('הייצוא נכשל', errorMessage(error)),
  });

  const removeAccount = useMutation({
    mutationFn: () => api.del('/api/v1/settings/account', { password }),
    onSuccess: () => {
      toast.success('החשבון נמחק');
      client.clear();
      navigate('/login', { replace: true });
    },
    onError: (error) => toast.error('מחיקת החשבון נכשלה', errorMessage(error)),
  });

  const askToDelete = async () => {
    const ok = await confirm({
      title: 'למחוק את החשבון?',
      description:
        'החשבון ייסגר לצמיתות. אם עוד אנשים חברים במשפחה, הבעלות תעבור לחבר/ה הוותיק/ה ביותר והנתונים יישארו אצלם. אם לא, גם נתוני המשפחה יימחקו. אין דרך חזרה.',
      confirmLabel: 'המשך למחיקה',
      tone: 'danger',
    });
    if (!ok) return;

    setPassword('');
    setIsDeleteOpen(true);
  };

  return (
    <>
      <SectionCard icon={IconUserCircle} title="החשבון" description="ייצוא הנתונים וסגירת החשבון">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">הורדת הנתונים</p>
              <p className="text-xs text-ink-secondary">
                קובץ JSON עם הפרופיל וכל נתוני המשפחה.
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => download.mutate()}
              disabled={download.isPending}
            >
              <IconDownload className="h-4 w-4" />
              {download.isPending ? 'מכין…' : 'הורדת הקובץ'}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div>
              <p className="text-sm font-medium text-error">מחיקת החשבון</p>
              <p className="text-xs text-ink-secondary">סגירה סופית של החשבון ושל החברות במשפחה.</p>
            </div>
            <button
              type="button"
              className="btn-danger btn-sm"
              onClick={() => void askToDelete()}
            >
              <IconTrash className="h-4 w-4" />
              מחיקת החשבון
            </button>
          </div>
        </div>
      </SectionCard>

      <Modal
        open={isDeleteOpen}
        title="אישור מחיקת החשבון"
        onClose={() => setIsDeleteOpen(false)}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setIsDeleteOpen(false)}>
              ביטול
            </button>
            <button
              type="button"
              className="btn-danger"
              disabled={!password || removeAccount.isPending}
              onClick={() => removeAccount.mutate()}
            >
              {removeAccount.isPending ? 'מוחק…' : 'מחיקת החשבון'}
            </button>
          </>
        }
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            removeAccount.mutate();
          }}
        >
          <p className="text-sm text-ink-secondary">
            הזינו את הסיסמה הנוכחית כדי לאשר. הפעולה אינה הפיכה.
          </p>
          <div>
            <label htmlFor="delete-password" className="label">
              סיסמה
            </label>
            <input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </form>

        {removeAccount.isError && (
          <p role="alert" className="mt-3 text-sm text-error">
            {errorMessage(removeAccount.error)}
          </p>
        )}
      </Modal>
    </>
  );
};

export default AccountSection;
