'use client';

import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/store/auth.store';
import {
  Bell,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Users,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, workspace, role, isAuthenticated, setSession, clearSession } = useAuthStore();
  const [loading, setLoading] = useState(!isAuthenticated || !user);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated && user) {
        setLoading(false);
        return;
      }

      const token = useAuthStore.getState().accessToken;
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const meRes = await apiClient.get('/auth/me');
        const { user, workspace, role } = meRes.data.data;
        if (workspace && workspace.businessName) {
          document.cookie = `wl_onboarding_complete=true; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
        }
        setSession(token, { user, workspace, role });
      } catch (err) {
        console.error('Session validation failed:', err);
        clearSession();
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, user, setSession, clearSession]);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearSession();
      router.push('/');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Proposals', href: '/proposals', icon: FileText },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#efeae3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Validating Session...</span>
        </div>
      </div>
    );
  }

  const userInitial = user?.name ? user.name.charAt(0) : 'W';

  return (
    <div className="min-h-screen bg-[#efeae3] flex text-zinc-900 font-sans antialiased">
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-black/10 bg-[#f5f2ee] transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:w-64`}>
        <div className="h-full flex flex-col justify-between p-6">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex flex-col text-left leading-[0.8] select-none font-black text-black">
                <span className="text-[18px] uppercase tracking-tighter">WORK</span>
                <span className="text-[18px] uppercase text-zinc-500 tracking-tighter">LEDGER</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5">
              {navigation.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all duration-200 ${active ? 'bg-black text-[#efeae3]' : 'text-zinc-600 hover:bg-black/5 hover:text-black'}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-black/10">
            <Link 
              href="/settings/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-bold text-zinc-600 hover:bg-black/5 hover:text-black transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-bold text-rose-600 hover:bg-rose-500/10 transition-all duration-200 w-full text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-black/10 bg-[#f5f2ee] px-6 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 rounded hover:bg-black/5 md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 px-4">
            {workspace && (
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 bg-black/5 border border-black/5 text-zinc-700 rounded-full inline-block">
                {workspace.name}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-black/5 text-zinc-500 relative">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-black/10"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[#efeae3] text-xs font-black uppercase">
                {userInitial}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-black uppercase tracking-tight leading-none">{user?.name || 'User'}</span>
                <span className="text-[10px] font-bold text-zinc-400 mt-1 leading-none">{role || 'MEMBER'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#efeae3]">{children}</main>
      </div>
    </div>
  );
}
