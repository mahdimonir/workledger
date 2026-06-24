'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  FileText
} from 'lucide-react';

export default function ClientPortalPage() {
  const params = useParams();
  const shareToken = params?.shareToken as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080711] text-zinc-100 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 text-sm font-medium">Loading Client Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080711] text-zinc-100 selection:bg-purple-600 selection:text-white pb-16 text-left">
      {/* Top Banner */}
      <header className="border-b border-white/5 bg-[#080711]/60 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            WorkLedger Client Portal
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase tracking-wider">
            Guest Access
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10 flex flex-col gap-10">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Project: E-Commerce Rebuild</h1>
          <p className="text-zinc-500 text-sm mt-1">Share Token ID: {shareToken}</p>
        </div>

        {/* Milestone Tracker Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <span className="text-zinc-400 text-sm font-semibold">Milestones Completed</span>
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <span className="text-3xl font-extrabold text-white">3 / 5</span>
          </div>

          <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <span className="text-zinc-400 text-sm font-semibold">Timeline Deadlines</span>
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <span className="text-3xl font-extrabold text-white">July 15</span>
          </div>

          <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <span className="text-zinc-400 text-sm font-semibold">Outstanding Invoices</span>
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <FileText className="w-4 h-4" />
              </span>
            </div>
            <span className="text-3xl font-extrabold text-white">$1,800.00</span>
          </div>
        </div>

        {/* Discussions and Files */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-6 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" /> Discussion Board
            </h3>
            
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white">Mahdi Hasan (Owner)</span>
                  <span className="text-[10px] text-zinc-500">2 hours ago</span>
                </div>
                <p className="text-sm text-zinc-300">
                  Hi, I have uploaded the V2 responsive design mockups for your review. Let me know if you need any adjustments.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-purple-400" /> Share Deliverables
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="p-3 rounded bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span>homepage_v2_mockup.png</span>
                <span className="text-xs text-zinc-500">2.4 MB</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
