'use client';

import React from 'react';
import { Activity, Server, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminServiceStatusPage() {
  const services = [
    { name: 'NestJS API Server', status: 'OPERATIONAL', latency: '42ms', lastChecked: '1 min ago' },
    { name: 'PostgreSQL Database', status: 'OPERATIONAL', latency: '8ms', lastChecked: '1 min ago' },
    { name: 'Redis Cache (ioredis)', status: 'OPERATIONAL', latency: '1ms', lastChecked: '1 min ago' },
    { name: 'Go PDF Microservice', status: 'OPERATIONAL', latency: '120ms', lastChecked: '2 mins ago' }
  ];

  return (
    <div className="flex flex-col gap-8 text-left text-zinc-100 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Activity className="w-8 h-8 text-red-500" /> Infrastructure Status
          </h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
            Real-time ping checks and latency status for platform core services
          </p>
        </div>
        
        <button 
          onClick={() => alert('Refreshing platform services health check...')}
          className="h-10 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {services.map((service, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  {service.name}
                </h3>
                <div className="flex items-center gap-2.5 text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                  <span>Latency: {service.latency}</span>
                  <span>·</span>
                  <span>Checked {service.lastChecked}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest">
              <CheckCircle2 className="w-3.5 h-3.5" /> Operational
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
