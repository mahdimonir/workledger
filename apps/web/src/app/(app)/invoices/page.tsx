'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, X, Send, CreditCard, Download, Trash2, Calendar, FileText } from 'lucide-react';
import { apiClient } from '@/shared/api/client';

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [discountValue, setDiscountValue] = useState('0');
  const [discountType, setDiscountType] = useState('FIXED');
  
  const [lineItems, setLineItems] = useState<any[]>([
    { description: '', quantity: 1, rate: 0, taxRate: 0 }
  ]);
  const [formError, setFormError] = useState('');

  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [payReference, setPayReference] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: invoicesRes, isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => apiClient.get('/invoices').then(res => res.data),
  });

  const { data: clientsRes, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.get('/clients').then(res => res.data),
  });

  const { data: projectsRes, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(res => res.data),
  });

  const invoices = invoicesRes?.data || [];
  const clients = clientsRes?.data || [];
  const projects = projectsRes?.data || [];
  const isLoading = loadingInvoices || loadingClients || loadingProjects;

  const createMutation = useMutation({
    mutationFn: (newInvoice: any) => apiClient.post('/invoices', newInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to generate invoice.');
    }
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/invoices/${id}/send`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const payMutation = useMutation({
    mutationFn: ({ id, payment }: { id: string, payment: any }) => 
      apiClient.post(`/invoices/${id}/payments`, payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsPayOpen(false);
      setSelectedInvoice(null);
      resetPaymentForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to log payment.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const resetForm = () => {
    setClientId('');
    setProjectId('');
    setDueDate('');
    setNotes('');
    setDiscountValue('0');
    setDiscountType('FIXED');
    setLineItems([{ description: '', quantity: 1, rate: 0, taxRate: 0 }]);
    setFormError('');
  };

  const resetPaymentForm = () => {
    setPayAmount('');
    setPayMethod('BANK_TRANSFER');
    setPayReference('');
    setPayNote('');
    setPayDate(new Date().toISOString().split('T')[0]);
    setFormError('');
  };

  const handleAddItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, taxRate: 0 }]);
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
  const taxTotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate * (item.taxRate / 100)), 0);
  const discountValNum = parseFloat(discountValue) || 0;
  const discountTotal = discountType === 'PERCENTAGE' 
    ? (subtotal * (discountValNum / 100)) 
    : discountValNum;
  const total = Math.max(0, subtotal + taxTotal - discountTotal);

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
      clientId,
      projectId: projectId || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      notes: notes || undefined,
      discountValue: discountValNum,
      discountType,
      lineItems: lineItems.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
        taxRate: parseFloat(item.taxRate) || 0,
      }))
    });
  };

  const handleSendInvoice = (id: string) => {
    sendMutation.mutate(id);
  };

  const handleOpenPay = (invoice: any) => {
    setSelectedInvoice(invoice);
    const balance = Number(invoice.amount || 0) - Number(invoice.amountPaid || 0);
    setPayAmount(balance.toString());
    setIsPayOpen(true);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setFormError('');
    payMutation.mutate({
      id: selectedInvoice.id,
      payment: {
        amount: parseFloat(payAmount) || 0,
        method: payMethod,
        reference: payReference || undefined,
        note: payNote || undefined,
        paidAt: new Date(payDate).toISOString(),
      }
    });
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice draft? Locked invoices cannot be deleted.')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredInvoices = invoices.filter((inv: any) => {
    if (filterStatus === 'ALL') return true;
    return inv.status === filterStatus;
  });

  const overdueCount = invoices.filter((inv: any) => inv.status === 'OVERDUE').length;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse text-black">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-black/5 rounded-lg"></div>
          <div className="h-11 w-32 bg-black/5 rounded-lg"></div>
        </div>
        <div className="h-24 bg-black/5 rounded-2xl"></div>
        <div className="h-64 bg-black/5 border border-black/5 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-black">
      <div className="flex justify-between items-center flex-wrap gap-4 text-left">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Invoices Ledger</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">Track collections, compile PDFs, and log payments</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsCreateOpen(true); }}
          className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Issue Invoice
        </button>
      </div>

      {overdueCount > 0 && (
        <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-800 text-xs font-black uppercase tracking-wider flex items-center gap-2 justify-center sm:justify-start">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
          Attention: {overdueCount} Overdue invoice{overdueCount > 1 ? 's' : ''} awaiting collection.
        </div>
      )}

      <div className="flex border-b border-black/10 gap-6 overflow-x-auto scrollbar-none">
        {[
          { name: 'All invoices', value: 'ALL' },
          { name: 'Drafts', value: 'DRAFT' },
          { name: 'Sent / Unpaid', value: 'SENT' },
          { name: 'Overdue', value: 'OVERDUE' },
          { name: 'Paid in Full', value: 'PAID' },
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

      {filteredInvoices.length === 0 ? (
        <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <FileText className="w-12 h-12 text-zinc-350 mb-4" />
          <h3 className="font-black text-lg uppercase tracking-tight text-black mb-2">No Invoices Found</h3>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider max-w-sm mb-6">Create a invoice ledger entry. You can generate PDFs and log multi-stage client payments.</p>
          <button 
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
            className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Issue Your First Invoice
          </button>
        </div>
      ) : (
        <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md overflow-hidden shadow-sm text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/5 text-zinc-500 font-black uppercase tracking-wider">
                  <th className="p-5">Invoice #</th>
                  <th className="p-5">Client</th>
                  <th className="p-5">Amount Due</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Due Date</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-zinc-700 font-semibold">
                {filteredInvoices.map((inv: any) => {
                  const client = clients.find((c: any) => c.id === inv.clientId);
                  const balance = Number(inv.amount || 0) - Number(inv.amountPaid || 0);
                  return (
                    <tr key={inv.id} className="hover:bg-black/5 transition-colors">
                      <td className="p-5 font-black text-black">{inv.invoiceNumber}</td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-black text-sm">{client?.name || 'Unknown'}</span>
                          <span className="text-zinc-450 text-[10px] font-bold uppercase mt-1">{client?.company || 'No Company'}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="font-black text-black">${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          {balance > 0 && inv.status !== 'DRAFT' && (
                            <span className="text-rose-600 text-[10px] font-bold mt-1">Pending: ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded font-black uppercase ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 
                          inv.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 
                          inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-zinc-150 text-zinc-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-5 text-zinc-650">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                      <td className="p-5 text-right flex justify-end gap-2">
                        {inv.status === 'DRAFT' && (
                          <button 
                            onClick={() => handleSendInvoice(inv.id)}
                            className="p-2.5 rounded-lg border border-black/5 hover:bg-black/5 text-zinc-600 hover:text-black transition-colors"
                            title="Generate PDF & Lock Invoice"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {inv.status !== 'DRAFT' && inv.pdfUrl && (
                          <a 
                            href={inv.pdfUrl} target="_blank" rel="noreferrer"
                            className="p-2.5 rounded-lg border border-black/5 hover:bg-black/5 text-zinc-600 hover:text-black transition-colors flex items-center justify-center"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        {inv.status !== 'DRAFT' && inv.status !== 'PAID' && (
                          <button 
                            onClick={() => handleOpenPay(inv)}
                            className="p-2.5 rounded-lg border border-black/5 hover:bg-black/5 text-zinc-600 hover:text-black transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        {inv.status === 'DRAFT' && (
                          <button 
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-2.5 rounded-lg border border-black/5 hover:bg-rose-500/10 text-zinc-550 hover:text-rose-600 transition-colors"
                            title="Delete Draft"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
              <h3 className="text-xl font-black uppercase tracking-tight">Issue Invoice Entry</h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold mt-1">Draft a new sequential invoice ledger record</p>
            </div>

            {formError && (
              <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-6 text-left">
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
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Linked Project (Optional)</label>
                  <select
                    value={projectId} onChange={(e) => setProjectId(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
                  >
                    <option value="">None / Independent</option>
                    {projects.filter((p: any) => p.clientId === clientId).map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Due Date</label>
                  <input 
                    type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Discount Type</label>
                  <select
                    value={discountType} onChange={(e) => setDiscountType(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
                  >
                    <option value="FIXED">Fixed Amount ($)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Discount Value</label>
                  <input 
                    type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-black/10 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Line Items</h4>
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
                      <div className="sm:col-span-6 flex flex-col gap-1.5">
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

                      <div className="sm:col-span-1.5 flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Tax %</label>
                        <input 
                          type="number" value={item.taxRate}
                          onChange={(e) => handleItemChange(index, 'taxRate', e.target.value)}
                          className="h-10 px-3 rounded-lg bg-white border border-black/10 text-xs text-black"
                        />
                      </div>

                      <div className="sm:col-span-0.5 pb-1">
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

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Notes (Printed on PDF)</label>
                <textarea 
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment details, IBAN, bank swift, or Terms..."
                  rows={2}
                  className="p-3 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="p-4 rounded-xl border border-black/5 bg-white/40 flex flex-col gap-2 font-bold text-xs text-zinc-500 text-right max-w-xs ml-auto w-full">
                <div>Subtotal: <span className="text-black">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                {taxTotal > 0 && <div>Tax Amount: <span className="text-black">${taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>}
                {discountTotal > 0 && <div>Discount: <span className="text-rose-650">-${discountTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>}
                <div className="text-sm font-black border-t border-black/5 pt-2 text-black">Total Amount: ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>

              <button 
                type="submit" disabled={createMutation.isPending}
                className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer shadow-lg"
              >
                {createMutation.isPending ? 'Drafting...' : 'Save Invoice Draft'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isPayOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#efeae3] rounded-3xl border border-black/5 p-8 flex flex-col gap-6 relative shadow-2xl">
            <button 
              onClick={() => { setIsPayOpen(false); setSelectedInvoice(null); }}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-left">
              <h3 className="text-xl font-black uppercase tracking-tight">Record Invoice Payment</h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold mt-1">Log collection status on invoice #{selectedInvoice.invoiceNumber}</p>
            </div>

            {formError && (
              <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handlePaySubmit} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Payment Amount ($) *</label>
                <input 
                  type="number" required value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Payment Method *</label>
                <select
                  value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="CASH">Cash</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reference / Transaction ID</label>
                <input 
                  type="text" value={payReference} onChange={(e) => setPayReference(e.target.value)}
                  placeholder="e.g. TXN-10294"
                  className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Payment Date *</label>
                <input 
                  type="date" required value={payDate} onChange={(e) => setPayDate(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Internal Notes</label>
                <textarea 
                  value={payNote} onChange={(e) => setPayNote(e.target.value)}
                  placeholder="e.g. Stripe checkout completed"
                  rows={2}
                  className="p-3 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <button 
                type="submit" disabled={payMutation.isPending}
                className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer shadow-lg"
              >
                {payMutation.isPending ? 'Logging...' : 'Log Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
