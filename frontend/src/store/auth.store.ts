// src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  avatar?: string;
}

interface AuthState {
  user:        User | null;
  accessToken: string | null;
  isLoading:   boolean;
  isLoggedIn:  boolean;
  login:   (email: string, password: string) => Promise<void>;
  register:(data: RegisterData) => Promise<void>;
  logout:  () => Promise<void>;
  fetchMe: () => Promise<void>;
}

interface RegisterData {
  email: string; password: string;
  firstName: string; lastName: string; phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isLoggedIn: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.login({ email, password });
          localStorage.setItem('accessToken', data.accessToken);
          set({ user: data.user, accessToken: data.accessToken, isLoggedIn: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.register(formData);
          localStorage.setItem('accessToken', data.accessToken);
          set({ user: data.user, accessToken: data.accessToken, isLoggedIn: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await authAPI.logout().catch(() => {});
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, isLoggedIn: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await authAPI.me();
          set({ user: data, isLoggedIn: true });
        } catch {
          set({ user: null, isLoggedIn: false });
        }
      },
    }),
    {
      name: 'mughero-auth',
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
    }
  )
);
