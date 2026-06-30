'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  BarChart3, 
  ShieldAlert, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Building2,
  CreditCard,
  Flag,
  Activity,
  ScrollText,
  Workflow,
  Radio,
  Sliders,
  LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '@/shared/store/auth.store';

const navigation = [
  { name: 'Overview',           href: '/admin',                  icon: LayoutDashboard },
  { name: 'Users',              href: '/admin/users',            icon: Users },
  { name: 'Workspaces',         href: '/admin/workspaces',       icon: Building2 },
  { name: 'Billing & Plans',    href: '/admin/billing',          icon: CreditCard },
  { name: 'Feature Flags',      href: '/admin/features/flags',   icon: Flag },
  { name: 'Service Health',     href: '/admin/services/status',  icon: Activity },
  { name: 'Audit Log',          href: '/admin/audit',            icon: ScrollText },
  { name: 'BullMQ Queues',      href: '/admin/queues',           icon: Workflow },
  { name: 'Broadcasts',         href: '/admin/notifications',    icon: Radio },
  { name: 'Platform Settings',  href: '/admin/settings',         icon: Sliders },
];

function SidebarTooltip({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-50
      bg-[#efeae3] text-black text-[10px] font-black uppercase tracking-widest
      px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl
      opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
      transition-all duration-150 origin-left">
      {label}
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedReady, setCollapsedReady] = useState(false);
  
  const { user, role, clearSession } = useAuthStore();

  // Persist collapse state via localStorage (SSR safe)
  useEffect(() => {
    const stored = localStorage.getItem('wl_admin_sidebar_collapsed');
    if (stored === 'true') setIsCollapsed(true);
    setCollapsedReady(true);
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Handle outside clicks
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
      localStorage.setItem('wl_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';
  const collapsed = collapsedReady && isCollapsed;

  const navLinkClass = (active: boolean, c = false) =>
    `flex items-center gap-3 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-150
    ${c ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
    ${active ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans antialiased">
      
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/45 backdrop-blur-[2px] md:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Admin Sidebar ────────────────────────────────────────── */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 bottom-0 left-0 z-40
          border-r border-zinc-800 bg-zinc-900
          flex flex-col justify-between
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static
          w-56
          ${collapsed ? 'md:w-[72px]' : 'md:w-56'}
        `}
      >
        {/* Top Header & Nav */}
        <div className="flex flex-col gap-5 pt-5 px-3">
          <div className="flex items-center justify-between px-1 min-h-[36px]">
            {collapsed ? (
              <div 
                className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 select-none mx-auto cursor-pointer"
                title="Super Admin"
              >
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="flex flex-col text-left leading-[0.85] select-none font-black text-white">
                <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> SUPER ADMIN
                </span>
                <span className="text-[15px] uppercase tracking-tighter mt-1">WL PLATFORM</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded hover:bg-zinc-800 text-zinc-400"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex flex-col gap-0.5 max-h-[70vh] overflow-y-auto scrollbar-none">
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

        {/* Bottom Actions */}
        <div className="flex flex-col gap-0.5 pb-5 px-3 pt-4 border-t border-zinc-800">
          <div className="relative group">
            <Link
              href="/dashboard"
              className={navLinkClass(false, collapsed)}
            >
              <ArrowLeft className="w-[17px] h-[17px] flex-shrink-0" />
              {!collapsed && <span>Exit Admin</span>}
            </Link>
            {collapsed && <SidebarTooltip label="Exit Admin" />}
          </div>
        </div>
      </aside>

      {/* ─── Main Admin Console ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        
        {/* Header */}
        <header className="h-14 border-b border-zinc-800 bg-zinc-900 px-4 flex items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex items-center gap-1.5">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed
                ? <ChevronRight className="w-4 h-4" />
                : <ChevronLeft className="w-4 h-4" />
              }
            </button>
            
            <span className="text-xs font-mono bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full border border-zinc-700 select-none">
              Console v1.0.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-[11px] font-black uppercase select-none">
              {userInitial}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-none">
              <span className="text-[11px] font-black uppercase tracking-tight text-white">{user?.name || 'Super Admin'}</span>
              <span className="text-[9px] font-bold text-red-500 mt-0.5">PLATFORM ADMIN</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
