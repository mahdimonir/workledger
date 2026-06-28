'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Share2, X, RefreshCw, AlertTriangle, Calendar, FileText, Send, History } from 'lucide-react';
import { apiClient } from '@/shared/api/client';

export default function ProposalsPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Proposal form states
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  
  // Line items: { description, quantity, rate }
  const [lineItems, setLineItems] = useState<any[]>([
    { description: '', quantity: 1, rate: 0 }
  ]);
  const [formError, setFormError] = useState('');

  // Fetch proposals
  const { data: proposalsRes, isLoading: loadingProposals } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => apiClient.get('/proposals').then(res => res.data),
  });

  // Fetch clients
  const { data: clientsRes, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.get('/clients').then(res => res.data),
  });

  // Fetch versions of selected proposal
  const { data: versionsRes, isLoading: loadingVersions } = useQuery({
    queryKey: ['proposal-versions', selectedProposal?.id],
    queryFn: () => apiClient.get(`/proposals/${selectedProposal.id}/versions`).then(res => res.data),
    enabled: !!selectedProposal && isVersionsOpen,
  });

  const proposals = proposalsRes?.data || [];
  const clients = clientsRes?.data || [];
  const versions = versionsRes?.data || [];
  const isLoading = loadingProposals || loadingClients;

  // Create Proposal Mutation
  const createMutation = useMutation({
    mutationFn: (newProposal: any) => apiClient.post('/proposals', newProposal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setIsCreateOpen(false);
      resetCreateForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create proposal.');
    }
  });

  // Update Status to SENT Mutation
  const sendMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/proposals/${id}`, { status: 'SENT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }
  });

  // Restore Version Mutation
  const restoreVersionMutation = useMutation({
    mutationFn: ({ id, version }: { id: string, version: number }) => 
      apiClient.post(`/proposals/${id}/versions/${version}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setIsVersionsOpen(false);
      setSelectedProposal(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to restore version.');
    }
  });

  const resetCreateForm = () => {
    setTitle('');
    setClientId('');
    setValidUntil('');
    setIntroduction('');
    setDiscountAmount('0');
    setLineItems([{ description: '', quantity: 1, rate: 0 }]);
    setFormError('');
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, key: string, value: any) => {
    const updated = lineItems.map((item, i) => {
      if (i === index) {
        return { 
          ...item, 
          [key]: key === 'description' ? value : parseFloat(value) || 0 
        };
      }
      return item;
    });
    setLineItems(updated);
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const discountNum = parseFloat(discountAmount) || 0;
  const total = Math.max(0, subtotal - discountNum);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setFormError('Please select a client.');
      return;
    }
    const hasEmptyDesc = lineItems.some(item => !item.description);
    if (hasEmptyDesc) {
      setFormError('All line items must have a description.');
      return;
    }

    setFormError('');
    createMutation.mutate({
      title,
      clientId,
      validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
      introduction: introduction || undefined,
      discountAmount: discountNum,
      lineItems,
    });
  };

  const handleSendProposal = (id: string) => {
    if (confirm('Are you sure you want to send this proposal? This marks the status as SENT and locks its initial draft structure.')) {
      sendMutation.mutate(id);
    }
  };

  const handleCopyLink = (viewToken: string, proposalId: string) => {
    if (!viewToken) return;
    const url = `${window.location.origin}/portal/proposals/${viewToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(proposalId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleRestoreVersion = (versionNumber: number) => {
    if (!selectedProposal) return;
    if (confirm(`Are you sure you want to restore Version ${versionNumber}? This will overwrite the current active draft.`)) {
      restoreVersionMutation.mutate({ id: selectedProposal.id, version: versionNumber });
    }
  };

  // Filter proposals
  const filteredProposals = proposals.filter((p: any) => {
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse text-black">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-black/5 rounded-lg"></div>
          <div className="h-11 w-32 bg-black/5 rounded-lg"></div>
        </div>
        <div className="h-11 w-full bg-black/5 rounded-lg"></div>
        <div className="h-64 bg-black/5 border border-black/5 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-black">
      {/* Header action */}
      <div className="flex justify-between items-center flex-wrap gap-4 text-left">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Proposals & Contracts</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">Draft client scopes, issue version histories, and track acceptance triggers</p>
        </div>
        <button 
          onClick={() => { resetCreateForm(); setIsCreateOpen(true); }}
          className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Proposal
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/10 gap-6 overflow-x-auto scrollbar-none">
        {[
          { name: 'All proposals', value: 'ALL' },
          { name: 'Drafts', value: 'DRAFT' },
          { name: 'Sent', value: 'SENT' },
          { name: 'Accepted', value: 'ACCEPTED' },
          { name: 'Rejected', value: 'REJECTED' },
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

      {/* Proposals table list */}
      {filteredProposals.length === 0 ? (
        <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <FileText className="w-12 h-12 text-zinc-350 mb-4" />
          <h3 className="font-black text-lg uppercase tracking-tight text-black mb-2">No Proposals Found</h3>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider max-w-sm mb-6">Create proposals outlining deliverables, pricing models, and terms. Convert accepted scopes to projects instantly.</p>
          <button 
            onClick={() => { resetCreateForm(); setIsCreateOpen(true); }}
            className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Create Your First Proposal
          </button>
        </div>
      ) : (
        <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md overflow-hidden shadow-sm text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/5 bg-black/5/10 text-zinc-500 font-black uppercase tracking-wider">
                  <th className="p-5">Proposal Title</th>
                  <th className="p-5">Client</th>
                  <th className="p-5">Amount</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Expiry</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-zinc-750 font-semibold">
                {filteredProposals.map((prop: any) => {
                  const client = clients.find((c: any) => c.id === prop.clientId);
                  return (
                    <tr key={prop.id} className="hover:bg-black/5 transition-colors">
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="font-black text-black text-sm">{prop.title}</span>
                          {prop.status === 'ACCEPTED' && (
                            <span className="text-[10px] text-emerald-600 font-bold uppercase mt-1">✓ Auto-converted to project</span>
                          )}
                        </div>
                      </td>
                      <td className="p-5 text-zinc-650">{client?.name || 'Unknown Client'}</td>
                      <td className="p-5 text-black font-black">${Number(prop.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="p-5">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                          prop.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                          prop.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                          prop.status === 'VIEWED' ? 'bg-purple-100 text-purple-800' :
                          prop.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-zinc-100 text-zinc-800'
                        }`}>
                          {prop.status}
                        </span>
                      </td>
                      <td className="p-5 text-zinc-650">{prop.validUntil ? new Date(prop.validUntil).toLocaleDateString() : '—'}</td>
                      <td className="p-5 text-right flex justify-end gap-2">
                        {prop.status === 'DRAFT' && (
                          <button 
                            onClick={() => handleSendProposal(prop.id)}
                            className="p-2.5 rounded-lg border border-black/5 hover:bg-black/5 text-zinc-600 hover:text-black transition-colors"
                            title="Mark as Sent"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {prop.status !== 'DRAFT' && (
                          <button 
                            onClick={() => handleCopyLink(prop.viewToken, prop.id)}
                            className={`px-3 h-9 rounded-xl border border-black/5 hover:bg-black/5 font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                              copiedId === prop.id ? 'bg-emerald-100 border-emerald-305 text-emerald-800' : 'text-zinc-600'
                            }`}
                          >
                            <Share2 className="w-3.5 h-3.5" /> {copiedId === prop.id ? 'Copied!' : 'Copy Portal Link'}
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedProposal(prop); setIsVersionsOpen(true); }}
                          className="p-2.5 rounded-lg border border-black/5 hover:bg-black/5 text-zinc-600 hover:text-black transition-colors"
                          title="View Version History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Proposal Modal */}
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
              <h3 className="text-xl font-black uppercase tracking-tight">Create Proposal</h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold mt-1">Draft a professional contract proposal for client signature</p>
            </div>

            {formError && (
              <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Proposal Title *</label>
                  <input 
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. UX Design & Development Scope"
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Valid Until (Expiry Date)</label>
                  <input 
                    type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Discount Amount ($)</label>
                  <input 
                    type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0"
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Introduction / Scope Summary</label>
                <textarea 
                  value={introduction} onChange={(e) => setIntroduction(e.target.value)}
                  placeholder="Summarize the project deliverables, key milestones, and estimated schedule here..."
                  className="h-24 p-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              {/* Line Items */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-650">Pricing & Deliverables</h4>
                  <button 
                    type="button" onClick={addLineItem}
                    className="h-9 px-4 rounded-xl border border-black/10 hover:bg-black/5 text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <div className="flex-1 flex flex-col gap-1">
                        <input 
                          type="text" required placeholder="Description (e.g. Logo Design, Wireframes)"
                          value={item.description} onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                          className="h-10 px-3 rounded-lg bg-white/80 border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                        />
                      </div>
                      <div className="w-20 flex flex-col gap-1">
                        <input 
                          type="number" required placeholder="Qty" min="1"
                          value={item.quantity} onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                          className="h-10 px-3 rounded-lg bg-white/80 border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                        />
                      </div>
                      <div className="w-28 flex flex-col gap-1">
                        <input 
                          type="number" required placeholder="Rate ($)" min="0"
                          value={item.rate} onChange={(e) => updateLineItem(idx, 'rate', e.target.value)}
                          className="h-10 px-3 rounded-lg bg-white/80 border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                        />
                      </div>
                      <button 
                        type="button" onClick={() => removeLineItem(idx)}
                        disabled={lineItems.length === 1}
                        className="h-10 w-10 rounded-lg border border-black/5 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-600 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-30"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposals Calculations Summary */}
              <div className="p-4 rounded-xl border border-black/5 bg-white/40 flex flex-col gap-2 font-bold text-xs text-zinc-550 text-right max-w-xs ml-auto w-full">
                <div>Subtotal: <span className="text-black">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                {discountNum > 0 && <div>Discount: <span className="text-rose-600">-${discountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>}
                <div className="border-t border-black/5 pt-2 text-sm text-black font-black">Grand Total: <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
              </div>

              <button 
                type="submit" disabled={createMutation.isPending}
                className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-2 flex items-center justify-center cursor-pointer shadow-lg"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Proposal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Version History Modal */}
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
              <h3 className="text-xl font-black uppercase tracking-tight">Proposal Versions</h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold mt-1">View negotiated scopes and restore snapshots for: {selectedProposal.title}</p>
            </div>

            {loadingVersions ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : versions.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-zinc-400 uppercase">
                No versions logged yet. Updates to details automatically create historical snapshots.
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-left">
                {versions.map((ver: any) => (
                  <div key={ver.id} className="p-4 rounded-xl border border-black/5 bg-white/40 flex justify-between items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-black">Version {ver.versionNumber}</span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">{new Date(ver.createdAt).toLocaleString()}</span>
                      <span className="text-[11px] text-zinc-600 font-semibold mt-1">Amount: ${Number(ver.amount).toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => handleRestoreVersion(ver.versionNumber)}
                      className="px-3 h-8 rounded-lg bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      Restore
                    </button>
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
