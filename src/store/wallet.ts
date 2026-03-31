import { create } from 'zustand';
import api from '../services/api';
import { Wallet, Transaction, BonusLot } from '../types';

interface WalletState {
  wallets: Wallet[];
  activeWallet: Wallet | null;
  transactions: Transaction[];
  expiringLots: BonusLot[];
  isLoading: boolean;
  error: string | null;

  loadWallets: () => Promise<void>;
  setActiveWallet: (wallet: Wallet) => void;
  loadHistory: (walletId?: string) => Promise<void>;
  loadExpiring: (walletId?: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  activeWallet: null,
  transactions: [],
  expiringLots: [],
  isLoading: false,
  error: null,

  loadWallets: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get<Wallet[]>('/wallets');
      const activeWallet = data.length > 0 ? data[0] : null;
      set({ wallets: data, activeWallet, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Ошибка загрузки кошельков',
      });
    }
  },

  setActiveWallet: (wallet: Wallet) => {
    set({ activeWallet: wallet });
  },

  loadHistory: async (walletId?: string) => {
    try {
      set({ isLoading: true, error: null });
      const id = walletId || get().activeWallet?.id;
      if (!id) {
        set({ isLoading: false });
        return;
      }
      const { data } = await api.get<Transaction[]>(`/wallets/${id}/transactions`);
      set({ transactions: data, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Ошибка загрузки истории',
      });
    }
  },

  loadExpiring: async (walletId?: string) => {
    try {
      set({ isLoading: true, error: null });
      const id = walletId || get().activeWallet?.id;
      if (!id) {
        set({ isLoading: false });
        return;
      }
      const { data } = await api.get<BonusLot[]>(`/wallets/${id}/expiring`);
      set({ expiringLots: data, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Ошибка загрузки бонусов',
      });
    }
  },
}));
