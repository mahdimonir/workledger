'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  FileText,
  AlertCircle,
  Plus,
  Trash
} from 'lucide-react';
import Link from 'next/link';

export default function InvoicePaymentsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const invoiceId = params.id as string;

  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BANK');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch invoice details
  const { data: invoiceRes, isLoading: loadingInvoice } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => apiClient.get(`/invoices/${invoiceId}`).then((res) => res.data),
  });

  const invoice = invoiceRes?.data;
  const payments = invoice?.payments || [];

  // Total invoice amount vs what has been paid
  const totalAmount = Number(invoice?.amount || 0);
  const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
  const remainingBalance = totalAmount - totalPaid;

  const paymentMutation = useMutation({
    mutationFn: (newPayment: any) => apiClient.post(`/invoices/${invoiceId}/payments`, newPayment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to record payment.');
    }
  });

  const resetForm = () => {
    setAmount('');
    setMethod('BANK');
    setReference('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setErrorMessage('Please enter a valid payment amount.');
      return;
    }
    paymentMutation.mutate({
      amount: Number(amount),
      method,
      reference,
      note,
      date: new Date(date).toISOString()
    });
  };

  if (loadingInvoice) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-pulse text-black text-left">
        <div className="h-6 w-32 bg-black/5 rounded-lg"></div>
        <div className="h-48 bg-black/5 border border-black/5 rounded-3xl"></div>
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
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 text-black select-none text-left">
      
      {/* Back Link */}
      <div>
        <Link 
          href={`/invoices/${invoiceId}`} 
          className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Invoice {invoice.invoiceNumber}
        </Link>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#f5f2ee] border border-black/10 rounded-3xl p-6">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Invoice Total</span>
          <h3 className="text-2xl font-black">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-[#f5f2ee] border border-black/10 rounded-3xl p-6">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1 font-semibold text-emerald-600">Total Collected</span>
          <h3 className="text-2xl font-black text-emerald-600">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-[#f5f2ee] border border-black/10 rounded-3xl p-6">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1 font-semibold text-rose-500">Remaining Balance</span>
          <h3 className="text-2xl font-black text-rose-500">${remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Payments List */}
        <div className="lg:col-span-2 border border-black/10 rounded-3xl bg-[#f5f2ee] p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-black/10 pb-6 mb-6">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-black">Payment Ledger</h2>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Chronological record of transactions</p>
            </div>
            {!isOpen && remainingBalance > 0 && (
              <button
                onClick={() => setIsOpen(true)}
                className="h-10 px-4 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" /> Record Payment
              </button>
            )}
          </div>

          {payments.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-8 h-8 text-zinc-400 mb-3" />
              <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">No Payments Recorded</p>
              <p className="text-xs text-zinc-400 font-light mt-1 max-w-xs">No manual transactions have been registered for this invoice ledger yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {payments.map((payment: any, index: number) => (
                <div 
                  key={payment.id || index}
                  className="flex items-center justify-between p-4 bg-white/50 border border-black/5 rounded-2xl hover:bg-white/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center text-zinc-600 font-black text-xs">
                      ${Number(payment.amount).toLocaleString()}
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-black">
                        {payment.method} Payment
                      </div>
                      <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">
                        {new Date(payment.date).toLocaleDateString()} {payment.reference ? `· Ref: ${payment.reference}` : ''}
                      </div>
                    </div>
                  </div>
                  {payment.note && (
                    <span className="text-[10px] italic text-zinc-500 max-w-[200px] truncate">
                      &ldquo;{payment.note}&rdquo;
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Record Form Side Card */}
        {isOpen && remainingBalance > 0 && (
          <div className="border border-black/10 rounded-3xl bg-[#f5f2ee] p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-black border-b border-black/10 pb-4 mb-4">Record Payment</h3>
            
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] font-semibold text-rose-600 leading-normal mb-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Amount ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  max={remainingBalance}
                  placeholder={`Max ${remainingBalance}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-11 bg-black/5 border border-black/10 rounded-xl px-3 text-sm focus:outline-none focus:border-black transition-colors font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full h-11 bg-black/5 border border-black/10 rounded-xl px-3 text-sm focus:outline-none focus:border-black transition-colors font-bold uppercase tracking-wider"
                >
                  <option value="BANK">Bank Transfer</option>
                  <option value="CARD">Credit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="CRYPTO">Crypto</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Date</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 bg-black/5 border border-black/10 rounded-xl px-3 text-sm focus:outline-none focus:border-black transition-colors font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Reference / Check #</label>
                <input 
                  type="text"
                  placeholder="e.g. TXN-98402"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full h-11 bg-black/5 border border-black/10 rounded-xl px-3 text-sm focus:outline-none focus:border-black transition-colors font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Internal Memo</label>
                <textarea 
                  placeholder="Payment receipt note..."
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-black/5 border border-black/10 rounded-xl p-3 text-sm focus:outline-none focus:border-black transition-colors font-medium resize-none"
                />
              </div>

              <div className="flex gap-2 items-center mt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-black/10 hover:bg-black/5 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentMutation.isPending}
                  className="flex-1 h-11 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-[10px] flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {paymentMutation.isPending ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
