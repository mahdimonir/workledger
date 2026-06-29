'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/store/auth.store';
import { ArrowLeft, History, RefreshCw, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProposalVersionsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const proposalId = params.id as string;
  const { role } = useAuthStore();
  const isManagerOrOwner = role === 'OWNER' || role === 'MANAGER';
  const [error, setError] = useState('');

  // Queries
  const { data: versionsRes, isLoading } = useQuery({
    queryKey: ['proposal-versions', proposalId],
    queryFn: () => apiClient.get(`/proposals/${proposalId}/versions`).then((res) => res.data),
  });

  const versions = versionsRes?.data || [];

  // Restore Mutation
  const restoreMutation = useMutation({
    mutationFn: (versionNumber: number) => 
      apiClient.post(`/proposals/${proposalId}/versions/${versionNumber}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      router.push(`/proposals/${proposalId}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to restore version snapshot.');
    }
  });

  const handleRestore = (versionNumber: number) => {
    if (!isManagerOrOwner) return;
    if (confirm(`Are you sure you want to restore snapshot version v${versionNumber}? The current workspace draft will be snapshot-archived and overwritten.`)) {
      restoreMutation.mutate(versionNumber);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-full bg-black/5 rounded-xl"></div>
        <div className="h-32 bg-black/5 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-black text-left max-w-3xl">
      {/* Back and Title Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href={`/proposals/${proposalId}`}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-black transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Proposal
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Snapshots History</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
            Audit logs and snapshot recovery for proposal pitches.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
          {error}
        </div>
      )}

      {/* Versions Timeline List */}
      <div className="flex flex-col gap-4">
        {versions.length === 0 ? (
          <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <History className="w-10 h-10 text-zinc-300 mb-2" />
            <p className="text-zinc-550 text-xs font-bold uppercase tracking-wider">No snapshots recorded yet.</p>
          </div>
        ) : (
          versions.map((ver: any) => (
            <div 
              key={ver.id}
              className="p-5 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col sm:flex-row justify-between sm:items-center gap-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span className="h-9 w-9 rounded-xl bg-black/5 flex items-center justify-center text-xs font-black text-zinc-650">
                  v{ver.version}
                </span>
                <div className="flex flex-col text-left">
                  <span className="font-black text-sm text-black uppercase tracking-tight">Proposal Version Snapshot</span>
                  <span className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">
                    Created by {ver.user?.name || 'Workspace Manager'} • {new Date(ver.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-zinc-700">
                  Scope Amount: ${Number(ver.amount || 0).toLocaleString()}
                </span>
                {isManagerOrOwner && (
                  <button
                    type="button"
                    onClick={() => handleRestore(ver.version)}
                    disabled={restoreMutation.isPending}
                    className="h-9 px-3.5 rounded-lg border border-black/10 hover:bg-black/5 text-zinc-700 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
