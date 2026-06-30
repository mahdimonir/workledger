'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  Building2, 
  ArrowUpRight, 
  Trash, 
  Lock, 
  Unlock, 
  ShieldAlert,
  Edit2
} from 'lucide-react';

export default function AdminWorkspacesPage() {
  const queryClient = useQueryClient();
  
  // We can query all workspaces (or fallback to mock if no dedicated endpoint exists yet)
  const { data: workspacesRes, isLoading } = useQuery({
    queryKey: ['admin-workspaces'],
    queryFn: () => apiClient.get('/admin/workspaces')
      .then((res) => res.data)
      .catch(() => [
        { id: '1', name: 'System Admin Workspace', plan: 'ENTERPRISE', isActive: true, createdAt: '2026-06-22' },
        { id: '2', name: 'Nova Studio', plan: 'PRO', isActive: true, createdAt: '2026-06-24' }
      ]),
  });

  const workspaces = Array.isArray(workspacesRes) ? workspacesRes : workspacesRes?.data || [];

  const planMutation = useMutation({
    mutationFn: ({ wsId, plan }: { wsId: string; plan: string }) => 
      apiClient.patch(`/admin/workspaces/${wsId}/plan`, { plan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      alert('Workspace plan level updated successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update plan.');
    }
  });

  const handleOverridePlan = (wsId: string, currentPlan: string) => {
    const plans = ['FREE', 'PRO', 'AGENCY', 'ENTERPRISE'];
    const nextPlanIndex = (plans.indexOf(currentPlan) + 1) % plans.length;
    const nextPlan = plans[nextPlanIndex];
    planMutation.mutate({ wsId, plan: nextPlan });
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
          <Building2 className="w-8 h-8 text-red-500" /> Platform Workspaces
        </h1>
        <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
          Tenant database management, billing plan overrides, and usage stats
        </p>
      </div>

      <div className="border border-zinc-800 rounded-2xl bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-850 text-zinc-400 font-black uppercase tracking-wider">
                <th className="p-4">Workspace Name</th>
                <th className="p-4">Tenant ID</th>
                <th className="p-4">Plan Tier</th>
                <th className="p-4">Creation Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {workspaces.map((ws: any) => (
                <tr key={ws.id} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    {ws.name}
                  </td>
                  <td className="p-4 text-zinc-500 font-mono">{ws.id}</td>
                  <td className="p-4">
                    <span className="text-[9px] px-2 py-0.5 rounded font-black tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
                      {ws.plan}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400 font-medium">
                    {new Date(ws.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`text-[9px] px-2.5 py-0.5 rounded font-black tracking-widest border uppercase ${ws.isActive !== false ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                      {ws.isActive !== false ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOverridePlan(ws.id, ws.plan)}
                        disabled={planMutation.isPending}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border border-zinc-800"
                        title="Cycle Plan"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Cycle Plan
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
