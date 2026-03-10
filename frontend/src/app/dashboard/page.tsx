'use client';

import Link from 'next/link';
import { useDashboardStats } from '@/hooks/useDatasets';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Failed to load dashboard stats.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Datasets"
          value={stats?.totalDatasets ?? 0}
          color="bg-blue-100"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          }
        />
        <StatCard
          label="Total Records"
          value={(stats?.totalRecords ?? 0).toLocaleString()}
          color="bg-green-100"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Completed"
          value={stats?.statusCounts?.COMPLETED ?? 0}
          color="bg-emerald-100"
          icon={
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Failed"
          value={stats?.statusCounts?.FAILED ?? 0}
          color="bg-red-100"
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/upload">
          <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 py-5">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Upload New Dataset</p>
                <p className="text-sm text-gray-500">Import a CSV file to ingest</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/datasets">
          <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 py-5">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Browse Datasets</p>
                <p className="text-sm text-gray-500">View and manage all datasets</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Latest Upload */}
      {stats?.latestUpload && (
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-gray-700 mb-1">Latest Upload</p>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900">{stats.latestUpload.name}</span>
              <StatusBadge status={stats.latestUpload.status} />
              <span className="text-sm text-gray-500 ml-auto">
                {new Date(stats.latestUpload.uploadedAt).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
