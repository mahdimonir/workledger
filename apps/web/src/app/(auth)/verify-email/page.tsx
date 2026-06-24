'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMsg('No verification token provided.');
      return;
    }

    setTimeout(() => {
      setStatus('success');
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen bg-[#efeae3] text-black flex items-center justify-center px-6 relative font-sans overflow-hidden">
      <div className="absolute top-[20%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-white/40 filter blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-zinc-300/30 filter blur-[80px] pointer-events-none -z-10" />

      <div className="w-full max-w-md p-8 rounded-3xl glass-card flex flex-col gap-8 text-center relative z-10">
        <Link href="/" className="flex flex-col items-center justify-center text-center leading-[0.8] select-none font-black text-black">
          <span className="text-[20px] uppercase tracking-tighter">WORK</span>
          <span className="text-[20px] uppercase text-zinc-500 tracking-tighter">LEDGER</span>
        </Link>

        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Verifying Email</h2>
            <p className="text-zinc-600 text-sm font-light">Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 text-xl font-bold">
              ✓
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Email Verified</h2>
            <p className="text-zinc-650 text-sm font-light">Your email address has been successfully confirmed.</p>
            <Link href="/login" className="h-12 w-full rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors mt-4 flex items-center justify-center cursor-pointer shadow-lg">
              Proceed to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-700 text-xl font-bold">
              !
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Verification Failed</h2>
            <p className="text-red-700 text-sm font-medium">{errorMsg || 'The verification link is invalid or has expired.'}</p>
            <Link href="/signup" className="h-12 w-full rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors mt-4 flex items-center justify-center cursor-pointer shadow-lg">
              Try signing up again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
