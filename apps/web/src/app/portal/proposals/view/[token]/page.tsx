'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download, 
  AlertCircle,
  Signature
} from 'lucide-react';

export default function ClientProposalPortalPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [status, setStatus] = useState<'idle' | 'accepted' | 'rejected'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch proposal details via viewToken
  const { data: proposalRes, isLoading } = useQuery({
    queryKey: ['portal-proposal', token],
    queryFn: () => apiClient.get(`/proposals/view/${token}`).then((res) => res.data),
  });

  const proposal = proposalRes?.data;

  const acceptMutation = useMutation({
    mutationFn: () => apiClient.post(`/proposals/view/${token}/accept`),
    onSuccess: () => {
      setStatus('accepted');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to accept proposal.');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: () => apiClient.post(`/proposals/view/${token}/reject`),
    onSuccess: () => {
      setStatus('rejected');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to reject proposal.');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#efeae3] flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading proposal...</span>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-[#efeae3] flex items-center justify-center p-6 text-center select-none text-black">
        <div className="max-w-md bg-[#f5f2ee] border border-black/10 rounded-3xl p-8 shadow-sm flex flex-col items-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-4" />
          <h3 className="font-black text-lg uppercase tracking-tight text-black mb-1">Proposal Not Found</h3>
          <p className="text-xs text-zinc-500 font-light leading-relaxed">
            The proposal link is invalid, expired, or has been revoked by the workspace administrator.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="min-h-screen bg-[#efeae3] flex items-center justify-center p-6 text-center select-none text-black">
        <div className="max-w-md bg-[#f5f2ee] border border-[#efeae3] rounded-3xl p-8 shadow-sm flex flex-col items-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
          <h3 className="font-black text-xl uppercase tracking-tight text-black mb-2">Proposal Signed!</h3>
          <p className="text-sm text-zinc-500 font-light leading-relaxed">
            Thank you! You have accepted and signed off the proposal: <strong>{proposal.title}</strong>. A draft project has been generated automatically, and your account manager has been notified.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="min-h-screen bg-[#efeae3] flex items-center justify-center p-6 text-center select-none text-black">
        <div className="max-w-md bg-[#f5f2ee] border border-black/10 rounded-3xl p-8 shadow-sm flex flex-col items-center">
          <XCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h3 className="font-black text-xl uppercase tracking-tight text-black mb-2">Proposal Rejected</h3>
          <p className="text-sm text-zinc-500 font-light leading-relaxed">
            You have rejected the proposal. The status has been logged, and your account manager has been notified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efeae3] text-black select-none py-12 px-6 flex flex-col items-center justify-center text-left">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* Workspace Brand Row */}
        <div className="flex items-center justify-between border-b border-black/10 pb-6">
          <div className="flex flex-col leading-[0.85] font-black text-black">
            <span className="text-[18px] uppercase tracking-tighter">WORK</span>
            <span className="text-[18px] uppercase text-zinc-400 tracking-tighter">LEDGER</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black/5 border border-black/8 text-zinc-500 rounded-full">
            Client Portal
          </span>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-semibold text-rose-600 leading-normal">
            {errorMessage}
          </div>
        )}

        {/* Proposal Document Body */}
        <div className="bg-[#f5f2ee] border border-black/10 rounded-3xl p-8 shadow-sm flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-black/10 pb-6">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-black">{proposal.title}</h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                Valid until: {new Date(proposal.validUntil || Date.now()).toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Estimated Value</span>
              <h3 className="text-2xl font-black text-black">
                ${Number(proposal.estimatedValue || 0).toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Scope details */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Statement of Work</h3>
            <div className="bg-white/50 border border-black/5 rounded-2xl p-5 text-sm text-zinc-700 leading-relaxed font-light whitespace-pre-wrap">
              {proposal.description || 'No statement of work details provided.'}
            </div>
          </div>

          {/* Signoff Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-end border-t border-black/10 pt-8 mt-4">
            <button
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending || acceptMutation.isPending}
              className="h-14 px-8 rounded-full border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 font-bold uppercase tracking-widest text-xs flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
            >
              Reject Proposal
            </button>
            <button
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending || rejectMutation.isPending}
              className="h-14 px-10 rounded-full bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-lg"
            >
              <Signature className="w-4 h-4" /> {acceptMutation.isPending ? 'Signing...' : 'Accept & Sign Proposal'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
