'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  Receipt, 
  Plus, 
  AlertCircle, 
  Trash, 
  Sparkles,
  Info,
  Calendar,
  Building,
  Tag
} from 'lucide-react';

export default function ExpensesPage() {
  // Let's implement a feature-flag check simulator (since backend /expenses is not built yet)
  const isEnabled = false; // Simulated feature flag for expense-tracking

  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('SOFTWARE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const mockExpenses = [
    { id: '1', description: 'Vercel Pro Subscription', amount: 20, category: 'SOFTWARE', date: '2026-06-15' },
    { id: '2', description: 'Google Workspace Retainer', amount: 36, category: 'SOFTWARE', date: '2026-06-01' },
    { id: '3', description: 'Design assets from UI8', amount: 150, category: 'ASSETS', date: '2026-05-24' }
  ];

  if (!isEnabled) {
    return (
      <div className="max-w-xl mx-auto py-16 flex flex-col items-center justify-center text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-[#f5f2ee] border border-black/10 flex items-center justify-center text-zinc-400 mb-6 shadow-sm">
          <Receipt className="w-8 h-8" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-black/5 px-3 py-1 rounded-full mb-3">
          Feature Gated
        </span>
        <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-3">
          Expense Tracking
        </h2>
        <p className="text-zinc-600 text-sm leading-relaxed max-w-sm font-light mb-8">
          The expense module is currently feature-flagged. Our engineers are finalizing the ledger-balancing API schemas on the NestJS backend.
        </p>
        
        <div className="w-full bg-[#f5f2ee] border border-black/5 rounded-2xl p-4 flex gap-3 text-left">
          <Info className="w-5 h-5 text-zinc-500 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-zinc-500 font-light leading-normal">
            <strong>Workspace Owners:</strong> You will be notified automatically on the broadcast terminal when the expense schema is deployed to staging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 text-black select-none text-left">
      <div className="flex items-center justify-between border-b border-black/10 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">Expense Logs</h1>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Track and categorize workspace spending</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="h-10 px-4 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus className="w-3.5 h-3.5" /> Record Expense
        </button>
      </div>

      <div className="border border-black/10 rounded-3xl bg-[#f5f2ee] p-8 shadow-sm">
        <div className="flex flex-col gap-3">
          {mockExpenses.map((exp) => (
            <div 
              key={exp.id}
              className="flex items-center justify-between p-4 bg-white/50 border border-black/5 rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-zinc-500">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black">{exp.description}</h4>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-1">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {exp.category}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {exp.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-black">${exp.amount}</span>
                <button className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors">
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
