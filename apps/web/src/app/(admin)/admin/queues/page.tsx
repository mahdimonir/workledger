'use client';

import React from 'react';
import { Workflow, RefreshCw, Layers } from 'lucide-react';

export default function AdminQueuesPage() {
  const queues = [
    { name: 'invoice.send', active: 0, waiting: 0, completed: 86, failed: 0 },
    { name: 'email.notification', active: 0, waiting: 0, completed: 154, failed: 2 },
    { name: 'pdf.generate', active: 0, waiting: 0, completed: 18, failed: 0 }
  ];

  return (
    <div className="flex flex-col gap-8 text-left text-zinc-100 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Workflow className="w-8 h-8 text-red-500" /> Platform Job Queues
          </h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
            Monitor background BullMQ workers and transactional queue flows
          </p>
        </div>
        
        <button 
          onClick={() => alert('Pruning queue dead-letter queues...')}
          className="h-10 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Retry Failed Jobs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {queues.map((q, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900 flex flex-col gap-4">
            <div className="flex justify-between items-start border-b border-zinc-850 pb-3">
              <span className="text-white font-bold font-mono text-xs">{q.name}</span>
              <Layers className="w-4 h-4 text-zinc-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center mt-2">
              <div className="bg-zinc-850/50 p-3 rounded-xl border border-zinc-800">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Active</span>
                <span className="text-lg font-bold text-zinc-300">{q.active}</span>
              </div>
              <div className="bg-zinc-850/50 p-3 rounded-xl border border-zinc-800">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Waiting</span>
                <span className="text-lg font-bold text-zinc-300">{q.waiting}</span>
              </div>
              <div className="bg-zinc-850/50 p-3 rounded-xl border border-zinc-800">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block text-emerald-500">Completed</span>
                <span className="text-lg font-bold text-emerald-400">{q.completed}</span>
              </div>
              <div className="bg-zinc-850/50 p-3 rounded-xl border border-zinc-800">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block text-rose-500">Failed</span>
                <span className={`text-lg font-bold ${q.failed > 0 ? 'text-rose-500' : 'text-zinc-500'}`}>{q.failed}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
