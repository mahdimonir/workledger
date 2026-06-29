'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/store/auth.store';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  FileText, 
  Activity 
} from 'lucide-react';

const STAGES = ['LEAD', 'KICKOFF', 'IN_PROGRESS', 'REVIEW', 'REVISION', 'DELIVERED', 'CLOSED'];

export default function ProjectOverviewTab() {
  const params = useParams();
  const queryClient = useQueryClient();
  const projectId = params.id as string;
  const { role } = useAuthStore();
  const isManagerOrOwner = role === 'OWNER' || role === 'MANAGER';
  const [error, setError] = useState('');

  
  const { data: projectRes, isLoading: loadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.get(`/projects/${projectId}`).then((res) => res.data),
  });

  const { data: milestonesRes, isLoading: loadingMilestones } = useQuery({
    queryKey: ['milestones', { projectId }],
    queryFn: () => apiClient.get(`/milestones?projectId=${projectId}`).then((res) => res.data),
  });

  const project = projectRes?.data;
  const milestones = milestonesRes?.data || [];

  
  const updateStageMutation = useMutation({
    mutationFn: (newStatus: string) => apiClient.patch(`/projects/${projectId}`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update project stage.');
    }
  });

  if (loadingProject || loadingMilestones) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-24 bg-black/5 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-48 bg-black/5 rounded-2xl"></div>
          <div className="h-48 bg-black/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const currentStageIndex = STAGES.indexOf(project.status);

  const handleStageClick = (stage: string) => {
    if (!isManagerOrOwner) return;
    updateStageMutation.mutate(stage);
  };

  
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m: any) => m.status === 'APPROVED' || m.status === 'COMPLETE').length;
  const percentComplete = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 text-left text-black">
      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
          {error}
        </div>
      )}

      {}
      <div className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md shadow-sm flex flex-col gap-4">
        <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500">Project Stage Tracker</h3>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mt-2 overflow-x-auto pb-2 scrollbar-none">
          {STAGES.map((stage, idx) => {
            const isCurrent = idx === currentStageIndex;
            const isPassed = idx < currentStageIndex;
            return (
              <button
                key={stage}
                disabled={!isManagerOrOwner}
                onClick={() => handleStageClick(stage)}
                className={`flex-1 min-w-24 p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                  isCurrent
                    ? 'bg-black text-[#efeae3] border-black font-extrabold ring-4 ring-black/10'
                    : isPassed
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800 font-bold'
                    : 'bg-white/40 border-black/10 text-zinc-400 font-medium hover:border-black/30'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider">{stage.replace('_', ' ')}</span>
                <span className="text-[9px] font-black uppercase text-zinc-400">
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {}
        <div className="md:col-span-2 p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col gap-6 shadow-sm">
          <h3 className="font-black text-xs uppercase tracking-widest border-b border-black/5 pb-3">Project Specifications</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-black/5 text-zinc-500">
                <DollarSign className="w-4 h-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Project Budget</span>
                <span className="text-xs font-bold mt-0.5">${Number(project.budget).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-black/5 text-zinc-500">
                <Calendar className="w-4 h-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Delivery Deadline</span>
                <span className="text-xs font-bold mt-0.5">{new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-black/5 text-zinc-500">
                <Clock className="w-4 h-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Created Date</span>
                <span className="text-xs font-bold mt-0.5">{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-black/5 text-zinc-500">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Priority Ranking</span>
                <span className="text-xs font-bold mt-0.5 uppercase tracking-wide">{project.priority}</span>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="p-6 rounded-2xl border border-black/5 bg-[#f5f2ee] flex flex-col gap-6 shadow-sm justify-between">
          <div className="flex flex-col gap-4">
            <h3 className="font-black text-xs uppercase tracking-widest border-b border-black/5 pb-3">Milestone Progress</h3>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-black">{percentComplete}%</span>
                <span className="text-[10px] font-black text-zinc-450 uppercase tracking-wider">
                  {completedMilestones} of {totalMilestones} approved
                </span>
              </div>
              <div className="w-full h-2 bg-black/5 border border-black/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-black/5 bg-white/40 flex flex-col gap-1 text-[11px] text-zinc-600 leading-relaxed">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Project Deliverables
            </span>
            Milestones and official assets require client review and sign-off inside the Client Project Portal.
          </div>
        </div>

      </div>

      {}
      {project.stageHistory && project.stageHistory.length > 0 && (
        <div className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md shadow-sm flex flex-col gap-4">
          <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> Stage Transitions Audit
          </h3>
          <div className="flex flex-col gap-3.5 mt-2">
            {project.stageHistory.map((history: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-black text-zinc-400 uppercase tracking-wide">Transitioned to</span>
                  <span className="font-black text-black uppercase tracking-wider bg-black/5 px-2 py-0.5 rounded-md">
                    {history.status.replace('_', ' ')}
                  </span>
                </div>
                <span className="font-bold text-zinc-400">{new Date(history.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
