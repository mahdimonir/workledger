'use client';

import React, { useState } from 'react';
import { Flag, Info, Settings, ShieldCheck } from 'lucide-react';

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState([
    { key: 'expense-tracking', name: 'Expense Tracking Dashboard', description: 'Gates access to /expenses and expense reports.', active: false },
    { key: 'email-templates', name: 'Email HTML Customizer', description: 'Allows workspace managers to change subject lines and HTML layouts.', active: false },
    { key: 'recurring-invoices', name: 'Auto-Recurring Subscriptions', description: 'Invoice recurring rules & recurring queues.', active: true },
    { key: 'time-tracking', name: 'Time-Tracking Chronometer', description: 'Log timer sheets directly inside tasks.', active: false }
  ]);

  const handleToggle = (key: string) => {
    setFlags(prev => prev.map(f => f.key === key ? { ...f, active: !f.active } : f));
  };

  return (
    <div className="flex flex-col gap-8 text-left text-zinc-100 select-none">
      <div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
          <Flag className="w-8 h-8 text-red-500" /> Feature Flag Controls
        </h1>
        <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
          Enable or disable platform features globally or gate them by subscription levels
        </p>
      </div>

      <div className="border border-zinc-800 rounded-2xl bg-zinc-900 p-6 flex gap-3 max-w-2xl">
        <Info className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-zinc-400 font-light leading-normal">
          Features set to <strong className="text-white">Active</strong> are visible to workspaces with appropriate entitlements. Features set to <strong className="text-white">Inactive</strong> are hidden behind route guards globally.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {flags.map((flag) => (
          <div 
            key={flag.key}
            className="p-6 rounded-2xl border border-zinc-800 bg-zinc-905 flex flex-col justify-between gap-6"
            style={{ background: 'rgba(255,255,255,0.01)' }}
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  {flag.name}
                </h3>
                <span className={`text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase ${flag.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>
                  {flag.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs font-light text-zinc-400 leading-relaxed">
                {flag.description}
              </p>
              <div className="text-[9px] font-mono text-zinc-500 mt-3 uppercase font-semibold">
                Flag: {flag.key}
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-zinc-850 pt-4 mt-2">
              <button 
                onClick={() => handleToggle(flag.key)}
                className={`h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider border transition-colors cursor-pointer ${flag.active ? 'border-rose-500/20 hover:bg-rose-500/10 text-rose-500' : 'border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-400'}`}
              >
                {flag.active ? 'Deactivate Feature' : 'Activate Feature'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
