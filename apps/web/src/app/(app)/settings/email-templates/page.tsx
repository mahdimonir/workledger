'use client';

import React from 'react';
import { Mail, Info } from 'lucide-react';

export default function EmailTemplatesSettingsPage() {
  const isEnabled = false; // Simulated feature flag for email-templates

  return (
    <div className="py-12 flex flex-col items-center justify-center text-center select-none">
      <div className="w-16 h-16 rounded-3xl bg-[#f5f2ee] border border-black/10 flex items-center justify-center text-zinc-400 mb-6 shadow-sm">
        <Mail className="w-8 h-8" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-black/5 px-3 py-1 rounded-full mb-3">
        Feature Gated
      </span>
      <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-3">
        Email HTML Templates
      </h2>
      <p className="text-zinc-650 text-sm leading-relaxed max-w-sm font-light mb-8">
        Customize automated notification emails (invoice sent, payment confirmations, and proposal links) with variables.
      </p>
      
      <div className="w-full bg-[#f5f2ee] border border-black/5 rounded-2xl p-4 flex gap-3 text-left max-w-md mx-auto">
        <Info className="w-5 h-5 text-zinc-500 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-zinc-500 font-light leading-normal">
          <strong>Notice:</strong> This customization module is currently feature-flagged. The transactional email render-workers are being verified on the API side.
        </p>
      </div>
    </div>
  );
}
