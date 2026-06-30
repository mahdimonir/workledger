'use client';

import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/store/auth.store';
import {
  Bell,
  BellRing,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

const navigation = [
  { name: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard },
  { name: 'Clients',       href: '/clients',        icon: Users },
  { name: 'Projects',      href: '/projects',       icon: FolderKanban },
  { name: 'Proposals',     href: '/proposals',      icon: FileText },
  { name: 'Invoices',      href: '/invoices',       icon: Receipt },
  { name: 'Team',          href: '/team',           icon: Building2 },
  { name: 'Notifications', href: '/notifications',  icon: BellRing },
];

function SidebarTooltip({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-50
      bg-black text-[#efeae3] text-[10px] font-black uppercase tracking-widest
      px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl
      opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
      transition-all duration-150 origin-left">
      {label}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedReady, setCollapsedReady] = useState(false);

  const { user, workspace, role, isAuthenticated, setSession, clearSession } = useAuthStore();
  const [loading, setLoading] = useState(!isAuthenticated || !user);

  // Read persisted collapse state after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    const stored = localStorage.getItem('wl_sidebar_collapsed');
    if (stored === 'true') setIsCollapsed(true);
    setCollapsedReady(true);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Close mobile sidebar on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sidebarOpen]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('wl_sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated && user) { setLoading(false); return; }
      const token = useAuthStore.getState().accessToken;
      if (!token) { router.replace('/login'); return; }
      try {
        const meRes = await apiClient.get('/auth/me');
        const { user, workspace, role } = meRes.data.data;
        if (workspace?.businessName) {
          document.cookie = `wl_onboarding_complete=true; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
        }
        setSession(token, { user, workspace, role });
      } catch {
        clearSession();
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [isAuthenticated, user, setSession, clearSession, router]);

  const handleLogout = async () => {
    try { await apiClient.post('/auth/logout'); } catch {}
    clearSession();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#efeae3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Validating Session…</span>
        </div>
      </div>
    );
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'W';
  const collapsed = collapsedReady && isCollapsed;

  const navLinkClass = (active: boolean, c = false) =>
    `flex items-center gap-3 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-150
    ${c ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
    ${active ? 'bg-black text-[#efeae3]' : 'text-zinc-500 hover:bg-black/[.06] hover:text-black'}`;

  return (
    <div className="min-h-screen bg-[#efeae3] flex text-zinc-900 font-sans antialiased">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px] md:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 bottom-0 left-0 z-40
          border-r border-black/10 bg-[#f5f2ee]
          flex flex-col justify-between
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static
          w-56
          ${collapsed ? 'md:w-[72px]' : 'md:w-56'}
        `}
      >
        {/* Top section */}
        <div className="flex flex-col gap-5 pt-5 px-3">

          {/* Logo */}
          <div className="flex items-center justify-between px-1 min-h-[36px]">
            {collapsed ? (
              <Link
                href="/"
                className="w-9 h-9 bg-black rounded-lg flex items-center justify-center flex-shrink-0 select-none mx-auto"
                title="WorkLedger"
              >
                <span className="text-[#efeae3] font-black text-sm tracking-tight">W</span>
              </Link>
            ) : (
              <Link href="/" className="flex flex-col text-left leading-[0.85] select-none font-black text-black">
                <span className="text-[16px] uppercase tracking-tighter">WORK</span>
                <span className="text-[16px] uppercase text-zinc-400 tracking-tighter">LEDGER</span>
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded hover:bg-black/5 text-zinc-500"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5">
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <div key={item.name} className="relative group">
                  <Link href={item.href} className={navLinkClass(active, collapsed)}>
                    <Icon className="w-[17px] h-[17px] flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                  {collapsed && <SidebarTooltip label={item.name} />}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-0.5 pb-5 px-3 pt-4 border-t border-black/10">
          {/* Settings */}
          <div className="relative group">
            <Link
              href="/settings/profile"
              className={navLinkClass(pathname.startsWith('/settings'), collapsed)}
            >
              <Settings className="w-[17px] h-[17px] flex-shrink-0" />
              {!collapsed && <span>Settings</span>}
            </Link>
            {collapsed && <SidebarTooltip label="Settings" />}
          </div>

          {/* Logout */}
          <div className="relative group">
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-3 rounded-xl text-[11px] uppercase tracking-wider font-bold
                text-rose-500 hover:bg-rose-500/10 transition-all duration-150 w-full cursor-pointer
                ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5 text-left'}
              `}
            >
              <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
              {!collapsed && <span>Log out</span>}
            </button>
            {collapsed && <SidebarTooltip label="Log out" />}
          </div>
        </div>
      </aside>

      {/* ─── Main ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="h-14 border-b border-black/10 bg-[#f5f2ee] px-4 flex items-center justify-between gap-3 sticky top-0 z-20">

          {/* Left */}
          <div className="flex items-center gap-1.5">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-black/[.06] text-zinc-500 hover:text-black transition-colors md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-2 rounded-lg hover:bg-black/[.06] text-zinc-400 hover:text-black transition-colors cursor-pointer"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed
                ? <ChevronRight className="w-4 h-4" />
                : <ChevronLeft className="w-4 h-4" />
              }
            </button>

            {/* Workspace badge */}
            {workspace && (
              <Link
                href="/settings/workspace"
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-black/5 border border-black/8 text-zinc-600 rounded-full hover:bg-black/10 transition-colors leading-none hidden sm:inline-flex"
              >
                {workspace.name}
              </Link>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            <Link
              href="/notifications"
              className="relative p-2.5 rounded-full hover:bg-black/[.06] text-zinc-500 hover:text-black transition-colors"
              aria-label="Notifications"
            >
              <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-rose-500 ring-[1.5px] ring-[#f5f2ee]" />
              <Bell className="w-[17px] h-[17px]" />
            </Link>

            <div className="h-6 w-px bg-black/10 mx-1" />

            <Link
              href="/settings/profile"
              className="flex items-center gap-2.5 rounded-xl hover:bg-black/5 px-2 py-1.5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-[#efeae3] text-[11px] font-black uppercase flex-shrink-0">
                {userInitial}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[11px] font-black uppercase tracking-tight">{user?.name || 'User'}</span>
                <span className="text-[9px] font-bold text-zinc-400 mt-0.5">{role || 'MEMBER'}</span>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#efeae3]">
          {children}
        </main>
      </div>
    </div>
  );
}
