'use client';

import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#efeae3] flex flex-col items-center justify-center p-6 selection:bg-black selection:text-[#efeae3]">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        
        {/* Centered Logo */}
        <Link href="/" className="flex flex-col items-center text-center leading-[0.8] select-none font-black text-black">
          <span className="text-[24px] uppercase tracking-tighter">WORK</span>
          <span className="text-[24px] uppercase text-zinc-500 tracking-tighter">LEDGER</span>
        </Link>

        {/* Card wrapper with clean premium borders */}
        <div className="w-full bg-[#f5f2ee] border border-black/10 rounded-3xl p-8 shadow-sm">
          {children}
        </div>

        <div className="text-center text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
          Secure Workspace Login · WorkLedger
        </div>

      </div>
    </div>
  );
}
