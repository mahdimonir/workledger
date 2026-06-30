'use client';

import React, { useState } from 'react';
import { Radio, Send, Info } from 'lucide-react';

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Please fill out all fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      alert('System broadcast notification transmitted to active sessions.');
      setTitle('');
      setMessage('');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8 text-left text-zinc-100 select-none">
      <div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
          <Radio className="w-8 h-8 text-red-500" /> Platform Broadcasts
        </h1>
        <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
          Transmit system-wide announcement banners and updates to online users
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start max-w-4xl">
        <form onSubmit={handleSubmit} className="lg:col-span-2 p-8 rounded-2xl border border-zinc-800 bg-zinc-900 flex flex-col gap-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-850 pb-4">
            Broadcast Announcement
          </h3>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Target Audience</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full h-11 bg-zinc-850 border border-zinc-800 rounded-xl px-3 text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="ALL">All Online Users</option>
              <option value="PRO">PRO Tier Workspaces Only</option>
              <option value="AGENCY">AGENCY Tier Workspaces Only</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Subject</label>
            <input 
              type="text"
              placeholder="e.g. Planned Infrastructure Maintenance Window"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 bg-zinc-850 border border-zinc-800 rounded-xl px-3 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Message Content</label>
            <textarea 
              placeholder="Announce maintenance windows, platform upgrades, or system incidents..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-zinc-850 border border-zinc-800 rounded-xl p-3 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <Send className="w-4 h-4" /> {loading ? 'Broadcasting...' : 'Broadcast Announcement'}
          </button>
        </form>

        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Info className="w-4 h-4" />
            <h4 className="text-[10px] font-black uppercase tracking-widest">Broadcast Rules</h4>
          </div>
          <p className="text-xs font-light text-zinc-400 leading-relaxed">
            Announcements are pushed immediately via in-app feeds. Make sure dates are clear and concise.
          </p>
        </div>
      </div>
    </div>
  );
}
