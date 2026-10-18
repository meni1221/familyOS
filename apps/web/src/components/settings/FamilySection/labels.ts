import type { FamilyInvitation } from '../../../lib/types';

export const roleLabels: Record<string, string> = {
  OWNER: 'בעל/ת המשפחה',
  MEMBER: 'חבר/ה',
};

export const invitationVariant: Record<
  FamilyInvitation['status'],
  'success' | 'warning' | 'neutral'
> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  EXPIRED: 'neutral',
};

export const invitationLabels: Record<FamilyInvitation['status'], string> = {
  PENDING: 'ממתינה',
  ACCEPTED: 'אושרה',
  EXPIRED: 'פגה תוקף',
};
