'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </span>
        </div>

        {/* Policy document content */}
        <div className="text-left flex flex-col gap-6 font-light text-zinc-700 text-sm leading-relaxed">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">Privacy Policy</h1>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest -mt-4">
            Last Updated: June 30, 2026
          </p>

          <section className="flex flex-col gap-2 mt-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-black">1. Information Collection</h3>
            <p>
              We collect information necessary to operate your agency workspace. This includes your name, business details, client contacts, and invoicing transaction records to ensure sequential ledger consistency.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-black">2. Data Security</h3>
            <p>
              Your data is encrypted in transit and at rest. Access tokens are stored locally on your device, and session cookies are configured with HttpOnly and SameSite constraints to prevent cross-site scripting vulnerabilities.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-black">3. User Rights & Data Portability</h3>
            <p>
              You maintain ownership of all workspace assets. You can export complete billing packages, audit logs, and project metadata directly via the danger zone configurations in your settings at any time.
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
