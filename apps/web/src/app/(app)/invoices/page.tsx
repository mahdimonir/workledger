'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Download, X, AlertTriangle, Calendar, FileText, Send } from 'lucide-react';
import { apiClient } from '@/shared/api/client';

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Invoice creation form states
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [discountValue, setDiscountValue] = useState('0');
  const [discountType, setDiscountType] = useState('fixed');
  
  // Dynamic line items: { description, quantity, rate, taxRate }
  const [lineItems, setLineItems] = useState<any[]>([
    { description: '', quantity: 1, rate: 0, taxRate: 0 }
  ]);
  const [formError, setFormError] = useState('');

  // Payment recording form states
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch invoices, clients, projects
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

  // Filter projects based on selected client for creation dropdown
  const clientProjects = projects.filter((p: any) => p.clientId === clientId);

  // Create Invoice Mutation
  const createMutation = useMutation({
    mutationFn: (newInvoice: any) => apiClient.post('/invoices', newInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsCreateOpen(false);
      resetCreateForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create invoice.');
    }
  });

  // Record Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: ({ id, payment }: { id: string, payment: any }) => 
      apiClient.post(`/invoices/${id}/payments`, payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsPaymentOpen(false);
      resetPaymentForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to record payment.');
    }
  });

  // Send Invoice (Generate PDF) Mutation
  const sendMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/invoices/${id}/send`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const resetCreateForm = () => {
    setClientId('');
    setProjectId('');
    setDueDate('');
    setNotes('');
    setDiscountValue('0');
    setDiscountType('fixed');
    setLineItems([{ description: '', quantity: 1, rate: 0, taxRate: 0 }]);
    setFormError('');
  };

  const resetPaymentForm = () => {
    setPaymentAmount('');
    setPaymentMethod('BANK_TRANSFER');
    setPaymentReference('');
    setPaymentNote('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setFormError('');
  };

  // Add line item row
  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, taxRate: 0 }]);
  };

  // Remove line item row
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

  // Calculate dynamic subtotal
  const calculatedSubtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const calculatedTax = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate * ((item.taxRate || 0) / 100)), 0);
  const discountNum = parseFloat(discountValue) || 0;
  const calculatedDiscount = discountType === 'percentage' 
    ? calculatedSubtotal * (discountNum / 100) 
    : discountNum;
  const calculatedTotal = Math.max(0, calculatedSubtotal + calculatedTax - calculatedDiscount);

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
      clientId,
      projectId: projectId || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      notes: notes || undefined,
      discountValue: discountNum,
      discountType,
      lineItems,
    });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setFormError('');
    paymentMutation.mutate({
      id: selectedInvoice.id,
      payment: {
        amount: parseFloat(paymentAmount) || 0,
        method: paymentMethod,
        reference: paymentReference || undefined,
        note: paymentNote || undefined,
        paidAt: new Date(paymentDate).toISOString()
      }
    });
  };

  const handleSendInvoice = (id: string) => {
    if (confirm('Are you sure you want to send this invoice? This will trigger PDF rendering and mark the invoice as SENT.')) {
      sendMutation.mutate(id);
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv: any) => {
    if (filterStatus === 'ALL') return true;
    return inv.status === filterStatus;
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
          <h1 className="text-3xl font-black uppercase tracking-tighter">Invoices Ledger</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">Generate PDF invoices, record customer payments, and track outstanding records</p>
        </div>
        <button 
          onClick={() => { resetCreateForm(); setIsCreateOpen(true); }}
          className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/10 gap-6 overflow-x-auto scrollbar-none">
        {[
          { name: 'All invoices', value: 'ALL' },
          { name: 'Drafts', value: 'DRAFT' },
          { name: 'Sent', value: 'SENT' },
          { name: 'Paid', value: 'PAID' },
          { name: 'Overdue', value: 'OVERDUE' },
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

      {/* Ledger list table */}
      {filteredInvoices.length === 0 ? (
        <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <FileText className="w-12 h-12 text-zinc-350 mb-4" />
          <h3 className="font-black text-lg uppercase tracking-tight text-black mb-2">No Invoices Found</h3>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider max-w-sm mb-6">Create an invoice from billing stages, link it to active client projects, and collect online balances.</p>
          <button 
            onClick={() => { resetCreateForm(); setIsCreateOpen(true); }}
            className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Create Your First Invoice
          </button>
        </div>
      ) : (
        <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md overflow-hidden shadow-sm text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/5 bg-black/5/10 text-zinc-500 font-black uppercase tracking-wider">
                  <th className="p-5">Invoice #</th>
                  <th className="p-5">Client / Project</th>
                  <th className="p-5">Amount</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Due Date</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-zinc-750 font-semibold">
                {filteredInvoices.map((inv: any) => {
                  const client = clients.find((c: any) => c.id === inv.clientId);
                  const project = projects.find((p: any) => p.id === inv.projectId);
                  return (
                    <tr key={inv.id} className="hover:bg-black/5 transition-colors">
                      <td className="p-5 font-black text-black">{inv.invoiceNumber}</td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-black">{client?.name || 'Unknown Client'}</span>
                          <span className="text-zinc-450 text-[10px] uppercase font-bold mt-1">{project?.name || 'Workspace Direct'}</span>
                        </div>
                      </td>
                      <td className="p-5 text-black font-black">${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="p-5">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                          inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-zinc-100 text-zinc-800'
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
                            title="Compile & Send PDF"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {inv.status !== 'PAID' && inv.status !== 'DRAFT' && (
                          <button 
                            onClick={() => { setSelectedInvoice(inv); resetPaymentForm(); setIsPaymentOpen(true); }}
                            className="px-3 h-9 rounded-xl border border-black/5 hover:bg-black/5 text-zinc-600 hover:text-black font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center cursor-pointer"
                          >
                            Record Payment
                          </button>
                        )}
                        {inv.pdfUrl && (
                          <a 
                            href={inv.pdfUrl} target="_blank" rel="noopener noreferrer"
                            className="p-2.5 rounded-lg border border-black/5 hover:bg-black/5 text-zinc-600 hover:text-black transition-colors inline-flex items-center"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
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

      {/* Create Invoice Modal */}
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
              <h3 className="text-xl font-black uppercase tracking-tight">Create Invoice</h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold mt-1">Issue a new sequentially incremented billing record</p>
            </div>

            {formError && (
              <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-6 text-left">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client *</label>
                  <select
                    value={clientId} onChange={(e) => { setClientId(e.target.value); setProjectId(''); }}
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
                    disabled={!clientId}
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider disabled:opacity-50"
                  >
                    <option value="">Select Project</option>
                    {clientProjects.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Due Date *</label>
                  <input 
                    type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Discount Value</label>
                    <input 
                      type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
                      className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Type</label>
                    <select
                      value={discountType} onChange={(e) => setDiscountType(e.target.value)}
                      className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
                    >
                      <option value="fixed">Fixed ($)</option>
                      <option value="percentage">Percent (%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-650">Line Items</h4>
                  <button 
                    type="button" onClick={addLineItem}
                    className="h-9 px-4 rounded-xl border border-black/10 hover:bg-black/5 text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 flex-wrap sm:flex-nowrap items-end">
                      <div className="flex-1 min-w-[150px] flex flex-col gap-1">
                        <input 
                          type="text" required placeholder="Description (e.g. Design mockups)"
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
                      <div className="w-24 flex flex-col gap-1">
                        <input 
                          type="number" required placeholder="Rate" min="0"
                          value={item.rate} onChange={(e) => updateLineItem(idx, 'rate', e.target.value)}
                          className="h-10 px-3 rounded-lg bg-white/80 border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                        />
                      </div>
                      <div className="w-20 flex flex-col gap-1">
                        <input 
                          type="number" placeholder="Tax %" min="0"
                          value={item.taxRate || ''} onChange={(e) => updateLineItem(idx, 'taxRate', e.target.value)}
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

              {/* Invoice Calculations Summary */}
              <div className="p-4 rounded-xl border border-black/5 bg-white/40 flex flex-col gap-2 font-bold text-xs text-zinc-550 text-right max-w-xs ml-auto w-full">
                <div>Subtotal: <span className="text-black">${calculatedSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                <div>Tax Total: <span className="text-black">${calculatedTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                {calculatedDiscount > 0 && <div>Discount: <span className="text-rose-600">-${calculatedDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>}
                <div className="border-t border-black/5 pt-2 text-sm text-black font-black">Grand Total: <span>${calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Payment Instructions / Notes</label>
                <textarea 
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please send payment to bank account: US-123456789. Net 30."
                  className="h-20 p-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <button 
                type="submit" disabled={createMutation.isPending}
                className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-2 flex items-center justify-center cursor-pointer shadow-lg"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#efeae3] rounded-3xl border border-black/5 p-8 flex flex-col gap-6 relative shadow-2xl">
            <button 
              onClick={() => { setIsPaymentOpen(false); setSelectedInvoice(null); }}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-left">
              <h3 className="text-xl font-black uppercase tracking-tight">Record Payment</h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold mt-1">Log manual invoice balance payment received</p>
            </div>

            <div className="p-4 rounded-xl border border-black/5 bg-white/40 flex flex-col gap-1 text-left text-xs font-bold text-zinc-550 mb-2">
              <div>Invoice #: <span className="text-black">{selectedInvoice.invoiceNumber}</span></div>
              <div>Invoice Amount: <span className="text-black">${Number(selectedInvoice.amount).toLocaleString()}</span></div>
              <div>Amount Already Paid: <span className="text-black">${Number(selectedInvoice.amountPaid).toLocaleString()}</span></div>
            </div>

            {formError && (
              <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Amount Received ($) *</label>
                <input 
                  type="number" step="0.01" required value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Payment Method *</label>
                <select
                  value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Transaction Reference</label>
                <input 
                  type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="TXN-987654321"
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date Received *</label>
                  <input 
                    type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Payment Notes</label>
                <input 
                  type="text" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Client cleared the first half of the ledger."
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <button 
                type="submit" disabled={paymentMutation.isPending}
                className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer shadow-lg"
              >
                {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
