import { create } from 'zustand';
import type { UserInfo } from '../types/user';

interface UserState {
  token: string;
  userInfo: UserInfo | null;
  setToken: (token: string) => void;
  setUserInfo: (info: UserInfo) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  token: localStorage.getItem('token') || '',
  userInfo: (() => {
    const raw = localStorage.getItem('userInfo');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  })(),
  setToken: (token: string) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  setUserInfo: (info: UserInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(info));
    set({ userInfo: info });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    set({ token: '', userInfo: null });
  },
}));
