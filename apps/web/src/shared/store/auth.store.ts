import { create } from 'zustand';

const TOKEN_KEY = 'wl_access_token';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
  isSuperAdmin: boolean;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  workspace: Workspace | null;
  role: string | null;
  isAuthenticated: boolean;
  setSession: (token: string, details?: { user: User; workspace: Workspace; role: string }) => void;
  clearSession: () => void;
}

const storedToken = typeof window !== 'undefined'
  ? localStorage.getItem(TOKEN_KEY)
  : null;

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: storedToken,
  user: null,
  workspace: null,
  role: null,
  isAuthenticated: !!storedToken,

  setSession: (token, details) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      document.cookie = `wl_logged_in=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      if (details?.workspace?.businessName) {
        document.cookie = `wl_onboarding_complete=true; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
      }
    }
    set({
      accessToken: token,
      isAuthenticated: true,
      ...(details && {
        user: details.user,
        workspace: details.workspace,
        role: details.role,
      }),
    });
  },

  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = 'wl_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'wl_onboarding_complete=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
    set({
      accessToken: null,
      user: null,
      workspace: null,
      role: null,
      isAuthenticated: false,
    });
  },
}));
