'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DeleteDatasetModal } from './DeleteDatasetModal';
import type { Dataset } from '@/types/dataset';

const columnHelper = createColumnHelper<Dataset>();

interface DatasetTableProps {
  datasets: Dataset[];
}

export function DatasetTable({ datasets }: DatasetTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Dataset | null>(null);

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <Link
          href={`/dashboard/datasets/${info.row.original.id}`}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('rowCount', {
      header: 'Records',
      cell: (info) => info.getValue().toLocaleString(),
    }),
    columnHelper.accessor('source', {
      header: 'Source File',
      cell: (info) => (
        <span className="text-gray-500 text-sm">{info.getValue() ?? '—'}</span>
      ),
    }),
    columnHelper.accessor('uploadedAt', {
      header: 'Uploaded',
      cell: (info) => new Date(info.getValue()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/datasets/${info.row.original.id}`}>
            <Button size="sm" variant="ghost">View</Button>
          </Link>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setDeleteTarget(info.row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: datasets,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      <div className="space-y-4">
        {/* Search */}
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search datasets..."
          className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && ' ↑'}
                        {header.column.getIsSorted() === 'desc' && ' ↓'}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No datasets found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500">
          {table.getFilteredRowModel().rows.length} dataset(s)
        </p>
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteDatasetModal
          dataset={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
