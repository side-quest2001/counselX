'use client';

import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useDeleteDataset } from '@/hooks/useDatasets';
import type { Dataset } from '@/types/dataset';

interface DeleteDatasetModalProps {
  dataset: Dataset;
  onClose: () => void;
  redirectAfter?: boolean;
}

export function DeleteDatasetModal({
  dataset,
  onClose,
  redirectAfter = false,
}: DeleteDatasetModalProps) {
  const router = useRouter();
  const { mutate: deleteDataset, isPending } = useDeleteDataset();

  const handleDelete = () => {
    deleteDataset(dataset.id, {
      onSuccess: () => {
        onClose();
        if (redirectAfter) {
          router.push('/dashboard/datasets');
        }
      },
    });
  };

  return (
    <Modal open onClose={onClose} title="Delete Dataset" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">{dataset.name}</span>?
        </p>
        <p className="text-sm text-red-600">
          This will permanently delete the dataset and all{' '}
          <span className="font-semibold">{dataset.rowCount.toLocaleString()} records</span>.
          This action cannot be undone.
        </p>

        <div className="flex gap-3 pt-2">
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={isPending}
            className="flex-1"
          >
            Delete Dataset
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
