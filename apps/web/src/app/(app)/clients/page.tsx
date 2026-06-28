'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Eye, Trash2, X } from 'lucide-react';
import { apiClient } from '@/shared/api/client';

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHealth, setFilterHealth] = useState('ALL');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [healthStatus, setHealthStatus] = useState('ACTIVE');
  const [formError, setFormError] = useState('');

  const { data: clientsRes, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.get('/clients').then(res => res.data),
  });

  const clients = clientsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (newClient: any) => apiClient.post('/clients', newClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create client.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => apiClient.patch(`/clients/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsEditOpen(false);
      setSelectedClient(null);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to update client.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const resetForm = () => {
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setHealthStatus('ACTIVE');
    setFormError('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    createMutation.mutate({ name, company, email, phone, healthStatus });
  };

  const handleEditClick = (client: any) => {
    setSelectedClient(client);
    setName(client.name);
    setCompany(client.company || '');
    setEmail(client.email);
    setPhone(client.phone || '');
    setHealthStatus(client.healthStatus);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setFormError('');
    updateMutation.mutate({ 
      id: selectedClient.id, 
      data: { name, company, email, phone, healthStatus } 
    });
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to delete this client? All linked projects and invoices will remain but this profile will be archived.')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredClients = clients.filter((client: any) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesHealth = filterHealth === 'ALL' || client.healthStatus === filterHealth;

    return matchesSearch && matchesHealth;
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
      <div className="flex justify-between items-center flex-wrap gap-4 text-left">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Clients CRM</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">Manage business accounts, directory details, and client health</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAddOpen(true); }}
          className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, company, or email..."
            className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/60 border border-black/10 text-sm focus:outline-none focus:border-black text-black placeholder-zinc-400 transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={filterHealth}
            onChange={(e) => setFilterHealth(e.target.value)}
            className="h-12 px-4 rounded-xl bg-white/60 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
          >
            <option value="ALL">All Health</option>
            <option value="ACTIVE">Active</option>
            <option value="AT_RISK">At Risk</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <Plus className="w-12 h-12 text-zinc-350 mb-4" />
          <h3 className="font-black text-lg uppercase tracking-tight text-black mb-2">No Clients Found</h3>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider max-w-sm mb-6">Create a client profile to start logging project pipelines and issuing sequental invoices.</p>
          <button 
            onClick={() => { resetForm(); setIsAddOpen(true); }}
            className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Your First Client
          </button>
        </div>
      ) : (
        <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md overflow-hidden shadow-sm text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/5 bg-black/5/10 text-zinc-500 font-black uppercase tracking-wider">
                  <th className="p-5">Name / Company</th>
                  <th className="p-5">Email</th>
                  <th className="p-5">Phone</th>
                  <th className="p-5">Health</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-zinc-700 font-semibold">
                {filteredClients.map((client: any) => (
                  <tr key={client.id} className="hover:bg-black/5 transition-colors">
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-black text-black text-sm">{client.name}</span>
                        <span className="text-zinc-450 text-[10px] font-bold uppercase mt-1">{client.company || 'No Company'}</span>
                      </div>
                    </td>
                    <td className="p-5 text-zinc-650">{client.email}</td>
                    <td className="p-5 text-zinc-650">{client.phone || '—'}</td>
                    <td className="p-5">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                        client.healthStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 
                        client.healthStatus === 'AT_RISK' ? 'bg-amber-100 text-amber-800' : 
                        'bg-zinc-100 text-zinc-800'
                      }`}>
                        {client.healthStatus}
                      </span>
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(client)}
                        className="p-2.5 rounded-lg border border-black/5 hover:bg-black/5 text-zinc-600 hover:text-black transition-colors"
                        title="Edit Client"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(client.id)}
                        className="p-2.5 rounded-lg border border-black/5 hover:bg-rose-500/10 text-zinc-550 hover:text-rose-600 transition-colors"
                        title="Delete Client"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#efeae3] rounded-3xl border border-black/5 p-8 flex flex-col gap-6 relative shadow-2xl">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-left">
              <h3 className="text-xl font-black uppercase tracking-tight">Add Client Profile</h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold mt-1">Register a new client in your workspace</p>
            </div>

            {formError && (
              <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client Name *</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Client Full Name"
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Company Name</label>
                <input 
                  type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email Address *</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Phone Number</label>
                <input 
                  type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client Health Status</label>
                <select
                  value={healthStatus} onChange={(e) => setHealthStatus(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="AT_RISK">At Risk</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <button 
                type="submit" disabled={createMutation.isPending}
                className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer shadow-lg"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Client'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#efeae3] rounded-3xl border border-black/5 p-8 flex flex-col gap-6 relative shadow-2xl">
            <button 
              onClick={() => { setIsEditOpen(false); setSelectedClient(null); }}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-left">
              <h3 className="text-xl font-black uppercase tracking-tight">Edit Client Profile</h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold mt-1">Modify account details and workspace parameters</p>
            </div>

            {formError && (
              <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client Name *</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Company Name</label>
                <input 
                  type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email Address *</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Phone Number</label>
                <input 
                  type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client Health Status</label>
                <select
                  value={healthStatus} onChange={(e) => setHealthStatus(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="AT_RISK">At Risk</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <button 
                type="submit" disabled={updateMutation.isPending}
                className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer shadow-lg"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Client'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
