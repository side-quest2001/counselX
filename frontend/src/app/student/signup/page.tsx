'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm: z.string(),
    country: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

const FEATURE_BULLETS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>
    ),
    text: 'Personalised university matches based on your exact profile',
    color: 'text-blue-400 bg-blue-500/10',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    text: 'AI counselor insights written just for you',
    color: 'text-violet-400 bg-violet-500/10',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    text: 'Confidence scores backed by real admission data',
    color: 'text-green-400 bg-green-500/10',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    text: 'Connect with mentors from your target universities',
    color: 'text-orange-400 bg-orange-500/10',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function StudentSignupPage() {
  const { signupMutation } = useStudentAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormValues) => {
    signupMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      country: data.country,
    });
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* ── Left panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0f] relative overflow-hidden flex-col justify-between p-12 border-r border-white/5">
        {/* Orbs */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-600 opacity-20 blur-[80px]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-violet-600 opacity-20 blur-[80px]"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">CounselX</span>
          </Link>
        </div>

        {/* Main copy */}
        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-white leading-tight mb-3"
          >
            Your AI-powered path to the right university
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/50 text-sm leading-relaxed mb-8"
          >
            Join hundreds of students who found their best-fit universities using real data and AI intelligence.
          </motion.p>

          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {FEATURE_BULLETS.map((f) => (
              <motion.li key={f.text} variants={itemVariants} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                  {f.icon}
                </div>
                <span className="text-sm text-white/70 leading-relaxed">{f.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <div className="relative z-10 text-white/30 text-xs">
          Already using CounselX?{' '}
          <Link href="/student/login" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">
            Sign in
          </Link>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center bg-[#111118] px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-bold text-white">CounselX</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-white/40 text-sm mb-8">
              Get personalised university recommendations in minutes.
            </p>
          </motion.div>

          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Full Name</label>
              <Input
                {...register('name')}
                placeholder="John Doe"
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </motion.div>

            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
              <Input
                {...register('email')}
                type="email"
                placeholder="john@example.com"
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </motion.div>

            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Country <span className="text-white/30 font-normal">(optional)</span>
              </label>
              <Input
                {...register('country')}
                placeholder="India"
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
              />
            </motion.div>

            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
              <Input
                {...register('password')}
                type="password"
                placeholder="Min. 6 characters"
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </motion.div>

            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Confirm Password</label>
              <Input
                {...register('confirm')}
                type="password"
                placeholder="Repeat password"
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
              />
              {errors.confirm && (
                <p className="text-red-400 text-xs mt-1">{errors.confirm.message}</p>
              )}
            </motion.div>

            {signupMutation.isError && (
              <motion.div variants={fieldVariants}>
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                  {(signupMutation.error as { response?: { data?: { error?: string } } })?.response
                    ?.data?.error ?? 'Signup failed. Please try again.'}
                </p>
              </motion.div>
            )}

            <motion.div variants={fieldVariants} className="pt-1">
              <Button
                type="submit"
                className="w-full py-3 text-base bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                disabled={signupMutation.isPending}
                loading={signupMutation.isPending}
              >
                {signupMutation.isPending ? 'Creating account...' : 'Create Account'}
              </Button>
            </motion.div>
          </motion.form>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{' '}
            <Link href="/student/login" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
