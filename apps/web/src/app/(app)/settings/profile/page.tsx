'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/shared/store/auth.store';
import { User, Mail, Shield, Save } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, accessToken, setSession } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Mock delay to simulate backend request
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Update the local Zustand session cache
    if (accessToken && user) {
      const activeWorkspace = useAuthStore.getState().workspace;
      const activeRole = useAuthStore.getState().role;
      setSession(accessToken, {
        user: {
          ...user,
          name,
          email,
        },
        workspace: activeWorkspace!,
        role: activeRole!,
      });
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h2 className="text-xl font-black uppercase tracking-tight text-black">User Profile Settings</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">
          Update your public profile display parameters.
        </p>
      </div>

      {success && (
        <div className="p-3.5 text-xs rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold text-center">
          Profile details updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> Full Display Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" /> Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Security Class
          </label>
          <input
            type="text"
            readOnly
            disabled
            value={user?.isSuperAdmin ? 'Super Administrator' : 'Standard Tenant User'}
            className="h-11 px-4 rounded-xl bg-[#f5f2ee] border border-black/10 text-xs focus:outline-none text-zinc-400 font-bold uppercase tracking-wider cursor-not-allowed select-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer shadow-lg w-fit px-6"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
