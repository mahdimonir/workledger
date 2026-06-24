'use client';

import React from 'react';
import { 
  TrendingUp, 
  Users, 
  FolderKanban, 
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { name: 'Monthly Revenue', value: '$8,450.00', change: '+12.5%', changeType: 'up', icon: TrendingUp },
    { name: 'Active Clients', value: '18', change: '+2', changeType: 'up', icon: Users },
    { name: 'Running Projects', value: '12', change: '-1', changeType: 'down', icon: FolderKanban },
    { name: 'Pending Invoices', value: '4', change: '$2,400.00 due', changeType: 'neutral', icon: Receipt },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-zinc-500 text-sm mt-1">Here is a snapshot of your freelance operations today.</p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-4 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-zinc-500 text-sm font-medium">{stat.name}</span>
                <span className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${stat.changeType === 'up' ? 'text-emerald-600' : stat.changeType === 'down' ? 'text-rose-600' : 'text-zinc-500'}`}>
                  {stat.changeType === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
                  {stat.changeType === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graph representation */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-4 shadow-sm">
          <h3 className="font-bold text-base">Revenue Distribution</h3>
          <div className="h-64 flex items-end justify-between gap-4 pt-6 border-b border-zinc-100 dark:border-zinc-900">
            <div className="w-full bg-purple-100 dark:bg-purple-950/20 rounded-t h-[40%] flex items-end justify-center"><span className="text-[10px] text-zinc-400 mb-2">Jan</span></div>
            <div className="w-full bg-purple-100 dark:bg-purple-950/20 rounded-t h-[55%] flex items-end justify-center"><span className="text-[10px] text-zinc-400 mb-2">Feb</span></div>
            <div className="w-full bg-purple-100 dark:bg-purple-950/20 rounded-t h-[70%] flex items-end justify-center"><span className="text-[10px] text-zinc-400 mb-2">Mar</span></div>
            <div className="w-full bg-purple-100 dark:bg-purple-950/20 rounded-t h-[50%] flex items-end justify-center"><span className="text-[10px] text-zinc-400 mb-2">Apr</span></div>
            <div className="w-full bg-purple-500 dark:bg-purple-600 rounded-t h-[85%] flex items-end justify-center"><span className="text-[10px] text-white font-medium mb-2">May</span></div>
            <div className="w-full bg-purple-100 dark:bg-purple-950/20 rounded-t h-[60%] flex items-end justify-center"><span className="text-[10px] text-zinc-400 mb-2">Jun</span></div>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-4 shadow-sm">
          <h3 className="font-bold text-base">Quick Tasks</h3>
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
              <span className="text-xs font-semibold">Send invoice INV-0004</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold dark:bg-amber-950/30 dark:text-amber-400">TODO</span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
              <span className="text-xs font-semibold">Verify client sign-off on logo</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold dark:bg-blue-950/30 dark:text-blue-400">REVIEW</span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
              <span className="text-xs font-semibold">Configure GDPR export backup</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold dark:bg-emerald-950/30 dark:text-emerald-400">DONE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
