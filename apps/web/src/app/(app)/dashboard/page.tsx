'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Users, 
  FolderKanban, 
  Receipt,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/shared/api/client';

export default function DashboardPage() {
  const { data: clientsRes, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.get('/clients').then(res => res.data),
  });
  
  const { data: projectsRes, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(res => res.data),
  });

  const { data: invoicesRes, isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => apiClient.get('/invoices').then(res => res.data),
  });

  const clients = clientsRes?.data || [];
  const projects = projectsRes?.data || [];
  const invoices = invoicesRes?.data || [];

  const isLoading = loadingClients || loadingProjects || loadingInvoices;

  const totalRevenue = invoices
    .filter((inv: any) => inv.status === 'PAID')
    .reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);

  const activeClientsCount = clients.filter((c: any) => c.healthStatus === 'ACTIVE').length;

  const runningProjectsCount = projects.filter((p: any) => 
    ['IN_PROGRESS', 'KICKOFF', 'REVIEW', 'REVISION'].includes(p.status)
  ).length;

  const outstandingAmount = invoices
    .filter((inv: any) => ['SENT', 'VIEWED', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status))
    .reduce((sum: number, inv: any) => sum + (Number(inv.amount || 0) - Number(inv.amountPaid || 0)), 0);

  const stats = [
    { name: 'Monthly Revenue', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Collected total', icon: TrendingUp },
    { name: 'Active Clients', value: activeClientsCount.toString(), sub: 'In CRM directory', icon: Users },
    { name: 'Running Projects', value: runningProjectsCount.toString(), sub: 'In active stages', icon: FolderKanban },
    { name: 'Outstanding Balance', value: `$${outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Awaiting collection', icon: Receipt },
  ];

  const sortedProjects = [...projects]
    .filter(p => p.status !== 'CLOSED' && p.status !== 'DELIVERED')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-10 w-48 bg-black/5 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-black/5 border border-black/5 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-80 bg-black/5 border border-black/5 rounded-2xl"></div>
          <div className="h-80 bg-black/5 border border-black/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-black">
      {/* Welcome Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Business Health</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">Unified operations and financial ledger overview</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-wider px-4 py-2 bg-white/60 border border-black/5 rounded-full shadow-sm text-zinc-600">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Production Active
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col gap-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex justify-between items-start">
                <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">{stat.name}</span>
                <span className="p-2 rounded-xl bg-black/5 text-black">
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-2xl font-black tracking-tight">{stat.value}</span>
                <span className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1 — Project Pipeline (Left/Wide) */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col gap-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-xs uppercase tracking-widest">Urgent Project Pipeline</h3>
            <Link href="/projects" className="text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-black flex items-center gap-1">
              All Projects <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {sortedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="w-8 h-8 text-zinc-300 mb-2" />
              <p className="text-xs font-bold text-zinc-400 uppercase">No active projects running</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-black/5">
              {sortedProjects.map((project) => (
                <div key={project.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-sm text-black">{project.name}</span>
                    <span className="text-zinc-450 text-[10px] uppercase font-bold mt-1">Client ID: {project.clientId.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                      project.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                      project.status === 'KICKOFF' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'REVIEW' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-800'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-zinc-500">{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 3 — Quick Actions (Right/Narrow) */}
        <div className="p-6 rounded-2xl border border-black/5 bg-[#f5f2ee] flex flex-col gap-6 shadow-sm justify-between">
          <div>
            <h3 className="font-black text-xs uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Link href="/clients" className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer animate-none hover:scale-[1.01] duration-150">
                <Plus className="w-4 h-4" /> New Client
              </Link>
              <Link href="/projects" className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer animate-none hover:scale-[1.01] duration-150">
                <Plus className="w-4 h-4" /> New Project
              </Link>
              <Link href="/invoices" className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer animate-none hover:scale-[1.01] duration-150">
                <Plus className="w-4 h-4" /> New Invoice
              </Link>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-black/5 bg-white/40 flex flex-col gap-1 text-left mt-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Ledger Compliance</span>
            <p className="text-[11px] font-medium leading-relaxed text-zinc-600">All sequentially incremented invoices lock permanently once marked as sent.</p>
          </div>
        </div>

      </div>

      {/* Row 3 — Recent Invoices */}
      <div className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col gap-6 shadow-sm text-left">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-xs uppercase tracking-widest">Recent Invoice Ledger</h3>
          <Link href="/invoices" className="text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-black flex items-center gap-1">
            All Invoices <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="w-8 h-8 text-zinc-300 mb-2" />
            <p className="text-xs font-bold text-zinc-400 uppercase">No invoices issued yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/5 text-zinc-400 font-black uppercase tracking-wider">
                  <th className="pb-3 pr-4">Invoice #</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-semibold text-zinc-750">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-black/5">
                    <td className="py-3.5 pr-4 font-black">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-black text-black">${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                        inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-zinc-100 text-zinc-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right text-zinc-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
