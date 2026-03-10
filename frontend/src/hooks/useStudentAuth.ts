'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import studentApi, { STUDENT_TOKEN_KEY } from '@/lib/studentApi';
import type { StudentSignupPayload, StudentLoginPayload, Student } from '@/types/student';

export function useStudentAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: student, isLoading } = useQuery<Student>({
    queryKey: ['student', 'me'],
    queryFn: () => studentApi.get('/students/me').then((r) => r.data.data),
    retry: false,
    enabled: !!Cookies.get(STUDENT_TOKEN_KEY),
  });

  const signupMutation = useMutation({
    mutationFn: (payload: StudentSignupPayload) =>
      studentApi.post('/students/signup', payload).then((r) => r.data),
    onSuccess: (data) => {
      Cookies.set(STUDENT_TOKEN_KEY, data.token, { expires: 7 });
      queryClient.setQueryData(['student', 'me'], data.student);
      router.push('/student/profile');
    },
  });

  const loginMutation = useMutation({
    mutationFn: (payload: StudentLoginPayload) =>
      studentApi.post('/students/login', payload).then((r) => r.data),
    onSuccess: (data) => {
      Cookies.set(STUDENT_TOKEN_KEY, data.token, { expires: 7 });
      queryClient.setQueryData(['student', 'me'], data.student);
      router.push('/student/recommendations');
    },
  });

  const logout = () => {
    Cookies.remove(STUDENT_TOKEN_KEY);
    queryClient.clear();
    router.push('/student/login');
  };

  return {
    student,
    isLoading,
    signupMutation,
    loginMutation,
    logout,
    isAuthenticated: !!student,
  };
}
