'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/store/auth.store';
import { apiClient } from '@/shared/api/client';
import { ArrowRight } from 'lucide-react';

export default function BusinessProfileStep() {
  const router = useRouter();
  const { workspace, setSession, accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [defaultTaxRate, setDefaultTaxRate] = useState(0);
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [timezone, setTimezone] = useState('UTC');
  const [error, setError] = useState('');

  useEffect(() => {
    if (workspace) {
      setBusinessName(workspace.name || '');
    }
  }, [workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.patch('/workspace/settings', {
        name: businessName,
        businessName,
        address,
        defaultCurrency,
        defaultTaxRate: Number(defaultTaxRate),
        invoicePrefix,
        timezone,
      });

      // Update local session workspace name
      if (accessToken && res.data?.data) {
        const user = useAuthStore.getState().user;
        const role = useAuthStore.getState().role;
        if (user && role) {
          setSession(accessToken, {
            user,
            workspace: {
              ...workspace!,
              name: res.data.data.name,
            },
            role,
          });
        }
      }

      router.push('/onboarding/team');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update business profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/team');
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-black">Business Profile</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1.5">
          Configure your default business settings. You can change these anytime in Settings.
        </p>
      </div>

      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Business Name *</label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Acme Studio LLC"
            className="h-11 px-4 rounded-xl bg-white/85 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Business Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 123 Creative Row, Ste 100, San Francisco, CA"
            rows={2}
            className="p-4 rounded-xl bg-white/85 border border-black/10 text-sm focus:outline-none focus:border-black text-black resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Default Currency</label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/85 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AUD">AUD ($)</option>
              <option value="CAD">CAD ($)</option>
              <option value="BDT">BDT (৳)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Default Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={defaultTaxRate}
              onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
              placeholder="0.00"
              className="h-11 px-4 rounded-xl bg-white/85 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Invoice Prefix</label>
            <input
              type="text"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              placeholder="INV"
              className="h-11 px-4 rounded-xl bg-white/85 border border-black/10 text-sm focus:outline-none focus:border-black text-black uppercase font-bold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/85 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">EST (New York)</option>
              <option value="America/Los_Angeles">PST (Los Angeles)</option>
              <option value="Europe/London">GMT (London)</option>
              <option value="Asia/Dhaka">BST (Dhaka)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mt-6">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs uppercase tracking-widest font-black text-zinc-400 hover:text-black transition-colors cursor-pointer"
          >
            Skip this step
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Next Step'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
