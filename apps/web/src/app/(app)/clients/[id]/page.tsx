'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  TrendingUp, 
  FileText, 
  FolderKanban, 
  Receipt,
  ArrowLeft,
  Calendar,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROJECTS' | 'INVOICES' | 'PROPOSALS'>('OVERVIEW');

  
  const { data: clientRes, isLoading: loadingClient } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => apiClient.get(`/clients/${clientId}`).then((res) => res.data),
  });

  const { data: projectsRes, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then((res) => res.data),
  });

  const { data: invoicesRes, isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => apiClient.get('/invoices').then((res) => res.data),
  });

  const { data: proposalsRes, isLoading: loadingProposals } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => apiClient.get('/proposals').then((res) => res.data),
  });

  const client = clientRes?.data;
  const allProjects = projectsRes?.data || [];
  const allInvoices = invoicesRes?.data || [];
  const allProposals = proposalsRes?.data || [];

  const isLoading = loadingClient || loadingProjects || loadingInvoices || loadingProposals;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse text-black">
        <div className="h-10 w-48 bg-black/5 rounded-lg"></div>
        <div className="h-48 bg-black/5 border border-black/5 rounded-2xl"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
        <h3 className="font-black text-lg uppercase tracking-tight text-black mb-2">Client Not Found</h3>
        <button 
          onClick={() => router.push('/clients')}
          className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to CRM
        </button>
      </div>
    );
  }

  
  const clientProjects = allProjects.filter((p: any) => p.clientId === clientId);
  const clientInvoices = allInvoices.filter((i: any) => i.clientId === clientId);
  const clientProposals = allProposals.filter((p: any) => p.clientId === clientId);

  
  const totalBilled = clientInvoices.reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);
  const totalPaid = clientInvoices
    .filter((inv: any) => inv.status === 'PAID')
    .reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);
  const totalOutstanding = clientInvoices
    .filter((inv: any) => ['SENT', 'VIEWED', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status))
    .reduce((sum: number, inv: any) => sum + (Number(inv.amount || 0) - Number(inv.amountPaid || 0)), 0);

  const tabs = [
    { id: 'OVERVIEW', name: 'Overview', icon: Building },
    { id: 'PROJECTS', name: 'Projects', icon: FolderKanban, count: clientProjects.length },
    { id: 'INVOICES', name: 'Invoices', icon: Receipt, count: clientInvoices.length },
    { id: 'PROPOSALS', name: 'Proposals', icon: FileText, count: clientProposals.length },
  ];

  return (
    <div className="flex flex-col gap-8 text-black text-left">
      {}
      <div className="flex flex-col gap-4">
        <Link 
          href="/clients"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-black transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to CRM
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">{client.name}</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">{client.company || 'Private Account'}</p>
        </div>
      </div>

      {}
      <div className="flex border-b border-black/10 gap-6 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer flex items-center gap-2 ${
                active ? 'text-black font-extrabold' : 'text-zinc-400 hover:text-black'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 bg-black/5 rounded-md font-bold text-zinc-500">
                  {tab.count}
                </span>
              )}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></span>
              )}
            </button>
          );
        })}
      </div>

      {}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {}
          <div className="md:col-span-2 p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col gap-6 shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-widest border-b border-black/5 pb-3">Client Profile</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-black/5 text-zinc-500">
                  <Mail className="w-4 h-4" />
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Email Address</span>
                  <span className="text-xs font-bold mt-0.5">{client.email || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-black/5 text-zinc-500">
                  <Phone className="w-4 h-4" />
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Phone Number</span>
                  <span className="text-xs font-bold mt-0.5">{client.phone || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-black/5 text-zinc-500">
                  <MapPin className="w-4 h-4" />
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Office Address</span>
                  <span className="text-xs font-bold mt-0.5">{client.address || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-black/5 text-zinc-500">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Health Status</span>
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase w-fit mt-1 ${
                    client.healthStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 
                    client.healthStatus === 'AT_RISK' ? 'bg-amber-100 text-amber-800' : 
                    'bg-zinc-100 text-zinc-800'
                  }`}>
                    {client.healthStatus}
                  </span>
                </div>
              </div>
            </div>

            {client.notes && (
              <div className="mt-4 p-4 rounded-xl bg-[#f5f2ee] border border-black/5 text-left flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Internal Account Notes</span>
                <p className="text-[11px] font-medium leading-relaxed text-zinc-650 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>

          {}
          <div className="p-6 rounded-2xl border border-black/5 bg-[#f5f2ee] flex flex-col gap-6 shadow-sm justify-between">
            <div className="flex flex-col gap-4">
              <h3 className="font-black text-xs uppercase tracking-widest border-b border-black/5 pb-3">Ledger Summary</h3>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-500 text-xs font-black uppercase tracking-wider">Total Billed</span>
                  <span className="text-sm font-black">${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-black/5">
                  <span className="text-zinc-500 text-xs font-black uppercase tracking-wider">Total Paid</span>
                  <span className="text-sm font-black text-emerald-600">${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-black/5">
                  <span className="text-zinc-500 text-xs font-black uppercase tracking-wider">Outstanding</span>
                  <span className={`text-sm font-black ${totalOutstanding > 0 ? 'text-rose-600' : 'text-zinc-700'}`}>
                    ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-black/5 bg-white/40 flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-sans">Payment Terms</span>
              <p className="text-[11px] font-medium leading-relaxed text-zinc-600">Calculated automatically against issued billing ledger dates.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PROJECTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientProjects.length === 0 ? (
            <div className="col-span-full border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <FolderKanban className="w-10 h-10 text-zinc-300 mb-4" />
              <h3 className="font-black text-md uppercase tracking-tight text-black">No active projects linked to this client</h3>
            </div>
          ) : (
            clientProjects.map((project: any) => (
              <Link 
                key={project.id} 
                href={`/projects/${project.id}`}
                className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col justify-between gap-6 shadow-sm hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                      project.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                      project.status === 'KICKOFF' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'REVIEW' ? 'bg-amber-100 text-amber-800' : 
                      project.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-800'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase bg-zinc-150 text-zinc-850">
                      {project.priority}
                    </span>
                  </div>
                  <h3 className="font-black text-lg text-black tracking-tight">{project.name}</h3>
                </div>

                <div className="pt-4 border-t border-black/5 flex justify-between text-[11px] font-black uppercase tracking-wider text-zinc-500">
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Budget: <span className="text-black">{Number(project.budget).toLocaleString()}</span></span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Deadline: <span className="text-black">{new Date(project.deadline).toLocaleDateString()}</span></span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === 'INVOICES' && (
        <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md overflow-hidden shadow-sm">
          {clientInvoices.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <Receipt className="w-10 h-10 text-zinc-300 mb-4" />
              <h3 className="font-black text-md uppercase tracking-tight text-black">No invoices recorded for this client</h3>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/5 bg-black/5/10 text-zinc-500 font-black uppercase tracking-wider">
                    <th className="p-5">Invoice #</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-semibold text-zinc-700">
                  {clientInvoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-black/5 transition-colors">
                      <td className="p-5">
                        <Link href={`/invoices/${inv.id}`} className="font-black text-black hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="p-5 font-black text-black">${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="p-5">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                          inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-zinc-100 text-zinc-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-5 text-right text-zinc-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'PROPOSALS' && (
        <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md overflow-hidden shadow-sm">
          {clientProposals.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <FileText className="w-10 h-10 text-zinc-300 mb-4" />
              <h3 className="font-black text-md uppercase tracking-tight text-black">No proposals created for this client</h3>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/5 bg-black/5/10 text-zinc-500 font-black uppercase tracking-wider">
                    <th className="p-5">Proposal Title</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Valid Until</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-semibold text-zinc-700">
                  {clientProposals.map((prop: any) => (
                    <tr key={prop.id} className="hover:bg-black/5 transition-colors">
                      <td className="p-5 font-black text-black">
                        <Link href={`/proposals/${prop.id}`} className="hover:underline">
                          {prop.title}
                        </Link>
                      </td>
                      <td className="p-5">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                          prop.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                          prop.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                          prop.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-zinc-100 text-zinc-800'
                        }`}>
                          {prop.status}
                        </span>
                      </td>
                      <td className="p-5 text-right text-zinc-500">
                        {prop.validUntil ? new Date(prop.validUntil).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
