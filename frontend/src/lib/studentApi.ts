'use client';

import axios from 'axios';
import Cookies from 'js-cookie';

export const STUDENT_TOKEN_KEY = 'student_token';

const studentApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 60000,
});

studentApi.interceptors.request.use((config) => {
  const token = Cookies.get(STUDENT_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

studentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove(STUDENT_TOKEN_KEY);
      if (typeof window !== 'undefined') {
        window.location.href = '/student/login';
      }
    }
    return Promise.reject(error);
  }
);

export default studentApi;
