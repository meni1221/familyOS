import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  CurrentFamily,
  FamilyInvitation,
  FamilyMember,
  UserRole,
} from '../lib/types';

const membersKey = ['family', 'members'];
const invitationsKey = ['family', 'invitations'];
const currentKey = ['family', 'current'];

export function useCurrentFamily() {
  return useQuery({
    queryKey: currentKey,
    queryFn: async () =>
      (await api.get<{ data: CurrentFamily }>('/api/v1/families/current')).data,
  });
}

export function useFamilyMembers() {
  return useQuery({
    queryKey: membersKey,
    queryFn: async () =>
      (await api.get<{ data: FamilyMember[] }>('/api/v1/families/members')).data ?? [],
  });
}

export function useFamilyInvitations() {
  return useQuery({
    queryKey: invitationsKey,
    queryFn: async () =>
      (await api.get<{ data: FamilyInvitation[] }>('/api/v1/families/invitations')).data ?? [],
  });
}

/** Creates an invitation and returns its copyable `inviteUrl`. */
export function useCreateInvitation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (payload: { email: string; role: UserRole }) =>
      api.post<{
        data: { id: string; email: string; role: UserRole; inviteUrl: string; expiresAt: string };
      }>('/api/v1/families/invitations', payload),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: invitationsKey });
    },
  });
}

export function useRevokeInvitation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      api.del<{ success: boolean }>(`/api/v1/families/invitations/${invitationId}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: invitationsKey });
    },
  });
}

/** Accepts an invite token, then refreshes everything family-scoped. */
export function useAcceptInvitation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (token: string) =>
      api.post<{ success: boolean; familyId: string }>('/api/v1/families/invitations/accept', {
        token,
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: currentKey });
      void client.invalidateQueries({ queryKey: membersKey });
      void client.invalidateQueries({ queryKey: ['auth'] });
      void client.invalidateQueries({ queryKey: ['dashboard'] });
      void client.invalidateQueries({ queryKey: ['tasks'] });
      void client.invalidateQueries({ queryKey: ['calendar'] });
      void client.invalidateQueries({ queryKey: ['budget'] });
      void client.invalidateQueries({ queryKey: ['baby'] });
    },
  });
}
