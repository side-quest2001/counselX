'use client';

import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import type { StudentContextRecord, RecordQueryParams, RecordsResponse } from '@/types/record';

export function useRecords(datasetId: string, params: RecordQueryParams) {
  return useQuery<RecordsResponse>({
    queryKey: ['records', datasetId, params],
    queryFn: () =>
      api
        .get(`/datasets/${datasetId}/records`, { params })
        .then((r) => ({ data: r.data.data, meta: r.data.meta })),
    placeholderData: keepPreviousData,
    enabled: !!datasetId,
  });
}

export function useUpdateRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<StudentContextRecord>;
    }) => api.put(`/records/${id}`, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/records/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
}
