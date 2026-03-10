'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import studentApi from '@/lib/studentApi';
import type { ProfileFormData, RecommendationResult, StoredProfile } from '@/types/recommendation';

export function useRecommendations() {
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (profile: ProfileFormData) =>
      studentApi.post('/recommendations', profile).then((r) => r.data.data as RecommendationResult),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', 'profiles'] });
    },
  });

  return { generateMutation };
}

export function useStoredProfiles() {
  return useQuery<StoredProfile[]>({
    queryKey: ['recommendations', 'profiles'],
    queryFn: () => studentApi.get('/recommendations/profiles').then((r) => r.data.data),
    staleTime: 30_000,
  });
}

export function useProfileRecommendation(profileId: string | null) {
  return useQuery<RecommendationResult>({
    queryKey: ['recommendations', 'profile', profileId],
    queryFn: () =>
      studentApi.get(`/recommendations/profiles/${profileId}`).then((r) => r.data.data),
    enabled: !!profileId,
    staleTime: 60_000,
  });
}
