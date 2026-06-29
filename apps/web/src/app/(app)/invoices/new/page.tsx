'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { ArrowLeft, Trash, Plus } from 'lucide-react';
import Link from 'next/link';

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export default function NewInvoicePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [discountValue, setDiscountValue] = useState('0');
  const [discountType, setDiscountType] = useState('fixed');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<Array<{ description: string; quantity: number; rate: number; taxRate: number }>>([
    { description: '', quantity: 1, rate: 0, taxRate: 0 }
  ]);
  const [error, setError] = useState('');

  
  const idempotencyKey = useRef(generateId());

  
  const { data: clientsRes } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.get('/clients').then(res => res.data),
  });

  const { data: projectsRes } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(res => res.data),
  });

  const clients = clientsRes?.data || [];
  const projects = projectsRes?.data || [];

  
  const createMutation = useMutation({
    mutationFn: (newInvoice: any) => apiClient.post('/invoices', newInvoice, {
      headers: { 'Idempotency-Key': idempotencyKey.current }
    }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      router.push(`/invoices/${res.data.data.id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create invoice.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Please select a client.');
      return;
    }
    const cleanLineItems = lineItems.filter(item => item.description.trim() !== '');
    if (cleanLineItems.length === 0) {
      setError('Please add at least one line item with a description.');
      return;
    }

    setError('');
    createMutation.mutate({
      clientId,
      projectId: projectId || undefined,
      lineItems: cleanLineItems.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        taxRate: Number(item.taxRate) || 0
      })),
      discountValue: Number(discountValue) || 0,
      discountType,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-8 text-black text-left max-w-3xl">
      {}
      <div className="flex flex-col gap-4">
        <Link 
          href="/invoices"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-black transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Ledger
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Issue New Invoice</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
            Compile, calculate, and record a new workspace invoice.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md shadow-sm flex flex-col gap-4">
          <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500 border-b border-black/5 pb-3">Ledger Metadata</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client *</label>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
              >
                <option value="">Select a Client</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.company || 'No Company'})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
              >
                <option value="">Select a Project (Optional)</option>
                {projects.filter((p: any) => !clientId || p.clientId === clientId).map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Due Date *</label>
              <input 
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
                >
                  <option value="fixed">Fixed ($)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Discount Value</label>
                <input 
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-black/5 pb-3">
            <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500">Line Items</h3>
            <button
              type="button"
              onClick={() => setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, taxRate: 0 }])}
              className="text-[10px] font-black text-zinc-650 hover:text-black uppercase tracking-wider bg-black/5 px-2.5 py-1 rounded-lg border border-black/5 transition-all"
            >
              + Add Item
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {lineItems.map((item, index) => (
              <div key={index} className="p-4 rounded-xl bg-white/40 border border-black/5 flex flex-col gap-3 relative text-left">
                <button
                  type="button"
                  onClick={() => setLineItems(lineItems.filter((_, i) => i !== index))}
                  className="absolute top-3 right-3 text-zinc-400 hover:text-rose-600 transition-colors p-1"
                  disabled={lineItems.length === 1}
                >
                  <Trash className="w-4 h-4" />
                </button>

                <div className="flex flex-col gap-1.5 pr-8">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Item Description *</label>
                  <input 
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...lineItems];
                      newItems[index].description = e.target.value;
                      setLineItems(newItems);
                    }}
                    placeholder="e.g. Graphic Design Consultancy"
                    className="h-9 px-3 rounded-lg bg-white border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Qty</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...lineItems];
                        newItems[index].quantity = Number(e.target.value);
                        setLineItems(newItems);
                      }}
                      className="h-9 px-3 rounded-lg bg-white border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Rate ($)</label>
                    <input 
                      type="number"
                      required
                      min="0"
                      value={item.rate}
                      onChange={(e) => {
                        const newItems = [...lineItems];
                        newItems[index].rate = Number(e.target.value);
                        setLineItems(newItems);
                      }}
                      className="h-9 px-3 rounded-lg bg-white border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Tax (%)</label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={item.taxRate}
                      onChange={(e) => {
                        const newItems = [...lineItems];
                        newItems[index].taxRate = Number(e.target.value);
                        setLineItems(newItems);
                      }}
                      className="h-9 px-3 rounded-lg bg-white border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add payment terms, banking information, or notes..."
              rows={3}
              className="p-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black resize-none"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={createMutation.isPending}
          className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-lg"
        >
          {createMutation.isPending ? 'Generating...' : 'Issue Invoice'}
        </button>
      </form>
    </div>
  );
}
