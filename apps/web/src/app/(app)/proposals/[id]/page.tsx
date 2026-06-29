'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  ArrowLeft, 
  Send, 
  History, 
  Edit, 
  Calendar, 
  FileText,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function ProposalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const proposalId = params.id as string;
  const [copied, setCopied] = useState(false);

  
  const { data: proposalRes, isLoading: loadingProposal } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: () => apiClient.get(`/proposals/${proposalId}`).then((res) => res.data),
  });

  const { data: clientsRes, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.get('/clients').then((res) => res.data),
  });

  const proposal = proposalRes?.data;
  const clients = clientsRes?.data || [];
  const client = proposal ? clients.find((c: any) => c.id === proposal.clientId) : null;

  const isLoading = loadingProposal || loadingClients;

  
  const sendMutation = useMutation({
    mutationFn: () => apiClient.post(`/proposals/${proposalId}/send`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }
  });

  const handleSendPitch = () => {
    sendMutation.mutate();
  };

  const handleCopyLink = () => {
    if (!proposal?.shareToken) return;
    const url = `${window.location.origin}/portal/proposals/${proposal.shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse text-black">
        <div className="h-10 w-48 bg-black/5 rounded-lg"></div>
        <div className="h-64 bg-black/5 rounded-2xl"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
        <h3 className="font-black text-lg uppercase tracking-tight text-black mb-2">Proposal Not Found</h3>
        <button 
          onClick={() => router.push('/proposals')}
          className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
      </div>
    );
  }

  const items = proposal.lineItems || [];

  return (
    <div className="flex flex-col gap-8 text-black text-left">
      {}
      <div className="flex flex-col gap-4">
        <Link 
          href="/proposals"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-black transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">{proposal.title}</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1.5 flex items-center gap-2">
              Client: {client?.name || 'Unknown'} ({client?.company || 'No Company'})
              <span className="text-[10px] font-black text-zinc-400">v{proposal.version}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase ${
              proposal.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
              proposal.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
              proposal.status === 'DECLINED' ? 'bg-rose-100 text-rose-800' : 'bg-zinc-150 text-zinc-800'
            }`}>
              {proposal.status}
            </span>
          </div>
        </div>
      </div>

      {}
      <div className="flex flex-wrap gap-3">
        {proposal.status === 'DRAFT' && (
          <button
            onClick={handleSendPitch}
            disabled={sendMutation.isPending}
            className="h-11 px-5 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {sendMutation.isPending ? 'Sending...' : 'Send Proposal'}
          </button>
        )}

        {proposal.status !== 'DRAFT' && proposal.shareToken && (
          <button
            onClick={handleCopyLink}
            className={`h-11 px-5 rounded-xl border border-black/10 hover:bg-black/5 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              copied ? 'bg-emerald-50 border-emerald-250 text-emerald-800' : 'text-zinc-700'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied View Link' : 'Copy View Link'}</span>
          </button>
        )}

        <Link
          href={`/proposals/${proposalId}/versions`}
          className="h-11 px-5 rounded-xl border border-black/10 hover:bg-black/5 text-zinc-700 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
        >
          <History className="w-4 h-4" /> Snapshots History
        </Link>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {}
        <div className="md:col-span-2 p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col gap-6 shadow-sm">
          <h3 className="font-black text-xs uppercase tracking-widest border-b border-black/5 pb-3">Pitch Summary</h3>
          
          {proposal.introduction ? (
            <p className="text-xs font-semibold text-zinc-700 leading-relaxed whitespace-pre-wrap">
              {proposal.introduction}
            </p>
          ) : (
            <span className="text-xs font-semibold text-zinc-400 uppercase italic">No introductory summary included.</span>
          )}

          {}
          <div className="mt-4 border-t border-black/5 pt-6 flex flex-col gap-4">
            <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400">Project Scope & Pricing</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/5 text-zinc-400 font-black uppercase tracking-wider">
                    <th className="pb-3 pr-4">Description</th>
                    <th className="pb-3 px-4 text-center">Qty</th>
                    <th className="pb-3 px-4 text-right">Rate</th>
                    <th className="pb-3 pl-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-semibold text-zinc-750">
                  {items.map((item: any, idx: number) => {
                    const itemSub = item.quantity * item.rate;
                    return (
                      <tr key={idx}>
                        <td className="py-3.5 pr-4 text-black">{item.description}</td>
                        <td className="py-3.5 px-4 text-center">{item.quantity}</td>
                        <td className="py-3.5 px-4 text-right">${Number(item.rate).toLocaleString()}</td>
                        <td className="py-3.5 pl-4 text-right text-black font-black">${itemSub.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {}
        <div className="p-6 rounded-2xl border border-black/5 bg-[#f5f2ee] flex flex-col gap-6 shadow-sm justify-between">
          <div className="flex flex-col gap-4">
            <h3 className="font-black text-xs uppercase tracking-widest border-b border-black/5 pb-3">Financial Overview</h3>
            
            <div className="flex flex-col gap-3.5">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-zinc-500 text-xs font-black uppercase tracking-wider">Scope Total</span>
                <span className="text-sm font-black text-black">${Number(proposal.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {proposal.status === 'ACCEPTED' && (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50 flex flex-col gap-1 text-[11px] text-emerald-800 leading-relaxed text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Proposal Accepted
              </span>
              Accepted by client via digital signature. Associated project provisioned successfully.
            </div>
          )}

          {proposal.status !== 'ACCEPTED' && (
            <div className="p-4 rounded-xl border border-black/5 bg-white/40 flex flex-col gap-1 text-[11px] text-zinc-650 leading-relaxed">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Valid Period
              </span>
              Proposal is valid until {proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString() : '—'}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
