'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/shared/api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/auth/password/reset-request', { email });
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Could not process password recovery request. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efeae3] text-black flex items-center justify-center px-6 relative font-sans overflow-hidden">
      <div className="absolute top-[20%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-white/40 filter blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-zinc-300/30 filter blur-[80px] pointer-events-none -z-10" />

      <div className="w-full max-w-md p-8 rounded-3xl glass-card flex flex-col gap-8 relative z-10">
        <div className="text-center flex flex-col gap-2">
          <Link href="/" className="flex flex-col items-center justify-center text-center leading-[0.8] select-none font-black text-black">
            <span className="text-[20px] uppercase tracking-tighter">WORK</span>
            <span className="text-[20px] uppercase text-zinc-500 tracking-tighter">LEDGER</span>
          </Link>
          <h2 className="text-2xl font-black uppercase tracking-tight mt-6">Recover Password</h2>
          <p className="text-zinc-650 text-sm font-light">We will send you a password reset token</p>
        </div>

        {error && (
          <div className="p-3 text-sm rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-center font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 text-xl font-bold">
              ✓
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight">Reset Link Sent</h3>
            <p className="text-zinc-600 text-sm leading-relaxed font-light">
              If the account exists, you will receive a secure password reset link in a few minutes.
            </p>
            <Link href="/login" className="h-12 w-full rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors mt-4 flex items-center justify-center cursor-pointer shadow-lg">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Email Address</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mahdi@workledger.io"
                className="h-12 px-4 rounded-xl bg-white/60 border border-black/10 text-black placeholder-zinc-400 focus:outline-none focus:border-black text-sm transition-colors"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-2 flex items-center justify-center cursor-pointer shadow-lg"
            >
              {loading ? 'Sending...' : 'Send Recovery Token'}
            </button>
          </form>
        )}

        {!success && (
          <p className="text-xs text-zinc-500 text-center font-medium">
            Remembered your password?{' '}
            <Link href="/login" className="text-black hover:underline font-bold transition-colors">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
