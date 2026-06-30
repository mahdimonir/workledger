'use client';

import React from 'react';
import { CreditCard, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function AdminBillingPage() {
  const transactions = [
    { id: 'TXN-001', workspace: 'Nova Studio', plan: 'PRO', amount: 29, status: 'SUCCESS', date: '2026-06-28' },
    { id: 'TXN-002', workspace: 'System Admin', plan: 'ENTERPRISE', amount: 299, status: 'SUCCESS', date: '2026-06-25' }
  ];

  return (
    <div className="flex flex-col gap-8 text-left text-zinc-100 select-none">
      <div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-red-500" /> Platform Billing
        </h1>
        <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
          MRR indicators, platform transactions, and discount plans
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col gap-3">
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Platform ARR</span>
          <h3 className="text-2xl font-bold text-white">$3,936</h3>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Projected annual
          </span>
        </div>
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col gap-3">
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Transaction Success</span>
          <h3 className="text-2xl font-bold text-emerald-400">100%</h3>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">No failed intents</span>
        </div>
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col gap-3">
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Active Subscriptions</span>
          <h3 className="text-2xl font-bold text-white">2 Workspaces</h3>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Excludes FREE plan</span>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-2xl bg-zinc-900 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-850">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">
            Recent Subscription Payments
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-850 text-zinc-400 font-black uppercase tracking-wider">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Workspace</th>
                <th className="p-4">Plan Tier</th>
                <th className="p-4">Paid Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-zinc-400">{t.id}</td>
                  <td className="p-4 font-bold text-white">{t.workspace}</td>
                  <td className="p-4">
                    <span className="text-[9px] px-2 py-0.5 rounded font-black tracking-widest bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">
                      {t.plan}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-emerald-400">${t.amount}</td>
                  <td className="p-4 text-zinc-400 font-medium">{t.date}</td>
                  <td className="p-4 text-right">
                    <span className="text-[9px] px-2.5 py-0.5 rounded font-black tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
