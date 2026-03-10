'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpload } from '@/hooks/useUpload';
import { DropZone } from '@/components/upload/DropZone';
import { UploadProgress } from '@/components/upload/UploadProgress';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { UploadCSVResponse } from '@/types/dataset';

const UploadSchema = z.object({
  name: z.string().min(1, 'Dataset name is required').max(255),
  description: z.string().max(1000).optional(),
});

type UploadFormData = z.infer<typeof UploadSchema>;

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadCSVResponse | null>(null);
  const { mutate: upload, isPending, uploadProgress, isError, error } = useUpload();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(UploadSchema),
  });

  const onSubmit = (data: UploadFormData) => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', data.name);
    if (data.description) {
      formData.append('description', data.description);
    }

    mutate(formData, {
      onSuccess: (result) => {
        setUploadResult(result);
        setSelectedFile(null);
        reset();
      },
    });
  };

  function mutate(formData: FormData, options?: { onSuccess?: (result: UploadCSVResponse) => void }) {
    upload(formData, options);
  }

  const handleReset = () => {
    setUploadResult(null);
    setSelectedFile(null);
    reset();
  };

  if (uploadResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Upload Summary</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Success banner */}
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-green-800">Dataset ingested successfully</p>
                <p className="text-sm text-green-600">{uploadResult.message}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{uploadResult.data.rowCount}</p>
                <p className="text-xs text-gray-500">Records inserted</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{uploadResult.data.errorCount}</p>
                <p className="text-xs text-gray-500">Rows rejected</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {uploadResult.data.rowCount + uploadResult.data.errorCount}
                </p>
                <p className="text-xs text-gray-500">Total rows</p>
              </div>
            </div>

            {/* Validation errors */}
            {uploadResult.data.errors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-red-700 mb-2">
                  Rejected rows (showing first {uploadResult.data.errors.length}):
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {uploadResult.data.errors.map((err, i) => (
                    <div key={i} className="text-xs bg-red-50 border border-red-100 rounded p-2">
                      <span className="font-medium text-red-700">Row {err.rowIndex}: </span>
                      <span className="text-red-600">{err.issues.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={handleReset} variant="primary">
                Upload Another Dataset
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = `/dashboard/datasets/${uploadResult.data.datasetId}`}
              >
                View Dataset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Upload CSV Dataset</h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload a CSV file to ingest student context records into the platform.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="name"
              label="Dataset Name"
              placeholder="e.g. Batch 2024 SAT Scores"
              error={errors.name?.message}
              {...register('name')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Brief description of this dataset..."
                {...register('description')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSV File
              </label>
              <DropZone
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
              />
            </div>

            {/* Upload progress */}
            {isPending && selectedFile && uploadProgress > 0 && (
              <UploadProgress
                progress={uploadProgress}
                fileName={selectedFile.name}
              />
            )}

            {/* Error */}
            {isError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  {(error as Error)?.message || 'Upload failed. Please try again.'}
                </p>
              </div>
            )}

            {/* Column mapping info */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs font-medium text-blue-800 mb-1">Supported column names:</p>
              <p className="text-xs text-blue-600">
                SAT / sat_score · NEET / neet_score · JEE / jee_score · course_interest ·
                preferred_country · budget_range · profile_rating · sop_strength · lor_strength ·
                target_college_rank · student_profile_score · recommended_college · recommended_course
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!selectedFile}
              loading={isPending}
            >
              {isPending ? 'Processing...' : 'Upload & Ingest'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
