'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  DollarSign, 
  Users, 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  Building,
  Activity,
  ShieldCheck
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: metricsRes, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => apiClient.get('/admin/metrics').then((res) => res.data),
  });

  const metrics = metricsRes?.data || {
    mrr: 0,
    totalActiveUsers: 0,
    totalInvoices: 0,
    planDistribution: { FREE: 0, PRO: 0, AGENCY: 0, ENTERPRISE: 0 },
    signupGrowth: { percentage: 0, newUsersThisPeriod: 0, newUsersLastPeriod: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse text-zinc-400 text-left">
        <div className="h-10 w-48 bg-zinc-800 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="h-28 bg-zinc-850 rounded-xl border border-zinc-800"></div>
          <div className="h-28 bg-zinc-850 rounded-xl border border-zinc-800"></div>
          <div className="h-28 bg-zinc-850 rounded-xl border border-zinc-800"></div>
          <div className="h-28 bg-zinc-850 rounded-xl border border-zinc-800"></div>
        </div>
      </div>
    );
  }

  const kpis = [
    { name: 'Monthly Recurring Revenue (MRR)', value: `$${metrics.mrr.toLocaleString()}`, change: 'Platform Total', icon: DollarSign },
    { name: 'Platform Users Count', value: metrics.totalActiveUsers.toString(), change: 'Active Accounts', icon: Users },
    { name: 'Total Invoices Compiled', value: metrics.totalInvoices.toString(), change: 'System-wide Transactions', icon: Receipt },
    { name: 'Signup Growth (30d)', value: `${metrics.signupGrowth.percentage >= 0 ? '+' : ''}${metrics.signupGrowth.percentage}%`, change: `${metrics.signupGrowth.newUsersThisPeriod} new users`, icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-8 text-left text-zinc-100 select-none">
      <div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-red-500" /> Platform Overview
        </h1>
        <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
          SaaS administrative dashboard for monitoring systems metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="p-6 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col gap-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold leading-tight">{kpi.name}</span>
                <span className="p-2 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700 flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold text-white tracking-tight">{kpi.value}</span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{kpi.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Distribution Visualizer */}
      <div className="border border-zinc-800 rounded-2xl bg-zinc-900 p-8 shadow-sm max-w-2xl">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-850 pb-4 mb-4">
          Plan Tier Distribution
        </h3>
        
        <div className="flex flex-col gap-4">
          {Object.entries(metrics.planDistribution as Record<string, number>).map(([tier, count]) => {
            const total = (Object.values(metrics.planDistribution) as number[]).reduce((a, b) => a + b, 0) || 1;
            const percent = ((count / total) * 100).toFixed(0);
            
            return (
              <div key={tier} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-zinc-300">{tier} Tier</span>
                  <span className="text-zinc-500">{count} Workspaces ({percent}%)</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 rounded-full" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
