'use client';

import React, { useState } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, TrendingUp, Edit2, Save, X, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export default function AdminBillingPage() {
  const queryClient = useQueryClient();
  const [editingPlanKey, setEditingPlanKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    price: string;
    numericPrice: number;
    frequency: string;
    desc: string;
    features: string[];
    popular: boolean;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const transactions = [
    { id: 'TXN-001', workspace: 'Nova Studio', plan: 'PRO', amount: 29, status: 'SUCCESS', date: '2026-06-28' },
    { id: 'TXN-002', workspace: 'System Admin', plan: 'ENTERPRISE', amount: 299, status: 'SUCCESS', date: '2026-06-25' }
  ];

  const { data: plans } = useQuery<any[]>({
    queryKey: ['plans'],
    queryFn: () => apiClient.get('/plans').then((res) => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) => 
      apiClient.put(`/plans/${key}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setEditingPlanKey(null);
      setEditForm(null);
      setSuccessMessage('Plan specifications updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  });

  const startEditing = (plan: any) => {
    setEditingPlanKey(plan.key);
    setEditForm({
      name: plan.name,
      price: plan.price,
      numericPrice: plan.numericPrice,
      frequency: plan.frequency,
      desc: plan.desc,
      features: [...plan.features],
      popular: plan.popular || false
    });
  };

  const handleSave = (key: string) => {
    if (!editForm) return;
    updateMutation.mutate({ key, data: editForm });
  };

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

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          {successMessage}
        </div>
      )}

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

      {}
      <div className="border border-zinc-800 rounded-2xl bg-zinc-900 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">
              SaaS Plan Detail Configurations
            </h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">
              Edits made here instantly propagate to public marketing and settings client billing layouts.
            </p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map((plan) => {
            const isEditing = editingPlanKey === plan.key;
            return (
              <div 
                key={plan.key} 
                className={`p-6 rounded-2xl border transition-all ${
                  isEditing 
                    ? 'border-red-500 bg-zinc-850/50' 
                    : 'border-zinc-800 bg-zinc-850/20 hover:bg-zinc-850/40'
                }`}
              >
                {isEditing && editForm ? (
                  <div className="flex flex-col gap-4 text-xs">
                    <div>
                      <label className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest">Plan Name</label>
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white font-bold mt-1 focus:outline-none focus:border-red-500" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest">Price Tag</label>
                        <input 
                          type="text" 
                          value={editForm.price} 
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white font-bold mt-1 focus:outline-none focus:border-red-500" 
                        />
                      </div>
                      <div>
                        <label className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest">Numeric Price</label>
                        <input 
                          type="number" 
                          value={editForm.numericPrice} 
                          onChange={(e) => setEditForm({ ...editForm, numericPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white font-bold mt-1 focus:outline-none focus:border-red-500" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest">Price Frequency</label>
                      <input 
                        type="text" 
                        value={editForm.frequency} 
                        onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white font-bold mt-1 focus:outline-none focus:border-red-500" 
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest">Description</label>
                      <textarea 
                        value={editForm.desc} 
                        onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white mt-1 h-16 focus:outline-none focus:border-red-500 resize-none" 
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest">Features (one per line)</label>
                      <textarea 
                        value={editForm.features.join('\n')} 
                        onChange={(e) => setEditForm({ ...editForm, features: e.target.value.split('\n') })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white mt-1 h-24 focus:outline-none focus:border-red-500 resize-none font-mono" 
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="checkbox" 
                        id={`popular-${plan.key}`} 
                        checked={editForm.popular}
                        onChange={(e) => setEditForm({ ...editForm, popular: e.target.checked })}
                        className="rounded bg-zinc-900 border-zinc-800 text-red-500"
                      />
                      <label htmlFor={`popular-${plan.key}`} className="text-zinc-400 font-bold uppercase text-[9px] tracking-widest select-none cursor-pointer">
                        Featured / Popular tag
                      </label>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        type="button" 
                        onClick={() => handleSave(plan.key)}
                        disabled={updateMutation.isPending}
                        className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setEditingPlanKey(null); setEditForm(null); }}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-between h-full text-left">
                    <div>
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                        <div>
                          <h4 className="font-black text-sm uppercase tracking-tight text-white">{plan.name}</h4>
                          <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-widest">Key: {plan.key}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => startEditing(plan)}
                          className="p-2 rounded bg-zinc-800/80 hover:bg-zinc-750 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-black text-white">{plan.price}</span>
                        <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest">/ {plan.frequency}</span>
                      </div>

                      <p className="text-zinc-400 text-xs font-light mb-6 leading-relaxed">{plan.desc}</p>

                      <ul className="flex flex-col gap-2 border-t border-zinc-800 pt-4">
                        {plan.features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-zinc-450 leading-normal">
                            <Check className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.popular && (
                      <div className="mt-6 pt-3 border-t border-zinc-800 text-right">
                        <span className="text-[8px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">
                          Featured / Popular
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
