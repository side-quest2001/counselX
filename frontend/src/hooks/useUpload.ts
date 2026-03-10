'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';
import type { UploadCSVResponse } from '@/types/dataset';

export function useUpload() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation<UploadCSVResponse, Error, FormData>({
    mutationFn: (formData: FormData) =>
      api
        .post('/etl/upload-csv', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              setUploadProgress(pct);
            }
          },
        })
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      setUploadProgress(0);
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  return { ...mutation, uploadProgress };
}
