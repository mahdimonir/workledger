'use client';

import React, { useState } from 'react';
import { Sliders, Save, ShieldAlert } from 'lucide-react';

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState('WorkLedger');
  const [supportEmail, setSupportEmail] = useState('support@workledger.io');
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert('Platform configuration values saved successfully.');
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-8 text-left text-zinc-100 select-none">
      <div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
          <Sliders className="w-8 h-8 text-red-500" /> Platform Settings
        </h1>
        <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
          Modify SaaS global settings, support links, and platform configurations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start max-w-4xl">
        <form onSubmit={handleSubmit} className="lg:col-span-2 p-8 rounded-2xl border border-zinc-800 bg-zinc-900 flex flex-col gap-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-850 pb-4">
            Global Config Parameters
          </h3>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Platform Brand Name</label>
            <input 
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full h-11 bg-zinc-850 border border-zinc-800 rounded-xl px-3 text-xs font-medium text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Support Desk Email</label>
            <input 
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full h-11 bg-zinc-850 border border-zinc-800 rounded-xl px-3 text-xs font-medium text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-850/50 border border-zinc-800 rounded-2xl mt-2">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">System Maintenance Mode</h4>
              <p className="text-[10px] text-zinc-500 font-light mt-0.5">Redirect users to system downtime view globally</p>
            </div>
            <input 
              type="checkbox"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              className="w-5 h-5 rounded border-zinc-800 bg-zinc-900 text-red-600 focus:ring-red-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <Save className="w-4 h-4" /> {loading ? 'Saving Parameters...' : 'Save Parameters'}
          </button>
        </form>

        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-rose-500">
            <ShieldAlert className="w-4 h-4" />
            <h4 className="text-[10px] font-black uppercase tracking-widest">Platform Core</h4>
          </div>
          <p className="text-xs font-light text-zinc-400 leading-relaxed">
            Changing brand configurations here propagates values immediately to email headers.
          </p>
        </div>
      </div>
    </div>
  );
}
