import { useState } from 'react';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import DeleteButton from '../../../components/ui/DeleteButton';
import Modal from '../../../components/ui/Modal';
import type { BabyProfile } from '../../../lib/types';
import { babyColorTokens, babyInitial } from '../../../lib/babyColors';
import { profileAge } from '../profileAge';
import type { ProfileFormData } from '../schemas';
import BabyForm from '../BabyForm';

interface BabyManagerModalProps {
  open: boolean;
  profiles: BabyProfile[];
  /** A save is in flight, so the form waits. */
  isSaving: boolean;
  saveError: unknown;
  /** A delete is in flight, so every delete button waits. */
  isDeleting: boolean;
  onClose: () => void;
  onSave: (values: ProfileFormData, profileId: string | null) => Promise<unknown>;
  onDelete: (profile: BabyProfile) => void;
}

/**
 * Adding, renaming and removing the family's babies.
 *
 * One dialog with two faces: the list, and the form for one baby. Escape (and
 * the close button) steps back from the form to the list before closing, so a
 * half-typed name is never thrown away by a stray keypress.
 */
const BabyManagerModal = ({
  open,
  profiles,
  isSaving,
  saveError,
  isDeleting,
  onClose,
  onSave,
  onDelete,
}: BabyManagerModalProps) => {
  /** `null` shows the list; otherwise the form, for a new or existing baby. */
  const [editing, setEditing] = useState<{ profile: BabyProfile | null } | null>(null);

  const stepBack = () => {
    if (editing) {
      setEditing(null);
      return;
    }
    onClose();
  };

  const submit = async (formValues: ProfileFormData) => {
    await onSave(formValues, editing?.profile?.id ?? null);
    setEditing(null);
  };

  const title = editing
    ? editing.profile
      ? 'עריכת תינוק/ת'
      : 'הוספת תינוק/ת'
    : 'התינוקות שלי';

  return (
    <Modal open={open} title={title} onClose={stepBack}>
      {editing ? (
        <BabyForm
          profile={editing.profile}
          isPending={isSaving}
          error={saveError}
          onCancel={() => setEditing(null)}
          onSubmit={submit}
        />
      ) : (
        <>
          {profiles.length === 0 ? (
            <p className="text-sm text-ink-secondary">
              עוד לא הוגדר תינוק/ת. אפשר גם פשוט לרשום פעילות ביומן — הפרופיל ייווצר לבד.
            </p>
          ) : (
            <ul className="space-y-2">
              {profiles.map((profile) => {
                const tokens = babyColorTokens(profile.color);
                const age = profileAge(profile);

                return (
                  <li
                    key={profile.id}
                    className="flex flex-wrap items-center gap-3 rounded-8 border border-border px-3 py-2"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${tokens.avatar}`}
                      aria-hidden="true"
                    >
                      {babyInitial(profile)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{profile.displayName}</p>
                      <p className="text-xs text-ink-secondary">{age ?? 'בלי תאריך לידה'}</p>
                    </div>

                    <button
                      type="button"
                      className="btn-ghost btn-sm shrink-0"
                      onClick={() => setEditing({ profile })}
                      aria-label={`עריכת ${profile.displayName}`}
                    >
                      <IconPencil className="h-4 w-4" />
                      עריכה
                    </button>

                    <DeleteButton
                      itemLabel={`את ${profile.displayName} ואת הרשומות שלו`}
                      disabled={isDeleting}
                      onConfirm={() => onDelete(profile)}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="button"
            className="btn-secondary btn-sm mt-4"
            onClick={() => setEditing({ profile: null })}
          >
            <IconPlus className="h-4 w-4" />
            הוספת תינוק/ת
          </button>
        </>
      )}
    </Modal>
  );
};

export default BabyManagerModal;
