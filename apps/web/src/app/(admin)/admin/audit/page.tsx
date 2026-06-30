'use client';

import React from 'react';
import { ScrollText, Clock, Shield } from 'lucide-react';

export default function AdminAuditPage() {
  const auditLogs = [
    { id: '1', action: 'PLAN_CHANGED', entity: 'Workspace: Nova Studio', user: 'admin@workledger.io', ip: '127.0.0.1', date: '2026-06-30 08:35:12' },
    { id: '2', action: 'USER_LOGIN', entity: 'User: test@workledger.io', user: 'test@workledger.io', ip: '127.0.0.1', date: '2026-06-30 08:02:44' }
  ];

  return (
    <div className="flex flex-col gap-8 text-left text-zinc-100 select-none">
      <div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
          <ScrollText className="w-8 h-8 text-red-500" /> Platform Audit Log
        </h1>
        <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
          Chronological record of platform modifications, plan updates, and authentication audits
        </p>
      </div>

      <div className="border border-zinc-800 rounded-2xl bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-850 text-zinc-400 font-black uppercase tracking-wider">
                <th className="p-4">Action Event</th>
                <th className="p-4">Modified Target</th>
                <th className="p-4">Performed By</th>
                <th className="p-4">IP Address</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-red-500" /> {log.action}
                  </td>
                  <td className="p-4 text-zinc-300 font-semibold">{log.entity}</td>
                  <td className="p-4 text-zinc-400 font-medium">{log.user}</td>
                  <td className="p-4 text-zinc-400 font-mono">{log.ip}</td>
                  <td className="p-4 text-right text-zinc-400 font-medium">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
