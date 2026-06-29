'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { User, Building, Receipt, Bell, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Profile Settings', href: '/settings/profile', icon: User },
    { name: 'Workspace & Brand', href: '/settings/workspace', icon: Building },
    { name: 'Billing & Plan', href: '/settings/billing', icon: Receipt },
    { name: 'Notification Rules', href: '/settings/notifications', icon: Bell },
    { name: 'Danger Zone', href: '/settings/danger', icon: ShieldAlert, danger: true },
  ];

  return (
    <div className="flex flex-col gap-8 text-black text-left">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">System Settings</h1>
        <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
          Manage user profiles, billing plans, notification preferences, and workspace parameters.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {}
        <aside className="w-full md:w-64 flex flex-col gap-1.5 p-4 rounded-2xl border border-black/5 bg-[#f5f2ee] shadow-sm">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-black text-[#efeae3]'
                    : item.danger
                    ? 'text-rose-600 hover:bg-rose-500/10'
                    : 'text-zinc-650 hover:bg-black/5'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </aside>

        {}
        <main className="flex-1 w-full p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
