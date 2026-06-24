'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Receipt, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  UserCheck
} from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex text-zinc-900 dark:text-zinc-100">
      {/* Sidebar for Desktop */}
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:w-64`}>
        <div className="h-full flex flex-col justify-between p-4">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                WorkLedger
              </span>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navigation.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Link 
              href="/settings/profile"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-12"></div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 relative">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600"></span>
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                M
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-semibold">Mahdi Hasan</span>
                <span className="text-xs text-zinc-500">OWNER</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
