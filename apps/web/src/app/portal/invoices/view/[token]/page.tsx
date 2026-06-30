'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  Receipt, 
  Download, 
  Calendar, 
  Building,
  AlertCircle,
  Clock,
  ArrowDown
} from 'lucide-react';

export default function ClientInvoicePortalPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  // Fetch invoice details (GET triggers transition to VIEWED on the backend)
  const { data: invoiceRes, isLoading } = useQuery({
    queryKey: ['portal-invoice', token],
    queryFn: () => apiClient.get(`/invoices/view/${token}`).then((res) => res.data),
  });

  const invoice = invoiceRes?.data;
  const lineItems = invoice?.lineItems || [];
  const subtotal = lineItems.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.rate)), 0);

  const handleDownload = () => {
    alert('Requesting invoice document download package from PDF microservice...');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#efeae3] flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading invoice...</span>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#efeae3] flex items-center justify-center p-6 text-center select-none text-black">
        <div className="max-w-md bg-[#f5f2ee] border border-black/10 rounded-3xl p-8 shadow-sm flex flex-col items-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-4" />
          <h3 className="font-black text-lg uppercase tracking-tight text-black mb-1">Invoice Not Found</h3>
          <p className="text-xs text-zinc-500 font-light leading-relaxed">
            This invoice link is invalid, expired, or has been canceled by the workspace administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efeae3] text-black select-none py-12 px-6 flex flex-col items-center justify-center text-left">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        
        {/* Workspace Brand Row */}
        <div className="flex items-center justify-between border-b border-black/10 pb-6">
          <div className="flex flex-col leading-[0.85] font-black text-black">
            <span className="text-[18px] uppercase tracking-tighter">WORK</span>
            <span className="text-[18px] uppercase text-zinc-400 tracking-tighter">LEDGER</span>
          </div>
          <button
            onClick={handleDownload}
            className="h-10 px-4 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>

        {/* Invoice Page Layout */}
        <div className="bg-[#f5f2ee] border border-black/10 rounded-3xl p-8 shadow-sm flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-black/10 pb-6">
            <div>
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Invoice Number</span>
              <h1 className="text-2xl font-black uppercase tracking-tight text-black">{invoice.invoiceNumber}</h1>
              <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-2.5">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Status</span>
              <span className="text-[9px] px-2.5 py-0.5 rounded font-black tracking-widest border uppercase bg-black text-[#efeae3] border-black">
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Itemized Ledger</h3>
            
            <div className="border border-black/5 rounded-2xl bg-white/50 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/5 bg-[#efeae3]/30 text-zinc-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Description</th>
                    <th className="p-4 text-center">Qty</th>
                    <th className="p-4 text-right">Unit Rate</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-zinc-700">
                  {lineItems.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-4 font-semibold text-black">{item.description}</td>
                      <td className="p-4 text-center">{item.quantity}</td>
                      <td className="p-4 text-right">${Number(item.rate).toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-black">
                        ${(Number(item.quantity) * Number(item.rate)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col gap-2.5 max-w-xs ml-auto w-full border-t border-black/10 pt-6">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Discount</span>
              <span>-${Number(invoice.discountValue || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium border-b border-black/10 pb-4 mb-1">
              <span>Tax Rate</span>
              <span>+{Number(invoice.taxRate || 0)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm font-black text-black">
              <span>Grand Total</span>
              <span>${Number(invoice.amount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
