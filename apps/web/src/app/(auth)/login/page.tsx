'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/store/auth.store';
import { toast } from '@/shared/store/toast.store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const loginRes = await apiClient.post('/auth/login', { email, password });
      const { accessToken } = loginRes.data.data;

      const meRes = await apiClient.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { user, workspace, role } = meRes.data.data;

      useAuthStore.getState().setSession(accessToken, { user, workspace, role });
      toast.success('Welcome back to WorkLedger!');

      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || 
        'Invalid email or password. Please try again.'
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
          <h2 className="text-2xl font-black uppercase tracking-tight mt-6">Welcome Back</h2>
          <p className="text-zinc-650 text-sm font-light">Log in to manage your freelancer ledger</p>
        </div>

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

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Password</label>
              <Link href="/forgot-password" className="text-xs font-bold text-zinc-600 hover:text-black transition-colors">
                Forgot?
              </Link>
            </div>
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
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-xs text-zinc-500 text-center font-medium">
          Don't have an account?{' '}
          <Link href="/signup" className="text-black hover:underline font-bold transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
