'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AnalyticsData } from '@/types/recommendation';

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: () => api.get('/datasets/analytics').then((r) => r.data.data),
    staleTime: 60_000,
  });
}
