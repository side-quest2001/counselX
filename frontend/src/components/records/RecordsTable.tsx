'use client';

import { useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { useRecords, useDeleteRecord } from '@/hooks/useRecords';
import { EditRecordModal } from './EditRecordModal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { StudentContextRecord } from '@/types/record';

const columnHelper = createColumnHelper<StudentContextRecord>();

interface RecordsTableProps {
  datasetId: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  const timer = setTimeout(() => setDebounced(value), delay);
  clearTimeout(timer);
  // Simple debounce via useEffect pattern
  return debounced;
}

export function RecordsTable({ datasetId }: RecordsTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editRecord, setEditRecord] = useState<StudentContextRecord | null>(null);

  const { mutate: deleteRecord, isPending: isDeleting } = useDeleteRecord();

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    const t = setTimeout(() => setDebouncedSearch(val), 300);
    return () => clearTimeout(t);
  }, []);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

  const { data, isLoading, isFetching } = useRecords(datasetId, {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: debouncedSearch || undefined,
    sortBy: sortBy as keyof StudentContextRecord | undefined,
    sortOrder: sorting[0] ? sortOrder : undefined,
  });

  const columns = [
    columnHelper.accessor('satScore', { header: 'SAT', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.accessor('neetScore', { header: 'NEET', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.accessor('jeeScore', { header: 'JEE', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.accessor('studentProfileScore', { header: 'Profile Score', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.accessor('courseInterest', { header: 'Course', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.accessor('preferredCountry', { header: 'Country', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.accessor('preferredState', { header: 'State', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.accessor('profileRating', { header: 'Rating', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.accessor('recommendedCollege', {
      header: 'College',
      cell: (i) => (
        <span className="max-w-[150px] truncate block" title={i.getValue() ?? ''}>
          {i.getValue() ?? '—'}
        </span>
      ),
    }),
    columnHelper.accessor('recommendedCourse', { header: 'Rec. Course', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditRecord(info.row.original)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            loading={isDeleting}
            onClick={() =>
              deleteRecord(info.row.original.id)
            }
          >
            Del
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.meta.totalPages ?? -1,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <>
      <div className="space-y-4">
        {/* Search + count */}
        <div className="flex items-center justify-between gap-4">
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search country, course, college..."
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isFetching && !isLoading && <Spinner size="sm" />}
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {data?.meta.total.toLocaleString() ?? 0} records
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && ' ↑'}
                      {header.column.getIsSorted() === 'desc' && ' ↓'}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    <Spinner className="mx-auto" />
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                    No records found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5 text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing{' '}
            {data?.meta
              ? `${(data.meta.page - 1) * data.meta.limit + 1}–${Math.min(
                  data.meta.page * data.meta.limit,
                  data.meta.total
                )}`
              : 0}{' '}
            of {data?.meta.total.toLocaleString() ?? 0}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span className="px-2">
              Page {pagination.pageIndex + 1} / {data?.meta.totalPages ?? 1}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {editRecord && (
        <EditRecordModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
        />
      )}
    </>
  );
}
