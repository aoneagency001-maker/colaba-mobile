import { create } from 'zustand';
import api, { tokenStorage } from '../services/api';
import { User, Customer, UserRole, RegisterData, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  customer: Customer | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  customer: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (phone: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post<AuthResponse>('/auth/login', { phone, password });

      await tokenStorage.setToken('accessToken', data.accessToken);
      await tokenStorage.setToken('refreshToken', data.refreshToken);

      const role = data.user.role as UserRole;

      set({
        user: data.user,
        customer: data.customer || null,
        role,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Ошибка входа',
      });
      throw err;
    }
  },

  register: async (data: RegisterData) => {
    try {
      set({ isLoading: true, error: null });
      const { data: authData } = await api.post<AuthResponse>('/auth/register', data);

      await tokenStorage.setToken('accessToken', authData.accessToken);
      await tokenStorage.setToken('refreshToken', authData.refreshToken);

      set({
        user: authData.user,
        customer: authData.customer || null,
        role: authData.user.role as UserRole,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Ошибка регистрации',
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    await tokenStorage.removeToken('accessToken');
    await tokenStorage.removeToken('refreshToken');
    set({
      user: null,
      customer: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await tokenStorage.getToken('accessToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const { data: user } = await api.get<User>('/auth/me');
      let customer: Customer | null = null;

      if (user.role === UserRole.CUSTOMER) {
        const { data } = await api.get<Customer>('/customers/me');
        customer = data;
      }

      set({
        user,
        customer,
        role: user.role as UserRole,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      await tokenStorage.removeToken('accessToken');
      await tokenStorage.removeToken('refreshToken');
      set({
        user: null,
        customer: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
