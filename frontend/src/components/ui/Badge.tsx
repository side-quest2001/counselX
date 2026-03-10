import { cn } from '@/lib/cn';
import type { DatasetStatus } from '@/types/dataset';

interface BadgeProps {
  status: DatasetStatus;
  className?: string;
}

const STATUS_STYLES: Record<DatasetStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        STATUS_STYLES[status],
        className
      )}
    >
      {status}
    </span>
  );
}
