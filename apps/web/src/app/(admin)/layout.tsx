'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  BarChart3, 
  ShieldAlert, 
  ArrowLeft
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Platform Users', href: '/users', icon: Users },
    { name: 'Metrics & MRR', href: '/metrics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between">
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2 text-red-500 font-semibold text-xs tracking-wider uppercase mb-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Super Admin
            </div>
            <span className="font-bold text-xl tracking-tight text-white">WorkLedger API</span>
          </div>

          <nav className="flex flex-col gap-1">
            {navigation.map((item) => {
              const active = pathname === item.name || pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <Link 
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Admin</span>
        </Link>
      </aside>

      {/* Content wrapper */}
      <main className="flex-1 p-8 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
