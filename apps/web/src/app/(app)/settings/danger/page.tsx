'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/shared/store/auth.store';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { AlertOctagon, Trash } from 'lucide-react';

export default function DangerZoneSettingsPage() {
  const router = useRouter();
  const { workspace, role, clearSession } = useAuthStore();
  const isOwner = role === 'OWNER';

  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  
  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/workspaces/${workspace?.id}`), 
    onSuccess: () => {
      clearSession();
      router.push('/');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to delete workspace.');
    }
  });

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      setError('Only the workspace OWNER can terminate this workspace.');
      return;
    }
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm workspace termination.');
      return;
    }

    
    
    setError('');
    deleteMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h2 className="text-xl font-black uppercase tracking-tight text-black flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-600" /> Danger Zone
        </h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">
          Perform destructive workspace lifecycle operations.
        </p>
      </div>

      {error && (
        <div className="p-3.5 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 border border-rose-500/25 bg-rose-500/5 rounded-2xl p-6">
        <div className="flex flex-col gap-1 text-rose-950">
          <span className="text-xs font-black uppercase tracking-wider">Terminate Workspace</span>
          <p className="text-[11px] font-semibold mt-1 uppercase leading-normal tracking-wide text-rose-800">
            Permanently delete this workspace and purge all linked operations data including clients, invoices ledger, active proposals, comments, and milestones. This action is irreversible.
          </p>
        </div>

        <form onSubmit={handleDelete} className="flex flex-col gap-4 border-t border-rose-500/10 pt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-rose-900 uppercase tracking-widest">
              Type <span className="font-extrabold underline">DELETE</span> to confirm
            </label>
            <input
              type="text"
              required
              disabled={!isOwner}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="h-11 px-4 rounded-xl bg-white border border-rose-500/20 focus:outline-none focus:border-rose-600 text-rose-700 font-black uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={!isOwner || confirmText !== 'DELETE' || deleteMutation.isPending}
            className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-md w-fit px-6"
          >
            <Trash className="w-4 h-4" />
            {deleteMutation.isPending ? 'Terminating...' : 'Terminate Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
