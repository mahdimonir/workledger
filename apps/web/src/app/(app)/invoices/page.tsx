'use client';

import React from 'react';
import { Plus, Download, Eye } from 'lucide-react';

export default function InvoicesPage() {
  const invoices = [
    { id: '1', number: 'INV-0001', client: 'Nova Studio', project: 'E-Commerce Rebuild', status: 'PAID', total: '$4,200.00', date: '2026-06-22' },
    { id: '2', number: 'INV-0002', client: 'Acme Corp', project: 'Brand Strategy Redesign', status: 'SENT', total: '$1,800.00', date: '2026-06-23' },
    { id: '3', number: 'INV-0003', client: 'Cyberdyne Systems', project: 'Cloud Migration', status: 'DRAFT', total: '$6,500.00', date: '2026-06-24' }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header action */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Invoices Ledger</h1>
          <p className="text-zinc-500 text-sm mt-1">Generate PDF invoices, record payments, and track overdue logs.</p>
        </div>
        <button className="h-11 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-300 flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Invoice list table */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-500 font-semibold">
                <th className="p-4">Invoice No.</th>
                <th className="p-4">Client / Project</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Total</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors">
                  <td className="p-4 font-bold text-zinc-900 dark:text-zinc-100">{invoice.number}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{invoice.client}</span>
                      <span className="text-zinc-500 text-xs mt-0.5">{invoice.project}</span>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">{invoice.date}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-850 dark:text-zinc-300'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">{invoice.total}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-colors">
                      <Download className="w-3.5 h-3.5" />
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
