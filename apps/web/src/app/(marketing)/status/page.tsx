'use client';

import React from 'react';
import { CheckCircle, Activity, Server, Clock } from 'lucide-react';
import Link from 'next/link';

export default function PlatformStatusPage() {
  const monitors = [
    { name: 'Application API Gateway', uptime: '100%', status: 'OPERATIONAL' },
    { name: 'Edge CDN Content Delivery', uptime: '100%', status: 'OPERATIONAL' },
    { name: 'Invoice PDF Rendering Engine', uptime: '99.98%', status: 'OPERATIONAL' },
    { name: 'Database Replication Node', uptime: '100%', status: 'OPERATIONAL' }
  ];

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
            System Status
          </span>
        </div>

        {/* Global indicator card */}
        <div className="bg-[#f5f2ee] border border-emerald-500/20 rounded-3xl p-8 flex items-center gap-4 shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-600 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-black">All Systems Operational</h2>
            <p className="text-xs text-zinc-500 font-light mt-1">
              We monitor WorkLedger core services and microservices 24/7. No incidents reported in the last 90 days.
            </p>
          </div>
        </div>

        {/* Individual monitors */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">System Monitored Nodes</h3>
          
          <div className="flex flex-col gap-3">
            {monitors.map((m, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl border border-black/5 bg-[#f5f2ee]/50 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <Server className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-800">{m.name}</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {m.uptime} Uptime
                  </div>
                  <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-extrabold uppercase tracking-widest">
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-12">
        Powered by WorkLedger Systems
      </div>
    </div>
  );
}
