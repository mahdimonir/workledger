'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="w-full min-h-screen bg-[#efeae3] text-black select-none py-20 px-6 flex flex-col items-center justify-between">
      <div className="w-full max-w-3xl flex flex-col gap-10">
        
        {/* Logo and breadcrumb */}
        <div className="flex items-center justify-between border-b border-black/10 pb-6">
          <Link href="/" className="flex flex-col leading-[0.85] font-black text-black">
            <span className="text-[18px] uppercase tracking-tighter">WORK</span>
            <span className="text-[18px] uppercase text-zinc-400 tracking-tighter">LEDGER</span>
          </Link>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black/5 border border-black/8 text-zinc-500 rounded-full">
            Terms of Service
          </span>
        </div>

        {/* Policy document content */}
        <div className="text-left flex flex-col gap-6 font-light text-zinc-700 text-sm leading-relaxed">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">Terms of Service</h1>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest -mt-4">
            Last Updated: June 30, 2026
          </p>

          <section className="flex flex-col gap-2 mt-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-black">1. Workspace Registration</h3>
            <p>
              Workspaces must be registered by authorized representatives. All activities, milestones, and invoice transactions completed under your workspace token remain your responsibility.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-black">2. Subscription Billing & Plans</h3>
            <p>
              Fees are billed on a recurring monthly cycle according to your selected tier. Manual override features on plan parameters remain subject to super-admin terms and payment conditions.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-black">3. Service Availability</h3>
            <p>
              We strive for maximum system availability. Background queue operations, PDF rendering services, and database nodes are monitored for operational integrity as detailed on our public status page.
            </p>
          </section>
        </div>

      </div>

      <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-16">
        Copyright &copy; WorkLedger Systems
      </div>
    </div>
  );
}
