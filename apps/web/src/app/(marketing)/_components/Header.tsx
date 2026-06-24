'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative flex items-center justify-between h-[100px] w-full px-[5vw] md:px-[2vw] z-40 bg-[#efeae3]">

      <Link href="/" className="flex flex-col text-left leading-[0.8] select-none font-black" onClick={() => setOpen(false)}>
        <span className="text-[24px] uppercase text-black tracking-tighter">WORK</span>
        <span className="text-[24px] uppercase text-zinc-600 tracking-tighter">LEDGER</span>
      </Link>

      <div className="hidden md:flex items-center gap-[1vw]">
        <Link href="/" className="nav-btn"><span>Overview</span></Link>
        <Link href="/pricing" className="nav-btn"><span>Pricing</span></Link>
        <Link href="/roadmap" className="nav-btn"><span>Roadmap</span></Link>
        <Link href="/login" className="nav-btn nav-btn-login"><span>Login</span></Link>
      </div>

      <button
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border border-black/20 bg-transparent hover:bg-black/5 transition-colors"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {open && (
        <div className="absolute top-full left-0 w-full bg-[#efeae3] border-t border-black/8 flex flex-col px-5 py-4 gap-1 md:hidden z-50 shadow-lg">
          <Link href="/" className="py-3.5 px-4 font-bold text-sm uppercase tracking-widest hover:bg-black/5 rounded-xl transition-colors border-b border-black/5" onClick={() => setOpen(false)}>Overview</Link>
          <Link href="/pricing" className="py-3.5 px-4 font-bold text-sm uppercase tracking-widest hover:bg-black/5 rounded-xl transition-colors border-b border-black/5" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/roadmap" className="py-3.5 px-4 font-bold text-sm uppercase tracking-widest hover:bg-black/5 rounded-xl transition-colors border-b border-black/5" onClick={() => setOpen(false)}>Roadmap</Link>
          <Link href="/login" className="mt-2 py-3.5 px-4 font-bold text-sm uppercase tracking-widest bg-black text-[#efeae3] rounded-xl text-center hover:bg-zinc-800 transition-colors" onClick={() => setOpen(false)}>Login</Link>
        </div>
      )}
    </nav>
  );
}
