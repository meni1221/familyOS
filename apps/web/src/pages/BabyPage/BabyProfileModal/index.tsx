import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../../components/ui/Modal';
import { toDateInputValue } from '../../../lib/format';
import type { BabyProfile } from '../../../lib/types';
import { profileSchema, type ProfileFormData } from '../schemas';

interface BabyProfileModalProps {
  open: boolean;
  /** The saved profile, if the family created one already. */
  profile: BabyProfile | null | undefined;
  isPending: boolean;
  /** Mutation error, shown inline when it happened. */
  error: unknown;
  onClose: () => void;
  onSubmit: (values: ProfileFormData) => void;
}

/** Name and date of birth, which the age in the header is derived from. */
export default function BabyProfileModal({
  open,
  profile,
  isPending,
  error,
  onClose,
  onSubmit,
}: BabyProfileModalProps) {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: '', dateOfBirth: '' },
  });

  // Every opening starts from what is saved today.
  useEffect(() => {
    if (open) {
      form.reset({
        displayName: profile?.displayName ?? '',
        dateOfBirth: profile?.dateOfBirth ? toDateInputValue(new Date(profile.dateOfBirth)) : '',
      });
    }
  }, [open, profile, form]);

  return (
    <Modal
      open={open}
      title="פרופיל התינוק/ת"
      onClose={onClose}
      footer={
        <>
          <button
            type="submit"
            form="baby-profile-form"
            className="btn-primary btn-sm"
            disabled={isPending}
          >
            {isPending ? 'שומר…' : 'שמירה'}
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={onClose}>
            ביטול
          </button>
        </>
      }
    >
      <form id="baby-profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="baby-name" className="label">
            שם
          </label>
          <input
            id="baby-name"
            className={`input ${form.formState.errors.displayName ? 'input-error' : ''}`}
            {...form.register('displayName')}
          />
          {form.formState.errors.displayName && (
            <p className="mt-1 text-xs text-error">{form.formState.errors.displayName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="baby-dob" className="label">
            תאריך לידה
          </label>
          <input
            id="baby-dob"
            type="date"
            className="input"
            max={toDateInputValue()}
            {...form.register('dateOfBirth')}
          />
        </div>

        {Boolean(error) && (
          <p className="text-xs text-error" role="alert">
            {error instanceof Error ? error.message : 'השמירה נכשלה'}
          </p>
        )}
      </form>
    </Modal>
  );
}
