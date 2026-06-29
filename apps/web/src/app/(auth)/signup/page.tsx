'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { toast } from '@/shared/store/toast.store';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post('/auth/signup', {
        name,
        workspaceName,
        email,
        password,
      });
      toast.success('Workspace created successfully!');
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || 
        'Registration failed. Please double-check your inputs.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efeae3] text-black flex items-center justify-center px-6 relative py-12 font-sans overflow-hidden">
      <div className="absolute top-[20%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-white/40 filter blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-zinc-300/30 filter blur-[80px] pointer-events-none -z-10" />

      <div className="w-full max-w-md p-8 rounded-3xl glass-card flex flex-col gap-8 relative z-10">
        <div className="text-center flex flex-col gap-2">
          <Link href="/" className="flex flex-col items-center justify-center text-center leading-[0.8] select-none font-black text-black">
            <span className="text-[20px] uppercase tracking-tighter">WORK</span>
            <span className="text-[20px] uppercase text-zinc-500 tracking-tighter">LEDGER</span>
          </Link>
          <h2 className="text-2xl font-black uppercase tracking-tight mt-6">Create Account</h2>
          <p className="text-zinc-650 text-sm font-light">Onboard your freelancer ledger in seconds</p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 text-xl font-bold">
              ✓
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight">Workspace Created</h3>
            <p className="text-zinc-600 text-sm leading-relaxed font-light">
              We have sent a verification link to <strong className="text-black font-semibold">{email}</strong>. Please check your inbox and verify your email to activate your account.
            </p>
            <Link href="/login" className="h-12 w-full rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors mt-4 flex items-center justify-center cursor-pointer shadow-lg">
              Proceed to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Full Name</label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mahdi Hasan"
                className="h-12 px-4 rounded-xl bg-white/60 border border-black/10 text-black placeholder-zinc-400 focus:outline-none focus:border-black text-sm transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Workspace Name</label>
              <input 
                type="text"
                required
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Nova Studio"
                className="h-12 px-4 rounded-xl bg-white/60 border border-black/10 text-black placeholder-zinc-400 focus:outline-none focus:border-black text-sm transition-colors"
              />
            </div>

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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full pl-4 pr-12 rounded-xl bg-white/60 border border-black/10 text-black placeholder-zinc-400 focus:outline-none focus:border-black text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-2 flex items-center justify-center cursor-pointer shadow-lg"
            >
              {loading ? 'Registering...' : 'Create Workspace'}
            </button>
          </form>
        )}

        {!success && (
          <p className="text-xs text-zinc-500 text-center font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-black hover:underline font-bold transition-colors">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
