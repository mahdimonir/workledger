'use client';

import React from 'react';
import { useAuthStore } from '@/shared/store/auth.store';
import { ShieldCheck, Check } from 'lucide-react';
import { PLANS } from '@/shared/config/plans';

export default function BillingPage() {
  const { workspace } = useAuthStore();
  const currentPlan = workspace?.plan || 'FREE';

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h2 className="text-xl font-black uppercase tracking-tight text-black">Billing & Plan tier</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">
          Review subscription invoices parameters or change your platform quotas plan.
        </p>
      </div>

      {}
      <div className="p-5 rounded-2xl border border-black/5 bg-[#f5f2ee] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-black text-[#efeae3]">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active subscription</span>
            <span className="text-base font-black mt-0.5 uppercase tracking-wide text-black">
              {currentPlan} PLAN
            </span>
          </div>
        </div>
        <span className="text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-150">
          Good Standing
        </span>
      </div>

      {}
      <div className="mt-4 flex flex-col gap-4">
        <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500 border-b border-black/5 pb-3">Available Plan Tiers</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {PLANS.map((plan) => {
            const isActive = plan.id === currentPlan;
            return (
              <div 
                key={plan.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between gap-6 relative bg-white/60 backdrop-blur-md shadow-sm ${
                  isActive 
                    ? 'border-black ring-4 ring-black/5' 
                    : plan.popular 
                    ? 'border-purple-200 ring-2 ring-purple-100' 
                    : 'border-black/5'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-6 text-[8px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-black uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                )}

                <div className="flex flex-col gap-4 text-left">
                  <div>
                    <h4 className="font-black text-sm text-black uppercase tracking-tight">{plan.name}</h4>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-black text-black">{plan.price}</span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{plan.frequency}</span>
                    </div>
                  </div>

                  <ul className="flex flex-col gap-2 border-t border-black/5 pt-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-zinc-650 leading-normal">
                        <Check className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={isActive}
                  className={`w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 border border-emerald-250 text-emerald-800 disabled:opacity-100'
                      : 'bg-black hover:bg-zinc-800 text-[#efeae3] shadow-md'
                  }`}
                >
                  {isActive ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
