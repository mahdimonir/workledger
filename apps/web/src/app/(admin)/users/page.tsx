'use client';

import React from 'react';

export default function AdminUsersPage() {
  const users = [
    { id: '1', name: 'Moniruzzaman Mahdi', email: 'mahdi@workledger.io', plan: 'FREE', joined: '2026-06-22', status: 'ACTIVE' },
    { id: '2', name: 'Test User', email: 'testuser_1001@workledger.io', plan: 'PRO', joined: '2026-06-23', status: 'ACTIVE' }
  ];

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Platform Users</h1>
        <p className="text-zinc-500 text-sm mt-1">Platform-wide user management, audits, and settings overrides.</p>
      </div>

      <div className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 font-semibold">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Plan Tier</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4 font-semibold text-white">{user.name}</td>
                  <td className="p-4 text-zinc-400">{user.email}</td>
                  <td className="p-4 text-zinc-400">{user.joined}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${user.plan === 'PRO' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                      Manage User
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
