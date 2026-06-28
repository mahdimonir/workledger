'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Share2, X, FileText, Send, History } from 'lucide-react';
import { apiClient } from '@/shared/api/client';

export default function ProposalsPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  
  const [lineItems, setLineItems] = useState<any[]>([
    { description: '', quantity: 1, rate: 0 }
  ]);
  const [formError, setFormError] = useState('');

  const { data: proposalsRes, isLoading: loadingProposals } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => apiClient.get('/proposals').then(res => res.data),
  });

  const { data: clientsRes, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.get('/clients').then(res => res.data),
  });

  const { data: versionsRes, isLoading: loadingVersions } = useQuery({
    queryKey: ['proposal-versions', selectedProposal?.id],
    queryFn: () => apiClient.get(`/proposals/${selectedProposal.id}/versions`).then(res => res.data),
    enabled: !!selectedProposal?.id,
  });

  const proposals = proposalsRes?.data || [];
  const clients = clientsRes?.data || [];
  const versions = versionsRes?.data || [];
  const isLoading = loadingProposals || loadingClients;

  const createMutation = useMutation({
    mutationFn: (newProposal: any) => apiClient.post('/proposals', newProposal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create proposal.');
    }
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/proposals/${id}`, { status: 'SENT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }
  });

  const restoreVersionMutation = useMutation({
    mutationFn: ({ id, version }: { id: string, version: number }) => 
      apiClient.post(`/proposals/${id}/versions/${version}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setIsVersionsOpen(false);
      setSelectedProposal(null);
    }
  });

  const resetForm = () => {
    setTitle('');
    setClientId('');
    setValidUntil('');
    setIntroduction('');
    setDiscountAmount('0');
    setLineItems([{ description: '', quantity: 1, rate: 0 }]);
    setFormError('');
  };

  const handleAddItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...lineItems];
    updated[index][field] = val;
    setLineItems(updated);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const discountNum = parseFloat(discountAmount) || 0;
  const total = Math.max(0, subtotal - discountNum);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setFormError('Please select a client.');
      return;
    }
    const emptyDesc = lineItems.some(item => !item.description.trim());
    if (emptyDesc) {
      setFormError('All line items must have a description.');
      return;
    }

    setFormError('');
    createMutation.mutate({
      title,
      clientId,
      validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
      introduction: introduction || undefined,
      discountValue: discountNum,
      lineItems: lineItems.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
      }))
    });
  };

  const filteredProposals = proposals.filter((p: any) => {
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  const handleCopyLink = (shareToken: string, proposalId: string) => {
    if (!shareToken) return;
    const url = `${window.location.origin}/portal/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(proposalId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleOpenVersions = (proposal: any) => {
    setSelectedProposal(proposal);
    setIsVersionsOpen(true);
  };

  const handleRestoreVersion = (versionNumber: number) => {
    if (!selectedProposal) return;
    if (confirm(`Are you sure you want to restore snapshot version v${versionNumber}? This will overwrite the current draft.`)) {
      restoreVersionMutation.mutate({ id: selectedProposal.id, version: versionNumber });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse text-black">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-black/5 rounded-lg"></div>
          <div className="h-11 w-32 bg-black/5 rounded-lg"></div>
        </div>
        <div className="h-11 w-full bg-black/5 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-black/5 border border-black/5 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-black">
      <div className="flex justify-between items-center flex-wrap gap-4 text-left">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Proposals & Contracts</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">Create client pitches, scope contracts, and manage snapshots</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsCreateOpen(true); }}
          className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Proposal
        </button>
      </div>

      <div className="flex border-b border-black/10 gap-6 overflow-x-auto scrollbar-none">
        {[
          { name: 'All proposals', value: 'ALL' },
          { name: 'Drafts', value: 'DRAFT' },
          { name: 'Sent to Client', value: 'SENT' },
          { name: 'Accepted', value: 'ACCEPTED' },
          { name: 'Declined', value: 'DECLINED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`pb-4 text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer ${
              filterStatus === tab.value ? 'text-black' : 'text-zinc-400 hover:text-black'
            }`}
          >
            {tab.name}
            {filterStatus === tab.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></span>
            )}
          </button>
        ))}
      </div>

      {filteredProposals.length === 0 ? (
        <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <FileText className="w-12 h-12 text-zinc-350 mb-4" />
          <h3 className="font-black text-lg uppercase tracking-tight text-black mb-2">No Proposals Found</h3>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider max-w-sm mb-6">Pitch new contracts to your clients. Track active versions and restore snapshots instantly.</p>
          <button 
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
            className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Create Your First Proposal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredProposals.map((proposal: any) => {
            const client = clients.find((c: any) => c.id === proposal.clientId);
            return (
              <div key={proposal.id} className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col justify-between gap-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                      proposal.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                      proposal.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                      proposal.status === 'DECLINED' ? 'bg-rose-100 text-rose-800' : 'bg-zinc-150 text-zinc-850'
                    }`}>
                      {proposal.status}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-tight text-zinc-400">v{proposal.version}</span>
                  </div>

                  <div>
                    <h3 className="font-black text-lg text-black tracking-tight">{proposal.title}</h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1">Client: {client?.name || 'Unknown'} ({client?.company || 'No Company'})</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider text-zinc-500">
                    <span>Total scope: <span className="text-black">${Number(proposal.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></span>
                    {proposal.validUntil && (
                      <span>Valid until: <span className="text-black">{new Date(proposal.validUntil).toLocaleDateString()}</span></span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {proposal.status === 'DRAFT' ? (
                      <button 
                        onClick={() => sendMutation.mutate(proposal.id)}
                        className="flex-1 h-10 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" /> Send Pitch
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleCopyLink(proposal.shareToken, proposal.id)}
                        className={`flex-1 h-10 rounded-xl border border-black/10 hover:bg-black/5 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          copiedId === proposal.id ? 'bg-emerald-100 border-emerald-300 text-emerald-850' : 'text-zinc-700'
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5" /> {copiedId === proposal.id ? 'Copied!' : 'Copy Portal Link'}
                      </button>
                    )}

                    <button 
                      onClick={() => handleOpenVersions(proposal)}
                      className="p-3 rounded-xl border border-black/10 hover:bg-black/5 text-zinc-500 hover:text-black transition-colors"
                      title="Snapshot Version History"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#efeae3] rounded-3xl border border-black/5 p-8 flex flex-col gap-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-left">
              <h3 className="text-xl font-black uppercase tracking-tight">Scope Proposal Pitch</h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold mt-1">Pitch new deliverables and scoping criteria to a client</p>
            </div>

            {formError && (
              <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-6 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Proposal Title *</label>
                <input 
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Website Rebrand & Strategy Scope"
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client *</label>
                  <select
                    value={clientId} onChange={(e) => setClientId(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
                  >
                    <option value="">Select Client</option>
                    {clients.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.company || 'No Company'})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Valid Until Date</label>
                  <input 
                    type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Introduction Pitch / Overview</label>
                <textarea 
                  value={introduction} onChange={(e) => setIntroduction(e.target.value)}
                  placeholder="Outline the client goals, design scope, or general overview..."
                  rows={3}
                  className="p-3 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-650">Pricing & Deliverables</h4>
                  <button 
                    type="button" onClick={handleAddItem}
                    className="h-8 px-3 rounded-lg border border-black/15 hover:bg-black/5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-7 flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Description</label>
                        <input 
                          type="text" required value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Acme UI Rebranding deliverable..."
                          className="h-10 px-3 rounded-lg bg-white border border-black/10 text-xs text-black"
                        />
                      </div>
                      
                      <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Qty</label>
                        <input 
                          type="number" required value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="h-10 px-3 rounded-lg bg-white border border-black/10 text-xs text-black"
                        />
                      </div>

                      <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Rate ($)</label>
                        <input 
                          type="number" required value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          className="h-10 px-3 rounded-lg bg-white border border-black/10 text-xs text-black"
                        />
                      </div>

                      <div className="sm:col-span-1 pb-1">
                        <button 
                          type="button" onClick={() => handleRemoveItem(index)}
                          className="p-2.5 rounded-lg border border-black/10 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Discount Amount ($)</label>
                  <input 
                    type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                  />
                </div>

                <div className="p-4 rounded-xl border border-black/5 bg-white/40 flex flex-col gap-2 font-bold text-xs text-zinc-550 text-right max-w-xs ml-auto w-full">
                  <div>Subtotal: <span className="text-black">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                  {discountNum > 0 && <div>Discount: <span className="text-rose-600">-${discountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>}
                  <div className="text-sm font-black border-t border-black/5 pt-2 text-black font-sans">Total: ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              <button 
                type="submit" disabled={createMutation.isPending}
                className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer shadow-lg"
              >
                {createMutation.isPending ? 'Drafting...' : 'Save Proposal Draft'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isVersionsOpen && selectedProposal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#efeae3] rounded-3xl border border-black/5 p-8 flex flex-col gap-6 relative shadow-2xl max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => { setIsVersionsOpen(false); setSelectedProposal(null); }}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-left">
              <h3 className="text-xl font-black uppercase tracking-tight">Proposal Snapshots</h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold mt-1">Select a past snapshot to restore as the active draft</p>
            </div>

            {loadingVersions ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : versions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-400 text-xs font-bold uppercase">
                <History className="w-8 h-8 mb-2" /> No snapshot versions found
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-black/5 text-left">
                {versions.map((ver: any) => (
                  <div key={ver.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-black">Version v{ver.versionNumber}</span>
                      <span className="text-zinc-500 text-[10px] font-bold uppercase mt-1">Snapshot Date: {new Date(ver.createdAt).toLocaleString()}</span>
                      <span className="text-zinc-400 text-[10px] font-semibold mt-0.5">Amount: ${Number(ver.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {ver.versionNumber !== selectedProposal.version && (
                      <button 
                        onClick={() => handleRestoreVersion(ver.versionNumber)}
                        className="h-9 px-4 rounded-xl border border-black/10 hover:bg-black hover:text-[#efeae3] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
