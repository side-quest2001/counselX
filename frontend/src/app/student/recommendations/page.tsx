'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { useStoredProfiles, useProfileRecommendation } from '@/hooks/useRecommendations';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';
import type { RecommendationCategory } from '@/types/recommendation';

const CATEGORY_CONFIG: Record<
  RecommendationCategory,
  { label: string; glow: string; ring: string; badge: string; bg: string; text: string }
> = {
  SAFE: {
    label: 'Safe',
    glow: 'shadow-green-500/20',
    ring: 'ring-green-500/40',
    badge: 'bg-green-500/15 text-green-400 border border-green-500/30',
    bg: 'from-green-500/10 to-transparent',
    text: 'text-green-400',
  },
  TARGET: {
    label: 'Target',
    glow: 'shadow-amber-500/20',
    ring: 'ring-amber-500/40',
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    bg: 'from-amber-500/10 to-transparent',
    text: 'text-amber-400',
  },
  AMBITIOUS: {
    label: 'Ambitious',
    glow: 'shadow-rose-500/20',
    ring: 'ring-rose-500/40',
    badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    bg: 'from-rose-500/10 to-transparent',
    text: 'text-rose-400',
  },
};

const ROADMAP_STEPS = [
  {
    icon: '🔍',
    title: 'Research & Shortlist',
    desc: 'Deep-dive into your recommended universities. Review rankings, program structures, faculty, and campus culture.',
    month: 'Month 1–2',
    color: 'blue',
  },
  {
    icon: '📝',
    title: 'Test Preparation',
    desc: 'Strengthen SAT / GRE / IELTS / TOEFL scores. Consider retaking if your current scores are below program median.',
    month: 'Month 2–4',
    color: 'violet',
  },
  {
    icon: '✍️',
    title: 'Essays & SOP',
    desc: 'Craft compelling Statement of Purpose for each university. Tailor every essay to the program\'s unique values.',
    month: 'Month 4–6',
    color: 'pink',
  },
  {
    icon: '📬',
    title: 'Applications',
    desc: 'Submit applications with all supporting documents — transcripts, CV, recommendation letters, and financials.',
    month: 'Month 6–8',
    color: 'orange',
  },
  {
    icon: '🤝',
    title: 'Interviews & Follow-up',
    desc: 'Prepare for university interviews. Stay in contact with admissions offices and follow up on pending decisions.',
    month: 'Month 8–10',
    color: 'teal',
  },
  {
    icon: '🎓',
    title: 'Decision & Enrollment',
    desc: 'Compare offers, negotiate scholarships, and confirm enrollment. Begin visa and housing preparations.',
    month: 'Month 10–12',
    color: 'green',
  },
];

const STEP_COLORS: Record<string, string> = {
  blue: 'border-blue-500/50 bg-blue-500/5 text-blue-400',
  violet: 'border-violet-500/50 bg-violet-500/5 text-violet-400',
  pink: 'border-pink-500/50 bg-pink-500/5 text-pink-400',
  orange: 'border-orange-500/50 bg-orange-500/5 text-orange-400',
  teal: 'border-teal-500/50 bg-teal-500/5 text-teal-400',
  green: 'border-green-500/50 bg-green-500/5 text-green-400',
};

const STEP_DOT_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
  green: 'bg-green-500',
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function ConfidenceRing({ score, category }: { score: number; category: RecommendationCategory }) {
  const pct = Math.round(score * 100);
  const radius = 20;
  const circ = 2 * Math.PI * radius;
  const strokeDash = (pct / 100) * circ;
  const color = category === 'SAFE' ? '#22c55e' : category === 'TARGET' ? '#f59e0b' : '#f43f5e';

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <motion.circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - strokeDash }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{pct}%</span>
      </div>
    </div>
  );
}

function parseInsightSections(text: string): { heading: string; body: string }[] {
  if (!text) return [];

  // Try to split on numbered headings like "1. Heading\n" or "**Heading**\n"
  const numbered = text.split(/\n(?=\d+[\.\)]\s+[A-Z])/);
  if (numbered.length > 2) {
    return numbered
      .map((chunk) => {
        const lines = chunk.trim().split('\n');
        const first = lines[0].replace(/^\d+[\.\)]\s*/, '').replace(/\*\*/g, '').trim();
        const rest = lines.slice(1).join(' ').replace(/\*\*/g, '').trim();
        return { heading: first, body: rest };
      })
      .filter((s) => s.heading && s.body);
  }

  // Try bold headings: **Heading**
  const bold = text.split(/\n(?=\*\*)/);
  if (bold.length > 2) {
    return bold
      .map((chunk) => {
        const cleaned = chunk.replace(/\*\*/g, '');
        const lines = cleaned.trim().split('\n');
        return { heading: lines[0].trim(), body: lines.slice(1).join(' ').trim() };
      })
      .filter((s) => s.heading && s.body);
  }

  // Fallback: split on double newlines into paragraphs
  const paras = text.split(/\n{2,}/).filter(Boolean);
  if (paras.length <= 1) {
    return [{ heading: 'Counselor Analysis', body: text.trim() }];
  }
  return paras.slice(0, 5).map((p, i) => {
    const sentences = p.split(/[.!?]\s+/);
    const heading = sentences[0]?.trim().substring(0, 60) || `Insight ${i + 1}`;
    const body = p.replace(/\*\*/g, '').trim();
    return { heading: heading.length < p.length ? heading : `Insight ${i + 1}`, body };
  });
}

