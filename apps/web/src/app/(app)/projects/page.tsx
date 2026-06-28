'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Share2, X, RefreshCw, AlertTriangle, Calendar, DollarSign } from 'lucide-react';
import { apiClient } from '@/shared/api/client';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('KICKOFF');
  const [formError, setFormError] = useState('');

  // Fetch projects
  const { data: projectsRes, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(res => res.data),
  });

  // Fetch clients (for client selection dropdown)
  const { data: clientsRes, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.get('/clients').then(res => res.data),
  });

  const projects = projectsRes?.data || [];
  const clients = clientsRes?.data || [];
  const isLoading = loadingProjects || loadingClients;

  // Create Project Mutation
  const createMutation = useMutation({
    mutationFn: (newProject: any) => apiClient.post('/projects', newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create project.');
    }
  });

  // Regenerate Share Token Mutation
  const regenerateTokenMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/projects/${id}/share-token/regenerate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const resetForm = () => {
    setName('');
    setClientId('');
    setBudget('');
    setDeadline('');
    setPriority('MEDIUM');
    setStatus('KICKOFF');
    setFormError('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setFormError('Please select a client.');
      return;
    }
    setFormError('');
    createMutation.mutate({
      name,
      clientId,
      budget: parseFloat(budget) || 0,
      deadline: new Date(deadline).toISOString(),
      priority,
      status,
    });
  };

  const handleCopyLink = (shareToken: string, projectId: string) => {
    if (!shareToken) return;
    const url = `${window.location.origin}/portal/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(projectId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleRegenerateToken = (id: string) => {
    if (confirm('Are you sure you want to regenerate the share link? The previous link will stop working.')) {
      regenerateTokenMutation.mutate(id);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((p: any) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ACTIVE') return ['KICKOFF', 'IN_PROGRESS', 'REVIEW', 'REVISION'].includes(p.status);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-black/5 border border-black/5 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-black">
      {/* Header action */}
      <div className="flex justify-between items-center flex-wrap gap-4 text-left">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Projects Tracker</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">Track project milestones, workflows, and share status links with clients</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsCreateOpen(true); }}
          className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex border-b border-black/10 gap-6 overflow-x-auto scrollbar-none">
        {[
          { name: 'All projects', value: 'ALL' },
          { name: 'Active pipeline', value: 'ACTIVE' },
          { name: 'Under review', value: 'REVIEW' },
          { name: 'Delivered', value: 'DELIVERED' },
          { name: 'Closed', value: 'CLOSED' },
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

      {/* Kanban / List Board */}
      {filteredProjects.length === 0 ? (
        <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <FolderKanban className="w-12 h-12 text-zinc-350 mb-4" />
          <h3 className="font-black text-lg uppercase tracking-tight text-black mb-2">No Projects Found</h3>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider max-w-sm mb-6">Create a project and link it to a client. You can then share real-time updates without client logins.</p>
          <button 
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
            className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredProjects.map((project: any) => {
            const projectClient = clients.find((c: any) => c.id === project.clientId);
            return (
              <div key={project.id} className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col justify-between gap-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                      project.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                      project.status === 'KICKOFF' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'REVIEW' ? 'bg-amber-100 text-amber-800' : 
                      project.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-800'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                      project.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                      project.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                      project.priority === 'MEDIUM' ? 'bg-zinc-150 text-zinc-800' : 'bg-zinc-100 text-zinc-650'
                    }`}>
                      {project.priority}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-black text-lg text-black tracking-tight">{project.name}</h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1">Client: {projectClient?.name || 'Unknown Client'} ({projectClient?.company || 'No Company'})</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5 flex flex-col gap-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-zinc-500">
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Budget: <span className="text-black">{Number(project.budget).toLocaleString('en-US')}</span></span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Deadline: <span className="text-black">{new Date(project.deadline).toLocaleDateString()}</span></span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopyLink(project.shareToken, project.id)}
                      className={`flex-1 h-10 rounded-xl border border-black/10 hover:bg-black/5 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        copiedId === project.id ? 'bg-emerald-100 border-emerald-300 text-emerald-850' : 'text-zinc-700'
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5" /> {copiedId === project.id ? 'Copied!' : 'Copy Portal Link'}
                    </button>
                    
                    <button 
                      onClick={() => handleRegenerateToken(project.id)}
                      className="p-3 rounded-xl border border-black/10 hover:bg-black/5 text-zinc-500 hover:text-black transition-colors"
                      title="Regenerate Share Token"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#efeae3] rounded-3xl border border-black/5 p-8 flex flex-col gap-6 relative shadow-2xl">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-left">
              <h3 className="text-xl font-black uppercase tracking-tight">Create Project</h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold mt-1">Initiate a new project pipeline linked to a client</p>
            </div>

            {formError && (
              <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Project Name *</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Website Development"
                  className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client *</label>
                <select
                  value={clientId} onChange={(e) => setClientId(e.target.value)}
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
                    type="number" required value={budget} onChange={(e) => setBudget(e.target.value)}
                    placeholder="5000"
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Deadline *</label>
                  <input 
                    type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Priority</label>
                  <select
                    value={priority} onChange={(e) => setPriority(e.target.value)}
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
                    value={status} onChange={(e) => setStatus(e.target.value)}
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
                type="submit" disabled={createMutation.isPending}
                className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer shadow-lg"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
