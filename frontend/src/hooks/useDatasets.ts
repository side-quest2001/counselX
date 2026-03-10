'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Dataset, DashboardStats } from '@/types/dataset';

export function useDatasets() {
  return useQuery<Dataset[]>({
    queryKey: ['datasets'],
    queryFn: () => api.get('/datasets').then((r) => r.data.data),
    staleTime: 30_000,
  });
}

export function useDataset(id: string) {
  return useQuery<Dataset>({
    queryKey: ['datasets', id],
    queryFn: () => api.get(`/datasets/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useDeleteDataset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/datasets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['datasets', 'stats'],
    queryFn: () => api.get('/datasets/stats').then((r) => r.data.data),
    staleTime: 30_000,
  });
}