const INSIGHT_ICONS = ['🎯', '📊', '💡', '⚡', '🏆', '🌟'];
const INSIGHT_COLORS = [
  'border-violet-500/30 bg-violet-500/5',
  'border-blue-500/30 bg-blue-500/5',
  'border-teal-500/30 bg-teal-500/5',
  'border-pink-500/30 bg-pink-500/5',
  'border-amber-500/30 bg-amber-500/5',
  'border-green-500/30 bg-green-500/5',
];

function SkeletonCards() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#111118] rounded-2xl border border-white/10 p-5 flex gap-4">
          <Skeleton className="w-14 h-14 rounded-full bg-white/5 flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-4 w-2/3 mb-3 bg-white/5" />
            <Skeleton className="h-2 w-full bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RecommendationsPage() {
  const { student, isLoading: authLoading, logout } = useStudentAuth();
  const { data: profiles, isLoading: profilesLoading } = useStoredProfiles();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'universities' | 'roadmap' | 'insights' | 'mentors'>('universities');

  const latestProfileId = profiles?.[0]?.id ?? null;
  const activeProfileId = selectedProfileId ?? latestProfileId;

  const { data: result, isLoading: resultLoading } = useProfileRecommendation(activeProfileId);

  if (authLoading || profilesLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const insightSections = result ? parseInsightSections(result.llmInsight ?? '') : [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="bg-[#0d0d14]/80 border-b border-white/[0.06] px-6 py-4 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-white tracking-tight">CounselX</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/40 hidden sm:block">{student?.name}</span>
            <button
              onClick={logout}
              className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-28">
        {/* Profile selector */}
        {profiles && profiles.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span className="text-xs text-white/30 mr-1 uppercase tracking-wider">Profile:</span>
            {profiles.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setSelectedProfileId(p.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  activeProfileId === p.id
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-sm shadow-blue-500/20'
                    : 'bg-white/[0.03] text-white/40 border-white/[0.08] hover:border-white/20 hover:text-white/60'
                }`}
              >
                Profile {i + 1} · {new Date(p.createdAt).toLocaleDateString()}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!profiles || profiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-violet-500/10 rounded-3xl flex items-center justify-center ring-1 ring-white/10">
              <span className="text-3xl">🎓</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No recommendations yet</h2>
            <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Fill in your academic profile to get personalised university recommendations powered by real student data.
            </p>
            <Link
              href="/student/profile"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30"
            >
              Build My Profile
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        ) : resultLoading ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600/20 to-violet-600/20 rounded-2xl border border-white/10 p-8">
              <Skeleton className="h-8 w-48 mb-2 bg-white/10" />
              <Skeleton className="h-4 w-64 bg-white/5" />
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl bg-white/10" />
                ))}
              </div>
            </div>
            <SkeletonCards />
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Hero banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e1a] p-8"
            >
              {/* Gradient orbs */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/30 mb-2 font-medium">Your Recommendations</p>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                      {student?.name ?? 'Your Profile'}
                    </h1>
                    <p className="text-white/40 text-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                      Matched against {result.similarCount} similar student profiles
                    </p>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    {(['SAFE', 'TARGET', 'AMBITIOUS'] as RecommendationCategory[]).map((cat) => {
                      const count = result.universities.filter((u) => u.category === cat).length;
                      const cfg = CATEGORY_CONFIG[cat];
                      return (
                        <div
                          key={cat}
                          className="flex flex-col items-center justify-center bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-3 min-w-[80px]"
                        >
                          <span className="text-2xl font-bold text-white">{count}</span>
                          <span className={`text-xs mt-0.5 font-medium ${cfg.text}`}>{cfg.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tab nav */}
                <div className="flex gap-1 mt-6 bg-white/[0.03] rounded-xl p-1 w-fit border border-white/[0.06]">
                  {[
                    { key: 'universities', label: '🎓 Universities' },
                    { key: 'roadmap', label: '🗺️ Roadmap' },
                    { key: 'insights', label: '💡 Insights' },
                    ...(result.mentors.length > 0 ? [{ key: 'mentors', label: '🤝 Mentors' }] : []),
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as typeof activeTab)}
                      className={`text-xs font-medium px-4 py-2 rounded-lg transition-all ${
                        activeTab === tab.key
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === 'universities' && (
                <motion.div
                  key="universities"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {(['SAFE', 'TARGET', 'AMBITIOUS'] as RecommendationCategory[]).map((cat) => {
                    const unis = result.universities.filter((u) => u.category === cat);
                    if (unis.length === 0) return null;
                    const cfg = CATEGORY_CONFIG[cat];
                    return (
                      <div key={cat}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                          <span className="text-xs text-white/20">{unis.length} {unis.length === 1 ? 'university' : 'universities'}</span>
                        </div>

                        <div className="grid gap-3">
                          {unis.map((u, idx) => (
                            <motion.div
                              key={u.universityName}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              whileHover={{ y: -2 }}
                              className={`group relative overflow-hidden bg-[#111118] rounded-2xl border border-white/[0.07] hover:border-white/[0.14] shadow-md ${cfg.glow} transition-all duration-200 p-5`}
                            >
                              {/* Subtle gradient sweep on hover */}
                              <div className={`absolute inset-0 bg-gradient-to-r ${cfg.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                              <div className="relative z-10 flex items-center gap-4">
                                {/* Initials avatar */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 bg-gradient-to-br ${
                                  cat === 'SAFE' ? 'from-green-500/20 to-emerald-600/10 text-green-400 ring-1 ring-green-500/20' :
                                  cat === 'TARGET' ? 'from-amber-500/20 to-yellow-600/10 text-amber-400 ring-1 ring-amber-500/20' :
                                  'from-rose-500/20 to-red-600/10 text-rose-400 ring-1 ring-rose-500/20'
                                }`}>
                                  {getInitials(u.universityName)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-white text-[15px] truncate group-hover:text-white transition-colors">
                                    {u.universityName}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-white/30">{u.admitCount} similar admits</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className={`text-xs font-medium ${cfg.text}`}>
                                      {Math.round(u.confidenceScore * 100)}% match
                                    </span>
                                  </div>
                                </div>

                                {/* Confidence ring */}
                                <ConfidenceRing score={u.confidenceScore} category={cat} />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {activeTab === 'roadmap' && (
                <motion.div
                  key="roadmap"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">Your Application Roadmap</h2>
                    <p className="text-sm text-white/40 mt-1">A 12-month plan to maximise your chances of admission</p>
                  </div>

                  <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-blue-500/40 via-violet-500/30 to-transparent sm:left-7" />

                    <div className="space-y-4">
                      {ROADMAP_STEPS.map((step, i) => (
                        <motion.div
                          key={step.title}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="relative flex gap-5 pl-14 sm:pl-16"
                        >
                          {/* Timeline dot */}
                          <div className={`absolute left-4 sm:left-5 top-5 w-4 h-4 rounded-full border-2 border-[#0a0a0f] ${STEP_DOT_COLORS[step.color]} z-10 shadow-md`} />

                          {/* Card */}
                          <div className={`flex-1 border rounded-2xl p-5 transition-all hover:shadow-lg ${STEP_COLORS[step.color]}`}>
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{step.icon}</span>
                                <div>
                                  <p className="font-semibold text-white text-[15px]">{step.title}</p>
                                  <p className="text-xs text-white/30 mt-0.5">{step.month}</p>
                                </div>
                              </div>
                              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/[0.08] text-white/30 font-medium">
                                Step {i + 1} of {ROADMAP_STEPS.length}
                              </span>
                            </div>
                            <p className="text-sm text-white/50 mt-3 leading-relaxed">{step.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'insights' && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center ring-1 ring-violet-500/20">
                      <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">AI Counselor Insights</h2>
                      <p className="text-xs text-violet-400">Personalised analysis based on your profile</p>
                    </div>
                  </div>

                  {insightSections.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {insightSections.map((section, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className={`rounded-2xl border p-5 ${INSIGHT_COLORS[i % INSIGHT_COLORS.length]}`}
                        >
                          <div className="flex items-center gap-2.5 mb-3">
                            <span className="text-xl">{INSIGHT_ICONS[i % INSIGHT_ICONS.length]}</span>
                            <h3 className="font-semibold text-white text-sm leading-tight">{section.heading}</h3>
                          </div>
                          <p className="text-sm text-white/55 leading-relaxed">{section.body}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#111118] rounded-2xl border border-violet-500/20 p-7">
                      <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
                        {result.llmInsight ?? 'No insights available yet. Please regenerate your profile.'}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'mentors' && result.mentors.length > 0 && (
                <motion.div
                  key="mentors"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">Connect with Mentors</h2>
                    <p className="text-sm text-white/40 mt-1">Alumni from your target universities on Topmate</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {result.mentors.map((m, i) => (
                      <motion.a
                        key={m.university}
                        href={m.searchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -3 }}
                        className="group flex flex-col justify-between p-5 rounded-2xl border border-white/[0.07] bg-[#111118] hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all duration-200 shadow-sm"
                      >
                        <div>
                          <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors ring-1 ring-orange-500/20">
                            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <p className="font-semibold text-white/80 group-hover:text-white text-sm leading-snug mb-2 transition-colors">
                            {m.label}
                          </p>
                          <p className="text-xs text-white/30 leading-relaxed">{m.university}</p>
                        </div>

                        <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-orange-400 group-hover:text-orange-300 transition-colors">
                          <span>View on Topmate</span>
                          <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : null}
      </main>

      {/* Floating "New Profile" button */}
      {profiles && profiles.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link href="/student/profile">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold px-5 py-3 rounded-full shadow-lg shadow-blue-500/30 text-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Profile
            </motion.button>
          </Link>
        </div>
      )}
    </div>
  );
}
