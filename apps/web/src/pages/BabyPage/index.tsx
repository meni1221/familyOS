import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import { api } from '../../lib/api';
import { errorMessage } from '../../lib/errorMessage';
import { daysSince } from '../../lib/format';
import { useToast } from '../../hooks/useToast';
import type { BabyLog, BabyProfile } from '../../lib/types';
import BabyLogForm from './BabyLogForm';
import BabyTimeline from './BabyTimeline';
import BabyProfileModal from './BabyProfileModal';
import type { LogFormData, ProfileFormData } from './schemas';

/**
 * The baby routine: the profile, the activity timeline and the form that feeds
 * it. The pieces live next to this file.
 */
export default function BabyPage() {
  const client = useQueryClient();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'timeline' | 'add'>('timeline');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['baby', 'profile'],
    queryFn: async () =>
      (await api.get<{ data: BabyProfile | null }>('/api/v1/baby/profile')).data,
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['baby', 'logs'],
    queryFn: async () => (await api.get<{ data: BabyLog[] }>('/api/v1/baby/logs')).data ?? [],
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
    mutationFn: (values: ProfileFormData) =>
      api.post('/api/v1/baby/profile', {
        displayName: values.displayName,
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString() : undefined,
      }),
    onSuccess: () => {
      invalidate();
      setIsProfileOpen(false);
      toast.success('הפרופיל נשמר');
    },
    onError: (error) => toast.error('שמירת הפרופיל נכשלה', errorMessage(error)),
  });

  const ageInDays = profile?.dateOfBirth ? daysSince(profile.dateOfBirth) : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">שגרת התינוק</h1>
          <p className="text-sm text-ink-secondary">
            {profileLoading
              ? 'טוען…'
              : profile?.displayName
                ? `${profile.displayName}${ageInDays !== null ? ` · בן/בת ${ageInDays} ימים` : ''}`
                : 'הגדירו פרופיל תינוק כדי להתחיל'}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary btn-sm" onClick={() => setIsProfileOpen(true)}>
            <IconPencil className="h-4 w-4" />
            פרופיל
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

      {activeTab === 'add' ? (
        <BabyLogForm
          isPending={createLog.isPending}
          error={createLog.error}
          onSubmit={(values) => createLog.mutateAsync(values)}
        />
      ) : (
        <BabyTimeline
          logs={logs ?? []}
          isLoading={logsLoading}
          isDeleting={deleteLog.isPending}
          onAdd={() => setActiveTab('add')}
          onDelete={(id) => deleteLog.mutate(id)}
        />
      )}

      <BabyProfileModal
        open={isProfileOpen}
        profile={profile}
        isPending={saveProfile.isPending}
        error={saveProfile.error}
        onClose={() => setIsProfileOpen(false)}
        onSubmit={(values) => saveProfile.mutate(values)}
      />
    </div>
  );
}
