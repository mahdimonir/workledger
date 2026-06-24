import { create } from 'zustand';

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

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  workspace: null,
  role: null,
  isAuthenticated: false,

  setSession: (token, details) => {
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
    set({
      accessToken: null,
      user: null,
      workspace: null,
      role: null,
      isAuthenticated: false,
    });
  },
}));
