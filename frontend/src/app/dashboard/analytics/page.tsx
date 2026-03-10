'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-40 truncate flex-shrink-0">{label || '—'}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium text-gray-700 w-10 text-right">{value}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        Failed to load analytics data.
      </div>
    );
  }

  const maxUniversity = Math.max(...data.topUniversities.map((u) => u.count), 1);
  const maxMajor = Math.max(...data.majorDistribution.map((m) => m.count), 1);
  const maxCountry = Math.max(...data.countryDistribution.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Aggregated insights from all student context records</p>
      </div>

      {/* Top Universities + Avg SAT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Top Recommended Universities</h2>
            <p className="text-xs text-gray-500 mt-0.5">Most frequently recommended colleges in dataset</p>
          </CardHeader>
          <CardContent>
            {data.topUniversities.length === 0 ? (
              <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {data.topUniversities.map((u) => (
                  <BarRow key={u.university} label={u.university ?? '—'} value={u.count} max={maxUniversity} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Average SAT by Country</h2>
            <p className="text-xs text-gray-500 mt-0.5">Mean SAT score across preferred destination countries</p>
          </CardHeader>
          <CardContent>
            {data.avgSatByCountry.length === 0 ? (
              <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {data.avgSatByCountry.map((c) => (
                  <div key={c.country} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{c.country ?? '—'}</span>
                    <span className="text-sm font-semibold text-gray-900">{Math.round(c.avgSat).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Major + Country distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Major Distribution</h2>
            <p className="text-xs text-gray-500 mt-0.5">Course interests across all student records</p>
          </CardHeader>
          <CardContent>
            {data.majorDistribution.length === 0 ? (
              <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {data.majorDistribution.map((m) => (
                  <BarRow key={m.major} label={m.major ?? '—'} value={m.count} max={maxMajor} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Country Distribution</h2>
            <p className="text-xs text-gray-500 mt-0.5">Preferred destination countries</p>
          </CardHeader>
          <CardContent>
            {data.countryDistribution.length === 0 ? (
              <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {data.countryDistribution.map((c) => (
                  <BarRow key={c.country} label={c.country ?? '—'} value={c.count} max={maxCountry} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
