'use client';

import React from 'react';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

export default function AdminMetricsPage() {
  const metrics = [
    { name: 'Monthly Recurring Revenue (MRR)', value: '$87.00', change: '+25%', icon: DollarSign },
    { name: 'Platform Users Count', value: '25', change: '+10%', icon: Users },
    { name: 'Total Invoices Compiled', value: '184', change: '+32', icon: Activity },
    { name: 'MRR Growth Margin', value: '+18.5%', change: 'up', icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Metrics & Revenue</h1>
        <p className="text-zinc-500 text-sm mt-1">Platform analytics, subscription revenues, and growth statistics.</p>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="text-zinc-500 text-sm font-medium">{metric.name}</span>
                <span className="p-2 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800">
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">{metric.value}</span>
                <span className="text-xs text-emerald-400 font-semibold">{metric.change}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
