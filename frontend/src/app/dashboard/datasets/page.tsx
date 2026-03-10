'use client';

import Link from 'next/link';
import { useDatasets } from '@/hooks/useDatasets';
import { DatasetTable } from '@/components/datasets/DatasetTable';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';

export default function DatasetsPage() {
  const { data: datasets, isLoading, error, refetch } = useDatasets();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">All Datasets</h2>
          <p className="text-sm text-gray-500">
            {datasets?.length ?? 0} dataset(s) ingested
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
          <Link href="/dashboard/upload">
            <Button size="sm">+ Upload Dataset</Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Failed to load datasets.
        </div>
      ) : (
        <Card>
          <div className="p-4">
            <DatasetTable datasets={datasets ?? []} />
          </div>
        </Card>
      )}
    </div>
  );
}
