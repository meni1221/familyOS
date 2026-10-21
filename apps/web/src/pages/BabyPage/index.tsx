import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconPlus, IconUsers } from '@tabler/icons-react';
import { api } from '../../lib/api';
import { errorMessage } from '../../lib/errorMessage';
import { useToast } from '../../hooks/useToast';
import type { BabyLog, BabyProfile } from '../../lib/types';
import BabyLogForm from './BabyLogForm';
import BabyManagerModal from './BabyManagerModal';
import BabySwitcher from './BabySwitcher';
import BabyTimeline from './BabyTimeline';
import { profileAge } from './profileAge';
import type { LogFormData, ProfileFormData } from './schemas';

/**
 * The baby routine: the babies of the family, the timeline of whichever one is
 * selected, and the form that feeds it. Switching a baby only changes what the
 * timeline asks for, so twins never share a list by accident.
 */
const BabyPage = () => {
  const client = useQueryClient();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'timeline' | 'add'>('timeline');
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [selected, setSelected] = useState('all');

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['baby', 'profiles'],
    queryFn: async () =>
      (await api.get<{ data: BabyProfile[] }>('/api/v1/baby/profiles')).data ?? [],
  });

  // Derived rather than stored: a baby deleted here (or on another device)
  // stops being the selection by itself, and the timeline falls back to "all".
  const selectedProfile = profiles.find((profile) => profile.id === selected) ?? null;
  const activeId = selectedProfile?.id ?? null;

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['baby', 'logs', activeId ?? 'all'],
    queryFn: async () =>
      (
        await api.get<{ data: BabyLog[] }>(
          activeId ? `/api/v1/baby/logs?babyProfileId=${activeId}` : '/api/v1/baby/logs'
        )
      ).data ?? [],
  });

  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['baby'] });
    void client.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createLog = useMutation({
    mutationFn: (values: LogFormData) => {
      const details: Record<string, unknown> = {};
      if (values.type === 'FEEDING' && values.amountMl) details.amountMl = Number(values.amountMl);
      if (values.type === 'SLEEP' && values.durationMinutes) {
        details.durationMinutes = Number(values.durationMinutes);
      }
      if (values.type === 'DIAPER' && values.diaperType) details.diaperType = values.diaperType;

      return api.post('/api/v1/baby/logs', {
        type: values.type,
        // Left out only while the family has no baby yet: the API creates one.
        babyProfileId: values.babyProfileId || undefined,
        occurredAt: new Date(values.occurredAt).toISOString(),
        note: values.note?.trim() || undefined,
        details: Object.keys(details).length > 0 ? details : undefined,
      });
    },
    onSuccess: () => {
      invalidate();
      setActiveTab('timeline');
      toast.success('הרשומה נוספה ליומן');
    },
    onError: (error) => toast.error('הוספת הרשומה נכשלה', errorMessage(error)),
  });

  const deleteLog = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/baby/logs/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success('הרשומה נמחקה');
    },
    onError: (error) => toast.error('מחיקת הרשומה נכשלה', errorMessage(error)),
  });

  const saveProfile = useMutation({
    mutationFn: ({ id, values }: { id: string | null; values: ProfileFormData }) => {
      const body = {
        displayName: values.displayName,
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString() : undefined,
        color: values.color,
      };

      return id
        ? api.patch<{ data: BabyProfile }>(`/api/v1/baby/profiles/${id}`, body)
        : api.post<{ data: BabyProfile }>('/api/v1/baby/profiles', body);
    },
    onSuccess: (result, variables) => {
      invalidate();
      // Adding a baby selects it, which is what a parent adding a twin wants.
      if (!variables.id && result?.data?.id) setSelected(result.data.id);
      toast.success(variables.id ? 'הפרטים עודכנו' : 'התינוק/ת נוספו');
    },
    onError: (error) => toast.error('שמירת הפרטים נכשלה', errorMessage(error)),
  });

  const deleteProfile = useMutation({
    mutationFn: (profile: BabyProfile) =>
      api.del<{ deletedLogs: number }>(`/api/v1/baby/profiles/${profile.id}`),
    onSuccess: (result) => {
      invalidate();
      toast.success(
        'הפרופיל נמחק',
        result?.deletedLogs ? `נמחקו גם ${result.deletedLogs} רשומות` : undefined
      );
    },
    onError: (error) => toast.error('מחיקת הפרופיל נכשלה', errorMessage(error)),
  });

  const heading = profiles.length > 1 ? 'שגרת התינוקות' : 'שגרת התינוק';
  const onlyProfile = profiles.length === 1 ? profiles[0] : null;
  const headerProfile = selectedProfile ?? onlyProfile;
  const headerAge = profileAge(headerProfile);

  const summary = profilesLoading
    ? 'טוען…'
    : headerProfile
      ? `${headerProfile.displayName}${headerAge ? ` · ${headerAge}` : ''}`
      : profiles.length > 1
        ? `${profiles.length} תינוקות · ${logs.length} רשומות`
        : 'הגדירו פרופיל תינוק כדי להתחיל';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{heading}</h1>
          <p className="text-sm text-ink-secondary">{summary}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => setIsManagerOpen(true)}
          >
            <IconUsers className="h-4 w-4" />
            תינוקות
          </button>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => setActiveTab(activeTab === 'add' ? 'timeline' : 'add')}
          >
            <IconPlus className="h-4 w-4" />
            {activeTab === 'add' ? 'חזרה לציר הזמן' : 'רשום פעילות'}
          </button>
        </div>
      </div>

      {activeTab === 'timeline' && profiles.length > 1 && (
        <BabySwitcher
          profiles={profiles}
          selected={activeId ?? 'all'}
          onSelect={setSelected}
        />
      )}

      {activeTab === 'add' ? (
        <BabyLogForm
          // A form keyed by the baby it starts on: switching babies gets a
          // fresh one rather than a stale default hiding in the select.
          key={activeId ?? 'all'}
          profiles={profiles}
          defaultBabyProfileId={activeId ?? profiles[0]?.id ?? ''}
          isPending={createLog.isPending}
          error={createLog.error}
          onSubmit={(values) => createLog.mutateAsync(values)}
        />
      ) : (
        <BabyTimeline
          logs={logs}
          profiles={profiles}
          showBaby={profiles.length > 1 && !selectedProfile}
          babyName={selectedProfile?.displayName ?? onlyProfile?.displayName ?? null}
          isLoading={logsLoading}
          isDeleting={deleteLog.isPending}
          onAdd={() => setActiveTab('add')}
          onDelete={(id) => deleteLog.mutate(id)}
        />
      )}

      <BabyManagerModal
        open={isManagerOpen}
        profiles={profiles}
        isSaving={saveProfile.isPending}
        saveError={saveProfile.error}
        isDeleting={deleteProfile.isPending}
        onClose={() => setIsManagerOpen(false)}
        onSave={(values, id) => saveProfile.mutateAsync({ id, values })}
        onDelete={(profile) => deleteProfile.mutate(profile)}
      />
    </div>
  );
};

export default BabyPage;
