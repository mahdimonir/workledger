'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  ArrowLeft, 
  Download, 
  Send, 
  CreditCard, 
  Calendar, 
  FileText,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import SlideOver from '@/shared/components/SlideOver';

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const invoiceId = params.id as string;

  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [payReference, setPayReference] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  // Queries
  const { data: invoiceRes, isLoading: loadingInvoice } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => apiClient.get(`/invoices/${invoiceId}`).then((res) => res.data),
  });

  const { data: clientsRes, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.get('/clients').then((res) => res.data),
  });

  const invoice = invoiceRes?.data;
  const clients = clientsRes?.data || [];
  const client = invoice ? clients.find((c: any) => c.id === invoice.clientId) : null;

  const isLoading = loadingInvoice || loadingClients;

  // Mutations
  const sendMutation = useMutation({
    mutationFn: () => apiClient.post(`/invoices/${invoiceId}/send`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const payMutation = useMutation({
    mutationFn: (payment: any) => apiClient.post(`/invoices/${invoiceId}/payments`, payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsPayOpen(false);
      resetPaymentForm();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to log payment.');
    }
  });

  const resetPaymentForm = () => {
    setPayAmount('');
    setPayMethod('BANK_TRANSFER');
    setPayReference('');
    setPayNote('');
    setPayDate(new Date().toISOString().split('T')[0]);
    setError('');
  };

  const handleSendInvoice = () => {
    sendMutation.mutate();
  };

  const handleOpenPay = () => {
    if (!invoice) return;
    const balance = Number(invoice.amount || 0) - Number(invoice.amountPaid || 0);
    setPayAmount(balance.toString());
    setIsPayOpen(true);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    payMutation.mutate({
      amount: parseFloat(payAmount) || 0,
      method: payMethod,
      reference: payReference || undefined,
      note: payNote || undefined,
      paidAt: new Date(payDate).toISOString(),
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

  if (!invoice) {
    return (
      <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
        <h3 className="font-black text-lg uppercase tracking-tight text-black mb-2">Invoice Not Found</h3>
        <button 
          onClick={() => router.push('/invoices')}
          className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Ledger
        </button>
      </div>
    );
  }

  const balance = Number(invoice.amount || 0) - Number(invoice.amountPaid || 0);
  const items = invoice.lineItems || [];

  return (
    <div className="flex flex-col gap-8 text-black text-left">
      {/* Back and Title Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/invoices"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-black transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Ledger
        </Link>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">{invoice.invoiceNumber}</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1.5">
              Client: {client?.name || 'Unknown'} ({client?.company || 'No Company'})
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase ${
              invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
              invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
              invoice.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-zinc-150 text-zinc-800'
            }`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Action panel */}
      <div className="flex flex-wrap gap-3">
        {invoice.status === 'DRAFT' && (
          <button
            onClick={handleSendInvoice}
            disabled={sendMutation.isPending}
            className="h-11 px-5 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {sendMutation.isPending ? 'Sending...' : 'Send Invoice & Lock'}
          </button>
        )}

        {invoice.pdfUrl && (
          <a
            href={invoice.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="h-11 px-5 rounded-xl border border-black/10 hover:bg-black/5 text-zinc-700 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download PDF
          </a>
        )}

        {invoice.status !== 'DRAFT' && invoice.status !== 'PAID' && (
          <button
            onClick={handleOpenPay}
            className="h-11 px-5 rounded-xl border border-black/10 hover:bg-black/5 text-zinc-700 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" /> Record Payment
          </button>
        )}
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Line Items Card */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col gap-6 shadow-sm">
          <h3 className="font-black text-xs uppercase tracking-widest border-b border-black/5 pb-3">Invoice Details</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/5 text-zinc-400 font-black uppercase tracking-wider">
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 px-4 text-center">Qty</th>
                  <th className="pb-3 px-4 text-right">Rate</th>
                  <th className="pb-3 px-4 text-right">Tax (%)</th>
                  <th className="pb-3 pl-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-semibold text-zinc-750">
                {items.map((item: any, idx: number) => {
                  const itemSub = item.quantity * item.rate;
                  const itemTax = itemSub * ((item.taxRate || 0) / 100);
                  const itemTotal = itemSub + itemTax;
                  return (
                    <tr key={idx}>
                      <td className="py-3.5 pr-4 text-black">{item.description}</td>
                      <td className="py-3.5 px-4 text-center">{item.quantity}</td>
                      <td className="py-3.5 px-4 text-right">${Number(item.rate).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right">{item.taxRate || 0}%</td>
                      <td className="py-3.5 pl-4 text-right text-black font-black">${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary Panel */}
        <div className="p-6 rounded-2xl border border-black/5 bg-[#f5f2ee] flex flex-col gap-6 shadow-sm justify-between">
          <div className="flex flex-col gap-4">
            <h3 className="font-black text-xs uppercase tracking-widest border-b border-black/5 pb-3">Financial aggregates</h3>
            
            <div className="flex flex-col gap-3.5">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-zinc-500 text-xs font-black uppercase tracking-wider">Subtotal</span>
                <span className="text-xs font-bold">${Number(invoice.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-black/5 pt-3">
                <span className="text-zinc-500 text-xs font-black uppercase tracking-wider">Tax total</span>
                <span className="text-xs font-bold">${Number(invoice.taxTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {Number(invoice.discount || 0) > 0 && (
                <div className="flex justify-between items-center py-0.5 border-t border-black/5 pt-3">
                  <span className="text-zinc-500 text-xs font-black uppercase tracking-wider">Discount</span>
                  <span className="text-xs font-bold text-rose-600">-${Number(invoice.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-0.5 border-t border-black/5 pt-3">
                <span className="text-zinc-500 text-xs font-black uppercase tracking-wider">Grand Total</span>
                <span className="text-sm font-black text-black">${Number(invoice.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-black/5 pt-3">
                <span className="text-zinc-500 text-xs font-black uppercase tracking-wider">Balance Due</span>
                <span className={`text-sm font-black ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-black/5 bg-white/40 flex flex-col gap-1 text-[11px] text-zinc-600 leading-relaxed">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Billing Period
            </span>
            Due date set for {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}.
          </div>
        </div>
      </div>

      {/* Payment History Timeline */}
      <div className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md shadow-sm flex flex-col gap-4 max-w-3xl">
        <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500">Payments Recorded</h3>
        
        {invoice.payments?.length === 0 ? (
          <span className="text-xs font-bold text-zinc-400 uppercase py-2">No payments logged yet for this invoice.</span>
        ) : (
          <div className="flex flex-col divide-y divide-black/5">
            {invoice.payments?.map((pay: any) => (
              <div key={pay.id} className="py-3.5 flex justify-between items-center text-xs">
                <div className="flex flex-col text-left">
                  <span className="font-black text-black">${Number(pay.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">
                    Via {pay.method.replace('_', ' ')} {pay.reference ? `• Ref: ${pay.reference}` : ''}
                  </span>
                </div>
                <span className="font-bold text-zinc-500">{new Date(pay.paidAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Payment Drawer */}
      <SlideOver isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} title="Record Payment">
        {error && (
          <div className="mb-4 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
            {error}
          </div>
        )}
        <form onSubmit={handlePaySubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Amount ($) *</label>
            <input 
              type="number" required step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Method *</label>
            <select
              value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="STRIPE">Stripe</option>
              <option value="CASH">Cash</option>
              <option value="CRYPTO">Crypto</option>
              <option value="PAYPAL">PayPal</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reference / Check #</label>
            <input 
              type="text" value={payReference} onChange={(e) => setPayReference(e.target.value)}
              placeholder="e.g. TXN-9842"
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Payment Date *</label>
            <input 
              type="date" required value={payDate} onChange={(e) => setPayDate(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Internal Notes</label>
            <textarea 
              value={payNote} onChange={(e) => setPayNote(e.target.value)}
              placeholder="Notes visible only to team"
              rows={2}
              className="p-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black resize-none"
            />
          </div>
          <button 
            type="submit" disabled={payMutation.isPending}
            className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer shadow-lg"
          >
            {payMutation.isPending ? 'Logging...' : 'Log Payment'}
          </button>
        </form>
      </SlideOver>
    </div>
  );
}
