'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { ProfileFormData } from '@/types/recommendation';

const schema = z.object({
  satScore: z.coerce.number().int().min(400).max(1600).optional().or(z.literal('')),
  jeeRank: z.coerce.number().int().min(1).optional().or(z.literal('')),
  neetScore: z.coerce.number().min(0).optional().or(z.literal('')),
  gpa: z.coerce.number().min(0).max(10).optional().or(z.literal('')),
  sopStrength: z.coerce.number().min(0).max(10).optional().or(z.literal('')),
  lorStrength: z.coerce.number().min(0).max(10).optional().or(z.literal('')),
  extracurricularScore: z.coerce.number().min(0).max(10).optional().or(z.literal('')),
  preferredCountry: z.string().optional(),
  budget: z.coerce.number().min(0).optional().or(z.literal('')),
  targetMajor: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function toNum(v: unknown) {
  if (v === '' || v === undefined || v === null) return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const { student, isLoading: authLoading } = useStudentAuth();
  const { generateMutation } = useRecommendations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormValues) => {
    const payload: ProfileFormData = {
      satScore: toNum(data.satScore),
      jeeRank: toNum(data.jeeRank),
      neetScore: toNum(data.neetScore),
      gpa: toNum(data.gpa),
      sopStrength: toNum(data.sopStrength),
      lorStrength: toNum(data.lorStrength),
      extracurricularScore: toNum(data.extracurricularScore),
      preferredCountry: data.preferredCountry || undefined,
      budget: toNum(data.budget),
      targetMajor: data.targetMajor || undefined,
    };
    generateMutation.mutate(payload, {
      onSuccess: () => router.push('/student/recommendations'),
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">CounselX</span>
          </div>
          <span className="text-sm text-gray-500">Hi, {student?.name ?? 'Student'}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tell us about yourself</h1>
          <p className="text-gray-500 text-sm mt-1">
            Fill in as much as you can — every field helps improve your recommendations.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Test Scores */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Test Scores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SAT Score (400–1600)</label>
                <Input {...register('satScore')} type="number" placeholder="e.g. 1400" />
                {errors.satScore && <p className="text-red-500 text-xs mt-1">{errors.satScore.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GPA (0–10)</label>
                <Input {...register('gpa')} type="number" step="0.1" placeholder="e.g. 8.5" />
                {errors.gpa && <p className="text-red-500 text-xs mt-1">{errors.gpa.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">JEE Rank</label>
                <Input {...register('jeeRank')} type="number" placeholder="e.g. 5000" />
                {errors.jeeRank && <p className="text-red-500 text-xs mt-1">{errors.jeeRank.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NEET Score</label>
                <Input {...register('neetScore')} type="number" placeholder="e.g. 650" />
                {errors.neetScore && <p className="text-red-500 text-xs mt-1">{errors.neetScore.message}</p>}
              </div>
            </div>
          </section>

          {/* Application Strengths */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Application Strengths (0–10)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SOP Strength</label>
                <Input {...register('sopStrength')} type="number" step="0.1" placeholder="e.g. 7.5" />
                {errors.sopStrength && <p className="text-red-500 text-xs mt-1">{errors.sopStrength.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LOR Strength</label>
                <Input {...register('lorStrength')} type="number" step="0.1" placeholder="e.g. 8" />
                {errors.lorStrength && <p className="text-red-500 text-xs mt-1">{errors.lorStrength.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Extracurriculars</label>
                <Input {...register('extracurricularScore')} type="number" step="0.1" placeholder="e.g. 6" />
                {errors.extracurricularScore && (
                  <p className="text-red-500 text-xs mt-1">{errors.extracurricularScore.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Preferences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Country</label>
                <Input {...register('preferredCountry')} placeholder="e.g. United States" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Major</label>
                <Input {...register('targetMajor')} placeholder="e.g. Computer Science" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USD/year)</label>
                <Input {...register('budget')} type="number" placeholder="e.g. 50000" />
                {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
              </div>
            </div>
          </section>

          {generateMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
              Failed to generate recommendations. Please try again.
            </div>
          )}

          <Button type="submit" className="w-full" disabled={generateMutation.isPending}>
            {generateMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                Generating recommendations…
              </span>
            ) : (
              'Get My Recommendations'
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
