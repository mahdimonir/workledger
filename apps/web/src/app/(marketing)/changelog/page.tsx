'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, GitCommit } from 'lucide-react';

export default function ChangelogPage() {
  const logs = [
    {
      version: 'v0.4.0',
      date: 'June 29, 2026',
      title: 'SaaS Core & Collapsible Sidebar Update',
      updates: [
        'Implemented collapsible navigation rail with full tooltips.',
        'Added dynamic member onboarding flow steppers.',
        'Wired invoice payments transaction ledgers.',
        'Added public client portals for proposals acceptance and invoices.'
      ]
    },
    {
      version: 'v0.3.0',
      date: 'June 18, 2026',
      title: 'Go PDF Rendering service integration',
      updates: [
        'Added asynchronous PDF rendering microservice.',
        'Wired sequential invoicing generation templates.'
      ]
    }
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
            Product Changelog
          </span>
        </div>

        {/* Introduction */}
        <div className="text-left">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">Product Updates</h1>
          <p className="text-zinc-500 text-sm font-light leading-relaxed mt-2 max-w-lg">
            Review chronological additions, system upgrades, and visual changes made to the WorkLedger platform.
          </p>
        </div>

        {/* Timeline updates list */}
        <div className="flex flex-col gap-12 mt-4 text-left">
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-6 items-start relative">
              
              {/* Timeline indicator line */}
              {idx !== logs.length - 1 && (
                <div className="absolute left-[18px] top-8 bottom-[-48px] w-px bg-black/10" />
              )}
              
              <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center border border-black/5 flex-shrink-0 mt-1">
                <GitCommit className="w-4 h-4 text-zinc-500" />
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest px-3 py-1 bg-black text-[#efeae3] rounded-full">
                    {log.version}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {log.date}
                  </span>
                </div>
                
                <h3 className="text-lg font-black uppercase tracking-tight text-black mt-1">
                  {log.title}
                </h3>
                
                <ul className="list-disc list-inside flex flex-col gap-2 text-zinc-700 text-xs font-light leading-relaxed pl-1">
                  {log.updates.map((up, upIdx) => (
                    <li key={upIdx} className="marker:text-zinc-400">
                      {up}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>

      </div>

      <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-16">
        Copyright &copy; WorkLedger Systems
      </div>
    </div>
  );
}
