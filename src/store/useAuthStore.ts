import { create } from 'zustand';
import type { AuthResponseDto, UserRole } from '../types/api';

interface UserState {
  userId: string;
  displayName: string;
  email: string;
  role: UserRole;
  profileImageUrl?: string | null;
}

interface AuthStore {
  user: UserState | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (authData: AuthResponseDto) => void;
  logout: () => void;
  updateUser: (fields: Partial<UserState>) => void;
}

const initialToken = localStorage.getItem('token');
const initialUser = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user')!)
  : null;

export const useAuthStore = create<AuthStore>((set) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  setAuth: (authData: AuthResponseDto) => {
    const userState: UserState = {
      userId: authData.userId,
      displayName: authData.displayName,
      email: authData.email,
      role: authData.role,
      profileImageUrl: authData.profileImageUrl || null,
    };
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(userState));
    set({ user: userState, token: authData.token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (fields: Partial<UserState>) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...fields };
      localStorage.setItem('user', JSON.stringify(updated));
      return { user: updated };
    });
  },
}));
