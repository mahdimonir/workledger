'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/store/auth.store';
import { Plus, Flag, Trash2, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import SlideOver from '@/shared/components/SlideOver';

export default function ProjectMilestonesTab() {
  const params = useParams();
  const queryClient = useQueryClient();
  const projectId = params.id as string;
  const { role } = useAuthStore();
  const isManagerOrOwner = role === 'OWNER' || role === 'MANAGER';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  
  const { data: milestonesRes, isLoading } = useQuery({
    queryKey: ['milestones', { projectId }],
    queryFn: () => apiClient.get(`/milestones?projectId=${projectId}`).then((res) => res.data),
  });

  const milestones = milestonesRes?.data || [];

  
  const createMutation = useMutation({
    mutationFn: (newMilestone: any) => apiClient.post('/milestones', newMilestone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', { projectId }] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create milestone.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/milestones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', { projectId }] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.patch(`/milestones/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', { projectId }] });
    }
  });

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDueDate('');
    setNotes('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: title,
      amount: parseFloat(amount) || 0,
      dueDate: new Date(dueDate).toISOString(),
      description: notes || undefined,
      projectId,
      status: 'PENDING',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this milestone?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-full bg-black/5 rounded-xl"></div>
        <div className="h-32 bg-black/5 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-black text-left">
      {}
      {isManagerOrOwner && (
        <div className="flex justify-end">
          <button
            onClick={() => { resetForm(); setIsAddOpen(true); }}
            className="h-11 px-5 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Milestone
          </button>
        </div>
      )}

      {}
      <div className="flex flex-col gap-4">
        {milestones.length === 0 ? (
          <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
            <Flag className="w-10 h-10 text-zinc-300 mb-4" />
            <h3 className="font-black text-md uppercase tracking-tight text-black mb-2">No Milestones Established</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider max-w-sm">
              Setup major project deliverables and payment blocks to get client sign-offs.
            </p>
          </div>
        ) : (
          milestones.map((milestone: any) => (
            <div 
              key={milestone.id} 
              className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col sm:flex-row justify-between sm:items-center gap-6 shadow-sm"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                    milestone.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    milestone.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    milestone.status === 'REVISION_REQUESTED' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                    'bg-zinc-100 text-zinc-800 border-zinc-200'
                  }`}>
                    {milestone.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-lg text-black tracking-tight">{milestone.name}</h3>
                  {milestone.description && (
                    <p className="text-zinc-500 text-xs font-semibold mt-1">{milestone.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Amount</span>
                  <span className="text-base font-black mt-1 text-black">${Number(milestone.amount).toLocaleString()}</span>
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Target Date</span>
                  <span className="text-xs font-bold mt-1.5 text-zinc-700">{new Date(milestone.dueDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  {isManagerOrOwner && milestone.status === 'PENDING' && (
                    <button
                      onClick={() => handleStatusChange(milestone.id, 'SUBMITTED')}
                      className="h-9 px-3.5 rounded-lg border border-black/10 hover:bg-black/5 text-zinc-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Submit Review
                    </button>
                  )}

                  {isManagerOrOwner && (
                    <button
                      onClick={() => handleDelete(milestone.id)}
                      className="p-2 rounded-lg border border-black/5 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-600 transition-colors"
                      title="Delete Milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {}
      <SlideOver isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Milestone">
        {error && (
          <div className="mb-4 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Milestone Name *</label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Wireframes Handoff"
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Payment Amount ($) *</label>
              <input 
                type="number" required value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="1500"
                className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Due Date *</label>
              <input 
                type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Milestone Details</label>
            <textarea 
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Deliverables and criteria required for client sign-off"
              rows={3}
              className="p-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black resize-none"
            />
          </div>
          <button 
            type="submit" disabled={createMutation.isPending}
            className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer shadow-lg"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Milestone'}
          </button>
        </form>
      </SlideOver>
    </div>
  );
}
