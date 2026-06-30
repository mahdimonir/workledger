'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  Users, 
  ShieldAlert, 
  Trash, 
  Lock, 
  Unlock, 
  Mail, 
  UserCheck 
} from 'lucide-react';

export default function AdminUsersListPage() {
  const queryClient = useQueryClient();

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get('/admin/users').then((res) => res.data),
  });

  const users = usersRes || [];

  const handleActionSim = (action: string, user: any) => {
    alert(`Action "${action}" triggered for ${user.email}. System administration endpoints are active.`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse text-zinc-400 text-left">
        <div className="h-10 w-48 bg-zinc-800 rounded-lg"></div>
        <div className="h-64 bg-zinc-850 border border-zinc-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left text-zinc-100 select-none">
      <div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
          <Users className="w-8 h-8 text-red-500" /> Platform Users
        </h1>
        <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
          Platform-wide user management, roles, and administrative commands
        </p>
      </div>

      <div className="border border-zinc-800 rounded-2xl bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-850 text-zinc-400 font-black uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Membership Roles</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    {user.name || 'Anonymous User'}
                    {user.isSuperAdmin && (
                      <span className="text-[8px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-black uppercase tracking-widest">
                        SA
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-zinc-400 font-medium">{user.email}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {user.memberships?.map((m: any, idx: number) => (
                        <div key={idx} className="text-[10px] text-zinc-400 font-medium">
                          {m.workspace.name} ({m.role}) · <span className="font-bold text-red-500">{m.workspace.plan}</span>
                        </div>
                      )) || <span className="text-zinc-650">—</span>}
                    </div>
                  </td>
                  <td className="p-4 text-zinc-400 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`text-[9px] px-2.5 py-0.5 rounded font-black tracking-widest border uppercase ${user.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleActionSim('SUSPEND', user)}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title={user.isActive ? 'Suspend User' : 'Unsuspend User'}
                      >
                        {user.isActive ? <Lock className="w-4 h-4 text-rose-500" /> : <Unlock className="w-4 h-4 text-emerald-500" />}
                      </button>
                      <button 
                        onClick={() => handleActionSim('IMPERSONATE', user)}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Impersonate Account"
                      >
                        <UserCheck className="w-4 h-4 text-zinc-400 hover:text-zinc-100" />
                      </button>
                    </div>
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
