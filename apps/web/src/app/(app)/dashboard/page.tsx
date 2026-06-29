'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Users, 
  FolderKanban, 
  Receipt,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  DollarSign,
  Trash
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/shared/api/client';
import SlideOver from '@/shared/components/SlideOver';
import { generateId } from '@/shared/utils/id';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  
  
  const [isClientOpen, setIsClientOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [clientError, setClientError] = useState('');

  
  const [projectName, setProjectName] = useState('');
  const [projectClientId, setProjectClientId] = useState('');
  const [projectBudget, setProjectBudget] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');
  const [projectPriority, setProjectPriority] = useState('MEDIUM');
  const [projectStatus, setProjectStatus] = useState('KICKOFF');
  const [projectError, setProjectError] = useState('');

  
  const [invoiceClientId, setInvoiceClientId] = useState('');
  const [invoiceProjectId, setInvoiceProjectId] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [invoiceDiscountVal, setInvoiceDiscountVal] = useState('0');
  const [invoiceDiscountType, setInvoiceDiscountType] = useState('fixed');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [invoiceError, setInvoiceError] = useState('');
  const [invoiceLineItems, setInvoiceLineItems] = useState<Array<{ description: string; quantity: number; rate: number; taxRate: number }>>([
    { description: '', quantity: 1, rate: 0, taxRate: 0 }
  ]);

  
  const clientIdempotency = useRef(generateId());
  const projectIdempotency = useRef(generateId());
  const invoiceIdempotency = useRef(generateId());

  
  const { data: clientsRes, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.get('/clients').then(res => res.data),
  });
  
  const { data: projectsRes, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(res => res.data),
  });

  const { data: invoicesRes, isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => apiClient.get('/invoices').then(res => res.data),
  });

  const clients = clientsRes?.data || [];
  const projects = projectsRes?.data || [];
  const invoices = invoicesRes?.data || [];

  const isLoading = loadingClients || loadingProjects || loadingInvoices;

  
  const clientMutation = useMutation({
    mutationFn: (newClient: any) => apiClient.post('/clients', newClient, {
      headers: { 'Idempotency-Key': clientIdempotency.current }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsClientOpen(false);
      resetClientForm();
    },
    onError: (err: any) => {
      setClientError(err.response?.data?.message || 'Failed to create client.');
    }
  });

  const projectMutation = useMutation({
    mutationFn: (newProject: any) => apiClient.post('/projects', newProject, {
      headers: { 'Idempotency-Key': projectIdempotency.current }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsProjectOpen(false);
      resetProjectForm();
    },
    onError: (err: any) => {
      setProjectError(err.response?.data?.message || 'Failed to create project.');
    }
  });

  const invoiceMutation = useMutation({
    mutationFn: (newInvoice: any) => apiClient.post('/invoices', newInvoice, {
      headers: { 'Idempotency-Key': invoiceIdempotency.current }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsInvoiceOpen(false);
      resetInvoiceForm();
    },
    onError: (err: any) => {
      setInvoiceError(err.response?.data?.message || 'Failed to create invoice.');
    }
  });

  
  const resetClientForm = () => {
    setClientName('');
    setClientCompany('');
    setClientEmail('');
    setClientPhone('');
    setClientAddress('');
    setClientNotes('');
    setClientError('');
    clientIdempotency.current = generateId();
  };

  const resetProjectForm = () => {
    setProjectName('');
    setProjectClientId('');
    setProjectBudget('');
    setProjectDeadline('');
    setProjectPriority('MEDIUM');
    setProjectStatus('KICKOFF');
    setProjectError('');
    projectIdempotency.current = generateId();
  };

  const resetInvoiceForm = () => {
    setInvoiceClientId('');
    setInvoiceProjectId('');
    setInvoiceDueDate('');
    setInvoiceDiscountVal('0');
    setInvoiceDiscountType('fixed');
    setInvoiceNotes('');
    setInvoiceLineItems([{ description: '', quantity: 1, rate: 0, taxRate: 0 }]);
    setInvoiceError('');
    invoiceIdempotency.current = generateId();
  };

  
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clientMutation.mutate({
      name: clientName,
      company: clientCompany || undefined,
      email: clientEmail || undefined,
      phone: clientPhone || undefined,
      address: clientAddress || undefined,
      notes: clientNotes || undefined,
    });
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectClientId) {
      setProjectError('Please select a client.');
      return;
    }
    projectMutation.mutate({
      name: projectName,
      clientId: projectClientId,
      budget: parseFloat(projectBudget) || 0,
      deadline: new Date(projectDeadline).toISOString(),
      priority: projectPriority,
      status: projectStatus,
    });
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceClientId) {
      setInvoiceError('Please select a client.');
      return;
    }
    const cleanLineItems = invoiceLineItems.filter(item => item.description.trim() !== '');
    if (cleanLineItems.length === 0) {
      setInvoiceError('Please add at least one line item with a description.');
      return;
    }
    invoiceMutation.mutate({
      clientId: invoiceClientId,
      projectId: invoiceProjectId || undefined,
      lineItems: cleanLineItems.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        taxRate: Number(item.taxRate) || 0
      })),
      discountValue: Number(invoiceDiscountVal) || 0,
      discountType: invoiceDiscountType,
      dueDate: invoiceDueDate ? new Date(invoiceDueDate).toISOString() : undefined,
      notes: invoiceNotes || undefined,
    });
  };

  
  const totalRevenue = invoices
    .filter((inv: any) => inv.status === 'PAID')
    .reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);

  const activeClientsCount = clients.filter((c: any) => c.healthStatus === 'ACTIVE').length;

  const runningProjectsCount = projects.filter((p: any) => 
    ['IN_PROGRESS', 'KICKOFF', 'REVIEW', 'REVISION'].includes(p.status)
  ).length;

  const outstandingAmount = invoices
    .filter((inv: any) => ['SENT', 'VIEWED', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status))
    .reduce((sum: number, inv: any) => sum + (Number(inv.amount || 0) - Number(inv.amountPaid || 0)), 0);

  const stats = [
    { name: 'Monthly Revenue', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Collected total', icon: TrendingUp },
    { name: 'Active Clients', value: activeClientsCount.toString(), sub: 'In CRM directory', icon: Users },
    { name: 'Running Projects', value: runningProjectsCount.toString(), sub: 'In active stages', icon: FolderKanban },
    { name: 'Outstanding Balance', value: `$${outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Awaiting collection', icon: Receipt },
  ];

  const sortedProjects = [...projects]
    .filter(p => p.status !== 'CLOSED' && p.status !== 'DELIVERED')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-10 w-48 bg-black/5 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-black/5 border border-black/5 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-80 bg-black/5 border border-black/5 rounded-2xl"></div>
          <div className="h-80 bg-black/5 border border-black/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-black">
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-3xl font-black uppercase tracking-tighter">Business Health</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">Unified operations and financial ledger overview</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-wider px-4 py-2 bg-white/60 border border-black/5 rounded-full shadow-sm text-zinc-600">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Production Active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col gap-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex justify-between items-start">
                <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">{stat.name}</span>
                <span className="p-2 rounded-xl bg-black/5 text-black">
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-2xl font-black tracking-tight">{stat.value}</span>
                <span className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col gap-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-xs uppercase tracking-widest">Urgent Project Pipeline</h3>
            <Link href="/projects" className="text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-black flex items-center gap-1">
              All Projects <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {sortedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="w-8 h-8 text-zinc-300 mb-2" />
              <p className="text-xs font-bold text-zinc-400 uppercase">No active projects running</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-black/5">
              {sortedProjects.map((project) => {
                const projectClient = clients.find((c: any) => c.id === project.clientId);
                return (
                  <div key={project.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-sm text-black">{project.name}</span>
                      <span className="text-zinc-400 text-[10px] uppercase font-bold mt-1">Client: {projectClient?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                        project.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                        project.status === 'KICKOFF' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'REVIEW' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-800'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-zinc-550">{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl border border-black/5 bg-[#f5f2ee] flex flex-col gap-6 shadow-sm justify-between text-left">
          <div>
            <h3 className="font-black text-xs uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { resetClientForm(); setIsClientOpen(true); }}
                className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Client
              </button>
              <button 
                onClick={() => { resetProjectForm(); setIsProjectOpen(true); }}
                className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Project
              </button>
              <button 
                onClick={() => { resetInvoiceForm(); setIsInvoiceOpen(true); }}
                className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Invoice
              </button>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-black/5 bg-white/40 flex flex-col gap-1 text-left mt-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Ledger Compliance</span>
            <p className="text-[11px] font-medium leading-relaxed text-zinc-600">All sequentially incremented invoices lock permanently once marked as sent.</p>
          </div>
        </div>

      </div>

      <div className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col gap-6 shadow-sm text-left">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-xs uppercase tracking-widest">Recent Invoice Ledger</h3>
          <Link href="/invoices" className="text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-black flex items-center gap-1">
            All Invoices <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="w-8 h-8 text-zinc-300 mb-2" />
            <p className="text-xs font-bold text-zinc-400 uppercase">No invoices issued yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/5 text-zinc-400 font-black uppercase tracking-wider">
                  <th className="pb-3 pr-4">Invoice #</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-semibold text-zinc-750">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-black/5">
                    <td className="py-3.5 pr-4 font-black">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-black text-black">${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                        inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-zinc-100 text-zinc-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right text-zinc-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      <SlideOver isOpen={isClientOpen} onClose={() => setIsClientOpen(false)} title="Create Client">
        {clientError && (
          <div className="mb-4 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
            {clientError}
          </div>
        )}
        <form onSubmit={handleClientSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client Name *</label>
            <input 
              type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. John Doe"
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Company</label>
            <input 
              type="text" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email</label>
            <input 
              type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
              placeholder="john@acmecorp.com"
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Phone</label>
            <input 
              type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Address</label>
            <textarea 
              value={clientAddress} onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Client physical address"
              rows={2}
              className="p-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Internal Notes</label>
            <textarea 
              value={clientNotes} onChange={(e) => setClientNotes(e.target.value)}
              placeholder="Notes visible only to team"
              rows={2}
              className="p-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black resize-none"
            />
          </div>
          <button 
            type="submit" disabled={clientMutation.isPending}
            className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer shadow-lg"
          >
            {clientMutation.isPending ? 'Creating...' : 'Create Client'}
          </button>
        </form>
      </SlideOver>

      {}
      <SlideOver isOpen={isProjectOpen} onClose={() => setIsProjectOpen(false)} title="Create Project">
        {projectError && (
          <div className="mb-4 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
            {projectError}
          </div>
        )}
        <form onSubmit={handleProjectSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Project Name *</label>
            <input 
              type="text" required value={projectName} onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. App Development"
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client *</label>
            <select
              value={projectClientId} onChange={(e) => setProjectClientId(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
            >
              <option value="">Select a Client</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.company || 'No Company'})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Budget ($) *</label>
              <input 
                type="number" required value={projectBudget} onChange={(e) => setProjectBudget(e.target.value)}
                placeholder="5000"
                className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Deadline *</label>
              <input 
                type="date" required value={projectDeadline} onChange={(e) => setProjectDeadline(e.target.value)}
                className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Priority</label>
              <select
                value={projectPriority} onChange={(e) => setProjectPriority(e.target.value)}
                className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pipeline Stage</label>
              <select
                value={projectStatus} onChange={(e) => setProjectStatus(e.target.value)}
                className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
              >
                <option value="LEAD">Lead</option>
                <option value="KICKOFF">Kickoff</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="REVISION">Revision</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>
          </div>
          <button 
            type="submit" disabled={projectMutation.isPending}
            className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer shadow-lg"
          >
            {projectMutation.isPending ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </SlideOver>

      {}
      <SlideOver isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} title="Create Invoice">
        {invoiceError && (
          <div className="mb-4 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
            {invoiceError}
          </div>
        )}
        <form onSubmit={handleInvoiceSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client *</label>
            <select
              value={invoiceClientId} onChange={(e) => setInvoiceClientId(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
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
              value={invoiceProjectId} onChange={(e) => setInvoiceProjectId(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
            >
              <option value="">Select a Project (Optional)</option>
              {projects.filter((p: any) => !invoiceClientId || p.clientId === invoiceClientId).map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Due Date *</label>
              <input 
                type="date" required value={invoiceDueDate} onChange={(e) => setInvoiceDueDate(e.target.value)}
                className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Discount Type</label>
              <select
                value={invoiceDiscountType} onChange={(e) => setInvoiceDiscountType(e.target.value)}
                className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
              >
                <option value="fixed">Fixed ($)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Discount Value</label>
              <input 
                type="number" value={invoiceDiscountVal} onChange={(e) => setInvoiceDiscountVal(e.target.value)}
                className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Line Items *</span>
              <button
                type="button"
                onClick={() => setInvoiceLineItems([...invoiceLineItems, { description: '', quantity: 1, rate: 0, taxRate: 0 }])}
                className="text-[10px] font-black text-zinc-650 hover:text-black uppercase tracking-wider bg-black/5 px-2.5 py-1 rounded-lg border border-black/5 transition-all"
              >
                + Add Item
              </button>
            </div>

            {invoiceLineItems.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl bg-white/40 border border-black/5 flex flex-col gap-3 relative text-left">
                <button
                  type="button"
                  onClick={() => setInvoiceLineItems(invoiceLineItems.filter((_, i) => i !== index))}
                  className="absolute top-3 right-3 text-zinc-400 hover:text-rose-600 transition-colors p-1"
                  disabled={invoiceLineItems.length === 1}
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>

                <div className="flex flex-col gap-1.5 pr-6">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Description</label>
                  <input 
                    type="text" required value={item.description}
                    onChange={(e) => {
                      const newItems = [...invoiceLineItems];
                      newItems[index].description = e.target.value;
                      setInvoiceLineItems(newItems);
                    }}
                    placeholder="e.g. Design Consulting"
                    className="h-9 px-3 rounded-lg bg-white/90 border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Qty</label>
                    <input 
                      type="number" required min="1" value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...invoiceLineItems];
                        newItems[index].quantity = Number(e.target.value);
                        setInvoiceLineItems(newItems);
                      }}
                      className="h-9 px-3 rounded-lg bg-white/90 border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Rate ($)</label>
                    <input 
                      type="number" required min="0" value={item.rate}
                      onChange={(e) => {
                        const newItems = [...invoiceLineItems];
                        newItems[index].rate = Number(e.target.value);
                        setInvoiceLineItems(newItems);
                      }}
                      className="h-9 px-3 rounded-lg bg-white/90 border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Tax (%)</label>
                    <input 
                      type="number" min="0" max="100" value={item.taxRate}
                      onChange={(e) => {
                        const newItems = [...invoiceLineItems];
                        newItems[index].taxRate = Number(e.target.value);
                        setInvoiceLineItems(newItems);
                      }}
                      className="h-9 px-3 rounded-lg bg-white/90 border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client Notes</label>
            <textarea 
              value={invoiceNotes} onChange={(e) => setInvoiceNotes(e.target.value)}
              placeholder="Terms, payment directions, or thank you note"
              rows={2}
              className="p-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black resize-none"
            />
          </div>

          <button 
            type="submit" disabled={invoiceMutation.isPending}
            className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer shadow-lg"
          >
            {invoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
          </button>
        </form>
      </SlideOver>
    </div>
  );
}

