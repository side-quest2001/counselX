'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useDataset } from '@/hooks/useDatasets';
import { RecordsTable } from '@/components/records/RecordsTable';
import { DeleteDatasetModal } from '@/components/datasets/DeleteDatasetModal';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export default function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: dataset, isLoading, error } = useDataset(id);
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Dataset not found or failed to load.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard/datasets" className="hover:text-blue-600">
          Datasets
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{dataset.name}</span>
      </div>

      {/* Dataset info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">{dataset.name}</h2>
              <StatusBadge status={dataset.status} />
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDelete(true)}
            >
              Delete Dataset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Records</p>
              <p className="font-semibold text-gray-900">{dataset.rowCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Source</p>
              <p className="font-semibold text-gray-900 truncate">{dataset.source ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Uploaded</p>
              <p className="font-semibold text-gray-900">
                {new Date(dataset.uploadedAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Description</p>
              <p className="font-semibold text-gray-900">{dataset.description ?? '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records table */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Records</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Browse, search, edit, and delete individual records
          </p>
        </CardHeader>
        <CardContent>
          <RecordsTable datasetId={id} />
        </CardContent>
      </Card>

      {/* Delete modal */}
      {showDelete && (
        <DeleteDatasetModal
          dataset={dataset}
          onClose={() => setShowDelete(false)}
          redirectAfter
        />
      )}
    </div>
  );
}
