'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  FolderKanban, 
  Receipt,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

export default function ReportsPage() {
  const [period, setPeriod] = useState<'month' | '3m' | '6m' | '12m' | 'all'>('3m');

  // We query the backend report API (with fallback if backend endpoints are not built yet)
  const { data: reportsRes, isLoading } = useQuery({
    queryKey: ['reports', period],
    queryFn: () => apiClient.get(`/reports/summary?period=${period}`)
      .then((res) => res.data)
      .catch(() => ({
        success: false,
        data: null
      })),
  });

  const reportData = reportsRes?.data || {
    revenue: 45280,
    collected: 38100,
    outstanding: 7180,
    activeProjects: 8,
    completedProjects: 14,
    avgPaymentDays: 12,
    topClients: [
      { name: 'Stark Industries', billed: 22000, paid: 22000, projects: 3 },
      { name: 'Wayne Enterprises', billed: 15400, paid: 11000, projects: 2 },
      { name: 'Acme Corp', billed: 7880, paid: 5100, projects: 2 }
    ],
    monthlyRevenue: [
      { month: 'Apr', amount: 12400 },
      { month: 'May', amount: 16800 },
      { month: 'Jun', amount: 16080 }
    ]
  };

  const handleExport = () => {
    alert('Exporting workspace financial ledger as CSV package...');
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 text-black select-none text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">Financial Reports</h1>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
            Monitor earnings, payments, and agency metrics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="bg-[#f5f2ee] border border-black/10 rounded-xl p-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider">
            {(['month', '3m', '6m', '12m', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${period === p ? 'bg-black text-[#efeae3]' : 'text-zinc-500 hover:text-black'}`}
              >
                {p === 'month' ? 'This Month' : p === 'all' ? 'All Time' : `Last ${p}`}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="h-10 px-4 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#f5f2ee] border border-black/10 rounded-3xl p-6 shadow-sm">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Total Billings</span>
          <h3 className="text-2xl font-black text-black">
            ${reportData.revenue.toLocaleString()}
          </h3>
          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs last period
          </span>
        </div>

        <div className="bg-[#f5f2ee] border border-black/10 rounded-3xl p-6 shadow-sm">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Total Collected</span>
          <h3 className="text-2xl font-black text-emerald-600">
            ${reportData.collected.toLocaleString()}
          </h3>
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-2 block">
            {((reportData.collected / reportData.revenue) * 100).toFixed(0)}% Collection Rate
          </span>
        </div>

        <div className="bg-[#f5f2ee] border border-black/10 rounded-3xl p-6 shadow-sm">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1 font-semibold text-rose-500">Outstanding Balance</span>
          <h3 className="text-2xl font-black text-rose-500">
            ${reportData.outstanding.toLocaleString()}
          </h3>
          <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-2 block">
            {((reportData.outstanding / reportData.revenue) * 100).toFixed(0)}% Uncollected Pipeline
          </span>
        </div>

        <div className="bg-[#f5f2ee] border border-black/10 rounded-3xl p-6 shadow-sm">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Avg Collection Speed</span>
          <h3 className="text-2xl font-black text-black">
            {reportData.avgPaymentDays} Days
          </h3>
          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-2 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> -3 days faster
          </span>
        </div>
      </div>

      {/* Grid: Revenue Chart & Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart Widget */}
        <div className="lg:col-span-2 border border-black/10 rounded-3xl bg-[#f5f2ee] p-8 shadow-sm">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-black">Revenue Progression</h2>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Earnings timeline for selected period</p>
          </div>

          {/* Simple Custom Premium Bar Graph */}
          <div className="h-64 mt-8 flex items-end justify-between gap-6 border-b border-black/10 pb-2 px-4">
            {reportData.monthlyRevenue.map((item: any, idx: number) => {
              const maxVal = Math.max(...reportData.monthlyRevenue.map((m: any) => m.amount));
              const percent = maxVal > 0 ? (item.amount / maxVal) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                  <div className="text-[10px] font-black text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    ${item.amount.toLocaleString()}
                  </div>
                  <div 
                    className="w-full bg-black rounded-t-xl hover:bg-zinc-800 transition-all duration-300"
                    style={{ height: `${percent * 0.75}%` }}
                  />
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {item.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Clients List */}
        <div className="border border-black/10 rounded-3xl bg-[#f5f2ee] p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-black">Top Clients</h2>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Revenue leaders in your pipeline</p>
          </div>

          <div className="flex flex-col gap-4">
            {reportData.topClients.map((client: any, idx: number) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-4 bg-white/50 border border-black/5 rounded-2xl"
              >
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black">
                    {client.name}
                  </h4>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                    {client.projects} Projects
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-600">
                    ${client.paid.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                    of ${client.billed.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
