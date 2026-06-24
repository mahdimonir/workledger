'use client';

import React, { useState } from 'react';
import { Search, Plus, SlidersHorizontal, Eye } from 'lucide-react';

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const initialClients = [
    { id: '1', name: 'Mahdi Hasan', company: 'Nova Studio', email: 'mahdi@novastudio.com', phone: '+8801700000000', healthStatus: 'ACTIVE', revenue: '$4,200.00' },
    { id: '2', name: 'John Doe', company: 'Acme Corp', email: 'john@acme.com', phone: '+15550199', healthStatus: 'ACTIVE', revenue: '$1,800.00' },
    { id: '3', name: 'Sarah Connor', company: 'Cyberdyne Systems', email: 'sarah@cyberdyne.com', phone: '+15550188', healthStatus: 'AT_RISK', revenue: '$2,450.00' }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header action */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clients CRM</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage client profiles, health statuses, and invoice records.</p>
        </div>
        <button className="h-11 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-300 flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Search & filter bars */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, or email..."
            className="w-full h-11 pl-10 pr-4 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:border-purple-500 transition-colors text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <button className="h-11 px-4 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="w-4 h-4 text-zinc-500" /> Filters
        </button>
      </div>

      {/* CRM list table */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-500 font-semibold">
                <th className="p-4">Name / Company</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Health</th>
                <th className="p-4">Revenue</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {initialClients.map((client) => (
                <tr key={client.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{client.name}</span>
                      <span className="text-zinc-500 text-xs mt-0.5">{client.company}</span>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">{client.email}</td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">{client.phone}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${client.healthStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'}`}>
                      {client.healthStatus}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">{client.revenue}</td>
                  <td className="p-4 text-right">
                    <button className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold">
                      <Eye className="w-3.5 h-3.5" /> View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
