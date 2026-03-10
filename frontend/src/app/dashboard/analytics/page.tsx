'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { Spinner } from '@/components/ui/Spinner';
import { motion } from 'framer-motion';

const PALETTE = [
  'from-blue-500 to-blue-400',
  'from-violet-500 to-violet-400',
  'from-indigo-500 to-indigo-400',
  'from-cyan-500 to-cyan-400',
  'from-teal-500 to-teal-400',
  'from-sky-500 to-sky-400',
  'from-purple-500 to-purple-400',
  'from-pink-500 to-pink-400',
];

function AnimatedBar({
  label,
  value,
  max,
  index,
  suffix = '',
}: {
  label: string;
  value: number;
  max: number;
  index: number;
  suffix?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const gradient = PALETTE[index % PALETTE.length];

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700 truncate max-w-[60%]">{label || '—'}</span>
        <span className="text-sm font-semibold text-gray-900 ml-2 tabular-nums">
          {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(0) : value}
          {suffix}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className={`bg-gradient-to-r ${gradient} h-2.5 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: index * 0.06 }}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-gray-50">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="px-6 py-5">{children}</div>
    </motion.div>
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
      <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
        <span className="text-lg">⚠️</span>
        Failed to load analytics data.
      </div>
    );
  }

  const maxUniversity = Math.max(...data.topUniversities.map((u) => u.count), 1);
  const maxMajor = Math.max(...data.majorDistribution.map((m) => m.count), 1);
  const maxCountry = Math.max(...data.countryDistribution.map((c) => c.count), 1);
  const maxSat = Math.max(...data.avgSatByCountry.map((c) => c.avgSat), 1);

  const totalRecords = data.countryDistribution.reduce((s, c) => s + c.count, 0);
  const topCountry = data.countryDistribution[0]?.country ?? '—';
  const topMajor = data.majorDistribution[0]?.major ?? '—';
  const topUni = data.topUniversities[0]?.university ?? '—';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-400 mt-0.5">Aggregated insights from all student context records</p>
      </div>

      {/* Stat summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Records" value={totalRecords.toLocaleString()} color="bg-blue-50" />
        <StatCard icon="🌍" label="Top Country" value={topCountry} sub="Most popular destination" color="bg-violet-50" />
        <StatCard icon="📚" label="Top Major" value={topMajor} sub="Most common interest" color="bg-teal-50" />
        <StatCard icon="🏛️" label="Top University" value={topUni} sub="Most recommended" color="bg-amber-50" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Top Recommended Universities"
          subtitle="Most frequently recommended colleges in dataset"
          delay={0.05}
        >
          {data.topUniversities.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-4">
              {data.topUniversities.map((u, i) => (
                <AnimatedBar
                  key={u.university}
                  label={u.university ?? '—'}
                  value={u.count}
                  max={maxUniversity}
                  index={i}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Average SAT by Country"
          subtitle="Mean SAT score across preferred destination countries"
          delay={0.1}
        >
          {data.avgSatByCountry.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-4">
              {data.avgSatByCountry.map((c, i) => (
                <AnimatedBar
                  key={c.country}
                  label={c.country ?? '—'}
                  value={Math.round(c.avgSat)}
                  max={maxSat}
                  index={i + 2}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Major Distribution"
          subtitle="Course interests across all student records"
          delay={0.15}
        >
          {data.majorDistribution.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-4">
              {data.majorDistribution.map((m, i) => (
                <AnimatedBar
                  key={m.major}
                  label={m.major ?? '—'}
                  value={m.count}
                  max={maxMajor}
                  index={i + 4}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Country Distribution"
          subtitle="Preferred destination countries"
          delay={0.2}
        >
          {data.countryDistribution.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-4">
              {data.countryDistribution.map((c, i) => (
                <AnimatedBar
                  key={c.country}
                  label={c.country ?? '—'}
                  value={c.count}
                  max={maxCountry}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
