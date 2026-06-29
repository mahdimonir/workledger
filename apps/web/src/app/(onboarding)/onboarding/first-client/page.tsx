'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/api/client';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function FirstClientStep() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const finishOnboarding = () => {
    // Set cookie client-side so middleware knows onboarding is complete
    document.cookie = 'wl_onboarding_complete=true; path=/; max-age=31536000; SameSite=Lax';
    router.replace('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/clients', {
        name,
        company: company || undefined,
        email: email || undefined,
      });

      finishOnboarding();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create client.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-black">Your First Client</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1.5">
          Create your first client directory entry. You can link this client to projects, invoices, and proposals.
        </p>
      </div>

      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client Contact Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Company Name</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Contact Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. john@acmecorp.com"
            className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
          />
        </div>

        {/* Navigation actions */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => router.push('/onboarding/team')}
            className="h-12 px-6 rounded-xl border border-black/10 hover:bg-black/5 text-zinc-700 font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={finishOnboarding}
              className="text-xs uppercase tracking-widest font-black text-zinc-400 hover:text-black transition-colors cursor-pointer"
            >
              Skip & Finish
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Finish Onboarding'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
