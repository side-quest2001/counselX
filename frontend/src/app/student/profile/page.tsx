'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { useRecommendations } from '@/hooks/useRecommendations';
import type { ProfileFormData } from '@/types/recommendation';

type FieldValues = {
  satScore: string;
  gpa: number;
  preferredCountry: string;
  targetMajor: string;
  sopStrength: number;
  lorStrength: number;
  budget: string;
  jeeRank: string;
  neetScore: string;
};

function toNum(v: string | undefined): number | undefined {
  if (!v || v.trim() === '') return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

function DarkSlider({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 0.5,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="w-full max-w-sm mx-auto mt-6">
      <div className="flex justify-between mb-3">
        <span className="text-white/40 text-sm">{min}</span>
        <span className="text-3xl font-bold text-white tabular-nums">{value}</span>
        <span className="text-white/40 text-sm">{max}</span>
      </div>
      <div className="relative h-2 bg-white/10 rounded-full">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-violet-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg shadow-blue-500/50 border-2 border-blue-500 transition-all pointer-events-none"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
    </div>
  );
}

const COUNTRIES = [
  { code: 'US', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: 'IN', flag: '🇮🇳', name: 'India' },
];

const inputCls =
  'w-full max-w-sm mx-auto block bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3.5 text-lg text-center transition-all';

export default function StudentProfilePage() {
  const router = useRouter();
  const { student, isLoading: authLoading } = useStudentAuth();
  const { generateMutation } = useRecommendations();

  const [currentQ, setCurrentQ] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [values, setValues] = useState<FieldValues>({
    satScore: '',
    gpa: 7,
    preferredCountry: '',
    targetMajor: '',
    sopStrength: 5,
    lorStrength: 5,
    budget: '',
    jeeRank: '',
    neetScore: '',
  });

  const isIndia = values.preferredCountry === 'India';

  const set = useCallback(<K extends keyof FieldValues>(key: K, val: FieldValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleSubmit = () => {
    const payload: ProfileFormData = {
      satScore: isIndia ? undefined : toNum(values.satScore),
      jeeRank: isIndia ? toNum(values.jeeRank) : undefined,
      neetScore: isIndia ? toNum(values.neetScore) : undefined,
      gpa: values.gpa,
      sopStrength: values.sopStrength,
      lorStrength: values.lorStrength,
      preferredCountry: values.preferredCountry || undefined,
      budget: toNum(values.budget),
      targetMajor: values.targetMajor || undefined,
    };

    setLoadingMsg(0);
    [0, 1, 2].forEach((i) => setTimeout(() => setLoadingMsg(i), i * 1400));

    generateMutation.mutate(payload, {
      onSuccess: () => setTimeout(() => router.push('/student/recommendations'), 3200),
    });
  };

  // ── Dynamic question list ────────────────────────────────────────────────────
  // Built inline so isIndia is always current
  const questions = [
    // Q0 — Country (always first)
    {
      question: 'Where do you want to study?',
      hint: 'Select your preferred destination',
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-sm mx-auto mt-4">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => set('preferredCountry', c.name)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-sm font-medium ${
                values.preferredCountry === c.name
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-2xl">{c.flag}</span>
              <span className="leading-tight text-center">{c.name}</span>
            </button>
          ))}
        </div>
      ),
    },

    // Q1 — Major
    {
      question: 'What do you want to study?',
      hint: 'Your intended major or field',
      content: (
        <input
          type="text"
          value={values.targetMajor}
          onChange={(e) => set('targetMajor', e.target.value)}
          placeholder="e.g. Computer Science"
          className={inputCls}
          onKeyDown={(e) => e.key === 'Enter' && goNext()}
          autoFocus
        />
      ),
    },

    // Q2 — Score (adaptive based on country)
    isIndia
      ? {
          question: 'What are your entrance exam scores?',
          hint: 'Enter JEE rank and / or NEET score — skip what doesn\'t apply',
          content: (
            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="flex gap-4 w-full max-w-sm mx-auto">
                <div className="flex-1">
                  <label className="block text-white/40 text-xs mb-2 text-center uppercase tracking-wider">JEE Rank</label>
                  <input
                    type="number"
                    value={values.jeeRank}
                    onChange={(e) => set('jeeRank', e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-center transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-white/40 text-xs mb-2 text-center uppercase tracking-wider">NEET Score</label>
                  <input
                    type="number"
                    value={values.neetScore}
                    onChange={(e) => set('neetScore', e.target.value)}
                    placeholder="e.g. 650"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-center transition-all"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={goNext}
                className="text-white/40 hover:text-white/60 text-sm underline underline-offset-2 transition-colors"
              >
                Skip — not applicable
              </button>
            </div>
          ),
        }
      : {
          question: "What's your SAT score?",
          hint: 'Enter 400–1600, or click Continue to skip',
          content: (
            <input
              type="number"
              value={values.satScore}
              onChange={(e) => set('satScore', e.target.value)}
              placeholder="e.g. 1400"
              min={400}
              max={1600}
              className={inputCls}
              onKeyDown={(e) => e.key === 'Enter' && goNext()}
              autoFocus
            />
          ),
        },

    // Q3 — GPA
    {
      question: "What's your GPA?",
      hint: 'Use a 0–10 scale',
      content: <DarkSlider value={values.gpa} onChange={(v) => set('gpa', v)} />,
    },

    // Q4 — SOP
    {
      question: 'Rate your SOP strength',
      hint: 'Statement of Purpose — how compelling is your story?',
      content: <DarkSlider value={values.sopStrength} onChange={(v) => set('sopStrength', v)} />,
    },

    // Q5 — LOR
    {
      question: 'Rate your LOR strength',
      hint: 'Letters of Recommendation — how strong are your referees?',
      content: <DarkSlider value={values.lorStrength} onChange={(v) => set('lorStrength', v)} />,
    },

    // Q6 — Budget
    {
      question: "What's your annual budget? (USD)",
      hint: 'Include tuition and living costs. Click Continue to skip.',
      content: (
        <div className="flex flex-col items-center gap-3 mt-6">
          <input
            type="number"
            value={values.budget}
            onChange={(e) => set('budget', e.target.value)}
            placeholder="e.g. 50000"
            className={inputCls}
            onKeyDown={(e) => e.key === 'Enter' && goNext()}
            autoFocus
          />
          <button
            type="button"
            onClick={goNext}
            className="text-white/40 hover:text-white/60 text-sm underline underline-offset-2 transition-colors"
          >
            Skip this question
          </button>
        </div>
      ),
    },
  ];

  const TOTAL_QUESTIONS = questions.length;
  const progressPct = (currentQ / TOTAL_QUESTIONS) * 100;

  function goNext() {
    if (currentQ < TOTAL_QUESTIONS - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      handleSubmit();
    }
  }

  function goBack() {
    if (currentQ > 0) setCurrentQ((q) => q - 1);
  }

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (generateMutation.isPending || generateMutation.isSuccess) {
    const msgs = [
      'Analyzing your profile...',
      'Matching with similar students...',
      'Preparing your recommendations...',
    ];
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6"
        >
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 opacity-30 blur-xl animate-pulse" />
            <svg className="absolute inset-0 w-24 h-24 animate-spin" viewBox="0 0 96 96" fill="none">
              <circle cx="48" cy="48" r="40" stroke="url(#grad)" strokeWidth="4" strokeLinecap="round" strokeDasharray="160 80" />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-2 rounded-full bg-[#111118] flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingMsg}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl font-semibold text-white mb-2"
            >
              {msgs[loadingMsg] ?? msgs[msgs.length - 1]}
            </motion.p>
          </AnimatePresence>
          <p className="text-white/40 text-sm">This takes just a moment</p>
        </motion.div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  const q = questions[currentQ];
  const isLast = currentQ === TOTAL_QUESTIONS - 1;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-violet-500"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Top nav */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 pt-2">
        <button
          type="button"
          onClick={goBack}
          className={`flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm ${currentQ === 0 ? 'invisible' : ''}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-white/30 text-sm font-medium">
          {currentQ + 1} of {TOTAL_QUESTIONS}
        </span>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentQ}-${isIndia}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
                {q.question}
              </h1>
              <p className="text-white/40 text-sm mb-2">{q.hint}</p>

              {q.content}

              <div className="mt-8">
                <motion.button
                  type="button"
                  onClick={goNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full max-w-sm mx-auto block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl text-base shadow-lg shadow-blue-500/30 transition-all"
                >
                  {isLast ? 'Get My Recommendations' : 'Continue'}
                  <svg className="w-4 h-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.button>
                <p className="text-white/20 text-xs mt-3">Press Enter or click Continue</p>
              </div>

              {generateMutation.isError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mt-4 max-w-sm mx-auto">
                  Failed to generate recommendations. Please try again.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Greeting */}
      <div className="fixed bottom-6 left-0 right-0 text-center">
        <p className="text-white/20 text-xs">
          Hi {student?.name ?? 'there'} — let&apos;s find your perfect university
        </p>
      </div>
    </div>
  );
}
