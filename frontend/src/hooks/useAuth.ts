'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setToken, removeToken, getToken } from '@/lib/auth';
import type { LoginCredentials, AuthUser } from '@/types/auth';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery<AuthUser>({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data.data),
    retry: false,
    enabled: !!getToken(),
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      api.post('/auth/login', credentials).then((r) => r.data),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['auth', 'me'], data.user);
      router.push('/dashboard');
    },
  });

  const logout = () => {
    removeToken();
    queryClient.clear();
    router.push('/login');
  };

  return {
    user,
    isLoadingUser,
    loginMutation,
    logout,
    isAuthenticated: !!user,
  };
}
