'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { useStoredProfiles, useProfileRecommendation } from '@/hooks/useRecommendations';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import type { RecommendationCategory } from '@/types/recommendation';

const CATEGORY_COLORS: Record<RecommendationCategory, string> = {
  SAFE: 'bg-green-100 text-green-700 border-green-200',
  TARGET: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  AMBITIOUS: 'bg-red-100 text-red-700 border-red-200',
};

const CATEGORY_LABELS: Record<RecommendationCategory, string> = {
  SAFE: 'Safe',
  TARGET: 'Target',
  AMBITIOUS: 'Ambitious',
};

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 60 ? 'bg-green-500' : pct >= 30 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function RecommendationsPage() {
  const { student, isLoading: authLoading, logout } = useStudentAuth();
  const { data: profiles, isLoading: profilesLoading } = useStoredProfiles();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const latestProfileId = profiles?.[0]?.id ?? null;
  const activeProfileId = selectedProfileId ?? latestProfileId;

  const { data: result, isLoading: resultLoading } = useProfileRecommendation(activeProfileId);

  if (authLoading || profilesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">CounselX</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/student/profile">
              <Button size="sm" variant="secondary">New Profile</Button>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{student?.name}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Profile selector */}
        {profiles && profiles.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500 mr-1">Profile:</span>
            {profiles.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setSelectedProfileId(p.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  activeProfileId === p.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                Profile {i + 1} · {new Date(p.createdAt).toLocaleDateString()}
              </button>
            ))}
          </div>
        )}

        {!profiles || profiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No recommendations yet</h2>
            <p className="text-gray-500 text-sm mb-6">Fill in your profile to get personalized university recommendations.</p>
            <Link href="/student/profile">
              <Button>Get My Recommendations</Button>
            </Link>
          </div>
        ) : resultLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : result ? (
          <>
            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4">
              {(['SAFE', 'TARGET', 'AMBITIOUS'] as RecommendationCategory[]).map((cat) => {
                const count = result.universities.filter((u) => u.category === cat).length;
                return (
                  <div key={cat} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${CATEGORY_COLORS[cat]}`}>
                      {CATEGORY_LABELS[cat]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* University cards */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">University Matches</h2>
                <p className="text-xs text-gray-500 mt-0.5">Based on {result.similarCount} similar profiles in our database</p>
              </div>
              <div className="divide-y divide-gray-50">
                {result.universities.map((u) => (
                  <div key={u.universityName} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{u.universityName}</p>
                      <ConfidenceBar score={u.confidenceScore} />
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${CATEGORY_COLORS[u.category]}`}>
                      {CATEGORY_LABELS[u.category]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-900">AI Counselor Insights</h2>
              </div>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                {result.llmInsight}
              </div>
            </div>

            {/* Mentors */}
            {result.mentors.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="font-semibold text-gray-900">Connect with Mentors</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Find alumni from your target universities on Topmate for guidance and mock interviews.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.mentors.map((m) => (
                    <a
                      key={m.university}
                      href={m.searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 truncate mr-2">
                        {m.label}
                      </span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
